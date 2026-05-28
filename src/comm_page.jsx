// ─────────────────────────────────────────────────────────────────────────────
// APEX AVIATION — SMART COMMUNICATION AI  (comm_page.jsx)
// Design reference: design_handoff_smartcoms/README.md
// Prop contract preserved for parent cessna172s_checklist.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import { getNearestAirports, FREQ_META } from "./nearest_freqs_data.js";

// ─── ICON COMPONENT ──────────────────────────────────────────────────────────
// 7 stroke icons, 24×24 viewBox, currentColor stroke.
function Icon({ name, size = 18, stroke = 1.6 }) {
  const s = {
    width: size, height: size,
    fill: "none", stroke: "currentColor",
    strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    display: "block", flexShrink: 0,
  };
  switch (name) {
    case "radar":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 12l6-6"/>
        </svg>
      );
    case "mic":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <rect x="9" y="3" width="6" height="11" rx="3"/>
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M6 4l14 8-14 8z" fill="currentColor" stroke="none"/>
        </svg>
      );
    case "reset":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>
        </svg>
      );
    case "alert":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M12 3l10 18H2L12 3zM12 10v5M12 18v.5"/>
        </svg>
      );
    case "copy":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <rect x="9" y="9" width="11" height="11" rx="2"/>
          <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
        </svg>
      );
    case "antenna":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M12 20v-6M8 8a4 4 0 0 1 8 0M5 5a8 8 0 0 1 14 0M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
        </svg>
      );
    case "edit":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" style={s}>
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      );
    default:
      return null;
  }
}


// ─── CLEARANCES CONFIG ────────────────────────────────────────────────────────
const CLEARANCES = [
  {
    id: "atis",
    name: "ATIS",
    sub: "Tap ARM to capture",
    fields: [
      { id: "ident", label: "Information", placeholder: "Ident letter" },
      { id: "wind",  label: "Wind",        placeholder: "Dir/speed (e.g. 270° at 12kt)" },
      { id: "alt",   label: "Altimeter",   placeholder: "e.g. 29.92",  inputMode: "decimal" },
      { id: "vis",   label: "Visibility",  placeholder: "e.g. 10SM" },
      { id: "sky",   label: "Sky",         placeholder: "e.g. FEW 3500" },
      { id: "caut",  label: "Caution",     placeholder: "NOTAMs / hazards / advisories" },
    ],
  },
  {
    id: "taxi",
    name: "Taxi Instructions",
    sub: "Ground frequency",
    fields: [
      { id: "rwy",   label: "Runway",       placeholder: "e.g. 12C" },
      { id: "via",   label: "Taxi Via",     placeholder: "e.g. Y > Y1 > B > H" },
      { id: "hold",  label: "Hold Short",   placeholder: "e.g. RWY 12R", critical: true },
      { id: "instr", label: "Instructions", placeholder: "e.g. Contact tower 119.9 when ready" },
    ],
  },
  {
    id: "clearance",
    name: "Ground Clearance",
    sub: "IFR / VFR",
    fields: [
      { id: "to",    label: "Cleared To", placeholder: "Destination" },
      { id: "route", label: "Route",      placeholder: "Via / as filed" },
      { id: "alt2",  label: "Altitude",   placeholder: "Maintain / expect" },
      { id: "freq",  label: "Departure",  placeholder: "e.g. 124.9",  inputMode: "decimal" },
      { id: "sq",    label: "Squawk",     placeholder: "e.g. 4271",   inputMode: "numeric" },
    ],
  },
];

