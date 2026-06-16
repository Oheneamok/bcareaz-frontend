import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature, Plus, Trash2 } from "lucide-react";

export default function EmergencyMedicalConsentPage({
  resident = {},
  facility = {},
  signatures = {},
  onSignatureChange,
}) {
  const residentSigRef = useRef(null);
  const guardianSigRef = useRef(null);
  const staffSigRef = useRef(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const facilityName = facility.name || "Facility Name";

  const residentName =
    signatures.resident_name ||
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  const medicationAllergies = signatures.medication_allergies || [{ item: "", reaction: "" }];
  const foodAllergies = signatures.food_allergies || [{ item: "", reaction: "" }];

  function updateField(key, value) {
    onSignatureChange?.(key, value);
  }

  function updateRow(key, index, field, value) {
    const rows = [...(signatures[key] || [])];
    rows[index] = { ...(rows[index] || {}), [field]: value };
    updateField(key, rows);
  }

  function addRow(key) {
    updateField(key, [...(signatures[key] || []), { item: "", reaction: "" }]);
  }

  function removeRow(key, index) {
    updateField(key, (signatures[key] || []).filter((_, i) => i !== index));
  }

  function saveSignature(type, ref) {
    if (!ref.current || ref.current.isEmpty()) return;
    onSignatureChange?.(type, ref.current.toDataURL());
  }

  function clearSignature(type, ref) {
    ref.current?.clear();
    onSignatureChange?.(type, "");
  }

  return (
    <div className="disclosure-document-page">
      <div className="disclosure-document-header">
        <div>
          <p className="dashboard-eyebrow">Admission Disclosure</p>
          <h1>Routine & Emergency Medical Treatment</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Consent for Routine & Emergency Medical Treatment</h2>

        <p>
          I hereby give consent to {facilityName} to obtain all emergency medical
          or dental care prescribed by a duly licensed physician (MD), Osteopath
          (DO) or dentist (D.D.S) for:
        </p>

        <div className="document-form-grid">
          <Field label="Resident Name" value={residentName} onChange={(v) => updateField("resident_name", v)} />
          <Field label="DOB" type="date" value={signatures.date_of_birth || resident.date_of_birth || ""} onChange={(v) => updateField("date_of_birth", v)} />
        </div>

        <p>
          This care may be given under whatever conditions are necessary to
          preserve the life, limb or the well-being of the person named above.
        </p>

        <AllergyTable
          title="Medication Allergies"
          rows={medicationAllergies}
          onAdd={() => addRow("medication_allergies")}
          onUpdate={(i, f, v) => updateRow("medication_allergies", i, f, v)}
          onRemove={(i) => removeRow("medication_allergies", i)}
        />

        <AllergyTable
          title="Food Allergies"
          rows={foodAllergies}
          onAdd={() => addRow("food_allergies")}
          onUpdate={(i, f, v) => updateRow("food_allergies", i, f, v)}
          onRemove={(i) => removeRow("food_allergies", i)}
        />

        <p>
          I have been informed that I/we may be responsible for any charges or
          co-pays not covered by insurance in connection with the treatment or
          services being rendered.
        </p>

        <SignatureRow
          nameLabel="Resident Name"
          nameValue={residentName}
          onNameChange={(v) => updateField("resident_name", v)}
          signatureLabel="Resident Signature / Mark"
          savedSignature={signatures.resident}
          sigRef={residentSigRef}
          onSave={() => saveSignature("resident", residentSigRef)}
          onClear={() => clearSignature("resident", residentSigRef)}
          dateValue={signatures.resident_date || today}
          onDateChange={(v) => updateField("resident_date", v)}
        />

        <SignatureRow
          nameLabel="Resident Agent / Guardian Name"
          nameValue={signatures.guardian_name || resident.guardian_name || ""}
          onNameChange={(v) => updateField("guardian_name", v)}
          signatureLabel="Resident Agent / Guardian Signature"
          savedSignature={signatures.guardian}
          sigRef={guardianSigRef}
          onSave={() => saveSignature("guardian", guardianSigRef)}
          onClear={() => clearSignature("guardian", guardianSigRef)}
          dateValue={signatures.guardian_date || today}
          onDateChange={(v) => updateField("guardian_date", v)}
        />

        <SignatureRow
          nameLabel="Staff Name"
          nameValue={signatures.staff_name || ""}
          onNameChange={(v) => updateField("staff_name", v)}
          signatureLabel="Staff Signature"
          savedSignature={signatures.staff}
          sigRef={staffSigRef}
          onSave={() => saveSignature("staff", staffSigRef)}
          onClear={() => clearSignature("staff", staffSigRef)}
          dateValue={signatures.staff_date || today}
          onDateChange={(v) => updateField("staff_date", v)}
        />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="document-field">
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={label} />
      <label>{label}</label>
    </div>
  );
}

function AllergyTable({ title, rows, onAdd, onUpdate, onRemove }) {
  return (
    <div className="document-table-card">
      <div className="document-table-header">
        <h3>{title}</h3>
        <button type="button" onClick={onAdd}><Plus size={14} /> Add Row</button>
      </div>

      <div className="document-table">
        <div className="document-table-row header">
          <strong>Allergy</strong>
          <strong>Reaction</strong>
          <strong></strong>
        </div>

        {rows.map((row, index) => (
          <div className="document-table-row" key={index}>
            <input value={row.item || ""} onChange={(e) => onUpdate(index, "item", e.target.value)} />
            <input value={row.reaction || ""} onChange={(e) => onUpdate(index, "reaction", e.target.value)} />
            <button type="button" onClick={() => onRemove(index)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignatureRow({
  nameLabel, nameValue, onNameChange, signatureLabel, savedSignature,
  sigRef, onSave, onClear, dateValue, onDateChange,
}) {
  return (
    <div className="document-signature-row">
      <div className="document-field">
        <input value={nameValue || ""} onChange={(e) => onNameChange(e.target.value)} placeholder={nameLabel} />
        <label>{nameLabel}</label>
      </div>
      <div className="document-signature-pad-field">
        <div className="document-signature-pad">
          {savedSignature ? <img src={savedSignature} alt={signatureLabel} /> : <SignatureCanvas ref={sigRef} penColor="#0f172a" canvasProps={{ className: "document-signature-canvas" }} />}
        </div>
        <label>{signatureLabel}</label>
        <div className="signature-tools">
          <button type="button" onClick={onSave}>Save Signature</button>
          <button type="button" onClick={onClear}><Eraser size={14} /> Clear</button>
        </div>
      </div>
      <div className="document-field">
        <input type="date" value={dateValue || ""} onChange={(e) => onDateChange(e.target.value)} />
        <label>Date</label>
      </div>
    </div>
  );
}