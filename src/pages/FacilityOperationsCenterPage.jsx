import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ShieldCheck,
  Wrench,
  Hammer,
  ClipboardCheck,
  CalendarDays,
  Clock,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  PenLine,
  Activity,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const READINESS = [
  "Facility entrance clean and accessible",
  "Hallways clear",
  "Bedrooms safe and orderly",
  "Bathrooms clean and stocked",
  "Kitchen clean and sanitary",
  "Common areas clean",
  "Emergency exits unobstructed",
  "Medication area secured",
  "Resident files secured",
  "No visible safety hazards",
];

const MAINTENANCE = {
  Monthly: [
    "HVAC filter checked",
    "Water heater checked",
    "Refrigerator checked",
    "Freezer checked",
    "Thermostat operational",
    "Dishwasher working",
    "Washer working",
    "Dryer working",
    "Plumbing checked",
    "Electrical checked",
  ],
  Quarterly: [
    "Roof checked",
    "Gutters checked",
    "HVAC service reviewed",
    "Pest control reviewed",
    "Deep cleaning completed",
    "Fire alarm test reviewed",
    "Emergency equipment checked",
  ],
  Yearly: [
    "Fire marshal inspection reviewed",
    "Building inspection reviewed",
    "Insurance reviewed",
    "Emergency plan reviewed",
    "Disaster drill reviewed",
    "Annual facility safety review completed",
  ],
};

const SAFETY = [
  "Fire exits clear",
  "Smoke detectors checked",
  "Carbon monoxide detector checked",
  "Fire extinguishers inspected",
  "Emergency lighting operational",
  "Evacuation routes posted",
  "First aid kit fully stocked",
  "Emergency contact numbers posted",
  "Trip hazards removed",
  "Walkways clear",
  "Outdoor areas safe",
  "Medication room secured",
  "Medication refrigerator locked",
  "Resident records secured",
  "Kitchen knives secured in locked storage",
  "Knife inventory verified",
  "Scissors secured",
  "Maintenance tools locked",
  "Cleaning chemicals stored in locked cabinet",
  "Laundry chemicals stored securely",
  "Hazardous chemicals properly labeled",
  "Chemical SDS available",
  "Facility keys secured",
  "Vehicle keys secured",
  "Doors and windows secure",
  "Visitor access controlled",
];

const AREAS = [
  "Exterior",
  "Kitchen",
  "Living Room",
  "Bathroom",
  "Bedroom",
  "Medication Room",
  "Laundry",
  "Office",
  "Hallway",
  "Garage",
  "Outdoor Area",
  "Other",
];

const REPAIR_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliance",
  "Furniture",
  "Door / Lock",
  "Window",
  "Flooring",
  "Roof / Exterior",
  "Pest Control",
  "Other",
];

const emptyForm = {
  record_type: "READINESS",
  category: "",
  inspection_type: "Daily",
  inspected_by: "",
  log_date: today(),
  log_time: nowTime(),
  area_name: "",
  room_number: "",
  equipment_id: "",
  item_name: "",
  title: "",
  description: "",
  checklist_items: {},
  issue_found: false,
  severity: "LOW",
  priority: "MEDIUM",
  action_taken: "",
  corrective_action: "",
  assigned_to: "",
  vendor_name: "",
  cost: "",
  due_date: "",
  follow_up_date: "",
  completed_date: "",
  completed_by: "",
  document_id: "",
  score: "",
  status: "OPEN",
};

