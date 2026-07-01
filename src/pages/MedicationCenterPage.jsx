import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pill,
  ClipboardCheck,
  AlertTriangle,
  Save,
  RefreshCw,
  Clock,
  XCircle,
  Package,
  FileText,
  PenLine,
  UserCheck,
  Activity,
  ShieldCheck,
  PlusCircle,
  Eraser,
  Search,
  UsersRound,
  HeartPulse,
  Bell,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);
const nowDateTime = () => new Date().toISOString().slice(0, 16);

const emptyOrder = {
  resident_id: "",
  medication_name: "",
  dosage: "",
  route: "",
  frequency: "",
  start_date: today(),
  end_date: "",
  scheduled_times: [],
  prescriber_name: "",
  pharmacy_name: "",
  diagnosis_reason: "",
  instructions: "",
  is_prn: false,
  prn_reason: "",
  requires_consent: false,
  status: "ACTIVE",
  is_active: true,
};

const emptyPass = {
  resident_id: "",
  medication_order_id: "",
  scheduled_datetime: nowDateTime(),
  administered_datetime: nowDateTime(),
  administration_status: "GIVEN",
  dose_given: "",
  route: "",
  notes: "",
  refusal_reason: "",
  action_taken: "",
  provider_notified: "NO",
  guardian_notified: "NO",
  resident_signature: "",
  resident_acknowledged: false,
  acknowledgement_method: "SIGNATURE",
  acknowledgement_notes: "",
};

const emptyInventory = {
  resident_id: "",
  medication_order_id: "",
  medication_name: "",
  strength: "",
  dosage_form: "",
  quantity_on_hand: 0,
  reorder_threshold: 5,
  pharmacy_name: "",
  prescription_number: "",
  lot_number: "",
  expiration_date: "",
  last_refill_date: "",
  next_refill_due_date: "",
  is_controlled_substance: false,
  storage_location: "",
  status: "ACTIVE",
  notes: "",
};

const emptyTask = {
  resident_id: "",
  medication_order_id: "",
  inventory_id: "",
  task_type: "REORDER",
  title: "",
  description: "",
  priority: "MEDIUM",
  due_date: today(),
  due_time: "",
  status: "OPEN",
};

