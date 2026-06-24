import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Upload,
  X,
  Star,
  UserRound,
} from "lucide-react";

import api from "../services/api";

import StaffComplianceTab from "../components/staff/StaffComplianceTab";
import StaffCertificationsTab from "../components/staff/StaffCertificationsTab";
import StaffTrainingTab from "../components/staff/StaffTrainingTab";
import StaffContinuingEducationTab from "../components/staff/StaffContinuingEducationTab";
import StaffScheduleTab from "../components/staff/StaffScheduleTab";
import StaffDocumentsTab from "../components/staff/StaffDocumentsTab";
import StaffPerformanceTab from "../components/staff/StaffPerformanceTab";
import StaffNotesTab from "../components/staff/StaffNotesTab";

const tabs = [
  { label: "Overview", icon: UserRound },
  { label: "Credentials", icon: Award },
  { label: "Training", icon: GraduationCap },
  { label: "Continuing Education", icon: BookOpenCheck },
  { label: "Compliance", icon: ShieldCheck },
  { label: "Schedule", icon: CalendarDays },
  { label: "Documents", icon: FileText },
  { label: "Performance", icon: Star },
  { label: "Notes", icon: MessageSquareText },
];

export default function StaffDetailPage() {
  const { staffId } = useParams();

  const [staff, setStaff] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [ce, setCe] = useState([]);
  const [certs, setCerts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [staffChecklist, setStaffChecklist] = useState(null);
  const [evidenceOverrides, setEvidenceOverrides] = useState({});
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [taskModalItem, setTaskModalItem] = useState(null);
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskMessage, setTaskMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvidenceOverrides(loadStaffEvidenceOverrides(staffId));
    loadStaff();
  }, [staffId]);

  async function loadStaff() {
    try {
      setLoading(true);

      const [staffRes, assignmentsRes, ceRes, certRes, alertsRes, checklistRes] =
        await Promise.allSettled([
          api.get(`/staff/${staffId}`),
          api.get(`/staff-compliance/training-assignments?staff_id=${staffId}`),
          api.get(`/staff-compliance/continuing-education?staff_id=${staffId}`),
          api.get(`/staff-compliance/certifications?staff_id=${staffId}`),
          api.get(`/staff-compliance/alerts?staff_id=${staffId}`),
          api.get(`/staff-compliance/checklist/${staffId}`),
        ]);

      if (staffRes.status === "fulfilled") setStaff(staffRes.value.data);

      setAssignments(getArray(assignmentsRes));
      setCe(getArray(ceRes));
      setCerts(getArray(certRes));
      setAlerts(getArray(alertsRes));
      setStaffChecklist(getChecklist(checklistRes));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshStaffCompliance() {
    try {
      setChecklistLoading(true);
      const [alertsRes, checklistRes] = await Promise.allSettled([
        api.get(`/staff-compliance/alerts?staff_id=${staffId}`),
        api.get(`/staff-compliance/checklist/${staffId}`),
      ]);

      setAlerts(getArray(alertsRes));
      setStaffChecklist(getChecklist(checklistRes));
    } catch (err) {
      console.error(err);
    } finally {
      setChecklistLoading(false);
    }
  }

  const complianceItems = useMemo(
    () => applyStaffEvidenceOverrides(normalizeChecklistItems(staffChecklist), evidenceOverrides),
    [staffChecklist, evidenceOverrides]
  );

  const complianceSummary = useMemo(() => {
    const total = complianceItems.length;
    const compliant = complianceItems.filter((item) => isEvidenceCompliant(item)).length;
    const missingEvidence = complianceItems.filter((item) => !isEvidenceCompliant(item) && hasSourceRecord(item)).length;
    const missing = complianceItems.filter((item) => !isEvidenceCompliant(item) && !hasSourceRecord(item)).length;
    const review = missingEvidence;
    const score = total ? Math.round((compliant / total) * 100) : 0;

    return { total, compliant, missing, missingEvidence, review, score };
  }, [complianceItems]);

  const missingComplianceItems = useMemo(
    () => complianceItems.filter((item) => !isEvidenceCompliant(item)),
    [complianceItems]
  );

  const stats = useMemo(() => {
    const completedAssignments = assignments.filter(
      (a) => `${a.status || ""}`.toUpperCase() === "COMPLETED"
    ).length;

    const ceHours = ce.reduce((sum, r) => sum + Number(r.hours_earned || 0), 0);

    const openAlerts = alerts.filter(
      (a) => !a.is_resolved && `${a.status || ""}`.toUpperCase() !== "RESOLVED"
    );

    const expiredCerts = certs.filter((c) => isExpired(c.expiration_date));

    const totalComplianceItems =
      Math.max(assignments.length, 1) + Math.max(certs.length, 1);

    const goodItems =
      completedAssignments + certs.filter((c) => !isExpired(c.expiration_date)).length;

    const score = Math.min(
      100,
      Math.max(0, Math.round((goodItems / totalComplianceItems) * 100))
    );

    const reconciledScore = complianceSummary.total ? complianceSummary.score : score;

    return {
      completedAssignments,
      pendingAssignments: assignments.length - completedAssignments,
      ceHours,
      openAlerts,
      expiredCerts,
      score: reconciledScore,
    };
  }, [assignments, ce, certs, alerts, complianceSummary]);


  function openComplianceTask(item) {
    setTaskMessage("");
    setTaskModalItem(item);
  }

  async function saveComplianceTask(formValues) {
    if (!taskModalItem) return;

    try {
      setTaskSaving(true);
      setTaskMessage("");

      const endpoint = getStaffComplianceSaveEndpoint(taskModalItem);
      const recordGroup = getStaffComplianceRecordGroup(taskModalItem);
      const payload = buildStaffCompliancePayload(taskModalItem, staffId, formValues);

      let saveRes;

	if (existingRecordId) {
	  try {
		saveRes = await api.patch(`${endpoint}/${existingRecordId}`, payload);
	  } catch {
		saveRes = await api.post(endpoint, payload);
	  }
	} else {
	  saveRes = await api.post(endpoint, payload);
	}

	let savedRecord = saveRes?.data || {};
	const savedRecordId = savedRecord.id;

	if (!savedRecordId) {
	  throw new Error("Compliance record was not created. Cannot upload evidence.");
	}

	if (formValues.evidence_file && recordGroup) {
	  const data = new FormData();
	  data.append("evidence", formValues.evidence_file);

	  const evidenceRes = await api.post(
		`/staff-compliance/${recordGroup}/${savedRecordId}/evidence`,
		data,
		{ headers: { "Content-Type": "multipart/form-data" } }
	  );

	  savedRecord = {
		...savedRecord,
		...evidenceRes.data,
		id: savedRecordId,
		record_group: recordGroup,
	  };
	}

      const override = buildEvidenceOverride(taskModalItem, payload, savedRecord, recordGroup);
      const nextOverrides = {
        ...evidenceOverrides,
        [taskModalItem.key || taskModalItem.title]: override,
      };

      setEvidenceOverrides(nextOverrides);
      saveStaffEvidenceOverrides(staffId, nextOverrides);

      setStaffChecklist((current) => patchChecklistWithEvidence(current, taskModalItem, override));

      setTaskMessage("Evidence saved. Refreshing compliance checklist...");
      await refreshStaffCompliance();

      setTaskModalItem(null);
    } catch (err) {
      console.error(err);
      setTaskMessage(getApiErrorMessage(err) || "Could not save compliance evidence.");
    } finally {
      setTaskSaving(false);
    }
  }

  if (loading) return <div className="page">Loading staff profile...</div>;
  if (!staff) return <div className="page">Staff not found.</div>;

  return (
    <div className="staff-detail-page">
      <Link to="/staff" className="staff-back-link">
        <ArrowLeft size={17} />
        Back to Staff
      </Link>

      <section className="staff-hero-premium">
        <div className="staff-hero-left">
          <div className="staff-avatar-xl">
            {getInitials(staff.full_name)}
            <span className="staff-online-dot" />
          </div>

          <div>
            <p className="dashboard-eyebrow staff-eyebrow">
              <ShieldCheck size={15} />
              Staff Profile
            </p>

            <h1>{staff.full_name}</h1>

            <div className="staff-subline">
              <span>{staff.position || "Staff Member"}</span>
              <span>Employee # {staff.employee_number || "—"}</span>
            </div>

            <div className="profile-badges">
              <span className={`status-badge ${staff.employment_status?.toLowerCase()}`}>
                <CheckCircle2 size={13} />
                {staff.employment_status || "UNKNOWN"}
              </span>

              <span className="soft-badge">
                <BriefcaseBusiness size={13} />
                {staff.department || "Department N/A"}
              </span>

              <span className="soft-badge">
                <CalendarDays size={13} />
                Hire: {formatDate(staff.hire_date)}
              </span>
            </div>
          </div>
        </div>

        <div className="staff-hero-actions">
          <button type="button">Edit Profile</button>
          <button type="button" className="dark">
            Assign Training
          </button>
        </div>
      </section>

      <section className="staff-summary-grid">
        <InfoCard
          title="Contact"
          icon={<UserRound />}
          accent="blue"
          items={[
            ["Email", staff.email || "—", <Mail size={14} />],
            ["Phone", staff.phone || "—", <Phone size={14} />],
            ["Employee #", staff.employee_number || "—", null],
          ]}
        />

        <InfoCard
          title="Credential Dates"
          icon={<ShieldCheck />}
          accent="indigo"
          items={[
            ["CPR Expiry", formatDate(staff.cpr_expiry_date), null],
            ["First Aid Expiry", formatDate(staff.first_aid_expiry_date), null],
            ["Fingerprint Expiry", formatDate(staff.fingerprint_expiry_date), null],
          ]}
        />

        <InfoCard
          title="Compliance Overview"
          icon={<ClipboardCheck />}
          accent="green"
          items={[
            ["Score", `${stats.score}%`, null],
            ["Missing Items", complianceSummary.missing, null],
            ["Open Alerts", stats.openAlerts.length, null],
          ]}
        />

        <InfoCard
          title="Continuing Education"
          icon={<GraduationCap />}
          accent="purple"
          items={[
            ["Records", ce.length, null],
            ["Hours Earned", stats.ceHours, null],
            ["Cycle", "40 hrs / 2 yrs", null],
          ]}
        />
      </section>

      <MissingCompliancePanel
        items={missingComplianceItems}
        summary={complianceSummary}
        loading={checklistLoading}
        onRefresh={refreshStaffCompliance}
        onOpenCompliance={() => setActiveTab("Compliance")}
        onOpenTask={openComplianceTask}
      />

      <section className="staff-tab-shell">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              type="button"
              className={activeTab === tab.label ? "active" : ""}
              onClick={() => setActiveTab(tab.label)}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </section>

      <section className="staff-tab-panel">
        {activeTab === "Overview" && (
          <div className="premium-panel staff-overview-panel">
            <div>
              <p className="dashboard-eyebrow">Employment Record</p>
              <h3>Employment Overview</h3>
            </div>

            <div className="staff-overview-grid">
              <Row label="Position" value={staff.position || "—"} />
              <Row label="Department" value={staff.department || "—"} />
              <Row label="Hire Date" value={formatDate(staff.hire_date)} />
              <Row label="Employment Status" value={staff.employment_status || "—"} />
              <Row label="Supervisor" value={staff.supervisor_name || "—"} />
              <Row label="Notes" value={staff.notes || "—"} />
            </div>
          </div>
        )}

        {activeTab === "Credentials" && (
          <StaffCertificationsTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Training" && (
          <StaffTrainingTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Continuing Education" && (
          <StaffContinuingEducationTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Compliance" && (
          <StaffComplianceMirrorTab
            staff={staff}
            staffId={staffId}
            items={complianceItems}
            summary={complianceSummary}
            loading={checklistLoading}
            onRefresh={refreshStaffCompliance}
            onOpenTask={openComplianceTask}
          />
        )}

        {activeTab === "Schedule" && (
          <StaffScheduleTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Documents" && (
          <StaffDocumentsTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Performance" && (
          <StaffPerformanceTab staff={staff} staffId={staffId} />
        )}

        {activeTab === "Notes" && (
          <StaffNotesTab staff={staff} staffId={staffId} />
        )}
      </section>

      {taskModalItem && (
        <StaffComplianceTaskModal
          item={taskModalItem}
          staff={staff}
          saving={taskSaving}
          message={taskMessage}
          onClose={() => {
            setTaskModalItem(null);
            setTaskMessage("");
          }}
          onSave={saveComplianceTask}
        />
      )}

      <StaffDetailComplianceStyles />
    </div>
  );
}



function StaffComplianceMirrorTab({ staff, staffId, items, summary, loading, onRefresh, onOpenTask }) {
  const sections = groupChecklistItems(items);
  const missingItems = items.filter((item) => !isEvidenceCompliant(item));
  const compliantItems = items.filter((item) => isEvidenceCompliant(item));

  return (
    <div className="staff-resident-style-compliance">
      <section className={`staff-compliance-command ${missingItems.length ? "risk" : "ready"}`}>
        <div>
          <p className="dashboard-eyebrow">Staff Compliance Source of Truth</p>
          <h2>{missingItems.length ? "Compliance evidence needed" : "Staff file is inspection ready"}</h2>
          <p>
            This tab works like Resident Compliance: each requirement is satisfied only when the source record has
            viewable evidence. Missing files remain open until evidence is attached.
          </p>
        </div>

        <div className="staff-compliance-score-ring">
          <strong>{summary.score}%</strong>
          <span>{summary.compliant}/{summary.total || 0} evidence complete</span>
        </div>

        <button type="button" className="staff-refresh-pill" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={15} />
          {loading ? "Checking..." : "Refresh Source Check"}
        </button>
      </section>

      <section className="staff-compliance-inspector-grid">
        <div className="staff-inspector-card missing">
          <span>{missingItems.length}</span>
          <p>Missing Evidence</p>
        </div>
        <div className="staff-inspector-card complete">
          <span>{compliantItems.length}</span>
          <p>Evidence Ready</p>
        </div>
        <div className="staff-inspector-card total">
          <span>{summary.total || 0}</span>
          <p>Total Requirements</p>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="staff-compliance-empty resident-style">
          <ShieldCheck size={30} />
          <strong>No staff checklist returned.</strong>
          <p>Confirm /staff-compliance/checklist/{staffId} is enabled.</p>
        </div>
      ) : (
        <div className="resident-style-compliance-sections">
          {sections.map((section) => (
            <section className="resident-style-section" key={section.title}>
              <div className="resident-style-section-head">
                <div>
                  <p className="dashboard-eyebrow">Staff Detail · {section.title}</p>
                  <h3>{section.title}</h3>
                </div>
                <span>{section.items.length} items</span>
              </div>

              <div className="resident-style-item-list">
                {section.items.map((item) => {
                  const ok = isEvidenceCompliant(item);
                  return (
                    <button
                      type="button"
                      className={`resident-style-compliance-item ${ok ? "compliant" : "missing"}`}
                      key={item.key || item.title}
                      onClick={() => onOpenTask(item)}
                    >
                      <div className="resident-style-item-icon">
                        {ok ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                      </div>

                      <div className="resident-style-item-body">
                        <div className="resident-style-title-row">
                          <strong>{item.title}</strong>
                          <span className={`resident-style-status ${ok ? "ok" : "missing"}`}>
                            {ok ? "Compliant" : normalizeEvidenceStatus(item)}
                          </span>
                        </div>

                        {ok ? (
                          <EvidenceFileLink item={item} />
                        ) : (
                          <p>
                            {hasEvidence(item)
                              ? "Record found, but evidence is missing or expired."
                              : `No evidence attached. Complete from ${getFixLocation(item)}.`}
                          </p>
                        )}

                        <div className="resident-style-meta">
                          {item.expiration_date && <span>Expires: {formatDate(item.expiration_date)}</span>}
                          {item.completed_date && <span>Completed: {formatDate(item.completed_date)}</span>}
                          <span>{item.source_label || "Staff Detail source record"}</span>
                        </div>
                      </div>

                      <b>{ok ? "View Evidence" : "Add Evidence"}</b>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function MissingCompliancePanel({ items, summary, loading, onRefresh, onOpenCompliance, onOpenTask }) {
  const preview = items.slice(0, 5);

  return (
    <section className={`missing-compliance-panel ${summary.missing ? "has-missing" : "is-clean"}`}>
      <div className="missing-compliance-left">
        <div className="missing-compliance-icon">
          {summary.missing ? <AlertTriangle size={22} /> : <ShieldCheck size={22} />}
        </div>
        <div>
          <p className="dashboard-eyebrow">Source Compliance Check</p>
          <h3>{summary.missing ? `${summary.missing} missing compliance item${summary.missing === 1 ? "" : "s"}` : "Staff file is compliance-ready"}</h3>
          <p>
            This panel mirrors the same checklist used by the main Compliance Center. Complete missing records in the correct Staff Detail tab and refresh the source check.
          </p>
        </div>
      </div>

      <div className="missing-compliance-right">
        <div className="mini-compliance-score">
          <strong>{summary.score}%</strong>
          <span>{summary.compliant}/{summary.total || 0} complete</span>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={15} />
          {loading ? "Checking..." : "Refresh"}
        </button>
        <button type="button" className="dark" onClick={onOpenCompliance}>
          Open Compliance
        </button>
      </div>

      {preview.length > 0 && (
        <div className="missing-preview-list">
          {preview.map((item) => (
            <button key={item.key || item.title} type="button" onClick={() => onOpenTask(item)}>
              <AlertTriangle size={13} />
              {item.title}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function StaffMissingComplianceChecklist({ items, summary, loading, onRefresh, onOpenTask }) {
  const sections = groupChecklistItems(items);

  return (
    <div className="premium-panel staff-compliance-source-panel">
      <div className="staff-compliance-source-head">
        <div>
          <p className="dashboard-eyebrow">Compliance Checklist</p>
          <h3>Missing & Completed Requirements</h3>
          <p>
            Compliance is calculated from staff credentials, training, continuing education, documents, and alerts.
          </p>
        </div>
        <div className="staff-compliance-score-box">
          <strong>{summary.score}%</strong>
          <span>{summary.compliant}/{summary.total || 0} complete</span>
        </div>
      </div>

      <div className="staff-compliance-actions-row">
        <button type="button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={15} />
          {loading ? "Checking..." : "Refresh Source Check"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="staff-compliance-empty">
          <ShieldCheck size={28} />
          <strong>No checklist returned yet.</strong>
          <p>Confirm /staff-compliance/checklist/{'{staffId}'} is available.</p>
        </div>
      ) : (
        <div className="staff-compliance-sections">
          {sections.map((section) => (
            <div className="staff-compliance-section" key={section.title}>
              <h4>{section.title}</h4>
              <div className="staff-compliance-items">
                {section.items.map((item) => {
                  const ok = isCompliant(item.status) && hasEvidence(item);
                  return (
                    <button
                      type="button"
                      className={`staff-compliance-item ${ok ? "ok" : "missing"}`}
                      key={item.key || item.title}
                      onClick={() => onOpenTask(item)}
                    >
                      <span>{ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}</span>
                      <div>
                        <strong>{item.title}</strong>
                        {ok ? (
                          <EvidenceFileLink item={item} compact onClick={(event) => event.stopPropagation()} />
                        ) : (
                          <p>{hasEvidence(item) ? "Evidence needs review" : `Complete in ${getFixLocation(item)}`}</p>
                        )}
                      </div>
                      <b>{ok ? "View Evidence" : "Complete Task"}</b>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



function StaffComplianceTaskModal({ item, staff, saving, message, onClose, onSave }) {
  const compliant = isEvidenceCompliant(item);
  const [form, setForm] = useState({
    completed_date: item.completed_date || todayInputValue(),
    expiration_date: item.expiration_date || item.due_date || "",
    notes: item.notes || "",
    evidence_filename: item.evidence_filename || item.document_name || "",
    evidence_url: item.evidence_url || item.document_url || item.file_url || "",
    evidence_file: null,
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="staff-task-modal-backdrop" onClick={onClose}>
      <div className="staff-task-modal" onClick={(event) => event.stopPropagation()}>
        <div className="staff-task-modal-header">
          <div>
            <p className="dashboard-eyebrow">Staff Compliance Task</p>
            <h2>{item.title}</h2>
            <span>{staff.full_name} · {getFixLocation(item)}</span>
          </div>
          <button type="button" className="icon-close" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <div className={`staff-task-status ${compliant ? "ok" : "missing"}`}>
          {compliant ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <div>
            <strong>{normalizeEvidenceStatus(item)}</strong>
            <p>
              {compliant
                ? "Evidence exists. Inspectors can open the file from this task. You may add notes or update expiration information if needed."
                : "This task remains missing until evidence is attached. Upload the certificate, signed form, ID, license, or supporting document and save."}
            </p>
          </div>
        </div>

        <div className="staff-task-evidence-panel">
          <strong>Evidence Document</strong>
          {hasEvidence(item) ? (
            <EvidenceFileLink item={item} />
          ) : (
            <span className="staff-no-evidence">No evidence file attached yet.</span>
          )}
        </div>

        <div className="staff-task-form-grid">
          <label>
            <span>Completed Date</span>
            <input
              type="date"
              value={form.completed_date}
              onChange={(event) => update("completed_date", event.target.value)}
            />
          </label>

          <label>
            <span>Expiration Date <small>optional</small></span>
            <input
              type="date"
              value={form.expiration_date}
              onChange={(event) => update("expiration_date", event.target.value)}
            />
          </label>
        </div>

        <label className="staff-task-upload">
          <Upload size={20} />
          <div>
            <strong>Evidence File</strong>
            <p>{form.evidence_filename || "Attach PDF, image, certificate, signed form, or log."}</p>
          </div>
          <input
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              update("evidence_filename", file.name);
              update("evidence_file", file);
              update("evidence_url", form.evidence_url || "");
            }}
          />
        </label>

        <label className="staff-task-notes">
          <span>Notes</span>
          <textarea
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Add evidence notes, reviewer comment, or renewal instruction..."
          />
        </label>

        {message && <div className="staff-task-message">{message}</div>}

        <div className="staff-task-modal-actions">
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="primary" onClick={() => onSave(form)} disabled={saving}>
            <Save size={16} />
            {saving ? "Saving..." : compliant ? "Update Evidence" : "Save Evidence"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffDetailComplianceStyles() {
  return (
    <style>{`
      .staff-resident-style-compliance {
        display: grid;
        gap: 18px;
      }

      .staff-compliance-command {
        border-radius: 30px;
        padding: 24px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: 18px;
        align-items: center;
        color: #ffffff;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
      }

      .staff-compliance-command.risk {
        background: linear-gradient(135deg, #7f1d1d, #dc2626 54%, #f97316);
      }

      .staff-compliance-command.ready {
        background: linear-gradient(135deg, #064e3b, #059669 54%, #14b8a6);
      }

      .staff-compliance-command h2 {
        margin: 0 0 8px;
        font-size: 1.55rem;
        letter-spacing: -0.04em;
      }

      .staff-compliance-command p {
        margin: 0;
        max-width: 760px;
        color: rgba(255, 255, 255, 0.86);
        line-height: 1.55;
      }

      .staff-compliance-score-ring {
        width: 132px;
        height: 132px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        text-align: center;
        background: rgba(255, 255, 255, 0.16);
        border: 1px solid rgba(255, 255, 255, 0.26);
      }

      .staff-compliance-score-ring strong {
        display: block;
        font-size: 2rem;
      }

      .staff-compliance-score-ring span {
        display: block;
        max-width: 95px;
        font-size: .72rem;
        font-weight: 800;
        color: rgba(255,255,255,.82);
      }

      .staff-refresh-pill {
        border: 0;
        border-radius: 999px;
        padding: 12px 15px;
        background: rgba(255, 255, 255, 0.18);
        color: #fff;
        font-weight: 950;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .staff-compliance-inspector-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .staff-inspector-card {
        border-radius: 22px;
        padding: 18px;
        background: #fff;
        border: 1px solid #e2e8f0;
        box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
      }

      .staff-inspector-card span {
        display: block;
        font-size: 2rem;
        font-weight: 950;
        letter-spacing: -0.05em;
      }

      .staff-inspector-card p {
        margin: 2px 0 0;
        font-weight: 850;
        color: #64748b;
      }

      .staff-inspector-card.missing span { color: #dc2626; }
      .staff-inspector-card.complete span { color: #059669; }
      .staff-inspector-card.total span { color: #2563eb; }

      .resident-style-compliance-sections {
        display: grid;
        gap: 16px;
      }

      .resident-style-section {
        border-radius: 26px;
        padding: 18px;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid #e2e8f0;
        box-shadow: 0 16px 44px rgba(15, 23, 42, 0.08);
      }

      .resident-style-section-head {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
      }

      .resident-style-section-head h3 {
        margin: 0;
        font-size: 1.15rem;
      }

      .resident-style-section-head span {
        font-weight: 950;
        color: #2563eb;
      }

      .resident-style-item-list {
        display: grid;
        gap: 10px;
      }

      .resident-style-compliance-item {
        width: 100%;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        border-radius: 20px;
        padding: 14px;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: 12px;
        text-align: left;
        cursor: pointer;
        align-items: center;
      }

      .resident-style-compliance-item.compliant {
        border-color: #bbf7d0;
        background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
      }

      .resident-style-compliance-item.missing {
        border-color: #fecaca;
        background: linear-gradient(135deg, #ffffff 0%, #fff7f7 100%);
      }

      .resident-style-item-icon {
        width: 38px;
        height: 38px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: #fef2f2;
        color: #dc2626;
      }

      .resident-style-compliance-item.compliant .resident-style-item-icon {
        background: #ecfdf5;
        color: #059669;
      }

      .resident-style-title-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
      }

      .resident-style-title-row strong {
        color: #0f172a;
      }

      .resident-style-status {
        border-radius: 999px;
        padding: 5px 9px;
        font-size: .68rem;
        font-weight: 950;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .resident-style-status.ok {
        background: #ecfdf5;
        color: #047857;
      }

      .resident-style-status.missing {
        background: #fef2f2;
        color: #b91c1c;
      }

      .resident-style-item-body p {
        margin: 5px 0 0;
        color: #64748b;
        font-size: .9rem;
      }

      .resident-style-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }

      .resident-style-meta span {
        border-radius: 999px;
        padding: 4px 8px;
        background: #f1f5f9;
        color: #475569;
        font-size: .72rem;
        font-weight: 800;
      }

      .resident-style-compliance-item > b {
        color: #2563eb;
        font-size: .8rem;
        white-space: nowrap;
      }


      .missing-compliance-panel {
        margin: 18px 0;
        border-radius: 28px;
        padding: 18px;
        border: 3px solid #27F52E;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.48);
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 16px;
      }

      .missing-compliance-panel.has-missing {
        border-color: #f20000;
        background: linear-gradient(135deg, #fff7f7 50%, #27F5E7 60%);
      }

      .missing-compliance-panel.is-clean {
        border-color: #bbf7d0;
        background: linear-gradient(135deg, #fff 0%, #f0fdf4 100%);
      }

      .missing-compliance-left {
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }

      .missing-compliance-icon {
        width: 46px;
        height: 46px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        background: #f20000;
        color: #ffffff;
        flex: 0 0 auto;
      }

      .missing-compliance-panel.is-clean .missing-compliance-icon {
        background: #ecfdf5;
        color: #059669;
      }

      .missing-compliance-left h3,
      .missing-compliance-left p {
        margin: 0;
      }

      .missing-compliance-left p:not(.dashboard-eyebrow) {
        margin-top: 6px;
        color: #64748b;
        line-height: 1.55;
      }

      .missing-compliance-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .mini-compliance-score {
        min-width: 100px;
        border-radius: 18px;
        padding: 11px 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        text-align: center;
      }

      .mini-compliance-score strong,
      .mini-compliance-score span {
        display: block;
      }

      .mini-compliance-score strong {
        font-size: 1.35rem;
      }

      .mini-compliance-score span {
        color: #64748b;
        font-size: .78rem;
        font-weight: 800;
      }

      .missing-compliance-right button,
      .staff-compliance-actions-row button {
        border: 1px solid #e2e8f0;
        background: #fff;
        color: #334155;
        border-radius: 999px;
        padding: 11px 14px;
        font-weight: 900;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .missing-compliance-right button.dark {
        background: #0f172a;
        color: white;
        border-color: #0f172a;
      }

      .missing-preview-list {
        grid-column: 1 / -1;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .missing-preview-list button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 999px;
        padding: 8px 10px;
        background: #fef2f2;
        color: #991b1b;
        font-weight: 850;
        font-size: .78rem;
        border: 0;
        cursor: pointer;
      }

      .staff-compliance-reconciled-grid {
        display: grid;
        gap: 18px;
      }

      .staff-compliance-source-panel {
        border-radius: 28px;
      }

      .staff-compliance-source-head {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 14px;
      }

      .staff-compliance-source-head h3,
      .staff-compliance-source-head p {
        margin: 0;
      }

      .staff-compliance-source-head p:not(.dashboard-eyebrow) {
        margin-top: 6px;
        color: #64748b;
      }

      .staff-compliance-score-box {
        min-width: 120px;
        border-radius: 22px;
        background: #eff6ff;
        color: #1d4ed8;
        text-align: center;
        padding: 14px;
        height: fit-content;
      }

      .staff-compliance-score-box strong,
      .staff-compliance-score-box span {
        display: block;
      }

      .staff-compliance-score-box strong {
        font-size: 1.8rem;
      }

      .staff-compliance-score-box span {
        font-size: .8rem;
        font-weight: 850;
      }

      .staff-compliance-actions-row {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 14px;
      }

      .staff-compliance-empty {
        min-height: 140px;
        border-radius: 22px;
        border: 1px dashed #cbd5e1;
        background: #f8fafc;
        display: grid;
        place-items: center;
        text-align: center;
        color: #64748b;
        padding: 20px;
      }

      .staff-compliance-sections {
        display: grid;
        gap: 14px;
      }

      .staff-compliance-section {
        border: 1px solid #e2e8f0;
        border-radius: 22px;
        padding: 14px;
        background: #f8fafc;
      }

      .staff-compliance-section h4 {
        margin: 0 0 10px;
      }

      .staff-compliance-items {
        display: grid;
        gap: 9px;
      }

      .staff-compliance-item {
        width: 100%;
        text-align: left;
        cursor: pointer;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 10px;
        align-items: center;
        background: white;
        border: 3px solid #e2e8f0;
        border-radius: 18px;
        padding: 11px;
      }

      .staff-compliance-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
      }

      .staff-compliance-item > span {
        width: 34px;
        height: 34px;
        border-radius: 13px;
        display: grid;
        place-items: center;
      }

      .staff-compliance-item.ok > span {
        background: #ecfdf5;
        color: #059669;
      }

      .staff-compliance-item.missing > span {
        background: #fef2f2;
        color: #dc2626;
      }

      .staff-compliance-item strong,
      .staff-compliance-item p {
        margin: 0;
      }

      .staff-compliance-item p {
        margin-top: 3px;
        font-size: .82rem;
        color: #64748b;
      }

      .staff-compliance-item b {
        border-radius: 999px;
        padding: 6px 9px;
        font-size: .72rem;
        background: #f1f5f9;
        color: #334155;
      }

      .staff-compliance-item.ok b {
        background: #ecfdf5;
        color: #047857;
      }

      .staff-compliance-item.missing b {
        background: #fef2f2;
        color: #b91c1c;
      }


      .staff-task-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(15, 23, 42, 0.58);
        backdrop-filter: blur(8px);
      }

      .staff-task-modal {
        width: min(780px, 100%);
        max-height: 92vh;
        overflow: auto;
        border-radius: 30px;
        padding: 24px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid rgba(255, 255, 255, 0.85);
        box-shadow: 0 30px 90px rgba(15, 23, 42, 0.35);
      }

      .staff-task-modal-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
      }

      .staff-task-modal-header h2,
      .staff-task-modal-header span,
      .staff-task-status p,
      .staff-task-status strong {
        margin: 0;
      }

      .staff-task-modal-header h2 {
        font-size: 1.6rem;
        letter-spacing: -.04em;
      }

      .staff-task-modal-header span {
        display: block;
        margin-top: 5px;
        color: #64748b;
        font-weight: 850;
      }

      .icon-close {
        border: 0;
        width: 42px;
        height: 42px;
        border-radius: 999px;
        background: #f1f5f9;
        color: #0f172a;
        cursor: pointer;
        display: grid;
        place-items: center;
      }

      .staff-task-status {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        border-radius: 22px;
        padding: 14px;
        margin-bottom: 16px;
      }

      .staff-task-status.ok {
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #bbf7d0;
      }

      .staff-task-status.missing {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }

      .staff-task-status p {
        margin-top: 4px;
        line-height: 1.45;
      }

      .staff-task-form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 12px;
      }

      .staff-task-form-grid label,
      .staff-task-notes {
        display: grid;
        gap: 7px;
      }

      .staff-task-form-grid span,
      .staff-task-notes span {
        font-weight: 950;
        color: #334155;
      }

      .staff-task-form-grid small {
        color: #94a3b8;
        font-weight: 800;
      }

      .staff-task-form-grid input,
      .staff-task-notes textarea {
        border: 1px solid #cbd5e1;
        border-radius: 16px;
        padding: 12px 13px;
        font: inherit;
        font-weight: 800;
        background: white;
      }

      .staff-task-upload {
        position: relative;
        margin: 10px 0 12px;
        border: 1px dashed #93c5fd;
        border-radius: 22px;
        padding: 18px;
        background: #eff6ff;
        color: #1e40af;
        display: flex;
        gap: 12px;
        align-items: center;
        cursor: pointer;
      }

      .staff-task-upload p,
      .staff-task-upload strong {
        margin: 0;
      }

      .staff-task-upload p {
        margin-top: 3px;
        color: #475569;
      }

      
      .staff-evidence-file-link {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #2563eb;
        font-weight: 950;
        text-decoration: none;
        padding: 7px 10px;
        border-radius: 12px;
        background: rgba(37, 99, 235, 0.08);
        border: 1px solid rgba(37, 99, 235, 0.14);
        width: max-content;
        max-width: 100%;
        transition: 0.18s ease;
      }

      .staff-evidence-file-link:hover {
        background: rgba(37, 99, 235, 0.14);
        transform: translateY(-1px);
      }

      .staff-evidence-file-link.compact {
        margin-top: 6px;
        font-size: 0.78rem;
        padding: 5px 8px;
      }

      .staff-evidence-file-link.missing {
        color: #b91c1c;
        background: #fef2f2;
        border-color: #fecaca;
      }

      .staff-task-evidence-panel {
        margin: 14px 0;
        padding: 14px;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        background: #f8fafc;
        display: grid;
        gap: 8px;
      }

      .staff-task-evidence-panel > strong {
        color: #0f172a;
      }

      .staff-no-evidence {
        color: #b91c1c;
        font-weight: 850;
      }

.staff-task-upload input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }

      .staff-task-notes textarea {
        min-height: 118px;
        resize: vertical;
        font-weight: 700;
      }

      .staff-task-message {
        margin-top: 12px;
        border-radius: 16px;
        padding: 11px 13px;
        background: #fffbeb;
        color: #92400e;
        border: 1px solid #fde68a;
        font-weight: 850;
      }

      .staff-task-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 16px;
      }

      .staff-task-modal-actions button {
        border-radius: 999px;
        padding: 12px 16px;
        font-weight: 950;
        cursor: pointer;
        border: 1px solid #e2e8f0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .staff-task-modal-actions .secondary {
        background: white;
        color: #334155;
      }

      .staff-task-modal-actions .primary {
        background: linear-gradient(135deg, #1d4ed8, #0f766e);
        color: white;
        border-color: transparent;
      }

      .staff-task-modal-actions button:disabled {
        opacity: .65;
        cursor: not-allowed;
      }

      @media (max-width: 900px) {
        .missing-compliance-panel,
        .staff-compliance-source-head {
          grid-template-columns: 1fr;
          flex-direction: column;
        }

        .missing-compliance-right {
          flex-wrap: wrap;
        }
      }
    `}</style>
  );
}

function InfoCard({ title, icon, items, accent = "blue" }) {
  return (
    <div className={`staff-info-card ${accent}`}>
      <div className="staff-info-card-head">
        <span>{icon}</span>
        <h3>{title}</h3>
      </div>

      {items.map(([label, value, itemIcon]) => (
        <div className="staff-info-row" key={label}>
          <span>
            {itemIcon}
            {label}
          </span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getArray(result) {
  if (result.status !== "fulfilled") return [];
  return Array.isArray(result.value.data) ? result.value.data : [];
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S"
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function isExpired(value) {
  if (!value) return false;
  const today = new Date();
  const date = new Date(value);
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function getChecklist(result) {
  if (result.status !== "fulfilled") return null;
  return normalizeChecklist(result.value.data);
}

function normalizeChecklist(payload) {
  if (!payload) return null;
  if (payload.checklist) return normalizeChecklist(payload.checklist);
  const items = payload.items || flattenSections(payload.sections || []);
  return { ...payload, items };
}

function normalizeChecklistItems(checklist) {
  if (!checklist) return [];
  if (Array.isArray(checklist.items)) return checklist.items;
  if (Array.isArray(checklist.sections)) return flattenSections(checklist.sections);
  return [];
}

function flattenSections(sections) {
  return sections.flatMap((section) =>
    (section.items || []).map((item) => ({ ...item, section: section.title }))
  );
}

function groupChecklistItems(items) {
  const map = new Map();
  items.forEach((item) => {
    const title = item.section || item.category || item.area || getFixLocation(item);
    if (!map.has(title)) map.set(title, []);
    map.get(title).push(item);
  });
  return Array.from(map.entries()).map(([title, sectionItems]) => ({ title, items: sectionItems }));
}

function getEvidenceUrl(item) {
  if (!item) return "";

  const rawUrl =
    item.evidence_url ||
    item.document_url ||
    item.file_url ||
    item.certificate_url ||
    "";

  if (rawUrl && !isBareFilename(rawUrl)) return resolveApiFileUrl(rawUrl);

  const recordGroup = item.record_group || getStaffComplianceRecordGroup(item);
  const recordId = item.record_id || item.source_record_id;

  if (recordGroup && recordId) {
    return resolveApiFileUrl(`/staff-compliance/${recordGroup}/${recordId}/evidence/view`);
  }

  if (item.document_id) return resolveApiFileUrl(`/documents/${item.document_id}`);
  if (item.certificate_document_id) return resolveApiFileUrl(`/documents/${item.certificate_document_id}`);

  return "";
}

function isBareFilename(value = "") {
  const text = String(value || "").trim();
  return Boolean(text && !text.startsWith("http") && !text.startsWith("/") && !text.includes("/"));
}

function resolveApiFileUrl(path = "") {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const base = api.defaults?.baseURL || "";

  if (path.startsWith("/api/")) {
    if (base.startsWith("http")) {
      try {
        return `${new URL(base).origin}${path}`;
      } catch {
        return path;
      }
    }
    return path;
  }

  if (path.startsWith("/")) {
    if (base.startsWith("http")) {
      try {
        const baseUrl = new URL(base);
        if (baseUrl.pathname.endsWith("/api/v1")) return `${base}${path}`;
        return `${baseUrl.origin}${path}`;
      } catch {
        return `${base}${path}`;
      }
    }
    return `${base}${path}`.replace(/\/\/+/, "/");
  }

  if (base) return `${base.replace(/\/$/, "")}/${path}`;
  return path;
}

function evidenceLabel(item) {
  return (
    item?.evidence_filename ||
    item?.document_filename ||
    item?.document_name ||
    item?.file_name ||
    item?.certificate_filename ||
    (item?.document_id ? `Document ${item.document_id}` : "Evidence file")
  );
}

function hasEvidence(item) {
  return Boolean(
    item?.has_evidence === true ||
    item?.evidence_url ||
    item?.document_url ||
    item?.file_url ||
    item?.certificate_url ||
    item?.evidence_filename ||
    item?.document_id ||
    item?.certificate_document_id
  );
}

async function openEvidenceFile(item) {
  try {
    const url = getEvidenceUrl(item);

    if (!url) {
      alert("No evidence file is attached yet.");
      return;
    }

    let requestUrl = url;
    const baseURL = api.defaults?.baseURL || "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      const evidenceUrl = new URL(url);
      const apiUrl = baseURL ? new URL(baseURL) : null;

      if (!apiUrl || evidenceUrl.origin !== apiUrl.origin) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }

      requestUrl = evidenceUrl.pathname + evidenceUrl.search;
    }

    requestUrl = requestUrl.replace(/^\/api\/v1/, "");

    const res = await api.get(requestUrl, {
      responseType: "blob",
    });

    const contentType = res.headers?.["content-type"] || "application/octet-stream";
    const blob = new Blob([res.data], { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
  } catch (err) {
    console.error(err);
    alert("Could not open evidence file. Please re-upload the evidence if this is an older record.");
  }
}

function EvidenceFileLink({ item, compact = false }) {
  const label = evidenceLabel(item);

  if (!getEvidenceUrl(item)) {
    return (
      <span className={`staff-evidence-file-link missing ${compact ? "compact" : ""}`}>
        <FileText size={14} />
        {label || "Evidence missing"}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`staff-evidence-file-link ${compact ? "compact" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        openEvidenceFile(item);
      }}
      title="Open evidence file"
    >
      <FileText size={14} />
      {label}
    </button>
  );
}

function hasSourceRecord(item) {
  return Boolean(
    item?.record_id ||
    item?.source_record_id ||
    item?.document_id ||
    item?.certificate_document_id ||
    item?.has_record === true ||
    item?.record_exists === true
  );
}

function normalizeEvidenceStatus(item) {
  if (isEvidenceCompliant(item)) return "COMPLIANT";
  if (hasSourceRecord(item)) return "MISSING EVIDENCE";
  return normalizeStatus(item?.status || "MISSING");
}

function isEvidenceCompliant(item) {
  const status = String(item?.status || "").toUpperCase();
  if (["EXPIRED", "MISSING", "MISSING_EVIDENCE", "DEFICIENT", "NON_COMPLIANT", "OVERDUE"].includes(status)) {
    return false;
  }
  return isCompliant(status) && hasEvidence(item);
}

function isCompliant(status) {
  return ["COMPLIANT", "COMPLETE", "COMPLETED", "SIGNED", "VERIFIED", "FOUND", "ACTIVE"].includes(
    String(status || "").toUpperCase()
  );
}

function isMissing(status) {
  return ["MISSING", "MISSING_EVIDENCE", "OVERDUE", "EXPIRED", "DEFICIENT", "NON_COMPLIANT"].includes(
    String(status || "MISSING").toUpperCase()
  );
}

function normalizeStatus(status) {
  return String(status || "MISSING").replace(/_/g, " ").toUpperCase();
}

function getFixLocation(item = {}) {
  const text = `${item.key || ""} ${item.title || ""}`.toLowerCase();
  if (text.includes("cpr") || text.includes("first aid") || text.includes("fingerprint") || text.includes("license")) return "Credentials";
  if (text.includes("training") || text.includes("fall") || text.includes("medication") || text.includes("cultural") || text.includes("emergency") || text.includes("diabetes")) return "Training";
  if (text.includes("education") || text.includes("ce")) return "Continuing Education";
  if (text.includes("document") || text.includes("application") || text.includes("reference") || text.includes("id") || text.includes("citizen")) return "Documents";
  return "Staff Detail";
}


function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getStaffComplianceSaveEndpoint(item = {}) {
  const text = `${item.key || ""} ${item.title || ""}`.toLowerCase();

  if (text.includes("fingerprint")) return "/staff-compliance/fingerprint-clearance";
  if (text.includes("tb")) return "/staff-compliance/tb-screenings";
  if (text.includes("cpr") || text.includes("first aid") || text.includes("certification")) return "/staff-compliance/certifications";
  if (text.includes("background") || text.includes("application") || text.includes("reference")) return "/staff-compliance/background-checks";
  if (text.includes("driver") || text.includes("vehicle")) return "/staff-compliance/driver-records";
  if (text.includes("continuing") || text.includes("ce ")) return "/staff-compliance/continuing-education";
  if (
    text.includes("competency") ||
    text.includes("assessment") ||
    text.includes("treatment plan") ||
    text.includes("discharge") ||
    text.includes("progress note") ||
    text.includes("bhp") ||
    text.includes("id") ||
    text.includes("citizen")
  ) return "/staff-compliance/competencies";

  return "/staff-compliance/training-records";
}

function getStaffComplianceRecordGroup(item = {}) {
  if (item.record_group) return item.record_group;
  const endpoint = getStaffComplianceSaveEndpoint(item);
  return endpoint.split("/staff-compliance/")[1] || "training-records";
}

function buildStaffCompliancePayload(item, staffId, form) {
  const endpoint = getStaffComplianceSaveEndpoint(item);
  const base = {
    staff_id: staffId,
    status: "COMPLETED",
    completion_date: form.completed_date || todayInputValue(),
    expiration_date: form.expiration_date || null,
    notes: form.notes || "",
    evidence_filename: form.evidence_filename || null,
    evidence_url: form.evidence_url || null,
  };

  if (endpoint.includes("certifications")) {
    return {
      ...base,
      certification_name: item.title,
      certification_type: item.key || item.title,
      issue_date: form.completed_date || todayInputValue(),
    };
  }

  if (endpoint.includes("background-checks")) {
    return {
      ...base,
      check_type: item.key || item.title,
      check_date: form.completed_date || todayInputValue(),
      result: "PASS",
    };
  }

  if (endpoint.includes("fingerprint-clearance")) {
    return {
      ...base,
      clearance_date: form.completed_date || todayInputValue(),
      expiration_date: form.expiration_date || null,
      clearance_status: "CLEARED",
    };
  }

  if (endpoint.includes("tb-screenings")) {
    return {
      ...base,
      screening_date: form.completed_date || todayInputValue(),
      result: "NEGATIVE",
    };
  }

  if (endpoint.includes("driver-records")) {
    return {
      ...base,
      license_expiration_date: form.expiration_date || null,
      review_date: form.completed_date || todayInputValue(),
      record_status: "ACTIVE",
    };
  }

  if (endpoint.includes("continuing-education")) {
    return {
      ...base,
      course_name: item.title,
      provider: "Internal",
      category: item.section || item.category || "Compliance",
      hours_earned: 1,
      completion_date: form.completed_date || todayInputValue(),
    };
  }

  if (endpoint.includes("competencies")) {
    return {
      ...base,
      competency_name: item.title,
      competency_type: item.key || item.title,
      review_date: form.completed_date || todayInputValue(),
      result: "COMPETENT",
    };
  }

  return {
    ...base,
    training_name: item.title,
    training_category: item.section || item.category || "Compliance",
    training_date: form.completed_date || todayInputValue(),
  };
}


function buildEvidenceOverride(item, payload, savedRecord = {}, recordGroup = null) {
  const savedRecordId = savedRecord.id || savedRecord.record_id || item?.record_id || item?.source_record_id || null;
  const resolvedRecordGroup = recordGroup || savedRecord.record_group || item?.record_group || getStaffComplianceRecordGroup(item);

  const evidenceUrl =
    savedRecord.evidence_url ||
    savedRecord.document_url ||
    savedRecord.file_url ||
    payload.evidence_url ||
    (savedRecordId && resolvedRecordGroup
      ? `/staff-compliance/${resolvedRecordGroup}/${savedRecordId}/evidence/view`
      : "");

  const evidenceFilename =
    savedRecord.evidence_filename ||
    savedRecord.document_filename ||
    savedRecord.file_name ||
    payload.evidence_filename ||
    evidenceLabel(item) ||
    "";

  return {
    status: "COMPLIANT",
    has_evidence: true,
    evidence_url: evidenceUrl,
    evidence_filename: evidenceFilename,
    document_id: savedRecord.document_id || payload.document_id || item?.document_id || null,
    certificate_document_id:
      savedRecord.certificate_document_id ||
      payload.certificate_document_id ||
      item?.certificate_document_id ||
      null,
    record_id: savedRecordId,
    record_group: resolvedRecordGroup,
    completed_date:
      savedRecord.completed_date ||
      savedRecord.completion_date ||
      savedRecord.training_date ||
      savedRecord.check_date ||
      savedRecord.clearance_date ||
      savedRecord.screening_date ||
      savedRecord.review_date ||
      payload.completed_date ||
      payload.completion_date ||
      payload.training_date ||
      payload.check_date ||
      payload.clearance_date ||
      payload.screening_date ||
      payload.review_date ||
      todayInputValue(),
    expiration_date:
      savedRecord.expiration_date ||
      savedRecord.license_expiration_date ||
      payload.expiration_date ||
      payload.license_expiration_date ||
      item?.expiration_date ||
      null,
    evidence_status: "EVIDENCE_ATTACHED",
  };
}

function patchChecklistWithEvidence(checklist, item, override) {
  if (!checklist) return checklist;

  const itemKey = item?.key || item?.title;

  const patchItem = (row) => {
    const rowKey = row?.key || row?.title;
    if (rowKey !== itemKey) return row;

    return {
      ...row,
      ...override,
      status: "COMPLIANT",
      has_evidence: true,
    };
  };

  const patchedItems = Array.isArray(checklist.items)
    ? checklist.items.map(patchItem)
    : checklist.items;

  const patchedSections = Array.isArray(checklist.sections)
    ? checklist.sections.map((section) => ({
        ...section,
        items: Array.isArray(section.items) ? section.items.map(patchItem) : section.items,
      }))
    : checklist.sections;

  return {
    ...checklist,
    items: patchedItems,
    sections: patchedSections,
  };
}

function applyStaffEvidenceOverrides(items, overrides = {}) {
  return (items || []).map((item) => {
    const key = item?.key || item?.title;
    const override = overrides[key];

    if (!override) return item;

    return {
      ...item,
      ...override,
      status: "COMPLIANT",
      has_evidence: true,
    };
  });
}

function staffEvidenceOverrideKey(staffId) {
  return `staff-compliance-evidence-overrides:${staffId || "unknown"}`;
}

function loadStaffEvidenceOverrides(staffId) {
  try {
    return JSON.parse(window.localStorage.getItem(staffEvidenceOverrideKey(staffId)) || "{}");
  } catch {
    return {};
  }
}

function saveStaffEvidenceOverrides(staffId, overrides) {
  try {
    window.localStorage.setItem(staffEvidenceOverrideKey(staffId), JSON.stringify(overrides || {}));
  } catch {
    // localStorage can fail in private/incognito mode. The backend save still succeeds.
  }
}


function getApiErrorMessage(err) {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
  if (typeof detail === "string") return detail;
  if (detail) return JSON.stringify(detail);
  return err?.message || "";
}