// ─── TAXI VIA FORMATTER ──────────────────────────────────────────────────────
// Parses raw taxiway input and joins identifiers with " > ".
// Token rules (applied to uppercase, stripped of spaces and existing " > "):
//   • Two consecutive IDENTICAL letters + optional digits → single token (AA, BB, AA1)
//   • One letter + optional digits                        → single token (Y, Y1, B2)
// Examples:
//   YBA    → Y > B > A
//   Y1BA   → Y1 > B > A
//   AA B   → AA > B      (AA stays together because same-letter pair)
//   Y1B2   → Y1 > B2
function formatTaxiVia(raw) {
  // Strip spaces and " > " separators so we always work from bare characters
  const stripped = raw.replace(/[\s>]/g, "");
  if (!stripped) return "";
  // Greedy: same-letter-pair + optional digits first, then single-letter + optional digits
  const tokens = stripped.match(/([A-Z])\1\d*|[A-Z]\d*/g) ?? [];
  return tokens.join(" > ");
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function CommPage({
  aircraft,
  listening,
  txLog = [],
  onStartListen,
  onStopListen,
  onReplay,
  onClearLog,
  forceFreqTab,
  atisData,  onSetAtisData,  atisArmState,  onArmAtis,  onClearAtisRaw,
  taxiData,  onSetTaxiData,  taxiArmState,  onArmTaxi,  onClearTaxiRaw,
  gndData,   onSetGndData,   gndArmState,   onArmGnd,   onClearGndRaw,
  // Remaining props accepted silently to preserve parent contract
  ...rest
}) {
  const [tab, setTab] = useState("active");

  // Jump to Nearest Freqs tab when triggered from the header NRST widget
  useEffect(() => {
    if (forceFreqTab > 0) setTab("freq");
  }, [forceFreqTab]);
  const [editPopover, setEditPopover] = useState(null); // { id, label, value, inputMode }

  const openEdit = (f) => setEditPopover({ id: f.id, label: f.label, value: getFieldValue(f.id), inputMode: f.inputMode });
  const confirmEdit = (val) => { setField(editPopover.id, val); setEditPopover(null); };

  // ── Map design field IDs → parent data values ──
  const getFieldValue = (id) => {
    const map = {
      ident: atisData?.info,        wind:  atisData?.wind,
      alt:   atisData?.altimeter,   vis:   atisData?.visibility,
      sky:   atisData?.sky,         caut:  atisData?.caution,
      rwy:   taxiData?.runway,      via:   taxiData?.route,
      hold:  taxiData?.holdShort,   instr: taxiData?.instructions,
      to:    gndData?.clearedTo,    route: gndData?.route,
      alt2:  gndData?.altitude,     freq:  gndData?.frequency,
      sq:    gndData?.squawk,
    };
    return map[id] ?? "";
  };

  // ── Map design field IDs → parent set callbacks ──
  const setField = (id, value) => {
    const atisMap = { ident: "info", wind: "wind", alt: "altimeter", vis: "visibility", sky: "sky", caut: "caution" };
    const taxiMap = { rwy: "runway", via: "route", hold: "holdShort", instr: "instructions" };
    const gndMap  = { to: "clearedTo", route: "route", alt2: "altitude", freq: "frequency", sq: "squawk" };
    if (id in atisMap)      onSetAtisData?.({ ...atisData, [atisMap[id]]: value });
    else if (id in taxiMap) onSetTaxiData?.({ ...taxiData, [taxiMap[id]]: value });
    else if (id in gndMap)  onSetGndData?.({ ...gndData,  [gndMap[id]]:  value });
  };

  // ── Armed state from parent ──
  const isArmed = (cardId) => {
    if (cardId === "atis")      return atisArmState === "armed" || atisArmState === "done";
    if (cardId === "taxi")      return taxiArmState === "armed" || taxiArmState === "done";
    if (cardId === "clearance") return gndArmState  === "armed" || gndArmState  === "done";
    return false;
  };

  const handleArm = (cardId) => {
    if (cardId === "atis")           onArmAtis?.();
    else if (cardId === "taxi")      onArmTaxi?.();
    else if (cardId === "clearance") onArmGnd?.();
  };

  const handleClear = (cardId) => {
    if (cardId === "atis")           onClearAtisRaw?.();
    else if (cardId === "taxi")      onClearTaxiRaw?.();
    else if (cardId === "clearance") onClearGndRaw?.();
  };

  // ── Has any captured data? (controls empty-state visibility) ──
  const hasValues = (
    Object.values(atisData || {}).some(Boolean) ||
    Object.values(taxiData || {}).some(Boolean) ||
    Object.values(gndData  || {}).some(Boolean)
  );

  const handleListen = () => {
    if (listening) onStopListen?.();
    else onStartListen?.();
  };

  const tail = aircraft?.tail ?? "N/A";

  return (
    <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
      <div className="content-inner">

        {/* ── Radio Hero ── */}
        <div className="radio-hero">
          <div className="radio-hero-head">
            <div className="radio-hero-title">
              <span className="radio-hero-icon">
                <Icon name="radar" size={18}/>
              </span>
              <div>
                <div className="radio-hero-name">Smart Communication AI</div>
                <div className="radio-hero-sub">
                  Callsign: {tail} · {listening ? "Listening" : "Standby"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={`btn btn-sm ${listening ? "btn-warn" : "btn-primary"}`}
                onClick={handleListen}
              >
                <Icon name={listening ? "mic" : "play"} size={11}/>
                {listening ? "STOP" : "LISTEN"}
              </button>
            </div>
          </div>

          <Waveform live={listening}/>

          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 11,
            color: "var(--t-tertiary)", letterSpacing: "0.06em", textAlign: "center",
          }}>
            {listening ? (
              <>
                <span>TRANSCRIBING · 121.500 MHz · </span>
                <span style={{ color: "var(--accent)" }}>conf 96%</span>
              </>
            ) : (
              "TAP LISTEN TO BEGIN MONITORING"
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="radio-tabs">
          <div
            className={`radio-tab${tab === "active" ? " active" : ""}`}
            onClick={() => setTab("active")}
          >
            Active Feed
          </div>
          <div
            className={`radio-tab${tab === "archive" ? " active" : ""}`}
            onClick={() => setTab("archive")}
          >
            Archive Log{" "}
            <span className="tab-count">{txLog.length > 0 ? txLog.length : 0}</span>
          </div>
          <div
            className={`radio-tab${tab === "freq" ? " active" : ""}`}
            onClick={() => setTab("freq")}
          >
            Nearest Freqs <span className="tab-count">6</span>
          </div>
        </div>

        {/* ── Active Feed ── */}
        {tab === "active" && (
          <>
            {/* Recent transmissions quick reference — top 5, only shown when data exists */}
            {txLog.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--t-tertiary)",
                  marginBottom: 8,
                }}>
                  Recent Transmissions
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <TransmissionFeed txLog={txLog} limit={5}/>
                </div>
              </div>
            )}

            {/* Empty state — only when idle and nothing captured yet */}
            {!listening && !hasValues && (
              <div className="radio-empty">
                <div className="radio-empty-icon">
                  <Icon name="antenna" size={22}/>
                </div>
                <div className="radio-empty-title">Awaiting Transmission</div>
                <div className="radio-empty-sub">
                  Forms below auto-fill from captured ATC audio.
                </div>
              </div>
            )}

            {/* Clearance cards */}
            {CLEARANCES.map((c) => (
              <div
                key={c.id}
                className={`clearance-card${isArmed(c.id) ? " armed" : ""}`}
              >
                <div className="clearance-head">
                  <div className="clearance-title">
                    <span className="clearance-name">{c.name}</span>
                    <span className="clearance-sub">{c.sub}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className={`btn btn-sm${isArmed(c.id) ? " btn-ok" : ""}`}
                      onClick={() => handleArm(c.id)}
                    >
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                        background: isArmed(c.id) ? "var(--ok)" : "var(--t-quiet)",
                      }}/>
                      {isArmed(c.id) ? "ARMED" : "ARM"}
                    </button>
                    <button
                      className="btn btn-sm btn-warn"
                      onClick={() => handleClear(c.id)}
                    >
                      <Icon name="reset" size={10}/>
                      CLR
                    </button>
                  </div>
                </div>

                <div className="clearance-body">
                  {c.fields.map((f) => (
                    <React.Fragment key={f.id}>
                      {f.critical && (
                        <div className="hold-short-banner">
                          <Icon name="alert" size={10}/>
                          Hold Short
                        </div>
                      )}
                      <button
                        className={[
                          "field-row",
                          f.critical ? "critical" : "",
                          getFieldValue(f.id) ? "has-value" : "",
                        ].filter(Boolean).join(" ")}
                        onClick={() => openEdit(f)}
                      >
                        <span className="field-row-label">{f.label}</span>
                        <span className={`field-row-value${!getFieldValue(f.id) ? " empty" : ""}`}>
                          {getFieldValue(f.id) || f.placeholder}
                        </span>
                        <span className="field-row-hint">›</span>
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}

            {/* Replay bar */}
            <div className="radio-replay-bar" onClick={() => onReplay?.(10)}>
              <Icon name="play" size={11}/>
              Replay Last 10 Seconds
            </div>
          </>
        )}

        {tab === "archive" && <ArchiveLog txLog={txLog} onClearLog={onClearLog}/>}
        {tab === "freq"    && <NearestFreqs/>}

      </div>

      {/* ── Field edit popover ── */}
      {editPopover && (
        <EditPopover
          fieldId={editPopover.id}
          label={editPopover.label}
          initialValue={editPopover.value}
          inputMode={editPopover.inputMode}
          onConfirm={confirmEdit}
          onCancel={() => setEditPopover(null)}
        />
      )}
    </div>
  );
}

// ─── EDIT POPOVER ─────────────────────────────────────────────────────────────
// Centered modal for correcting a single transcribed field.
// Dispatches to a specialized sub-editor based on fieldId.
function EditPopover({ fieldId, label, initialValue, inputMode = "text", onConfirm, onCancel }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(7,10,15,0.75)",
          zIndex: 400,
          backdropFilter: "blur(3px)",
        }}
      />

      {/* Centered modal */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 401,
        background: "var(--bg-1)",
        border: "1px solid var(--accent-line)",
        borderRadius: "var(--r-lg)",
        padding: "24px",
        width: "min(440px, calc(100vw - 32px))",
        display: "flex", flexDirection: "column", gap: 18,
        boxShadow: "0 16px 56px rgba(0,0,0,0.7)",
      }}>
        {/* Header */}
        <div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 10,
            color: "var(--accent)", letterSpacing: "0.12em",
            textTransform: "uppercase", marginBottom: 4,
          }}>
            Editing — {label}
          </div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 11,
            color: "var(--t-tertiary)", letterSpacing: "0.06em",
          }}>
            {fieldId === "wind"  ? "Enter speed, direction, and optional gust" :
             fieldId === "vis"   ? "Enter visibility — SM will be appended" :
             fieldId === "sky"   ? "Select condition, then enter altitude if required" :
             fieldId === "alt"   ? "Type 4 digits — decimal placed automatically (e.g. 2994 → 29.94)" :
             fieldId === "via"   ? "Type taxiways without spaces — arrows added automatically (e.g. YBA → Y > B > A)" :
             fieldId === "route" ? "Tap As Filed or enter a custom route — all caps" :
             fieldId === "alt2"  ? "Enter maintain altitude, expected altitude, and minutes" :
             fieldId === "freq"  ? "Type 4 digits — decimal placed automatically (e.g. 1249 → 124.9)" :
                                   "Correct the transcribed value below"}
          </div>
        </div>

        {/* Dispatch to the right sub-editor */}
        {fieldId === "wind" ? (
          <WindEditor initialValue={initialValue} onConfirm={onConfirm} onCancel={onCancel}/>
        ) : fieldId === "vis" ? (
          <VisEditor initialValue={initialValue} onConfirm={onConfirm} onCancel={onCancel}/>
        ) : fieldId === "sky" ? (
          <SkyEditor initialValue={initialValue} onConfirm={onConfirm} onCancel={onCancel}/>
        ) : fieldId === "alt2" ? (
          <ClearanceAltEditor initialValue={initialValue} onConfirm={onConfirm} onCancel={onCancel}/>
        ) : fieldId === "route" ? (
          <RouteEditor initialValue={initialValue} onConfirm={onConfirm} onCancel={onCancel}/>
        ) : (
          <DefaultEditor fieldId={fieldId} initialValue={initialValue} inputMode={inputMode} onConfirm={onConfirm} onCancel={onCancel}/>
        )}
      </div>
    </>
  );
}

