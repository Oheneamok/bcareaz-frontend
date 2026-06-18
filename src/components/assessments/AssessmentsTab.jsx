import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  HeartPulse,
  Brain,
  Stethoscope,
  X,
  FileText,
  Plus,
  Download,
} from "lucide-react";

import api from "../../services/api";
import ComprehensiveAssessmentForm from "./ComprehensiveAssessmentForm";
import NursingAssessmentForm from "./NursingAssessmentForm";
import BHPAssessmentForm from "./BHPAssessmentForm";

const assessmentTypes = [
  {
    id: "GENERAL",
    className: "general",
    statusClass: "status-general",
    title: "General Assessment",
    description:
      "Psychosocial, risk, substance use, legal, ADL, mental status, diagnosis, and clinical summary.",
    icon: ClipboardCheck,
  },
  {
    id: "BHP",
    className: "bhp",
    statusClass: "status-bhp",
    title: "BHP Assessment",
    description:
      "BHP review, medical necessity, diagnosis validation, level of care, and treatment recommendations.",
    icon: Brain,
  },
  {
    id: "NURSING",
    className: "nursing",
    statusClass: "status-nursing",
    title: "Nursing Assessment",
    description:
      "Vitals, allergies, medical history, medications, pain, TB/physical, ADLs, and nursing risks.",
    icon: Stethoscope,
  },
];

export default function AssessmentsTab({ resident = {}, residentId }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState(null);

  useEffect(() => {
    loadAssessments();
  }, [residentId]);

  async function loadAssessments() {
    if (!residentId) return;

    try {
      setLoading(true);
      const res = await api.get(`/assessments?resident_id=${residentId}`);
      setAssessments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getAssessmentsByType(type) {
    return assessments.filter((item) => item.assessment_type === type);
  }

  async function downloadPdf(assessmentId) {
    try {
      const res = await api.get(`/assessments/${assessmentId}/pdf`);
      const url = res.data?.url || res.data?.document_url || res.data?.file_url || res.data?.download_url;

      if (url) {
        window.open(url, "_blank");
      } else {
        alert("PDF generated, but no file URL was returned.");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to generate assessment PDF.");
    }
  }

  return (
    <div className="assessment-workspace">
      <div className="assessment-hero">
        <div>
          <p className="dashboard-eyebrow">Clinical Assessments</p>
          <h2>Resident Assessments</h2>
          <p>
            Complete, save, sign, and export General, BHP, and Nursing
            assessments for the resident chart.
          </p>
        </div>

        <div className="assessment-hero-icon">
          <HeartPulse size={32} />
        </div>
      </div>

      <div className="assessment-card-grid">
        {assessmentTypes.map((item) => {
          const Icon = item.icon;
          const records = getAssessmentsByType(item.id);
          const latest = records[0];

          return (
            <div
              key={item.id}
              className={`assessment-card ${item.className}`}
            >
              <div className="assessment-card-icon">
                <Icon size={24} />
              </div>

              <div style={{ flex: 1 }}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="assessment-meta-row">
                  <span className={`assessment-status ${item.statusClass}`}>
                    <FileText size={14} />
                    {latest ? latest.status : "Not Started"}
                  </span>

                  <span className={`assessment-status ${item.statusClass}`}>
                    {records.length} record(s)
                  </span>
                </div>

                <div className="assessment-card-actions">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => setActiveAssessment(item.id)}
                  >
                    <Plus size={15} />
                    New
                  </button>

                  {latest && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => downloadPdf(latest.id)}
                    >
                      <Download size={15} />
                      PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && <div className="table-empty">Loading assessments...</div>}

      <div className="assessment-history-panel">
        <h3>Assessment History</h3>

        {assessments.length === 0 ? (
          <div className="table-empty">No assessments found.</div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Assessor</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {assessments.map((item) => (
                  <tr key={item.id}>
                    <td>{item.assessment_type}</td>
                    <td>{formatDate(item.assessment_date)}</td>
                    <td>{item.assessor_name || "—"}</td>
                    <td>
                      <span className={`status-badge ${item.status?.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="table-action"
                        onClick={() => downloadPdf(item.id)}
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

      {activeAssessment && (
        <AssessmentModal
          type={activeAssessment}
          resident={resident}
          residentId={residentId}
          onSaved={() => {
            setActiveAssessment(null);
            loadAssessments();
          }}
          onClose={() => setActiveAssessment(null)}
        />
      )}
    </div>
  );
}

function AssessmentModal({ type, resident, residentId, onSaved, onClose }) {
  return (
    <div className="modal-backdrop nested-modal">
      <div className="premium-modal assessment-modal">
        <div className="modal-header">
          <div>
            <p className="dashboard-eyebrow">Assessment Form</p>
            <h2>
              {type === "GENERAL" && "General Assessment"}
              {type === "BHP" && "BHP Assessment"}
              {type === "NURSING" && "Nursing Assessment"}
            </h2>
          </div>

          <button className="icon-close" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="assessment-modal-body">
          {type === "GENERAL" && (
            <ComprehensiveAssessmentForm
              resident={resident}
              residentId={residentId}
              assessmentType="GENERAL"
              onSaved={onSaved}
            />
          )}

          {type === "NURSING" && (
            <NursingAssessmentForm
              resident={resident}
              residentId={residentId}
              assessmentType="NURSING"
              onSaved={onSaved}
            />
          )}

          {type === "BHP" && (
            <BHPAssessmentForm
              resident={resident}
              residentId={residentId}
              assessmentType="BHP"
              onSaved={onSaved}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}