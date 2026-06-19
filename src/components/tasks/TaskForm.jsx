import { useState } from "react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  title: "",
  task_type: "CUSTOM",
  assigned_to: "",
  priority: "NORMAL",
  due_date: today(),
  description: "",
  status: "PENDING",
};

export default function TaskForm({ resident = {}, residentId, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveTask() {
    if (!residentId) {
      alert("Resident ID is missing.");
      return;
    }

    if (!form.title || !form.due_date) {
      alert("Task title and due date are required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/tasks", {
        resident_id: residentId,
        title: form.title,
        task_type: form.task_type,
        assigned_to: form.assigned_to,
        priority: form.priority,
        due_date: form.due_date,
        description: form.description,
        status: form.status,
        form_data: form,
      });

      alert("Task saved.");
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-form task-form">
      <Section title="Task Information">
        <Input label="Task Title" value={form.title} onChange={(v) => update("title", v)} />

        <Select
          label="Task Type"
          value={form.task_type}
          onChange={(v) => update("task_type", v)}
          options={[
            "ASSESSMENT_DUE",
            "TREATMENT_PLAN_REVIEW",
            "SERVICE_PLAN_REVIEW",
            "CRISIS_PLAN_REVIEW",
            "CFT_MEETING",
            "MEDICATION_REVIEW",
            "DOCTOR_APPOINTMENT",
            "COURT_APPOINTMENT",
            "LAB_FOLLOW_UP",
            "COMPLIANCE_FOLLOW_UP",
            "CUSTOM",
          ]}
        />

        <Input label="Assigned To" value={form.assigned_to} onChange={(v) => update("assigned_to", v)} />

        <Select
          label="Priority"
          value={form.priority}
          onChange={(v) => update("priority", v)}
          options={["LOW", "NORMAL", "HIGH", "CRITICAL"]}
        />

        <Input label="Due Date" type="date" value={form.due_date} onChange={(v) => update("due_date", v)} />

        <Select
          label="Status"
          value={form.status}
          onChange={(v) => update("status", v)}
          options={["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]}
        />

        <TextArea label="Description" value={form.description} onChange={(v) => update("description", v)} />
      </Section>

      <div className="assessment-actions">
        <button type="button" className="primary-btn" disabled={saving} onClick={saveTask}>
          {saving ? "Saving..." : "Save Task"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="assessment-section">
      <h3>{title}</h3>
      <div className="assessment-grid">{children}</div>
    </section>
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
            {option.replaceAll("_", " ")}
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