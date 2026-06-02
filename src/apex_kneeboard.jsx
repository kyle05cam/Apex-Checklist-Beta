// ─────────────────────────────────────────────────────────────────────────────
// APEX AVIATION KNEEBOARD — Hangar, Fleet Management & Root App
// Imports ChecklistApp from cessna172s_checklist.jsx
// To add a new aircraft: create a new checklist file and add its import here.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { ChecklistApp } from "./cessna172s_checklist.jsx";
import { AIRPORT_DB } from "./nearest_freqs_data.js";
import { parsePoh } from "./pohParser.js";
import { saveProfile as dbSaveProfile, loadProfile as dbLoadProfile } from "./pohDb.js";
import { ChecklistScanner } from "./checklistScanner.jsx";

const DEFAULT_PROFILE = {
  id: "n12345",
  tail: "N12345",
  type: "Cessna 172S Skyhawk",
  year: "2019",
  engine: "Lycoming IO-360-L2A · 180 HP",
  avionics: "Garmin G1000 NXi",
  status: "AIRWORTHY",
  pohRef: "REV 2022-05",
  color: "#e8c84a",
  accentColor: "#4a9fe8",
  // Airworthiness inspection dates (ISO YYYY-MM-DD for easy comparison)
  dateAnnual:       "",   // Annual Inspection
  datePitotStatic:  "",   // Pitot-Static 91.411
  dateTransponder:  "",   // Transponder 91.413
  dateEltBattery:   "",   // ELT Battery
  dateEltInspect:   "",   // ELT Inspection
  // Pilot profile
  pilotName: "",
  certNumber: "",
  certType: "Private Pilot",
  // Home airport
  homeAirport: "",
  homeIcao: "",
  atisFrq: "",
  ctafFrq: "",
  towerFrq: "",
  groundFrq: "",
  fieldElev: "",
  runways: "",
  // POH upload metadata
  pohFileName:   "",      // original filename
  pohUploadedAt: "",      // ISO date string
  pohSource:     "DEFAULT",  // "DEFAULT" | "UPLOADED"
  // Extracted POH data (null = use aircraft type defaults)
  pohVSpeeds:    null,    // { vso, vs1, vr, vx, vy, va, vfe, vno, vne, vapp }
  pohWeights:    null,    // { maxGross, maxRamp, emptyWeight, usefulLoad, maxBaggage, cgFwd, cgAft }
  pohFuel:       null,    // { totalGal, usableGal, type, oilType, oilCapMax, oilCapMin }
  pohEngine:     null,    // { model, horsepower, cylinders, displacement, tbo, maxRpm, oilPressMin, oilPressMax, oilTempMax, chtMax }
  pohLimits:     null,    // { maxCrosswind }
  pohTakeoff:    null,    // { gndRoll: [[alt,ft]…], over50ft: [[alt,ft]…] }
  pohLanding:    null,    // { gndRoll: [[alt,ft]…], over50ft: [[alt,ft]…] }
  pohMaxXwind:   null,    // max demonstrated crosswind kt (shortcut from pohLimits)
  // Scanned checklist — array of { phase: {id, label}, sections: [{title, items}] }
  scannedChecklist: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// AIRCRAFT EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────
// ── POH Section — upload, parse, review ──────────────────────────────────────
function PohSection({ draft, onSet, setMultiple }) {
  const [parseState, setParseState] = useState("idle"); // idle | parsing | done | error | scanned
  const [extracted,  setExtracted]  = useState(null);
  const [confirmed,  setConfirmed]  = useState(false);

  const hasUploaded = !!draft.pohFileName;
  const isDefault   = draft.pohSource === "DEFAULT" || !draft.pohSource;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return;
    setParseState("parsing");
    setExtracted(null);
    setConfirmed(false);

    file.arrayBuffer().then((buffer) => {
      parsePoh(buffer).then((result) => {
        if (result.scanned) {
          setMultiple({ pohFileName: file.name, pohUploadedAt: new Date().toISOString(), pohSource: "UPLOADED" });
          setParseState("scanned");
          return;
        }
        setExtracted(result);
        setMultiple({ pohFileName: file.name, pohUploadedAt: new Date().toISOString(), pohSource: "UPLOADED" });
        setParseState("done");
      }).catch(() => setParseState("error"));
    }).catch(() => setParseState("error"));
  };

  const applyExtracted = () => {
    if (!extracted) return;
    const updates = {};
    if (extracted.vSpeeds)             updates.pohVSpeeds  = extracted.vSpeeds;
    if (extracted.weights)             updates.pohWeights  = extracted.weights;
    if (extracted.fuel)                updates.pohFuel     = extracted.fuel;
    if (extracted.engine)              updates.pohEngine   = extracted.engine;
    if (extracted.limits)              updates.pohLimits   = extracted.limits;
    if (extracted.takeoff)             updates.pohTakeoff  = extracted.takeoff;
    if (extracted.landing)             updates.pohLanding  = extracted.landing;
    if (extracted.maxXwind != null)    updates.pohMaxXwind = extracted.maxXwind;
    setMultiple(updates);
    setConfirmed(true);
  };

  const clearPoh = () => {
    setMultiple({
      pohFileName: "", pohUploadedAt: "", pohSource: "DEFAULT",
      pohVSpeeds: null, pohWeights: null, pohFuel: null,
      pohEngine: null, pohLimits: null, pohTakeoff: null, pohLanding: null,
      pohMaxXwind: null,
    });
    setParseState("idle");
    setExtracted(null);
    setConfirmed(false);
  };

  const mono = { fontFamily: "var(--f-mono)" };

  const Row = ({ label, value, unit = "" }) => value == null ? null : (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "1px solid var(--line-faint)" }}>
      <span style={{ ...mono, fontSize: 10, color: "var(--t-tertiary)", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: "var(--t-primary)" }}>
        {value}{unit && <span style={{ fontSize: 10, color: "var(--t-tertiary)", marginLeft: 4 }}>{unit}</span>}
      </span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 12, padding: "12px 14px", borderRadius: 6, background: "var(--bg-inset)", border: "1px solid var(--line)" }}>
      <div style={{ ...mono, fontSize: 9, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.14em", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );

  const nothingFound = extracted && !extracted.vSpeeds && !extracted.weights &&
    !extracted.fuel && !extracted.engine && !extracted.limits &&
    !extracted.takeoff && !extracted.landing && extracted.maxXwind == null;

  return (
    <div>
      {/* ── Source indicator ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
        padding: "10px 14px", borderRadius: 6,
        background: isDefault ? "var(--bg-inset)" : "var(--ok-bg)",
        border: `1px solid ${isDefault ? "var(--line)" : "var(--ok-line)"}` }}>
        <div>
          <div style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            color: isDefault ? "var(--t-tertiary)" : "var(--ok)" }}>
            {isDefault ? "USING BUILT-IN DEFAULTS" : "CUSTOM POH LOADED"}
          </div>
          <div style={{ ...mono, fontSize: 11, color: "var(--t-secondary)", marginTop: 3 }}>
            {isDefault
              ? `${draft.type || "Aircraft"} · Factory default performance data`
              : `${draft.pohFileName} · ${draft.pohUploadedAt ? new Date(draft.pohUploadedAt).toLocaleDateString() : ""}`}
          </div>
        </div>
        {hasUploaded && (
          <button onClick={clearPoh} style={{ ...mono, fontSize: 10, color: "var(--warn)", background: "transparent", border: "1px solid var(--warn-line)", borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}>
            Remove
          </button>
        )}
      </div>

      {/* ── Upload area ── */}
      <label style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 10, padding: "28px 20px", borderRadius: 8, cursor: "pointer",
        border: "2px dashed var(--line-strong)", background: "var(--bg-inset)",
        transition: "all 0.15s", marginBottom: 16,
      }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile({ target: { files: [f] } }); }}
      >
        <input type="file" accept="application/pdf" onChange={handleFile} style={{ display: "none" }} />
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/>
        </svg>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...mono, fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em" }}>
            {parseState === "parsing" ? "READING PDF…" : hasUploaded ? "REPLACE POH PDF" : "CLICK OR DROP POH PDF"}
          </div>
          <div style={{ ...mono, fontSize: 10, color: "var(--t-tertiary)", marginTop: 4, letterSpacing: "0.06em" }}>
            Digital PDF only · Scanned images have limited extraction
          </div>
        </div>
      </label>

      {/* ── Parse result ── */}
      {parseState === "error" && (
        <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--warn-bg)", border: "1px solid var(--warn-line)", ...mono, fontSize: 11, color: "var(--warn)" }}>
          ⚠ Could not read the file. Make sure it is a valid PDF.
        </div>
      )}

      {parseState === "scanned" && (
        <div style={{ padding: "12px 14px", borderRadius: 6, background: "var(--caution-bg)", border: "1px solid var(--caution-line)" }}>
          <div style={{ ...mono, fontSize: 10, fontWeight: 700, color: "var(--caution)", letterSpacing: "0.1em", marginBottom: 4 }}>SCANNED PDF DETECTED</div>
          <div style={{ ...mono, fontSize: 11, color: "var(--t-secondary)", lineHeight: 1.6 }}>
            This appears to be a scanned image PDF — text extraction is not available. The file has been logged. Use the Aircraft and Airworthiness tabs to enter performance data manually.
          </div>
        </div>
      )}

      {parseState === "done" && extracted && !confirmed && (
        <div>
          <div style={{ ...mono, fontSize: 10, fontWeight: 700, color: "var(--ok)", letterSpacing: "0.12em", marginBottom: 10 }}>
            ✓ EXTRACTION COMPLETE — REVIEW BEFORE APPLYING
          </div>

          {extracted.vSpeeds && (
            <Section title="V-SPEEDS">
              <Row label="Vso — Stall, full flaps"      value={extracted.vSpeeds.vso}  unit="KT" />
              <Row label="Vs1 — Stall, clean"           value={extracted.vSpeeds.vs1}  unit="KT" />
              <Row label="Vr — Rotation"                value={extracted.vSpeeds.vr}   unit="KT" />
              <Row label="Vx — Best angle climb"        value={extracted.vSpeeds.vx}   unit="KT" />
              <Row label="Vy — Best rate climb"         value={extracted.vSpeeds.vy}   unit="KT" />
              <Row label="Vapp — Normal approach"       value={extracted.vSpeeds.vapp} unit="KT" />
              <Row label="Va — Maneuvering"             value={extracted.vSpeeds.va}   unit="KT" />
              <Row label="Vfe — Max flap extension"     value={extracted.vSpeeds.vfe}  unit="KT" />
              <Row label="Vno — Max structural cruise"  value={extracted.vSpeeds.vno}  unit="KT" />
              <Row label="Vne — Never exceed"           value={extracted.vSpeeds.vne}  unit="KT" />
            </Section>
          )}

          {extracted.weights && (
            <Section title="WEIGHT LIMITS">
              <Row label="Max gross weight"   value={extracted.weights.maxGross}    unit="LBS" />
              <Row label="Max ramp weight"    value={extracted.weights.maxRamp}     unit="LBS" />
              <Row label="Standard empty"     value={extracted.weights.emptyWeight} unit="LBS" />
              <Row label="Useful load"        value={extracted.weights.usefulLoad}  unit="LBS" />
              <Row label="Max baggage"        value={extracted.weights.maxBaggage}  unit="LBS" />
              <Row label="CG fwd limit"       value={extracted.weights.cgFwd}       unit="IN" />
              <Row label="CG aft limit"       value={extracted.weights.cgAft}       unit="IN" />
            </Section>
          )}

          {extracted.fuel && (
            <Section title="FUEL & OIL">
              <Row label="Total fuel capacity"  value={extracted.fuel.totalGal}   unit="GAL" />
              <Row label="Usable fuel"          value={extracted.fuel.usableGal}  unit="GAL" />
              <Row label="Fuel grade"           value={extracted.fuel.type} />
              <Row label="Oil type"             value={extracted.fuel.oilType} />
              <Row label="Oil capacity (max)"   value={extracted.fuel.oilCapMax}  unit="QT" />
              <Row label="Oil capacity (min)"   value={extracted.fuel.oilCapMin}  unit="QT" />
            </Section>
          )}

          {extracted.engine && (
            <Section title="ENGINE SPECIFICATIONS">
              <Row label="Engine model"         value={extracted.engine.model} />
              <Row label="Horsepower"           value={extracted.engine.horsepower}   unit="HP" />
              <Row label="Cylinders"            value={extracted.engine.cylinders} />
              <Row label="Displacement"         value={extracted.engine.displacement}  unit="CU IN" />
              <Row label="TBO"                  value={extracted.engine.tbo}           unit="HRS" />
              <Row label="Max RPM"              value={extracted.engine.maxRpm}        unit="RPM" />
              <Row label="Oil pressure (min)"   value={extracted.engine.oilPressMin}   unit="PSI" />
              <Row label="Oil pressure (max)"   value={extracted.engine.oilPressMax}   unit="PSI" />
              <Row label="Oil temp (max)"       value={extracted.engine.oilTempMax}    unit="°F" />
              <Row label="CHT (max)"            value={extracted.engine.chtMax}        unit="°F" />
            </Section>
          )}

          {(extracted.maxXwind != null) && (
            <Section title="OPERATING LIMITS">
              <Row label="Max demonstrated crosswind" value={extracted.maxXwind} unit="KT" />
            </Section>
          )}

          {extracted.takeoff && (
            <Section title="TAKEOFF PERFORMANCE (extracted)">
              {extracted.takeoff.gndRoll.map(([alt, ft]) => (
                <Row key={`to-gr-${alt}`} label={`Ground roll @ ${alt === 0 ? "sea level" : `${alt.toLocaleString()} ft`}`} value={ft} unit="FT" />
              ))}
              {extracted.takeoff.over50ft?.map(([alt, ft]) => (
                <Row key={`to-50-${alt}`} label={`Over 50ft @ ${alt === 0 ? "sea level" : `${alt.toLocaleString()} ft`}`} value={ft} unit="FT" />
              ))}
            </Section>
          )}

          {extracted.landing && (
            <Section title="LANDING PERFORMANCE (extracted)">
              {extracted.landing.gndRoll.map(([alt, ft]) => (
                <Row key={`ld-gr-${alt}`} label={`Ground roll @ ${alt === 0 ? "sea level" : `${alt.toLocaleString()} ft`}`} value={ft} unit="FT" />
              ))}
              {extracted.landing.over50ft?.map(([alt, ft]) => (
                <Row key={`ld-50-${alt}`} label={`Over 50ft @ ${alt === 0 ? "sea level" : `${alt.toLocaleString()} ft`}`} value={ft} unit="FT" />
              ))}
            </Section>
          )}

          {nothingFound && (
            <div style={{ padding: "12px 14px", borderRadius: 6, background: "var(--caution-bg)", border: "1px solid var(--caution-line)", ...mono, fontSize: 11, color: "var(--caution)", lineHeight: 1.6 }}>
              ⚠ Could not automatically identify performance data in this PDF. The file may use non-standard formatting. Please enter values manually in the Aircraft tab.
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={() => { setParseState("idle"); setExtracted(null); }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 6, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", ...mono, fontSize: 11, color: "var(--t-secondary)" }}>
              Discard
            </button>
            <button onClick={applyExtracted}
              style={{ flex: 2, padding: "10px 0", borderRadius: 6, border: "1px solid var(--ok-line)", background: "var(--ok-bg)", cursor: "pointer", ...mono, fontSize: 11, fontWeight: 700, color: "var(--ok)", letterSpacing: "0.08em" }}>
              ✓ Apply to Profile
            </button>
          </div>
        </div>
      )}

      {(parseState === "done" && confirmed) && (
        <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--ok-bg)", border: "1px solid var(--ok-line)", ...mono, fontSize: 11, color: "var(--ok)" }}>
          ✓ POH data applied. Save the profile to persist.
        </div>
      )}

      {/* ── What gets used where ── */}
      <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 6, background: "var(--bg-inset)", border: "1px solid var(--line)" }}>
        <div style={{ ...mono, fontSize: 9, fontWeight: 700, color: "var(--t-tertiary)", letterSpacing: "0.14em", marginBottom: 8 }}>WHERE EXTRACTED DATA APPEARS</div>
        {[
          ["V-speeds (Vso–Vne)",   "V-speeds tab · takeoff & approach performance banners"],
          ["Vapp",                 "Approach banner threshold speed indicator"],
          ["Vr",                   "Takeoff banner rotation speed cue"],
          ["Crosswind limit",      "Performance banner crosswind fill-bar (red at 100%)"],
          ["Max gross weight",     "Aircraft info — Weight & CG Limits section"],
          ["Max ramp weight",      "Aircraft info — Weight & CG Limits section"],
          ["Empty weight",         "Aircraft info — Weight & CG Limits section"],
          ["Useful load",          "Aircraft info — Weight & CG Limits & Operating Limits"],
          ["Max baggage",          "Aircraft info — Weight & CG Limits section"],
          ["CG range (fwd/aft)",   "Aircraft info — Weight & CG Limits section"],
          ["Fuel type & capacity", "Aircraft info — Fuel & Oil Quick Ref section"],
          ["Oil type & capacity",  "Aircraft info — Fuel & Oil Quick Ref section"],
          ["Engine model & HP",    "Aircraft info — Engine Specifications section"],
          ["TBO",                  "Aircraft info — Engine Specifications section"],
          ["Oil & CHT limits",     "Aircraft info — Engine Specifications section"],
          ["Takeoff distances",    "Density altitude banner — ground roll & 50ft obstacle"],
          ["Landing distances",    "Density altitude banner — ground roll & 50ft obstacle"],
          ["Vne / Vno / Vfe",      "Aircraft info — Operating Limits section"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 10, padding: "4px 0", borderBottom: "1px solid var(--line-faint)" }}>
            <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: "var(--accent)", minWidth: 140, flexShrink: 0 }}>{k}</span>
            <span style={{ ...mono, fontSize: 10, color: "var(--t-secondary)" }}>{v}</span>
          </div>
        ))}
        <div style={{ ...mono, fontSize: 9, color: "var(--t-quiet)", marginTop: 8, lineHeight: 1.5 }}>
          Note: Cruise & climb performance tables vary widely between manufacturers and cannot be reliably extracted — those sections use built-in reference data.
        </div>
      </div>
    </div>
  );
}

