// ─────────────────────────────────────────────────────────────────────────────
// APEX AVIATION KNEEBOARD — Hangar, Fleet Management & Root App
// Imports ChecklistApp from cessna172s_checklist.jsx
// To add a new aircraft: create a new checklist file and add its import here.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { ChecklistApp } from "./cessna172s_checklist.jsx";

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
};

// ─────────────────────────────────────────────────────────────────────────────
// AIRCRAFT EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AircraftEditModal({ profile, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...profile });
  const [activeSection, setActiveSection] = useState("aircraft");

  const set = (key, val) => setDraft(p => ({ ...p, [key]: val }));

  const SECTIONS = [
    { id: "aircraft",      label: "AIRCRAFT",       icon: "✈" },
    { id: "airworthiness", label: "AIRWORTHINESS",  icon: "🔧" },
    { id: "pilot",         label: "PILOT",          icon: "👤" },
    { id: "airport",       label: "HOME AIRPORT",   icon: "🏢" },
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
    EXPIRED:  { color: "#e85a4a", bg: "rgba(232,90,74,0.12)",  border: "#e85a4a" },
    "DUE SOON": { color: "#e8c84a", bg: "rgba(232,200,74,0.12)", border: "#e8c84a" },
    VALID:    { color: "#3dbe6c", bg: "rgba(61,190,108,0.12)", border: "#3dbe6c" },
    NONE:     { color: "#3a4050", bg: "transparent",           border: "#2a3040" },
  };

  const INSPECTIONS = [
    { label: "Annual Inspection",       ref: "14 CFR 91.409",  fieldKey: "dateAnnual" },
    { label: "Pitot-Static System",     ref: "14 CFR 91.411",  fieldKey: "datePitotStatic" },
    { label: "Transponder",             ref: "14 CFR 91.413",  fieldKey: "dateTransponder" },
    { label: "ELT Battery",             ref: "14 CFR 91.207",  fieldKey: "dateEltBattery" },
    { label: "ELT Inspection",          ref: "14 CFR 91.207",  fieldKey: "dateEltInspect" },
  ];

  const Field = ({ label, fieldKey, placeholder, hint }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 2, marginBottom: 5, textTransform: "uppercase" }}>{label}</div>
      <input
        value={draft[fieldKey] || ""}
        onChange={e => set(fieldKey, e.target.value)}
        placeholder={placeholder || ""}
        style={{
          width: "100%", background: "#0d1018", border: "1px solid #2a3040",
          borderRadius: 5, padding: "9px 12px", outline: "none",
          fontFamily: "'Rajdhani',sans-serif", fontSize: 15, fontWeight: 600,
          color: "#e8e4d8", letterSpacing: 0.5,
          transition: "border-color 0.15s",
        }}
        onFocus={e => e.target.style.borderColor = "#e8c84a"}
        onBlur={e => e.target.style.borderColor = "#2a3040"}
      />
      {hint && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7.5, color: "#3a4050", letterSpacing: 1, marginTop: 4 }}>{hint}</div>}
    </div>
  );

  const SelectField = ({ label, fieldKey, options }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 2, marginBottom: 5, textTransform: "uppercase" }}>{label}</div>
      <select
        value={draft[fieldKey] || ""}
        onChange={e => set(fieldKey, e.target.value)}
        style={{
          width: "100%", background: "#0d1018", border: "1px solid #2a3040",
          borderRadius: 5, padding: "9px 12px", outline: "none",
          fontFamily: "'Rajdhani',sans-serif", fontSize: 15, fontWeight: 600,
          color: "#e8e4d8", cursor: "pointer", appearance: "none",
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const SectionContent = () => {
    if (activeSection === "aircraft") return (
      <div>
        <Field label="Tail Number" fieldKey="tail" placeholder="N12345" hint="FAA registration number" />
        <Field label="Aircraft Type" fieldKey="type" placeholder="Cessna 172S Skyhawk" />
        <Field label="Year" fieldKey="year" placeholder="2019" />
        <Field label="Engine" fieldKey="engine" placeholder="Lycoming IO-360-L2A · 180 HP" />
        <Field label="Avionics" fieldKey="avionics" placeholder="Garmin G1000 NXi" />
        <Field label="POH Reference" fieldKey="pohRef" placeholder="REV 2022-05" hint="Shown in status bar" />
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>Airworthiness Status</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["AIRWORTHY", "GROUNDED", "MAINTENANCE"].map(s => (
              <button key={s} onClick={() => set("status", s)} style={{
                flex: 1, padding: "8px 4px", borderRadius: 5, cursor: "pointer",
                fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: 1,
                border: `1px solid ${draft.status === s ? (s === "AIRWORTHY" ? "#3dbe6c" : "#e85a4a") : "#2a3040"}`,
                background: draft.status === s ? (s === "AIRWORTHY" ? "rgba(61,190,108,0.12)" : "rgba(232,90,74,0.12)") : "transparent",
                color: draft.status === s ? (s === "AIRWORTHY" ? "#3dbe6c" : "#e85a4a") : "#4a5068",
                transition: "all 0.15s",
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    );

    if (activeSection === "airworthiness") {
      const anyExpired = INSPECTIONS.some(i => getDateStatus(draft[i.fieldKey]) === "EXPIRED");
      return (
        <div>
          {/* Auto-grounding notice */}
          {anyExpired && (
            <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 6, background: "rgba(232,90,74,0.08)", border: "1px solid rgba(232,90,74,0.3)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>⚠</span>
              <div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, color: "#e85a4a", letterSpacing: 1.5 }}>AIRCRAFT WILL BE GROUNDED ON SAVE</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7.5, color: "#7a4040", letterSpacing: 1, marginTop: 2 }}>One or more inspections are expired. Status overridden automatically.</div>
              </div>
            </div>
          )}

          {/* Inspection rows */}
          {INSPECTIONS.map(insp => {
            const ds = getDateStatus(draft[insp.fieldKey]);
            const ss = STATUS_STYLE[ds];
            return (
              <div key={insp.fieldKey} style={{ marginBottom: 10, padding: "12px 14px", borderRadius: 7, background: "#0d1018", border: `1px solid ${ds === "NONE" ? "#1e2430" : ss.border + "40"}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 700, color: "#c8c4b8", letterSpacing: 0.5 }}>{insp.label}</div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7.5, color: "#3a4050", letterSpacing: 1, marginTop: 1 }}>{insp.ref}</div>
                  </div>
                  {/* Status badge */}
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, fontWeight: 700, letterSpacing: 1.5, padding: "3px 10px", borderRadius: 3, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, flexShrink: 0 }}>
                    {ds === "NONE" ? "NOT SET" : ds}
                  </span>
                </div>
                {/* Date input */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7.5, color: "#4a5068", letterSpacing: 1.5, flexShrink: 0 }}>EXPIRY DATE</div>
                  <input
                    type="date"
                    value={draft[insp.fieldKey] || ""}
                    onChange={e => set(insp.fieldKey, e.target.value)}
                    style={{
                      flex: 1, background: "#141820", border: `1px solid ${ds !== "NONE" ? ss.border + "60" : "#2a3040"}`,
                      borderRadius: 4, padding: "6px 10px", outline: "none",
                      fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color: ds !== "NONE" ? ss.color : "#7a8090",
                      colorScheme: "dark", cursor: "pointer",
                    }}
                    onFocus={e => e.target.style.borderColor = "#e8c84a"}
                    onBlur={e => e.target.style.borderColor = ds !== "NONE" ? ss.border + "60" : "#2a3040"}
                  />
                  {draft[insp.fieldKey] && (
                    <button onClick={() => set(insp.fieldKey, "")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#4a5068", fontSize: 14, padding: "0 4px", lineHeight: 1 }}>×</button>
                  )}
                </div>
              </div>
            );
          })}
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7.5, color: "#2a3040", letterSpacing: 1, marginTop: 8 }}>
            ★ Any expired inspection automatically sets aircraft status to GROUNDED on save.
          </div>
        </div>
      );
    }

    if (activeSection === "pilot") return (
      <div>
        <Field label="Pilot Name" fieldKey="pilotName" placeholder="First Last" hint="Displayed in header" />
        <Field label="Certificate Number" fieldKey="certNumber" placeholder="123456789" />
        <SelectField label="Certificate Type" fieldKey="certType" options={["Student Pilot","Sport Pilot","Recreational Pilot","Private Pilot","Commercial Pilot","ATP"]} />
      </div>
    );

    if (activeSection === "airport") return (
      <div>
        <Field label="Airport Name" fieldKey="homeAirport" placeholder="Phoenix Deer Valley" />
        <Field label="ICAO / IATA Identifier" fieldKey="homeIcao" placeholder="KDVT" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="ATIS Frequency" fieldKey="atisFrq" placeholder="127.25" />
          <Field label="CTAF / Unicom" fieldKey="ctafFrq" placeholder="122.80" />
          <Field label="Tower Frequency" fieldKey="towerFrq" placeholder="119.90" />
          <Field label="Ground Frequency" fieldKey="groundFrq" placeholder="121.80" />
          <Field label="Field Elevation" fieldKey="fieldElev" placeholder="1478 MSL" />
          <Field label="Runways" fieldKey="runways" placeholder="07L/25R · 07R/25L" />
        </div>
      </div>
    );

    return null;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(4,6,10,0.92)",
      display: "flex", alignItems: "flex-end",
      animation: "hangarFadeIn 0.2s ease",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      {/* Modal panel — slides up from bottom */}
      <div style={{
        width: "100%", maxHeight: "88vh",
        background: "linear-gradient(180deg,#0e1118 0%,#0a0c10 100%)",
        borderTop: "2px solid #e8c84a",
        borderRadius: "14px 14px 0 0",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <style>{`
          @keyframes modalSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        `}</style>

        {/* Modal header */}
        <div style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid #1e2430",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 3, color: "#e8c84a", textTransform: "uppercase", lineHeight: 1 }}>
              AIRCRAFT PROFILE
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 2, marginTop: 3 }}>
              {draft.tail} · EDIT & SAVE TO PERSIST ACROSS SESSIONS
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(232,90,74,0.08)", border: "1px solid #e85a4a",
            borderRadius: 5, padding: "6px 14px", cursor: "pointer",
            fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700,
            letterSpacing: 1, color: "#e85a4a",
          }}>✕ CLOSE</button>
        </div>

        {/* Section tabs */}
        <div style={{
          display: "flex", borderBottom: "1px solid #1e2430",
          flexShrink: 0, background: "#080a0e",
        }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              flex: 1, padding: "10px 4px", cursor: "pointer",
              background: activeSection === s.id ? "rgba(232,200,74,0.07)" : "transparent",
              border: "none", borderBottom: `2px solid ${activeSection === s.id ? "#e8c84a" : "transparent"}`,
              fontFamily: "'Share Tech Mono',monospace", fontSize: 8, fontWeight: 700,
              letterSpacing: 1.5, color: activeSection === s.id ? "#e8c84a" : "#3a4050",
              textTransform: "uppercase", transition: "all 0.15s",
            }}>
              <div style={{ fontSize: 14, marginBottom: 3 }}>{s.icon}</div>
              {s.label}
            </button>
          ))}
        </div>

        {/* Scrollable form body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <SectionContent />
        </div>

        {/* Footer — save button */}
        <div style={{
          padding: "12px 24px 20px",
          borderTop: "1px solid #1e2430",
          display: "flex", gap: 10, flexShrink: 0,
          background: "#080a0e",
        }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px", borderRadius: 6, cursor: "pointer",
            background: "transparent", border: "1px solid #2a3040",
            fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 700,
            letterSpacing: 2, color: "#4a5068",
          }}>CANCEL</button>
          <button onClick={() => {
            const anyExpired = INSPECTIONS.some(i => getDateStatus(draft[i.fieldKey]) === "EXPIRED");
            const finalDraft = anyExpired ? { ...draft, status: "GROUNDED" } : draft;
            onSave(finalDraft); onClose();
          }} style={{
            flex: 2, padding: "12px", borderRadius: 6, cursor: "pointer",
            background: "rgba(61,190,108,0.15)", border: "1px solid #3dbe6c",
            fontFamily: "'Oswald',sans-serif", fontSize: 16, fontWeight: 700,
            letterSpacing: 3, color: "#3dbe6c",
            boxShadow: "0 0 16px rgba(61,190,108,0.15)",
          }}>✓ SAVE PROFILE</button>
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
      fontFamily: "'Rajdhani',sans-serif",
      animation: "hangarFadeIn 0.2s ease",
    }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: "linear-gradient(135deg,#0a0c10,#141820)", borderBottom: "2px solid #3dbe6c", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 3, color: "#3dbe6c" }}>MANUAL CHECKLIST ENTRY</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 2, marginTop: 2 }}>
            {totalItems} ITEMS ENTERED ACROSS {phases.length} PHASES
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(232,90,74,0.08)", border: "1px solid #e85a4a", borderRadius: 5, padding: "6px 14px", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#e85a4a" }}>✕ CLOSE</button>
      </div>

      {/* Aircraft identity row */}
      <div style={{ flexShrink: 0, background: "#0d0f14", borderBottom: "1px solid #1e2430", padding: "10px 20px", display: "flex", gap: 16, alignItems: "center" }}>
        {[
          { label: "TAIL NUMBER", key: "tail", val: tail, set: setTail, placeholder: "N12345", width: 140 },
          { label: "AIRCRAFT TYPE", key: "type", val: acType, set: setAcType, placeholder: "Cessna 172S Skyhawk", width: 260 },
        ].map(f => (
          <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 1.5 }}>{f.label}</div>
            <input
              value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
              style={{ width: f.width, background: "#141820", border: "1px solid #2a3040", borderRadius: 4, padding: "6px 10px", fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 600, color: "#e8e4d8", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "#3dbe6c"}
              onBlur={e => e.target.style.borderColor = "#2a3040"}
            />
          </div>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button style={{ background: "rgba(61,190,108,0.1)", border: "1px solid #3dbe6c", borderRadius: 5, padding: "7px 20px", cursor: "not-allowed", fontFamily: "'Oswald',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#3dbe6c", opacity: 0.5 }}>
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
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: 1, color: isActive ? "#3dbe6c" : "#4a5068", textTransform: "uppercase" }}>{p.name}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: filled > 0 ? "#3dbe6c" : "#2a3040", marginTop: 3, letterSpacing: 0.5 }}>{filled} items</div>
              </button>
            );
          })}
        </div>

        {/* Items panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "#3dbe6c", marginBottom: 8, textTransform: "uppercase" }}>{phase.name}</div>

          {phase.items.map((item, ii) => (
            <div key={ii} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a4050", width: 22, textAlign: "right", flexShrink: 0 }}>{ii + 1}.</div>
              <input
                value={item.l} onChange={e => updateItem(activePhase, ii, "l", e.target.value)}
                placeholder="Checklist item label..."
                style={{ flex: 2, background: "#0d1018", border: "1px solid #1e2430", borderRadius: 4, padding: "8px 10px", fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 500, color: "#e8e4d8", outline: "none" }}
                onFocus={e => e.target.style.borderColor = "#3dbe6c"}
                onBlur={e => e.target.style.borderColor = "#1e2430"}
              />
              <input
                value={item.a} onChange={e => updateItem(activePhase, ii, "a", e.target.value.toUpperCase())}
                placeholder="ACTION"
                style={{ flex: 1, background: "#0d1018", border: "1px solid #1e2430", borderRadius: 4, padding: "8px 10px", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#e8c84a", outline: "none", letterSpacing: 1 }}
                onFocus={e => e.target.style.borderColor = "#e8c84a"}
                onBlur={e => e.target.style.borderColor = "#1e2430"}
              />
              <button onClick={() => removeItem(activePhase, ii)} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 4, border: "1px solid #2a2030", background: "transparent", cursor: "pointer", color: "#5a3040", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          ))}

          <button onClick={() => addItem(activePhase)} style={{ marginTop: 6, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: "rgba(61,190,108,0.06)", border: "1px dashed #2a4038", borderRadius: 5, padding: "7px 16px", cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3dbe6c", letterSpacing: 1.5 }}>
            ＋ ADD ITEM
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD AIRCRAFT MODAL — slide-up with 3 method cards
// ─────────────────────────────────────────────────────────────────────────────
function AddAircraftModal({ onClose }) {
  const [screen, setScreen] = useState("choose"); // "choose" | "library" | "manual"
  const [libHovered, setLibHovered] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (screen === "manual") return <ManualEntryView onClose={onClose} />;

  const filtered = CHECKLIST_LIBRARY.filter(ac =>
    ac.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ac.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(4,6,10,0.93)",
      display: "flex", alignItems: "flex-end",
      animation: "hangarFadeIn 0.2s ease",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div style={{
        width: "100%", maxHeight: screen === "library" ? "92vh" : "72vh",
        background: "linear-gradient(180deg,#0e1118 0%,#0a0c10 100%)",
        borderTop: "2px solid #3dbe6c",
        borderRadius: "14px 14px 0 0",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <style>{`@keyframes modalSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Modal header */}
        <div style={{ flexShrink: 0, padding: "16px 20px 14px", borderBottom: "1px solid #1e2430", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {screen === "library" && (
              <button onClick={() => setScreen("choose")} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#4a9fe8", fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 1 }}>
                <svg viewBox="0 0 16 16" width={12} height={12} fill="none"><path d="M10 3L5 8l5 5" stroke="#4a9fe8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                BACK
              </button>
            )}
            <div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 3, color: "#3dbe6c", textTransform: "uppercase", lineHeight: 1 }}>
                {screen === "choose" ? "ADD AIRCRAFT" : "CHECKLIST LIBRARY"}
              </div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 2, marginTop: 3 }}>
                {screen === "choose" ? "CHOOSE HOW TO ADD YOUR AIRCRAFT" : `${filtered.filter(a => a.status === "INCLUDED").length} AVAILABLE · ${filtered.filter(a => a.status === "COMING SOON").length} COMING SOON`}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(232,90,74,0.08)", border: "1px solid #e85a4a", borderRadius: 5, padding: "6px 14px", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#e85a4a" }}>✕ CLOSE</button>
        </div>

        {/* ── CHOOSE SCREEN — 3 big method cards ── */}
        {screen === "choose" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Card 1 — Search Library */}
            <MethodCard
              icon={
                <svg viewBox="0 0 32 32" width={32} height={32} fill="none">
                  <circle cx="13" cy="13" r="8" stroke="#e8c84a" strokeWidth="1.8"/>
                  <line x1="19" y1="19" x2="27" y2="27" stroke="#e8c84a" strokeWidth="2.2" strokeLinecap="round"/>
                  <line x1="9" y1="13" x2="17" y2="13" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
                  <line x1="13" y1="9" x2="13" y2="17" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
                </svg>
              }
              color="#e8c84a"
              title="Search Aircraft Checklist"
              subtitle="BROWSE OUR LIBRARY OF PREMADE POH CHECKLISTS"
              detail={`${CHECKLIST_LIBRARY.filter(a => a.status === "INCLUDED").length} READY NOW · ${CHECKLIST_LIBRARY.filter(a => a.status === "COMING SOON").length} COMING SOON`}
              onClick={() => setScreen("library")}
              cta="BROWSE LIBRARY →"
            />

            {/* Card 2 — Manual Entry */}
            <MethodCard
              icon={
                <svg viewBox="0 0 32 32" width={32} height={32} fill="none">
                  <rect x="6" y="4" width="20" height="24" rx="2" stroke="#3dbe6c" strokeWidth="1.8" fill="rgba(61,190,108,0.06)"/>
                  <line x1="10" y1="10" x2="22" y2="10" stroke="#3dbe6c" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
                  <line x1="10" y1="14" x2="22" y2="14" stroke="#3dbe6c" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
                  <line x1="10" y1="18" x2="18" y2="18" stroke="#3dbe6c" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
                  <path d="M18 22l3-3 3 3" stroke="#3dbe6c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                </svg>
              }
              color="#3dbe6c"
              title="Manual Checklist Entry"
              subtitle="BUILD YOUR OWN CHECKLIST FROM SCRATCH"
              detail="ENTER ITEMS PHASE BY PHASE · FULLY CUSTOMISABLE"
              onClick={() => setScreen("manual")}
              cta="START BUILDING →"
            />

            {/* Card 3 — AI Scan (grayed out) */}
            <MethodCard
              icon={
                <svg viewBox="0 0 32 32" width={32} height={32} fill="none">
                  <rect x="5" y="8" width="22" height="16" rx="2" stroke="#6a7080" strokeWidth="1.8" fill="rgba(100,110,128,0.06)"/>
                  <circle cx="16" cy="16" r="4" stroke="#6a7080" strokeWidth="1.5"/>
                  <circle cx="16" cy="16" r="1.5" fill="#6a7080" opacity="0.5"/>
                  <path d="M10 8V5M16 8V4M22 8V5" stroke="#6a7080" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
                  <line x1="5" y1="16" x2="12" y2="16" stroke="#6a7080" strokeWidth="1" strokeLinecap="round" opacity="0.3" strokeDasharray="2 2"/>
                  <line x1="20" y1="16" x2="27" y2="16" stroke="#6a7080" strokeWidth="1" strokeLinecap="round" opacity="0.3" strokeDasharray="2 2"/>
                </svg>
              }
              color="#4a5068"
              title="Scan Paper Checklist (AI)"
              subtitle="PHOTOGRAPH A POH OR PAPER CHECKLIST"
              detail="TESSERACT OCR + AI PARSING · COMING SOON"
              onClick={null}
              cta="COMING SOON"
              disabled
            />
          </div>
        )}

        {/* ── LIBRARY SCREEN ── */}
        {screen === "library" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Search bar */}
            <div style={{ flexShrink: 0, padding: "10px 20px", borderBottom: "1px solid #1e2430", background: "#0a0c10" }}>
              <div style={{ position: "relative" }}>
                <svg viewBox="0 0 16 16" width={14} height={14} fill="none" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="#4a5068" strokeWidth="1.3"/>
                  <line x1="10" y1="10" x2="14" y2="14" stroke="#4a5068" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by aircraft type..."
                  style={{ width: "100%", background: "#141820", border: "1px solid #2a3040", borderRadius: 6, padding: "8px 12px 8px 32px", fontFamily: "'Rajdhani',sans-serif", fontSize: 14, color: "#e8e4d8", outline: "none", letterSpacing: 0.5 }}
                  onFocus={e => e.target.style.borderColor = "#e8c84a"}
                  onBlur={e => e.target.style.borderColor = "#2a3040"}
                />
              </div>
            </div>

            {/* Library list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(ac => {
                const available = ac.status === "INCLUDED";
                const isHov = libHovered === ac.id;
                return (
                  <button key={ac.id}
                    onClick={available ? () => {} : undefined}
                    onMouseEnter={() => available && setLibHovered(ac.id)}
                    onMouseLeave={() => setLibHovered(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
                      padding: "14px 16px", borderRadius: 8, cursor: available ? "pointer" : "default",
                      background: isHov ? "rgba(232,200,74,0.06)" : available ? "rgba(255,255,255,0.02)" : "transparent",
                      border: `1px solid ${isHov ? ac.color : available ? "#2a3040" : "#1a1e28"}`,
                      opacity: available ? 1 : 0.45,
                      transition: "all 0.15s",
                    }}
                  >
                    {/* Color dot */}
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: available ? ac.color : "#3a4050", flexShrink: 0 }} />

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, fontWeight: 700, color: available ? "#e8e4d8" : "#4a5068", letterSpacing: 0.5 }}>{ac.type}</div>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#3a4050", letterSpacing: 1, marginTop: 3 }}>
                        {ac.engine} · {ac.avionics}
                      </div>
                    </div>

                    {/* Stats */}
                    {available && (
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {[
                          { label: "PHASES", val: ac.pages },
                          { label: "ITEMS", val: ac.items },
                        ].map(s => (
                          <div key={s.label} style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, fontWeight: 700, color: ac.color, lineHeight: 1 }}>{s.val}</div>
                            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "#4a5068", letterSpacing: 1.5 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Badge */}
                    <div style={{ flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, fontWeight: 700, letterSpacing: 1.5, padding: "3px 10px", borderRadius: 3, background: available ? "rgba(61,190,108,0.12)" : "rgba(74,80,104,0.15)", border: `1px solid ${available ? "#3dbe6c" : "#3a4050"}`, color: available ? "#3dbe6c" : "#4a5068" }}>
                        {available ? (isHov ? "ADD →" : "AVAILABLE") : "SOON"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Reusable method card for the choose screen
function MethodCard({ icon, color, title, subtitle, detail, onClick, cta, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 20, width: "100%", textAlign: "left",
        padding: "18px 20px", borderRadius: 10, cursor: disabled ? "default" : "pointer",
        background: hov ? `rgba(${color === "#e8c84a" ? "232,200,74" : color === "#3dbe6c" ? "61,190,108" : "74,80,104"},0.07)` : "rgba(255,255,255,0.02)",
        border: `1.5px solid ${hov ? color : disabled ? "#1e2430" : "#2a3040"}`,
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.18s",
        boxShadow: hov ? `0 0 20px ${color}18` : "none",
      }}
    >
      {/* Icon area */}
      <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${color}10`, border: `1px solid ${color}25`, transition: "all 0.18s" }}>
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2, color: hov ? color : "#e8e4d8", transition: "color 0.18s", textTransform: "uppercase" }}>{title}</div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 1.5, marginTop: 4 }}>{subtitle}</div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: hov ? color : "#3a4050", letterSpacing: 1, marginTop: 3, transition: "color 0.18s" }}>{detail}</div>
      </div>

      {/* CTA */}
      <div style={{ flexShrink: 0, fontFamily: "'Oswald',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, color: hov ? color : "#3a4050", transition: "all 0.18s", textTransform: "uppercase" }}>
        {cta}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HANGAR VIEW
// ─────────────────────────────────────────────────────────────────────────────
function HangarView({ profile, onSelectAircraft, onSaveProfile }) {
  const [zuluTime, setZuluTime] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [hovered, setHovered] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addHovered, setAddHovered] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setZuluTime(now.toUTCString().slice(17, 22) + "Z");
      setLocalTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const ac = profile; // single aircraft for now

  return (
    <div style={{
      width: "100%", height: "100vh", overflow: "hidden",
      background: "#080a0e",
      display: "flex", flexDirection: "column",
      fontFamily: "'Rajdhani', sans-serif",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Oswald:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes hangarFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hangarPulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes scanline { 0% { transform:translateY(-100%); } 100% { transform:translateY(400%); } }
        @keyframes glow { 0%,100% { text-shadow:0 0 8px rgba(232,200,74,0.4); } 50% { text-shadow:0 0 18px rgba(232,200,74,0.9), 0 0 30px rgba(232,200,74,0.4); } }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(74,159,232,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,159,232,0.04) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 600, height: 400,
        background: "radial-gradient(ellipse at center, rgba(232,200,74,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── TOP HEADER ── */}
      <div style={{
        flexShrink: 0,
        background: "linear-gradient(135deg,#0a0c10 0%,#141820 60%,#0a0c10 100%)",
        borderBottom: "2px solid #e8c84a",
        padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg viewBox="0 0 36 36" width={36} height={36} fill="none">
            <polygon points="18,3 33,30 3,30" stroke="#e8c84a" strokeWidth="2" fill="rgba(232,200,74,0.06)" strokeLinejoin="round"/>
            <line x1="18" y1="3" x2="18" y2="30" stroke="#e8c84a" strokeWidth="0.8" opacity="0.3"/>
            <circle cx="18" cy="18" r="3.5" fill="#e8c84a" opacity="0.9"/>
            <path d="M12 23l6-10 6 10" stroke="#e8c84a" strokeWidth="1" fill="none" opacity="0.5"/>
          </svg>
          <div>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 4, color: "#e8c84a", lineHeight: 1, textTransform: "uppercase" }}>APEX AVIATION</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 2, marginTop: 2 }}>FLIGHT TRAINING CENTER · KNEEBOARD v2</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: 6, color: "#e8e4d8", textTransform: "uppercase", lineHeight: 1, animation: "glow 4s ease-in-out infinite" }}>THE HANGAR</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 2.5, marginTop: 3 }}>SELECT AIRCRAFT TO OPEN KNEEBOARD</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 16, color: "#e8c84a", letterSpacing: 2, lineHeight: 1, animation: "hangarPulse 2s ease-in-out infinite" }}>{zuluTime}</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#4a5068", letterSpacing: 1.5, marginTop: 2 }}>LCL {localTime}</div>
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div style={{ flexShrink: 0, background: "#0d0f14", borderBottom: "1px solid #1e2430", padding: "6px 20px", display: "flex", alignItems: "center", gap: 20 }}>
        {[
          { label: "AIRCRAFT ON FILE", value: 1 },
          { label: "AIRWORTHY", value: ac.status === "AIRWORTHY" ? 1 : 0, color: "#3dbe6c" },
          { label: "PILOT", value: ac.pilotName || "PIC ON DUTY", color: "#e8c84a" },
          { label: "POH REF", value: ac.pohRef || "REV 2022-05", color: "#4a9fe8" },
        ].map((stat, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#3a4050", letterSpacing: 1.5 }}>{stat.label}</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: stat.color || "#7a8090", letterSpacing: 1, fontWeight: 700 }}>{stat.value}</div>
            {i < 3 && <div style={{ width: 1, height: 12, background: "#1e2430", marginLeft: 8 }} />}
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20, position: "relative", zIndex: 1 }}>

        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a4050", letterSpacing: 3 }}>
          ── YOUR FLEET ──────────────────────
        </div>

        {/* ── AIRCRAFT CARD ── */}
        <div style={{
          background: hovered === ac.id
            ? "linear-gradient(135deg,#141c28 0%,#1a2234 40%,#141c28 100%)"
            : "linear-gradient(135deg,#0e1218 0%,#141820 40%,#0e1218 100%)",
          border: `1.5px solid ${hovered === ac.id ? ac.color : "#2a3040"}`,
          borderRadius: 10,
          boxShadow: hovered === ac.id ? `0 0 24px rgba(232,200,74,0.12), 0 4px 20px rgba(0,0,0,0.5)` : "0 2px 12px rgba(0,0,0,0.4)",
          transition: "all 0.18s ease",
          animation: "hangarFadeIn 0.35s ease both",
          position: "relative", overflow: "hidden",
        }}
          onMouseEnter={() => setHovered(ac.id)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Top shimmer */}
          {hovered === ac.id && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ac.color}, transparent)` }} />}

          {/* Scan line */}
          {hovered === ac.id && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: 10 }}>
              <div style={{ position: "absolute", left: 0, right: 0, height: "25%", background: `linear-gradient(transparent, rgba(232,200,74,0.03), transparent)`, animation: "scanline 2s linear infinite" }} />
            </div>
          )}

          {/* Card inner — clickable area for opening checklist */}
          <button
            onClick={() => onSelectAircraft(ac)}
            style={{ display: "block", width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "20px 24px 0 24px", textAlign: "left" }}
          >
            {/* Header row: tail · type · status */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: 3, color: ac.color, lineHeight: 1, textShadow: hovered === ac.id ? `0 0 16px ${ac.color}60` : "none", transition: "all 0.18s" }}>{ac.tail}</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: ac.accentColor, letterSpacing: 2, paddingTop: 2 }}>{ac.type}</div>
              <div style={{ marginLeft: "auto" }}>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: "3px 10px", borderRadius: 3, background: ac.status === "AIRWORTHY" ? "rgba(61,190,108,0.12)" : "rgba(232,90,74,0.12)", border: `1px solid ${ac.status === "AIRWORTHY" ? "#3dbe6c" : "#e85a4a"}`, color: ac.status === "AIRWORTHY" ? "#3dbe6c" : "#e85a4a" }}>{ac.status}</span>
              </div>
            </div>

            {/* Silhouette + stats side by side */}
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ flexShrink: 0, width: 110, height: 80, display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(ellipse at center, ${ac.color}0a 0%, transparent 70%)`, borderRadius: 8, border: `1px solid ${ac.color}20` }}>
                <svg viewBox="0 0 110 80" width={110} height={80} fill="none">
                  <ellipse cx="55" cy="40" rx="6" ry="30" fill={ac.color} opacity={hovered === ac.id ? 0.75 : 0.4} />
                  <ellipse cx="55" cy="40" rx="48" ry="5" fill={ac.color} opacity={hovered === ac.id ? 0.6 : 0.3} />
                  <path d="M7 38 Q30 35 55 37 Q80 35 103 38 Q80 45 55 43 Q30 45 7 42Z" fill={ac.color} opacity={hovered === ac.id ? 0.35 : 0.18} />
                  <ellipse cx="55" cy="68" rx="22" ry="2.5" fill={ac.color} opacity={hovered === ac.id ? 0.55 : 0.25} />
                  <ellipse cx="55" cy="10" rx="3" ry="8" fill={ac.color} opacity={hovered === ac.id ? 0.6 : 0.3} />
                  <path d="M55 10 Q62 8 64 12 Q62 16 55 14 Q48 16 46 12 Q48 8 55 10Z" fill={ac.color} opacity={hovered === ac.id ? 0.8 : 0.4} />
                  <circle cx="37" cy="43" r="2" fill={ac.color} opacity={hovered === ac.id ? 0.5 : 0.25} />
                  <circle cx="73" cy="43" r="2" fill={ac.color} opacity={hovered === ac.id ? 0.5 : 0.25} />
                  <circle cx="55" cy="65" r="1.5" fill={ac.color} opacity={hovered === ac.id ? 0.4 : 0.2} />
                  <text x="55" y="42" textAnchor="middle" fontFamily="'Share Tech Mono',monospace" fontSize="4.5" fill={ac.color} opacity={hovered === ac.id ? 1 : 0.6} letterSpacing="0.5">{ac.tail}</text>
                </svg>
              </div>

              {/* Stats grid — key inspection dates */}
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
                {[
                  { label: "ANNUAL", key: "dateAnnual" },
                  { label: "PITOT-STATIC", key: "datePitotStatic" },
                  { label: "TRANSPONDER", key: "dateTransponder" },
                  { label: "ELT", key: "dateEltBattery" },
                ].map((s, i) => {
                  const raw = ac[s.key];
                  const now = new Date();
                  const daysLeft = raw ? Math.ceil((new Date(raw) - now) / 86400000) : null;
                  const statusColor = !raw ? "#3a4050" : daysLeft < 0 ? "#e85a4a" : daysLeft <= 30 ? "#e8c84a" : "#3dbe6c";
                  const displayVal = !raw ? "—" : new Date(raw).toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
                  return (
                    <div key={i} style={{ padding: "8px 12px", background: hovered === ac.id ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)", borderRadius: 4, borderLeft: i === 0 ? `2px solid ${ac.color}50` : "2px solid transparent", transition: "all 0.18s" }}>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "#3a4050", letterSpacing: 2, marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, color: statusColor, letterSpacing: 0.5 }}>{displayVal}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </button>

          {/* ── CARD FOOTER — engine · avionics · edit button · open prompt ── */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 24px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 16 16" width={11} height={11} fill="none">
                <rect x="1" y="4" width="14" height="8" rx="1" stroke="#4a5068" strokeWidth="1.2"/>
                <rect x="3" y="6" width="2" height="4" rx="0.3" fill="#4a5068" opacity="0.6"/>
                <rect x="7" y="6" width="2" height="4" rx="0.3" fill="#4a5068" opacity="0.6"/>
                <path d="M3 4V2M6 4V1.5M10 4V2M13 4V1.5" stroke="#4a5068" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#4a5068" }}>{ac.engine}</span>
            </div>
            <div style={{ width: 1, height: 10, background: "#1e2430" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 16 16" width={11} height={11} fill="none">
                <rect x="1" y="3" width="14" height="10" rx="1" stroke={ac.accentColor} strokeWidth="1.2" opacity="0.5"/>
                <line x1="3" y1="6" x2="13" y2="6" stroke={ac.accentColor} strokeWidth="0.8" opacity="0.4"/>
                <line x1="3" y1="9" x2="10" y2="9" stroke={ac.accentColor} strokeWidth="0.8" opacity="0.4"/>
              </svg>
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#4a5068" }}>{ac.avionics}</span>
            </div>

            {/* Edit button */}
            <button
              onClick={e => { e.stopPropagation(); setEditOpen(true); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(74,159,232,0.07)", border: "1px solid rgba(74,159,232,0.25)",
                borderRadius: 5, padding: "5px 12px", cursor: "pointer",
                fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700,
                letterSpacing: 1.5, color: "#4a9fe8", textTransform: "uppercase",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(74,159,232,0.14)"; e.currentTarget.style.borderColor = "#4a9fe8"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(74,159,232,0.07)"; e.currentTarget.style.borderColor = "rgba(74,159,232,0.25)"; }}
            >
              <svg viewBox="0 0 14 14" width={11} height={11} fill="none">
                <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="#4a9fe8" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M8 4l2 2" stroke="#4a9fe8" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              EDIT PROFILE
            </button>

            <div style={{ marginLeft: "auto", fontFamily: "'Oswald',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, color: hovered === ac.id ? ac.color : "#3a4050", transition: "all 0.18s", textTransform: "uppercase" }}>
              {hovered === ac.id ? "OPEN KNEEBOARD →" : "TAP TO OPEN"}
            </div>
          </div>
        </div>

        {/* Add Aircraft slot — now live */}
        <button
          onClick={() => setAddOpen(true)}
          onMouseEnter={() => setAddHovered(true)}
          onMouseLeave={() => setAddHovered(false)}
          style={{
            display: "block", width: "100%", textAlign: "left",
            background: addHovered ? "rgba(61,190,108,0.04)" : "transparent",
            border: `1.5px dashed ${addHovered ? "#3dbe6c" : "#2a3040"}`,
            borderRadius: 10, padding: "22px 24px", cursor: "pointer",
            animation: "hangarFadeIn 0.35s ease 0.15s both",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Plus icon box */}
            <div style={{
              width: 110, height: 80, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px dashed ${addHovered ? "#3dbe6c" : "#2a3040"}`,
              borderRadius: 8, transition: "all 0.2s",
              background: addHovered ? "rgba(61,190,108,0.06)" : "transparent",
            }}>
              <svg viewBox="0 0 40 40" width={36} height={36} fill="none">
                <circle cx="20" cy="20" r="18" stroke={addHovered ? "#3dbe6c" : "#2a3040"} strokeWidth="1.5" strokeDasharray="4 3"/>
                <line x1="20" y1="11" x2="20" y2="29" stroke={addHovered ? "#3dbe6c" : "#3a4050"} strokeWidth="2" strokeLinecap="round"/>
                <line x1="11" y1="20" x2="29" y2="20" stroke={addHovered ? "#3dbe6c" : "#3a4050"} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: 3, color: addHovered ? "#3dbe6c" : "#4a5068", transition: "color 0.2s" }}>
                ADD AIRCRAFT
              </div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: addHovered ? "#3dbe6c" : "#3a4050", letterSpacing: 2, marginTop: 5, transition: "color 0.2s" }}>
                SEARCH LIBRARY · MANUAL ENTRY · AI SCAN
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "'Oswald',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, color: addHovered ? "#3dbe6c" : "#2a3040", transition: "all 0.2s" }}>
              {addHovered ? "GET STARTED →" : "TAP TO ADD"}
            </div>
          </div>
        </button>

        <div style={{ height: 20 }} />
      </div>

      {/* ── FOOTER ── */}
      <div style={{ flexShrink: 0, background: "#0a0c10", borderTop: "1px solid #1a1e28", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#252830", letterSpacing: 2 }}>APEX AVIATION FLIGHT TRAINING CENTER · KNEEBOARD SYSTEM v2.0 · FOR SIMULATION USE</div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#252830", letterSpacing: 2 }}>POH REF: {ac.pohRef || "CESSNA 172S · REV 2022-05"}</div>
      </div>

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
        <AddAircraftModal onClose={() => setAddOpen(false)} />
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

  // Profile lives here — single source of truth for both Hangar and ChecklistApp
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("apex_kneeboard_profile");
      if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch {}
    return { ...DEFAULT_PROFILE };
  });

  const saveProfile = (next) => {
    setProfile(next);
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
