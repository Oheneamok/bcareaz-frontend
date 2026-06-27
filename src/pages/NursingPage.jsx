import React from "react";
import {
  Stethoscope,
  ClipboardPlus,
  HeartPulse,
  Pill,
  Thermometer,
  Syringe,
  FileText,
  CalendarDays,
  ChevronRight,
  Activity,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import nursingHero from "../assets/nursing.png";

const nursingModules = [
  {
    title: "Nursing Assessment",
    description: "Initial and ongoing nursing assessment documentation.",
    path: "/nursing/assessments",
    icon: ClipboardPlus,
    className: "module-blue",
  },
  {
    title: "Vitals",
    description: "Blood pressure, pulse, temperature, oxygen and pain monitoring.",
    path: "/nursing/vitals",
    icon: HeartPulse,
    className: "module-green",
  },
  {
    title: "Medication Review",
    description: "Medication monitoring, side effects, reconciliation and nursing notes.",
    path: "/nursing/medication-review",
    icon: Pill,
    className: "module-purple",
  },
  {
    title: "Temperature Logs",
    description: "Resident temperature checks and health observation logs.",
    path: "/nursing/temperature-logs",
    icon: Thermometer,
    className: "module-orange",
  },
  {
    title: "Injection / Treatment",
    description: "Document injections, treatments, wound checks and nursing interventions.",
    path: "/nursing/treatments",
    icon: Syringe,
    className: "module-cyan",
  },
  {
    title: "Nursing Notes",
    description: "Daily nursing notes, clinical concerns and follow-up documentation.",
    path: "/nursing/notes",
    icon: FileText,
    className: "module-pink",
  },
];

export default function NursingPage() {
  const navigate = useNavigate();

  return (
    <div className="nursing-page">
      <style>{`
        .nursing-page {
          min-height: 100vh;
          padding: 22px;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.28), transparent 28%),
            radial-gradient(circle at bottom right, rgba(147,197,253,.35), transparent 32%),
            linear-gradient(135deg, #eaf4ff 0%, #f8fbff 52%, #dcecff 100%);
          color: #071735;
        }

        .nursing-hero {
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
            linear-gradient(
              90deg,
              rgba(7,23,53,.96) 0%,
              rgba(29,78,216,.82) 45%,
              rgba(14,165,233,.35) 75%,
              rgba(14,165,233,.12) 100%
            ),
            url(${nursingHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 30px 80px rgba(15,23,42,.22);
        }

        .nursing-hero::before {
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

        .nursing-hero h1 {
          margin: 0;
          font-size: clamp(52px, 6vw, 80px);
          line-height: .92;
          letter-spacing: -.08em;
          font-weight: 900;
        }

        .nursing-hero p {
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

        .nursing-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 26px;
        }

        .stat-card {
          min-height: 120px;
          border-radius: 24px;
          padding: 24px;
          background: rgba(255,255,255,.88);
          border: 1px solid rgba(255,255,255,.78);
          box-shadow: 0 18px 45px rgba(15,23,42,.12);
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
          background: linear-gradient(135deg, #38bdf8, #2563eb);
        }

        .stat-card span {
          display: block;
          color: #385071;
          font-size: 14px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .stat-card strong {
          display: block;
          margin-top: 8px;
          font-size: 46px;
          line-height: 1;
          letter-spacing: -.08em;
        }

        .nursing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .nursing-card {
          min-height: 260px;
          border: 0;
          border-radius: 24px;
          padding: 34px;
          text-align: left;
          color: white;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 22px 50px rgba(15,23,42,.2);
          transition: .2s ease;
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .nursing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 70px rgba(15,23,42,.26);
        }

        .nursing-card::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -80px;
          bottom: -90px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
        }

        .module-blue { background: linear-gradient(135deg, #0ea5e9, #1d4ed8); }
        .module-green { background: linear-gradient(135deg, #34d399, #047857); }
        .module-purple { background: linear-gradient(135deg, #c084fc, #5b21b6); }
        .module-orange { background: linear-gradient(135deg, #fbbf24, #ea580c); }
        .module-cyan { background: linear-gradient(135deg, #22d3ee, #0e7490); }
        .module-pink { background: linear-gradient(135deg, #f472b6, #be185d); }

        .nursing-icon {
          position: relative;
          z-index: 2;
          width: 150px;
          height: 150px;
          min-width: 150px;
          border-radius: 34px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.28);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 18px 40px rgba(15,23,42,.18);
          backdrop-filter: blur(14px);
        }

        .nursing-icon svg {
          width: 82px;
          height: 82px;
        }

        .card-content {
          position: relative;
          z-index: 2;
        }

        .card-content h2 {
          margin: 0;
          font-size: 30px;
          line-height: 1.05;
          letter-spacing: -.055em;
        }

        .card-content p {
          margin: 16px 0 24px;
          font-size: 16px;
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

        @media (max-width: 1200px) {
          .nursing-stats,
          .nursing-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .nursing-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-status-card {
            width: 100%;
          }
        }

        @media (max-width: 760px) {
          .nursing-page {
            padding: 14px;
          }

          .nursing-stats,
          .nursing-grid {
            grid-template-columns: 1fr;
          }

          .nursing-hero {
            padding: 28px;
          }

          .nursing-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .nursing-icon {
            width: 110px;
            height: 110px;
            min-width: 110px;
          }

          .nursing-icon svg {
            width: 58px;
            height: 58px;
          }
        }
      `}</style>

      <section className="nursing-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <Stethoscope size={18} />
            Nursing Center
          </p>

          <h1>
            Nursing Care
            <br />
            Command Center
          </h1>

          <p>
            Manage nursing assessments, vitals, resident health checks,
            medication monitoring, treatments and nursing documentation from
            one centralized clinical workspace.
          </p>

          <div className="hero-actions">
            <button className="hero-primary" onClick={() => navigate("/nursing/assessments")}>
              Start Assessment <ChevronRight size={18} />
            </button>

            <button className="hero-secondary" onClick={() => navigate("/nursing/vitals")}>
              Record Vitals <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="hero-status-card">
          <div className="status-icon">
            <Stethoscope size={42} />
          </div>
          <span>Nursing Status</span>
          <h2>Active</h2>
          <p>Clinical monitoring workspace ready</p>
        </div>
      </section>

      <section className="nursing-stats">
        <div className="stat-card">
          <div className="stat-icon"><Clock size={36} /></div>
          <div>
            <span>Assessments Due</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><HeartPulse size={36} /></div>
          <div>
            <span>Vitals Today</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Activity size={36} /></div>
          <div>
            <span>Health Alerts</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><ShieldCheck size={36} /></div>
          <div>
            <span>Completed</span>
            <strong>0</strong>
          </div>
        </div>
      </section>

      <section className="nursing-grid">
        {nursingModules.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className={`nursing-card ${item.className}`}
              type="button"
              onClick={() => navigate(item.path)}
            >
              <div className="nursing-icon">
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
    </div>
  );
}