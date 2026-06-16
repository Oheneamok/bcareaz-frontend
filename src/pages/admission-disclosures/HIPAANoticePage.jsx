import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

export default function HIPAANoticePage({
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
          <p className="dashboard-eyebrow">HIPAA Acknowledgement</p>
          <h1>Notice of Privacy Practices</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>HIPAA Notice of Privacy Practices Acknowledgement</h2>

        <p>
          I acknowledge that I have been offered and/or received a copy of{" "}
          {facilityName}'s Notice of Privacy Practices. The Notice explains how
          my health information may be used and disclosed, and how I may access
          this information.
        </p>

        <p>
          I understand that my health information, including behavioral health
          records, medical records, treatment information, billing information,
          and other protected health information, will be handled according to
          applicable privacy laws and facility policy.
        </p>

        <p>I understand that the Notice describes my rights, including:</p>

        <ul className="document-bullet-list">
          <li>The right to request access to my health records.</li>
          <li>The right to request corrections to my health information.</li>
          <li>The right to request confidential communications.</li>
          <li>The right to request restrictions on certain uses or disclosures.</li>
          <li>The right to receive an accounting of certain disclosures.</li>
          <li>The right to receive a paper copy of the Notice.</li>
          <li>The right to file a complaint if I believe my privacy rights have been violated.</li>
        </ul>

        <p>
          I understand that {facilityName} may use and disclose my protected
          health information for treatment, payment, health care operations, and
          as otherwise permitted or required by law.
        </p>

        <p>
          I understand that signing this acknowledgement does not mean I am
          giving permission for all disclosures. It only confirms that I was
          offered and/or received the Notice of Privacy Practices.
        </p>

        <div className="document-form-grid">
          <Field
            label="Resident Name"
            value={residentName}
            onChange={(v) => updateField("resident_name", v)}
          />

          <Field
            label="Notice Provided By"
            value={signatures.notice_provided_by || ""}
            onChange={(v) => updateField("notice_provided_by", v)}
          />

          <Field
            label="Method Provided"
            value={signatures.method_provided || ""}
            onChange={(v) => updateField("method_provided", v)}
            placeholder="Paper copy, electronic copy, verbal offer, etc."
          />
        </div>

        <div className="document-check-panel">
          <label>
            <input
              type="checkbox"
              checked={!!signatures.received_notice}
              onChange={(e) => updateField("received_notice", e.target.checked)}
            />
            Resident/guardian received or was offered the Notice of Privacy
            Practices.
          </label>

          <label>
            <input
              type="checkbox"
              checked={!!signatures.questions_answered}
              onChange={(e) => updateField("questions_answered", e.target.checked)}
            />
            Resident/guardian had an opportunity to ask questions.
          </label>
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

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div className="document-field">
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
      />
      <label>{label}</label>
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
          <button type="button" onClick={onSave}>
            Save Signature
          </button>
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