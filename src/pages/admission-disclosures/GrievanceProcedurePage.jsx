import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

const grievanceSteps = [
  "The Resident or designated representative can notify any staff member, Program Manager, the Grievance Coordinator, or the Administrator of the situation.",
  "Once the complaint or grievance has been made, the grievance coordinator will contact the individual to get further details in writing; the case will be assigned a tracking number.",
  "The grievance coordinator will interview all parties involved and any witnesses to the event.",
  "The document shall contain the person’s name, date filed, detailed description, witnesses, injuries or medical intervention, police involvement, who was notified, and a detailed summary of the resolution.",
  "The facility shall attempt to remedy the situation.",
  "The individual will have a written response within five (5) business days starting from the date of receiving the complaint or grievance.",
  "If the remedy is satisfactory to both parties, the matter will be considered closed.",
  "If the decision is not satisfactory to the resident, the facility may ask for a five (5) day extension to continue working on the issue.",
  "Once the situation has been resolved all parties shall sign off attesting that they agree with the remedy.",
  "All grievance/complaints shall be reviewed by the risk management team.",
  "There shall be a central log kept in the administration office.",
  "Copies shall be sent to the individual, his/her designated representative if applicable, and the Governing Agency.",
  "The complaint or grievance shall be maintained for three (3) years from the date of resolution.",
];

export default function GrievanceProcedurePage({
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
          <h1>Resident Complaint / Grievance Procedure</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Resident Complaint / Grievance Procedure</h2>

        <p>
          This procedure outlines the steps necessary for Residents to address a
          grievance:
        </p>

        <ol className="document-numbered-list">
          {grievanceSteps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>

        <p>
          In the event the resident is not satisfied with the decision made by{" "}
          {facilityName}, a formal complaint may be filed with the Office of
          Behavioral Health Licensure. Residents may at any time during the
          grievance process notify the following agency of their complaint:
        </p>

        <div className="document-alert-box">
          <strong>Arizona Department of Health Services</strong>
          <p>Bureau of Residential Facilities Licensing</p>
          <p>150 N. 18th Ave; Suite 410</p>
          <p>Phoenix, AZ 85007</p>
          <p>(602) 364-2639</p>
        </div>

        <p>
          <strong>Note:</strong> A Resident shall not be discriminated against,
          threatened in any way, manner or form, prohibited, reprised or
          retaliated against because the Resident has filed a grievance within or
          outside the agency.
        </p>

        <p>
          <strong>Note:</strong> Policies and Procedures regarding filing of
          grievances will be explained to the Resident, parent, guardian, or
          designated representative at the time of admission.
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
            <SignatureCanvas ref={sigRef} penColor="#0f172a" canvasProps={{ className: "document-signature-canvas" }} />
          )}
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