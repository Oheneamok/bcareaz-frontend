import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Save,
  RefreshCw,
  CalendarDays,
  Clock,
  CheckCircle2,
  FileText,
  ShieldCheck,
  PenLine,
  UsersRound,
  Sparkles,
  UserCheck,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

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
  "Coping Skills",
  "Relapse Prevention",
  "Medication Compliance",
  "Healthy Relationships",
  "Conflict Resolution",
  "Emotional Regulation",
  "Stress Management",
  "Self-Esteem",
  "Trauma Awareness",
  "Communication Skills",
  "Independent Living Skills",
  "Boundaries",
  "Accountability",
  "Decision Making",
  "Crisis Prevention",
  "Personal Hygiene",
  "Community Safety",
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

export default function FacilityGroupNotesAuditPage() {
  const [residents, setResidents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    session_type: "GROUP_DISCUSSION",
    duration: "1hr",
    start_time: "",
    end_time: "",
    session_period: "MORNING",
    date_of_service: today(),
    attendance: [],
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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleAttendance(resident) {
    const residentId = String(resident.id);

    setForm((prev) => {
      const exists = prev.attendance.some(
        (item) => String(item.resident_id) === residentId
      );

      return {
        ...prev,
        attendance: exists
          ? prev.attendance.filter(
              (item) => String(item.resident_id) !== residentId
            )
          : [
              ...prev.attendance,
              {
                resident_id: resident.id,
                resident_name: resident.full_name || resident.name,
                attended: true,
              },
            ],
      };
    });
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

      setMessage("Group discussion note saved successfully.");

      setForm((prev) => ({
        ...prev,
        session_note: "",
        treatment_goals: "",
        interventions: "",
        attendance: [],
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
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .group-note-hero {
          min-height: 490px;
          border-radius: 28px;
          padding: 44px;
          margin-bottom: 24px;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 34px;
          background:
            linear-gradient(
              90deg,
              rgba(5,18,44,.98) 0%,
              rgba(30,64,175,.92) 45%,
              rgba(14,165,233,.34) 75%,
              rgba(14,165,233,.16) 100%
            ),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
        }

        .group-note-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(5,18,44,.14), rgba(5,18,44,.04)),
            radial-gradient(circle at 72% 45%, rgba(125,211,252,.22), transparent 34%);
        }

        .hero-content,
        .hero-card {
          position: relative;
          z-index: 2;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 14px;
          color: #7dd3fc;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .group-note-hero h1 {
          margin: 0;
          max-width: 760px;
          font-size: clamp(46px, 5.3vw, 76px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .group-note-hero p {
          max-width: 820px;
          margin: 20px 0 0;
          color: rgba(255,255,255,.9);
          font-size: 18px;
          line-height: 1.65;
          font-weight: 650;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .hero-pill {
          min-height: 42px;
          border-radius: 999px;
          padding: 0 15px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          background: rgba(255,255,255,.12);
          border: 4px solid rgba(25,255,255,.82);
          color: rgba(255,255,255,.88);
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
          backdrop-filter: blur(12px);
        }

        .hero-card {
          width: 265px;
          border-radius: 22px;
          padding: 26px;
          background: rgba(255,255,255,.14);
          border: 4px solid rgba(25,255,255,.55);
          backdrop-filter: blur(18px);
          box-shadow: 0 22px 56px rgba(0,0,0,.22);
        }

        .hero-card-icon {
          width: 66px;
          height: 66px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          background: linear-gradient(135deg, #38bdf8, #2563eb);
          box-shadow: 0 18px 30px rgba(0,0,0,.18);
        }

        .hero-card strong {
          display: block;
          font-size: 50px;
          line-height: 1;
          letter-spacing: -.07em;
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
          border-radius: 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-weight: 900;
        }

        .group-note-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(360px, .75fr);
          gap: 24px;
          align-items: start;
        }

        .premium-card {
          border-radius: 24px;
          padding: 30px;
          background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,251,255,.96));
          border: 3px solid rgba(25,255,255,.95);
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
          height: 15px;
          background: linear-gradient(90deg, #2563eb, #06b6d4, #14b8a6);
        }

        .card-header {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 26px;
        }

        .card-header p {
          margin: 0 0 9px;
          color: #2563eb;
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

        .card-header svg {
          color: #2563eb;
        }

        .form-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .form-section {
          grid-column: span 2;
          margin-top: 8px;
          padding: 18px;
          border-radius: 20px;
          background: #f8fbff;
          border: 4px solid #dbeafe;
        }

        .form-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 14px;
        }

        .section-label {
          color: #1e3a8a;
          font-size: 15px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .selection-count {
          border-radius: 999px;
          padding: 7px 10px;
          background: white;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .form-field {
          display: grid;
          gap: 8px;
        }

        .form-field.full {
          grid-column: span 2;
        }

        .form-field label {
          color: #385071;
          font-size: 16px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          min-height: 58px;
          border: 3px solid #cfe0f7;
          border-radius: 15px;
          padding: 0 15px;
          background: white;
          color: #274DF5;
          font-size: 17px;
          font-weight: 800;
          outline: none;
          box-shadow: 0 8px 20px rgba(15,23,42,.74);
        }

        .form-field textarea {
          min-height: 145px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.55;
		  border: 2px solid rgba(25,255,255,.95);
        }

        .choice-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
		  
        }

        .choice-pill {
          min-height: 56px;
          border: 1px solid #dbeafe;
          border-radius: 16px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #ffffff, #f8fbff);
          color: #334155;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(15,23,42,.35);
          transition: .22s ease;
        }

        .choice-pill:hover {
          transform: translateY(-2px);
          border-color: #93c5fd;
        }

        .choice-pill.active {
          border-color: #2563eb;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          color: #1d4ed8;
        }

        .choice-check {
          width: 25px;
          height: 25px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          background: #e2e8f0;
          color: transparent;
          flex-shrink: 0;
        }

        .choice-pill.active .choice-check {
          color: white;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
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
          background: linear-gradient(135deg, #1d4ed8, #0f766e);
        }

        .secondary-btn {
          color: #071735;
          background: white;
          border: 1px solid #cfe0f7;
        }

        .note-list {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 14px;
        }

        .note-row {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 16px;
          padding: 18px;
          background: white;
        }

        .note-row strong {
          display: block;
          font-size: 17px;
          color: #071735;
        }

        .note-row p {
          margin: 8px 0 0;
          color: #64748b;
          font-weight: 700;
          line-height: 1.45;
        }

        .note-meta {
          margin-top: 12px;
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
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .empty-state {
          min-height: 180px;
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

        @media (max-width: 820px) {
          .group-note-page {
            padding: 14px;
          }

          .form-grid,
          .choice-grid {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .button-row,
          .form-section {
            grid-column: span 1;
          }

          .group-note-hero {
            min-height: auto;
            padding: 28px;
          }

          .group-note-hero h1 {
            font-size: 42px;
          }
        }
      `}</style>

      <section className="group-note-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <ClipboardList size={18} />
            BHT Group Discussion Notes
          </p>

          <h1>
            Group Discussion
            <br />
            Documentation
          </h1>

          <p>
            Record one shared group discussion session, attendance for all
            residents, topics treated, participation, goals, interventions, and
            BHT/BHP signatures.
          </p>

          <div className="hero-actions">
            <span className="hero-pill">
              <ShieldCheck size={15} />
              Compliance Ready
            </span>
            <span className="hero-pill">
              <UsersRound size={15} />
              Group Attendance
            </span>
            <span className="hero-pill">
              <Sparkles size={15} />
              Audit Friendly
            </span>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon">
            <UsersRound size={32} />
          </div>
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
              <h2>Group Discussion Note</h2>
            </div>
            <FileText size={32} />
          </div>

          <div className="form-grid">
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
              <label>Session</label>
              <select
                name="session_period"
                value={form.session_period}
                onChange={handleChange}
              >
                <option value="MORNING">Morning Session</option>
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
              <label>Date of Service</label>
              <input
                type="date"
                name="date_of_service"
                value={form.date_of_service}
                onChange={handleChange}
              />
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <span className="section-label">Attendance</span>
                <span className="selection-count">
                  {form.attendance.length} Present
                </span>
              </div>

              <div className="choice-grid">
                {residents.map((resident) => {
                  const active = form.attendance.some(
                    (item) => String(item.resident_id) === String(resident.id)
                  );

                  return (
                    <button
                      key={resident.id}
                      type="button"
                      className={`choice-pill ${active ? "active" : ""}`}
                      onClick={() => toggleAttendance(resident)}
                    >
                      <span className="choice-check">
                        <UserCheck size={16} />
                      </span>
                      {resident.full_name || resident.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <span className="section-label">Topic Treated Today</span>
                <span className="selection-count">
                  {form.topics_treated.length} Selected
                </span>
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
                    <span className="choice-check">
                      <CheckCircle2 size={16} />
                    </span>
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field full">
              <label>Session Note</label>
              <textarea
                name="session_note"
                value={form.session_note}
                onChange={handleChange}
                placeholder="Document what occurred during the group discussion..."
                required
              />
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <span className="section-label">
                  Group Participation Observed
                </span>
                <span className="selection-count">
                  {form.participation_level.length} Selected
                </span>
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
                    <span className="choice-check">
                      <CheckCircle2 size={16} />
                    </span>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field full">
              <label>Group Treatment Goals</label>
              <textarea
                name="treatment_goals"
                value={form.treatment_goals}
                onChange={handleChange}
                placeholder="Enter group treatment goals addressed..."
              />
            </div>

            <div className="form-field full">
              <label>Intervention(s)</label>
              <textarea
                name="interventions"
                value={form.interventions}
                onChange={handleChange}
                placeholder="Enter interventions used during the group discussion..."
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
                Save Group Discussion
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
                <strong>{note.session_period || "Group Session"}</strong>

                <p>
                  {note.session_note || "No session note preview available."}
                </p>

                <div className="note-meta">
                  <span className="chip">
                    <CalendarDays size={12} />
                    {note.date_of_service || note.created_at || "No date"}
                  </span>
                  <span className="chip">
                    <ShieldCheck size={12} />
                    {note.status || "DRAFT"}
                  </span>
                  <span className="chip">
                    <PenLine size={12} />
                    {note.bht_name || "BHT"}
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