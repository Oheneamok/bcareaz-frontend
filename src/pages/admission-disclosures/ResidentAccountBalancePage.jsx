import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature, Plus, Trash2 } from "lucide-react";

const emptyRow = {
  date: "",
  beginning_balance: "",
  amount_requested: "",
  ending_balance: "",
  receipt: "",
  cash_returned: "",
  staff_initials: "",
  resident_initials: "",
};

export default function ResidentAccountBalancePage({
  resident = {},
  facility = {},
  signatures = {},
  onSignatureChange,
}) {
  const residentSigRef = useRef(null);
  const staffSigRef = useRef(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const facilityName = facility.name || "Facility Name";

  const residentName =
    signatures.resident_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  const rows = signatures.account_balance_rows || [{ ...emptyRow }];

  function updateField(key, value) {
    onSignatureChange?.(key, value);
  }

  function updateRow(index, field, value) {
    const nextRows = [...rows];
    nextRows[index] = { ...(nextRows[index] || {}), [field]: value };
    updateField("account_balance_rows", nextRows);
  }

  function addRow() {
    updateField("account_balance_rows", [...rows, { ...emptyRow }]);
  }

  function removeRow(index) {
    updateField(
      "account_balance_rows",
      rows.filter((_, i) => i !== index)
    );
  }

  function saveSignature(type, ref) {
    if (!ref.current || ref.current.isEmpty()) return;
    onSignatureChange?.(type, ref.current.toDataURL());
  }

  function clearSignature(type, ref) {
    ref.current?.clear();
    onSignatureChange?.(type, "");
  }

  return (
    <div className="disclosure-document-page">
      <div className="disclosure-document-header">
        <div>
          <p className="dashboard-eyebrow">Admission Funds Record</p>
          <h1>Resident Account Balance Sheet</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Resident Account Balance Sheet</h2>

        <div className="document-form-grid">
          <Field
            label="Resident Name"
            value={residentName}
            onChange={(v) => updateField("resident_name", v)}
          />

          <Field
            label="DOB"
            type="date"
            value={signatures.date_of_birth || resident.date_of_birth || ""}
            onChange={(v) => updateField("date_of_birth", v)}
          />
        </div>

        <p>
          <strong>Note:</strong> All monies and receipts must be turned in on the
          same day.
        </p>

        <div className="document-table-card">
          <div className="document-table-header">
            <h3>Account Ledger</h3>
            <button type="button" onClick={addRow}>
              <Plus size={14} />
              Add Entry
            </button>
          </div>

          <div className="account-balance-table">
            <div className="account-balance-row header">
              <strong>Date</strong>
              <strong>Beginning Balance</strong>
              <strong>Amount Requested</strong>
              <strong>Ending Balance</strong>
              <strong>Receipt</strong>
              <strong>Cash Returned</strong>
              <strong>Staff Initials</strong>
              <strong>Resident Initials</strong>
              <strong></strong>
            </div>

            {rows.map((row, index) => (
              <div className="account-balance-row" key={index}>
                <input
                  type="date"
                  value={row.date || ""}
                  onChange={(e) => updateRow(index, "date", e.target.value)}
                />
                <input
                  value={row.beginning_balance || ""}
                  onChange={(e) =>
                    updateRow(index, "beginning_balance", e.target.value)
                  }
                />
                <input
                  value={row.amount_requested || ""}
                  onChange={(e) =>
                    updateRow(index, "amount_requested", e.target.value)
                  }
                />
                <input
                  value={row.ending_balance || ""}
                  onChange={(e) =>
                    updateRow(index, "ending_balance", e.target.value)
                  }
                />
                <select
                  value={row.receipt || ""}
                  onChange={(e) => updateRow(index, "receipt", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <input
                  value={row.cash_returned || ""}
                  onChange={(e) =>
                    updateRow(index, "cash_returned", e.target.value)
                  }
                />
                <input
                  value={row.staff_initials || ""}
                  onChange={(e) =>
                    updateRow(index, "staff_initials", e.target.value)
                  }
                />
                <input
                  value={row.resident_initials || ""}
                  onChange={(e) =>
                    updateRow(index, "resident_initials", e.target.value)
                  }
                />
                <button type="button" onClick={() => removeRow(index)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <SignatureRow
          nameLabel="Resident Name"
          nameValue={residentName}
          onNameChange={(v) => updateField("resident_name", v)}
          signatureLabel="Resident Signature / Mark"
          savedSignature={signatures.resident}
          sigRef={residentSigRef}
          onSave={() => saveSignature("resident", residentSigRef)}
          onClear={() => clearSignature("resident", residentSigRef)}
          dateValue={signatures.resident_date || today}
          onDateChange={(v) => updateField("resident_date", v)}
        />

        <SignatureRow
          nameLabel="Staff Name"
          nameValue={signatures.staff_name || ""}
          onNameChange={(v) => updateField("staff_name", v)}
          signatureLabel="Staff Signature"
          savedSignature={signatures.staff}
          sigRef={staffSigRef}
          onSave={() => saveSignature("staff", staffSigRef)}
          onClear={() => clearSignature("staff", staffSigRef)}
          dateValue={signatures.staff_date || today}
          onDateChange={(v) => updateField("staff_date", v)}
        />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="document-field">
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
      />
      <label>{label}</label>
    </div>
  );
}

function SignatureRow({
  nameLabel,
  nameValue,
  onNameChange,
  signatureLabel,
  savedSignature,
  sigRef,
  onSave,
  onClear,
  dateValue,
  onDateChange,
}) {
  return (
    <div className="document-signature-row">
      <div className="document-field">
        <input
          value={nameValue || ""}
          onChange={(e) => onNameChange(e.target.value)}
        />
        <label>{nameLabel}</label>
      </div>

      <div className="document-signature-pad-field">
        <div className="document-signature-pad">
          {savedSignature ? (
            <img src={savedSignature} alt={signatureLabel} />
          ) : (
            <SignatureCanvas
              ref={sigRef}
              penColor="#0f172a"
              canvasProps={{ className: "document-signature-canvas" }}
            />
          )}
        </div>

        <label>{signatureLabel}</label>

        <div className="signature-tools">
          <button type="button" onClick={onSave}>Save Signature</button>
          <button type="button" onClick={onClear}>
            <Eraser size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="document-field">
        <input
          type="date"
          value={dateValue || ""}
          onChange={(e) => onDateChange(e.target.value)}
        />
        <label>Date</label>
      </div>
    </div>
  );
}