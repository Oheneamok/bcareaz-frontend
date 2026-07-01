import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  HeartPulse,
  MapPin,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);
const nowLocal = () => new Date().toISOString().slice(0, 16);

const emptyForm = {
  resident_id: "",
  check_datetime: nowLocal(),
  check_date: today(),
  hour_slot: "",
  shift: "DAY",
  location: "",
  activity: "",
  behavior: "",
  mood: "",
  appearance: "",
  supervision_level: "Hourly",
  safety_status: "Safe",
  sleeping: false,
  meal_taken: false,
  hydration: false,
  visitor_present: false,
  medication_due: false,
  medication_taken: false,
  pain_level: "",
  fall_risk: false,
  elopement_risk: false,
  suicide_risk: false,
  aggressive_behavior: false,
  incident_observed: false,
  notes: "",
  status: "COMPLETED",
};

const ACTIVITIES = [
  "Sleeping",
  "Watching TV",
  "Reading",
  "Group Therapy",
  "Individual Therapy",
  "Medication Pass",
  "Eating Breakfast",
  "Eating Lunch",
  "Eating Dinner",
  "Snack",
  "Walking",
  "Exercise",
  "Laundry",
  "Housekeeping",
  "Cooking",
  "Phone Call",
  "Family Visit",
  "Personal Hygiene",
  "Community Outing",
  "Medical Appointment",
  "Psychiatry Appointment",
  "Case Management",
  "BHP Session",
  "Socializing",
  "Resting",
  "Other",
];

const MOODS = [
  "Calm",
  "Happy",
  "Cooperative",
  "Pleasant",
  "Anxious",
  "Depressed",
  "Agitated",
  "Withdrawn",
  "Irritable",
  "Confused",
  "Angry",
  "Tearful",
];

const BEHAVIORS = [
  "Appropriate",
  "Redirectable",
  "Restless",
  "Aggressive",
  "Verbally Aggressive",
  "Physically Aggressive",
  "Self Isolating",
  "Participating",
  "Sleeping",
  "Pacing",
  "Hallucinating",
  "Delusional",
  "Other",
];

const SAFETY = [
  "Safe",
  "Needs Monitoring",
  "High Risk",
  "One-to-One",
  "AWOL Risk",
  "Fall Risk",
  "Suicide Precautions",
  "Medical Concern",
];

