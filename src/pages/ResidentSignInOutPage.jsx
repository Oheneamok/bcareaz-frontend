import React, { useEffect, useMemo, useState } from "react";
import {
  Car,
  Clock,
  Save,
  RefreshCw,
  UserCheck,
  UserX,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  PenLine,
  CalendarDays,
  UsersRound,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const DESTINATIONS = [
  "Medical Appointment",
  "Behavioral Health Appointment",
  "Pharmacy",
  "Grocery Shopping",
  "Family Visit",
  "Community Activity",
  "Church",
  "Employment",
  "School",
  "Recreation",
  "Court",
  "Probation",
  "Social Security",
  "AHCCCS Office",
  "Bank",
  "Restaurant",
  "Other",
];

const PURPOSES = [
  "Medical",
  "Therapy",
  "Shopping",
  "Recreation",
  "Employment",
  "Family Visit",
  "Religious",
  "Court",
  "School",
  "Personal",
  "Other",
];

const TRANSPORTATION = [
  "Facility Vehicle",
  "Family",
  "Friend",
  "Taxi",
  "Uber",
  "Lyft",
  "Walking",
  "Bus",
  "Other",
];

const CONDITION_ITEMS = [
  "Calm",
  "Cooperative",
  "Appropriate Mood",
  "No Signs of Distress",
  "Medication Sent",
  "Medication Returned",
  "Personal Belongings Taken",
  "Returned Safely",
];

export default function ResidentSignInOutPage() {
  const [residents, setResidents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedOpenLog, setSelectedOpenLog] = useState(null);

  const staffName =
    currentUser?.full_name || currentUser?.name || currentUser?.email || "";

  const [form, setForm] = useState({
    resident_id: "",
    resident_name: "",
    log_type: "SIGN_OUT",
    log_date: today(),
    log_time: nowTime(),
    destination: "",
    destination_other: "",
    purpose: "",
    purpose_other: "",
    transportation: "",
    responsible_party: "",
    responsible_party_phone: "",
    expected_return_date: today(),
    expected_return_time: "",
    actual_return_date: today(),
    actual_return_time: nowTime(),
    condition_items: [],
    staff_name: "",
    staff_signature: "",
    resident_signature: "",
    notes: "",
    status: "OPEN",
  });

  async function loadResidents() {
    try {
      const res = await api.get("/residents");
      setResidents(res.data || []);
    } catch {
      setResidents([]);
    }
  }

  async function loadLogs() {
    try {
      const res = await api.get("/facility-compliance/resident-sign-logs");
      setLogs(res.data || []);
    } catch {
      setLogs([]);
    }
  }

  async function loadCurrentUser() {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data);

      const name =
        res.data?.full_name || res.data?.name || res.data?.email || "";

      setForm((prev) => ({
        ...prev,
        staff_name: name,
        staff_signature: name,
      }));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadResidents();
    loadLogs();
    loadCurrentUser();
  }, []);

	const residentsOut = useMemo(() => {
	  return logs.filter((log) => log.status === "OPEN" || log.status === "OUT");
	}, [logs]);

  const returnedToday = useMemo(() => {
    return logs.filter(
      (log) =>
        log.status === "RETURNED" &&
        (log.actual_return_date === today() || log.log_date === today())
    );
  }, [logs]);

  const lateReturns = useMemo(() => {
    const now = new Date();

    return residentsOut.filter((log) => {
      if (!log.expected_return_date || !log.expected_return_time) return false;
      const expected = new Date(
        `${log.expected_return_date}T${log.expected_return_time}`
      );
      return expected < now;
    });
  }, [residentsOut]);

  function isLate(log) {
    if (!log.expected_return_date || !log.expected_return_time) return false;
    if (log.status === "RETURNED") return false;

    const expected = new Date(
      `${log.expected_return_date}T${log.expected_return_time}`
    );

    return expected < new Date();
  }

	function selectOpenLog(log) {
	  setSelectedOpenLog(log);

	  setForm((prev) => ({
		...prev,
		log_type: "SIGN_IN",
		resident_id: log.resident_id,
		resident_name: log.resident_name,
		destination: log.destination || "",
		purpose: log.purpose || "",
		expected_return_date: log.expected_return_date || today(),
		expected_return_time: log.expected_return_time || "",
		actual_return_date: today(),
		actual_return_time: nowTime(),
		notes: log.notes || "",
		status: "RETURNED",
	  }));
	}

  function handleChange(e) {
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

    if (name === "log_type") {
      setForm((prev) => ({
        ...prev,
        log_type: value,
        log_date: today(),
        log_time: nowTime(),
        actual_return_date: today(),
        actual_return_time: nowTime(),
        status: value === "SIGN_IN" ? "RETURNED" : "OPEN",
      }));

      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleCondition(item) {
    setForm((prev) => ({
      ...prev,
      condition_items: prev.condition_items.includes(item)
        ? prev.condition_items.filter((x) => x !== item)
        : [...prev.condition_items, item],
    }));
  }

	async function submitLog(e) {
	  e.preventDefault();

	  const payload = {
		...form,
		destination:
		  form.destination === "Other" ? form.destination_other : form.destination,
		purpose: form.purpose === "Other" ? form.purpose_other : form.purpose,
		staff_name: form.staff_name || staffName,
		staff_signature: form.staff_signature || staffName,
		status: form.log_type === "SIGN_IN" ? "RETURNED" : "OPEN",
	  };

	  try {
		if (form.log_type === "SIGN_IN") {
		  if (!selectedOpenLog?.id) {
			setMessage("Please select an open sign-out record to sign the resident back in.");
			return;
		  }

		  await api.patch(
			`/facility-compliance/resident-sign-logs/${selectedOpenLog.id}`,
			payload
		  );
		} else {
		  await api.post("/facility-compliance/resident-sign-logs", payload);
		}

		setMessage(
		  form.log_type === "SIGN_IN"
			? "Resident returned and sign-in completed."
			: "Resident sign-out saved successfully."
		);

		setSelectedOpenLog(null);

		setForm((prev) => ({
		  ...prev,
		  resident_id: "",
		  resident_name: "",
		  log_type: "SIGN_OUT",
		  log_date: today(),
		  log_time: nowTime(),
		  destination: "",
		  destination_other: "",
		  purpose: "",
		  purpose_other: "",
		  transportation: "",
		  responsible_party: "",
		  responsible_party_phone: "",
		  expected_return_date: today(),
		  expected_return_time: "",
		  actual_return_date: today(),
		  actual_return_time: nowTime(),
		  condition_items: [],
		  resident_signature: "",
		  notes: "",
		  status: "OPEN",
		  staff_name: staffName,
		  staff_signature: staffName,
		}));

		loadLogs();
	  } catch (err) {
		console.error(err);
		setMessage("Could not save resident sign log.");
	  }
	}

  return (
    <div className="sign-page">
      <style>{`
        .sign-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .sign-hero {
          min-height: 380px;
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

        .sign-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(5,18,44,.14), rgba(5,18,44,.04)),
            radial-gradient(circle at 72% 45%, rgba(125,211,252,.22), transparent 34%);
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
          color: #7dd3fc;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .sign-hero h1 {
          margin: 0;
          max-width: 760px;
          font-size: clamp(46px, 5.3vw, 76px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .sign-hero p {
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

        .hero-metrics {
          width: 330px;
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
          letter-spacing: -.06em;
        }

        .metric-card span {
          display: block;
          margin-top: 6px;
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

        .sign-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(380px, .85fr);
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
          background: linear-gradient(90deg, #2563eb, #06b6d4, #14b8a6);
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

        .form-field input[readonly] {
          background: #f8fafc;
          color: #475569;
          cursor: not-allowed;
        }

        .form-field textarea {
          min-height: 130px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.55;
        }

        .action-row {
          grid-column: span 2;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .action-card {
          min-height: 82px;
          border: 1px solid #dbeafe;
          border-radius: 18px;
          background: linear-gradient(135deg, white, #f8fbff);
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          cursor: pointer;
          color: #334155;
          font-weight: 950;
          box-shadow: 0 10px 24px rgba(15,23,42,.07);
        }

        .action-card.active {
          border-color: #2563eb;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          color: #1d4ed8;
        }

        .action-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
        }

        .condition-section {
          grid-column: span 2;
          padding: 18px;
          border-radius: 20px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .condition-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .choice-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
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

        .right-stack {
          display: grid;
          gap: 24px;
        }

        .out-list,
        .history-list {
          display: grid;
          gap: 14px;
        }

        .resident-card,
        .history-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 16px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .resident-card.late {
          border-left-color: #dc2626;
        }

        .resident-card.due {
          border-left-color: #f59e0b;
        }

        .resident-card strong,
        .history-card strong {
          display: block;
          font-size: 17px;
          color: #071735;
        }

        .resident-card p,
        .history-card p {
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

        .chip.red {
          background: #fef2f2;
          color: #dc2626;
        }

        .chip.green {
          background: #ecfdf5;
          color: #047857;
        }

        .chip.orange {
          background: #fffbeb;
          color: #b45309;
        }

        .empty-state {
          min-height: 160px;
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
          .sign-grid {
            grid-template-columns: 1fr;
          }

          .sign-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-metrics {
            width: 100%;
          }
        }

        @media (max-width: 820px) {
          .sign-page {
            padding: 14px;
          }

          .form-grid,
          .action-row,
          .choice-grid {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .button-row,
          .condition-section,
          .action-row {
            grid-column: span 1;
          }

          .sign-hero {
            min-height: auto;
            padding: 28px;
          }

          .sign-hero h1 {
            font-size: 42px;
          }
        }
      `}</style>

      <section className="sign-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <Car size={18} />
            Facility Compliance
          </p>

          <h1>
            Resident Sign In
            <br />
            Sign Out
          </h1>

          <p>
            Track resident outings, destinations, expected return times, actual
            returns, condition notes, staff signatures, and late return alerts.
          </p>

          <div className="hero-actions">
            <span className="hero-pill">
              <ShieldCheck size={15} />
              Inspection Ready
            </span>
            <span className="hero-pill">
              <Clock size={15} />
              Late Return Tracking
            </span>
            <span className="hero-pill">
              <PenLine size={15} />
              Auto Signature
            </span>
          </div>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{residentsOut.length}</strong>
            <span>Currently Out</span>
          </div>
          <div className="metric-card">
            <strong>{returnedToday.length}</strong>
            <span>Returned Today</span>
          </div>
          <div className="metric-card">
            <strong>{lateReturns.length}</strong>
            <span>Late Returns</span>
          </div>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <section className="sign-grid">
        <form className="premium-card" onSubmit={submitLog}>
          <div className="card-header">
            <div>
              <p>New Entry</p>
              <h2>Resident Movement Log</h2>
            </div>
            <Car size={32} color="#2563eb" />
          </div>

          <div className="form-grid">
            <div className="action-row">
              <button
                type="button"
                className={`action-card ${
                  form.log_type === "SIGN_OUT" ? "active" : ""
                }`}
                onClick={() =>
                  handleChange({
                    target: { name: "log_type", value: "SIGN_OUT" },
                  })
                }
              >
                <span className="action-icon">
                  <UserX size={22} />
                </span>
                Sign Out
              </button>

              <button
                type="button"
                className={`action-card ${
                  form.log_type === "SIGN_IN" ? "active" : ""
                }`}
                onClick={() =>
                  handleChange({
                    target: { name: "log_type", value: "SIGN_IN" },
                  })
                }
              >
                <span className="action-icon">
                  <UserCheck size={22} />
                </span>
                Sign In / Return
              </button>
            </div>

            <div className="form-field full">
              <label>Resident</label>
              <select
                name="resident_id"
                value={form.resident_id}
                onChange={handleChange}
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
              <label>Log Date</label>
              <input
                type="date"
                name="log_date"
                value={form.log_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Log Time</label>
              <input
                type="time"
                name="log_time"
                value={form.log_time}
                onChange={handleChange}
              />
            </div>

            {form.log_type === "SIGN_OUT" && (
              <>
                <div className="form-field">
                  <label>Destination</label>
                  <select
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Destination</option>
                    {DESTINATIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {form.destination === "Other" && (
                  <div className="form-field">
                    <label>Other Destination</label>
                    <input
                      name="destination_other"
                      value={form.destination_other}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="form-field">
                  <label>Purpose</label>
                  <select
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Purpose</option>
                    {PURPOSES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {form.purpose === "Other" && (
                  <div className="form-field">
                    <label>Other Purpose</label>
                    <input
                      name="purpose_other"
                      value={form.purpose_other}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="form-field">
                  <label>Transportation</label>
                  <select
                    name="transportation"
                    value={form.transportation}
                    onChange={handleChange}
                  >
                    <option value="">Select Transportation</option>
                    {TRANSPORTATION.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Expected Return Date</label>
                  <input
                    type="date"
                    name="expected_return_date"
                    value={form.expected_return_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Expected Return Time</label>
                  <input
                    type="time"
                    name="expected_return_time"
                    value={form.expected_return_time}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

			{(form.log_type === "SIGN_IN" ? residentsOut : residents).map((item) => {
			  const residentId = form.log_type === "SIGN_IN" ? item.resident_id : item.id;
			  const residentName =
				form.log_type === "SIGN_IN"
				  ? item.resident_name
				  : item.full_name || item.name;

			  return (
				<option key={residentId} value={residentId}>
				  {residentName}
				</option>
			  );
			})}

            <div className="form-field">
              <label>Responsible Person</label>
              <input
                name="responsible_party"
                value={form.responsible_party}
                onChange={handleChange}
                placeholder="Name"
              />
            </div>

            <div className="form-field">
              <label>Responsible Phone</label>
              <input
                name="responsible_party_phone"
                value={form.responsible_party_phone}
                onChange={handleChange}
                placeholder="Phone"
              />
            </div>

            <div className="condition-section">
              <div className="condition-header">
                <span className="section-label">Resident Condition</span>
              </div>

              <div className="choice-grid">
                {CONDITION_ITEMS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`choice-pill ${
                      form.condition_items.includes(item) ? "active" : ""
                    }`}
                    onClick={() => toggleCondition(item)}
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
              <label>Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Add outing details, return condition, concerns, late return explanation, or follow-up actions..."
              />
            </div>

            <div className="form-field">
              <label>Staff Name</label>
              <input value={form.staff_name || staffName} readOnly />
            </div>

            <div className="form-field">
              <label>Staff Signature</label>
              <input value={form.staff_signature || staffName} readOnly />
            </div>

            <div className="form-field full">
              <label>Resident Signature</label>
              <input
                name="resident_signature"
                value={form.resident_signature}
                onChange={handleChange}
                placeholder="Resident typed signature"
              />
            </div>

            <div className="button-row">
              <button className="primary-btn" type="submit">
                <Save size={20} />
                Save Entry
              </button>

              <button className="secondary-btn" type="button" onClick={loadLogs}>
                <RefreshCw size={20} />
                Refresh Logs
              </button>
            </div>
          </div>
        </form>

        <div className="right-stack">
          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Live Status</p>
                <h2>Currently Out</h2>
              </div>
              <UsersRound size={32} color="#2563eb" />
            </div>

            <div className="out-list">
              {residentsOut.length === 0 && (
                <div className="empty-state">No residents are currently out.</div>
              )}

              {residentsOut.map((log) => (
				<div
				  key={log.id}
				  className={`resident-card ${isLate(log) ? "late" : ""}`}
				  onClick={() => selectOpenLog(log)}
				  style={{ cursor: "pointer" }}
				>
                  <strong>{log.resident_name || "Resident"}</strong>
                  <p>
                    <MapPin size={13} /> {log.destination || "Destination not recorded"}
                  </p>
                  <p>
                    Expected Return:{" "}
                    {log.expected_return_date || "-"}{" "}
                    {log.expected_return_time || ""}
                  </p>

                  <div className="chip-row">
                    <span className={`chip ${isLate(log) ? "red" : "orange"}`}>
                      {isLate(log) ? "Late" : "Out"}
                    </span>
                    <span className="chip">
                      <Clock size={12} />
                      {log.log_time || "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>History</p>
                <h2>Recent Logs</h2>
              </div>
              <CalendarDays size={32} color="#2563eb" />
            </div>

            <div className="history-list">
              {logs.length === 0 && (
                <div className="empty-state">No sign in/out logs found.</div>
              )}

              {logs.slice(0, 12).map((log) => (
                <div className="history-card" key={log.id}>
                  <strong>{log.resident_name || "Resident"}</strong>

                  <p>
                    {log.log_type} · {log.destination || "No destination"} ·{" "}
                    {log.log_date} {log.log_time || ""}
                  </p>

                  <div className="chip-row">
                    <span
                      className={`chip ${
                        log.status === "RETURNED"
                          ? "green"
                          : isLate(log)
                          ? "red"
                          : "orange"
                      }`}
                    >
                      {log.status === "RETURNED"
                        ? "Returned"
                        : isLate(log)
                        ? "Late"
                        : "Out"}
                    </span>

                    {log.staff_name && (
                      <span className="chip">
                        <PenLine size={12} />
                        {log.staff_name}
                      </span>
                    )}
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