// ── Airport search + auto-fill — module scope for stable identity ────────────
function AirportSearchField({ onFill }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);

  const handleChange = (val) => {
    setQuery(val);
    if (val.length < 2) { setResults([]); setOpen(false); return; }
    const q = val.toUpperCase();
    const hits = AIRPORT_DB.filter(a =>
      a.id.startsWith(q) || a.name.toUpperCase().includes(q)
    ).slice(0, 8);
    setResults(hits);
    setOpen(hits.length > 0);
  };

  const pick = (ap) => {
    const freq = (type) => ap.freqs.find(f => f.type === type)?.freq ?? "";
    onFill({
      homeAirport: ap.name,
      homeIcao:    ap.id,
      fieldElev:   ap.elev ? `${ap.elev} MSL` : "",
      atisFrq:     freq("ATIS") || freq("AWOS") || freq("ASOS"),
      towerFrq:    freq("TWR"),
      groundFrq:   freq("GND"),
      ctafFrq:     freq("CTAF") || freq("UNIC") || freq("TWR"),
    });
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <div className="hangar-field">
        <span className="hangar-field-label">Search Airport</span>
        <input
          className="hangar-input"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          placeholder="Type ICAO or name — e.g. KIWA or Mesa Gateway"
          autoComplete="off"
        />
        <span className="hangar-field-hint">Selects airport and auto-fills all fields below</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 60,
          background: "var(--bg-1)", border: "1px solid var(--accent-line)",
          borderRadius: "var(--r-md)", overflow: "hidden",
          boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
        }}>
          {results.map((ap, i) => (
            <button
              key={ap.id}
              onMouseDown={() => pick(ap)}
              style={{
                display: "flex", width: "100%", alignItems: "center", gap: 12,
                padding: "10px 14px", background: "transparent", border: "none",
                borderBottom: i < results.length - 1 ? "1px solid var(--line-faint)" : "none",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 13, fontWeight: 700, color: "var(--accent)", minWidth: 48, flexShrink: 0 }}>{ap.id}</span>
              <span style={{ fontFamily: "var(--f-ui)", fontSize: 12, color: "var(--t-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ap.name}</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--t-tertiary)", flexShrink: 0 }}>{ap.elev ? `${ap.elev} MSL` : ""}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stable field helpers — defined at module scope so their identity never
//    changes between renders. Inline definitions inside a component create a new
//    function reference every render, causing React to unmount/remount the input
//    and instantly stealing focus from the user.
function HangarField({ label, fieldKey, placeholder, hint, draft, onSet }) {
  return (
    <div className="hangar-field">
      <span className="hangar-field-label">{label}</span>
      <input
        className="hangar-input"
        value={draft[fieldKey] || ""}
        onChange={e => onSet(fieldKey, e.target.value)}
        placeholder={placeholder || ""}
      />
      {hint && <span className="hangar-field-hint">{hint}</span>}
    </div>
  );
}

function HangarSelectField({ label, fieldKey, options, draft, onSet }) {
  return (
    <div className="hangar-field">
      <span className="hangar-field-label">{label}</span>
      <select
        className="hangar-select"
        value={draft[fieldKey] || ""}
        onChange={e => onSet(fieldKey, e.target.value)}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function AircraftEditModal({ profile, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...profile });
  const [activeSection, setActiveSection] = useState("aircraft");

  const set      = (key, val) => setDraft(p => ({ ...p, [key]: val }));
  const setMultiple = (fields)  => setDraft(p => ({ ...p, ...fields }));

  const SECTIONS = [
    { id: "aircraft",      label: "AIRCRAFT",       icon: "✈" },
    { id: "airworthiness", label: "AIRWORTHINESS",  icon: "🔧" },
    { id: "pilot",         label: "PILOT",          icon: "👤" },
    { id: "airport",       label: "HOME AIRPORT",   icon: "🏢" },
    { id: "poh",           label: "POH",            icon: "📄" },
  ];

  // Helper: classify a date string as "EXPIRED" | "DUE SOON" | "VALID" | "NONE"
  const getDateStatus = (iso) => {
    if (!iso) return "NONE";
    const expiry = new Date(iso);
    const now = new Date();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return "EXPIRED";
    if (daysLeft <= 30) return "DUE SOON";
    return "VALID";
  };

  const STATUS_STYLE = {
    EXPIRED:    { color: "var(--warn)",    bg: "var(--warn-bg)",    border: "var(--warn-line)" },
    "DUE SOON": { color: "var(--caution)", bg: "var(--caution-bg)", border: "var(--caution-line)" },
    VALID:      { color: "var(--ok)",      bg: "var(--ok-bg)",      border: "var(--ok-line)" },
    NONE:       { color: "var(--t-quiet)", bg: "transparent",       border: "var(--line)" },
  };

  const INSPECTIONS = [
    { label: "Annual Inspection",   ref: "14 CFR 91.409", fieldKey: "dateAnnual",      ifrOnly: false },
    { label: "Pitot-Static System", ref: "14 CFR 91.411", fieldKey: "datePitotStatic", ifrOnly: true  }, // IFR flight only
    { label: "Transponder",         ref: "14 CFR 91.413", fieldKey: "dateTransponder", ifrOnly: false },
    { label: "ELT Battery",         ref: "14 CFR 91.207", fieldKey: "dateEltBattery",  ifrOnly: false },
    { label: "ELT Inspection",      ref: "14 CFR 91.207", fieldKey: "dateEltInspect",  ifrOnly: false },
  ];

  const SectionContent = () => {
    if (activeSection === "aircraft") return (
      <div>
        <HangarField label="Tail Number" fieldKey="tail" placeholder="N12345" hint="FAA registration number" draft={draft} onSet={set} />
        <HangarField label="Aircraft Type" fieldKey="type" placeholder="Cessna 172S Skyhawk" draft={draft} onSet={set} />
        <HangarField label="Year" fieldKey="year" placeholder="2019" draft={draft} onSet={set} />
        <HangarField label="Engine" fieldKey="engine" placeholder="Lycoming IO-360-L2A · 180 HP" draft={draft} onSet={set} />
        <HangarField label="Avionics" fieldKey="avionics" placeholder="Garmin G1000 NXi" draft={draft} onSet={set} />
        <HangarField label="POH Reference" fieldKey="pohRef" placeholder="REV 2022-05" hint="Shown in status bar" draft={draft} onSet={set} />
        <div className="hangar-field">
          <span className="hangar-field-label">Airworthiness Status</span>
          <div style={{ display: "flex", gap: 8 }}>
            {["AIRWORTHY", "GROUNDED", "MAINTENANCE"].map(s => (
              <button key={s} onClick={() => set("status", s)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 5, cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: 9, fontWeight: 700, letterSpacing: 1,
                border: `1px solid ${draft.status === s ? (s === "AIRWORTHY" ? "var(--ok-line)" : "var(--warn-line)") : "var(--line)"}`,
                background: draft.status === s ? (s === "AIRWORTHY" ? "var(--ok-bg)" : "var(--warn-bg)") : "transparent",
                color: draft.status === s ? (s === "AIRWORTHY" ? "var(--ok)" : "var(--warn)") : "var(--t-tertiary)",
                transition: "all 0.15s",
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    );

    if (activeSection === "airworthiness") {
      const vfrExpired = INSPECTIONS.filter(i => !i.ifrOnly).some(i => getDateStatus(draft[i.fieldKey]) === "EXPIRED");
      const ifrExpired = INSPECTIONS.filter(i =>  i.ifrOnly).some(i => getDateStatus(draft[i.fieldKey]) === "EXPIRED");
      return (
        <div>
          {/* VFR-limiting expired → GROUNDED */}
          {vfrExpired && (
            <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 6, background: "var(--warn-bg)", border: "1px solid var(--warn-line)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>⚠</span>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, fontWeight: 700, color: "var(--warn)", letterSpacing: "0.12em" }}>Aircraft will be GROUNDED on save</div>
                <div style={{ fontFamily: "var(--f-ui)", fontSize: 12, color: "var(--t-secondary)", marginTop: 3 }}>Annual, transponder, or ELT expired — required for all flight.</div>
              </div>
            </div>
          )}
          {/* IFR-only expired → NOT IFR CURRENT (only if not already grounded) */}
          {!vfrExpired && ifrExpired && (
            <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 6, background: "var(--caution-bg)", border: "1px solid var(--caution-line)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>⚠</span>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, fontWeight: 700, color: "var(--caution)", letterSpacing: "0.12em" }}>Aircraft will be marked NOT IFR CURRENT on save</div>
                <div style={{ fontFamily: "var(--f-ui)", fontSize: 12, color: "var(--t-secondary)", marginTop: 3 }}>Pitot-static (91.411) is required for IFR flight only — VFR operations unaffected.</div>
              </div>
            </div>
          )}

          {/* Inspection rows */}
          {INSPECTIONS.map(insp => {
            const ds = getDateStatus(draft[insp.fieldKey]);
            const ss = STATUS_STYLE[ds];
            return (
              <div key={insp.fieldKey} style={{ marginBottom: 10, padding: "12px 14px", borderRadius: 7, background: "var(--bg-inset)", border: `1px solid ${ds === "NONE" ? "var(--line)" : ss.border}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--f-ui)", fontSize: 14, fontWeight: 600, color: "var(--t-primary)" }}>{insp.label}</span>
                      {insp.ifrOnly && (
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", padding: "2px 6px", borderRadius: 3, background: "var(--accent-bg)", border: "1px solid var(--accent-line)", color: "var(--accent)" }}>IFR ONLY</span>
                      )}
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--t-tertiary)", letterSpacing: "0.08em", marginTop: 2 }}>{insp.ref}</div>
                  </div>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", padding: "3px 10px", borderRadius: 3, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, flexShrink: 0 }}>
                    {ds === "NONE" ? "Not set" : ds}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--t-tertiary)", letterSpacing: "0.12em", flexShrink: 0 }}>Expiry date</div>
                  <input
                    type="date"
                    className="hangar-input"
                    value={draft[insp.fieldKey] || ""}
                    onChange={e => set(insp.fieldKey, e.target.value)}
                    style={{ flex: 1, padding: "6px 10px", fontFamily: "var(--f-mono)", fontSize: 12, colorScheme: "dark" }}
                  />
                  {draft[insp.fieldKey] && (
                    <button onClick={() => set(insp.fieldKey, "")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--t-tertiary)", fontSize: 16, padding: "0 4px", lineHeight: 1 }}>×</button>
                  )}
                </div>
              </div>
            );
          })}
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--t-quiet)", letterSpacing: "0.08em", marginTop: 8, lineHeight: 1.6 }}>
            ★ Annual / transponder / ELT expired → GROUNDED on save.<br/>
            ★ Pitot-static expired → NOT IFR CURRENT (VFR flight unaffected).
          </div>
        </div>
      );
    }

    if (activeSection === "pilot") return (
      <div>
        <HangarField label="Pilot Name" fieldKey="pilotName" placeholder="First Last" hint="Displayed in header" draft={draft} onSet={set} />
        <HangarField label="Certificate Number" fieldKey="certNumber" placeholder="123456789" draft={draft} onSet={set} />
        <HangarSelectField label="Certificate Type" fieldKey="certType" options={["Student Pilot","Sport Pilot","Recreational Pilot","Private Pilot","Commercial Pilot","ATP"]} draft={draft} onSet={set} />
      </div>
    );

    if (activeSection === "airport") return (
      <div>
        <AirportSearchField onFill={setMultiple} />
        {draft.homeAirport && (
          <div style={{ marginBottom: 14, padding: "8px 12px", borderRadius: 6, background: "var(--ok-bg)", border: "1px solid var(--ok-line)", fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ok)", letterSpacing: "0.06em" }}>
            ✓ {draft.homeIcao} · {draft.homeAirport}{draft.fieldElev ? ` · ${draft.fieldElev}` : ""}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <HangarField label="Airport Name" fieldKey="homeAirport" placeholder="Phoenix Deer Valley" draft={draft} onSet={set} />
          <HangarField label="ICAO Identifier" fieldKey="homeIcao" placeholder="KDVT" draft={draft} onSet={set} />
          <HangarField label="ATIS / AWOS" fieldKey="atisFrq" placeholder="127.25" draft={draft} onSet={set} />
          <HangarField label="CTAF / Unicom" fieldKey="ctafFrq" placeholder="122.80" draft={draft} onSet={set} />
          <HangarField label="Tower" fieldKey="towerFrq" placeholder="119.90" draft={draft} onSet={set} />
          <HangarField label="Ground" fieldKey="groundFrq" placeholder="121.80" draft={draft} onSet={set} />
          <HangarField label="Field Elevation" fieldKey="fieldElev" placeholder="1478 MSL" draft={draft} onSet={set} />
          <HangarField label="Runways" fieldKey="runways" placeholder="07L/25R · 07R/25L" draft={draft} onSet={set} />
        </div>
      </div>
    );

    if (activeSection === "poh") return (
      <PohSection draft={draft} onSet={set} setMultiple={setMultiple} />
    );

    return null;
  };

  return (
    <div className="hangar-modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ animation: "hangarFadeIn 0.2s ease" }}
    >
      {/* Modal panel */}
      <div className="hangar-modal-panel" style={{ animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)" }}>

        {/* Header */}
        <div className="hangar-modal-header">
          <div>
            <div className="hangar-modal-title">Aircraft Profile</div>
            <div className="hangar-modal-sub">{draft.tail} · Edit &amp; save to persist across sessions</div>
          </div>
          <button className="hangar-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Close
          </button>
        </div>

        {/* Section tabs */}
        <div className="hangar-modal-tabs">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`hangar-modal-tab${activeSection === s.id ? " active" : ""}`}
              onClick={() => setActiveSection(s.id)}
            >
              <div style={{ fontSize: 14, marginBottom: 3 }}>{s.icon}</div>
              {s.label}
            </button>
          ))}
        </div>

        {/* Scrollable form body */}
        <div className="hangar-modal-body">
          {SectionContent()}
        </div>

        {/* Footer */}
        <div className="hangar-modal-footer">
          <button className="hangar-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="hangar-save-btn" onClick={() => {
            const vfrExpired = INSPECTIONS.filter(i => !i.ifrOnly).some(i => getDateStatus(draft[i.fieldKey]) === "EXPIRED");
            const ifrExpired = INSPECTIONS.filter(i =>  i.ifrOnly).some(i => getDateStatus(draft[i.fieldKey]) === "EXPIRED");
            // Always resolve status from inspection state so fixing dates restores Airworthy.
            // MAINTENANCE is the only status that must be set manually and is preserved.
            const resolvedStatus = vfrExpired          ? "GROUNDED"
              : ifrExpired                             ? "NOT IFR CURRENT"
              : draft.status === "MAINTENANCE"         ? "MAINTENANCE"
              : "AIRWORTHY";
            onSave({ ...draft, status: resolvedStatus }); onClose();
          }}>✓ Save Profile</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKLIST LIBRARY — premade aircraft checklists available to add
// ─────────────────────────────────────────────────────────────────────────────
const CHECKLIST_LIBRARY = [
  {
    id: "c172s",
    tail: "C172S",
    type: "Cessna 172S Skyhawk",
    year: "2006–present",
    engine: "Lycoming IO-360-L2A · 180 HP",
    avionics: "Garmin G1000 NXi (glass) or Steam Gauge",
    category: "Single Engine",
    pages: 7,
    sections: 28,
    items: 112,
    status: "INCLUDED",
    color: "#e8c84a",
  },
  {
    id: "c152",
    type: "Cessna 152",
    year: "1977–1985",
    engine: "Lycoming O-235 · 110 HP",
    avionics: "Steam Gauge",
    category: "Single Engine",
    pages: 7,
    sections: 22,
    items: 90,
    status: "COMING SOON",
    color: "#4a9fe8",
  },
  {
    id: "pa28",
    type: "Piper PA-28 Cherokee",
    year: "1960–present",
    engine: "Lycoming O-320 · 160 HP",
    avionics: "Steam Gauge / G5",
    category: "Single Engine",
    pages: 7,
    sections: 24,
    items: 96,
    status: "COMING SOON",
    color: "#4a9fe8",
  },
  {
    id: "c182",
    type: "Cessna 182 Skylane",
    year: "1956–present",
    engine: "Lycoming IO-540 · 230 HP",
    avionics: "Garmin G1000 / Steam Gauge",
    category: "Single Engine",
    pages: 7,
    sections: 26,
    items: 104,
    status: "COMING SOON",
    color: "#4a9fe8",
  },
  {
    id: "be36",
    type: "Beechcraft Bonanza G36",
    year: "1947–present",
    engine: "Continental IO-550-B · 300 HP",
    avionics: "Garmin G1000",
    category: "Single Engine",
    pages: 7,
    sections: 28,
    items: 110,
    status: "COMING SOON",
    color: "#4a9fe8",
  },
  {
    id: "da40",
    type: "Diamond DA40 Star",
    year: "1997–present",
    engine: "Lycoming IO-360 · 180 HP",
    avionics: "Garmin G1000",
    category: "Single Engine",
    pages: 7,
    sections: 25,
    items: 98,
    status: "COMING SOON",
    color: "#4a9fe8",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL ENTRY VIEW — full-screen blank checklist builder
// ─────────────────────────────────────────────────────────────────────────────
function ManualEntryView({ onClose }) {
  const PHASE_TEMPLATES = [
    "PREFLIGHT", "STARTUP", "TAXI", "TAKEOFF", "CRUISE", "APPROACH & LANDING", "SHUTDOWN",
  ];
  const [tail, setTail] = useState("");
  const [acType, setAcType] = useState("");
  const [phases, setPhases] = useState(
    PHASE_TEMPLATES.map(name => ({ name, items: [{ l: "", a: "" }] }))
  );
  const [activePhase, setActivePhase] = useState(0);

  const updateItem = (pi, ii, field, val) => {
    setPhases(prev => prev.map((p, pIdx) => pIdx !== pi ? p : {
      ...p, items: p.items.map((item, iIdx) => iIdx !== ii ? item : { ...item, [field]: val }),
    }));
  };

  const addItem = (pi) => {
    setPhases(prev => prev.map((p, pIdx) => pIdx !== pi ? p : { ...p, items: [...p.items, { l: "", a: "" }] }));
  };

  const removeItem = (pi, ii) => {
    setPhases(prev => prev.map((p, pIdx) => pIdx !== pi ? p : { ...p, items: p.items.filter((_, i) => i !== ii) }));
  };

  const phase = phases[activePhase];
  const totalItems = phases.reduce((acc, p) => acc + p.items.filter(i => i.l.trim()).length, 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 600,
      background: "#080a0e",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--f-ui)",
      animation: "hangarFadeIn 0.2s ease",
    }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: "linear-gradient(135deg,#0a0c10,#141820)", borderBottom: "2px solid #3dbe6c", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "var(--f-ui)", fontSize: 18, fontWeight: 700, letterSpacing: 3, color: "#3dbe6c" }}>MANUAL CHECKLIST ENTRY</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "#4a5068", letterSpacing: 2, marginTop: 2 }}>
            {totalItems} ITEMS ENTERED ACROSS {phases.length} PHASES
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(232,90,74,0.08)", border: "1px solid #e85a4a", borderRadius: 5, padding: "6px 14px", cursor: "pointer", fontFamily: "var(--f-ui)", fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#e85a4a" }}>✕ CLOSE</button>
      </div>

      {/* Aircraft identity row */}
      <div style={{ flexShrink: 0, background: "#0d0f14", borderBottom: "1px solid #1e2430", padding: "10px 20px", display: "flex", gap: 16, alignItems: "center" }}>
        {[
          { label: "TAIL NUMBER", key: "tail", val: tail, set: setTail, placeholder: "N12345", width: 140 },
          { label: "AIRCRAFT TYPE", key: "type", val: acType, set: setAcType, placeholder: "Cessna 172S Skyhawk", width: 260 },
        ].map(f => (
          <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "#4a5068", letterSpacing: 1.5 }}>{f.label}</div>
            <input
              value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
              style={{ width: f.width, background: "#141820", border: "1px solid #2a3040", borderRadius: 4, padding: "6px 10px", fontFamily: "var(--f-ui)", fontSize: 14, fontWeight: 600, color: "#e8e4d8", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "#3dbe6c"}
              onBlur={e => e.target.style.borderColor = "#2a3040"}
            />
          </div>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button style={{ background: "rgba(61,190,108,0.1)", border: "1px solid #3dbe6c", borderRadius: 5, padding: "7px 20px", cursor: "not-allowed", fontFamily: "var(--f-ui)", fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#3dbe6c", opacity: 0.5 }}>
            SAVE CHECKLIST (COMING SOON)
          </button>
        </div>
      </div>

      {/* Body: phase tabs left + items right */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Phase sidebar */}
        <div style={{ width: 160, flexShrink: 0, background: "#0a0c10", borderRight: "1px solid #1e2430", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {phases.map((p, pi) => {
            const filled = p.items.filter(i => i.l.trim()).length;
            const isActive = activePhase === pi;
            return (
              <button key={pi} onClick={() => setActivePhase(pi)} style={{
                textAlign: "left", padding: "12px 14px", cursor: "pointer", border: "none",
                borderLeft: `3px solid ${isActive ? "#3dbe6c" : "transparent"}`,
                borderBottom: "1px solid #1e2430",
                background: isActive ? "rgba(61,190,108,0.07)" : "transparent",
                transition: "all 0.15s",
              }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, fontWeight: 700, letterSpacing: 1, color: isActive ? "#3dbe6c" : "#4a5068", textTransform: "uppercase" }}>{p.name}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: filled > 0 ? "#3dbe6c" : "#2a3040", marginTop: 3, letterSpacing: 0.5 }}>{filled} items</div>
              </button>
            );
          })}
        </div>

        {/* Items panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontFamily: "var(--f-ui)", fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "#3dbe6c", marginBottom: 8, textTransform: "uppercase" }}>{phase.name}</div>

          {phase.items.map((item, ii) => (
            <div key={ii} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "#3a4050", width: 22, textAlign: "right", flexShrink: 0 }}>{ii + 1}.</div>
              <input
                value={item.l} onChange={e => updateItem(activePhase, ii, "l", e.target.value)}
                placeholder="Checklist item label..."
                style={{ flex: 2, background: "#0d1018", border: "1px solid #1e2430", borderRadius: 4, padding: "8px 10px", fontFamily: "var(--f-ui)", fontSize: 14, fontWeight: 500, color: "#e8e4d8", outline: "none" }}
                onFocus={e => e.target.style.borderColor = "#3dbe6c"}
                onBlur={e => e.target.style.borderColor = "#1e2430"}
              />
              <input
                value={item.a} onChange={e => updateItem(activePhase, ii, "a", e.target.value.toUpperCase())}
                placeholder="ACTION"
                style={{ flex: 1, background: "#0d1018", border: "1px solid #1e2430", borderRadius: 4, padding: "8px 10px", fontFamily: "var(--f-mono)", fontSize: 11, color: "#e8c84a", outline: "none", letterSpacing: 1 }}
                onFocus={e => e.target.style.borderColor = "#e8c84a"}
                onBlur={e => e.target.style.borderColor = "#1e2430"}
              />
              <button onClick={() => removeItem(activePhase, ii)} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 4, border: "1px solid #2a2030", background: "transparent", cursor: "pointer", color: "#5a3040", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          ))}

          <button onClick={() => addItem(activePhase)} style={{ marginTop: 6, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: "rgba(61,190,108,0.06)", border: "1px dashed #2a4038", borderRadius: 5, padding: "7px 16px", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 9, color: "#3dbe6c", letterSpacing: 1.5 }}>
            ＋ ADD ITEM
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD AIRCRAFT MODAL — centered dialog with 3 option cards
// ─────────────────────────────────────────────────────────────────────────────
function AddAircraftModal({ onClose, onSaveProfile, profile }) {
  const [screen, setScreen] = useState("choose"); // "choose" | "library" | "manual" | "scan"
  const [searchQuery, setSearchQuery] = useState("");
  const readyCount = CHECKLIST_LIBRARY.filter(a => a.status === "INCLUDED").length;
  const soonCount  = CHECKLIST_LIBRARY.filter(a => a.status === "COMING SOON").length;

  if (screen === "manual") return <ManualEntryView onClose={onClose} />;

  if (screen === "scan") return (
    <ChecklistScanner
      onClose={onClose}
      onApply={(scannedChecklist) => {
        onSaveProfile({ ...profile, scannedChecklist });
      }}
    />
  );

  const filtered = CHECKLIST_LIBRARY.filter(ac =>
    ac.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ac.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="hangar-modal-backdrop centered"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{ animation: "hangarFadeIn 0.2s ease" }}
      >

      {/* Panel */}
      <div className="hangar-modal-panel" style={{ animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)" }}>

          {/* ── CHOOSE SCREEN ── */}
          {screen === "choose" && (<>
            <div className="hangar-modal-header">
              <div>
                <div className="hangar-modal-title">Add Aircraft</div>
                <div className="hangar-modal-sub">CHOOSE HOW TO LOAD A CHECKLIST</div>
              </div>
              <button className="hangar-close-btn" onClick={onClose}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Close
              </button>
            </div>

            <div className="hangar-modal-body"><div className="hangar-sheet-options">
              {/* Option 1 — Search Library */}
              <button className="hangar-opt-card" onClick={() => setScreen("library")}>
                <span className="hangar-opt-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="m21 21-4.3-4.3"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                  </svg>
                </span>
                <span className="hangar-opt-body">
                  <span className="hangar-opt-name">Search Aircraft Checklist</span>
                  <span className="hangar-opt-desc">Browse our library of premade POH checklists.</span>
                  <span className="hangar-opt-meta">
                    <span className="pill ok">{readyCount} ready now</span>
                    <span className="pill">{soonCount} coming soon</span>
                  </span>
                </span>
                <span className="hangar-opt-cta">
                  Browse Library
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </button>

              {/* Option 2 — Manual Entry */}
              <button className="hangar-opt-card ok-opt" onClick={() => setScreen("manual")}>
                <span className="hangar-opt-icon ok-ico">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6"/>
                    <line x1="9" y1="13" x2="15" y2="13"/>
                    <line x1="9" y1="17" x2="13" y2="17"/>
                  </svg>
                </span>
                <span className="hangar-opt-body">
                  <span className="hangar-opt-name">Manual Checklist Entry</span>
                  <span className="hangar-opt-desc">Build your own checklist from scratch.</span>
                  <span className="hangar-opt-meta">Enter items phase by phase · fully customisable</span>
                </span>
                <span className="hangar-opt-cta">
                  Start Building
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </button>

              {/* Option 3 — Scan Paper Checklist */}
              <button className="hangar-opt-card" onClick={() => setScreen("scan")}>
                <span className="hangar-opt-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </span>
                <span className="hangar-opt-body">
                  <span className="hangar-opt-name">Scan Paper Checklist</span>
                  <span className="hangar-opt-desc">Photograph a Checkmate card or printed POH checklist.</span>
                  <span className="hangar-opt-meta">
                    <span className="pill ok">On-device OCR</span>
                    <span className="pill">No internet needed</span>
                  </span>
                </span>
                <span className="hangar-opt-cta">
                  Scan Now
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </button>
            </div></div>
          </>)}

          {/* ── LIBRARY SCREEN ── */}
          {screen === "library" && (<>
            <div className="hangar-modal-header">
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <button
                  onClick={() => setScreen("choose")}
                  style={{ background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:6, color:"var(--accent)", fontFamily:"var(--f-mono)", fontSize:10, letterSpacing:"0.1em" }}
                >
                  <svg viewBox="0 0 16 16" width={12} height={12} fill="none">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>
                <div>
                  <div className="hangar-modal-title">Checklist Library</div>
                  <div className="hangar-modal-sub">{readyCount} AVAILABLE · {soonCount} COMING SOON</div>
                </div>
              </div>
              <button className="hangar-close-btn" onClick={onClose}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Close
              </button>
            </div>
            <div className="hangar-modal-body">

            {/* Search */}
            <div style={{ position:"relative", marginBottom:16 }}>
              <svg viewBox="0 0 16 16" width={14} height={14} fill="none" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--t-tertiary)" }}>
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                className="hangar-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by aircraft type..."
                style={{ paddingLeft:32 }}
              />
            </div>

            {/* List */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filtered.map(ac => {
                const available = ac.status === "INCLUDED";
                return (
                  <button
                    key={ac.id}
                    className={`hangar-library-row${available ? "" : " unavailable"}`}
                    onClick={available ? () => {} : undefined}
                  >
                    <div style={{ width:8, height:8, borderRadius:"50%", background: available ? "var(--accent)" : "var(--t-quiet)", flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"var(--f-ui)", fontSize:15, fontWeight:600, color:"var(--t-primary)" }}>{ac.type}</div>
                      <div style={{ fontFamily:"var(--f-mono)", fontSize:10, color:"var(--t-tertiary)", marginTop:3, letterSpacing:"0.06em" }}>
                        {ac.engine} · {ac.avionics}
                      </div>
                    </div>
                    {available && (
                      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                        {[{ label:"PHASES", val:ac.pages }, { label:"ITEMS", val:ac.items }].map(s => (
                          <div key={s.label} style={{ textAlign:"center" }}>
                            <div style={{ fontFamily:"var(--f-mono)", fontSize:16, fontWeight:700, color:"var(--accent)", lineHeight:1, fontFeatureSettings:"var(--num-feat)" }}>{s.val}</div>
                            <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:"var(--t-tertiary)", letterSpacing:"0.14em" }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <span style={{ fontFamily:"var(--f-mono)", fontSize:9, fontWeight:700, letterSpacing:"0.14em", padding:"3px 10px", borderRadius:3, background: available ? "var(--ok-bg)" : "var(--bg-3)", border: `1px solid ${available ? "var(--ok-line)" : "var(--line)"}`, color: available ? "var(--ok)" : "var(--t-tertiary)" }}>
                      {available ? "Available" : "Soon"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div></>)}

      </div>
      </div>
    </>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// HANGAR VIEW
// ─────────────────────────────────────────────────────────────────────────────
function HangarView({ profile, onSelectAircraft, onSaveProfile }) {
  const [zuluTime, setZuluTime] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const pad = n => String(n).padStart(2, "0");
    const tick = () => {
      const now = new Date();
      setZuluTime(pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + "Z");
      setLocalTime(pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const ac = profile;

  // Inspection cell helpers
  const getInspStatus = (iso) => {
    if (!iso) return "empty";
    const days = Math.ceil((new Date(iso) - new Date()) / 86400000);
    if (days < 0) return "warn";
    if (days <= 30) return "caution";
    return "ok";
  };
  const formatInspDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  };
  const getDaysNote = (iso) => {
    if (!iso) return null;
    const days = Math.ceil((new Date(iso) - new Date()) / 86400000);
    if (days < 0) return "Expired";
    if (days === 0) return "Expires today";
    return `${days} days remaining`;
  };

  const INSPECTIONS = [
    { label: "Annual",       key: "dateAnnual",      fallbackSub: "14 CFR 91.409" },
    { label: "Pitot-Static", key: "datePitotStatic",  fallbackSub: "IFR Only · 91.411" },
    { label: "Transponder",  key: "dateTransponder",  fallbackSub: "91.413" },
    { label: "ELT",          key: "dateEltBattery",   fallbackSub: "Battery · 12 mo" },
  ];

  const acStatusClass = ac.status === "AIRWORTHY"       ? "airworthy"
    : ac.status === "GROUNDED"         ? "grounded"
    : ac.status === "NOT IFR CURRENT"  ? "caution"
    : "caution";
  const acStatusLabel = ac.status === "AIRWORTHY"       ? "Airworthy"
    : ac.status === "GROUNDED"         ? "Grounded"
    : ac.status === "NOT IFR CURRENT"  ? "Not IFR Current"
    : "Maintenance";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", width:"100%", background:"var(--bg-0)", overflow:"hidden" }}>
      <style>{`
        @keyframes hangarFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalSlideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
      `}</style>

      {/* ── TOP BAR ── */}
      <header className="hangar-topbar">
        <div className="hangar-topbar-left">
          <div className="hangar-brand">
            <div className="hangar-brand-mark">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12l-9-2-4-7-2 1 2 7-5 2v2l5 1 1 5 2 1 3-5 7-1z"/>
              </svg>
            </div>
            <span>Apex Aviation · Flight Training</span>
          </div>
        </div>

        <div className="hangar-topbar-center">
          <span className="hangar-title-name">The Hangar</span>
          <span className="hangar-title-sub">Select aircraft to open kneeboard</span>
        </div>

        <div className="hangar-topbar-right">
          <div className="hangar-clocks">
            <div className="hangar-clock-group">
              <span className="hangar-clock-label">Zulu</span>
              <span className="hangar-clock-zulu">{zuluTime}</span>
            </div>
            <div className="hangar-clock-divider" />
            <div className="hangar-clock-group">
              <span className="hangar-clock-label">Local</span>
              <span className="hangar-clock-local">{localTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── META STRIP ── */}
      <div className="hangar-meta">
        <span className="m-item">
          <span className="m-label">Aircraft on file</span>
          <span className="m-value">1</span>
        </span>
        <span className="m-divider" />
        <span className="m-item">
          <span className="m-label">Airworthy</span>
          <span className="m-value ok">{ac.status === "AIRWORTHY" ? 1 : 0}</span>
        </span>
        <span className="m-divider" />
        <span className="m-item">
          <span className="m-label">Pilot</span>
          <span className="m-value caution">{ac.pilotName || "PIC on duty"}</span>
        </span>
        <span className="m-divider" />
        <span className="m-item">
          <span className="m-label">POH Ref</span>
          <span className="m-value accent">{ac.pohRef || "Rev 2022-05"}</span>
        </span>
        <span className="hangar-meta-spacer" />
        <button className="hangar-meta-action" onClick={() => setEditOpen(true)}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Hangar settings
        </button>
      </div>

      {/* ── BODY ── */}
      <main className="hangar-body">
        <div className="hangar-inner">

          {/* Section eyebrow */}
          <div className="section-eyebrow">
            <span>Your Fleet</span>
            <span className="eyebrow-count">1 aircraft</span>
          </div>

          {/* ── AIRCRAFT CARD ── */}
          <div
            className="ac-card"
            role="button"
            tabIndex={0}
            onClick={() => onSelectAircraft(ac)}
            onKeyDown={e => e.key === "Enter" && onSelectAircraft(ac)}
          >
            {/* Thumbnail */}
            <div className="ac-thumb">
              <svg viewBox="0 0 100 100" width="92" height="92" fill="currentColor">
                <path d="M50 8 L52 36 L96 50 L96 56 L52 50 L52 76 L62 84 L62 88 L50 86 L38 88 L38 84 L48 76 L48 50 L4 56 L4 50 L48 36 Z" opacity="0.85"/>
                <rect x="49" y="42" width="2" height="14" fill="var(--bg-inset)" opacity="0.4"/>
              </svg>
            </div>

            {/* Main content */}
            <div className="ac-main">
              <div className="ac-head">
                <span className="ac-tail">{ac.tail}</span>
                <span className="ac-type">{ac.type}</span>
                <span className="ac-tag">Primary</span>
              </div>

              {/* Inspection grid */}
              <div className="insp-grid">
                {INSPECTIONS.map(insp => {
                  const status = getInspStatus(ac[insp.key]);
                  const daysNote = getDaysNote(ac[insp.key]);
                  return (
                    <div key={insp.key} className={`insp-cell ${status}`}>
                      <span className="insp-label">{insp.label}</span>
                      <span className="insp-value">{formatInspDate(ac[insp.key])}</span>
                      <span className="insp-sub">{daysNote || insp.fallbackSub}</span>
                    </div>
                  );
                })}
              </div>

              {/* Spec strip */}
              <div className="ac-specs">
                <span className="ac-spec">
                  <span className="ico">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="7" width="18" height="10" rx="2"/>
                      <path d="M7 7V5m10 2V5M7 17v2m10-2v2"/>
                    </svg>
                  </span>
                  {ac.engine}
                </span>
                <span className="ac-spec-divider" />
                <span className="ac-spec">
                  <span className="ico">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="14" rx="2"/>
                      <path d="M2 18h20l-2 3H4z"/>
                    </svg>
                  </span>
                  {ac.avionics}
                </span>
                {ac.homeAirport && <>
                  <span className="ac-spec-divider" />
                  <span className="ac-spec">
                    <span className="ico">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                      </svg>
                    </span>
                    {ac.homeAirport}{ac.homeIcao ? ` · ${ac.homeIcao}` : ""}
                  </span>
                </>}
              </div>

              {/* Actions row */}
              <div className="ac-actions">
                <button
                  className="hangar-btn"
                  onClick={e => { e.stopPropagation(); setEditOpen(true); }}
                >
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Right column */}
            <div className="ac-right">
              <span className={`ac-status ${acStatusClass}`}>
                <span className="dot" />
                {acStatusLabel}
              </span>
              <span className="ac-open">
                Open Kneeboard
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </div>
          </div>

          {/* ── ADD AIRCRAFT CARD ── */}
          <button className="add-card" onClick={() => setAddOpen(true)}>
            <div className="add-card-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div>
              <div className="add-card-title">Add Aircraft</div>
              <div className="add-card-sub">
                <span className="pill">Search Library</span>
                <span className="pill">Manual Entry</span>
                <span className="pill">AI Scan POH</span>
              </div>
            </div>
            <div className="add-card-cta">
              New Profile
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </button>

        </div>
      </main>

      {/* ── STATUS BAR ── */}
      <footer className="hangar-statusbar">
        <span>Apex Aviation · Flight Training Center</span>
        <span className="hangar-status-divider" />
        <span>Kneeboard System v2.0</span>
        <span className="hangar-status-divider" />
        <span>For Simulation Use</span>
        <span className="hangar-status-spacer" />
        <span>POH Ref · {ac.pohRef || "Rev 2022-05"}</span>
      </footer>

      {/* Edit modal */}
      {editOpen && (
        <AircraftEditModal
          profile={profile}
          onSave={onSaveProfile}
          onClose={() => setEditOpen(false)}
        />
      )}

      {/* Add Aircraft modal */}
      {addOpen && (
        <AddAircraftModal onClose={() => setAddOpen(false)} profile={profile} onSaveProfile={onSaveProfile} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP — controls view state + profile persistence
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(() => {
    try { if (localStorage.getItem("apex_kneeboard_view") === "checklist") return "checklist"; } catch {}
    return "hangar";
  });

  // Profile lives here — single source of truth for both Hangar and ChecklistApp.
  // Loads from IndexedDB on mount (with localStorage fallback for migration).
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("apex_kneeboard_profile");
      if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch {}
    return { ...DEFAULT_PROFILE };
  });

  // On mount, hydrate from IndexedDB (may have more recent data than localStorage)
  useEffect(() => {
    dbLoadProfile().then((saved) => {
      if (saved) setProfile({ ...DEFAULT_PROFILE, ...saved });
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveProfile = (next) => {
    setProfile(next);
    dbSaveProfile(next).catch(() => {});
    try { localStorage.setItem("apex_kneeboard_profile", JSON.stringify(next)); } catch {}
  };

  const openChecklist = () => {
    setView("checklist");
    try { localStorage.setItem("apex_kneeboard_view", "checklist"); } catch {}
  };

  const goToHangar = () => {
    setView("hangar");
    try { localStorage.setItem("apex_kneeboard_view", "hangar"); } catch {}
  };

  if (view === "checklist") {
    return <ChecklistApp onBackToHangar={goToHangar} aircraft={profile} />;
  }
  return <HangarView profile={profile} onSelectAircraft={openChecklist} onSaveProfile={saveProfile} />;
}
