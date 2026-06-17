import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileSignature,
  Search,
  ShieldCheck,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import api from "../services/api";

import GeneralConsentPage from "./admission-disclosures/GeneralConsentPage";
import InformedConsentPage from "./admission-disclosures/InformedConsentPage";
import NotificationOfFeesPage from "./admission-disclosures/NotificationOfFeesPage";
import ReceivingRefundingFeesPage from "./admission-disclosures/ReceivingRefundingFeesPage";
import ReleaseOfInformationPage from "./admission-disclosures/ReleaseOfInformationPage";
import EmergencyMedicalConsentPage from "./admission-disclosures/EmergencyMedicalConsentPage";
import ConfidentialityPage from "./admission-disclosures/ConfidentialityPage";
import ResidentRightsPage from "./admission-disclosures/ResidentRightsPage";
import ResidentResponsibilitiesPage from "./admission-disclosures/ResidentResponsibilitiesPage";
import NoHarmAgreementPage from "./admission-disclosures/NoHarmAgreementPage";
import GrievanceProcedurePage from "./admission-disclosures/GrievanceProcedurePage";
import SearchSeizurePolicyPage from "./admission-disclosures/SearchSeizurePolicyPage";
import HouseRulesPage from "./admission-disclosures/HouseRulesPage";
import PersonalBelongingsPage from "./admission-disclosures/PersonalBelongingsPage";
import MedicationAcknowledgementPage from "./admission-disclosures/MedicationAcknowledgementPage";
import RecreationWaiverPage from "./admission-disclosures/RecreationWaiverPage";
import ResidentAccountBalancePage from "./admission-disclosures/ResidentAccountBalancePage";
import HIPAANoticePage from "./admission-disclosures/HIPAANoticePage";
import ClientOrientationChecklistPage from "./admission-disclosures/ClientOrientationChecklistPage";
import ResidentFaceSheetPage from "./admission-disclosures/ResidentFaceSheetPage";
<<<<<<< HEAD
import GeneralConsentPage from "./admission-disclosures/GeneralConsentPage";
=======
>>>>>>> 2f4ee9c (adding to edit)

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
  health_plan: "AHCCCS",
  health_plan_id: "",
  plan_name: "",
  plan_phone: "",
  plan_provider: "",
  plan_provider_phone: "",
  plan_provider_id_number: "",
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
  pharmacy_name: "",
  pharmacy_phone: "",
  pharmacy_address: "",
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
  admission_packet_signatures: {},
  status: "ACTIVE",
};

const wizardSteps = [
  { label: "Face Sheet", icon: User },
  { label: "Admission Packet", icon: FileSignature },
  { label: "Review & Admit", icon: ClipboardCheck },
];

