import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Flag,
  HeartPulse,
  Layers,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Target,
  UserCheck,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);

const emptyGoal = {
  resident_id: "",
  goal_title: "",
  goal_category: "Mental Health",
  target_behavior: "",
  baseline: "",
  measurable_objective: "",
  start_date: today(),
  target_date: "",
  priority: "MEDIUM",
  status: "ACTIVE",
  progress_rating: 0,
  review_notes: "",
  metadata_json: {},
};

const emptyIntervention = {
  resident_id: "",
  goal_id: "",
  intervention_title: "",
  intervention_description: "",
  responsible_role: "BHT",
  frequency: "Daily",
  method: "Staff Support",
  start_date: today(),
  end_date: "",
  status: "ACTIVE",
  effectiveness_rating: 0,
  progress_notes: "",
  metadata_json: {},
};

const emptyTrigger = {
  resident_id: "",
  goal_id: "",
  trigger_name: "",
  trigger_type: "Behavioral",
  warning_signs: "",
  coping_skill: "",
  staff_response: "",
  risk_level: "LOW",
  status: "ACTIVE",
  metadata_json: {},
};

const emptyTask = {
  resident_id: "",
  goal_id: "",
  intervention_id: "",
  task_title: "",
  task_description: "",
  assigned_role: "BHT",
  due_date: today(),
  due_time: "",
  priority: "MEDIUM",
  status: "OPEN",
  completion_notes: "",
  metadata_json: {},
};

