import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  RefreshCw,
  CalendarDays,
  Clock,
  ShieldCheck,
  UsersRound,
  Search,
  UserCheck,
  FileText,
  PenLine,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

export default function ResidentGroupNotesPage() {
  const [residents, setResidents] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [message, setMessage] = useState("");

  async function loadResidents() {
    try {
      const res = await api.get("/residents");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.data || [];
      setResidents(list);
    } catch (err) {
      console.error(err);
      setResidents([]);
    }
  }

  async function loadNotes() {
    try {
      const res = await api.get("/facility-compliance/group-notes");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.data || [];
      setAllNotes(list);
      setMessage("");
    } catch (err) {
      console.error(err);
      setAllNotes([]);
      setMessage("Could not load group notes.");
    }
  }

  useEffect(() => {
    loadResidents();
    loadNotes();
  }, []);

  const selectedResident = useMemo(() => {
    return residents.find((r) => String(r.id) === String(selectedResidentId));
  }, [residents, selectedResidentId]);

  function residentName(resident) {
    if (!resident) return "Resident";
    return [resident.first_name, resident.middle_name, resident.last_name]
      .filter(Boolean)
      .join(" ");
  }

  function getAttendance(note) {
    return (
      note.attendance ||
      note.form_data?.attendance ||
      note.metadata_json?.attendance ||
      []
    );
  }

  function attendedByResident(note, residentId) {
    const attendance = getAttendance(note);
    if (!Array.isArray(attendance)) return false;

    return attendance.some((item) => {
      if (typeof item === "string") {
        return String(item) === String(residentId);
      }

      const sameResident =
        String(item.resident_id || item.id) === String(residentId);

      const attended =
        item.attended === true ||
        item.present === true ||
        item.status === "PRESENT" ||
        item.status === "ATTENDED" ||
        item.attendance_status === "PRESENT" ||
        item.attendance_status === "ATTENDED";

      return sameResident && attended;
    });
  }

  const residentGroupNotes = useMemo(() => {
    if (!selectedResidentId) return [];

    return allNotes.filter((note) =>
      attendedByResident(note, selectedResidentId)
    );
  }, [allNotes, selectedResidentId]);

  function groupTitle(note) {
    return (
      note.topic ||
      note.title ||
      note.session_topic ||
      note.form_data?.topic ||
      note.form_data?.topics_treated?.join?.(", ") ||
      note.topics_treated?.join?.(", ") ||
      "Group Discussion"
    );
  }

  function sessionNote(note) {
    return (
      note.session_note ||
      note.form_data?.session_note ||
      note.metadata_json?.session_note ||
      "No session note preview available."
    );
  }

  function topics(note) {
    const list =
      note.topics_treated ||
      note.form_data?.topics_treated ||
      note.metadata_json?.topics_treated ||
      [];

    return Array.isArray(list) ? list : [];
  }

  function participation(note) {
    const list =
      note.participation_level ||
      note.form_data?.participation_level ||
      note.metadata_json?.participation_level ||
      [];

    return Array.isArray(list) ? list : [];
  }

  function serviceDate(note) {
    return note.date_of_service || note.note_date || note.created_at || "";
  }

  function sessionPeriod(note) {
    return note.session_period || note.session_type || note.shift || "Session";
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
          min-height: 430px;
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
          border: 1px solid rgba(255,255,255,.24);
          color: rgba(255,255,255,.88);
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
          backdrop-filter: blur(12px);
        }

        .hero-card {
          width: 280px;
          border-radius: 22px;
          padding: 26px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.25);
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
          background: linear-gradient(135deg, #2563eb, #06b6d4);
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

        .filter-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .resident-select {
          min-width: 330px;
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

        .secondary-btn {
          min-height: 56px;
          border-radius: 16px;
          padding: 0 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
          color: #071735;
          background: white;
          border: 1px solid #cfe0f7;
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
          height: 6px;
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

        .note-list {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 16px;
        }

        .note-row {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 18px;
          padding: 20px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .note-row strong {
          display: block;
          font-size: 19px;
          color: #071735;
          letter-spacing: -.02em;
        }

        .note-row p {
          margin: 10px 0 0;
          color: #64748b;
          font-weight: 750;
          line-height: 1.55;
        }

        .note-meta,
        .chip-row {
          margin-top: 14px;
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

        .chip.green { background: #ecfdf5; color: #047857; }
        .chip.purple { background: #f3e8ff; color: #7c3aed; }
        .chip.orange { background: #fffbeb; color: #b45309; }

        .section-block {
          margin-top: 16px;
          padding: 16px;
          border-radius: 16px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .section-block h4 {
          margin: 0 0 10px;
          color: #1e3a8a;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
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
          .group-note-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-card {
            width: 100%;
          }

          .resident-filter-card {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-controls {
            width: 100%;
          }

          .resident-select {
            width: 100%;
          }
        }

        @media (max-width: 820px) {
          .group-note-page {
            padding: 14px;
          }

          .group-note-hero {
            min-height: auto;
            padding: 28px;
          }

          .group-note-hero h1 {
            font-size: 42px;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>

      <section className="group-note-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <ClipboardList size={18} />
            ResidentCare Group Notes
          </p>

          <h1>
            Group Note
            <br />
            History
          </h1>

          <p>
            Read-only resident group participation history. This page shows only
            group discussions where the selected resident was marked as attended.
          </p>

          <div className="hero-actions">
            <span className="hero-pill">
              <ShieldCheck size={15} />
              Read Only
            </span>
            <span className="hero-pill">
              <UsersRound size={15} />
              Attendance Based
            </span>
            <span className="hero-pill">
              <UserCheck size={15} />
              Resident Copy
            </span>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon">
            <UsersRound size={32} />
          </div>
          <strong>{residentGroupNotes.length}</strong>
          <span>Resident Group Notes</span>
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
              Only attended group notes will show for the selected resident.
            </p>
          </div>
        </div>

        <div className="filter-controls">
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

          <button className="secondary-btn" type="button" onClick={loadNotes}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <section className="premium-card">
        <div className="card-header">
          <div>
            <p>Read Only Copy</p>
            <h2>Resident Group Participation History</h2>
          </div>
          <FileText size={32} color="#2563eb" />
        </div>

        <div className="note-list">
          {!selectedResidentId && (
            <div className="empty-state">
              Select a resident to view their group note history.
            </div>
          )}

          {selectedResidentId && residentGroupNotes.length === 0 && (
            <div className="empty-state">
              No attended group notes found for this resident.
            </div>
          )}

          {residentGroupNotes.map((note) => (
            <article className="note-row" key={note.id}>
              <strong>{groupTitle(note)}</strong>

              <p>{sessionNote(note)}</p>

              <div className="note-meta">
                <span className="chip">
                  <CalendarDays size={12} />
                  {serviceDate(note) || "No date"}
                </span>

                <span className="chip">
                  <Clock size={12} />
                  {sessionPeriod(note)}
                </span>

                <span className="chip green">
                  <CheckCircle2 size={12} />
                  Attended
                </span>

                <span className="chip">
                  <ShieldCheck size={12} />
                  {note.status || "Recorded"}
                </span>

                <span className="chip">
                  <PenLine size={12} />
                  {note.bht_name || note.form_data?.bht_name || "BHT"}
                </span>
              </div>

              {topics(note).length > 0 && (
                <div className="section-block">
                  <h4>Topics Treated</h4>
                  <div className="chip-row">
                    {topics(note).map((topic) => (
                      <span className="chip purple" key={topic}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {participation(note).length > 0 && (
                <div className="section-block">
                  <h4>Participation Observed</h4>
                  <div className="chip-row">
                    {participation(note).map((item) => (
                      <span className="chip orange" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}