export default function FacilityOperationsCenterPage() {
  const [activeTab, setActiveTab] = useState("READINESS");
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [message, setMessage] = useState("");
  const [maintenanceFrequency, setMaintenanceFrequency] = useState("Monthly");
  const [form, setForm] = useState(emptyForm);

  const staffName =
    currentUser?.full_name || currentUser?.name || currentUser?.email || "";

  async function loadCurrentUser() {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadLogs() {
    try {
      const res = await api.get(
        "/facility-compliance/facility-maintenance-logs"
      );
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
      setLogs([]);
    }
  }

  useEffect(() => {
    loadCurrentUser();
    loadLogs();
  }, []);

  const openRepairs = logs.filter(
    (log) => log.record_type === "REPAIR" && log.status !== "COMPLETED"
  );

  const criticalSafety = logs.filter(
    (log) =>
      log.record_type === "SAFETY" &&
      (log.severity === "HIGH" || log.severity === "CRITICAL") &&
      log.status !== "COMPLETED"
  );

  const completedThisMonth = logs.filter((log) => {
    const d = log.completed_date || log.created_at;
    return (
      log.status === "COMPLETED" &&
      d &&
      String(d).slice(0, 7) === today().slice(0, 7)
    );
  });

  const readinessScore = useMemo(() => {
    const recent = logs.find((log) => log.record_type === "READINESS");
    const items = recent?.checklist_items || {};
    const total = READINESS.length;
    const done = READINESS.filter((item) => items[item]).length;
    return total ? Math.round((done / total) * 100) : 0;
  }, [logs]);

  function handleTab(tab) {
    setActiveTab(tab);
    setSelectedLog(null);

    setForm({
      ...emptyForm,
      record_type: tab === "HISTORY" ? "READINESS" : tab,
      category: tab === "MAINTENANCE" ? maintenanceFrequency : "",
      status: tab === "READINESS" || tab === "SAFETY" ? "COMPLETED" : "OPEN",
    });
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

	function calculateScore() {
	  const list = checklistForTab();
	  if (!list.length) return "";

	  const completed = list.filter((item) => form.checklist_items?.[item]).length;
	  return Math.round((completed / list.length) * 100);
	}

  function toggleChecklist(item) {
    setForm((prev) => ({
      ...prev,
      checklist_items: {
        ...prev.checklist_items,
        [item]: !prev.checklist_items?.[item],
      },
    }));
  }

  function checklistForTab() {
    if (activeTab === "READINESS") return READINESS;
    if (activeTab === "SAFETY") return SAFETY;
    if (activeTab === "MAINTENANCE") return MAINTENANCE[maintenanceFrequency];
    return [];
  }

  function selectedCount() {
    return checklistForTab().filter((item) => form.checklist_items?.[item])
      .length;
  }

  function selectLog(log) {
    setSelectedLog(log);
    setActiveTab(log.record_type);

    setForm({
      ...emptyForm,
      ...log,
      log_date: log.log_date || today(),
      log_time: log.log_time || nowTime(),
      checklist_items: log.checklist_items || {},
      cost: log.cost || "",
      due_date: log.due_date || "",
      completed_date: log.completed_date || "",
    });
  }

	async function submitRecord(e) {
	  e.preventDefault();

	  const scoreValue = activeTab === "REPAIR" ? null : calculateScore();

	  const payload = {
		...form,

		record_type: activeTab === "HISTORY" ? form.record_type : activeTab,

		category:
		  activeTab === "MAINTENANCE" ? maintenanceFrequency : form.category,

		inspected_by: form.inspected_by || staffName,

		score: scoreValue,

		issue_found:
		  activeTab === "REPAIR"
			? true
			: checklistForTab().some((item) => !form.checklist_items?.[item]),

		metadata_json: {
		  ...(form.metadata_json || {}),
		  entered_by: staffName,
		  checklist_total: checklistForTab().length,
		  checklist_completed: selectedCount(),
		  checklist_score: scoreValue,
		  checklist_items: form.checklist_items || {},
		},
	  };

	  try {
		if (selectedLog?.id) {
		  await api.patch(
			`/facility-compliance/facility-maintenance-logs/${selectedLog.id}`,
			payload
		  );
		  setMessage("Facility record updated successfully.");
		} else {
		  await api.post(
			"/facility-compliance/facility-maintenance-logs",
			payload
		  );
		  setMessage("Facility record saved successfully.");
		}

		setSelectedLog(null);

		setForm({
		  ...emptyForm,
		  record_type: activeTab,
		  inspection_type:
			activeTab === "MAINTENANCE" ? maintenanceFrequency : "Daily",
		  inspected_by: staffName,
		  category: activeTab === "MAINTENANCE" ? maintenanceFrequency : "",
		  status:
			activeTab === "READINESS" || activeTab === "SAFETY"
			  ? "COMPLETED"
			  : "OPEN",
		});

		loadLogs();
	  } catch (err) {
		console.error(err);
		setMessage("Could not save facility record.");
	  }
	}

  function statusClass(status) {
    if (status === "COMPLETED") return "green";
    if (status === "NEEDS_REVIEW" || status === "IN_PROGRESS") return "orange";
    if (status === "CRITICAL" || status === "OVERDUE") return "red";
    return "blue";
  }

  return (
    <div className="facility-ops-page">
      <style>{`
        .facility-ops-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .ops-hero {
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
            linear-gradient(90deg, rgba(5,18,44,.98) 0%, rgba(30,64,175,.92) 45%, rgba(14,165,233,.34) 75%, rgba(14,165,233,.16) 100%),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
        }

        .ops-hero::before {
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

        .ops-hero h1 {
          margin: 0;
          max-width: 760px;
          font-size: clamp(46px, 5.3vw, 76px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .ops-hero p {
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
          border: 1px solid rgba(255,255,255,.22);
          color: rgba(255,255,255,.88);
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
          backdrop-filter: blur(12px);
        }

        .hero-metrics {
          width: 350px;
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

        .tabs {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .tab-btn {
          min-height: 74px;
          border-radius: 18px;
          border: 1px solid #dbeafe;
          background: white;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(15,23,42,.08);
        }

        .tab-btn.active {
          color: white;
          border-color: transparent;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
        }

        .ops-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(390px, .85fr);
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

        .form-field textarea {
          min-height: 128px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.55;
        }

        .check-section {
          grid-column: span 2;
          padding: 18px;
          border-radius: 20px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .check-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
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

        .choice-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
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

        .right-stack,
        .record-list {
          display: grid;
          gap: 14px;
        }

        .record-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 16px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
          cursor: pointer;
        }

        .record-card.warning {
          border-left-color: #dc2626;
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
          .ops-grid {
            grid-template-columns: 1fr;
          }

          .ops-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-metrics {
            width: 100%;
          }
        }

        @media (max-width: 820px) {
          .facility-ops-page {
            padding: 14px;
          }

          .form-grid,
          .choice-grid,
          .tabs {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .button-row,
          .check-section {
            grid-column: span 1;
          }

          .ops-hero {
            min-height: auto;
            padding: 28px;
          }

          .ops-hero h1 {
            font-size: 42px;
          }
        }
      `}</style>

      <section className="ops-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <Building2 size={18} />
            Facility Compliance
          </p>

          <h1>
            Facility Operations
            <br />
            Center
          </h1>

          <p>
            Manage facility readiness, routine maintenance, repairs, work
            orders, safety checks, corrective actions, and inspection readiness.
          </p>

          <div className="hero-actions">
            <span className="hero-pill">
              <ShieldCheck size={15} />
              Inspection Ready
            </span>
            <span className="hero-pill">
              <Wrench size={15} />
              Maintenance Tracking
            </span>
            <span className="hero-pill">
              <Activity size={15} />
              Readiness Score
            </span>
          </div>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{readinessScore}%</strong>
            <span>Readiness Score</span>
          </div>
          <div className="metric-card">
            <strong>{openRepairs.length}</strong>
            <span>Open Repairs</span>
          </div>
          <div className="metric-card">
            <strong>{criticalSafety.length}</strong>
            <span>Critical Safety</span>
          </div>
          <div className="metric-card">
            <strong>{completedThisMonth.length}</strong>
            <span>Completed This Month</span>
          </div>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <div className="tabs">
        {[
          ["READINESS", Building2, "Readiness"],
          ["MAINTENANCE", Wrench, "Maintenance"],
          ["REPAIR", Hammer, "Repairs"],
          ["SAFETY", ShieldCheck, "Safety"],
          ["HISTORY", CalendarDays, "History"],
        ].map(([key, Icon, label]) => (
          <button
            key={key}
            type="button"
            className={`tab-btn ${activeTab === key ? "active" : ""}`}
            onClick={() => handleTab(key)}
          >
            <Icon size={23} />
            {label}
          </button>
        ))}
      </div>

      {activeTab !== "HISTORY" && (
        <section className="ops-grid">
          <form className="premium-card" onSubmit={submitRecord}>
            <div className="card-header">
              <div>
                <p>{selectedLog ? "Update Record" : "New Record"}</p>
                <h2>
                  {activeTab === "READINESS" && "Facility Readiness"}
                  {activeTab === "MAINTENANCE" && "Maintenance Check"}
                  {activeTab === "REPAIR" && "Repair / Work Order"}
                  {activeTab === "SAFETY" && "Safety Check"}
                </h2>
              </div>
              <ClipboardCheck size={32} color="#2563eb" />
            </div>

            <div className="form-grid">
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
                  value={form.log_time || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>Area</label>
                <select
                  name="area_name"
                  value={form.area_name || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Area</option>
                  {AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {activeTab === "MAINTENANCE" && (
                <div className="form-field">
                  <label>Checklist Frequency</label>
                  <select
                    value={maintenanceFrequency}
                    onChange={(e) => {
                      setMaintenanceFrequency(e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                        checklist_items: {},
                      }));
                    }}
                  >
                    {Object.keys(MAINTENANCE).map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === "REPAIR" && (
                <>
                  <div className="form-field">
                    <label>Repair Category</label>
                    <select
                      name="category"
                      value={form.category || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {REPAIR_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field full">
                    <label>Repair Title</label>
                    <input
                      name="title"
                      value={form.title || ""}
                      onChange={handleChange}
                      placeholder="Example: Kitchen sink leak"
                    />
                  </div>

                  <div className="form-field full">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={form.description || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-field">
                    <label>Severity</label>
                    <select
                      name="severity"
                      value={form.severity || "LOW"}
                      onChange={handleChange}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Assigned To</label>
                    <input
                      name="assigned_to"
                      value={form.assigned_to || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-field">
                    <label>Vendor Name</label>
                    <input
                      name="vendor_name"
                      value={form.vendor_name || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-field">
                    <label>Cost</label>
                    <input
                      type="number"
                      name="cost"
                      value={form.cost || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-field">
                    <label>Due Date</label>
                    <input
                      type="date"
                      name="due_date"
                      value={form.due_date || ""}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {activeTab !== "REPAIR" && (
                <div className="check-section">
                  <div className="check-header">
                    <span className="section-label">Checklist</span>
                    <span className="selection-count">
                      {selectedCount()} / {checklistForTab().length} Complete
                    </span>
                  </div>

                  <div className="choice-grid">
                    {checklistForTab().map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`choice-pill ${
                          form.checklist_items?.[item] ? "active" : ""
                        }`}
                        onClick={() => toggleChecklist(item)}
                      >
                        <span className="choice-check">
                          <CheckCircle2 size={16} />
                        </span>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-field full">
                <label>Action Taken</label>
                <textarea
                  name="action_taken"
                  value={form.action_taken || ""}
                  onChange={handleChange}
                  placeholder="Document immediate action taken..."
                />
              </div>

              <div className="form-field full">
                <label>Corrective Action</label>
                <textarea
                  name="corrective_action"
                  value={form.corrective_action || ""}
                  onChange={handleChange}
                  placeholder="Document corrective action or follow-up plan..."
                />
              </div>

              <div className="form-field">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status || "OPEN"}
                  onChange={handleChange}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="NEEDS_REVIEW">Needs Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="form-field">
                <label>Signed By</label>
                <input value={staffName} readOnly />
              </div>

              <div className="button-row">
                <button className="primary-btn" type="submit">
                  <Save size={20} />
                  {selectedLog ? "Update Record" : "Save Record"}
                </button>

                <button className="secondary-btn" type="button" onClick={loadLogs}>
                  <RefreshCw size={20} />
                  Refresh
                </button>
              </div>
            </div>
          </form>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Recent Records</p>
                <h2>{activeTab}</h2>
              </div>
              <Clock size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {logs.filter((log) => log.record_type === activeTab).length ===
                0 && <div className="empty-state">No records found.</div>}

              {logs
                .filter((log) => log.record_type === activeTab)
                .slice(0, 12)
                .map((log) => (
                  <div
                    key={log.id}
                    className={`record-card ${
                      log.severity === "HIGH" || log.severity === "CRITICAL"
                        ? "warning"
                        : ""
                    }`}
                    onClick={() => selectLog(log)}
                  >
                    <strong>
                      {log.title ||
                        log.category ||
                        log.area_name ||
                        log.record_type}
                    </strong>

                    <p>
                      {log.area_name || "Facility"} ·{" "}
                      {log.log_date || "No date"}
                    </p>

                    <div className="chip-row">
                      <span className={`chip ${statusClass(log.status)}`}>
                        {log.status}
                      </span>
                      {log.severity && (
                        <span className="chip red">
                          <AlertTriangle size={12} />
                          {log.severity}
                        </span>
                      )}
                      <span className="chip">
                        <PenLine size={12} />
                        Signed
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </aside>
        </section>
      )}

      {activeTab === "HISTORY" && (
        <section className="premium-card">
          <div className="card-header">
            <div>
              <p>Inspection Timeline</p>
              <h2>Facility Operations History</h2>
            </div>
            <CalendarDays size={32} color="#2563eb" />
          </div>

          <div className="record-list">
            {logs.length === 0 && (
              <div className="empty-state">No facility records found.</div>
            )}

            {logs.map((log) => (
              <div
                key={log.id}
                className={`record-card ${
                  log.severity === "HIGH" || log.severity === "CRITICAL"
                    ? "warning"
                    : ""
                }`}
                onClick={() => selectLog(log)}
              >
                <strong>
                  {log.title || log.category || log.area_name || log.record_type}
                </strong>

                <p>
                  {log.record_type} · {log.area_name || "Facility"} ·{" "}
                  {log.log_date || "No date"}
                </p>

                <div className="chip-row">
                  <span className={`chip ${statusClass(log.status)}`}>
                    {log.status}
                  </span>
                  <span className="chip">
                    <CalendarDays size={12} />
                    {log.created_at?.slice(0, 10) || "No date"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}