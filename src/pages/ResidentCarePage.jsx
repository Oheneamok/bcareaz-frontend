import React, { useEffect, useState } from "react";
import {
  Pill,
  FileText,
  UsersRound,
  Clock,
  Activity,
  Target,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const careModules = [
  {
    title: "Medication",
    description: "Medication pass, eMAR, refusals and medication tasks.",
    path: "/medications",
    icon: Pill,
  },
  {
    title: "Progress Notes",
    description: "Daily resident progress notes and documentation.",
    path: "/progress-notes",
    icon: FileText,
  },
  {
    title: "Group Notes",
    description: "Morning and evening group discussion notes.",
    path: "/group-notes",
    icon: UsersRound,
  },
  {
    title: "Hourly Activity Log",
    description: "Hourly resident activity, location and observation logs.",
    path: "/resident-activity-logs",
    icon: Clock,
  },
  {
    title: "Daily Activities",
    description: "ADLs, resident activities, meals, hygiene and participation.",
    path: "/daily-activities",
    icon: Activity,
  },
  {
    title: "Treatment Activities",
    description: "Treatment plan goals, interventions and task follow-up.",
    path: "/treatment-activities",
    icon: Target,
  },
];

export default function ResidentCarePage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get("/workflow/tasks/today").then((res) => {
      const residentTasks = (res.data || []).filter((task) => task.resident_id);
      setTasks(residentTasks);
    });

    api.get("/workflow/dashboard").then((res) => {
      setDashboard(res.data);
    });
  }, []);

  return (
    <div className="resident-care-page">
      <section className="resident-care-hero">
        <div>
          <p className="portal-kicker">Resident Care Portal</p>
          <h1>Today’s Resident Care</h1>
          <p>
            Medication, progress notes, group notes, hourly logs, daily
            activities and treatment plan activities in one workspace.
          </p>
        </div>

        <div className="resident-care-score">
          <span>Completion</span>
          <strong>{dashboard?.today?.completion_percent ?? 0}%</strong>
          <p>{dashboard?.today?.completed ?? 0} completed today</p>
        </div>
      </section>

      <section className="resident-care-stats">
        <div>
          <span>Resident Tasks</span>
          <strong>{tasks.length}</strong>
        </div>
        <div>
          <span>Open Today</span>
          <strong>{tasks.filter((t) => t.status === "OPEN").length}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>{tasks.filter((t) => t.status === "COMPLETED").length}</strong>
        </div>
        <div>
          <span>High Priority</span>
          <strong>
            {tasks.filter((t) => t.priority === "HIGH" || t.priority === "URGENT").length}
          </strong>
        </div>
      </section>

      <section className="resident-care-grid">
        {careModules.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="resident-care-card"
              type="button"
              onClick={() => navigate(item.path)}
            >
              <div className="resident-care-icon">
                <Icon size={30} />
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <span>
                Open <ChevronRight size={18} />
              </span>
            </button>
          );
        })}
      </section>

      <section className="resident-care-panel">
        <div className="panel-header">
          <div>
            <p className="portal-kicker">Workflow Engine</p>
            <h2>Resident Tasks Due Today</h2>
          </div>
          <button type="button" onClick={() => navigate("/tasks")}>
            View All Tasks
          </button>
        </div>

        <div className="resident-task-list">
          {tasks.length === 0 && (
            <div className="empty-state">
              <ClipboardCheck size={34} />
              <p>No resident care tasks found for today.</p>
            </div>
          )}

          {tasks.slice(0, 12).map((task) => (
            <div className="resident-task-row" key={task.id}>
              <div>
                <strong>{task.title}</strong>
                <p>
                  {task.source_module} • {task.task_type}
                </p>
              </div>
              <span className={`task-status ${task.status?.toLowerCase()}`}>
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}