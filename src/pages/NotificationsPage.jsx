import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Filter,
  Search,
} from "lucide-react";

import api from "../services/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [isRead, setIsRead] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);

      const [listRes, summaryRes] = await Promise.all([
        api.get("/notifications"),
        api.get("/notifications/summary"),
      ]);

      setNotifications(listRes.data || []);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(notificationId) {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      await loadNotifications();
    } catch (err) {
      console.error(err);
      alert("Unable to mark notification as read.");
    }
  }

  async function markAllRead() {
    try {
      await api.patch("/notifications/read-all");
      await loadNotifications();
    } catch (err) {
      console.error(err);
      alert("Unable to mark all notifications as read.");
    }
  }

  const filtered = useMemo(() => {
    return notifications.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.title?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query) ||
        item.notification_type?.toLowerCase().includes(query);

      const matchesRead =
        isRead === ""
          ? true
          : isRead === "READ"
          ? item.is_read
          : !item.is_read;

      const matchesPriority = priority ? item.priority === priority : true;

      return matchesSearch && matchesRead && matchesPriority;
    });
  }, [notifications, search, isRead, priority]);

  return (
    <div className="notifications-page">
      <section className="resident-hero">
        <div>
          <p className="dashboard-eyebrow">Communication Center</p>
          <h1>Notifications</h1>
          <p>
            View compliance alerts, task reminders, signature notices, calendar
            reminders, and operational messages.
          </p>
        </div>

        <button className="primary-action" onClick={markAllRead}>
          <CheckCheck size={18} />
          Mark All Read
        </button>
      </section>

      <section className="resident-summary-grid task-summary-grid">
        <SummaryCard
          title="Total Notifications"
          value={notifications.length}
          icon={<Bell />}
        />

        <SummaryCard
          title="Unread"
          value={summary?.unread ?? 0}
          icon={<BellRing />}
        />

        <SummaryCard
          title="High Priority"
          value={summary?.high_priority ?? 0}
          icon={<Filter />}
        />

        <SummaryCard
          title="Read"
          value={notifications.filter((n) => n.is_read).length}
          icon={<CheckCircle2 />}
        />
      </section>

      <section className="resident-toolbar">
        <div className="resident-search">
          <Search size={18} />
          <input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={isRead} onChange={(e) => setIsRead(e.target.value)}>
          <option value="">All</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </section>

      <section className="premium-table-card">
        <div className="table-header">
          <div>
            <h3>Notification Feed</h3>
            <p>{filtered.length} notification(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="table-empty">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">No notifications found.</div>
        ) : (
          <div className="notification-list">
            {filtered.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onRead={() => markRead(item.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function NotificationCard({ item, onRead }) {
  return (
    <div className={`notification-card ${!item.is_read ? "unread" : ""}`}>
      <div className="notification-icon">
        {item.is_read ? <Bell size={20} /> : <BellRing size={20} />}
      </div>

      <div className="notification-body">
        <div className="notification-title-row">
          <div>
            <span className={`priority-chip ${item.priority?.toLowerCase()}`}>
              {item.priority || "NORMAL"}
            </span>

            <h3>{item.title}</h3>
          </div>

          <span className={`status-badge ${item.is_read ? "active" : "pending"}`}>
            {item.is_read ? "Read" : "Unread"}
          </span>
        </div>

        <p>{item.message}</p>

        <div className="notification-meta">
          <span>{item.notification_type}</span>
          <span>{formatDate(item.created_at)}</span>
        </div>

        {!item.is_read && (
          <button className="notification-read-btn" onClick={onRead}>
            <CheckCircle2 size={15} />
            Mark Read
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="resident-summary-card">
      <div className="summary-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value ?? 0}</h2>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}