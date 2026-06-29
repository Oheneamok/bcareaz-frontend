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
  ShieldCheck,
  Search,
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
} from "lucide-react";
const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Residents", path: "/residents", icon: Users },
  { label: "Staff", path: "/staff", icon: UserRound },

  { label: "Temperature Logs", path: "/facility-compliance/logs", icon: Thermometer },
  { label: "Operations Center", path: "/operations-center", icon: Building2 },
  { label: "Group Notes Audit", path: "/facility-compliance/group-notes-audit", icon: FileCheck2 },
  { label: "Progress Note Audit", path: "/facility-compliance/progress-note-audit", icon: ClipboardList },
  { label: "Resident Sign In/Out", path: "/facility-compliance/resident-sign-logs", icon: UserCheck },
  { label: "Visitor Log", path: "/facility-compliance/visitor-logs", icon: ClipboardCheck },
  { label: "Transport Log", path: "/facility-compliance/transport-logs", icon: Car },
  { label: "Nursing", path: "/nursing", icon: Stethoscope },
  { label: "BHP Portal", path: "/bhp", icon: Brain },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
  { label: "Tasks", path: "/tasks", icon: CheckSquare },
  { label: "Compliance", path: "/compliance", icon: ClipboardCheck },
  { label: "Documents", path: "/documents", icon: FileText },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Clinical Team", path: "/clinical-team", icon: UsersRound },
  { label: "Dietician", path: "/dietician", icon: Apple },
];

export default function AdminLayout() {
  const location = useLocation();

  function logout() {
    localStorage.removeItem("bcareaz_token");
    window.location.href = "/login";
  }

  return (
    <div className="premium-shell">
      <aside className="premium-sidebar">
        <div className="sidebar-glow" />

        <div className="premium-brand">
          <div className="premium-brand-mark">b</div>
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`premium-nav-item ${active ? "active" : ""}`}
              >
                <span className="nav-icon">
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <div className="avatar">HA</div>
            <div>
              <h4>Facility Admin</h4>
              <p>Signed in</p>
            </div>
          </div>

          <button className="premium-logout" onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <section className="premium-main">
        
		<header className="topbar">
          <div className="portal-hero-content center">
			 <div className="portal-hero-content center">
			  <p className="portal-kicker">Clinical Operations</p>
			  <h2>Home of Love Dashboard</h2>
			  <p className="portal-kicker1">
				unifiedCare Behavioral Health Residential Facility Platform
			  </p>
			</div>

          </div>
        </header>

        <Outlet />
      </section>
    </div>
  );
}