import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { FileSignature, Eraser } from "lucide-react";

const orientationSections = [
  {
    title: "Facility Introduction",
    items: [
      "Introduced to Administrator",
      "Introduced to House Manager",
      "Introduced to Direct Care Staff",
      "Tour of Facility Completed",
      "Bedroom Assigned",
      "Facility Phone Procedures Reviewed",
    ],
  },
  {
    title: "Resident Rights & Responsibilities",
    items: [
      "Resident Rights Reviewed",
      "Resident Responsibilities Reviewed",
      "Confidentiality Policy Reviewed",
      "Grievance Procedure Reviewed",
      "HIPAA Notice Reviewed",
    ],
  },
  {
    title: "Safety & Emergency Procedures",
    items: [
      "Emergency Exits Reviewed",
      "Fire Evacuation Procedures Reviewed",
      "Disaster Procedures Reviewed",
      "Emergency Contact Procedures Reviewed",
      "No Harm Agreement Reviewed",
      "Search & Seizure Policy Reviewed",
    ],
  },
  {
    title: "Daily Living Expectations",
    items: [
      "House Rules Reviewed",
      "Smoking Policy Reviewed",
      "Curfew Reviewed",
      "Meal Schedule Reviewed",
      "Laundry Schedule Reviewed",
      "Visitor Policy Reviewed",
      "Pass Authorization Procedures Reviewed",
      "Chore Schedule Reviewed",
    ],
  },
  {
    title: "Clinical & Medical Services",
    items: [
      "Medication Procedures Reviewed",
      "Medication Storage Reviewed",
      "Medication Side Effects Reviewed",
      "Treatment Plan Process Reviewed",
      "CFT Process Reviewed",
      "Counseling Schedule Reviewed",
      "Psychiatric Services Reviewed",
      "Medical Appointment Procedures Reviewed",
    ],
  },
  {
    title: "Personal Property & Funds",
    items: [
      "Personal Belongings Inventory Completed",
      "Resident Funds Procedures Reviewed",
      "Account Balance Sheet Reviewed",
      "Valuables Storage Procedures Reviewed",
    ],
  },
];

export default function ClientOrientationChecklistPage({
  resident = {},
  facility = {},
  signatures = {},
  onSignatureChange,
}) {
  const residentSigRef = useRef(null);
  const guardianSigRef = useRef(null);
  const staffSigRef = useRef(null);

  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const facilityName = facility.name || "Facility Name";

  const residentName =
    signatures.resident_name ||
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  function updateField(key, value) {
    onSignatureChange?.(key, value);
  }

  function toggleItem(item) {
    const current = signatures.orientation_items || [];

    const next = current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item];

    updateField("orientation_items", next);
  }

  function saveSignature(type, ref) {
    if (!ref.current || ref.current.isEmpty()) return;

    onSignatureChange?.(
      type,
      ref.current.toDataURL("image/png")
    );
  }

  function clearSignature(type, ref) {
    ref.current?.clear();
    onSignatureChange?.(type, "");
  }

  const completed =
    signatures.orientation_items?.length || 0;

  const total = orientationSections.reduce(
    (acc, section) => acc + section.items.length,
    0
  );

  return (
    <div className="disclosure-document-page">
      <div className="disclosure-document-header">
        <div>
          <p className="dashboard-eyebrow">
            Admission Orientation
          </p>

          <h1>Client Orientation Checklist</h1>

          <p>{facilityName}</p>
        </div>

        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <div className="orientation-summary-card">
          <div>
            <h3>Orientation Progress</h3>
            <p>
              Complete all items before orientation
              sign-off.
            </p>
          </div>

          <div className="orientation-progress">
            {completed}/{total}
          </div>
        </div>

        <div className="document-form-grid">
          <Field
            label="Resident Name"
            value={residentName}
            onChange={(v) =>
              updateField("resident_name", v)
            }
          />

          <Field
            label="Orientation Date"
            type="date"
            value={
              signatures.orientation_date || today
            }
            onChange={(v) =>
              updateField("orientation_date", v)
            }
          />
        </div>

        {orientationSections.map((section) => (
          <div
            className="orientation-section"
            key={section.title}
          >
            <h3>{section.title}</h3>

            <div className="orientation-checklist">
              {section.items.map((item) => (
                <label
                  className="orientation-check-item"
                  key={item}
                >
                  <input
                    type="checkbox"
                    checked={(
                      signatures.orientation_items || []
                    ).includes(item)}
                    onChange={() => toggleItem(item)}
                  />

                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="document-alert-box">
          Resident acknowledges that the above
          orientation topics have been reviewed and
          explained by staff.
        </div>

        <SignatureRow
          nameLabel="Resident Name"
          nameValue={residentName}
          onNameChange={(v) =>
            updateField("resident_name", v)
          }
          signatureLabel="Resident Signature / Mark"
          savedSignature={signatures.resident}
          sigRef={residentSigRef}
          onSave={() =>
            saveSignature("resident", residentSigRef)
          }
          onClear={() =>
            clearSignature("resident", residentSigRef)
          }
          dateValue={
            signatures.resident_date || today
          }
          onDateChange={(v) =>
            updateField("resident_date", v)
          }
        />

        <SignatureRow
          nameLabel="Guardian Name"
          nameValue={
            signatures.guardian_name ||
            resident.guardian_name ||
            ""
          }
          onNameChange={(v) =>
            updateField("guardian_name", v)
          }
          signatureLabel="Guardian Signature"
          savedSignature={signatures.guardian}
          sigRef={guardianSigRef}
          onSave={() =>
            saveSignature("guardian", guardianSigRef)
          }
          onClear={() =>
            clearSignature("guardian", guardianSigRef)
          }
          dateValue={
            signatures.guardian_date || today
          }
          onDateChange={(v) =>
            updateField("guardian_date", v)
          }
        />

        <SignatureRow
          nameLabel="Staff Name"
          nameValue={
            signatures.staff_name || ""
          }
          onNameChange={(v) =>
            updateField("staff_name", v)
          }
          signatureLabel="Staff Signature"
          savedSignature={signatures.staff}
          sigRef={staffSigRef}
          onSave={() =>
            saveSignature("staff", staffSigRef)
          }
          onClear={() =>
            clearSignature("staff", staffSigRef)
          }
          dateValue={
            signatures.staff_date || today
          }
          onDateChange={(v) =>
            updateField("staff_date", v)
          }
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="document-field">
      <input
        type={type}
        value={value || ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
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
          onChange={(e) =>
            onNameChange(e.target.value)
          }
        />
        <label>{nameLabel}</label>
      </div>

      <div className="document-signature-pad-field">
        <div className="document-signature-pad">
          {savedSignature ? (
            <img
              src={savedSignature}
              alt={signatureLabel}
            />
          ) : (
            <SignatureCanvas
              ref={sigRef}
              penColor="#0f172a"
              canvasProps={{
                className:
                  "document-signature-canvas",
              }}
            />
          )}
        </div>

        <label>{signatureLabel}</label>

        <div className="signature-tools">
          <button
            type="button"
            onClick={onSave}
          >
            Save Signature
          </button>

          <button
            type="button"
            onClick={onClear}
          >
            <Eraser size={14} />
            Clear
          </button>
        </div>
      </div>

      <div className="document-field">
        <input
          type="date"
          value={dateValue || ""}
          onChange={(e) =>
            onDateChange(e.target.value)
          }
        />
        <label>Date</label>
      </div>
    </div>
  );
}