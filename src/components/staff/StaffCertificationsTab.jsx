import { useEffect, useState } from "react";
import { Award, Plus, RefreshCw, X } from "lucide-react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const certificationTypes = [
  "CPR",
  "FIRST_AID",
  "FINGERPRINT_CLEARANCE",
  "TB_TEST",
  "BHT_CERTIFICATION",
  "BHP_LICENSE",
  "RN_LICENSE",
  "LPN_LICENSE",
  "CAREGIVER_CERTIFICATE",
  "FOOD_HANDLER",
  "DRIVER_LICENSE",
  "OTHER",
];

const initialForm = {
  certification_type: "CPR",
  certification_name: "",
  issue_date: today(),
  expiration_date: "",
  issuing_authority: "",
  certificate_number: "",
  status: "ACTIVE",
  notes: "",
};

export default function StaffCertificationsTab({ staff = {}, staffId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadItems();
  }, [staffId]);

  async function loadItems() {
    if (!staffId) return;

    try {
      setLoading(true);
      const res = await api.get(`/staff-compliance/certifications?staff_id=${staffId}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveCertification() {
    if (!staffId) return alert("Staff ID is missing.");

    if (!form.certification_name) {
      alert("Certification name is required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/staff-compliance/certifications", {
        staff_id: staffId,
        certification_type: form.certification_type,
        certification_name: form.certification_name,
        issue_date: form.issue_date || null,
        expiration_date: form.expiration_date || null,
        issuing_authority: form.issuing_authority,
        certificate_number: form.certificate_number,
        status: form.status,
        notes: form.notes,
        metadata_json: form,
      });

      setForm(initialForm);
      setShowForm(false);
      await loadItems();
      alert("Certification saved.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save certification.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-workspace staff-certifications-tab">
      <div className="assessment-hero staff-cert-hero">
        <div>
          <p className="dashboard-eyebrow">Personnel Record</p>
          <h2>Certifications & Licenses</h2>
          <p>
            Track CPR, First Aid, fingerprint clearance, TB, professional licenses,
            and other staff credentials.
          </p>
        </div>

        <div className="medication-action-row">
          <button type="button" className="secondary-btn" onClick={loadItems}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button type="button" className="primary-btn" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Add Certification
          </button>
        </div>
      </div>

      <section className="assessment-history-panel">
        <h3>Certification Records</h3>

        {loading ? (
          <div className="table-empty">Loading certifications...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <Award size={34} />
            <p>No certifications found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Certification</th>
                  <th>Type</th>
                  <th>Number</th>
                  <th>Issued</th>
                  <th>Expires</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.certification_name || "—"}</td>
                    <td>{formatType(item.certification_type)}</td>
                    <td>{item.certificate_number || "—"}</td>
                    <td>{formatDate(item.issue_date)}</td>
                    <td>{formatDate(item.expiration_date)}</td>
                    <td>
                      <span className={`status-badge ${getRecordStatus(item).toLowerCase()}`}>
                        {getRecordStatus(item)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-backdrop nested-modal">
          <div className="premium-modal assessment-modal">
            <div className="modal-header">
              <div>
                <p className="dashboard-eyebrow">Certification</p>
                <h2>Add Staff Certification</h2>
              </div>

              <button className="icon-close" type="button" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              <section className="assessment-section">
                <h3>Certification Information</h3>

                <div className="assessment-grid">
                  <Select
                    label="Certification Type"
                    value={form.certification_type}
                    onChange={(v) => update("certification_type", v)}
                    options={certificationTypes}
                  />
                  <Input label="Certification Name" value={form.certification_name} onChange={(v) => update("certification_name", v)} />
                  <Input label="Certificate Number" value={form.certificate_number} onChange={(v) => update("certificate_number", v)} />
                  <Input label="Issuing Authority" value={form.issuing_authority} onChange={(v) => update("issuing_authority", v)} />
                  <Input label="Issue Date" type="date" value={form.issue_date} onChange={(v) => update("issue_date", v)} />
                  <Input label="Expiration Date" type="date" value={form.expiration_date} onChange={(v) => update("expiration_date", v)} />
                  <Select label="Status" value={form.status} onChange={(v) => update("status", v)} options={["ACTIVE", "EXPIRED", "PENDING", "MISSING"]} />
                  <TextArea label="Notes" value={form.notes} onChange={(v) => update("notes", v)} />
                </div>
              </section>

              <div className="assessment-actions">
                <button type="button" className="primary-btn" disabled={saving} onClick={saveCertification}>
                  {saving ? "Saving..." : "Save Certification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="assessment-field">
      <label>{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="assessment-field">
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatType(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="assessment-field full">
      <label>{label}</label>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function getRecordStatus(item) {
  if (isExpired(item.expiration_date)) return "EXPIRED";
  if (isExpiringSoon(item.expiration_date)) return "EXPIRING_SOON";
  return item.status || "ACTIVE";
}

function isExpired(value) {
  if (!value) return false;
  const today = new Date();
  const date = new Date(value);
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function isExpiringSoon(value) {
  if (!value || isExpired(value)) return false;
  const today = new Date();
  const date = new Date(value);
  const in60 = new Date();
  in60.setDate(today.getDate() + 60);
  return date <= in60;
}

function formatType(value) {
  return `${value || ""}`.replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}