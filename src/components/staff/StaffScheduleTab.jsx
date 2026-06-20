import { useEffect, useState } from "react";
import { CalendarDays, Plus, RefreshCw, X } from "lucide-react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  shift_date: today(),
  start_time: "08:00",
  end_time: "17:00",
  unit: "",
  role: "",
  status: "SCHEDULED",
  notes: "",
};

export default function StaffScheduleTab({ staff = {}, staffId }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, [staffId]);

  async function loadSchedule() {
    if (!staffId) return;

    try {
      setLoading(true);
      const res = await api.get(`/staff-schedules?staff_id=${staffId}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveShift() {
    if (!staffId) return alert("Staff ID is missing.");

    try {
      setSaving(true);

      await api.post("/staff-schedules", {
        staff_id: staffId,
        ...form,
        form_data: form,
      });

      setForm(initialForm);
      setShowForm(false);
      await loadSchedule();
      alert("Shift saved.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save shift.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-workspace">
      <div className="assessment-hero calendar-hero">
        <div>
          <p className="dashboard-eyebrow">Staff Schedule</p>
          <h2>Schedule</h2>
          <p>Track staff shifts, assigned roles, hours, and schedule notes.</p>
        </div>

        <div className="medication-action-row">
          <button className="secondary-btn" type="button" onClick={loadSchedule}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="primary-btn" type="button" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Shift
          </button>
        </div>
      </div>

      <section className="assessment-history-panel">
        <h3>Schedule History</h3>

        {loading ? (
          <div className="table-empty">Loading schedule...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={34} />
            <p>No schedule records found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Unit</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.shift_date || item.date)}</td>
                    <td>{item.start_time || "—"}</td>
                    <td>{item.end_time || "—"}</td>
                    <td>{item.unit || "—"}</td>
                    <td>{item.role || "—"}</td>
                    <td>
                      <span className={`status-badge ${item.status?.toLowerCase()}`}>
                        {item.status || "SCHEDULED"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-backdrop nested-modal">
          <div className="premium-modal assessment-modal">
            <div className="modal-header">
              <div>
                <p className="dashboard-eyebrow">Schedule</p>
                <h2>Add Staff Shift</h2>
              </div>
              <button className="icon-close" type="button" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              <section className="assessment-section">
                <h3>Shift Information</h3>
                <div className="assessment-grid">
                  <Input label="Date" type="date" value={form.shift_date} onChange={(v) => update("shift_date", v)} />
                  <Input label="Start Time" type="time" value={form.start_time} onChange={(v) => update("start_time", v)} />
                  <Input label="End Time" type="time" value={form.end_time} onChange={(v) => update("end_time", v)} />
                  <Input label="Unit / Location" value={form.unit} onChange={(v) => update("unit", v)} />
                  <Input label="Role" value={form.role} onChange={(v) => update("role", v)} />
                  <Select label="Status" value={form.status} onChange={(v) => update("status", v)} options={["SCHEDULED", "COMPLETED", "MISSED", "CANCELLED"]} />
                  <TextArea label="Notes" value={form.notes} onChange={(v) => update("notes", v)} />
                </div>
              </section>

              <div className="assessment-actions">
                <button className="primary-btn" type="button" disabled={saving} onClick={saveShift}>
                  {saving ? "Saving..." : "Save Shift"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return <div className="assessment-field"><label>{label}</label><input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>;
}

function Select({ label, value, onChange, options }) {
  return <div className="assessment-field"><label>{label}</label><select value={value || ""} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o.replaceAll("_", " ")}</option>)}</select></div>;
}

function TextArea({ label, value, onChange }) {
  return <div className="assessment-field full"><label>{label}</label><textarea value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}