import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const today = () => new Date().toISOString().slice(0, 10);

const emptyParticipant = {
  name: "",
  role: "",
  agency: "",
  attended: "Yes",
  signature: "",
};

const initialForm = {
  meeting_date: today(),
  meeting_time: "",
  location: "",
  meeting_type: "30-Day Review",
  facilitator: "",
  recorder: "",

  participants: [
    { name: "", role: "Resident", agency: "", attended: "Yes", signature: "" },
    { name: "", role: "Guardian", agency: "", attended: "Yes", signature: "" },
    { name: "", role: "Case Manager", agency: "", attended: "Yes", signature: "" },
    { name: "", role: "BHP", agency: "", attended: "Yes", signature: "" },
    { name: "", role: "Program Manager", agency: "Lighthouse Family Residential LLC", attended: "Yes", signature: "" },
    { name: "", role: "Direct Care Staff", agency: "Lighthouse Family Residential LLC", attended: "Yes", signature: "" },
  ],

  previous_goals_review: "",
  progress_since_last_staffing: "",
  barriers_encountered: "",
  current_strengths: "",
  current_concerns: "",

  mental_health_status: "",
  behavioral_concerns: "",
  medication_review: "",
  substance_use_review: "",
  medical_concerns: "",
  employment_school: "",
  legal_issues: "",
  housing_stability: "",

  services_continue: "",
  services_add: "",
  services_discontinue: "",
  referrals_needed: "",
  follow_up_actions: "",

  treatment_plan_updated: "No",
  crisis_plan_updated: "No",
  medication_changes: "No",
  level_of_care_appropriate: "Yes",
  discharge_planning_started: "No",

  summary: "",
};

