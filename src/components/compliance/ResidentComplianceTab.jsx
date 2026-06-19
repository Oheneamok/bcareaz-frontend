import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileSignature,
  FileText,
  HeartPulse,
  Pill,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
  Users,
} from "lucide-react";

import api from "../../services/api";


const checklist = [
  {
    key: "admission",
    title: "Admission Packet",
    description: "Required consents, HIPAA, rights, fees, orientation, and admission disclosures.",
    icon: FileSignature,
    match: ["ADMISSION", "DISCLOSURE", "CONSENT", "HIPAA", "RIGHTS", "FEES"],
  },
  {
    key: "assessment",
    title: "Assessments",
    description: "General, BHP, and Nursing assessments.",
    icon: ClipboardCheck,
    match: ["ASSESSMENT"],
  },
  {
    key: "treatment_plan",
    title: "Treatment Plan",
    description: "Active treatment plan with goals, objectives, and signatures.",
    icon: HeartPulse,
    match: ["TREATMENT_PLAN"],
  },
  {
    key: "crisis_plan",
    title: "Crisis Plan",
    description: "Active crisis plan with de-escalation and emergency contacts.",
    icon: ShieldAlert,
    match: ["CRISIS_PLAN"],
  },
  {
    key: "medication",
    title: "Medication / MAR",
    description: "Medication orders, medication logs, and resident acknowledgements.",
    icon: Pill,
    match: ["MEDICATION", "MAR"],
  },
  {
    key: "cft",
    title: "CFT / Case Staffing",
    description: "CFT minutes, case staffing, and MNR documentation.",
    icon: Users,
    match: ["CFT", "MNR", "MEDICAL_NECESSITY"],
  },
  {
    key: "medical",
    title: "Medical Records / Labs",
    description: "Doctor notes, labs, TB, physical, psych eval, and medical records.",
    icon: Stethoscope,
    match: ["DOCTOR", "LAB", "TB", "PHYSICAL", "PSYCH", "MEDICAL"],
  },
  {
    key: "legal",
    title: "Legal / Guardian Documents",
    description: "Court order, POA, advance directive, guardian documents.",
    icon: FileText,
    match: ["LEGAL", "COURT", "POA", "GUARDIAN", "ADVANCE"],
  },
];

