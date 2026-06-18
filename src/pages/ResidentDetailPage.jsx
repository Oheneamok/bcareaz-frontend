import { useEffect, useState } from "react";
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
  FileSignature,
  Activity,
  Edit3,
  PlusCircle,
} from "lucide-react";

import api from "../services/api";
import AdmissionDisclosuresTab from "../components/admission/AdmissionDisclosuresTab";
import AssessmentsTab from "../components/assessments/AssessmentsTab";

const tabs = [
  { label: "Overview", icon: User, color: "blue" },
  { label: "Assessments", icon: ClipboardCheck, color: "green" },
  { label: "Treatment Plans", icon: HeartPulse, color: "rose" },
  { label: "Crisis Plans", icon: ShieldAlert, color: "red" },
  { label: "CFT Meetings", icon: Users, color: "amber" },
  { label: "Medication", icon: Pill, color: "emerald" },
  { label: "Disclosures", icon: FileSignature, color: "violet" },
  { label: "Documents", icon: FileText, color: "slate" },
  { label: "Compliance", icon: ShieldAlert, color: "orange" },
  { label: "Tasks", icon: CheckSquare, color: "cyan" },
  { label: "Calendar", icon: CalendarDays, color: "indigo" },
];

export default function ResidentDetailPage() {
  const { residentId } = useParams();

  const [resident, setResident] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResident();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId]);

  async function loadResident() {
    try {
      setLoading(true);

      const [residentRes, dashboardRes] = await Promise.all([
        api.get(`/residents/${residentId}`),
        api.get(`/residents/${residentId}/dashboard`),
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
      first_name: resident.first_name || "",
      last_name: resident.last_name || "",
      date_of_birth: resident.date_of_birth || "",
      gender: resident.gender || "",
      phone: resident.phone || "",
      email: resident.email || "",
      admission_date: resident.admission_date || "",
      discharge_date: resident.discharge_date || "",
      status: resident.status || "ACTIVE",
      diagnosis: resident.diagnosis || resident.primary_diagnosis || "",
      guardian_name: resident.guardian_name || "",
      guardian_phone: resident.guardian_phone || "",
      guardian_relationship: resident.guardian_relationship || "",
      address: resident.address || "",
      program: resident.program || "",
      level_of_care: resident.level_of_care || "",
      case_manager_name: resident.case_manager_name || "",
      bhp_name: resident.bhp_name || "",
      primary_care_provider: resident.primary_care_provider || resident.pcp_name || "",
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

  if (loading) return <div className="page">Loading resident chart...</div>;
  if (!resident) return <div className="page">Resident not found.</div>;

  return (
    <div className="resident-detail-page premium-resident-detail">
      <Link to="/residents" className="back-link">
        <ArrowLeft size={17} />
        Back to Residents
      </Link>

      <section className="resident-profile-hero premium-profile-hero">
        <div className="resident-profile-left">
          <div className="resident-profile-avatar premium-avatar">
            {getInitials(resident)}
          </div>

          <div>
            <p className="dashboard-eyebrow">Resident Chart</p>
            <h1>
              {resident.first_name} {resident.last_name}
            </h1>
            <p className="hero-subtext">{resident.resident_code || resident.id}</p>

            <div className="profile-badges">
              <span className={`status-badge ${resident.status?.toLowerCase()}`}>
                {resident.status || "UNKNOWN"}
              </span>
              <span className="soft-badge">{resident.gender || "Gender N/A"}</span>
              <span className="soft-badge">DOB: {formatDate(resident.date_of_birth)}</span>
              <span className="soft-badge">Admit: {formatDate(resident.admission_date)}</span>
            </div>
          </div>
        </div>

        <div className="resident-profile-actions">
          <button onClick={openEditModal}>
            <Edit3 size={16} />
            Edit Profile
          </button>
          <button className="dark">
            <PlusCircle size={16} />
            Create Task
          </button>
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

      <section className="resident-tabs big-tabs premium-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              className={`resident-tab-button tab-${tab.color} ${
                activeTab === tab.label ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.label)}
            >
              <span className="tab-icon-wrap">
                <Icon size={19} />
              </span>
              <strong>{tab.label}</strong>
            </button>
          );
        })}
      </section>

      <section className="resident-tab-panel premium-tab-panel">
        {activeTab === "Overview" && (
          <OverviewTab resident={resident} dashboard={dashboard} residentId={residentId} />
        )}

        {activeTab === "Assessments" && (
          <AssessmentsTab resident={resident} residentId={residentId} />
        )}

        {activeTab === "Treatment Plans" && (
          <EntityTab
            title="Treatment Plans"
            icon={<HeartPulse />}
            endpoint={`/treatment-plans?resident_id=${residentId}`}
            pdfBase="/treatment-plans"
            emptyText="No treatment plans found."
          />
        )}

        {activeTab === "Crisis Plans" && (
          <EntityTab
            title="Crisis Plans"
            icon={<ShieldAlert />}
            endpoint={`/crisis-plans?resident_id=${residentId}`}
            pdfBase="/crisis-plans"
            emptyText="No crisis plans found."
          />
        )}

        {activeTab === "CFT Meetings" && (
          <EntityTab
            title="CFT Meetings"
            icon={<Users />}
            endpoint={`/cft-meetings?resident_id=${residentId}`}
            pdfBase="/cft-meetings"
            emptyText="No CFT meetings found."
          />
        )}

        {activeTab === "Medication" && (
          <EntityTab
            title="Medication Orders"
            icon={<Pill />}
            endpoint={`/medication-orders?resident_id=${residentId}`}
            emptyText="No medication orders found."
          />
        )}

        {activeTab === "Disclosures" && (
          <AdmissionDisclosuresTab residentId={residentId} resident={resident} />
        )}

        {activeTab === "Documents" && (
          <EntityTab
            title="Documents"
            icon={<FileText />}
            endpoint={`/documents?entity_type=RESIDENT&entity_id=${residentId}`}
            emptyText="No documents found."
          />
        )}

        {activeTab === "Compliance" && (
          <EntityTab
            title="Compliance Alerts"
            icon={<ShieldAlert />}
            endpoint={`/compliance/alerts?resident_id=${residentId}`}
            emptyText="No compliance alerts found."
          />
        )}

        {activeTab === "Tasks" && (
          <EntityTab
            title="Tasks"
            icon={<CheckSquare />}
            endpoint={`/tasks?resident_id=${residentId}`}
            emptyText="No tasks found."
          />
        )}

        {activeTab === "Calendar" && (
          <EntityTab
            title="Calendar"
            icon={<CalendarDays />}
            endpoint={`/calendar/resident/${residentId}`}
            emptyText="No calendar events found."
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
    </div>
  );
}

