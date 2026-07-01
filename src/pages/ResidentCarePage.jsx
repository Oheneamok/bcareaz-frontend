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
  Star,
  CheckCircle2,
  Timer,
  ListChecks,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const careModules = [
  {
    title: "Medication",
    description: "Medication pass, eMAR, refusals and medication tasks.",
    path: "/resident-care/medications",
    icon: Pill,
    className: "module-blue",
  },
  {
    title: "Progress Notes",
    description: "Daily resident progress notes and documentation.",
    path: "/resident-care/progress-notes",
    icon: FileText,
    className: "module-green",
  },
  {
    title: "Group Notes",
    description: "Morning and evening group discussion notes.",
    path: "/resident-care/group-notes",
    icon: UsersRound,
    className: "module-purple",
  },
  {
    title: "Hourly Activity Log",
    description: "Hourly resident activity, location and observation logs.",
    path: "/resident-care/resident-activity-logs",
    icon: Clock,
    className: "module-orange",
  },
  {
    title: "Daily Activities",
    description: "ADLs, meals, hygiene, participation and daily routines.",
    path: "/resident-care/daily-activities",
    icon: Activity,
    className: "module-cyan",
  },
  {
    title: "Treatment Activities",
    description: "Treatment plan goals, interventions and follow-up tasks.",
    path: "/resident-care/treatment-activities",
    icon: Target,
    className: "module-pink",
  },
];