export default function ResidentHourlyLogsPage() {
  const [residents, setResidents] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());
  const [logs, setLogs] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  async function loadResidents() {
    try {
      const res = await api.get("/residents");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.data || [];
      setResidents(list);
    } catch (err) {
      console.error(err);
      setResidents([]);
    }
  }

  async function loadLogs() {
    try {
      const params = new URLSearchParams();
      params.set("check_date", selectedDate);
      if (selectedResidentId) params.set("resident_id", selectedResidentId);

      const [logsRes, dashRes] = await Promise.all([
        api.get(`/resident-hourly-logs?${params.toString()}`),
        api.get(`/resident-hourly-logs/dashboard?${params.toString()}`),
      ]);

      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      setDashboard(dashRes.data);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Could not load hourly logs.");
    }
  }

  useEffect(() => {
    loadResidents();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [selectedResidentId, selectedDate]);

  const selectedResident = useMemo(
    () => residents.find((r) => String(r.id) === String(selectedResidentId)),
    [residents, selectedResidentId]
  );

  function residentName(resident) {
    if (!resident) return "Resident";
    return [resident.first_name, resident.middle_name, resident.last_name]
      .filter(Boolean)
      .join(" ");
  }

  function getResidentName(id) {
    return residentName(residents.find((r) => String(r.id) === String(id)));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      check_date: name === "check_datetime" ? value.slice(0, 10) : prev.check_date,
    }));
  }

  async function submitLog(e) {
    e.preventDefault();

    if (!form.resident_id && !selectedResidentId) {
      setMessage("Please select a resident.");
      return;
    }

    const payload = {
      ...form,
      resident_id: form.resident_id || selectedResidentId,
      check_date: form.check_datetime?.slice(0, 10) || selectedDate,
      hour_slot:
        form.hour_slot ||
        new Date(form.check_datetime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      pain_level: form.pain_level === "" ? null : Number(form.pain_level),
    };

    try {
      await api.post("/resident-hourly-logs", payload);
      setMessage("Hourly resident check saved.");
      setForm({
        ...emptyForm,
        resident_id: selectedResidentId,
        check_date: selectedDate,
        check_datetime: nowLocal(),
      });
      loadLogs();
    } catch (err) {
      console.error(err);
      setMessage("Could not save hourly check.");
    }
  }

  return (
    <div className="hourly-page">
      <style>{`
        .hourly-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .hourly-hero {
          min-height: 360px;
          border-radius: 28px;
          padding: 42px;
          margin-bottom: 22px;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          background:
            linear-gradient(90deg, rgba(5,18,44,.98), rgba(30,64,175,.92), rgba(14,165,233,.25)),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
        }

        .hourly-hero > * { position: relative; z-index: 2; }

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

        .hourly-hero h1 {
          margin: 0;
          font-size: clamp(44px, 5vw, 72px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .hourly-hero p {
          max-width: 760px;
          margin: 20px 0 0;
          color: rgba(255,255,255,.9);
          font-size: 18px;
          line-height: 1.65;
          font-weight: 650;
        }

        .hero-metrics {
          width: 350px;
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

        .filter-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
          border-radius: 22px;
          padding: 18px;
          background: white;
          border: 1px solid #dbeafe;
          box-shadow: 0 18px 44px rgba(15,23,42,.11);
        }

        .filter-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .filter-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #2563eb, #06b6d4);
        }

        .filter-title {
          margin: 0;
          font-size: 18px;
          font-weight: 950;
        }

        .filter-subtitle {
          margin: 4px 0 0;
          color: #64748b;
          font-weight: 850;
          font-size: 13px;
        }

        .filter-controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .filter-controls select,
        .filter-controls input {
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid #bfdbfe;
          background: white;
          padding: 0 14px;
          font-weight: 900;
          color: #071735;
        }

        .page-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(420px, .95fr);
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
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
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
          min-height: 56px;
          border: 1px solid #cfe0f7;
          border-radius: 15px;
          padding: 0 16px;
          background: white;
          color: #071735;
          font-size: 15px;
          font-weight: 800;
          outline: none;
        }

        .form-field textarea {
          min-height: 120px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.55;
        }

        .check-grid {
          grid-column: span 2;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          padding: 16px;
          border-radius: 18px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .check-tile {
          min-height: 46px;
          border-radius: 14px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          gap: 9px;
          background: white;
          border: 1px solid #dbeafe;
          font-weight: 900;
          color: #334155;
        }

        .primary-btn,
        .secondary-btn {
          min-height: 60px;
          border-radius: 16px;
          padding: 0 24px;
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

        .button-row {
          grid-column: span 2;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .timeline {
          display: grid;
          gap: 14px;
        }

        .timeline-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 18px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .timeline-card.risk {
          border-left-color: #dc2626;
        }

        .timeline-card strong {
          display: block;
          font-size: 17px;
          color: #071735;
        }

        .timeline-card p {
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
        .chip.red { background: #fef2f2; color: #dc2626; }
        .chip.orange { background: #fffbeb; color: #b45309; }

        .empty-state {
          min-height: 150px;
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
          .page-grid { grid-template-columns: 1fr; }
          .hourly-hero { flex-direction: column; align-items: flex-start; }
          .hero-metrics { width: 100%; }
          .filter-card { flex-direction: column; align-items: stretch; }
          .filter-controls { width: 100%; flex-wrap: wrap; }
        }

        @media (max-width: 820px) {
          .hourly-page { padding: 14px; }
          .form-grid, .check-grid { grid-template-columns: 1fr; }
          .form-field.full, .button-row, .check-grid { grid-column: span 1; }
          .hourly-hero { min-height: auto; padding: 28px; }
          .hourly-hero h1 { font-size: 42px; }
        }
      `}</style>

      <section className="hourly-hero">
        <div>
          <p className="hero-kicker">
            <Activity size={18} />
            ResidentCare Command Center
          </p>
          <h1>
            Hourly
            <br />
            Checks
          </h1>
          <p>
            Document resident wellness checks, safety observations, activities,
            mood, behavior, location, and risk status throughout the day.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{dashboard?.total_checks ?? 0}</strong>
            <span>Total Checks</span>
          </div>
          <div className="metric-card">
            <strong>{dashboard?.incidents ?? 0}</strong>
            <span>Incidents</span>
          </div>
          <div className="metric-card">
            <strong>{dashboard?.high_risk ?? 0}</strong>
            <span>High Risk</span>
          </div>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <div className="filter-card">
        <div className="filter-left">
          <div className="filter-icon">
            <Search size={24} />
          </div>
          <div>
            <p className="filter-title">
              {selectedResident ? residentName(selectedResident) : "All Residents"}
            </p>
            <p className="filter-subtitle">
              Select resident and date to view hourly wellness timeline.
            </p>
          </div>
        </div>

        <div className="filter-controls">
          <select
            value={selectedResidentId}
            onChange={(e) => {
              setSelectedResidentId(e.target.value);
              setForm((prev) => ({ ...prev, resident_id: e.target.value }));
            }}
          >
            <option value="">All Residents</option>
            {residents.map((resident) => (
              <option key={resident.id} value={resident.id}>
                {residentName(resident)}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <button className="secondary-btn" type="button" onClick={loadLogs}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <section className="page-grid">
        <form className="premium-card" onSubmit={submitLog}>
          <div className="card-header">
            <div>
              <p>New Hourly Check</p>
              <h2>Resident Wellness Log</h2>
            </div>
            <UserCheck size={32} color="#2563eb" />
          </div>

          <div className="form-grid">
            <div className="form-field full">
              <label>Resident</label>
              <select name="resident_id" value={form.resident_id} onChange={handleChange} required>
                <option value="">Select Resident</option>
                {residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {residentName(resident)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Check Date/Time</label>
              <input
                type="datetime-local"
                name="check_datetime"
                value={form.check_datetime}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Shift</label>
              <select name="shift" value={form.shift} onChange={handleChange}>
                <option value="DAY">Day</option>
                <option value="EVENING">Evening</option>
                <option value="OVERNIGHT">Overnight</option>
              </select>
            </div>

            <div className="form-field">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label>Activity</label>
              <select name="activity" value={form.activity} onChange={handleChange}>
                <option value="">Select</option>
                {ACTIVITIES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Mood</label>
              <select name="mood" value={form.mood} onChange={handleChange}>
                <option value="">Select</option>
                {MOODS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Behavior</label>
              <select name="behavior" value={form.behavior} onChange={handleChange}>
                <option value="">Select</option>
                {BEHAVIORS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Safety Status</label>
              <select name="safety_status" value={form.safety_status} onChange={handleChange}>
                {SAFETY.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Supervision Level</label>
              <select name="supervision_level" value={form.supervision_level} onChange={handleChange}>
                <option>Independent</option>
                <option>Visual Check</option>
                <option>15 Minute Check</option>
                <option>30 Minute Check</option>
                <option>Hourly</option>
                <option>One-to-One</option>
                <option>Line of Sight</option>
              </select>
            </div>

            <div className="check-grid">
              {[
                ["sleeping", "Sleeping"],
                ["meal_taken", "Meal Taken"],
                ["hydration", "Hydration"],
                ["visitor_present", "Visitor Present"],
                ["medication_due", "Medication Due"],
                ["medication_taken", "Medication Taken"],
                ["fall_risk", "Fall Risk"],
                ["elopement_risk", "Elopement Risk"],
                ["suicide_risk", "Suicide Risk"],
                ["aggressive_behavior", "Aggressive Behavior"],
                ["incident_observed", "Incident Observed"],
              ].map(([name, label]) => (
                <label className="check-tile" key={name}>
                  <input
                    type="checkbox"
                    name={name}
                    checked={Boolean(form[name])}
                    onChange={handleChange}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="form-field">
              <label>Pain Level</label>
              <input
                type="number"
                min="0"
                max="10"
                name="pain_level"
                value={form.pain_level}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="COMPLETED">Completed</option>
                <option value="OPEN">Open</option>
                <option value="NEEDS_FOLLOW_UP">Needs Follow Up</option>
              </select>
            </div>

            <div className="form-field full">
              <label>Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>

            <div className="button-row">
              <button className="primary-btn" type="submit">
                <Save size={20} />
                Save Hourly Check
              </button>
            </div>
          </div>
        </form>

        <aside className="premium-card">
          <div className="card-header">
            <div>
              <p>Timeline</p>
              <h2>Hourly Activity History</h2>
            </div>
            <Clock size={32} color="#2563eb" />
          </div>

          <div className="timeline">
            {logs.length === 0 && (
              <div className="empty-state">No hourly checks found.</div>
            )}

            {logs.map((log) => {
              const risk =
                log.incident_observed ||
                log.fall_risk ||
                log.elopement_risk ||
                log.suicide_risk ||
                log.aggressive_behavior ||
                log.safety_status === "High Risk";

              return (
                <div className={`timeline-card ${risk ? "risk" : ""}`} key={log.id}>
                  <strong>
                    {log.hour_slot || log.check_datetime} · {log.activity || "Activity"}
                  </strong>
                  <p>
                    {getResidentName(log.resident_id)} · {log.location || "No location"}
                  </p>
                  <p>{log.notes || "No additional notes."}</p>

                  <div className="chip-row">
                    <span className={`chip ${risk ? "red" : "green"}`}>
                      {risk ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                      {log.safety_status || "Safe"}
                    </span>
                    <span className="chip">
                      <Eye size={12} />
                      {log.supervision_level || "Supervision"}
                    </span>
                    <span className="chip">
                      <HeartPulse size={12} />
                      {log.mood || "Mood"}
                    </span>
                    <span className="chip">
                      <MapPin size={12} />
                      {log.location || "Location"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
}