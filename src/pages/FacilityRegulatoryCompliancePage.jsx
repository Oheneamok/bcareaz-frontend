import React, { useEffect, useMemo, useState } from "react";
import {
  Flame,
  Bug,
  FileCheck2,
  RefreshCw,
  Save,
  CalendarDays,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const RECORD_TYPES = [
  "ADHS License",
  "Fire Marshal Certificate",
  "Business License",
  "Liability Insurance",
  "Building Inspection",
  "Health Department Inspection",
  "Emergency Disaster Plan",
  "Fire Alarm Inspection",
  "Sprinkler Inspection",
  "Food Handler Certificate",
  "Vehicle Insurance",
  "Other",
];

const emptyRecord = {
  record_type: "",
  title: "",
  description: "",
  inspection_date: "",
  expiration_date: "",
  next_due_date: "",
  issuing_authority: "",
  certificate_number: "",
  status: "ACTIVE",
  is_required: true,
  notes: "",
  renewal_number: "",
  renewal_date: "",
  previous_expiration_date: "",
  record_version: 1,
  renewal_notes: "",
};

export default function FacilityRegulatoryCompliancePage() {
  const [activeTab, setActiveTab] = useState("RECORDS");
  const [dashboard, setDashboard] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [message, setMessage] = useState("");
  const [recordForm, setRecordForm] = useState(emptyRecord);

  async function loadDashboard() {
    try {
      const res = await api.get("/facility-compliance/regulatory-dashboard");
      setDashboard(res.data);
    } catch {
      setDashboard(null);
    }
  }

  async function loadRecords() {
    try {
      const res = await api.get("/facility-compliance/compliance-records");
      setRecords(res.data || []);
    } catch {
      setRecords([]);
    }
  }

  useEffect(() => {
    loadDashboard();
    loadRecords();
  }, []);

  const expiringRecords = useMemo(() => {
    const now = new Date();
    const next30 = new Date();
    next30.setDate(now.getDate() + 30);

    return records.filter((r) => {
      if (!r.expiration_date) return false;
      const d = new Date(r.expiration_date);
      return d >= now && d <= next30;
    });
  }, [records]);

  const expiredRecords = useMemo(() => {
    const now = new Date();
    return records.filter(
      (r) => r.expiration_date && new Date(r.expiration_date) < now
    );
  }, [records]);

  function handleRecordChange(e) {
    const { name, value, type, checked } = e.target;

    setRecordForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function selectRecord(record) {
    setSelectedRecord(record);

    setRecordForm({
      ...emptyRecord,
      ...record,
      inspection_date: record.inspection_date || "",
      expiration_date: record.expiration_date || "",
      next_due_date: record.next_due_date || "",
      renewal_date: "",
      previous_expiration_date: record.expiration_date || "",
      renewal_notes: "",
      renewal_number: "",
    });
  }

  function startNewRecord() {
    setSelectedRecord(null);
    setRecordForm(emptyRecord);
  }

  async function submitRecord(e) {
    e.preventDefault();

    const payload = {
      ...recordForm,
      title: recordForm.title || recordForm.record_type,
      metadata_json: {
        ...(recordForm.metadata_json || {}),
        frontend_module: "facility_regulatory_compliance",
      },
    };

    try {
      if (selectedRecord?.id) {
        await api.patch(
          `/facility-compliance/compliance-records/${selectedRecord.id}`,
          payload
        );
        setMessage("Compliance record updated successfully.");
      } else {
        await api.post("/facility-compliance/compliance-records", payload);
        setMessage("Compliance record created successfully.");
      }

      startNewRecord();
      loadRecords();
      loadDashboard();
    } catch (err) {
      console.error(err);
      setMessage("Could not save compliance record.");
    }
  }

  return (
    <div className="reg-page">
      <style>{`
        .reg-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .reg-hero {
          min-height: 380px;
          border-radius: 28px;
          padding: 44px;
          margin-bottom: 24px;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 34px;
          background:
            linear-gradient(90deg, rgba(5,18,44,.98), rgba(30,64,175,.92), rgba(14,165,233,.25)),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
        }

        .reg-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 72% 45%, rgba(125,211,252,.22), transparent 34%);
        }

        .hero-content,
        .hero-metrics {
          position: relative;
          z-index: 2;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 14px;
          color: #7dd3fc;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .reg-hero h1 {
          margin: 0;
          font-size: clamp(46px, 5.3vw, 76px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .reg-hero p {
          max-width: 800px;
          margin: 20px 0 0;
          color: rgba(255,255,255,.9);
          font-size: 18px;
          line-height: 1.65;
          font-weight: 650;
        }

        .hero-metrics {
          width: 340px;
          display: grid;
          gap: 12px;
        }

        .metric-card {
          border-radius: 18px;
          padding: 18px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.25);
          backdrop-filter: blur(18px);
        }

        .metric-card strong {
          display: block;
          font-size: 38px;
          line-height: 1;
        }

        .metric-card span {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: #bfdbfe;
        }

        .message-bar {
          margin-bottom: 18px;
          padding: 15px 18px;
          border-radius: 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-weight: 900;
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .tab-btn {
          min-height: 74px;
          border-radius: 18px;
          border: 1px solid #dbeafe;
          background: white;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(15,23,42,.08);
        }

        .tab-btn.active {
          color: white;
          border-color: transparent;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
        }

        .reg-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(380px, .88fr);
          gap: 24px;
          align-items: start;
        }

        .premium-card {
          border-radius: 24px;
          padding: 30px;
          background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,251,255,.96));
          border: 1px solid rgba(219,234,254,.95);
          box-shadow: 0 24px 64px rgba(15,23,42,.13);
          position: relative;
          overflow: hidden;
        }

        .premium-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #2563eb, #06b6d4, #14b8a6);
        }

        .card-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 26px;
        }

        .card-header p {
          margin: 0 0 9px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .11em;
        }

        .card-header h2 {
          margin: 0;
          font-size: 34px;
          line-height: 1;
          color: #071735;
          letter-spacing: -.06em;
        }

        .form-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .form-field {
          display: grid;
          gap: 8px;
        }

        .form-field.full {
          grid-column: span 2;
        }

        .form-field label {
          color: #385071;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          min-height: 58px;
          border: 1px solid #cfe0f7;
          border-radius: 15px;
          padding: 0 16px;
          background: white;
          color: #071735;
          font-size: 15px;
          font-weight: 800;
          outline: none;
          box-shadow: 0 8px 20px rgba(15,23,42,.04);
        }

        .form-field textarea {
          min-height: 120px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.55;
        }

        .toggle-row {
          grid-column: span 2;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border: 1px solid #dbeafe;
          background: #f8fbff;
          border-radius: 16px;
          font-weight: 900;
          color: #334155;
        }

        .button-row {
          grid-column: span 2;
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .primary-btn,
        .secondary-btn {
          min-height: 62px;
          border-radius: 16px;
          padding: 0 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
        }

        .primary-btn {
          border: 0;
          color: white;
          background: linear-gradient(135deg, #1d4ed8, #0f766e);
        }

        .secondary-btn {
          color: #071735;
          background: white;
          border: 1px solid #cfe0f7;
        }

        .record-list {
          display: grid;
          gap: 14px;
        }

        .record-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 16px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
          cursor: pointer;
        }

        .record-card.warning {
          border-left-color: #f59e0b;
        }

        .record-card.danger {
          border-left-color: #dc2626;
        }

        .record-card strong {
          display: block;
          font-size: 17px;
          color: #071735;
        }

        .record-card p {
          margin: 8px 0 0;
          color: #64748b;
          font-weight: 750;
          line-height: 1.45;
        }

        .chip-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .chip {
          border-radius: 999px;
          padding: 7px 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .chip.green { background: #ecfdf5; color: #047857; }
        .chip.orange { background: #fffbeb; color: #b45309; }
        .chip.red { background: #fef2f2; color: #dc2626; }

        .empty-state {
          min-height: 160px;
          border-radius: 16px;
          border: 1px dashed #93c5fd;
          display: grid;
          place-items: center;
          text-align: center;
          color: #49617f;
          background: linear-gradient(135deg, #ffffff, #eff6ff);
          font-weight: 900;
        }

        @media (max-width: 1180px) {
          .reg-grid { grid-template-columns: 1fr; }
          .reg-hero { flex-direction: column; align-items: flex-start; }
          .hero-metrics { width: 100%; }
        }

        @media (max-width: 820px) {
          .reg-page { padding: 14px; }
          .form-grid, .tabs { grid-template-columns: 1fr; }
          .form-field.full, .button-row, .toggle-row { grid-column: span 1; }
          .reg-hero { min-height: auto; padding: 28px; }
          .reg-hero h1 { font-size: 42px; }
        }
      `}</style>

      <section className="reg-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <ShieldCheck size={18} />
            Facility Compliance
          </p>

          <h1>
            Regulatory
            <br />
            Compliance
          </h1>

          <p>
            Track licenses, certificates, inspections, renewals, fire drills,
            pest control, evidence, expiration dates, and inspection readiness.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{dashboard?.overall_score ?? 0}%</strong>
            <span>Overall Score</span>
          </div>

          <div className="metric-card">
            <strong>{expiredRecords.length}</strong>
            <span>Expired Records</span>
          </div>

          <div className="metric-card">
            <strong>{expiringRecords.length}</strong>
            <span>Expiring 30 Days</span>
          </div>

          <div className="metric-card">
            <strong>{records.length}</strong>
            <span>Total Records</span>
          </div>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <div className="tabs">
        {[
          ["RECORDS", FileCheck2, "Regulatory Records"],
          ["RENEWALS", RefreshCw, "Renewals"],
          ["FIRE", Flame, "Fire Drills"],
          ["PEST", Bug, "Pest Control"],
        ].map(([key, Icon, label]) => (
          <button
            key={key}
            type="button"
            className={`tab-btn ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={23} />
            {label}
          </button>
        ))}
      </div>

      {(activeTab === "RECORDS" || activeTab === "RENEWALS") && (
        <section className="reg-grid">
          <form className="premium-card" onSubmit={submitRecord}>
            <div className="card-header">
              <div>
                <p>{selectedRecord ? "Update Record" : "New Record"}</p>
                <h2>
                  {activeTab === "RENEWALS"
                    ? "Renew Compliance Record"
                    : "Regulatory Record"}
                </h2>
              </div>
              <FileText size={32} color="#2563eb" />
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Record Type</label>
                <select
                  name="record_type"
                  value={recordForm.record_type}
                  onChange={handleRecordChange}
                  required
                >
                  <option value="">Select Type</option>
                  {RECORD_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Status</label>
                <select
                  name="status"
                  value={recordForm.status || "ACTIVE"}
                  onChange={handleRecordChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="NEEDS_REVIEW">Needs Review</option>
                </select>
              </div>

              <div className="form-field full">
                <label>Title</label>
                <input
                  name="title"
                  value={recordForm.title || ""}
                  onChange={handleRecordChange}
                  placeholder="Example: ADHS Facility License"
                  required
                />
              </div>

              <div className="form-field">
                <label>Inspection / Issue Date</label>
                <input
                  type="date"
                  name="inspection_date"
                  value={recordForm.inspection_date || ""}
                  onChange={handleRecordChange}
                />
              </div>

              <div className="form-field">
                <label>Expiration Date</label>
                <input
                  type="date"
                  name="expiration_date"
                  value={recordForm.expiration_date || ""}
                  onChange={handleRecordChange}
                />
              </div>

              <div className="form-field">
                <label>Next Due Date</label>
                <input
                  type="date"
                  name="next_due_date"
                  value={recordForm.next_due_date || ""}
                  onChange={handleRecordChange}
                />
              </div>

              <div className="form-field">
                <label>Issuing Authority</label>
                <input
                  name="issuing_authority"
                  value={recordForm.issuing_authority || ""}
                  onChange={handleRecordChange}
                />
              </div>

              <div className="form-field">
                <label>Certificate / License Number</label>
                <input
                  name="certificate_number"
                  value={recordForm.certificate_number || ""}
                  onChange={handleRecordChange}
                />
              </div>

              <div className="toggle-row">
                <input
                  type="checkbox"
                  name="is_required"
                  checked={Boolean(recordForm.is_required)}
                  onChange={handleRecordChange}
                />
                Required Compliance Record
              </div>

              {activeTab === "RENEWALS" && (
                <>
                  <div className="form-field">
                    <label>Renewal Number</label>
                    <input
                      name="renewal_number"
                      value={recordForm.renewal_number || ""}
                      onChange={handleRecordChange}
                    />
                  </div>

                  <div className="form-field">
                    <label>Renewal Date</label>
                    <input
                      type="date"
                      name="renewal_date"
                      value={recordForm.renewal_date || ""}
                      onChange={handleRecordChange}
                    />
                  </div>

                  <div className="form-field">
                    <label>Previous Expiration</label>
                    <input
                      type="date"
                      name="previous_expiration_date"
                      value={recordForm.previous_expiration_date || ""}
                      onChange={handleRecordChange}
                    />
                  </div>

                  <div className="form-field">
                    <label>Record Version</label>
                    <input
                      value={recordForm.record_version || 1}
                      readOnly
                    />
                  </div>

                  <div className="form-field full">
                    <label>Renewal Notes</label>
                    <textarea
                      name="renewal_notes"
                      value={recordForm.renewal_notes || ""}
                      onChange={handleRecordChange}
                    />
                  </div>
                </>
              )}

              <div className="form-field full">
                <label>Description</label>
                <textarea
                  name="description"
                  value={recordForm.description || ""}
                  onChange={handleRecordChange}
                />
              </div>

              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={recordForm.notes || ""}
                  onChange={handleRecordChange}
                />
              </div>

              <div className="button-row">
                <button className="primary-btn" type="submit">
                  <Save size={20} />
                  {selectedRecord ? "Update Record" : "Save Record"}
                </button>

                <button
                  className="secondary-btn"
                  type="button"
                  onClick={startNewRecord}
                >
                  New Record
                </button>
              </div>
            </div>
          </form>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Record Library</p>
                <h2>Compliance Records</h2>
              </div>
              <ClipboardCheck size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {records.length === 0 && (
                <div className="empty-state">No compliance records found.</div>
              )}

              {records.map((record) => {
                const expired =
                  record.expiration_date &&
                  new Date(record.expiration_date) < new Date();

                return (
                  <div
                    className={`record-card ${
                      expired ? "danger" : expiringRecords.includes(record) ? "warning" : ""
                    }`}
                    key={record.id}
                    onClick={() => {
                      selectRecord(record);
                      setActiveTab("RENEWALS");
                    }}
                  >
                    <strong>{record.title || record.record_type}</strong>
                    <p>
                      {record.issuing_authority || "No authority"} · Expires:{" "}
                      {record.expiration_date || "No expiration"}
                    </p>

                    <div className="chip-row">
                      <span
                        className={`chip ${
                          expired ? "red" : record.status === "ACTIVE" ? "green" : "orange"
                        }`}
                      >
                        {expired ? "Expired" : record.status}
                      </span>
                      <span className="chip">
                        <CalendarDays size={12} />
                        v{record.record_version || 1}
                      </span>
                      {record.is_required && (
                        <span className="chip">
                          <CheckCircle2 size={12} />
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      )}

      {activeTab === "FIRE" && (
        <section className="premium-card">
          <div className="card-header">
            <div>
              <p>Fire Drill Dashboard</p>
              <h2>Fire Drill Records</h2>
            </div>
            <Flame size={32} color="#2563eb" />
          </div>
          <div className="empty-state">
            Fire drill CRUD page connects to facility_fire_drills.
          </div>
        </section>
      )}

      {activeTab === "PEST" && (
        <section className="premium-card">
          <div className="card-header">
            <div>
              <p>Pest Control Dashboard</p>
              <h2>Pest Control Records</h2>
            </div>
            <Bug size={32} color="#2563eb" />
          </div>
          <div className="empty-state">
            Pest control CRUD page connects to facility_pest_control_logs.
          </div>
        </section>
      )}
    </div>
  );
}