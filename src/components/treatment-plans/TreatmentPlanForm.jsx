import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, LockKeyhole, Plus, Trash2 } from "lucide-react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const emptyGoal = {
  problem_area: "",
  goal: "",
  objective: "",
  intervention: "",
  responsible_staff: "",
  frequency: "",
  target_date: "",
  progress_status: "ACTIVE",
};

const initialForm = {
  plan_date: today(),
  review_due_date: "",
  plan_type: "Initial",
  resident_name: "",
  individual_id: "",
  isp_meeting_date: today(),

  diagnosis_summary: "",
  presenting_problems: "",
  strengths: "",
  needs: "",
  abilities: "",
  preferences: "",
  barriers: "",
  risks: "",
  medical_necessity: "",
  bhp_clinical_justification: "",
  resident_participation: "",

  treatment_expectations:
    "In conjunction with the treatment plan developed by your therapist, to aid in achieving treatment goals and to help residents track their own progress in an observable and measurable fashion, the following treatment expectations are required of all residents dealing with issues of substance use disorder.",

  step_one_requirements:
    "30-day probation period requiring 35-40 AA/NA meetings, 20 BHT focus group meetings, 6-8 counseling sessions, and obtaining a sponsor for NA/AA.",
  step_one_privileges:
    "Phone use more frequently throughout the day; 2+ hour walks 3 times per week at appropriate times; approved visitors 2 to 3 times per week; more frequent computer use.",

  step_two_requirements:
    "Next 30 days requiring 25-30 AA/NA meetings, 20 BHT focus group meetings, 6-8 counseling sessions, and working the steps with sponsor.",
  step_two_privileges:
    "Walks 5 times per week following check-in/check-out protocol; begin looking for work/school two weeks before day 60; start work/school after 60 days.",

  missed_group_policy:
    "BHT focus groups missed can be made up by the resident sitting down with staff and having a discussion for a minimum period of 30 minutes.",
  relapse_policy:
    "Staff may randomly check sobriety through drug or breathalyzer testing. Refusal to test is considered positive and returns resident to Step I. A positive test has the same result.",

  service_frequency: "",
  counseling_frequency: "",
  bht_group_frequency: "",
  case_management_frequency: "",
  psychiatric_frequency: "",
  discharge_criteria: "",
  review_schedule: "Every 30 days or as clinically indicated.",

  goals: [{ ...emptyGoal }],

  isp_attendees: [
    { name: "", relationship: "Resident / Self", signature: "" },
    { name: "", relationship: "Guardian", signature: "" },
    { name: "", relationship: "Case Manager / Agency", signature: "" },
    {
      name: "",
      relationship: "Program Manager / Lighthouse Family Residential LLC",
      signature: "",
    },
    { name: "", relationship: "Therapist / Agency", signature: "" },
    {
      name: "",
      relationship: "Direct Care Staff / Lighthouse Family Residential LLC",
      signature: "",
    },
  ],

  resident_signature_name: "",
  resident_signature: "",
  resident_signed_at: today(),

  guardian_signature_name: "",
  guardian_signature: "",
  guardian_signed_at: "",

  bhp_name: "",
  bhp_credentials: "",
};

