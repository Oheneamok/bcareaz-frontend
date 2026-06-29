import React, { useEffect, useState } from "react";
import {
  Thermometer,
  Snowflake,
  Droplets,
  Warehouse,
  ClipboardCheck,
  PlusCircle,
  RefreshCw,
  Save,
  Clock,
  MapPin,
  Hash,
} from "lucide-react";
import api from "../services/api";
import operationsHero from "../assets/operations.png";

const LOG_TYPES = [
  { value: "REFRIGERATOR_TEMP", label: "Refrigerator", icon: Thermometer, tone: "green" },
  { value: "FREEZER_TEMP", label: "Freezer", icon: Snowflake, tone: "red" },
  { value: "WATER_TEMP", label: "Water Temp", icon: Droplets, tone: "orange" },
  { value: "FOOD_STORAGE_TEMP", label: "Food Storage", icon: Warehouse, tone: "blue" },
];

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

export default function FacilityComplianceLogsPage() {
  const [activeType, setActiveType] = useState("REFRIGERATOR_TEMP");
  const [logs, setLogs] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    log_type: "REFRIGERATOR_TEMP",
    equipment_id: "",
    item_number: "",
    item_location: "",
    log_date: today(),
    log_time: nowTime(),
    temperature_value: "",
    unit: "F",
    status: "COMPLETED",
    notes: "",
  });

  const [equipmentForm, setEquipmentForm] = useState({
    log_type: "REFRIGERATOR_TEMP",
    item_name: "",
    item_number: "",
    item_location: "",
    target_min_temp: "",
    target_max_temp: "",
    unit: "F",
    status: "ACTIVE",
  });

  async function loadLogs() {
    try {
      const res = await api.get(
        `/facility-compliance/temperature-logs?log_type=${activeType}`
      );
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Could not load temperature logs.");
    }
  }

  async function loadEquipment() {
    try {
      const res = await api.get(
        `/facility-compliance/temperature-equipment?log_type=${activeType}`
      );
      setEquipment(res.data || []);
    } catch {
      setEquipment([]);
    }
  }

  useEffect(() => {
    loadLogs();
    loadEquipment();
  }, [activeType]);

  function selectLogType(type) {
    setActiveType(type);
    setForm((prev) => ({ ...prev, log_type: type, equipment_id: "" }));
    setEquipmentForm((prev) => ({ ...prev, log_type: type }));
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEquipmentChange(e) {
    setEquipmentForm({ ...equipmentForm, [e.target.name]: e.target.value });
  }

  function handleEquipmentSelect(e) {
    const selectedId = e.target.value;
    const selected = equipment.find((item) => String(item.id) === selectedId);

    setForm({
      ...form,
      equipment_id: selectedId,
      item_number: selected?.item_number || "",
      item_location: selected?.item_location || "",
    });
  }

  async function submitLog(e) {
    e.preventDefault();

    await api.post("/facility-compliance/temperature-logs", {
      ...form,
      temperature_value: form.temperature_value
        ? Number(form.temperature_value)
        : null,
    });

    setMessage("Temperature log saved and auto-signed.");

    setForm({
      ...form,
      temperature_value: "",
      notes: "",
      log_date: today(),
      log_time: nowTime(),
    });

    loadLogs();
  }

  async function submitEquipment(e) {
    e.preventDefault();

    await api.post("/facility-compliance/temperature-equipment", {
      ...equipmentForm,
      target_min_temp: equipmentForm.target_min_temp
        ? Number(equipmentForm.target_min_temp)
        : null,
      target_max_temp: equipmentForm.target_max_temp
        ? Number(equipmentForm.target_max_temp)
        : null,
    });

    setMessage("Equipment registered.");

    setEquipmentForm({
      ...equipmentForm,
      item_name: "",
      item_number: "",
      item_location: "",
      target_min_temp: "",
      target_max_temp: "",
    });

    loadEquipment();
  }

  return (
    <div className="facility-page">
      <style>{`
        .facility-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background: linear-gradient(135deg, #eaf4ff 0%, #f8fbff 52%, #dcecff 100%);
        }

        .facility-hero {
          min-height: 520px;
          border-radius: 24px;
          padding: 46px;
          margin-bottom: 24px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 34px;
          position: relative;
          overflow: hidden;
          background-image:
            linear-gradient(
              90deg,
              rgba(7,23,53,.96) 0%,
              rgba(29,78,216,.84) 45%,
              rgba(14,165,233,.28) 75%,
              rgba(14,165,233,.12) 100%
            ),
            url(${operationsHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 30px 80px rgba(15,23,42,.22);
        }

        .hero-content,
        .hero-status-card {
          position: relative;
          z-index: 2;
        }

        .hero-kicker {
          margin: 0 0 16px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 950;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #7dd3fc;
        }

        .facility-hero h1 {
          margin: 0;
          font-size: clamp(48px, 5vw, 74px);
          line-height: .95;
          letter-spacing: -.07em;
          font-weight: 950;
        }

        .facility-hero p {
          margin-top: 22px;
          max-width: 760px;
          font-size: 19px;
          line-height: 1.7;
          color: rgba(255,255,255,.9);
          font-weight: 600;
        }

        .hero-status-card {
          width: 295px;
          padding: 30px;
          border-radius: 18px;
          background: rgba(255,255,255,.14);
          border: 3px solid rgba(25,255,255,.62);
          backdrop-filter: blur(18px);
          box-shadow: 0 20px 50px rgba(0,0,0,.18);
        }

        .hero-status-icon {
          width: 76px;
          height: 76px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          margin-bottom: 22px;
          background: linear-gradient(135deg, #38bdf8, #2563eb);
        }

        .hero-status-card span {
          display: block;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .12em;
          color: #bfdbfe;
          text-transform: uppercase;
        }

        .hero-status-card strong {
          display: block;
          margin-top: 10px;
          font-size: 48px;
          letter-spacing: -.07em;
        }

        .hero-status-card small {
          display: block;
          margin-top: 8px;
          color: rgba(255,255,255,.82);
          font-weight: 700;
        }

        .message-bar {
          margin-bottom: 20px;
          padding: 16px 20px;
          border-radius: 14px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-weight: 900;
        }

        .log-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .log-tab {
          position: relative;
          min-height: 242px;
          border: 1px solid transparent;
          border-radius: 18px;
          padding: 24px 22px;
          background: rgba(255,255,255,.16);
          display: flex;
          align-items: center;
          gap: 28px;
          text-align: left;
          cursor: pointer;
          overflow: hidden;
		  border: 3px solid rgba(25,255,255,.82);
          box-shadow: 0 14px 34px rgba(15,23,42,.72);
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
        }

        .log-tab::after {
          content: "";
          position: absolute;
          right: -26px;
          bottom: -30px;
          width: 96px;
          height: 96px;
          border-radius:19px;
          opacity: .66;
        }

        .log-tab.tone-green::after { background: #10b981; }
        .log-tab.tone-red::after { background: #fb7185; }
        .log-tab.tone-orange::after { background: #f59e0b; }
        .log-tab.tone-blue::after { background: #38bdf8; }

        .log-tab:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 48px rgba(15,23,42,.66);
        }

        .log-tab.active {
          border-color: #f20000;
          box-shadow:
            0 20px 46px rgba(15,23,42,.15),
            0 0 0 1px rgba(34,211,238,.25) inset;
        }

        .tab-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: white;
          flex: 0 0 auto;
          box-shadow: 0 15px 24px rgba(15,23,42,.88);
          position: relative;
          z-index: 2;
        }

        .tone-green .tab-icon {
          background: linear-gradient(135deg, #34d399, #059669);
        }

        .tone-red .tab-icon {
          background: linear-gradient(135deg, #fb7185, #dc2626);
        }

        .tone-orange .tab-icon {
          background: linear-gradient(135deg, #f59e0b, #fb923c);
        }

        .tone-blue .tab-icon {
          background: linear-gradient(135deg, #38bdf8, #2563eb);
        }

        .tab-icon svg {
          width: 27px;
          height: 27px;
        }

        .tab-content {
          position: relative;
          z-index: 2;
        }

        .tab-content strong {
          display: block;
          margin: 0 0 6px;
          font-size: 22px;
          line-height: 1.1;
          color: #334155;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .045em;
        }

        .tab-content h2 {
          margin: 0;
          font-size: 34px;
          line-height: .95;
          font-weight: 950;
          letter-spacing: -.05em;
          color: #dc2626;
        }

        .tab-content span {
          display: block;
          margin-top: 7px;
          font-size: 16px;
          color: #334155;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .facility-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .left-stack {
          display: grid;
          gap: 24px;
        }

        .premium-card {
          border-radius: 20px;
          padding: 30px;
          background: linear-gradient(135deg, rgba(255,255,255,.98), rgba(240,248,255,.96));
          border: 3px solid rgba(25,255,255,.95);
          box-shadow: 0 22px 58px rgba(15,23,42,.82);
          position: relative;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .card-header p {
          margin: 0 0 8px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .1em;
        }

        .card-header h2 {
          margin: 0;
          font-size: 34px;
          line-height: 1;
          letter-spacing: -.06em;
          color: #071735;
        }

        .card-header svg {
          color: #2563eb;
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
          border: 2px solid #dbeafe;
          border-radius: 12px;
          padding: 0 18px;
          min-height: 58px;
          background: white;
          color: #071735;
          font-size: 16px;
          font-weight: 800;
          outline: none;
        }

        .form-field textarea {
          min-height: 120px;
          padding: 16px 18px;
          resize: vertical;
        }

        .primary-btn,
        .secondary-btn {
          min-height: 60px;
          border: 0;
          border-radius: 14px;
          padding: 0 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 950;
          cursor: pointer;
        }

        .primary-btn {
          color: white;
          background: linear-gradient(135deg, #1d4ed8, #0f766e);
        }

        .secondary-btn {
          color: #071735;
          background: white;
          border: 2px solid #dbeafe;
        }

        .button-row {
          grid-column: span 2;
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .equipment-list,
        .log-list {
          display: grid;
          gap: 14px;
        }

        .equipment-row,
        .log-row {
          border: 1px solid #dbeafe;
          border-left-width: 6px;
          border-radius: 14px;
          padding: 18px;
          background: rgba(255,255,255,.95);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .equipment-row {
          border-left-color: #2563eb;
        }

        .log-row.completed {
          border-left-color: #16a34a;
        }

        .log-row.out_of_range {
          border-left-color: #dc2626;
        }

        .log-row.needs_review {
          border-left-color: #f97316;
        }

        .row-main {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .row-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          background: #eff6ff;
          color: #2563eb;
        }

        .row-main strong {
          display: block;
          font-size: 18px;
          color: #071735;
          letter-spacing: -.03em;
        }

        .row-main p {
          margin: 6px 0 0;
          color: #64748b;
          font-weight: 750;
          line-height: 1.45;
        }

        .row-main small {
          display: block;
          margin-top: 6px;
          color: #64748b;
        }

        .row-chip {
          border-radius: 999px;
          padding: 10px 14px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .empty-state {
          min-height: 220px;
          border-radius: 14px;
          border: 1px dashed #93c5fd;
          display: grid;
          place-items: center;
          text-align: center;
          color: #49617f;
          background: linear-gradient(135deg, #ffffff, #eff6ff);
          font-weight: 900;
        }

        @media (max-width: 1200px) {
          .log-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .facility-grid {
            grid-template-columns: 1fr;
          }

          .facility-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-status-card {
            width: 100%;
          }
        }

        @media (max-width: 760px) {
          .facility-page {
            padding: 14px;
          }

          .log-tabs,
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .button-row {
            grid-column: span 1;
          }

          .facility-hero {
            min-height: auto;
            padding: 28px;
          }

          .facility-hero h1 {
            font-size: 44px;
          }

          .equipment-row,
          .log-row {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <section className="facility-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <ClipboardCheck size={18} />
            Facility Compliance
          </p>

          <h1>
            Daily Facility Logs
            <br />
            Command Center
          </h1>

          <p>
            Complete refrigerator, freezer, water temperature and food storage
            logs. Register additional fridges/freezers with location, item
            number and expected temperature range.
          </p>
        </div>

        <div className="hero-status-card">
          <div className="hero-status-icon">
            <Thermometer size={42} />
          </div>
          <span>Today’s Logs</span>
          <strong>{logs.length}</strong>
          <small>{LOG_TYPES.find((item) => item.value === activeType)?.label}</small>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <section className="log-tabs">
        {LOG_TYPES.map((item) => {
          const Icon = item.icon;
          const tabCount = activeType === item.value ? logs.length : 0;

          return (
            <button
              key={item.value}
              type="button"
              className={`log-tab tone-${item.tone} ${
                activeType === item.value ? "active" : ""
              }`}
              onClick={() => selectLogType(item.value)}
            >
              <div className="tab-icon">
                <Icon />
              </div>

              <div className="tab-content">
                <strong>{item.label}</strong>
                <h2>{tabCount}</h2>
                <span>Open Log</span>
              </div>
            </button>
          );
        })}
      </section>

      <section className="facility-grid">
        <div className="left-stack">
          <form className="premium-card" onSubmit={submitLog}>
            <div className="card-header">
              <div>
                <p>Auto-Signed Entry</p>
                <h2>New Log Entry</h2>
              </div>
              <Thermometer size={32} />
            </div>

            <div className="form-grid">
              <div className="form-field full">
                <label>Registered Item / Fridge / Freezer</label>
                <select
                  name="equipment_id"
                  value={form.equipment_id}
                  onChange={handleEquipmentSelect}
                >
                  <option value="">Manual / Not Registered</option>
                  {equipment.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name || item.item_number} —{" "}
                      {item.item_location || "No location"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Log Date</label>
                <input
                  type="date"
                  name="log_date"
                  value={form.log_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Log Time</label>
                <input
                  type="time"
                  name="log_time"
                  value={form.log_time}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>Item Number</label>
                <input
                  name="item_number"
                  value={form.item_number}
                  onChange={handleChange}
                  placeholder="Example: FRIDGE-01"
                />
              </div>

              <div className="form-field">
                <label>Place / Location</label>
                <input
                  name="item_location"
                  value={form.item_location}
                  onChange={handleChange}
                  placeholder="Example: Kitchen"
                />
              </div>

              <div className="form-field">
                <label>Temperature / Reading</label>
                <input
                  type="number"
                  step="0.01"
                  name="temperature_value"
                  value={form.temperature_value}
                  onChange={handleChange}
                  placeholder="Example: 38"
                />
              </div>

              <div className="form-field">
                <label>Unit</label>
                <select name="unit" value={form.unit} onChange={handleChange}>
                  <option value="F">°F</option>
                  <option value="C">°C</option>
                </select>
              </div>

              <div className="form-field full">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="COMPLETED">Completed</option>
                  <option value="OUT_OF_RANGE">Out of Range</option>
                  <option value="NEEDS_REVIEW">Needs Review</option>
                </select>
              </div>

              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Add notes here..."
                />
              </div>

              <div className="button-row">
                <button className="primary-btn" type="submit">
                  <Save size={20} />
                  Save & Auto-Sign
                </button>

                <button className="secondary-btn" type="button" onClick={loadLogs}>
                  <RefreshCw size={20} />
                  Refresh Logs
                </button>
              </div>
            </div>
          </form>

          <form className="premium-card" onSubmit={submitEquipment}>
            <div className="card-header">
              <div>
                <p>Equipment Registration</p>
                <h2>Add Fridge / Freezer / Storage Item</h2>
              </div>
              <PlusCircle size={32} />
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Item Name</label>
                <input
                  name="item_name"
                  value={equipmentForm.item_name}
                  onChange={handleEquipmentChange}
                  placeholder="Example: Kitchen Refrigerator"
                  required
                />
              </div>

              <div className="form-field">
                <label>Item Number</label>
                <input
                  name="item_number"
                  value={equipmentForm.item_number}
                  onChange={handleEquipmentChange}
                  placeholder="Example: REF-001"
                  required
                />
              </div>

              <div className="form-field full">
                <label>Place / Location</label>
                <input
                  name="item_location"
                  value={equipmentForm.item_location}
                  onChange={handleEquipmentChange}
                  placeholder="Example: Kitchen, medication room, pantry"
                  required
                />
              </div>

              <div className="form-field">
                <label>Log Type</label>
                <select
                  name="log_type"
                  value={equipmentForm.log_type}
                  onChange={handleEquipmentChange}
                >
                  {LOG_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Unit</label>
                <select
                  name="unit"
                  value={equipmentForm.unit}
                  onChange={handleEquipmentChange}
                >
                  <option value="F">°F</option>
                  <option value="C">°C</option>
                </select>
              </div>

              <div className="form-field">
                <label>Set Min Temp</label>
                <input
                  type="number"
                  step="0.01"
                  name="target_min_temp"
                  value={equipmentForm.target_min_temp}
                  onChange={handleEquipmentChange}
                  placeholder="Example: 36"
                />
              </div>

              <div className="form-field">
                <label>Set Max Temp</label>
                <input
                  type="number"
                  step="0.01"
                  name="target_max_temp"
                  value={equipmentForm.target_max_temp}
                  onChange={handleEquipmentChange}
                  placeholder="Example: 41"
                />
              </div>

              <div className="button-row">
                <button className="primary-btn" type="submit">
                  <PlusCircle size={20} />
                  Register Item
                </button>

                <button className="secondary-btn" type="button" onClick={loadEquipment}>
                  <RefreshCw size={20} />
                  Refresh Items
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="premium-card">
          <div className="card-header">
            <div>
              <p>Inspection Ready</p>
              <h2>Recent Logs</h2>
            </div>
            <Clock size={32} />
          </div>

          <div className="log-list">
            {logs.length === 0 && (
              <div className="empty-state">No logs found for this category.</div>
            )}

            {logs.map((log) => (
              <div
                className={`log-row ${String(log.status || "")
                  .toLowerCase()
                  .replaceAll(" ", "_")}`}
                key={log.id}
              >
                <div className="row-main">
                  <div className="row-icon">
                    <Thermometer size={26} />
                  </div>

                  <div>
                    <strong>
                      {log.item_number || log.equipment_item_number || log.log_date}
                    </strong>

                    <p>
                      {log.temperature_value ?? log.temperature_f ?? "-"}°
                      {log.unit || "F"} · {log.status}
                    </p>

                    <small>
                      <MapPin size={13} />{" "}
                      {log.item_location ||
                        log.equipment_location ||
                        log.area_name ||
                        "Location not recorded"}{" "}
                      · {log.log_date} {log.log_time || ""}
                    </small>

                    {log.notes && <small>{log.notes}</small>}
                  </div>
                </div>

                <span className="row-chip">{log.status || "COMPLETED"}</span>
              </div>
            ))}
          </div>

          <div className="equipment-list" style={{ marginTop: 24 }}>
            <div className="card-header">
              <div>
                <p>Registered Items</p>
                <h2>Equipment List</h2>
              </div>
              <Hash size={32} />
            </div>

            {equipment.length === 0 && (
              <div className="empty-state">No registered items yet.</div>
            )}

            {equipment.map((item) => (
              <div className="equipment-row" key={item.id}>
                <div className="row-main">
                  <div className="row-icon">
                    <Hash size={26} />
                  </div>

                  <div>
                    <strong>{item.item_name || item.item_number}</strong>
                    <p>
                      {item.item_number} · {item.log_type}
                    </p>
                    <small>
                      <MapPin size={13} />{" "}
                      {item.item_location || "Location not recorded"}
                    </small>
                    <small>
                      Set Temp: {item.target_min_temp ?? "-"}°-
                      {item.target_max_temp ?? "-"}°{item.unit || "F"}
                    </small>
                  </div>
                </div>

                <span className="row-chip">{item.status || "ACTIVE"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}