const packetGroups = [
  {
    title: "Admission Record",
    docs: [
      {
        id: "resident-face-sheet",
        title: "Resident Face Sheet",
        description:
          "Resident demographics, medical, contacts, insurance, providers, pharmacy, and emergency summary.",
      },
      {
        id: "orientation-checklist",
        title: "Client Orientation Checklist",
        description: "Resident orientation and admission education checklist.",
      },
    ],
  },
  {
    title: "Privacy & Rights",
    docs: [
      {
        id: "hipaa-notice",
        title: "HIPAA Notice of Privacy Practices",
        description: "Acknowledgement of HIPAA privacy notice.",
      },
      {
        id: "release-of-information",
        title: "Release of Information",
        description: "Authorization for selected information disclosure.",
      },
      {
        id: "confidentiality",
        title: "Confidentiality & Exceptions",
        description: "Acknowledgement of confidentiality policy.",
      },
      {
        id: "resident-rights",
        title: "Resident Rights",
        description: "Acknowledgement of patient rights.",
      },
      {
        id: "resident-responsibilities",
        title: "Resident Responsibilities",
        description: "Acknowledgement of program responsibilities.",
      },
      {
        id: "grievance-procedure",
        title: "Complaint / Grievance Procedure",
        description: "Acknowledgement of grievance process.",
      },
    ],
  },
  {
    title: "Consents",
    docs: [
      {
        id: "general-consent",
        title: "General Consent for Treatment",
        description: "Consent to behavioral health services, routine care, and procedures.",
      },
      {
        id: "informed-consent",
        title: "Informed Consent for Treatment",
        description: "Authorization for evaluation and treatment services.",
      },
      {
        id: "emergency-medical-consent",
        title: "Routine & Emergency Medical Treatment",
        description: "Consent for emergency medical or dental care.",
      },
    ],
  },
  {
    title: "Financial",
    docs: [
      {
        id: "notification-of-fees",
        title: "Notification of Fees",
        description: "Acknowledgement of daily/monthly fee policy.",
      },
      {
        id: "receiving-refunding-fees",
        title: "Receiving & Refunding Client Fees",
        description: "Acknowledgement of refund and fee change policy.",
      },
      {
        id: "resident-account-balance",
        title: "Resident Account Balance Sheet",
        description: "Resident funds ledger with balances, receipts, and initials.",
      },
    ],
  },
  {
    title: "Safety & Facility Rules",
    docs: [
      {
        id: "house-rules",
        title: "House Rules & Behavior Expectations",
        description: "Facility rules, conduct expectations, and belongings policy.",
      },
      {
        id: "search-seizure-policy",
        title: "Search & Seizure Policy",
        description: "Facility search and contraband policy acknowledgement.",
      },
      {
        id: "no-harm-agreement",
        title: "No Harm Agreement",
        description: "Agreement to notify staff of self-harm or harm-to-others thoughts.",
      },
      {
        id: "recreation-waiver",
        title: "Gym & Recreational Facilities Waiver",
        description: "Recreational activity risks and release of liability.",
      },
    ],
  },
  {
    title: "Inventory & Medication",
    docs: [
      {
        id: "personal-belongings",
        title: "Resident Personal Belongings",
        description: "Belongings inventory with item counts and signatures.",
      },
      {
        id: "medication-acknowledgement",
        title: "Medication Acknowledgement",
        description: "Medication education, side effects, risks, and medication list.",
      },
    ],
  },
];

const requiredPacketIds = packetGroups.flatMap((group) => group.docs.map((doc) => doc.id));

export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeDisclosure, setActiveDisclosure] = useState(null);

  const currentFacility = {
    name: "Home of Love BHRF",
    address: "32088 N Lisadre Lane",
    city: "San Tan Valley",
    state: "AZ",
    zip_code: "85143",
    phone: "480-558-6531",
    email: "office@homeofloveaz.com",
    license_number: "",
  };

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

  function openAdmission() {
    setForm(emptyForm);
    setStep(0);
    setShowAddModal(true);
  }

  async function createResident(e) {
    e.preventDefault();

    if (!form.first_name || !form.last_name || !form.admission_date) {
      alert("First name, last name, and admission date are required.");
      setStep(0);
      return;
    }

    if (!allAdmissionPacketSigned(form.admission_packet_signatures || {})) {
      alert("All required admission packet documents must be opened, reviewed, and signed before admitting the resident.");
      setStep(1);
      return;
    }

    try {
      setSaving(true);
      await api.post("/residents", {
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender,
        phone: form.cell_phone || form.home_phone,
        email: form.email,
        admission_date: form.admission_date || null,
        status: form.status,
        address: buildAddress(form.street_address, form.city, form.state, form.zip_code),
        diagnosis: form.primary_diagnosis,
        guardian_name: form.guardian_name,
        guardian_phone: form.guardian_cell_phone || form.guardian_home_phone,
        guardian_relationship: form.no_guardian_assigned ? "No guardian assigned" : "Legal Guardian",
        form_data: form,
      });

      setForm(emptyForm);
      setStep(0);
      setShowAddModal(false);
      setActiveDisclosure(null);
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
      const fullName = `${resident.first_name || ""} ${resident.last_name || ""}`.toLowerCase();
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
          <p>Manage resident profiles, admissions, clinical records, documents, compliance, and care coordination.</p>
        </div>
        <button className="primary-action" type="button" onClick={openAdmission}>
          <UserPlus size={18} /> Admit Resident
        </button>
      </section>

      <section className="resident-summary-grid">
        <SummaryCard title="Total Residents" value={residents.length} icon={<Users />} />
        <SummaryCard title="Active Residents" value={residents.filter((r) => r.is_active).length} icon={<ShieldCheck />} />
        <SummaryCard title="Inactive / Discharged" value={residents.filter((r) => !r.is_active || r.status === "DISCHARGED").length} icon={<AlertTriangle />} />
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
                        <div className="resident-avatar">{getInitials(resident)}</div>
                        <div>
                          <strong>{resident.first_name} {resident.last_name}</strong>
                          <p>{resident.resident_code || resident.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(resident.date_of_birth)}</td>
                    <td>{resident.gender || "—"}</td>
                    <td>{formatDate(resident.admission_date)}</td>
                    <td><span className={`status-badge ${resident.status?.toLowerCase()}`}>{resident.status || "UNKNOWN"}</span></td>
                    <td>{resident.phone || "—"}</td>
                    <td>
                      <Link className="table-action" to={`/residents/${resident.id}`}>
                        <Eye size={16} /> View
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
          facility={currentFacility}
          setActiveDisclosure={setActiveDisclosure}
          onClose={() => setShowAddModal(false)}
          onSubmit={createResident}
        />
      )}

      {activeDisclosure && (
        <DisclosureModal
          disclosureId={activeDisclosure}
          resident={form}
          facility={currentFacility}
          signatures={(form.admission_packet_signatures || {})[activeDisclosure] || {}}
          onSignatureChange={(type, value) => {
            setForm((prev) => ({
              ...prev,
              admission_packet_signatures: {
                ...(prev.admission_packet_signatures || {}),
                [activeDisclosure]: {
                  ...((prev.admission_packet_signatures || {})[activeDisclosure] || {}),
                  [type]: value,
                },
              },
            }));
          }}
          onClose={() => setActiveDisclosure(null)}
        />
      )}
    </div>
  );
}

