import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Clock,
  Filter,
  Flame,
  ListChecks,
  RefreshCw,
  Search,
  Sparkles,
  Plus,
} from "lucide-react";

import api from "../services/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [savingTask, setSavingTask] = useState(false);

	const [taskForm, setTaskForm] = useState({
	  title: "",
	  task_type: "CUSTOM",
	  assigned_to: "",
	  priority: "NORMAL",
	  due_date: "",
	  description: "",
	  status: "OPEN",
	});


  useEffect(() => {
    loadTasks();
  }, []);

  function showToast(type, title, message) {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadTasks() {
    try {
      setLoading(true);

      const [tasksRes, summaryRes] = await Promise.allSettled([
        api.get("/tasks"),
        api.get("/tasks/dashboard"),
      ]);

      setTasks(
        tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value.data)
          ? tasksRes.value.data
          : []
      );

      setSummary(
        summaryRes.status === "fulfilled" ? summaryRes.value.data : null
      );
    } catch (err) {
      console.error(err);
      showToast("error", "Unable to Load Tasks", "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function completeTask(taskId) {
    try {
      await api.patch(`/tasks/${taskId}/complete`, {
        completion_notes: "Completed from admin dashboard.",
      });

      await loadTasks();
      showToast("success", "Task Completed", "The task was marked complete.");
    } catch (err) {
      console.error(err);
      showToast("error", "Unable to Complete Task", "Please try again.");
    }
  }


	async function createTask(e) {
	  e.preventDefault();

	  if (!taskForm.title || !taskForm.due_date) {
		showToast("error", "Missing Required Fields", "Task title and due date are required.");
		return;
	  }

	  try {
		setSavingTask(true);

		await api.post("/tasks", {
		  title: taskForm.title,
		  task_type: taskForm.task_type,
		  assigned_to: taskForm.assigned_to,
		  priority: taskForm.priority,
		  due_date: taskForm.due_date,
		  description: taskForm.description,
		  status: taskForm.status,
		  form_data: taskForm,
		});

		setTaskForm({
		  title: "",
		  task_type: "CUSTOM",
		  assigned_to: "",
		  priority: "NORMAL",
		  due_date: "",
		  description: "",
		  status: "OPEN",
		});

		setShowForm(false);
		await loadTasks();
		showToast("success", "Task Created", "The task was added successfully.");
	  } catch (err) {
		console.error(err);
		showToast("error", "Unable to Create Task", "Please try again.");
	  } finally {
		setSavingTask(false);
	  }
	}
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.task_type?.toLowerCase().includes(query) ||
        task.assigned_to?.toLowerCase().includes(query);

      const matchesStatus = status ? task.status === status : true;
      const matchesPriority = priority ? task.priority === priority : true;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, status, priority]);

  const metrics = useMemo(() => {
    const open =
      summary?.open ??
      tasks.filter((t) => !t.is_completed && t.status !== "COMPLETED").length;

    const completed =
      summary?.completed ??
      tasks.filter((t) => t.is_completed || t.status === "COMPLETED").length;

    const overdue =
      summary?.overdue ??
      tasks.filter(
        (t) =>
          t.due_date &&
          new Date(t.due_date) < new Date() &&
          !t.is_completed &&
          t.status !== "COMPLETED"
      ).length;

    const dueToday =
      summary?.due_today ?? tasks.filter((t) => isToday(t.due_date)).length;

    return { open, completed, overdue, dueToday };
  }, [summary, tasks]);

  return (
    <div className="tasks-page premium-tasks-page">
      {toast && (
        <div className={`premium-toast ${toast.type}`}>
          <div className="premium-toast-icon">
            {toast.type === "error" ? "!" : "✓"}
          </div>
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button type="button" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}

      <section className="tasks-premium-hero">
        <div>
          <p className="dashboard-eyebrow">
            <Sparkles size={15} />
            Workflow Center
          </p>
          <h1>Tasks</h1>
          <p>
            Track compliance tasks, signature follow-ups, staff assignments,
            resident care actions, and facility work queues.
          </p>
        </div>

        <button type="button" onClick={loadTasks}>
          <RefreshCw size={17} />
          Refresh Tasks
        </button>
		
		<button type="button" onClick={() => setShowForm(true)}>
		  <Plus size={17} />
		  New Task
		</button>
      </section>

      <section className="tasks-metric-grid">
        <SummaryCard
          title="Open Tasks"
          value={metrics.open}
          helper="Needs attention"
          icon={<CheckSquare />}
          tone="blue"
        />
        <SummaryCard
          title="Due Today"
          value={metrics.dueToday}
          helper="Scheduled for today"
          icon={<Clock />}
          tone="amber"
        />
        <SummaryCard
          title="Overdue"
          value={metrics.overdue}
          helper="Past due date"
          icon={<Flame />}
          tone={metrics.overdue ? "red" : "green"}
        />
        <SummaryCard
          title="Completed"
          value={metrics.completed}
          helper="Closed tasks"
          icon={<CheckCircle2 />}
          tone="green"
        />
      </section>

      <section className="tasks-status-tabs">
        <TaskFilterButton
          label="All Tasks"
          value=""
          active={status === ""}
          icon={<ListChecks />}
          tone="blue"
          onClick={() => setStatus("")}
        />
        <TaskFilterButton
          label="Open"
          value="OPEN"
          active={status === "OPEN"}
          icon={<CheckSquare />}
          tone="blue"
          onClick={() => setStatus("OPEN")}
        />
        <TaskFilterButton
          label="In Progress"
          value="IN_PROGRESS"
          active={status === "IN_PROGRESS"}
          icon={<Clock />}
          tone="amber"
          onClick={() => setStatus("IN_PROGRESS")}
        />
        <TaskFilterButton
          label="Completed"
          value="COMPLETED"
          active={status === "COMPLETED"}
          icon={<CheckCircle2 />}
          tone="green"
          onClick={() => setStatus("COMPLETED")}
        />
      </section>

      <section className="tasks-toolbar">
        <div className="tasks-search">
          <Search size={18} />
          <input
            placeholder="Search tasks by title, type, description, or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </section>

      <section className="tasks-workqueue-card">
        <div className="tasks-table-header">
          <div>
            <p className="dashboard-eyebrow">Work Queue</p>
            <h3>Task Work Queue</h3>
            <span>{filteredTasks.length} task(s)</span>
          </div>

          <div className="table-header-icon">
            <Filter size={18} />
          </div>
        </div>

        {loading ? (
          <div className="table-empty">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <CheckSquare size={36} />
            <p>No tasks found.</p>
          </div>
        ) : (
          <div className="tasks-board">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={() => completeTask(task.id)}
              />
            ))}
          </div>
        )}
      </section>
	  {showForm && (
		  <div className="modal-backdrop nested-modal">
			<div className="premium-modal assessment-modal">
			  <div className="modal-header">
				<div>
				  <p className="dashboard-eyebrow">Task Management</p>
				  <h2>Create New Task</h2>
				</div>

				<button className="icon-close" type="button" onClick={() => setShowForm(false)}>
				  ×
				</button>
			  </div>

			  <form className="assessment-modal-body assessment-form" onSubmit={createTask}>
				<section className="assessment-section">
				  <h3>Task Information</h3>

				  <div className="assessment-grid">
					<div className="assessment-field">
					  <label>Task Title</label>
					  <input
						value={taskForm.title}
						onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
					  />
					</div>

					<div className="assessment-field">
					  <label>Task Type</label>
					  <select
						value={taskForm.task_type}
						onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
					  >
						<option value="ASSESSMENT_DUE">Assessment Due</option>
						<option value="TREATMENT_PLAN_REVIEW">Treatment Plan Review</option>
						<option value="SERVICE_PLAN_REVIEW">Service Plan Review</option>
						<option value="CRISIS_PLAN_REVIEW">Crisis Plan Review</option>
						<option value="CFT_MEETING">CFT Meeting</option>
						<option value="MEDICATION_REVIEW">Medication Review</option>
						<option value="DOCTOR_APPOINTMENT">Doctor Appointment</option>
						<option value="COURT_APPOINTMENT">Court Appointment</option>
						<option value="LAB_FOLLOW_UP">Lab Follow-Up</option>
						<option value="COMPLIANCE_FOLLOW_UP">Compliance Follow-Up</option>
						<option value="CUSTOM">Custom</option>
					  </select>
					</div>

					<div className="assessment-field">
					  <label>Assigned To</label>
					  <input
						value={taskForm.assigned_to}
						onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
					  />
					</div>

					<div className="assessment-field">
					  <label>Priority</label>
					  <select
						value={taskForm.priority}
						onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
					  >
						<option value="LOW">Low</option>
						<option value="NORMAL">Normal</option>
						<option value="HIGH">High</option>
						<option value="CRITICAL">Critical</option>
					  </select>
					</div>

					<div className="assessment-field">
					  <label>Due Date</label>
					  <input
						type="date"
						value={taskForm.due_date}
						onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
					  />
					</div>

					<div className="assessment-field">
					  <label>Status</label>
					  <select
						value={taskForm.status}
						onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
					  >
						<option value="OPEN">Open</option>
						<option value="PENDING">Pending</option>
						<option value="IN_PROGRESS">In Progress</option>
					  </select>
					</div>

					<div className="assessment-field full">
					  <label>Description</label>
					  <textarea
						value={taskForm.description}
						onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
					  />
					</div>
				  </div>
				</section>

				<div className="assessment-actions">
				  <button type="submit" className="primary-btn" disabled={savingTask}>
					{savingTask ? "Saving..." : "Create Task"}
				  </button>
				</div>
			  </form>
			</div>
		  </div>
		)}
    </div>
  );
}

