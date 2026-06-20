import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import api from "../../services/api";

export default function StaffComplianceTab({ staff = {}, staffId }) {
  const [alerts, setAlerts] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCompliance();
  }, [staffId]);

  async function loadCompliance() {
    if (!staffId) return;

    try {
      setLoading(true);

      const [alertRes, certRes, trainingRes] = await Promise.allSettled([
        api.get(`/staff-compliance/alerts?staff_id=${staffId}`),
        api.get(`/staff-compliance/certifications?staff_id=${staffId}`),
        api.get(`/staff-compliance/training-records?staff_id=${staffId}`),
      ]);

      setAlerts(getArray(alertRes));
      setCertifications(getArray(certRes));
      setTrainings(getArray(trainingRes));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshChecks() {
    if (!staffId) return;

    try {
      setGenerating(true);
      await api.post(`/staff-compliance/generate/${staffId}`);
      await loadCompliance();
      setMessage("Staff compliance checks refreshed.");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to refresh compliance checks.");
    } finally {
      setGenerating(false);
    }
  }

  async function resolveAlert(alertId) {
    try {
      await api.patch(`/staff-compliance/alerts/${alertId}/resolve`, {
        is_resolved: true,
      });
      await loadCompliance();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to resolve alert.");
    }
  }

  const metrics = useMemo(() => {
    const openAlerts = alerts.filter(
      (a) => !a.is_resolved && `${a.status || ""}`.toUpperCase() !== "RESOLVED"
    );

    const critical = openAlerts.filter((a) =>
      `${a.severity || ""}`.toUpperCase().includes("CRITICAL")
    );

    const expiredCerts = certifications.filter((c) => isExpired(c.expiration_date));
    const expiringCerts = certifications.filter((c) => isExpiringSoon(c.expiration_date));
    const expiredTrainings = trainings.filter((t) => isExpired(t.expiration_date));
    const expiringTrainings = trainings.filter((t) => isExpiringSoon(t.expiration_date));

    const totalItems = certifications.length + trainings.length;
    const badItems =
      expiredCerts.length +
      expiringCerts.length +
      expiredTrainings.length +
      expiringTrainings.length +
      openAlerts.length;

    const score =
      totalItems === 0
        ? 0
        : Math.max(0, Math.round(100 - (badItems / Math.max(totalItems, 1)) * 100));

    return {
      openAlerts,
      critical,
      expiredCerts,
      expiringCerts,
      expiredTrainings,
      expiringTrainings,
      score,
    };
  }, [alerts, certifications, trainings]);

  return (
    <div className="assessment-workspace staff-compliance-tab">
      <div className="assessment-hero staff-compliance-hero">
        <div>
          <p className="dashboard-eyebrow">Staff Compliance</p>
          <h2>Compliance Review</h2>
          <p>
            Track required certifications, staff training, expiring documents,
            and licensing readiness items for this staff member.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          disabled={generating}
          onClick={refreshChecks}
        >
          <RefreshCw size={16} />
          {generating ? "Refreshing..." : "Refresh Checks"}
        </button>
      </div>

      {message && (
        <div className="compliance-success-toast">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <div className="compliance-summary-grid">
        <MetricCard
          title="Compliance Score"
          value={`${metrics.score}%`}
          helper="Certification and training readiness"
          tone={metrics.score >= 85 ? "green" : metrics.score >= 65 ? "amber" : "red"}
        />

        <MetricCard
          title="Open Alerts"
          value={metrics.openAlerts.length}
          helper="Unresolved staff compliance alerts"
          tone={metrics.openAlerts.length ? "amber" : "green"}
        />

        <MetricCard
          title="Critical Alerts"
          value={metrics.critical.length}
          helper="Requires immediate attention"
          tone={metrics.critical.length ? "red" : "green"}
        />

        <MetricCard
          title="Expiring Soon"
          value={
            metrics.expiringCerts.length + metrics.expiringTrainings.length
          }
          helper="Certifications or trainings nearing expiration"
          tone="blue"
        />
      </div>

      <section className="assessment-history-panel">
        <h3>Compliance Alerts</h3>

        {loading ? (
          <div className="table-empty">Loading staff compliance...</div>
        ) : metrics.openAlerts.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={34} />
            <p>No open compliance alerts.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Alert</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {metrics.openAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <span
                        className={`severity-badge ${`${alert.severity || "warning"}`.toLowerCase()}`}
                      >
                        {alert.severity || "WARNING"}
                      </span>
                    </td>
                    <td>{alert.title || alert.alert_type || "Compliance Alert"}</td>
                    <td>{alert.description || "—"}</td>
                    <td>{formatDate(alert.due_date)}</td>
                    <td>{alert.status || "OPEN"}</td>
                    <td>
                      <button
                        type="button"
                        className="table-action"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle2 size={15} />
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="assessment-history-panel">
        <h3>Expiring / Expired Items</h3>

        <div className="staff-expiring-grid">
          <ComplianceList
            title="Expired Certifications"
            items={metrics.expiredCerts}
            nameField="certification_name"
            dateField="expiration_date"
            emptyText="No expired certifications."
          />

          <ComplianceList
            title="Expiring Certifications"
            items={metrics.expiringCerts}
            nameField="certification_name"
            dateField="expiration_date"
            emptyText="No certifications expiring soon."
          />

          <ComplianceList
            title="Expired Trainings"
            items={metrics.expiredTrainings}
            nameField="training_name"
            dateField="expiration_date"
            emptyText="No expired trainings."
          />

          <ComplianceList
            title="Expiring Trainings"
            items={metrics.expiringTrainings}
            nameField="training_name"
            dateField="expiration_date"
            emptyText="No trainings expiring soon."
          />
        </div>
      </section>
    </div>
  );
}

function ComplianceList({ title, items, nameField, dateField, emptyText }) {
  return (
    <div className="staff-mini-panel">
      <h4>{title}</h4>

      {items.length === 0 ? (
        <p>{emptyText}</p>
      ) : (
        <div className="staff-mini-list">
          {items.map((item) => (
            <div key={item.id} className="staff-mini-row">
              <div>
                <strong>{item[nameField] || item.certification_type || "Item"}</strong>
                <span>Expires: {formatDate(item[dateField])}</span>
              </div>
              <AlertTriangle size={18} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, helper, tone }) {
  return (
    <div className={`compliance-metric-card ${tone}`}>
      <strong>{value}</strong>
      <span>{title}</span>
      <p>{helper}</p>
    </div>
  );
}

function getArray(result) {
  if (result.status !== "fulfilled") return [];
  return Array.isArray(result.value.data) ? result.value.data : [];
}

function isExpired(value) {
  if (!value) return false;
  const today = new Date();
  const date = new Date(value);
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function isExpiringSoon(value) {
  if (!value || isExpired(value)) return false;
  const today = new Date();
  const date = new Date(value);
  const in60 = new Date();
  in60.setDate(today.getDate() + 60);
  return date <= in60;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}