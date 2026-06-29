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
import complianceHero from "../assets/compliance_center.png";

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
      const res = await api.get(path, { params: { _ts: Date.now() } });
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
          .map((row) => ({ row, entityId: getEntityId(row) }))
          .filter(({ entityId }) => entityId)
          .map(({ row, entityId }) =>
            api
              .get(pathBuilder(entityId), { params: { _ts: Date.now() } })
              .then((res) => ({ row, entityId, data: normalizeChecklist(res.data) }))
          )
      );

      const checklists = responses
        .filter((result) => result.status === "fulfilled" && result.value?.data)
        .map((result) => result.value);

      const items = checklists.flatMap(({ row, entityId: rowEntityId, data }) => {
        const entityId = data?.[idField] || rowEntityId || getEntityId(row);
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

  async function refreshActiveChecklist() {
    if (activeTab === "residents") return loadResidentChecklist(selectedResidentId);
    if (activeTab === "staff") return loadStaffChecklist(selectedStaffId);
    if (activeTab === "facility") return loadFacilityChecklist();
  }

  useEffect(() => {
    const handleFocusRefresh = () => {
      refreshActiveChecklist();
    };

    const handleVisibilityRefresh = () => {
      if (!document.hidden) refreshActiveChecklist();
    };

    window.addEventListener("focus", handleFocusRefresh);
    document.addEventListener("visibilitychange", handleVisibilityRefresh);

    return () => {
      window.removeEventListener("focus", handleFocusRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
    };
  }, [activeTab, selectedResidentId, selectedStaffId, residents.length, staff.length]);

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
	<section
	  className="compliance-hero"
	  style={{
		backgroundImage: `
		  linear-gradient(
			90deg,
			rgba(7,23,53,.96) 0%,
			rgba(29,78,216,.86) 45%,
			rgba(14,165,233,.35) 75%,
			rgba(14,165,233,.15) 100%
		  ),
		  url(${complianceHero})
		`,
	  }}
	>
	  <div className="compliance-hero-content">

		<p className="hero-kicker">
		  COMPLIANCE CENTER
		</p>

		<h1>
		  Facility Compliance
		  <br />
		  Command Center
		</h1>

		<p>
		  Monitor resident, staff and facility compliance from a single
		  executive workspace. Track inspections, certificates,
		  documentation, deficiencies, corrective actions and audit
		  readiness in real time.
		</p>

		<div className="hero-actions">

		  <button
			className="hero-primary"
			onClick={refreshActiveChecklist}
		  >
			<RefreshCw size={18}/>
			Refresh Compliance
		  </button>

		  <button className="hero-secondary">
			<Download size={18}/>
			Export Audit Report
		  </button>

		</div>

	  </div>

	  <div
		className={`hero-score ${overallStatus
		  .toLowerCase()
		  .replace(/\s+/g, "-")}`}
		style={{ "--score": overallScore }}
	  >

		<strong>{overallScore}%</strong>

		<span>{overallStatus}</span>

		<small>
		  {stats.compliant} Compliant • {stats.missing} Missing
		</small>

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
        <div className="compliance-domain-grid">

		{Object.entries(DOMAINS).map(([key, config]) => {

			const Icon=config.icon;

			const gradients={
				residents:"resident-card",
				staff:"staff-card",
				facility:"facility-card"
			};

			return(

		<button
		key={key}
		className={`domain-card ${gradients[key]} ${activeTab===key?"active":""}`}
		onClick={()=>setActiveTab(key)}
		>

		<div className="domain-icon">
			<Icon/>
		</div>

		<div className="domain-content">

		<span className="domain-label">
		{config.plural}
		</span>

		<h2>
		{config.label} Compliance
		</h2>

		<p>
		Manage documentation, evidence,
		certificates and inspection readiness.
		</p>

		<div className="domain-footer">

		<div>

		<strong>

		{key==="residents"
		?residents.length
		:key==="staff"
		?staff.length
		:facilityChecklist?.total || 0}

		</strong>

		<span>
		Records
		</span>

		</div>

		<div className="open-workspace">
		Open Workspace →
		</div>

		</div>

		</div>

		</button>

		);

		})}

		</div>
        <div className="filter-row">
          <div className="filter-copy">
            <span>Compliance Workspace</span>
            <strong>
              {activeTab === "residents"
                ? "Resident Compliance Review"
                : activeTab === "staff"
                ? "Staff Compliance Review"
                : "Facility Compliance Review"}
            </strong>
            <p>Select a record, refresh source evidence, or export the audit report.</p>
          </div>

          <div className="filter-controls">
            {activeTab === "residents" && (
              <select
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
              >
                <option value="">All Residents</option>
                {residents.length === 0 && (
                  <option value="" disabled>No residents found</option>
                )}
                {residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {displayName(resident, "Resident")}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "staff" && (
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                <option value="">All Staff</option>
                {staff.length === 0 && (
                  <option value="" disabled>No staff found</option>
                )}
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {displayName(person, "Staff")}
                  </option>
                ))}
              </select>
            )}

            <button
              className="secondary-button premium-action"
              type="button"
              onClick={refreshActiveChecklist}
            >
              <RefreshCw size={20} />
              Refresh Source
            </button>

            <button className="primary-button premium-action" type="button">
              <Download size={20} />
              Export Audit
            </button>
          </div>
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
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => openEvidenceFile(selectedItem)}
                  >
                    <Eye size={16} /> View Evidence
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => openEvidenceFile(selectedItem, true)}
                  >
                    <Download size={16} /> Download
                  </button>
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
              <button key={item.key || item.title} className={`source-item ${itemStatusClass(item)}`} type="button" onClick={() => onSelect({ ...item, entity_id: item.entity_id || entityId })}>
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
      <div className="kpi-icon">
        <Icon size={38} />
      </div>
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
    <button
      type="button"
      className={`compliance-file-link ${compact ? "compact" : ""}`}
      onClick={(event) => {
        if (onClick) onClick(event);
        event.stopPropagation();
        openEvidenceFile(item);
      }}
      title="Open evidence file"
    >
      <FileText size={14} />
      {label}
    </button>
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

  const rawItems = payload.items || flattenSections(payload.sections || []);
  const items = rawItems.map(normalizeEvidenceItem);

  const sections = payload.sections
    ? payload.sections.map((section) => ({
        ...section,
        items: (section.items || []).map(normalizeEvidenceItem),
      }))
    : groupItems(items);

  return {
    ...payload,
    items,
    sections,
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

  const rawUrl =
    item.evidence_url ||
    item.document_url ||
    item.file_url ||
    item.certificate_url ||
    "";

  if (rawUrl && !isBareFilename(rawUrl)) return resolveApiFileUrl(rawUrl);

  const recordGroup = item.record_group;
  const recordId = item.record_id || item.source_record_id;

  if (recordGroup && recordId) {
    return resolveApiFileUrl(`/staff-compliance/${recordGroup}/${recordId}/evidence/view`);
  }

  if (item.document_id) return resolveApiFileUrl(`/documents/${item.document_id}`);
  if (item.certificate_document_id) return resolveApiFileUrl(`/documents/${item.certificate_document_id}`);

  return "";
}