export default function ResidentCarePage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/workflow/tasks/today"),
      api.get("/workflow/dashboard"),
    ]).then(([tasksResult, dashboardResult]) => {
      if (tasksResult.status === "fulfilled") {
        const residentTasks = (tasksResult.value.data || []).filter(
          (task) => task.resident_id
        );
        setTasks(residentTasks);
      }

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value.data);
      }

      setLoading(false);
    });
  }, []);

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const open = tasks.filter((t) => t.status === "OPEN").length;
  const highPriority = tasks.filter(
    (t) => t.priority === "HIGH" || t.priority === "URGENT"
  ).length;

  const completionPercent =
    dashboard?.today?.completion_percent ??
    (tasks.length ? Math.round((completed / tasks.length) * 100) : 0);

  return (
    <div className="resident-care-page">
      <style>{`
        .resident-care-page {
          min-height: 100vh;
          padding: 22px;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.28), transparent 68%),
            radial-gradient(circle at bottom right, rgba(147,197,253,.35), transparent 32%),
            linear-gradient(135deg, #eaf4ff 0%, #f8fbff 52%, #dcecff 100%);
          color: #071735;
        }
		.resident-care-hero{

		display:flex;
		justify-content:space-between;
		align-items:center;

		gap:30px;

		margin-bottom:30px;

		padding:38px;

		border-radius:34px;

		position:relative;

		overflow:hidden;

		color:white;

		background:
		linear-gradient(
		135deg,
		#071735,
		#1d4ed8,
		#0ea5e9
		);

		box-shadow:
		0 30px 70px rgba(15,23,42,.52);

		}

		.resident-care-hero::before{

		content:"";

		position:absolute;

		right:-120px;
		bottom:-140px;

		width:320px;
		height:320px;

		border-radius:50%;

		background:rgba(255,255,255,.12);

		}

		.resident-care-hero::after{

		content:"";

		position:absolute;

		left:55%;

		top:-80px;

		width:220px;
		height:220px;

		border-radius:50%;

		background:rgba(255,255,255,.28);

		}

		.hero-content{

		position:relative;
		z-index:2;

		max-width:860px;

		}

		.hero-kicker{

		display:inline-flex;

		align-items:center;

		gap:10px;

		font-weight:900;

		text-transform:uppercase;

		letter-spacing:.12em;

		color:#bfdbfe;

		margin-bottom:18px;

		}

		.hero-content h1{

		margin:0;

		font-size:clamp(52px,6vw,42px);

		line-height:.92;

		letter-spacing:-.08em;

		}

		.hero-content p{

		margin-top:22px;

		font-size:19px;

		line-height:1.7;

		max-width:780px;

		color:rgba(255,255,255,.88);

		}

		.hero-buttons{

		margin-top:34px;

		display:flex;

		gap:16px;

		}

		.hero-primary{

		background:white;

		color:#071735;

		border:none;

		padding:15px 28px;

		border-radius:999px;

		font-weight:900;

		cursor:pointer;

		}

		.hero-secondary{

		background:rgba(255,255,255,.15);

		border:1px solid rgba(255,255,255,.28);

		backdrop-filter:blur(12px);

		color:white;

		padding:15px 28px;

		border-radius:999px;

		font-weight:900;

		cursor:pointer;

		}

		.hero-score{

		position:relative;
		z-index:2;

		width:310px;

		padding:34px;

		border-radius:30px;

		background:rgba(255,255,255,.14);

		backdrop-filter:blur(16px);

		border:3px solid rgba(25,255,255,.72);

		}

		.hero-score span{

		display:block;

		font-size:14px;

		text-transform:uppercase;

		font-weight:900;

		color:#dbeafe;

		}

		.hero-score strong{

		display:block;

		margin-top:16px;

		font-size:38px;

		line-height:1;

		letter-spacing:-.08em;

		}

		.hero-score small{

		display:block;

		margin-top:12px;

		font-size:15px;

		color:rgba(255,255,255,.82);

		}

		.hero-progress{

		margin-top:24px;

		height:12px;

		border-radius:999px;

		background:rgba(25,255,255,.58);

		overflow:hidden;

		}

		.hero-progress div{

		height:100%;

		background:white;

		border-radius:999px;

		}
        .resident-care-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 26px;
        }

        .stat-card {
          min-height: 110px;
          border: 5px solid rgba(25,255,255,.75);
          border-radius: 22px;
          padding: 24px;
          background: rgba(255,255,255,.86);
          box-shadow: 0 18px 45px rgba(15,23,42,.72);
          display: flex;
          align-items: center;
          gap: 22px;
          overflow: hidden;
          position: relative;
        }

        .stat-card::after {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .65;
          pointer-events: none;
        }

        .stat-blue::after {
          background: linear-gradient(135deg, rgba(37,99,235,.62), transparent);
        }

        .stat-green::after {
          background: linear-gradient(135deg, rgba(16,185,129,.62), transparent);
        }

        .stat-purple::after {
          background: linear-gradient(135deg, rgba(124,58,237,.62), transparent);
        }

        .stat-orange::after {
          background: linear-gradient(135deg, rgba(249,115,22,.65), transparent);
        }

        .stat-icon,
        .stat-content {
          position: relative;
          z-index: 1;
        }

        .stat-icon {
          width: 76px;
          height: 76px;
          border-radius: 24px;
          display: grid;
          place-items: center;
          color: white;
          box-shadow: 0 16px 32px rgba(15,23,42,.16);
        }

        .stat-blue .stat-icon {
          background: linear-gradient(135deg, #38bdf8, #2563eb);
        }

        .stat-green .stat-icon {
          background: linear-gradient(135deg, #34d399, #059669);
        }

        .stat-purple .stat-icon {
          background: linear-gradient(135deg, #a78bfa, #6d28d9);
        }

        .stat-orange .stat-icon {
          background: linear-gradient(135deg, #fb7185, #f97316);
        }

        .stat-content span {
          display: block;
          font-size: 24px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #385071;
        }

        .stat-content strong {
          display: block;
          margin-top: 8px;
		  text-align: center;
          font-size: 44px;
          line-height: 1;
          letter-spacing: -0.08em;
          color: #f20000;
        }

        .resident-care-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 26px;
        }

        .resident-care-card {
          min-height: 260px;
          border: 0;
          border-radius: 24px;
          padding: 34px;
          text-align: left;
          color: white;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 22px 50px rgba(15,23,42,.56);
          transition: transform .2s ease, box-shadow .2s ease;
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .resident-care-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 70px rgba(15,23,42,.22);
        }

        .resident-care-card::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -80px;
          bottom: -90px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
        }

        .resident-care-card::after {
          content: "";
          position: absolute;
          width: 110px;
          height: 110px;
          right: 46px;
          top: 52px;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
        }

        .module-blue {
          background: linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 55%, #2563eb 100%);
        }

        .module-green {
          background: linear-gradient(135deg, #34d399 0%, #059669 52%, #047857 100%);
        }

        .module-purple {
          background: linear-gradient(135deg, #c084fc 0%, #7c3aed 52%, #5b21b6 100%);
        }

        .module-orange {
          background: linear-gradient(135deg, #fbbf24 0%, #f97316 48%, #ea580c 100%);
        }

        .module-cyan {
          background: linear-gradient(135deg, #22d3ee 0%, #0891b2 54%, #0e7490 100%);
        }

        .module-pink {
          background: linear-gradient(135deg, #f472b6 0%, #db2777 52%, #be185d 100%);
        }

        .resident-care-icon {
          position: relative;
          z-index: 2;
          width: 100px;
          height: 100px;
          min-width: 100px;
          border-radius: 34px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.28);
          color: white;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.45),
            0 18px 40px rgba(15,23,42,.78);
          backdrop-filter: blur(14px);
        }

        .resident-care-icon svg {
          width: 82px;
          height: 82px;
          stroke-width: 2.2;
        }

        .card-content {
          position: relative;
          z-index: 2;
          max-width: 310px;
        }

        .card-content h2 {
          margin: 0;
          font-size: 30px;
          line-height: 1.05;
          letter-spacing: -0.055em;
          color: white;
        }

        .card-content p {
          margin: 16px 0 24px;
          font-size: 16px;
          line-height: 1.55;
          font-weight: 600;
          color: rgba(255,255,255,.9);
        }

        .open-link {
          width: fit-content;
          display: inline-flex;
          align-items: center;
		  border: 1px solid rgba(25,255,255,.75);
          gap: 10px;
          border-radius: 999px;
          padding: 12px 18px;
          background: rgba(0,0,0,.88);
          color: white;
          font-size: 15px;
          font-weight: 900;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.82);
        }

        .resident-care-panel {
          border-radius: 28px;
          padding: 30px;
          background: rgba(255,255,255,.88);
          border: 3px solid rgba(255,255,255,.82);
          box-shadow: 0 22px 55px rgba(15,23,42,.82);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
		  
        }

        .portal-kicker {
          margin: 0 0 8px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: #1d7df2;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 20px;
          letter-spacing: -0.05em;
          color: #f20000;
        }

        .panel-header button {
          border: 0;
          border-radius: 18px;
          padding: 15px 24px;
          background: #06122c;
          color: white;
          font-size: 25px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(15,23,42,.38);
        }

        .resident-task-list {
          display: grid;
          gap: 12px;
        }

        .empty-state {
          min-height: 178px;
          border: 1px dashed rgba(37,99,235,.32);
          border-radius: 24px;
          display: grid;
          place-items: center;
          text-align: center;
          background:
            radial-gradient(circle at center, rgba(147,197,253,.28), transparent 32%),
            linear-gradient(135deg, #ffffff, #f0f7ff);
          color: #49617f;
        }

        .empty-icon {
          width: 76px;
          height: 76px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          margin: 0 auto 12px;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #2563eb;
        }

        .empty-state p {
          margin: 0;
          font-weight: 900;
        }

        .resident-task-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 16px;
          background: #fff;
        }

        .resident-task-row strong {
          display: block;
          font-size: 15px;
        }

        .resident-task-row p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 18px;
        }

        .task-status {
          border-radius: 999px;
          padding: 8px 11px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .task-status.open {
          color: #92400e;
          background: #fef3c7;
        }

        .task-status.completed {
          color: #166534;
          background: #dcfce7;
        }

        .task-status.overdue,
        .task-status.urgent {
          color: #991b1b;
          background: #fee2e2;
        }

        @media (max-width: 1200px) {
          .resident-care-stats,
          .resident-care-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .resident-care-page {
            padding: 14px;
          }

          .resident-care-stats,
          .resident-care-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            min-height: 96px;
          }

          .stat-icon {
            width: 62px;
            height: 62px;
            border-radius: 20px;
          }

          .resident-care-card {
            min-height: auto;
            flex-direction: column;
            align-items: flex-start;
            padding: 26px;
          }

          .resident-care-icon {
            width: 110px;
            height: 110px;
            min-width: 110px;
            border-radius: 28px;
          }

          .resident-care-icon svg {
            width: 58px;
            height: 58px;
          }

          .panel-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .resident-task-row {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <section className="resident-care-stats">
        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <ListChecks size={36} />
          </div>
          <div className="stat-content">
            <span>Resident Tasks</span>
            <strong>{loading ? "..." : tasks.length}</strong>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">
            <Timer size={36} />
          </div>
          <div className="stat-content">
            <span>Open Today</span>
            <strong>{loading ? "..." : open}</strong>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">
            <CheckCircle2 size={38} />
          </div>
          <div className="stat-content">
            <span>Completed</span>
            <strong>{loading ? "..." : completed}</strong>
          </div>
        </div>

        <div className="stat-card stat-orange">
          <div className="stat-icon">
            <Star size={38} />
          </div>
          <div className="stat-content">
            <span>High Priority</span>
            <strong>{loading ? "..." : highPriority}</strong>
          </div>
        </div>
      </section>

		<section className="resident-care-hero">

		  <div className="hero-content">

			<p className="hero-kicker">
			  <Star size={18}/>
			  Resident Care Portal
			</p>

			<h1>
			  Resident Care
			  <br />
			  Command Center
			</h1>

			<p>
			  Manage medication administration, progress documentation,
			  treatment activities, ADLs, hourly observations and resident
			  care workflows from one centralized workspace.
			</p>

			<div className="hero-buttons">

			  <button
				className="hero-primary"
				onClick={() => navigate("/tasks")}
			  >
				View Today's Tasks
			  </button>

			  <button
				className="hero-secondary"
				onClick={() => navigate("/calendar")}
			  >
				Resident Schedule
			  </button>

			</div>

		  </div>

		  <div className="hero-score">

			  <span>Today's Completion</span>

			  <strong>{completionPercent}%</strong>

			  <small>
				{completed} Completed • {open} Remaining
			  </small>

			  <div className="hero-progress">
				<div
				  style={{
					width:`${completionPercent}%`
				  }}
				/>
			  </div>

		  </div>

		</section>

      <section className="resident-care-grid">
        {careModules.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className={`resident-care-card ${item.className}`}
              type="button"
              onClick={() => navigate(item.path)}
            >
              <div className="resident-care-icon">
                <Icon />
              </div>

              <div className="card-content">
                <h2>{item.title}</h2>
                <p>{item.description}</p>

                <span className="open-link">
                  Open Module <ChevronRight size={20} />
                </span>
              </div>
            </button>
          );
        })}
      </section>

      <section className="resident-care-panel">
        <div className="panel-header">
          <div>
            <p className="portal-kicker">
              <Settings size={17} />
              Workflow Engine
            </p>
            <h2>Resident Tasks Due Today</h2>
          </div>

          <button type="button" onClick={() => navigate("/tasks")}>
            View All Tasks <ChevronRight size={16} />
          </button>
        </div>

        <div className="resident-task-list">
          {!loading && tasks.length === 0 && (
            <div className="empty-state">
              <div>
                <div className="empty-icon">
                  <ClipboardCheck size={40} />
                </div>
                <p>No resident care tasks found for today.</p>
              </div>
            </div>
          )}

          {tasks.slice(0, 12).map((task) => (
            <div className="resident-task-row" key={task.id}>
              <div>
                <strong>{task.title}</strong>
                <p>
                  {task.source_module || "Resident Care"} •{" "}
                  {task.task_type || "Task"}
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