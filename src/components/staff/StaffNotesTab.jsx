import { useEffect, useState } from "react";
import { MessageSquareText, Plus, RefreshCw, X } from "lucide-react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  note_date: today(),
  note_type: "SUPERVISOR_NOTE",
  title: "",
  note: "",
  visibility: "INTERNAL",
};

export default function StaffNotesTab({ staff = {}, staffId }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [staffId]);

  async function loadNotes() {
    if (!staffId) return;

    try {
      setLoading(true);
      const res = await api.get(`/staff-notes?staff_id=${staffId}`);
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

  async function saveNote() {
    if (!staffId) return alert("Staff ID is missing.");
    if (!form.title || !form.note) return alert("Title and note are required.");

    try {
      setSaving(true);

      await api.post("/staff-notes", {
        staff_id: staffId,
        ...form,
        form_data: form,
      });

      setForm(initialForm);
      setShowForm(false);
      await loadNotes();
      alert("Staff note saved.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-workspace">
      <div className="assessment-hero staff-cert-hero">
        <div>
          <p className="dashboard-eyebrow">Staff Notes</p>
          <h2>Notes</h2>
          <p>Track supervisor notes, HR notes, coaching notes, incident follow-up, and recognition.</p>
        </div>

        <div className="medication-action-row">
          <button className="secondary-btn" type="button" onClick={loadNotes}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="primary-btn" type="button" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Note
          </button>
        </div>
      </div>

      <section className="assessment-history-panel">
        <h3>Notes Timeline</h3>

        {loading ? (
          <div className="table-empty">Loading notes...</div>
        ) : items.length === 0 ? (
          <div className="empty-state"><MessageSquareText size={34} /><p>No staff notes found.</p></div>
        ) : (
          <div className="task-card-list">
            {items.map((item) => (
              <div key={item.id} className="task-card">
                <div className="task-card-icon">
                  <MessageSquareText size={22} />
                </div>
                <div className="task-card-main">
                  <div className="task-card-head">
                    <div>
                      <h3>{item.title || "Staff Note"}</h3>
                      <p>{item.note || item.description || "—"}</p>
                    </div>
                    <span className="status-badge active">{formatType(item.note_type || "NOTE")}</span>
                  </div>

                  <div className="task-meta-row">
                    <span>Date: {formatDate(item.note_date || item.created_at)}</span>
                    <span>Visibility: {item.visibility || "INTERNAL"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-backdrop nested-modal">
          <div className="premium-modal assessment-modal">
            <div className="modal-header">
              <div>
                <p className="dashboard-eyebrow">Staff Note</p>
                <h2>Add Note</h2>
              </div>
              <button className="icon-close" type="button" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              <section className="assessment-section">
                <h3>Note Information</h3>
                <div className="assessment-grid">
                  <Input label="Date" type="date" value={form.note_date} onChange={(v) => update("note_date", v)} />
                  <Select label="Note Type" value={form.note_type} onChange={(v) => update("note_type", v)} options={["SUPERVISOR_NOTE", "HR_NOTE", "COACHING", "INCIDENT_FOLLOW_UP", "RECOGNITION"]} />
                  <Input label="Title" value={form.title} onChange={(v) => update("title", v)} />
                  <Select label="Visibility" value={form.visibility} onChange={(v) => update("visibility", v)} options={["INTERNAL", "HR_ONLY", "SUPERVISOR_ONLY"]} />
                  <TextArea label="Note" value={form.note} onChange={(v) => update("note", v)} />
                </div>
              </section>

              <div className="assessment-actions">
                <button className="primary-btn" type="button" disabled={saving} onClick={saveNote}>
                  {saving ? "Saving..." : "Save Note"}
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
  return <div className="assessment-field"><label>{label}</label><input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>;
}

function Select({ label, value, onChange, options }) {
  return <div className="assessment-field"><label>{label}</label><select value={value || ""} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{formatType(o)}</option>)}</select></div>;
}

function TextArea({ label, value, onChange }) {
  return <div className="assessment-field full"><label>{label}</label><textarea value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>;
}

function formatType(value) {
  return `${value || ""}`.replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}