// ─── DEFAULT EDITOR ───────────────────────────────────────────────────────────
// Generic large-input editor with per-field transforms:
// • ident / rwy / hold / to → forced uppercase
// • alt                     → auto-decimal after 2 digits (2994 → 29.94)
// • via                     → taxiway auto-formatter (YBA → Y > B > A)
// • freq                    → frequency format after 3 digits (1249 → 124.9)
function DefaultEditor({ fieldId, initialValue, inputMode = "text", onConfirm, onCancel }) {
  const [val, setVal] = useState(initialValue ?? "");
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 60);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => {
    const raw = e.target.value;
    if (fieldId === "alt") {
      const digits = raw.replace(/\D/g, "").slice(0, 4);
      setVal(digits.length > 2 ? `${digits.slice(0, 2)}.${digits.slice(2)}` : digits);
    } else if (fieldId === "freq") {
      const digits = raw.replace(/\D/g, "").slice(0, 4);
      setVal(digits.length > 3 ? `${digits.slice(0, 3)}.${digits.slice(3)}` : digits);
    } else if (fieldId === "ident" || fieldId === "rwy" || fieldId === "hold" || fieldId === "to") {
      setVal(raw.toUpperCase());
    } else if (fieldId === "via") {
      setVal(formatTaxiVia(raw.toUpperCase()));
    } else {
      setVal(raw);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter")  onConfirm(val);
    if (e.key === "Escape") onCancel();
  };

  return (
    <>
      <input
        ref={inputRef}
        value={val}
        onChange={handleChange}
        inputMode={inputMode}
        onKeyDown={handleKey}
        style={{
          fontFamily: "var(--f-mono)",
          fontSize: 28, fontWeight: 600,
          letterSpacing: "0.04em",
          background: "var(--bg-inset)",
          border: "1px solid var(--accent-line)",
          borderRadius: "var(--r-md)",
          padding: "16px 18px",
          color: "var(--t-primary)",
          width: "100%", boxSizing: "border-box",
          outline: "none",
          caretColor: "var(--accent)",
          textAlign: "center",
        }}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-sm btn-ghost" onClick={onCancel} style={{ flex: 1, height: 44, fontSize: 12 }}>
          Cancel
        </button>
        <button className="btn btn-sm btn-primary" onClick={() => onConfirm(val)} style={{ flex: 2, height: 44, fontSize: 13, fontWeight: 600 }}>
          <Icon name="check" size={14}/>Confirm
        </button>
      </div>
    </>
  );
}

