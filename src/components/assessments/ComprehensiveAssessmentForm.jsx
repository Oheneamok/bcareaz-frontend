import { useState } from "react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  assessment_date: today(),
  date_of_referral: "",
  date_of_admission: "",

  member_name: "",
  dob: "",
  age: "",
  gender: "",
  race_ethnicity: "",
  preferred_language: "",
  secondary_language: "",
  address: "",
  phone: "",
  email: "",
  ahcccs: "",
  health_plan: "",

  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_email: "",
  guardian_name: "",
  guardian_phone: "",
  guardian_email: "",

  referring_agency_name: "",
  case_manager_name: "",
  case_manager_address: "",
  case_manager_phone: "",
  case_manager_email: "",
  therapist_name: "",
  therapist_phone: "",
  therapist_email: "",
  probation_parole_name: "",
  probation_parole_phone: "",
  probation_parole_email: "",
  adhs_case_manager_name: "",
  adhs_case_manager_phone: "",
  adhs_case_manager_email: "",

  behavioral_health_symptoms: "",
  reason_for_visit: "",
  presenting_symptoms: "",
  coping: "",
  limitations: "",
  urgent_needs: "",
  improvement_signs: "",
  expectations: "",
  supports: "",
  treatment_involved: "",

  suicide_history: "No",
  suicide_history_explain: "",
  current_suicidal: "No",
  current_suicidal_explain: "",
  self_harm_history: "No",
  self_harm_explain: "",
  harm_others_history: "No",
  harm_others_explain: "",
  current_homicidal: "No",
  current_homicidal_explain: "",
  duty_to_warn: "No",
  duty_to_warn_explain: "",

  treatment_preferences: "",
  childhood: "",
  abuse_history: "No",
  abuse_explain: "",
  family_history: "",
  children: "",

  drug_of_choice: "",
  sobriety: "",
  substance_treatment: "No",
  substance_treatment_explain: "",
  tobacco_use: "No",
  tobacco_explain: "",
  substance_impact: "",

  criminal_history: "No",
  criminal_explain: "",
  court_ordered: "No",
  court_explain: "",
  legal_issues: "No",
  legal_explain: "",

  typical_day: "",
  strengths: "",
  interests: "",

  appearance_description: "",
  demeanor_description: "",
  mood: "",
  affect: "",
  eye_contact: "",
  cooperation: "",
  speech_description: "",
  gait: "",
  posture: "",
  psychomotor_activity: "",
  thought_content: "",
  thought_process: "",
  perception: "",
  perception_describe: "",
  judgment: "",
  impulse_control: "",
  insight: "",
  intelligence: "",

  clinical_summary: "",
  mental_health_diagnosis: "",
  substance_diagnosis: "",
  medical_diagnosis: "",
  z_codes: "",
  recommendations: "",

  assessor_name: "",
  assessor_credentials: "",
  supervisor_name: "",
  supervisor_credentials: "",
};

