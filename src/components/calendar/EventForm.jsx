import { useState } from "react";
import api from "../../services/api";

const nowLocal = () => {
  const d = new Date();
  return d.toISOString().slice(0, 16);
};

const defaultEnd = () => {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 16);
};

const initialForm = {
  title: "",
  event_type: "APPOINTMENT",
  start_time: nowLocal(),
  end_time: defaultEnd(),
  location: "",
  assigned_staff: "",
  reminder_minutes: "60",
  notes: "",
  status: "SCHEDULED",
};

export default function EventForm({ resident = {}, residentId, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveEvent() {
    if (!residentId) {
      alert("Resident ID is missing.");
      return;
    }

    if (!form.title || !form.start_time) {
      alert("Event title and start time are required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/calendar-events", {
        resident_id: residentId,
        title: form.title,
        event_type: form.event_type,
        start_time: form.start_time,
        end_time: form.end_time || null,
        location: form.location,
        assigned_staff: form.assigned_staff,
        reminder_minutes: Number(form.reminder_minutes || 0),
        notes: form.notes,
        status: form.status,
        form_data: form,
      });

      alert("Calendar event saved.");
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save calendar event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-form event-form">
      <Section title="Event Information">
        <Input
          label="Event Title"
          value={form.title}
          onChange={(v) => update("title", v)}
        />

        <Select
          label="Event Type"
          value={form.event_type}
          onChange={(v) => update("event_type", v)}
          options={[
            "APPOINTMENT",
            "ASSESSMENT",
            "TREATMENT_REVIEW",
            "SERVICE_PLAN_REVIEW",
            "CFT_MEETING",
            "MEDICATION_REVIEW",
            "COURT",
            "PROBATION",
            "TRANSPORTATION",
            "CUSTOM",
          ]}
        />

        <Input
          label="Start Date/Time"
          type="datetime-local"
          value={form.start_time}
          onChange={(v) => update("start_time", v)}
        />

        <Input
          label="End Date/Time"
          type="datetime-local"
          value={form.end_time}
          onChange={(v) => update("end_time", v)}
        />

        <Input
          label="Location"
          value={form.location}
          onChange={(v) => update("location", v)}
        />

        <Input
          label="Assigned Staff"
          value={form.assigned_staff}
          onChange={(v) => update("assigned_staff", v)}
        />

        <Select
          label="Reminder"
          value={form.reminder_minutes}
          onChange={(v) => update("reminder_minutes", v)}
          options={[
            { value: "0", label: "No reminder" },
            { value: "15", label: "15 minutes before" },
            { value: "30", label: "30 minutes before" },
            { value: "60", label: "1 hour before" },
            { value: "1440", label: "1 day before" },
          ]}
        />

        <Select
          label="Status"
          value={form.status}
          onChange={(v) => update("status", v)}
          options={["SCHEDULED", "COMPLETED", "CANCELLED", "MISSED"]}
        />

        <TextArea
          label="Notes"
          value={form.notes}
          onChange={(v) => update("notes", v)}
        />
      </Section>

      <div className="assessment-actions">
        <button
          type="button"
          className="primary-btn"
          disabled={saving}
          onClick={saveEvent}
        >
          {saving ? "Saving..." : "Save Event"}
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
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option.replaceAll("_", " ")}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        )}
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