import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Pill,
  ShieldAlert,
  User,
  Users,
  CheckSquare,
  X,
  Plus,
  Download,
  UploadCloud,
  FileLock2,
  Stethoscope,
  Flame,
  ClipboardList,
  Bell,
} from "lucide-react";

import api from "../services/api";

const TAB_CONFIG = [
  { key: "Overview", icon: User, color: "blue" },
  { key: "Assessments", icon: ClipboardCheck, color: "emerald" },
  { key: "Treatment Plans", icon: HeartPulse, color: "rose" },
  { key: "Crisis Plans", icon: ShieldAlert, color: "amber" },
  { key: "CFT Meetings", icon: Users, color: "violet" },
  { key: "Medication", icon: Pill, color: "cyan" },
  { key: "Documents", icon: FileText, color: "slate" },
  { key: "Compliance", icon: ClipboardList, color: "orange" },
  { key: "Tasks", icon: CheckSquare, color: "indigo" },
  { key: "Calendar", icon: CalendarDays, color: "green" },
];

const EMPTY_RESIDENT_FORM = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  email: "",
  admission_date: "",
  discharge_date: "",
  status: "ACTIVE",
  diagnosis: "",
  guardian_name: "",
  guardian_phone: "",
  guardian_relationship: "",
  address: "",
  program: "",
  level_of_care: "",
  case_manager_name: "",
  bhp_name: "",
  primary_care_provider: "",
};

