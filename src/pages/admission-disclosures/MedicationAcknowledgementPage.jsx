import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature, Plus, Trash2 } from "lucide-react";

const emptyMedication = {
  medication: "",
  dose: "",
  schedule: "",
  target: "",
  count: "",
};

export default function MedicationAcknowledgementPage({
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
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  const psychMeds = signatures.psych_medications || [{ ...emptyMedication }];
  const medicalMeds = signatures.medical_medications || [{ ...emptyMedication }];

  function updateField(key, value) {
    onSignatureChange?.(key, value);
  }

  function updateMedication(section, index, field, value) {
    const rows = [...(signatures[section] || [])];
    rows[index] = { ...(rows[index] || {}), [field]: value };
    updateField(section, rows);
  }

  function addMedication(section) {
    updateField(section, [...(signatures[section] || []), { ...emptyMedication }]);
  }

  function removeMedication(section, index) {
    updateField(section, (signatures[section] || []).filter((_, i) => i !== index));
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
          <p className="dashboard-eyebrow">Admission Medication Verification</p>
          <h1>List of Medication</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>List of Medication</h2>

        <p>I have been instructed by staff on the current prescribed medications that I am taking.</p>

        <p>Instruction includes:</p>

        <ul className="document-bullet-list">
          <li>Dosage/route of medication</li>
          <li>Use of medication/anticipated results</li>
          <li>Common side effects</li>
          <li>Adverse reactions</li>
          <li>Potential risk of not taking medications as prescribed</li>
        </ul>

        <MedicationTable
          title="Psych Medication(s)"
          rows={psychMeds}
          onAdd={() => addMedication("psych_medications")}
          onUpdate={(index, field, value) =>
            updateMedication("psych_medications", index, field, value)
          }
          onRemove={(index) => removeMedication("psych_medications", index)}
        />

        <MedicationTable
          title="Medical Medication(s)"
          rows={medicalMeds}
          onAdd={() => addMedication("medical_medications")}
          onUpdate={(index, field, value) =>
            updateMedication("medical_medications", index, field, value)
          }
          onRemove={(index) => removeMedication("medical_medications", index)}
        />

        <div className="document-simple-line">
          <label>Allergies:</label>
          <input
            value={signatures.allergies || resident.allergies || ""}
            onChange={(e) => updateField("allergies", e.target.value)}
          />
        </div>

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

function MedicationTable({ title, rows, onAdd, onUpdate, onRemove }) {
  return (
    <div className="document-table-card">
      <div className="document-table-header">
        <h3>{title}</h3>
        <button type="button" onClick={onAdd}>
          <Plus size={14} />
          Add Medication
        </button>
      </div>

      <div className="medication-table">
        <div className="medication-table-row header">
          <strong>Medication</strong>
          <strong>Dose</strong>
          <strong>Schedule</strong>
          <strong>Target</strong>
          <strong>Count</strong>
          <strong></strong>
        </div>

        {rows.map((row, index) => (
          <div className="medication-table-row" key={index}>
            <input
              value={row.medication || ""}
              onChange={(e) => onUpdate(index, "medication", e.target.value)}
            />
            <input
              value={row.dose || ""}
              onChange={(e) => onUpdate(index, "dose", e.target.value)}
            />
            <input
              value={row.schedule || ""}
              onChange={(e) => onUpdate(index, "schedule", e.target.value)}
            />
            <input
              value={row.target || ""}
              onChange={(e) => onUpdate(index, "target", e.target.value)}
            />
            <input
              value={row.count || ""}
              onChange={(e) => onUpdate(index, "count", e.target.value)}
            />
            <button type="button" onClick={() => onRemove(index)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignatureRow({
  nameLabel,
  nameValue,
  onNameChange,
  signatureLabel,
  savedSignature,
  sigRef,
  onSave,
  onClear,
  dateValue,
  onDateChange,
}) {
  return (
    <div className="document-signature-row">
      <div className="document-field">
        <input value={nameValue || ""} onChange={(e) => onNameChange(e.target.value)} />
        <label>{nameLabel}</label>
      </div>

      <div className="document-signature-pad-field">
        <div className="document-signature-pad">
          {savedSignature ? (
            <img src={savedSignature} alt={signatureLabel} />
          ) : (
            <SignatureCanvas
              ref={sigRef}
              penColor="#0f172a"
              canvasProps={{ className: "document-signature-canvas" }}
            />
          )}
        </div>
        <label>{signatureLabel}</label>
        <div className="signature-tools">
          <button type="button" onClick={onSave}>Save Signature</button>
          <button type="button" onClick={onClear}>
            <Eraser size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="document-field">
        <input type="date" value={dateValue || ""} onChange={(e) => onDateChange(e.target.value)} />
        <label>Date</label>
      </div>
    </div>
  );
}