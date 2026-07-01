import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Bell,
  CheckSquare,
  LogOut,
  LogIn,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  FileCheck2,
  Building2,
  Brain,
  Apple,
  ClipboardList,
  UserCheck,
  UsersRound,
  Car,
  Wrench,
  Pill,
  Activity,
  Flame,
  Bug,
  Settings,
  UserCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const navGroups = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard },
      { label: "Operations Dashboard", path: "/operations-dashboard", icon: Activity },
      { label: "Residents", path: "/residents", icon: Users },
      { label: "Staff", path: "/staff", icon: UserRound },
      { label: "Medication Center", path: "/medications", icon: Pill },
    ],
  },
  {
    label: "Facility Compliance",
    items: [
      { label: "Temperature Logs", path: "/facility-compliance/logs", icon: Thermometer },
      { label: "Operations Center", path: "/operations-center", icon: Building2 },
      { label: "Regulatory Compliance", path: "/facility-compliance/regulatory", icon: ShieldCheck },
      { label: "Vehicle & Transport", path: "/facility-compliance/transport-logs", icon: Car },
    ],
    secondary: [
      { label: "Group Notes Audit", path: "/facility-compliance/group-notes-audit", icon: FileCheck2 },
      { label: "Progress Note Audit", path: "/facility-compliance/progress-note-audit", icon: ClipboardList },
      { label: "Resident Sign In/Out", path: "/facility-compliance/resident-sign-logs", icon: UserCheck },
      { label: "Visitor Log", path: "/facility-compliance/visitor-logs", icon: ClipboardCheck },
      { label: "Maintenance Log", path: "/facility-compliance/facility-maintenance-logs", icon: Wrench },
      { label: "Fire Drills", path: "/facility-compliance/fire-drills", icon: Flame },
      { label: "Pest Control", path: "/facility-compliance/pest-control", icon: Bug },
      { label: "Facility Records", path: "/facility-compliance/facility-compliance", icon: Building2 },
    ],
  },
  {
    label: "Clinical",
    items: [
      { label: "Nursing", path: "/nursing", icon: Stethoscope },
      { label: "BHP Portal", path: "/bhp", icon: Brain },
      { label: "Clinical Team", path: "/clinical-team", icon: UsersRound },
      { label: "Dietician", path: "/dietician", icon: Apple },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Calendar", path: "/calendar", icon: CalendarDays },
      { label: "Tasks", path: "/tasks", icon: CheckSquare },
      { label: "Compliance", path: "/compliance", icon: ClipboardCheck },
      { label: "Documents", path: "/documents", icon: FileText },
      { label: "Notifications", path: "/notifications", icon: Bell },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem("bcareaz_token"));

  const [openGroups, setOpenGroups] = useState({
    "Facility Compliance": false,
  });

  function logout() {
    localStorage.removeItem("bcareaz_token");
    window.location.href = "/login";
  }

  function isActive(path) {
    return path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
  }

  function toggleGroup(label) {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }

  return (
    <div className="premium-shell">
      <style>{`
        .premium-shell {
          min-height: 100vh;
          display: flex;
          background: #eef6ff;
          color: #0f172a;
        }

        .premium-sidebar {
          width: 286px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background:
            radial-gradient(circle at top left, rgba(45,212,191,.22), transparent 30%),
            linear-gradient(180deg, #0f2740 0%, #111b35 45%, #13365a 100%);
          border-right: 1px solid rgba(255,255,255,.12);
          box-shadow: 18px 0 55px rgba(15,23,42,.22);
        }

        .sidebar-glow {
          position: absolute;
          top: -120px;
          left: -110px;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          background: rgba(45,212,191,.22);
          filter: blur(18px);
          pointer-events: none;
        }

        .premium-brand {
          position: relative;
          z-index: 2;
          padding: 26px 18px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .premium-brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #052e2b;
          font-size: 24px;
          font-weight: 950;
          background: linear-gradient(135deg, #67e8f9, #22c55e);
          box-shadow: 0 16px 34px rgba(34,197,94,.26);
        }

        .premium-brand h1 {
          margin: 0;
          color: white;
          font-size: 18px;
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -.04em;
        }

        .premium-brand p {
          margin: 4px 0 0;
          color: rgba(255,255,255,.72);
          font-size: 11px;
          font-weight: 750;
        }

        .facility-card {
          position: relative;
          z-index: 2;
          margin: 0 18px 14px;
          padding: 15px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          background: linear-gradient(135deg, rgba(20,184,166,.95), rgba(22,163,74,.9));
          border: 1px solid rgba(255,255,255,.18);
          box-shadow: 0 18px 38px rgba(20,184,166,.24);
        }

        .facility-icon {
          width: 38px;
          height: 38px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.12);
        }

        .facility-card h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 950;
        }

        .facility-card p {
          margin: 4px 0 0;
          font-size: 11px;
          color: rgba(255,255,255,.8);
          font-weight: 750;
        }

        .premium-nav {
          position: relative;
          z-index: 2;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 4px 12px 18px;
        }

        .premium-nav::-webkit-scrollbar {
          width: 7px;
        }

        .premium-nav::-webkit-scrollbar-track {
          background: rgba(255,255,255,.05);
          border-radius: 999px;
        }

        .premium-nav::-webkit-scrollbar-thumb {
          background: rgba(125,211,252,.38);
          border-radius: 999px;
        }

        .nav-group {
          margin-bottom: 15px;
        }

        .nav-group-title {
          margin: 14px 6px 8px;
          color: rgba(255,255,255,.62);
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .1em;
        }

        .premium-nav-item {
          min-height: 44px;
          border-radius: 14px;
          padding: 0 12px;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,.82);
          text-decoration: none;
          font-size: 13px;
          font-weight: 850;
          transition: .18s ease;
        }

        .premium-nav-item:hover {
          color: white;
          background: rgba(255,255,255,.08);
          transform: translateX(2px);
        }

        .premium-nav-item.active {
          color: white;
          background: linear-gradient(135deg, rgba(37,99,235,.95), rgba(14,165,233,.86));
          box-shadow: 0 13px 24px rgba(14,165,233,.17);
        }

        .nav-icon {
          width: 30px;
          height: 30px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          background: rgba(255,255,255,.09);
        }

        .premium-nav-item.active .nav-icon {
          background: rgba(255,255,255,.18);
        }

        .secondary-toggle {
          width: 100%;
          min-height: 38px;
          border: 1px solid rgba(125,211,252,.22);
          border-radius: 13px;
          background: rgba(255,255,255,.055);
          color: rgba(255,255,255,.78);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
          margin: 8px 0 8px;
        }

        .secondary-toggle:hover {
          background: rgba(255,255,255,.11);
          color: white;
        }

        .secondary-toggle-left {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .secondary-nav {
          margin: 4px 0 12px 18px;
          display: grid;
          gap: 5px;
          padding-left: 12px;
          border-left: 1px solid rgba(255,255,255,.13);
        }

        .secondary-nav-item {
          min-height: 34px;
          border-radius: 11px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,.68);
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .secondary-nav-item:hover,
        .secondary-nav-item.active {
          color: white;
          background: rgba(255,255,255,.1);
        }

        .sidebar-footer {
          position: relative;
          z-index: 2;
          padding: 14px;
          border-top: 1px solid rgba(255,255,255,.08);
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(5,16,32,.22);
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 18px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.08);
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #2563eb, #06b6d4);
        }

        .user-info h4 {
          margin: 0;
          color: white;
          font-size: 13px;
          font-weight: 950;
        }

        .user-info p {
          margin: 4px 0 0;
          color: rgba(255,255,255,.64);
          font-size: 11px;
          font-weight: 750;
        }

        .account-btn,
        .login-btn,
        .logout-btn {
          min-height: 43px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          transition: .2s ease;
        }

        .account-btn {
          color: rgba(255,255,255,.82);
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.08);
        }

        .account-btn:hover {
          color: white;
          background: rgba(255,255,255,.12);
        }

        .login-btn {
          color: white;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          border: 0;
        }

        .logout-btn {
          color: white;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          border: 0;
        }

        .login-btn:hover,
        .logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(0,0,0,.22);
        }

        .premium-main {
          flex: 1;
          min-width: 0;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .topbar {
          margin: 16px 18px 0;
          border-radius: 24px;
          padding: 24px;
          background:
            radial-gradient(circle at top left, rgba(14,165,233,.18), transparent 32%),
            linear-gradient(135deg, rgba(255,255,255,.94), rgba(248,251,255,.9));
          border: 1px solid rgba(219,234,254,.9);
          box-shadow: 0 20px 50px rgba(15,23,42,.1);
        }

        .portal-hero-content.center {
          text-align: center;
        }

        .portal-kicker {
          margin: 0 0 7px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .portal-hero-content h2 {
          margin: 0;
          color: #071735;
          font-size: 30px;
          font-weight: 950;
          letter-spacing: -.06em;
        }

        .portal-kicker1 {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
          font-weight: 800;
        }

        @media (max-width: 980px) {
          .premium-sidebar {
            width: 245px;
          }
        }
      `}</style>

      <aside className="premium-sidebar">
        <div className="sidebar-glow" />

        <div className="premium-brand">
          <div className="premium-brand-mark">u</div>
          <div>
            <h1>UnifiedCare Platform</h1>
            <p>Behavioral Health CRM</p>
          </div>
        </div>

        <div className="facility-card">
          <div className="facility-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3>Home of Love</h3>
            <p>Dedicated Facility Tenant</p>
          </div>
        </div>

        <nav className="premium-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-title">{group.label}</div>

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`premium-nav-item ${isActive(item.path) ? "active" : ""}`}
                  >
                    <span className="nav-icon">
                      <Icon size={18} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {group.secondary?.length > 0 && (
                <>
                  <button
                    type="button"
                    className="secondary-toggle"
                    onClick={() => toggleGroup(group.label)}
                  >
                    <span className="secondary-toggle-left">
                      {openGroups[group.label] ? (
                        <ChevronDown size={15} />
                      ) : (
                        <ChevronRight size={15} />
                      )}
                      More Compliance
                    </span>
                    <span>{group.secondary.length}</span>
                  </button>

                  {openGroups[group.label] && (
                    <div className="secondary-nav">
                      {group.secondary.map((item) => {
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`secondary-nav-item ${
                              isActive(item.path) ? "active" : ""
                            }`}
                          >
                            <Icon size={14} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">
              <UserCircle2 size={30} />
            </div>

            <div className="user-info">
              <h4>Facility Administrator</h4>
              <p>{isLoggedIn ? "Signed in" : "Not signed in"}</p>
            </div>
          </div>

          <Link to="/admin/settings" className="account-btn">
            <Settings size={17} />
            Admin Settings
          </Link>

          <Link to="/profile" className="account-btn">
            <UserCircle2 size={17} />
            My Profile
          </Link>

          {isLoggedIn ? (
            <button className="logout-btn" onClick={logout}>
              <LogOut size={17} />
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-btn">
              <LogIn size={17} />
              Login
            </Link>
          )}
        </div>
      </aside>

      <section className="premium-main">
        <header className="topbar">
          <div className="portal-hero-content center">
            <p className="portal-kicker">Clinical Operations</p>
            <h2>Home of Love Dashboard</h2>
            <p className="portal-kicker1">
              unifiedCare Behavioral Health Residential Facility Platform
            </p>
          </div>
        </header>

        <Outlet />
      </section>
    </div>
  );
}