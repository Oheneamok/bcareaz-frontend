import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

export default function GeneralConsentPage({
  resident = {},
  facility = {},
  signatures = {},
  onSignatureChange,
}) {
  const patientSigRef = useRef(null);
  const guardianSigRef = useRef(null);
  const witnessSigRef = useRef(null);
  const interpreterSigRef = useRef(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const facilityName = facility.name || "Facility Name";

  const patientName =
    signatures.patient_name ||
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  function updateField(key, value) {
    onSignatureChange?.(key, value);
  }

  function saveSignature(type, ref) {
    if (!ref.current || ref.current.isEmpty()) return;
    onSignatureChange?.(type, ref.current.toDataURL("image/png"));
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
          <h1>General Consent for Treatment</h1>
          <p>{facilityName}</p>
        </div>

        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>General Consent for Treatment</h2>

        <ol className="document-numbered-list">
          <li>
            I am asking for behavioral health services and treatment at this
            facility ({facilityName}) and agree to accept services and
            procedures to treat my condition and routine dental and medical
            care, including vaccination. I understand that these services will
            be provided to me by Medical Practitioners, Registered Nurses,
            Counselors, Psychiatrists, Therapists, Dieticians, Behavioral Health
            Professionals, Behavioral Health Technicians, Behavioral Health
            Paraprofessionals and other health care providers, some of whom may
            be in training. I have not been given any guarantees as to the
            results of the services I will receive.
          </li>

          <li>
            I understand that my agreement to accept these services will remain
            in effect unless I say that I no longer want these services or until
            my treatment is completed.
          </li>

          <li>
            I understand that my agreement to accept these services is called a
            General Consent and that it includes any routine procedure(s) or
            treatment(s) such as behavioral examination, administration of
            medication(s), taking X-rays and other non-invasive procedures.
          </li>
        </ol>

        <SignatureRow
          nameLabel="Name of Patient"
          nameValue={patientName}
          onNameChange={(v) => updateField("patient_name", v)}
          signatureLabel="Patient Signature / Mark"
          savedSignature={signatures.patient}
          sigRef={patientSigRef}
          onSave={() => saveSignature("patient", patientSigRef)}
          onClear={() => clearSignature("patient", patientSigRef)}
          dateValue={signatures.patient_date || today}
          onDateChange={(v) => updateField("patient_date", v)}
        />

        <p className="document-note">
          If the patient cannot consent for him/herself, the signature of either
          the health care agent or legal guardian who is acting on behalf of the
          patient, or the patient’s surrogate who is consenting to the treatment
          for the patient, must be obtained.
        </p>

        <SignatureRow
          nameLabel="Name of Health Care Agent / Legal Guardian"
          nameValue={
            signatures.guardian_name ||
            resident.guardian_name ||
            ""
          }
          onNameChange={(v) => updateField("guardian_name", v)}
          signatureLabel="Health Care Agent / Legal Guardian Signature"
          savedSignature={signatures.guardian}
          sigRef={guardianSigRef}
          onSave={() => saveSignature("guardian", guardianSigRef)}
          onClear={() => clearSignature("guardian", guardianSigRef)}
          dateValue={signatures.guardian_date || today}
          onDateChange={(v) => updateField("guardian_date", v)}
        />

        <p className="document-note">
          (Place a copy of the authorizing document in the medical record)
        </p>

        <h3>Witness</h3>

        <p className="document-inline-paragraph">
          I,{" "}
          <InlineInput
            value={signatures.witness_name || ""}
            onChange={(v) => updateField("witness_name", v)}
            placeholder="Witness Name / Title"
          />{" "}
          am a staff member who is not the patient’s physician or authorized
          health care provider and I have witnessed the patient or other
          appropriate person voluntarily sign this form.
        </p>

        <SignatureRow
          nameLabel="Signature and Title of Witness"
          nameValue={signatures.witness_name || ""}
          onNameChange={(v) => updateField("witness_name", v)}
          signatureLabel="Witness Signature"
          savedSignature={signatures.witness}
          sigRef={witnessSigRef}
          onSave={() => saveSignature("witness", witnessSigRef)}
          onClear={() => clearSignature("witness", witnessSigRef)}
          dateValue={signatures.witness_date || today}
          onDateChange={(v) => updateField("witness_date", v)}
        />

        <h3>Interpreter / Translator</h3>

        <p>
          To be signed by the interpreter/translator if the patient required
          such assistance. To the best of my knowledge the patient understood
          what was interpreted/translated and voluntarily signed this form.
        </p>

        <SignatureRow
          nameLabel="Name of Interpreter / Translator"
          nameValue={signatures.interpreter_name || ""}
          onNameChange={(v) => updateField("interpreter_name", v)}
          signatureLabel="Interpreter / Translator Signature"
          savedSignature={signatures.interpreter}
          sigRef={interpreterSigRef}
          onSave={() => saveSignature("interpreter", interpreterSigRef)}
          onClear={() => clearSignature("interpreter", interpreterSigRef)}
          dateValue={signatures.interpreter_date || ""}
          onDateChange={(v) => updateField("interpreter_date", v)}
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
          <button type="button" onClick={onSave}>
            Save Signature
          </button>
          <button type="button" onClick={onClear}>
            <Eraser size={14} />
            Clear
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