function isBareFilename(value = "") {
  const text = String(value || "").trim();
  return Boolean(text && !text.startsWith("http") && !text.startsWith("/") && !text.includes("/"));
}

function resolveApiFileUrl(path = "") {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const base = api.defaults?.baseURL || "";

  if (path.startsWith("/api/")) {
    if (base.startsWith("http")) {
      try {
        return `${new URL(base).origin}${path}`;
      } catch {
        return path;
      }
    }
    return path;
  }

  if (path.startsWith("/")) {
    if (base.startsWith("http")) {
      try {
        const baseUrl = new URL(base);
        if (baseUrl.pathname.endsWith("/api/v1")) return `${base}${path}`;
        return `${baseUrl.origin}${path}`;
      } catch {
        return `${base}${path}`;
      }
    }
    return `${base}${path}`.replace(/\/\/+/g, "/");
  }

  if (base) return `${base.replace(/\/$/, "")}/${path}`;
  return path;
}

async function openEvidenceFile(item, download = false) {
  try {
    const url = getEvidenceUrl(item);

    if (!url) {
      alert("No evidence file is attached yet.");
      return;
    }

    let requestUrl = url;
    const baseURL = api.defaults?.baseURL || "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      const evidenceUrl = new URL(url);
      const apiUrl = baseURL ? new URL(baseURL) : null;

      if (!apiUrl || evidenceUrl.origin !== apiUrl.origin) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }

      requestUrl = evidenceUrl.pathname + evidenceUrl.search;
    }

    requestUrl = requestUrl.replace(/^\/api\/v1/, "");

    const res = await api.get(requestUrl, {
      responseType: "blob",
      params: { _ts: Date.now() },
    });

    const contentType = res.headers?.["content-type"] || "application/octet-stream";
    const blob = new Blob([res.data], { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);

    if (download) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = evidenceLabel(item) || "evidence";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      return;
    }

    window.open(blobUrl, "_blank", "noopener,noreferrer");
  } catch (err) {
    console.error(err);
    alert("Could not open evidence file. Refresh the checklist or re-upload the evidence if this is an older record.");
  }
}

