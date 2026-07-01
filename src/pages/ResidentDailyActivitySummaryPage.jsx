import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  HeartPulse,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  UserCheck,
  UsersRound,
  Utensils,
  Pill,
  PenLine,
} from "lucide-react";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);

export default function ResidentDailyActivitySummaryPage() {
  const [residents, setResidents] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [selectedDate, setSelectedDate] = useState(today());
  const [summary, setSummary] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [staffNarrative, setStaffNarrative] = useState("");
  const [message, setMessage] = useState("");

  async function loadResidents() {
    try {
      const res = await api.get("/residents");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.data || [];
      setResidents(list);
    } catch (err) {
      console.error(err);
      setResidents([]);
    }
  }

  async function loadSummaries() {
    try {
      const params = new URLSearchParams();
      if (selectedResidentId) params.set("resident_id", selectedResidentId);
      if (selectedDate) params.set("summary_date", selectedDate);

      const res = await api.get(
        `/resident-care/daily-activities?${params.toString()}`
      );

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.data || [];

      setSummaries(list);

      if (list.length > 0) {
        setSummary(list[0]);
        setStaffNarrative(list[0].staff_narrative || "");
      } else {
        setSummary(null);
        setStaffNarrative("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Could not load daily summaries.");
    }
  }

  async function previewSummary() {
    if (!selectedResidentId) {
      setMessage("Please select a resident first.");
      return;
    }

    try {
      const res = await api.get(
        `/resident-care/daily-activities/generate?resident_id=${selectedResidentId}&summary_date=${selectedDate}`
      );

      setSummary(res.data);
      setStaffNarrative(res.data.staff_narrative || "");
      setMessage("Preview generated from resident records.");
    } catch (err) {
      console.error(err);
      setMessage("Could not generate preview.");
    }
  }

  async function saveGeneratedSummary() {
    if (!selectedResidentId) {
      setMessage("Please select a resident first.");
      return;
    }

    try {
      const res = await api.post("/resident-care/daily-activities/generate", {
        resident_id: selectedResidentId,
        summary_date: selectedDate,
        staff_narrative: staffNarrative,
        status: "DRAFT",
      });

      setSummary(res.data);
      setStaffNarrative(res.data.staff_narrative || "");
      setMessage("Daily activity summary saved as draft.");
      loadSummaries();
    } catch (err) {
      console.error(err);
      setMessage("Could not save generated summary.");
    }
  }

  async function updateSummary() {
    if (!summary?.id) {
      await saveGeneratedSummary();
      return;
    }

    try {
      const res = await api.patch(`/resident-care/daily-activities/${summary.id}`, {
        staff_narrative: staffNarrative,
        status: summary.status || "DRAFT",
      });

      setSummary(res.data);
      setMessage("Daily activity summary updated.");
    } catch (err) {
      console.error(err);
      setMessage("Could not update summary.");
    }
  }

  async function signSummary() {
    if (!summary?.id) {
      setMessage("Save the summary before signing.");
      return;
    }

    try {
      const res = await api.post(
        `/resident-care/daily-activities/${summary.id}/sign`
      );

      setSummary(res.data);
      setMessage("Daily activity summary signed and finalized.");
    } catch (err) {
      console.error(err);
      setMessage("Could not sign summary.");
    }
  }

  useEffect(() => {
    loadResidents();
  }, []);

  useEffect(() => {
    loadSummaries();
  }, [selectedResidentId, selectedDate]);

  const selectedResident = useMemo(() => {
    return residents.find((r) => String(r.id) === String(selectedResidentId));
  }, [residents, selectedResidentId]);

  function residentName(resident) {
    if (!resident) return "Resident";
    return [resident.first_name, resident.middle_name, resident.last_name]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <div className="daily-summary-page">
      <style>{`
        .daily-summary-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .daily-hero {
          min-height: 370px;
          border-radius: 28px;
          padding: 42px;
          margin-bottom: 22px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
          background:
            linear-gradient(90deg, rgba(5,18,44,.98), rgba(30,64,175,.92), rgba(14,165,233,.25)),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
          overflow: hidden;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 14px;
          color: #7dd3fc;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .daily-hero h1 {
          margin: 0;
          font-size: clamp(44px, 5vw, 72px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .daily-hero p {
          max-width: 780px;
          margin: 20px 0 0;
          color: rgba(255,255,255,.9);
          font-size: 18px;
          line-height: 1.65;
          font-weight: 650;
        }

        .hero-metrics {
          width: 350px;
          display: grid;
          gap: 12px;
        }

        .metric-card {
          border-radius: 18px;
          padding: 18px;
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.25);
          backdrop-filter: blur(18px);
        }

        .metric-card strong {
          display: block;
          font-size: 38px;
          line-height: 1;
        }

        .metric-card span {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: #bfdbfe;
        }

        .message-bar {
          margin-bottom: 18px;
          padding: 15px 18px;
          border-radius: 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-weight: 900;
        }

        .filter-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
          border-radius: 22px;
          padding: 18px;
          background: white;
          border: 1px solid #dbeafe;
          box-shadow: 0 18px 44px rgba(15,23,42,.11);
        }

        .filter-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .filter-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #2563eb, #06b6d4);
        }

        .filter-title {
          margin: 0;
          font-size: 18px;
          font-weight: 950;
        }

        .filter-subtitle {
          margin: 4px 0 0;
          color: #64748b;
          font-weight: 850;
          font-size: 13px;
        }

        .filter-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-controls select,
        .filter-controls input {
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid #bfdbfe;
          background: white;
          padding: 0 14px;
          font-weight: 900;
          color: #071735;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(420px, .9fr);
          gap: 24px;
          align-items: start;
        }

        .premium-card {
          border-radius: 24px;
          padding: 30px;
          background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,251,255,.96));
          border: 1px solid rgba(219,234,254,.95);
          box-shadow: 0 24px 64px rgba(15,23,42,.13);
          position: relative;
          overflow: hidden;
        }

        .premium-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #2563eb, #06b6d4, #14b8a6);
        }

        .card-header {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        .card-header p {
          margin: 0 0 9px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .11em;
        }

        .card-header h2 {
          margin: 0;
          font-size: 34px;
          line-height: 1;
          color: #071735;
          letter-spacing: -.06em;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .stat-card {
          border-radius: 18px;
          padding: 18px;
          background: white;
          border: 1px solid #dbeafe;
          box-shadow: 0 10px 28px rgba(15,23,42,.06);
        }

        .stat-card strong {
          display: block;
          color: #071735;
          font-size: 28px;
          line-height: 1;
          font-weight: 950;
        }

        .stat-card span {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 8px;
          color: #64748b;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .summary-section {
          padding: 18px;
          border-radius: 18px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
          margin-bottom: 14px;
        }

        .summary-section h3 {
          margin: 0 0 10px;
          color: #071735;
          font-size: 17px;
          font-weight: 950;
        }

        .summary-section p {
          margin: 0;
          color: #475569;
          line-height: 1.6;
          font-weight: 750;
        }

        .narrative-box {
          width: 100%;
          min-height: 190px;
          border: 1px solid #cfe0f7;
          border-radius: 18px;
          padding: 16px;
          background: white;
          color: #071735;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.6;
          resize: vertical;
          outline: none;
        }

        .button-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .primary-btn,
        .secondary-btn,
        .success-btn {
          min-height: 58px;
          border-radius: 16px;
          padding: 0 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 950;
          cursor: pointer;
        }

        .primary-btn {
          border: 0;
          color: white;
          background: linear-gradient(135deg, #1d4ed8, #0f766e);
        }

        .success-btn {
          border: 0;
          color: white;
          background: linear-gradient(135deg, #047857, #10b981);
        }

        .secondary-btn {
          color: #071735;
          background: white;
          border: 1px solid #cfe0f7;
        }

        .history-list {
          display: grid;
          gap: 14px;
        }

        .history-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #2563eb;
          border-radius: 18px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
          cursor: pointer;
        }

        .history-card.final {
          border-left-color: #047857;
        }

        .history-card strong {
          display: block;
          color: #071735;
          font-size: 17px;
        }

        .history-card p {
          margin: 8px 0 0;
          color: #64748b;
          font-weight: 750;
          line-height: 1.45;
        }

        .chip-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .chip {
          border-radius: 999px;
          padding: 7px 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .chip.green {
          background: #ecfdf5;
          color: #047857;
        }

        .chip.orange {
          background: #fffbeb;
          color: #b45309;
        }

        .empty-state {
          min-height: 170px;
          border-radius: 16px;
          border: 1px dashed #93c5fd;
          display: grid;
          place-items: center;
          text-align: center;
          color: #49617f;
          background: linear-gradient(135deg, #ffffff, #eff6ff);
          font-weight: 900;
        }

        @media (max-width: 1180px) {
          .daily-hero,
          .filter-card {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-metrics {
            width: 100%;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .daily-summary-page {
            padding: 14px;
          }

          .summary-stats {
            grid-template-columns: 1fr;
          }

          .daily-hero {
            min-height: auto;
            padding: 28px;
          }

          .daily-hero h1 {
            font-size: 42px;
          }
        }
      `}</style>

      <section className="daily-hero">
        <div>
          <p className="hero-kicker">
            <Activity size={18} />
            ResidentCare Command Center
          </p>

          <h1>
            Daily Activity
            <br />
            Summary
          </h1>

          <p>
            Generate a resident daily activity summary from hourly checks,
            medication records, meals, hydration, visitors, smoking breaks,
            incidents, and safety observations.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{summary?.total_checks ?? 0}</strong>
            <span>Hourly Checks</span>
          </div>

          <div className="metric-card">
            <strong>{summary?.medication_taken_count ?? 0}</strong>
            <span>Medications Taken</span>
          </div>

          <div className="metric-card">
            <strong>{summary?.incident_count ?? 0}</strong>
            <span>Incidents</span>
          </div>
        </div>
      </section>

      {message && <div className="message-bar">{message}</div>}

      <div className="filter-card">
        <div className="filter-left">
          <div className="filter-icon">
            <Search size={24} />
          </div>

          <div>
            <p className="filter-title">
              {selectedResident ? residentName(selectedResident) : "Select Resident"}
            </p>
            <p className="filter-subtitle">
              Select resident and date, then generate the daily summary.
            </p>
          </div>
        </div>

        <div className="filter-controls">
          <select
            value={selectedResidentId}
            onChange={(e) => setSelectedResidentId(e.target.value)}
          >
            <option value="">Select Resident</option>
            {residents.map((resident) => (
              <option key={resident.id} value={resident.id}>
                {residentName(resident)}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <button className="secondary-btn" type="button" onClick={previewSummary}>
            <RefreshCw size={18} />
            Generate Preview
          </button>
        </div>
      </div>

      <section className="summary-grid">
        <main className="premium-card">
          <div className="card-header">
            <div>
              <p>Generated Report</p>
              <h2>Resident Daily Summary</h2>
            </div>
            <FileText size={32} color="#2563eb" />
          </div>

          {!summary ? (
            <div className="empty-state">
              Select a resident and generate a daily activity summary.
            </div>
          ) : (
            <>
              <div className="summary-stats">
                <div className="stat-card">
                  <strong>{summary.total_checks || 0}</strong>
                  <span>
                    <Clock size={13} />
                    Checks
                  </span>
                </div>

                <div className="stat-card">
                  <strong>{summary.hydration_count || 0}</strong>
                  <span>
                    <HeartPulse size={13} />
                    Hydration
                  </span>
                </div>

                <div className="stat-card">
                  <strong>{summary.medication_taken_count || 0}</strong>
                  <span>
                    <Pill size={13} />
                    Meds Taken
                  </span>
                </div>

                <div className="stat-card">
                  <strong>{summary.groups_attended_count || 0}</strong>
                  <span>
                    <UsersRound size={13} />
                    Groups
                  </span>
                </div>

                <div className="stat-card">
                  <strong>{summary.visitor_count || 0}</strong>
                  <span>
                    <UserCheck size={13} />
                    Visitors
                  </span>
                </div>

                <div className="stat-card">
                  <strong>{summary.incident_count || 0}</strong>
                  <span>
                    <AlertTriangle size={13} />
                    Incidents
                  </span>
                </div>
              </div>

              <div className="summary-section">
                <h3>Auto Summary</h3>
                <p>{summary.auto_summary || "No generated summary available."}</p>
              </div>

              <div className="summary-section">
                <h3>Meals & Hydration</h3>
                <p>
                  {summary.meals_summary || "No meal summary."} Hydration documented{" "}
                  {summary.hydration_count || 0} time(s).
                </p>
              </div>

              <div className="summary-section">
                <h3>Medication</h3>
                <p>
                  Medication due {summary.medication_due_count || 0} time(s).
                  Taken {summary.medication_taken_count || 0} time(s).
                  Refusals {summary.medication_refusal_count || 0}.
                </p>
              </div>

              <div className="summary-section">
                <h3>Risk & Safety</h3>
                <p>{summary.risk_summary || "No risk summary documented."}</p>
              </div>

              <div className="summary-section">
                <h3>Staff Narrative</h3>
                <textarea
                  className="narrative-box"
                  value={staffNarrative}
                  onChange={(e) => setStaffNarrative(e.target.value)}
                  disabled={summary.is_signed}
                  placeholder="Add staff narrative, final observations, shift summary, or follow-up instructions..."
                />
              </div>

              <div className="button-row">
                <button
                  className="primary-btn"
                  type="button"
                  onClick={saveGeneratedSummary}
                  disabled={summary.is_signed}
                >
                  <Save size={18} />
                  Save Draft
                </button>

                <button
                  className="secondary-btn"
                  type="button"
                  onClick={updateSummary}
                  disabled={summary.is_signed}
                >
                  <PenLine size={18} />
                  Update Narrative
                </button>

                <button
                  className="success-btn"
                  type="button"
                  onClick={signSummary}
                  disabled={summary.is_signed}
                >
                  <ShieldCheck size={18} />
                  Sign Final
                </button>
              </div>
            </>
          )}
        </main>

        <aside className="premium-card">
          <div className="card-header">
            <div>
              <p>History</p>
              <h2>Saved Summaries</h2>
            </div>
            <CalendarDays size={32} color="#2563eb" />
          </div>

          <div className="history-list">
            {summaries.length === 0 && (
              <div className="empty-state">No saved summaries found.</div>
            )}

            {summaries.map((item) => (
              <div
                key={item.id}
                className={`history-card ${item.is_signed ? "final" : ""}`}
                onClick={() => {
                  setSummary(item);
                  setStaffNarrative(item.staff_narrative || "");
                }}
              >
                <strong>{item.summary_date}</strong>
                <p>{item.auto_summary || "Daily activity summary"}</p>

                <div className="chip-row">
                  <span className={`chip ${item.is_signed ? "green" : "orange"}`}>
                    <CheckCircle2 size={12} />
                    {item.is_signed ? "Final" : "Draft"}
                  </span>

                  <span className="chip">
                    {item.total_checks || 0} Checks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}