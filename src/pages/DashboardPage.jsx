import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  UserMinus,
  ShieldAlert,
  ClipboardCheck,
  FileSignature,
  Bell,
  CalendarDays,
  CheckSquare,
  FileLock2,
} from "lucide-react";

import api from "../services/api";

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [
        overviewRes,
        complianceRes,
        documentsRes,
        tasksRes,
        notificationsRes,
        calendarRes,
      ] = await Promise.all([
        api.get("/dashboard/overview"),
        api.get("/dashboard/compliance"),
        api.get("/dashboard/documents"),
        api.get("/tasks/dashboard"),
        api.get("/notifications/summary"),
        api.get("/calendar/upcoming"),
      ]);

      setOverview(overviewRes.data);
      setCompliance(complianceRes.data);
      setDocuments(documentsRes.data);
      setTasks(tasksRes.data);
      setNotifications(notificationsRes.data);
      setUpcomingEvents(calendarRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!overview) {
    return (
      <div className="dashboard-loading">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Hero */}

      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">
            Behavioral Health Operations
          </p>

          <h1>Executive Dashboard</h1>

          <p>
            Real-time clinical, compliance, staffing,
            documentation, and operational visibility.
          </p>
        </div>

        <div
          className={`status-chip ${overview.overall_status?.toLowerCase()}`}
        >
          {overview.overall_status}
        </div>
      </section>

      {/* KPI GRID */}

      <section className="dashboard-kpis">
        <StatCard
          title="Residents"
          value={overview.residents.active}
          icon={<Users />}
        />

        <StatCard
          title="Admissions"
          value={overview.residents.admissions_this_month}
          icon={<UserPlus />}
        />

        <StatCard
          title="Discharges"
          value={overview.residents.discharges_this_month}
          icon={<UserMinus />}
        />

        <StatCard
          title="Active Staff"
          value={overview.staff.active}
          icon={<ClipboardCheck />}
        />

        <StatCard
          title="Open Alerts"
          value={overview.alerts.total_open}
          icon={<ShieldAlert />}
        />

        <StatCard
          title="Critical Alerts"
          value={overview.alerts.critical}
          icon={<ShieldAlert />}
          danger
        />

        <StatCard
          title="Pending Signatures"
          value={overview.signatures.pending}
          icon={<FileSignature />}
        />

        <StatCard
          title="Locked Documents"
          value={overview.documents.locked}
          icon={<FileLock2 />}
        />
      </section>

      {/* SECOND ROW */}

      <section className="dashboard-grid">
        <div className="premium-panel">
          <div className="panel-header">
            <h3>Compliance Score</h3>
            <ClipboardCheck size={18} />
          </div>

          <div className="compliance-score">
            {compliance?.overall?.compliance_score ?? 0}%
          </div>

          <div className="compliance-status">
            {compliance?.overall?.status}
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${compliance?.overall?.compliance_score ?? 0}%`,
              }}
            />
          </div>
        </div>

        <div className="premium-panel">
          <div className="panel-header">
            <h3>Tasks</h3>
            <CheckSquare size={18} />
          </div>

          <DashboardMetric
            label="Open Tasks"
            value={tasks?.open ?? 0}
          />

          <DashboardMetric
            label="Due Today"
            value={tasks?.due_today ?? 0}
          />

          <DashboardMetric
            label="Overdue"
            value={tasks?.overdue ?? 0}
          />

          <DashboardMetric
            label="High Priority"
            value={tasks?.high_priority ?? 0}
          />
        </div>

        <div className="premium-panel">
          <div className="panel-header">
            <h3>Notifications</h3>
            <Bell size={18} />
          </div>

          <DashboardMetric
            label="Unread"
            value={notifications?.unread ?? 0}
          />

          <DashboardMetric
            label="High Priority"
            value={notifications?.high_priority ?? 0}
          />
        </div>
      </section>

      {/* DOCUMENTS */}

      <section className="dashboard-grid">
        <div className="premium-panel wide">
          <div className="panel-header">
            <h3>Document Status</h3>
            <FileSignature size={18} />
          </div>

          <DashboardMetric
            label="Total Documents"
            value={documents?.documents?.total ?? 0}
          />

          <DashboardMetric
            label="Signed Documents"
            value={documents?.documents?.signed ?? 0}
          />

          <DashboardMetric
            label="Locked Documents"
            value={documents?.documents?.locked ?? 0}
          />

          <DashboardMetric
            label="Pending Signatures"
            value={documents?.signatures?.pending ?? 0}
          />
        </div>

        <div className="premium-panel">
          <div className="panel-header">
            <h3>Upcoming Events</h3>
            <CalendarDays size={18} />
          </div>

          {upcomingEvents.length === 0 && (
            <p className="empty-text">
              No upcoming events.
            </p>
          )}

          {upcomingEvents.slice(0, 6).map((event) => (
            <div
              key={event.id}
              className="event-row"
            >
              <div>
                <strong>{event.title}</strong>
                <p>{event.event_type}</p>
              </div>

              <span>
                {new Date(
                  event.start_time
                ).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, danger }) {
  return (
    <div className={`stat-card ${danger ? "danger" : ""}`}>
      <div className="stat-icon">{icon}</div>

      <div>
        <p>{title}</p>
        <h2>{value ?? 0}</h2>
      </div>
    </div>
  );
}

function DashboardMetric({ label, value }) {
  return (
    <div className="dashboard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}