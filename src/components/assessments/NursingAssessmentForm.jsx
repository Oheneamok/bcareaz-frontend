import { useState } from "react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  assessment_date: today(),
  nurse_name: "",
  resident_name: "",
  dob: "",
  allergies: "",
  vital_bp: "",
  vital_pulse: "",
  vital_temp: "",
  vital_resp: "",
  vital_o2: "",
  height: "",
  weight: "",
  pain_level: "",
  pain_location: "",
  medical_history: "",
  current_medications: "",
  tb_status: "",
  physical_exam_date: "",
  mobility: "",
  diet: "",
  seizure_history: "No",
  fall_risk: "No",
  self_admin_medication: "No",
  nursing_concerns: "",
  recommendations: "",
};

export default function NursingAssessmentForm({
  resident = {},
  residentId,
  assessmentType = "NURSING",
  onSaved,
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ...initialForm,
    resident_name:
      resident.full_name ||
      `${resident.first_name || ""} ${resident.last_name || ""}`.trim(),
    dob: resident.date_of_birth || "",
    allergies: resident.allergies || "",
    height: resident.height || "",
    weight: resident.weight || "",
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
        assessor_name: form.nurse_name,
        assessor_role: "Nurse",
        mental_health_summary: form.medical_history,
        risk_summary: form.nursing_concerns,
        functional_summary: `Mobility: ${form.mobility}\nDiet: ${form.diet}`,
        safety_summary: `Fall risk: ${form.fall_risk}\nSeizure history: ${form.seizure_history}`,
        recommendations: form.recommendations,
      });

      alert(status === "COMPLETED" ? "Nursing assessment completed." : "Draft saved.");
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
      <Section title="Resident & Nursing Information">
        <Input label="Assessment Date" type="date" value={form.assessment_date} onChange={(v) => update("assessment_date", v)} />
        <Input label="Nurse Name" value={form.nurse_name} onChange={(v) => update("nurse_name", v)} />
        <Input label="Resident Name" value={form.resident_name} onChange={(v) => update("resident_name", v)} />
        <Input label="DOB" type="date" value={form.dob} onChange={(v) => update("dob", v)} />
      </Section>

      <Section title="Vitals">
        <Input label="Blood Pressure" value={form.vital_bp} onChange={(v) => update("vital_bp", v)} />
        <Input label="Pulse" value={form.vital_pulse} onChange={(v) => update("vital_pulse", v)} />
        <Input label="Temperature" value={form.vital_temp} onChange={(v) => update("vital_temp", v)} />
        <Input label="Respirations" value={form.vital_resp} onChange={(v) => update("vital_resp", v)} />
        <Input label="O2 Saturation" value={form.vital_o2} onChange={(v) => update("vital_o2", v)} />
        <Input label="Height" value={form.height} onChange={(v) => update("height", v)} />
        <Input label="Weight" value={form.weight} onChange={(v) => update("weight", v)} />
      </Section>

      <Section title="Medical Review">
        <TextArea label="Allergies / Reactions" value={form.allergies} onChange={(v) => update("allergies", v)} />
        <TextArea label="Medical History" value={form.medical_history} onChange={(v) => update("medical_history", v)} />
        <TextArea label="Current Medications" value={form.current_medications} onChange={(v) => update("current_medications", v)} />
        <Input label="Pain Level 0-10" value={form.pain_level} onChange={(v) => update("pain_level", v)} />
        <Input label="Pain Location" value={form.pain_location} onChange={(v) => update("pain_location", v)} />
      </Section>

      <Section title="Health Screening">
        <Input label="TB Status" value={form.tb_status} onChange={(v) => update("tb_status", v)} />
        <Input label="Physical Exam Date" type="date" value={form.physical_exam_date} onChange={(v) => update("physical_exam_date", v)} />
        <Input label="Mobility / Assistive Devices" value={form.mobility} onChange={(v) => update("mobility", v)} />
        <Input label="Diet / Nutrition Restrictions" value={form.diet} onChange={(v) => update("diet", v)} />
        <Select label="Seizure History" value={form.seizure_history} onChange={(v) => update("seizure_history", v)} />
        <Select label="Fall Risk" value={form.fall_risk} onChange={(v) => update("fall_risk", v)} />
        <Select label="Able to Self-Administer Medication" value={form.self_admin_medication} onChange={(v) => update("self_admin_medication", v)} />
      </Section>

      <Section title="Nursing Summary">
        <TextArea label="Nursing Concerns" value={form.nursing_concerns} onChange={(v) => update("nursing_concerns", v)} />
        <TextArea label="Recommendations / Follow-up" value={form.recommendations} onChange={(v) => update("recommendations", v)} />
      </Section>

      <div className="assessment-actions">
        <button type="button" className="secondary-btn" disabled={saving} onClick={() => saveAssessment("DRAFT")}>
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button type="button" className="primary-btn" disabled={saving} onClick={() => saveAssessment("COMPLETED")}>
          {saving ? "Saving..." : "Complete Nursing Assessment"}
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

function Select({ label, value, onChange }) {
  return <div className="assessment-field"><label>{label}</label><select value={value || "No"} onChange={(e) => onChange(e.target.value)}><option>No</option><option>Yes</option></select></div>;
}

function TextArea({ label, value, onChange }) {
  return <div className="assessment-field full"><label>{label}</label><textarea value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>;
}