// ─── WIND EDITOR ─────────────────────────────────────────────────────────────
// Three-field structured input: [speed] @ [direction] Gusting [gust(optional)]
// Preview line shows the built string live. Gust is optional — omitted if blank.
function WindEditor({ initialValue, onConfirm, onCancel }) {
  // Parse stored format "X @ Y gusting Z" or "X @ Y"
  const parse = (v = "") => {
    const lc = v.toLowerCase();
    const g = lc.match(/(\d+)\s*@\s*(\d+)\s+gusting\s+(\d+)/);
    if (g) return { speed: g[1], dir: g[2], gust: g[3] };
    const s = lc.match(/(\d+)\s*@\s*(\d+)/);
    if (s) return { speed: s[1], dir: s[2], gust: "" };
    return { speed: "", dir: "", gust: "" };
  };

  const init = parse(initialValue);
  const [speed, setSpeed] = useState(init.speed);
  const [dir,   setDir]   = useState(init.dir);
  const [gust,  setGust]  = useState(init.gust);
  const speedRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => speedRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  const preview = speed && dir
    ? `${speed} @ ${dir}${gust ? ` gusting ${gust}` : ""}`
    : null;

  const fieldStyle = {
    fontFamily: "var(--f-mono)",
    fontSize: 22, fontWeight: 600,
    letterSpacing: "0.04em",
    background: "var(--bg-inset)",
    border: "1px solid var(--accent-line)",
    borderRadius: "var(--r-md)",
    padding: "10px 8px",
    color: "var(--t-primary)",
    width: "100%", boxSizing: "border-box",
    outline: "none",
    caretColor: "var(--accent)",
    textAlign: "center",
  };

  const labelStyle = {
    fontFamily: "var(--f-mono)", fontSize: 9,
    color: "var(--t-tertiary)", letterSpacing: "0.1em",
    textTransform: "uppercase", marginBottom: 5,
    textAlign: "center",
  };

  const divStyle = {
    fontFamily: "var(--f-mono)", fontSize: 17, fontWeight: 600,
    color: "var(--t-tertiary)", flexShrink: 0,
    alignSelf: "flex-end", paddingBottom: 11,
  };

  return (
    <>
      {/* Template row: [speed kt] @ [dir °]  Gusting  [gust kt] */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>Speed kt</div>
          <input ref={speedRef} value={speed} onChange={e => setSpeed(e.target.value.replace(/\D/g, ""))} inputMode="numeric" style={fieldStyle}/>
        </div>
        <span style={divStyle}>@</span>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>Dir °</div>
          <input value={dir} onChange={e => setDir(e.target.value.replace(/\D/g, ""))} inputMode="numeric" style={fieldStyle}/>
        </div>
        <span style={{ ...divStyle, fontSize: 10, paddingBottom: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}>Gust</span>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>Gust kt</div>
          <input
            value={gust}
            onChange={e => setGust(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="opt"
            style={{ ...fieldStyle, opacity: gust ? 1 : 0.5 }}
          />
        </div>
      </div>

      {/* Live preview */}
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: 15, fontWeight: 700,
        letterSpacing: "0.04em",
        color: preview ? "var(--t-primary)" : "var(--t-quiet)",
        background: "var(--bg-inset)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-md)",
        padding: "10px 14px",
        textAlign: "center",
      }}>
        {preview ?? "— fill speed and direction —"}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-sm btn-ghost" onClick={onCancel} style={{ flex: 1, height: 44, fontSize: 12 }}>Cancel</button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => preview && onConfirm(preview)}
          disabled={!speed || !dir}
          style={{ flex: 2, height: 44, fontSize: 13, fontWeight: 600 }}
        >
          <Icon name="check" size={14}/>Confirm
        </button>
      </div>
    </>
  );
}

// ─── VISIBILITY EDITOR ────────────────────────────────────────────────────────
// Number input with a static "SM" suffix tile. Stores result as e.g. "10SM".
function VisEditor({ initialValue, onConfirm, onCancel }) {
  const initNum = (initialValue ?? "").replace(/sm/i, "").trim();
  const [num, setNum] = useState(initNum);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 60);
    return () => clearTimeout(t);
  }, []);

  const handleKey = (e) => {
    if (e.key === "Enter"  && num) onConfirm(`${num}SM`);
    if (e.key === "Escape")        onCancel();
  };

  return (
    <>
      {/* Number + SM suffix */}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <input
          ref={inputRef}
          value={num}
          onChange={e => setNum(e.target.value.replace(/[^\d.]/g, ""))}
          inputMode="decimal"
          onKeyDown={handleKey}
          placeholder="10"
          style={{
            fontFamily: "var(--f-mono)",
            fontSize: 32, fontWeight: 700,
            letterSpacing: "0.04em",
            background: "var(--bg-inset)",
            border: "1px solid var(--accent-line)",
            borderRight: "none",
            borderRadius: "var(--r-md) 0 0 var(--r-md)",
            padding: "14px 18px",
            color: "var(--t-primary)",
            flex: 1, minWidth: 0,
            outline: "none",
            caretColor: "var(--accent)",
            textAlign: "center",
          }}
        />
        <div style={{
          fontFamily: "var(--f-mono)",
          fontSize: 22, fontWeight: 700,
          color: "var(--t-secondary)",
          background: "var(--bg-2)",
          border: "1px solid var(--accent-line)",
          borderLeft: "none",
          borderRadius: "0 var(--r-md) var(--r-md) 0",
          padding: "14px 18px",
          display: "flex", alignItems: "center",
          letterSpacing: "0.08em",
          flexShrink: 0,
        }}>
          SM
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-sm btn-ghost" onClick={onCancel} style={{ flex: 1, height: 44, fontSize: 12 }}>Cancel</button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => num && onConfirm(`${num}SM`)}
          disabled={!num}
          style={{ flex: 2, height: 44, fontSize: 13, fontWeight: 600 }}
        >
          <Icon name="check" size={14}/>Confirm
        </button>
      </div>
    </>
  );
}

