import { useEffect, useState } from "react";
import { GraduationCap, Plus, RefreshCw, X } from "lucide-react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const trainingCategories = [
  "ORIENTATION",
  "CPR",
  "FIRST_AID",
  "MEDICATION_TRAINING",
  "ARTICLE_9",
  "PREVENTION_SUPPORT",
  "CRISIS_INTERVENTION",
  "FALL_PREVENTION",
  "HIPAA",
  "RESIDENT_RIGHTS",
  "INFECTION_CONTROL",
  "EMERGENCY_PREPAREDNESS",
  "ANNUAL_INSERVICE",
  "OTHER",
];

const initialForm = {
  training_name: "",
  training_category: "ORIENTATION",
  completion_date: today(),
  expiration_date: "",
  provider: "",
  status: "COMPLETED",
  notes: "",
};

export default function StaffTrainingTab({ staff = {}, staffId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadItems();
  }, [staffId]);

  async function loadItems() {
    if (!staffId) return;

    try {
      setLoading(true);
      const res = await api.get(`/staff-compliance/training-records?staff_id=${staffId}`);
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

  async function saveTraining() {
    if (!staffId) return alert("Staff ID is missing.");

    if (!form.training_name) {
      alert("Training name is required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/staff-compliance/training-records", {
        staff_id: staffId,
        training_name: form.training_name,
        training_category: form.training_category,
        completion_date: form.completion_date || null,
        expiration_date: form.expiration_date || null,
        provider: form.provider,
        status: form.status,
        notes: form.notes,
        metadata_json: form,
      });

      setForm(initialForm);
      setShowForm(false);
      await loadItems();
      alert("Training record saved.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save training record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-workspace staff-training-tab">
      <div className="assessment-hero staff-training-hero">
        <div>
          <p className="dashboard-eyebrow">Personnel Record</p>
          <h2>Training Records</h2>
          <p>
            Track orientation, medication training, crisis intervention, fall
            prevention, HIPAA, resident rights, and annual in-service education.
          </p>
        </div>

        <div className="medication-action-row">
          <button type="button" className="secondary-btn" onClick={loadItems}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button type="button" className="primary-btn" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Add Training
          </button>
        </div>
      </div>

      <section className="assessment-history-panel">
        <h3>Training Records</h3>

        {loading ? (
          <div className="table-empty">Loading training records...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <GraduationCap size={34} />
            <p>No training records found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Training</th>
                  <th>Category</th>
                  <th>Completed</th>
                  <th>Expires</th>
                  <th>Provider</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.training_name || "—"}</td>
                    <td>{formatType(item.training_category)}</td>
                    <td>{formatDate(item.completion_date)}</td>
                    <td>{formatDate(item.expiration_date)}</td>
                    <td>{item.provider || "—"}</td>
                    <td>
                      <span className={`status-badge ${getRecordStatus(item).toLowerCase()}`}>
                        {getRecordStatus(item)}
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
                <p className="dashboard-eyebrow">Training</p>
                <h2>Add Staff Training</h2>
              </div>

              <button className="icon-close" type="button" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              <section className="assessment-section">
                <h3>Training Information</h3>

                <div className="assessment-grid">
                  <Input label="Training Name" value={form.training_name} onChange={(v) => update("training_name", v)} />
                  <Select
                    label="Training Category"
                    value={form.training_category}
                    onChange={(v) => update("training_category", v)}
                    options={trainingCategories}
                  />
                  <Input label="Completion Date" type="date" value={form.completion_date} onChange={(v) => update("completion_date", v)} />
                  <Input label="Expiration Date" type="date" value={form.expiration_date} onChange={(v) => update("expiration_date", v)} />
                  <Input label="Provider / Trainer" value={form.provider} onChange={(v) => update("provider", v)} />
                  <Select label="Status" value={form.status} onChange={(v) => update("status", v)} options={["COMPLETED", "EXPIRED", "PENDING", "MISSING"]} />
                  <TextArea label="Notes" value={form.notes} onChange={(v) => update("notes", v)} />
                </div>
              </section>

              <div className="assessment-actions">
                <button type="button" className="primary-btn" disabled={saving} onClick={saveTraining}>
                  {saving ? "Saving..." : "Save Training"}
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
  return (
    <div className="assessment-field">
      <label>{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="assessment-field">
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatType(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="assessment-field full">
      <label>{label}</label>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function getRecordStatus(item) {
  if (isExpired(item.expiration_date)) return "EXPIRED";
  if (isExpiringSoon(item.expiration_date)) return "EXPIRING_SOON";
  return item.status || "COMPLETED";
}

function isExpired(value) {
  if (!value) return false;
  const today = new Date();
  const date = new Date(value);
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function isExpiringSoon(value) {
  if (!value || isExpired(value)) return false;
  const today = new Date();
  const date = new Date(value);
  const in60 = new Date();
  in60.setDate(today.getDate() + 60);
  return date <= in60;
}

function formatType(value) {
  return `${value || ""}`.replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}