function AdmissionWizard({ form, setForm, step, setStep, saving, facility, setActiveDisclosure, onClose, onSubmit }) {
  const CurrentIcon = wizardSteps[step].icon;

  return (
    <div className="modal-backdrop">
      <div className="premium-modal admission-modal">
        <div className="modal-header admission-header">
          <div>
            <p className="dashboard-eyebrow">Resident Admission</p>
            <h2>Admit New Resident</h2>
            <p className="muted">Complete one unified Face Sheet, sign the full admission packet, and review before admission.</p>
          </div>
          <button className="icon-close" type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="admission-stepper compact-stepper">
          {wizardSteps.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className={`admission-step ${step === index ? "active" : ""} ${step > index ? "complete" : ""}`}
                onClick={() => setStep(index)}
              >
                <span><Icon size={20} /></span>
                <strong>{item.label}</strong>
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit}>
          <div className="admission-section-title">
            <span className={`admission-section-icon step-${step}`}><CurrentIcon size={22} /></span>
            <div>
              <h3>{wizardSteps[step].label}</h3>
              <p>{getStepDescription(step)}</p>
            </div>
          </div>

          {step === 0 && (
            <ResidentFaceSheetPage
              resident={form}
              facility={facility}
              mode="edit"
              onResidentChange={setForm}
              signatures={(form.admission_packet_signatures || {})["resident-face-sheet"] || {}}
              onSignatureChange={(type, value) => {
                setForm((prev) => ({
                  ...prev,
                  admission_packet_signatures: {
                    ...(prev.admission_packet_signatures || {}),
                    "resident-face-sheet": {
                      ...((prev.admission_packet_signatures || {})["resident-face-sheet"] || {}),
                      [type]: value,
                    },
                  },
                }));
              }}
            />
          )}

          {step === 1 && <AdmissionPacketStep form={form} facility={facility} setActiveDisclosure={setActiveDisclosure} />}
          {step === 2 && <Review form={form} />}

          <div className="wizard-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            {step > 0 && <button type="button" className="secondary-btn" onClick={() => setStep(step - 1)}>Back</button>}
            {step < wizardSteps.length - 1 ? (
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  if (step === 1 && !allAdmissionPacketSigned(form.admission_packet_signatures || {})) {
                    alert("All required admission packet documents must be opened, reviewed, and signed before continuing.");
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Continue
              </button>
            ) : (
              <button className="primary-btn" disabled={saving}>{saving ? "Admitting..." : "Admit Resident"}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function AdmissionPacketStep({ form, facility, setActiveDisclosure }) {
<<<<<<< HEAD
  const documents = [
	{
	  id: "general-consent",
	  title: "General Consent for Treatment",
	  description: "Resident consents to behavioral health services, routine care, and treatment procedures.",
	},
    {
      id: "informed-consent",
      title: "Informed Consent for Treatment",
      description: "Resident authorizes evaluation and treatment services.",
    },
    {
      id: "notification-of-fees",
      title: "Notification of Fees",
      description: "Resident acknowledges daily/monthly fee policy.",
    },
	{
	  id: "receiving-refunding-fees",
	  title: "Receiving & Refunding Client Fees",
	  description: "Resident acknowledges refund and fee change policy.",
	},
	{
	  id: "release-of-information",
	  title: "Release of Information",
	  description: "Resident authorizes selected information disclosure.",
	},
	{
	  id: "emergency-medical-consent",
	  title: "Routine & Emergency Medical Treatment",
	  description: "Resident authorizes emergency medical or dental care.",
	},
	{
	  id: "confidentiality",
	  title: "Confidentiality & Exceptions",
	  description: "Resident acknowledges confidentiality policy.",
	},
	{
	  id: "resident-rights",
	  title: "Resident Rights",
	  description: "Resident acknowledges receipt of patient rights.",
	},
	{
	  id: "resident-responsibilities",
	  title: "Resident Responsibilities",
	  description: "Resident acknowledges program responsibilities.",
	},
	
	{
	  id: "no-harm-agreement",
	  title: "No Harm Agreement",
	  description: "Resident agrees to notify staff about self-harm or harm-to-others thoughts.",
	},
	{
	  id: "grievance-procedure",
	  title: "Resident Complaint / Grievance Procedure",
	  description: "Resident acknowledges grievance and complaint procedure.",
	},
	{
	  id: "search-seizure-policy",
	  title: "Search & Seizure Policy",
	  description: "Resident acknowledges facility search and contraband policy.",
	},
	{
	  id: "house-rules",
	  title: "House Rules & Behavior Expectations",
	  description: "Resident acknowledges facility rules, conduct expectations, and discharge belongings policy.",
	},
	{
	  id: "personal-belongings",
	  title: "Resident Personal Belongings",
	  description: "Resident belongings inventory with item counts and signatures.",
	},
	{
	  id: "medication-acknowledgement",
	  title: "Medication Acknowledgement",
	  description: "Resident acknowledges medication education, side effects, risks, and medication list.",
	},
	{
	  id: "recreation-waiver",
	  title: "Gym & Community Recreational Facilities Waiver",
	  description: "Resident acknowledges recreational activity risks and release of liability.",
	},
	{
	  id: "resident-account-balance",
	  title: "Resident Account Balance Sheet",
	  description: "Resident funds ledger with receipts, balances, and initials.",
	},
	{
	  id: "hipaa-notice",
	  title: "HIPAA Notice of Privacy Practices",
	  description: "Resident acknowledges receipt or offer of the HIPAA privacy notice.",
	},
	{
	  id: "orientation-checklist",
	  title: "Client Orientation Checklist",
	  description: "Resident orientation and admission education checklist.",
	},
		{
	  id: "resident-face-sheet",
	  title: "Resident Face Sheet",
	  description: "Printable resident demographics, guardian, insurance, diagnosis, provider, pharmacy, and emergency contact summary.",
	},
  ];

  const signatures = form.admission_packet_signatures || {};

  function isSigned(id) {
    const sig = signatures[id] || {};
    return !!((sig.resident || sig.guardian) && sig.staff);
  }

  const completed = documents.filter((doc) => isSigned(doc.id)).length;
=======
  const completed = requiredPacketIds.filter((id) => isPacketDocumentSigned(form, id)).length;
  const percent = requiredPacketIds.length ? Math.round((completed / requiredPacketIds.length) * 100) : 0;
>>>>>>> 2f4ee9c (adding to edit)

  return (
    <div className="admission-grid">
      <div className="admission-card disclosure-admission-card">
        <div className="disclosure-admission-head">
          <div className="disclosure-icon large"><FileSignature size={26} /></div>
          <div>
            <p className="dashboard-eyebrow">Required Admission Packet</p>
            <h3>Admission Packet Documents</h3>
            <p className="muted">Each item must be opened, reviewed, and signed before admission can continue.</p>
            <p className="muted">Facility: <strong>{facility?.name || "Facility"}</strong></p>
          </div>
        </div>

        <div className="admission-packet-progress">
          <strong>{completed} of {requiredPacketIds.length} completed</strong>
          <span>{percent}%</span>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
        </div>

        {packetGroups.map((group) => (
          <div className="packet-section" key={group.title}>
            <h4>{group.title}</h4>
            <div className="packet-doc-grid">
              {group.docs.map((doc) => {
                const signed = isPacketDocumentSigned(form, doc.id);
                return (
                  <div key={doc.id} className={`packet-doc-card ${signed ? "signed" : "pending"}`}>
                    <div className="packet-doc-status">{signed ? <CheckCircle2 size={18} /> : "!"}</div>
                    <div className="packet-doc-body">
                      <strong>{doc.title}</strong>
                      <p>{doc.description}</p>
                      <button type="button" onClick={() => setActiveDisclosure(doc.id)}>
                        {signed ? "Review Document" : "Open & Sign"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisclosureModal({ disclosureId, resident, facility, signatures, onSignatureChange, onClose }) {
  const commonProps = { resident, facility, signatures, onSignatureChange };

  return (
    <div className="modal-backdrop nested-modal">
      <div className="premium-modal admission-document-modal">
        <div className="modal-header">
          <div>
            <p className="dashboard-eyebrow">Admission Document</p>
            <h2>Review & Sign</h2>
          </div>
          <button className="icon-close" type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="admission-document-modal-body">
<<<<<<< HEAD
          {disclosureId === "informed-consent" && (
            <InformedConsentPage
              resident={resident}
              facility={facility}
              signatures={signatures}
              onSignatureChange={onSignatureChange}
            />
          )}
		  
		  {disclosureId === "general-consent" && (
			  <GeneralConsentPage
				resident={resident}
				facility={facility}
				signatures={signatures}
				onSignatureChange={onSignatureChange}
			  />
			)}

          {disclosureId === "notification-of-fees" && (
            <NotificationOfFeesPage
              resident={resident}
              facility={facility}
              signatures={signatures}
              onSignatureChange={onSignatureChange}
            />
          )}
		{disclosureId === "receiving-refunding-fees" && (
		  <ReceivingRefundingFeesPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}

		{disclosureId === "release-of-information" && (
		  <ReleaseOfInformationPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}

		{disclosureId === "emergency-medical-consent" && (
		  <EmergencyMedicalConsentPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}

		{disclosureId === "confidentiality" && (
		  <ConfidentialityPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}

		{disclosureId === "resident-rights" && (
		  <ResidentRightsPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}

		{disclosureId === "resident-responsibilities" && (
		  <ResidentResponsibilitiesPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}	

		{disclosureId === "no-harm-agreement" && (
		  <NoHarmAgreementPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}

		{disclosureId === "grievance-procedure" && (
		  <GrievanceProcedurePage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}

		{disclosureId === "search-seizure-policy" && (
		  <SearchSeizurePolicyPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}

		{disclosureId === "house-rules" && (
		  <HouseRulesPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}
		{disclosureId === "personal-belongings" && (
		  <PersonalBelongingsPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}	

		{disclosureId === "medication-acknowledgement" && (
		  <MedicationAcknowledgementPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}	

		{disclosureId === "recreation-waiver" && (
		  <RecreationWaiverPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}

		{disclosureId === "resident-account-balance" && (
		  <ResidentAccountBalancePage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}	
		{disclosureId === "hipaa-notice" && (
		  <HIPAANoticePage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}
		{disclosureId === "orientation-checklist" && (
		  <ClientOrientationChecklistPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}
		{disclosureId === "resident-face-sheet" && (
		  <ResidentFaceSheetPage
			resident={resident}
			facility={facility}
			signatures={signatures}
			onSignatureChange={onSignatureChange}
		  />
		)}		
					
=======
          {disclosureId === "resident-face-sheet" && <ResidentFaceSheetPage {...commonProps} />}
          {disclosureId === "orientation-checklist" && <ClientOrientationChecklistPage {...commonProps} />}
          {disclosureId === "hipaa-notice" && <HIPAANoticePage {...commonProps} />}
          {disclosureId === "release-of-information" && <ReleaseOfInformationPage {...commonProps} />}
          {disclosureId === "confidentiality" && <ConfidentialityPage {...commonProps} />}
          {disclosureId === "resident-rights" && <ResidentRightsPage {...commonProps} />}
          {disclosureId === "resident-responsibilities" && <ResidentResponsibilitiesPage {...commonProps} />}
          {disclosureId === "grievance-procedure" && <GrievanceProcedurePage {...commonProps} />}
          {disclosureId === "general-consent" && <GeneralConsentPage {...commonProps} />}
          {disclosureId === "informed-consent" && <InformedConsentPage {...commonProps} />}
          {disclosureId === "emergency-medical-consent" && <EmergencyMedicalConsentPage {...commonProps} />}
          {disclosureId === "notification-of-fees" && <NotificationOfFeesPage {...commonProps} />}
          {disclosureId === "receiving-refunding-fees" && <ReceivingRefundingFeesPage {...commonProps} />}
          {disclosureId === "resident-account-balance" && <ResidentAccountBalancePage {...commonProps} />}
          {disclosureId === "house-rules" && <HouseRulesPage {...commonProps} />}
          {disclosureId === "search-seizure-policy" && <SearchSeizurePolicyPage {...commonProps} />}
          {disclosureId === "no-harm-agreement" && <NoHarmAgreementPage {...commonProps} />}
          {disclosureId === "recreation-waiver" && <RecreationWaiverPage {...commonProps} />}
          {disclosureId === "personal-belongings" && <PersonalBelongingsPage {...commonProps} />}
          {disclosureId === "medication-acknowledgement" && <MedicationAcknowledgementPage {...commonProps} />}

>>>>>>> 2f4ee9c (adding to edit)
          <div className="modal-actions full">
            <button className="primary-btn" type="button" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Review({ form }) {
  const completed = requiredPacketIds.filter((id) => isPacketDocumentSigned(form, id)).length;
  const missing = requiredPacketIds.filter((id) => !isPacketDocumentSigned(form, id));

  return (
    <div className="review-grid premium-review-grid">
      <ReviewCard title="Resident" rows={[
        ["Name", `${form.first_name} ${form.last_name}`],
        ["DOB", form.date_of_birth],
        ["Gender", form.gender],
        ["Admission Date", form.admission_date],
        ["Diagnosis", form.primary_diagnosis],
      ]} />

      <ReviewCard title="Care & Contacts" rows={[
        ["Guardian", form.no_guardian_assigned ? "No guardian assigned" : form.guardian_name],
        ["Guardian Phone", form.guardian_cell_phone || form.guardian_home_phone],
        ["Emergency Contact", form.emergency_contact_name],
        ["PCP", form.pcp_name],
        ["Behavioral Health Provider", form.behavioral_health_provider_name],
      ]} />

      <ReviewCard title="Admission Packet" rows={[
        ["Packet Completion", `${completed} of ${requiredPacketIds.length} signed`],
        ["Status", missing.length === 0 ? "Ready to admit" : `${missing.length} document(s) pending`],
      ]} />
    </div>
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

function isPacketDocumentSigned(form, documentId) {
  const sig = (form.admission_packet_signatures || {})[documentId] || {};

  if (documentId === "general-consent") {
    return !!((sig.patient || sig.guardian) && sig.witness);
  }

  if (documentId === "resident-face-sheet") {
    return !!sig.staff;
  }

  if (documentId === "resident-account-balance") {
    return !!(sig.resident && sig.staff);
  }

  return !!((sig.resident || sig.guardian) && sig.staff);
}

function allAdmissionPacketSigned(signatures = {}) {
<<<<<<< HEAD
  const required = [
    "general-consent",
    "informed-consent",
    "notification-of-fees",
    "receiving-refunding-fees",
    "release-of-information",
    "emergency-medical-consent",
	"confidentiality",
	"resident-rights",
	"resident-responsibilities",
	"no-harm-agreement",
	"grievance-procedure",
	"search-seizure-policy",
	"house-rules",
	"personal-belongings",
	"medication-acknowledgement",
	"recreation-waiver",
	"resident-account-balance",
	"hipaa-notice",
	"orientation-checklist",
	"resident-face-sheet",
  ];

  return required.every((id) => {
=======
  return requiredPacketIds.every((id) => {
>>>>>>> 2f4ee9c (adding to edit)
    const sig = signatures[id] || {};

    if (id === "general-consent") {
      return !!((sig.patient || sig.guardian) && sig.witness);
    }

    if (id === "resident-face-sheet") {
      return !!sig.staff;
    }

    if (id === "resident-account-balance") {
      return !!(sig.resident && sig.staff);
    }

    return !!((sig.resident || sig.guardian) && sig.staff);
  });
}

function getStepDescription(step) {
  if (step === 0) {
    return "Complete resident demographics, contacts, guardian, insurance, medical, providers, pharmacy, and case team details.";
  }
  if (step === 1) {
    return "Open, review, and sign each required admission packet document.";
  }
  return "Review resident admission information and packet completion before creating the resident record.";
}
