import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  UserPlus,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Users,
  X,
  User,
  HeartPulse,
  Phone,
  ClipboardCheck,
  FileSignature,
} from "lucide-react";

import api from "../services/api";
import SignatureCanvas from "react-signature-canvas";

const emptyForm = {
  first_name: "",
  last_name: "",
  nickname: "",
  date_of_birth: "",
  admission_date: "",

  street_address: "",
  city: "",
  state: "AZ",
  zip_code: "",

  home_phone: "",
  cell_phone: "",
  work_phone: "",
  email: "",
  social_security: "",

  health_plan: "AHCCCS",
  health_plan_id: "",
  plan_name: "",
  plan_phone: "",

  gender: "",
  height: "",
  weight: "",
  eye_color: "",
  hair_color: "",

  citizenship: "United States",
  marital_status: "",
  race: "",
  hispanic: "",
  religious_preference: "",

  primary_diagnosis: "",
  seizure_disorder: false,
  allergies: "",
  allergy_reaction_instructions: "",

  pcp_name: "",
  pcp_phone: "",
  pcp_address: "",
  pcp_city: "",
  pcp_state: "AZ",
  pcp_zip: "",

  hospital_preference: "",

  behavioral_health_provider_name: "",
  behavioral_health_provider_phone: "",
  behavioral_health_provider_address: "",
  behavioral_health_provider_city: "",
  behavioral_health_provider_state: "AZ",
  behavioral_health_provider_zip: "",

  therapist_name: "",
  therapist_phone: "",
  therapist_address: "",
  therapist_city: "",
  therapist_state: "AZ",
  therapist_zip: "",

  dentist_name: "",
  dentist_phone: "",
  dentist_address: "",
  dentist_city: "",
  dentist_state: "AZ",
  dentist_zip: "",

  plan_provider: "",
  plan_provider_phone: "",
  plan_provider_id_number: "",

  guardian_name: "",
  guardian_home_phone: "",
  guardian_cell_phone: "",
  guardian_work_phone: "",
  guardian_email: "",
  guardian_address: "",
  guardian_city: "",
  guardian_state: "AZ",
  guardian_zip: "",
  no_guardian_assigned: false,

  emergency_contact_name: "",
  emergency_contact_relationship: "",
  emergency_contact_home_phone: "",
  emergency_contact_cell_phone: "",
  emergency_contact_work_phone: "",
  emergency_contact_email: "",
  emergency_contact_address: "",
  emergency_contact_city: "",
  emergency_contact_state: "AZ",
  emergency_contact_zip: "",

  case_manager_name: "",
  case_manager_home_phone: "",
  case_manager_cell_phone: "",
  case_manager_work_phone: "",
  case_manager_email: "",
  case_manager_address: "",
  case_manager_city: "",
  case_manager_state: "AZ",
  case_manager_zip: "",

  parole_officer_name: "",
  parole_officer_home_phone: "",
  parole_officer_cell_phone: "",
  parole_officer_work_phone: "",
  parole_officer_email: "",
  parole_officer_address: "",

  additional_contact_1_name: "",
  additional_contact_1_relationship: "",
  additional_contact_1_phone: "",
  additional_contact_1_email: "",

  additional_contact_2_name: "",
  additional_contact_2_relationship: "",
  additional_contact_2_phone: "",
  additional_contact_2_email: "",

  admission_disclosure_signatures: {},

  status: "ACTIVE",
};

const wizardSteps = [
  { label: "Face Sheet", icon: User },
  { label: "Health Care", icon: HeartPulse },
  { label: "Contacts", icon: Phone },
  { label: "Disclosures", icon: FileSignature },
  { label: "Review & Admit", icon: ClipboardCheck },
];