// ─── SKY EDITOR ───────────────────────────────────────────────────────────────
// 6 tap-to-select condition buttons (CLR SKC FEW SCT BKN OVC) + optional
// altitude input for ceiling conditions. Preview shows the built METAR string.
function SkyEditor({ initialValue, onConfirm, onCancel }) {
  const CONDITIONS  = ["CLR", "SKC", "FEW", "SCT", "BKN", "OVC"];
  const NEEDS_ALT   = ["FEW", "SCT", "BKN", "OVC"];

  const parse = (v = "") => {
    const parts = v.trim().toUpperCase().split(/\s+/);
    const cond  = CONDITIONS.includes(parts[0]) ? parts[0] : null;
    return { cond, alt: parts[1] ?? "" };
  };

  const init = parse(initialValue);
  const [cond, setCond] = useState(init.cond);
  const [alt,  setAlt]  = useState(init.alt);
  const altRef = useRef(null);

  const needsAlt = NEEDS_ALT.includes(cond);

  useEffect(() => {
    if (needsAlt) {
      const t = setTimeout(() => altRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [cond, needsAlt]);

  const handleSelect = (c) => {
    setCond(c);
    if (!NEEDS_ALT.includes(c)) setAlt("");
  };

  // previewStr always shows feedback (uses ___ when altitude is pending)
  const previewStr = !cond ? null
    : needsAlt ? `${cond}${alt ? ` ${alt}` : " ___"}` : cond;

  // resultStr is the clean value we'll save — null until ready to confirm
  const resultStr  = !cond ? null
    : needsAlt && alt ? `${cond} ${alt}` : !needsAlt ? cond : null;

  const canConfirm = !!cond && (!needsAlt || !!alt);

  return (
    <>
      {/* Condition tap buttons — 3×2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {CONDITIONS.map(c => (
          <button
            key={c}
            onClick={() => handleSelect(c)}
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: 15, fontWeight: 700,
              letterSpacing: "0.1em",
              padding: "13px 0",
              borderRadius: "var(--r-md)",
              border: cond === c ? "2px solid var(--accent)" : "1px solid var(--line)",
              background: cond === c ? "var(--accent-bg)" : "var(--bg-inset)",
              color: cond === c ? "var(--accent)" : "var(--t-secondary)",
              cursor: "pointer",
              transition: "all 0.1s",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Altitude input — only when a ceiling condition is selected */}
      {needsAlt && (
        <div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 9,
            color: "var(--t-tertiary)", letterSpacing: "0.1em",
            textTransform: "uppercase", marginBottom: 6,
          }}>
            Altitude (ft — e.g. 3500)
          </div>
          <input
            ref={altRef}
            value={alt}
            onChange={e => setAlt(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="3500"
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: 28, fontWeight: 600,
              letterSpacing: "0.04em",
              background: "var(--bg-inset)",
              border: "1px solid var(--accent-line)",
              borderRadius: "var(--r-md)",
              padding: "14px 18px",
              color: "var(--t-primary)",
              width: "100%", boxSizing: "border-box",
              outline: "none",
              caretColor: "var(--accent)",
              textAlign: "center",
            }}
          />
        </div>
      )}

      {/* Live preview */}
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: 15, fontWeight: 700,
        letterSpacing: "0.06em",
        color: resultStr ? "var(--t-primary)" : "var(--t-quiet)",
        background: "var(--bg-inset)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-md)",
        padding: "10px 14px",
        textAlign: "center",
      }}>
        {previewStr ?? "— tap a condition —"}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-sm btn-ghost" onClick={onCancel} style={{ flex: 1, height: 44, fontSize: 12 }}>Cancel</button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => resultStr && onConfirm(resultStr)}
          disabled={!canConfirm}
          style={{ flex: 2, height: 44, fontSize: 13, fontWeight: 600 }}
        >
          <Icon name="check" size={14}/>Confirm
        </button>
      </div>
    </>
  );
}