export default function ComprehensiveAssessmentForm({
  resident = {},
  residentId,
  assessmentType = "GENERAL",
  onSaved,
}) {
  const [form, setForm] = useState({
    ...initialForm,
    member_name:
      resident.full_name ||
      `${resident.first_name || ""} ${resident.last_name || ""}`.trim(),
    dob: resident.date_of_birth || "",
    gender: resident.gender || "",
    phone: resident.phone || resident.cell_phone || "",
    email: resident.email || "",
    date_of_admission: resident.admission_date || "",
    health_plan: resident.health_plan || "",
    ahcccs: resident.health_plan_id || "",
    address: resident.address || resident.street_address || "",
    guardian_name: resident.guardian_name || "",
    guardian_phone: resident.guardian_phone || resident.guardian_cell_phone || "",
    guardian_email: resident.guardian_email || "",
    emergency_contact_name: resident.emergency_contact_name || "",
    emergency_contact_phone:
      resident.emergency_contact_cell_phone ||
      resident.emergency_contact_home_phone ||
      "",
    emergency_contact_email: resident.emergency_contact_email || "",
  });

  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveAssessment(status = "DRAFT") {
    if (!residentId) {
      alert("Resident ID is missing.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/assessments", {
        resident_id: residentId,
        assessment_type: assessmentType,
        assessment_date: form.assessment_date || today(),
        status,
        form_data: form,

        assessor_name: form.assessor_name,
        assessor_role: form.assessor_credentials,

        biopsychosocial_summary: form.clinical_summary,
        mental_health_summary: form.mental_health_diagnosis,
        risk_summary: buildRiskSummary(form),
        functional_summary: form.typical_day,
        substance_use_summary: form.substance_impact,
        trauma_history: form.abuse_explain,
        housing_history: "",
        employment_history: "",
        behavioral_summary: form.presenting_symptoms,
        safety_summary: buildSafetySummary(form),
        recommendations: form.recommendations,
      });

      alert(status === "COMPLETED" ? "General assessment completed." : "Draft saved.");
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
      <Section title="Receiving Facility / Resident Information">
        <Input label="Assessment Date" type="date" value={form.assessment_date} onChange={(v) => update("assessment_date", v)} />
        <Input label="Date of Referral" type="date" value={form.date_of_referral} onChange={(v) => update("date_of_referral", v)} />
        <Input label="Date of Admission" type="date" value={form.date_of_admission} onChange={(v) => update("date_of_admission", v)} />
        <Input label="Member Name" value={form.member_name} onChange={(v) => update("member_name", v)} />
        <Input label="DOB" type="date" value={form.dob} onChange={(v) => update("dob", v)} />
        <Input label="Age" value={form.age} onChange={(v) => update("age", v)} />
        <Input label="Gender" value={form.gender} onChange={(v) => update("gender", v)} />
        <Input label="Race / Ethnicity" value={form.race_ethnicity} onChange={(v) => update("race_ethnicity", v)} />
        <Input label="Preferred Language" value={form.preferred_language} onChange={(v) => update("preferred_language", v)} />
        <Input label="Secondary Language" value={form.secondary_language} onChange={(v) => update("secondary_language", v)} />
        <Input label="Address" value={form.address} onChange={(v) => update("address", v)} full />
        <Input label="Phone Number" value={form.phone} onChange={(v) => update("phone", v)} />
        <Input label="Email" value={form.email} onChange={(v) => update("email", v)} />
        <Input label="AHCCCS" value={form.ahcccs} onChange={(v) => update("ahcccs", v)} />
        <Input label="Health Insurance Plan" value={form.health_plan} onChange={(v) => update("health_plan", v)} />
      </Section>

      <Section title="Emergency Contact / Guardian">
        <Input label="Emergency Contact Name" value={form.emergency_contact_name} onChange={(v) => update("emergency_contact_name", v)} />
        <Input label="Emergency Contact Phone" value={form.emergency_contact_phone} onChange={(v) => update("emergency_contact_phone", v)} />
        <Input label="Emergency Contact Email" value={form.emergency_contact_email} onChange={(v) => update("emergency_contact_email", v)} />
        <Input label="Guardian Name" value={form.guardian_name} onChange={(v) => update("guardian_name", v)} />
        <Input label="Guardian Phone" value={form.guardian_phone} onChange={(v) => update("guardian_phone", v)} />
        <Input label="Guardian Email" value={form.guardian_email} onChange={(v) => update("guardian_email", v)} />
      </Section>

      <Section title="Referring Agency / Collateral Contacts">
        <Input label="Agency Name" value={form.referring_agency_name} onChange={(v) => update("referring_agency_name", v)} />
        <Input label="Case Manager Name" value={form.case_manager_name} onChange={(v) => update("case_manager_name", v)} />
        <Input label="Case Manager Address" value={form.case_manager_address} onChange={(v) => update("case_manager_address", v)} full />
        <Input label="Case Manager Phone" value={form.case_manager_phone} onChange={(v) => update("case_manager_phone", v)} />
        <Input label="Case Manager Email" value={form.case_manager_email} onChange={(v) => update("case_manager_email", v)} />
        <Input label="Therapist Name" value={form.therapist_name} onChange={(v) => update("therapist_name", v)} />
        <Input label="Therapist Phone" value={form.therapist_phone} onChange={(v) => update("therapist_phone", v)} />
        <Input label="Therapist Email" value={form.therapist_email} onChange={(v) => update("therapist_email", v)} />
        <Input label="Probation / Parole Name" value={form.probation_parole_name} onChange={(v) => update("probation_parole_name", v)} />
        <Input label="Probation / Parole Phone" value={form.probation_parole_phone} onChange={(v) => update("probation_parole_phone", v)} />
        <Input label="Probation / Parole Email" value={form.probation_parole_email} onChange={(v) => update("probation_parole_email", v)} />
        <Input label="ADHS Case Manager Name" value={form.adhs_case_manager_name} onChange={(v) => update("adhs_case_manager_name", v)} />
        <Input label="ADHS Case Manager Phone" value={form.adhs_case_manager_phone} onChange={(v) => update("adhs_case_manager_phone", v)} />
        <Input label="ADHS Case Manager Email" value={form.adhs_case_manager_email} onChange={(v) => update("adhs_case_manager_email", v)} />
      </Section>

      <Section title="Behavioral Health Symptoms">
        <TextArea label="Behavioral Health Symptoms" value={form.behavioral_health_symptoms} onChange={(v) => update("behavioral_health_symptoms", v)} />
        <TextArea label="Why did you come in today?" value={form.reason_for_visit} onChange={(v) => update("reason_for_visit", v)} />
        <TextArea label="What are your presenting symptoms?" value={form.presenting_symptoms} onChange={(v) => update("presenting_symptoms", v)} />
        <TextArea label="How are you coping with your symptoms?" value={form.coping} onChange={(v) => update("coping", v)} />
        <TextArea label="Difficulties / limitations because of symptoms" value={form.limitations} onChange={(v) => update("limitations", v)} />
        <TextArea label="Immediate / urgent needs" value={form.urgent_needs} onChange={(v) => update("urgent_needs", v)} />
        <TextArea label="How will you know things are improving?" value={form.improvement_signs} onChange={(v) => update("improvement_signs", v)} />
        <TextArea label="Assistance needed and treatment expectations" value={form.expectations} onChange={(v) => update("expectations", v)} />
        <TextArea label="Resources or supports available" value={form.supports} onChange={(v) => update("supports", v)} />
        <TextArea label="Who should be involved in treatment?" value={form.treatment_involved} onChange={(v) => update("treatment_involved", v)} />
      </Section>

      <Section title="Risk Assessment">
        <YesNoExplain label="History of suicide attempts?" value={form.suicide_history} explain={form.suicide_history_explain} onValue={(v) => update("suicide_history", v)} onExplain={(v) => update("suicide_history_explain", v)} />
        <YesNoExplain label="Current suicidal ideation, intent, plans, or access to means?" value={form.current_suicidal} explain={form.current_suicidal_explain} onValue={(v) => update("current_suicidal", v)} onExplain={(v) => update("current_suicidal_explain", v)} />
        <YesNoExplain label="History of self-injurious behavior?" value={form.self_harm_history} explain={form.self_harm_explain} onValue={(v) => update("self_harm_history", v)} onExplain={(v) => update("self_harm_explain", v)} />
        <YesNoExplain label="History of harming others?" value={form.harm_others_history} explain={form.harm_others_explain} onValue={(v) => update("harm_others_history", v)} onExplain={(v) => update("harm_others_explain", v)} />
        <YesNoExplain label="Current homicidal ideation, intent, plans, or access to means?" value={form.current_homicidal} explain={form.current_homicidal_explain} onValue={(v) => update("current_homicidal", v)} onExplain={(v) => update("current_homicidal_explain", v)} />
        <YesNoExplain label="Was duty to warn completed?" value={form.duty_to_warn} explain={form.duty_to_warn_explain} onValue={(v) => update("duty_to_warn", v)} onExplain={(v) => update("duty_to_warn_explain", v)} />
      </Section>

      <Section title="Mental Health Treatment / Social History">
        <TextArea label="Treatment preferences" value={form.treatment_preferences} onChange={(v) => update("treatment_preferences", v)} />
        <TextArea label="Describe childhood" value={form.childhood} onChange={(v) => update("childhood", v)} />
        <YesNoExplain label="History of abuse or neglect?" value={form.abuse_history} explain={form.abuse_explain} onValue={(v) => update("abuse_history", v)} onExplain={(v) => update("abuse_explain", v)} />
        <TextArea label="Family history of mental illness, suicide, medical issues, or substance abuse" value={form.family_history} onChange={(v) => update("family_history", v)} />
        <TextArea label="Children / relationship with children" value={form.children} onChange={(v) => update("children", v)} />
      </Section>

      <Section title="Substance Abuse / Legal History">
        <Input label="Drug of Choice" value={form.drug_of_choice} onChange={(v) => update("drug_of_choice", v)} />
        <TextArea label="Longest period of sobriety / life when not using" value={form.sobriety} onChange={(v) => update("sobriety", v)} />
        <YesNoExplain label="History of substance abuse treatment?" value={form.substance_treatment} explain={form.substance_treatment_explain} onValue={(v) => update("substance_treatment", v)} onExplain={(v) => update("substance_treatment_explain", v)} />
        <YesNoExplain label="Tobacco use?" value={form.tobacco_use} explain={form.tobacco_explain} onValue={(v) => update("tobacco_use", v)} onExplain={(v) => update("tobacco_explain", v)} />
        <TextArea label="How has substance abuse impacted life?" value={form.substance_impact} onChange={(v) => update("substance_impact", v)} />
        <YesNoExplain label="Criminal history?" value={form.criminal_history} explain={form.criminal_explain} onValue={(v) => update("criminal_history", v)} onExplain={(v) => update("criminal_explain", v)} />
        <YesNoExplain label="Court ordered evaluations or treatment?" value={form.court_ordered} explain={form.court_explain} onValue={(v) => update("court_ordered", v)} onExplain={(v) => update("court_explain", v)} />
        <YesNoExplain label="Other legal issues?" value={form.legal_issues} explain={form.legal_explain} onValue={(v) => update("legal_issues", v)} onExplain={(v) => update("legal_explain", v)} />
      </Section>

      <Section title="ADLs / Strengths / Interests">
        <TextArea label="Typical day" value={form.typical_day} onChange={(v) => update("typical_day", v)} />
        <TextArea label="Strengths" value={form.strengths} onChange={(v) => update("strengths", v)} />
        <TextArea label="Interests / hobbies / leisure activities" value={form.interests} onChange={(v) => update("interests", v)} />
      </Section>

      <Section title="Mental Status / Behavioral Observations">
        <TextArea label="Detailed description of appearance" value={form.appearance_description} onChange={(v) => update("appearance_description", v)} />
        <TextArea label="Detailed description of demeanor" value={form.demeanor_description} onChange={(v) => update("demeanor_description", v)} />
        <Input label="Mood" value={form.mood} onChange={(v) => update("mood", v)} />
        <Input label="Affect" value={form.affect} onChange={(v) => update("affect", v)} />
        <Input label="Eye Contact" value={form.eye_contact} onChange={(v) => update("eye_contact", v)} />
        <Input label="Cooperation" value={form.cooperation} onChange={(v) => update("cooperation", v)} />
        <TextArea label="Detailed description of speech" value={form.speech_description} onChange={(v) => update("speech_description", v)} />
        <Input label="Gait" value={form.gait} onChange={(v) => update("gait", v)} />
        <Input label="Posture" value={form.posture} onChange={(v) => update("posture", v)} />
        <Input label="Psychomotor Activity" value={form.psychomotor_activity} onChange={(v) => update("psychomotor_activity", v)} />
        <Input label="Thought Content" value={form.thought_content} onChange={(v) => update("thought_content", v)} />
        <Input label="Thought Process" value={form.thought_process} onChange={(v) => update("thought_process", v)} />
        <Input label="Perception" value={form.perception} onChange={(v) => update("perception", v)} />
        <TextArea label="If positive, describe perception" value={form.perception_describe} onChange={(v) => update("perception_describe", v)} />
        <Input label="Judgment" value={form.judgment} onChange={(v) => update("judgment", v)} />
        <Input label="Impulse Control" value={form.impulse_control} onChange={(v) => update("impulse_control", v)} />
        <Input label="Insight" value={form.insight} onChange={(v) => update("insight", v)} />
        <Input label="Estimated Intelligence" value={form.intelligence} onChange={(v) => update("intelligence", v)} />
      </Section>

      <Section title="Clinical Summary / Diagnostic Impression">
        <TextArea label="Clinical Summary / Case Formulation" value={form.clinical_summary} onChange={(v) => update("clinical_summary", v)} />
        <TextArea label="Mental Health Diagnosis" value={form.mental_health_diagnosis} onChange={(v) => update("mental_health_diagnosis", v)} />
        <TextArea label="Substance Abuse Diagnosis" value={form.substance_diagnosis} onChange={(v) => update("substance_diagnosis", v)} />
        <TextArea label="Medical Diagnosis" value={form.medical_diagnosis} onChange={(v) => update("medical_diagnosis", v)} />
        <TextArea label="Z Codes / Environmental Stressors" value={form.z_codes} onChange={(v) => update("z_codes", v)} />
        <TextArea label="Recommendations" value={form.recommendations} onChange={(v) => update("recommendations", v)} />
      </Section>

      <Section title="Signatures">
        <Input label="Assessor Name" value={form.assessor_name} onChange={(v) => update("assessor_name", v)} />
        <Input label="Assessor Credentials / Position" value={form.assessor_credentials} onChange={(v) => update("assessor_credentials", v)} />
        <Input label="Supervisor / BHP Name" value={form.supervisor_name} onChange={(v) => update("supervisor_name", v)} />
        <Input label="Supervisor Credentials / Position" value={form.supervisor_credentials} onChange={(v) => update("supervisor_credentials", v)} />
      </Section>

      <div className="assessment-actions">
        <button type="button" className="secondary-btn" disabled={saving} onClick={() => saveAssessment("DRAFT")}>
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button type="button" className="primary-btn" disabled={saving} onClick={() => saveAssessment("COMPLETED")}>
          {saving ? "Saving..." : "Complete Assessment"}
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

function Input({ label, value, onChange, type = "text", full }) {
  return (
    <div className={`assessment-field ${full ? "full" : ""}`}>
      <label>{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />
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

function YesNoExplain({ label, value, explain, onValue, onExplain }) {
  return (
    <div className="assessment-field full">
      <label>{label}</label>
      <select value={value || "No"} onChange={(e) => onValue(e.target.value)}>
        <option>No</option>
        <option>Yes</option>
      </select>
      {value === "Yes" && (
        <textarea placeholder="Explain..." value={explain || ""} onChange={(e) => onExplain(e.target.value)} />
      )}
    </div>
  );
}

function buildRiskSummary(form) {
  return [
    `Suicide history: ${form.suicide_history}`,
    `Current suicidal ideation: ${form.current_suicidal}`,
    `Self-harm history: ${form.self_harm_history}`,
    `Harm to others history: ${form.harm_others_history}`,
    `Current homicidal ideation: ${form.current_homicidal}`,
    `Duty to warn: ${form.duty_to_warn}`,
  ].join("\n");
}

function buildSafetySummary(form) {
  return [
    form.current_suicidal_explain,
    form.current_homicidal_explain,
    form.duty_to_warn_explain,
  ]
    .filter(Boolean)
    .join("\n");
}