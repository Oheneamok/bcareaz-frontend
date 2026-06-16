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
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const residentName =
    signatures.resident_name ||
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  const guardianName =
    signatures.guardian_name || resident.guardian_name || "";

  function updateField(key, value) {
    onSignatureChange?.(key, value);
  }

  function saveMonthlyRate(value) {
    setMonthlyRate(value);
    updateField("monthly_rate", value);
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

        <p className="document-inline-paragraph">
          The monthly rate charged for the services, accommodations, lodging,
          board, and related care costs is $
          <InlineInput
            value={monthlyRate}
            onChange={saveMonthlyRate}
            placeholder="Monthly Rate"
            small
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

function InlineInput({ value, onChange, placeholder, small }) {
  return (
    <input
      className={`document-inline-input ${small ? "small" : ""}`}
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