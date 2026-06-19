import { useEffect, useState } from "react";
import { HeartPulse, Plus, Download, X, FileText } from "lucide-react";

import api from "../../services/api";
import TreatmentPlanForm from "./TreatmentPlanForm";

export default function TreatmentPlansTab({ resident = {}, residentId }) {
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
      const res = await api.get(`/treatment-plans?resident_id=${residentId}`);
      setPlans(res.data || []);
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf(planId) {
    try {
      const res = await api.get(`/treatment-plans/${planId}/pdf`);
      const url =
        res.data?.url ||
        res.data?.download_url ||
        res.data?.document_url ||
        res.data?.file_url;

      if (url) window.open(url, "_blank");
      else alert("PDF generated, but no file URL was returned.");
    } catch (err) {
      console.error(err);
      alert("Unable to generate treatment plan PDF.");
    }
  }

  return (
    <div className="assessment-workspace">
      <div className="assessment-hero treatment-hero">
        <div>
          <p className="dashboard-eyebrow">Treatment Planning</p>
          <h2>Treatment Plans</h2>
          <p>
            Create treatment expectations, recovery goals, measurable objectives,
            privileges, and resident signatures.
          </p>
        </div>

        <button className="primary-btn" type="button" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          New Treatment Plan
        </button>
      </div>

      <div className="assessment-history-panel">
        <h3>Treatment Plan History</h3>

        {loading ? (
          <div className="table-empty">Loading treatment plans...</div>
        ) : plans.length === 0 ? (
          <div className="table-empty">No treatment plans found.</div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Plan Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>{formatDate(plan.plan_date || plan.treatment_plan_date)}</td>
                    <td>{plan.plan_type || plan.treatment_plan_type || "Treatment Plan"}</td>
                    <td>
                      <span className={`status-badge ${plan.status?.toLowerCase()}`}>
                        {plan.status || "DRAFT"}
                      </span>
                    </td>
                    <td>{formatDate(plan.created_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="table-action"
                        onClick={() => downloadPdf(plan.id)}
                      >
                        <Download size={15} />
                        PDF
                      </button>
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
                <p className="dashboard-eyebrow">Treatment Plan</p>
                <h2>Create Treatment Plan</h2>
              </div>

              <button className="icon-close" type="button" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              <TreatmentPlanForm
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

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}