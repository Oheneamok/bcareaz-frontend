import React, { useEffect, useState } from "react";
import api from "../services/api";

const LOG_TYPES = [
  { value: "REFRIGERATOR_TEMP", label: "Refrigerator Temperature" },
  { value: "FREEZER_TEMP", label: "Freezer Temperature" },
  { value: "WATER_TEMP", label: "Water Temperature" },
  { value: "FOOD_STORAGE_TEMP", label: "Food Storage Temperature" },
];

export default function FacilityComplianceLogsPage() {
  const [activeType, setActiveType] = useState("REFRIGERATOR_TEMP");
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({
    log_type: "REFRIGERATOR_TEMP",
    log_date: new Date().toISOString().slice(0, 10),
    log_time: new Date().toTimeString().slice(0, 5),
    temperature_value: "",
    unit: "F",
    status: "COMPLETED",
    notes: "",
  });

  const loadLogs = async () => {
    const res = await api.get(
      `/facility-compliance/temperature-logs?log_type=${activeType}`
    );
    setLogs(res.data || []);
  };

  useEffect(() => {
    loadLogs();
  }, [activeType]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const selectLogType = (type) => {
    setActiveType(type);
    setForm({
      ...form,
      log_type: type,
    });
  };

  const submitLog = async (e) => {
    e.preventDefault();

    await api.post("/facility-compliance/temperature-logs", {
      ...form,
      temperature_value: form.temperature_value
        ? Number(form.temperature_value)
        : null,
    });

    setForm({
      ...form,
      temperature_value: "",
      notes: "",
      log_date: new Date().toISOString().slice(0, 10),
      log_time: new Date().toTimeString().slice(0, 5),
    });

    loadLogs();
  };

  return (
    <div className="facility-page">
      <div className="facility-hero">
        <div>
          <p className="eyebrow">Facility Compliance</p>
          <h1>Daily Facility Logs</h1>
          <p>
            Staff can complete required daily logs. The system automatically
            signs each record using the logged-in staff account.
          </p>
        </div>
      </div>

      <div className="log-tabs">
        {LOG_TYPES.map((item) => (
          <button
            key={item.value}
            className={activeType === item.value ? "active" : ""}
            onClick={() => selectLogType(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="facility-grid">
        <form className="premium-card" onSubmit={submitLog}>
          <h2>New Log Entry</h2>

          <label>Log Date</label>
          <input
            type="date"
            name="log_date"
            value={form.log_date}
            onChange={handleChange}
            required
          />

          <label>Log Time</label>
          <input
            type="time"
            name="log_time"
            value={form.log_time}
            onChange={handleChange}
          />

          <label>Temperature / Reading</label>
          <input
            type="number"
            step="0.01"
            name="temperature_value"
            value={form.temperature_value}
            onChange={handleChange}
            placeholder="Example: 38"
          />

          <label>Unit</label>
          <select name="unit" value={form.unit} onChange={handleChange}>
            <option value="F">°F</option>
            <option value="C">°C</option>
          </select>

          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="COMPLETED">Completed</option>
            <option value="OUT_OF_RANGE">Out of Range</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
          </select>

          <label>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Add notes here..."
          />

          <button className="primary-btn" type="submit">
            Save & Auto-Sign
          </button>
        </form>

        <div className="premium-card">
          <h2>Recent Logs</h2>

          <div className="log-list">
            {logs.length === 0 && <p>No logs found.</p>}

            {logs.map((log) => (
              <div className="log-row" key={log.id}>
                <div>
                  <strong>{log.log_date}</strong>
                  <p>
                    {log.temperature_value ?? "-"}°{log.unit || "F"} ·{" "}
                    {log.status}
                  </p>
                  {log.notes && <small>{log.notes}</small>}
                </div>
                <span>{log.log_time || ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}