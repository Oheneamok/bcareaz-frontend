import { useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

export default function NotificationOfFeesPage({
  resident = {},
  facility = {},
  signatures = {},
  onSignatureChange,
}) {
  const residentSigRef = useRef(null);
  const guardianSigRef = useRef(null);
  const staffSigRef = useRef(null);

  const [monthlyRate, setMonthlyRate] = useState(signatures.monthly_rate || "");

  const today = useMemo(() => new Date().toLocaleDateString(), []);

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

  function saveMonthlyRate(value) {
    setMonthlyRate(value);
    onSignatureChange?.("monthly_rate", value);
  }

  return (
    <div className="disclosure-document-page">
      <div className="disclosure-document-header">
        <div>
          <p className="dashboard-eyebrow">Admission Disclosure</p>
          <h1>Notification of Fees</h1>
          <p>{facility.name || "Facility Name"}</p>
        </div>

        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Notification of Fees</h2>

        <p>
          As you may be aware, there are expenses related to your stay within
          the agency. These fees or day rate are covered by the agency that
          placed you here.
        </p>

        <p>
          The monthly rate charged for the services, accommodations, lodging,
          board, and related care costs is $
          <input
            className="inline-document-input money"
            value={monthlyRate}
            onChange={(e) => saveMonthlyRate(e.target.value)}
            placeholder="__________"
          />{" "}
          (30%) based on SSI/SSD award letter.
        </p>

        <p>
          Should this rate increase, the new daily rate will be posted in a
          prominent place within the house and available for your review and the
          review of your guardian or designated representative. This posting will
          occur no later than 30 days before the change becomes effective.
        </p>

        <p>
          Additionally, a letter will be presented to you addressing the new
          daily rate and one mailed to your placing agency representative also
          within 30 days prior to the change becoming effective.
        </p>

        <p>
          Your signature below indicates your understanding of the above daily
          fee rate policy.
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
          <TextLine label="Staff Name" value={signatures.staff_name || ""} />
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