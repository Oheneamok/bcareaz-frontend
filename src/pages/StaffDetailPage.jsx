import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  ShieldCheck,
  GraduationCap,
  ClipboardCheck,
  CalendarDays,
} from "lucide-react";

import api from "../services/api";

const tabs = [
  "Overview",
  "Training",
  "Continuing Education",
  "Compliance",
];

export default function StaffDetailPage() {
  const { staffId } = useParams();

  const [staff, setStaff] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [ce, setCe] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, [staffId]);

  async function loadStaff() {
    try {
      setLoading(true);

      const [staffRes, assignmentsRes, ceRes] = await Promise.all([
        api.get(`/staff/${staffId}`),
        api.get(`/staff-compliance/training-assignments?staff_id=${staffId}`),
        api.get(`/staff-compliance/continuing-education?staff_id=${staffId}`),
      ]);

      setStaff(staffRes.data);
      setAssignments(assignmentsRes.data || []);
      setCe(ceRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="page">Loading staff profile...</div>;
  if (!staff) return <div className="page">Staff not found.</div>;

  return (
    <div className="resident-detail-page">
      <Link to="/staff" className="back-link">
        <ArrowLeft size={17} />
        Back to Staff
      </Link>

      <section className="resident-profile-hero">
        <div className="resident-profile-left">
          <div className="resident-profile-avatar">
            {getInitials(staff.full_name)}
          </div>

          <div>
            <p className="dashboard-eyebrow">Staff Profile</p>
            <h1>{staff.full_name}</h1>
            <p>{staff.position || "Staff Member"}</p>

            <div className="profile-badges">
              <span className={`status-badge ${staff.employment_status?.toLowerCase()}`}>
                {staff.employment_status || "UNKNOWN"}
              </span>
              <span className="soft-badge">{staff.department || "Department N/A"}</span>
              <span className="soft-badge">Hire: {formatDate(staff.hire_date)}</span>
            </div>
          </div>
        </div>

        <div className="resident-profile-actions">
          <button>Edit Profile</button>
          <button className="dark">Assign Training</button>
        </div>
      </section>

      <section className="resident-chart-grid">
        <InfoCard
          title="Contact"
          icon={<UserRound />}
          items={[
            ["Email", staff.email || "—"],
            ["Phone", staff.phone || "—"],
            ["Employee #", staff.employee_number || "—"],
          ]}
        />

        <InfoCard
          title="Credential Dates"
          icon={<ShieldCheck />}
          items={[
            ["CPR Expiry", formatDate(staff.cpr_expiry_date)],
            ["First Aid Expiry", formatDate(staff.first_aid_expiry_date)],
            ["Fingerprint Expiry", formatDate(staff.fingerprint_expiry_date)],
          ]}
        />

        <InfoCard
          title="Compliance"
          icon={<ClipboardCheck />}
          items={[
            ["Training Assignments", assignments.length],
            ["Completed", assignments.filter((a) => a.status === "COMPLETED").length],
            ["Pending", assignments.filter((a) => a.status !== "COMPLETED").length],
          ]}
        />

        <InfoCard
          title="Continuing Education"
          icon={<GraduationCap />}
          items={[
            ["Records", ce.length],
            ["Hours", ce.reduce((sum, r) => sum + Number(r.hours_earned || 0), 0)],
            ["Cycle", "40 hrs / 2 yrs"],
          ]}
        />
      </section>

      <section className="resident-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </section>

      <section className="resident-tab-panel">
        {activeTab === "Overview" && (
          <div className="premium-panel">
            <h3>Employment Overview</h3>
            <Row label="Position" value={staff.position || "—"} />
            <Row label="Department" value={staff.department || "—"} />
            <Row label="Hire Date" value={formatDate(staff.hire_date)} />
            <Row label="Employment Status" value={staff.employment_status || "—"} />
            <Row label="Notes" value={staff.notes || "—"} />
          </div>
        )}

        {activeTab === "Training" && (
          <RecordsPanel
            title="Training Assignments"
            records={assignments}
            empty="No training assignments found."
            getTitle={(r) => r.training_name || r.training_catalog_id || "Training"}
            getMeta={(r) => `${r.status || "ASSIGNED"} · Due ${formatDate(r.due_date)}`}
          />
        )}

        {activeTab === "Continuing Education" && (
          <RecordsPanel
            title="Continuing Education"
            records={ce}
            empty="No continuing education records found."
            getTitle={(r) => r.course_name}
            getMeta={(r) => `${r.hours_earned} hrs · ${formatDate(r.completion_date)}`}
          />
        )}

        {activeTab === "Compliance" && (
          <div className="premium-panel">
            <h3>Compliance Snapshot</h3>
            <Row label="CPR" value={formatDate(staff.cpr_expiry_date)} />
            <Row label="First Aid" value={formatDate(staff.first_aid_expiry_date)} />
            <Row label="Fingerprint" value={formatDate(staff.fingerprint_expiry_date)} />
            <Row label="Background Check" value={formatDate(staff.background_check_date)} />
            <Row label="Driver License" value={formatDate(staff.driver_license_expiry_date)} />
            <Row label="Annual Evaluation" value={formatDate(staff.annual_evaluation_due_date)} />
          </div>
        )}
      </section>
    </div>
  );
}

function RecordsPanel({ title, records, empty, getTitle, getMeta }) {
  return (
    <div className="premium-panel">
      <h3>{title}</h3>

      {records.length === 0 ? (
        <p className="empty-text">{empty}</p>
      ) : (
        <div className="entity-list">
          {records.map((record) => (
            <div key={record.id} className="entity-row">
              <div>
                <strong>{getTitle(record)}</strong>
                <p>{getMeta(record)}</p>
              </div>

              <span>{record.status || record.category || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, icon, items }) {
  return (
    <div className="resident-info-card">
      <div className="info-card-title">
        <span>{icon}</span>
        <h3>{title}</h3>
      </div>

      {items.map(([label, value]) => (
        <Row key={label} label={label} value={value} />
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

function getInitials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "S";
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}
