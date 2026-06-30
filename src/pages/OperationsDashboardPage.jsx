import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  RefreshCw,
  ShieldCheck,
  Thermometer,
  UsersRound,
  UserCheck,
  UserX,
  Car,
  Wrench,
  Zap,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

export default function OperationsDashboardPage() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    try {
      const res = await api.get("/facility-compliance/operations-dashboard");
      setData(res.data);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Could not load operations dashboard.");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const operations = data?.operations || {};
  const risks = data?.risks || [];
  const tasks = data?.tasks || [];
  const activities = data?.activities || [];

  const overdueTasks = useMemo(
    () => tasks.filter((t) => t.priority === "HIGH" || t.status === "OVERDUE"),
    [tasks]
  );

  function severityClass(severity) {
    if (severity === "CRITICAL" || severity === "HIGH") return "red";
    if (severity === "MEDIUM") return "orange";
    return "green";
  }

  function statusClass(status) {
    if (status === "COMPLETED" || status === "RETURNED") return "green";
    if (status === "IN_PROGRESS" || status === "OPEN") return "orange";
    return "blue";
  }

  return (
    <div className="ops-dashboard-page">
      <style>{`
        .ops-dashboard-page {
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

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .kpi-card {
          min-height: 142px;
          border-radius: 22px;
          padding: 20px;
          background: white;
          border: 1px solid #dbeafe;
          box-shadow: 0 20px 45px rgba(15,23,42,.11);
          position: relative;
          overflow: hidden;
        }

        .kpi-card::after {
          content: "";
          position: absolute;
          right: -30px;
          bottom: -30px;
          width: 95px;
          height: 95px;
          border-radius: 999px;
          background: rgba(37,99,235,.08);
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
          margin-bottom: 14px;
        }

        .kpi-card strong {
          display: block;
          font-size: 34px;
          line-height: 1;
          color: #071735;
          letter-spacing: -.05em;
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

        .dashboard-grid {
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
          font-size: 32px;
          line-height: 1;
          color: #071735;
          letter-spacing: -.06em;
        }

        .ops-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .ops-item {
          border-radius: 18px;
          padding: 18px;
          background: white;
          border: 1px solid #dbeafe;
          box-shadow: 0 10px 25px rgba(15,23,42,.06);
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ops-item-icon {
          width: 46px;
          height: 46px;
          border-radius: 15px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #2563eb, #06b6d4);
          flex-shrink: 0;
        }

        .ops-item strong {
          display: block;
          color: #071735;
          font-size: 22px;
          line-height: 1;
          letter-spacing: -.03em;
        }

        .ops-item span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .right-stack,
        .left-stack,
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

        .record-card.red {
          border-left-color: #dc2626;
        }

        .record-card.orange {
          border-left-color: #f59e0b;
        }

        .record-card.green {
          border-left-color: #047857;
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
        .chip.blue { background: #eff6ff; color: #1d4ed8; }

        .quick-actions {
          display: grid;
          gap: 12px;
        }

        .quick-btn {
          min-height: 58px;
          border-radius: 16px;
          border: 1px solid #dbeafe;
          background: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 16px;
          color: #071735;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(15,23,42,.06);
        }

        .quick-btn span {
          display: inline-flex;
          align-items: center;
          gap: 10px;
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
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .ops-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-metrics {
            width: 100%;
          }

          .kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 820px) {
          .ops-dashboard-page {
            padding: 14px;
          }

          .kpi-grid,
          .ops-list {
            grid-template-columns: 1fr;
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
            <Activity size={18} />
            Daily Operations
          </p>

          <h1>
            Operations
            <br />
            Command Center
          </h1>

          <p>
            Monitor daily operations, risks, tasks, compliance activities,
            movement logs, documentation completion, transportation, and facility
            readiness.
          </p>

          <div className="hero-actions">
            <span className="hero-pill">
              <ShieldCheck size={15} />
              Compliance Activities
            </span>
            <span className="hero-pill">
              <AlertTriangle size={15} />
              Risk Monitoring
            </span>
            <span className="hero-pill">
              <ClipboardCheck size={15} />
              Task Board
            </span>
          </div>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{data?.daily_score ?? 0}%</strong>
            <span>Daily Score</span>
          </div>

          <div className="metric-card">
            <strong>{data?.open_risks ?? 0}</strong>
            <span>Open Risks</span>
          </div>

          <div className="metric-card">
            <strong>{data?.pending_tasks ?? 0}</strong>
            <span>Pending Tasks</span>
          </div>

          <div className="metric-card">
            <strong>{data?.overdue ?? 0}</strong>
            <span>Overdue</span>
          </div>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">
            <Activity size={22} />
          </div>
          <strong>{data?.daily_score ?? 0}%</strong>
          <span>Daily Readiness</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <AlertTriangle size={22} />
          </div>
          <strong>{data?.open_risks ?? 0}</strong>
          <span>Open Risks</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <ClipboardCheck size={22} />
          </div>
          <strong>{data?.pending_tasks ?? 0}</strong>
          <span>Pending Tasks</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <CalendarDays size={22} />
          </div>
          <strong>{data?.due_today ?? 0}</strong>
          <span>Due Today</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <Clock size={22} />
          </div>
          <strong>{data?.overdue ?? 0}</strong>
          <span>Overdue Items</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="left-stack">
          <div className="premium-card">
            <div className="card-header">
              <div>
                <p>Today’s Operations</p>
                <h2>Daily Compliance Snapshot</h2>
              </div>
              <ShieldCheck size={32} color="#2563eb" />
            </div>

            <div className="ops-list">
              <div className="ops-item">
                <div className="ops-item-icon">
                  <Thermometer size={22} />
                </div>
                <div>
                  <strong>{operations.temperature_logs_today ?? 0}</strong>
                  <span>Temperature Logs</span>
                </div>
              </div>

              <div className="ops-item">
                <div className="ops-item-icon">
                  <UsersRound size={22} />
                </div>
                <div>
                  <strong>{operations.group_notes_today ?? 0}</strong>
                  <span>Group Notes</span>
                </div>
              </div>

              <div className="ops-item">
                <div className="ops-item-icon">
                  <FileText size={22} />
                </div>
                <div>
                  <strong>{operations.progress_notes_today ?? 0}</strong>
                  <span>Progress Notes</span>
                </div>
              </div>

              <div className="ops-item">
                <div className="ops-item-icon">
                  <UserX size={22} />
                </div>
                <div>
                  <strong>{operations.residents_currently_out ?? 0}</strong>
                  <span>Residents Out</span>
                </div>
              </div>

              <div className="ops-item">
                <div className="ops-item-icon">
                  <UserCheck size={22} />
                </div>
                <div>
                  <strong>{operations.visitors_signed_in ?? 0}</strong>
                  <span>Visitors Signed In</span>
                </div>
              </div>

              <div className="ops-item">
                <div className="ops-item-icon">
                  <Car size={22} />
                </div>
                <div>
                  <strong>{operations.active_transport_trips ?? 0}</strong>
                  <span>Active Trips</span>
                </div>
              </div>

              <div className="ops-item">
                <div className="ops-item-icon">
                  <Wrench size={22} />
                </div>
                <div>
                  <strong>{operations.open_repairs ?? 0}</strong>
                  <span>Open Repairs</span>
                </div>
              </div>

              <div className="ops-item">
                <div className="ops-item-icon">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <strong>{operations.facility_readiness_score ?? 0}%</strong>
                  <span>Facility Readiness</span>
                </div>
              </div>
            </div>
          </div>

          <div className="premium-card">
            <div className="card-header">
              <div>
                <p>Risk Center</p>
                <h2>Open Risks</h2>
              </div>
              <AlertTriangle size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {risks.length === 0 && (
                <div className="empty-state">No open risks found.</div>
              )}

              {risks.map((risk, index) => (
                <div
                  className={`record-card ${severityClass(risk.severity)}`}
                  key={`${risk.type}-${index}`}
                >
                  <strong>{risk.title}</strong>
                  <p>{risk.description || "No description available."}</p>

                  <div className="chip-row">
                    <span className={`chip ${severityClass(risk.severity)}`}>
                      {risk.severity || "MEDIUM"}
                    </span>
                    <span className="chip blue">{risk.type}</span>
                    {risk.date && (
                      <span className="chip">
                        <CalendarDays size={12} />
                        {risk.date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-stack">
          <div className="premium-card">
            <div className="card-header">
              <div>
                <p>Task Board</p>
                <h2>Tasks & Follow-Ups</h2>
              </div>
              <ClipboardCheck size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {tasks.length === 0 && (
                <div className="empty-state">No pending tasks found.</div>
              )}

              {tasks.slice(0, 12).map((task, index) => (
                <div
                  className={`record-card ${severityClass(task.priority)}`}
                  key={task.id || index}
                >
                  <strong>{task.title}</strong>
                  <p>{task.type} · Due: {task.due_date || "No due date"}</p>

                  <div className="chip-row">
                    <span className={`chip ${statusClass(task.status)}`}>
                      {task.status || "OPEN"}
                    </span>
                    <span className={`chip ${severityClass(task.priority)}`}>
                      {task.priority || "MEDIUM"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card">
            <div className="card-header">
              <div>
                <p>Compliance Feed</p>
                <h2>Recent Activity</h2>
              </div>
              <Zap size={32} color="#2563eb" />
            </div>

            <div className="record-list">
              {activities.length === 0 && (
                <div className="empty-state">No recent activities found.</div>
              )}

              {activities.slice(0, 12).map((item, index) => (
                <div className="record-card green" key={`${item.type}-${index}`}>
                  <strong>{item.title}</strong>
                  <p>{item.type} · {item.date || "No date"}</p>

                  <div className="chip-row">
                    <span className={`chip ${statusClass(item.status)}`}>
                      {item.status || "RECORDED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card">
            <div className="card-header">
              <div>
                <p>Quick Actions</p>
                <h2>Start Work</h2>
              </div>
              <ArrowRight size={32} color="#2563eb" />
            </div>

            <div className="quick-actions">
              <button className="quick-btn" type="button">
                <span>
                  <FileText size={18} />
                  Add Progress Note
                </span>
                <ArrowRight size={17} />
              </button>

              <button className="quick-btn" type="button">
                <span>
                  <UsersRound size={18} />
                  Add Group Note
                </span>
                <ArrowRight size={17} />
              </button>

              <button className="quick-btn" type="button">
                <span>
                  <UserX size={18} />
                  Sign Resident Out
                </span>
                <ArrowRight size={17} />
              </button>

              <button className="quick-btn" type="button">
                <span>
                  <Car size={18} />
                  Add Transport Log
                </span>
                <ArrowRight size={17} />
              </button>

              <button className="quick-btn" type="button">
                <span>
                  <Wrench size={18} />
                  Add Repair / Safety Check
                </span>
                <ArrowRight size={17} />
              </button>

              <button className="quick-btn" type="button" onClick={loadDashboard}>
                <span>
                  <RefreshCw size={18} />
                  Refresh Dashboard
                </span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}