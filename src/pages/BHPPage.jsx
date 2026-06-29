import React from "react";
import {
  Brain,
  ClipboardCheck,
  FileText,
  Target,
  ShieldAlert,
  UsersRound,
  CalendarDays,
  MessageSquareText,
  ChevronRight,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import bhpHero from "../assets/bhp.png";

const bhpModules = [
  {
    title: "BHP Assessment",
    description: "Behavioral health professional assessment and clinical review.",
    path: "/bhp/assessments",
    icon: ClipboardCheck,
    className: "module-blue",
  },
  {
    title: "Treatment Plans",
    description: "Create, review and update individualized treatment plans.",
    path: "/treatment-plans",
    icon: Target,
    className: "module-green",
  },
  {
    title: "Crisis Plans",
    description: "Resident crisis planning, safety planning and risk response.",
    path: "/crisis-plans",
    icon: ShieldAlert,
    className: "module-purple",
  },
  {
    title: "Clinical Notes",
    description: "BHP notes, clinical observations and documentation follow-up.",
    path: "/bhp/notes",
    icon: FileText,
    className: "module-orange",
  },
  {
    title: "CFT / Staffing",
    description: "Child and Family Team meetings, staffing notes and reviews.",
    path: "/cft",
    icon: UsersRound,
    className: "module-cyan",
  },
  {
    title: "Appointments",
    description: "Clinical appointments, evaluations and follow-up schedules.",
    path: "/appointments",
    icon: CalendarDays,
    className: "module-pink",
  },
  {
    title: "Progress Review",
    description: "Review resident progress, interventions and goal updates.",
    path: "/progress-notes",
    icon: Activity,
    className: "module-indigo",
  },
  {
    title: "Clinical Communication",
    description: "Document provider updates, coordination and clinical messages.",
    path: "/consultations",
    icon: MessageSquareText,
    className: "module-teal",
  },
];

export default function BHPPage() {
  const navigate = useNavigate();

  return (
    <div className="bhp-page">
      <style>{`
        .bhp-page {
          min-height: 100vh;
          padding: 22px;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.28), transparent 28%),
            radial-gradient(circle at bottom right, rgba(147,197,253,.35), transparent 32%),
            linear-gradient(135deg, #eaf4ff 0%, #f8fbff 52%, #dcecff 100%);
          color: #071735;
        }

        .bhp-hero {
          position: relative;
          overflow: hidden;
          min-height: 360px;
          border-radius: 34px;
          padding: 46px;
          margin-bottom: 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
          color: white;
          background-image:
            linear-gradient(90deg, rgba(7,23,53,.96), rgba(88,28,135,.82), rgba(14,165,233,.28)),
            url(${bhpHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 30px 80px rgba(15,23,42,.22);
        }

        .bhp-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 70% 45%, rgba(168,85,247,.35), transparent 42%);
        }

        .hero-content,
        .hero-status-card {
          position: relative;
          z-index: 2;
        }

        .hero-kicker {
          margin: 0 0 16px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #ddd6fe;
        }

        .bhp-hero h1 {
          margin: 0;
          font-size: clamp(52px, 6vw, 80px);
          line-height: .92;
          letter-spacing: -.08em;
          font-weight: 900;
        }

        .bhp-hero p {
          margin-top: 22px;
          max-width: 700px;
          font-size: 19px;
          line-height: 1.7;
          color: rgba(255,255,255,.9);
        }

        .hero-actions {
          margin-top: 34px;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hero-primary,
        .hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 28px;
          border-radius: 18px;
          font-weight: 900;
          cursor: pointer;
        }

        .hero-primary {
          border: none;
          background: white;
          color: #071735;
        }

        .hero-secondary {
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.3);
          color: white;
          backdrop-filter: blur(10px);
        }

        .hero-status-card {
          width: 280px;
          padding: 30px;
          border-radius: 28px;
          background: rgba(255,255,255,.14);
          border: 3px solid rgba(25,255,255,.62);
          backdrop-filter: blur(18px);
          box-shadow: 0 20px 50px rgba(0,0,0,.18);
        }

        .status-icon {
          width: 90px;
          height: 90px;
          border-radius: 24px;
          display: grid;
          place-items: center;
          margin-bottom: 22px;
          background: linear-gradient(135deg, #a855f7, #5b21b6);
        }

        .hero-status-card span {
          display: block;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: .12em;
          color: #ddd6fe;
          text-transform: uppercase;
        }

        .hero-status-card h2 {
          margin: 12px 0 8px;
          font-size: 46px;
          letter-spacing: -.06em;
        }

        .hero-status-card p {
          margin: 0;
          font-size: 15px;
          color: rgba(255,255,255,.82);
        }

        .bhp-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 26px;
        }

        .stat-card {
          min-height: 200px;
          border-radius: 24px;
          padding: 24px;
          background: rgba(255,255,255,.88);
          border: 3px solid rgba(25,255,255,.78);
          box-shadow: 0 18px 45px rgba(15,23,42,.62);
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .stat-icon {
          width: 78px;
          height: 78px;
          border-radius: 24px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #a855f7, #5b21b6);
        }

        .stat-card span {
          display: block;
          color: #385071;
          font-size: 18px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .stat-card strong {
          display: block;
          margin-top: 8px;
          font-size: 46px;
		  color: #f20000;
          line-height: 1;
          letter-spacing: -.08em;
        }

        .bhp-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .bhp-card {
          min-height: 360px;
          border: 0;
          border-radius: 24px;
          padding: 30px;
          text-align: left;
          color: white;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 22px 50px rgba(15,23,42,.52);
		  border: 5px solid rgba(25,255,255,.78);
          transition: .2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .bhp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 70px rgba(15,23,42,.26);
        }

        .bhp-card::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -80px;
          bottom: -90px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
        }

        .bhp-icon {
          position: relative;
          z-index: 2;
          width: 104px;
          height: 104px;
          border-radius: 30px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.26);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 18px 40px rgba(15,23,42,.18);
          backdrop-filter: blur(14px);
          margin-bottom: 24px;
        }

        .bhp-icon svg {
          width: 58px;
          height: 58px;
        }

        .card-content {
          position: relative;
          z-index: 2;
        }

        .card-content h2 {
          margin: 0;
          font-size: 28px;
          line-height: 1.05;
          letter-spacing: -.055em;
        }

        .card-content p {
          margin: 14px 0 22px;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 600;
          color: rgba(255,255,255,.9);
        }

        .open-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border-radius: 999px;
          padding: 12px 18px;
          background: rgba(0,0,0,.28);
          color: white;
          font-size: 15px;
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

        @media (max-width: 1400px) {
          .bhp-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1200px) {
          .bhp-stats,
          .bhp-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .bhp-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-status-card {
            width: 100%;
          }
        }

        @media (max-width: 760px) {
          .bhp-page {
            padding: 14px;
          }

          .bhp-stats,
          .bhp-grid {
            grid-template-columns: 1fr;
          }

          .bhp-hero {
            padding: 28px;
          }
        }
      `}</style>

      <section className="bhp-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <Brain size={18} />
            BHP Portal
          </p>

          <h1>
            Behavioral Health
            <br />
            Command Center
          </h1>

          <p>
            Manage BHP assessments, treatment plans, crisis plans, clinical
            notes, CFT staffing, provider coordination and resident progress
            reviews from one centralized clinical workspace.
          </p>

          <div className="hero-actions">
            <button
              className="hero-primary"
              type="button"
              onClick={() => navigate("/bhp/assessments")}
            >
              Start BHP Assessment <ChevronRight size={18} />
            </button>

            <button
              className="hero-secondary"
              type="button"
              onClick={() => navigate("/treatment-plans")}
            >
              Open Treatment Plans <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="hero-status-card">
          <div className="status-icon">
            <Brain size={42} />
          </div>
          <span>BHP Status</span>
          <h2>Active</h2>
          <p>Clinical oversight workspace ready</p>
        </div>
      </section>

      <section className="bhp-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={36} />
          </div>
          <div>
            <span>Assessments Due</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Target size={36} />
          </div>
          <div>
            <span>Treatment Plans</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ShieldAlert size={36} />
          </div>
          <div>
            <span>Crisis Reviews</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <span>Completed</span>
            <strong>0</strong>
          </div>
        </div>
      </section>

      <section className="bhp-grid">
        {bhpModules.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className={`bhp-card ${item.className}`}
              type="button"
              onClick={() => navigate(item.path)}
            >
              <div className="card-content">
                <div className="bhp-icon">
                  <Icon />
                </div>

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
    </div>
  );
}