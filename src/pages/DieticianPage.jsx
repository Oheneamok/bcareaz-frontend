import React from "react";
import {
  Apple,
  ClipboardList,
  Utensils,
  HeartPulse,
  Scale,
  Droplets,
  Salad,
  FileText,
  CalendarDays,
  CheckCircle2,
  ShieldAlert,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import dieticianHero from "../assets/dietician.png";

const dieticianModules = [
  {
    title: "Nutrition Assessment",
    description: "Initial and ongoing nutrition assessments, risks and dietary needs.",
    path: "/dietician/assessments",
    icon: ClipboardList,
    className: "module-blue",
  },
  {
    title: "Meal Plans",
    description: "Resident meal plans, special diets, allergies and preferences.",
    path: "/dietician/meal-plans",
    icon: Utensils,
    className: "module-green",
  },
  {
    title: "Diet Orders",
    description: "Therapeutic diet orders, restrictions and clinical diet instructions.",
    path: "/dietician/diet-orders",
    icon: Salad,
    className: "module-purple",
  },
  {
    title: "Weight Monitoring",
    description: "Weight logs, BMI trends, gain/loss alerts and nutrition follow-up.",
    path: "/dietician/weight-monitoring",
    icon: Scale,
    className: "module-orange",
  },
  {
    title: "Hydration Monitoring",
    description: "Fluid intake monitoring, hydration risk and intake documentation.",
    path: "/dietician/hydration",
    icon: Droplets,
    className: "module-cyan",
  },
  {
    title: "Medical Nutrition",
    description: "Diabetes, hypertension, cardiac and special clinical nutrition care.",
    path: "/dietician/medical-nutrition",
    icon: HeartPulse,
    className: "module-pink",
  },
  {
    title: "Dietician Notes",
    description: "Dietician progress notes, recommendations and follow-up records.",
    path: "/dietician/notes",
    icon: FileText,
    className: "module-indigo",
  },
  {
    title: "Nutrition Schedule",
    description: "Dietician visits, meal reviews, consults and follow-up schedule.",
    path: "/dietician/schedule",
    icon: CalendarDays,
    className: "module-teal",
  },
];

export default function DieticianPage() {
  const navigate = useNavigate();

  return (
    <div className="dietician-page">
      <style>{`
        .dietician-page {
          min-height: 100vh;
          padding: 22px;
          background:
            radial-gradient(circle at top left, rgba(34,197,94,.26), transparent 28%),
            radial-gradient(circle at bottom right, rgba(147,197,253,.35), transparent 32%),
            linear-gradient(135deg, #ecfdf5 0%, #f8fbff 52%, #dcecff 100%);
          color: #071735;
        }

        .dietician-hero {
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
            linear-gradient(90deg, rgba(7,23,53,.96), rgba(5,150,105,.84), rgba(14,165,233,.24)),
            url(${dieticianHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 30px 80px rgba(15,23,42,.22);
        }

        .dietician-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 70% 45%, rgba(34,197,94,.38), transparent 42%);
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
          color: #bbf7d0;
        }

        .dietician-hero h1 {
          margin: 0;
          font-size: clamp(52px, 6vw, 80px);
          line-height: .92;
          letter-spacing: -.08em;
          font-weight: 900;
        }

        .dietician-hero p {
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
          border: 3px solid rgba(25,255,255,.72);
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
          background: linear-gradient(135deg, #34d399, #047857);
        }

        .hero-status-card span {
          display: block;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .12em;
          color: #bbf7d0;
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

        .dietician-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 26px;
        }

        .stat-card {
          min-height: 200px;
          border-radius: 24px;
          padding: 24px;
          background: rgba(255,255,255,.9);
          border: 3px solid rgba(25,255,255,.78);
          box-shadow: 0 18px 45px rgba(15,23,42,.72);
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
		  box-shadow: 0 18px 45px rgba(15,23,42,.72);
          background: linear-gradient(135deg, #34d399, #047857);
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

        .dietician-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .dietician-card {
          min-height: 460px;
          border: 0;
          border-radius: 24px;
          padding: 30px;
          text-align: left;
          color: white;
          cursor: pointer;
          position: relative;
          overflow: hidden;
		  border: 4px solid rgba(25,255,255,.72);
          box-shadow: 0 22px 50px rgba(15,23,42,.72);
          transition: .2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .dietician-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 70px rgba(15,23,42,.26);
        }

        .dietician-card::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -80px;
          bottom: -90px;
          border-radius: 999px;
          background: rgba(255,255,255,.13);
        }

        .dietician-icon {
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

        .dietician-icon svg {
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
          padding: 12px 18px;
          background: rgba(0,0,0,.28);
          color: white;
		  border: 4px solid rgba(25,255,255,.72);
          font-size: 18px;
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
          .dietician-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1200px) {
          .dietician-stats,
          .dietician-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dietician-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-status-card {
            width: 100%;
          }
        }

        @media (max-width: 760px) {
          .dietician-page {
            padding: 14px;
          }

          .dietician-stats,
          .dietician-grid {
            grid-template-columns: 1fr;
          }

          .dietician-hero {
            padding: 28px;
          }
        }
      `}</style>

      <section className="dietician-hero">
        <div className="hero-content">
          <p className="hero-kicker">
            <Apple size={18} />
            Dietician Portal
          </p>

          <h1>
            Nutrition Care
            <br />
            Command Center
          </h1>

          <p>
            Manage nutrition assessments, meal plans, diet orders, hydration,
            weight monitoring, therapeutic diets and dietician documentation
            from one centralized nutrition workspace.
          </p>

          <div className="hero-actions">
            <button
              className="hero-primary"
              type="button"
              onClick={() => navigate("/dietician/assessments")}
            >
              Start Nutrition Assessment <ChevronRight size={18} />
            </button>

            <button
              className="hero-secondary"
              type="button"
              onClick={() => navigate("/dietician/meal-plans")}
            >
              Open Meal Plans <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="hero-status-card">
          <div className="status-icon">
            <Apple size={42} />
          </div>
          <span>Nutrition Status</span>
          <h2>Active</h2>
          <p>Dietary care workspace ready</p>
        </div>
      </section>

      <section className="dietician-stats">
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
            <Utensils size={36} />
          </div>
          <div>
            <span>Meal Plans</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ShieldAlert size={36} />
          </div>
          <div>
            <span>Nutrition Risks</span>
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

      <section className="dietician-grid">
        {dieticianModules.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className={`dietician-card ${item.className}`}
              type="button"
              onClick={() => navigate(item.path)}
            >
              <div className="card-content">
                <div className="dietician-icon">
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