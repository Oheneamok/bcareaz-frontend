import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

const infoOptions = [
  "Assessment Information",
  "Treatment Plan(s)",
  "Progress Notes",
  "Treatment Summary",
  "Discharge Summary",
  "Other",
];

export default function ReleaseOfInformationPage({
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

  function updateField(key, value) {
    onSignatureChange?.(key, value);
  }

  function toggleInfo(option) {
    const current = signatures.information_released || [];
    const next = current.includes(option)
      ? current.filter((x) => x !== option)
      : [...current, option];

    updateField("information_released", next);
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
          <h1>Release of Information</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Release of Information</h2>

        <div className="document-form-grid">
          <Field label="Resident Name" value={residentName} onChange={(v) => updateField("resident_name", v)} />
          <Field label="Date of Birth" type="date" value={signatures.date_of_birth || resident.date_of_birth || ""} onChange={(v) => updateField("date_of_birth", v)} />
          <Field label="Address" value={signatures.address || resident.address || ""} onChange={(v) => updateField("address", v)} />
          <Field label="City" value={signatures.city || resident.city || ""} onChange={(v) => updateField("city", v)} />
          <Field label="State" value={signatures.state || resident.state || "AZ"} onChange={(v) => updateField("state", v)} />
          <Field label="Zip" value={signatures.zip || resident.zip_code || ""} onChange={(v) => updateField("zip", v)} />
          <Field label="Home Phone" value={signatures.home_phone || resident.home_phone || ""} onChange={(v) => updateField("home_phone", v)} />
          <Field label="Cell Phone" value={signatures.cell_phone || resident.cell_phone || resident.phone || ""} onChange={(v) => updateField("cell_phone", v)} />
        </div>

        <p className="document-inline-paragraph">
          I, <InlineInput value={signatures.authorizing_person_name || residentName} onChange={(v) => updateField("authorizing_person_name", v)} placeholder="Authorizing Person" /> authorize{" "}
          <InlineInput value={signatures.disclosing_party || facilityName} onChange={(v) => updateField("disclosing_party", v)} placeholder="Facility / Provider" /> to disclose the following information:
        </p>

        <div className="document-checkbox-grid">
          {infoOptions.map((option) => (
            <label key={option} className="document-check-option">
              <input
                type="checkbox"
                checked={(signatures.information_released || []).includes(option)}
                onChange={() => toggleInfo(option)}
              />
              {option}
            </label>
          ))}
        </div>
		<SimpleLineField
		  label="Purpose of Disclosure"
		  value={signatures.purpose || ""}
		  onChange={(v) => updateField("purpose", v)}
		/>

		<SimpleLineField
		  label="Individual or agency to which information is to be released"
		  value={signatures.release_to || ""}
		  onChange={(v) => updateField("release_to", v)}
		/>

		<SimpleLineField
		  label="Description of information to be released"
		  value={signatures.description || ""}
		  onChange={(v) => updateField("description", v)}
		/>
        <p>
          {facilityName} is hereby released from any and all legal liability that
          may arise from the disclosure of the information requested. I certify
          that this request for disclosure has been made freely and voluntarily.
          I understand that I may revoke this authorization at any time, except
          that action has already been taken on the consent.
        </p>

        <p>
          I understand that my records are protected under federal regulations
          42 CFR Part 2, governing confidentiality and cannot be disclosed
          without my written consent unless otherwise provided for in the
          regulations. I also understand that I may revoke this consent at any
          time except to the extent that action has been taken in reliance on it,
          and that in any event this consent expires automatically in six months
          from the date this form is signed.
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

function SimpleLineField({ label, value, onChange }) {
  return (
    <div className="document-simple-line">
      <label>{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
function InlineInput({ value, onChange, placeholder }) {
  return <input className="document-inline-input" value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="document-field">
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
      />
      <label>{label}</label>
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