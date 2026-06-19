import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Plus,
  Download,
  X,
  FileText,
  AlertTriangle,
} from "lucide-react";

import api from "../../services/api";
import CrisisPlanForm from "./CrisisPlanForm";

export default function CrisisPlansTab({ resident = {}, residentId }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [residentId]);

  async function loadPlans() {
    if (!residentId) return;

    try {
      setLoading(true);
      const res = await api.get(`/crisis-plans?resident_id=${residentId}`);
      setPlans(res.data || []);
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }

  function latestActivePlan() {
    return plans.find((p) => p.status === "ACTIVE") || plans[0];
  }

  return (
    <div className="assessment-workspace">
      <div className="assessment-hero crisis-hero">
        <div>
          <p className="dashboard-eyebrow">Safety Planning</p>
          <h2>Crisis Plans</h2>
          <p>
            Document triggers, warning signs, de-escalation strategies,
            safety interventions, emergency contacts, and guardian notification
            instructions.
          </p>
        </div>

        <button
          className="primary-btn"
          type="button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          New Crisis Plan
        </button>
      </div>

      {latestActivePlan() && (
        <div className="crisis-summary-card">
          <div className="crisis-summary-icon">
            <ShieldAlert size={26} />
          </div>

          <div>
            <p className="dashboard-eyebrow">Latest Crisis Plan</p>
            <h3>{latestActivePlan().status || "ACTIVE"}</h3>
            <p>
              Plan Date: {formatDate(latestActivePlan().plan_date)} · Review
              Due: {formatDate(latestActivePlan().review_due_date)}
            </p>
          </div>
        </div>
      )}

      <div className="assessment-history-panel">
        <h3>Crisis Plan History</h3>

        {loading ? (
          <div className="table-empty">Loading crisis plans...</div>
        ) : plans.length === 0 ? (
          <div className="table-empty">No crisis plans found.</div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Plan Date</th>
                  <th>Review Due</th>
                  <th>Preferred Hospital</th>
                  <th>Compliance</th>
                </tr>
              </thead>

              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <span className={`status-badge ${plan.status?.toLowerCase()}`}>
                        {plan.status || "ACTIVE"}
                      </span>
                    </td>

                    <td>{formatDate(plan.plan_date)}</td>
                    <td>{formatDate(plan.review_due_date)}</td>
                    <td>{plan.preferred_hospital || "—"}</td>

                    <td>
                      <div className="crisis-compliance-stack">
                        <CompliancePill
                          ok={!!plan.deescalation_strategies}
                          label="De-escalation"
                        />
                        <CompliancePill
                          ok={!!plan.emergency_contacts}
                          label="Emergency Contacts"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-backdrop nested-modal">
          <div className="premium-modal assessment-modal">
            <div className="modal-header">
              <div>
                <p className="dashboard-eyebrow">Crisis Plan</p>
                <h2>Create Crisis Plan</h2>
              </div>

              <button
                className="icon-close"
                type="button"
                onClick={() => setShowForm(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              <CrisisPlanForm
                resident={resident}
                residentId={residentId}
                onSaved={() => {
                  setShowForm(false);
                  loadPlans();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompliancePill({ ok, label }) {
  return (
    <span className={`crisis-compliance-pill ${ok ? "ok" : "missing"}`}>
      {ok ? <FileText size={13} /> : <AlertTriangle size={13} />}
      {label}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}