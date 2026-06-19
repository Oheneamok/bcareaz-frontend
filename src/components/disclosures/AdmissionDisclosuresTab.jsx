import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  FileSignature,
  Printer,
} from "lucide-react";

import api from "../../services/api";

export default function AdmissionDisclosuresTab({ residentId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignedDisclosures();
  }, [residentId]);

  async function loadSignedDisclosures() {
    if (!residentId) return;

    try {
      setLoading(true);

      const res = await api.get(
        `/documents?entity_type=RESIDENT&entity_id=${residentId}`
      );

      const signedDocs = (res.data || []).filter((doc) => {
        const type = `${doc.document_type || ""}`.toUpperCase();
        const category = `${doc.category || ""}`.toUpperCase();
        const title = `${doc.title || doc.file_name || ""}`.toUpperCase();

        return (
          type.includes("ADMISSION") ||
          type.includes("DISCLOSURE") ||
          type.includes("CONSENT") ||
          category.includes("ADMISSION") ||
          category.includes("DISCLOSURE") ||
          title.includes("DISCLOSURE") ||
          title.includes("CONSENT") ||
          title.includes("HIPAA") ||
          title.includes("RIGHTS") ||
          title.includes("FEES")
        );
      });

      setDocs(signedDocs);
    } catch (err) {
      console.error(err);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  function getDocUrl(doc) {
    return (
      doc.download_url ||
      doc.file_url ||
      doc.document_url ||
      doc.url ||
      doc.blob_url
    );
  }

  function openDoc(doc) {
    const url = getDocUrl(doc);
    if (!url) return alert("No file URL found.");
    window.open(url, "_blank");
  }

  function printDoc(doc) {
    const url = getDocUrl(doc);
    if (!url) return alert("No file URL found.");

    const win = window.open(url, "_blank");
    if (win) {
      setTimeout(() => win.print(), 800);
    }
  }

  return (
    <div className="premium-panel">
      <div className="panel-header">
        <div>
          <h3>
            <span className="inline-icon">
              <FileSignature />
            </span>
            Signed Admission Disclosures
          </h3>
          <p className="empty-text">
            {docs.length} signed disclosure document(s)
          </p>
        </div>
      </div>

      {loading ? (
        <p className="empty-text">Loading signed disclosures...</p>
      ) : docs.length === 0 ? (
        <div className="empty-state">
          <FileSignature size={34} />
          <p>No signed disclosure copies found yet.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Disclosure</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title || doc.file_name || "Signed Disclosure"}</td>
                  <td>{doc.document_type || doc.category || "Admission"}</td>
                  <td>{formatDate(doc.signed_at || doc.created_at)}</td>
                  <td>
                    <span className="status-badge active">
                      <CheckCircle2 size={13} />
                      Signed
                    </span>
                  </td>
                  <td>
                    <div className="entity-actions">
                      <button
                        type="button"
                        className="table-action"
                        onClick={() => openDoc(doc)}
                      >
                        <Eye size={15} />
                        View
                      </button>

                      <button
                        type="button"
                        className="table-action"
                        onClick={() => printDoc(doc)}
                      >
                        <Printer size={15} />
                        Print
                      </button>

                      <button
                        type="button"
                        className="table-action"
                        onClick={() => openDoc(doc)}
                      >
                        <Download size={15} />
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}