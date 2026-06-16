import { useMemo, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, FileSignature } from "lucide-react";

const ruleGroups = [
  {
    title: "Visitors & Passes",
    rules: [
      "Clients are not allowed to receive visitors during the first thirty (30) days of treatment. Upon completion of thirty (30) days in residence, Clients will be allowed to receive visitors based on Client’s compliance with their treatment goals.",
      "All residents must live at the Home for thirty (30) days before they can become eligible for Pass. Clients will be allowed Pass based on Client’s compliance with their treatment goals. This time period may be waived by the Program Manager for emergencies and special circumstances. One (1) pass per month may be approved. Passes must be filled out by Wed at noon a week before the week of Pass request.",
      "All visitors are subject to the approval by the Program Manager. No visitors are permitted on the property while under the influence of alcohol or drugs. No visitors will be permitted upstairs or allowed during group sessions or scheduled meetings. Facility visitation hours are from 9am-6pm Saturday & Sunday.",
    ],
  },
  {
    title: "Money, ID, Sign-Out & Communication",
    rules: [
      "Upon admission into our facility the resident must hand over to staff all moneys, bank cards, ID/DL to staff for safe keeping.",
      "Clients will sign out each time they leave the residence and sign in each time they return with a staff member. If on a day Pass client must have permission from Program Manager and return time not to exceed 7pm at night.",
      "Clients should not answer doorbells except when staff member asked them to do so.",
      "Clients should not answer house phone except when staff member asked them to do so.",
      "Clients must ask to use house phone, begins at 8am and ends at 7pm daily. Calls are limited 5 to 15 minutes each time.",
      "Clients are allowed to check out facility complimentary computer for email, telemedicine, etc. for 30 minutes.",
      "Clients will turn in all personal electronic devices such as cell phones, iPad, computers and tablets to staff by 9:00pm daily and will be returned by 9am the next day.",
    ],
  },
  {
    title: "Smoking, Schedule & Hygiene",
    rules: [
      "No smoking or chewing/spitting tobacco inside the facility. Tobacco use is allowed only in the designated area and during approved smoke break hours.",
      "When you go in and out of any entrance or exit door please close the door behind you.",
      "Clients must get up in the morning by 6am and go to bed by 10pm Monday through Thursday and Sunday, 10:30pm on Friday and 11pm on Saturday.",
      "Clients are expected to maintain good hygiene and personal cleanliness. Clients must shower daily.",
      "Clients must complete assigned daily chores. Chores will be rotated by House Manager.",
    ],
  },
  {
    title: "Rooms, Food, Laundry & Cleanliness",
    rules: [
      "No food or drinks in bedrooms, living room areas, or restrooms.",
      "Bedroom doors should always remain open unless changing.",
      "Clients are to make their beds and keep bedrooms and bathrooms clean and tidy at all times.",
      "Dirty linens must be placed inside the dirty linen hamper and the hamper must remain closed.",
      "Clients are not allowed inside the house refrigerator. Please ask staff if you need something from the refrigerator or pantry. Kitchen closes at 8pm.",
      "Personal shopping is limited to once a week on Saturdays. Clients must have personal funds and provide shopping list to Program Manager.",
      "Clients are not allowed to borrow from or lend money to other residents or staff.",
      "Laundry starts at 6pm per laundry schedule. Laundry must be done according to schedule only.",
      "Saturday is House Super Chores day. All clients are expected to participate in assigned deep cleaning chores.",
      "Shared television must be viewable by all residents and turned off at bedtime or when no one is watching.",
      "Clients are not allowed to sleep on the couch.",
      "Clients are responsible for washing dishes using hot, soapy water and air drying them.",
      "All clients are responsible for disposing trash in trash bins.",
    ],
  },
  {
    title: "Safety, Conduct & Boundaries",
    rules: [
      "Radio in facility vehicles shall be operated by driver only.",
      "Clients are not allowed in other resident’s bedrooms.",
      "This is a drug and alcohol-free facility. No drug/alcohol in the facility.",
      "No bullying, physical aggression, or threats toward staff or residents will be tolerated.",
      "All clients must wear appropriate clothing. Clothing that exposes body parts is forbidden.",
      "Destruction of facility property will not be tolerated.",
      "Spreading rumors or falsified information about residents or staff will not be tolerated.",
      "Clients are not to touch or steal other client’s personal belongings.",
      "Medicines prescribed by a doctor or psychiatrist should be taken at designated times.",
      "If a problem arises with anyone in the house, report immediately to the Program Manager or staff.",
      "Clients must respect staff and other residents. No name calling, swearing, yelling, cursing, hitting, spitting, or rudeness.",
      "When listening to music, headphones should be worn or volume kept low.",
      "No client can go outside after 8:00pm.",
      "No touching or hugging anyone without permission.",
      "Clients are not allowed to have romantic relationships while in the facility. Sexual behavior is a violation of house rules and may lead to immediate discharge.",
      "When discharged, all personal effects must be removed immediately. Items left behind may be held for 10 days and then donated.",
    ],
  },
];

export default function HouseRulesPage({
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
          <h1>House Rules & Behavior Expectations</h1>
          <p>{facilityName}</p>
        </div>
        <FileSignature size={34} />
      </div>

      <div className="disclosure-document-body">
        <h2>House Rules & Behavior Expectations</h2>

        <p>
          The following house rules and behavior expectations apply during
          residency at {facilityName}. Resident, guardian, and staff should
          review each section before signing.
        </p>

        <div className="house-rules-wrapper">
          {ruleGroups.map((group, groupIndex) => (
            <section className="house-rule-section" key={group.title}>
              <h3>
                {groupIndex + 1}. {group.title}
              </h3>

              <ol className="document-numbered-list">
                {group.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <p>
          My signature below indicates that I have read, understand, and agree
          to follow the House Rules & Behavior Expectations.
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
          <button type="button" onClick={onSave}>
            Save Signature
          </button>
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