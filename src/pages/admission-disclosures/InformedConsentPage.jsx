import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

export default function InformedConsentPage({
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

  const guardianName =
    signatures.guardian_name || resident.guardian_name || "";

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
          <h1>Informed Consent for Treatment</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Informed Consent for Treatment</h2>

		<p className="document-inline-paragraph">
		  I,
		  <InlineInput
			value={signatures.authorizing_person_name || ""}
			onChange={(v) =>
			  updateField("authorizing_person_name", v)
			}
			placeholder="Guardian / Health Care Agent / Resident"
		  />
		  authorize {facilityName} to provide Evaluation and Treatment Services to
		  <InlineInput
			value={residentName}
			onChange={(v) =>
			  updateField("resident_name", v)
			}
			placeholder="Resident Name"
		  />
		  .
		</p>

        <p>
          Informed consent for treatment is obtained from a Resident, or if
          applicable, the Resident’s agent before a Resident receives a specific
          treatment or a change in treatment for which informed consent has not
          yet been obtained.
        </p>

        <p>
          Prior to signing this form, {facilityName} staff member will explain
          the following items to the Resident:
        </p>

        <ol className="document-numbered-list">
          <li>The specific treatment being proposed for the Resident.</li>
          <li>The intended outcome, nature, and procedure of the proposed treatment.</li>
          <li>
            Any risk and side effects of the proposed treatment, including any
            risks of not proceeding with the proposed treatment.
          </li>
          <li>The alternatives to the proposed treatment.</li>
        </ol>

        <p>Informed consent is voluntary and may be withheld at any time.</p>

        <p>
          I agree to participate in my treatment planning process to the best of
          my ability and will let my provider know if situations occur that
          prevent me from participating in treatment.
        </p>

        <p>
          I understand that all the information gathered in the course of my
          treatment is confidential. However, confidential information may be
          disclosed without my consent in accordance with the State and Federal
          Law. The agency will provide services related to meeting the goals of
          the Resident’s proposed treatment plan.
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
          nameValue={guardianName}
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

function InlineInput({ value, onChange, placeholder }) {
  return (
    <input
      className="document-inline-input"
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
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