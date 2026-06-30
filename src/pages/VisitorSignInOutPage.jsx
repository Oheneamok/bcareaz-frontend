import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  Save,
  RefreshCw,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  PenLine,
  CalendarDays,
  UsersRound,
  CheckCircle2,
  Building2,
  BadgeCheck,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const PURPOSES = [
  "Family Visit",
  "Guardian Visit",
  "Case Manager",
  "Therapist",
  "Medical Provider",
  "Medication Delivery",
  "Maintenance",
  "Inspection",
  "Vendor",
  "Other",
];

const AREAS = [
  "Lobby",
  "Living Room",
  "Dining Area",
  "Resident Room",
  "Office",
  "Outdoor Area",
  "Medication Room",
  "Other",
];

const SCREENING = ["Passed", "Failed", "Not Required"];

export default function VisitorSignInOutPage() {
  const [residents, setResidents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedOpenLog, setSelectedOpenLog] = useState(null);
  const [message, setMessage] = useState("");

  const staffName =
    currentUser?.full_name || currentUser?.name || currentUser?.email || "";

  const [form, setForm] = useState({
    log_type: "SIGN_IN",
    visitor_name: "",
    visitor_phone: "",
    visitor_company: "",
    relationship_to_resident: "",
    resident_id: "",
    resident_name: "",
    log_date: today(),
    log_time: nowTime(),
    purpose: "",
    area_visiting: "",
    temperature: "",
    screening_status: "Passed",
    badge_number: "",
    sign_in_signature: "",
    sign_out_signature: "",
    staff_name: "",
    staff_signature: "",
    notes: "",
    status: "SIGNED_IN",
  });

  async function loadResidents() {
    try {
      const res = await api.get("/residents");
      setResidents(res.data || []);
    } catch {
      setResidents([]);
    }
  }

  async function loadLogs() {
    try {
      const res = await api.get("/facility-compliance/visitor-sign-logs");
      setLogs(res.data || []);
    } catch {
      setLogs([]);
    }
  }

  async function loadCurrentUser() {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data);
      const name = res.data?.full_name || res.data?.name || res.data?.email || "";

      setForm((prev) => ({
        ...prev,
        staff_name: name,
        staff_signature: name,
      }));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadResidents();
    loadLogs();
    loadCurrentUser();
  }, []);

  const signedInVisitors = useMemo(() => {
    return logs.filter((log) => log.status === "SIGNED_IN");
  }, [logs]);

  const signedOutToday = useMemo(() => {
    return logs.filter(
      (log) =>
        log.status === "SIGNED_OUT" &&
        (log.log_date === today() || log.created_at?.startsWith(today()))
    );
  }, [logs]);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "resident_id") {
      const resident = residents.find((r) => String(r.id) === String(value));
      setForm((prev) => ({
        ...prev,
        resident_id: value,
        resident_name: resident?.full_name || resident?.name || "",
      }));
      return;
    }

    if (name === "log_type") {
      setSelectedOpenLog(null);
      setForm((prev) => ({
        ...prev,
        log_type: value,
        log_date: today(),
        log_time: nowTime(),
        status: value === "SIGN_OUT" ? "SIGNED_OUT" : "SIGNED_IN",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function selectOpenLog(log) {
    setSelectedOpenLog(log);

    setForm((prev) => ({
      ...prev,
      log_type: "SIGN_OUT",
      visitor_name: log.visitor_name || "",
      visitor_phone: log.visitor_phone || "",
      visitor_company: log.visitor_company || "",
      relationship_to_resident: log.relationship_to_resident || "",
      resident_id: log.resident_id || "",
      resident_name: log.resident_name || "",
      log_date: today(),
      log_time: nowTime(),
      purpose: log.purpose || "",
      area_visiting: log.area_visiting || "",
      temperature: log.temperature || "",
      screening_status: log.screening_status || "Passed",
      badge_number: log.badge_number || "",
      sign_in_signature: log.sign_in_signature || "",
      sign_out_signature: "",
      staff_name: staffName,
      staff_signature: staffName,
      notes: log.notes || "",
      status: "SIGNED_OUT",
    }));
  }

  async function submitLog(e) {
    e.preventDefault();

    const payload = {
      ...form,
      staff_name: form.staff_name || staffName,
      staff_signature: form.staff_signature || staffName,
      status: form.log_type === "SIGN_OUT" ? "SIGNED_OUT" : "SIGNED_IN",
    };

    try {
      if (form.log_type === "SIGN_OUT") {
        if (!selectedOpenLog?.id) {
          setMessage("Please select a signed-in visitor before signing out.");
          return;
        }

        await api.patch(
          `/facility-compliance/visitor-sign-logs/${selectedOpenLog.id}`,
          payload
        );
      } else {
        await api.post("/facility-compliance/visitor-sign-logs", payload);
      }

      setMessage(
        form.log_type === "SIGN_OUT"
          ? "Visitor signed out successfully."
          : "Visitor signed in successfully."
      );

      setSelectedOpenLog(null);

      setForm({
        log_type: "SIGN_IN",
        visitor_name: "",
        visitor_phone: "",
        visitor_company: "",
        relationship_to_resident: "",
        resident_id: "",
        resident_name: "",
        log_date: today(),
        log_time: nowTime(),
        purpose: "",
        area_visiting: "",
        temperature: "",
        screening_status: "Passed",
        badge_number: "",
        sign_in_signature: "",
        sign_out_signature: "",
        staff_name: staffName,
        staff_signature: staffName,
        notes: "",
        status: "SIGNED_IN",
      });

      loadLogs();
    } catch (err) {
      console.error(err);
      setMessage("Could not save visitor log.");
    }
  }

  return (
    <div className="visitor-page">
      <style>{`
        .visitor-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .visitor-hero {
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
            linear-gradient(
              90deg,
              rgba(5,18,44,.98) 0%,
              rgba(30,64,175,.92) 45%,
              rgba(14,165,233,.34) 75%,
              rgba(14,165,233,.16) 100%
            ),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
        }

        .visitor-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(5,18,44,.14), rgba(5,18,44,.04)),
            radial-gradient(circle at 72% 45%, rgba(125,211,252,.22), transparent 34%);
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

        .visitor-hero h1 {
          margin: 0;
          max-width: 760px;
          font-size: clamp(46px, 5.3vw, 76px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .visitor-hero p {
          max-width: 800px;
          margin: 20px 0 0;
          color: rgba(255,255,255,.9);
          font-size: 18px;
          line-height: 1.65;
          font-weight: 650;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .hero-pill {
          min-height: 42px;
          border-radius: 999px;
          padding: 0 15px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.22);
          color: rgba(255,255,255,.88);
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
          backdrop-filter: blur(12px);
        }

        .hero-metrics {
          width: 330px;
          display: grid;
          gap: 12px;
        }

        .metric-card {
          border-radius: 18px;
          padding: 18px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.25);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 42px rgba(0,0,0,.18);
        }

        .metric-card strong {
          display: block;
          font-size: 38px;
          line-height: 1;
          letter-spacing: -.06em;
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

        .visitor-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(380px, .85fr);
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

        .form-field input[readonly] {
          background: #f8fafc;
          color: #475569;
          cursor: not-allowed;
        }

        .form-field textarea {
          min-height: 130px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.55;
        }

        .action-row {
          grid-column: span 2;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .action-card {
          min-height: 82px;
          border: 1px solid #dbeafe;
          border-radius: 18px;
          background: linear-gradient(135deg, white, #f8fbff);
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          cursor: pointer;
          color: #334155;
          font-weight: 950;
          box-shadow: 0 10px 24px rgba(15,23,42,.07);
        }

        .action-card.active {
          border-color: #2563eb;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          color: #1d4ed8;
        }

        .action-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
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

        .right-stack {
          display: grid;
          gap: 24px;
        }

        .visitor-list,
        .history-list {
          display: grid;
          gap: 14px;
        }

        .visitor-card,
        .history-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 16px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .visitor-card {
          cursor: pointer;
        }

        .visitor-card strong,
        .history-card strong {
          display: block;
          font-size: 17px;
          color: #071735;
        }

        .visitor-card p,
        .history-card p {
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

        .chip.green {
          background: #ecfdf5;
          color: #047857;
        }

        .chip.orange {
          background: #fffbeb;
          color: #b45309;
        }

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
          .visitor-grid {
            grid-template-columns: 1fr;
          }

          .visitor-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-metrics {
            width: 100%;
          }
        }

        @media (max-width: 820px) {
          .visitor-page {
            padding: 14px;
          }

          .form-grid,
          .action-row {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .button-row,
          .action-row {
            grid-column: span 1;
          }

          .visitor-hero {
            min-height: auto;
            padding: 28px;
          }

          .visitor-hero h1 {
            font-size: 42px;
          }
        }
      `}</style>

      <section className="visitor-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <ClipboardCheck size={18} />
            Facility Compliance
          </p>

          <h1>
            Visitor Sign In
            <br />
            Sign Out
          </h1>

          <p>
            Track visitors, resident visits, screening, badges, staff
            verification, signatures, and visitor status for inspection-ready
            facility compliance.
          </p>

          <div className="hero-actions">
            <span className="hero-pill">
              <ShieldCheck size={15} />
              Inspection Ready
            </span>
            <span className="hero-pill">
              <BadgeCheck size={15} />
              Visitor Badge
            </span>
            <span className="hero-pill">
              <PenLine size={15} />
              Auto Staff Signature
            </span>
          </div>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{signedInVisitors.length}</strong>
            <span>Currently Signed In</span>
          </div>
          <div className="metric-card">
            <strong>{signedOutToday.length}</strong>
            <span>Signed Out Today</span>
          </div>
          <div className="metric-card">
            <strong>{logs.length}</strong>
            <span>Total Visitor Logs</span>
          </div>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <section className="visitor-grid">
        <form className="premium-card" onSubmit={submitLog}>
          <div className="card-header">
            <div>
              <p>New Entry</p>
              <h2>Visitor Movement Log</h2>
            </div>
            <Building2 size={32} color="#2563eb" />
          </div>

          <div className="form-grid">
            <div className="action-row">
              <button
                type="button"
                className={`action-card ${
                  form.log_type === "SIGN_IN" ? "active" : ""
                }`}
                onClick={() =>
                  handleChange({
                    target: { name: "log_type", value: "SIGN_IN" },
                  })
                }
              >
                <span className="action-icon">
                  <UserCheck size={22} />
                </span>
                Sign In
              </button>

              <button
                type="button"
                className={`action-card ${
                  form.log_type === "SIGN_OUT" ? "active" : ""
                }`}
                onClick={() =>
                  handleChange({
                    target: { name: "log_type", value: "SIGN_OUT" },
                  })
                }
              >
                <span className="action-icon">
                  <UserX size={22} />
                </span>
                Sign Out
              </button>
            </div>

            <div className="form-field">
              <label>Visitor Name</label>
              <input
                name="visitor_name"
                value={form.visitor_name}
                onChange={handleChange}
                readOnly={form.log_type === "SIGN_OUT"}
                required
              />
            </div>

            <div className="form-field">
              <label>Visitor Phone</label>
              <input
                name="visitor_phone"
                value={form.visitor_phone}
                onChange={handleChange}
                readOnly={form.log_type === "SIGN_OUT"}
              />
            </div>

            <div className="form-field">
              <label>Company / Agency</label>
              <input
                name="visitor_company"
                value={form.visitor_company}
                onChange={handleChange}
                readOnly={form.log_type === "SIGN_OUT"}
              />
            </div>

            <div className="form-field">
              <label>Relationship</label>
              <input
                name="relationship_to_resident"
                value={form.relationship_to_resident}
                onChange={handleChange}
                readOnly={form.log_type === "SIGN_OUT"}
                placeholder="Family, guardian, provider..."
              />
            </div>

            <div className="form-field full">
              <label>Resident Visiting</label>
              <select
                name="resident_id"
                value={form.resident_id}
                onChange={handleChange}
                disabled={form.log_type === "SIGN_OUT"}
              >
                <option value="">No specific resident / Facility visit</option>
                {residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.full_name || resident.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                name="log_date"
                value={form.log_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Time</label>
              <input
                type="time"
                name="log_time"
                value={form.log_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Purpose</label>
              <select
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                disabled={form.log_type === "SIGN_OUT"}
              >
                <option value="">Select Purpose</option>
                {PURPOSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Area Visiting</label>
              <select
                name="area_visiting"
                value={form.area_visiting}
                onChange={handleChange}
                disabled={form.log_type === "SIGN_OUT"}
              >
                <option value="">Select Area</option>
                {AREAS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Temperature</label>
              <input
                name="temperature"
                value={form.temperature}
                onChange={handleChange}
                disabled={form.log_type === "SIGN_OUT"}
                placeholder="Optional"
              />
            </div>

            <div className="form-field">
              <label>Screening Status</label>
              <select
                name="screening_status"
                value={form.screening_status}
                onChange={handleChange}
                disabled={form.log_type === "SIGN_OUT"}
              >
                {SCREENING.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Badge Number</label>
              <input
                name="badge_number"
                value={form.badge_number}
                onChange={handleChange}
                disabled={form.log_type === "SIGN_OUT"}
              />
            </div>

            {form.log_type === "SIGN_IN" ? (
              <div className="form-field">
                <label>Visitor Sign-In Signature</label>
                <input
                  name="sign_in_signature"
                  value={form.sign_in_signature}
                  onChange={handleChange}
                  placeholder="Visitor typed signature"
                />
              </div>
            ) : (
              <div className="form-field">
                <label>Visitor Sign-Out Signature</label>
                <input
                  name="sign_out_signature"
                  value={form.sign_out_signature}
                  onChange={handleChange}
                  placeholder="Visitor typed signature"
                  required
                />
              </div>
            )}

            <div className="form-field full">
              <label>Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Document visit notes, screening issues, concerns, or follow-up actions..."
              />
            </div>

            <div className="form-field">
              <label>Staff Name</label>
              <input value={form.staff_name || staffName} readOnly />
            </div>

            <div className="form-field">
              <label>Staff Signature</label>
              <input value={form.staff_signature || staffName} readOnly />
            </div>

            <div className="button-row">
              <button className="primary-btn" type="submit">
                <Save size={20} />
                Save Visitor Entry
              </button>

              <button className="secondary-btn" type="button" onClick={loadLogs}>
                <RefreshCw size={20} />
                Refresh Logs
              </button>
            </div>
          </div>
        </form>

        <div className="right-stack">
          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Live Status</p>
                <h2>Signed In Visitors</h2>
              </div>
              <UsersRound size={32} color="#2563eb" />
            </div>

            <div className="visitor-list">
              {signedInVisitors.length === 0 && (
                <div className="empty-state">No visitors currently signed in.</div>
              )}

              {signedInVisitors.map((log) => (
                <div
                  className="visitor-card"
                  key={log.id}
                  onClick={() => selectOpenLog(log)}
                >
                  <strong>{log.visitor_name}</strong>
                  <p>{log.purpose || "Purpose not recorded"}</p>
                  <p>
                    Visiting: {log.resident_name || "Facility"} · Badge:{" "}
                    {log.badge_number || "-"}
                  </p>

                  <div className="chip-row">
                    <span className="chip orange">
                      <Clock size={12} />
                      Signed In
                    </span>
                    <span className="chip">{log.log_time || "-"}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>History</p>
                <h2>Recent Visitor Logs</h2>
              </div>
              <CalendarDays size={32} color="#2563eb" />
            </div>

            <div className="history-list">
              {logs.length === 0 && (
                <div className="empty-state">No visitor logs found.</div>
              )}

              {logs.slice(0, 12).map((log) => (
                <div className="history-card" key={log.id}>
                  <strong>{log.visitor_name}</strong>
                  <p>
                    {log.purpose || "No purpose"} ·{" "}
                    {log.resident_name || "Facility"} · {log.log_date}{" "}
                    {log.log_time || ""}
                  </p>

                  <div className="chip-row">
                    <span
                      className={`chip ${
                        log.status === "SIGNED_OUT" ? "green" : "orange"
                      }`}
                    >
                      {log.status === "SIGNED_OUT"
                        ? "Signed Out"
                        : "Signed In"}
                    </span>

                    {log.staff_name && (
                      <span className="chip">
                        <PenLine size={12} />
                        {log.staff_name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}