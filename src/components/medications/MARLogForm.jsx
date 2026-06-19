import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, LockKeyhole } from "lucide-react";
import api from "../../services/api";

const nowLocal = () => {
  const d = new Date();
  return d.toISOString().slice(0, 16);
};

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  medication_order_id: "",
  administered_at: nowLocal(),
  medication_name: "",
  dose_given: "",
  administered_by: "",
  status: "GIVEN",
  refusal_reason: "",
  prn_effectiveness: "",
  notes: "",

  resident_signature_name: "",
  resident_signature: "",
  resident_signed_at: today(),

  staff_name: "",
  staff_acknowledged_at: nowLocal(),
};

export default function MARLogForm({
  resident = {},
  residentId,
  medicationOrders = [],
  onSaved,
}) {
  const residentSigRef = useRef(null);

  const residentFullName =
    resident.full_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ...initialForm,
    resident_signature_name: residentFullName,
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectOrder(orderId) {
    const order = medicationOrders.find((x) => String(x.id) === String(orderId));

    setForm((prev) => ({
      ...prev,
      medication_order_id: orderId,
      medication_name: order?.medication_name || order?.name || "",
      dose_given: order?.dosage || order?.dose || "",
    }));
  }

  function saveResidentSignature() {
    if (!residentSigRef.current || residentSigRef.current.isEmpty()) {
      alert("Please have the resident sign before saving signature.");
      return;
    }

    update("resident_signature", residentSigRef.current.toDataURL("image/png"));
    update("resident_signed_at", today());
  }

  function clearResidentSignature() {
    residentSigRef.current?.clear();
    update("resident_signature", "");
  }

  async function saveMAR() {
    if (!residentId) {
      alert("Resident ID is missing.");
      return;
    }

    if (!form.medication_name || !form.administered_at || !form.status) {
      alert("Medication, time, and status are required.");
      return;
    }

    if (!form.resident_signature) {
      alert("Resident acknowledgement signature is required.");
      return;
    }

    if (!form.staff_name) {
      alert("Logged-in staff name is required.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/medication-administrations", {
        resident_id: residentId,
        medication_order_id: form.medication_order_id || null,
        administered_at: form.administered_at,
        medication_name: form.medication_name,
        dose_given: form.dose_given,
        administered_by: form.administered_by || form.staff_name,
        status: form.status,
        refusal_reason: form.refusal_reason,
        prn_effectiveness: form.prn_effectiveness,
        notes: form.notes,
        form_data: {
          ...form,
          staff_acknowledged_at:
            form.staff_acknowledged_at || new Date().toISOString(),
        },
      });

      alert("MAR log saved.");
      onSaved?.();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to save MAR log.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assessment-form mar-log-form">
      <Section title="Medication Administration Record">
        <Select
          label="Medication Order"
          value={form.medication_order_id}
          onChange={selectOrder}
          options={[
            { value: "", label: "Select medication order" },
            ...medicationOrders.map((order) => ({
              value: order.id,
              label: `${order.medication_name || order.name || "Medication"} - ${
                order.dosage || order.dose || ""
              }`,
            })),
          ]}
        />

        <Input
          label="Medication Name"
          value={form.medication_name}
          onChange={(v) => update("medication_name", v)}
        />

        <Input
          label="Dose Given"
          value={form.dose_given}
          onChange={(v) => update("dose_given", v)}
        />

        <Input
          label="Administered Date/Time"
          type="datetime-local"
          value={form.administered_at}
          onChange={(v) => update("administered_at", v)}
        />

        <Input
          label="Administered By"
          value={form.administered_by}
          onChange={(v) => update("administered_by", v)}
        />

        <Select
          label="Status"
          value={form.status}
          onChange={(v) => update("status", v)}
          options={[
            { value: "GIVEN", label: "Given" },
            { value: "REFUSED", label: "Refused" },
            { value: "HELD", label: "Held" },
            { value: "MISSED", label: "Missed" },
            { value: "PRN_GIVEN", label: "PRN Given" },
          ]}
        />

        {(form.status === "REFUSED" ||
          form.status === "HELD" ||
          form.status === "MISSED") && (
          <TextArea
            label="Reason"
            value={form.refusal_reason}
            onChange={(v) => update("refusal_reason", v)}
          />
        )}

        {form.status === "PRN_GIVEN" && (
          <TextArea
            label="PRN Effectiveness / Follow-up"
            value={form.prn_effectiveness}
            onChange={(v) => update("prn_effectiveness", v)}
          />
        )}

        <TextArea
          label="Notes"
          value={form.notes}
          onChange={(v) => update("notes", v)}
        />
      </Section>

      <section className="assessment-section">
        <h3>Resident Acknowledgement & Staff Verification</h3>

        <div className="signature-plan-grid">
          <div className="signature-plan-card">
            <h4>Resident Signature / Mark</h4>

            <Input
              label="Resident Name"
              value={form.resident_signature_name}
              onChange={(v) => update("resident_signature_name", v)}
            />

            <div className="document-signature-pad">
              {form.resident_signature ? (
                <img src={form.resident_signature} alt="Resident Signature" />
              ) : (
                <SignatureCanvas
                  ref={residentSigRef}
                  penColor="#0f172a"
                  canvasProps={{ className: "document-signature-canvas" }}
                />
              )}
            </div>

            <div className="signature-tools">
              <button type="button" onClick={saveResidentSignature}>
                Save Signature
              </button>

              <button type="button" onClick={clearResidentSignature}>
                <Eraser size={14} />
                Clear
              </button>
            </div>

            <Input
              label="Resident Signed Date"
              type="date"
              value={form.resident_signed_at}
              onChange={(v) => update("resident_signed_at", v)}
            />
          </div>

          <div className="signature-plan-card staff-ack-card">
            <h4>Staff Verification</h4>

            <div className="bhp-esign-box">
              <LockKeyhole size={22} />
              <div>
                <strong>Logged-in Staff Verification</strong>
                <p>
                  Staff acknowledgement is tied to the logged-in user account and
                  timestamp.
                </p>
              </div>
            </div>

            <Input
              label="Staff Name"
              value={form.staff_name}
              onChange={(v) => {
                update("staff_name", v);
                update("administered_by", v);
              }}
            />

            <Input
              label="Acknowledged At"
              type="datetime-local"
              value={form.staff_acknowledged_at}
              onChange={(v) => update("staff_acknowledged_at", v)}
            />
          </div>
        </div>
      </section>

      <div className="assessment-actions">
        <button
          type="button"
          className="primary-btn"
          disabled={saving}
          onClick={saveMAR}
        >
          {saving ? "Saving..." : "Save MAR Log"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="assessment-section">
      <h3>{title}</h3>
      <div className="assessment-grid">{children}</div>
    </section>
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

function Select({ label, value, onChange, options }) {
  return (
    <div className="assessment-field">
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          )
        )}
      </select>
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