export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResidents();
  }, []);

  async function loadResidents() {
    try {
      setLoading(true);
      const res = await api.get("/residents");
      setResidents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createResident(e) {
    e.preventDefault();

    if (!form.first_name || !form.last_name || !form.admission_date) {
      alert("First name, last name, and admission date are required.");
      return;
    }

    try {
      setSaving(true);

      const disclosureSignatures = form.admission_disclosure_signatures || {};
      const disclosureKeys = Object.keys(disclosureSignatures);
      const unsignedRequired = disclosureKeys.filter(
        (key) => !disclosureSignatures[key]?.resident_signature
      );

      if (disclosureKeys.length === 0 || unsignedRequired.length > 0) {
        alert("All required admission disclosures must be opened, reviewed, and signed before admission can be completed.");
        return;
      }

      const res = await api.post("/residents", {
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender,
        phone: form.cell_phone || form.home_phone,
        email: form.email,
        admission_date: form.admission_date || null,
        status: form.status,
        address: buildAddress(
          form.street_address,
          form.city,
          form.state,
          form.zip_code
        ),
        diagnosis: form.primary_diagnosis,
        guardian_name: form.guardian_name,
        guardian_phone: form.guardian_cell_phone || form.guardian_home_phone,
        guardian_relationship: form.no_guardian_assigned
          ? "No guardian assigned"
          : "Legal Guardian",
        form_data: form,
      });

      const newResidentId = res.data.id;

      await api.post(`/admission-disclosures/generate/${newResidentId}`);

      const disclosureListRes = await api.get(
        `/admission-disclosures?resident_id=${newResidentId}`
      );

      const generatedDisclosures = disclosureListRes.data || [];

      for (const disclosure of generatedDisclosures) {
        const signatures = disclosureSignatures[disclosure.disclosure_type];

        if (!signatures) continue;

        await api.patch(`/admission-disclosures/${disclosure.id}/sign`, {
          resident_signature: signatures.resident_signature,
          guardian_signature: signatures.guardian_signature,
          staff_signature: signatures.staff_signature,
          metadata_json: {
            admission_signed_before_create: true,
            disclosure_title: disclosure.title,
          },
        });

        await api.get(`/admission-disclosures/${disclosure.id}/pdf`);
      }

      setForm(emptyForm);
      setStep(0);
      setShowAddModal(false);
      await loadResidents();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to create resident.");
    } finally {
      setSaving(false);
    }
  }

  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      const fullName = `${resident.first_name || ""} ${
        resident.last_name || ""
      }`.toLowerCase();
      const query = search.toLowerCase();

      const matchesSearch =
        fullName.includes(query) ||
        resident.resident_code?.toLowerCase().includes(query) ||
        resident.phone?.toLowerCase().includes(query);

      const matchesStatus = status ? resident.status === status : true;

      return matchesSearch && matchesStatus;
    });
  }, [residents, search, status]);

  return (
    <div className="residents-page">
      <section className="resident-hero">
        <div>
          <p className="dashboard-eyebrow">Resident Census</p>
          <h1>Residents</h1>
          <p>
            Manage resident profiles, admissions, clinical records, health care
            contacts, documents, compliance, and care coordination.
          </p>
        </div>

        <button className="primary-action" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} />
          Admit Resident
        </button>
      </section>

      <section className="resident-summary-grid">
        <SummaryCard title="Total Residents" value={residents.length} icon={<Users />} />
        <SummaryCard
          title="Active Residents"
          value={residents.filter((r) => r.is_active).length}
          icon={<ShieldCheck />}
        />
        <SummaryCard
          title="Inactive / Discharged"
          value={
            residents.filter((r) => !r.is_active || r.status === "DISCHARGED")
              .length
          }
          icon={<AlertTriangle />}
        />
      </section>

      <section className="resident-toolbar">
        <div className="resident-search">
          <Search size={18} />
          <input
            placeholder="Search by name, resident code, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DISCHARGED">Discharged</option>
          <option value="INACTIVE">Inactive</option>
          <option value="PENDING">Pending</option>
        </select>
      </section>

      <section className="premium-table-card">
        <div className="table-header">
          <div>
            <h3>Resident Census</h3>
            <p>{filteredResidents.length} resident record(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="table-empty">Loading residents...</div>
        ) : filteredResidents.length === 0 ? (
          <div className="table-empty">No residents found.</div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>Admission Date</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredResidents.map((resident) => (
                  <tr key={resident.id}>
                    <td>
                      <div className="resident-cell">
                        <div className="resident-avatar">
                          {getInitials(resident)}
                        </div>
                        <div>
                          <strong>
                            {resident.first_name} {resident.last_name}
                          </strong>
                          <p>{resident.resident_code || resident.id}</p>
                        </div>
                      </div>
                    </td>

                    <td>{formatDate(resident.date_of_birth)}</td>
                    <td>{resident.gender || "—"}</td>
                    <td>{formatDate(resident.admission_date)}</td>

                    <td>
                      <span className={`status-badge ${resident.status?.toLowerCase()}`}>
                        {resident.status || "UNKNOWN"}
                      </span>
                    </td>

                    <td>{resident.phone || "—"}</td>

                    <td>
                      <Link className="table-action" to={`/residents/${resident.id}`}>
                        <Eye size={16} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showAddModal && (
        <AdmissionWizard
          form={form}
          setForm={setForm}
          step={step}
          setStep={setStep}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={createResident}
        />
      )}
    </div>
  );
}

