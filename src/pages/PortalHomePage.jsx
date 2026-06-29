import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Apple,
  Bell,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  HeartPulse,
  HelpCircle,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  Building2,
  Activity,
} from "lucide-react";

import api from "../services/api";
import heroImage from "../assets/portal_head.png";

const portals = [
  {
    key: "resident_care",
    title: "Resident Care",
    description:
      "Medication, progress notes, group notes, hourly activities and treatment activities.",
    path: "/resident-care",
    icon: Activity,
    className: "module-blue",
  },
  {
    key: "operations_center",
    title: "Operations Center",
    description:
      "Appointments, notifications, alerts, passdown, transport, visitor log and facility logs.",
    path: "/operations-center",
    icon: Building2,
    className: "module-green",
  },
  {
    key: "compliance",
    title: "Compliance Center",
    description: "Resident, staff and facility compliance, audits and reports.",
    path: "/compliance",
    icon: ShieldCheck,
    className: "module-purple",
  },
  {
    key: "dashboard",
    title: "Dashboard",
    description: "Real-time overview of residents, staff, tasks and trends.",
    path: "/dashboard",
    icon: LayoutDashboard,
    className: "module-orange",
  },
  {
    key: "nursing",
    title: "Nursing Portal",
    description: "Nursing notes, assessments, assigned care and oversight.",
    path: "/nursing",
    icon: Stethoscope,
    className: "module-cyan",
  },
  {
    key: "bhp",
    title: "BHP Portal",
    description: "BHP notes, assessments, treatment plans and documentation.",
    path: "/bhp",
    icon: Brain,
    className: "module-pink",
  },
  {
    key: "clinical_team",
    title: "Clinical Team",
    description:
      "Team meetings, tasks, documents, treatment plans and collaboration.",
    path: "/clinical-team",
    icon: UsersRound,
    className: "module-indigo",
  },
  {
    key: "dietician",
    title: "Dietician Portal",
    description: "Menu calendar, meal planning, special diets and nutrition notes.",
    path: "/dietician",
    icon: Apple,
    className: "module-teal",
  },
];

