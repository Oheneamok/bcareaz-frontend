import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import api from "../services/api";

const eventTypes = [
  ["APPOINTMENT", "Appointment"],
  ["PSYCHIATRY", "Psychiatry"],
  ["PCP", "PCP"],
  ["THERAPY", "Therapy"],
  ["CFT_MEETING", "CFT Meeting"],
  ["MEDICATION", "Medication"],
  ["COMPLIANCE_DUE", "Compliance Due"],
  ["STAFF_TRAINING", "Staff Training"],
  ["FACILITY_INSPECTION", "Facility Inspection"],
  ["OTHER", "Other"],
];

const emptyForm = {
  title: "",
  event_type: "APPOINTMENT",
  start_time: "",
  end_time: "",
  resident_id: "",
  staff_id: "",
  location: "",
  description: "",
  priority: "NORMAL",
};

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadCalendar();
  }, []);

  async function loadCalendar() {
    try {
      setLoading(true);

      const [eventsRes, upcomingRes] = await Promise.allSettled([
        api.get("/calendar/events"),
        api.get("/calendar/upcoming"),
      ]);

      setEvents(
        eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value.data)
          ? eventsRes.value.data
          : []
      );

      setUpcoming(
        upcomingRes.status === "fulfilled" && Array.isArray(upcomingRes.value.data)
          ? upcomingRes.value.data
          : []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(e) {
    e.preventDefault();

    if (!form.title || !form.event_type || !form.start_time) {
      showToast("error", "Title, event type, and start time are required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/calendar/events", {
        ...form,
        resident_id: form.resident_id || null,
        staff_id: form.staff_id || null,
        end_time: form.end_time || null,
      });

      setForm(emptyForm);
      await loadCalendar();
    } catch (err) {
      console.error(err);
      showToast("error", "Unable to Create Event", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

	function showToast(type, title, message) {
	  setToast({ type, title, message });
	  setTimeout(() => setToast(null), 3500);
	}

  async function completeEvent(eventId) {
    try {
      await api.patch(`/calendar/events/${eventId}`, {
        status: "COMPLETED",
        is_completed: true,
        completed_at: new Date().toISOString(),
      });

      await loadCalendar();
    } catch (err) {
      console.error(err);
      showToast("error", "Unable to complete event", "Please try again.");
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        event.title?.toLowerCase().includes(query) ||
        event.event_type?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query);

      const matchesType = eventType ? event.event_type === eventType : true;
      const matchesStatus = status ? event.status === status : true;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, search, eventType, status]);

  const metrics = useMemo(() => {
    const completed = events.filter((e) => e.is_completed).length;
    const highPriority = events.filter(
      (e) => e.priority === "HIGH" || e.priority === "CRITICAL"
    ).length;
    const overdue = events.filter(
      (e) =>
        !e.is_completed &&
        e.start_time &&
        new Date(e.start_time) < new Date()
    ).length;

    return { completed, highPriority, overdue };
  }, [events]);

  return (
    <div className="calendar-page premium-calendar-page">
      <section className="calendar-premium-hero">
        <div>
          <p className="dashboard-eyebrow">
            <Sparkles size={15} />
            Scheduling Center
          </p>
          <h1>Calendar</h1>
          <p>
            Schedule appointments, CFT meetings, staff events, compliance
            deadlines, facility inspections, and medication reminders.
          </p>
			{toast && (
			  <div className={`premium-toast ${toast.type}`}>
				<div className="premium-toast-icon">
				  {toast.type === "error" ? "!" : "✓"}
				</div>

				<div>
				  <strong>{toast.title}</strong>
				  <p>{toast.message}</p>
				</div>

				<button type="button" onClick={() => setToast(null)}>
				  ×
				</button>
			  </div>
			)}		  
		  
        </div>

        <button type="button" onClick={loadCalendar}>
          <RefreshCw size={17} />
          Refresh Calendar
        </button>
      </section>

      <section className="calendar-metric-grid">
        <SummaryCard title="Total Events" value={events.length} icon={<CalendarDays />} tone="blue" />
        <SummaryCard title="Upcoming" value={upcoming.length} icon={<Clock />} tone="indigo" />
        <SummaryCard title="Completed" value={metrics.completed} icon={<CheckCircle2 />} tone="green" />
        <SummaryCard title="High Priority" value={metrics.highPriority} icon={<AlertTriangle />} tone={metrics.highPriority ? "red" : "amber"} />
      </section>
	  
	  

      <section className="calendar-create-card premium-create-card">
        <div className="panel-header">
          <div>
            <p className="dashboard-eyebrow">New Event</p>
            <h3>
              <Plus size={18} />
              Create Calendar Event
            </h3>
          </div>
        </div>

        <form className="calendar-form premium-calendar-form" onSubmit={createEvent}>
          <Field label="Event Title">
            <input
              placeholder="Example: Psychiatry appointment"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>

          <Field label="Event Type">
            <select
              value={form.event_type}
              onChange={(e) => setForm({ ...form, event_type: e.target.value })}
            >
              {eventTypes.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field label="Start Time">
            <input
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
          </Field>

          <Field label="End Time">
            <input
              type="datetime-local"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
          </Field>

          <Field label="Resident ID">
            <input
              placeholder="Optional resident id"
              value={form.resident_id}
              onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
            />
          </Field>

          <Field label="Staff ID">
            <input
              placeholder="Optional staff id"
              value={form.staff_id}
              onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
            />
          </Field>

          <Field label="Location">
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>

          <Field label="Priority">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </Field>

          <Field label="Description" full>
            <textarea
              placeholder="Notes, transport needs, reminders, or instructions..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <div className="calendar-form-actions">
            <button type="submit" disabled={saving}>
              <Plus size={16} />
              {saving ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </section>

      <section className="calendar-toolbar premium-calendar-toolbar">
        <div className="resident-search">
          <Search size={18} />
          <input
            placeholder="Search calendar events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <option value="">All Types</option>
          {eventTypes.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </section>

      <section className="calendar-layout premium-calendar-layout">
        <div className="premium-table-card calendar-main-card">
          <div className="table-header">
            <div>
              <p className="dashboard-eyebrow">Agenda</p>
              <h3>Calendar Events</h3>
              <p>{filteredEvents.length} event(s)</p>
            </div>
          </div>

          {loading ? (
            <div className="table-empty">Loading calendar...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="table-empty">No calendar events found.</div>
          ) : (
            <div className="calendar-event-list">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onComplete={() => completeEvent(event.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="premium-panel calendar-upcoming-panel">
          <div className="panel-header">
            <div>
              <p className="dashboard-eyebrow">Next</p>
              <h3>Upcoming</h3>
            </div>
            <CalendarDays size={20} />
          </div>

          {upcoming.length === 0 ? (
            <p className="empty-text">No upcoming events.</p>
          ) : (
            <div className="calendar-upcoming-list">
              {upcoming.slice(0, 8).map((event) => (
                <div key={event.id} className="calendar-upcoming-row">
                  <div className="mini-date-chip">
                    <strong>{day(event.start_time)}</strong>
                    <span>{month(event.start_time)}</span>
                  </div>

                  <div>
                    <strong>{event.title}</strong>
                    <p>{formatType(event.event_type)} · {formatTime(event.start_time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children, full = false }) {
  return (
    <label className={`calendar-field ${full ? "full" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function EventCard({ event, onComplete }) {
  return (
    <div className={`calendar-event-card premium-event-card ${event.priority?.toLowerCase()}`}>
      <div className="event-date-box premium-date-box">
        <strong>{day(event.start_time)}</strong>
        <span>{month(event.start_time)}</span>
      </div>

      <div className="event-main">
        <div className="event-title-row">
          <div>
            <span className={`priority-chip ${event.priority?.toLowerCase()}`}>
              {event.priority || "NORMAL"}
            </span>
            <h3>{event.title}</h3>
          </div>

          <span className={`status-badge ${event.status?.toLowerCase()}`}>
            {event.status || "SCHEDULED"}
          </span>
        </div>

        <p>{event.description || "No description provided."}</p>

        <div className="event-meta">
          <span>
            <Clock size={14} />
            {formatDateTime(event.start_time)}
          </span>

          <span>
            <MapPin size={14} />
            {event.location || "No location"}
          </span>
        </div>

        {!event.is_completed && (
          <button className="event-complete-btn" onClick={onComplete}>
            <CheckCircle2 size={15} />
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, tone }) {
  return (
    <div className={`calendar-summary-card ${tone}`}>
      <div className="summary-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value ?? 0}</h2>
      </div>
    </div>
  );
}

function formatType(value) {
  return `${value || ""}`.replaceAll("_", " ");
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function day(value) {
  if (!value) return "--";
  return new Date(value).getDate();
}

function month(value) {
  if (!value) return "---";
  return new Date(value).toLocaleString("default", { month: "short" });
}