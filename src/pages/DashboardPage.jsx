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
  ChevronRight,
  Activity,
  Sparkles,
} from "lucide-react";
import dashboardHero from "../assets/dashboard.png";

import api from "../services/api";

const kpiCards = [
  { key: "activeResidents", title: "Residents", icon: Users, tone: "blue" },
  { key: "admissions", title: "Admissions", icon: UserPlus, tone: "green" },
  { key: "discharges", title: "Discharges", icon: UserMinus, tone: "purple" },
  { key: "activeStaff", title: "Active Staff", icon: ClipboardCheck, tone: "cyan" },
  { key: "openAlerts", title: "Open Alerts", icon: ShieldAlert, tone: "orange" },
  { key: "criticalAlerts", title: "Critical Alerts", icon: ShieldAlert, tone: "red" },
  { key: "pendingSignatures", title: "Pending Signatures", icon: FileSignature, tone: "pink" },
  { key: "lockedDocuments", title: "Locked Documents", icon: FileLock2, tone: "indigo" },
];

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
      setUpcomingEvents(calendarRes.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  if (!overview) {
    return <div className="dashboard-loading">Loading Dashboard...</div>;
  }

  const kpiValues = {
    activeResidents: overview?.residents?.active ?? 0,
    admissions: overview?.residents?.admissions_this_month ?? 0,
    discharges: overview?.residents?.discharges_this_month ?? 0,
    activeStaff: overview?.staff?.active ?? 0,
    openAlerts: overview?.alerts?.total_open ?? 0,
    criticalAlerts: overview?.alerts?.critical ?? 0,
    pendingSignatures: overview?.signatures?.pending ?? 0,
    lockedDocuments: overview?.documents?.locked ?? 0,
  };

  const complianceScore = compliance?.overall?.compliance_score ?? 0;

  return (
    <div className="dashboard-page">
      <DashboardStyles />

      <section
  className="dashboard-hero"
		  style={{
			backgroundImage: `
			  linear-gradient(
				90deg,
				rgba(7,23,53,.96) 0%,
				rgba(29,78,216,.82) 45%,
				rgba(14,165,233,.35) 75%,
				rgba(14,165,233,.12) 100%
			  ),
			  url(${dashboardHero})
			`,
		  }}
		>
        <div className="hero-copy">
          <p className="dashboard-eyebrow">
            <Sparkles size={16} />
            Behavioral Health Operations
          </p>

          <h1>
			  Executive
			  <br />
			  Command Dashboard
			</h1>

          <p>
            Real-time visibility across residents, staff, compliance,
            documentation, tasks, alerts, signatures and daily operations.
          </p>

          <div className="hero-actions">
            <button type="button">
              View Operations <ChevronRight size={18} />
            </button>
            <button type="button" className="ghost">
              Compliance Center <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="hero-status-card">
          <div className="hero-status-icon">
            <Activity size={42} />
          </div>
          <span>Overall Status</span>
          <strong>{overview.overall_status || "ACTIVE"}</strong>
          <p>Facility operations snapshot</p>
        </div>
      </section>

      <section className="dashboard-kpis">
        {kpiCards.map((card) => (
          <StatCard
            key={card.key}
            title={card.title}
            value={kpiValues[card.key]}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="premium-panel compliance-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Inspection Readiness</p>
              <h3>Compliance Score</h3>
            </div>
            <ClipboardCheck size={24} />
          </div>

          <div className="score-circle" style={{ "--score": complianceScore }}>
            <strong>{complianceScore}%</strong>
          </div>

          <div className="compliance-status">
            {compliance?.overall?.status || "No status"}
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(complianceScore, 100)}%` }}
            />
          </div>
        </div>

        <div className="premium-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Workflow</p>
              <h3>Tasks</h3>
            </div>
            <CheckSquare size={24} />
          </div>

          <DashboardMetric label="Open Tasks" value={tasks?.open ?? 0} />
          <DashboardMetric label="Due Today" value={tasks?.due_today ?? 0} />
          <DashboardMetric label="Overdue" value={tasks?.overdue ?? 0} />
          <DashboardMetric label="High Priority" value={tasks?.high_priority ?? 0} />
        </div>

        <div className="premium-panel alert-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Messages</p>
              <h3>Notifications</h3>
            </div>
            <Bell size={24} />
          </div>

          <DashboardMetric label="Unread" value={notifications?.unread ?? 0} />
          <DashboardMetric
            label="High Priority"
            value={notifications?.high_priority ?? 0}
          />
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="premium-panel wide document-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Records</p>
              <h3>Document Status</h3>
            </div>
            <FileSignature size={24} />
          </div>

          <div className="mini-grid">
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
        </div>

        <div className="premium-panel events-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Calendar</p>
              <h3>Upcoming Events</h3>
            </div>
            <CalendarDays size={24} />
          </div>

          {upcomingEvents.length === 0 && (
            <div className="empty-events">
              <CalendarDays size={42} />
              <p>No upcoming events.</p>
            </div>
          )}

          {upcomingEvents.slice(0, 6).map((event) => (
            <div key={event.id} className="event-row">
              <div>
                <strong>{event.title}</strong>
                <p>{event.event_type}</p>
              </div>

              <span>{new Date(event.start_time).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, tone }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">
        <Icon size={42} />
      </div>

      <div className="stat-content">
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

function DashboardStyles() {
  return (
    <style>{`
      html, body, #root {
        width: 100%;
        min-height: 100%;
      }

      .dashboard-loading {
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-weight: 900;
        color: #0f172a;
        background: #eef6ff;
      }

      .dashboard-page {
        width: 100%;
        max-width: none;
        min-height: 100vh;
        margin: 0;
        padding: 28px 32px 44px;
        color: #071735;
        background:
          radial-gradient(circle at top left, rgba(59,130,246,.28), transparent 28%),
          radial-gradient(circle at bottom right, rgba(147,197,253,.35), transparent 32%),
          linear-gradient(135deg, #eaf4ff 0%, #f8fbff 52%, #dcecff 100%);
      }

		.dashboard-hero{

		position:relative;

		display:flex;

		justify-content:space-between;

		align-items:center;

		gap:40px;

		min-height:380px;

		padding:46px;

		margin-bottom:30px;

		border-radius:34px;

		overflow:hidden;

		background-size:cover;

		background-position:center right;

		background-repeat:no-repeat;

		box-shadow:
		0 32px 90px rgba(15,23,42,.24);

		}

		.dashboard-hero::before{

		content:"";

		position:absolute;

		inset:0;

		background:
		radial-gradient(
		circle at 70% 45%,
		rgba(37,99,235,.35),
		transparent 40%
		);

		pointer-events:none;

		}

		.dashboard-hero>*{

		position:relative;

		z-index:2;

		}

      .dashboard-hero::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 78% 16%, rgba(255,255,255,.25), transparent 22%),
          radial-gradient(circle at 12% 95%, rgba(34,211,238,.22), transparent 28%);
      }

      .dashboard-hero::after {
        content: "";
        position: absolute;
        right: -80px;
        bottom: -120px;
        width: 420px;
        height: 420px;
        border-radius: 999px;
        background: rgba(255,255,255,.13);
      }

      .hero-copy,
      .hero-status-card {
        position: relative;
        z-index: 1;
      }

      .dashboard-eyebrow {
        margin: 0 0 14px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: .11em;
        color: #bfdbfe;
      }

		.dashboard-hero h1{

		margin:0;

		font-size:clamp(58px,6vw,90px);

		line-height:.90;

		letter-spacing:-.08em;

		font-weight:900;

		color:white;

		max-width:900px;

		}

		.dashboard-hero p{

		margin-top:22px;

		max-width:760px;

		font-size:20px;

		line-height:1.7;

		font-weight:500;

		color:rgba(255,255,255,.90);

		}

      .hero-actions {
        margin-top: 34px;
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }

      .hero-actions button {
        border: 0;
        border-radius: 999px;
        padding: 16px 24px;
        font-weight: 950;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: #06152f;
        background: white;
      }

      .hero-actions button.ghost {
        color: white;
        background: rgba(255,255,255,.15);
        border: 1px solid rgba(255,255,255,.28);
        backdrop-filter: blur(12px);
      }

      .hero-status-card {
        width: 360px;
        min-width: 360px;
        border-radius: 34px;
        padding: 34px;
        align-self: stretch;
        background: rgba(255,255,255,.16);
        border: 1px solid rgba(255,255,255,.28);
        backdrop-filter: blur(18px);
        box-shadow: inset 0 1px 0 rgba(25,255,255,.22);
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .hero-status-icon {
        width: 104px;
        height: 104px;
        border-radius: 32px;
        display: grid;
        place-items: center;
        background: rgba(25,25,255,.52);
        margin-bottom: 26px;
      }

      .hero-status-card strong {
        margin-top: 10px;
        font-size: 56px;
        line-height: 1;
        letter-spacing: -.07em;
      }

      .dashboard-kpis {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(4, minmax(320px, 1fr));
        gap: 24px;
        margin-bottom: 30px;
      }

      .stat-card {
        min-height: 245px;
        border: 3px solid rgba(25,255,255,.82);
        border-radius: 34px;
        padding: 36px;
        background: rgba(255,255,255,.9);
        box-shadow: 0 26px 65px rgba(15,23,42,.83);
        display: flex;
        align-items: center;
        gap: 28px;
        position: relative;
        overflow: hidden;
        transition: .2s ease;
      }

      .stat-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 34px 90px rgba(15,23,42,.2);
      }

      .stat-card::before {
        content: "";
        position: absolute;
        right: -80px;
        bottom: -100px;
        width: 250px;
        height: 250px;
        border-radius: 999px;
        opacity: .18;
      }

      .stat-card::after {
        content: "";
        position: absolute;
        right: 38px;
        top: 34px;
        width: 90px;
        height: 90px;
        border-radius: 999px;
        opacity: .09;
      }

      .stat-icon {
        position: relative;
        z-index: 1;
        width: 124px;
        height: 124px;
        min-width: 124px;
        border-radius: 36px;
        display: grid;
        place-items: center;
        color: white;
        box-shadow: 0 22px 46px rgba(15,23,42,.2);
      }

      .stat-icon svg {
        width: 64px;
        height: 64px;
      }

      .stat-content {
        position: relative;
        z-index: 1;
      }

      .stat-content p {
        margin: 0;
        color: #385071;
        font-size: 15px;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: .07em;
      }

      .stat-content h2 {
        margin: 14px 0 0;
        font-size: 78px;
        line-height: .92;
        letter-spacing: -.1em;
        color: #06152f;
      }

      .tone-blue .stat-icon,
      .tone-blue::before,
      .tone-blue::after {
        background: linear-gradient(135deg, #38bdf8, #2563eb);
      }

      .tone-green .stat-icon,
      .tone-green::before,
      .tone-green::after {
        background: linear-gradient(135deg, #34d399, #059669);
      }

      .tone-purple .stat-icon,
      .tone-purple::before,
      .tone-purple::after {
        background: linear-gradient(135deg, #a78bfa, #6d28d9);
      }

      .tone-cyan .stat-icon,
      .tone-cyan::before,
      .tone-cyan::after {
        background: linear-gradient(135deg, #22d3ee, #0891b2);
      }

      .tone-orange .stat-icon,
      .tone-orange::before,
      .tone-orange::after {
        background: linear-gradient(135deg, #fbbf24, #f97316);
      }

      .tone-red .stat-icon,
      .tone-red::before,
      .tone-red::after {
        background: linear-gradient(135deg, #fb7185, #dc2626);
      }

      .tone-pink .stat-icon,
      .tone-pink::before,
      .tone-pink::after {
        background: linear-gradient(135deg, #f472b6, #be185d);
      }

      .tone-indigo .stat-icon,
      .tone-indigo::before,
      .tone-indigo::after {
        background: linear-gradient(135deg, #818cf8, #3730a3);
      }

      .dashboard-grid {
        width: 100%;
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 24px;
        margin-bottom: 30px;
      }

      .premium-panel {
        min-height: 490px;
        border-radius: 34px;
        padding: 34px;
        background: rgba(255,255,255,.92);
        border: 3px solid rgba(25,255,255,.84);
        box-shadow: 0 28px 75px rgba(15,23,42,.54);
        position: relative;
        overflow: hidden;
      }

      .premium-panel::before {
        content: "";
        position: absolute;
        width: 280px;
        height: 280px;
        right: -110px;
        bottom: -140px;
        border-radius: 999px;
        background: rgba(37,99,235,.08);
      }

      .premium-panel.wide {
        grid-column: span 2;
      }

      .panel-header {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 18px;
        margin-bottom: 26px;
      }

      .panel-header svg {
        color: #2563eb;
      }

      .panel-kicker {
        margin: 0 0 8px;
        color: #1d7df2;
        text-transform: uppercase;
        letter-spacing: .08em;
        font-size: 18px;
        font-weight: 950;
      }

      .panel-header h3 {
        margin: 0;
        font-size: 38px;
        line-height: 1;
        letter-spacing: -.06em;
      }

      .score-circle {
        position: relative;
        z-index: 1;
        width: 220px;
        height: 220px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        margin: 18px auto;
        background:
          radial-gradient(circle at center, #ffffff 0 58%, transparent 59%),
          conic-gradient(#2563eb calc(var(--score, 0) * 1%), #dbeafe 0);
        box-shadow: inset 0 0 0 1px #dbeafe;
      }

      .score-circle strong {
        font-size: 58px;
        letter-spacing: -.09em;
      }

      .compliance-status {
        position: relative;
        z-index: 1;
        text-align: center;
        font-size: 18px;
        font-weight: 950;
        color: #1d4ed8;
        margin-bottom: 22px;
      }

      .progress-track {
        position: relative;
        z-index: 1;
        height: 16px;
        border-radius: 999px;
        background: #dbeafe;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #2563eb, #22c55e);
      }

      .dashboard-metric {
        position: relative;
        z-index: 1;
        min-height: 82px;
        padding: 18px 20px;
        border-radius: 22px;
        background: linear-gradient(135deg, #ffffff, #f4f9ff);
        border: 1px solid #dbeafe;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
      }

      .dashboard-metric span {
        color: #f20000;
        font-size: 25px;
        font-weight: 900;
      }

      .dashboard-metric strong {
        font-size: 36px;
        letter-spacing: -.07em;
        color: #071735;
      }

      .mini-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        position: relative;
        z-index: 1;
      }

      .mini-grid .dashboard-metric {
        margin-bottom: 0;
      }

      .empty-events {
        min-height: 245px;
        border-radius: 26px;
        border: 1px dashed #93c5fd;
        display: grid;
        place-items: center;
        text-align: center;
        color: #49617f;
        background: linear-gradient(135deg, #ffffff, #eff6ff);
      }

      .event-row {
        position: relative;
        z-index: 1;
        padding: 17px 0;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        gap: 14px;
      }

      .event-row strong {
        color: #071735;
      }

      .event-row p {
        margin: 4px 0 0;
        color: #64748b;
        font-size: 13px;
      }

      .event-row span {
        color: #2563eb;
        font-weight: 900;
        white-space: nowrap;
      }

      @media(max-width: 1500px) {
        .dashboard-kpis {
          grid-template-columns: repeat(2, minmax(320px, 1fr));
        }

        .dashboard-grid {
          grid-template-columns: 1fr;
        }

        .premium-panel.wide {
          grid-column: span 1;
        }

        .dashboard-hero {
          flex-direction: column;
        }

        .hero-status-card {
          width: 100%;
          min-width: 0;
        }
      }

      @media(max-width: 760px) {
        .dashboard-page {
          padding: 14px;
        }

        .dashboard-kpis,
        .mini-grid {
          grid-template-columns: 1fr;
        }

        .dashboard-hero {
          min-height: auto;
          padding: 28px;
          border-radius: 28px;
        }

        .dashboard-hero h1 {
          font-size: 46px;
        }

        .stat-card {
          min-height: 170px;
          padding: 24px;
        }

        .stat-icon {
          width: 78px;
          height: 78px;
          min-width: 78px;
          border-radius: 24px;
        }

        .stat-icon svg {
          width: 42px;
          height: 42px;
        }

        .stat-content h2 {
          font-size: 46px;
        }

        .premium-panel {
          padding: 24px;
        }
      }
    `}</style>
  );
}