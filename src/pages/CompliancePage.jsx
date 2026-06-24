import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  Download,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import api from "../services/api";

const DOMAINS = {
  residents: {
    label: "Resident",
    plural: "Residents",
    icon: Users,
    selectLabel: "Filter by resident",
    checklistPath: (id) => `/resident-compliance/checklist/${id}`,
    detailPath: (id) => `/residents/${id}`,
  },
  staff: {
    label: "Staff",
    plural: "Staff",
    icon: UserRound,
    selectLabel: "Filter by staff",
    checklistPath: (id) => `/staff-compliance/checklist/${id}`,
    detailPath: (id) => `/staff/${id}`,
  },
  facility: {
    label: "Facility",
    plural: "Facility",
    icon: Building2,
    checklistPath: () => `/facility-compliance/checklist`,
    detailPath: () => `/facility-compliance`,
  },
};

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState("residents");
  const [residents, setResidents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [residentChecklist, setResidentChecklist] = useState(null);
  const [staffChecklist, setStaffChecklist] = useState(null);
  const [facilityChecklist, setFacilityChecklist] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [checklistLoading, setChecklistLoading] = useState(false);

  useEffect(() => {
    loadPeople();
  }, []);

  useEffect(() => {
    if (activeTab === "residents") loadResidentChecklist(selectedResidentId);
    if (activeTab === "staff") loadStaffChecklist(selectedStaffId);
    if (activeTab === "facility") loadFacilityChecklist();
  }, [activeTab, selectedResidentId, selectedStaffId, residents.length, staff.length]);

  async function loadPeople() {
    try {
      setLoading(true);
      const [residentRes, staffRes] = await Promise.allSettled([
        fetchFirstAvailable(["/residents", "/residents/", "/resident/residents"]),
        fetchFirstAvailable(["/staff", "/staff/", "/staff/profiles"]),
      ]);

      const residentRows = residentRes.status === "fulfilled" ? normalizeCollection(residentRes.value.data) : [];
      const staffRows = staffRes.status === "fulfilled" ? normalizeCollection(staffRes.value.data) : [];

      setResidents(residentRows);
      setStaff(staffRows);
      setSelectedResidentId("");
      setSelectedStaffId("");
    } catch (err) {
      console.error(err);
      setMessage("Could not load residents or staff.");
    } finally {
      setLoading(false);
    }
  }

  async function loadResidentChecklist(residentId = "") {
    if (residentId) {
      await loadChecklist({
        path: DOMAINS.residents.checklistPath(residentId),
        setter: setResidentChecklist,
      });
      return;
    }

    await loadMultipleChecklists({
      rows: residents,
      pathBuilder: DOMAINS.residents.checklistPath,
      setter: setResidentChecklist,
      domainLabel: "Residents",
      idField: "resident_id",
      nameField: "resident_name",
    });
  }

  async function loadStaffChecklist(staffId = "") {
    if (staffId) {
      await loadChecklist({
        path: DOMAINS.staff.checklistPath(staffId),
        setter: setStaffChecklist,
      });
      return;
    }

    await loadMultipleChecklists({
      rows: staff,
      pathBuilder: DOMAINS.staff.checklistPath,
      setter: setStaffChecklist,
      domainLabel: "Staff",
      idField: "staff_id",
      nameField: "staff_name",
    });
  }

  async function loadFacilityChecklist() {
    await loadChecklist({ path: DOMAINS.facility.checklistPath(), setter: setFacilityChecklist });
  }

  async function loadChecklist({ path, setter }) {
    try {
      setChecklistLoading(true);
      const res = await api.get(path);
      setter(normalizeChecklist(res.data));
    } catch (err) {
      console.error(err);
      setter(null);
      setMessage(`Checklist route not available: ${path}`);
    } finally {
      setChecklistLoading(false);
    }
  }

  async function loadMultipleChecklists({ rows, pathBuilder, setter, domainLabel, idField, nameField }) {
    if (!rows.length) {
      setter({
        score: 0,
        completed: 0,
        total: 0,
        items: [],
        sections: [],
      });
      return;
    }

    try {
      setChecklistLoading(true);
      const responses = await Promise.allSettled(
        rows
          .filter((row) => row?.id)
          .map((row) => api.get(pathBuilder(row.id)).then((res) => ({ row, data: normalizeChecklist(res.data) })))
      );

      const checklists = responses
        .filter((result) => result.status === "fulfilled" && result.value?.data)
        .map((result) => result.value);

      const items = checklists.flatMap(({ row, data }) => {
        const entityId = data?.[idField] || row.id;
        const entityName = data?.[nameField] || displayName(row, domainLabel);
        return (data.items || flattenSections(data.sections || [])).map((item) => ({
          ...item,
          entity_id: entityId,
          entity_name: entityName,
          section: entityName,
          source_label: item.source_label || `${entityName} · ${item.source || "Source page"}`,
        }));
      });

      setter({
        label: `All ${domainLabel}`,
        score: getChecklistStats({ items }).score,
        completed: getChecklistStats({ items }).compliant,
        total: items.length,
        items,
        sections: groupItems(items),
      });
    } catch (err) {
      console.error(err);
      setter(null);
      setMessage(`Could not load ${domainLabel.toLowerCase()} compliance checklists.`);
    } finally {
      setChecklistLoading(false);
    }
  }

  const currentChecklist = useMemo(() => {
    if (activeTab === "residents") return residentChecklist;
    if (activeTab === "staff") return staffChecklist;
    return facilityChecklist;
  }, [activeTab, residentChecklist, staffChecklist, facilityChecklist]);

  const stats = useMemo(() => getChecklistStats(currentChecklist), [currentChecklist]);
  const overallScore = stats.score;
  const overallStatus = getStatus(overallScore, stats.missing);

  async function saveComment() {
    if (!selectedItem) return;
    try {
      const payload = {
        item_key: selectedItem.key,
        comment,
        entity_type: activeTab === "residents" ? "resident" : activeTab === "staff" ? "staff" : "facility",
        entity_id: selectedItem.entity_id || selectedResidentId || selectedStaffId || null,
        source: selectedItem.source || null,
        document_id: selectedItem.document_id || null,
      };

      const endpoint =
        activeTab === "residents"
          ? "/resident-compliance/comments"
          : activeTab === "staff"
          ? "/staff-compliance/comments"
          : "/facility-compliance/comments";

      await api.post(endpoint, payload);
      setMessage("Comment saved.");
      setSelectedItem(null);
      setComment("");
      if (activeTab === "residents") loadResidentChecklist(selectedResidentId);
      if (activeTab === "staff") loadStaffChecklist(selectedStaffId);
      if (activeTab === "facility") loadFacilityChecklist();
    } catch (err) {
      console.error(err);
      setMessage("Comment route not available yet. Add the comments route or save comments on the source document.");
    }
  }

  if (loading) return <div className="premium-compliance-page">Loading compliance...</div>;

  return (
    <div className="premium-compliance-page">
      <section className="compliance-hero">
        <div>
          <p className="eyebrow">Source-of-Truth Compliance</p>
          <h1>Compliance Center</h1>
          <p>
            This page mirrors resident, staff, and facility detail records. Evidence documents, certificates, and signed disclosures mark items compliant. Items without evidence stay missing for inspection readiness.
          </p>
        </div>
        <div className={`hero-score ${overallStatus.toLowerCase().replace(/\s+/g, "-")}`} style={{ "--score": overallScore }}>
          <strong>{overallScore}%</strong>
          <span>{overallStatus}</span>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <section className="kpi-grid">
        <KpiCard title="Compliant" value={stats.compliant} icon={CheckCircle2} tone="success" />
        <KpiCard title="Missing Source" value={stats.missing} icon={ShieldAlert} tone="danger" />
        <KpiCard title="Needs Evidence" value={stats.missingEvidence} icon={AlertTriangle} tone="warning" />
        <KpiCard title="Required Items" value={stats.total} icon={ClipboardCheck} tone="neutral" />
      </section>

      <section className="compliance-shell">
        <div className="tabs-row">
          {Object.entries(DOMAINS).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                className={`tab-button ${activeTab === key ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab(key)}
              >
                <Icon size={18} />
                {config.plural}
              </button>
            );
          })}
        </div>

        <div className="filter-row">
          {activeTab === "residents" && (
            <select value={selectedResidentId} onChange={(e) => setSelectedResidentId(e.target.value)}>
              <option value="">All Residents</option>
              {residents.length === 0 && <option value="" disabled>No residents found</option>}
              {residents.map((resident) => (
                <option key={resident.id} value={resident.id}>{displayName(resident, "Resident")}</option>
              ))}
            </select>
          )}

          {activeTab === "staff" && (
            <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)}>
              <option value="">All Staff</option>
              {staff.length === 0 && <option value="" disabled>No staff found</option>}
              {staff.map((person) => (
                <option key={person.id} value={person.id}>{displayName(person, "Staff")}</option>
              ))}
            </select>
          )}

          <button className="secondary-button" type="button" onClick={() => {
            if (activeTab === "residents") loadResidentChecklist(selectedResidentId);
            if (activeTab === "staff") loadStaffChecklist(selectedStaffId);
            if (activeTab === "facility") loadFacilityChecklist();
          }}>
            <RefreshCw size={16} /> Refresh Source Check
          </button>
        </div>

        {checklistLoading ? (
          <div className="empty-state">Checking source records...</div>
        ) : !currentChecklist ? (
          <div className="empty-state">
            <ShieldAlert size={34} />
            <h3>No checklist returned</h3>
            <p>Add the checklist route for this tab so the Compliance Page can mirror source documents.</p>
          </div>
        ) : (
          <ChecklistView
            checklist={currentChecklist}
            activeTab={activeTab}
            detailPath={DOMAINS[activeTab].detailPath}
            onSelect={(item) => {
              setSelectedItem(item);
              setComment("");
            }}
          />
        )}
      </section>

      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Read Only Audit View</p>
                <h2>{selectedItem.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedItem(null)}>×</button>
            </div>

            <div className="source-summary evidence-summary">
              <StatusChip item={selectedItem} status={selectedItem.status} />
              <p><b>Source:</b> {selectedItem.source_label || selectedItem.source || "Source record"}</p>
              <div className="modal-evidence-line">
                <b>Evidence:</b>
                {hasEvidence(selectedItem) ? (
                  <EvidenceFileLink item={selectedItem} />
                ) : (
                  <span>Missing evidence document</span>
                )}
              </div>
              {selectedItem.expiration_date && <p><b>Expires:</b> {formatDate(selectedItem.expiration_date)}</p>}
            </div>

            {isCompliantItem(selectedItem) ? (
              <div className="readonly-box">
                <ShieldCheck size={24} />
                <div>
                  <h3>Evidence ready for inspection</h3>
                  <p>This item has an evidence document. Compliance can view the certificate/file and add comments only. Uploads and edits remain on the source detail page.</p>
                </div>
              </div>
            ) : hasSourceRecord(selectedItem) ? (
              <div className="evidence-required-box">
                <AlertTriangle size={24} />
                <div>
                  <h3>Record exists, but evidence is missing</h3>
                  <p>The staff/resident/facility record exists, but inspection evidence is not attached. Add the certificate, signed form, or supporting file on the source detail page.</p>
                </div>
              </div>
            ) : (
              <div className="missing-box">
                <ShieldAlert size={24} />
                <div>
                  <h3>Source record and evidence missing</h3>
                  <p>Create/upload this item from the resident, staff, or facility detail page. Once evidence exists, it will automatically show compliant here.</p>
                </div>
              </div>
            )}

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add compliance review comment..."
            />

            <div className="modal-actions">
              {getEvidenceUrl(selectedItem) && (
                <>
                  <a className="secondary-button" href={getEvidenceUrl(selectedItem)} target="_blank" rel="noreferrer">
                    <Eye size={16} /> View Evidence
                  </a>
                  <a className="secondary-button" href={getEvidenceUrl(selectedItem)} download>
                    <Download size={16} /> Download
                  </a>
                </>
              )}
              <a className="secondary-button" href={getDetailUrl(activeTab, selectedResidentId, selectedStaffId, selectedItem)}>
                <FileText size={16} /> {hasEvidence(selectedItem) ? "Open Source Page" : "Add Evidence on Source Page"}
              </a>
              <button className="primary-button" type="button" onClick={saveComment}>
                <MessageSquare size={16} /> Save Comment
              </button>
            </div>
          </div>
        </div>
      )}

      <ComplianceStyles />
    </div>
  );
}

function ChecklistView({ checklist, activeTab, detailPath, onSelect }) {
  const sections = checklist.sections || groupItems(checklist.items || []);
  const entityId = checklist.resident_id || checklist.staff_id || checklist.facility_id || "";

  return (
    <div className="checklist-sections">
      {sections.map((section) => (
        <div key={section.title} className="section-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">{activeTab}</p>
              <h3>{section.title}</h3>
            </div>
            <span>{section.items?.length || 0} items</span>
          </div>

          <div className="item-list">
            {(section.items || []).map((item) => (
              <button key={item.key || item.title} className={`source-item ${itemStatusClass(item)}`} type="button" onClick={() => onSelect({ ...item, entity_id: entityId })}>
                <div className="source-left">
                  {isCompliantItem(item) ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.source_label || item.source || (isCompliantItem(item) ? "Evidence found on source page" : "Evidence missing from source page")}</p>
                    {!isCompliantItem(item) && hasSourceRecord(item) && <small className="evidence-note">Record found · evidence document required</small>}
                    {isCompliantItem(item) && (
                      <EvidenceFileLink item={item} compact onClick={(event) => event.stopPropagation()} />
                    )}
                  </div>
                </div>
                <div className="source-actions">
                  <StatusChip item={item} status={item.status} />
                  {isCompliantItem(item) ? <Eye size={16} /> : <span className="missing-link">{hasSourceRecord(item) ? "Add evidence" : "Fix on detail page"}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, tone }) {
  return (
    <div className={`kpi-card ${tone}`}>
      <span><Icon size={22} /></span>
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

function StatusChip({ status, item }) {
  const normalized = item ? normalizeItemStatus(item) : normalizeStatus(status);
  return <span className={`status-chip ${item ? itemStatusClass(item) : statusClass(status)}`}>{normalized}</span>;
}

function EvidenceFileLink({ item, compact = false, onClick }) {
  const url = getEvidenceUrl(item);
  const label = evidenceLabel(item);

  if (!url) {
    return (
      <span className={`compliance-file-link missing ${compact ? "compact" : ""}`}>
        <FileText size={14} />
        {label || "Evidence missing"}
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`compliance-file-link ${compact ? "compact" : ""}`}
      onClick={onClick}
      title="Open evidence file"
    >
      <FileText size={14} />
      {label}
    </a>
  );
}

async function fetchFirstAvailable(paths) {
  let lastError;
  for (const path of paths) {
    try {
      return await api.get(path);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.residents)) return payload.residents;
  if (Array.isArray(payload?.staff)) return payload.staff;
  return [];
}

function normalizeChecklist(payload) {
  if (!payload) return null;
  if (payload.checklist) return normalizeChecklist(payload.checklist);
  const items = payload.items || flattenSections(payload.sections || []);
  return {
    ...payload,
    items,
    sections: payload.sections || groupItems(items),
  };
}

function flattenSections(sections) {
  return sections.flatMap((section) => (section.items || []).map((item) => ({ ...item, section: section.title })));
}

function groupItems(items) {
  const map = new Map();
  items.forEach((item) => {
    const title = item.section || item.category || item.area || "Compliance Items";
    if (!map.has(title)) map.set(title, []);
    map.get(title).push(item);
  });
  return Array.from(map.entries()).map(([title, sectionItems]) => ({ title, items: sectionItems }));
}

function getChecklistStats(checklist) {
  const items = checklist?.items || flattenSections(checklist?.sections || []);
  const total = items.length;
  const compliant = items.filter((item) => isCompliantItem(item)).length;
  const missingEvidence = items.filter((item) => !isCompliantItem(item) && hasSourceRecord(item)).length;
  const missing = items.filter((item) => !isCompliantItem(item) && !hasSourceRecord(item)).length;
  const review = Math.max(total - compliant - missing - missingEvidence, 0);
  const score = total ? Math.round((compliant / total) * 100) : 0;
  return { total, compliant, missing, missingEvidence, review, score };
}

function isCompliant(status) {
  return ["COMPLIANT", "COMPLETE", "COMPLETED", "SIGNED", "VERIFIED", "FOUND", "ACTIVE"].includes(String(status || "").toUpperCase());
}

function isCompliantItem(item) {
  if (!item) return false;

  // IMPORTANT: the Compliance Page must reflect the same evidence displayed on Staff Detail.
  // Some older checklist responses may still return status=MISSING_EVIDENCE or has_evidence=false
  // even after Staff Detail has saved an evidence filename/url. Evidence presence wins.
  const s = String(item.status || "").toUpperCase();
  const evidenceStatus = String(item.evidence_status || "").toUpperCase();

  if (["EXPIRED", "OVERDUE", "DEFICIENT", "NON_COMPLIANT"].includes(s)) return false;
  if (["EXPIRED", "OVERDUE"].includes(evidenceStatus)) return false;

  return hasEvidence(item);
}

function hasEvidence(item) {
  if (!item) return false;

  // Do not trust stale has_evidence=false from the backend when actual file fields exist.
  // Any filename, URL, document id, or certificate id means the evidence exists.
  return Boolean(
    item.evidence_url ||
    item.document_url ||
    item.file_url ||
    item.certificate_url ||
    item.evidence_filename ||
    item.document_filename ||
    item.file_name ||
    item.certificate_filename ||
    item.document_id ||
    item.certificate_document_id ||
    item.has_evidence === true
  );
}

function hasSourceRecord(item) {
  if (!item) return false;
  return Boolean(
    item.record_id ||
    item.source_record_id ||
    item.document_id ||
    item.certificate_document_id ||
    item.has_record === true ||
    item.record_exists === true
  );
}

function itemStatusClass(item) {
  if (isCompliantItem(item)) return "compliant";
  if (hasSourceRecord(item)) return "review";
  return "missing";
}

function statusClass(status) {
  const s = String(status || "MISSING").toUpperCase();
  if (isCompliant(s)) return "compliant";
  if (["MISSING", "OVERDUE", "EXPIRED", "DEFICIENT", "NON_COMPLIANT"].includes(s)) return "missing";
  return "review";
}

function normalizeItemStatus(item) {
  if (isCompliantItem(item)) return "COMPLIANT";
  if (hasSourceRecord(item)) return "NEEDS EVIDENCE";
  return normalizeStatus(item?.status || "MISSING");
}

function normalizeStatus(status) {
  const s = String(status || "MISSING").replace(/_/g, " ").toUpperCase();
  return s;
}

function getEvidenceUrl(item) {
  if (!item) return "";
  if (item.evidence_url) return item.evidence_url;
  if (item.document_url) return item.document_url;
  if (item.file_url) return item.file_url;
  if (item.certificate_url) return item.certificate_url;
  if (item.document_id) return `/documents/${item.document_id}`;
  if (item.certificate_document_id) return `/documents/${item.certificate_document_id}`;
  return "";
}

function evidenceLabel(item) {
  return (
    item?.evidence_filename ||
    item?.document_filename ||
    item?.file_name ||
    item?.certificate_filename ||
    (item?.document_id ? `Document ${item.document_id}` : "Evidence available")
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getStatus(score, missing) {
  if (missing > 0 || score < 75) return "High Risk";
  if (score < 95) return "Needs Review";
  return "Survey Ready";
}

function displayName(row, fallback) {
  return row.full_name || row.name || `${row.first_name || ""} ${row.last_name || ""}`.trim() || row.email || fallback;
}

function getDetailUrl(activeTab, residentId, staffId, selectedItem = null) {
  if (activeTab === "residents") return `/residents/${selectedItem?.entity_id || residentId}`;
  if (activeTab === "staff") return `/staff/${selectedItem?.entity_id || staffId}`;
  return "/facility-compliance";
}

function ComplianceStyles() {
  return (
    <style>{`
      .premium-compliance-page {
        min-height: 100vh;
        padding: 30px;
        color: #0f172a;
        background:
          radial-gradient(circle at 8% 0%, rgba(37, 99, 235, 0.18), transparent 34%),
          radial-gradient(circle at 92% 10%, rgba(20, 184, 166, 0.18), transparent 30%),
          radial-gradient(circle at 55% 100%, rgba(99, 102, 241, 0.12), transparent 38%),
          linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
      }

      .compliance-hero {
        position: relative;
        overflow: hidden;
        border-radius: 34px;
        padding: 36px;
        color: #ffffff;
        display: flex;
        align-items: stretch;
        justify-content: space-between;
        gap: 28px;
        background:
          linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(29, 78, 216, 0.94) 55%, rgba(15, 118, 110, 0.94));
        box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22);
        border: 1px solid rgba(255, 255, 255, 0.24);
      }

      .compliance-hero:before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px),
          linear-gradient(180deg, rgba(255,255,255,0.10) 1px, transparent 1px);
        background-size: 46px 46px;
        opacity: 0.14;
        pointer-events: none;
      }

      .compliance-hero:after {
        content: "";
        position: absolute;
        width: 420px;
        height: 420px;
        right: -150px;
        bottom: -190px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
        filter: blur(1px);
      }

      .compliance-hero > div {
        position: relative;
        z-index: 1;
      }

      .compliance-hero h1 {
        font-size: clamp(2.4rem, 5vw, 4.4rem);
        line-height: 0.94;
        letter-spacing: -0.07em;
        margin: 6px 0 14px;
        max-width: 760px;
      }

      .compliance-hero p {
        max-width: 820px;
        color: rgba(255,255,255,.82);
        line-height: 1.75;
        margin: 0;
        font-size: 1.03rem;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: .72rem;
        text-transform: uppercase;
        letter-spacing: .14em;
        font-weight: 950;
        color: #bfdbfe;
        margin: 0 0 6px;
      }

      .hero-score {
        min-width: 220px;
        border-radius: 30px;
        background: rgba(255,255,255,.14);
        border: 1px solid rgba(255,255,255,.28);
        display: grid;
        place-items: center;
        padding: 24px;
        text-align: center;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.18);
        backdrop-filter: blur(18px);
      }

      .hero-score strong {
        width: 138px;
        height: 138px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        font-size: 2.45rem;
        letter-spacing: -.06em;
        background:
          radial-gradient(circle at center, rgba(15,23,42,.76) 0 58%, transparent 59%),
          conic-gradient(#ffffff calc(var(--score, 0) * 1%), rgba(255,255,255,.20) 0);
      }

      .hero-score span {
        margin-top: 14px;
        font-weight: 950;
        text-transform: uppercase;
        font-size: .78rem;
        letter-spacing: .1em;
      }

      .hero-score.high-risk span { color: #fecaca; }
      .hero-score.needs-review span { color: #fde68a; }
      .hero-score.survey-ready span { color: #bbf7d0; }

      .message-bar {
        margin-top: 16px;
        padding: 13px 16px;
        border-radius: 18px;
        background: rgba(255, 251, 235, 0.92);
        border: 1px solid #fde68a;
        color: #92400e;
        font-weight: 850;
        box-shadow: 0 14px 34px rgba(146, 64, 14, 0.08);
      }

      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        margin: 20px 0;
      }

      .kpi-card {
        position: relative;
        overflow: hidden;
        border-radius: 26px;
        padding: 20px;
        background: rgba(255,255,255,.88);
        border: 1px solid rgba(226,232,240,.95);
        box-shadow: 0 20px 55px rgba(15,23,42,.10);
        display: flex;
        gap: 14px;
        align-items: center;
        backdrop-filter: blur(18px);
      }

      .kpi-card:after {
        content: "";
        position: absolute;
        right: -30px;
        top: -30px;
        width: 88px;
        height: 88px;
        border-radius: 999px;
        background: rgba(37,99,235,.08);
      }

      .kpi-card > span {
        width: 50px;
        height: 50px;
        border-radius: 18px;
        display: grid;
        place-items: center;
        background: #eff6ff;
        color: #2563eb;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
        flex: 0 0 auto;
      }

      .kpi-card.success > span { background: #ecfdf5; color: #059669; }
      .kpi-card.danger > span { background: #fef2f2; color: #dc2626; }
      .kpi-card.warning > span { background: #fffbeb; color: #d97706; }
      .kpi-card p,
      .kpi-card h2 { margin: 0; }
      .kpi-card p { font-weight: 900; color: #64748b; font-size: .86rem; }
      .kpi-card h2 { margin-top: 4px; font-size: 2.08rem; letter-spacing: -.06em; }

      .compliance-shell {
        position: relative;
        overflow: hidden;
        background: rgba(255,255,255,.88);
        border: 1px solid rgba(226,232,240,.95);
        border-radius: 34px;
        padding: 20px;
        box-shadow: 0 30px 90px rgba(15,23,42,.12);
        backdrop-filter: blur(18px);
      }

      .compliance-shell:before {
        content: "";
        position: absolute;
        inset: 0 0 auto 0;
        height: 5px;
        background: linear-gradient(90deg, #1d4ed8, #14b8a6, #22c55e);
      }

      .tabs-row {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .tab-button {
        border: 1px solid #dbeafe;
        background: #f8fafc;
        border-radius: 20px;
        padding: 15px 17px;
        font-weight: 950;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        cursor: pointer;
        color: #334155;
        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
      }

      .tab-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 28px rgba(15,23,42,.08);
      }

      .tab-button.active {
        background: linear-gradient(135deg, #1d4ed8, #0f766e);
        color: #ffffff;
        border-color: transparent;
        box-shadow: 0 18px 38px rgba(37, 99, 235, .24);
      }

      .filter-row {
        display: flex;
        gap: 12px;
        margin: 18px 0;
        align-items: center;
        padding: 14px;
        border-radius: 24px;
        background: linear-gradient(180deg, #f8fafc, #f1f5f9);
        border: 1px solid #e2e8f0;
      }

      .filter-row select {
        min-width: 320px;
        border: 1px solid #cbd5e1;
        border-radius: 16px;
        padding: 13px 15px;
        font-weight: 850;
        background: #ffffff;
        color: #0f172a;
        outline: none;
        box-shadow: 0 8px 22px rgba(15,23,42,.05);
      }

      .filter-row select:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 4px rgba(37,99,235,.12);
      }

      .primary-button,
      .secondary-button {
        border: 0;
        border-radius: 999px;
        padding: 12px 16px;
        font-weight: 950;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        cursor: pointer;
        transition: transform .18s ease, box-shadow .18s ease;
      }

      .primary-button:hover,
      .secondary-button:hover { transform: translateY(-1px); }
      .primary-button { background: linear-gradient(135deg, #1d4ed8, #0f766e); color: #fff; box-shadow: 0 16px 32px rgba(37,99,235,.22); }
      .secondary-button { background: #ffffff; color: #334155; border: 1px solid #e2e8f0; box-shadow: 0 10px 24px rgba(15,23,42,.06); }

      .checklist-sections {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      .section-card {
        position: relative;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        border-radius: 28px;
        padding: 18px;
        background:
          radial-gradient(circle at top right, rgba(37,99,235,.08), transparent 34%),
          #f8fafc;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e2e8f0;
      }

      .section-header h3 { margin: 0; font-size: 1.16rem; letter-spacing: -.03em; }
      .section-header span {
        height: fit-content;
        border-radius: 999px;
        padding: 7px 11px;
        font-weight: 950;
        color: #1d4ed8;
        background: #eff6ff;
        font-size: .78rem;
      }

      .item-list { display: grid; gap: 11px; }

      .source-item {
        width: 100%;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 14px;
        background: rgba(255,255,255,.94);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        text-align: left;
        cursor: pointer;
        box-shadow: 0 10px 26px rgba(15,23,42,.05);
        transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
      }

      .source-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 42px rgba(15,23,42,.10);
        border-color: #bfdbfe;
      }

      .source-item.compliant { border-left: 5px solid #16a34a; }
      .source-item.missing { border-left: 5px solid #dc2626; }
      .source-item.review { border-left: 5px solid #d97706; }

      .source-left { display: flex; gap: 12px; align-items: flex-start; min-width: 0; }
      .source-left svg {
        width: 34px;
        height: 34px;
        padding: 8px;
        border-radius: 13px;
        background: #f1f5f9;
        flex: 0 0 auto;
      }
      .source-left strong { display: block; color: #0f172a; letter-spacing: -.02em; }
      .source-left p { margin: 4px 0 0; color: #64748b; font-size: .86rem; line-height: 1.35; }
      .source-item.compliant .source-left svg { color: #16a34a; background: #ecfdf5; }
      .source-item.missing .source-left svg { color: #dc2626; background: #fef2f2; }
      .source-item.review .source-left svg { color: #d97706; background: #fffbeb; }
      .source-actions { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; }

      .status-chip {
        border-radius: 999px;
        padding: 7px 11px;
        font-size: .71rem;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: .04em;
        white-space: nowrap;
      }
      .status-chip.compliant { background: #ecfdf5; color: #047857; border: 1px solid #bbf7d0; }
      .status-chip.missing { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
      .status-chip.review { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
      .missing-link { font-size: .78rem; font-weight: 950; color: #b91c1c; }

      .empty-state {
        min-height: 260px;
        border: 1px dashed #cbd5e1;
        background:
          radial-gradient(circle at center, rgba(37,99,235,.06), transparent 38%),
          #f8fafc;
        border-radius: 26px;
        display: grid;
        place-items: center;
        text-align: center;
        color: #64748b;
        padding: 26px;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15,23,42,.58);
        display: grid;
        place-items: center;
        z-index: 50;
        padding: 18px;
        backdrop-filter: blur(8px);
      }

      .audit-modal {
        width: min(800px, 100%);
        max-height: 90vh;
        overflow: auto;
        background: #ffffff;
        border-radius: 32px;
        padding: 24px;
        box-shadow: 0 35px 95px rgba(15,23,42,.34);
        border: 1px solid rgba(255,255,255,.82);
      }

      .modal-header { display: flex; justify-content: space-between; gap: 14px; }
      .modal-header h2 { margin: 0; letter-spacing: -.04em; }
      .modal-header button {
        border: 0;
        background: #f1f5f9;
        width: 42px;
        height: 42px;
        border-radius: 999px;
        font-size: 1.5rem;
        cursor: pointer;
      }

      .source-summary {
        display: grid;
        gap: 9px;
        margin: 16px 0;
        padding: 16px;
        border-radius: 20px;
        background: linear-gradient(180deg, #f8fafc, #f1f5f9);
        border: 1px solid #e2e8f0;
      }
      .source-summary p { margin: 0; }

      .readonly-box,
      .missing-box,
      .evidence-required-box {
        display: flex;
        gap: 13px;
        border-radius: 20px;
        padding: 16px;
        margin-bottom: 14px;
        border: 1px solid transparent;
      }
      .readonly-box { background: #ecfdf5; color: #065f46; border-color: #bbf7d0; }
      .missing-box { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
      .evidence-required-box { background: #fffbeb; color: #92400e; border-color: #fde68a; }
      .readonly-box h3,
      .missing-box h3,
      .evidence-required-box h3,
      .readonly-box p,
      .missing-box p,
      .evidence-required-box p { margin: 0; }
      .readonly-box p,
      .missing-box p,
      .evidence-required-box p { margin-top: 4px; line-height: 1.5; }
      .evidence-note { display:block; margin-top:4px; color:#b45309; font-weight:850; font-size:.78rem; }
      .evidence-note.success { color:#047857; }
      .evidence-summary { border-left: 5px solid #2563eb; }

      .audit-modal textarea {
        width: 100%;
        min-height: 128px;
        border: 1px solid #cbd5e1;
        border-radius: 20px;
        padding: 14px;
        font: inherit;
        resize: vertical;
        outline: none;
      }
      .audit-modal textarea:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,.12); }
      .modal-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; margin-top: 14px; }

      @media(max-width: 1100px) {
        .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .checklist-sections { grid-template-columns: 1fr; }
      }

      @media(max-width: 820px) {
        .premium-compliance-page { padding: 16px; }
        .compliance-hero { flex-direction: column; padding: 26px; }
        .tabs-row { grid-template-columns: 1fr; }
        .filter-row { flex-direction: column; align-items: stretch; }
        .filter-row select { min-width: 0; width: 100%; }
        .source-item { align-items: flex-start; flex-direction: column; }
        .source-actions { width: 100%; justify-content: space-between; }
      }

      @media(max-width: 620px) {
        .kpi-grid { grid-template-columns: 1fr; }
        .hero-score { min-width: 0; }
        .modal-actions { justify-content: stretch; }
        .modal-actions > * { justify-content: center; }
      }
    `}</style>
  );
}
