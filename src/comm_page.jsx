// ─────────────────────────────────────────────────────────────────────────────
// APEX AVIATION — SMART COMMUNICATION AI  (comm_page.jsx)
// Design reference: design_handoff_smartcoms/README.md
// Prop contract preserved for parent cessna172s_checklist.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
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
    default:
      return null;
  }
}

// ─── CLEARANCES CONFIG ────────────────────────────────────────────────────────
// Field IDs match the design handoff (ident, wind, alt, vis, sky, caut,
// rwy, via, hold, instr, to, route, alt2, freq, sq).
// getFieldValue / setField map these to the parent's data objects.
const CLEARANCES = [
  {
    id: "atis",
    name: "ATIS",
    sub: "Tap ARM to capture",
    fields: [
      { id: "ident", label: "Information", placeholder: "Ident letter" },
      { id: "wind",  label: "Wind",        placeholder: "Dir/speed (e.g. 270° at 12kt)" },
      { id: "alt",   label: "Altimeter",   placeholder: "e.g. 29.92" },
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
      { id: "freq",  label: "Departure",  placeholder: "e.g. 124.9" },
      { id: "sq",    label: "Squawk",     placeholder: "e.g. 4271" },
    ],
  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function CommPage({
  aircraft,
  listening,
  txLog = [],
  onStartListen,
  onStopListen,
  onReplay,
  atisData,  onSetAtisData,  atisArmState,  onArmAtis,  onClearAtisRaw,
  taxiData,  onSetTaxiData,  taxiArmState,  onArmTaxi,  onClearTaxiRaw,
  gndData,   onSetGndData,   gndArmState,   onArmGnd,   onClearGndRaw,
  // Remaining props accepted silently to preserve parent contract
  ...rest
}) {
  const [tab, setTab] = useState("active");

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
            Active Feed <span className="tab-count">3</span>
          </div>
          <div
            className={`radio-tab${tab === "archive" ? " active" : ""}`}
            onClick={() => setTab("archive")}
          >
            Archive Log{" "}
            <span className="tab-count">{txLog.length > 0 ? txLog.length : 12}</span>
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
                      <span className="field-label">{f.label}</span>
                      <input
                        className={[
                          "field-input",
                          f.critical ? "critical" : "",
                          getFieldValue(f.id) ? "has-value" : "",
                        ].filter(Boolean).join(" ")}
                        placeholder={f.placeholder}
                        value={getFieldValue(f.id)}
                        onChange={(e) => setField(f.id, e.target.value)}
                      />
                      <button
                        className="field-copy"
                        title="Copy"
                        onClick={() => {
                          const v = getFieldValue(f.id);
                          if (v) try { navigator.clipboard.writeText(v); } catch {}
                        }}
                      >
                        <Icon name="copy" size={12}/>
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

        {tab === "archive" && <ArchiveLog txLog={txLog}/>}
        {tab === "freq"    && <NearestFreqs/>}

      </div>
    </div>
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

// ─── ARCHIVE LOG ──────────────────────────────────────────────────────────────
// Shows live txLog entries if available, falls back to design sample data.
function ArchiveLog({ txLog = [] }) {
  const fmtTs = (ts) => {
    if (!ts) return "—";
    try {
      const d = ts instanceof Date ? ts : new Date(ts);
      return d.toISOString().slice(11, 16) + "Z";
    } catch { return "—"; }
  };

  const fmtType = (type) => {
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
  };

  const PLACEHOLDER = [
    { id: "p1", ts: null, type: "tower",   text: "Skyhawk 12345, cleared for takeoff runway 12 center, fly heading 130." },
    { id: "p2", ts: null, type: "ground",  text: "Skyhawk 12345, taxi to runway 12 center via Yankee, hold short Bravo." },
    { id: "p3", ts: null, type: "clnc_del",text: "Cleared to KOAK via JANIC, climb maintain 4000, expect 8000 in 10, squawk 4271." },
    { id: "p4", ts: null, type: "atis",    text: "Information Charlie, wind 270 at 12, altimeter 29.92, runway 12 center in use." },
  ];

  const entries = txLog.length > 0
    ? [...txLog].reverse().slice(0, 12)
    : PLACEHOLDER;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
    </div>
  );
}

// ─── NEAREST FREQS ────────────────────────────────────────────────────────────
// 2-column grid of up to 6 frequency tiles, drawn from the offline airport DB.
// Uses Phoenix Sky Harbor as the default reference point.
function NearestFreqs() {
  const DEFAULT_LAT = 33.4373;
  const DEFAULT_LON = -112.0078;

  // Pull nearby airports and flatten into a prioritised frequency list
  const airports = getNearestAirports(DEFAULT_LAT, DEFAULT_LON, 5, 100);

  const tiles = [];
  for (const ap of airports) {
    if (tiles.length >= 5) break;
    const sorted = [...ap.freqs].sort(
      (a, b) => (FREQ_META[a.type]?.priority ?? 99) - (FREQ_META[b.type]?.priority ?? 99)
    );
    for (const f of sorted) {
      if (tiles.length >= 5) break;
      const dist = ap.distNm < 1 ? "0 NM" : `${Math.round(ap.distNm)} NM`;
      tiles.push({ name: f.name, freq: f.freq, apt: ap.id, dist });
    }
  }
  // Guard is always last
  tiles.push({ name: "Guard", freq: "121.500", apt: "—", dist: "—" });

  return (
    <div className="freq-grid">
      {tiles.slice(0, 6).map((f, i) => (
        <div key={i} className="freq-tile">
          <div>
            <div className="freq-name">{f.name}</div>
            <div className="freq-apt">{f.apt} · {f.dist}</div>
          </div>
          <div className="freq-hz">{f.freq}</div>
        </div>
      ))}
    </div>
  );
}
