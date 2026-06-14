import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Plus,
  Search,
} from "lucide-react";

import api from "../services/api";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    event_type: "APPOINTMENT",
    start_time: "",
    end_time: "",
    resident_id: "",
    staff_id: "",
    location: "",
    description: "",
    priority: "NORMAL",
  });

  useEffect(() => {
    loadCalendar();
  }, []);

  async function loadCalendar() {
    try {
      setLoading(true);

      const [eventsRes, upcomingRes] = await Promise.all([
        api.get("/calendar/events"),
        api.get("/calendar/upcoming"),
      ]);

      setEvents(eventsRes.data || []);
      setUpcoming(upcomingRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(e) {
    e.preventDefault();

    if (!form.title || !form.event_type || !form.start_time) {
      alert("Title, event type, and start time are required.");
      return;
    }

    try {
      await api.post("/calendar/events", {
        ...form,
        resident_id: form.resident_id || null,
        staff_id: form.staff_id || null,
        end_time: form.end_time || null,
      });

      setForm({
        title: "",
        event_type: "APPOINTMENT",
        start_time: "",
        end_time: "",
        resident_id: "",
        staff_id: "",
        location: "",
        description: "",
        priority: "NORMAL",
      });

      await loadCalendar();
    } catch (err) {
      console.error(err);
      alert("Unable to create event.");
    }
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
      alert("Unable to complete event.");
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const query = search.toLowerCase();

      const matchesSearch =
        event.title?.toLowerCase().includes(query) ||
        event.event_type?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query);

      const matchesType = eventType ? event.event_type === eventType : true;
      const matchesStatus = status ? event.status === status : true;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [events, search, eventType, status]);

  return (
    <div className="calendar-page">
      <section className="resident-hero">
        <div>
          <p className="dashboard-eyebrow">Scheduling</p>
          <h1>Calendar</h1>
          <p>
            Schedule appointments, CFT meetings, staff events, compliance
            deadlines, facility inspections, and medication-related reminders.
          </p>
        </div>
      </section>

      <section className="resident-summary-grid task-summary-grid">
        <SummaryCard
          title="Total Events"
          value={events.length}
          icon={<CalendarDays />}
        />

        <SummaryCard
          title="Upcoming"
          value={upcoming.length}
          icon={<Clock />}
        />

        <SummaryCard
          title="Completed"
          value={events.filter((e) => e.is_completed).length}
          icon={<CheckCircle2 />}
        />

        <SummaryCard
          title="High Priority"
          value={events.filter((e) => e.priority === "HIGH" || e.priority === "CRITICAL").length}
          icon={<Filter />}
        />
      </section>

      <section className="calendar-create-card">
        <div className="panel-header">
          <h3>
            <Plus size={18} />
            Create Calendar Event
          </h3>
        </div>

        <form className="calendar-form" onSubmit={createEvent}>
          <input
            placeholder="Event title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <select
            value={form.event_type}
            onChange={(e) => setForm({ ...form, event_type: e.target.value })}
          >
            <option value="APPOINTMENT">Appointment</option>
            <option value="PSYCHIATRY">Psychiatry</option>
            <option value="PCP">PCP</option>
            <option value="THERAPY">Therapy</option>
            <option value="CFT_MEETING">CFT Meeting</option>
            <option value="MEDICATION">Medication</option>
            <option value="COMPLIANCE_DUE">Compliance Due</option>
            <option value="STAFF_TRAINING">Staff Training</option>
            <option value="FACILITY_INSPECTION">Facility Inspection</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            type="datetime-local"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />

          <input
            type="datetime-local"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          />

          <input
            placeholder="Resident ID"
            value={form.resident_id}
            onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
          />

          <input
            placeholder="Staff ID"
            value={form.staff_id}
            onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <button type="submit">Create Event</button>
        </form>
      </section>

      <section className="resident-toolbar">
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
          <option value="APPOINTMENT">Appointment</option>
          <option value="PSYCHIATRY">Psychiatry</option>
          <option value="PCP">PCP</option>
          <option value="THERAPY">Therapy</option>
          <option value="CFT_MEETING">CFT Meeting</option>
          <option value="COMPLIANCE_DUE">Compliance Due</option>
          <option value="STAFF_TRAINING">Staff Training</option>
          <option value="FACILITY_INSPECTION">Facility Inspection</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </section>

      <section className="calendar-layout">
        <div className="premium-table-card">
          <div className="table-header">
            <div>
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

        <div className="premium-panel">
          <div className="panel-header">
            <h3>Upcoming</h3>
            <CalendarDays size={18} />
          </div>

          {upcoming.length === 0 ? (
            <p className="empty-text">No upcoming events.</p>
          ) : (
            <div className="entity-list">
              {upcoming.slice(0, 8).map((event) => (
                <div key={event.id} className="entity-row">
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.event_type}</p>
                  </div>

                  <span>{formatDateTime(event.start_time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EventCard({ event, onComplete }) {
  return (
    <div className={`calendar-event-card ${event.priority?.toLowerCase()}`}>
      <div className="event-date-box">
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
            {event.status}
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

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function day(value) {
  if (!value) return "--";
  return new Date(value).getDate();
}

function month(value) {
  if (!value) return "---";
  return new Date(value).toLocaleString("default", { month: "short" });
}