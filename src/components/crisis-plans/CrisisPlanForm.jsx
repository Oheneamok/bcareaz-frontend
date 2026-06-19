import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, Plus, Trash2 } from "lucide-react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const emptyContact = {
  name: "",
  relationship: "",
  phone: "",
  priority: "Primary",
};

const initialForm = {
  plan_date: today(),
  review_due_date: "",
  resident_name: "",
  current_risk_level: "Low",
  prepared_by: "",

  triggers: "",
  warning_signs: "",
  coping_skills: "",
  deescalation_strategies: "",
  safety_interventions: "",

  preferred_hospital: "",
  mobile_crisis_number: "",
  crisis_hotline: "988",
  emergency_instructions: "Call 911 for immediate life-threatening emergency.",
  behavioral_health_provider: "",

  guardian_notification_instructions: "",

  emergency_contacts: [{ ...emptyContact }],

  safety_agreement_unsafe: false,
  safety_agreement_self_harm: false,
  safety_agreement_harm_others: false,
  safety_agreement_leave_facility: false,

  resident_signature_name: "",
  resident_signature: "",
  resident_signed_at: today(),

  guardian_signature_name: "",
  guardian_signature: "",
  guardian_signed_at: "",

  staff_name: "",
  staff_signature: "",
  staff_signed_at: today(),
};

