import React, { useEffect, useState } from "react";
import {
  FileText,
  Save,
  RefreshCw,
  CalendarDays,
  Clock,
  CheckCircle2,
  UserRound,
  ShieldCheck,
  PenLine,
  Moon,
  Sun,
  AlertTriangle,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const MED_PROMPTS = ["0", "1", "2", "3", "More than 3", "N/A", "Refused"];

const MED_KNOWLEDGE = [
  "Names",
  "Frequency / Time Taken",
  "Dosages",
  "Purposes",
  "Side Effects",
  "None",
];

const ADLS = [
  "Bed made",
  "Hygiene / shaving / brushing teeth",
  "Personal area clean",
  "Dressed appropriately",
  "Showered",
];

const ILS = [
  "Cooking",
  "House Cleaning",
  "Shopping",
  "Laundry",
  "Set up appointments",
];

const SLEEPING_PATTERN = [
  "Slept through the night",
  "Minor interrupted sleep",
  "Significant difficulties",
];

const today = () => new Date().toISOString().slice(0, 10);

const baseShift = {
  medication_prompts: "",
  medication_knowledge: [],
  followed_house_rules: "",
  homicidal_suicidal_ideation: "",
  adls: [],
  independent_living_skills: [],
  ate_breakfast: false,
  ate_lunch: false,
  ate_dinner: "",
  substance_abuse: "",
  other_incident: "",
  cravings: "",
  aa_na: "",
  focus_groups: "",
  outings: "",
  comments: "",
  staff_printed_name: "",
  staff_signature: "",
  signature_date: today(),
  bedtime: "",
  awake_at_11pm: false,
  sleeping_pattern: "",
};

export default function ResidentProgressNotePage() {
  const [residents, setResidents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    resident_id: "",
    resident_name: "",
    day_of_week: "",
    date_of_service: today(),
    morning_shift: { ...baseShift },
    evening_shift: { ...baseShift },
    status: "DRAFT",
  });

  function getStaffName(user = currentUser) {
    return user?.full_name || user?.name || user?.email || "";
  }

  function shiftWithStaff(user = currentUser) {
    const staffName = getStaffName(user);

    return {
      ...baseShift,
      staff_printed_name: staffName,
      staff_signature: staffName,
      signature_date: today(),
    };
  }

  async function loadResidents() {
    try {
      const res = await api.get("/residents");
      setResidents(res.data || []);
    } catch {
      setResidents([]);
    }
  }

  async function loadNotes() {
    try {
      const res = await api.get("/facility-compliance/progress-notes");
      setNotes(res.data || []);
    } catch {
      setNotes([]);
    }
  }

  async function loadCurrentUser() {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data);

      const staffName =
        res.data?.full_name || res.data?.name || res.data?.email || "";

      setForm((prev) => ({
        ...prev,
        morning_shift: {
          ...prev.morning_shift,
          staff_printed_name: staffName,
          staff_signature: staffName,
        },
        evening_shift: {
          ...prev.evening_shift,
          staff_printed_name: staffName,
          staff_signature: staffName,
        },
      }));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadResidents();
    loadNotes();
    loadCurrentUser();
  }, []);

  function handleMainChange(e) {
    const { name, value } = e.target;

    if (name === "resident_id") {
      const resident = residents.find((r) => String(r.id) === String(value));

      setForm((prev) => ({
        ...prev,
        resident_id: value,
        resident_name: resident?.full_name || resident?.name || "",
      }));

      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleShiftChange(shift, name, value) {
    setForm((prev) => ({
      ...prev,
      [shift]: {
        ...prev[shift],
        [name]: value,
      },
    }));
  }

  function toggleShiftArray(shift, name, item) {
    setForm((prev) => {
      const current = prev[shift][name] || [];

      return {
        ...prev,
        [shift]: {
          ...prev[shift],
          [name]: current.includes(item)
            ? current.filter((x) => x !== item)
            : [...current, item],
        },
      };
    });
  }

  async function submitNote(e) {
    e.preventDefault();

    try {
      await api.post("/facility-compliance/progress-notes", form);

      setMessage("Resident progress note saved successfully.");

      setForm((prev) => ({
        ...prev,
        morning_shift: shiftWithStaff(),
        evening_shift: shiftWithStaff(),
        status: "DRAFT",
      }));

      loadNotes();
    } catch (err) {
      console.error(err);
      setMessage("Could not save progress note. Please check backend route.");
    }
  }

  function ChoiceButton({ active, children, onClick }) {
    return (
      <button
        type="button"
        className={`choice-pill ${active ? "active" : ""}`}
        onClick={onClick}
      >
        <span className="choice-check">
          <CheckCircle2 size={16} />
        </span>
        {children}
      </button>
    );
  }

  function YesNoRow({ shift, name, label }) {
    return (
      <div className="form-section compact">
        <div className="form-section-header">
          <span className="section-label">{label}</span>
        </div>

        <div className="choice-grid two">
          {["Yes", "No"].map((item) => (
            <ChoiceButton
              key={item}
              active={form[shift][name] === item}
              onClick={() => handleShiftChange(shift, name, item)}
            >
              {item}
            </ChoiceButton>
          ))}
        </div>
      </div>
    );
  }

  function ShiftSection({ shift, title, icon }) {
    const isMorning = shift === "morning_shift";
    const Icon = icon;

    return (
      <div className="shift-card">
        <div className="shift-header">
          <div className="shift-icon">
            <Icon size={28} />
          </div>
          <div>
            <p>{isMorning ? "8am - 8pm" : "8pm - 8am"}</p>
            <h2>{title}</h2>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-section">
            <div className="form-section-header">
              <span className="section-label">
                Prompts Needed to Take Medications
              </span>
            </div>

            <div className="choice-grid">
              {MED_PROMPTS.map((item) => (
                <ChoiceButton
                  key={item}
                  active={form[shift].medication_prompts === item}
                  onClick={() =>
                    handleShiftChange(shift, "medication_prompts", item)
                  }
                >
                  {item}
                </ChoiceButton>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <span className="section-label">Medication Knowledge</span>
            </div>

            <div className="choice-grid">
              {MED_KNOWLEDGE.map((item) => (
                <ChoiceButton
                  key={item}
                  active={form[shift].medication_knowledge.includes(item)}
                  onClick={() =>
                    toggleShiftArray(shift, "medication_knowledge", item)
                  }
                >
                  {item}
                </ChoiceButton>
              ))}
            </div>
          </div>

          <YesNoRow
            shift={shift}
            name="followed_house_rules"
            label="Followed House Rules"
          />

          <div className="form-section compact">
            <div className="form-section-header">
              <span className="section-label">
                Homicidal / Suicidal Ideation
              </span>
            </div>

            <div className="choice-grid three">
              {["HI", "SI", "Denies"].map((item) => (
                <ChoiceButton
                  key={item}
                  active={form[shift].homicidal_suicidal_ideation === item}
                  onClick={() =>
                    handleShiftChange(
                      shift,
                      "homicidal_suicidal_ideation",
                      item
                    )
                  }
                >
                  {item}
                </ChoiceButton>
              ))}
            </div>
          </div>

          {isMorning && (
            <div className="form-section">
              <div className="form-section-header">
                <span className="section-label">ADLs</span>
              </div>

              <div className="choice-grid">
                {ADLS.map((item) => (
                  <ChoiceButton
                    key={item}
                    active={form[shift].adls.includes(item)}
                    onClick={() => toggleShiftArray(shift, "adls", item)}
                  >
                    {item}
                  </ChoiceButton>
                ))}
              </div>
            </div>
          )}

          <div className="form-section">
            <div className="form-section-header">
              <span className="section-label">Independent Living Skills</span>
            </div>

            <div className="choice-grid">
              {ILS.map((item) => (
                <ChoiceButton
                  key={item}
                  active={form[shift].independent_living_skills.includes(item)}
                  onClick={() =>
                    toggleShiftArray(shift, "independent_living_skills", item)
                  }
                >
                  {item}
                </ChoiceButton>
              ))}
            </div>
          </div>

          {isMorning ? (
            <div className="form-section compact">
              <div className="form-section-header">
                <span className="section-label">Ate Meals</span>
              </div>

              <div className="choice-grid two">
                <ChoiceButton
                  active={form[shift].ate_breakfast}
                  onClick={() =>
                    handleShiftChange(
                      shift,
                      "ate_breakfast",
                      !form[shift].ate_breakfast
                    )
                  }
                >
                  Breakfast
                </ChoiceButton>

                <ChoiceButton
                  active={form[shift].ate_lunch}
                  onClick={() =>
                    handleShiftChange(
                      shift,
                      "ate_lunch",
                      !form[shift].ate_lunch
                    )
                  }
                >
                  Lunch
                </ChoiceButton>
              </div>
            </div>
          ) : (
            <YesNoRow shift={shift} name="ate_dinner" label="Ate Dinner" />
          )}

          <YesNoRow
            shift={shift}
            name="substance_abuse"
            label="Substance Abuse"
          />

          <YesNoRow shift={shift} name="other_incident" label="Other Incident" />

          <YesNoRow shift={shift} name="cravings" label="Cravings" />

          <YesNoRow shift={shift} name="aa_na" label="AA / NA" />

          <YesNoRow
            shift={shift}
            name="focus_groups"
            label="Focus / Counseling Groups"
          />

          {!isMorning && (
            <>
              <div className="form-field">
                <label>What time did resident go to bed?</label>
                <input
                  type="time"
                  value={form[shift].bedtime}
                  onChange={(e) =>
                    handleShiftChange(shift, "bedtime", e.target.value)
                  }
                />
              </div>

              <div className="form-section compact">
                <div className="choice-grid two">
                  <ChoiceButton
                    active={form[shift].awake_at_11pm}
                    onClick={() =>
                      handleShiftChange(
                        shift,
                        "awake_at_11pm",
                        !form[shift].awake_at_11pm
                      )
                    }
                  >
                    Awake at 11pm
                  </ChoiceButton>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-header">
                  <span className="section-label">Sleeping Pattern</span>
                </div>

                <div className="choice-grid">
                  {SLEEPING_PATTERN.map((item) => (
                    <ChoiceButton
                      key={item}
                      active={form[shift].sleeping_pattern === item}
                      onClick={() =>
                        handleShiftChange(shift, "sleeping_pattern", item)
                      }
                    >
                      {item}
                    </ChoiceButton>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="form-field full">
            <label>Outings</label>
            <textarea
              value={form[shift].outings}
              onChange={(e) =>
                handleShiftChange(shift, "outings", e.target.value)
              }
              placeholder="Document outings..."
            />
          </div>

          <div className="form-field full">
            <label>
              Comments{" "}
              {!isMorning && (
                <span className="label-note">
                  Note any ADLs completed in the comments.
                </span>
              )}
            </label>
            <textarea
              value={form[shift].comments}
              onChange={(e) =>
                handleShiftChange(shift, "comments", e.target.value)
              }
              placeholder="Explain refused medications, missed meals, cravings, incidents, sleep difficulties, or other clinical observations..."
            />
          </div>

          <div className="form-field">
            <label>Staff Printed Name</label>
            <input value={form[shift].staff_printed_name} readOnly />
          </div>

          <div className="form-field">
            <label>Signature, Credentials</label>
            <input value={form[shift].staff_signature} readOnly />
          </div>

          <div className="form-field">
            <label>Signature Date</label>
            <input
              type="date"
              value={form[shift].signature_date}
              onChange={(e) =>
                handleShiftChange(shift, "signature_date", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-note-page">
      <style>{`
        .progress-note-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .progress-hero {
          min-height: 390px;
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

        .progress-hero::before {
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

        .progress-hero h1 {
          margin: 0;
          max-width: 760px;
          font-size: clamp(46px, 5.3vw, 76px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .progress-hero p {
          max-width: 800px;
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
          border: 1px solid rgba(255,255,255,.22);
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

        .progress-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(360px, .75fr);
          gap: 24px;
          align-items: start;
        }

        .premium-card,
        .shift-card {
          border-radius: 24px;
          padding: 30px;
          background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,251,255,.96));
          border: 1px solid rgba(219,234,254,.95);
          box-shadow: 0 24px 64px rgba(15,23,42,.13);
          position: relative;
          overflow: hidden;
        }

        .premium-card::before,
        .shift-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #2563eb, #06b6d4, #14b8a6);
        }

        .left-stack {
          display: grid;
          gap: 24px;
        }

        .card-header,
        .shift-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 26px;
        }

        .shift-icon {
          width: 62px;
          height: 62px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
          flex-shrink: 0;
        }

        .card-header p,
        .shift-header p {
          margin: 0 0 9px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .11em;
        }

        .card-header h2,
        .shift-header h2 {
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

        .form-section {
          grid-column: span 2;
          padding: 18px;
          border-radius: 20px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .form-section.compact {
          grid-column: span 1;
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
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
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
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .label-note {
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: none;
          letter-spacing: 0;
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

        .form-field input[readonly] {
          background: #f8fafc;
          color: #475569;
          cursor: not-allowed;
        }

        .form-field textarea {
          min-height: 145px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.55;
        }

        .choice-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .choice-grid.two {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .choice-grid.three {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .choice-pill {
          min-height: 54px;
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
          box-shadow: 0 8px 20px rgba(15,23,42,.055);
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

        .chip-row {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
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
          .progress-grid {
            grid-template-columns: 1fr;
          }

          .progress-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-card {
            width: 100%;
          }
        }

        @media (max-width: 820px) {
          .progress-note-page {
            padding: 14px;
          }

          .form-grid,
          .choice-grid,
          .choice-grid.two,
          .choice-grid.three {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .button-row,
          .form-section,
          .form-section.compact {
            grid-column: span 1;
          }

          .progress-hero {
            min-height: auto;
            padding: 28px;
          }

          .progress-hero h1 {
            font-size: 42px;
          }
        }
      `}</style>

      <section className="progress-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <FileText size={18} />
            Resident Shift Progress Notes
          </p>

          <h1>
            Shift Change
            <br />
            Progress Note
          </h1>

          <p>
            Document each resident’s morning and evening shift observations,
            medication prompts, ADLs, house rules, meals, incidents, outings,
            sleep pattern, and staff signature.
          </p>

          <div className="hero-actions">
            <span className="hero-pill">
              <ShieldCheck size={15} />
              Compliance Ready
            </span>
            <span className="hero-pill">
              <Clock size={15} />
              Shift Based
            </span>
            <span className="hero-pill">
              <PenLine size={15} />
              Auto Signature
            </span>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon">
            <UserRound size={32} />
          </div>
          <strong>{notes.length}</strong>
          <span>Total Progress Notes</span>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <section className="progress-grid">
        <form className="left-stack" onSubmit={submitNote}>
          <div className="premium-card">
            <div className="card-header">
              <div>
                <p>Resident Information</p>
                <h2>Progress Note Header</h2>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field full">
                <label>Resident</label>
                <select
                  name="resident_id"
                  value={form.resident_id}
                  onChange={handleMainChange}
                  required
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
                <label>Day of Week</label>
                <select
                  name="day_of_week"
                  value={form.day_of_week}
                  onChange={handleMainChange}
                >
                  <option value="">Select Day</option>
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Date of Service</label>
                <input
                  type="date"
                  name="date_of_service"
                  value={form.date_of_service}
                  onChange={handleMainChange}
                />
              </div>
            </div>
          </div>

          <ShiftSection shift="morning_shift" title="Morning Shift" icon={Sun} />

          <ShiftSection shift="evening_shift" title="Evening Shift" icon={Moon} />

          <div className="premium-card">
            <div className="button-row">
              <button className="primary-btn" type="submit">
                <Save size={20} />
                Save Progress Note
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
              <h2>Progress Notes</h2>
            </div>
          </div>

          <div className="note-list">
            {notes.length === 0 && (
              <div className="empty-state">No progress notes found.</div>
            )}

            {notes.map((note) => (
              <div className="note-row" key={note.id}>
                <strong>{note.resident_name || "Resident Not Recorded"}</strong>

                <p>
                  {note.morning_shift?.comments ||
                    note.evening_shift?.comments ||
                    "No note preview available."}
                </p>

                <div className="chip-row">
                  <span className="chip">
                    <CalendarDays size={12} />
                    {note.date_of_service || note.created_at || "No date"}
                  </span>
                  <span className="chip">
                    <ShieldCheck size={12} />
                    {note.status || "DRAFT"}
                  </span>
                  {(note.morning_shift?.substance_abuse === "Yes" ||
                    note.evening_shift?.substance_abuse === "Yes" ||
                    note.morning_shift?.other_incident === "Yes" ||
                    note.evening_shift?.other_incident === "Yes") && (
                    <span className="chip">
                      <AlertTriangle size={12} />
                      Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}