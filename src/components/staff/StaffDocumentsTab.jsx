import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileText, Printer, Search, Upload } from "lucide-react";
import api from "../../services/api";

const documentTypes = [
  "ALL",
  "RESUME",
  "GOVERNMENT_ID",
  "FINGERPRINT_CARD",
  "TB_TEST",
  "CPR_CARD",
  "FIRST_AID_CARD",
  "LICENSE",
  "TRAINING_CERTIFICATE",
  "SIGNED_POLICY",
  "PERFORMANCE_REVIEW",
  "MISCELLANEOUS",
];

const uploadTypes = documentTypes.filter((x) => x !== "ALL");

export default function StaffDocumentsTab({ staff = {}, staffId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [uploadForm, setUploadForm] = useState({
    title: "",
    document_type: "RESUME",
    notes: "",
    file: null,
  });

  useEffect(() => {
    loadDocs();
  }, [staffId]);

  async function loadDocs() {
    if (!staffId) return;

    try {
      setLoading(true);
      const res = await api.get(`/documents?entity_type=STAFF&entity_id=${staffId}`);
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      const type = `${doc.document_type || doc.category || ""}`.toUpperCase();
      const title = `${doc.title || doc.file_name || ""}`.toUpperCase();
      const q = search.toUpperCase();

      return (typeFilter === "ALL" || type.includes(typeFilter)) &&
        (!q || title.includes(q) || type.includes(q));
    });
  }, [docs, search, typeFilter]);

  function getDocUrl(doc) {
    return doc.download_url || doc.file_url || doc.document_url || doc.url || doc.blob_url;
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
    if (win) setTimeout(() => win.print(), 800);
  }

  async function uploadDocument(e) {
    e.preventDefault();

    if (!uploadForm.title) return alert("Document title is required.");
    if (!uploadForm.file) return alert("Please select a file.");

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("entity_type", "STAFF");
      fd.append("entity_id", staffId);
      fd.append("staff_id", staffId);
      fd.append("title", uploadForm.title);
      fd.append("document_type", uploadForm.document_type);
      fd.append("category", uploadForm.document_type);
      fd.append("notes", uploadForm.notes || "");
      fd.append("file", uploadForm.file);

      await api.post("/documents/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadForm({ title: "", document_type: "RESUME", notes: "", file: null });
      await loadDocs();
      alert("Staff document uploaded.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="assessment-workspace resident-documents-tab">
      <div className="assessment-hero documents-hero">
        <div>
          <p className="dashboard-eyebrow">Personnel File</p>
          <h2>Documents</h2>
          <p>Upload and manage staff personnel documents, licenses, certificates, signed policies, and HR files.</p>
        </div>
      </div>

      <section className="assessment-section">
        <h3>Upload Staff Document</h3>

        <form className="assessment-grid" onSubmit={uploadDocument}>
          <div className="assessment-field">
            <label>Document Title</label>
            <input value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} />
          </div>

          <div className="assessment-field">
            <label>Document Type</label>
            <select value={uploadForm.document_type} onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}>
              {uploadTypes.map((item) => <option key={item} value={item}>{formatType(item)}</option>)}
            </select>
          </div>

          <div className="assessment-field">
            <label>File</label>
            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })} />
          </div>

          <div className="assessment-field full">
            <label>Notes</label>
            <textarea value={uploadForm.notes} onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })} />
          </div>

          <div className="assessment-actions full" style={{ justifyContent: "flex-end" }}>
            <button className="primary-btn" disabled={uploading}>
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </section>

      <section className="assessment-history-panel">
        <div className="documents-toolbar">
          <div>
            <h3>Staff Document Library</h3>
            <p className="empty-text">{filteredDocs.length} document(s)</p>
          </div>

          <div className="documents-filters">
            <div className="documents-search">
              <Search size={15} />
              <input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {documentTypes.map((item) => <option key={item} value={item}>{formatType(item)}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="table-empty">Loading documents...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="empty-state"><FileText size={34} /><p>No documents found.</p></div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.title || doc.file_name || "Staff Document"}</td>
                    <td>{formatType(doc.document_type || doc.category || "Document")}</td>
                    <td>{formatDate(doc.created_at || doc.uploaded_at)}</td>
                    <td>{doc.notes || "—"}</td>
                    <td>
                      <div className="entity-actions">
                        <button type="button" className="table-action" onClick={() => openDoc(doc)}><Eye size={15} /> View</button>
                        <button type="button" className="table-action" onClick={() => printDoc(doc)}><Printer size={15} /> Print</button>
                        <button type="button" className="table-action" onClick={() => openDoc(doc)}><Download size={15} /> Download</button>
                      </div>
                    </td>
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

function formatType(value) {
  return `${value || ""}`.replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}