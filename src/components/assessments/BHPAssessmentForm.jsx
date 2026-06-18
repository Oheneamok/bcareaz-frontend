import { useState } from "react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  assessment_date: today(),
  bhp_name: "",
  credentials: "",
  resident_name: "",
  dob: "",
  presenting_problem: "",
  referral_reason: "",
  diagnosis_review: "",
  medical_necessity: "",
  level_of_care: "",
  risk_summary: "",
  strengths: "",
  barriers: "",
  treatment_goals: "",
  recommended_services: "",
  medication_review: "",
  coordination_of_care: "",
  discharge_criteria: "",
  bhp_clinical_opinion: "",
  follow_up_plan: "",
};

export default function BHPAssessmentForm({
  resident = {},
  residentId,
  assessmentType = "BHP",
  onSaved,
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ...initialForm,
    resident_name:
      resident.full_name ||
      `${resident.first_name || ""} ${resident.last_name || ""}`.trim(),
    dob: resident.date_of_birth || "",
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveAssessment(status = "DRAFT") {
    if (!residentId) return alert("Resident ID is missing.");

    try {
      setSaving(true);

      await api.post("/assessments", {
        resident_id: residentId,
        assessment_type: assessmentType,
        assessment_date: form.assessment_date || today(),
        status,
        form_data: form,
        assessor_name: form.bhp_name,
        assessor_role: form.credentials || "BHP",
        biopsychosocial_summary: form.presenting_problem,
        mental_health_summary: form.diagnosis_review,
        risk_summary: form.risk_summary,
        behavioral_summary: form.bhp_clinical_opinion,
        safety_summary: form.medical_necessity,
        recommendations: form.recommended_services || form.follow_up_plan,
      });

      alert(status === "COMPLETED" ? "BHP assessment completed." : "Draft saved.");
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save assessment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-form">
      <Section title="BHP Review Information">
        <Input label="Assessment Date" type="date" value={form.assessment_date} onChange={(v) => update("assessment_date", v)} />
        <Input label="BHP Name" value={form.bhp_name} onChange={(v) => update("bhp_name", v)} />
        <Input label="Credentials / Position" value={form.credentials} onChange={(v) => update("credentials", v)} />
        <Input label="Resident Name" value={form.resident_name} onChange={(v) => update("resident_name", v)} />
        <Input label="DOB" type="date" value={form.dob} onChange={(v) => update("dob", v)} />
      </Section>

      <Section title="Clinical Review">
        <TextArea label="Presenting Problem" value={form.presenting_problem} onChange={(v) => update("presenting_problem", v)} />
        <TextArea label="Reason for Referral / Admission" value={form.referral_reason} onChange={(v) => update("referral_reason", v)} />
        <TextArea label="Diagnosis Review / Validation" value={form.diagnosis_review} onChange={(v) => update("diagnosis_review", v)} />
        <TextArea label="Risk Summary" value={form.risk_summary} onChange={(v) => update("risk_summary", v)} />
      </Section>

      <Section title="Medical Necessity & Level of Care">
        <TextArea label="Medical Necessity Statement" value={form.medical_necessity} onChange={(v) => update("medical_necessity", v)} />
        <Select label="Recommended Level of Care" value={form.level_of_care} onChange={(v) => update("level_of_care", v)} options={["", "BHRF", "Outpatient", "IOP", "PHP", "Inpatient", "Residential", "Other"]} />
        <TextArea label="Clinical Opinion Supporting Level of Care" value={form.bhp_clinical_opinion} onChange={(v) => update("bhp_clinical_opinion", v)} />
      </Section>

      <Section title="Treatment Recommendations">
        <TextArea label="Strengths" value={form.strengths} onChange={(v) => update("strengths", v)} />
        <TextArea label="Barriers to Treatment" value={form.barriers} onChange={(v) => update("barriers", v)} />
        <TextArea label="Treatment Goals / Focus Areas" value={form.treatment_goals} onChange={(v) => update("treatment_goals", v)} />
        <TextArea label="Recommended Services" value={form.recommended_services} onChange={(v) => update("recommended_services", v)} />
        <TextArea label="Medication Review / Psychiatric Coordination" value={form.medication_review} onChange={(v) => update("medication_review", v)} />
        <TextArea label="Coordination of Care Needed" value={form.coordination_of_care} onChange={(v) => update("coordination_of_care", v)} />
        <TextArea label="Discharge Criteria / Step-down Plan" value={form.discharge_criteria} onChange={(v) => update("discharge_criteria", v)} />
        <TextArea label="Follow-up Plan" value={form.follow_up_plan} onChange={(v) => update("follow_up_plan", v)} />
      </Section>

      <div className="assessment-actions">
        <button type="button" className="secondary-btn" disabled={saving} onClick={() => saveAssessment("DRAFT")}>
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button type="button" className="primary-btn" disabled={saving} onClick={() => saveAssessment("COMPLETED")}>
          {saving ? "Saving..." : "Complete BHP Assessment"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return <section className="assessment-section"><h3>{title}</h3><div className="assessment-grid">{children}</div></section>;
}

function Input({ label, value, onChange, type = "text" }) {
  return <div className="assessment-field"><label>{label}</label><input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>;
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="assessment-field">
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return <div className="assessment-field full"><label>{label}</label><textarea value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>;
}