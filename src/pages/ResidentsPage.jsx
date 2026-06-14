import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  UserPlus,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Users,
  X,
} from "lucide-react";

import api from "../services/api";

const emptyForm = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  email: "",
  admission_date: "",
  status: "ACTIVE",
  diagnosis: "",
  guardian_name: "",
  guardian_phone: "",
  guardian_relationship: "",
  address: "",
};

export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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

      await api.post("/residents", {
        ...form,
        date_of_birth: form.date_of_birth || null,
        admission_date: form.admission_date || null,
      });

      setForm(emptyForm);
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
          <p>
            Manage resident profiles, admissions, clinical records, documents,
            compliance, and care coordination.
          </p>
        </div>

        <button className="primary-action" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} />
          Add Resident
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
          value={residents.filter((r) => !r.is_active || r.status === "DISCHARGED").length}
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
                        <div className="resident-avatar">{getInitials(resident)}</div>
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
        <ResidentModal
          title="Add Resident"
          form={form}
          setForm={setForm}
          onClose={() => setShowAddModal(false)}
          onSubmit={createResident}
          saving={saving}
        />
      )}
    </div>
  );
}

function ResidentModal({ title, form, setForm, onClose, onSubmit, saving }) {
  return (
    <div className="modal-backdrop">
      <div className="premium-modal large">
        <div className="modal-header">
          <div>
            <p className="dashboard-eyebrow">Resident Intake</p>
            <h2>{title}</h2>
          </div>

          <button className="icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="modal-form-grid">
          <Input label="First Name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} required />
          <Input label="Last Name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} required />

          <Input label="DOB" type="date" value={form.date_of_birth} onChange={(v) => setForm({ ...form, date_of_birth: v })} />

          <Select
            label="Gender"
            value={form.gender}
            onChange={(v) => setForm({ ...form, gender: v })}
            options={["", "Male", "Female", "Other"]}
          />

          <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />

          <Input label="Admission Date" type="date" value={form.admission_date} onChange={(v) => setForm({ ...form, admission_date: v })} required />

          <Select
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            options={["ACTIVE", "PENDING", "INACTIVE", "DISCHARGED"]}
          />

          <Input label="Diagnosis" value={form.diagnosis} onChange={(v) => setForm({ ...form, diagnosis: v })} />
          <Input label="Guardian Name" value={form.guardian_name} onChange={(v) => setForm({ ...form, guardian_name: v })} />

          <Input label="Guardian Phone" value={form.guardian_phone} onChange={(v) => setForm({ ...form, guardian_phone: v })} />
          <Input label="Guardian Relationship" value={form.guardian_relationship} onChange={(v) => setForm({ ...form, guardian_relationship: v })} />

          <div className="modal-field full">
            <label>Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="modal-actions full">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Resident"}
            </button>
          </div>
        </form>
      </div>
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
        {options.map((option) => (
          <option key={option || "blank"} value={option}>
            {option || "Select"}
          </option>
        ))}
      </select>
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