export default function TreatmentPlanForm({ resident = {}, residentId, onSaved }) {
  const residentSigRef = useRef(null);
  const guardianSigRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [esigning, setEsigning] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState(null);

  const residentFullName =
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  const [form, setForm] = useState({
    ...initialForm,
    resident_name: residentFullName,
    resident_signature_name: residentFullName,
    guardian_signature_name: resident.guardian_name || "",
    diagnosis_summary: resident.diagnosis || resident.primary_diagnosis || "",
    individual_id: resident.resident_code || resident.id || "",
    isp_attendees: initialForm.isp_attendees.map((person) =>
      person.relationship === "Resident / Self"
        ? { ...person, name: residentFullName }
        : person.relationship === "Guardian"
        ? { ...person, name: resident.guardian_name || "" }
        : person
    ),
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateGoal(index, key, value) {
    const next = [...form.goals];
    next[index] = { ...next[index], [key]: value };
    update("goals", next);
  }

  function addGoal() {
    update("goals", [...form.goals, { ...emptyGoal }]);
  }

  function removeGoal(index) {
    update(
      "goals",
      form.goals.filter((_, i) => i !== index)
    );
  }

  function updateIspAttendee(index, key, value) {
    setForm((prev) => {
      const next = [...prev.isp_attendees];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, isp_attendees: next };
    });
  }

  function saveSignature(key, ref, dateKey) {
    if (!ref.current || ref.current.isEmpty()) {
      alert("Please sign before saving signature.");
      return;
    }

    update(key, ref.current.toDataURL("image/png"));
    update(dateKey, today());
  }

  function clearSignature(key, ref) {
    ref.current?.clear();
    update(key, "");
  }

  function validateBeforeBhp() {
    const hasGoal = form.goals.some((g) => g.goal?.trim());
    const hasObjective = form.goals.some((g) => g.objective?.trim());

    if (!form.resident_signature && !form.guardian_signature) {
      alert("Resident or guardian signature is required before BHP e-sign.");
      return false;
    }

    if (!hasGoal || !hasObjective) {
      alert("At least one goal and one measurable objective are required.");
      return false;
    }

    if (!form.bhp_name || !form.bhp_credentials) {
      alert("BHP name and credentials are required.");
      return false;
    }

    return true;
  }

  async function savePlan(status = "DRAFT") {
    if (!residentId) {
      alert("Resident ID is missing.");
      return null;
    }

    try {
      setSaving(true);

      const payload = {
        resident_id: residentId,
        plan_date: form.plan_date,
        review_due_date: form.review_due_date || null,
        diagnosis_summary: form.diagnosis_summary,
        strengths: form.strengths,
        needs: form.needs,
        barriers: form.barriers,
        overall_goal: form.goals.map((g) => g.goal).filter(Boolean).join("\n"),
        status,
        is_active: status === "ACTIVE" || status === "PENDING_BHP_SIGNATURE",
        form_data: form,
        resident_signature: form.resident_signature,
        resident_signed_at: form.resident_signature ? form.resident_signed_at : null,
        guardian_signature: form.guardian_signature,
        guardian_signed_at: form.guardian_signature ? form.guardian_signed_at : null,
        bhp_name: form.bhp_name,
        bhp_credentials: form.bhp_credentials,
      };

      const res = await api.post("/treatment-plans", payload);
      const planId = res.data?.id;
      setSavedPlanId(planId);

      if (planId) {
        for (const item of form.goals) {
          if (!item.goal?.trim()) continue;

          const goalRes = await api.post(`/treatment-plans/${planId}/goals`, {
            goal_title: item.problem_area || item.goal.slice(0, 80),
            goal_description: item.goal,
            target_date: item.target_date || null,
            responsible_staff: item.responsible_staff,
            status: item.progress_status || "ACTIVE",
            form_data: item,
          });

          const goalId = goalRes.data?.id;

          if (goalId && item.objective?.trim()) {
            await api.post(`/treatment-plans/goals/${goalId}/objectives`, {
              objective_description: item.objective,
              intervention: item.intervention,
              frequency: item.frequency,
              target_date: item.target_date || null,
              status: item.progress_status || "ACTIVE",
              form_data: item,
            });
          }
        }
      }

      alert(status === "DRAFT" ? "Draft saved." : "Treatment plan saved for BHP e-signature.");
      return planId;
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save treatment plan.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function bhpEsign() {
    if (!validateBeforeBhp()) return;

    let planId = savedPlanId;

    if (!planId) {
      planId = await savePlan("PENDING_BHP_SIGNATURE");
    }

    if (!planId) return;

    try {
      setEsigning(true);

      await api.post(`/treatment-plans/${planId}/bhp-esign`, {
        confirm: true,
        bhp_name: form.bhp_name,
        bhp_credentials: form.bhp_credentials,
        signed_ip_address: window.location.hostname,
        signed_device: navigator.userAgent,
      });

      alert("Treatment plan electronically signed by BHP and activated.");
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to e-sign treatment plan.");
    } finally {
      setEsigning(false);
    }
  }

  return (
    <div className="assessment-form treatment-plan-form">
      <Section title="Plan Information">
        <Input label="Resident Name" value={form.resident_name} onChange={(v) => update("resident_name", v)} />
        <Input label="Plan Date" type="date" value={form.plan_date} onChange={(v) => update("plan_date", v)} />
        <Input label="Review Due Date" type="date" value={form.review_due_date} onChange={(v) => update("review_due_date", v)} />
        <Select label="Plan Type" value={form.plan_type} onChange={(v) => update("plan_type", v)} options={["Initial", "Review", "Update", "Discharge"]} />
      </Section>

      <Section title="Diagnoses / Presenting Problems">
        <TextArea label="Diagnosis Summary" value={form.diagnosis_summary} onChange={(v) => update("diagnosis_summary", v)} />
        <TextArea label="Presenting Problems" value={form.presenting_problems} onChange={(v) => update("presenting_problems", v)} />
        <TextArea label="Medical Necessity Statement" value={form.medical_necessity} onChange={(v) => update("medical_necessity", v)} />
        <TextArea label="BHP Clinical Justification" value={form.bhp_clinical_justification} onChange={(v) => update("bhp_clinical_justification", v)} />
      </Section>

      <Section title="Strengths, Needs, Abilities & Preferences">
        <TextArea label="Strengths" value={form.strengths} onChange={(v) => update("strengths", v)} />
        <TextArea label="Needs" value={form.needs} onChange={(v) => update("needs", v)} />
        <TextArea label="Abilities" value={form.abilities} onChange={(v) => update("abilities", v)} />
        <TextArea label="Preferences" value={form.preferences} onChange={(v) => update("preferences", v)} />
      </Section>

      <Section title="Barriers / Risks">
        <TextArea label="Barriers to Treatment" value={form.barriers} onChange={(v) => update("barriers", v)} />
        <TextArea label="Risks / Safety Concerns" value={form.risks} onChange={(v) => update("risks", v)} />
        <TextArea label="Resident Participation Statement" value={form.resident_participation} onChange={(v) => update("resident_participation", v)} />
      </Section>

      <Section title="Treatment Expectations">
        <TextArea label="Treatment Expectations" value={form.treatment_expectations} onChange={(v) => update("treatment_expectations", v)} />
      </Section>

      <Section title="Step I - 30 Day Probation Requirements">
        <TextArea label="Step I Requirements" value={form.step_one_requirements} onChange={(v) => update("step_one_requirements", v)} />
        <TextArea label="Step I Privileges" value={form.step_one_privileges} onChange={(v) => update("step_one_privileges", v)} />
      </Section>

      <Section title="Step II - Next 30 Day Requirements">
        <TextArea label="Step II Requirements" value={form.step_two_requirements} onChange={(v) => update("step_two_requirements", v)} />
        <TextArea label="Step II Privileges" value={form.step_two_privileges} onChange={(v) => update("step_two_privileges", v)} />
      </Section>

      <Section title="Relapse / AWOL / Testing Policy">
        <TextArea label="Missed Group Policy" value={form.missed_group_policy} onChange={(v) => update("missed_group_policy", v)} />
        <TextArea label="Drug / Breathalyzer Testing Policy" value={form.relapse_policy} onChange={(v) => update("relapse_policy", v)} />
      </Section>

      <Section title="Services / Frequency">
        <Input label="Counseling Frequency" value={form.counseling_frequency} onChange={(v) => update("counseling_frequency", v)} />
        <Input label="BHT Group Frequency" value={form.bht_group_frequency} onChange={(v) => update("bht_group_frequency", v)} />
        <Input label="Case Management Frequency" value={form.case_management_frequency} onChange={(v) => update("case_management_frequency", v)} />
        <Input label="Psychiatric Frequency" value={form.psychiatric_frequency} onChange={(v) => update("psychiatric_frequency", v)} />
        <TextArea label="Other Service Frequency" value={form.service_frequency} onChange={(v) => update("service_frequency", v)} />
      </Section>

      <section className="assessment-section">
        <div className="document-table-header">
          <h3>Goals, Objectives & Interventions</h3>
          <button type="button" onClick={addGoal}>
            <Plus size={14} />
            Add Goal
          </button>
        </div>

        <div className="treatment-goal-list">
          {form.goals.map((item, index) => (
            <div className="treatment-goal-card" key={index}>
              <div className="assessment-grid">
                <Input label="Problem Area" value={item.problem_area} onChange={(v) => updateGoal(index, "problem_area", v)} />
                <TextArea label={`Goal ${index + 1}`} value={item.goal} onChange={(v) => updateGoal(index, "goal", v)} />
                <TextArea label="Measurable Objective" value={item.objective} onChange={(v) => updateGoal(index, "objective", v)} />
                <TextArea label="Intervention" value={item.intervention} onChange={(v) => updateGoal(index, "intervention", v)} />
                <Input label="Responsible Staff" value={item.responsible_staff} onChange={(v) => updateGoal(index, "responsible_staff", v)} />
                <Input label="Frequency" value={item.frequency} onChange={(v) => updateGoal(index, "frequency", v)} />
                <Input label="Target Date" type="date" value={item.target_date} onChange={(v) => updateGoal(index, "target_date", v)} />
                <Select label="Progress Status" value={item.progress_status} onChange={(v) => updateGoal(index, "progress_status", v)} options={["ACTIVE", "IN_PROGRESS", "ACHIEVED", "DISCONTINUED"]} />
              </div>

              {form.goals.length > 1 && (
                <button type="button" className="danger-mini-btn" onClick={() => removeGoal(index)}>
                  <Trash2 size={14} />
                  Remove Goal
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <Section title="Discharge Criteria / Review Schedule">
        <TextArea label="Discharge Criteria" value={form.discharge_criteria} onChange={(v) => update("discharge_criteria", v)} />
        <TextArea label="Review Schedule" value={form.review_schedule} onChange={(v) => update("review_schedule", v)} />
      </Section>

      <section className="assessment-section">
        <h3>Individual Service Plan (ISP) Signature Page</h3>

        <div className="assessment-grid">
          <Input label="Date of Meeting" type="date" value={form.isp_meeting_date} onChange={(v) => update("isp_meeting_date", v)} />
          <Input label="Individual Name" value={form.resident_name} onChange={(v) => update("resident_name", v)} />
          <Input label="ID#" value={form.individual_id} onChange={(v) => update("individual_id", v)} />
        </div>

        <p className="muted">Everyone in attendance must sign.</p>

        <div className="isp-signature-table">
          <div className="isp-signature-row header">
            <strong>Name</strong>
            <strong>Relationship</strong>
            <strong>Signature</strong>
          </div>

          {form.isp_attendees.map((person, index) => (
            <div className="isp-signature-row" key={index}>
              <input
                value={person.name || ""}
                onChange={(e) => updateIspAttendee(index, "name", e.target.value)}
                placeholder="Name"
              />

              <input
                value={person.relationship || ""}
                onChange={(e) => updateIspAttendee(index, "relationship", e.target.value)}
                placeholder="Relationship"
              />

              <input
                value={person.signature || ""}
                onChange={(e) => updateIspAttendee(index, "signature", e.target.value)}
                placeholder="Signature / initials"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="assessment-section">
        <h3>Resident / Guardian Signatures</h3>

        <div className="signature-plan-grid">
          <SignatureBox
            title="Resident Signature / Mark"
            nameLabel="Resident Name"
            nameValue={form.resident_signature_name}
            onNameChange={(v) => update("resident_signature_name", v)}
            dateValue={form.resident_signed_at}
            onDateChange={(v) => update("resident_signed_at", v)}
            savedSignature={form.resident_signature}
            sigRef={residentSigRef}
            onSave={() => saveSignature("resident_signature", residentSigRef, "resident_signed_at")}
            onClear={() => clearSignature("resident_signature", residentSigRef)}
          />

          <SignatureBox
            title="Guardian Signature / Mark"
            nameLabel="Guardian Name"
            nameValue={form.guardian_signature_name}
            onNameChange={(v) => update("guardian_signature_name", v)}
            dateValue={form.guardian_signed_at}
            onDateChange={(v) => update("guardian_signed_at", v)}
            savedSignature={form.guardian_signature}
            sigRef={guardianSigRef}
            onSave={() => saveSignature("guardian_signature", guardianSigRef, "guardian_signed_at")}
            onClear={() => clearSignature("guardian_signature", guardianSigRef)}
          />
        </div>
      </section>

      <section className="assessment-section">
        <h3>BHP Electronic Signature</h3>

        <div className="assessment-grid">
          <Input label="BHP Name" value={form.bhp_name} onChange={(v) => update("bhp_name", v)} />
          <Input label="Credentials" value={form.bhp_credentials} onChange={(v) => update("bhp_credentials", v)} />
        </div>

        <div className="bhp-esign-box">
          <LockKeyhole size={22} />
          <div>
            <strong>Controlled Electronic Signature</strong>
            <p>
              BHP signature is applied electronically using the logged-in user account and audit trail.
              Resident or guardian signature must be completed first.
            </p>
          </div>
        </div>
      </section>

      <div className="assessment-actions">
        <button type="button" className="secondary-btn" disabled={saving || esigning} onClick={() => savePlan("DRAFT")}>
          {saving ? "Saving..." : "Save Draft"}
        </button>

        <button type="button" className="secondary-btn" disabled={saving || esigning} onClick={() => savePlan("PENDING_BHP_SIGNATURE")}>
          Save for BHP Signature
        </button>

        <button type="button" className="primary-btn" disabled={saving || esigning} onClick={bhpEsign}>
          {esigning ? "E-Signing..." : "BHP E-Sign & Activate"}
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

function SignatureBox({
  title,
  nameLabel,
  nameValue,
  onNameChange,
  dateValue,
  onDateChange,
  savedSignature,
  sigRef,
  onSave,
  onClear,
}) {
  return (
    <div className="signature-plan-card">
      <h4>{title}</h4>

      <Input label={nameLabel} value={nameValue} onChange={onNameChange} />

      <div className="document-signature-pad">
        {savedSignature ? (
          <img src={savedSignature} alt={title} />
        ) : (
          <SignatureCanvas
            ref={sigRef}
            penColor="#0f172a"
            canvasProps={{ className: "document-signature-canvas" }}
          />
        )}
      </div>

      <div className="signature-tools">
        <button type="button" onClick={onSave}>Save Signature</button>
        <button type="button" onClick={onClear}>
          <Eraser size={14} />
          Clear
        </button>
      </div>

      <Input label="Date Signed" type="date" value={dateValue} onChange={onDateChange} />
    </div>
  );
}