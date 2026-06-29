import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Save,
  RefreshCw,
  UserRound,
  CalendarDays,
  Clock,
  CheckCircle2,
  FileText,
  ShieldCheck,
  PenLine,
} from "lucide-react";
import api from "../services/api";

const TOPICS = [
  "Domestic Violence",
  "Parenting",
  "Substance Abuse",
  "Codependency",
  "Anger Management",
  "AA/NA",
  "Living Skills",
  "Mental Health",
  "Cognitive Thinking",
];

const PARTICIPATION = [
  "Appropriate",
  "Provided feedback",
  "Intellectualizes",
  "Disruptive",
  "Interrupted others",
  "Blame others for actions",
  "Hostile",
  "Difficulty staying on topic",
  "Sarcastic",
  "Generalized",
  "Clowning/Joking",
  "Motivated",
  "Quiet",
  "Minimizes behavior",
  "Argumentative",
  "Defensive",
  "Rejects feedback",
  "Sociable",
];

const today = () => new Date().toISOString().slice(0, 10);

export default function GroupNotesPage() {
  const [residents, setResidents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    session_type: "GROUP_COUNSELING",
    duration: "1hr",
    start_time: "",
    end_time: "",
    session_period: "MORNING",
    resident_id: "",
    resident_name: "",
    date_of_birth: "",
    resident_gender: "",
    date_of_service: today(),
    topics_treated: [],
    session_note: "",
    participation_level: [],
    treatment_goals: "",
    interventions: "",
    bht_name: "",
    bhp_name: "",
    bht_signature: "",
    bhp_signature: "",
    bht_signature_date: today(),
    bhp_signature_date: today(),
    status: "DRAFT",
  });

  async function loadResidents() {
    try {
      const res = await api.get("/residents");
      setResidents(res.data || []);
    } catch (err) {
      console.error(err);
      setResidents([]);
    }
  }

  async function loadNotes() {
    try {
      const res = await api.get("/facility-compliance/group-notes");
      setNotes(res.data || []);
    } catch (err) {
      console.error(err);
      setNotes([]);
    }
  }

  useEffect(() => {
    loadResidents();
    loadNotes();
  }, []);

  const selectedResident = useMemo(() => {
    return residents.find((r) => String(r.id) === String(form.resident_id));
  }, [residents, form.resident_id]);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "resident_id") {
      const resident = residents.find((r) => String(r.id) === String(value));

      setForm((prev) => ({
        ...prev,
        resident_id: value,
        resident_name: resident?.full_name || resident?.name || "",
        date_of_birth: resident?.date_of_birth || resident?.dob || "",
        resident_gender: resident?.gender || "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function toggleTopic(topic) {
    setForm((prev) => ({
      ...prev,
      topics_treated: prev.topics_treated.includes(topic)
        ? prev.topics_treated.filter((item) => item !== topic)
        : [...prev.topics_treated, topic],
    }));
  }

  function toggleParticipation(item) {
    setForm((prev) => ({
      ...prev,
      participation_level: prev.participation_level.includes(item)
        ? prev.participation_level.filter((level) => level !== item)
        : [...prev.participation_level, item],
    }));
  }

  async function submitGroupNote(e) {
    e.preventDefault();

    try {
      await api.post("/facility-compliance/group-notes", form);

      setMessage("Group note saved successfully.");

      setForm((prev) => ({
        ...prev,
        session_note: "",
        treatment_goals: "",
        interventions: "",
        topics_treated: [],
        participation_level: [],
        status: "DRAFT",
      }));

      loadNotes();
    } catch (err) {
      console.error(err);
      setMessage("Could not save group note. Please check backend route.");
    }
  }

  return (
    <div className="group-note-page">
      <style>{`
        .group-note-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background: linear-gradient(135deg, #eaf4ff 0%, #f8fbff 52%, #dcecff 100%);
        }

        .group-note-hero {
          border-radius: 24px;
          padding: 34px;
          margin-bottom: 22px;
          color: white;
          background:
            linear-gradient(135deg, rgba(15,23,42,.97), rgba(30,64,175,.92), rgba(14,165,233,.72));
          box-shadow: 0 28px 70px rgba(15,23,42,.22);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 12px;
          color: #7dd3fc;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .group-note-hero h1 {
          margin: 0;
          font-size: clamp(42px, 5vw, 68px);
          line-height: .95;
          letter-spacing: -.06em;
          font-weight: 950;
        }

        .group-note-hero p {
          max-width: 820px;
          margin: 18px 0 0;
          color: rgba(255,255,255,.88);
          font-size: 18px;
          line-height: 1.65;
          font-weight: 650;
        }

        .hero-card {
          min-width: 230px;
          border-radius: 18px;
          padding: 24px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.24);
          backdrop-filter: blur(16px);
        }

        .hero-card strong {
          display: block;
          font-size: 44px;
          line-height: 1;
          letter-spacing: -.06em;
        }

        .hero-card span {
          display: block;
          margin-top: 8px;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: #bfdbfe;
        }

        .message-bar {
          margin-bottom: 18px;
          padding: 15px 18px;
          border-radius: 14px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-weight: 900;
        }

        .group-note-grid {
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 22px;
          align-items: start;
        }

        .premium-card {
          border-radius: 20px;
          padding: 28px;
          background: rgba(255,255,255,.96);
          border: 1px solid rgba(219,234,254,.95);
          box-shadow: 0 22px 58px rgba(15,23,42,.12);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 24px;
        }

        .card-header p {
          margin: 0 0 8px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .1em;
        }

        .card-header h2 {
          margin: 0;
          font-size: 32px;
          line-height: 1;
          color: #071735;
          letter-spacing: -.055em;
        }

        .card-header svg {
          color: #2563eb;
        }

        .form-grid {
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
          min-height: 56px;
          border: 2px solid #dbeafe;
          border-radius: 12px;
          padding: 0 16px;
          background: white;
          color: #071735;
          font-size: 15px;
          font-weight: 800;
          outline: none;
        }

        .form-field textarea {
          min-height: 135px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.5;
        }

        .choice-grid {
          grid-column: span 2;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .choice-pill {
          border: 2px solid #dbeafe;
          border-radius: 12px;
          min-height: 48px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          color: #334155;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
        }

        .choice-pill.active {
          border-color: #2563eb;
          color: #1d4ed8;
          background: #eff6ff;
        }

        .session-type-row {
          grid-column: span 2;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .session-card {
          border: 2px solid #dbeafe;
          border-radius: 14px;
          min-height: 68px;
          padding: 14px 16px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 950;
          color: #334155;
        }

        .session-card.active {
          border-color: #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .button-row {
          grid-column: span 2;
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .primary-btn,
        .secondary-btn {
          min-height: 60px;
          border-radius: 14px;
          padding: 0 24px;
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
          background: linear-gradient(135deg, #1d4ed8, #0f766e);
        }

        .secondary-btn {
          color: #071735;
          background: white;
          border: 2px solid #dbeafe;
        }

        .note-list {
          display: grid;
          gap: 14px;
        }

        .note-row {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 14px;
          padding: 17px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .note-row strong {
          display: block;
          font-size: 17px;
          color: #071735;
        }

        .note-row p {
          margin: 7px 0 0;
          color: #64748b;
          font-weight: 700;
          line-height: 1.45;
        }

        .note-meta {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .chip {
          border-radius: 999px;
          padding: 7px 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .empty-state {
          min-height: 180px;
          border-radius: 14px;
          border: 1px dashed #93c5fd;
          display: grid;
          place-items: center;
          text-align: center;
          color: #49617f;
          background: linear-gradient(135deg, #ffffff, #eff6ff);
          font-weight: 900;
        }

        @media (max-width: 1100px) {
          .group-note-grid {
            grid-template-columns: 1fr;
          }

          .group-note-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-card {
            width: 100%;
          }
        }

        @media (max-width: 760px) {
          .group-note-page {
            padding: 14px;
          }

          .form-grid,
          .choice-grid,
          .session-type-row {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .button-row,
          .choice-grid,
          .session-type-row {
            grid-column: span 1;
          }

          .group-note-hero {
            padding: 26px;
          }

          .group-note-hero h1 {
            font-size: 40px;
          }
        }
      `}</style>

      <section className="group-note-hero">
        <div>
          <p className="hero-kicker">
            <ClipboardList size={18} />
            BHT Group Notes
          </p>

          <h1>
            Group Notes
            <br />
            Documentation
          </h1>

          <p>
            Record group counseling, one-on-one counseling, topics treated,
            resident participation, treatment goals, interventions, and BHT/BHP
            signatures.
          </p>
        </div>

        <div className="hero-card">
          <strong>{notes.length}</strong>
          <span>Total Group Notes</span>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <section className="group-note-grid">
        <form className="premium-card" onSubmit={submitGroupNote}>
          <div className="card-header">
            <div>
              <p>New Documentation</p>
              <h2>BHT Group Note</h2>
            </div>
            <FileText size={32} />
          </div>

          <div className="form-grid">
            <div className="session-type-row">
              <button
                type="button"
                className={`session-card ${
                  form.session_type === "GROUP_COUNSELING" ? "active" : ""
                }`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    session_type: "GROUP_COUNSELING",
                  }))
                }
              >
                <CheckCircle2 size={22} />
                Group Counseling
              </button>

              <button
                type="button"
                className={`session-card ${
                  form.session_type === "ONE_ON_ONE_COUNSELING" ? "active" : ""
                }`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    session_type: "ONE_ON_ONE_COUNSELING",
                  }))
                }
              >
                <UserRound size={22} />
                One-On-One Counseling
              </button>
            </div>

            <div className="form-field">
              <label>Duration</label>
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="Example: 1hr"
              />
            </div>

            <div className="form-field">
              <label>Session Period</label>
              <select
                name="session_period"
                value={form.session_period}
                onChange={handleChange}
              >
                <option value="MORNING">Morning Session</option>
                <option value="AFTERNOON">Afternoon Session</option>
                <option value="EVENING">Evening Session</option>
              </select>
            </div>

            <div className="form-field">
              <label>Start Time</label>
              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>End Time</label>
              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full">
              <label>Resident</label>
              <select
                name="resident_id"
                value={form.resident_id}
                onChange={handleChange}
              >
                <option value="">Select Resident</option>
                {residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.full_name || resident.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Resident Name</label>
              <input
                name="resident_name"
                value={form.resident_name}
                onChange={handleChange}
                placeholder="Resident Name"
              />
            </div>

            <div className="form-field">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={form.date_of_birth || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Resident Gender</label>
              <select
                name="resident_gender"
                value={form.resident_gender || ""}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-field">
              <label>Date of Service</label>
              <input
                type="date"
                name="date_of_service"
                value={form.date_of_service}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full">
              <span className="section-label">Topic Treated Today</span>
            </div>

            <div className="choice-grid">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className={`choice-pill ${
                    form.topics_treated.includes(topic) ? "active" : ""
                  }`}
                  onClick={() => toggleTopic(topic)}
                >
                  <CheckCircle2 size={18} />
                  {topic}
                </button>
              ))}
            </div>

            <div className="form-field full">
              <label>Session Note</label>
              <textarea
                name="session_note"
                value={form.session_note}
                onChange={handleChange}
                placeholder="Document what occurred during the session..."
                required
              />
            </div>

            <div className="form-field full">
              <span className="section-label">Resident Participation Level</span>
            </div>

            <div className="choice-grid">
              {PARTICIPATION.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`choice-pill ${
                    form.participation_level.includes(item) ? "active" : ""
                  }`}
                  onClick={() => toggleParticipation(item)}
                >
                  <CheckCircle2 size={18} />
                  {item}
                </button>
              ))}
            </div>

            <div className="form-field full">
              <label>Resident Treatment Goals</label>
              <textarea
                name="treatment_goals"
                value={form.treatment_goals}
                onChange={handleChange}
                placeholder="Enter resident treatment goals..."
              />
            </div>

            <div className="form-field full">
              <label>Intervention(s)</label>
              <textarea
                name="interventions"
                value={form.interventions}
                onChange={handleChange}
                placeholder="Enter interventions used during the session..."
              />
            </div>

            <div className="form-field">
              <label>BHT Name</label>
              <input
                name="bht_name"
                value={form.bht_name}
                onChange={handleChange}
                placeholder="BHT Name"
              />
            </div>

            <div className="form-field">
              <label>BHT Signature</label>
              <input
                name="bht_signature"
                value={form.bht_signature}
                onChange={handleChange}
                placeholder="Type full name as signature"
              />
            </div>

            <div className="form-field">
              <label>BHT Signature Date</label>
              <input
                type="date"
                name="bht_signature_date"
                value={form.bht_signature_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
                <option value="REVIEWED">Reviewed</option>
              </select>
            </div>

            <div className="form-field">
              <label>BHP Name</label>
              <input
                name="bhp_name"
                value={form.bhp_name}
                onChange={handleChange}
                placeholder="BHP Name"
              />
            </div>

            <div className="form-field">
              <label>BHP Signature</label>
              <input
                name="bhp_signature"
                value={form.bhp_signature}
                onChange={handleChange}
                placeholder="Type full name as signature"
              />
            </div>

            <div className="form-field">
              <label>BHP Signature Date</label>
              <input
                type="date"
                name="bhp_signature_date"
                value={form.bhp_signature_date}
                onChange={handleChange}
              />
            </div>

            <div className="button-row">
              <button className="primary-btn" type="submit">
                <Save size={20} />
                Save Group Note
              </button>

              <button className="secondary-btn" type="button" onClick={loadNotes}>
                <RefreshCw size={20} />
                Refresh Notes
              </button>
            </div>
          </div>
        </form>

        <aside className="premium-card">
          <div className="card-header">
            <div>
              <p>Recent Records</p>
              <h2>Group Notes</h2>
            </div>
            <Clock size={32} />
          </div>

          <div className="note-list">
            {notes.length === 0 && (
              <div className="empty-state">No group notes found.</div>
            )}

            {notes.map((note) => (
              <div className="note-row" key={note.id}>
                <strong>
                  {note.resident_name ||
                    selectedResident?.full_name ||
                    "Resident Not Recorded"}
                </strong>

                <p>
                  {note.session_note || "No session note preview available."}
                </p>

                <div className="note-meta">
                  <span className="chip">
                    <CalendarDays size={12} />{" "}
                    {note.date_of_service || note.created_at || "No date"}
                  </span>
                  <span className="chip">
                    <ShieldCheck size={12} /> {note.status || "DRAFT"}
                  </span>
                  <span className="chip">
                    <PenLine size={12} /> {note.bht_name || "BHT"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}