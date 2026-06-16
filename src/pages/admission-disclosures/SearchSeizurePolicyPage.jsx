import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

export default function SearchSeizurePolicyPage({
  resident = {},
  facility = {},
  signatures = {},
  onSignatureChange,
}) {
  const residentSigRef = useRef(null);
  const guardianSigRef = useRef(null);
  const staffSigRef = useRef(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const facilityName = facility.name || "Facility Name";

  const residentName =
    signatures.resident_name ||
    `${resident.first_name || ""} ${resident.last_name || ""}`.trim();

  function updateField(key, value) {
    onSignatureChange?.(key, value);
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
          <p className="dashboard-eyebrow">Admission Disclosure</p>
          <h1>Search & Seizure Policy</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>Search & Seizure Policy</h2>

        <h3>I. Purpose</h3>
        <p>
          To identify prohibited items (contraband) and to provide staff with
          guidelines for conducting searches of residents and their living areas
          to prevent the entry of prohibited items into the facility and
          therapeutic environment.
        </p>

        <h3>II. Policy</h3>
        <ol className="document-numbered-list">
          <li>
            {facilityName} recognizes that residents have a right to privacy,
            dignity, and to be free from unreasonable searches. Residents, staff,
            and visitors also have the right to a safe environment which under
            certain circumstances necessitates taking steps to ensure residents
            are not in possession of items that may present a hazard to personal
            safety or the therapeutic environment.
          </li>
          <li>
            When it is necessary to conduct a search, it will be carried out in a
            professional and courteous manner recognizing the intrusion to
            personal privacy that occurs.
          </li>
          <li>
            Persons visiting residents will not be searched by staff but may be
            asked to allow staff to inspect items brought into the facility.
          </li>
        </ol>

        <h3>Definition</h3>
        <p>
          Contraband is a term used to describe prohibited or unauthorized items.
          Certain items are clearly considered contraband in the facility. These
          include weapons, illegal or unauthorized drugs, intoxicants, alcohol,
          flammable items, tobacco and tobacco products, smoking paraphernalia
          and items with a sharp edge. Other items may be considered contraband
          if staff believes the item may be used by a resident to harm themselves
          or someone else.
        </p>

        <h3>III. Procedure</h3>
        <ol className="document-numbered-list">
          <li>
            If there is imminent threat to personal safety or reasonable
            suspicion that a resident possesses contraband which could be used to
            harm themselves or someone else, the search may be carried out by
            staff members. At least two staff members must be present when
            conducting searches of residents or their living areas.
          </li>
          <li>
            Whenever possible, resident room searches will be conducted with the
            room’s occupants present. A search may also be conducted without the
            resident present if staff has reasonable cause to believe a dangerous
            item may be hidden in the room.
          </li>
          <li>
            Common areas such as living room, family room bathroom, activity
            yards, and group rooms may be searched without restriction.
          </li>
          <li>
            Resident searches will be conducted in a location which offers
            reasonable privacy. Two staff members must be present when searching
            a resident.
          </li>
          <li>Missing or stolen items will be returned to the rightful owner.</li>
          <li>
            Documentation that search procedures have been conducted will be
            entered into the progress notes. If contraband is found, an Incident
            Report must be completed and forwarded to the administrator.
          </li>
        </ol>

        <p>
          Your signature below indicates that you have read, understand and have
          received a copy of the facility Search and Seizure Policy document.
        </p>

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
          nameLabel="Resident Agent / Guardian Name"
          nameValue={signatures.guardian_name || resident.guardian_name || ""}
          onNameChange={(v) => updateField("guardian_name", v)}
          signatureLabel="Resident Agent / Guardian Signature"
          savedSignature={signatures.guardian}
          sigRef={guardianSigRef}
          onSave={() => saveSignature("guardian", guardianSigRef)}
          onClear={() => clearSignature("guardian", guardianSigRef)}
          dateValue={signatures.guardian_date || today}
          onDateChange={(v) => updateField("guardian_date", v)}
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
        <input value={nameValue || ""} onChange={(e) => onNameChange(e.target.value)} />
        <label>{nameLabel}</label>
      </div>

      <div className="document-signature-pad-field">
        <div className="document-signature-pad">
          {savedSignature ? (
            <img src={savedSignature} alt={signatureLabel} />
          ) : (
            <SignatureCanvas ref={sigRef} penColor="#0f172a" canvasProps={{ className: "document-signature-canvas" }} />
          )}
        </div>
        <label>{signatureLabel}</label>
        <div className="signature-tools">
          <button type="button" onClick={onSave}>Save Signature</button>
          <button type="button" onClick={onClear}><Eraser size={14} /> Clear</button>
        </div>
      </div>

      <div className="document-field">
        <input type="date" value={dateValue || ""} onChange={(e) => onDateChange(e.target.value)} />
        <label>Date</label>
      </div>
    </div>
  );
}