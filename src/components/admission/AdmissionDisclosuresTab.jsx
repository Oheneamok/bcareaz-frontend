import { useEffect, useState } from "react";
import {
  CheckCircle2,
  FileSignature,
  FileText,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import api from "../../services/api";
import DisclosureSignatureModal from "./DisclosureSignatureModal";

export default function AdmissionDisclosuresTab({ residentId }) {
  const [items, setItems] = useState([]);
  const [selectedDisclosure, setSelectedDisclosure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisclosures();
  }, [residentId]);

  async function loadDisclosures() {
    try {
      setLoading(true);
      const res = await api.get(`/admission-disclosures?resident_id=${residentId}`);
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function generateDisclosures() {
    try {
      await api.post(`/admission-disclosures/generate/${residentId}`);
      await loadDisclosures();
    } catch (err) {
      console.error(err);
      alert("Unable to generate disclosures.");
    }
  }

  async function generatePdf(disclosureId) {
    try {
      const res = await api.get(`/admission-disclosures/${disclosureId}/pdf`);
      window.open(res.data.download_url, "_blank");
      await loadDisclosures();
    } catch (err) {
      console.error(err);
      alert("Unable to generate PDF.");
    }
  }

  const signedCount = items.filter((x) => x.status === "SIGNED").length;
  const pendingCount = items.length - signedCount;

  return (
    <div className="premium-panel">
      <div className="panel-header">
        <div>
          <h3>
            <span className="inline-icon">
              <FileSignature />
            </span>
            Admission Disclosures
          </h3>
          <p className="empty-text">
            {signedCount} signed · {pendingCount} pending
          </p>
        </div>

        <button className="primary-btn" onClick={generateDisclosures}>
          <RefreshCw size={16} />
          Generate Required Forms
        </button>
      </div>

      {loading ? (
        <p className="empty-text">Loading disclosures...</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <ShieldAlert size={34} />
          <p>No admission disclosures found. Generate required forms.</p>
        </div>
      ) : (
        <div className="disclosure-grid">
          {items.map((item) => (
            <div key={item.id} className={`disclosure-card ${item.status?.toLowerCase()}`}>
              <div className="disclosure-card-top">
                <div className="disclosure-icon">
                  <FileSignature size={20} />
                </div>

                <span className={`status-badge ${item.status === "SIGNED" ? "active" : "pending"}`}>
                  {item.status}
                </span>
              </div>

              <h4>{item.title}</h4>
              <p>{item.content?.slice(0, 180)}...</p>

              <div className="signature-status-row">
                <span>
                  <CheckCircle2 size={14} />
                  Resident: {item.resident_signature ? "Signed" : "Pending"}
                </span>
                <span>
                  <CheckCircle2 size={14} />
                  Guardian: {item.guardian_signature ? "Signed" : "Pending"}
                </span>
                <span>
                  <CheckCircle2 size={14} />
                  Staff: {item.staff_signature ? "Signed" : "Pending"}
                </span>
              </div>

              <div className="disclosure-actions">
                <button onClick={() => setSelectedDisclosure(item)}>
                  <FileSignature size={15} />
                  Sign
                </button>

                <button onClick={() => generatePdf(item.id)}>
                  <FileText size={15} />
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDisclosure && (
        <DisclosureSignatureModal
          disclosure={selectedDisclosure}
          onClose={() => setSelectedDisclosure(null)}
          onSaved={() => {
            setSelectedDisclosure(null);
            loadDisclosures();
          }}
        />
      )}
    </div>
  );
}
