import React from "react";
import {
  ShieldCheck,
  ClipboardList,
  Thermometer,
  FileCheck2,
  ClipboardCheck,
  UserCheck,
  Car,
  CalendarDays,
  UsersRound,
  Bell,
  ChevronRight,
  Wrench,
  Building2,
  Activity,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import operationsHero from "../assets/operations.png";

const metrics = [
  {
    label: "Open Compliance",
    value: 0,
    icon: ShieldCheck,
    className: "stat-blue",
  },
  {
    label: "Due Today",
    value: 0,
    icon: CalendarDays,
    className: "stat-green",
  },
  {
    label: "Pending Review",
    value: 0,
    icon: ClipboardCheck,
    className: "stat-purple",
  },
  {
    label: "High Priority",
    value: 0,
    icon: Bell,
    className: "stat-orange",
  },
];

const operationModules = [
  {
    title: "Temperature Logs",
    description: "Refrigerator, freezer, water and facility temperature monitoring.",
    path: "/facility-compliance/logs",
    icon: Thermometer,
    className: "module-blue",
  },
  {
    title: "Group Notes Audit",
    description: "Review group notes completion, missing entries and audit status.",
    path: "/facility-compliance/group-notes-audit",
    icon: FileCheck2,
    className: "module-green",
  },
  {
    title: "Progress Note Audit",
    description: "Track daily progress note compliance and documentation gaps.",
    path: "/facility-compliance/progress-note-audit",
    icon: ClipboardList,
    className: "module-purple",
  },
  {
    title: "Resident Sign In/Out",
    description: "Monitor resident movement, outing logs and return documentation.",
    path: "/facility-compliance/resident-sign-logs",
    icon: UserCheck,
    className: "module-orange",
  },
  {
    title: "Visitor Logs",
    description: "Track visitor sign-in, sign-out, purpose and approval records.",
    path: "/facility-compliance/visitor-logs",
    icon: UsersRound,
    className: "module-cyan",
  },
  {
    title: "Vehicle & Transport",
    description: "Vehicle safety, transport logs, mileage and maintenance records.",
    path: "/facility-compliance/transport-logs",
    icon: Car,
    className: "module-pink",
  },
  {
    title: "Maintenance Checklist",
    description: "Monthly maintenance, repairs, safety checks and facility readiness.",
    path: "/facility-compliance/facility-maintenance-logs",
    icon: Wrench,
    className: "module-indigo",
  },
  {
    title: "Facility Compliance",
    description: "Fire drills, pest control, inspections, safety and regulatory records.",
    path: "/facility-compliance/facility-compliance",
    icon: Building2,
    className: "module-teal",
  },
  {
    title: "Operations Dashboard",
    description: "Executive view of daily operations, risks, tasks and compliance activity.",
    path: "/facility-compliance/operations-dashboard",
    icon: Activity,
    className: "module-red",
  },
];

export default function OperationsCenterPage() {
  const navigate = useNavigate();

  return (
    <div className="operations-page">
      <style>{`
        .operations-page {
          min-height: 100vh;
          padding: 22px;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.28), transparent 28%),
            radial-gradient(circle at bottom right, rgba(147,197,253,.35), transparent 32%),
            linear-gradient(135deg, #eaf4ff 0%, #f8fbff 52%, #dcecff 100%);
          color: #071735;
        }
		.operations-hero{

		position:relative;

		display:flex;

		justify-content:space-between;

		align-items:center;

		gap:40px;

		min-height:300px;

		padding:42px 46px;

		margin-bottom:30px;

		border-radius:34px;

		overflow:hidden;

		background-size:cover;

		background-position:center right;

		background-repeat:no-repeat;

		box-shadow:
		0 30px 80px rgba(15,23,42,.20);

		}

		.operations-hero::before{

		content:"";

		position:absolute;

		inset:0;

		background:
		radial-gradient(circle at 65% 50%,
		rgba(37,99,235,.45),
		transparent 40%);

		pointer-events:none;

		}

		.operations-hero>*{

		position:relative;

		z-index:2;

		}

		.operations-hero-content{

		max-width:760px;

		}

		.hero-kicker{

		margin:0 0 14px;

		font-size:14px;

		font-weight:900;

		letter-spacing:.12em;

		color:#7dd3fc;

		text-transform:uppercase;

		}

		.operations-hero h1{

		margin:0;

		font-size:clamp(52px,6vw,78px);

		line-height:.92;

		letter-spacing:-.08em;

		font-weight:900;

		color:white;

		}

		.operations-hero p{

		margin-top:22px;

		max-width:620px;

		font-size:20px;

		line-height:1.7;

		font-weight:500;

		color:rgba(255,255,255,.90);

		}

		.hero-actions{

		margin-top:34px;

		display:flex;

		gap:18px;

		}

		.hero-primary{

		display:flex;

		align-items:center;

		gap:10px;

		padding:16px 28px;

		border:none;

		border-radius:18px;

		background:white;

		color:#071735;

		font-weight:800;

		cursor:pointer;

		}

		.hero-secondary{

		display:flex;

		align-items:center;

		gap:10px;

		padding:16px 28px;

		border-radius:18px;

		background:rgba(255,255,255,.10);

		border:1px solid rgba(255,255,255,.35);

		color:white;

		backdrop-filter:blur(8px);

		cursor:pointer;

		}

		.operations-status-card{

		width:260px;

		padding:30px;

		border-radius:28px;

		background:rgba(255,255,255,.12);

		backdrop-filter:blur(16px);

		border:1px solid rgba(255,255,255,.18);

		color:white;

		box-shadow:
		0 20px 50px rgba(0,0,0,.18);

		}

		.status-icon{

		width:86px;

		height:86px;

		border-radius:22px;

		display:grid;

		place-items:center;

		margin-bottom:22px;

		background:linear-gradient(135deg,#2563eb,#1d4ed8);

		}

		.operations-status-card span{

		font-size:12px;

		font-weight:900;

		letter-spacing:.12em;

		color:#bfdbfe;

		}

		.operations-status-card h2{

		margin:12px 0 8px;

		font-size:46px;

		letter-spacing:-.05em;

		color:white;

		}

		.operations-status-card p{

		margin:0;

		font-size:16px;

		color:#bbf7d0;

		font-weight:700;

		}

		.operations-status-card small{

		display:block;

		margin-top:10px;

		color:rgba(255,255,255,.82);

		font-size:14px;

		}
        .operations-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 26px;
        }

        .stat-card {
          min-height: 110px;
          border: 3px solid rgba(25,255,255,.75);
          border-radius: 22px;
          padding: 24px;
          background: rgba(255,255,255,.86);
          box-shadow: 0 18px 45px rgba(15,23,42,.62);
          display: flex;
          align-items: center;
          gap: 22px;
          position: relative;
          overflow: hidden;
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

        .stat-blue .stat-icon { background: linear-gradient(135deg, #38bdf8, #2563eb); }
        .stat-green .stat-icon { background: linear-gradient(135deg, #34d399, #059669); }
        .stat-purple .stat-icon { background: linear-gradient(135deg, #a78bfa, #6d28d9); }
        .stat-orange .stat-icon { background: linear-gradient(135deg, #fb7185, #f97316); }

        .stat-content span {
          display: block;
          font-size: 18px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #385071;
        }

        .stat-content strong {
          display: block;
          margin-top: 8px;
          font-size: 44px;
          line-height: 1;
          letter-spacing: -0.08em;
          color: #f20000;
        }

        .operations-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 26px;
        }

        .operations-card {
          min-height: 220px;
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

        .operations-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 70px rgba(15,23,42,.22);
        }

        .operations-card::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -80px;
          bottom: -90px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
        }

        .operation-icon {
          position: relative;
          z-index: 2;
          width: 150px;
          height: 150px;
          min-width: 150px;
          border-radius: 34px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.28);
          color: white;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.45),
            0 18px 40px rgba(15,23,42,.18);
          backdrop-filter: blur(14px);
        }

        .operation-icon svg {
          width: 82px;
          height: 82px;
          stroke-width: 2.2;
        }

        .operation-content {
          position: relative;
          z-index: 2;
          max-width: 330px;
        }

        .operation-content h2 {
          margin: 0;
          font-size: 29px;
          line-height: 1.05;
          letter-spacing: -0.055em;
        }

        .operation-content p {
          margin: 16px 0 24px;
          font-size: 20px;
          line-height: 1.55;
          font-weight: 600;
          color: rgba(255,255,255,.9);
        }

        .open-link {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border-radius: 29px;
          padding: 18px 18px;
		  border: 2px solid rgba(25,255,255,.75);
          background: rgba(0,0,0,.28);
          color: white;
          font-size: 20px;
          font-weight: 900;
        }

        .module-blue { background: linear-gradient(135deg, #0ea5e9, #1d4ed8); }
        .module-green { background: linear-gradient(135deg, #34d399, #047857); }
        .module-purple { background: linear-gradient(135deg, #c084fc, #5b21b6); }
        .module-orange { background: linear-gradient(135deg, #fbbf24, #ea580c); }
        .module-cyan { background: linear-gradient(135deg, #22d3ee, #0e7490); }
        .module-pink { background: linear-gradient(135deg, #f472b6, #be185d); }
        .module-indigo { background: linear-gradient(135deg, #818cf8, #3730a3); }
        .module-teal { background: linear-gradient(135deg, #2dd4bf, #0f766e); }
        .module-red { background: linear-gradient(135deg, #fb7185, #b91c1c); }

        .operations-panel {
          border-radius: 28px;
          padding: 30px;
          background: rgba(255,255,255,.88);
          border: 3px solid rgba(25,255,255,.82);
          box-shadow: 0 22px 55px rgba(15,23,42,.52);
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
          font-size: 18px;
          font-weight: 900;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: #1d7df2;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.05em;
          color: #f20000;
        }

        .panel-header button {
          border: 0;
          border-radius: 18px;
          padding: 15px 24px;
          background: #06122c;
          color: white;
          font-size: 20px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(15,23,42,.68);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .empty-state {
          min-height: 178px;
          border: 1px dashed rgba(37,99,235,.82);
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

        @media (max-width: 1200px) {
          .operations-stats,
          .operations-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .operations-page {
            padding: 14px;
          }

          .operations-stats,
          .operations-grid {
            grid-template-columns: 1fr;
          }

          .operations-card {
            min-height: auto;
            flex-direction: column;
            align-items: flex-start;
            padding: 26px;
          }

          .operation-icon {
            width: 110px;
            height: 110px;
            min-width: 110px;
            border-radius: 28px;
          }

          .operation-icon svg {
            width: 58px;
            height: 58px;
          }

          .panel-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

		<section
		  className="operations-hero"
		  style={{
			backgroundImage: `
			  linear-gradient(
				90deg,
				rgba(7,23,53,.96) 0%,
				rgba(29,78,216,.82) 45%,
				rgba(14,165,233,.35) 75%,
				rgba(14,165,233,.15) 100%
			  ),
			  url(${operationsHero})
			`,
		  }}
		>
		  <div className="operations-hero-content">
			<p className="hero-kicker">OPERATIONS CENTER</p>

			<h1>
			  Facility Operations
			  <br />
			  Command Center
			</h1>

			<p>
			  Manage daily facility compliance, inspections, transportation,
			  maintenance, visitor management, resident movement, audits and
			  operational readiness from one intelligent operations workspace.
			</p>

			<div className="hero-actions">
			  <button className="hero-primary">
				View Operations
				<ChevronRight size={18} />
			  </button>

			  <button className="hero-secondary">
				Compliance Center
				<ChevronRight size={18} />
			  </button>
			</div>
		  </div>

		  <div className="operations-status-card">
			<div className="status-icon">
			  <Building2 size={42} />
			</div>

			<span>OVERALL STATUS</span>

			<h2>ACTIVE</h2>

			<p>All systems operational</p>

			<small>Facility operations normal</small>
		  </div>
		</section>

      <section className="operations-stats">
        {metrics.map((item) => {
          const Icon = item.icon;

          return (
            <div className={`stat-card ${item.className}`} key={item.label}>
              <div className="stat-icon">
                <Icon size={38} />
              </div>
              <div className="stat-content">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            </div>
          );
        })}
      </section>

      <section className="operations-grid">
        {operationModules.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className={`operations-card ${item.className}`}
              type="button"
              onClick={() => navigate(item.path)}
            >
              <div className="operation-icon">
                <Icon />
              </div>

              <div className="operation-content">
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

      <section className="operations-panel">
        <div className="panel-header">
          <div>
            <p className="portal-kicker">
              <Settings size={17} />
              Operations Workflow
            </p>
            <h2>Facility Tasks Due Today</h2>
          </div>

          <button type="button" onClick={() => navigate("/tasks")}>
            View All Tasks <ChevronRight size={16} />
          </button>
        </div>

        <div className="empty-state">
          <div>
            <div className="empty-icon">
              <ClipboardCheck size={40} />
            </div>
            <p>No facility operations tasks found for today.</p>
          </div>
        </div>
      </section>
    </div>
  );
}