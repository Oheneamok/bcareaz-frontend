import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileCheck2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  UsersRound,
} from "lucide-react";

import api from "../services/api";

const complianceSections = [
  "ALL",
  "Credentials",
  "Training",
  "Compliance",
  "Continuing Education",
];

export default function CompliancePage() {
  const [dashboard, setDashboard] = useState(null);
  const [staff, setStaff] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [checklist, setChecklist] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    if (selectedStaffId) {
      loadChecklist(selectedStaffId);
    }
  }, [selectedStaffId]);

  function showToast(type, title, message) {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadPage() {
    try {
      setLoading(true);

      const [dashboardRes, staffRes, alertsRes] = await Promise.allSettled([
        api.get("/staff-compliance/dashboard"),
        api.get("/staff"),
        api.get("/staff-compliance/alerts"),
      ]);

      setDashboard(
        dashboardRes.status === "fulfilled" ? dashboardRes.value.data : null
      );

      const staffList =
        staffRes.status === "fulfilled" && Array.isArray(staffRes.value.data)
          ? staffRes.value.data
          : [];

      setStaff(staffList);

      setAlerts(
        alertsRes.status === "fulfilled" && Array.isArray(alertsRes.value.data)
          ? alertsRes.value.data
          : []
      );

      if (staffList.length && !selectedStaffId) {
        setSelectedStaffId(staffList[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Unable to Load Compliance", "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadChecklist(staffId) {
    try {
      setLoadingChecklist(true);
      const res = await api.get(`/staff-compliance/checklist/${staffId}`);
      setChecklist(res.data);
    } catch (err) {
      console.error(err);
      setChecklist(null);
      showToast("error", "Unable to Load Checklist", "Checklist not found.");
    } finally {
      setLoadingChecklist(false);
    }
  }

  async function refreshStaffChecks() {
    if (!selectedStaffId) {
      showToast("error", "Select Staff", "Please select a staff member first.");
      return;
    }

    try {
      await api.post(`/staff-compliance/generate/${selectedStaffId}`);
      await Promise.all([loadPage(), loadChecklist(selectedStaffId)]);
      showToast("success", "Compliance Refreshed", "Staff compliance checks updated.");
    } catch (err) {
      console.error(err);
      showToast("error", "Refresh Failed", "Unable to refresh compliance checks.");
    }
  }

  async function uploadEvidence(item, file) {
    if (!file) return;

    if (!item.record_group || !item.record_id) {
      showToast(
        "error",
        "Source Record Missing",
        "Create the record in Staff Detail before uploading evidence."
      );
      return;
    }

    try {
      const data = new FormData();
      data.append("evidence", file);

      await api.post(
        `/staff-compliance/${item.record_group}/${item.record_id}/evidence`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      await loadChecklist(selectedStaffId);
      showToast("success", "Evidence Uploaded", "Compliance evidence saved.");
    } catch (err) {
      console.error(err);
      showToast("error", "Upload Failed", "Unable to upload evidence.");
    }
  }

  function openEvidence(item) {
    if (!item.evidence_url) {
      showToast("error", "No Evidence", "No evidence file is attached.");
      return;
    }

    window.open(item.evidence_url, "_blank");
  }

  const selectedStaff = staff.find((s) => s.id === selectedStaffId);

  const filteredItems = useMemo(() => {
    const items = checklist?.items || [];

    return items.filter((item) => {
      const q = search.toLowerCase();

      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.section?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q);

      const matchesSection =
        sectionFilter === "ALL" || item.section === sectionFilter;

      return matchesSearch && matchesSection;
    });
  }, [checklist, search, sectionFilter]);

  const metrics = useMemo(() => {
    const total = checklist?.total || 0;
    const completed = checklist?.completed || 0;
    const score = checklist?.score || 0;

    const missing = filteredItems.filter(
      (i) => i.status === "MISSING" || i.status === "MISSING_EVIDENCE"
    ).length;

    const expired = filteredItems.filter((i) => i.status === "EXPIRED").length;

    return { total, completed, score, missing, expired };
  }, [checklist, filteredItems]);

  return (
    <div className="compliance-page premium-compliance-page">
      {toast && (
        <div className={`premium-toast ${toast.type}`}>
          <div className="premium-toast-icon">
            {toast.type === "error" ? "!" : "✓"}
          </div>
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button type="button" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}

      <section className="compliance-premium-hero">
        <div>
          <p className="dashboard-eyebrow">
            <ShieldCheck size={15} />
            Compliance Center
          </p>
          <h1>Inspection Readiness</h1>
          <p>
            Review staff compliance evidence, missing items, expiring
            credentials, training gaps, and BHRF inspection readiness.
          </p>
        </div>

        <button type="button" onClick={refreshStaffChecks}>
          <RefreshCw size={17} />
          Refresh Checks
        </button>
      </section>

      <section className="compliance-metric-grid">
        <MetricCard
          title="Compliance Score"
          value={`${metrics.score}%`}
          helper="Selected staff checklist"
          icon={<ShieldCheck />}
          tone={metrics.score >= 85 ? "green" : metrics.score >= 60 ? "amber" : "red"}
        />

        <MetricCard
          title="Completed"
          value={`${metrics.completed}/${metrics.total}`}
          helper="Evidence complete"
          icon={<CheckCircle2 />}
          tone="blue"
        />

        <MetricCard
          title="Missing Evidence"
          value={metrics.missing}
          helper="Needs upload or source record"
          icon={<UploadCloud />}
          tone={metrics.missing ? "amber" : "green"}
        />

        <MetricCard
          title="Expired"
          value={metrics.expired}
          helper="Expired compliance records"
          icon={<ShieldAlert />}
          tone={metrics.expired ? "red" : "green"}
        />
      </section>

      <section className="compliance-dashboard-strip">
        <MiniCard
          label="Total Staff"
          value={dashboard?.staff?.total ?? staff.length}
          icon={<UsersRound />}
        />
        <MiniCard
          label="Open Alerts"
          value={dashboard?.alerts?.total_open ?? alerts.length}
          icon={<AlertTriangle />}
        />
        <MiniCard
          label="Critical"
          value={dashboard?.alerts?.critical ?? 0}
          icon={<ShieldAlert />}
        />
        <MiniCard
          label="Training Rate"
          value={`${dashboard?.training?.completion_rate ?? 0}%`}
          icon={<ClipboardCheck />}
        />
      </section>

      <section className="compliance-toolbar-card">
        <div className="compliance-staff-picker">
          <label>Staff Member</label>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
          >
            <option value="">Select staff</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name} — {member.position || "Staff"}
              </option>
            ))}
          </select>
        </div>

        <div className="compliance-search">
          <Search size={17} />
          <input
            placeholder="Search compliance item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
        >
          {complianceSections.map((section) => (
            <option key={section} value={section}>
              {section === "ALL" ? "All Sections" : section}
            </option>
          ))}
        </select>
      </section>

      <section className="compliance-main-layout">
        <div className="compliance-checklist-panel">
          <div className="panel-header">
            <div>
              <p className="dashboard-eyebrow">Staff Checklist</p>
              <h3>
                {selectedStaff?.full_name || "Select Staff"}
              </h3>
              <span className="empty-text">
                {filteredItems.length} compliance item(s)
              </span>
            </div>
          </div>

          {loading || loadingChecklist ? (
            <div className="table-empty">Loading compliance checklist...</div>
          ) : !checklist ? (
            <div className="empty-state">
              <ShieldCheck size={36} />
              <p>Select a staff member to view compliance checklist.</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <FileCheck2 size={36} />
              <p>No checklist items found.</p>
            </div>
          ) : (
            <div className="compliance-item-grid">
              {filteredItems.map((item) => (
                <ComplianceItemCard
                  key={item.key}
                  item={item}
                  onView={() => openEvidence(item)}
                  onUpload={(file) => uploadEvidence(item, file)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="compliance-alert-panel">
          <div className="panel-header">
            <div>
              <p className="dashboard-eyebrow">Open Alerts</p>
              <h3>Staff Alerts</h3>
            </div>
            <AlertTriangle size={20} />
          </div>

          {alerts.length === 0 ? (
            <p className="empty-text">No open staff alerts.</p>
          ) : (
            <div className="compliance-alert-list">
              {alerts.slice(0, 12).map((alert) => (
                <div key={alert.id} className="compliance-alert-row">
                  <span
                    className={`severity-badge ${`${alert.severity || "warning"}`.toLowerCase()}`}
                  >
                    {alert.severity || "WARNING"}
                  </span>
                  <strong>{alert.title || alert.alert_type}</strong>
                  <p>{alert.description || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ComplianceItemCard({ item, onView, onUpload }) {
  const statusClass = `${item.status || "MISSING"}`.toLowerCase();

  return (
    <div className={`compliance-item-card ${statusClass}`}>
      <div className="compliance-item-top">
        <div className="compliance-item-icon">
          {item.status === "COMPLIANT" ? (
            <CheckCircle2 size={22} />
          ) : (
            <AlertTriangle size={22} />
          )}
        </div>

        <span className={`compliance-pill ${statusClass}`}>
          {formatType(item.status)}
        </span>
      </div>

      <h4>{item.title}</h4>
      <p>{item.source_label || item.section}</p>

      <div className="compliance-item-meta">
        <span>Section: {item.section}</span>
        <span>Source: {item.source_tab || "Staff Detail"}</span>
        <span>Evidence: {formatType(item.evidence_status)}</span>
      </div>

      <div className="compliance-item-actions">
        {item.has_evidence ? (
          <button type="button" onClick={onView}>
            <Eye size={15} />
            View Evidence
          </button>
        ) : item.record_id ? (
          <label className="upload-evidence-btn">
            <UploadCloud size={15} />
            Upload Evidence
            <input
              type="file"
              hidden
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </label>
        ) : (
          <span className="source-needed">
            Create source record in Staff Detail
          </span>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, helper, icon, tone }) {
  return (
    <div className={`compliance-premium-card ${tone}`}>
      <div className="compliance-premium-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <span>{helper}</span>
      </div>
    </div>
  );
}

function MiniCard({ label, value, icon }) {
  return (
    <div className="compliance-mini-card">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </div>
  );
}

function formatType(value) {
  return `${value || "—"}`.replaceAll("_", " ");
}