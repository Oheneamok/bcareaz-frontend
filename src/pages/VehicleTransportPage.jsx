import React, { useEffect, useMemo, useState } from "react";
import {
  Car,
  Save,
  RefreshCw,
  CalendarDays,
  Clock,
  MapPin,
  Gauge,
  ShieldCheck,
  PenLine,
  Wrench,
  CheckCircle2,
  UsersRound,
  PlusCircle,
  ClipboardCheck,
  FileText,
  Printer,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const PURPOSES = [
  "Medical Appointment",
  "Behavioral Health Appointment",
  "Pharmacy",
  "Grocery Shopping",
  "Community Activity",
  "Employment",
  "Court",
  "Family Visit",
  "Recreation",
  "Hospital",
  "Laboratory",
  "Other",
];

const FUEL_LEVELS = ["Full", "3/4", "1/2", "1/4", "Low"];

const PRE_TRIP = [
  "Tires",
  "Lights",
  "Mirrors",
  "Horn",
  "Brakes",
  "Seat Belts",
  "Fuel Level OK",
  "Windshield",
  "Registration",
  "Insurance",
  "First Aid Kit",
  "Fire Extinguisher",
  "Vehicle Clean",
];

const POST_TRIP = [
  "Vehicle Returned Clean",
  "Fuel Added",
  "Damage Found",
  "Maintenance Needed",
  "Accident",
  "Resident Complaint",
];

const SERVICE_TYPES = [
  "Monthly Maintenance Checklist",
  "Oil Change",
  "Tire Rotation",
  "Brake Inspection",
  "Battery",
  "Air Filter",
  "Alignment",
  "Registration",
  "Insurance",
  "General Inspection",
  "Repair",
  "Other",
];

const MONTHLY_VEHICLE_INSPECTION_ITEMS = [
  "Safety Belts",
  "Brakes / Steering",
  "Engine",
  "Transmission",
  "Heater / Air Conditioning",
  "Turn Signals",
  "Brake Lights / Tail Cover",
  "Door Locks Working",
  "Windows / Windshield - Any cracks",
  "Radio",
  "Horn",
  "Tires - Inflated to manufacturer recommendations",
  "Tires - Recommended tire tread",
  "Fire Extinguisher",
  "First Aid Kit - Large enough to serve all passengers",
  "First Aid Kit - 1 gal reusable plastic bag",
  "First Aid Kit - 1 pair of scissors",
  "Fluid Level - Radiator",
  "Fluid Level - Windshield washer",
  "Fluid Level - Brake oil",
  "Fluid Level - Transmission fluid",
  "Fluid Level - Power steering",
  "Fluid Level - Oil",
  "Mirrors - Side mirrors",
  "Mirrors - Rear view mirror",
];

const emptyTransport = {
  resident_id: "",
  resident_name: "",
  driver_staff_id: "",
  transport_date: today(),
  departure_time: nowTime(),
  expected_return_time: "",
  return_time: "",
  vehicle_id: "",
  vehicle_name: "",
  destination: "",
  purpose: "",
  mileage_out: "",
  mileage_in: "",
  status: "IN_TRANSIT",
  notes: "",
  signed_by_user_id: "",
  signed_by_staff_id: "",
  pre_trip: {},
  post_trip: {},
  fuel_level_start: "",
  fuel_level_end: "",
  driver_name: "",
  staff_signature: "",
};

const emptyVehicle = {
  vehicle_name: "",
  vehicle_make: "",
  vehicle_model: "",
  vehicle_year: "",
  vin: "",
  license_plate: "",
  fuel_type: "",
  capacity: "",
  insurance_company: "",
  policy_number: "",
  insurance_expiration_date: "",
  registration_number: "",
  registration_expiration_date: "",
  current_odometer: "",
  status: "ACTIVE",
  notes: "",
};

const emptyMaintenance = {
  vehicle_name: "",
  vin: "",
  license_plate: "",
  service_date: today(),
  checked_by: "",
  odometer: "",
  service_type: "Monthly Maintenance Checklist",
  checklist_items: {},
  next_service_due_date: "",
  insurance_expiration_date: "",
  registration_expiration_date: "",
  vendor_name: "",
  issues_found: "",
  corrective_actions: "",
  signature: "",
  signature_date: today(),
  status: "COMPLETED",
};

export default function VehicleTransportPage() {
  const [activeTab, setActiveTab] = useState("TRANSPORT");
  const [residents, setResidents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [transportLogs, setTransportLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedOpenTrip, setSelectedOpenTrip] = useState(null);
  const [message, setMessage] = useState("");

  const staffName =
    currentUser?.full_name || currentUser?.name || currentUser?.email || "";

  const [transportForm, setTransportForm] = useState(emptyTransport);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [maintenanceForm, setMaintenanceForm] = useState(emptyMaintenance);

  async function loadCurrentUser() {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data);

      const name =
        res.data?.full_name || res.data?.name || res.data?.email || "";

      setTransportForm((prev) => ({
        ...prev,
        staff_signature: name,
      }));

      setMaintenanceForm((prev) => ({
        ...prev,
        checked_by: name,
        signature: name,
      }));
    } catch (err) {
      console.error(err);
    }
  }

  async function loadResidents() {
    try {
      const res = await api.get("/residents");
      setResidents(res.data || []);
    } catch {
      setResidents([]);
    }
  }

  async function loadVehicles() {
    try {
      const res = await api.get("/facility-compliance/vehicles");
      setVehicles(res.data || []);
    } catch {
      setVehicles([]);
    }
  }

  async function loadTransportLogs() {
    try {
      const res = await api.get("/facility-compliance/transport-logs");
      setTransportLogs(res.data || []);
    } catch {
      setTransportLogs([]);
    }
  }

  async function loadMaintenanceLogs() {
    try {
      const res = await api.get("/facility-compliance/vehicle-maintenance");
      setMaintenanceLogs(res.data || []);
    } catch {
      setMaintenanceLogs([]);
    }
  }

  useEffect(() => {
    loadCurrentUser();
    loadResidents();
    loadVehicles();
    loadTransportLogs();
    loadMaintenanceLogs();
  }, []);

  const activeTrips = useMemo(() => {
    return transportLogs.filter((log) =>
      ["OPEN", "IN_TRANSIT", "OVERDUE"].includes(log.status)
    );
  }, [transportLogs]);

  const tripsToday = useMemo(() => {
    return transportLogs.filter((log) => log.transport_date === today());
  }, [transportLogs]);

  const mileageToday = useMemo(() => {
    return tripsToday.reduce((sum, log) => {
      const out = Number(log.mileage_out || 0);
      const inn = Number(log.mileage_in || 0);
      return sum + Math.max(inn - out, 0);
    }, 0);
  }, [tripsToday]);

  const maintenanceDue = useMemo(() => {
    const now = new Date();

    return vehicles.filter((vehicle) => {
      const insurance = vehicle.insurance_expiration_date
        ? new Date(vehicle.insurance_expiration_date)
        : null;
      const registration = vehicle.registration_expiration_date
        ? new Date(vehicle.registration_expiration_date)
        : null;

      return (
        vehicle.status !== "ACTIVE" ||
        (insurance && insurance < now) ||
        (registration && registration < now)
      );
    });
  }, [vehicles]);

  function tripMileage(form = transportForm) {
    const out = Number(form.mileage_out || 0);
    const inn = Number(form.mileage_in || 0);
    if (!out || !inn || inn < out) return 0;
    return inn - out;
  }

  function getResidentName(id) {
    const resident = residents.find((r) => String(r.id) === String(id));
    return resident?.full_name || resident?.name || "";
  }

  function handleTransportChange(e) {
    const { name, value } = e.target;

    if (name === "resident_id") {
      setTransportForm((prev) => ({
        ...prev,
        resident_id: value,
        resident_name: getResidentName(value),
      }));
      return;
    }

    if (name === "vehicle_id") {
      const vehicle = vehicles.find((v) => String(v.id) === String(value));

      setTransportForm((prev) => ({
        ...prev,
        vehicle_id: value,
        vehicle_name: vehicle?.vehicle_name || "",
        mileage_out: vehicle?.current_odometer || prev.mileage_out,
      }));

      return;
    }

    setTransportForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleVehicleChange(e) {
    const { name, value } = e.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleMaintenanceChange(e) {
    const { name, value } = e.target;

    if (name === "vehicle_name") {
      const vehicle = vehicles.find((v) => v.vehicle_name === value);

      setMaintenanceForm((prev) => ({
        ...prev,
        vehicle_name: value,
        vin: vehicle?.vin || "",
        license_plate: vehicle?.license_plate || "",
        odometer: vehicle?.current_odometer || "",
        insurance_expiration_date: vehicle?.insurance_expiration_date || "",
        registration_expiration_date:
          vehicle?.registration_expiration_date || "",
      }));

      return;
    }

    setMaintenanceForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleInspection(type, item) {
    setTransportForm((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [item]: !prev[type]?.[item],
      },
    }));
  }

  function updateMonthlyInspectionItem(item, field, value) {
    setMaintenanceForm((prev) => ({
      ...prev,
      checklist_items: {
        ...(prev.checklist_items || {}),
        [item]: {
          ...(prev.checklist_items?.[item] || {}),
          [field]: value,
        },
      },
    }));
  }

  function selectOpenTrip(log) {
    setSelectedOpenTrip(log);

    setTransportForm((prev) => ({
      ...prev,
      resident_id: log.resident_id || "",
      resident_name: log.metadata_json?.resident_name || "",
      vehicle_id: log.vehicle_id || "",
      vehicle_name: log.vehicle_name || "",
      transport_date: log.transport_date || today(),
      departure_time: log.departure_time || "",
      expected_return_time: log.expected_return_time || "",
      return_time: nowTime(),
      destination: log.destination || "",
      purpose: log.purpose || "",
      mileage_out: log.mileage_out || "",
      mileage_in: log.mileage_in || "",
      status: "RETURNED",
      notes: log.notes || "",
      pre_trip: log.metadata_json?.pre_trip || {},
      post_trip: log.metadata_json?.post_trip || {},
      fuel_level_start: log.metadata_json?.fuel_level_start || "",
      fuel_level_end: log.metadata_json?.fuel_level_end || "",
      driver_name: log.metadata_json?.driver_name || "",
      staff_signature: staffName,
    }));

    setActiveTab("TRANSPORT");
  }

  async function submitTransport(e) {
    e.preventDefault();

    if (
      transportForm.mileage_in &&
      transportForm.mileage_out &&
      Number(transportForm.mileage_in) < Number(transportForm.mileage_out)
    ) {
      setMessage("Mileage In cannot be less than Mileage Out.");
      return;
    }

    const payload = {
      ...transportForm,
      metadata_json: {
        resident_name: transportForm.resident_name,
        driver_name: transportForm.driver_name,
        entered_by: staffName,
        staff_signature: staffName,
        fuel_level_start: transportForm.fuel_level_start,
        fuel_level_end: transportForm.fuel_level_end,
        pre_trip: transportForm.pre_trip,
        post_trip: transportForm.post_trip,
      },
      signed_at: new Date().toISOString(),
    };

    try {
      if (selectedOpenTrip?.id) {
        await api.patch(
          `/facility-compliance/transport-logs/${selectedOpenTrip.id}`,
          payload
        );
        setMessage("Transport trip completed successfully.");
      } else {
        await api.post("/facility-compliance/transport-logs", payload);
        setMessage("Transport trip created successfully.");
      }

      setSelectedOpenTrip(null);
      setTransportForm({
        ...emptyTransport,
        staff_signature: staffName,
      });

      loadTransportLogs();
      loadVehicles();
    } catch (err) {
      console.error(err);
      setMessage("Could not save transport log.");
    }
  }

  async function submitVehicle(e) {
    e.preventDefault();

    try {
      await api.post("/facility-compliance/vehicles", vehicleForm);
      setMessage("Vehicle added successfully.");
      setVehicleForm(emptyVehicle);
      loadVehicles();
    } catch (err) {
      console.error(err);
      setMessage("Could not save vehicle.");
    }
  }

  async function submitMaintenance(e) {
    e.preventDefault();

    const payload = {
      ...maintenanceForm,
      service_type: maintenanceForm.service_type || "Monthly Maintenance Checklist",
      vendor_name: maintenanceForm.vendor_name || "Internal Inspection",
      metadata_json: {
        ...(maintenanceForm.metadata_json || {}),
        checklist_type: "MONTHLY_VEHICLE_INSPECTION",
        checklist_items: maintenanceForm.checklist_items || {},
        checked_by: maintenanceForm.checked_by || staffName,
        signature: maintenanceForm.signature || staffName,
        signature_date: maintenanceForm.signature_date || today(),
        compliance_note:
          "The inspection report is kept in the Compliance Manual. Any repairs performed on the vehicle shall also be kept in the Compliance Manual.",
      },
    };

    try {
      await api.post("/facility-compliance/vehicle-maintenance", payload);

      setMessage("Monthly vehicle inspection saved.");

      setMaintenanceForm({
        ...emptyMaintenance,
        checked_by: staffName,
        signature: staffName,
      });

      loadMaintenanceLogs();
      loadVehicles();
    } catch (err) {
      console.error(err);
      setMessage("Could not save maintenance record.");
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

  return (
    <div className="vehicle-page">
      <style>{`
        .vehicle-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .vehicle-hero {
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

        .vehicle-hero::before {
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

        .vehicle-hero h1 {
          margin: 0;
          max-width: 760px;
          font-size: clamp(46px, 5.3vw, 76px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .vehicle-hero p {
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
          grid-template-columns: repeat(3, minmax(0, 1fr));
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
          gap: 14px;
          padding: 0 18px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(15,23,42,.08);
        }

        .tab-btn.active {
          color: white;
          border-color: transparent;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
        }

        .vehicle-grid {
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

        .monthly-inspection-card {
          padding: 0;
          overflow: hidden;
        }

        .monthly-header {
          padding: 24px 28px;
          background: linear-gradient(135deg, #0f4cbd, #0a3c9c);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .monthly-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .monthly-icon {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.16);
          border: 1px solid rgba(255,255,255,.22);
        }

        .monthly-header h2 {
          margin: 0;
          font-size: 34px;
          line-height: 1;
          letter-spacing: -.04em;
          font-weight: 950;
        }

        .monthly-header p {
          margin: 6px 0 0;
          font-size: 15px;
          font-weight: 850;
          letter-spacing: .02em;
          color: rgba(255,255,255,.88);
        }

        .monthly-body {
          padding: 24px;
        }

        .inspection-info-box {
          border: 1px solid #dbeafe;
          border-radius: 18px;
          padding: 20px;
          margin-bottom: 20px;
          background: white;
        }

        .inspection-info-title {
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #0f4cbd;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
          font-size: 14px;
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
          min-height: 128px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.55;
        }

        .inspection-section {
          grid-column: span 2;
          padding: 18px;
          border-radius: 20px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .inspection-header {
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

        .vehicle-inspection-table {
          display: grid;
          border: 1px solid #dbeafe;
          border-radius: 16px;
          overflow: hidden;
          background: white;
        }

        .inspection-row {
          display: grid;
          grid-template-columns: minmax(260px, 1.5fr) 100px 110px minmax(220px, 1.3fr);
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }

        .inspection-row:last-child {
          border-bottom: 0;
        }

        .inspection-row.header {
          background: linear-gradient(135deg, #0f4cbd, #0a3c9c);
          color: white;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .inspection-cell {
          min-height: 52px;
          padding: 10px 14px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
        }

        .inspection-cell:last-child {
          border-right: 0;
        }

        .inspection-item {
          color: #111827;
          font-size: 14px;
          font-weight: 900;
          line-height: 1.35;
        }

        .radio-cell {
          justify-content: center;
        }

        .radio-cell input {
          width: 18px;
          height: 18px;
          accent-color: #2563eb;
        }

        .remarks-input {
          min-height: 38px !important;
          border-radius: 10px !important;
          box-shadow: none !important;
        }

        .inspection-disclaimer {
          margin: 18px 0 0;
          padding: 16px;
          border-radius: 14px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.55;
        }

        .button-row {
          grid-column: span 2;
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 18px;
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
          gap: 24px;
        }

        .record-list {
          gap: 14px;
        }

        .record-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 16px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .record-card.clickable {
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

        .chip.green {
          background: #ecfdf5;
          color: #047857;
        }

        .chip.orange {
          background: #fffbeb;
          color: #b45309;
        }

        .chip.red {
          background: #fef2f2;
          color: #dc2626;
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
          .vehicle-grid {
            grid-template-columns: 1fr;
          }

          .vehicle-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-metrics {
            width: 100%;
          }
        }

        @media (max-width: 900px) {
          .inspection-row {
            grid-template-columns: 1fr;
          }

          .inspection-cell {
            border-right: 0;
            border-bottom: 1px solid #e2e8f0;
          }

          .inspection-row.header {
            display: none;
          }
        }

        @media (max-width: 820px) {
          .vehicle-page {
            padding: 14px;
          }

          .form-grid,
          .choice-grid,
          .tabs {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .button-row,
          .inspection-section {
            grid-column: span 1;
          }

          .vehicle-hero {
            min-height: auto;
            padding: 28px;
          }

          .vehicle-hero h1 {
            font-size: 42px;
          }
        }
      `}</style>

      <section className="vehicle-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <Car size={18} />
            Facility Compliance
          </p>

          <h1>
            Vehicle &
            <br />
            Transportation
          </h1>

          <p>
            Manage resident transportation, active trips, mileage, vehicle
            records, inspections, maintenance, insurance, and registration
            compliance.
          </p>

          <div className="hero-actions">
            <span className="hero-pill">
              <ShieldCheck size={15} />
              Inspection Ready
            </span>
            <span className="hero-pill">
              <Gauge size={15} />
              Mileage Tracking
            </span>
            <span className="hero-pill">
              <Wrench size={15} />
              Monthly Inspection
            </span>
          </div>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{tripsToday.length}</strong>
            <span>Today's Trips</span>
          </div>

          <div className="metric-card">
            <strong>{activeTrips.length}</strong>
            <span>Active Trips</span>
          </div>

          <div className="metric-card">
            <strong>{mileageToday}</strong>
            <span>Miles Today</span>
          </div>

          <div className="metric-card">
            <strong>{maintenanceDue.length}</strong>
            <span>Vehicle Alerts</span>
          </div>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <div className="tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === "TRANSPORT" ? "active" : ""}`}
          onClick={() => setActiveTab("TRANSPORT")}
        >
          <Car size={24} />
          Transport Logs
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "VEHICLES" ? "active" : ""}`}
          onClick={() => setActiveTab("VEHICLES")}
        >
          <PlusCircle size={24} />
          Vehicles
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "MAINTENANCE" ? "active" : ""}`}
          onClick={() => setActiveTab("MAINTENANCE")}
        >
          <Wrench size={24} />
          Monthly Inspection
        </button>
      </div>

      {activeTab === "TRANSPORT" && (
        <section className="vehicle-grid">
          <form className="premium-card" onSubmit={submitTransport}>
            <div className="card-header">
              <div>
                <p>Trip Documentation</p>
                <h2>
                  {selectedOpenTrip ? "Complete Active Trip" : "New Transport Log"}
                </h2>
              </div>
              <Car size={32} color="#2563eb" />
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Transport Date</label>
                <input
                  type="date"
                  name="transport_date"
                  value={transportForm.transport_date}
                  onChange={handleTransportChange}
                />
              </div>

              <div className="form-field">
                <label>Driver Name</label>
                <input
                  name="driver_name"
                  value={transportForm.driver_name}
                  onChange={handleTransportChange}
                  placeholder="Enter driver name"
                />
              </div>

              <div className="form-field full">
                <label>Resident</label>
                <select
                  name="resident_id"
                  value={transportForm.resident_id}
                  onChange={handleTransportChange}
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
                <label>Vehicle</label>
                <select
                  name="vehicle_id"
                  value={transportForm.vehicle_id}
                  onChange={handleTransportChange}
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_name} · {vehicle.license_plate || "No Plate"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Purpose</label>
                <select
                  name="purpose"
                  value={transportForm.purpose}
                  onChange={handleTransportChange}
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

              <div className="form-field full">
                <label>Destination</label>
                <input
                  name="destination"
                  value={transportForm.destination}
                  onChange={handleTransportChange}
                  placeholder="Destination address or location"
                  required
                />
              </div>

              <div className="form-field">
                <label>Departure Time</label>
                <input
                  type="time"
                  name="departure_time"
                  value={transportForm.departure_time}
                  onChange={handleTransportChange}
                />
              </div>

              <div className="form-field">
                <label>Expected Return Time</label>
                <input
                  type="time"
                  name="expected_return_time"
                  value={transportForm.expected_return_time}
                  onChange={handleTransportChange}
                />
              </div>

              <div className="form-field">
                <label>Return Time</label>
                <input
                  type="time"
                  name="return_time"
                  value={transportForm.return_time}
                  onChange={handleTransportChange}
                />
              </div>

              <div className="form-field">
                <label>Status</label>
                <select
                  name="status"
                  value={transportForm.status}
                  onChange={handleTransportChange}
                >
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="RETURNED">Returned</option>
                  <option value="NEEDS_REVIEW">Needs Review</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="form-field">
                <label>Mileage Out</label>
                <input
                  type="number"
                  name="mileage_out"
                  value={transportForm.mileage_out}
                  onChange={handleTransportChange}
                />
              </div>

              <div className="form-field">
                <label>Mileage In</label>
                <input
                  type="number"
                  name="mileage_in"
                  value={transportForm.mileage_in}
                  onChange={handleTransportChange}
                />
              </div>

              <div className="form-field">
                <label>Mileage Driven</label>
                <input value={tripMileage()} readOnly />
              </div>

              <div className="form-field">
                <label>Fuel Level Start</label>
                <select
                  name="fuel_level_start"
                  value={transportForm.fuel_level_start}
                  onChange={handleTransportChange}
                >
                  <option value="">Select Fuel Level</option>
                  {FUEL_LEVELS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Fuel Level End</label>
                <select
                  name="fuel_level_end"
                  value={transportForm.fuel_level_end}
                  onChange={handleTransportChange}
                >
                  <option value="">Select Fuel Level</option>
                  {FUEL_LEVELS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inspection-section">
                <div className="inspection-header">
                  <span className="section-label">Pre-Trip Inspection</span>
                </div>

                <div className="choice-grid">
                  {PRE_TRIP.map((item) => (
                    <ChoiceButton
                      key={item}
                      active={transportForm.pre_trip?.[item]}
                      onClick={() => toggleInspection("pre_trip", item)}
                    >
                      {item}
                    </ChoiceButton>
                  ))}
                </div>
              </div>

              <div className="inspection-section">
                <div className="inspection-header">
                  <span className="section-label">Post-Trip Inspection</span>
                </div>

                <div className="choice-grid">
                  {POST_TRIP.map((item) => (
                    <ChoiceButton
                      key={item}
                      active={transportForm.post_trip?.[item]}
                      onClick={() => toggleInspection("post_trip", item)}
                    >
                      {item}
                    </ChoiceButton>
                  ))}
                </div>
              </div>

              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={transportForm.notes}
                  onChange={handleTransportChange}
                  placeholder="Document trip notes, resident behavior, delays, incidents, or vehicle concerns..."
                />
              </div>

              <div className="form-field">
                <label>Entered By / Signature</label>
                <input value={transportForm.staff_signature || staffName} readOnly />
              </div>

              <div className="button-row">
                <button className="primary-btn" type="submit">
                  <Save size={20} />
                  {selectedOpenTrip ? "Complete Trip" : "Save Transport Log"}
                </button>

                <button
                  className="secondary-btn"
                  type="button"
                  onClick={loadTransportLogs}
                >
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
                  <p>Live Trips</p>
                  <h2>Active Transport</h2>
                </div>
                <UsersRound size={32} color="#2563eb" />
              </div>

              <div className="record-list">
                {activeTrips.length === 0 && (
                  <div className="empty-state">No active trips right now.</div>
                )}

                {activeTrips.map((log) => (
                  <div
                    key={log.id}
                    className="record-card clickable"
                    onClick={() => selectOpenTrip(log)}
                  >
                    <strong>{log.metadata_json?.resident_name || "Resident"}</strong>
                    <p>
                      <MapPin size={13} /> {log.destination || "No destination"}
                    </p>

                    <div className="chip-row">
                      <span className="chip orange">
                        <Clock size={12} />
                        {log.departure_time || "-"}
                      </span>
                      <span className="chip">{log.vehicle_name || "Vehicle"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <aside className="premium-card">
              <div className="card-header">
                <div>
                  <p>History</p>
                  <h2>Recent Trips</h2>
                </div>
                <CalendarDays size={32} color="#2563eb" />
              </div>

              <div className="record-list">
                {transportLogs.length === 0 && (
                  <div className="empty-state">No transport logs found.</div>
                )}

                {transportLogs.slice(0, 12).map((log) => (
                  <div className="record-card" key={log.id}>
                    <strong>{log.metadata_json?.resident_name || "Resident"}</strong>
                    <p>
                      {log.destination || "No destination"} ·{" "}
                      {log.vehicle_name || "Vehicle"} ·{" "}
                      {log.transport_date || "No date"}
                    </p>

                    <div className="chip-row">
                      <span
                        className={`chip ${
                          log.status === "RETURNED" ? "green" : "orange"
                        }`}
                      >
                        {log.status || "IN_TRANSIT"}
                      </span>
                      <span className="chip">
                        <Gauge size={12} />
                        {Math.max(
                          Number(log.mileage_in || 0) -
                            Number(log.mileage_out || 0),
                          0
                        )}{" "}
                        mi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      )}

      {activeTab === "VEHICLES" && (
        <section className="vehicle-grid">
          <form className="premium-card" onSubmit={submitVehicle}>
            <div className="card-header">
              <div>
                <p>Vehicle Registry</p>
                <h2>Add Facility Vehicle</h2>
              </div>
              <Car size={32} color="#2563eb" />
            </div>

            <div className="form-grid">
              {[
                ["vehicle_name", "Vehicle Name"],
                ["vehicle_make", "Make"],
                ["vehicle_model", "Model"],
                ["vehicle_year", "Year"],
                ["vin", "VIN"],
                ["license_plate", "License Plate"],
                ["fuel_type", "Fuel Type"],
                ["capacity", "Capacity"],
                ["insurance_company", "Insurance Company"],
                ["policy_number", "Policy Number"],
                ["registration_number", "Registration Number"],
                ["current_odometer", "Current Odometer"],
              ].map(([name, label]) => (
                <div className="form-field" key={name}>
                  <label>{label}</label>
                  <input
                    name={name}
                    value={vehicleForm[name]}
                    onChange={handleVehicleChange}
                  />
                </div>
              ))}

              <div className="form-field">
                <label>Insurance Expiration</label>
                <input
                  type="date"
                  name="insurance_expiration_date"
                  value={vehicleForm.insurance_expiration_date}
                  onChange={handleVehicleChange}
                />
              </div>

              <div className="form-field">
                <label>Registration Expiration</label>
                <input
                  type="date"
                  name="registration_expiration_date"
                  value={vehicleForm.registration_expiration_date}
                  onChange={handleVehicleChange}
                />
              </div>

              <div className="form-field">
                <label>Status</label>
                <select
                  name="status"
                  value={vehicleForm.status}
                  onChange={handleVehicleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE_DUE">Maintenance Due</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>

              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={vehicleForm.notes}
                  onChange={handleVehicleChange}
                />
              </div>

              <div className="button-row">
                <button className="primary-btn" type="submit">
                  <Save size={20} />
                  Save Vehicle
                </button>

                <button className="secondary-btn" type="button" onClick={loadVehicles}>
                  <RefreshCw size={20} />
                  Refresh Vehicles
                </button>
              </div>
            </div>
          </form>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Fleet</p>
                <h2>Facility Vehicles</h2>
              </div>
              <Car size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {vehicles.length === 0 && (
                <div className="empty-state">No vehicles registered.</div>
              )}

              {vehicles.map((vehicle) => (
                <div
                  className={`record-card ${
                    vehicle.status !== "ACTIVE" ? "warning" : ""
                  }`}
                  key={vehicle.id}
                >
                  <strong>{vehicle.vehicle_name}</strong>
                  <p>
                    {vehicle.vehicle_make || ""} {vehicle.vehicle_model || ""} ·{" "}
                    {vehicle.license_plate || "No plate"}
                  </p>

                  <div className="chip-row">
                    <span
                      className={`chip ${
                        vehicle.status === "ACTIVE" ? "green" : "red"
                      }`}
                    >
                      {vehicle.status}
                    </span>
                    <span className="chip">
                      <Gauge size={12} />
                      {vehicle.current_odometer || 0} mi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}

      {activeTab === "MAINTENANCE" && (
        <section className="vehicle-grid">
          <form className="premium-card monthly-inspection-card" onSubmit={submitMaintenance}>
            <div className="monthly-header">
              <div className="monthly-header-left">
                <div className="monthly-icon">
                  <ClipboardCheck size={34} />
                </div>
                <div>
                  <h2>Monthly Vehicle Inspection</h2>
                  <p>Monthly Maintenance Checklist</p>
                </div>
              </div>

              <button className="secondary-btn" type="button" onClick={() => window.print()}>
                <Printer size={18} />
                Print
              </button>
            </div>

            <div className="monthly-body">
              <div className="inspection-info-box">
                <p className="inspection-info-title">
                  <FileText size={18} />
                  Inspection Information
                </p>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Date of Inspection</label>
                    <input
                      type="date"
                      name="service_date"
                      value={maintenanceForm.service_date}
                      onChange={handleMaintenanceChange}
                    />
                  </div>

                  <div className="form-field">
                    <label>Vehicle</label>
                    <select
                      name="vehicle_name"
                      value={maintenanceForm.vehicle_name}
                      onChange={handleMaintenanceChange}
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.vehicle_name}>
                          {vehicle.vehicle_name} · {vehicle.license_plate || "No Plate"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Checked By</label>
                    <input
                      name="checked_by"
                      value={maintenanceForm.checked_by || staffName}
                      onChange={handleMaintenanceChange}
                    />
                  </div>

                  <div className="form-field">
                    <label>License # of Vehicle</label>
                    <input
                      value={maintenanceForm.license_plate || ""}
                      readOnly
                    />
                  </div>

                  <div className="form-field">
                    <label>VIN</label>
                    <input value={maintenanceForm.vin || ""} readOnly />
                  </div>

                  <div className="form-field">
                    <label>Odometer</label>
                    <input
                      type="number"
                      name="odometer"
                      value={maintenanceForm.odometer}
                      onChange={handleMaintenanceChange}
                    />
                  </div>
                </div>
              </div>

              <div className="vehicle-inspection-table">
                <div className="inspection-row header">
                  <div className="inspection-cell">Item</div>
                  <div className="inspection-cell radio-cell">OK</div>
                  <div className="inspection-cell radio-cell">Not OK</div>
                  <div className="inspection-cell">Remarks</div>
                </div>

                {MONTHLY_VEHICLE_INSPECTION_ITEMS.map((item) => {
                  const current = maintenanceForm.checklist_items?.[item] || {};

                  return (
                    <div className="inspection-row" key={item}>
                      <div className="inspection-cell inspection-item">{item}</div>

                      <label className="inspection-cell radio-cell">
                        <input
                          type="radio"
                          name={`${item}-status`}
                          checked={current.status === "OK"}
                          onChange={() =>
                            updateMonthlyInspectionItem(item, "status", "OK")
                          }
                        />
                      </label>

                      <label className="inspection-cell radio-cell">
                        <input
                          type="radio"
                          name={`${item}-status`}
                          checked={current.status === "NOT_OK"}
                          onChange={() =>
                            updateMonthlyInspectionItem(item, "status", "NOT_OK")
                          }
                        />
                      </label>

                      <div className="inspection-cell">
                        <input
                          className="remarks-input"
                          value={current.remarks || ""}
                          onChange={(e) =>
                            updateMonthlyInspectionItem(
                              item,
                              "remarks",
                              e.target.value
                            )
                          }
                          placeholder="Enter remarks if any"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="inspection-disclaimer">
                The inspection report is kept in the Compliance Manual. Any
                repairs performed on the vehicle shall also be kept in the
                Compliance Manual. The Administrator is responsible for keeping
                all company vehicles in proper repair and taking the vehicle out
                of service to ensure all repairs are in compliance with ADHS
                safety guidelines.
              </p>

              <div className="form-grid" style={{ marginTop: 18 }}>
                <div className="form-field full">
                  <label>Issues Found</label>
                  <textarea
                    name="issues_found"
                    value={maintenanceForm.issues_found}
                    onChange={handleMaintenanceChange}
                  />
                </div>

                <div className="form-field full">
                  <label>Corrective Actions</label>
                  <textarea
                    name="corrective_actions"
                    value={maintenanceForm.corrective_actions}
                    onChange={handleMaintenanceChange}
                  />
                </div>

                <div className="form-field">
                  <label>Signature</label>
                  <input
                    name="signature"
                    value={maintenanceForm.signature || staffName}
                    readOnly
                  />
                </div>

                <div className="form-field">
                  <label>Date</label>
                  <input
                    type="date"
                    name="signature_date"
                    value={maintenanceForm.signature_date}
                    onChange={handleMaintenanceChange}
                  />
                </div>

                <div className="button-row">
                  <button className="primary-btn" type="submit">
                    <Save size={20} />
                    Save Monthly Inspection
                  </button>

                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={loadMaintenanceLogs}
                  >
                    <RefreshCw size={20} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </form>

          <aside className="premium-card">
            <div className="card-header">
              <div>
                <p>Inspection History</p>
                <h2>Vehicle Inspections</h2>
              </div>
              <Wrench size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {maintenanceLogs.length === 0 && (
                <div className="empty-state">No vehicle inspections found.</div>
              )}

              {maintenanceLogs.map((log) => (
                <div className="record-card" key={log.id}>
                  <strong>{log.vehicle_name}</strong>
                  <p>
                    {log.service_type || "Monthly Inspection"} ·{" "}
                    {log.service_date || "No date"} ·{" "}
                    {log.vendor_name || "Internal"}
                  </p>

                  <div className="chip-row">
                    <span className="chip green">{log.status}</span>
                    <span className="chip">
                      <Gauge size={12} />
                      {log.odometer || 0} mi
                    </span>
                    <span className="chip">
                      <PenLine size={12} />
                      {log.metadata_json?.checked_by || "Staff"}
                    </span>
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