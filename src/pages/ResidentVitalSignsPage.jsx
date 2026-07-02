import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Stethoscope,
  Thermometer,
  Droplets,
  Scale,
  FileText,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const emptyForm = {
  resident_id: "",
  vital_date: today(),
  vital_time: nowTime(),
  temperature: "",
  temperature_unit: "F",
  blood_pressure_systolic: "",
  blood_pressure_diastolic: "",
  pulse: "",
  respiration: "",
  oxygen_saturation: "",
  blood_glucose: "",
  weight: "",
  height: "",
  pain_level: "",
  position: "Sitting",
  location: "Facility",
  notes: "",
  status: "RECORDED",
  metadata_json: {},
};

export default function ResidentVitalSignsPage() {
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

  async function loadVitals() {
    try {
      const params = new URLSearchParams();
      if (selectedResidentId) params.set("resident_id", selectedResidentId);
      if (selectedDate) params.set("vital_date", selectedDate);

      const [listRes, dashRes] = await Promise.all([
        api.get(`/resident-care/vital-signs?${params.toString()}`),
        api.get(
          `/resident-care/vital-signs/dashboard${
            selectedResidentId ? `?resident_id=${selectedResidentId}` : ""
          }`
        ),
      ]);

      setLogs(Array.isArray(listRes.data) ? listRes.data : []);
      setDashboard(dashRes.data || null);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Could not load vital signs.");
    }
  }

  useEffect(() => {
    loadResidents();
  }, []);

  useEffect(() => {
    loadVitals();
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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function isAbnormal(v) {
    const temp = Number(v.temperature);
    const sys = Number(v.blood_pressure_systolic);
    const dia = Number(v.blood_pressure_diastolic);
    const pulse = Number(v.pulse);
    const oxygen = Number(v.oxygen_saturation);
    const glucose = Number(v.blood_glucose);

    return (
      temp >= 100.4 ||
      sys >= 140 ||
      dia >= 90 ||
      pulse >= 120 ||
      pulse < 50 ||
      oxygen < 92 ||
      glucose >= 250 ||
      glucose < 70
    );
  }

  async function submitVitals(e) {
    e.preventDefault();

    if (!selectedResidentId && !form.resident_id) {
      setMessage("Please select a resident.");
      return;
    }

    const payload = {
      ...form,
      resident_id: form.resident_id || selectedResidentId,
      vital_date: form.vital_date || today(),
      temperature: form.temperature === "" ? null : Number(form.temperature),
      blood_pressure_systolic:
        form.blood_pressure_systolic === ""
          ? null
          : Number(form.blood_pressure_systolic),
      blood_pressure_diastolic:
        form.blood_pressure_diastolic === ""
          ? null
          : Number(form.blood_pressure_diastolic),
      pulse: form.pulse === "" ? null : Number(form.pulse),
      respiration: form.respiration === "" ? null : Number(form.respiration),
      oxygen_saturation:
        form.oxygen_saturation === "" ? null : Number(form.oxygen_saturation),
      blood_glucose:
        form.blood_glucose === "" ? null : Number(form.blood_glucose),
      weight: form.weight === "" ? null : Number(form.weight),
      pain_level: form.pain_level === "" ? null : Number(form.pain_level),
    };

    try {
      await api.post("/resident-care/vital-signs", payload);
      setMessage("Vital signs recorded successfully.");
      setForm({
        ...emptyForm,
        resident_id: selectedResidentId,
        vital_date: selectedDate,
        vital_time: nowTime(),
      });
      loadVitals();
    } catch (err) {
      console.error(err);
      setMessage("Could not save vital signs.");
    }
  }

  function bpText(item) {
    if (!item.blood_pressure_systolic && !item.blood_pressure_diastolic) return "—";
    return `${item.blood_pressure_systolic || ""}/${item.blood_pressure_diastolic || ""}`;
  }

  return (
    <div className="vitals-page">
      <style>{`
        .vitals-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .vitals-hero {
          min-height: 360px;
          border-radius: 28px;
          padding: 42px;
          margin-bottom: 22px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          background:
            linear-gradient(90deg, rgba(5,18,44,.98), rgba(15,118,110,.92), rgba(14,165,233,.25)),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 14px;
          color: #a7f3d0;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .vitals-hero h1 {
          margin: 0;
          font-size: clamp(44px, 5vw, 72px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .vitals-hero p {
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
          color: #d1fae5;
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
          background: linear-gradient(135deg, #059669, #06b6d4);
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
          flex-wrap: wrap;
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
          grid-template-columns: minmax(0, 1.05fr) minmax(430px, .95fr);
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
          background: linear-gradient(90deg, #059669, #06b6d4, #2563eb);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        .card-header p {
          margin: 0 0 9px;
          color: #059669;
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

        .vital-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .vital-card {
          border-radius: 20px;
          padding: 18px;
          background: white;
          border: 1px solid #dbeafe;
          box-shadow: 0 14px 34px rgba(15,23,42,.08);
        }

        .vital-card strong {
          display: block;
          font-size: 28px;
          font-weight: 950;
          color: #071735;
        }

        .vital-card span {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 8px;
          color: #64748b;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
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

        .bp-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .button-row {
          grid-column: span 2;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .primary-btn,
        .secondary-btn {
          min-height: 58px;
          border-radius: 16px;
          padding: 0 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
        }

        .primary-btn {
          border: 0;
          color: white;
          background: linear-gradient(135deg, #059669, #0f766e);
        }

        .secondary-btn {
          color: #071735;
          background: white;
          border: 1px solid #cfe0f7;
        }

        .history-list {
          display: grid;
          gap: 14px;
        }

        .history-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #059669;
          border-radius: 18px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .history-card.abnormal {
          border-left-color: #dc2626;
          background: linear-gradient(180deg, #ffffff, #fff7f7);
        }

        .history-card strong {
          display: block;
          font-size: 17px;
          color: #071735;
        }

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

        .chip.red {
          background: #fef2f2;
          color: #dc2626;
        }

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
          .vitals-hero,
          .filter-card {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-metrics {
            width: 100%;
          }

          .page-grid,
          .vital-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .vitals-page {
            padding: 14px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .button-row {
            grid-column: span 1;
          }

          .vitals-hero {
            min-height: auto;
            padding: 28px;
          }

          .vitals-hero h1 {
            font-size: 42px;
          }
        }
      `}</style>

      <section className="vitals-hero">
        <div>
          <p className="hero-kicker">
            <Stethoscope size={18} />
            ResidentCare Nursing
          </p>

          <h1>
            Vital Signs
            <br />
            Logging
          </h1>

          <p>
            Record resident temperature, blood pressure, pulse, respiration,
            oxygen saturation, blood glucose, weight, pain level, and nursing
            observations with automatic abnormal value alerts.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{dashboard?.total_records ?? 0}</strong>
            <span>Total Records</span>
          </div>
          <div className="metric-card">
            <strong>{dashboard?.today ?? 0}</strong>
            <span>Today</span>
          </div>
          <div className="metric-card">
            <strong>{dashboard?.fever ?? 0}</strong>
            <span>Fever Alerts</span>
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
              Select resident and date to view vital sign history.
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
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setForm((prev) => ({ ...prev, vital_date: e.target.value }));
            }}
          />

          <button className="secondary-btn" type="button" onClick={loadVitals}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <section className="vital-grid">
        <div className="vital-card">
          <strong>{dashboard?.high_bp ?? 0}</strong>
          <span>
            <HeartPulse size={14} />
            High BP
          </span>
        </div>

        <div className="vital-card">
          <strong>{dashboard?.fever ?? 0}</strong>
          <span>
            <Thermometer size={14} />
            Fever
          </span>
        </div>

        <div className="vital-card">
          <strong>{logs.length}</strong>
          <span>
            <Activity size={14} />
            Displayed
          </span>
        </div>

        <div className="vital-card">
          <strong>{logs.filter(isAbnormal).length}</strong>
          <span>
            <AlertTriangle size={14} />
            Abnormal
          </span>
        </div>
      </section>

      <section className="page-grid">
        <form className="premium-card" onSubmit={submitVitals}>
          <div className="card-header">
            <div>
              <p>New Vital Entry</p>
              <h2>Resident Vital Signs</h2>
            </div>
            <PlusCircle size={32} color="#059669" />
          </div>

          <div className="form-grid">
            <div className="form-field full">
              <label>Resident</label>
              <select
                name="resident_id"
                value={form.resident_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Resident</option>
                {residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {residentName(resident)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                name="vital_date"
                value={form.vital_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Time</label>
              <input
                type="time"
                name="vital_time"
                value={form.vital_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Temperature</label>
              <input
                type="number"
                step="0.1"
                name="temperature"
                value={form.temperature}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Temperature Unit</label>
              <select
                name="temperature_unit"
                value={form.temperature_unit}
                onChange={handleChange}
              >
                <option value="F">Fahrenheit</option>
                <option value="C">Celsius</option>
              </select>
            </div>

            <div className="form-field full">
              <label>Blood Pressure</label>
              <div className="bp-row">
                <input
                  type="number"
                  name="blood_pressure_systolic"
                  placeholder="Systolic"
                  value={form.blood_pressure_systolic}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="blood_pressure_diastolic"
                  placeholder="Diastolic"
                  value={form.blood_pressure_diastolic}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Pulse</label>
              <input
                type="number"
                name="pulse"
                value={form.pulse}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Respiration</label>
              <input
                type="number"
                name="respiration"
                value={form.respiration}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Oxygen Saturation</label>
              <input
                type="number"
                name="oxygen_saturation"
                value={form.oxygen_saturation}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Blood Glucose</label>
              <input
                type="number"
                name="blood_glucose"
                value={form.blood_glucose}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Weight</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={form.weight}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Height</label>
              <input
                name="height"
                value={form.height}
                onChange={handleChange}
              />
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
              <label>Position</label>
              <select name="position" value={form.position} onChange={handleChange}>
                <option>Sitting</option>
                <option>Standing</option>
                <option>Lying</option>
                <option>Ambulating</option>
              </select>
            </div>

            <div className="form-field">
              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="RECORDED">Recorded</option>
                <option value="REVIEW_NEEDED">Review Needed</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-field full">
              <label>Nursing Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Resident presentation, interventions, notifications, or follow-up needed..."
              />
            </div>

            <div className="button-row">
              <button className="primary-btn" type="submit">
                <Save size={18} />
                Save Vital Signs
              </button>

              <button className="secondary-btn" type="button" onClick={loadVitals}>
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>
        </form>

        <aside className="premium-card">
          <div className="card-header">
            <div>
              <p>History</p>
              <h2>Vital Sign History</h2>
            </div>
            <FileText size={32} color="#059669" />
          </div>

          <div className="history-list">
            {logs.length === 0 && (
              <div className="empty-state">No vital signs found.</div>
            )}

            {logs.map((item) => {
              const abnormal = isAbnormal(item);

              return (
                <article
                  className={`history-card ${abnormal ? "abnormal" : ""}`}
                  key={item.id}
                >
                  <strong>
                    {item.vital_date} {item.vital_time || ""}
                  </strong>

                  <p>
                    BP {bpText(item)} · Temp {item.temperature || "—"}
                    {item.temperature_unit || "F"} · Pulse {item.pulse || "—"} ·
                    O2 {item.oxygen_saturation || "—"}%
                  </p>

                  <p>{item.notes || "No nursing notes."}</p>

                  <div className="chip-row">
                    <span className={`chip ${abnormal ? "red" : "green"}`}>
                      {abnormal ? (
                        <AlertTriangle size={12} />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      {abnormal ? "Abnormal" : "Within Range"}
                    </span>

                    <span className="chip">
                      <Droplets size={12} />
                      Glucose {item.blood_glucose || "—"}
                    </span>

                    <span className="chip">
                      <Scale size={12} />
                      Weight {item.weight || "—"}
                    </span>

                    <span className="chip">
                      Pain {item.pain_level ?? "—"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
}