export default function ResidentComplianceTab({ resident = {}, residentId }) {
  const [alerts, setAlerts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [crisisPlans, setCrisisPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    loadCompliance();
  }, [residentId]);

  async function loadCompliance() {
    if (!residentId) return;

    try {
      setLoading(true);

      const [
        alertRes,
        documentRes,
        assessmentRes,
        treatmentRes,
        crisisRes,
      ] = await Promise.allSettled([
        api.get(`/compliance/alerts?resident_id=${residentId}`),
        api.get(`/documents?entity_type=RESIDENT&entity_id=${residentId}`),
        api.get(`/assessments?resident_id=${residentId}`),
        api.get(`/treatment-plans?resident_id=${residentId}`),
        api.get(`/crisis-plans?resident_id=${residentId}`),
      ]);

      setAlerts(getSettledArray(alertRes));
      setDocuments(getSettledArray(documentRes));
      setAssessments(getSettledArray(assessmentRes));
      setTreatmentPlans(getSettledArray(treatmentRes));
      setCrisisPlans(getSettledArray(crisisRes));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function generateComplianceChecks() {
    if (!residentId) return;

    try {
      setGenerating(true);

      await Promise.allSettled([
        api.post(`/treatment-plans/compliance/generate/${residentId}`),
        api.post(`/crisis-plans/compliance/generate/${residentId}`),
      ]);

      await loadCompliance();
      asetMessage("Compliance checks refreshed successfully.");
	  setTimeout(() => setMessage(""), 3500);error(err);
      alert("Unable to refresh compliance checks.");
    } finally {
      setGenerating(false);
    }
  }

  const status = useMemo(() => {
    const openAlerts = alerts.filter((a) => !a.is_resolved && a.status !== "RESOLVED");
    const criticalAlerts = openAlerts.filter((a) =>
      `${a.severity || ""}`.toUpperCase().includes("CRITICAL")
    );

    const completed = checklist.filter((item) =>
      isChecklistComplete(item, {
        documents,
        assessments,
        treatmentPlans,
        crisisPlans,
      })
    ).length;

    return {
      openAlerts,
      criticalAlerts,
      completed,
      total: checklist.length,
      percent: Math.round((completed / checklist.length) * 100),
    };
  }, [alerts, documents, assessments, treatmentPlans, crisisPlans]);

  return (
    <div className="assessment-workspace resident-compliance-tab">
      <div className="assessment-hero compliance-hero">
        <div>
          <p className="dashboard-eyebrow">Resident Compliance</p>
          <h2>Compliance Review</h2>
          <p>
            Track required resident chart documents, active clinical plans,
            missing items, due dates, and open compliance alerts.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          disabled={generating}
          onClick={generateComplianceChecks}
        >
          <RefreshCw size={16} />
          {generating ? "Refreshing..." : "Refresh Checks"}
        </button>
      </div>

      <div className="compliance-summary-grid">
        <MetricCard
          title="Checklist Complete"
          value={`${status.completed}/${status.total}`}
          helper={`${status.percent}% complete`}
          tone="blue"
        />
        <MetricCard
          title="Open Alerts"
          value={status.openAlerts.length}
          helper="Unresolved compliance items"
          tone={status.openAlerts.length ? "amber" : "green"}
        />
        <MetricCard
          title="Critical Alerts"
          value={status.criticalAlerts.length}
          helper="Requires immediate attention"
          tone={status.criticalAlerts.length ? "red" : "green"}
        />
      </div>

      <section className="assessment-history-panel">
        <div className="panel-header">
          <div>
            <h3>Compliance Checklist</h3>
            <p className="empty-text">
              Required chart items for admission, clinical care, and audit readiness.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="table-empty">Loading compliance status...</div>
        ) : (
          <div className="compliance-check-grid">
            {checklist.map((item) => {
              const Icon = item.icon;
              const complete = isChecklistComplete(item, {
                documents,
                assessments,
                treatmentPlans,
                crisisPlans,
              });

              return (
                <div
                  key={item.key}
                  className={`compliance-check-card ${complete ? "complete" : "missing"}`}
                >
                  <div className="compliance-check-icon">
                    <Icon size={22} />
                  </div>

                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>

                    <span className={`compliance-pill ${complete ? "ok" : "missing"}`}>
                      {complete ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      {complete ? "Complete" : "Missing / Needs Review"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
		{message && (
		  <div className="compliance-success-toast">
			<CheckCircle2 size={18} />
			{message}
		  </div>
		)}
      </section>

      <section className="assessment-history-panel">
        <h3>Open Compliance Alerts</h3>

        {status.openAlerts.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={34} />
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
                </tr>
              </thead>

              <tbody>
                {status.openAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <span className={`severity-badge ${`${alert.severity || ""}`.toLowerCase()}`}>
                        {alert.severity || "WARNING"}
                      </span>
                    </td>
                    <td>{alert.title || alert.alert_type || "Compliance Alert"}</td>
                    <td>{alert.description || "—"}</td>
                    <td>{formatDate(alert.due_date)}</td>
                    <td>{alert.status || "OPEN"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function getSettledArray(result) {
  if (result.status !== "fulfilled") return [];
  return Array.isArray(result.value.data) ? result.value.data : [];
}

function isChecklistComplete(item, data) {
  if (item.key === "assessment") {
    const types = data.assessments.map((a) => `${a.assessment_type || ""}`.toUpperCase());
    return types.includes("GENERAL") && types.includes("BHP") && types.includes("NURSING");
  }

  if (item.key === "treatment_plan") {
    return data.treatmentPlans.some((p) =>
      ["ACTIVE", "COMPLETED", "PENDING_BHP_SIGNATURE"].includes(`${p.status || ""}`.toUpperCase())
    );
  }

  if (item.key === "crisis_plan") {
    return data.crisisPlans.some((p) => `${p.status || ""}`.toUpperCase() === "ACTIVE");
  }

  return data.documents.some((doc) => {
    const haystack = [
      doc.document_type,
      doc.category,
      doc.title,
      doc.file_name,
      doc.notes,
    ]
      .join(" ")
      .toUpperCase();

    return item.match.some((m) => haystack.includes(m));
  });
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

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}