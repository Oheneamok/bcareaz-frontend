import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

const belongingsItems = [
  "Socks/stockings",
  "Underpants",
  "Bras",
  "Pants",
  "Skirts",
  "Shorts",
  "Dresses",
  "Shirts",
  "Blouses",
  "Shoes",
  "Sneakers",
  "Jackets",
  "Suits",
  "Jeans",
  "Necklace",
  "Earrings",
  "Bracelets",
  "Watches",
  "Housecoat",
  "Pajamas",
  "Slips",
  "Sweater",
  "Underwear",
  "Purses",
  "Cell phone",
  "Finger ring",
  "Pins",
  "Eyeglasses",
  "Hearing Aids",
  "Cane/Walker",
  "Wheelchair",
  "Television",
  "Radio/DVD/CD",
  "Checkbook",
  "Credit Card",
  "Pictures/Frames",
  "Bathrobe",
  "Belt",
  "Coat",
  "Hat",
  "Nightgown",
  "Necktie",
  "Slippers",
  "Suspenders",
  "Undershirt",
  "Toothbrush",
  "Backpack",
  "Crutches",
  "Other",
];

export default function PersonalBelongingsPage({
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

  const belongings = signatures.belongings || {};

  function updateField(key, value) {
    onSignatureChange?.(key, value);
  }

  function updateBelonging(item, value) {
    updateField("belongings", {
      ...belongings,
      [item]: value,
    });
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
          <p className="dashboard-eyebrow">Admission Inventory</p>
          <h1>Resident Personal Belongings</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Resident Personal Belongings</h2>

        <div className="document-form-grid">
          <Field
            label="Resident Name"
            value={residentName}
            onChange={(v) => updateField("resident_name", v)}
          />
          <Field
            label="Date of Admission"
            type="date"
            value={signatures.admission_date || resident.admission_date || today}
            onChange={(v) => updateField("admission_date", v)}
          />
        </div>

        <div className="belongings-grid">
          {belongingsItems.map((item) => (
            <div className="belonging-item" key={item}>
              <label>{item}</label>
              <input
                type="number"
                min="0"
                value={belongings[item] || ""}
                onChange={(e) => updateBelonging(item, e.target.value)}
                placeholder="#"
              />
            </div>
          ))}
        </div>

        <p>
          Statement: I have read and agree that this is an accurate reflection of
          my belongings on the day and date that I was admitted into{" "}
          {facilityName}.
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