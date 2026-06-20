import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  FileWarning,
  GraduationCap,
  Search,
  ShieldCheck,
  UserPlus,
  UserRound,
  UsersRound,
} from "lucide-react";

import api from "../services/api";

const statusTabs = [
  { id: "", label: "All Staff", icon: UsersRound, tone: "blue" },
  { id: "ACTIVE", label: "Active", icon: CheckCircle2, tone: "green" },
  { id: "ON_LEAVE", label: "On Leave", icon: FileWarning, tone: "amber" },
  { id: "INACTIVE", label: "Inactive", icon: AlertTriangle, tone: "slate" },
  { id: "TERMINATED", label: "Terminated", icon: AlertTriangle, tone: "red" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      setLoading(true);
      const res = await api.get("/staff");
      setStaff(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        member.full_name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.phone?.toLowerCase().includes(query) ||
        member.employee_number?.toLowerCase().includes(query) ||
        member.position?.toLowerCase().includes(query) ||
        member.department?.toLowerCase().includes(query);

      const matchesStatus = status
        ? member.employment_status === status
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [staff, search, status]);

  const metrics = useMemo(() => {
    const active = staff.filter((s) => s.employment_status === "ACTIVE" || s.is_active).length;
    const inactive = staff.filter((s) => s.employment_status === "INACTIVE" || !s.is_active).length;
    const onLeave = staff.filter((s) => s.employment_status === "ON_LEAVE").length;
    const expiring = staff.filter((s) => isExpiringSoon(s.cpr_expiry_date) || isExpiringSoon(s.first_aid_expiry_date) || isExpiringSoon(s.fingerprint_expiry_date)).length;

    return { active, inactive, onLeave, expiring };
  }, [staff]);

  return (
    <div className="staff-directory-page">
      <section className="staff-directory-hero">
        <div>
          <p className="dashboard-eyebrow">Workforce Management</p>
          <h1>Staff Directory</h1>
          <p>
            Manage staff profiles, credentials, training records, continuing
            education, schedules, personnel documents, and compliance readiness.
          </p>
        </div>

        <button className="staff-primary-action" type="button">
          <UserPlus size={18} />
          Add Staff
        </button>
      </section>

      <section className="staff-directory-metrics">
        <SummaryCard
          title="Total Staff"
          value={staff.length}
          helper="All personnel records"
          icon={<UsersRound />}
          tone="blue"
        />

        <SummaryCard
          title="Active Staff"
          value={metrics.active}
          helper="Currently employed"
          icon={<ShieldCheck />}
          tone="green"
        />

        <SummaryCard
          title="On Leave"
          value={metrics.onLeave}
          helper="Temporary leave"
          icon={<BriefcaseBusiness />}
          tone="amber"
        />

        <SummaryCard
          title="Expiring Soon"
          value={metrics.expiring}
          helper="CPR, First Aid, fingerprint"
          icon={<AlertTriangle />}
          tone={metrics.expiring ? "red" : "purple"}
        />
      </section>

      <section className="staff-status-tabs">
        {statusTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.label}
              type="button"
              className={`staff-status-tab ${tab.tone} ${
                status === tab.id ? "active" : ""
              }`}
              onClick={() => setStatus(tab.id)}
            >
              <span>
                <Icon size={22} />
              </span>
              <strong>{tab.label}</strong>
              <small>{getStatusCount(staff, tab.id)}</small>
            </button>
          );
        })}
      </section>

      <section className="staff-directory-toolbar">
        <div className="staff-directory-search">
          <Search size={18} />
          <input
            placeholder="Search staff by name, email, phone, employee number, position, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Employment Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="TERMINATED">Terminated</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>
      </section>

      <section className="staff-directory-card">
        <div className="staff-table-header">
          <div>
            <p className="dashboard-eyebrow">Personnel Records</p>
            <h3>Staff Directory</h3>
            <span>{filteredStaff.length} staff record(s)</span>
          </div>
        </div>

        {loading ? (
          <div className="table-empty">Loading staff...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="table-empty">No staff found.</div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table staff-premium-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Hire Date</th>
                  <th>Credentials</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="staff-member-cell">
                        <div className="staff-mini-avatar">
                          {getInitials(member.full_name)}
                        </div>
                        <div>
                          <strong>{member.full_name}</strong>
                          <p>{member.email || member.employee_number || member.id}</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>{member.position || "—"}</strong>
                      <p className="staff-muted">{member.employee_number || "—"}</p>
                    </td>

                    <td>{member.department || "—"}</td>
                    <td>{formatDate(member.hire_date)}</td>

                    <td>
                      <div className="staff-credential-stack">
                        <ExpiryBadge label="CPR" date={member.cpr_expiry_date} />
                        <ExpiryBadge label="First Aid" date={member.first_aid_expiry_date} />
                        <ExpiryBadge label="Fingerprint" date={member.fingerprint_expiry_date} />
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${member.employment_status?.toLowerCase()}`}
                      >
                        {member.employment_status || "UNKNOWN"}
                      </span>
                    </td>

                    <td>
                      <Link className="staff-view-btn" to={`/staff/${member.id}`}>
                        <Eye size={16} />
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ title, value, helper, icon, tone }) {
  return (
    <div className={`staff-metric-card ${tone}`}>
      <div className="staff-metric-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value ?? 0}</h2>
        <span>{helper}</span>
      </div>
    </div>
  );
}

function ExpiryBadge({ label, date }) {
  if (!date) {
    return <span className="staff-expiry-pill missing">{label}: Missing</span>;
  }

  const today = new Date();
  const expiry = new Date(date);
  const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return <span className="staff-expiry-pill expired">{label}: Expired</span>;
  }

  if (days <= 30) {
    return <span className="staff-expiry-pill soon">{label}: Due Soon</span>;
  }

  return <span className="staff-expiry-pill valid">{label}: Valid</span>;
}

function getStatusCount(staff, status) {
  if (!status) return staff.length;
  return staff.filter((s) => s.employment_status === status).length;
}

function isExpiringSoon(date) {
  if (!date) return true;

  const today = new Date();
  const expiry = new Date(date);
  const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  return days <= 30;
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