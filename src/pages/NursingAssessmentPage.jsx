import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Stethoscope,
  Save,
  Search,
  RefreshCw,
  FileText,
  CalendarDays,
  CheckCircle2,
  ShieldAlert,
  HeartPulse,
  ClipboardCheck,
  UserCheck,
} from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import api from "../services/api";
import cftHero from "../assets/cft.png";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  assessment_date: today(),
  nurse_name: "",
  nursing_summary: "",
  chief_complaint: "",
  allergies: "",
  medications_reviewed: "",
  vital_signs: {
    temperature: "",
    blood_pressure: "",
    pulse: "",
    respiration: "",
    oxygen_saturation: "",
    weight: "",
  },
  pain_assessment: "",
  mental_status: "",
  behavioral_observation: "",
  functional_status: "",
  fall_risk: "",
  suicide_risk: "",
  elopement_risk: "",
  substance_use_notes: "",
  medical_concerns: "",
  safety_summary: "",
  risk_summary: "",
  nursing_interventions: "",
  recommendations: "",
  follow_up_required: "",
  status: "DRAFT",
};

export default function NursingAssessmentPage() {
  const [residents, setResidents] = useState([]);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const sigPadRef = useRef(null);

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

  async function loadAssessments(residentId = selectedResidentId) {
    if (!residentId) return;

    try {
      const res = await api.get(
        `/assessments?resident_id=${residentId}&assessment_type=NURSING`
      );

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.data || [];

      setAssessments(list);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Could not load nursing assessments.");
    }
  }

  useEffect(() => {
    loadResidents();
  }, []);

  useEffect(() => {
    if (selectedResidentId) {
      loadAssessments(selectedResidentId);
    }
  }, [selectedResidentId]);

  const selectedResident = useMemo(() => {
    return residents.find((r) => String(r.id) === String(selectedResidentId));
  }, [residents, selectedResidentId]);

  function residentName(resident) {
    if (!resident) return "Resident";
    return [resident.first_name, resident.middle_name, resident.last_name]
      .filter(Boolean)
      .join(" ");
  }

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateVital(name, value) {
    setForm((prev) => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [name]: value,
      },
    }));
  }

  function clearSignature() {
    sigPadRef.current?.clear();
  }

  function getSignatureData() {
    try {
      if (!sigPadRef.current || sigPadRef.current.isEmpty()) return "";
      return sigPadRef.current.getTrimmedCanvas().toDataURL("image/png");
    } catch (err) {
      console.error("Signature capture failed:", err);
      return "";
    }
  }
	async function openPdf(id) {
	  try {
		const res = await api.get(`/assessments/${id}/pdf`);

		const url = res.data?.view_url || res.data?.download_url;

		if (!url) {
		  setMessage("PDF generated, but no file URL was returned.");
		  return;
		}

		window.open(url, "_blank");
	  } catch (err) {
		console.error(err);
		setMessage("Could not open PDF.");
	  }
	}
  async function signAssessment(id) {
    try {
      await api.patch(`/assessments/${id}`, {
        status: "SIGNED",
        is_signed: true,
        signed_at: new Date().toISOString(),
      });

      setMessage("Nursing assessment signed successfully.");
      await loadAssessments(selectedResidentId);
    } catch (err) {
      console.error(err);
      setMessage("Could not sign nursing assessment.");
    }
  }

  async function signAndGeneratePdf(id) {
    try {
      await api.patch(`/assessments/${id}`, {
        status: "SIGNED",
        is_signed: true,
        signed_at: new Date().toISOString(),
      });

      setMessage("Assessment signed. Opening PDF...");
      await loadAssessments(selectedResidentId);
      await openPdf(id);
    } catch (err) {
      console.error(err);
      setMessage("Could not sign and generate PDF.");
    }
  }

  async function submitAssessment(e) {
    e.preventDefault();

    if (!selectedResidentId) {
      setMessage("Please select a resident first.");
      return;
    }

    const signatureData = getSignatureData();
    const shouldSign = Boolean(signatureData) || form.status === "SIGNED" || form.status === "FINAL";

    const payload = {
      resident_id: selectedResidentId,
      assessment_type: "NURSING",
      assessment_date: form.assessment_date,

      biopsychosocial_summary: form.nursing_summary,
      mental_health_summary: form.mental_status,
      risk_summary: form.risk_summary,
      functional_summary: form.functional_status,
      substance_use_summary: form.substance_use_notes,
      behavioral_summary: form.behavioral_observation,
      safety_summary: form.safety_summary,
      recommendations: form.recommendations,

      assessor_name: form.nurse_name,
      assessor_role: "Nurse",
      status: shouldSign ? "SIGNED" : "DRAFT",
      is_signed: shouldSign,
      signed_at: shouldSign ? new Date().toISOString() : null,
      form_data: {
        ...form,
        nurse_signature: signatureData,
        signature_type: signatureData ? "DRAWN_SIGNATURE" : "NOT_SIGNED",
      },
    };

    try {
      setMessage("Saving nursing assessment...");
      const res = await api.post("/assessments", payload);
      const assessmentId = res.data?.id;

      if (!assessmentId) {
        setMessage("Assessment may have saved, but no assessment ID was returned.");
        await loadAssessments(selectedResidentId);
        return;
      }

      setMessage("Nursing assessment saved. Generating PDF for resident file...");
      await openPdf(assessmentId);

      setForm({ ...emptyForm, assessment_date: today() });
      clearSignature();
      await loadAssessments(selectedResidentId);
      setMessage("Nursing assessment saved successfully.");
    } catch (err) {
      console.error("Save nursing assessment failed:", err);
      const detail = err?.response?.data?.detail;
      setMessage(
        typeof detail === "string"
          ? detail
          : "Could not save nursing assessment. Check console/backend log for details."
      );
    }
  }

  return (
    <div className="nursing-assessment-page">
      <style>{`
        .nursing-assessment-page {
          min-height: 100vh;
          padding: 22px;
          color: #071735;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 28%),
            linear-gradient(135deg, #edf6ff 0%, #f8fbff 48%, #e0f2fe 100%);
        }

        .na-hero {
          min-height: 360px;
          border-radius: 28px;
          padding: 42px;
          margin-bottom: 22px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
          background:
            linear-gradient(90deg, rgba(5,18,44,.98), rgba(15,118,110,.92), rgba(14,165,233,.25)),
            url(${cftHero});
          background-size: cover;
          background-position: center right;
          box-shadow: 0 32px 86px rgba(15,23,42,.26);
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 14px;
          color: #a7f3d0;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .na-hero h1 {
          margin: 0;
          font-size: clamp(44px, 5vw, 72px);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        .na-hero p {
          max-width: 760px;
          margin: 20px 0 0;
          color: rgba(255,255,255,.9);
          font-size: 18px;
          line-height: 1.65;
          font-weight: 650;
        }

        .hero-metrics {
          width: 330px;
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
          color: #d1fae5;
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
          background: linear-gradient(135deg, #059669, #06b6d4);
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

        .resident-select {
          min-width: 340px;
          min-height: 56px;
          border-radius: 16px;
          border: 1px solid #bfdbfe;
          background: white;
          padding: 0 16px;
          color: #071735;
          font-size: 15px;
          font-weight: 900;
          outline: none;
        }

        .page-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(390px, .9fr);
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
          background: linear-gradient(90deg, #059669, #06b6d4, #2563eb);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        .card-header p {
          margin: 0 0 9px;
          color: #059669;
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

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .form-field {
          display: grid;
          gap: 8px;
        }

        .form-field.full {
          grid-column: span 2;
        }

        .form-field label {
          color: #385071;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          min-height: 56px;
          border: 1px solid #cfe0f7;
          border-radius: 15px;
          padding: 0 16px;
          background: white;
          color: #071735;
          font-size: 15px;
          font-weight: 800;
          outline: none;
        }

        .form-field textarea {
          min-height: 120px;
          padding: 15px 16px;
          resize: vertical;
          line-height: 1.55;
        }

        .section-box {
          grid-column: span 2;
          padding: 20px;
          border-radius: 20px;
          background: #f8fbff;
          border: 1px solid #dbeafe;
          display: grid;
          gap: 16px;
        }

        .section-box h3 {
          margin: 0;
          color: #071735;
          font-size: 18px;
          font-weight: 950;
        }

        .signature-help {
          margin: 0;
          color: #64748b;
          font-weight: 800;
          line-height: 1.5;
        }

        .signature-pad-wrap {
          border-radius: 18px;
          border: 1px dashed #93c5fd;
          background: white;
          padding: 12px;
        }

        .signature-pad {
          width: 100%;
          height: 180px;
          border-radius: 14px;
          background: #ffffff;
        }

        .button-row {
          grid-column: span 2;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .primary-btn,
        .secondary-btn {
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
          background: linear-gradient(135deg, #059669, #0f766e);
        }

        .secondary-btn {
          color: #071735;
          background: white;
          border: 1px solid #cfe0f7;
        }

        .success-btn {
          min-height: 46px;
          border-radius: 14px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 950;
          cursor: pointer;
          border: 0;
          color: white;
          background: linear-gradient(135deg, #047857, #10b981);
        }


        .history-list {
          display: grid;
          gap: 14px;
        }

        .history-card {
          border: 1px solid #dbeafe;
          border-left: 6px solid #059669;
          border-radius: 18px;
          padding: 18px;
          background: white;
          box-shadow: 0 12px 28px rgba(15,23,42,.07);
        }

        .history-card strong {
          display: block;
          font-size: 17px;
          color: #071735;
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

        .empty-state {
          min-height: 150px;
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
          .na-hero,
          .filter-card {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-metrics,
          .resident-select {
            width: 100%;
          }

          .page-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .nursing-assessment-page {
            padding: 14px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .button-row,
          .section-box {
            grid-column: span 1;
          }
			.success-btn {
			  min-height: 46px;
			  border-radius: 14px;
			  padding: 0 16px;
			  display: inline-flex;
			  align-items: center;
			  justify-content: center;
			  gap: 8px;
			  font-size: 13px;
			  font-weight: 950;
			  cursor: pointer;
			  border: 0;
			  color: white;
			  background: linear-gradient(135deg, #047857, #10b981);
			}
          .na-hero {
            min-height: auto;
            padding: 28px;
          }

          .na-hero h1 {
            font-size: 42px;
          }
        }
      `}</style>

      <section className="na-hero">
        <div>
          <p className="hero-kicker">
            <Stethoscope size={18} />
            ResidentCare Nursing
          </p>

          <h1>
            Nursing
            <br />
            Assessment
          </h1>

          <p>
            Complete resident nursing assessment, vital signs, risk screening,
            medication review, functional status, safety concerns, and nursing
            recommendations.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-card">
            <strong>{assessments.length}</strong>
            <span>Nursing Assessments</span>
          </div>
          <div className="metric-card">
            <strong>{selectedResident ? "1" : "0"}</strong>
            <span>Resident Selected</span>
          </div>
          <div className="metric-card">
            <strong>{form.status}</strong>
            <span>Current Status</span>
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
              Select a resident to create or view nursing assessments.
            </p>
          </div>
        </div>

        <select
          className="resident-select"
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
      </div>

      <section className="page-grid">
        <form className="premium-card" onSubmit={submitAssessment}>
          <div className="card-header">
            <div>
              <p>New Assessment</p>
              <h2>Nursing Assessment Form</h2>
            </div>
            <ClipboardCheck size={32} color="#059669" />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Assessment Date</label>
              <input
                type="date"
                name="assessment_date"
                value={form.assessment_date}
                onChange={updateField}
              />
            </div>

            <div className="form-field">
              <label>Nurse Name</label>
              <input
                name="nurse_name"
                value={form.nurse_name}
                onChange={updateField}
              />
            </div>

            <div className="section-box">
              <h3>Vital Signs</h3>

              <div className="form-grid">
                {[
                  ["temperature", "Temperature"],
                  ["blood_pressure", "Blood Pressure"],
                  ["pulse", "Pulse"],
                  ["respiration", "Respiration"],
                  ["oxygen_saturation", "Oxygen Saturation"],
                  ["weight", "Weight"],
                ].map(([name, label]) => (
                  <div className="form-field" key={name}>
                    <label>{label}</label>
                    <input
                      value={form.vital_signs[name]}
                      onChange={(e) => updateVital(name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-field full">
              <label>Chief Complaint / Nursing Summary</label>
              <textarea
                name="nursing_summary"
                value={form.nursing_summary}
                onChange={updateField}
              />
            </div>

            <div className="form-field full">
              <label>Allergies</label>
              <textarea
                name="allergies"
                value={form.allergies}
                onChange={updateField}
              />
            </div>

            <div className="form-field full">
              <label>Medication Review</label>
              <textarea
                name="medications_reviewed"
                value={form.medications_reviewed}
                onChange={updateField}
              />
            </div>

            <div className="form-field full">
              <label>Pain Assessment</label>
              <textarea
                name="pain_assessment"
                value={form.pain_assessment}
                onChange={updateField}
              />
            </div>

            <div className="form-field full">
              <label>Mental Status</label>
              <textarea
                name="mental_status"
                value={form.mental_status}
                onChange={updateField}
              />
            </div>

            <div className="form-field full">
              <label>Behavioral Observation</label>
              <textarea
                name="behavioral_observation"
                value={form.behavioral_observation}
                onChange={updateField}
              />
            </div>

            <div className="section-box">
              <h3>Risk Screening</h3>

              <div className="form-grid">
                <div className="form-field">
                  <label>Fall Risk</label>
                  <select name="fall_risk" value={form.fall_risk} onChange={updateField}>
                    <option value="">Select</option>
                    <option value="LOW">Low</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Suicide Risk</label>
                  <select name="suicide_risk" value={form.suicide_risk} onChange={updateField}>
                    <option value="">Select</option>
                    <option value="DENIES">Denies</option>
                    <option value="LOW">Low</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Elopement Risk</label>
                  <select name="elopement_risk" value={form.elopement_risk} onChange={updateField}>
                    <option value="">Select</option>
                    <option value="LOW">Low</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-field full">
              <label>Functional Status</label>
              <textarea
                name="functional_status"
                value={form.functional_status}
                onChange={updateField}
              />
            </div>

            <div className="form-field full">
              <label>Medical Concerns</label>
              <textarea
                name="medical_concerns"
                value={form.medical_concerns}
                onChange={updateField}
              />
            </div>

            <div className="form-field full">
              <label>Safety Summary</label>
              <textarea
                name="safety_summary"
                value={form.safety_summary}
                onChange={updateField}
              />
            </div>

            <div className="form-field full">
              <label>Risk Summary</label>
              <textarea
                name="risk_summary"
                value={form.risk_summary}
                onChange={updateField}
              />
            </div>

            <div className="form-field full">
              <label>Nursing Interventions</label>
              <textarea
                name="nursing_interventions"
                value={form.nursing_interventions}
                onChange={updateField}
              />
            </div>

            <div className="form-field full">
              <label>Recommendations</label>
              <textarea
                name="recommendations"
                value={form.recommendations}
                onChange={updateField}
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={updateField}>
                <option value="DRAFT">Draft</option>
                <option value="SIGNED">Signed</option>
                <option value="FINAL">Final</option>
              </select>
            </div>

            <div className="section-box">
              <h3>Nurse Electronic Signature</h3>

              <p className="signature-help">
                Nurse may draw signature below. Signing finalizes the assessment
                and automatically generates a PDF for the resident file.
              </p>

              <div className="signature-pad-wrap">
                <SignatureCanvas
                  ref={sigPadRef}
                  penColor="#071735"
                  canvasProps={{
                    className: "signature-pad",
                  }}
                />
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={clearSignature}
                >
                  Clear Signature
                </button>
              </div>
            </div>

            <div className="button-row">
              <button className="primary-btn" type="submit">
                <Save size={18} />
                Save Nursing Assessment
              </button>

              <button
                className="secondary-btn"
                type="button"
                onClick={() => loadAssessments()}
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>
        </form>

        <aside className="premium-card">
          <div className="card-header">
            <div>
              <p>History</p>
              <h2>Nursing Assessment History</h2>
            </div>
            <FileText size={32} color="#059669" />
          </div>

          <div className="history-list">
            {!selectedResidentId && (
              <div className="empty-state">Select a resident to view history.</div>
            )}

            {selectedResidentId && assessments.length === 0 && (
              <div className="empty-state">No nursing assessments found.</div>
            )}

            {assessments.map((item) => (
              <article className="history-card" key={item.id}>
                <strong>{item.assessment_date || "No date"}</strong>
                <p>{item.recommendations || item.risk_summary || "Assessment recorded."}</p>

                <div className="chip-row">
				<span className="chip green">
				  <CheckCircle2 size={12} />
				  {item.is_signed ? "SIGNED" : item.status || "DRAFT"}
				</span>

                  <span className="chip">
                    <CalendarDays size={12} />
                    Nursing
                  </span>

					{item.is_signed || item.status === "SIGNED" || item.status === "FINAL" ? (
					  <button
						type="button"
						className="secondary-btn"
						onClick={() => openPdf(item.id)}
					  >
						<FileText size={14} />
						PDF
					  </button>
					) : (
					  <>
						<button
						  type="button"
						  className="success-btn"
						  onClick={() => signAssessment(item.id)}
						>
						  <CheckCircle2 size={14} />
						  Nurse Sign
						</button>

						<button
						  type="button"
						  className="secondary-btn"
						  onClick={() => signAndGeneratePdf(item.id)}
						>
						  <FileText size={14} />
						  Sign & PDF
						</button>
					  </>
					)}
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}