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

  const today = useMemo(() => new Date().toLocaleDateString(), []);

  const facilityName = facility.name || "Facility Name";
  const residentName =
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

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

        <p>
          I, <span className="inline-blank">{residentName || "______________________________"}</span>{" "}
          authorize {facilityName} to provide Evaluation and Treatment Services
          to <span className="inline-blank">{residentName || "______________________________"}</span>.
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
          <li>
            The intended outcome, nature, and procedure of the proposed
            treatment.
          </li>
          <li>
            Any risk and side effects of the proposed treatment, including any
            risks of not proceeding with the proposed treatment.
          </li>
          <li>The alternatives to the proposed treatment.</li>
        </ol>

        <p>
          Informed consent is voluntary and may be withheld at any time.
        </p>

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

        <div className="signature-line-grid">
          <TextLine label="Resident Name" value={residentName} />
          <SignatureBox
            label="Resident Signature / Mark"
            savedSignature={signatures.resident}
            sigRef={residentSigRef}
            onSave={() => saveSignature("resident", residentSigRef)}
            onClear={() => clearSignature("resident", residentSigRef)}
          />
          <TextLine label="Date" value={today} />
        </div>

        <div className="signature-line-grid">
          <TextLine
            label="Resident Agent / Guardian Name"
            value={resident.guardian_name || ""}
          />
          <SignatureBox
            label="Resident Agent / Guardian Signature"
            savedSignature={signatures.guardian}
            sigRef={guardianSigRef}
            onSave={() => saveSignature("guardian", guardianSigRef)}
            onClear={() => clearSignature("guardian", guardianSigRef)}
          />
          <TextLine label="Date" value={today} />
        </div>

        <div className="signature-line-grid">
          <TextLine
            label="Staff Name"
            value={signatures.staff_name || ""}
          />
          <SignatureBox
            label="Staff Signature"
            savedSignature={signatures.staff}
            sigRef={staffSigRef}
            onSave={() => saveSignature("staff", staffSigRef)}
            onClear={() => clearSignature("staff", staffSigRef)}
          />
          <TextLine label="Date" value={today} />
        </div>
      </div>
    </div>
  );
}

function TextLine({ label, value }) {
  return (
    <div className="document-line-field">
      <div className="document-line-value">{value || "\u00A0"}</div>
      <div className="document-line-label">{label}</div>
    </div>
  );
}

function SignatureBox({ label, savedSignature, sigRef, onSave, onClear }) {
  return (
    <div className="document-signature-field">
      <div className="signature-pad-mini">
        {savedSignature ? (
          <img src={savedSignature} alt={label} />
        ) : (
          <SignatureCanvas
            ref={sigRef}
            penColor="#0f172a"
            canvasProps={{ className: "signature-canvas-mini" }}
          />
        )}
      </div>

      <div className="document-line-label">{label}</div>

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
  );
}