function ResidentEditModal({ form, setForm, onClose, onSubmit, saving }) {
  return (
    <div className="modal-backdrop">
      <div className="premium-modal large">
        <div className="modal-header">
          <div>
            <p className="dashboard-eyebrow">Resident Chart</p>
            <h2>Edit Resident Profile</h2>
          </div>

          <button className="icon-close" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

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

          <div className="modal-field full">
            <label>Address</label>
            <textarea value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="modal-actions full">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OverviewTab({ resident, dashboard, residentId }) {
  return (
    <div className="overview-grid premium-overview-grid">
      <div className="premium-panel wide">
        <h3>
          <span className="inline-icon"><Activity size={18} /></span>
          Clinical Snapshot
        </h3>

        <div className="overview-list">
          <Row label="Diagnosis" value={resident.diagnosis || resident.primary_diagnosis || "—"} />
          <Row label="Program" value={resident.program || "—"} />
          <Row label="Level of Care" value={resident.level_of_care || "—"} />
          <Row label="Assigned Case Manager" value={resident.case_manager_name || "—"} />
          <Row label="Assigned BHP" value={resident.bhp_name || "—"} />
          <Row label="PCP" value={resident.primary_care_provider || resident.pcp_name || "—"} />
        </div>
      </div>

      <div className="premium-panel">
        <h3>Resident Dashboard</h3>
        <DashboardMini label="Open Alerts" value={dashboard?.open_alerts ?? 0} />
        <DashboardMini label="Tasks Due" value={dashboard?.tasks_due ?? 0} />
        <DashboardMini label="Documents" value={dashboard?.documents_count ?? 0} />
        <DashboardMini label="Pending Signatures" value={dashboard?.pending_signatures ?? 0} />
        <DashboardMini label="Resident ID" value={residentId?.slice(0, 8)} />
      </div>
    </div>
  );
}

function EntityTab({ title, icon, endpoint, emptyText, pdfBase }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

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

  async function generatePdf(itemId) {
    if (!pdfBase) return;
    try {
      const res = await api.get(`${pdfBase}/${itemId}/pdf`);
      const url = res.data?.download_url || res.data?.url || res.data?.document_url;
      if (url) window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Unable to generate PDF.");
    }
  }

  return (
    <div className="premium-panel">
      <div className="panel-header">
        <h3>
          <span className="inline-icon">{icon}</span>
          {title}
        </h3>
      </div>

      {loading ? (
        <p className="empty-text">Loading...</p>
      ) : items.length === 0 ? (
        <p className="empty-text">{emptyText}</p>
      ) : (
        <div className="entity-list">
          {items.map((item) => (
            <div key={item.id} className="entity-row">
              <div>
                <strong>{getEntityTitle(item)}</strong>
                <p>{item.status || item.created_at || item.appointment_date || "—"}</p>
              </div>

              <div className="entity-actions">
                <span>{formatDate(item.created_at || item.plan_date || item.meeting_date)}</span>
                {pdfBase && <button className="secondary-btn" onClick={() => generatePdf(item.id)}>PDF</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <div className="modal-field">
      <label>{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="modal-field">
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option || "blank"} value={option}>{option || "Select"}</option>)}
      </select>
    </div>
  );
}

function InfoCard({ title, icon, items }) {
  return (
    <div className="resident-info-card premium-info-card">
      <div className="info-card-title">
        <span>{icon}</span>
        <h3>{title}</h3>
      </div>
      {items.map(([label, value]) => <Row key={label} label={label} value={value} />)}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DashboardMini({ label, value }) {
  return (
    <div className="dashboard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getInitials(resident) {
  const first = resident.first_name?.[0] || "";
  const last = resident.last_name?.[0] || "";
  return `${first}${last}` || "R";
}

function getEntityTitle(item) {
  return (
    item.title ||
    item.assessment_type ||
    item.plan_date ||
    item.meeting_type ||
    item.document_type ||
    item.task_type ||
    item.event_type ||
    item.status ||
    "Record"
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}