function AdmissionWizard({
  form,
  setForm,
  step,
  setStep,
  saving,
  onClose,
  onSubmit,
}) {
  const CurrentIcon = wizardSteps[step].icon;

  return (
    <div className="modal-backdrop">
      <div className="premium-modal admission-modal">
        <div className="modal-header admission-header">
          <div>
            <p className="dashboard-eyebrow">Resident Admission</p>
            <h2>Admit New Resident</h2>
            <p className="muted">
              Complete face sheet, health care information, and contact records.
            </p>
          </div>

          <button className="icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admission-stepper">
          {wizardSteps.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className={`admission-step step-${index} ${
                  step === index ? "active" : ""
                } ${step > index ? "complete" : ""}`}
                onClick={() => setStep(index)}
              >
                <span>
                  <Icon size={20} />
                </span>
                <strong>{item.label}</strong>
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit}>
          <div className="admission-section-title">
            <span className={`admission-section-icon step-${step}`}>
              <CurrentIcon size={22} />
            </span>
            <div>
              <h3>{wizardSteps[step].label}</h3>
              <p>{getStepDescription(step)}</p>
            </div>
          </div>

          {step === 0 && <FaceSheet form={form} setForm={setForm} />}
          {step === 1 && <HealthCare form={form} setForm={setForm} />}
          {step === 2 && <Contacts form={form} setForm={setForm} />}
          {step === 3 && <AdmissionDisclosuresStep form={form} setForm={setForm} />}
          {step === 4 && <Review form={form} />}

          <div className="wizard-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>

            {step > 0 && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}

            {step < wizardSteps.length - 1 ? (
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  if (step === 3 && !allAdmissionDisclosuresSigned(form)) {
                    alert("Open every required disclosure and capture the resident signature/mark before continuing.");
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Continue
              </button>
            ) : (
              <button className="primary-btn" disabled={saving}>
                {saving ? "Admitting..." : "Admit Resident"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function FaceSheet({ form, setForm }) {
  return (
    <div className="admission-grid">
      <Section title="Resident Identity">
        <Input label="First Name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} required />
        <Input label="Last Name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} required />
        <Input label="Nickname" value={form.nickname} onChange={(v) => setForm({ ...form, nickname: v })} />
        <Input label="Birthdate" type="date" value={form.date_of_birth} onChange={(v) => setForm({ ...form, date_of_birth: v })} />
        <Input label="Admission Date" type="date" value={form.admission_date} onChange={(v) => setForm({ ...form, admission_date: v })} required />
        <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["ACTIVE", "PENDING", "INACTIVE", "DISCHARGED"]} />
      </Section>

      <Section title="Address">
        <Input label="Street Address" value={form.street_address} onChange={(v) => setForm({ ...form, street_address: v })} />
        <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        <Input label="Zip Code" value={form.zip_code} onChange={(v) => setForm({ ...form, zip_code: v })} />
      </Section>

      <Section title="Contact">
        <Input label="Home Phone" value={form.home_phone} onChange={(v) => setForm({ ...form, home_phone: v })} />
        <Input label="Cell Phone" value={form.cell_phone} onChange={(v) => setForm({ ...form, cell_phone: v })} />
        <Input label="Work Phone" value={form.work_phone} onChange={(v) => setForm({ ...form, work_phone: v })} />
        <Input label="Email Address" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Input label="Social Security" value={form.social_security} onChange={(v) => setForm({ ...form, social_security: v })} />
      </Section>

      <Section title="Health Plan">
        <Input label="Health Plan" value={form.health_plan} onChange={(v) => setForm({ ...form, health_plan: v })} />
        <Input label="Health Plan ID" value={form.health_plan_id} onChange={(v) => setForm({ ...form, health_plan_id: v })} />
        <Input label="Plan Name" value={form.plan_name} onChange={(v) => setForm({ ...form, plan_name: v })} />
        <Input label="Plan Phone" value={form.plan_phone} onChange={(v) => setForm({ ...form, plan_phone: v })} />
      </Section>

      <Section title="Demographics">
        <Select label="Gender" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={["", "Female", "Male", "Other"]} />
        <Input label="Height" value={form.height} onChange={(v) => setForm({ ...form, height: v })} />
        <Input label="Weight" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} />
        <Input label="Eye Color" value={form.eye_color} onChange={(v) => setForm({ ...form, eye_color: v })} />
        <Input label="Hair Color" value={form.hair_color} onChange={(v) => setForm({ ...form, hair_color: v })} />
        <Select label="Citizenship" value={form.citizenship} onChange={(v) => setForm({ ...form, citizenship: v })} options={["United States", "Other"]} />
        <Select label="Marital Status" value={form.marital_status} onChange={(v) => setForm({ ...form, marital_status: v })} options={["", "Single", "Married", "Divorced", "Widowed"]} />
        <Input label="Race" value={form.race} onChange={(v) => setForm({ ...form, race: v })} />
        <Select label="Hispanic" value={form.hispanic} onChange={(v) => setForm({ ...form, hispanic: v })} options={["", "Yes", "No"]} />
        <Input label="Religious Preference" value={form.religious_preference} onChange={(v) => setForm({ ...form, religious_preference: v })} />
      </Section>

      <Section title="Clinical Face Sheet">
        <TextArea label="Primary Diagnosis" value={form.primary_diagnosis} onChange={(v) => setForm({ ...form, primary_diagnosis: v })} />
        <Checkbox label="Seizure Disorder" checked={form.seizure_disorder} onChange={(v) => setForm({ ...form, seizure_disorder: v })} />
        <TextArea label="Allergies" value={form.allergies} onChange={(v) => setForm({ ...form, allergies: v })} />
        <TextArea label="Reaction / Special Instructions" value={form.allergy_reaction_instructions} onChange={(v) => setForm({ ...form, allergy_reaction_instructions: v })} />
      </Section>
    </div>
  );
}

function HealthCare({ form, setForm }) {
  return (
    <div className="admission-grid">
      <ProviderSection
        title="Primary Care Physician"
        prefix="pcp"
        form={form}
        setForm={setForm}
      />

      <Section title="Hospital / Urgent Care Preference">
        <Input label="Preferred Hospital/Urgent Care" value={form.hospital_preference} onChange={(v) => setForm({ ...form, hospital_preference: v })} />
      </Section>

      <ProviderSection
        title="Behavioral Health Provider"
        prefix="behavioral_health_provider"
        form={form}
        setForm={setForm}
      />

      <ProviderSection
        title="Therapist"
        prefix="therapist"
        form={form}
        setForm={setForm}
      />

      <ProviderSection
        title="Dentist"
        prefix="dentist"
        form={form}
        setForm={setForm}
      />

      <Section title="Plan Provider">
        <Input label="Plan Provider" value={form.plan_provider} onChange={(v) => setForm({ ...form, plan_provider: v })} />
        <Input label="Phone Number" value={form.plan_provider_phone} onChange={(v) => setForm({ ...form, plan_provider_phone: v })} />
        <Input label="ID Number" value={form.plan_provider_id_number} onChange={(v) => setForm({ ...form, plan_provider_id_number: v })} />
      </Section>
    </div>
  );
}

function Contacts({ form, setForm }) {
  return (
    <div className="admission-grid">
      <Section title="Legal Guardian / Responsible Person">
        <Checkbox label="Individual does not have an assigned guardian" checked={form.no_guardian_assigned} onChange={(v) => setForm({ ...form, no_guardian_assigned: v })} />
        <Input label="Guardian Name" value={form.guardian_name} onChange={(v) => setForm({ ...form, guardian_name: v })} />
        <Input label="Home Phone" value={form.guardian_home_phone} onChange={(v) => setForm({ ...form, guardian_home_phone: v })} />
        <Input label="Cell Phone" value={form.guardian_cell_phone} onChange={(v) => setForm({ ...form, guardian_cell_phone: v })} />
        <Input label="Work Phone" value={form.guardian_work_phone} onChange={(v) => setForm({ ...form, guardian_work_phone: v })} />
        <Input label="Email" value={form.guardian_email} onChange={(v) => setForm({ ...form, guardian_email: v })} />
        <Input label="Street Address" value={form.guardian_address} onChange={(v) => setForm({ ...form, guardian_address: v })} />
        <Input label="City" value={form.guardian_city} onChange={(v) => setForm({ ...form, guardian_city: v })} />
        <Input label="State" value={form.guardian_state} onChange={(v) => setForm({ ...form, guardian_state: v })} />
        <Input label="Zip Code" value={form.guardian_zip} onChange={(v) => setForm({ ...form, guardian_zip: v })} />
      </Section>

      <Section title="Emergency Contact">
        <Input label="Name" value={form.emergency_contact_name} onChange={(v) => setForm({ ...form, emergency_contact_name: v })} />
        <Input label="Relationship" value={form.emergency_contact_relationship} onChange={(v) => setForm({ ...form, emergency_contact_relationship: v })} />
        <Input label="Home Phone" value={form.emergency_contact_home_phone} onChange={(v) => setForm({ ...form, emergency_contact_home_phone: v })} />
        <Input label="Cell Phone" value={form.emergency_contact_cell_phone} onChange={(v) => setForm({ ...form, emergency_contact_cell_phone: v })} />
        <Input label="Work Phone" value={form.emergency_contact_work_phone} onChange={(v) => setForm({ ...form, emergency_contact_work_phone: v })} />
        <Input label="Email" value={form.emergency_contact_email} onChange={(v) => setForm({ ...form, emergency_contact_email: v })} />
        <Input label="Address" value={form.emergency_contact_address} onChange={(v) => setForm({ ...form, emergency_contact_address: v })} />
      </Section>

      <Section title="Case Manager">
        <Input label="Name" value={form.case_manager_name} onChange={(v) => setForm({ ...form, case_manager_name: v })} />
        <Input label="Home Phone" value={form.case_manager_home_phone} onChange={(v) => setForm({ ...form, case_manager_home_phone: v })} />
        <Input label="Cell Phone" value={form.case_manager_cell_phone} onChange={(v) => setForm({ ...form, case_manager_cell_phone: v })} />
        <Input label="Work Phone" value={form.case_manager_work_phone} onChange={(v) => setForm({ ...form, case_manager_work_phone: v })} />
        <Input label="Email" value={form.case_manager_email} onChange={(v) => setForm({ ...form, case_manager_email: v })} />
        <Input label="Address" value={form.case_manager_address} onChange={(v) => setForm({ ...form, case_manager_address: v })} />
      </Section>

      <Section title="Parole Officer">
        <Input label="Name" value={form.parole_officer_name} onChange={(v) => setForm({ ...form, parole_officer_name: v })} />
        <Input label="Home Phone" value={form.parole_officer_home_phone} onChange={(v) => setForm({ ...form, parole_officer_home_phone: v })} />
        <Input label="Cell Phone" value={form.parole_officer_cell_phone} onChange={(v) => setForm({ ...form, parole_officer_cell_phone: v })} />
        <Input label="Work Phone" value={form.parole_officer_work_phone} onChange={(v) => setForm({ ...form, parole_officer_work_phone: v })} />
        <Input label="Email" value={form.parole_officer_email} onChange={(v) => setForm({ ...form, parole_officer_email: v })} />
        <Input label="Address" value={form.parole_officer_address} onChange={(v) => setForm({ ...form, parole_officer_address: v })} />
      </Section>

      <Section title="Additional Contact 1">
        <Input label="Name" value={form.additional_contact_1_name} onChange={(v) => setForm({ ...form, additional_contact_1_name: v })} />
        <Input label="Relationship" value={form.additional_contact_1_relationship} onChange={(v) => setForm({ ...form, additional_contact_1_relationship: v })} />
        <Input label="Phone" value={form.additional_contact_1_phone} onChange={(v) => setForm({ ...form, additional_contact_1_phone: v })} />
        <Input label="Email" value={form.additional_contact_1_email} onChange={(v) => setForm({ ...form, additional_contact_1_email: v })} />
      </Section>

      <Section title="Additional Contact 2">
        <Input label="Name" value={form.additional_contact_2_name} onChange={(v) => setForm({ ...form, additional_contact_2_name: v })} />
        <Input label="Relationship" value={form.additional_contact_2_relationship} onChange={(v) => setForm({ ...form, additional_contact_2_relationship: v })} />
        <Input label="Phone" value={form.additional_contact_2_phone} onChange={(v) => setForm({ ...form, additional_contact_2_phone: v })} />
        <Input label="Email" value={form.additional_contact_2_email} onChange={(v) => setForm({ ...form, additional_contact_2_email: v })} />
      </Section>
    </div>
  );
}


function AdmissionDisclosuresStep({ form, setForm }) {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoadingTemplates(true);
      const res = await api.get("/admission-disclosures/templates");
      setTemplates(res.data || []);
    } catch (err) {
      console.error(err);
      setTemplates(fallbackDisclosureTemplates);
    } finally {
      setLoadingTemplates(false);
    }
  }

  function signatureFor(type) {
    return form.admission_disclosure_signatures?.[type];
  }

  function handleSigned(type, signatureData) {
    setForm({
      ...form,
      admission_disclosure_signatures: {
        ...(form.admission_disclosure_signatures || {}),
        [type]: signatureData,
      },
    });
    setSelectedTemplate(null);
  }

  const signedCount = templates.filter((item) =>
    signatureFor(item.disclosure_type)?.resident_signature
  ).length;

  const totalCount = templates.length;
  const progress = totalCount ? Math.round((signedCount / totalCount) * 100) : 0;
  const completed = totalCount > 0 && signedCount === totalCount;

  return (
    <div className="admission-grid">
      <div className="admission-card admission-disclosure-workspace">
        <div className="admission-disclosure-head">
          <div>
            <h3>Required Admission Disclosures</h3>
            <p className="muted">
              Each disclosure must be opened, reviewed, and signed or marked by
              the resident before admission can be completed. Guardian and staff
              witness signatures may also be captured here.
            </p>
          </div>

          <div className={`disclosure-progress-badge ${completed ? "complete" : ""}`}>
            {signedCount}/{totalCount || 0} Signed
          </div>
        </div>

        <div className="admission-disclosure-progress">
          <div style={{ width: `${progress}%` }} />
        </div>

        {loadingTemplates ? (
          <p className="empty-text">Loading required disclosures...</p>
        ) : (
          <div className="admission-disclosure-list">
            {templates.map((item, index) => {
              const signed = !!signatureFor(item.disclosure_type)?.resident_signature;

              return (
                <button
                  type="button"
                  key={item.disclosure_type}
                  className={`admission-disclosure-document ${signed ? "signed" : "pending"}`}
                  onClick={() => setSelectedTemplate(item)}
                >
                  <span className={`doc-number ${signed ? "signed" : ""}`}>
                    {signed ? "✓" : index + 1}
                  </span>

                  <div>
                    <strong>{item.title}</strong>
                    <small>
                      {signed
                        ? "Reviewed and signed"
                        : "Open document and capture signature"}
                    </small>
                  </div>

                  <em>{signed ? "Complete" : "Open"}</em>
                </button>
              );
            })}
          </div>
        )}

        {!completed && (
          <div className="disclosure-required-note">
            All listed disclosures must show <strong>Complete</strong> before the
            Continue button will work.
          </div>
        )}
      </div>

      {selectedTemplate && (
        <AdmissionDisclosureReviewModal
          template={selectedTemplate}
          existing={signatureFor(selectedTemplate.disclosure_type)}
          residentName={`${form.first_name || ""} ${form.last_name || ""}`.trim()}
          guardianName={form.guardian_name}
          staffName=""
          onClose={() => setSelectedTemplate(null)}
          onSigned={(signatureData) =>
            handleSigned(selectedTemplate.disclosure_type, signatureData)
          }
        />
      )}
    </div>
  );
}

function AdmissionDisclosureReviewModal({
  template,
  existing,
  residentName,
  guardianName,
  staffName,
  onClose,
  onSigned,
}) {
  const residentSig = useRef(null);
  const guardianSig = useRef(null);
  const staffSig = useRef(null);

  const [residentTypedName, setResidentTypedName] = useState(residentName || "");
  const [guardianTypedName, setGuardianTypedName] = useState(guardianName || "");
  const [staffTypedName, setStaffTypedName] = useState(staffName || "");
  const [residentMarkConfirmed, setResidentMarkConfirmed] = useState(false);

  function capturePad(ref) {
    if (!ref.current || ref.current.isEmpty()) return "";
    return ref.current.toDataURL();
  }

  function signAndComplete() {
    const resident_signature = existing?.resident_signature || capturePad(residentSig);

    if (!resident_signature) {
      alert("Resident signature or mark is required.");
      return;
    }

    onSigned({
      resident_signature,
      guardian_signature: existing?.guardian_signature || capturePad(guardianSig),
      staff_signature: existing?.staff_signature || capturePad(staffSig),
      resident_typed_name: residentTypedName,
      guardian_typed_name: guardianTypedName,
      staff_typed_name: staffTypedName,
      resident_mark_confirmed: residentMarkConfirmed,
      signed_at: new Date().toISOString(),
      disclosure_title: template.title,
      disclosure_type: template.disclosure_type,
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="premium-modal admission-document-modal">
        <div className="modal-header">
          <div>
            <p className="dashboard-eyebrow">Admission Disclosure Review</p>
            <h2>{template.title}</h2>
            <p className="muted">
              Resident must review this full document and sign or make a mark
              before this disclosure can be checked complete.
            </p>
          </div>

          <button className="icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admission-document-body">
          <div className="actual-document-view">
            <div className="document-paper">
              <h2>{template.title}</h2>
              <p>{template.content}</p>

              <div className="document-signature-lines">
                <div>
                  <strong>Resident Name</strong>
                  <span>{residentTypedName || "—"}</span>
                </div>
                <div>
                  <strong>Guardian / Agent</strong>
                  <span>{guardianTypedName || "—"}</span>
                </div>
                <div>
                  <strong>Date</strong>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="signature-capture-grid">
            <div className="signature-name-row">
              <Input
                label="Resident Printed Name"
                value={residentTypedName}
                onChange={setResidentTypedName}
              />
              <Input
                label="Guardian / Agent Printed Name"
                value={guardianTypedName}
                onChange={setGuardianTypedName}
              />
              <Input
                label="Staff Witness Printed Name"
                value={staffTypedName}
                onChange={setStaffTypedName}
              />
            </div>

            <SignaturePadBox
              title="Resident Signature / Mark"
              sigRef={residentSig}
              existing={existing?.resident_signature}
              required
            />

            <label className="checkbox-line admission-check mark-confirm">
              <input
                type="checkbox"
                checked={residentMarkConfirmed}
                onChange={(e) => setResidentMarkConfirmed(e.target.checked)}
              />
              Resident made a mark or signature after the document was read and
              explained.
            </label>

            <SignaturePadBox
              title="Guardian / Agent Signature"
              sigRef={guardianSig}
              existing={existing?.guardian_signature}
            />

            <SignaturePadBox
              title="Staff Witness Signature"
              sigRef={staffSig}
              existing={existing?.staff_signature}
            />
          </div>
        </div>

        <div className="wizard-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button type="button" className="primary-btn" onClick={signAndComplete}>
            Sign & Complete Document
          </button>
        </div>
      </div>
    </div>
  );
}

function SignaturePadBox({ title, sigRef, existing, required }) {
  return (
    <div className="admission-signature-box">
      <div className="signature-block-header">
        <h3>
          {title} {required ? <span className="required-dot">*</span> : null}
        </h3>

        {!existing && (
          <button type="button" onClick={() => sigRef.current?.clear()}>
            Clear
          </button>
        )}
      </div>

      {existing ? (
        <div className="existing-signature">
          <img src={existing} alt={title} />
          <span>Signature already captured</span>
        </div>
      ) : (
        <div className="signature-pad-wrap admission-pad">
          <SignatureCanvas
            ref={sigRef}
            penColor="#0f172a"
            canvasProps={{ className: "signature-pad" }}
          />
        </div>
      )}
    </div>
  );
}

function allAdmissionDisclosuresSigned(form) {
  const signatures = form.admission_disclosure_signatures || {};
  const keys = Object.keys(signatures);

  if (keys.length < fallbackDisclosureTemplates.length) return false;

  return fallbackDisclosureTemplates.every(
    (item) => !!signatures[item.disclosure_type]?.resident_signature
  );
}

const fallbackDisclosureTemplates = [
  {
    disclosure_type: "GENERAL_CONSENT_TREATMENT",
    title: "General Consent for Treatment",
    content:
      "I am asking for behavioral health services and treatment at this facility and agree to accept services and procedures to treat my condition and routine dental and medical care. I understand that I have not been given any guarantees as to the results of services received.",
  },
  {
    disclosure_type: "INFORMED_CONSENT_TREATMENT",
    title: "Informed Consent for Treatment",
    content:
      "I authorize the facility to provide evaluation and treatment services. The proposed treatment, intended outcome, nature, procedure, risks, side effects, and alternatives have been explained to me.",
  },
  {
    disclosure_type: "NOTIFICATION_OF_FEES",
    title: "Notification of Fees",
    content:
      "I understand there are expenses related to my stay and that fees or day rates may be covered by the placing agency. I understand fee changes will be communicated as required.",
  },
  {
    disclosure_type: "RECEIVING_REFUNDING_FEES",
    title: "Receiving and Refunding Client Fees",
    content:
      "Upon discharge, fees paid for services not rendered shall be refunded and prorated based on the date of discharge according to facility policy.",
  },
  {
    disclosure_type: "RELEASE_OF_INFORMATION",
    title: "Release of Information",
    content:
      "I authorize disclosure of selected information as allowed by written consent and understand my records may be protected under 42 CFR Part 2 and other privacy laws.",
  },
  {
    disclosure_type: "EMERGENCY_MEDICAL_TREATMENT",
    title: "Consent for Routine & Emergency Medical Treatment",
    content:
      "I give consent for the facility to obtain emergency medical or dental care under conditions necessary to preserve life, limb, or well-being.",
  },
  {
    disclosure_type: "CONFIDENTIALITY_POLICY",
    title: "Confidentiality Policy",
    content:
      "I understand the facility protects resident confidentiality and will not release privileged information without written consent except as permitted by law.",
  },
  {
    disclosure_type: "RESIDENT_RIGHTS",
    title: "Resident Rights",
    content:
      "I understand my resident rights are documented in the Resident Handbook and have been reviewed or offered for review with staff.",
  },
  {
    disclosure_type: "RESIDENT_RESPONSIBILITIES",
    title: "Resident Responsibilities",
    content:
      "I understand my responsibilities include providing information needed for care, following staff guidance, attending appointments, participating in service planning, and respecting others.",
  },
  {
    disclosure_type: "HOUSE_RULES",
    title: "House Rules & Behavior Expectations",
    content:
      "I understand the facility house rules and behavior expectations including visitor rules, passes, chores, cleanliness, medications, respectful conduct, and drug/alcohol-free expectations.",
  },
  {
    disclosure_type: "SEARCH_SEIZURE_POLICY",
    title: "Search & Seizure Policy",
    content:
      "I understand searches may occur when staff have reasonable suspicion or safety concerns and that searches will be conducted professionally and documented.",
  },
  {
    disclosure_type: "NO_HARM_AGREEMENT",
    title: "No Harm Agreement",
    content:
      "I promise not to hurt myself or anyone else. If I have thoughts of self-harm, suicide, or harming others, I will notify staff immediately.",
  },
  {
    disclosure_type: "GRIEVANCE_PROCEDURE",
    title: "Grievance Procedure",
    content:
      "I understand the grievance procedure and that I may notify staff, the Program Manager, Grievance Coordinator, or Administrator of a complaint or grievance.",
  },
  {
    disclosure_type: "PERSONAL_BELONGINGS",
    title: "Resident Personal Belongings",
    content:
      "I understand my personal belongings will be inventoried at admission and that the belongings record reflects items present at admission.",
  },
  {
    disclosure_type: "RECREATIONAL_WAIVER",
    title: "Gym & Community Recreational Facilities Waiver",
    content:
      "I understand exercise, fitness equipment, and recreational activities may involve risks and I voluntarily assume responsibility for participating.",
  },
  {
    disclosure_type: "MEDICATION_LIST_ACKNOWLEDGEMENT",
    title: "Medication List Acknowledgement",
    content:
      "I acknowledge staff instructed me on current prescribed medications, including dosage, route, purpose, side effects, adverse reactions, and risks of noncompliance.",
  },
];

function Review({ form }) {
  return (
    <div className="review-grid">
      <ReviewCard
        title="Resident"
        rows={[
          ["Name", `${form.first_name} ${form.last_name}`],
          ["Nickname", form.nickname],
          ["DOB", form.date_of_birth],
          ["Gender", form.gender],
          ["Admission Date", form.admission_date],
          ["Diagnosis", form.primary_diagnosis],
        ]}
      />

      <ReviewCard
        title="Health Plan"
        rows={[
          ["Health Plan", form.health_plan],
          ["Plan Name", form.plan_name],
          ["Plan ID", form.health_plan_id],
          ["Plan Phone", form.plan_phone],
        ]}
      />

      <ReviewCard
        title="Health Care"
        rows={[
          ["PCP", form.pcp_name],
          ["Behavioral Health Provider", form.behavioral_health_provider_name],
          ["Therapist", form.therapist_name],
          ["Dentist", form.dentist_name],
          ["Hospital Preference", form.hospital_preference],
        ]}
      />

      <ReviewCard
        title="Contacts"
        rows={[
          ["Guardian", form.no_guardian_assigned ? "No guardian assigned" : form.guardian_name],
          ["Guardian Phone", form.guardian_cell_phone || form.guardian_home_phone],
          ["Emergency Contact", form.emergency_contact_name],
          ["Case Manager", form.case_manager_name],
          ["Parole Officer", form.parole_officer_name],
        ]}
      />
    </div>
  );
}

function ProviderSection({ title, prefix, form, setForm }) {
  const nameKey = `${prefix}_name`;
  const phoneKey = `${prefix}_phone`;
  const addressKey = `${prefix}_address`;
  const cityKey = `${prefix}_city`;
  const stateKey = `${prefix}_state`;
  const zipKey = `${prefix}_zip`;

  return (
    <Section title={title}>
      <Input label="Name" value={form[nameKey]} onChange={(v) => setForm({ ...form, [nameKey]: v })} />
      <Input label="Phone Number" value={form[phoneKey]} onChange={(v) => setForm({ ...form, [phoneKey]: v })} />
      <Input label="Street Address" value={form[addressKey]} onChange={(v) => setForm({ ...form, [addressKey]: v })} />
      <Input label="City" value={form[cityKey]} onChange={(v) => setForm({ ...form, [cityKey]: v })} />
      <Input label="State" value={form[stateKey]} onChange={(v) => setForm({ ...form, [stateKey]: v })} />
      <Input label="Zip Code" value={form[zipKey]} onChange={(v) => setForm({ ...form, [zipKey]: v })} />
    </Section>
  );
}

function Section({ title, children }) {
  return (
    <div className="admission-card">
      <h3>{title}</h3>
      <div className="admission-card-grid">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <div className="modal-field">
      <label>{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="modal-field">
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option || "blank"} value={option}>
            {option || "Select"}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="modal-field full">
      <label>{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="checkbox-line admission-check">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function ReviewCard({ title, rows }) {
  return (
    <div className="admission-card">
      <h3>{title}</h3>
      <div className="review-list">
        {rows.map(([label, value]) => (
          <div className="review-row" key={label}>
            <span>{label}</span>
            <strong>{value || "—"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="resident-summary-card">
      <div className="summary-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value ?? 0}</h2>
      </div>
    </div>
  );
}

function getInitials(resident) {
  const first = resident.first_name?.[0] || "";
  const last = resident.last_name?.[0] || "";
  return `${first}${last}` || "R";
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function buildAddress(street, city, state, zip) {
  return [street, city, state, zip].filter(Boolean).join(", ");
}

function getStepDescription(step) {
  if (step === 0) return "Resident face sheet, demographics, diagnosis, allergies, and health plan.";
  if (step === 1) return "PCP, behavioral health provider, therapist, dentist, hospital, and plan provider.";
  if (step === 2) return "Guardian, emergency contact, case manager, parole officer, and additional contacts.";
  if (step === 3) return "Open each required disclosure, review the full document, and capture signatures before continuing.";
  return "Review admission information before creating the resident record.";
}