export default function CFTMinutesForm({ resident = {}, residentId, onSaved }) {
  const residentName =
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  const [form, setForm] = useState({
    ...initialForm,
    participants: initialForm.participants.map((p) =>
      p.role === "Resident"
        ? { ...p, name: residentName }
        : p.role === "Guardian"
        ? { ...p, name: resident.guardian_name || "" }
        : p
    ),
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateParticipant(index, key, value) {
    const next = [...form.participants];
    next[index] = { ...next[index], [key]: value };
    update("participants", next);
  }

  function addParticipant() {
    update("participants", [...form.participants, { ...emptyParticipant }]);
  }

  function removeParticipant(index) {
    update(
      "participants",
      form.participants.filter((_, i) => i !== index)
    );
  }

  function saveDraft() {
    console.log({
      resident_id: residentId,
      form_data: form,
      status: "DRAFT",
    });

    alert("CFT Minutes draft ready. Backend save endpoint can be connected next.");
    onSaved?.();
  }

  return (
    <div className="assessment-form cft-minutes-form">
      <Section title="Meeting Information">
        <Input label="Meeting Date" type="date" value={form.meeting_date} onChange={(v) => update("meeting_date", v)} />
        <Input label="Meeting Time" type="time" value={form.meeting_time} onChange={(v) => update("meeting_time", v)} />
        <Input label="Location" value={form.location} onChange={(v) => update("location", v)} />
        <Select
          label="Meeting Type"
          value={form.meeting_type}
          onChange={(v) => update("meeting_type", v)}
          options={["Initial", "30-Day Review", "60-Day Review", "90-Day Review", "Discharge", "Emergency Staffing", "Other"]}
        />
        <Input label="Facilitator" value={form.facilitator} onChange={(v) => update("facilitator", v)} />
        <Input label="Recorder" value={form.recorder} onChange={(v) => update("recorder", v)} />
      </Section>

      <section className="assessment-section">
        <div className="document-table-header">
          <h3>Participants</h3>
          <button type="button" onClick={addParticipant}>
            <Plus size={14} />
            Add Participant
          </button>
        </div>

        <div className="cft-participant-table">
          <div className="cft-participant-row header">
            <strong>Name</strong>
            <strong>Role</strong>
            <strong>Agency</strong>
            <strong>Attended</strong>
            <strong>Signature</strong>
            <strong></strong>
          </div>

          {form.participants.map((person, index) => (
            <div className="cft-participant-row" key={index}>
              <input
                value={person.name || ""}
                onChange={(e) => updateParticipant(index, "name", e.target.value)}
                placeholder="Name"
              />

              <input
                value={person.role || ""}
                onChange={(e) => updateParticipant(index, "role", e.target.value)}
                placeholder="Role"
              />

              <input
                value={person.agency || ""}
                onChange={(e) => updateParticipant(index, "agency", e.target.value)}
                placeholder="Agency"
              />

              <select
                value={person.attended || "Yes"}
                onChange={(e) => updateParticipant(index, "attended", e.target.value)}
              >
                <option>Yes</option>
                <option>No</option>
                <option>Phone</option>
                <option>Virtual</option>
              </select>

              <input
                value={person.signature || ""}
                onChange={(e) => updateParticipant(index, "signature", e.target.value)}
                placeholder="Signature / initials"
              />

              <button type="button" onClick={() => removeParticipant(index)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <Section title="Progress Review">
        <TextArea label="Review of Previous Goals" value={form.previous_goals_review} onChange={(v) => update("previous_goals_review", v)} />
        <TextArea label="Progress Since Last Staffing" value={form.progress_since_last_staffing} onChange={(v) => update("progress_since_last_staffing", v)} />
        <TextArea label="Barriers Encountered" value={form.barriers_encountered} onChange={(v) => update("barriers_encountered", v)} />
        <TextArea label="Current Strengths" value={form.current_strengths} onChange={(v) => update("current_strengths", v)} />
        <TextArea label="Current Concerns" value={form.current_concerns} onChange={(v) => update("current_concerns", v)} />
      </Section>

      <Section title="Clinical Discussion">
        <TextArea label="Mental Health Status" value={form.mental_health_status} onChange={(v) => update("mental_health_status", v)} />
        <TextArea label="Behavioral Concerns" value={form.behavioral_concerns} onChange={(v) => update("behavioral_concerns", v)} />
        <TextArea label="Medication Review" value={form.medication_review} onChange={(v) => update("medication_review", v)} />
        <TextArea label="Substance Use Review" value={form.substance_use_review} onChange={(v) => update("substance_use_review", v)} />
        <TextArea label="Medical Concerns" value={form.medical_concerns} onChange={(v) => update("medical_concerns", v)} />
        <TextArea label="School / Employment" value={form.employment_school} onChange={(v) => update("employment_school", v)} />
        <TextArea label="Legal Issues" value={form.legal_issues} onChange={(v) => update("legal_issues", v)} />
        <TextArea label="Housing Stability" value={form.housing_stability} onChange={(v) => update("housing_stability", v)} />
      </Section>

      <Section title="Recommendations">
        <TextArea label="Services to Continue" value={form.services_continue} onChange={(v) => update("services_continue", v)} />
        <TextArea label="Services to Add" value={form.services_add} onChange={(v) => update("services_add", v)} />
        <TextArea label="Services to Discontinue" value={form.services_discontinue} onChange={(v) => update("services_discontinue", v)} />
        <TextArea label="Referrals Needed" value={form.referrals_needed} onChange={(v) => update("referrals_needed", v)} />
        <TextArea label="Follow-Up Actions" value={form.follow_up_actions} onChange={(v) => update("follow_up_actions", v)} />
      </Section>

      <Section title="Team Decisions">
        <Select label="Treatment Plan Updated?" value={form.treatment_plan_updated} onChange={(v) => update("treatment_plan_updated", v)} options={["No", "Yes"]} />
        <Select label="Crisis Plan Updated?" value={form.crisis_plan_updated} onChange={(v) => update("crisis_plan_updated", v)} options={["No", "Yes"]} />
        <Select label="Medication Changes?" value={form.medication_changes} onChange={(v) => update("medication_changes", v)} options={["No", "Yes"]} />
        <Select label="Level of Care Appropriate?" value={form.level_of_care_appropriate} onChange={(v) => update("level_of_care_appropriate", v)} options={["Yes", "No", "Needs Review"]} />
        <Select label="Discharge Planning Started?" value={form.discharge_planning_started} onChange={(v) => update("discharge_planning_started", v)} options={["No", "Yes"]} />
      </Section>

      <Section title="Summary">
        <TextArea label="CFT / Case Staffing Summary" value={form.summary} onChange={(v) => update("summary", v)} />
      </Section>

      <div className="assessment-actions">
        <button type="button" className="secondary-btn" onClick={saveDraft}>
          Save Draft
        </button>
        <button type="button" className="primary-btn" onClick={saveDraft}>
          Complete CFT Minutes
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
          <option key={option} value={option}>{option}</option>
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