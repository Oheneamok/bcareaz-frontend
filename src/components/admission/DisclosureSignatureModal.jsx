import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { X, Eraser, Save } from "lucide-react";

import api from "../../services/api";

export default function DisclosureSignatureModal({ disclosure, onClose, onSaved }) {
  const residentSig = useRef(null);
  const guardianSig = useRef(null);
  const staffSig = useRef(null);

  const [saving, setSaving] = useState(false);

  async function saveSignature() {
    try {
      setSaving(true);

      const payload = {};

      if (residentSig.current && !residentSig.current.isEmpty()) {
        payload.resident_signature = residentSig.current.toDataURL();
      }

      if (guardianSig.current && !guardianSig.current.isEmpty()) {
        payload.guardian_signature = guardianSig.current.toDataURL();
      }

      if (staffSig.current && !staffSig.current.isEmpty()) {
        payload.staff_signature = staffSig.current.toDataURL();
      }

      if (
        !payload.resident_signature &&
        !payload.guardian_signature &&
        !payload.staff_signature
      ) {
        alert("Please add at least one signature.");
        return;
      }

      await api.patch(`/admission-disclosures/${disclosure.id}/sign`, payload);
      onSaved();
    } catch (err) {
      console.error(err);
      alert("Unable to save signature.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="premium-modal disclosure-sign-modal">
        <div className="modal-header">
          <div>
            <p className="dashboard-eyebrow">Admission Disclosure</p>
            <h2>{disclosure.title}</h2>
          </div>

          <button className="icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="disclosure-modal-body">
          <div className="disclosure-text-box">
            <h3>Disclosure Text</h3>
            <p>{disclosure.content}</p>
          </div>

          <SignatureBlock
            title="Resident Signature / Mark"
            sigRef={residentSig}
            existing={disclosure.resident_signature}
          />

          <SignatureBlock
            title="Guardian / Agent Signature"
            sigRef={guardianSig}
            existing={disclosure.guardian_signature}
          />

          <SignatureBlock
            title="Staff Witness Signature"
            sigRef={staffSig}
            existing={disclosure.staff_signature}
          />

          <div className="modal-actions full">
            <button className="secondary-btn" onClick={onClose}>
              Cancel
            </button>

            <button className="primary-btn" onClick={saveSignature} disabled={saving}>
              <Save size={16} />
              {saving ? "Saving..." : "Save Signature"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignatureBlock({ title, sigRef, existing }) {
  return (
    <div className="signature-block">
      <div className="signature-block-header">
        <h3>{title}</h3>

        <button type="button" onClick={() => sigRef.current?.clear()}>
          <Eraser size={15} />
          Clear
        </button>
      </div>

      {existing ? (
        <div className="existing-signature">
          <img src={existing} alt={title} />
          <span>Existing signature saved</span>
        </div>
      ) : (
        <div className="signature-pad-wrap">
          <SignatureCanvas
            ref={sigRef}
            penColor="#0f172a"
            canvasProps={{
              className: "signature-pad",
            }}
          />
        </div>
      )}
    </div>
  );
}
