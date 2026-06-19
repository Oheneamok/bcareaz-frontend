import { useState } from "react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  medication_name: "",
  dosage: "",
  route: "",
  frequency: "",
  start_date: today(),
  end_date: "",
  is_prn: false,
  prn_reason: "",
  prescriber_name: "",
  prescriber_phone: "",
  pharmacy_name: "",
  pharmacy_phone: "",
  instructions: "",
  side_effects: "",
  allergies_reviewed: false,
  status: "ACTIVE",
};

export default function MedicationOrderForm({ resident = {}, residentId, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ...initialForm,
    pharmacy_name: resident.pharmacy_name || "",
    pharmacy_phone: resident.pharmacy_phone || "",
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveOrder() {
    if (!residentId) {
      alert("Resident ID is missing.");
      return;
    }

    if (!form.medication_name || !form.dosage || !form.frequency) {
      alert("Medication name, dosage, and frequency are required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/medication-orders", {
        resident_id: residentId,
        medication_name: form.medication_name,
        dosage: form.dosage,
        route: form.route,
        frequency: form.frequency,
        start_date: form.start_date,
        end_date: form.end_date || null,
        is_prn: form.is_prn,
        prn_reason: form.prn_reason,
        prescriber_name: form.prescriber_name,
        prescriber_phone: form.prescriber_phone,
        pharmacy_name: form.pharmacy_name,
        pharmacy_phone: form.pharmacy_phone,
        instructions: form.instructions,
        side_effects: form.side_effects,
        status: form.status,
        form_data: form,
      });

      alert("Medication order saved.");
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save medication order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-form medication-order-form">
      <Section title="Medication Order">
        <Input label="Medication Name" value={form.medication_name} onChange={(v) => update("medication_name", v)} />
        <Input label="Dosage" value={form.dosage} onChange={(v) => update("dosage", v)} />
        <Input label="Route" value={form.route} onChange={(v) => update("route", v)} />
        <Input label="Frequency" value={form.frequency} onChange={(v) => update("frequency", v)} />
        <Input label="Start Date" type="date" value={form.start_date} onChange={(v) => update("start_date", v)} />
        <Input label="End Date" type="date" value={form.end_date} onChange={(v) => update("end_date", v)} />
        <Select label="Status" value={form.status} onChange={(v) => update("status", v)} options={["ACTIVE", "DISCONTINUED", "ON_HOLD"]} />
      </Section>

      <Section title="PRN / Instructions">
        <Check label="PRN Medication" checked={form.is_prn} onChange={(v) => update("is_prn", v)} />
        {form.is_prn && (
          <TextArea label="PRN Reason / Parameters" value={form.prn_reason} onChange={(v) => update("prn_reason", v)} />
        )}
        <TextArea label="Administration Instructions" value={form.instructions} onChange={(v) => update("instructions", v)} />
        <TextArea label="Known Side Effects / Monitoring Notes" value={form.side_effects} onChange={(v) => update("side_effects", v)} />
        <Check label="Allergies Reviewed" checked={form.allergies_reviewed} onChange={(v) => update("allergies_reviewed", v)} />
      </Section>

      <Section title="Prescriber / Pharmacy">
        <Input label="Prescriber Name" value={form.prescriber_name} onChange={(v) => update("prescriber_name", v)} />
        <Input label="Prescriber Phone" value={form.prescriber_phone} onChange={(v) => update("prescriber_phone", v)} />
        <Input label="Pharmacy Name" value={form.pharmacy_name} onChange={(v) => update("pharmacy_name", v)} />
        <Input label="Pharmacy Phone" value={form.pharmacy_phone} onChange={(v) => update("pharmacy_phone", v)} />
      </Section>

      <div className="assessment-actions">
        <button type="button" className="primary-btn" disabled={saving} onClick={saveOrder}>
          {saving ? "Saving..." : "Save Medication Order"}
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
    <label className="document-check-option">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}