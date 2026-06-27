import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

import api from "../services/api";

import heroImage from "../assets/portal_head.png";
import dailyImage from "../assets/daily_op.png";
import complianceImage from "../assets/compliance_center.png";
import dashboardImage from "../assets/dashboard.png";
import nursingImage from "../assets/nursing.png";
import bhpImage from "../assets/bhp.png";
import clinicalImage from "../assets/cft.png";
import dieticianImage from "../assets/dietician.png";
import operationsImage from "../assets/operations.png";

const portals = [
  {
    key: "resident_care",
    title: "Resident Care",
    description:
      "Medication, progress notes, group notes, hourly activities and treatment activities.",
    path: "/resident-care",
    image: dailyImage,
  },
  {
    key: "operations_center",
    title: "Operations Center",
    description:
      "Appointments, notifications, alerts, passdown, transport, visitor log and facility logs.",
    path: "/operations-center",
    image: operationsImage,
  },
  {
    key: "compliance",
    title: "Compliance Center",
    description: "Resident, staff and facility compliance, audits and reports.",
    path: "/compliance",
    image: complianceImage,
  },
  {
    key: "dashboard",
    title: "Dashboard",
    description: "Real-time overview of residents, staff, tasks and trends.",
    path: "/dashboard",
    image: dashboardImage,
  },
  {
    key: "nursing",
    title: "Nursing Portal",
    description: "Nursing notes, assessments, assigned care and oversight.",
    path: "/nursing",
    image: nursingImage,
  },
  {
    key: "bhp",
    title: "BHP Portal",
    description: "BHP notes, assessments, treatment plans and documentation.",
    path: "/bhp",
    image: bhpImage,
  },
  {
    key: "clinical_team",
    title: "Clinical Team",
    description:
      "Team meetings, tasks, documents, treatment plans and collaboration.",
    path: "/clinical-team",
    image: clinicalImage,
  },
  {
    key: "dietician",
    title: "Dietician Portal",
    description: "Menu calendar, meal planning, special diets and nutrition notes.",
    path: "/dietician",
    image: dieticianImage,
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

          return (
            <button
              key={portal.key}
              type="button"
              className={`portal-tile ${locked ? "locked" : ""}`}
              style={{
                backgroundImage: `
                  linear-gradient(
                    180deg,
                    rgba(15, 23, 42, 0.05),
                    rgba(15, 23, 42, 0.78)
                  ),
                  url(${portal.image})
                `,
              }}
              onClick={() => openPortal(portal)}
            >
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