export default function MedicationCenterPage() {
  const [activeTab, setActiveTab] = useState("DASHBOARD");
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [residents, setResidents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [emar, setEmar] = useState([]);
  const [refusals, setRefusals] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState("");

  const [orderForm, setOrderForm] = useState(emptyOrder);
  const [passForm, setPassForm] = useState(emptyPass);
  const [inventoryForm, setInventoryForm] = useState(emptyInventory);
  const [taskForm, setTaskForm] = useState(emptyTask);

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const residentQuery = selectedResidentId ? `?resident_id=${selectedResidentId}` : "";

  async function loadAll() {
    try {
      const [
        dashboardRes,
        residentsRes,
        ordersRes,
        emarRes,
        refusalsRes,
        inventoryRes,
        tasksRes,
        alertsRes,
      ] = await Promise.all([
        api.get(`/medications/dashboard${residentQuery}`),
        api.get("/residents"),
        api.get(`/medications/orders${residentQuery}`),
        api.get(`/medications/emar${residentQuery}`),
        api.get(`/medications/refusals${residentQuery}`),
        api.get(`/medications/inventory${residentQuery}`),
        api.get("/medications/tasks"),
        api.get("/medications/reorder-alerts"),
      ]);

      setDashboard(dashboardRes.data);
      setResidents(residentsRes.data || []);
      setOrders(ordersRes.data || []);
      setEmar(emarRes.data || []);
      setRefusals(refusalsRes.data || []);
      setInventory(inventoryRes.data || []);
      setTasks(tasksRes.data || []);
      setAlerts(alertsRes.data || []);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Could not load Medication Center.");
    }
  }

  useEffect(() => {
    loadAll();
  }, [selectedResidentId]);

  const activeOrders = orders.filter((o) => o.status === "ACTIVE");

  const selectedResident = residents.find(
    (r) => String(r.id) === String(selectedResidentId)
  );

  const residentSummary = dashboard?.resident_medication_summary || [];

  const filteredAlerts = selectedResidentId
    ? alerts.filter((a) => String(a.resident_id) === String(selectedResidentId))
    : alerts;

  const filteredTasks = selectedResidentId
    ? tasks.filter((t) => String(t.resident_id) === String(selectedResidentId))
    : tasks;

	function getResidentName(id) {
	  const resident = residents.find((r) => String(r.id) === String(id));

	  if (!resident) return "Resident";

	  return `${resident.first_name || ""} ${resident.last_name || ""}`.trim();
	}

  function getOrderLabel(order) {
    if (!order) return "";
    return `${order.medication_name || ""} ${order.dosage || ""}`.trim();
  }

  function handleOrderChange(e) {
    const { name, value, type, checked } = e.target;
    setOrderForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handlePassChange(e) {
    const { name, value, type, checked } = e.target;

    if (name === "medication_order_id") {
      const order = orders.find((o) => String(o.id) === String(value));
      setPassForm((prev) => ({
        ...prev,
        medication_order_id: value,
        resident_id: order?.resident_id || prev.resident_id,
        dose_given: order?.dosage || "",
        route: order?.route || "",
      }));
      return;
    }

    setPassForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleInventoryChange(e) {
    const { name, value, type, checked } = e.target;

    if (name === "medication_order_id") {
      const order = orders.find((o) => String(o.id) === String(value));
      setInventoryForm((prev) => ({
        ...prev,
        medication_order_id: value,
        resident_id: order?.resident_id || prev.resident_id,
        medication_name: order?.medication_name || prev.medication_name,
        pharmacy_name: order?.pharmacy_name || prev.pharmacy_name,
      }));
      return;
    }

    setInventoryForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleTaskChange(e) {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submitOrder(e) {
    e.preventDefault();

    try {
      await api.post("/medications/orders", orderForm);
      setMessage("Medication order saved.");
      setOrderForm(emptyOrder);
      loadAll();
    } catch (err) {
      console.error(err);
      setMessage("Could not save medication order.");
    }
  }

  async function submitMedicationPass(e) {
    e.preventDefault();

    const payload = {
      ...passForm,
      metadata_json: {
        resident_signature: passForm.resident_signature,
        resident_acknowledged: Boolean(passForm.resident_signature),
      },
    };

    try {
      await api.post("/medications/emar/pass", payload);
      setMessage("Medication pass completed.");
      setPassForm(emptyPass);
      clearSignature();
      loadAll();
    } catch (err) {
      console.error(err);
      setMessage("Could not complete medication pass.");
    }
  }

  async function submitInventory(e) {
    e.preventDefault();

    try {
      await api.post("/medications/inventory", inventoryForm);
      setMessage("Medication inventory saved.");
      setInventoryForm(emptyInventory);
      loadAll();
    } catch (err) {
      console.error(err);
      setMessage("Could not save medication inventory.");
    }
  }

  async function submitTask(e) {
    e.preventDefault();

    try {
      await api.post("/medications/tasks", taskForm);
      setMessage("Medication task saved.");
      setTaskForm(emptyTask);
      loadAll();
    } catch (err) {
      console.error(err);
      setMessage("Could not save medication task.");
    }
  }

  function startDraw(e) {
    drawingRef.current = true;
    draw(e);
  }

  function endDraw() {
    drawingRef.current = false;
    const canvas = canvasRef.current;

    if (canvas) {
      setPassForm((prev) => ({
        ...prev,
        resident_signature: canvas.toDataURL("image/png"),
        resident_acknowledged: true,
        acknowledgement_method: "SIGNATURE",
      }));
    }
  }

  function draw(e) {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    setPassForm((prev) => ({
      ...prev,
      resident_signature: "",
      resident_acknowledged: false,
    }));
  }

  function statusClass(status) {
    if (["GIVEN", "ADMINISTERED", "COMPLETED", "ACTIVE"].includes(status))
      return "green";
    if (["OPEN", "SCHEDULED", "PENDING"].includes(status)) return "orange";
    return "red";
  }

  return (
    <div className="med-page">
      <style>{`
        .med-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .med-hero {
          min-height: 390px;
          border-radius: 28px;
          padding: 44px;
          margin-bottom: 22px;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 34px;
          background:
            linear-gradient(90deg, rgba(5,18,44,.98), rgba(30,64,175,.92), rgba(14,165,233,.25)),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
        }

        .med-hero::before {
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
          color: #7dd3fc;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .med-hero h1 {
          margin: 0;
          font-size: clamp(46px, 5.3vw, 76px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .med-hero p {
          max-width: 820px;
          margin: 20px 0 0;
          color: rgba(255,255,255,.9);
          font-size: 18px;
          line-height: 1.65;
          font-weight: 650;
        }

        .hero-metrics {
          width: 360px;
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
          margin-bottom: 18px;
          border-radius: 22px;
          padding: 18px;
          background: rgba(255,255,255,.92);
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
          flex-shrink: 0;
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
          min-width: 290px;
          min-height: 56px;
          border-radius: 16px;
          border: 1px solid #bfdbfe;
          background: white;
          padding: 0 16px;
          color: #071735;
          font-size: 15px;
          font-weight: 900;
          outline: none;
          box-shadow: 0 8px 20px rgba(15,23,42,.04);
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
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
          gap: 10px;
          padding: 0 14px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(15,23,42,.08);
        }

        .tab-btn.active {
          color: white;
          border-color: transparent;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
        }

        .grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(380px, .9fr);
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

        .form-field label {
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

        .toggle-row {
          grid-column: span 2;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border: 1px solid #dbeafe;
          background: #f8fbff;
          border-radius: 16px;
          font-weight: 900;
          color: #334155;
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
          box-shadow: 0 16px 32px rgba(15,118,110,.22);
        }

        .secondary-btn {
          color: #071735;
          background: white;
          border: 1px solid #cfe0f7;
        }

        .record-list,
        .dash-grid,
        .resident-summary-grid {
          display: grid;
          gap: 14px;
        }

        .dash-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          margin-bottom: 24px;
        }

        .resident-summary-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .dash-card,
        .record-card,
        .resident-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 18px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .dash-card strong {
          display: block;
          font-size: 32px;
          color: #071735;
          line-height: 1;
          letter-spacing: -.05em;
        }

        .dash-card span {
          display: block;
          margin-top: 7px;
          color: #64748b;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .07em;
        }

        .resident-card {
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .resident-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(15,23,42,.12);
        }

        .resident-card.active {
          border-left-color: #0f766e;
          background: linear-gradient(135deg, #ffffff, #ecfdf5);
        }

        .resident-card strong,
        .record-card strong {
          display: block;
          font-size: 17px;
          color: #071735;
        }

        .resident-card p,
        .record-card p {
          margin: 8px 0 0;
          color: #64748b;
          font-weight: 750;
          line-height: 1.45;
        }

        .record-card.red,
        .resident-card.red { border-left-color: #dc2626; }

        .record-card.orange,
        .resident-card.orange { border-left-color: #f59e0b; }

        .record-card.green,
        .resident-card.green { border-left-color: #047857; }

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

        .signature-box {
          grid-column: span 2;
          padding: 18px;
          border-radius: 20px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .signature-title {
          margin: 0 0 10px;
          color: #1e3a8a;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .07em;
          font-size: 13px;
        }

        .signature-pad {
          width: 100%;
          height: 190px;
          border-radius: 16px;
          background: white;
          border: 2px dashed #93c5fd;
          touch-action: none;
        }

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
          .grid { grid-template-columns: 1fr; }
          .med-hero { flex-direction: column; align-items: flex-start; }
          .hero-metrics { width: 100%; }
          .dash-grid,
          .resident-summary-grid { grid-template-columns: repeat(2, 1fr); }
          .tabs { grid-template-columns: repeat(2, 1fr); }
          .resident-filter-card { flex-direction: column; align-items: stretch; }
          .filter-controls { width: 100%; }
          .resident-select { width: 100%; }
        }

        @media (max-width: 820px) {
          .med-page { padding: 14px; }
          .form-grid,
          .dash-grid,
          .resident-summary-grid,
          .tabs { grid-template-columns: 1fr; }
          .form-field.full,
          .button-row,
          .signature-box,
          .toggle-row { grid-column: span 1; }
          .med-hero { min-height: auto; padding: 28px; }
          .med-hero h1 { font-size: 42px; }
        }
      `}</style>

      <section className="med-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <Pill size={18} />
            Medication Management
          </p>

          <h1>
            Medication
            <br />
            Center
          </h1>

          <p>
            Resident-based medication dashboard for orders, eMAR passes,
            touchscreen resident signatures, refusals, inventory, reorder alerts,
            PRN tracking, and medication tasks.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{dashboard?.due_now ?? 0}</strong>
            <span>Due Now</span>
          </div>
          <div className="metric-card">
            <strong>{dashboard?.passes_completed_today ?? 0}</strong>
            <span>Completed Today</span>
          </div>
          <div className="metric-card">
            <strong>{dashboard?.refusals_today ?? 0}</strong>
            <span>Refusals Today</span>
          </div>
          <div className="metric-card">
            <strong>{dashboard?.low_stock_count ?? 0}</strong>
            <span>Reorder Alerts</span>
          </div>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <div className="resident-filter-card">
        <div className="filter-left">
          <div className="filter-icon">
            <UsersRound size={24} />
          </div>
          <div>
            <p className="filter-title">
              {selectedResident
                ? `${selectedResident.full_name || selectedResident.name}`
                : "All Residents"}
            </p>
            <p className="filter-subtitle">
              Daily medication activity is resident-based. Select a resident to
              view only their medication orders, passes, inventory, tasks, and alerts.
            </p>
          </div>
        </div>

        <div className="filter-controls">
          <select
            className="resident-select"
            value={selectedResidentId}
            onChange={(e) => setSelectedResidentId(e.target.value)}
          >
            <option value="">All Residents</option>
            {residents.map((resident) => (
              <option key={resident.id} value={resident.id}>
                {resident.full_name || resident.name}
              </option>
            ))}
          </select>

          <button type="button" className="secondary-btn" onClick={loadAll}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="tabs">
        {[
          ["DASHBOARD", Activity, "Dashboard"],
          ["ORDERS", FileText, "Orders"],
          ["EMAR", ClipboardCheck, "eMAR Pass"],
          ["INVENTORY", Package, "Inventory"],
          ["REFUSALS", XCircle, "Refusals"],
          ["TASKS", AlertTriangle, "Tasks"],
        ].map(([key, Icon, label]) => (
          <button
            key={key}
            type="button"
            className={`tab-btn ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={22} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "DASHBOARD" && (
        <section className="premium-card">
          <div className="card-header">
            <div>
              <p>Resident Medication Dashboard</p>
              <h2>Today’s Medication Operations</h2>
            </div>
            <ShieldCheck size={32} color="#2563eb" />
          </div>

          <div className="dash-grid">
            <div className="dash-card">
              <strong>{dashboard?.active_orders ?? 0}</strong>
              <span>Active Orders</span>
            </div>
            <div className="dash-card">
              <strong>{dashboard?.due_now ?? 0}</strong>
              <span>Due Now</span>
            </div>
            <div className="dash-card">
              <strong>{dashboard?.missed_today ?? 0}</strong>
              <span>Missed Today</span>
            </div>
            <div className="dash-card">
              <strong>{dashboard?.prn_today ?? 0}</strong>
              <span>PRN Today</span>
            </div>
            <div className="dash-card">
              <strong>{dashboard?.low_stock_count ?? 0}</strong>
              <span>Low Stock</span>
            </div>
            <div className="dash-card">
              <strong>{dashboard?.expiring_30_days ?? 0}</strong>
              <span>Expiring 30 Days</span>
            </div>
            <div className="dash-card">
              <strong>{dashboard?.open_tasks ?? 0}</strong>
              <span>Open Tasks</span>
            </div>
            <div className="dash-card">
              <strong>{emar.length}</strong>
              <span>Total eMAR</span>
            </div>
          </div>

          <div className="card-header" style={{ marginTop: 10 }}>
            <div>
              <p>Resident Daily Pass Summary</p>
              <h2>Resident Medication Status</h2>
            </div>
            <HeartPulse size={32} color="#2563eb" />
          </div>

          <div className="resident-summary-grid">
            {residentSummary.length === 0 && (
              <div className="empty-state">No medication passes scheduled today.</div>
            )}

            {residentSummary.map((item) => {
              const hasRisk = item.missed > 0 || item.refused > 0 || item.held > 0;
              return (
                <div
                  key={item.resident_id}
                  className={`resident-card ${
                    selectedResidentId === item.resident_id
                      ? "active"
                      : hasRisk
                      ? "orange"
                      : "green"
                  }`}
                  onClick={() => setSelectedResidentId(item.resident_id)}
                >
                  <strong>{item.resident_name || getResidentName(item.resident_id)}</strong>
                  <p>
                    Scheduled: {item.scheduled} · Due Now: {item.due_now || 0}
                  </p>
                  <div className="chip-row">
                    <span className="chip green">
                      <CheckCircle2 size={12} />
                      Given {item.given}
                    </span>
                    <span className="chip red">Missed {item.missed}</span>
                    <span className="chip orange">Refused {item.refused}</span>
                    <span className="chip">Held {item.held}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "ORDERS" && (
        <section className="grid">
          <form className="premium-card" onSubmit={submitOrder}>
            <div className="card-header">
              <div>
                <p>Medication Order</p>
                <h2>New Resident Order</h2>
              </div>
              <PlusCircle size={32} color="#2563eb" />
            </div>

            <div className="form-grid">
              <div className="form-field full">
                <label>Resident</label>
                <select
                  name="resident_id"
                  value={orderForm.resident_id}
                  onChange={handleOrderChange}
                  required
                >
                  <option value="">Select Resident</option>
					{residents.map((resident) => (
					  <option key={resident.id} value={resident.id}>
						{`${resident.first_name || ""} ${resident.last_name || ""}`.trim()}
					  </option>
					))}
                </select>
              </div>

              {[
                "medication_name",
                "dosage",
                "route",
                "frequency",
                "prescriber_name",
                "pharmacy_name",
              ].map((name) => (
                <div className="form-field" key={name}>
                  <label>{name.replaceAll("_", " ")}</label>
                  <input
                    name={name}
                    value={orderForm[name]}
                    onChange={handleOrderChange}
                    required={["medication_name", "dosage"].includes(name)}
                  />
                </div>
              ))}

              <div className="form-field">
                <label>Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={orderForm.start_date}
                  onChange={handleOrderChange}
                />
              </div>

              <div className="form-field">
                <label>End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={orderForm.end_date}
                  onChange={handleOrderChange}
                />
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  name="is_prn"
                  checked={orderForm.is_prn}
                  onChange={handleOrderChange}
                />
                PRN Medication
              </label>

              <div className="form-field full">
                <label>Instructions</label>
                <textarea
                  name="instructions"
                  value={orderForm.instructions}
                  onChange={handleOrderChange}
                />
              </div>

              <div className="button-row">
                <button className="primary-btn">
                  <Save size={20} />
                  Save Order
                </button>
              </div>
            </div>
          </form>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Resident Medication List</p>
                <h2>Medication Orders</h2>
              </div>
              <Pill size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {orders.length === 0 && (
                <div className="empty-state">No medication orders found.</div>
              )}

              {orders.map((o) => (
                <div className="record-card" key={o.id}>
                  <strong>{getOrderLabel(o)}</strong>
                  <p>
                    {getResidentName(o.resident_id)} ·{" "}
                    {o.frequency || "No frequency"}
                  </p>
                  <div className="chip-row">
                    <span className={`chip ${statusClass(o.status)}`}>
                      {o.status}
                    </span>
                    {o.is_prn && <span className="chip orange">PRN</span>}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}

      {activeTab === "EMAR" && (
        <section className="grid">
          <form className="premium-card" onSubmit={submitMedicationPass}>
            <div className="card-header">
              <div>
                <p>Resident Medication Pass</p>
                <h2>eMAR Administration</h2>
              </div>
              <UserCheck size={32} color="#2563eb" />
            </div>

            <div className="form-grid">
              <div className="form-field full">
                <label>Medication Order</label>
                <select
                  name="medication_order_id"
                  value={passForm.medication_order_id}
                  onChange={handlePassChange}
                  required
                >
                  <option value="">Select Medication</option>
                  {activeOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {getResidentName(o.resident_id)} · {getOrderLabel(o)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Scheduled Time</label>
                <input
                  type="datetime-local"
                  name="scheduled_datetime"
                  value={passForm.scheduled_datetime}
                  onChange={handlePassChange}
                />
              </div>

              <div className="form-field">
                <label>Actual Time</label>
                <input
                  type="datetime-local"
                  name="administered_datetime"
                  value={passForm.administered_datetime}
                  onChange={handlePassChange}
                />
              </div>

              <div className="form-field">
                <label>Status</label>
                <select
                  name="administration_status"
                  value={passForm.administration_status}
                  onChange={handlePassChange}
                >
                  <option value="GIVEN">Given</option>
                  <option value="REFUSED">Refused</option>
                  <option value="HELD">Held</option>
                  <option value="MISSED">Missed</option>
                  <option value="PRN_GIVEN">PRN Given</option>
                </select>
              </div>

              <div className="form-field">
                <label>Dose Given</label>
                <input
                  name="dose_given"
                  value={passForm.dose_given}
                  onChange={handlePassChange}
                />
              </div>

              <div className="form-field">
                <label>Route</label>
                <input
                  name="route"
                  value={passForm.route}
                  onChange={handlePassChange}
                />
              </div>

              {passForm.administration_status === "REFUSED" && (
                <div className="form-field full">
                  <label>Refusal Reason</label>
                  <textarea
                    name="refusal_reason"
                    value={passForm.refusal_reason}
                    onChange={handlePassChange}
                  />
                </div>
              )}

              <div className="signature-box">
                <p className="signature-title">Resident Touchscreen Signature</p>
                <canvas
                  ref={canvasRef}
                  width={900}
                  height={220}
                  className="signature-pad"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />

                <div className="button-row">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={clearSignature}
                  >
                    <Eraser size={18} />
                    Clear Signature
                  </button>
                </div>
              </div>

              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={passForm.notes}
                  onChange={handlePassChange}
                />
              </div>

              <div className="button-row">
                <button className="primary-btn">
                  <Save size={20} />
                  Complete Medication Pass
                </button>
              </div>
            </div>
          </form>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Today</p>
                <h2>Resident eMAR</h2>
              </div>
              <Clock size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {emar.length === 0 && (
                <div className="empty-state">No eMAR records found.</div>
              )}

              {emar.slice(0, 15).map((x) => (
                <div className="record-card" key={x.id}>
                  <strong>{getResidentName(x.resident_id)}</strong>
                  <p>
                    {x.dose_given || "Dose"} ·{" "}
                    {x.scheduled_datetime || x.administered_datetime}
                  </p>

                  <div className="chip-row">
                    <span className={`chip ${statusClass(x.administration_status)}`}>
                      {x.administration_status}
                    </span>

                    {x.metadata_json?.resident_acknowledged && (
                      <span className="chip green">
                        <PenLine size={12} />
                        Resident Signed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}

      {activeTab === "INVENTORY" && (
        <section className="grid">
          <form className="premium-card" onSubmit={submitInventory}>
            <div className="card-header">
              <div>
                <p>Resident Medication Inventory</p>
                <h2>Add Medication Stock</h2>
              </div>
              <Package size={32} color="#2563eb" />
            </div>

            <div className="form-grid">
              <div className="form-field full">
                <label>Medication Order</label>
                <select
                  name="medication_order_id"
                  value={inventoryForm.medication_order_id}
                  onChange={handleInventoryChange}
                >
                  <option value="">Optional</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {getResidentName(o.resident_id)} · {getOrderLabel(o)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Medication Name</label>
                <input
                  name="medication_name"
                  value={inventoryForm.medication_name}
                  onChange={handleInventoryChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity_on_hand"
                  value={inventoryForm.quantity_on_hand}
                  onChange={handleInventoryChange}
                />
              </div>

              <div className="form-field">
                <label>Reorder Threshold</label>
                <input
                  type="number"
                  name="reorder_threshold"
                  value={inventoryForm.reorder_threshold}
                  onChange={handleInventoryChange}
                />
              </div>

              <div className="form-field">
                <label>Pharmacy</label>
                <input
                  name="pharmacy_name"
                  value={inventoryForm.pharmacy_name}
                  onChange={handleInventoryChange}
                />
              </div>

              <div className="form-field">
                <label>Rx Number</label>
                <input
                  name="prescription_number"
                  value={inventoryForm.prescription_number}
                  onChange={handleInventoryChange}
                />
              </div>

              <div className="form-field">
                <label>Expiration Date</label>
                <input
                  type="date"
                  name="expiration_date"
                  value={inventoryForm.expiration_date}
                  onChange={handleInventoryChange}
                />
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  name="is_controlled_substance"
                  checked={inventoryForm.is_controlled_substance}
                  onChange={handleInventoryChange}
                />
                Controlled Substance
              </label>

              <div className="button-row">
                <button className="primary-btn">
                  <Save size={20} />
                  Save Inventory
                </button>
              </div>
            </div>
          </form>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Resident Stock</p>
                <h2>Medication Inventory</h2>
              </div>
              <Package size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {inventory.length === 0 && (
                <div className="empty-state">No medication inventory found.</div>
              )}

              {inventory.map((x) => {
                const low =
                  Number(x.quantity_on_hand || 0) <=
                  Number(x.reorder_threshold || 0);

                return (
                  <div
                    className={`record-card ${low ? "red" : "green"}`}
                    key={x.id}
                  >
                    <strong>{x.medication_name}</strong>
                    <p>
                      {getResidentName(x.resident_id)} · Qty:{" "}
                      {x.quantity_on_hand}
                    </p>

                    <div className="chip-row">
                      <span className={`chip ${low ? "red" : "green"}`}>
                        {low ? "Reorder" : "Good"}
                      </span>

                      {x.is_controlled_substance && (
                        <span className="chip orange">Controlled</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      )}

      {activeTab === "REFUSALS" && (
        <section className="premium-card">
          <div className="card-header">
            <div>
              <p>Resident Refusals</p>
              <h2>Medication Refusal Log</h2>
            </div>
            <XCircle size={32} color="#2563eb" />
          </div>

          <div className="record-list">
            {refusals.length === 0 && (
              <div className="empty-state">No medication refusals found.</div>
            )}

            {refusals.map((x) => (
              <div className="record-card orange" key={x.id}>
                <strong>{x.medication_name}</strong>
                <p>
                  {getResidentName(x.resident_id)} ·{" "}
                  {x.refusal_reason || "No reason recorded"}
                </p>

                <div className="chip-row">
                  <span className="chip orange">{x.status}</span>
                  <span className="chip">{x.refusal_datetime}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "TASKS" && (
        <section className="grid">
          <form className="premium-card" onSubmit={submitTask}>
            <div className="card-header">
              <div>
                <p>Medication Task</p>
                <h2>Create Follow-Up Task</h2>
              </div>
              <AlertTriangle size={32} color="#2563eb" />
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Type</label>
                <select
                  name="task_type"
                  value={taskForm.task_type}
                  onChange={handleTaskChange}
                >
                  <option value="REORDER">Reorder</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="PROVIDER_NOTIFY">Provider Notify</option>
                  <option value="PHARMACY_CALL">Pharmacy Call</option>
                  <option value="INVENTORY_CHECK">Inventory Check</option>
                </select>
              </div>

              <div className="form-field">
                <label>Priority</label>
                <select
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleTaskChange}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="form-field full">
                <label>Title</label>
                <input
                  name="title"
                  value={taskForm.title}
                  onChange={handleTaskChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={taskForm.due_date}
                  onChange={handleTaskChange}
                />
              </div>

              <div className="form-field">
                <label>Due Time</label>
                <input
                  type="time"
                  name="due_time"
                  value={taskForm.due_time}
                  onChange={handleTaskChange}
                />
              </div>

              <div className="form-field full">
                <label>Description</label>
                <textarea
                  name="description"
                  value={taskForm.description}
                  onChange={handleTaskChange}
                />
              </div>

              <div className="button-row">
                <button className="primary-btn">
                  <Save size={20} />
                  Save Task
                </button>
              </div>
            </div>
          </form>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Alerts</p>
                <h2>Tasks & Reorders</h2>
              </div>
              <Bell size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {filteredAlerts.map((a, i) => (
                <div className="record-card red" key={i}>
                  <strong>{a.medication_name}</strong>
                  <p>{a.message}</p>
                  <div className="chip-row">
                    <span className="chip red">{a.severity}</span>
                    <span className="chip">Qty {a.quantity_on_hand}</span>
                  </div>
                </div>
              ))}

              {filteredTasks.map((t) => (
                <div className="record-card orange" key={t.id}>
                  <strong>{t.title}</strong>
                  <p>
                    {t.task_type} · Due: {t.due_date || "No due date"}
                  </p>
                  <div className="chip-row">
                    <span className={`chip ${statusClass(t.status)}`}>
                      {t.status}
                    </span>
                    <span className="chip orange">{t.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}