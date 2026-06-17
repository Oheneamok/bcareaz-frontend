import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
<<<<<<< HEAD
import { Eraser, FileSignature } from "lucide-react";
=======
import {
  Eraser,
  FileSignature,
  User,
  Phone,
  HeartPulse,
  Shield,
  Stethoscope,
  Scale,
} from "lucide-react";
>>>>>>> 2f4ee9c (adding to edit)

export default function ResidentFaceSheetPage({
  resident = {},
  facility = {},
  signatures = {},
  onSignatureChange,
}) {
  const staffSigRef = useRef(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const facilityName = facility.name || "Facility Name";

<<<<<<< HEAD
  function value(...items) {
    return items.find((x) => x !== undefined && x !== null && x !== "") || "";
  }

  function updateField(key, val) {
    onSignatureChange?.(key, val);
=======
  const residentName =
    signatures.resident_name ||
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  function updateField(key, value) {
    onSignatureChange?.(key, value);
>>>>>>> 2f4ee9c (adding to edit)
  }

  function saveSignature(type, ref) {
    if (!ref.current || ref.current.isEmpty()) return;
    onSignatureChange?.(type, ref.current.toDataURL("image/png"));
  }

  function clearSignature(type, ref) {
    ref.current?.clear();
    onSignatureChange?.(type, "");
  }

<<<<<<< HEAD
  const residentName = value(
    signatures.resident_name,
    resident.full_name,
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim()
  );

=======
>>>>>>> 2f4ee9c (adding to edit)
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
<<<<<<< HEAD
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
=======
        <h2>Resident Admission Face Sheet</h2>

        <FaceSheetSection title="Resident Demographics" icon={<User />}>
          <Display label="Resident Name" value={residentName} />
          <Display label="Nickname" value={resident.nickname} />
          <Display label="Date of Birth" value={resident.date_of_birth} />
          <Display label="Admission Date" value={resident.admission_date} />
          <Display label="Gender" value={resident.gender} />
          <Display label="SSN" value={resident.social_security} />
          <Display label="Race" value={resident.race} />
          <Display label="Hispanic" value={resident.hispanic} />
          <Display label="Citizenship" value={resident.citizenship} />
          <Display label="Marital Status" value={resident.marital_status} />
          <Display label="Religion" value={resident.religious_preference} />
          <Display label="Height" value={resident.height} />
          <Display label="Weight" value={resident.weight} />
          <Display label="Hair Color" value={resident.hair_color} />
          <Display label="Eye Color" value={resident.eye_color} />
        </FaceSheetSection>

        <FaceSheetSection title="Contact Information" icon={<Phone />}>
          <Display label="Street Address" value={resident.street_address || resident.address} full />
          <Display label="City" value={resident.city} />
          <Display label="State" value={resident.state} />
          <Display label="Zip Code" value={resident.zip_code} />
          <Display label="Home Phone" value={resident.home_phone} />
          <Display label="Cell Phone" value={resident.cell_phone || resident.phone} />
          <Display label="Work Phone" value={resident.work_phone} />
          <Display label="Email" value={resident.email} />
          <Display label="Preferred Language" value={signatures.preferred_language} />
          <Display label="Interpreter Needed" value={signatures.interpreter_needed ? "Yes" : "No"} />
        </FaceSheetSection>

        <FaceSheetSection title="Guardian / Responsible Party" icon={<Shield />}>
          <Display label="Guardian Name" value={resident.guardian_name} />
          <Display label="No Guardian Assigned" value={resident.no_guardian_assigned ? "Yes" : "No"} />
          <Display label="Home Phone" value={resident.guardian_home_phone} />
          <Display label="Cell Phone" value={resident.guardian_cell_phone || resident.guardian_phone} />
          <Display label="Work Phone" value={resident.guardian_work_phone} />
          <Display label="Email" value={resident.guardian_email} />
          <Display label="Address" value={resident.guardian_address} full />
          <Display label="City" value={resident.guardian_city} />
          <Display label="State" value={resident.guardian_state} />
          <Display label="Zip" value={resident.guardian_zip} />
          <Display label="Legal Guardian" value={signatures.legal_guardian ? "Yes" : "No"} />
          <Display label="POA / Health Care Agent" value={signatures.health_care_agent ? "Yes" : "No"} />
        </FaceSheetSection>

        <FaceSheetSection title="Emergency Contacts" icon={<Phone />}>
          <Display label="Emergency Contact" value={resident.emergency_contact_name} />
          <Display label="Relationship" value={resident.emergency_contact_relationship} />
          <Display label="Home Phone" value={resident.emergency_contact_home_phone} />
          <Display label="Cell Phone" value={resident.emergency_contact_cell_phone} />
          <Display label="Work Phone" value={resident.emergency_contact_work_phone} />
          <Display label="Email" value={resident.emergency_contact_email} />
          <Display label="Address" value={resident.emergency_contact_address} full />
          <Display label="Additional Contact 1" value={resident.additional_contact_1_name} />
          <Display label="Relationship" value={resident.additional_contact_1_relationship} />
          <Display label="Phone" value={resident.additional_contact_1_phone} />
          <Display label="Email" value={resident.additional_contact_1_email} />
          <Display label="Additional Contact 2" value={resident.additional_contact_2_name} />
          <Display label="Relationship" value={resident.additional_contact_2_relationship} />
          <Display label="Phone" value={resident.additional_contact_2_phone} />
          <Display label="Email" value={resident.additional_contact_2_email} />
        </FaceSheetSection>

        <FaceSheetSection title="Insurance / Health Plan" icon={<Shield />}>
          <Display label="Health Plan" value={resident.health_plan} />
          <Display label="Plan Name" value={resident.plan_name} />
          <Display label="Member / Plan ID" value={resident.health_plan_id} />
          <Display label="Plan Phone" value={resident.plan_phone} />
          <Display label="Plan Provider" value={resident.plan_provider} />
          <Display label="Provider Phone" value={resident.plan_provider_phone} />
          <Display label="Provider ID Number" value={resident.plan_provider_id_number} />
          <Display label="Funding Source" value={signatures.funding_source} />
        </FaceSheetSection>

        <FaceSheetSection title="Medical Information" icon={<HeartPulse />}>
          <Display label="Primary Diagnosis" value={resident.primary_diagnosis || resident.diagnosis} full />
          <Display label="Secondary Diagnosis" value={signatures.secondary_diagnosis} full />
          <Display label="Allergies" value={resident.allergies} full />
          <Display label="Reaction / Special Instructions" value={resident.allergy_reaction_instructions} full />
          <Display label="Seizure Disorder" value={resident.seizure_disorder ? "Yes" : "No"} />
          <Display label="TB Status" value={signatures.tb_status} />
          <Display label="Physical Exam Date" value={signatures.physical_exam_date} />
          <Display label="Mobility Issues" value={signatures.mobility_issues} full />
          <Display label="Diet Restrictions" value={signatures.diet_restrictions} full />
          <Display label="Special Accommodations" value={signatures.special_accommodations} full />
        </FaceSheetSection>

        <FaceSheetSection title="Medical Providers" icon={<Stethoscope />}>
          <Display label="PCP Name" value={resident.pcp_name} />
          <Display label="PCP Phone" value={resident.pcp_phone} />
          <Display label="PCP Address" value={resident.pcp_address} full />
          <Display label="PCP City" value={resident.pcp_city} />
          <Display label="PCP State" value={resident.pcp_state} />
          <Display label="PCP Zip" value={resident.pcp_zip} />
          <Display label="Behavioral Health Provider" value={resident.behavioral_health_provider_name} />
          <Display label="Provider Phone" value={resident.behavioral_health_provider_phone} />
          <Display label="Provider Address" value={resident.behavioral_health_provider_address} full />
          <Display label="Therapist" value={resident.therapist_name} />
          <Display label="Therapist Phone" value={resident.therapist_phone} />
          <Display label="Dentist" value={resident.dentist_name} />
          <Display label="Dentist Phone" value={resident.dentist_phone} />
        </FaceSheetSection>

        <FaceSheetSection title="Pharmacy / Hospital Preference" icon={<HeartPulse />}>
          <Display label="Pharmacy Name" value={resident.pharmacy_name || signatures.pharmacy_name} />
          <Display label="Pharmacy Phone" value={resident.pharmacy_phone || signatures.pharmacy_phone} />
          <Display label="Pharmacy Address" value={resident.pharmacy_address || signatures.pharmacy_address} full />
          <Display label="Preferred Hospital / Urgent Care" value={resident.hospital_preference} full />
        </FaceSheetSection>

        <FaceSheetSection title="Legal / Case Management" icon={<Scale />}>
          <Display label="Case Manager" value={resident.case_manager_name} />
          <Display label="Case Manager Phone" value={resident.case_manager_cell_phone || resident.case_manager_home_phone} />
          <Display label="Case Manager Email" value={resident.case_manager_email} />
          <Display label="Case Manager Address" value={resident.case_manager_address} full />
          <Display label="Parole Officer" value={resident.parole_officer_name} />
          <Display label="Parole Officer Phone" value={resident.parole_officer_cell_phone || resident.parole_officer_home_phone} />
          <Display label="Parole Officer Email" value={resident.parole_officer_email} />
          <Display label="Parole Officer Address" value={resident.parole_officer_address} full />
          <Display label="Court Ordered" value={signatures.court_ordered ? "Yes" : "No"} />
          <Display label="Referral Source" value={signatures.referral_source} />
          <Display label="Placing Agency" value={signatures.placing_agency} />
        </FaceSheetSection>

        <div className="document-alert-box">
          Staff review confirms this Face Sheet was completed from the admission
>>>>>>> 2f4ee9c (adding to edit)
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

<<<<<<< HEAD
function FaceSheetSection({ title, children }) {
  return (
    <section className="facesheet-section">
      <h3>{title}</h3>
=======
function FaceSheetSection({ title, icon, children }) {
  return (
    <section className="facesheet-section premium-facesheet-section">
      <div className="facesheet-section-title">
        <span>{icon}</span>
        <h3>{title}</h3>
      </div>
>>>>>>> 2f4ee9c (adding to edit)
      <div className="facesheet-grid">{children}</div>
    </section>
  );
}

<<<<<<< HEAD
function DisplayField({ label, value, full }) {
=======
function Display({ label, value, full }) {
>>>>>>> 2f4ee9c (adding to edit)
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