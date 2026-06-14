import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  UserPlus,
  Eye,
  UserRound,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import api from "../services/api";

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
      setStaff(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const query = search.toLowerCase();

      const matchesSearch =
        member.full_name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.phone?.toLowerCase().includes(query) ||
        member.employee_number?.toLowerCase().includes(query);

      const matchesStatus = status
        ? member.employment_status === status
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [staff, search, status]);

  return (
    <div className="staff-page">
      <section className="resident-hero">
        <div>
          <p className="dashboard-eyebrow">Workforce Management</p>
          <h1>Staff</h1>
          <p>
            Manage staff profiles, training, credentials, continuing education,
            and compliance requirements.
          </p>
        </div>

        <button className="primary-action">
          <UserPlus size={18} />
          Add Staff
        </button>
      </section>

      <section className="resident-summary-grid">
        <SummaryCard
          title="Total Staff"
          value={staff.length}
          icon={<UserRound />}
        />

        <SummaryCard
          title="Active Staff"
          value={staff.filter((s) => s.is_active).length}
          icon={<ShieldCheck />}
        />

        <SummaryCard
          title="Inactive Staff"
          value={staff.filter((s) => !s.is_active).length}
          icon={<AlertTriangle />}
        />
      </section>

      <section className="resident-toolbar">
        <div className="resident-search">
          <Search size={18} />
          <input
            placeholder="Search by name, email, phone, or employee number..."
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

      <section className="premium-table-card">
        <div className="table-header">
          <div>
            <h3>Staff Directory</h3>
            <p>{filteredStaff.length} staff record(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="table-empty">Loading staff...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="table-empty">No staff found.</div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Hire Date</th>
                  <th>CPR Expiry</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="resident-cell">
                        <div className="resident-avatar">
                          {getInitials(member.full_name)}
                        </div>
                        <div>
                          <strong>{member.full_name}</strong>
                          <p>{member.email || member.employee_number || member.id}</p>
                        </div>
                      </div>
                    </td>

                    <td>{member.position || "—"}</td>
                    <td>{member.department || "—"}</td>
                    <td>{formatDate(member.hire_date)}</td>
                    <td>
                      <ExpiryBadge date={member.cpr_expiry_date} />
                    </td>

                    <td>
                      <span
                        className={`status-badge ${member.employment_status?.toLowerCase()}`}
                      >
                        {member.employment_status || "UNKNOWN"}
                      </span>
                    </td>

                    <td>
                      <Link className="table-action" to={`/staff/${member.id}`}>
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

function ExpiryBadge({ date }) {
  if (!date) return <span className="status-badge pending">Missing</span>;

  const today = new Date();
  const expiry = new Date(date);
  const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return <span className="status-badge discharged">Expired</span>;
  }

  if (days <= 30) {
    return <span className="status-badge pending">Due Soon</span>;
  }

  return <span className="status-badge active">Valid</span>;
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