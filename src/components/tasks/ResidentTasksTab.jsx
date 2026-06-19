import { useEffect, useMemo, useState } from "react";
import { CheckSquare, Plus, RefreshCw, X, AlertTriangle } from "lucide-react";
import api from "../../services/api";
import TaskForm from "./TaskForm";

const taskTypes = [
  "ALL",
  "ASSESSMENT_DUE",
  "TREATMENT_PLAN_REVIEW",
  "SERVICE_PLAN_REVIEW",
  "CRISIS_PLAN_REVIEW",
  "CFT_MEETING",
  "MEDICATION_REVIEW",
  "DOCTOR_APPOINTMENT",
  "COURT_APPOINTMENT",
  "LAB_FOLLOW_UP",
  "COMPLIANCE_FOLLOW_UP",
  "CUSTOM",
];

export default function ResidentTasksTab({ resident = {}, residentId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    loadTasks();
  }, [residentId]);

  async function loadTasks() {
    if (!residentId) return;

    try {
      setLoading(true);
      const res = await api.get(`/tasks?resident_id=${residentId}`);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function completeTask(taskId) {
    try {
      await api.patch(`/tasks/${taskId}`, {
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
      });
      loadTasks();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to complete task.");
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (typeFilter === "ALL") return true;
      return `${task.task_type || ""}`.toUpperCase() === typeFilter;
    });
  }, [tasks, typeFilter]);

  const openTasks = filteredTasks.filter((t) => !["COMPLETED", "CANCELLED"].includes(`${t.status || ""}`.toUpperCase()));
  const overdueTasks = openTasks.filter((t) => t.due_date && new Date(t.due_date) < new Date());
  const dueTodayTasks = openTasks.filter((t) => isToday(t.due_date));

  return (
    <div className="assessment-workspace resident-tasks-tab">
      <div className="assessment-hero tasks-hero">
        <div>
          <p className="dashboard-eyebrow">Resident Case Management</p>
          <h2>Tasks</h2>
          <p>
            Track resident follow-ups, compliance actions, appointments,
            reviews, medication checks, and staff responsibilities.
          </p>
        </div>

        <div className="medication-action-row">
          <button type="button" className="secondary-btn" onClick={loadTasks}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button type="button" className="primary-btn" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      <div className="compliance-summary-grid">
        <MetricCard title="Open Tasks" value={openTasks.length} tone="blue" />
        <MetricCard title="Due Today" value={dueTodayTasks.length} tone="amber" />
        <MetricCard title="Overdue" value={overdueTasks.length} tone="red" />
      </div>

      <div className="calendar-toolbar">
        <div>
          <h3>Resident Task List</h3>
          <p className="empty-text">{filteredTasks.length} task(s)</p>
        </div>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {taskTypes.map((type) => (
            <option key={type} value={type}>
              {formatType(type)}
            </option>
          ))}
        </select>
      </div>

      <section className="assessment-history-panel">
        {loading ? (
          <div className="table-empty">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <CheckSquare size={34} />
            <p>No tasks found.</p>
          </div>
        ) : (
          <div className="task-card-list">
            {filteredTasks.map((task) => {
              const overdue =
                task.due_date &&
                new Date(task.due_date) < new Date() &&
                `${task.status || ""}`.toUpperCase() !== "COMPLETED";

              return (
                <div key={task.id} className={`task-card ${overdue ? "overdue" : ""}`}>
                  <div className="task-card-icon">
                    {overdue ? <AlertTriangle size={22} /> : <CheckSquare size={22} />}
                  </div>

                  <div className="task-card-main">
                    <div className="task-card-head">
                      <div>
                        <h3>{task.title || "Resident Task"}</h3>
                        <p>{task.description || "—"}</p>
                      </div>

                      <span className={`status-badge ${`${task.status || "PENDING"}`.toLowerCase()}`}>
                        {task.status || "PENDING"}
                      </span>
                    </div>

                    <div className="task-meta-row">
                      <span>{formatType(task.task_type || "CUSTOM")}</span>
                      <span>Due: {formatDate(task.due_date)}</span>
                      <span>Assigned: {task.assigned_to || "—"}</span>
                      <span>Priority: {task.priority || "NORMAL"}</span>
                    </div>

                    {`${task.status || ""}`.toUpperCase() !== "COMPLETED" && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => completeTask(task.id)}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-backdrop nested-modal">
          <div className="premium-modal assessment-modal">
            <div className="modal-header">
              <div>
                <p className="dashboard-eyebrow">Resident Task</p>
                <h2>Create Task</h2>
              </div>

              <button className="icon-close" type="button" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              <TaskForm
                resident={resident}
                residentId={residentId}
                onSaved={() => {
                  setShowForm(false);
                  loadTasks();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, tone }) {
  return (
    <div className={`compliance-metric-card ${tone}`}>
      <strong>{value}</strong>
      <span>{title}</span>
      <p>Resident task tracking</p>
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