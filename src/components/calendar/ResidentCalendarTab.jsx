import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import api from "../../services/api";
import EventForm from "./EventForm";

const eventTypes = [
  "ALL",
  "APPOINTMENT",
  "ASSESSMENT",
  "TREATMENT_REVIEW",
  "SERVICE_PLAN_REVIEW",
  "CFT_MEETING",
  "MEDICATION_REVIEW",
  "COURT",
  "PROBATION",
  "TRANSPORTATION",
  "CUSTOM",
];

export default function ResidentCalendarTab({ resident = {}, residentId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    loadEvents();
  }, [residentId]);

  async function loadEvents() {
    if (!residentId) return;

    try {
      setLoading(true);
      const res = await api.get(`/calendar-events?resident_id=${residentId}`);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (typeFilter === "ALL") return true;
      return `${event.event_type || ""}`.toUpperCase() === typeFilter;
    });
  }, [events, typeFilter]);

  const upcomingEvents = filteredEvents
    .filter((event) => new Date(event.start_time || event.event_date) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.start_time || a.event_date) -
        new Date(b.start_time || b.event_date)
    );

  return (
    <div className="assessment-workspace resident-calendar-tab">
      <div className="assessment-hero calendar-hero">
        <div>
          <p className="dashboard-eyebrow">Resident Schedule</p>
          <h2>Calendar</h2>
          <p>
            Track appointments, reviews, CFT meetings, medication reviews, court
            dates, transportation, and resident-specific events.
          </p>
        </div>

        <div className="medication-action-row">
          <button type="button" className="secondary-btn" onClick={loadEvents}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button type="button" className="primary-btn" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            New Event
          </button>
        </div>
      </div>

      <div className="calendar-toolbar">
        <div>
          <h3>Upcoming Events</h3>
          <p className="empty-text">{filteredEvents.length} event(s)</p>
        </div>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {formatType(type)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="table-empty">Loading calendar events...</div>
      ) : upcomingEvents.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={34} />
          <p>No upcoming calendar events found.</p>
        </div>
      ) : (
        <div className="calendar-agenda-list">
          {upcomingEvents.map((event) => (
            <div className="calendar-agenda-card" key={event.id}>
              <div className="calendar-date-chip">
                <strong>{getDay(event.start_time || event.event_date)}</strong>
                <span>{getMonth(event.start_time || event.event_date)}</span>
              </div>

              <div className="calendar-agenda-main">
                <div className="calendar-agenda-head">
                  <div>
                    <h3>{event.title || "Resident Event"}</h3>
                    <span className="status-badge active">
                      {formatType(event.event_type || "CUSTOM")}
                    </span>
                  </div>
                </div>

                <div className="calendar-agenda-meta">
                  <span>
                    <Clock size={15} />
                    {formatDateTime(event.start_time || event.event_date)}
                    {event.end_time ? ` - ${formatTime(event.end_time)}` : ""}
                  </span>

                  <span>
                    <MapPin size={15} />
                    {event.location || "No location"}
                  </span>
                </div>

                {event.notes && <p>{event.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop nested-modal">
          <div className="premium-modal assessment-modal">
            <div className="modal-header">
              <div>
                <p className="dashboard-eyebrow">Resident Calendar</p>
                <h2>Create Event</h2>
              </div>

              <button className="icon-close" type="button" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              <EventForm
                resident={resident}
                residentId={residentId}
                onSaved={() => {
                  setShowForm(false);
                  loadEvents();
                }}
              />
            </div>
          </div>
        </div>
      )}
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
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDay(value) {
  if (!value) return "--";
  return new Date(value).getDate();
}

function getMonth(value) {
  if (!value) return "---";
  return new Date(value).toLocaleString("default", { month: "short" });
}