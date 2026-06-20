import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

import api from "../services/api";

import StaffComplianceTab from "../components/staff/StaffComplianceTab";
import StaffCertificationsTab from "../components/staff/StaffCertificationsTab";
import StaffTrainingTab from "../components/staff/StaffTrainingTab";
import StaffContinuingEducationTab from "../components/staff/StaffContinuingEducationTab";
import StaffScheduleTab from "../components/staff/StaffScheduleTab";
import StaffDocumentsTab from "../components/staff/StaffDocumentsTab";
import StaffPerformanceTab from "../components/staff/StaffPerformanceTab";
import StaffNotesTab from "../components/staff/StaffNotesTab";

const tabs = [
  { label: "Overview", icon: UserRound },
  { label: "Credentials", icon: Award },
  { label: "Training", icon: GraduationCap },
  { label: "Continuing Education", icon: BookOpenCheck },
  { label: "Compliance", icon: ShieldCheck },
  { label: "Schedule", icon: CalendarDays },
  { label: "Documents", icon: FileText },
  { label: "Performance", icon: Star },
  { label: "Notes", icon: MessageSquareText },
];

export default function StaffDetailPage() {
  const { staffId } = useParams();

  const [staff, setStaff] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [ce, setCe] = useState([]);
  const [certs, setCerts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, [staffId]);

  async function loadStaff() {
    try {
      setLoading(true);

      const [staffRes, assignmentsRes, ceRes, certRes, alertsRes] =
        await Promise.allSettled([
          api.get(`/staff/${staffId}`),
          api.get(`/staff-compliance/training-assignments?staff_id=${staffId}`),
          api.get(`/staff-compliance/continuing-education?staff_id=${staffId}`),
          api.get(`/staff-compliance/certifications?staff_id=${staffId}`),
          api.get(`/staff-compliance/alerts?staff_id=${staffId}`),
        ]);

      if (staffRes.status === "fulfilled") setStaff(staffRes.value.data);

      setAssignments(getArray(assignmentsRes));
      setCe(getArray(ceRes));
      setCerts(getArray(certRes));
      setAlerts(getArray(alertsRes));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const completedAssignments = assignments.filter(
      (a) => `${a.status || ""}`.toUpperCase() === "COMPLETED"
    ).length;

    const ceHours = ce.reduce((sum, r) => sum + Number(r.hours_earned || 0), 0);

    const openAlerts = alerts.filter(
      (a) => !a.is_resolved && `${a.status || ""}`.toUpperCase() !== "RESOLVED"
    );

    const expiredCerts = certs.filter((c) => isExpired(c.expiration_date));

    const totalComplianceItems =
      Math.max(assignments.length, 1) + Math.max(certs.length, 1);

    const goodItems =
      completedAssignments + certs.filter((c) => !isExpired(c.expiration_date)).length;

    const score = Math.min(
      100,
      Math.max(0, Math.round((goodItems / totalComplianceItems) * 100))
    );

    return {
      completedAssignments,
      pendingAssignments: assignments.length - completedAssignments,
      ceHours,
      openAlerts,
      expiredCerts,
      score,
    };
  }, [assignments, ce, certs, alerts]);

  if (loading) return <div className="page">Loading staff profile...</div>;
  if (!staff) return <div className="page">Staff not found.</div>;

  return (
    <div className="staff-detail-page">
      <Link to="/staff" className="staff-back-link">
        <ArrowLeft size={17} />
        Back to Staff
      </Link>

      <section className="staff-hero-premium">
        <div className="staff-hero-left">
          <div className="staff-avatar-xl">
            {getInitials(staff.full_name)}
            <span className="staff-online-dot" />
          </div>

          <div>
            <p className="dashboard-eyebrow staff-eyebrow">
              <ShieldCheck size={15} />
              Staff Profile
            </p>

            <h1>{staff.full_name}</h1>

            <div className="staff-subline">
              <span>{staff.position || "Staff Member"}</span>
              <span>Employee # {staff.employee_number || "—"}</span>
            </div>

            <div className="profile-badges">
              <span className={`status-badge ${staff.employment_status?.toLowerCase()}`}>
                <CheckCircle2 size={13} />
                {staff.employment_status || "UNKNOWN"}
              </span>

              <span className="soft-badge">
                <BriefcaseBusiness size={13} />
                {staff.department || "Department N/A"}
              </span>

              <span className="soft-badge">
                <CalendarDays size={13} />
                Hire: {formatDate(staff.hire_date)}
              </span>
            </div>
          </div>
        </div>

        <div className="staff-hero-actions">
          <button type="button">Edit Profile</button>
          <button type="button" className="dark">
            Assign Training
          </button>
        </div>
      </section>

      <section className="staff-summary-grid">
        <InfoCard
          title="Contact"
          icon={<UserRound />}
          accent="blue"
          items={[
            ["Email", staff.email || "—", <Mail size={14} />],
            ["Phone", staff.phone || "—", <Phone size={14} />],
            ["Employee #", staff.employee_number || "—", null],
          ]}
        />

        <InfoCard
          title="Credential Dates"
          icon={<ShieldCheck />}
          accent="indigo"
          items={[
            ["CPR Expiry", formatDate(staff.cpr_expiry_date), null],
            ["First Aid Expiry", formatDate(staff.first_aid_expiry_date), null],
            ["Fingerprint Expiry", formatDate(staff.fingerprint_expiry_date), null],
          ]}
        />

        <InfoCard
          title="Compliance Overview"
          icon={<ClipboardCheck />}
          accent="green"
          items={[
            ["Score", `${stats.score}%`, null],
            ["Open Alerts", stats.openAlerts.length, null],
            ["Expired Credentials", stats.expiredCerts.length, null],
          ]}
        />

        <InfoCard
          title="Continuing Education"
          icon={<GraduationCap />}
          accent="purple"
          items={[
            ["Records", ce.length, null],
            ["Hours Earned", stats.ceHours, null],
            ["Cycle", "40 hrs / 2 yrs", null],
          ]}
        />
      </section>

      <section className="staff-tab-shell">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              type="button"
              className={activeTab === tab.label ? "active" : ""}
              onClick={() => setActiveTab(tab.label)}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </section>

      <section className="staff-tab-panel">
        {activeTab === "Overview" && (
          <div className="premium-panel staff-overview-panel">
            <div>
              <p className="dashboard-eyebrow">Employment Record</p>
              <h3>Employment Overview</h3>
            </div>

            <div className="staff-overview-grid">
              <Row label="Position" value={staff.position || "—"} />
              <Row label="Department" value={staff.department || "—"} />
              <Row label="Hire Date" value={formatDate(staff.hire_date)} />
              <Row label="Employment Status" value={staff.employment_status || "—"} />
              <Row label="Supervisor" value={staff.supervisor_name || "—"} />
              <Row label="Notes" value={staff.notes || "—"} />
            </div>
          </div>
        )}

        {activeTab === "Credentials" && (
          <StaffCertificationsTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Training" && (
          <StaffTrainingTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Continuing Education" && (
          <StaffContinuingEducationTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Compliance" && (
          <StaffComplianceTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Schedule" && (
          <StaffScheduleTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Documents" && (
          <StaffDocumentsTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Performance" && (
          <StaffPerformanceTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Notes" && (
          <StaffNotesTab staff={staff} staffId={staffId} />
        )}
      </section>
    </div>
  );
}

function InfoCard({ title, icon, items, accent = "blue" }) {
  return (
    <div className={`staff-info-card ${accent}`}>
      <div className="staff-info-card-head">
        <span>{icon}</span>
        <h3>{title}</h3>
      </div>

      {items.map(([label, value, itemIcon]) => (
        <div className="staff-info-row" key={label}>
          <span>
            {itemIcon}
            {label}
          </span>
          <strong>{value}</strong>
        </div>
      ))}
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

function getArray(result) {
  if (result.status !== "fulfilled") return [];
  return Array.isArray(result.value.data) ? result.value.data : [];
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S"
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function isExpired(value) {
  if (!value) return false;
  const today = new Date();
  const date = new Date(value);
  today.setHours(0, 0, 0, 0);
  return date < today;
}