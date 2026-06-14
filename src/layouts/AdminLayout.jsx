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
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Residents", path: "/residents", icon: Users },
  { label: "Staff", path: "/staff", icon: UserRound },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
  { label: "Tasks", path: "/tasks", icon: CheckSquare },
  { label: "Compliance", path: "/compliance", icon: ClipboardCheck },
  { label: "Documents", path: "/documents", icon: FileText },
  { label: "Notifications", path: "/notifications", icon: Bell },
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
            <h1>bCareAZ</h1>
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
          <div>
            <p className="topbar-label">Clinical Operations</p>
            <h2>Home of Love Dashboard</h2>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input placeholder="Search residents, tasks, documents..." />
            </div>

            <button className="topbar-bell">
              <Bell size={18} />
              <span />
            </button>
          </div>
        </header>

        <Outlet />
      </section>
    </div>
  );
}