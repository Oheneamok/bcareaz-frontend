import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Plus, RefreshCw, X } from "lucide-react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const categories = [
  "BEHAVIORAL_HEALTH",
  "SUBSTANCE_ABUSE",
  "TRAUMA_INFORMED_CARE",
  "ETHICS",
  "RESIDENT_RIGHTS",
  "MEDICATION_MANAGEMENT",
  "DOCUMENTATION",
  "HIPAA",
  "CRISIS_INTERVENTION",
  "CLINICAL_SUPERVISION",
  "OTHER",
];

const initialForm = {
  course_name: "",
  provider: "",
  category: "BEHAVIORAL_HEALTH",
  hours_earned: "",
  completion_date: today(),
  renewal_cycle_start: "",
  renewal_cycle_end: "",
  notes: "",
};

export default function StaffContinuingEducationTab({ staff = {}, staffId }) {
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
      const res = await api.get(
        `/staff-compliance/continuing-education?staff_id=${staffId}`
      );
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const totalHours = items.reduce(
      (sum, r) => sum + Number(r.hours_earned || 0),
      0
    );

    const latestCycle = items.find(
      (r) => r.renewal_cycle_start || r.renewal_cycle_end
    );

    const requiredHours = 40;
    const remaining = Math.max(0, requiredHours - totalHours);

    return {
      totalHours,
      courses: items.length,
      requiredHours,
      remaining,
      cycle:
        latestCycle?.renewal_cycle_start || latestCycle?.renewal_cycle_end
          ? `${formatDate(latestCycle.renewal_cycle_start)} - ${formatDate(
              latestCycle.renewal_cycle_end
            )}`
          : "—",
    };
  }, [items]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveCE() {
    if (!staffId) return alert("Staff ID is missing.");

    if (!form.course_name) {
      alert("Course name is required.");
      return;
    }

    if (!form.hours_earned) {
      alert("Hours earned is required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/staff-compliance/continuing-education", {
        staff_id: staffId,
        course_name: form.course_name,
        provider: form.provider,
        category: form.category,
        hours_earned: Number(form.hours_earned || 0),
        completion_date: form.completion_date || null,
        renewal_cycle_start: form.renewal_cycle_start || null,
        renewal_cycle_end: form.renewal_cycle_end || null,
        notes: form.notes,
      });

      setForm(initialForm);
      setShowForm(false);
      await loadItems();
      alert("Continuing education record saved.");
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.detail ||
          "Unable to save continuing education record."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-workspace staff-ce-tab">
      <div className="assessment-hero staff-ce-hero">
        <div>
          <p className="dashboard-eyebrow">Professional Development</p>
          <h2>Continuing Education</h2>
          <p>
            Track CE courses, hours earned, renewal cycles, providers, and
            professional development documentation.
          </p>
        </div>

        <div className="medication-action-row">
          <button type="button" className="secondary-btn" onClick={loadItems}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} />
            Add CE Record
          </button>
        </div>
      </div>

      <div className="compliance-summary-grid">
        <MetricCard
          title="Hours Earned"
          value={metrics.totalHours}
          helper="Total CE hours"
          tone={metrics.totalHours >= 40 ? "green" : "amber"}
        />
        <MetricCard
          title="Courses Completed"
          value={metrics.courses}
          helper="CE records"
          tone="blue"
        />
        <MetricCard
          title="Hours Required"
          value={metrics.requiredHours}
          helper="Default 2-year cycle"
          tone="blue"
        />
        <MetricCard
          title="Hours Remaining"
          value={metrics.remaining}
          helper={`Cycle: ${metrics.cycle}`}
          tone={metrics.remaining === 0 ? "green" : "amber"}
        />
      </div>

      <section className="assessment-history-panel">
        <h3>Continuing Education History</h3>

        {loading ? (
          <div className="table-empty">Loading continuing education...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <BookOpenCheck size={34} />
            <p>No continuing education records found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Provider</th>
                  <th>Category</th>
                  <th>Hours</th>
                  <th>Completed</th>
                  <th>Renewal Cycle</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.course_name || "—"}</td>
                    <td>{item.provider || "—"}</td>
                    <td>{formatType(item.category)}</td>
                    <td>{item.hours_earned || 0}</td>
                    <td>{formatDate(item.completion_date)}</td>
                    <td>
                      {formatDate(item.renewal_cycle_start)} -{" "}
                      {formatDate(item.renewal_cycle_end)}
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
                <p className="dashboard-eyebrow">Continuing Education</p>
                <h2>Add CE Record</h2>
              </div>

              <button
                className="icon-close"
                type="button"
                onClick={() => setShowForm(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              <section className="assessment-section">
                <h3>Course Information</h3>

                <div className="assessment-grid">
                  <Input
                    label="Course Name"
                    value={form.course_name}
                    onChange={(v) => update("course_name", v)}
                  />

                  <Input
                    label="Provider"
                    value={form.provider}
                    onChange={(v) => update("provider", v)}
                  />

                  <Select
                    label="Category"
                    value={form.category}
                    onChange={(v) => update("category", v)}
                    options={categories}
                  />

                  <Input
                    label="Hours Earned"
                    type="number"
                    value={form.hours_earned}
                    onChange={(v) => update("hours_earned", v)}
                  />

                  <Input
                    label="Completion Date"
                    type="date"
                    value={form.completion_date}
                    onChange={(v) => update("completion_date", v)}
                  />

                  <Input
                    label="Renewal Cycle Start"
                    type="date"
                    value={form.renewal_cycle_start}
                    onChange={(v) => update("renewal_cycle_start", v)}
                  />

                  <Input
                    label="Renewal Cycle End"
                    type="date"
                    value={form.renewal_cycle_end}
                    onChange={(v) => update("renewal_cycle_end", v)}
                  />

                  <TextArea
                    label="Notes"
                    value={form.notes}
                    onChange={(v) => update("notes", v)}
                  />
                </div>
              </section>

              <div className="assessment-actions">
                <button
                  type="button"
                  className="primary-btn"
                  disabled={saving}
                  onClick={saveCE}
                >
                  {saving ? "Saving..." : "Save CE Record"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, helper, tone }) {
  return (
    <div className={`compliance-metric-card ${tone}`}>
      <strong>{value}</strong>
      <span>{title}</span>
      <p>{helper}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="assessment-field">
      <label>{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
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
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function formatType(value) {
  return `${value || ""}`.replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}