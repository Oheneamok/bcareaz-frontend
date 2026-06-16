import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

export default function ConfidentialityPage({
  resident = {},
  facility = {},
  signatures = {},
  onSignatureChange,
}) {
  const clientSigRef = useRef(null);
  const staffSigRef = useRef(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const facilityName = facility.name || "Facility Name";

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
          <h1>Confidentiality and Exceptions to Confidentiality</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Confidentiality and Exceptions to Confidentiality</h2>

        <p>
          It is the policy of {facilityName} to protect the confidentiality of
          all Residents by not releasing privileged information on any specific
          Resident without that Resident’s written consent.
        </p>

        <p>
          The Resident’s right to confidentiality will be protected at all times
          by all {facilityName} staff members. All staff will receive orientation
          and training on confidentiality requirements. All personnel shall be
          made aware that the obligation to maintain confidentiality exists
          during and after their employment with the agency. All staff will be
          made aware that violation of this policy may be cause for dismissal.
        </p>

        <p>
          No Resident’s record, partial or complete, active or closed, will be
          taken off the facility grounds at any time. Only assigned staff will
          have access to Resident records.
        </p>

        <p>
          All forms, documents notations, and other documentation pertaining to a
          Resident will be filed immediately in the Resident’s file.
        </p>

        <p>
          Information about a Resident may only be released by the Administrator
          or Clinical Director. The Resident’s file will be copied only with the
          approval of the Administrator or Clinical Director, or with signed
          release from the Resident and/or designee.
        </p>

        <p>
          Conversations about Residents will be confidential and limited to areas
          not accessible to other Residents, family members or visitors.
        </p>

        <p>
          I have read and understand the above policy and procedure regarding
          confidentiality and agree to follow this procedure as outlined by{" "}
          {facilityName}.
        </p>

        <SignatureRow
          nameLabel="Client Name"
          nameValue={
            signatures.client_name ||
            `${resident.first_name || ""} ${resident.last_name || ""}`.trim()
          }
          onNameChange={(v) => updateField("client_name", v)}
          signatureLabel="Client Signature / Mark"
          savedSignature={signatures.resident}
          sigRef={clientSigRef}
          onSave={() => saveSignature("resident", clientSigRef)}
          onClear={() => clearSignature("resident", clientSigRef)}
          dateValue={signatures.resident_date || today}
          onDateChange={(v) => updateField("resident_date", v)}
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