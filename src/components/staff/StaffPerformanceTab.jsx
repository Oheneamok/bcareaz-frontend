import { useEffect, useState } from "react";
import { Star, Plus, RefreshCw, X } from "lucide-react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  review_date: today(),
  review_type: "ANNUAL",
  reviewer_name: "",
  attendance_score: "",
  compliance_score: "",
  performance_score: "",
  strengths: "",
  improvement_areas: "",
  corrective_actions: "",
  recognition: "",
  status: "COMPLETED",
};

export default function StaffPerformanceTab({ staff = {}, staffId }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadItems();
  }, [staffId]);

  async function loadItems() {
    if (!staffId) return;

    try {
      setLoading(true);
      const res = await api.get(`/staff-performance?staff_id=${staffId}`);
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

  async function saveReview() {
    if (!staffId) return alert("Staff ID is missing.");

    try {
      setSaving(true);

      await api.post("/staff-performance", {
        staff_id: staffId,
        ...form,
        form_data: form,
      });

      setForm(initialForm);
      setShowForm(false);
      await loadItems();
      alert("Performance review saved.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save performance review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-workspace">
      <div className="assessment-hero staff-training-hero">
        <div>
          <p className="dashboard-eyebrow">Staff Performance</p>
          <h2>Performance</h2>
          <p>Track reviews, strengths, improvement areas, recognition, and corrective action.</p>
        </div>

        <div className="medication-action-row">
          <button className="secondary-btn" type="button" onClick={loadItems}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="primary-btn" type="button" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Review
          </button>
        </div>
      </div>

      <section className="assessment-history-panel">
        <h3>Performance Reviews</h3>

        {loading ? (
          <div className="table-empty">Loading performance reviews...</div>
        ) : items.length === 0 ? (
          <div className="empty-state"><Star size={34} /><p>No performance reviews found.</p></div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Reviewer</th>
                  <th>Performance</th>
                  <th>Compliance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.review_date)}</td>
                    <td>{formatType(item.review_type)}</td>
                    <td>{item.reviewer_name || "—"}</td>
                    <td>{item.performance_score || "—"}</td>
                    <td>{item.compliance_score || "—"}</td>
                    <td><span className={`status-badge ${item.status?.toLowerCase()}`}>{item.status || "COMPLETED"}</span></td>
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
                <p className="dashboard-eyebrow">Performance</p>
                <h2>Add Performance Review</h2>
              </div>
              <button className="icon-close" type="button" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              <section className="assessment-section">
                <h3>Review Information</h3>
                <div className="assessment-grid">
                  <Input label="Review Date" type="date" value={form.review_date} onChange={(v) => update("review_date", v)} />
                  <Select label="Review Type" value={form.review_type} onChange={(v) => update("review_type", v)} options={["ANNUAL", "PROBATIONARY", "CORRECTIVE_ACTION", "COACHING", "RECOGNITION"]} />
                  <Input label="Reviewer Name" value={form.reviewer_name} onChange={(v) => update("reviewer_name", v)} />
                  <Input label="Attendance Score" value={form.attendance_score} onChange={(v) => update("attendance_score", v)} />
                  <Input label="Compliance Score" value={form.compliance_score} onChange={(v) => update("compliance_score", v)} />
                  <Input label="Performance Score" value={form.performance_score} onChange={(v) => update("performance_score", v)} />
                  <TextArea label="Strengths" value={form.strengths} onChange={(v) => update("strengths", v)} />
                  <TextArea label="Improvement Areas" value={form.improvement_areas} onChange={(v) => update("improvement_areas", v)} />
                  <TextArea label="Corrective Actions" value={form.corrective_actions} onChange={(v) => update("corrective_actions", v)} />
                  <TextArea label="Recognition" value={form.recognition} onChange={(v) => update("recognition", v)} />
                </div>
              </section>

              <div className="assessment-actions">
                <button className="primary-btn" type="button" disabled={saving} onClick={saveReview}>
                  {saving ? "Saving..." : "Save Review"}
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
  return <div className="assessment-field"><label>{label}</label><select value={value || ""} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{formatType(o)}</option>)}</select></div>;
}

function TextArea({ label, value, onChange }) {
  return <div className="assessment-field full"><label>{label}</label><textarea value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>;
}

function formatType(value) {
  return `${value || ""}`.replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}