function TaskFilterButton({ label, active, icon, tone, onClick }) {
  return (
    <button
      type="button"
      className={`task-filter-tab ${tone} ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span>{icon}</span>
      <strong>{label}</strong>
    </button>
  );
}

function TaskCard({ task, onComplete }) {
  const completed = task.is_completed || task.status === "COMPLETED";
  const overdue = task.due_date && new Date(task.due_date) < new Date() && !completed;

  return (
    <div className={`premium-task-card ${overdue ? "overdue" : ""}`}>
      <div className="premium-task-icon">
        {overdue ? <AlertTriangle size={22} /> : <CheckSquare size={22} />}
      </div>

      <div className="premium-task-main">
        <div className="premium-task-head">
          <div>
            <span className={`priority-chip ${task.priority?.toLowerCase()}`}>
              {task.priority || "NORMAL"}
            </span>
            <h3>{task.title || "Untitled Task"}</h3>
            <p>{task.description || "No description provided."}</p>
          </div>

          <span className={`status-badge ${task.status?.toLowerCase()}`}>
            {task.status || "OPEN"}
          </span>
        </div>

        <div className="premium-task-meta">
          <span>Type: {formatType(task.task_type || "CUSTOM")}</span>
          <span>Due: {formatDate(task.due_date)}</span>
          <span>Assigned: {task.assigned_to || "—"}</span>
        </div>

        <div className="premium-task-actions">
          {!completed ? (
            <button type="button" onClick={onComplete}>
              <CheckCircle2 size={16} />
              Mark Complete
            </button>
          ) : (
            <span className="completed-label">
              <CheckCircle2 size={16} />
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, helper, icon, tone }) {
  return (
    <div className={`tasks-summary-card ${tone}`}>
      <div className="tasks-summary-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value ?? 0}</h2>
        <span>{helper}</span>
      </div>
    </div>
  );
}

function formatType(value) {
  return `${value || ""}`.replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function isToday(value) {
  if (!value) return false;
  const a = new Date(value);
  const b = new Date();
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}