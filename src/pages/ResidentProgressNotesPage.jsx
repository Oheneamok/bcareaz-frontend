import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Save,
  RefreshCw,
  UserCheck,
  CalendarDays,
  ClipboardCheck,
  UsersRound,
  CheckCircle2,
  XCircle,
  Search,
  PenLine,
  Clock,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  resident_id: "",
  note_date: today(),
  shift: "MORNING",
  mood: "",
  behavior: "",
  activities: "",
  medication_compliance: "",
  incidents: "",
  interventions: "",
  resident_response: "",
  progress_toward_goals: "",
  staff_role: "",
  status: "SIGNED",
  form_data: {
    prompts_needed_medications: "",
    medication_knowledge: [],
    followed_house_rules: "",
    hi_si_status: "",
    adls: [],
    independent_living_skills: [],
    meals: [],
    substance_abuse: "",
    other_incident: "",
    cravings: "",
    aa_na: "",
    groups_attended: "",
    sleeping_pattern: "",
    outings: "",
    comments: "",
  },
};

const MED_KNOWLEDGE = ["Names", "Frequency", "Dosages", "Purposes", "Side Effects", "None"];
const ADLS = ["Bed Made", "Hygiene", "Personal Area Clean", "Dressed Appropriately", "Showered"];
const ILS = ["Cooking", "House Cleaning", "Shopping", "Laundry", "Set Up Appointments"];

