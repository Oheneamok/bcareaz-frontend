import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

const responsibilities = [
  "Give information needed for your care to the staff.",
  "Follow instructions and guidelines from the staff.",
  "Try to remember the names of your clinical staff.",
  "With assistance from the staff, you will schedule appointments during regular office hours when possible, to limit the use of Urgent Care and Emergency Room facilities.",
  "Arrive on time for your appointments.",
  "Tell providers if you must cancel an appointment at least one hour before appointment time.",
  "Participate in creating your Service Plan.",
  "Be aware of your rights.",
  "Assist staff in moving towards your recovery.",
  "Take proper care of yourself and shower daily.",
  "Treat others with respect, work cooperatively with others, and learn to live in harmony like one family.",
];

export default function ResidentResponsibilitiesPage({
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

  function updateField(key, value) {
    onSignatureChange?.(key, value);
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
          <h1>Resident Responsibilities</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Resident Responsibilities</h2>

        <ol className="document-numbered-list">
          {responsibilities.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>

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
        <input
          value={nameValue || ""}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={nameLabel}
        />
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
        <input
          type="date"
          value={dateValue || ""}
          onChange={(e) => onDateChange(e.target.value)}
        />
        <label>Date</label>
      </div>
    </div>
  );
}