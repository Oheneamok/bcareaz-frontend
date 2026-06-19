import { useEffect, useState } from "react";
import { Pill, Plus, X, ClipboardList, FileText } from "lucide-react";

import api from "../../services/api";
import MedicationOrderForm from "./MedicationOrderForm";
import MARLogForm from "./MARLogForm";

export default function MedicationTab({ resident = {}, residentId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState(null);

  useEffect(() => {
    loadMedicationOrders();
  }, [residentId]);

  async function loadMedicationOrders() {
    if (!residentId) return;

    try {
      setLoading(true);
      const res = await api.get(`/medication-orders?resident_id=${residentId}`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="assessment-workspace">
      <div className="assessment-hero medication-hero">
        <div>
          <p className="dashboard-eyebrow">Medication Management</p>
          <h2>Medication</h2>
          <p>
            Manage medication orders, MAR logs, PRN documentation, pharmacy
            details, and medication administration records.
          </p>
        </div>

        <div className="medication-action-row">
          <button className="secondary-btn" onClick={() => setActiveForm("MAR")}>
            <ClipboardList size={16} />
            MAR Log
          </button>

          <button className="primary-btn" onClick={() => setActiveForm("ORDER")}>
            <Plus size={16} />
            New Medication Order
          </button>
        </div>
      </div>

      <div className="assessment-card-grid">
        <MedicationMetric title="Active Orders" value={orders.filter((x) => x.status === "ACTIVE").length} />
        <MedicationMetric title="Total Orders" value={orders.length} />
        <MedicationMetric title="PRN Orders" value={orders.filter((x) => x.is_prn || x.prn).length} />
      </div>

      <div className="assessment-history-panel">
        <h3>Medication Orders</h3>

        {loading ? (
          <div className="table-empty">Loading medication orders...</div>
        ) : orders.length === 0 ? (
          <div className="table-empty">No medication orders found.</div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Route</th>
                  <th>Prescriber</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.medication_name || order.name || "—"}</td>
                    <td>{order.dosage || order.dose || "—"}</td>
                    <td>{order.frequency || "—"}</td>
                    <td>{order.route || "—"}</td>
                    <td>{order.prescriber_name || "—"}</td>
                    <td>
                      <span className={`status-badge ${order.status?.toLowerCase()}`}>
                        {order.status || "ACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeForm && (
        <div className="modal-backdrop nested-modal">
          <div className="premium-modal assessment-modal">
            <div className="modal-header">
              <div>
                <p className="dashboard-eyebrow">Medication</p>
                <h2>
                  {activeForm === "ORDER" && "Medication Order"}
                  {activeForm === "MAR" && "MAR / Medication Log"}
                </h2>
              </div>

              <button className="icon-close" type="button" onClick={() => setActiveForm(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="assessment-modal-body">
              {activeForm === "ORDER" && (
                <MedicationOrderForm
                  resident={resident}
                  residentId={residentId}
                  onSaved={() => {
                    setActiveForm(null);
                    loadMedicationOrders();
                  }}
                />
              )}

              {activeForm === "MAR" && (
                <MARLogForm
                  resident={resident}
                  residentId={residentId}
                  medicationOrders={orders}
                  onSaved={() => setActiveForm(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MedicationMetric({ title, value }) {
  return (
    <div className="assessment-card medication-metric-card">
      <div className="assessment-card-icon">
        <Pill size={22} />
      </div>
      <div>
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}