// ─── CLEARANCE ALTITUDE EDITOR ───────────────────────────────────────────────
// Structured input for IFR clearance altitude.
// Three rows: [Maintain ___] [Expect ___] [___ min after dep]
// Expect and minutes are optional. Output: "Maintain 4000 Expect 6000 10 minutes after departure"
function ClearanceAltEditor({ initialValue, onConfirm, onCancel }) {
  const parse = (v = "") => {
    const m = v.match(/[Mm]aintain\s+(\d+)/);
    const e = v.match(/[Ee]xpect\s+(\d+)/);
    const n = v.match(/(\d+)\s+min/);
    return { maintain: m?.[1] ?? "", expect: e?.[1] ?? "", minutes: n?.[1] ?? "" };
  };

  const init = parse(initialValue);
  const [maintain, setMaintain] = useState(init.maintain);
  const [expect,   setExpect]   = useState(init.expect);
  const [minutes,  setMinutes]  = useState(init.minutes);
  const maintainRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => maintainRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  const buildResult = () => {
    if (!maintain) return null;
    let r = `Maintain ${maintain}`;
    if (expect) {
      r += ` Expect ${expect}`;
      if (minutes) r += ` ${minutes} minutes after departure`;
    }
    return r;
  };
  const preview = buildResult();

  const fieldStyle = {
    fontFamily: "var(--f-mono)", fontSize: 22, fontWeight: 600,
    letterSpacing: "0.04em", background: "var(--bg-inset)",
    border: "1px solid var(--accent-line)", borderRadius: "var(--r-md)",
    padding: "10px 8px", color: "var(--t-primary)",
    width: "100%", boxSizing: "border-box",
    outline: "none", caretColor: "var(--accent)", textAlign: "center",
  };
  const rowLabel = {
    fontFamily: "var(--f-mono)", fontSize: 11, fontWeight: 700,
    color: "var(--t-secondary)", flexShrink: 0,
    alignSelf: "flex-end", paddingBottom: 11,
    letterSpacing: "0.08em", textTransform: "uppercase",
  };
  const subLabel = {
    fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--t-tertiary)",
    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5,
  };

  return (
    <>
      {/* Row 1: MAINTAIN [altitude] */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <span style={rowLabel}>Maintain</span>
        <div style={{ flex: 1 }}>
          <div style={subLabel}>Altitude (ft)</div>
          <input ref={maintainRef} value={maintain} onChange={e => setMaintain(e.target.value.replace(/\D/g, ""))} inputMode="numeric" style={fieldStyle}/>
        </div>
      </div>

      {/* Row 2: EXPECT [altitude] */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <span style={rowLabel}>Expect</span>
        <div style={{ flex: 1 }}>
          <div style={subLabel}>Altitude (ft) — optional</div>
          <input value={expect} onChange={e => setExpect(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="optional" style={{ ...fieldStyle, opacity: expect ? 1 : 0.5 }}/>
        </div>
      </div>

      {/* Row 3: [minutes] MIN AFTER DEP */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <div style={{ flex: "0 0 72px" }}>
          <div style={subLabel}>Minutes</div>
          <input value={minutes} onChange={e => setMinutes(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="opt" style={{ ...fieldStyle, opacity: minutes ? 1 : 0.5 }}/>
        </div>
        <span style={{ ...rowLabel, fontSize: 10, letterSpacing: "0.06em" }}>min after dep</span>
      </div>

      {/* Live preview */}
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: 13, fontWeight: 700,
        letterSpacing: "0.04em", lineHeight: 1.5,
        color: preview ? "var(--t-primary)" : "var(--t-quiet)",
        background: "var(--bg-inset)", border: "1px solid var(--line)",
        borderRadius: "var(--r-md)", padding: "10px 14px", textAlign: "center",
      }}>
        {preview ?? "— enter maintain altitude —"}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-sm btn-ghost" onClick={onCancel} style={{ flex: 1, height: 44, fontSize: 12 }}>Cancel</button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => preview && onConfirm(preview)}
          disabled={!maintain}
          style={{ flex: 2, height: 44, fontSize: 13, fontWeight: 600 }}
        >
          <Icon name="check" size={14}/>Confirm
        </button>
      </div>
    </>
  );
}

// ─── ROUTE EDITOR ─────────────────────────────────────────────────────────────
// Two-mode selector for IFR/VFR route.
// AS FILED mode: confirms with "As filed" instantly on button tap.
// VIA mode: all-caps free-text input for custom route/fixes.
function RouteEditor({ initialValue, onConfirm, onCancel }) {
  const isAsFiledStr = /^as\s+filed$/i.test((initialValue ?? "").trim());
  const [mode, setMode] = useState(isAsFiledStr ? "filed" : "via");
  const [via,  setVia]  = useState(isAsFiledStr ? "" : (initialValue ?? "").toUpperCase());
  const inputRef = useRef(null);

  useEffect(() => {
    if (mode === "via") {
      const t = setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 80);
      return () => clearTimeout(t);
    }
  }, [mode]);

  const btnBase = (active) => ({
    fontFamily: "var(--f-mono)", fontSize: 14, fontWeight: 700,
    letterSpacing: "0.1em", padding: "16px 0",
    borderRadius: "var(--r-md)",
    border: active ? "2px solid var(--accent)" : "1px solid var(--line)",
    background: active ? "var(--accent-bg)" : "var(--bg-inset)",
    color: active ? "var(--accent)" : "var(--t-secondary)",
    cursor: "pointer", transition: "all 0.1s",
  });

  return (
    <>
      {/* Mode toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button onClick={() => setMode("filed")} style={btnBase(mode === "filed")}>AS FILED</button>
        <button onClick={() => setMode("via")}   style={btnBase(mode === "via")}>VIA…</button>
      </div>

      {/* Custom route input — shown in VIA mode */}
      {mode === "via" && (
        <input
          ref={inputRef}
          value={via}
          onChange={e => setVia(e.target.value.toUpperCase())}
          inputMode="text"
          placeholder="FIXES / AIRWAYS / ROUTE"
          style={{
            fontFamily: "var(--f-mono)", fontSize: 18, fontWeight: 600,
            letterSpacing: "0.04em",
            background: "var(--bg-inset)", border: "1px solid var(--accent-line)",
            borderRadius: "var(--r-md)", padding: "14px 16px",
            color: "var(--t-primary)", width: "100%", boxSizing: "border-box",
            outline: "none", caretColor: "var(--accent)",
          }}
        />
      )}

      {/* Preview */}
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: 14, fontWeight: 700,
        letterSpacing: "0.04em",
        color: (mode === "filed" || via.trim()) ? "var(--t-primary)" : "var(--t-quiet)",
        background: "var(--bg-inset)", border: "1px solid var(--line)",
        borderRadius: "var(--r-md)", padding: "10px 14px", textAlign: "center",
      }}>
        {mode === "filed" ? "As filed" : (via.trim() || "— enter route —")}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-sm btn-ghost" onClick={onCancel} style={{ flex: 1, height: 44, fontSize: 12 }}>Cancel</button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            const result = mode === "filed" ? "As filed" : via.trim();
            if (result) onConfirm(result);
          }}
          disabled={mode === "via" && !via.trim()}
          style={{ flex: 2, height: 44, fontSize: 13, fontWeight: 600 }}
        >
          <Icon name="check" size={14}/>Confirm
        </button>
      </div>
    </>
  );
}

