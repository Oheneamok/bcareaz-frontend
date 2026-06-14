import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CheckSquare,
  Clock,
  Filter,
  Flame,
  Search,
} from "lucide-react";

import api from "../services/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);

      const [tasksRes, summaryRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/tasks/dashboard"),
      ]);

      setTasks(tasksRes.data || []);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      alert("Unable to complete task.");
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = search.toLowerCase();

      const matchesSearch =
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.task_type?.toLowerCase().includes(query);

      const matchesStatus = status ? task.status === status : true;
      const matchesPriority = priority ? task.priority === priority : true;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, status, priority]);

  return (
    <div className="tasks-page">
      <section className="resident-hero">
        <div>
          <p className="dashboard-eyebrow">Workflow Center</p>
          <h1>Tasks</h1>
          <p>
            Track compliance tasks, signature follow-ups, staff assignments,
            resident care actions, and facility work queues.
          </p>
        </div>
      </section>

      <section className="resident-summary-grid task-summary-grid">
        <SummaryCard
          title="Open Tasks"
          value={summary?.open ?? 0}
          icon={<CheckSquare />}
        />

        <SummaryCard
          title="Due Today"
          value={summary?.due_today ?? 0}
          icon={<Clock />}
        />

        <SummaryCard
          title="Overdue"
          value={summary?.overdue ?? 0}
          icon={<Flame />}
          danger
        />

        <SummaryCard
          title="Completed"
          value={summary?.completed ?? 0}
          icon={<CheckCircle2 />}
        />
      </section>

      <section className="resident-toolbar">
        <div className="resident-search">
          <Search size={18} />
          <input
            placeholder="Search tasks by title, type, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </section>

      <section className="premium-table-card">
        <div className="table-header">
          <div>
            <h3>Task Work Queue</h3>
            <p>{filteredTasks.length} task(s)</p>
          </div>

          <div className="table-header-icon">
            <Filter size={18} />
          </div>
        </div>

        {loading ? (
          <div className="table-empty">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="table-empty">No tasks found.</div>
        ) : (
          <div className="task-board">
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
    </div>
  );
}

function TaskCard({ task, onComplete }) {
  const overdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;

  return (
    <div className={`task-card ${overdue ? "overdue" : ""}`}>
      <div className="task-card-top">
        <div>
          <span className={`priority-chip ${task.priority?.toLowerCase()}`}>
            {task.priority || "NORMAL"}
          </span>

          <h3>{task.title}</h3>

          <p>{task.description || "No description provided."}</p>
        </div>

        <span className={`status-badge ${task.status?.toLowerCase()}`}>
          {task.status}
        </span>
      </div>

      <div className="task-meta">
        <span>Type: {task.task_type}</span>
        <span>Due: {formatDate(task.due_date)}</span>
      </div>

      <div className="task-actions">
        {!task.is_completed ? (
          <button onClick={onComplete}>
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
  );
}

function SummaryCard({ title, value, icon, danger }) {
  return (
    <div className={`resident-summary-card ${danger ? "summary-danger" : ""}`}>
      <div className="summary-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value ?? 0}</h2>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}