export default function ResidentTreatmentPlanPage() {
  const [residents, setResidents] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [workspace, setWorkspace] = useState({
    resident: null,
    goals: [],
    interventions: [],
    triggers: [],
    tasks: [],
  });
  const [dashboard, setDashboard] = useState(null);
  const [progress, setProgress] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState("");
  const [message, setMessage] = useState("");
  const [interventionForm, setInterventionForm] = useState(emptyIntervention);
  const [triggerForm, setTriggerForm] = useState(emptyTrigger);
  const [showInterventionForm, setShowInterventionForm] = useState(false);
  const [showTriggerForm, setShowTriggerForm] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
	  review_date: today(),
	  comments: "",
	  next_review_date: "",
	});
  const [showReviewBox, setShowReviewBox] = useState(false);

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

  async function loadTreatmentPlan(residentId = selectedResidentId) {
    if (!residentId) return;

    try {
      const [workspaceRes, dashboardRes, progressRes, timelineRes] =
        await Promise.all([
          api.get(`/resident-care/treatment-plan/resident/${residentId}`),
          api.get(`/resident-care/treatment-plan/dashboard?resident_id=${residentId}`),
          api.get(`/resident-care/treatment-plan/progress?resident_id=${residentId}`),
          api.get(`/resident-care/treatment-plan/timeline?resident_id=${residentId}`),
        ]);

      setWorkspace(workspaceRes.data || {});
      setDashboard(dashboardRes.data || null);
      setProgress(progressRes.data || null);
      setTimeline(Array.isArray(timelineRes.data) ? timelineRes.data : []);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Could not load resident treatment plan.");
    }
  }

  useEffect(() => {
    loadResidents();
  }, []);

  useEffect(() => {
    if (selectedResidentId) {
		setGoalForm((prev) => ({ ...prev, resident_id: selectedResidentId }));
		setInterventionForm((prev) => ({ ...prev, resident_id: selectedResidentId }));
		setTriggerForm((prev) => ({ ...prev, resident_id: selectedResidentId }));
		setTaskForm((prev) => ({ ...prev, resident_id: selectedResidentId }));

		loadTreatmentPlan(selectedResidentId);
    }
  }, [selectedResidentId]);

  const selectedResident = useMemo(() => {
    return residents.find((r) => String(r.id) === String(selectedResidentId));
  }, [residents, selectedResidentId]);

  const goals = workspace?.goals || [];
  const interventions = workspace?.interventions || [];
  const triggers = workspace?.triggers || [];
  const tasks = workspace?.tasks || [];

  function residentName(resident) {
    if (!resident) return "Resident";
    return [resident.first_name, resident.middle_name, resident.last_name]
      .filter(Boolean)
      .join(" ");
  }

  function handleGoalChange(e) {
    const { name, value } = e.target;

    setGoalForm((prev) => ({
      ...prev,
      [name]:
        name === "progress_rating"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  }

	function handleInterventionChange(e) {
	  const { name, value } = e.target;
	  setInterventionForm((prev) => ({
		...prev,
		[name]: name === "effectiveness_rating" ? Number(value || 0) : value,
	  }));
	}

	function handleTriggerChange(e) {
	  const { name, value } = e.target;
	  setTriggerForm((prev) => ({
		...prev,
		[name]: value,
	  }));
	}

	async function submitIntervention(e) {
	  e.preventDefault();

	  if (!selectedResidentId) {
		setMessage("Please select a resident first.");
		return;
	  }

	  try {
		await api.post("/resident-care/treatment-plan/interventions", {
		  ...interventionForm,
		  resident_id: selectedResidentId,
		});

		setMessage("Intervention added.");
		setInterventionForm({
		  ...emptyIntervention,
		  resident_id: selectedResidentId,
		  start_date: today(),
		});
		setShowInterventionForm(false);
		loadTreatmentPlan(selectedResidentId);
	  } catch (err) {
		console.error(err);
		setMessage("Could not save intervention.");
	  }
	}

	async function submitTrigger(e) {
	  e.preventDefault();

	  if (!selectedResidentId) {
		setMessage("Please select a resident first.");
		return;
	  }

	  try {
		await api.post("/resident-care/treatment-plan/triggers", {
		  ...triggerForm,
		  resident_id: selectedResidentId,
		});

		setMessage("Trigger added.");
		setTriggerForm({
		  ...emptyTrigger,
		  resident_id: selectedResidentId,
		});
		setShowTriggerForm(false);
		loadTreatmentPlan(selectedResidentId);
	  } catch (err) {
		console.error(err);
		setMessage("Could not save trigger.");
	  }
	}
		
	function handleTaskChange(e) {
	  const { name, value } = e.target;
	  setTaskForm((prev) => ({
		...prev,
		[name]: value,
	  }));
	}

	function handleReviewChange(e) {
	  const { name, value } = e.target;
	  setReviewForm((prev) => ({
		...prev,
		[name]: value,
	  }));
	}

	async function submitTask(e) {
	  e.preventDefault();

	  if (!selectedResidentId) {
		setMessage("Please select a resident first.");
		return;
	  }

	  try {
		await api.post("/resident-care/treatment-plan/tasks", {
		  ...taskForm,
		  resident_id: selectedResidentId,
		});

		setMessage("Follow-up task created.");
		setTaskForm({
		  ...emptyTask,
		  resident_id: selectedResidentId,
		  due_date: today(),
		});
		setShowTaskForm(false);
		loadTreatmentPlan(selectedResidentId);
	  } catch (err) {
		console.error(err);
		setMessage("Could not save follow-up task.");
	  }
	}

	async function completeTask(taskId) {
	  try {
		await api.post(`/resident-care/treatment-plan/tasks/${taskId}/complete`, {
		  completion_notes: "Completed from Treatment Plan Workspace",
		});

		setMessage("Follow-up task completed.");
		loadTreatmentPlan(selectedResidentId);
	  } catch (err) {
		console.error(err);
		setMessage("Could not complete follow-up task.");
	  }
	}

	async function submitReview() {
	  if (!selectedResidentId) {
		setMessage("Please select a resident first.");
		return;
	  }

	  try {
		await api.post(
		  `/resident-care/treatment-plan/${selectedResidentId}/review`,
		  reviewForm
		);

		setMessage("Treatment plan review recorded.");
		setShowReviewBox(false);
		setReviewForm({
		  review_date: today(),
		  comments: "",
		  next_review_date: "",
		});
	  } catch (err) {
		console.error(err);
		setMessage("Could not record review.");
	  }
	}

	async function signTreatmentPlan() {
	  if (!selectedResidentId) {
		setMessage("Please select a resident first.");
		return;
	  }

	  try {
		await api.post(`/resident-care/treatment-plan/${selectedResidentId}/sign`, {
		  signature_role: "BHP",
		});

		setMessage("Treatment plan signed.");
	  } catch (err) {
		console.error(err);
		setMessage("Could not sign treatment plan.");
	  }
	}

	function openTreatmentPlanPdf() {
	  if (!selectedResidentId) {
		setMessage("Please select a resident first.");
		return;
	  }

	  window.open(
		`/api/v1/resident-care/treatment-plan/${selectedResidentId}/pdf`,
		"_blank"
	  );
	}	
		

  async function submitGoal(e) {
    e.preventDefault();

    if (!selectedResidentId) {
      setMessage("Please select a resident first.");
      return;
    }

    try {
      await api.post("/resident-care/treatment-plan/goals", {
        ...goalForm,
        resident_id: selectedResidentId,
      });

      setMessage("Treatment goal created.");
      setGoalForm({
        ...emptyGoal,
        resident_id: selectedResidentId,
        start_date: today(),
      });
      setShowGoalForm(false);
      loadTreatmentPlan(selectedResidentId);
    } catch (err) {
      console.error(err);
      setMessage("Could not save treatment goal.");
    }
  }

  async function completeGoal(goalId) {
    try {
      await api.post(`/resident-care/treatment-plan/goals/${goalId}/complete`);
      setMessage("Goal marked as completed.");
      loadTreatmentPlan(selectedResidentId);
    } catch (err) {
      console.error(err);
      setMessage("Could not complete goal.");
    }
  }

  function goalInterventions(goalId) {
    return interventions.filter((x) => String(x.goal_id) === String(goalId));
  }

  function goalTriggers(goalId) {
    return triggers.filter((x) => String(x.goal_id) === String(goalId));
  }

  function goalTasks(goalId) {
    return tasks.filter((x) => String(x.goal_id) === String(goalId));
  }

  function priorityClass(priority) {
    if (priority === "HIGH") return "red";
    if (priority === "LOW") return "green";
    return "orange";
  }

  function progressWidth(value) {
    const num = Number(value || 0);
    return `${Math.max(0, Math.min(100, num))}%`;
  }

  return (
    <div className="tp-page">
      <style>{`
        .tp-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            radial-gradient(circle at bottom right, rgba(14,165,233,.16), transparent 32%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .tp-hero {
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
            linear-gradient(90deg, rgba(5,18,44,.98), rgba(30,64,175,.92), rgba(14,165,233,.24)),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
        }

        .tp-hero::before {
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

        .tp-hero h1 {
          margin: 0;
          font-size: clamp(46px, 5.3vw, 76px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .tp-hero p {
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
          margin-bottom: 20px;
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
          flex-wrap: wrap;
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

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .kpi-card {
          border-radius: 22px;
          padding: 20px;
          background: white;
          border: 1px solid #dbeafe;
          box-shadow: 0 16px 38px rgba(15,23,42,.09);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .kpi-card strong {
          display: block;
          color: #071735;
          font-size: 34px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -.06em;
        }

        .kpi-card span {
          display: block;
          margin-top: 7px;
          color: #64748b;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .kpi-icon {
          width: 54px;
          height: 54px;
          border-radius: 17px;
          display: grid;
          place-items: center;
          color: #2563eb;
          background: #dbeafe;
          flex-shrink: 0;
        }

        .tp-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(340px, .9fr);
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
          margin-bottom: 24px;
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

        .primary-btn,
        .secondary-btn,
        .success-btn {
          min-height: 56px;
          border-radius: 16px;
          padding: 0 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
        }

        .primary-btn {
          border: 0;
          color: white;
          background: linear-gradient(135deg, #1d4ed8, #0f766e);
          box-shadow: 0 16px 32px rgba(15,118,110,.18);
        }

        .secondary-btn {
          color: #071735;
          background: white;
          border: 1px solid #cfe0f7;
        }

        .success-btn {
          border: 0;
          color: white;
          background: linear-gradient(135deg, #047857, #10b981);
        }

        .goal-form {
          margin-bottom: 20px;
          padding: 22px;
          border-radius: 22px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
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
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          min-height: 54px;
          border: 1px solid #cfe0f7;
          border-radius: 14px;
          padding: 0 15px;
          background: white;
          color: #071735;
          font-size: 14px;
          font-weight: 800;
          outline: none;
        }

        .form-field textarea {
          min-height: 110px;
          padding: 14px 15px;
          resize: vertical;
          line-height: 1.55;
        }

        .button-row {
          grid-column: span 2;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .goal-list {
          display: grid;
          gap: 16px;
        }

        .goal-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 20px;
          padding: 20px;
          background: white;
          box-shadow: 0 14px 34px rgba(15,23,42,.08);
        }

        .goal-card.completed {
          border-left-color: #047857;
          background: linear-gradient(180deg, #ffffff, #ecfdf5);
        }

        .goal-top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
        }

        .goal-card h3 {
          margin: 0;
          font-size: 22px;
          color: #071735;
          font-weight: 950;
          letter-spacing: -.04em;
        }

        .goal-card p {
          margin: 8px 0 0;
          color: #64748b;
          font-weight: 750;
          line-height: 1.55;
        }

        .progress-wrap {
          margin-top: 16px;
        }

        .progress-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #475569;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .progress-bar {
          height: 12px;
          border-radius: 999px;
          background: #e0f2fe;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #2563eb, #14b8a6);
        }

        .chip-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 14px;
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

        .goal-details {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid #e0f2fe;
          display: grid;
          gap: 14px;
        }

        .detail-block {
          padding: 16px;
          border-radius: 16px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
        }

        .detail-block h4 {
          margin: 0 0 8px;
          color: #1e3a8a;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .side-stack {
          display: grid;
          gap: 20px;
        }

        .snapshot-row {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #e0f2fe;
        }

        .snapshot-row span {
          color: #64748b;
          font-weight: 850;
        }

        .snapshot-row strong {
          color: #071735;
          font-weight: 950;
          text-align: right;
        }

        .timeline-list {
          display: grid;
          gap: 12px;
        }

        .timeline-item {
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid #dbeafe;
          background: white;
        }

        .timeline-item strong {
          display: block;
          color: #071735;
          font-size: 14px;
          font-weight: 950;
        }

        .timeline-item span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 12px;
          font-weight: 850;
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
          .tp-hero,
          .resident-filter-card {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-metrics,
          .resident-select {
            width: 100%;
          }

          .kpi-grid,
          .tp-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .tp-page { padding: 14px; }

          .tp-hero {
            min-height: auto;
            padding: 28px;
          }

          .tp-hero h1 { font-size: 42px; }

          .form-grid {
            grid-template-columns: 1fr;
          }
			.left-stack {
			  display: grid;
			  gap: 24px;
			}
          .form-field.full,
          .button-row {
            grid-column: span 1;
          }
        }
      `}</style>

      <section className="tp-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <ClipboardCheck size={18} />
            ResidentCare Treatment Planning
          </p>

          <h1>
            Treatment
            <br />
            Plan Workspace
          </h1>

          <p>
            Manage behavioral health treatment goals, measurable objectives,
            interventions, triggers, follow-up tasks, progress, and clinical review
            in one resident-centered workspace.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{dashboard?.active_goals ?? 0}</strong>
            <span>Active Goals</span>
          </div>

          <div className="metric-card">
            <strong>{dashboard?.active_interventions ?? 0}</strong>
            <span>Interventions</span>
          </div>

          <div className="metric-card">
            <strong>{dashboard?.open_tasks ?? 0}</strong>
            <span>Open Tasks</span>
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
              Select a resident to view or build their treatment plan.
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

          <button
            className="secondary-btn"
            type="button"
            onClick={() => loadTreatmentPlan()}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <section className="kpi-grid">
        <div className="kpi-card">
          <div>
            <strong>{dashboard?.active_goals ?? 0}</strong>
            <span>Active Goals</span>
          </div>
          <div className="kpi-icon">
            <Target size={26} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <strong>{progress?.overall_progress ?? 0}%</strong>
            <span>Overall Progress</span>
          </div>
          <div className="kpi-icon">
            <BarChart3 size={26} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <strong>{dashboard?.active_triggers ?? 0}</strong>
            <span>Active Triggers</span>
          </div>
          <div className="kpi-icon">
            <AlertTriangle size={26} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <strong>{dashboard?.overdue_tasks ?? 0}</strong>
            <span>Overdue Tasks</span>
          </div>
          <div className="kpi-icon">
            <Flag size={26} />
          </div>
        </div>
      </section>

      <section className="tp-layout">
	    <div className="left-stack">
        <main className="premium-card">
          <div className="card-header">
            <div>
              <p>Treatment Goals</p>
              <h2>Goals & Objectives</h2>
            </div>

            <button
              className="primary-btn"
              type="button"
              onClick={() => setShowGoalForm((prev) => !prev)}
            >
              <PlusCircle size={18} />
              New Goal
            </button>
          </div>

          {showGoalForm && (
            <form className="goal-form" onSubmit={submitGoal}>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Goal Title</label>
                  <input
                    name="goal_title"
                    value={goalForm.goal_title}
                    onChange={handleGoalChange}
                    required
                    placeholder="Example: Improve medication compliance"
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>
                  <select
                    name="goal_category"
                    value={goalForm.goal_category}
                    onChange={handleGoalChange}
                  >
                    <option>Mental Health</option>
                    <option>Medication Compliance</option>
                    <option>Substance Use</option>
                    <option>ADLs</option>
                    <option>Independent Living</option>
                    <option>Safety</option>
                    <option>Social Skills</option>
                    <option>Coping Skills</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={goalForm.priority}
                    onChange={handleGoalChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={goalForm.start_date}
                    onChange={handleGoalChange}
                  />
                </div>

                <div className="form-field">
                  <label>Target Date</label>
                  <input
                    type="date"
                    name="target_date"
                    value={goalForm.target_date}
                    onChange={handleGoalChange}
                  />
                </div>

                <div className="form-field">
                  <label>Progress Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="progress_rating"
                    value={goalForm.progress_rating}
                    onChange={handleGoalChange}
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select
                    name="status"
                    value={goalForm.status}
                    onChange={handleGoalChange}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DISCONTINUED">Discontinued</option>
                  </select>
                </div>

                <div className="form-field full">
                  <label>Target Behavior / Outcome</label>
                  <textarea
                    name="target_behavior"
                    value={goalForm.target_behavior}
                    onChange={handleGoalChange}
                  />
                </div>

                <div className="form-field full">
                  <label>Baseline</label>
                  <textarea
                    name="baseline"
                    value={goalForm.baseline}
                    onChange={handleGoalChange}
                  />
                </div>

                <div className="form-field full">
                  <label>Measurable Objective</label>
                  <textarea
                    name="measurable_objective"
                    value={goalForm.measurable_objective}
                    onChange={handleGoalChange}
                  />
                </div>

                <div className="form-field full">
                  <label>Review Notes</label>
                  <textarea
                    name="review_notes"
                    value={goalForm.review_notes}
                    onChange={handleGoalChange}
                  />
                </div>

                <div className="button-row">
                  <button className="primary-btn" type="submit">
                    <Save size={18} />
                    Save Goal
                  </button>

                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => setShowGoalForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="goal-list">
            {!selectedResidentId && (
              <div className="empty-state">
                Select a resident to view treatment goals.
              </div>
            )}

            {selectedResidentId && goals.length === 0 && (
              <div className="empty-state">
                No treatment goals found for this resident.
              </div>
            )}

            {goals.map((goal) => {
              const expanded = expandedGoalId === goal.id;
              const goalProgress = goal.progress_rating || 0;

              return (
                <article
                  className={`goal-card ${
                    goal.status === "COMPLETED" ? "completed" : ""
                  }`}
                  key={goal.id}
                >
                  <div className="goal-top">
                    <div>
                      <h3>{goal.goal_title}</h3>
                      <p>{goal.measurable_objective || "No measurable objective entered."}</p>
                    </div>

                    <button
                      className="secondary-btn"
                      type="button"
                      onClick={() =>
                        setExpandedGoalId(expanded ? "" : goal.id)
                      }
                    >
                      {expanded ? "Hide" : "View"}
                    </button>
                  </div>

                  <div className="progress-wrap">
                    <div className="progress-meta">
                      <span>Progress</span>
                      <span>{goalProgress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: progressWidth(goalProgress) }}
                      />
                    </div>
                  </div>

                  <div className="chip-row">
                    <span className={`chip ${priorityClass(goal.priority)}`}>
                      {goal.priority || "MEDIUM"}
                    </span>
                    <span className="chip">{goal.status || "ACTIVE"}</span>
                    <span className="chip">{goal.goal_category || "Category"}</span>
                    <span className="chip">
                      {goalInterventions(goal.id).length} Interventions
                    </span>
                    <span className="chip">
                      {goalTriggers(goal.id).length} Triggers
                    </span>
                    <span className="chip">
                      {goalTasks(goal.id).length} Tasks
                    </span>
                  </div>

                  {expanded && (
                    <div className="goal-details">
                      <div className="detail-block">
                        <h4>Baseline</h4>
                        <p>{goal.baseline || "No baseline documented."}</p>
                      </div>

                      <div className="detail-block">
                        <h4>Target Behavior</h4>
                        <p>{goal.target_behavior || "No target behavior documented."}</p>
                      </div>

                      <div className="detail-block">
                        <h4>Review Notes</h4>
                        <p>{goal.review_notes || "No review notes entered."}</p>
                      </div>

                      <div className="button-row">
                        {goal.status !== "COMPLETED" && (
                          <button
                            className="success-btn"
                            type="button"
                            onClick={() => completeGoal(goal.id)}
                          >
                            <CheckCircle2 size={18} />
                            Complete Goal
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </main>
		<section className="premium-card">
	  <div className="card-header">
		<div>
		  <p>Clinical Interventions</p>
		  <h2>Resident Interventions</h2>
		</div>

		<button
		  className="primary-btn"
		  type="button"
		  onClick={() => setShowInterventionForm((prev) => !prev)}
		>
		  <PlusCircle size={18} />
		  Add Intervention
		</button>
	  </div>

	  {showInterventionForm && (
		<form className="goal-form" onSubmit={submitIntervention}>
		  <div className="form-grid">
			<div className="form-field full">
			  <label>Linked Goal</label>
			  <select
				name="goal_id"
				value={interventionForm.goal_id}
				onChange={handleInterventionChange}
				required
			  >
				<option value="">Select Goal</option>
				{goals.map((goal) => (
				  <option key={goal.id} value={goal.id}>
					{goal.goal_title}
				  </option>
				))}
			  </select>
			</div>

			<div className="form-field full">
			  <label>Intervention Title</label>
			  <input
				name="intervention_title"
				value={interventionForm.intervention_title}
				onChange={handleInterventionChange}
				required
				placeholder="Example: Daily medication education"
			  />
			</div>

			<div className="form-field">
			  <label>Responsible Role</label>
			  <select
				name="responsible_role"
				value={interventionForm.responsible_role}
				onChange={handleInterventionChange}
			  >
				<option>BHT</option>
				<option>BHP</option>
				<option>Nurse</option>
				<option>Case Manager</option>
				<option>Clinical Director</option>
				<option>Program Manager</option>
			  </select>
			</div>

			<div className="form-field">
			  <label>Frequency</label>
			  <select
				name="frequency"
				value={interventionForm.frequency}
				onChange={handleInterventionChange}
			  >
				<option>Daily</option>
				<option>Each Shift</option>
				<option>Weekly</option>
				<option>Biweekly</option>
				<option>Monthly</option>
				<option>As Needed</option>
			  </select>
			</div>

			<div className="form-field">
			  <label>Method</label>
			  <select
				name="method"
				value={interventionForm.method}
				onChange={handleInterventionChange}
			  >
				<option>Staff Support</option>
				<option>Counseling</option>
				<option>Medication Education</option>
				<option>Skill Building</option>
				<option>Redirection</option>
				<option>Motivational Interviewing</option>
				<option>Group Support</option>
			  </select>
			</div>

			<div className="form-field">
			  <label>Effectiveness Rating</label>
			  <input
				type="number"
				min="0"
				max="100"
				name="effectiveness_rating"
				value={interventionForm.effectiveness_rating}
				onChange={handleInterventionChange}
			  />
			</div>

			<div className="form-field full">
			  <label>Description</label>
			  <textarea
				name="intervention_description"
				value={interventionForm.intervention_description}
				onChange={handleInterventionChange}
			  />
			</div>

			<div className="form-field full">
			  <label>Progress Notes</label>
			  <textarea
				name="progress_notes"
				value={interventionForm.progress_notes}
				onChange={handleInterventionChange}
			  />
			</div>

			<div className="button-row">
			  <button className="primary-btn" type="submit">
				<Save size={18} />
				Save Intervention
			  </button>
			  <button
				className="secondary-btn"
				type="button"
				onClick={() => setShowInterventionForm(false)}
			  >
				Cancel
			  </button>
			</div>
		  </div>
		</form>
	  )}

  <div className="goal-list">
    {interventions.length === 0 && (
      <div className="empty-state">No interventions found.</div>
    )}

    {interventions.map((item) => (
      <article className="goal-card" key={item.id}>
        <div className="goal-top">
          <div>
            <h3>{item.intervention_title}</h3>
            <p>{item.intervention_description || "No description entered."}</p>
          </div>
        </div>

        <div className="chip-row">
          <span className="chip">{item.responsible_role || "Role"}</span>
          <span className="chip">{item.frequency || "Frequency"}</span>
          <span className="chip green">{item.status || "ACTIVE"}</span>
          <span className="chip">
            Effectiveness {item.effectiveness_rating || 0}%
          </span>
        </div>
      </article>
    ))}
  </div>
</section>

<section className="premium-card">
  <div className="card-header">
    <div>
      <p>Triggers & Warning Signs</p>
      <h2>Resident Triggers</h2>
    </div>

    <button
      className="primary-btn"
      type="button"
      onClick={() => setShowTriggerForm((prev) => !prev)}
    >
      <PlusCircle size={18} />
      Add Trigger
    </button>
  </div>

  {showTriggerForm && (
    <form className="goal-form" onSubmit={submitTrigger}>
      <div className="form-grid">
        <div className="form-field">
          <label>Linked Goal</label>
          <select
            name="goal_id"
            value={triggerForm.goal_id}
            onChange={handleTriggerChange}
          >
            <option value="">General Trigger</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.goal_title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Risk Level</label>
          <select
            name="risk_level"
            value={triggerForm.risk_level}
            onChange={handleTriggerChange}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="form-field full">
          <label>Trigger Name</label>
          <input
            name="trigger_name"
            value={triggerForm.trigger_name}
            onChange={handleTriggerChange}
            required
            placeholder="Example: Family conflict"
          />
        </div>

        <div className="form-field">
          <label>Trigger Type</label>
          <select
            name="trigger_type"
            value={triggerForm.trigger_type}
            onChange={handleTriggerChange}
          >
            <option>Behavioral</option>
            <option>Environmental</option>
            <option>Family</option>
            <option>Medication</option>
            <option>Substance Use</option>
            <option>Trauma</option>
            <option>Sleep</option>
          </select>
        </div>

        <div className="form-field full">
          <label>Warning Signs</label>
          <textarea
            name="warning_signs"
            value={triggerForm.warning_signs}
            onChange={handleTriggerChange}
          />
        </div>

        <div className="form-field full">
          <label>Coping Skill</label>
          <textarea
            name="coping_skill"
            value={triggerForm.coping_skill}
            onChange={handleTriggerChange}
          />
        </div>

        <div className="form-field full">
          <label>Staff Response</label>
          <textarea
            name="staff_response"
            value={triggerForm.staff_response}
            onChange={handleTriggerChange}
          />
        </div>

        <div className="button-row">
          <button className="primary-btn" type="submit">
            <Save size={18} />
            Save Trigger
          </button>
          <button
            className="secondary-btn"
            type="button"
            onClick={() => setShowTriggerForm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )}

  <div className="goal-list">
    {triggers.length === 0 && (
      <div className="empty-state">No triggers found.</div>
    )}

    {triggers.map((item) => (
      <article className="goal-card" key={item.id}>
        <div className="goal-top">
          <div>
            <h3>{item.trigger_name}</h3>
            <p>{item.warning_signs || "No warning signs documented."}</p>
          </div>
        </div>

        <div className="chip-row">
          <span className={`chip ${priorityClass(item.risk_level)}`}>
            {item.risk_level || "LOW"} Risk
          </span>
          <span className="chip">{item.trigger_type || "Type"}</span>
          <span className="chip green">{item.status || "ACTIVE"}</span>
        </div>

        <div className="goal-details">
          <div className="detail-block">
            <h4>Coping Skill</h4>
            <p>{item.coping_skill || "No coping skill entered."}</p>
          </div>

          <div className="detail-block">
            <h4>Staff Response</h4>
            <p>{item.staff_response || "No staff response entered."}</p>
          </div>
        </div>
      </article>
    ))}
  </div>
</section>

<section className="premium-card">
  <div className="card-header">
    <div>
      <p>Follow-up Tasks</p>
      <h2>Tasks & Reviews</h2>
    </div>

    <button
      className="primary-btn"
      type="button"
      onClick={() => setShowTaskForm((prev) => !prev)}
    >
      <PlusCircle size={18} />
      Add Task
    </button>
  </div>

  {showTaskForm && (
    <form className="goal-form" onSubmit={submitTask}>
      <div className="form-grid">
        <div className="form-field">
          <label>Linked Goal</label>
          <select
            name="goal_id"
            value={taskForm.goal_id}
            onChange={handleTaskChange}
          >
            <option value="">General Task</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.goal_title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Linked Intervention</label>
          <select
            name="intervention_id"
            value={taskForm.intervention_id}
            onChange={handleTaskChange}
          >
            <option value="">No Intervention</option>
            {interventions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.intervention_title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field full">
          <label>Task Title</label>
          <input
            name="task_title"
            value={taskForm.task_title}
            onChange={handleTaskChange}
            required
            placeholder="Example: BHP review medication compliance goal"
          />
        </div>

        <div className="form-field">
          <label>Assigned Role</label>
          <select
            name="assigned_role"
            value={taskForm.assigned_role}
            onChange={handleTaskChange}
          >
            <option>BHT</option>
            <option>BHP</option>
            <option>Nurse</option>
            <option>Case Manager</option>
            <option>Clinical Director</option>
            <option>Program Manager</option>
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
          </select>
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
          <label>Task Description</label>
          <textarea
            name="task_description"
            value={taskForm.task_description}
            onChange={handleTaskChange}
          />
        </div>

        <div className="button-row">
          <button className="primary-btn" type="submit">
            <Save size={18} />
            Save Task
          </button>

          <button
            className="secondary-btn"
            type="button"
            onClick={() => setShowTaskForm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )}

  <div className="goal-list">
    {tasks.length === 0 && (
      <div className="empty-state">No follow-up tasks found.</div>
    )}

    {tasks.map((task) => (
      <article
        className={`goal-card ${
          task.status === "COMPLETED" ? "completed" : ""
        }`}
        key={task.id}
      >
        <div className="goal-top">
          <div>
            <h3>{task.task_title}</h3>
            <p>{task.task_description || "No task description entered."}</p>
          </div>

          {task.status !== "COMPLETED" && (
            <button
              className="success-btn"
              type="button"
              onClick={() => completeTask(task.id)}
            >
              <CheckCircle2 size={18} />
              Complete
            </button>
          )}
        </div>

        <div className="chip-row">
          <span className={`chip ${priorityClass(task.priority)}`}>
            {task.priority || "MEDIUM"}
          </span>
          <span className="chip">{task.assigned_role || "Role"}</span>
          <span className="chip">{task.status || "OPEN"}</span>
          <span className="chip">
            Due {task.due_date || "Not Set"}
          </span>
        </div>
      </article>
    ))}
  </div>
</section>

<section className="premium-card">
  <div className="card-header">
    <div>
      <p>Clinical Review</p>
      <h2>Review & Signature</h2>
    </div>

    <ShieldCheck size={30} color="#2563eb" />
  </div>

  <div className="button-row">
    <button
      className="secondary-btn"
      type="button"
      onClick={() => setShowReviewBox((prev) => !prev)}
    >
      <ClipboardCheck size={18} />
      Record Review
    </button>

    <button
      className="success-btn"
      type="button"
      onClick={signTreatmentPlan}
    >
      <ShieldCheck size={18} />
      Sign Treatment Plan
    </button>

    <button
      className="secondary-btn"
      type="button"
      onClick={openTreatmentPlanPdf}
    >
      <FileText size={18} />
      PDF
    </button>
  </div>

  {showReviewBox && (
    <div className="goal-form" style={{ marginTop: 18 }}>
      <div className="form-grid">
        <div className="form-field">
          <label>Review Date</label>
          <input
            type="date"
            name="review_date"
            value={reviewForm.review_date}
            onChange={handleReviewChange}
          />
        </div>

        <div className="form-field">
          <label>Next Review Date</label>
          <input
            type="date"
            name="next_review_date"
            value={reviewForm.next_review_date}
            onChange={handleReviewChange}
          />
        </div>

        <div className="form-field full">
          <label>Review Comments</label>
          <textarea
            name="comments"
            value={reviewForm.comments}
            onChange={handleReviewChange}
            placeholder="Enter BHP review comments, goal progress, barriers, and next steps..."
          />
        </div>

        <div className="button-row">
          <button
            className="primary-btn"
            type="button"
            onClick={submitReview}
          >
            <Save size={18} />
            Save Review
          </button>
        </div>
      </div>
    </div>
  )}
</section>

        </div>

        <aside className="side-stack">
          <section className="premium-card">
            <div className="card-header">
              <div>
                <p>Resident Snapshot</p>
                <h2>Clinical Overview</h2>
              </div>
              <UserCheck size={30} color="#2563eb" />
            </div>

            {!selectedResident ? (
              <div className="empty-state">No resident selected.</div>
            ) : (
              <>
                <div className="snapshot-row">
                  <span>Name</span>
                  <strong>{residentName(selectedResident)}</strong>
                </div>
                <div className="snapshot-row">
                  <span>Diagnosis</span>
                  <strong>{selectedResident.primary_diagnosis || "Not listed"}</strong>
                </div>
                <div className="snapshot-row">
                  <span>Case Manager</span>
                  <strong>{selectedResident.assigned_case_manager || "Not assigned"}</strong>
                </div>
                <div className="snapshot-row">
                  <span>BHP</span>
                  <strong>{selectedResident.assigned_bhp || "Not assigned"}</strong>
                </div>
                <div className="snapshot-row">
                  <span>PCP</span>
                  <strong>{selectedResident.assigned_pcp || "Not assigned"}</strong>
                </div>
              </>
            )}
          </section>

          <section className="premium-card">
            <div className="card-header">
              <div>
                <p>Treatment Timeline</p>
                <h2>Recent Activity</h2>
              </div>
              <Layers size={30} color="#2563eb" />
            </div>

            <div className="timeline-list">
              {timeline.length === 0 && (
                <div className="empty-state">No timeline activity found.</div>
              )}

              {timeline.slice(0, 10).map((item, index) => (
                <div className="timeline-item" key={index}>
                  <strong>{item.type}</strong>
                  <span>{item.title}</span>
                  <span>{item.date ? String(item.date).slice(0, 10) : ""}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