export default function PortalHomePage() {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("bcareaz_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("unifiedcare_permissions");

    if (saved) {
      setPermissions(JSON.parse(saved));
    }

    api
      .get("/portal/me/permissions")
      .then((res) => {
        setPermissions(res.data);
        localStorage.setItem(
          "unifiedcare_permissions",
          JSON.stringify(res.data)
        );
      })
      .catch(() => {});
  }, []);

  const getAccess = (key) => permissions?.portals?.[key] || "locked";

  const openPortal = (portal) => {
    const access = getAccess(portal.key);

    if (access === "locked") {
      alert(`${portal.title} is restricted for your current role.`);
      return;
    }

    navigate(portal.path);
  };

  return (
    <div className="premium-portal-page">
      <style>{`
        .premium-portal-page {
          min-height: 100vh;
          padding: 22px;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.28), transparent 28%),
            radial-gradient(circle at bottom right, rgba(147,197,253,.35), transparent 32%),
            linear-gradient(135deg, #eaf4ff 0%, #f8fbff 52%, #dcecff 100%);
          color: #071735;
        }

        .portal-hero-premium {
          min-height: 590px;
          border-radius: 36px;
          padding: 46px;
          margin-bottom: 28px;
          background-size: cover;
          background-position: center right;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 34px;
          color: white;
          box-shadow: 0 30px 80px rgba(15,23,42,.24);
          overflow: hidden;
          position: relative;
        }

        .portal-hero-content {
          position: relative;
          z-index: 2;
          max-width: 760px;
        }

        .portal-kicker {
          margin: 0 0 10px;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: .13em;
          font-weight: 950;
          color: #bfdbfe;
        }

        .portal-hero-content h2 {
          margin: 0;
          font-size: clamp(54px, 7vw, 92px);
          line-height: .9;
          letter-spacing: -.08em;
        }

        .portal-hero-content h2 span {
          color: #7dd3fc;
        }

        .portal-hero-content > p {
          margin: 22px 0 0;
          max-width: 680px;
          font-size: 24px;
          line-height: 1.65;
          color: rgba(25,255,255,.9);
          font-weight: 600;
        }

        .portal-welcome-user {
          margin-top: 30px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          width: fit-content;
          border-radius: 22px;
          background: rgba(255,255,255,.16);
          border: 4px solid rgba(25,255,255,.24);
          backdrop-filter: blur(12px);
        }

        .portal-avatar {
          width: 50px;
          height: 50px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.22);
        }

        .portal-welcome-user strong {
          display: block;
          font-size: 16px;
        }

        .portal-welcome-user p {
          margin: 3px 0 0;
          color: rgba(25,255,255,.78);
          font-size: 23px;
        }

        .portal-hero-task-card {
          position: relative;
          z-index: 2;
          width: 285px;
          padding: 30px;
          border-radius: 30px;
          background: rgba(255,255,255,.16);
          border: 1px solid rgba(255,255,255,.25);
          backdrop-filter: blur(18px);
          box-shadow: 0 22px 60px rgba(0,0,0,.2);
          text-align: center;
        }

        .task-circle {
          width: 86px;
          height: 86px;
          margin: 0 auto 18px;
          border-radius: 28px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #38bdf8, #2563eb);
        }

        .portal-hero-task-card p {
          margin: 0;
          color: rgba(255,255,255,.82);
          font-weight: 800;
        }

        .portal-hero-task-card h3 {
          margin: 8px 0;
          font-size: 46px;
          letter-spacing: -.07em;
        }

        .portal-hero-task-card button {
          margin-top: 22px;
          width: 100%;
          height: 58px;
          border: 0;
          border-radius: 18px;
          background: white;
          color: #071735;
          font-weight: 950;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }

        .portal-tile-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          margin-bottom: 28px;
        }

        .portal-tile {
          min-height: 485px;
          border: 0;
          border-radius: 28px;
          padding: 32px;
          color: white;
          text-align: left;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(15,23,42,.68);
          transition: .22s ease;
        }

        .portal-tile:hover {
          transform: translateY(-6px);
          box-shadow: 0 34px 90px rgba(15,23,42,.25);
        }

        .portal-tile::before {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          right: -90px;
          bottom: -100px;
          border-radius: 999px;
          background: rgba(255,255,255,.14);
        }

        .portal-tile::after {
          content: "";
          position: absolute;
          width: 110px;
          height: 110px;
          right: 42px;
          top: 38px;
          border-radius: 999px;
          background: rgba(25,255,255,.28);
        }

        .portal-tile.locked {
          filter: grayscale(.35);
          opacity: .72;
        }

        .portal-icon {
          position: relative;
          z-index: 2;
          width: 132px;
          height: 132px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.25);
		  border: 3px solid rgba(25,255,255,.55);
          backdrop-filter: blur(14px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.45),
            0 18px 40px rgba(15,23,42,.18);
          margin-bottom: 24px;
        }

        .portal-icon svg {
          width: 62px;
          height: 62px;
        }

        .portal-content {
          position: relative;
          z-index: 2;
        }

        .portal-content h3 {
          margin: 0;
          font-size: 31px;
          line-height: 1.02;
          letter-spacing: -.06em;
        }

        .portal-content p {
          margin: 25px 0 24px;
          max-width: 330px;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 650;
          color: rgba(25,255,255,.9);
        }

        .portal-tile-action {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border-radius: 19px;
          padding: 12px 18px;
          background: rgba(0,0,0,.28);
		  border: 3px solid rgba(25,255,255,.65);
          color: white;
          font-size: 20px;
          font-weight: 950;
        }

        .module-blue { background: linear-gradient(135deg, #0ea5e9, #1d4ed8); }
        .module-green { background: linear-gradient(135deg, #34d399, #047857); }
        .module-purple { background: linear-gradient(135deg, #c084fc, #5b21b6); }
        .module-orange { background: linear-gradient(135deg, #fbbf24, #ea580c); }
        .module-cyan { background: linear-gradient(135deg, #22d3ee, #0e7490); }
        .module-pink { background: linear-gradient(135deg, #f472b6, #be185d); }
        .module-indigo { background: linear-gradient(135deg, #818cf8, #3730a3); }
        .module-teal { background: linear-gradient(135deg, #2dd4bf, #0f766e); }

        .portal-summary-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .portal-summary-strip > div {
          min-height: 260px;
          border-radius: 24px;
          padding: 22px;
          background: rgba(255,255,255,.9);
          box-shadow: 0 18px 45px rgba(15,23,42,.62);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .portal-summary-strip svg {
          color: #E335E9;
          flex: 0 0 auto;
        }

        .portal-summary-strip span {
          flex: 1;
        }

        .portal-summary-strip p {
          margin: 0;
          color: #64748b;
          font-size: 23px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .portal-summary-strip strong {
          display: block;
          margin-top: 20px;
          color: #f20000;
          font-size: 28px;
          letter-spacing: -.04em;
        }

        @media (max-width: 1400px) {
          .portal-tile-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1100px) {
          .portal-tile-grid,
          .portal-summary-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .portal-hero-premium {
            flex-direction: column;
            align-items: flex-start;
          }

          .portal-hero-task-card {
            width: 100%;
          }
        }

        @media (max-width: 700px) {
          .premium-portal-page {
            padding: 14px;
          }

          .portal-tile-grid,
          .portal-summary-strip {
            grid-template-columns: 1fr;
          }

          .portal-hero-premium {
            padding: 28px;
          }

          .portal-tile {
            min-height: 250px;
          }
        }
      `}</style>

      <section
        className="portal-hero-premium"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(15,23,42,.78) 0%,
              rgba(15,23,42,.45) 35%,
              rgba(15,23,42,.08) 70%,
              rgba(15,23,42,.02) 100%
            ),
            url(${heroImage})
          `,
        }}
      >
        <div className="portal-hero-content">
          <p className="portal-kicker">Welcome to</p>
          <h2>
            unified<span>Care</span>
          </h2>
          <p>
            Your all-in-one platform for delivering exceptional care and
            maintaining full operational excellence.
          </p>

          <div className="portal-welcome-user">
            <div className="portal-avatar large">
              <UserRound size={26} />
            </div>
            <div>
              <strong>
                Welcome{user?.full_name ? `, ${user.full_name}` : ""}
              </strong>
              <p>{user?.role || "Behavioral Health Technician"} • Day Shift</p>
            </div>
          </div>
        </div>

        <div className="portal-hero-task-card">
          <div className="task-circle">
            <CheckCircle2 size={34} />
          </div>
          <p>You have</p>
          <h3>12 Tasks</h3>
          <p>Due Today</p>

          <button type="button" onClick={() => navigate("/tasks")}>
            View My Tasks <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section className="portal-tile-grid">
        {portals.map((portal) => {
          const access = getAccess(portal.key);
          const locked = access === "locked";
          const Icon = portal.icon;

          return (
            <button
              key={portal.key}
              type="button"
              className={`portal-tile ${portal.className} ${
                locked ? "locked" : ""
              }`}
              onClick={() => openPortal(portal)}
            >
              <div className="portal-icon">
                <Icon />
              </div>

              <div className="portal-content">
                <h3>{portal.title}</h3>
                <p>{portal.description}</p>

                <div className="portal-tile-action">
                  <span>{locked ? "Access Restricted" : "Launch Portal"}</span>
                  <ChevronRight size={20} />
                </div>
              </div>
            </button>
          );
        })}
      </section>

      <section className="portal-summary-strip">
        <div>
          <Bell size={24} />
          <span>
            <p>Alerts</p>
            <strong>3 Unread</strong>
          </span>
          <ChevronRight />
        </div>

        <div>
          <CheckCircle2 size={24} />
          <span>
            <p>Compliance Score</p>
            <strong>92%</strong>
          </span>
          <ChevronRight />
        </div>

        <div>
          <CalendarDays size={24} />
          <span>
            <p>Appointments Today</p>
            <strong>5</strong>
          </span>
          <ChevronRight />
        </div>

        <div>
          <UsersRound size={24} />
          <span>
            <p>Residents</p>
            <strong>32 Active</strong>
          </span>
          <ChevronRight />
        </div>
      </section>
    </div>
  );
}