function normalizeEvidenceItem(item = {}) {
  const withUrl = {
    ...item,
    evidence_url: getEvidenceUrl(item) || item.evidence_url || item.document_url || item.file_url || "",
  };

  if (hasEvidence(withUrl)) {
    return {
      ...withUrl,
      status: "COMPLIANT",
      has_evidence: true,
      evidence_status: withUrl.evidence_status || "EVIDENCE_ATTACHED",
    };
  }

  if (hasSourceRecord(withUrl)) {
    return {
      ...withUrl,
      status: withUrl.status || "MISSING_EVIDENCE",
      evidence_status: withUrl.evidence_status || "RECORD_FOUND_EVIDENCE_REQUIRED",
    };
  }

  return withUrl;
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

function getEntityId(row = {}) {
  return row.id || row.staff_id || row.resident_id || row.profile_id || row.uuid || "";
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
        padding: 22px;
        color: #071735;
        background:
          radial-gradient(circle at top left, rgba(59,130,246,.28), transparent 28%),
          radial-gradient(circle at bottom right, rgba(147,197,253,.35), transparent 32%),
          linear-gradient(135deg, #eaf4ff 0%, #f8fbff 52%, #dcecff 100%);
      }
		.compliance-hero{

		position:relative;

		display:flex;

		justify-content:space-between;

		align-items:center;

		gap:40px;

		min-height:360px;

		padding:44px 48px;

		margin-bottom:28px;

		border-radius:34px;

		overflow:hidden;

		background-size:cover;

		background-position:center right;

		background-repeat:no-repeat;

		box-shadow:
		0 30px 80px rgba(15,23,42,.22);

		}

		.compliance-hero::before{

		content:"";

		position:absolute;

		inset:0;

		background:
		radial-gradient(
		circle at 68% 50%,
		rgba(37,99,235,.38),
		transparent 42%
		);

		pointer-events:none;

		}

		.compliance-hero>*{

		position:relative;

		z-index:2;

		}

		.compliance-hero-content{

		max-width:760px;

		}

		.hero-kicker{

		margin:0 0 16px;

		font-size:14px;

		font-weight:900;

		letter-spacing:.12em;

		text-transform:uppercase;

		color:#7dd3fc;

		}

		.compliance-hero h1{

		margin:0;

		font-size:clamp(52px,6vw,80px);

		line-height:.92;

		letter-spacing:-.08em;

		font-weight:900;

		color:white;

		}

		.compliance-hero p{

		margin-top:22px;

		max-width:670px;

		font-size:19px;

		line-height:1.7;

		font-weight:500;

		color:rgba(255,255,255,.90);

		}

		.hero-actions{

		margin-top:34px;

		display:flex;

		gap:16px;

		}

		.hero-primary{

		display:flex;

		align-items:center;

		gap:10px;

		padding:16px 28px;

		border:none;

		border-radius:18px;

		background:white;

		color:#071735;

		font-weight:800;

		cursor:pointer;

		}

		.hero-secondary{

		display:flex;

		align-items:center;

		gap:10px;

		padding:16px 28px;

		border-radius:18px;

		background:rgba(255,255,255,.10);

		border:1px solid rgba(255,255,255,.30);

		backdrop-filter:blur(10px);

		color:white;

		font-weight:800;

		cursor:pointer;

		}

		.hero-score{

		width:280px;

		padding:30px;

		border-radius:28px;

		background:rgba(255,255,255,.14);

		border:1px solid rgba(255,255,255,.18);

		backdrop-filter:blur(18px);

		box-shadow:
		0 20px 50px rgba(0,0,0,.58);

		text-align:center;

		}

		.hero-score strong{

		width:170px;

		height:170px;

		margin:auto;

		display:grid;

		place-items:center;

		border-radius:50%;

		font-size:48px;

		font-weight:900;

		background:
		radial-gradient(circle,#f20000 58%,transparent 59%),
		conic-gradient(
		#ffffff calc(var(--score)*1%),
		rgba(255,255,255,.12) 0
		);

		}

		.hero-score span{

		display:block;

		margin-top:18px;

		font-size:25px;

		font-weight:900;

		letter-spacing:.12em;

		text-transform:uppercase;

		color:white;

		}

		.hero-score small{

		display:block;

		margin-top:10px;

		font-size:14px;

		color:rgba(255,255,255,.82);

		}

      .message-bar {
        margin-bottom: 18px;
        padding: 14px 18px;
        border-radius: 18px;
        background: #fffbeb;
        border: 1px solid #fde68a;
        color: #92400e;
        font-weight: 900;
      }

      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }

      .kpi-card {
        min-height: 200px;
        border-radius: 24px;
        padding: 24px;
        background: rgba(255,255,255,.88);
        border: 3px solid rgba(25,255,255,.78);
        box-shadow: 0 18px 45px rgba(15,23,42,.62);
        display: flex;
        align-items: center;
        gap: 22px;
        overflow: hidden;
        position: relative;
      }

      .kpi-card::after {
        content: "";
        position: absolute;
        width: 160px;
        height: 160px;
        right: -70px;
        bottom: -90px;
        border-radius: 999px;
        opacity: .18;
      }

      .kpi-icon {
        position: relative;
        z-index: 1;
        width: 78px;
        height: 78px;
        border-radius: 24px;
        display: grid;
        place-items: center;
        color: white;
        box-shadow: 0 16px 34px rgba(15,23,42,.86);
      }

      .kpi-card.success .kpi-icon,
      .kpi-card.success::after {
        background: linear-gradient(135deg, #34d399, #059669);
      }

      .kpi-card.danger .kpi-icon,
      .kpi-card.danger::after {
        background: linear-gradient(135deg, #fb7185, #dc2626);
      }

      .kpi-card.warning .kpi-icon,
      .kpi-card.warning::after {
        background: linear-gradient(135deg, #fbbf24, #f97316);
      }

      .kpi-card.neutral .kpi-icon,
      .kpi-card.neutral::after {
        background: linear-gradient(135deg, #38bdf8, #2563eb);
      }

      .kpi-card p {
        margin: 0;
        font-size: 19px;
        font-weight: 950;
        color: #385071;
        text-transform: uppercase;
        letter-spacing: .06em;
      }

      .kpi-card h2 {
        margin: 8px 0 0;
        font-size: 46px;
        line-height: 1;
        letter-spacing: -.08em;
        color: #f20000;
      }

      .compliance-shell {
        border-radius: 30px;
        padding: 24px;
        background: rgba(255,255,255,.9);
        border: 1px solid rgba(25,255,255,.82);
        box-shadow: 0 24px 65px rgba(15,23,42,.83);
      }

      .tabs-row {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 18px;
      }

      .tab-button {
        border: 0;
        border-radius: 22px;
        padding: 18px;
        min-height: 124px;
        background: #f8fbff;
        color: #385071;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-weight: 950;
        cursor: pointer;
        box-shadow: inset 0 0 0 1px #dbeafe;
        transition: .2s ease;
      }

      .tab-button svg {
        width: 26px;
        height: 26px;
      }

      .tab-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px rgba(15,23,42,.1);
      }

      .tab-button.active {
        background: linear-gradient(135deg, #0ea5e9, #1d4ed8);
        color: white;
        box-shadow: 0 18px 38px rgba(37,99,235,.66);
      }

		.filter-row{

		display:flex;

		align-items:center;

		justify-content:space-between;

		gap:24px;

		margin:28px 0 34px;

		padding:28px 32px;

		min-height:130px;

		border-radius:28px;

		background:
		linear-gradient(
		135deg,
		rgba(255,255,255,.98),
		rgba(240,248,255,.96)
		);

		border:1px solid rgba(219,234,254,.9);

		box-shadow:
		0 22px 55px rgba(15,23,42,.10);

		position:relative;

		overflow:hidden;

		}

		.filter-row::before{

		content:"";

		position:absolute;

		right:-80px;

		top:-60px;

		width:220px;

		height:220px;

		border-radius:50%;

		background:
		rgba(37,99,235,.06);

		}

		.filter-row::after{

		content:"";

		position:absolute;

		left:-70px;

		bottom:-90px;

		width:180px;

		height:180px;

		border-radius:50%;

		background:
		rgba(14,165,233,.05);

		}
		.filter-row select{

		position:relative;

		z-index:2;

		width:420px;

		height:64px;

		padding:0 22px;

		border-radius:18px;

		border:2px solid #dbeafe;

		background:white;

		font-size:17px;

		font-weight:700;

		color:#0f172a;

		outline:none;

		transition:.25s;

		box-shadow:
		0 8px 20px rgba(15,23,42,.05);

		}

		.filter-row select:hover{

		border-color:#60a5fa;

		}

		.filter-row select:focus{

		border-color:#2563eb;

		box-shadow:
		0 0 0 5px rgba(37,99,235,.12);

		}
      .primary-button,
      .secondary-button {
        border: 0;
        border-radius: 999px;
        padding: 13px 18px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 950;
        text-decoration: none;
        cursor: pointer;
      }

      .primary-button {
        color: white;
        background: linear-gradient(135deg, #1d4ed8, #0f766e);
      }

		.secondary-button{

		height:64px;

		padding:0 30px;

		border-radius:18px;

		font-size:16px;

		font-weight:800;

		display:flex;

		align-items:center;

		gap:12px;

		box-shadow:
		0 12px 30px rgba(15,23,42,.68);

		}

      .checklist-sections {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
      }

      .section-card {
        border-radius: 26px;
        padding: 20px;
        background: linear-gradient(135deg, #ffffff, #f3f9ff);
        border: 1px solid #dbeafe;
        box-shadow: 0 15px 36px rgba(15,23,42,.07);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        padding-bottom: 14px;
        margin-bottom: 14px;
        border-bottom: 1px solid #dbeafe;
      }

      .section-header h3 {
        margin: 0;
        font-size: 22px;
        letter-spacing: -.04em;
      }

      .section-header span {
        height: fit-content;
        border-radius: 999px;
        padding: 8px 12px;
        background: #eff6ff;
        color: #1d4ed8;
        font-weight: 950;
        font-size: 12px;
      }

      .item-list {
        display: grid;
        gap: 12px;
      }

      .source-item {
        width: 100%;
        border: 1px solid #e2e8f0;
        border-left-width: 6px;
        border-radius: 20px;
        padding: 15px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        text-align: left;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(15,23,42,.36);
        transition: .18s ease;
      }

      .source-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 42px rgba(15,23,42,.11);
      }

      .source-item.compliant { border-left-color: #16a34a; }
      .source-item.review { border-left-color: #f97316; }
      .source-item.missing { border-left-color: #dc2626; }

      .source-left {
        display: flex;
        gap: 13px;
        align-items: flex-start;
        min-width: 0;
      }

      .source-left svg {
        width: 38px;
        height: 38px;
        padding: 9px;
        border-radius: 14px;
        background: #eff6ff;
        color: #2563eb;
        flex: 0 0 auto;
      }

      .source-item.compliant .source-left svg {
        background: #ecfdf5;
        color: #059669;
      }

      .source-item.review .source-left svg {
        background: #fffbeb;
        color: #f97316;
      }

      .source-item.missing .source-left svg {
        background: #fef2f2;
        color: #dc2626;
      }

      .source-left strong {
        display: block;
        color: #071735;
        font-size: 15px;
      }

      .source-left p {
        margin: 4px 0 0;
        color: #64748b;
        font-size: 13px;
        line-height: 1.4;
      }

      .source-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 0 0 auto;
      }

      .status-chip {
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 11px;
        font-weight: 950;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .status-chip.compliant {
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #bbf7d0;
      }

      .status-chip.review {
        background: #fffbeb;
        color: #b45309;
        border: 1px solid #fde68a;
      }

      .status-chip.missing {
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }

      .missing-link {
        color: #b91c1c;
        font-size: 14px;
        font-weight: 950;
      }

      .empty-state {
        min-height: 260px;
        border: 1px dashed #93c5fd;
        border-radius: 26px;
        display: grid;
        place-items: center;
        text-align: center;
        background:
          radial-gradient(circle at center, rgba(147,197,253,.26), transparent 36%),
          linear-gradient(135deg, #ffffff, #eff6ff);
        color: #49617f;
        padding: 30px;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(7,23,53,.62);
        backdrop-filter: blur(10px);
      }

      .audit-modal {
        width: min(820px, 100%);
        max-height: 90vh;
        overflow: auto;
        border-radius: 32px;
        padding: 26px;
        background: white;
        box-shadow: 0 35px 95px rgba(15,23,42,.38);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }

      .modal-header h2 {
        margin: 0;
        letter-spacing: -.045em;
      }

      .modal-header button {
        border: 0;
        width: 44px;
        height: 44px;
        border-radius: 999px;
        background: #f1f5f9;
        font-size: 24px;
        cursor: pointer;
      }

      .source-summary {
        margin: 18px 0;
        padding: 16px;
        border-radius: 20px;
        background: #f8fbff;
        border: 1px solid #dbeafe;
        border-left: 6px solid #2563eb;
        display: grid;
        gap: 9px;
      }

      .source-summary p {
        margin: 0;
      }

      .readonly-box,
      .missing-box,
      .evidence-required-box {
        display: flex;
        gap: 14px;
        border-radius: 20px;
        padding: 16px;
        margin-bottom: 14px;
      }

      .readonly-box {
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #bbf7d0;
      }

      .evidence-required-box {
        background: #fffbeb;
        color: #92400e;
        border: 1px solid #fde68a;
      }

      .missing-box {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }

      .readonly-box h3,
      .readonly-box p,
      .missing-box h3,
      .missing-box p,
      .evidence-required-box h3,
      .evidence-required-box p {
        margin: 0;
      }

      .readonly-box p,
      .missing-box p,
      .evidence-required-box p {
        margin-top: 5px;
        line-height: 1.5;
      }

      .audit-modal textarea {
        width: 100%;
        min-height: 130px;
        border-radius: 20px;
        padding: 14px;
        border: 1px solid #cbd5e1;
        font: inherit;
        outline: none;
        resize: vertical;
      }

      .modal-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 14px;
      }

      .compliance-file-link {
        border: 0;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #2563eb;
        font-weight: 950;
        padding: 7px 10px;
        border-radius: 12px;
        background: rgba(37,99,235,.08);
        border: 1px solid rgba(37,99,235,.14);
        cursor: pointer;
      }

      .compliance-file-link.compact {
        margin-top: 6px;
        font-size: 12px;
        padding: 5px 8px;
      }

      .compliance-file-link.missing {
        color: #b91c1c;
        background: #fef2f2;
        border-color: #fecaca;
        cursor: default;
      }

      .evidence-note {
        display: block;
        margin-top: 4px;
        color: #b45309;
        font-weight: 850;
        font-size: 12px;
      }



      /* Ultra-premium compliance controls and checklist cards */
      .filter-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 28px;
        margin: 34px 0;
        padding: 34px;
        min-height: 150px;
        border-radius: 34px;
        background:
          radial-gradient(circle at right, rgba(37,99,235,.12), transparent 30%),
          linear-gradient(135deg, rgba(255,255,255,.98), rgba(239,246,255,.96));
        border: 3px solid rgba(25,234,254,.95);
        box-shadow: 0 28px 70px rgba(15,23,42,.44);
        position: relative;
        overflow: hidden;
      }

      .filter-copy {
        position: relative;
        z-index: 2;
      }

      .filter-copy span {
        display: block;
        font-size: 15px;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: .12em;
        color: #2563eb;
      }

      .filter-copy strong {
        display: block;
        margin-top: 8px;
        font-size: 32px;
        line-height: 1;
        letter-spacing: -.06em;
        color: #071735;
      }

      .filter-copy p {
        margin: 10px 0 0;
        color: #f20000;
        font-size: 20px;
        font-weight: 700;
      }

      .filter-controls {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }

      .filter-controls select {
        width: 430px;
        height: 128px;
        padding: 0 22px;
        border-radius: 20px;
        border: 2px solid #bfdbfe;
        background: white;
        color: #071735;
        font-size: 17px;
        font-weight: 900;
        outline: none;
        box-shadow: 0 14px 28px rgba(15,23,42,.08);
      }

      .premium-action {
        height: 128px;
        padding: 0 28px;
        border-radius: 20px;
        font-size: 16px;
        font-weight: 950;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 16px 34px rgba(15,23,42,.12);
      }

      .primary-button.premium-action {
        color: white;
        background: linear-gradient(135deg, #1d4ed8, #0f766e);
      }

      .secondary-button.premium-action {
        color: #0f172a;
        background: white;
        border: 2px solid #dbeafe;
      }

      .checklist-sections {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 26px;
      }

      .section-card {
        border-radius: 34px;
        padding: 26px;
        background:
          radial-gradient(circle at top right, rgba(37,99,235,.1), transparent 34%),
          linear-gradient(135deg, #ffffff, #f3f9ff);
        border: 3px solid rgba(25,234,254,.95);
        box-shadow: 0 24px 60px rgba(15,23,42,.12);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        padding-bottom: 20px;
        margin-bottom: 20px;
        border-bottom: 1px solid #dbeafe;
      }

      .section-header h3 {
        margin: 0;
        font-size: 30px;
        line-height: 1;
        letter-spacing: -.06em;
        color: #071735;
      }

      .section-header span {
        height: fit-content;
        border-radius: 999px;
        padding: 10px 16px;
        background: #eff6ff;
        color: #1d4ed8;
        font-weight: 950;
        font-size: 13px;
      }

      .item-list {
        display: grid;
        gap: 16px;
      }

      .source-item {
        width: 100%;
        min-height: 126px;
        border: 1px solid #dbeafe;
        border-left-width: 8px;
        border-radius: 26px;
        padding: 22px;
        background: rgba(255,255,255,.96);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        text-align: left;
        cursor: pointer;
        box-shadow: 0 16px 38px rgba(15,23,42,.60);
        transition: .2s ease;
      }

      .source-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 24px 60px rgba(15,23,42,.18);
      }

      .source-left {
        display: flex;
        gap: 18px;
        align-items: flex-start;
        min-width: 0;
      }

      .source-left svg {
        width: 58px;
        height: 58px;
        padding: 14px;
        border-radius: 20px;
        background: #eff6ff;
        color: #2563eb;
        flex: 0 0 auto;
      }

      .source-left strong {
        display: block;
        color: #071735;
        font-size: 19px;
        letter-spacing: -.03em;
      }

      .source-left p {
        margin: 7px 0 0;
        color: #64748b;
        font-size: 15px;
        line-height: 1.5;
        font-weight: 650;
      }

      .source-actions {
        display: flex;
        align-items: center;
        gap: 14px;
        flex: 0 0 auto;
      }

      .status-chip {
        border-radius: 999px;
        padding: 11px 16px;
        font-size: 12px;
        font-weight: 950;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .missing-link {
        border-radius: 999px;
        padding: 11px 16px;
        background: #fef2f2;
        color: #b91c1c;
        font-size: 13px;
        font-weight: 950;
      }

      @media(max-width: 1180px) {
        .kpi-grid,
        .checklist-sections {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .compliance-hero {
          flex-direction: column;
        }

        .hero-score {
          min-width: 0;
        }
      }

      @media(max-width: 760px) {
        .premium-compliance-page {
          padding: 14px;
        }

        .kpi-grid,
        .checklist-sections,
        .tabs-row {
          grid-template-columns: 1fr;
        }

        .filter-row {
          flex-direction: column;
          align-items: stretch;
        }

        .filter-row select {
          min-width: 0;
          width: 100%;
        }

        .source-item {
          align-items: flex-start;
          flex-direction: column;
        }

        .source-actions {
          width: 100%;
          justify-content: space-between;
        }

        .modal-actions {
          justify-content: stretch;
        }
      }
    `}</style>
  );
}