export default function ResidentProgressNotesPage() {
  const [residents, setResidents] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [notes, setNotes] = useState([]);
  const [groupCopies, setGroupCopies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  async function loadResidents() {
    try {
      const res = await api.get("/residents");
      const list = Array.isArray(res.data) ? res.data : res.data?.items || res.data?.data || [];
      setResidents(list);
    } catch (err) {
      console.error(err);
      setResidents([]);
    }
  }

  async function loadResidentData(residentId = selectedResidentId) {
    if (!residentId) return;

    try {
      const [notesRes, groupRes] = await Promise.all([
        api.get(`/facility-compliance/progress-notes?resident_id=${residentId}`),
        api.get(`/facility-compliance/group-notes?resident_id=${residentId}`),
      ]);

      setNotes(notesRes.data || []);
      setGroupCopies(groupRes.data || []);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Could not load resident progress notes.");
    }
  }

  useEffect(() => {
    loadResidents();
  }, []);

  useEffect(() => {
    if (selectedResidentId) {
      setForm((prev) => ({ ...prev, resident_id: selectedResidentId }));
      loadResidentData(selectedResidentId);
    }
  }, [selectedResidentId]);

  const selectedResident = useMemo(() => {
    return residents.find((r) => String(r.id) === String(selectedResidentId));
  }, [residents, selectedResidentId]);

  function residentName(resident) {
    if (!resident) return "Resident";
    return `${resident.first_name || ""} ${resident.last_name || ""}`.trim();
  }

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateFormData(name, value) {
    setForm((prev) => ({
      ...prev,
      form_data: {
        ...(prev.form_data || {}),
        [name]: value,
      },
    }));
  }

  function toggleArray(name, value) {
    setForm((prev) => {
      const current = prev.form_data?.[name] || [];
      const next = current.includes(value)
        ? current.filter((x) => x !== value)
        : [...current, value];

      return {
        ...prev,
        form_data: {
          ...(prev.form_data || {}),
          [name]: next,
        },
      };
    });
  }

  async function submitProgressNote(e) {
    e.preventDefault();

    if (!form.resident_id) {
      setMessage("Please select a resident first.");
      return;
    }

    const payload = {
      ...form,
      medication_compliance: form.form_data?.prompts_needed_medications || "",
      activities: [
        ...(form.form_data?.adls || []),
        ...(form.form_data?.independent_living_skills || []),
      ].join(", "),
      incidents:
        form.form_data?.other_incident === "YES" || form.form_data?.substance_abuse === "YES"
          ? "Incident noted"
          : "None",
      resident_response: form.form_data?.comments || form.resident_response,
    };

    try {
      await api.post("/facility-compliance/progress-notes", payload);
      setMessage("Resident progress note saved and signed.");
      setForm({
        ...emptyForm,
        resident_id: selectedResidentId,
        note_date: today(),
      });
      loadResidentData();
    } catch (err) {
      console.error(err);
      setMessage("Could not save resident progress note.");
    }
  }

  function ChoicePill({ active, children, onClick }) {
    return (
      <button
        type="button"
        className={`choice-pill ${active ? "active" : ""}`}
        onClick={onClick}
      >
        <CheckCircle2 size={16} />
        {children}
      </button>
    );
  }

  return (
    <div className="rp-page">
      <style>{`
        .rp-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .rp-hero {
          min-height: 360px;
          border-radius: 28px;
          padding: 42px;
          margin-bottom: 22px;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          background:
            linear-gradient(90deg, rgba(5,18,44,.98), rgba(5,150,105,.92), rgba(14,165,233,.25)),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
        }

        .rp-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 72% 45%, rgba(125,211,252,.22), transparent 34%);
        }

        .hero-content,
        .hero-metrics {
          position: relative;
          z-index: 2;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 14px;
          color: #a7f3d0;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .rp-hero h1 {
          margin: 0;
          font-size: clamp(44px, 5vw, 72px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .rp-hero p {
          max-width: 780px;
          margin: 20px 0 0;
          color: rgba(255,255,255,.9);
          font-size: 18px;
          line-height: 1.65;
          font-weight: 650;
        }

        .hero-metrics {
          width: 340px;
          display: grid;
          gap: 12px;
        }

        .metric-card {
          border-radius: 18px;
          padding: 18px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.25);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 42px rgba(0,0,0,.18);
        }

        .metric-card strong {
          display: block;
          font-size: 38px;
          line-height: 1;
          letter-spacing: -.05em;
        }

        .metric-card span {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: #d1fae5;
        }

        .message-bar {
          margin-bottom: 18px;
          padding: 15px 18px;
          border-radius: 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-weight: 900;
        }

        .resident-filter-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
          border-radius: 22px;
          padding: 18px;
          background: rgba(255,255,255,.94);
          border: 1px solid #dbeafe;
          box-shadow: 0 18px 44px rgba(15,23,42,.11);
        }

        .filter-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .filter-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #059669, #06b6d4);
        }

        .filter-title {
          margin: 0;
          color: #071735;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: -.03em;
        }

        .filter-subtitle {
          margin: 4px 0 0;
          color: #64748b;
          font-weight: 850;
          font-size: 13px;
        }

        .resident-select {
          min-width: 320px;
          min-height: 56px;
          border-radius: 16px;
          border: 1px solid #bfdbfe;
          background: white;
          padding: 0 16px;
          color: #071735;
          font-size: 15px;
          font-weight: 900;
          outline: none;
        }

        .rp-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(390px, .88fr);
          gap: 24px;
          align-items: start;
        }

        .premium-card {
          border-radius: 24px;
          padding: 30px;
          background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,251,255,.96));
          border: 1px solid rgba(219,234,254,.95);
          box-shadow: 0 24px 64px rgba(15,23,42,.13);
          position: relative;
          overflow: hidden;
        }

        .premium-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #059669, #06b6d4, #2563eb);
        }

        .card-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 26px;
        }

        .card-header p {
          margin: 0 0 9px;
          color: #059669;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .11em;
        }

        .card-header h2 {
          margin: 0;
          font-size: 34px;
          line-height: 1;
          color: #071735;
          letter-spacing: -.06em;
        }

        .form-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .form-field {
          display: grid;
          gap: 8px;
        }

        .form-field.full {
          grid-column: span 2;
        }

        .form-field label,
        .section-label {
          color: #385071;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          min-height: 58px;
          border: 1px solid #cfe0f7;
          border-radius: 15px;
          padding: 0 16px;
          background: white;
          color: #071735;
          font-size: 15px;
          font-weight: 800;
          outline: none;
          box-shadow: 0 8px 20px rgba(15,23,42,.04);
        }

        .form-field textarea {
          min-height: 120px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.55;
        }

        .choice-section {
          grid-column: span 2;
          padding: 18px;
          border-radius: 20px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .choice-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .choice-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .choice-pill {
          min-height: 48px;
          border-radius: 14px;
          border: 1px solid #dbeafe;
          background: white;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .choice-pill svg {
          color: transparent;
        }

        .choice-pill.active {
          color: #047857;
          border-color: #10b981;
          background: #ecfdf5;
        }

        .choice-pill.active svg {
          color: #10b981;
        }

        .button-row {
          grid-column: span 2;
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .primary-btn,
        .secondary-btn {
          min-height: 62px;
          border-radius: 16px;
          padding: 0 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
        }

        .primary-btn {
          border: 0;
          color: white;
          background: linear-gradient(135deg, #059669, #0f766e);
          box-shadow: 0 16px 32px rgba(15,118,110,.22);
        }

        .secondary-btn {
          color: #071735;
          background: white;
          border: 1px solid #cfe0f7;
        }

        .right-stack,
        .record-list {
          display: grid;
          gap: 18px;
        }

        .record-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #059669;
          border-radius: 16px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .record-card.group {
          border-left-color: #7c3aed;
        }

        .record-card strong {
          display: block;
          font-size: 17px;
          color: #071735;
        }

        .record-card p {
          margin: 8px 0 0;
          color: #64748b;
          font-weight: 750;
          line-height: 1.45;
        }

        .chip-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .chip {
          border-radius: 999px;
          padding: 7px 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .chip.green { background: #ecfdf5; color: #047857; }
        .chip.orange { background: #fffbeb; color: #b45309; }
        .chip.red { background: #fef2f2; color: #dc2626; }
        .chip.purple { background: #f3e8ff; color: #7c3aed; }

        .empty-state {
          min-height: 150px;
          border-radius: 16px;
          border: 1px dashed #93c5fd;
          display: grid;
          place-items: center;
          text-align: center;
          color: #49617f;
          background: linear-gradient(135deg, #ffffff, #eff6ff);
          font-weight: 900;
        }

        @media (max-width: 1180px) {
          .rp-grid { grid-template-columns: 1fr; }
          .rp-hero { flex-direction: column; align-items: flex-start; }
          .hero-metrics { width: 100%; }
          .resident-filter-card { flex-direction: column; align-items: stretch; }
          .resident-select { width: 100%; }
        }

        @media (max-width: 820px) {
          .rp-page { padding: 14px; }
          .form-grid,
          .choice-grid { grid-template-columns: 1fr; }
          .form-field.full,
          .button-row,
          .choice-section { grid-column: span 1; }
          .rp-hero { min-height: auto; padding: 28px; }
          .rp-hero h1 { font-size: 42px; }
        }
      `}</style>

      <section className="rp-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <FileText size={18} />
            ResidentCare Command Center
          </p>

          <h1>
            Progress
            <br />
            Notes
          </h1>

          <p>
            Create resident-specific shift progress notes, review signed note history,
            and view group note participation copied to the individual resident record.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{notes.length}</strong>
            <span>Progress Notes</span>
          </div>
          <div className="metric-card">
            <strong>{groupCopies.length}</strong>
            <span>Group Copies</span>
          </div>
          <div className="metric-card">
            <strong>{selectedResident ? "1" : "0"}</strong>
            <span>Resident Selected</span>
          </div>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <div className="resident-filter-card">
        <div className="filter-left">
          <div className="filter-icon">
            <Search size={24} />
          </div>
          <div>
            <p className="filter-title">
              {selectedResident ? residentName(selectedResident) : "Select Resident"}
            </p>
            <p className="filter-subtitle">
              Progress notes are written and reviewed for one resident at a time.
            </p>
          </div>
        </div>

        <select
          className="resident-select"
          value={selectedResidentId}
          onChange={(e) => setSelectedResidentId(e.target.value)}
        >
          <option value="">Select Resident</option>
          {residents.map((resident) => (
            <option key={resident.id} value={resident.id}>
              {residentName(resident)}
            </option>
          ))}
        </select>
      </div>

      <section className="rp-grid">
        <form className="premium-card" onSubmit={submitProgressNote}>
          <div className="card-header">
            <div>
              <p>New Shift Note</p>
              <h2>Resident Progress Note</h2>
            </div>
            <PenLine size={32} color="#059669" />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Note Date</label>
              <input type="date" name="note_date" value={form.note_date} onChange={updateField} />
            </div>

            <div className="form-field">
              <label>Shift</label>
              <select name="shift" value={form.shift} onChange={updateField}>
                <option value="MORNING">Morning Shift</option>
                <option value="EVENING">Evening Shift</option>
              </select>
            </div>

            <div className="form-field">
              <label>Medication Prompts Needed</label>
              <select
                value={form.form_data.prompts_needed_medications || ""}
                onChange={(e) => updateFormData("prompts_needed_medications", e.target.value)}
              >
                <option value="">Select</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="MORE_THAN_3">More than 3</option>
                <option value="NA">N/A</option>
                <option value="REFUSED">Refused</option>
              </select>
            </div>

            <div className="form-field">
              <label>HI / SI Status</label>
              <select
                value={form.form_data.hi_si_status || ""}
                onChange={(e) => updateFormData("hi_si_status", e.target.value)}
              >
                <option value="">Select</option>
                <option value="DENIES">Denies</option>
                <option value="HI">HI</option>
                <option value="SI">SI</option>
              </select>
            </div>

            <div className="choice-section">
              <div className="choice-section-header">
                <span className="section-label">Medication Knowledge</span>
              </div>
              <div className="choice-grid">
                {MED_KNOWLEDGE.map((item) => (
                  <ChoicePill
                    key={item}
                    active={form.form_data.medication_knowledge?.includes(item)}
                    onClick={() => toggleArray("medication_knowledge", item)}
                  >
                    {item}
                  </ChoicePill>
                ))}
              </div>
            </div>

            <div className="choice-section">
              <div className="choice-section-header">
                <span className="section-label">ADLs</span>
              </div>
              <div className="choice-grid">
                {ADLS.map((item) => (
                  <ChoicePill
                    key={item}
                    active={form.form_data.adls?.includes(item)}
                    onClick={() => toggleArray("adls", item)}
                  >
                    {item}
                  </ChoicePill>
                ))}
              </div>
            </div>

            <div className="choice-section">
              <div className="choice-section-header">
                <span className="section-label">Independent Living Skills</span>
              </div>
              <div className="choice-grid">
                {ILS.map((item) => (
                  <ChoicePill
                    key={item}
                    active={form.form_data.independent_living_skills?.includes(item)}
                    onClick={() => toggleArray("independent_living_skills", item)}
                  >
                    {item}
                  </ChoicePill>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Followed House Rules</label>
              <select
                value={form.form_data.followed_house_rules || ""}
                onChange={(e) => updateFormData("followed_house_rules", e.target.value)}
              >
                <option value="">Select</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
            </div>

            <div className="form-field">
              <label>Group Attended</label>
              <select
                value={form.form_data.groups_attended || ""}
                onChange={(e) => updateFormData("groups_attended", e.target.value)}
              >
                <option value="">Select</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
            </div>

            <div className="form-field">
              <label>Substance Abuse</label>
              <select
                value={form.form_data.substance_abuse || ""}
                onChange={(e) => updateFormData("substance_abuse", e.target.value)}
              >
                <option value="">Select</option>
                <option value="NO">No</option>
                <option value="YES">Yes</option>
              </select>
            </div>

            <div className="form-field">
              <label>Other Incident</label>
              <select
                value={form.form_data.other_incident || ""}
                onChange={(e) => updateFormData("other_incident", e.target.value)}
              >
                <option value="">Select</option>
                <option value="NO">No</option>
                <option value="YES">Yes</option>
              </select>
            </div>

            <div className="form-field full">
              <label>Outings</label>
              <textarea
                value={form.form_data.outings || ""}
                onChange={(e) => updateFormData("outings", e.target.value)}
              />
            </div>

            <div className="form-field full">
              <label>Comments</label>
              <textarea
                value={form.form_data.comments || ""}
                onChange={(e) => updateFormData("comments", e.target.value)}
              />
            </div>

            <div className="form-field full">
              <label>Progress Toward Goals</label>
              <textarea
                name="progress_toward_goals"
                value={form.progress_toward_goals}
                onChange={updateField}
              />
            </div>

            <div className="button-row">
              <button className="primary-btn" type="submit">
                <Save size={20} />
                Save & Sign Progress Note
              </button>

              <button className="secondary-btn" type="button" onClick={() => loadResidentData()}>
                <RefreshCw size={20} />
                Refresh
              </button>
            </div>
          </div>
        </form>

        <div className="right-stack">
          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>History</p>
                <h2>Progress Note History</h2>
              </div>
              <ClipboardCheck size={32} color="#059669" />
            </div>

            <div className="record-list">
              {!selectedResidentId && (
                <div className="empty-state">Select a resident to view history.</div>
              )}

              {selectedResidentId && notes.length === 0 && (
                <div className="empty-state">No progress notes found.</div>
              )}

              {notes.map((note) => (
                <div className="record-card" key={note.id}>
                  <strong>
                    {note.shift || "Shift"} Progress Note
                  </strong>
                  <p>
                    {note.note_date || "No date"} · {note.staff_name || "Staff"}
                  </p>

                  <div className="chip-row">
                    <span className="chip green">
                      <CheckCircle2 size={12} />
                      {note.is_signed ? "Signed" : "Unsigned"}
                    </span>
                    <span className="chip">
                      <CalendarDays size={12} />
                      {note.status || "Recorded"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Group Note Copy</p>
                <h2>Individual Participation</h2>
              </div>
              <UsersRound size={32} color="#7c3aed" />
            </div>

            <div className="record-list">
              {!selectedResidentId && (
                <div className="empty-state">Select a resident to view group note copies.</div>
              )}

              {selectedResidentId && groupCopies.length === 0 && (
                <div className="empty-state">No group participation copies found.</div>
              )}

              {groupCopies.map((note) => (
                <div className="record-card group" key={note.id}>
                  <strong>{note.topic || note.title || "Group Session"}</strong>
                  <p>
                    {note.note_date || "No date"} · {note.session_type || note.shift || "Session"}
                  </p>

                  <div className="chip-row">
                    <span className="chip purple">Group Copy</span>
                    <span className="chip">
                      <Clock size={12} />
                      {note.status || "Recorded"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
