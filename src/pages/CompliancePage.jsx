import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ClipboardCheck,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import api from "../services/api";

export default function CompliancePage() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompliance();
  }, []);

  async function loadCompliance() {
    try {
      setLoading(true);

      const [summaryRes, alertsRes] = await Promise.all([
        api.get("/dashboard/compliance"),
        api.get("/dashboard/alerts"),
      ]);

      setSummary(summaryRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="page">Loading compliance...</div>;
  }

  return (
    <div className="compliance-page">
      <section className="resident-hero">
        <div>
          <p className="dashboard-eyebrow">Quality & Compliance</p>
          <h1>Compliance Center</h1>
          <p>
            Monitor resident chart compliance, staff compliance, facility
            requirements, open alerts, and risk level.
          </p>
        </div>

        <div className={`status-chip ${summary?.overall?.status?.toLowerCase()}`}>
          {summary?.overall?.status}
        </div>
      </section>

      <section className="compliance-score-panel">
        <div>
          <p className="dashboard-eyebrow">Overall Compliance Score</p>
          <h2>{summary?.overall?.compliance_score ?? 0}%</h2>
          <p className="muted">
            Score is calculated from open resident, staff, and facility alerts.
          </p>
        </div>

        <div className="compliance-ring">
          {summary?.overall?.compliance_score ?? 0}%
        </div>
      </section>

      <section className="resident-summary-grid">
        <ComplianceCard
          title="Resident Compliance"
          value={summary?.resident_compliance?.open_alerts ?? 0}
          label="Open Alerts"
          icon={<Users />}
        />

        <ComplianceCard
          title="Staff Compliance"
          value={summary?.staff_compliance?.open_alerts ?? 0}
          label="Open Alerts"
          icon={<UserRound />}
        />

        <ComplianceCard
          title="Facility Compliance"
          value={summary?.facility_compliance?.open_alerts ?? 0}
          label="Open Alerts"
          icon={<Building2 />}
        />
      </section>

      <section className="compliance-alert-grid">
        <AlertPanel
          title="Resident Alerts"
          icon={<Users />}
          alerts={alerts?.resident_alerts || []}
          empty="No resident compliance alerts."
        />

        <AlertPanel
          title="Staff Alerts"
          icon={<UserRound />}
          alerts={alerts?.staff_alerts || []}
          empty="No staff compliance alerts."
        />

        <AlertPanel
          title="Facility Alerts"
          icon={<Building2 />}
          alerts={alerts?.facility_alerts || []}
          empty="No facility compliance alerts."
        />
      </section>
    </div>
  );
}

function ComplianceCard({ title, value, label, icon }) {
  const risk = value > 0;

  return (
    <div className={`resident-summary-card ${risk ? "summary-danger" : ""}`}>
      <div className="summary-icon">
        {risk ? <AlertTriangle /> : icon}
      </div>

      <div>
        <p>{title}</p>
        <h2>{value ?? 0}</h2>
        <span className="small-muted">{label}</span>
      </div>
    </div>
  );
}

function AlertPanel({ title, icon, alerts, empty }) {
  return (
    <div className="premium-panel">
      <div className="panel-header">
        <h3>
          <span className="inline-icon">{icon}</span>
          {title}
        </h3>

        <span className="alert-count">{alerts.length}</span>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <ShieldCheck size={32} />
          <p>{empty}</p>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-row">
              <div>
                <span className={`severity-chip ${alert.severity?.toLowerCase()}`}>
                  {alert.severity || "WARNING"}
                </span>

                <h4>{alert.title}</h4>

                <p>{alert.description}</p>

                {alert.due_date && (
                  <small>Due: {formatDate(alert.due_date)}</small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}