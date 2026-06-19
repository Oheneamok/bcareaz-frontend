import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser } from "lucide-react";
import api from "../../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  individual_name: "",
  dob: "",
  initial_service_plan_date: today(),
  review_date: "",

  goal_1: "",
  goal_1_target_date: "",
  goal_2: "",
  goal_2_target_date: "",
  goal_3: "",
  goal_3_target_date: "",

  tracking: {
    goal_1: {
      start_date: "",
      end_date: "",
      date_achieved: "",
      status: "Ongoing",
      staff_initials: "",
    },
    goal_2: {
      start_date: "",
      end_date: "",
      date_achieved: "",
      status: "Ongoing",
      staff_initials: "",
    },
    goal_3: {
      start_date: "",
      end_date: "",
      date_achieved: "",
      status: "Ongoing",
      staff_initials: "",
    },
  },

  barriers_encountered: "",
  recommendations: "",

  program_manager_name: "",
  program_manager_signature: "",
  program_manager_signed_at: today(),
};

export default function ServicePlanForm({ resident = {}, residentId, onSaved }) {
  const managerSigRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const residentName =
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  const [form, setForm] = useState({
    ...initialForm,
    individual_name: residentName,
    dob: resident.date_of_birth || "",
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateTracking(goalKey, field, value) {
    setForm((prev) => ({
      ...prev,
      tracking: {
        ...prev.tracking,
        [goalKey]: {
          ...prev.tracking[goalKey],
          [field]: value,
        },
      },
    }));
  }

  function saveSignature() {
    if (!managerSigRef.current || managerSigRef.current.isEmpty()) {
      alert("Please sign before saving signature.");
      return;
    }

    update("program_manager_signature", managerSigRef.current.toDataURL("image/png"));
    update("program_manager_signed_at", today());
  }

  function clearSignature() {
    managerSigRef.current?.clear();
    update("program_manager_signature", "");
  }

  async function saveServicePlan(status = "DRAFT") {
    if (!residentId) {
      alert("Resident ID is missing.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/treatment-plans", {
        resident_id: residentId,
        plan_date: form.initial_service_plan_date || today(),
        review_due_date: form.review_date || null,
        diagnosis_summary: "",
        strengths: "",
        needs: "",
        barriers: form.barriers_encountered,
        overall_goal: [form.goal_1, form.goal_2, form.goal_3]
          .filter(Boolean)
          .join("\n"),
        status,
        is_active: status === "ACTIVE" || status === "COMPLETED",
        form_data: {
          ...form,
          document_type: "SERVICE_PLAN",
        },
      });

      alert(status === "COMPLETED" ? "Service plan completed." : "Service plan draft saved.");
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save service plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-form service-plan-form">
      <section className="assessment-section">
        <h3>Service Plan</h3>

        <div className="assessment-grid">
          <Input
            label="Individual Name"
            value={form.individual_name}
            onChange={(v) => update("individual_name", v)}
          />

          <Input
            label="DOB"
            type="date"
            value={form.dob}
            onChange={(v) => update("dob", v)}
          />

          <Input
            label="Initial Service Plan Date"
            type="date"
            value={form.initial_service_plan_date}
            onChange={(v) => update("initial_service_plan_date", v)}
          />

          <Input
            label="Review Date"
            type="date"
            value={form.review_date}
            onChange={(v) => update("review_date", v)}
          />
        </div>
      </section>

      <section className="assessment-section">
        <h3>Goals Addressed</h3>

        <div className="assessment-grid">
          <TextArea
            label="Goal 1"
            value={form.goal_1}
            onChange={(v) => update("goal_1", v)}
          />

          <Input
            label="Goal 1 Target Date"
            type="date"
            value={form.goal_1_target_date}
            onChange={(v) => update("goal_1_target_date", v)}
          />

          <TextArea
            label="Goal 2"
            value={form.goal_2}
            onChange={(v) => update("goal_2", v)}
          />

          <Input
            label="Goal 2 Target Date"
            type="date"
            value={form.goal_2_target_date}
            onChange={(v) => update("goal_2_target_date", v)}
          />

          <TextArea
            label="Goal 3"
            value={form.goal_3}
            onChange={(v) => update("goal_3", v)}
          />

          <Input
            label="Goal 3 Target Date"
            type="date"
            value={form.goal_3_target_date}
            onChange={(v) => update("goal_3_target_date", v)}
          />
        </div>
      </section>

      <section className="assessment-section">
        <h3>Goal Tracking</h3>

        <div className="service-plan-table">
          <div className="service-plan-row header">
            <strong>Goal</strong>
            <strong>Start Date</strong>
            <strong>End Date</strong>
            <strong>Date Achieved</strong>
            <strong>Status</strong>
            <strong>Staff Initials</strong>
          </div>

          {["goal_1", "goal_2", "goal_3"].map((goalKey, index) => (
            <div className="service-plan-row" key={goalKey}>
              <strong>Goal #{index + 1}</strong>

              <input
                type="date"
                value={form.tracking[goalKey].start_date}
                onChange={(e) =>
                  updateTracking(goalKey, "start_date", e.target.value)
                }
              />

              <input
                type="date"
                value={form.tracking[goalKey].end_date}
                onChange={(e) =>
                  updateTracking(goalKey, "end_date", e.target.value)
                }
              />

              <input
                type="date"
                value={form.tracking[goalKey].date_achieved}
                onChange={(e) =>
                  updateTracking(goalKey, "date_achieved", e.target.value)
                }
              />

              <select
                value={form.tracking[goalKey].status}
                onChange={(e) =>
                  updateTracking(goalKey, "status", e.target.value)
                }
              >
                <option>Ongoing</option>
                <option>No Progress</option>
                <option>Stopped</option>
                <option>Achieved</option>
              </select>

              <input
                value={form.tracking[goalKey].staff_initials}
                onChange={(e) =>
                  updateTracking(goalKey, "staff_initials", e.target.value)
                }
                placeholder="Initials"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="assessment-section">
        <h3>Barriers & Recommendations</h3>

        <div className="assessment-grid">
          <TextArea
            label="Barriers Encountered"
            value={form.barriers_encountered}
            onChange={(v) => update("barriers_encountered", v)}
          />

          <TextArea
            label="Recommendations"
            value={form.recommendations}
            onChange={(v) => update("recommendations", v)}
          />
        </div>
      </section>

      <section className="assessment-section">
        <h3>Program Manager Signature</h3>

        <div className="signature-plan-grid">
          <div className="signature-plan-card">
            <Input
              label="Program Manager Name"
              value={form.program_manager_name}
              onChange={(v) => update("program_manager_name", v)}
            />

            <div className="document-signature-pad">
              {form.program_manager_signature ? (
                <img
                  src={form.program_manager_signature}
                  alt="Program Manager Signature"
                />
              ) : (
                <SignatureCanvas
                  ref={managerSigRef}
                  penColor="#0f172a"
                  canvasProps={{ className: "document-signature-canvas" }}
                />
              )}
            </div>

            <div className="signature-tools">
              <button type="button" onClick={saveSignature}>
                Save Signature
              </button>

              <button type="button" onClick={clearSignature}>
                <Eraser size={14} />
                Clear
              </button>
            </div>

            <Input
              label="Date"
              type="date"
              value={form.program_manager_signed_at}
              onChange={(v) => update("program_manager_signed_at", v)}
            />
          </div>
        </div>
      </section>

      <div className="assessment-actions">
        <button
          type="button"
          className="secondary-btn"
          disabled={saving}
          onClick={() => saveServicePlan("DRAFT")}
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>

        <button
          type="button"
          className="primary-btn"
          disabled={saving}
          onClick={() => saveServicePlan("COMPLETED")}
        >
          {saving ? "Saving..." : "Complete Service Plan"}
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="assessment-field">
      <label>{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="assessment-field full">
      <label>{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}