export default function ResidentDetailPage() {
  const { residentId } = useParams();

  const [resident, setResident] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [modalType, setModalType] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResident();
  }, [residentId]);

  async function loadResident() {
    try {
      setLoading(true);
      const [residentRes, dashboardRes] = await Promise.all([
        api.get(`/residents/${residentId}`),
        api.get(`/residents/${residentId}/dashboard`).catch(() => ({ data: {} })),
      ]);

      setResident(residentRes.data);
      setDashboard(dashboardRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal() {
    setEditForm({
      ...EMPTY_RESIDENT_FORM,
      first_name: resident.first_name || "",
      last_name: resident.last_name || "",
      date_of_birth: toDateInput(resident.date_of_birth),
      gender: resident.gender || "",
      phone: resident.phone || "",
      email: resident.email || "",
      admission_date: toDateInput(resident.admission_date),
      discharge_date: toDateInput(resident.discharge_date),
      status: resident.status || "ACTIVE",
      diagnosis: resident.diagnosis || "",
      guardian_name: resident.guardian_name || "",
      guardian_phone: resident.guardian_phone || "",
      guardian_relationship: resident.guardian_relationship || "",
      address: resident.address || "",
      program: resident.program || "",
      level_of_care: resident.level_of_care || "",
      case_manager_name: resident.case_manager_name || "",
      bhp_name: resident.bhp_name || "",
      primary_care_provider: resident.primary_care_provider || "",
    });
    setShowEditModal(true);
  }

  async function updateResident(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patch(`/residents/${residentId}`, {
        ...editForm,
        date_of_birth: editForm.date_of_birth || null,
        admission_date: editForm.admission_date || null,
        discharge_date: editForm.discharge_date || null,
      });
      setShowEditModal(false);
      await loadResident();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to update resident.");
    } finally {
      setSaving(false);
    }
  }

  function afterCreate() {
    setModalType(null);
    setRefreshKey((v) => v + 1);
    loadResident();
  }

  if (loading) return <div className="page">Loading resident chart...</div>;
  if (!resident) return <div className="page">Resident not found.</div>;

  return (
    <div className="resident-detail-page">
      <Link to="/residents" className="back-link">
        <ArrowLeft size={17} />
        Back to Residents
      </Link>

      <section className="resident-profile-hero">
        <div className="resident-profile-left">
          <div className="resident-profile-avatar">{getInitials(resident)}</div>

          <div>
            <p className="dashboard-eyebrow">Resident Chart</p>
            <h1>{resident.first_name} {resident.last_name}</h1>
            <p>{resident.resident_code || resident.id}</p>

            <div className="profile-badges">
              <span className={`status-badge ${resident.status?.toLowerCase()}`}>
                {resident.status || "UNKNOWN"}
              </span>
              <span className="soft-badge">{resident.gender || "Gender N/A"}</span>
              <span className="soft-badge">DOB: {formatDate(resident.date_of_birth)}</span>
            </div>
          </div>
        </div>

        <div className="resident-profile-actions">
          <button onClick={openEditModal}>Edit Profile</button>
          <button className="dark" onClick={() => setModalType("task")}>Create Task</button>
        </div>
      </section>

      <section className="resident-chart-grid">
        <InfoCard
          title="Admission"
          icon={<CalendarDays />}
          items={[
            ["Admission Date", formatDate(resident.admission_date)],
            ["Discharge Date", formatDate(resident.discharge_date)],
            ["Status", resident.status || "—"],
          ]}
        />
        <InfoCard
          title="Contact"
          icon={<User />}
          items={[
            ["Phone", resident.phone || "—"],
            ["Email", resident.email || "—"],
            ["Address", resident.address || "—"],
          ]}
        />
        <InfoCard
          title="Guardian"
          icon={<Users />}
          items={[
            ["Guardian", resident.guardian_name || "—"],
            ["Phone", resident.guardian_phone || "—"],
            ["Relationship", resident.guardian_relationship || "—"],
          ]}
        />
        <InfoCard
          title="Compliance"
          icon={<ShieldAlert />}
          items={[
            ["Open Alerts", dashboard?.open_alerts ?? 0],
            ["Critical Alerts", dashboard?.critical_alerts ?? 0],
            ["Status", dashboard?.status || "—"],
          ]}
        />
      </section>

      <section className="resident-tabs big-tabs">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`${activeTab === tab.key ? "active" : ""} tab-${tab.color}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="big-tab-icon"><Icon size={20} /></span>
              <span>{tab.key}</span>
            </button>
          );
        })}
      </section>

      <section className="resident-tab-panel">
        {activeTab === "Overview" && (
          <OverviewTab resident={resident} dashboard={dashboard} />
        )}

        {activeTab === "Assessments" && (
          <RecordTab
            refreshKey={refreshKey}
            title="Assessments"
            icon={<ClipboardCheck />}
            endpoint={`/assessments?resident_id=${residentId}`}
            addLabel="Add Assessment"
            onAdd={() => setModalType("assessment")}
            pdfPath={(item) => `/assessments/${item.id}/pdf`}
            emptyText="No assessments found."
            getTitle={(i) => i.assessment_type || "Assessment"}
            getMeta={(i) => `${i.status || "DRAFT"} · ${formatDate(i.assessment_date)}`}
          />
        )}

        {activeTab === "Treatment Plans" && (
          <RecordTab
            refreshKey={refreshKey}
            title="Treatment Plans"
            icon={<HeartPulse />}
            endpoint={`/treatment-plans?resident_id=${residentId}`}
            addLabel="Add Treatment Plan"
            onAdd={() => setModalType("treatment")}
            pdfPath={(item) => `/treatment-plans/${item.id}/pdf`}
            emptyText="No treatment plans found."
            getTitle={(i) => i.overall_goal || "Treatment Plan"}
            getMeta={(i) => `${i.status || "DRAFT"} · Plan ${formatDate(i.plan_date)} · Review ${formatDate(i.review_due_date)}`}
          />
        )}

        {activeTab === "Crisis Plans" && (
          <RecordTab
            refreshKey={refreshKey}
            title="Crisis Plans"
            icon={<ShieldAlert />}
            endpoint={`/crisis-plans?resident_id=${residentId}`}
            addLabel="Add Crisis Plan"
            onAdd={() => setModalType("crisis")}
            pdfPath={(item) => `/crisis-plans/${item.id}/pdf`}
            emptyText="No crisis plans found."
            getTitle={(i) => i.status || "Crisis Plan"}
            getMeta={(i) => `Plan ${formatDate(i.plan_date)} · Review ${formatDate(i.review_due_date)}`}
          />
        )}

        {activeTab === "CFT Meetings" && (
          <RecordTab
            refreshKey={refreshKey}
            title="CFT Meetings"
            icon={<Users />}
            endpoint={`/cft-meetings?resident_id=${residentId}`}
            addLabel="Add CFT Meeting"
            onAdd={() => setModalType("cft")}
            pdfPath={(item) => `/cft-meetings/${item.id}/pdf`}
            emptyText="No CFT meetings found."
            getTitle={(i) => i.meeting_type || "CFT Meeting"}
            getMeta={(i) => `${i.status || "DRAFT"} · ${formatDate(i.meeting_date)} · Next ${formatDate(i.next_meeting_date)}`}
          />
        )}

        {activeTab === "Medication" && (
          <RecordTab
            refreshKey={refreshKey}
            title="Medication Orders"
            icon={<Pill />}
            endpoint={`/medication-orders?resident_id=${residentId}`}
            addLabel="Add Medication"
            onAdd={() => setModalType("medication")}
            emptyText="No medication orders found."
            getTitle={(i) => i.medication_name || i.name || "Medication Order"}
            getMeta={(i) => `${i.dosage || ""} ${i.frequency || ""} · ${i.status || "ACTIVE"}`}
          />
        )}

        {activeTab === "Documents" && (
          <DocumentsTab
            residentId={residentId}
            refreshKey={refreshKey}
            onUpload={() => setModalType("document")}
          />
        )}

        {activeTab === "Compliance" && (
          <ComplianceTab residentId={residentId} refreshKey={refreshKey} />
        )}

        {activeTab === "Tasks" && (
          <RecordTab
            refreshKey={refreshKey}
            title="Tasks"
            icon={<CheckSquare />}
            endpoint={`/tasks?resident_id=${residentId}`}
            addLabel="Add Task"
            onAdd={() => setModalType("task")}
            emptyText="No tasks found."
            getTitle={(i) => i.title || "Task"}
            getMeta={(i) => `${i.priority || "NORMAL"} · ${i.status || "OPEN"} · Due ${formatDate(i.due_date)}`}
          />
        )}

        {activeTab === "Calendar" && (
          <RecordTab
            refreshKey={refreshKey}
            title="Calendar"
            icon={<CalendarDays />}
            endpoint={`/calendar/resident/${residentId}`}
            addLabel="Add Calendar Event"
            onAdd={() => setModalType("calendar")}
            emptyText="No calendar events found."
            getTitle={(i) => i.title || "Calendar Event"}
            getMeta={(i) => `${i.event_type || "EVENT"} · ${formatDateTime(i.start_time)} · ${i.status || "SCHEDULED"}`}
          />
        )}
      </section>

      {showEditModal && editForm && (
        <ResidentEditModal
          form={editForm}
          setForm={setEditForm}
          onClose={() => setShowEditModal(false)}
          onSubmit={updateResident}
          saving={saving}
        />
      )}

      {modalType === "assessment" && <AssessmentModal residentId={residentId} onClose={() => setModalType(null)} onSaved={afterCreate} />}
      {modalType === "treatment" && <TreatmentPlanModal residentId={residentId} onClose={() => setModalType(null)} onSaved={afterCreate} />}
      {modalType === "crisis" && <CrisisPlanModal residentId={residentId} onClose={() => setModalType(null)} onSaved={afterCreate} />}
      {modalType === "cft" && <CFTMeetingModal residentId={residentId} onClose={() => setModalType(null)} onSaved={afterCreate} />}
      {modalType === "medication" && <MedicationModal residentId={residentId} onClose={() => setModalType(null)} onSaved={afterCreate} />}
      {modalType === "document" && <DocumentModal residentId={residentId} onClose={() => setModalType(null)} onSaved={afterCreate} />}
      {modalType === "task" && <TaskModal residentId={residentId} onClose={() => setModalType(null)} onSaved={afterCreate} />}
      {modalType === "calendar" && <CalendarModal residentId={residentId} onClose={() => setModalType(null)} onSaved={afterCreate} />}
    </div>
  );
}

function RecordTab({ title, icon, endpoint, addLabel, onAdd, emptyText, getTitle, getMeta, pdfPath, refreshKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadItems(); }, [endpoint, refreshKey]);

  async function loadItems() {
    try {
      setLoading(true);
      const res = await api.get(endpoint);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function generatePdf(item) {
    try {
      const res = await api.get(pdfPath(item));
      window.open(res.data.download_url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Unable to generate PDF.");
    }
  }

  return (
    <div className="premium-panel">
      <div className="panel-header">
        <h3><span className="inline-icon">{icon}</span>{title}</h3>
        {onAdd && <button className="primary-btn" onClick={onAdd}><Plus size={15} /> {addLabel}</button>}
      </div>

      {loading ? <p className="empty-text">Loading...</p> :
        items.length === 0 ? <p className="empty-text">{emptyText}</p> :
        <div className="entity-list">
          {items.map((item) => (
            <div key={item.id} className="entity-row rich-row">
              <div>
                <strong>{getTitle(item)}</strong>
                <p>{getMeta(item)}</p>
              </div>
              <div className="row-actions">
                {pdfPath && <button className="secondary-btn" onClick={() => generatePdf(item)}><Download size={14} /> PDF</button>}
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}

function DocumentsTab({ residentId, onUpload, refreshKey }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDocs(); }, [residentId, refreshKey]);

  async function loadDocs() {
    try {
      setLoading(true);
      const res = await api.get(`/documents?entity_type=RESIDENT&entity_id=${residentId}`);
      setDocs(res.data || []);
    } catch (err) {
      console.error(err);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  async function openOriginal(id) {
    const res = await api.get(`/documents/${id}/download-url`);
    window.open(res.data.download_url, "_blank");
  }

  async function openSigned(id) {
    const res = await api.get(`/documents/${id}/signed-download-url`);
    window.open(res.data.signed_pdf_url, "_blank");
  }

  return (
    <div className="premium-panel">
      <div className="panel-header">
        <h3><span className="inline-icon"><FileText /></span>Documents</h3>
        <button className="primary-btn" onClick={onUpload}><UploadCloud size={15} /> Upload Document</button>
      </div>

      {loading ? <p className="empty-text">Loading...</p> :
        docs.length === 0 ? <p className="empty-text">No documents found.</p> :
        <div className="entity-list">
          {docs.map((doc) => (
            <div key={doc.id} className="entity-row rich-row">
              <div>
                <strong>{doc.title}</strong>
                <p>{doc.document_type} · {doc.is_signed ? "Signed" : "Unsigned"} · {doc.is_locked ? "Locked" : "Unlocked"}</p>
              </div>
              <div className="row-actions">
                <button className="secondary-btn" onClick={() => openOriginal(doc.id)}><Download size={14} /> Open</button>
                {doc.is_signed && <button className="secondary-btn" onClick={() => openSigned(doc.id)}><FileLock2 size={14} /> Signed</button>}
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}

function ComplianceTab({ residentId, refreshKey }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAlerts(); }, [residentId, refreshKey]);

  async function loadAlerts() {
    try {
      setLoading(true);
      const res = await api.get(`/compliance/alerts?resident_id=${residentId}`);
      setAlerts(res.data || []);
    } catch (err) {
      console.error(err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }

  async function generateAll() {
    const calls = [
      api.post(`/treatment-plans/compliance/generate/${residentId}`).catch(() => null),
      api.post(`/crisis-plans/compliance/generate/${residentId}`).catch(() => null),
      api.post(`/cft-meetings/compliance/generate/${residentId}`).catch(() => null),
      api.post(`/appointment-evaluations/compliance/generate/${residentId}`).catch(() => null),
      api.post(`/discharge-summaries/compliance/generate/${residentId}`).catch(() => null),
    ];
    await Promise.all(calls);
    await loadAlerts();
  }

  return (
    <div className="premium-panel">
      <div className="panel-header">
        <h3><span className="inline-icon"><ShieldAlert /></span>Compliance Alerts</h3>
        <button className="primary-btn" onClick={generateAll}><Bell size={15} /> Generate Checks</button>
      </div>

      {loading ? <p className="empty-text">Loading...</p> :
        alerts.length === 0 ? <p className="empty-text">No compliance alerts found.</p> :
        <div className="entity-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="entity-row rich-row">
              <div>
                <strong>{alert.title}</strong>
                <p>{alert.severity || "WARNING"} · Due {formatDate(alert.due_date)}</p>
                <p>{alert.description}</p>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}

function ResidentEditModal(props) {
  const { form, setForm, onClose, onSubmit, saving } = props;
  return (
    <BaseModal title="Edit Resident Profile" eyebrow="Resident Chart" onClose={onClose}>
      <form onSubmit={onSubmit} className="modal-form-grid">
        <Input label="First Name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} required />
        <Input label="Last Name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} required />
        <Input label="DOB" type="date" value={form.date_of_birth} onChange={(v) => setForm({ ...form, date_of_birth: v })} />
        <Select label="Gender" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={["", "Male", "Female", "Other"]} />
        <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Input label="Admission Date" type="date" value={form.admission_date} onChange={(v) => setForm({ ...form, admission_date: v })} />
        <Input label="Discharge Date" type="date" value={form.discharge_date} onChange={(v) => setForm({ ...form, discharge_date: v })} />
        <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["ACTIVE", "PENDING", "INACTIVE", "DISCHARGED"]} />
        <Input label="Diagnosis" value={form.diagnosis} onChange={(v) => setForm({ ...form, diagnosis: v })} />
        <Input label="Program" value={form.program} onChange={(v) => setForm({ ...form, program: v })} />
        <Input label="Level of Care" value={form.level_of_care} onChange={(v) => setForm({ ...form, level_of_care: v })} />
        <Input label="Case Manager" value={form.case_manager_name} onChange={(v) => setForm({ ...form, case_manager_name: v })} />
        <Input label="BHP" value={form.bhp_name} onChange={(v) => setForm({ ...form, bhp_name: v })} />
        <Input label="Primary Care Provider" value={form.primary_care_provider} onChange={(v) => setForm({ ...form, primary_care_provider: v })} />
        <Input label="Guardian Name" value={form.guardian_name} onChange={(v) => setForm({ ...form, guardian_name: v })} />
        <Input label="Guardian Phone" value={form.guardian_phone} onChange={(v) => setForm({ ...form, guardian_phone: v })} />
        <Input label="Guardian Relationship" value={form.guardian_relationship} onChange={(v) => setForm({ ...form, guardian_relationship: v })} />
        <TextArea label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <ModalActions onClose={onClose} saving={saving} saveText="Save Changes" />
      </form>
    </BaseModal>
  );
}

function AssessmentModal({ residentId, onClose, onSaved }) {
  const [form, setForm] = useState({
    resident_id: residentId, assessment_type: "COMPREHENSIVE", assessment_date: "",
    biopsychosocial_summary: "", mental_health_summary: "", risk_summary: "",
    functional_summary: "", substance_use_summary: "", trauma_history: "",
    housing_history: "", employment_history: "", behavioral_summary: "",
    safety_summary: "", recommendations: "", assessor_name: "", assessor_role: "", status: "DRAFT",
  });
  return (
    <SimpleSaveModal title="Add Assessment" endpoint="/assessments" form={form} setForm={setForm} onClose={onClose} onSaved={onSaved} required={["assessment_date"]}>
      <Select label="Assessment Type" value={form.assessment_type} onChange={(v) => setForm({ ...form, assessment_type: v })} options={["COMPREHENSIVE", "BIOPSYCHOSOCIAL", "MENTAL_HEALTH", "RISK", "FUNCTIONAL", "SUBSTANCE_USE"]} />
      <Input label="Assessment Date" type="date" value={form.assessment_date} onChange={(v) => setForm({ ...form, assessment_date: v })} required />
      <Input label="Assessor Name" value={form.assessor_name} onChange={(v) => setForm({ ...form, assessor_name: v })} />
      <Input label="Assessor Role" value={form.assessor_role} onChange={(v) => setForm({ ...form, assessor_role: v })} />
      <TextArea label="Biopsychosocial Summary" value={form.biopsychosocial_summary} onChange={(v) => setForm({ ...form, biopsychosocial_summary: v })} />
      <TextArea label="Mental Health Summary" value={form.mental_health_summary} onChange={(v) => setForm({ ...form, mental_health_summary: v })} />
      <TextArea label="Risk Summary" value={form.risk_summary} onChange={(v) => setForm({ ...form, risk_summary: v })} />
      <TextArea label="Functional Summary" value={form.functional_summary} onChange={(v) => setForm({ ...form, functional_summary: v })} />
      <TextArea label="Substance Use Summary" value={form.substance_use_summary} onChange={(v) => setForm({ ...form, substance_use_summary: v })} />
      <TextArea label="Trauma History" value={form.trauma_history} onChange={(v) => setForm({ ...form, trauma_history: v })} />
      <TextArea label="Housing History" value={form.housing_history} onChange={(v) => setForm({ ...form, housing_history: v })} />
      <TextArea label="Employment History" value={form.employment_history} onChange={(v) => setForm({ ...form, employment_history: v })} />
      <TextArea label="Behavioral Summary" value={form.behavioral_summary} onChange={(v) => setForm({ ...form, behavioral_summary: v })} />
      <TextArea label="Safety Summary" value={form.safety_summary} onChange={(v) => setForm({ ...form, safety_summary: v })} />
      <TextArea label="Recommendations" value={form.recommendations} onChange={(v) => setForm({ ...form, recommendations: v })} />
    </SimpleSaveModal>
  );
}

function TreatmentPlanModal({ residentId, onClose, onSaved }) {
  const [form, setForm] = useState({
    resident_id: residentId, plan_date: "", review_due_date: "", diagnosis_summary: "",
    strengths: "", needs: "", barriers: "", overall_goal: "", status: "DRAFT",
  });
  return (
    <SimpleSaveModal title="Add Treatment Plan" endpoint="/treatment-plans" form={form} setForm={setForm} onClose={onClose} onSaved={onSaved} required={["plan_date"]}>
      <Input label="Plan Date" type="date" value={form.plan_date} onChange={(v) => setForm({ ...form, plan_date: v })} required />
      <Input label="Review Due Date" type="date" value={form.review_due_date} onChange={(v) => setForm({ ...form, review_due_date: v })} />
      <TextArea label="Diagnosis Summary" value={form.diagnosis_summary} onChange={(v) => setForm({ ...form, diagnosis_summary: v })} />
      <TextArea label="Strengths" value={form.strengths} onChange={(v) => setForm({ ...form, strengths: v })} />
      <TextArea label="Needs" value={form.needs} onChange={(v) => setForm({ ...form, needs: v })} />
      <TextArea label="Barriers" value={form.barriers} onChange={(v) => setForm({ ...form, barriers: v })} />
      <TextArea label="Overall Goal" value={form.overall_goal} onChange={(v) => setForm({ ...form, overall_goal: v })} />
      <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["DRAFT", "ACTIVE", "REVIEWED", "CLOSED"]} />
    </SimpleSaveModal>
  );
}

function CrisisPlanModal({ residentId, onClose, onSaved }) {
  const [form, setForm] = useState({
    resident_id: residentId, plan_date: "", review_due_date: "", triggers: "", warning_signs: "",
    deescalation_strategies: "", coping_skills: "", safety_interventions: "",
    emergency_contacts: "", preferred_hospital: "", guardian_notification_instructions: "", status: "ACTIVE",
  });
  return (
    <SimpleSaveModal title="Add Crisis Plan" endpoint="/crisis-plans" form={form} setForm={setForm} onClose={onClose} onSaved={onSaved} required={["plan_date"]}>
      <Input label="Plan Date" type="date" value={form.plan_date} onChange={(v) => setForm({ ...form, plan_date: v })} required />
      <Input label="Review Due Date" type="date" value={form.review_due_date} onChange={(v) => setForm({ ...form, review_due_date: v })} />
      <TextArea label="Triggers" value={form.triggers} onChange={(v) => setForm({ ...form, triggers: v })} />
      <TextArea label="Warning Signs" value={form.warning_signs} onChange={(v) => setForm({ ...form, warning_signs: v })} />
      <TextArea label="De-escalation Strategies" value={form.deescalation_strategies} onChange={(v) => setForm({ ...form, deescalation_strategies: v })} />
      <TextArea label="Coping Skills" value={form.coping_skills} onChange={(v) => setForm({ ...form, coping_skills: v })} />
      <TextArea label="Safety Interventions" value={form.safety_interventions} onChange={(v) => setForm({ ...form, safety_interventions: v })} />
      <TextArea label="Emergency Contacts" value={form.emergency_contacts} onChange={(v) => setForm({ ...form, emergency_contacts: v })} />
      <Input label="Preferred Hospital" value={form.preferred_hospital} onChange={(v) => setForm({ ...form, preferred_hospital: v })} />
      <TextArea label="Guardian Notification Instructions" value={form.guardian_notification_instructions} onChange={(v) => setForm({ ...form, guardian_notification_instructions: v })} />
    </SimpleSaveModal>
  );
}

function CFTMeetingModal({ residentId, onClose, onSaved }) {
  const [form, setForm] = useState({
    resident_id: residentId, meeting_date: "", meeting_type: "CFT", guardian_present: false,
    resident_present: false, facilitator_name: "", discussion_notes: "", recommendations: "",
    next_meeting_date: "", status: "DRAFT",
  });
  return (
    <SimpleSaveModal title="Add CFT Meeting" endpoint="/cft-meetings" form={form} setForm={setForm} onClose={onClose} onSaved={onSaved} required={["meeting_date"]}>
      <Input label="Meeting Date" type="date" value={form.meeting_date} onChange={(v) => setForm({ ...form, meeting_date: v })} required />
      <Input label="Meeting Type" value={form.meeting_type} onChange={(v) => setForm({ ...form, meeting_type: v })} />
      <Input label="Facilitator Name" value={form.facilitator_name} onChange={(v) => setForm({ ...form, facilitator_name: v })} />
      <Input label="Next Meeting Date" type="date" value={form.next_meeting_date} onChange={(v) => setForm({ ...form, next_meeting_date: v })} />
      <Checkbox label="Guardian Present" checked={form.guardian_present} onChange={(v) => setForm({ ...form, guardian_present: v })} />
      <Checkbox label="Resident Present" checked={form.resident_present} onChange={(v) => setForm({ ...form, resident_present: v })} />
      <TextArea label="Discussion Notes" value={form.discussion_notes} onChange={(v) => setForm({ ...form, discussion_notes: v })} />
      <TextArea label="Recommendations" value={form.recommendations} onChange={(v) => setForm({ ...form, recommendations: v })} />
    </SimpleSaveModal>
  );
}

function MedicationModal({ residentId, onClose, onSaved }) {
  const [form, setForm] = useState({
    resident_id: residentId, medication_name: "", dosage: "", route: "", frequency: "",
    start_date: "", end_date: "", prescribing_provider: "", pharmacy: "", instructions: "", status: "ACTIVE",
  });
  return (
    <SimpleSaveModal title="Add Medication Order" endpoint="/medication-orders" form={form} setForm={setForm} onClose={onClose} onSaved={onSaved} required={["medication_name"]}>
      <Input label="Medication Name" value={form.medication_name} onChange={(v) => setForm({ ...form, medication_name: v })} required />
      <Input label="Dosage" value={form.dosage} onChange={(v) => setForm({ ...form, dosage: v })} />
      <Input label="Route" value={form.route} onChange={(v) => setForm({ ...form, route: v })} />
      <Input label="Frequency" value={form.frequency} onChange={(v) => setForm({ ...form, frequency: v })} />
      <Input label="Start Date" type="date" value={form.start_date} onChange={(v) => setForm({ ...form, start_date: v })} />
      <Input label="End Date" type="date" value={form.end_date} onChange={(v) => setForm({ ...form, end_date: v })} />
      <Input label="Prescribing Provider" value={form.prescribing_provider} onChange={(v) => setForm({ ...form, prescribing_provider: v })} />
      <Input label="Pharmacy" value={form.pharmacy} onChange={(v) => setForm({ ...form, pharmacy: v })} />
      <TextArea label="Instructions" value={form.instructions} onChange={(v) => setForm({ ...form, instructions: v })} />
    </SimpleSaveModal>
  );
}

function DocumentModal({ residentId, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    file: null, title: "", entity_type: "RESIDENT", entity_id: residentId,
    document_type: "OTHER", description: "", requires_signature: false,
  });

  async function submit(e) {
    e.preventDefault();
    if (!form.file || !form.title) return alert("File and title are required.");
    try {
      setSaving(true);
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== "") data.append(k, v);
      });
      await api.post("/documents/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
      onSaved();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to upload document.");
    } finally { setSaving(false); }
  }

  return (
    <BaseModal title="Upload Document" eyebrow="Document Center" onClose={onClose}>
      <form onSubmit={submit} className="modal-form-grid">
        <div className="modal-field full"><label>File</label><input type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} /></div>
        <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <Select label="Document Type" value={form.document_type} onChange={(v) => setForm({ ...form, document_type: v })} options={["ASSESSMENT", "CONSENT", "LEGAL_DOCUMENT", "TREATMENT_PLAN", "CRISIS_PLAN", "CFT_MEETING", "DISCHARGE_SUMMARY", "LAB_RESULT", "INSURANCE", "OTHER"]} />
        <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        <Checkbox label="Requires Signature" checked={form.requires_signature} onChange={(v) => setForm({ ...form, requires_signature: v })} />
        <ModalActions onClose={onClose} saving={saving} saveText="Upload Document" />
      </form>
    </BaseModal>
  );
}

function TaskModal({ residentId, onClose, onSaved }) {
  const [form, setForm] = useState({ resident_id: residentId, title: "", description: "", task_type: "GENERAL_TASK", priority: "NORMAL", due_date: "", status: "OPEN" });
  return (
    <SimpleSaveModal title="Create Task" endpoint="/tasks" form={form} setForm={setForm} onClose={onClose} onSaved={onSaved} required={["title", "task_type"]}>
      <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
      <Input label="Task Type" value={form.task_type} onChange={(v) => setForm({ ...form, task_type: v })} required />
      <Select label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={["NORMAL", "HIGH", "CRITICAL"]} />
      <Input label="Due Date" type="date" value={form.due_date} onChange={(v) => setForm({ ...form, due_date: v })} />
      <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
    </SimpleSaveModal>
  );
}

function CalendarModal({ residentId, onClose, onSaved }) {
  const [form, setForm] = useState({ resident_id: residentId, title: "", event_type: "APPOINTMENT", start_time: "", end_time: "", location: "", description: "", priority: "NORMAL", status: "SCHEDULED" });
  return (
    <SimpleSaveModal title="Create Calendar Event" endpoint="/calendar/events" form={form} setForm={setForm} onClose={onClose} onSaved={onSaved} required={["title", "event_type", "start_time"]}>
      <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
      <Select label="Event Type" value={form.event_type} onChange={(v) => setForm({ ...form, event_type: v })} options={["APPOINTMENT", "PSYCHIATRY", "PCP", "THERAPY", "CFT_MEETING", "MEDICATION", "COMPLIANCE_DUE", "OTHER"]} />
      <Input label="Start Time" type="datetime-local" value={form.start_time} onChange={(v) => setForm({ ...form, start_time: v })} required />
      <Input label="End Time" type="datetime-local" value={form.end_time} onChange={(v) => setForm({ ...form, end_time: v })} />
      <Input label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
      <Select label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={["NORMAL", "HIGH", "CRITICAL"]} />
      <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
    </SimpleSaveModal>
  );
}

function SimpleSaveModal({ title, endpoint, form, setForm, onClose, onSaved, required = [], children }) {
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    for (const field of required) {
      if (!form[field]) return alert(`${field} is required.`);
    }
    try {
      setSaving(true);
      const cleaned = {};
      Object.entries(form).forEach(([k, v]) => {
        cleaned[k] = v === "" ? null : v;
      });
      await api.post(endpoint, cleaned);
      onSaved();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save record.");
    } finally { setSaving(false); }
  }

  return (
    <BaseModal title={title} eyebrow="Resident Clinical Workflow" onClose={onClose}>
      <form onSubmit={submit} className="modal-form-grid">
        {children}
        <ModalActions onClose={onClose} saving={saving} saveText="Save" />
      </form>
    </BaseModal>
  );
}

function BaseModal({ title, eyebrow, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="premium-modal large">
        <div className="modal-header">
          <div>
            <p className="dashboard-eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button className="icon-close" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onClose, saving, saveText }) {
  return (
    <div className="modal-actions full">
      <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
      <button className="primary-btn" disabled={saving}>{saving ? "Saving..." : saveText}</button>
    </div>
  );
}

function OverviewTab({ resident, dashboard }) {
  return (
    <div className="overview-grid">
      <div className="premium-panel wide">
        <h3>Clinical Snapshot</h3>
        <div className="overview-list">
          <Row label="Diagnosis" value={resident.diagnosis || "—"} />
          <Row label="Program" value={resident.program || "—"} />
          <Row label="Level of Care" value={resident.level_of_care || "—"} />
          <Row label="Assigned Case Manager" value={resident.case_manager_name || "—"} />
          <Row label="Assigned BHP" value={resident.bhp_name || "—"} />
          <Row label="PCP" value={resident.primary_care_provider || "—"} />
        </div>
      </div>

      <div className="premium-panel">
        <h3>Resident Dashboard</h3>
        <DashboardMini label="Open Alerts" value={dashboard?.open_alerts ?? 0} />
        <DashboardMini label="Tasks Due" value={dashboard?.tasks_due ?? 0} />
        <DashboardMini label="Documents" value={dashboard?.documents_count ?? 0} />
        <DashboardMini label="Pending Signatures" value={dashboard?.pending_signatures ?? 0} />
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }) {
  return <div className="modal-field"><label>{label}</label><input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} required={required} /></div>;
}

function Select({ label, value, onChange, options }) {
  return <div className="modal-field"><label>{label}</label><select value={value || ""} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o || "blank"} value={o}>{o || "Select"}</option>)}</select></div>;
}

function TextArea({ label, value, onChange }) {
  return <div className="modal-field full"><label>{label}</label><textarea value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>;
}

function Checkbox({ label, checked, onChange }) {
  return <label className="checkbox-line"><input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>;
}

function InfoCard({ title, icon, items }) {
  return (
    <div className="resident-info-card">
      <div className="info-card-title"><span>{icon}</span><h3>{title}</h3></div>
      {items.map(([label, value]) => <Row key={label} label={label} value={value} />)}
    </div>
  );
}

function Row({ label, value }) {
  return <div className="info-row"><span>{label}</span><strong>{value}</strong></div>;
}

function DashboardMini({ label, value }) {
  return <div className="dashboard-metric"><span>{label}</span><strong>{value}</strong></div>;
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

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function toDateInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}
