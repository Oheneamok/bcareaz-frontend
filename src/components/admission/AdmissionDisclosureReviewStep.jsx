import { useMemo, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import {
  CheckCircle2,
  Download,
  Eraser,
  Eye,
  FileSignature,
  Save,
  X,
} from "lucide-react";

import { ADMISSION_DISCLOSURE_TEMPLATES } from "../../data/admissionDisclosureTemplates";

export function areAdmissionDisclosuresComplete(form) {
  const signed = form.admission_disclosures || {};

  return ADMISSION_DISCLOSURE_TEMPLATES.every((template) => {
    const record = signed[template.id];
    const residentOrGuardian = !!record?.resident_signature || !!record?.guardian_signature;
    const staffSigned = !!record?.staff_signature;
    return residentOrGuardian && staffSigned;
  });
}

export function getAdmissionDisclosureProgress(form) {
  const signed = form.admission_disclosures || {};
  const completed = ADMISSION_DISCLOSURE_TEMPLATES.filter((template) => {
    const record = signed[template.id];
    const residentOrGuardian = !!record?.resident_signature || !!record?.guardian_signature;
    const staffSigned = !!record?.staff_signature;
    return residentOrGuardian && staffSigned;
  }).length;

  return {
    total: ADMISSION_DISCLOSURE_TEMPLATES.length,
    completed,
    percent: Math.round((completed / ADMISSION_DISCLOSURE_TEMPLATES.length) * 100),
  };
}

export async function uploadSignedDisclosurePdfs(api, residentId, form) {
  const signed = form.admission_disclosures || {};

  for (const template of ADMISSION_DISCLOSURE_TEMPLATES) {
    const record = signed[template.id];
    if (!record?.pdf_blob) continue;

    const file = new File(
      [record.pdf_blob],
      `${template.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-signed.pdf`,
      { type: "application/pdf" }
    );

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", template.title);
    fd.append("document_type", "ADMISSION_DISCLOSURE");
    fd.append("category", "RESIDENT");
    fd.append("description", `Signed admission disclosure: ${template.title}`);
    fd.append("resident_id", residentId);
    fd.append("entity_type", "RESIDENT");
    fd.append("entity_id", residentId);
    fd.append("requires_signature", "false");
    fd.append("is_signed", "true");
    fd.append("is_locked", "true");

    await api.post("/documents/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
}

export default function AdmissionDisclosureReviewStep({ form, setForm }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const progress = getAdmissionDisclosureProgress(form);

  const signed = form.admission_disclosures || {};

  return (
    <div className="admission-disclosure-step">
      <div className="admission-disclosure-summary">
        <div>
          <p className="dashboard-eyebrow">Required Admission Documents</p>
          <h3>Review, Sign, and Export Each Disclosure</h3>
          <p>
            Each document must be opened, read, and signed by the resident or guardian, plus staff witness, before admission can be completed.
          </p>
        </div>

        <div className="admission-disclosure-progress">
          <strong>{progress.completed}/{progress.total}</strong>
          <span>Completed</span>
        </div>
      </div>

      <div className="disclosure-progress-track">
        <div style={{ width: `${progress.percent}%` }} />
      </div>

      <div className="admission-disclosure-grid">
        {ADMISSION_DISCLOSURE_TEMPLATES.map((template, index) => {
          const record = signed[template.id];
          const residentOrGuardian = !!record?.resident_signature || !!record?.guardian_signature;
          const staffSigned = !!record?.staff_signature;
          const complete = residentOrGuardian && staffSigned;

          return (
            <button
              type="button"
              key={template.id}
              className={`admission-document-card ${complete ? "complete" : "pending"}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="doc-card-topline">
                <span className="doc-number">{String(index + 1).padStart(2, "0")}</span>
                <span className={`status-badge ${complete ? "active" : "pending"}`}>
                  {complete ? "Signed" : "Pending"}
                </span>
              </div>

              <FileSignature size={24} />
              <h4>{template.title}</h4>

              <div className="doc-signature-checks">
                <span className={residentOrGuardian ? "ok" : "missing"}>Resident/Guardian</span>
                <span className={staffSigned ? "ok" : "missing"}>Staff Witness</span>
              </div>

              <small>Open Document</small>
            </button>
          );
        })}
      </div>

      {!areAdmissionDisclosuresComplete(form) && (
        <div className="admission-block-warning">
          All disclosure documents must be opened, reviewed, and signed before you can continue to Review & Admit.
        </div>
      )}

      {selectedTemplate && (
        <DisclosureDocumentModal
          template={selectedTemplate}
          form={form}
          setForm={setForm}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}

function DisclosureDocumentModal({ template, form, setForm, onClose }) {
  const residentSig = useRef(null);
  const guardianSig = useRef(null);
  const staffSig = useRef(null);

  const [saving, setSaving] = useState(false);
  const existing = form.admission_disclosures?.[template.id];

  const residentName = `${form.first_name || ""} ${form.last_name || ""}`.trim();
  const today = new Date().toLocaleDateString();

  const filledText = useMemo(() => {
    return template.content
      .replaceAll("Lighthouse Family Residential LLC", "Home of Love LLC")
      .replaceAll("LIGHTHOUSE FAMILY RESIDENTIAL LLC", "HOME OF LOVE LLC")
      .replaceAll("Resident Name: ____________________________________________________________", `Resident Name: ${residentName || "________________"}`)
      .replaceAll("RESIDENT’S NAME_______________________________________", `RESIDENT’S NAME ${residentName || "________________"}`)
      .replaceAll("Resident’s Name: _____________________________________", `Resident’s Name: ${residentName || "________________"}`)
      .replaceAll("Resident Name __________________________", `Resident Name ${residentName || "________________"}`);
  }, [template.content, residentName]);

  async function signAndComplete() {
    const residentSignature =
      existing?.resident_signature ||
      (!residentSig.current?.isEmpty() ? residentSig.current.toDataURL("image/png") : "");

    const guardianSignature =
      existing?.guardian_signature ||
      (!guardianSig.current?.isEmpty() ? guardianSig.current.toDataURL("image/png") : "");

    const staffSignature =
      existing?.staff_signature ||
      (!staffSig.current?.isEmpty() ? staffSig.current.toDataURL("image/png") : "");

    if (!residentSignature && !guardianSignature) {
      alert("Resident or guardian signature is required before completing this document.");
      return;
    }

    if (!staffSignature) {
      alert("Staff witness signature is required before completing this document.");
      return;
    }

    try {
      setSaving(true);
      const pdfBlob = await buildDisclosurePdfBlob({
        title: template.title,
        content: filledText,
        residentName,
        admissionDate: form.admission_date,
        residentSignature,
        guardianSignature,
        staffSignature,
      });

      setForm({
        ...form,
        admission_disclosures: {
          ...(form.admission_disclosures || {}),
          [template.id]: {
            disclosure_type: template.id,
            title: template.title,
            content: filledText,
            resident_signature: residentSignature,
            guardian_signature: guardianSignature,
            staff_signature: staffSignature,
            signed_at: new Date().toISOString(),
            pdf_blob: pdfBlob,
          },
        },
      });

      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function downloadPreview() {
    const residentSignature = existing?.resident_signature || "";
    const guardianSignature = existing?.guardian_signature || "";
    const staffSignature = existing?.staff_signature || "";

    const blob = await buildDisclosurePdfBlob({
      title: template.title,
      content: filledText,
      residentName,
      admissionDate: form.admission_date,
      residentSignature,
      guardianSignature,
      staffSignature,
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-backdrop">
      <div className="premium-modal exact-disclosure-modal">
        <div className="modal-header">
          <div>
            <p className="dashboard-eyebrow">Admission Disclosure</p>
            <h2>{template.title}</h2>
            <p className="muted">Read the full document, then sign or make mark below.</p>
          </div>

          <button className="icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="exact-disclosure-layout">
          <div className="exact-disclosure-document">
            <div className="document-paper">
              <h1>{template.title}</h1>
              <pre>{filledText}</pre>
            </div>
          </div>

          <div className="exact-sign-panel">
            <SignatureBox
              title="Resident Signature / Mark"
              refObj={residentSig}
              existing={existing?.resident_signature}
            />

            <SignatureBox
              title="Guardian / Agent Signature"
              refObj={guardianSig}
              existing={existing?.guardian_signature}
            />

            <SignatureBox
              title="Staff Witness Signature"
              refObj={staffSig}
              existing={existing?.staff_signature}
            />

            <div className="signed-date-box">
              <strong>Date</strong>
              <span>{today}</span>
            </div>

            <div className="modal-actions full">
              <button type="button" className="secondary-btn" onClick={downloadPreview}>
                <Download size={16} />
                Export PDF
              </button>

              <button type="button" className="primary-btn" disabled={saving} onClick={signAndComplete}>
                <Save size={16} />
                {saving ? "Saving..." : "Sign & Complete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignatureBox({ title, refObj, existing }) {
  return (
    <div className="exact-signature-box">
      <div className="signature-block-header">
        <h3>{title}</h3>
        {!existing && (
          <button type="button" onClick={() => refObj.current?.clear()}>
            <Eraser size={14} />
            Clear
          </button>
        )}
      </div>

      {existing ? (
        <div className="existing-signature">
          <img src={existing} alt={title} />
          <span>Saved</span>
        </div>
      ) : (
        <SignatureCanvas
          ref={refObj}
          penColor="#0f172a"
          canvasProps={{ className: "exact-signature-pad" }}
        />
      )}
    </div>
  );
}

async function buildDisclosurePdfBlob({
  title,
  content,
  residentName,
  admissionDate,
  residentSignature,
  guardianSignature,
  staffSignature,
}) {
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 54;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  function ensureSpace(height = 40) {
    if (y + height > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(title, margin, y);
  y += 26;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Resident: ${residentName || "________________"}`, margin, y);
  y += 16;
  pdf.text(`Admission Date: ${admissionDate || "________________"}`, margin, y);
  y += 24;

  pdf.setFontSize(10);
  const paragraphs = content.split("\n");

  for (const paragraph of paragraphs) {
    const lines = pdf.splitTextToSize(paragraph || " ", maxWidth);
    for (const line of lines) {
      ensureSpace(14);
      pdf.text(line, margin, y);
      y += 13;
    }
    y += 6;
  }

  ensureSpace(230);
  y += 8;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Digital Signatures", margin, y);
  y += 18;

  addSignature(pdf, "Resident Signature / Mark", residentSignature, margin, y);
  y += 64;
  addSignature(pdf, "Guardian / Agent Signature", guardianSignature, margin, y);
  y += 64;
  addSignature(pdf, "Staff Witness Signature", staffSignature, margin, y);
  y += 64;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Signed Date: ${new Date().toLocaleString()}`, margin, y);

  return pdf.output("blob");
}

function addSignature(pdf, label, dataUrl, x, y) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(label, x, y);
  pdf.setFont("helvetica", "normal");
  pdf.line(x, y + 42, x + 240, y + 42);

  if (dataUrl) {
    try {
      pdf.addImage(dataUrl, "PNG", x, y + 5, 180, 42);
    } catch {
      // Ignore bad signature image data.
    }
  }
}
