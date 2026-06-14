import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileLock2,
  FileText,
  Filter,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";

import api from "../services/api";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [entityType, setEntityType] = useState("");
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: "",
    entity_type: "RESIDENT",
    entity_id: "",
    document_type: "OTHER",
    description: "",
    requires_signature: false,
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      setLoading(true);

      const [docsRes, summaryRes] = await Promise.all([
        api.get("/documents"),
        api.get("/dashboard/documents"),
      ]);

      setDocuments(docsRes.data || []);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function uploadDocument(e) {
    e.preventDefault();

    if (!uploadForm.file || !uploadForm.title) {
      alert("File and title are required.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("title", uploadForm.title);
      formData.append("entity_type", uploadForm.entity_type);
      formData.append("document_type", uploadForm.document_type);
      formData.append("description", uploadForm.description || "");
      formData.append("requires_signature", uploadForm.requires_signature);

      if (uploadForm.entity_id) {
        formData.append("entity_id", uploadForm.entity_id);
      }

      await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadForm({
        file: null,
        title: "",
        entity_type: "RESIDENT",
        entity_id: "",
        document_type: "OTHER",
        description: "",
        requires_signature: false,
      });

      await loadDocuments();
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function downloadDocument(documentId) {
    try {
      const res = await api.get(`/documents/${documentId}/download-url`);
      window.open(res.data.download_url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Unable to open document.");
    }
  }

  async function downloadSignedDocument(documentId) {
    try {
      const res = await api.get(`/documents/${documentId}/signed-download-url`);
      window.open(res.data.signed_pdf_url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Signed PDF not available.");
    }
  }

  async function deleteDocument(documentId) {
    if (!confirm("Delete this document?")) return;

    try {
      await api.delete(`/documents/${documentId}`);
      await loadDocuments();
    } catch (err) {
      console.error(err);
      alert("Unable to delete document.");
    }
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const query = search.toLowerCase();

      const matchesSearch =
        doc.title?.toLowerCase().includes(query) ||
        doc.original_filename?.toLowerCase().includes(query) ||
        doc.document_type?.toLowerCase().includes(query);

      const matchesType = documentType
        ? doc.document_type === documentType
        : true;

      const matchesEntity = entityType
        ? doc.category === entityType
        : true;

      return matchesSearch && matchesType && matchesEntity;
    });
  }, [documents, search, documentType, entityType]);

  return (
    <div className="documents-page">
      <section className="resident-hero">
        <div>
          <p className="dashboard-eyebrow">Document Center</p>
          <h1>Documents</h1>
          <p>
            Upload, manage, download, sign, and lock resident, staff, and
            facility documents using Azure Blob Storage.
          </p>
        </div>
      </section>

      <section className="resident-summary-grid task-summary-grid">
        <SummaryCard
          title="Total Documents"
          value={summary?.documents?.total ?? documents.length}
          icon={<FileText />}
        />

        <SummaryCard
          title="Signed"
          value={summary?.documents?.signed ?? 0}
          icon={<FileLock2 />}
        />

        <SummaryCard
          title="Locked"
          value={summary?.documents?.locked ?? 0}
          icon={<FileLock2 />}
        />

        <SummaryCard
          title="Pending Signatures"
          value={summary?.signatures?.pending ?? 0}
          icon={<UploadCloud />}
        />
      </section>

      <section className="document-upload-card">
        <div className="panel-header">
          <h3>
            <UploadCloud size={18} />
            Upload Document
          </h3>
        </div>

        <form onSubmit={uploadDocument} className="document-upload-form">
          <input
            type="file"
            onChange={(e) =>
              setUploadForm({
                ...uploadForm,
                file: e.target.files?.[0] || null,
              })
            }
          />

          <input
            placeholder="Document title"
            value={uploadForm.title}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, title: e.target.value })
            }
          />

          <select
            value={uploadForm.entity_type}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, entity_type: e.target.value })
            }
          >
            <option value="RESIDENT">Resident</option>
            <option value="STAFF">Staff</option>
            <option value="FACILITY">Facility</option>
          </select>

          <input
            placeholder="Entity ID (resident/staff id)"
            value={uploadForm.entity_id}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, entity_id: e.target.value })
            }
          />

          <select
            value={uploadForm.document_type}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, document_type: e.target.value })
            }
          >
            <option value="ASSESSMENT">Assessment</option>
            <option value="CONSENT">Consent</option>
            <option value="LEGAL_DOCUMENT">Legal Document</option>
            <option value="TREATMENT_PLAN">Treatment Plan</option>
            <option value="CRISIS_PLAN">Crisis Plan</option>
            <option value="CFT_MEETING">CFT Meeting</option>
            <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
            <option value="LAB_RESULT">Lab Result</option>
            <option value="INSURANCE">Insurance</option>
            <option value="TRAINING_CERTIFICATE">Training Certificate</option>
            <option value="FACILITY_CERTIFICATE">Facility Certificate</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            placeholder="Description"
            value={uploadForm.description}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, description: e.target.value })
            }
          />

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={uploadForm.requires_signature}
              onChange={(e) =>
                setUploadForm({
                  ...uploadForm,
                  requires_signature: e.target.checked,
                })
              }
            />
            Requires signature
          </label>

          <button disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </section>

      <section className="resident-toolbar">
        <div className="resident-search">
          <Search size={18} />
          <input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
        >
          <option value="">All Entities</option>
          <option value="RESIDENT">Resident</option>
          <option value="STAFF">Staff</option>
          <option value="FACILITY">Facility</option>
        </select>

        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="ASSESSMENT">Assessment</option>
          <option value="CONSENT">Consent</option>
          <option value="LEGAL_DOCUMENT">Legal Document</option>
          <option value="TREATMENT_PLAN">Treatment Plan</option>
          <option value="CRISIS_PLAN">Crisis Plan</option>
          <option value="CFT_MEETING">CFT Meeting</option>
          <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
          <option value="OTHER">Other</option>
        </select>
      </section>

      <section className="premium-table-card">
        <div className="table-header">
          <div>
            <h3>Document Repository</h3>
            <p>{filteredDocuments.length} document(s)</p>
          </div>

          <div className="table-header-icon">
            <Filter size={18} />
          </div>
        </div>

        {loading ? (
          <div className="table-empty">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="table-empty">No documents found.</div>
        ) : (
          <div className="table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Entity</th>
                  <th>Signed</th>
                  <th>Locked</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="resident-cell">
                        <div className="document-icon">
                          <FileText size={20} />
                        </div>

                        <div>
                          <strong>{doc.title}</strong>
                          <p>{doc.original_filename}</p>
                        </div>
                      </div>
                    </td>

                    <td>{doc.document_type}</td>
                    <td>{doc.category || "—"}</td>

                    <td>
                      <YesNoBadge value={doc.is_signed} />
                    </td>

                    <td>
                      <YesNoBadge value={doc.is_locked} />
                    </td>

                    <td>{formatDate(doc.created_at)}</td>

                    <td>
                      <div className="document-actions">
                        <button onClick={() => downloadDocument(doc.id)}>
                          <Download size={15} />
                        </button>

                        {doc.is_signed && (
                          <button onClick={() => downloadSignedDocument(doc.id)}>
                            <FileLock2 size={15} />
                          </button>
                        )}

                        {!doc.is_locked && (
                          <button
                            className="danger-icon"
                            onClick={() => deleteDocument(doc.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
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

function SummaryCard({ title, value, icon }) {
  return (
    <div className="resident-summary-card">
      <div className="summary-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value ?? 0}</h2>
      </div>
    </div>
  );
}

function YesNoBadge({ value }) {
  return (
    <span className={`status-badge ${value ? "active" : "pending"}`}>
      {value ? "Yes" : "No"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}