export default function CrisisPlanForm({ resident = {}, residentId, onSaved }) {
  const residentSigRef = useRef(null);
  const guardianSigRef = useRef(null);
  const staffSigRef = useRef(null);

  const [saving, setSaving] = useState(false);

  const residentFullName =
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  const [form, setForm] = useState({
    ...initialForm,
    resident_name: residentFullName,
    resident_signature_name: residentFullName,
    guardian_signature_name: resident.guardian_name || "",
    behavioral_health_provider:
      resident.behavioral_health_provider_name ||
      resident.bhp_name ||
      "",
    preferred_hospital: resident.hospital_preference || "",
    emergency_contacts: [
      {
        name: resident.emergency_contact_name || "",
        relationship: resident.emergency_contact_relationship || "",
        phone:
          resident.emergency_contact_cell_phone ||
          resident.emergency_contact_home_phone ||
          "",
        priority: "Primary",
      },
    ],
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateContact(index, key, value) {
    const next = [...form.emergency_contacts];
    next[index] = { ...next[index], [key]: value };
    update("emergency_contacts", next);
  }

  function addContact() {
    update("emergency_contacts", [...form.emergency_contacts, { ...emptyContact }]);
  }

  function removeContact(index) {
    update(
      "emergency_contacts",
      form.emergency_contacts.filter((_, i) => i !== index)
    );
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

  async function saveCrisisPlan(status = "ACTIVE") {
    if (!residentId) {
      alert("Resident ID is missing.");
      return;
    }

    if (!form.deescalation_strategies?.trim()) {
      alert("De-escalation strategies are required for compliance.");
      return;
    }

    if (!form.emergency_contacts.some((c) => c.name && c.phone)) {
      alert("At least one emergency contact is required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/crisis-plans", {
        resident_id: residentId,
        plan_date: form.plan_date,
        review_due_date: form.review_due_date || null,
        triggers: form.triggers,
        warning_signs: form.warning_signs,
        deescalation_strategies: form.deescalation_strategies,
        coping_skills: form.coping_skills,
        safety_interventions: form.safety_interventions,
        emergency_contacts: JSON.stringify(form.emergency_contacts),
        preferred_hospital: form.preferred_hospital,
        guardian_notification_instructions:
          form.guardian_notification_instructions,
        status,
        form_data: form,
      });

      alert(status === "ACTIVE" ? "Crisis plan saved and activated." : "Crisis plan draft saved.");
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save crisis plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-form crisis-plan-form">
      <Section title="Crisis Plan Information">
        <Input label="Resident Name" value={form.resident_name} onChange={(v) => update("resident_name", v)} />
        <Input label="Plan Date" type="date" value={form.plan_date} onChange={(v) => update("plan_date", v)} />
        <Input label="Review Due Date" type="date" value={form.review_due_date} onChange={(v) => update("review_due_date", v)} />
        <Select
          label="Current Risk Level"
          value={form.current_risk_level}
          onChange={(v) => update("current_risk_level", v)}
          options={["Low", "Moderate", "High", "Critical"]}
        />
        <Input label="Prepared By" value={form.prepared_by} onChange={(v) => update("prepared_by", v)} />
      </Section>

      <Section title="Triggers / Warning Signs">
        <TextArea label="Known Triggers" value={form.triggers} onChange={(v) => update("triggers", v)} />
        <TextArea label="Warning Signs / Early Indicators" value={form.warning_signs} onChange={(v) => update("warning_signs", v)} />
      </Section>

      <Section title="Coping Skills / De-Escalation">
        <TextArea label="Coping Skills" value={form.coping_skills} onChange={(v) => update("coping_skills", v)} />
        <TextArea label="De-Escalation Strategies" value={form.deescalation_strategies} onChange={(v) => update("deescalation_strategies", v)} />
      </Section>

      <Section title="Safety Interventions">
        <TextArea label="Safety Interventions" value={form.safety_interventions} onChange={(v) => update("safety_interventions", v)} />
      </Section>

      <section className="assessment-section">
        <div className="document-table-header">
          <h3>Emergency Contacts</h3>
          <button type="button" onClick={addContact}>
            <Plus size={14} />
            Add Contact
          </button>
        </div>

        <div className="crisis-contact-table">
          <div className="crisis-contact-row header">
            <strong>Name</strong>
            <strong>Relationship</strong>
            <strong>Phone</strong>
            <strong>Priority</strong>
            <strong></strong>
          </div>

          {form.emergency_contacts.map((contact, index) => (
            <div className="crisis-contact-row" key={index}>
              <input
                value={contact.name || ""}
                onChange={(e) => updateContact(index, "name", e.target.value)}
                placeholder="Name"
              />

              <input
                value={contact.relationship || ""}
                onChange={(e) =>
                  updateContact(index, "relationship", e.target.value)
                }
                placeholder="Relationship"
              />

              <input
                value={contact.phone || ""}
                onChange={(e) => updateContact(index, "phone", e.target.value)}
                placeholder="Phone"
              />

              <select
                value={contact.priority || "Primary"}
                onChange={(e) => updateContact(index, "priority", e.target.value)}
              >
                <option>Primary</option>
                <option>Secondary</option>
                <option>Emergency Only</option>
              </select>

              <button type="button" onClick={() => removeContact(index)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <Section title="Emergency Resources">
        <Input label="Preferred Hospital" value={form.preferred_hospital} onChange={(v) => update("preferred_hospital", v)} />
        <Input label="Mobile Crisis Number" value={form.mobile_crisis_number} onChange={(v) => update("mobile_crisis_number", v)} />
        <Input label="988 Crisis Hotline" value={form.crisis_hotline} onChange={(v) => update("crisis_hotline", v)} />
        <Input label="Behavioral Health Provider" value={form.behavioral_health_provider} onChange={(v) => update("behavioral_health_provider", v)} />
        <TextArea label="911 / Emergency Instructions" value={form.emergency_instructions} onChange={(v) => update("emergency_instructions", v)} />
      </Section>

      <Section title="Guardian Notification Instructions">
        <TextArea
          label="When and how guardian / responsible party should be notified"
          value={form.guardian_notification_instructions}
          onChange={(v) => update("guardian_notification_instructions", v)}
        />
      </Section>

      <section className="assessment-section">
        <h3>Resident Safety Agreement</h3>

        <div className="document-check-panel">
          <Check
            label="I agree to notify staff if I feel unsafe."
            checked={form.safety_agreement_unsafe}
            onChange={(v) => update("safety_agreement_unsafe", v)}
          />
          <Check
            label="I agree to notify staff if I want to harm myself."
            checked={form.safety_agreement_self_harm}
            onChange={(v) => update("safety_agreement_self_harm", v)}
          />
          <Check
            label="I agree to notify staff if I want to harm others."
            checked={form.safety_agreement_harm_others}
            onChange={(v) => update("safety_agreement_harm_others", v)}
          />
          <Check
            label="I agree to notify staff if I want to leave the facility without approval."
            checked={form.safety_agreement_leave_facility}
            onChange={(v) => update("safety_agreement_leave_facility", v)}
          />
        </div>
      </section>

      <section className="assessment-section">
        <h3>Signatures</h3>

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

          <SignatureBox
            title="Staff Signature"
            nameLabel="Staff Name"
            nameValue={form.staff_name}
            onNameChange={(v) => update("staff_name", v)}
            dateValue={form.staff_signed_at}
            onDateChange={(v) => update("staff_signed_at", v)}
            savedSignature={form.staff_signature}
            sigRef={staffSigRef}
            onSave={() => saveSignature("staff_signature", staffSigRef, "staff_signed_at")}
            onClear={() => clearSignature("staff_signature", staffSigRef)}
          />
        </div>
      </section>

      <div className="assessment-actions">
        <button
          type="button"
          className="secondary-btn"
          disabled={saving}
          onClick={() => saveCrisisPlan("DRAFT")}
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>

        <button
          type="button"
          className="primary-btn"
          disabled={saving}
          onClick={() => saveCrisisPlan("ACTIVE")}
        >
          {saving ? "Saving..." : "Activate Crisis Plan"}
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

function Check({ label, checked, onChange }) {
  return (
    <label>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
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
        <button type="button" onClick={onSave}>
          Save Signature
        </button>
        <button type="button" onClick={onClear}>
          <Eraser size={14} />
          Clear
        </button>
      </div>

      <Input label="Date Signed" type="date" value={dateValue} onChange={onDateChange} />
    </div>
  );
}