import React from "react";
import {
  UsersRound,
  UserCheck,
  Brain,
  Stethoscope,
  ClipboardCheck,
  CalendarDays,
  FileText,
  MessageSquareText,
  Target,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import clinicalHero from "../assets/cft.png";

const clinicalModules = [
  {
    title: "Team Assignments",
    description: "Assign clinical team members, roles, caseloads and resident coverage.",
    path: "/clinical-team/assignments",
    icon: UserCheck,
    className: "module-blue",
  },
  {
    title: "BHP Oversight",
    description: "Track BHP reviews, clinical supervision and required oversight.",
    path: "/bhp",
    icon: Brain,
    className: "module-purple",
  },
  {
    title: "Nursing Coordination",
    description: "Coordinate vitals, nursing notes, assessments and follow-up care.",
    path: "/nursing",
    icon: Stethoscope,
    className: "module-green",
  },
  {
    title: "Treatment Planning",
    description: "Review treatment plans, goals, interventions and clinical updates.",
    path: "/treatment-plans",
    icon: Target,
    className: "module-orange",
  },
  {
    title: "Crisis Review",
    description: "Review crisis plans, incidents, safety risks and follow-up actions.",
    path: "/crisis-plans",
    icon: ShieldAlert,
    className: "module-red",
  },
  {
    title: "CFT Meetings",
    description: "Manage Child and Family Team meetings, attendance and notes.",
    path: "/cft",
    icon: UsersRound,
    className: "module-cyan",
  },
  {
    title: "Clinical Notes",
    description: "Review progress notes, BHP notes, nursing notes and documentation.",
    path: "/progress-notes",
    icon: FileText,
    className: "module-pink",
  },
  {
    title: "Provider Communication",
    description: "Track consultations, outside agency communication and coordination.",
    path: "/consultations",
    icon: MessageSquareText,
    className: "module-teal",
  },
];

export default function ClinicalTeamPage() {
  const navigate = useNavigate();

  return (
    <div className="clinical-page">
      <style>{`
        .clinical-page {
          min-height: 100vh;
          padding: 22px;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.28), transparent 28%),
            radial-gradient(circle at bottom right, rgba(147,197,253,.35), transparent 32%),
            linear-gradient(135deg, #eaf4ff 0%, #f8fbff 52%, #dcecff 100%);
          color: #071735;
        }

        .clinical-hero {
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
            linear-gradient(90deg, rgba(7,23,53,.96), rgba(29,78,216,.82), rgba(14,165,233,.28)),
            url(${clinicalHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 30px 80px rgba(15,23,42,.22);
        }

        .clinical-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 70% 45%, rgba(37,99,235,.35), transparent 42%);
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
          color: #7dd3fc;
        }

        .clinical-hero h1 {
          margin: 0;
          font-size: clamp(52px, 6vw, 80px);
          line-height: .92;
          letter-spacing: -.08em;
          font-weight: 900;
        }

        .clinical-hero p {
          margin-top: 22px;
          max-width: 720px;
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
          width: 285px;
          padding: 30px;
          border-radius: 28px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.22);
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
          background: linear-gradient(135deg, #38bdf8, #2563eb);
        }

        .hero-status-card span {
          display: block;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .12em;
          color: #bfdbfe;
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

        .clinical-stats {
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
		  box-shadow: 0 18px 45px rgba(15,23,42,.62);
          background: linear-gradient(135deg, #38bdf8, #2563eb);
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

        .clinical-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .clinical-card {
          min-height: 460px;
          border: 0;
          border-radius: 24px;
          padding: 30px;
          text-align: left;
          color: white;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 22px 50px rgba(15,23,42,.62);
		  border: 3px solid rgba(25,255,255,.78);
          transition: .2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .clinical-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 70px rgba(15,23,42,.26);
        }

        .clinical-card::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -80px;
          bottom: -90px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
        }

        .clinical-icon {
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

        .clinical-icon svg {
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
          border-radius: 19px;
          border: 3px solid rgba(25,255,255,.78);
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
        .module-teal { background: linear-gradient(135deg, #2dd4bf, #0f766e); }
        .module-red { background: linear-gradient(135deg, #fb7185, #b91c1c); }

        @media (max-width: 1400px) {
          .clinical-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1200px) {
          .clinical-stats,
          .clinical-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .clinical-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-status-card {
            width: 100%;
          }
        }

        @media (max-width: 760px) {
          .clinical-page {
            padding: 14px;
          }

          .clinical-stats,
          .clinical-grid {
            grid-template-columns: 1fr;
          }

          .clinical-hero {
            padding: 28px;
          }
        }
      `}</style>

      <section className="clinical-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <UsersRound size={18} />
            Clinical Team Portal
          </p>

          <h1>
            Clinical Team
            <br />
            Command Center
          </h1>

          <p>
            Coordinate BHP, nursing, treatment planning, CFT meetings,
            clinical documentation, resident risk review and provider
            communication from one centralized clinical team workspace.
          </p>

          <div className="hero-actions">
            <button
              className="hero-primary"
              type="button"
              onClick={() => navigate("/clinical-team/assignments")}
            >
              Team Assignments <ChevronRight size={18} />
            </button>

            <button
              className="hero-secondary"
              type="button"
              onClick={() => navigate("/cft")}
            >
              CFT Meetings <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="hero-status-card">
          <div className="status-icon">
            <UsersRound size={42} />
          </div>
          <span>Team Status</span>
          <h2>Active</h2>
          <p>Clinical collaboration workspace ready</p>
        </div>
      </section>

      <section className="clinical-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <UsersRound size={36} />
          </div>
          <div>
            <span>Active Team</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={36} />
          </div>
          <div>
            <span>CFT Meetings</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ShieldAlert size={36} />
          </div>
          <div>
            <span>Risk Reviews</span>
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

      <section className="clinical-grid">
        {clinicalModules.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className={`clinical-card ${item.className}`}
              type="button"
              onClick={() => navigate(item.path)}
            >
              <div className="card-content">
                <div className="clinical-icon">
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