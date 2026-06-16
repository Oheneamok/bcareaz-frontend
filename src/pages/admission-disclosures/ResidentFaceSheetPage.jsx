import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

export default function ResidentFaceSheetPage({
  resident = {},
  facility = {},
  signatures = {},
  onSignatureChange,
}) {
  const staffSigRef = useRef(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const facilityName = facility.name || "Facility Name";

  function value(...items) {
    return items.find((x) => x !== undefined && x !== null && x !== "") || "";
  }

  function updateField(key, val) {
    onSignatureChange?.(key, val);
  }

  function saveSignature(type, ref) {
    if (!ref.current || ref.current.isEmpty()) return;
    onSignatureChange?.(type, ref.current.toDataURL("image/png"));
  }

  function clearSignature(type, ref) {
    ref.current?.clear();
    onSignatureChange?.(type, "");
  }

  const residentName = value(
    signatures.resident_name,
    resident.full_name,
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim()
  );

  return (
    <div className="disclosure-document-page">
      <div className="disclosure-document-header">
        <div>
          <p className="dashboard-eyebrow">Admission Record</p>
          <h1>Resident Face Sheet</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Resident Face Sheet</h2>

        <FaceSheetSection title="Resident Demographics">
          <DisplayField label="Resident Name" value={residentName} />
          <DisplayField label="Nickname" value={resident.nickname} />
          <DisplayField label="Date of Birth" value={resident.date_of_birth} />
          <DisplayField label="Admission Date" value={resident.admission_date} />
          <DisplayField label="Gender" value={resident.gender} />
          <DisplayField label="Social Security" value={resident.social_security} />
          <DisplayField label="Citizenship" value={resident.citizenship} />
          <DisplayField label="Marital Status" value={resident.marital_status} />
          <DisplayField label="Race" value={resident.race} />
          <DisplayField label="Hispanic" value={resident.hispanic} />
          <DisplayField label="Religious Preference" value={resident.religious_preference} />
          <DisplayField label="Height" value={resident.height} />
          <DisplayField label="Weight" value={resident.weight} />
          <DisplayField label="Eye Color" value={resident.eye_color} />
          <DisplayField label="Hair Color" value={resident.hair_color} />
        </FaceSheetSection>

        <FaceSheetSection title="Address & Contact">
          <DisplayField label="Street Address" value={resident.street_address || resident.address} />
          <DisplayField label="City" value={resident.city} />
          <DisplayField label="State" value={resident.state} />
          <DisplayField label="Zip Code" value={resident.zip_code} />
          <DisplayField label="Home Phone" value={resident.home_phone} />
          <DisplayField label="Cell Phone" value={resident.cell_phone || resident.phone} />
          <DisplayField label="Work Phone" value={resident.work_phone} />
          <DisplayField label="Email" value={resident.email} />
        </FaceSheetSection>

        <FaceSheetSection title="Insurance / Health Plan">
          <DisplayField label="Health Plan" value={resident.health_plan} />
          <DisplayField label="Health Plan ID" value={resident.health_plan_id} />
          <DisplayField label="Plan Name" value={resident.plan_name} />
          <DisplayField label="Plan Phone" value={resident.plan_phone} />
          <DisplayField label="Plan Provider" value={resident.plan_provider} />
          <DisplayField label="Provider Phone" value={resident.plan_provider_phone} />
          <DisplayField label="Provider ID Number" value={resident.plan_provider_id_number} />
        </FaceSheetSection>

        <FaceSheetSection title="Diagnosis / Allergies">
          <DisplayField label="Primary Diagnosis" value={resident.primary_diagnosis || resident.diagnosis} full />
          <DisplayField label="Seizure Disorder" value={resident.seizure_disorder ? "Yes" : "No"} />
          <DisplayField label="Allergies" value={resident.allergies} full />
          <DisplayField label="Reaction / Special Instructions" value={resident.allergy_reaction_instructions} full />
        </FaceSheetSection>

        <FaceSheetSection title="Primary Care Physician">
          <DisplayField label="PCP Name" value={resident.pcp_name} />
          <DisplayField label="PCP Phone" value={resident.pcp_phone} />
          <DisplayField label="PCP Address" value={resident.pcp_address} />
          <DisplayField label="PCP City" value={resident.pcp_city} />
          <DisplayField label="PCP State" value={resident.pcp_state} />
          <DisplayField label="PCP Zip" value={resident.pcp_zip} />
        </FaceSheetSection>

        <FaceSheetSection title="Behavioral Health / Psychiatric Provider">
          <DisplayField label="Provider Name" value={resident.behavioral_health_provider_name} />
          <DisplayField label="Provider Phone" value={resident.behavioral_health_provider_phone} />
          <DisplayField label="Provider Address" value={resident.behavioral_health_provider_address} />
          <DisplayField label="Provider City" value={resident.behavioral_health_provider_city} />
          <DisplayField label="Provider State" value={resident.behavioral_health_provider_state} />
          <DisplayField label="Provider Zip" value={resident.behavioral_health_provider_zip} />
          <DisplayField label="Therapist Name" value={resident.therapist_name} />
          <DisplayField label="Therapist Phone" value={resident.therapist_phone} />
        </FaceSheetSection>

        <FaceSheetSection title="Pharmacy / Hospital Preference">
          <DisplayField label="Preferred Hospital / Urgent Care" value={resident.hospital_preference} />
          <DisplayField label="Pharmacy Name" value={resident.pharmacy_name || signatures.pharmacy_name} />
          <DisplayField label="Pharmacy Phone" value={resident.pharmacy_phone || signatures.pharmacy_phone} />
          <DisplayField label="Pharmacy Address" value={resident.pharmacy_address || signatures.pharmacy_address} full />
        </FaceSheetSection>

        <FaceSheetSection title="Guardian / Responsible Person">
          <DisplayField label="Guardian Name" value={resident.guardian_name} />
          <DisplayField label="No Guardian Assigned" value={resident.no_guardian_assigned ? "Yes" : "No"} />
          <DisplayField label="Home Phone" value={resident.guardian_home_phone} />
          <DisplayField label="Cell Phone" value={resident.guardian_cell_phone || resident.guardian_phone} />
          <DisplayField label="Work Phone" value={resident.guardian_work_phone} />
          <DisplayField label="Email" value={resident.guardian_email} />
          <DisplayField label="Address" value={resident.guardian_address} />
          <DisplayField label="City" value={resident.guardian_city} />
          <DisplayField label="State" value={resident.guardian_state} />
          <DisplayField label="Zip" value={resident.guardian_zip} />
        </FaceSheetSection>

        <FaceSheetSection title="Emergency Contact">
          <DisplayField label="Name" value={resident.emergency_contact_name} />
          <DisplayField label="Relationship" value={resident.emergency_contact_relationship} />
          <DisplayField label="Home Phone" value={resident.emergency_contact_home_phone} />
          <DisplayField label="Cell Phone" value={resident.emergency_contact_cell_phone} />
          <DisplayField label="Work Phone" value={resident.emergency_contact_work_phone} />
          <DisplayField label="Email" value={resident.emergency_contact_email} />
          <DisplayField label="Address" value={resident.emergency_contact_address} full />
        </FaceSheetSection>

        <FaceSheetSection title="Case Manager / Parole Officer">
          <DisplayField label="Case Manager" value={resident.case_manager_name} />
          <DisplayField label="Case Manager Phone" value={resident.case_manager_cell_phone || resident.case_manager_home_phone} />
          <DisplayField label="Case Manager Email" value={resident.case_manager_email} />
          <DisplayField label="Parole Officer" value={resident.parole_officer_name} />
          <DisplayField label="Parole Officer Phone" value={resident.parole_officer_cell_phone || resident.parole_officer_home_phone} />
          <DisplayField label="Parole Officer Email" value={resident.parole_officer_email} />
        </FaceSheetSection>

        <div className="document-alert-box">
          Staff review confirms this face sheet was completed from the admission
          information provided and should be kept in the resident chart.
        </div>

        <SignatureRow
          nameLabel="Staff Name"
          nameValue={signatures.staff_name || ""}
          onNameChange={(v) => updateField("staff_name", v)}
          signatureLabel="Staff Review Signature"
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

function FaceSheetSection({ title, children }) {
  return (
    <section className="facesheet-section">
      <h3>{title}</h3>
      <div className="facesheet-grid">{children}</div>
    </section>
  );
}

function DisplayField({ label, value, full }) {
  return (
    <div className={`facesheet-field ${full ? "full" : ""}`}>
      <span>{label}</span>
      <strong>{value || "—"}</strong>
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
        <input value={nameValue || ""} onChange={(e) => onNameChange(e.target.value)} />
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
        <input type="date" value={dateValue || ""} onChange={(e) => onDateChange(e.target.value)} />
        <label>Date</label>
      </div>
    </div>
  );
}