// ─── WAVEFORM ─────────────────────────────────────────────────────────────────
// 64 bars; gentle sin + noise when live, flat 3px when idle.
function Waveform({ live }) {
  const [bars, setBars] = useState(() => Array.from({ length: 64 }, () => 6));

  useEffect(() => {
    if (!live) {
      setBars(Array.from({ length: 64 }, () => 3));
      return;
    }
    const id = setInterval(() => {
      setBars((prev) =>
        prev.map((_, i) => {
          const base  = 8 + Math.sin(Date.now() / 300 + i * 0.4) * 12;
          const noise = Math.random() * 30;
          return Math.max(4, Math.min(48, base + noise));
        })
      );
    }, 80);
    return () => clearInterval(id);
  }, [live]);

  return (
    <div className={`waveform${live ? "" : " idle"}`}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{ height: h, opacity: live ? 0.35 + (h / 48) * 0.6 : 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
function fmtTs(ts) {
  if (!ts) return "—";
  try {
    const d = ts instanceof Date ? ts : new Date(ts);
    return d.toISOString().slice(11, 16) + "Z";
  } catch { return "—"; }
}

function fmtType(type) {
  if (!type) return "GENERAL";
  const lookup = {
    ifr_departure: "IFR CLRNCE",
    ifr_approach:  "IFR APPRCH",
    landing:       "LANDING",
    pattern:       "PATTERN",
    general:       "GENERAL",
    tower:         "TOWER",
    ground:        "GROUND",
    clnc_del:      "CLNC DEL",
    atis:          "ATIS",
  };
  return lookup[type] ?? type.replace(/_/g, " ").toUpperCase().slice(0, 10);
}

// ─── TRANSMISSION FEED ────────────────────────────────────────────────────────
// Renders entries from txLog in archive-entry format.
// txLog is expected newest-first (index 0 = most recent transmission).
// Pass `limit` to cap the number shown (active feed uses 5). Omit to show all.
function TransmissionFeed({ txLog = [], limit }) {
  const entries = limit !== undefined ? txLog.slice(0, limit) : txLog;
  return (
    <>
      {entries.map((e, i) => (
        <div key={e.id ?? i} className="archive-entry">
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--t-tertiary)", letterSpacing: "0.06em" }}>
            {fmtTs(e.ts)}
          </span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {fmtType(e.type)}
          </span>
          <span style={{ fontFamily: "var(--f-ui)", fontSize: 13, color: "var(--t-secondary)" }}>
            {e.text}
          </span>
          <button className="btn btn-sm btn-ghost">
            <Icon name="play" size={10}/>
            4s
          </button>
        </div>
      ))}
    </>
  );
}

// ─── ARCHIVE LOG ──────────────────────────────────────────────────────────────
// Full scrollable log — all transmissions, newest first, paginated in batches
// of PAGE_SIZE so the list stays fast even with thousands of entries.
// Falls back to placeholder rows when the log is empty.
const PAGE_SIZE = 20;

function ArchiveLog({ txLog = [], onClearLog }) {
  const [shown,        setShown]        = useState(PAGE_SIZE);
  const [confirmClear, setConfirmClear] = useState(false);

  const source    = txLog;
  const visible   = source.slice(0, shown);
  const remaining = source.length - shown;

  // Reset pagination when the log changes (e.g. after clear)
  useEffect(() => { setShown(PAGE_SIZE); setConfirmClear(false); }, [txLog]);

  const handleClear = () => {
    onClearLog?.();
    setConfirmClear(false);
  };

  const mono = { fontFamily: "var(--f-mono)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

      {/* Header bar — count + clear control (only when there are real entries) */}
      {txLog.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ ...mono, fontSize: 10, color: "var(--t-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {txLog.length} transmission{txLog.length !== 1 ? "s" : ""} stored
          </span>

          {!confirmClear ? (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setConfirmClear(true)}
              style={{ fontSize: 11, color: "var(--warn)" }}
            >
              Clear Log
            </button>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setConfirmClear(false)}
                style={{ fontSize: 11 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-warn"
                onClick={handleClear}
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                Confirm Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Entries or empty state */}
      {txLog.length === 0 ? (
        <div style={{ ...mono, fontSize: 11, color: "var(--t-tertiary)", textAlign: "center", padding: "40px 0", letterSpacing: "0.06em" }}>
          No transmissions recorded yet
        </div>
      ) : (
        <TransmissionFeed txLog={visible}/>
      )}

      {/* Load more */}
      {remaining > 0 && (
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setShown(s => s + PAGE_SIZE)}
          style={{ width: "100%", marginTop: 4, fontSize: 12, letterSpacing: "0.04em" }}
        >
          Show {Math.min(PAGE_SIZE, remaining)} more
          <span style={{ ...mono, fontSize: 10, color: "var(--t-tertiary)", marginLeft: 8 }}>
            {remaining} remaining
          </span>
        </button>
      )}

    </div>
  );
}

// ─── NEAREST FREQS ────────────────────────────────────────────────────────────
// Continuously updated frequency list driven by the device GPS.
// Uses watchPosition — no user input required. Recomputes nearest airports
// on every position update so the list stays current throughout the flight.
// Guard 121.500 is always pinned as the last tile.
function NearestFreqs() {
  const [pos,          setPos]          = useState(null);  // { lat, lon, accuracy }
  const [fixing,       setFixing]       = useState(true);  // waiting for first fix
  const [gpsErr,       setGpsErr]       = useState(null);  // human-readable error string
  const [visibleCount, setVisibleCount] = useState(7);     // airports shown

  useEffect(() => {
    if (!navigator?.geolocation) {
      setGpsErr("Geolocation is not supported on this device.");
      setFixing(false);
      return;
    }

    const onSuccess = ({ coords }) => {
      setPos({
        lat:      coords.latitude,
        lon:      coords.longitude,
        accuracy: Math.round(coords.accuracy),
      });
      setFixing(false);
      setGpsErr(null);
    };

    const onError = (err) => {
      setGpsErr(
        err.code === 1 ? "Location access denied — enable in device Settings." :
        err.code === 2 ? "GPS signal unavailable. Check antenna / sky view." :
                         "GPS timed out. Retrying…"
      );
      setFixing(false);
    };

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge:  10000,  // accept a cached fix up to 10 s old on first render
      timeout:     20000,  // surface an error if no fix within 20 s
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ── Waiting for first fix ──────────────────────────────────────────────────
  if (fixing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "52px 24px" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)", animation: "lgd-flash 1s step-end infinite", display: "block" }}/>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--t-secondary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Acquiring GPS fix…
        </span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--t-tertiary)", letterSpacing: "0.06em" }}>
          Ensure Location Services are enabled
        </span>
      </div>
    );
  }

  // ── GPS error ─────────────────────────────────────────────────────────────
  if (gpsErr) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "52px 24px" }}>
        <Icon name="alert" size={22} stroke={1.5}/>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--warn)", letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.6 }}>
          {gpsErr}
        </span>
      </div>
    );
  }

  // ── Live — compute groups from real position ──────────────────────────────
  // Pull up to 50 airports within 100 nm, sorted nearest-first
  const airports = getNearestAirports(pos.lat, pos.lon, 50, 100);
  const visible   = airports.slice(0, visibleCount);
  const remaining = airports.length - visibleCount;

  return (
    <div>
      {/* GPS status strip */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 10px", marginBottom: 12,
        background: "var(--bg-inset)", border: "1px solid var(--line)",
        borderRadius: "var(--r-sm)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
            background: "var(--ok)", boxShadow: "0 0 6px rgba(61,190,108,0.8)",
          }}/>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ok)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            GPS Live
          </span>
        </div>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--t-tertiary)", letterSpacing: "0.04em" }}>
          {pos.lat.toFixed(4)}°&nbsp;&nbsp;{pos.lon.toFixed(4)}°
          {pos.accuracy != null && (
            <span style={{ marginLeft: 10, color: "var(--t-quiet)" }}>±{pos.accuracy} m</span>
          )}
        </span>
      </div>

      {/* Airport groups */}
      <div className="freq-list">
        {visible.map(ap => {
          const freqs = [...ap.freqs]
            .filter(f => f.type !== "EMRG")
            .sort((a, b) => (FREQ_META[a.type]?.priority ?? 99) - (FREQ_META[b.type]?.priority ?? 99));
          return (
            <div key={ap.id} className="freq-airport">
              <div className="freq-airport-head">
                <div style={{ display: "flex", alignItems: "baseline", minWidth: 0 }}>
                  <span className="freq-airport-id">{ap.id}</span>
                  <span className="freq-airport-name">{ap.name}</span>
                </div>
                <span className="freq-airport-dist">
                  {ap.distNm < 1 ? "<1 NM" : `${Math.round(ap.distNm)} NM`}
                </span>
              </div>
              {freqs.map((f, i) => (
                <div key={i} className="freq-row">
                  <span className="freq-row-name">{f.name}</span>
                  <span className="freq-hz">{f.freq}</span>
                </div>
              ))}
            </div>
          );
        })}

        {/* Load more */}
        {remaining > 0 && (
          <button
            className="btn btn-primary"
            onClick={() => setVisibleCount(c => c + 7)}
            style={{
              width: "100%", height: 48,
              fontFamily: "var(--f-mono)", fontSize: 14, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
          >
            Load 7 More Airports
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, fontWeight: 400, color: "var(--accent-dim)", letterSpacing: "0.04em" }}>
              {remaining} remaining
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── NRST HEADER WIDGET ───────────────────────────────────────────────────────
// Compact nearest-airport readout for embedding in the global radio strip header.
// Runs its own GPS watchPosition so it stays current throughout the flight.
// Accepts an onNavigate callback — called when the user taps the widget — so the
// parent can jump to the Comm page with the Nearest Freqs tab already open.
export function NrstWidget({ onNavigate }) {
  const [nearest, setNearest] = useState(null);
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    if (!navigator?.geolocation) { setReady(true); return; }
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const aps = getNearestAirports(coords.latitude, coords.longitude, 1, 500);
        setNearest(aps[0] ?? null);
        setReady(true);
      },
      () => setReady(true),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Top 3 frequencies sorted by priority (Guard excluded — it's on every radio)
  const topFreqs = nearest
    ? [...nearest.freqs]
        .filter(f => f.type !== "EMRG")
        .sort((a, b) => (FREQ_META[a.type]?.priority ?? 99) - (FREQ_META[b.type]?.priority ?? 99))
        .slice(0, 3)
    : [];

  return (
    <button className="nrst-widget" onClick={onNavigate}>
      <div className="nrst-widget-header">
        <span className="nrst-widget-badge">NRST</span>
        {!ready ? (
          <span className="nrst-widget-status">Acquiring GPS…</span>
        ) : !nearest ? (
          <span className="nrst-widget-status">No airports nearby</span>
        ) : (
          <>
            <span className="nrst-widget-id">{nearest.id}</span>
            <span className="nrst-widget-dist">
              {nearest.distNm < 1 ? "<1" : Math.round(nearest.distNm)} NM
            </span>
          </>
        )}
      </div>
      {topFreqs.length > 0 && (
        <div className="nrst-widget-freqs">
          {topFreqs.map((f, i) => (
            <div key={i} className="nrst-widget-freq-row">
              <span className="nrst-widget-freq-name">{f.name}</span>
              <span className="nrst-widget-freq-hz">{f.freq}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
