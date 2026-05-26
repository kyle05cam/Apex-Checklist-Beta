// ─────────────────────────────────────────────────────────────────────────────
// APEX AVIATION — COMM PAGE v4 (Props-Only Display Layer + Full Theme Support)
//
// PROP CONTRACT:
//   lightMode       — bool           from parent theme toggle
//   aircraft        — { tail, ... }
//   listening       — bool
//   micStatus       — "idle"|"active"|"error"|"denied"
//   rmsLevel        — 0–1
//   transcript      — string
//   txLog           — array  [{id,text,ts,type,tokens,nwkraft}]
//   watchdogState   — "clear"|"pending"|"alert"|"unanswered"
//   watchdogTx      — object|null
//   ackCountdown    — number
//   onStartListen   — fn()
//   onStopListen    — fn()
//   onAckCall       — fn()
//   onReplay        — fn(seconds)
//   replayActive    — bool
//   forceIfrMode    — bool
//   onToggleForce   — fn()
//   ifrData         — { C,R,A,F,T }
//   onSetIfrData    — fn(data)
//   atisData        — { info,wind,altimeter,visibility,sky,caution }
//   onSetAtisData   — fn(data)
//   taxiData        — { runway,route,holdShort,instructions }
//   onSetTaxiData   — fn(data)
//   gndData         — { clearedTo,route,altitude,frequency,taxi,squawk }
//   onSetGndData    — fn(data)
// ──────
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import { getNearestAirports, FREQ_META } from "./nearest_freqs_data.js";

// ─── ACCENT COLORS — fixed avionics palette ──────────────────────────────────
const A = {
  blue:   "#3a9ad4",
  red:    "#e85a4a",
  green:  "#3dbe6c",
  amber:  "#e8c84a",
  teal:   "#4ae8c8",
  purple: "#c87ae8",
};

// ─── THEME TOKENS — CSS variables, theme-agnostic ────────────────────────────
// All color switching is handled by [data-mode="day"] selectors in styles.css.
// This object is a static map; no lightMode param needed.
const T = {
  pageBg:       "var(--bg-0)",
  headerBg:     "var(--bg-1)",
  headerBorder: "var(--accent-line)",
  vuBg:         "var(--bg-inset)",
  tabBarBg:     "var(--bg-1)",
  tabBorder:    "var(--line)",
  statusBg:     "var(--bg-1)",
  replayBg:     "var(--bg-2)",
  replayBgHot:  "color-mix(in oklab, var(--accent) 15%, var(--bg-2))",
  overlayBg:    "var(--bg-overlay)",
  overlayHdr:   "var(--bg-panel)",
  cardBg:       "var(--bg-panel)",
  cardBgAlt:    "var(--bg-panel)",
  inputBg:      "var(--bg-inset)",
  inputBdr:     (c) => `${c}50`,
  textMain:     "var(--t-primary)",
  textMuted:    "var(--t-secondary)",
  textDim:      "var(--t-tertiary)",
  border:       "var(--line)",
  borderLight:  "var(--line-faint)",
  scrollBg:     "var(--t-tertiary)",
  dimDot:       "var(--t-tertiary)",
};

// ─── CRAFT FIELD DEFINITIONS ─────────────────────────────────────────────────
const CRAFT_FIELDS = [
  { key:"C", label:"C — CLEARANCE LIMIT", hint:"Destination / cleared to",   color:A.teal   },
  { key:"R", label:"R — ROUTE",           hint:"Via / as filed / direct",     color:A.green  },
  { key:"A", label:"A — ALTITUDE",        hint:"Initial altitude / expect",   color:A.purple },
  { key:"F", label:"F — FREQUENCY",       hint:"Departure frequency",         color:A.blue   },
  { key:"T", label:"T — TRANSPONDER",     hint:"Squawk code",                 color:A.amber  },
];

// ─── LANDING CLEARANCE PILL STYLES ───────────────────────────────────────────
const PILL = {
  runway:   { color:A.red,   bg:"rgba(232,90,74,0.16)"  },
  leg:      { color:A.teal,  bg:"rgba(74,232,200,0.13)" },
  direction:{ color:A.amber, bg:"rgba(232,200,74,0.15)" },
  general:  { color:A.blue,  bg:"rgba(58,154,212,0.15)" },
};

const TYPE_META = {
  ifr_departure:{ c:A.teal,  label:"IFR CLEARANCE"  },
  ifr_approach: { c:A.teal,  label:"IFR APPROACH"   },
  landing:      { c:A.green, label:"LANDING CLRNCE"  },
  pattern:      { c:A.blue,  label:"PATTERN INSTR"  },
  general:      { c:"#4a5068", label:"GENERAL"       },
};

// ─── TOKENIZED TEXT RENDERER ──────────────────────────────────────────────────
function TokenText({ entry }) {
  if (!entry.tokens) return <span>{entry.text}</span>;
  return entry.tokens.map((tok, i) => {
    if (tok.type === "plain") return <span key={i}>{tok.text}</span>;
    const s = PILL[tok.type] || PILL.general;
    return (
      <span key={i} style={{
        background:s.bg, color:s.color, borderRadius:3,
        padding:"0 5px", margin:"0 2px",
        fontFamily:"var(--f-mono)", fontSize:12, fontWeight:700,
        border:`1px solid ${s.color}40`,
      }}>
        {tok.text.toUpperCase()}
      </span>
    );
  });
}

// ─── MINI SCRIBBLE FIELD ──────────────────────────────────────────────────────
// Input row: label + text field + copy-to-clipboard button
function MiniScribbleField({ T, label, value, onChange, color, placeholder }) {
  const [copied, setCopied] = useState(false);

  const copyValue = () => {
    if (!value) return;
    try { navigator.clipboard.writeText(value); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      {label && (
        <div style={{
          fontFamily:"var(--f-mono)", fontSize:8, letterSpacing:1.5,
          color:color, flexShrink:0, minWidth:90, textTransform:"uppercase",
        }}>
          {label}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="efb-comm-input"
        style={{
          flex:1, boxSizing:"border-box",
          background:"var(--bg-inset)", border:"1px solid var(--line)",
          borderRadius:4, padding:"9px 10px", outline:"none",
          fontFamily:"var(--f-mono)", fontSize:14, fontWeight:700,
          color: value ? color : "var(--t-tertiary)", caretColor:color,
        }}
      />
      {/* Copy to clipboard */}
      <button
        onClick={copyValue}
        title={copied ? "Copied!" : "Copy to clipboard"}
        style={{
          flexShrink:0, width:30, height:30, borderRadius:4, cursor:"pointer",
          border:`1px solid ${value ? `${color}40` : T.border}`,
          background: copied ? `${color}20` : "transparent",
          color: copied ? color : T.textDim,
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all 0.15s",
        }}
      >
        {copied ? (
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l4 4 10-10"/>
          </svg>
        ) : (
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2"/>
            <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── ATIS CARD ────────────────────────────────────────────────────────────────
function AtisCard({ T, data, onSetAtisData, armState, rawText, onArm, onClearRaw }) {
  const FIELDS = [
    { key:"info",       label:"INFORMATION", color:A.teal,   hint:"Ident letter" },
    { key:"wind",       label:"WIND",        color:A.blue,   hint:"Dir/speed (e.g. 270° AT 12KT)" },
    { key:"altimeter",  label:"ALTIMETER",   color:A.amber,  hint:"e.g. 29.92" },
    { key:"visibility", label:"VISIBILITY",  color:A.green,  hint:"e.g. 10SM" },
    { key:"sky",        label:"SKY",         color:A.purple, hint:"e.g. FEW 3500" },
    { key:"caution",    label:"CAUTION",     color:A.red,    hint:"NOTAMs / hazards / advisories" },
  ];
  const isArmed = armState === "armed";
  const isDone  = armState === "done";
  return (
    <div style={{ background:T.cardBg, border:`1px solid ${isArmed ? A.teal : "var(--line)"}`, borderRadius:8, overflow:"hidden", transition:"all 0.2s" }}>
      {/* ── Header ── */}
      <div style={{ background:"var(--bg-2)", borderBottom:`2px solid ${A.teal}`, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--f-ui)", fontSize:14, fontWeight:700, letterSpacing:2, color:A.teal }}>ATIS</div>
          <div style={{ fontFamily:"var(--f-ui)", fontSize:11, color:"var(--t-secondary)", marginTop:2 }}>
            {isArmed ? "● Recording…" : isDone ? "Captured · AI parsed" : "Tap ARM to capture"}
          </div>
        </div>
        <button onClick={onArm} style={{
          fontFamily:"var(--f-ui)", fontSize:12, fontWeight:700, letterSpacing:1.5,
          padding:"8px 18px", borderRadius:6, cursor:"pointer",
          background: isArmed ? A.teal : "transparent",
          color: isArmed ? "#000" : A.teal,
          border:`1.5px solid ${A.teal}`,
          boxShadow: isArmed ? `0 0 12px ${A.teal}60` : "none",
          animation: isArmed ? "commGlow 1.2s ease infinite" : "none",
          transition:"all 0.15s",
        }}>
          {isArmed ? "⏹ STOP" : "● ARM"}
        </button>
        <button onClick={onClearRaw} style={{ fontFamily:"var(--f-mono)", fontSize:10, padding:"7px 12px", borderRadius:5, cursor:"pointer", background:"transparent", color:A.red, border:`1px solid ${A.red}50` }}>↺ CLR</button>
      </div>
      {/* ── Raw captured text — high-visibility pilot-readable block ── */}
      {rawText ? (
        <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, background: isDone ? `${A.teal}10` : `${A.teal}06`, borderLeft: isDone ? `4px solid ${A.teal}` : `4px solid ${A.amber}` }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color: isArmed ? A.amber : A.teal, letterSpacing:2, fontWeight:700, marginBottom:6 }}>
            {isArmed ? "▶ LIVE BUFFER" : "✓ CAPTURED TEXT"}
          </div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:16, fontWeight:700, color: isArmed ? A.amber : T.textMain, lineHeight:1.6, letterSpacing:0.4 }}>
            {rawText}
          </div>
        </div>
      ) : isArmed ? (
        <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, background:`${A.teal}05`, borderLeft:`4px solid ${A.teal}40` }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:11, color:A.teal, letterSpacing:1, fontStyle:"italic", animation:"commPulse 1.5s ease infinite" }}>
            — listening · minimum 8s recording window active —
          </div>
        </div>
      ) : null}
      {/* ── Data fields ── */}
      <div style={{ padding:"8px 12px", display:"flex", flexDirection:"column", gap:6 }}>
        {FIELDS.map(f => (
          <MiniScribbleField key={f.key} T={T} label={f.label} color={f.color} placeholder={f.hint}
            value={data[f.key]||""}
            onChange={v => onSetAtisData({ ...data, [f.key]: v })}
          />
        ))}
      </div>
    </div>
  );
}

// ─── TAXI INSTRUCTIONS CARD ───────────────────────────────────────────────────
function TaxiCard({ T, data, onSetTaxiData, armState, rawText, onArm, onClearRaw }) {
  const isArmed = armState === "armed";
  const isDone  = armState === "done";
  return (
    <div style={{ background:T.cardBg, border:`1px solid ${isArmed ? A.blue : "var(--line)"}`, borderRadius:8, overflow:"hidden", transition:"all 0.2s" }}>
      {/* ── Header ── */}
      <div style={{ background:"var(--bg-2)", borderBottom:`2px solid ${A.blue}`, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--f-ui)", fontSize:14, fontWeight:700, letterSpacing:2, color:A.blue }}>TAXI INSTRUCTIONS</div>
          <div style={{ fontFamily:"var(--f-ui)", fontSize:11, color:"var(--t-secondary)", marginTop:2 }}>
            {isArmed ? "● Recording…" : isDone ? "Captured · AI parsed" : "Tap ARM to capture"}
          </div>
        </div>
        <button onClick={onArm} style={{
          fontFamily:"var(--f-ui)", fontSize:12, fontWeight:700, letterSpacing:1.5,
          padding:"8px 18px", borderRadius:6, cursor:"pointer",
          background: isArmed ? A.blue : "transparent",
          color: isArmed ? "#000" : A.blue,
          border:`1.5px solid ${A.blue}`,
          boxShadow: isArmed ? `0 0 12px ${A.blue}60` : "none",
          animation: isArmed ? "commGlow 1.2s ease infinite" : "none",
          transition:"all 0.15s",
        }}>
          {isArmed ? "⏹ STOP" : "● ARM"}
        </button>
        <button onClick={onClearRaw} style={{ fontFamily:"var(--f-mono)", fontSize:10, padding:"7px 12px", borderRadius:5, cursor:"pointer", background:"transparent", color:A.red, border:`1px solid ${A.red}50` }}>↺ CLR</button>
      </div>

      {/* ── Raw captured text ── */}
      {rawText ? (
        <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, background: isDone ? `${A.blue}10` : `${A.blue}06`, borderLeft: isDone ? `4px solid ${A.blue}` : `4px solid ${A.amber}` }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color: isArmed ? A.amber : A.blue, letterSpacing:2, fontWeight:700, marginBottom:6 }}>
            {isArmed ? "▶ LIVE BUFFER" : "✓ CAPTURED TEXT"}
          </div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:16, fontWeight:700, color: isArmed ? A.amber : T.textMain, lineHeight:1.6, letterSpacing:0.4 }}>
            {rawText}
          </div>
        </div>
      ) : isArmed ? (
        <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, background:`${A.blue}05`, borderLeft:`4px solid ${A.blue}40` }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:11, color:A.blue, letterSpacing:1, fontStyle:"italic", animation:"commPulse 1.5s ease infinite" }}>
            — listening · minimum 8s recording window active —
          </div>
        </div>
      ) : null}

      {/* ── Data fields ── */}
      <div style={{ padding:"8px 12px", display:"flex", flexDirection:"column", gap:6 }}>
        {/* Runway — standard field */}
        <MiniScribbleField T={T} label="RUNWAY" color={A.blue} placeholder="e.g. 12C"
          value={data.runway||""} onChange={v => onSetTaxiData({ ...data, runway:v })} />

        {/* Route — standard field */}
        <MiniScribbleField T={T} label="TAXI VIA" color={A.teal} placeholder="e.g. Y > Y1 > B > H"
          value={data.route||""} onChange={v => onSetTaxiData({ ...data, route:v })} />

        {/* Hold Short — safety-critical */}
        <div style={{ borderLeft:`3px solid ${A.red}`, borderRadius:4, paddingLeft:10, paddingTop:6, paddingBottom:6 }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:A.red, letterSpacing:1.5, marginBottom:5, fontWeight:700 }}>
            ⚠ HOLD SHORT
          </div>
          <input
            type="text"
            value={data.holdShort||""}
            onChange={e => onSetTaxiData({ ...data, holdShort:e.target.value })}
            placeholder="e.g. RWY 12R"
            className="efb-comm-input"
            style={{
              width:"100%", boxSizing:"border-box",
              background:"var(--bg-inset)", border:"1px solid var(--line)",
              borderRadius:4, padding:"9px 10px", outline:"none",
              fontFamily:"var(--f-mono)", fontSize:14, fontWeight:700,
              color: data.holdShort ? A.red : "var(--t-tertiary)", caretColor:A.red,
            }}
          />
        </div>

        {/* Instructions — secondary */}
        <MiniScribbleField T={T} label="INSTRUCTIONS" color={A.amber} placeholder="e.g. Contact tower 119.9 when ready"
          value={data.instructions||""} onChange={v => onSetTaxiData({ ...data, instructions:v })} />
      </div>
    </div>
  );
}

// ─── GROUND CLEARANCE CARD ────────────────────────────────────────────────────
function GndCard({ T, data, onSetGndData, armState, rawText, onArm, onClearRaw }) {
  const FIELDS = [
    { key:"clearedTo",  label:"CLEARED TO",  color:A.green,  hint:"Destination" },
    { key:"route",      label:"ROUTE",       color:A.blue,   hint:"Via / as filed" },
    { key:"altitude",   label:"ALTITUDE",    color:A.purple, hint:"Maintain / expect" },
    { key:"frequency",  label:"FREQUENCY",   color:A.teal,   hint:"Departure freq" },
    { key:"taxi",       label:"TAXI",        color:A.amber,  hint:"Taxi instructions" },
    { key:"squawk",     label:"SQUAWK",      color:A.red,    hint:"4-digit code" },
  ];
  const isArmed = armState === "armed";
  const isDone  = armState === "done";
  return (
    <div style={{ background:T.cardBg, border:`1px solid ${isArmed ? A.green : "var(--line)"}`, borderRadius:8, overflow:"hidden", transition:"all 0.2s" }}>
      {/* ── Header ── */}
      <div style={{ background:"var(--bg-2)", borderBottom:`2px solid ${A.green}`, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--f-ui)", fontSize:14, fontWeight:700, letterSpacing:2, color:A.green }}>GROUND CLEARANCE</div>
          <div style={{ fontFamily:"var(--f-ui)", fontSize:11, color:"var(--t-secondary)", marginTop:2 }}>
            {isArmed ? "● Recording…" : isDone ? "Captured · AI parsed" : "Tap ARM to capture"}
          </div>
        </div>
        <button onClick={onArm} style={{
          fontFamily:"var(--f-ui)", fontSize:12, fontWeight:700, letterSpacing:1.5,
          padding:"8px 18px", borderRadius:6, cursor:"pointer",
          background: isArmed ? A.green : "transparent",
          color: isArmed ? "#000" : A.green,
          border:`1.5px solid ${A.green}`,
          boxShadow: isArmed ? `0 0 12px ${A.green}60` : "none",
          animation: isArmed ? "commGlow 1.2s ease infinite" : "none",
          transition:"all 0.15s",
        }}>
          {isArmed ? "⏹ STOP" : "● ARM"}
        </button>
        <button onClick={onClearRaw} style={{ fontFamily:"var(--f-mono)", fontSize:10, padding:"7px 12px", borderRadius:5, cursor:"pointer", background:"transparent", color:A.red, border:`1px solid ${A.red}50` }}>↺ CLR</button>
      </div>
      {/* ── Raw captured text ── */}
      {rawText ? (
        <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, background: isDone ? `${A.green}10` : `${A.green}06`, borderLeft: isDone ? `4px solid ${A.green}` : `4px solid ${A.amber}` }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color: isArmed ? A.amber : A.green, letterSpacing:2, fontWeight:700, marginBottom:6 }}>
            {isArmed ? "▶ LIVE BUFFER" : "✓ CAPTURED TEXT"}
          </div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:16, fontWeight:700, color: isArmed ? A.amber : T.textMain, lineHeight:1.6, letterSpacing:0.4 }}>
            {rawText}
          </div>
        </div>
      ) : isArmed ? (
        <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, background:`${A.green}05`, borderLeft:`4px solid ${A.green}40` }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:11, color:A.green, letterSpacing:1, fontStyle:"italic", animation:"commPulse 1.5s ease infinite" }}>
            — listening · minimum 8s recording window active —
          </div>
        </div>
      ) : null}
      {/* ── Data fields ── */}
      <div style={{ padding:"8px 12px", display:"flex", flexDirection:"column", gap:6 }}>
        {FIELDS.map(f => (
          <MiniScribbleField key={f.key} T={T} label={f.label} color={f.color} placeholder={f.hint}
            value={data[f.key]||""}
            onChange={v => onSetGndData({ ...data, [f.key]: v })}
          />
        ))}
        {data.squawk && (
          <div style={{ background:`${A.red}12`, border:`1px solid ${A.red}40`, borderRadius:4, padding:"7px 12px", display:"flex", alignItems:"center", gap:14, marginTop:2 }}>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:9, color:A.red, letterSpacing:2 }}>SQUAWK</div>
            <div style={{ fontFamily:"var(--f-ui)", fontSize:28, fontWeight:700, color:A.amber, letterSpacing:4 }}>{data.squawk}</div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim }}>SET XPDR</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CRAFT CARD ───────────────────────────────────────────────────────────────
function CraftCard({ T, data, tail, onClear, forceIfrMode, onToggleForce, onSetIfrData }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"var(--f-ui)", fontSize:15, fontWeight:700, letterSpacing:3, color:A.amber }}>
            IFR CLEARANCE
          </div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim, letterSpacing:1, marginTop:1 }}>
            CRAFT FORMAT · {tail}
          </div>
        </div>
        <button onClick={onClear} style={{
          fontFamily:"var(--f-mono)", fontSize:8, padding:"4px 10px", borderRadius:3, cursor:"pointer",
          background:"transparent", color:A.red, border:`1px solid ${A.red}60`,
        }}>↺ CLEAR</button>
      </div>

      {/* Fields */}
      {CRAFT_FIELDS.map(f => (
        <div key={f.key} style={{
          background:T.cardBg, border:`1px solid ${f.color}22`,
          borderLeft:`4px solid ${f.color}`, borderRadius:4, padding:"7px 12px",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ fontFamily:"var(--f-ui)", fontSize:20, fontWeight:700, color:f.color, lineHeight:1, width:22, textAlign:"center" }}>
              {f.key}
            </div>
            <div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:f.color, letterSpacing:2 }}>{f.label}</div>
              <div style={{ fontFamily:"var(--f-ui)", fontSize:9, color:T.textDim }}>{f.hint}</div>
            </div>
          </div>
          <MiniScribbleField
            T={T} label="" color={f.color} placeholder={f.hint}
            value={data[f.key]||""}
            onChange={v => onSetIfrData({ ...data, [f.key]: v })}
          />
        </div>
      ))}

      {/* Squawk display — extracted from T field */}
      {data.T && (
        <div style={{
          background:`${A.blue}12`, border:`1px solid ${A.blue}40`,
          borderRadius:5, padding:"8px 14px",
          display:"flex", alignItems:"center", gap:14,
        }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:9, color:A.blue, letterSpacing:2 }}>SQUAWK</div>
          <div style={{ fontFamily:"var(--f-ui)", fontSize:30, fontWeight:700, color:A.amber, letterSpacing:4 }}>
            {data.T.replace(/[^0-9]/g,"")||data.T}
          </div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim }}>SET XPDR</div>
        </div>
      )}

      {/* Force IFR toggle */}
      <button onClick={onToggleForce} style={{
        padding:"9px", borderRadius:4, cursor:"pointer",
        background: forceIfrMode ? `${A.teal}18` : T.cardBg,
        color: forceIfrMode ? A.teal : T.textDim,
        border:`1.5px solid ${forceIfrMode ? A.teal : T.border}`,
        fontFamily:"var(--f-ui)", fontSize:11, fontWeight:700, letterSpacing:2,
        transition:"all 0.15s",
      }}>
        {forceIfrMode ? "⏹ FORCE IFR CAPTURE — ON · TAP TO DEACTIVATE" : "⏵ FORCE IFR CAPTURE"}
      </button>
    </div>
  );
}

// ─── NEAREST FREQS TAB COMPONENT ─────────────────────────────────────────────
function NearestFreqsTab({ T, A }) {
  const [gpsState,   setGpsState]   = useState("idle");
  const [position,   setPosition]   = useState(null);
  const [airports,   setAirports]   = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [radius,     setRadius]     = useState(30);
  const watchIdRef = useRef(null);

  const freqMeta = (type) => FREQ_META[type] || { color:"#7a8090", label:type, priority:8 };

  const startGps = useCallback(() => {
    if (!navigator.geolocation) { setGpsState("error"); return; }
    setGpsState("loading");
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude:lat, longitude:lon, accuracy, heading, speed } = pos.coords;
        setPosition({ lat, lon, accuracy, heading, speed });
        setAirports(getNearestAirports(lat, lon, 6, radius));
        setLastUpdate(new Date());
        setGpsState("active");
      },
      (err) => { setGpsState(err.code === 1 ? "denied" : "error"); },
      { enableHighAccuracy:true, maximumAge:10000, timeout:15000 }
    );
  }, [radius]);

  const stopGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsState("idle");
    setPosition(null);
  }, []);

  // AUTO-START on mount — no button press needed
  useEffect(() => {
    startGps();
    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-query when radius changes
  useEffect(() => {
    if (position && gpsState === "active")
      setAirports(getNearestAirports(position.lat, position.lon, 6, radius));
  }, [radius]); // eslint-disable-line react-hooks/exhaustive-deps

  const bearingTo = (lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const brng = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
    return ["N","NE","E","SE","S","SW","W","NW"][Math.round(brng / 45) % 8];
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>

      {/* ── GPS Status Bar ── */}
      <div style={{
        flexShrink:0, padding:"8px 14px",
        background: gpsState==="active" ? `${A.green}10`
          : (gpsState==="denied"||gpsState==="error") ? `${A.red}10` : `${A.blue}08`,
        borderBottom:`1px solid ${T.border}`,
        display:"flex", alignItems:"center", gap:10,
      }}>
        <div style={{
          width:9, height:9, borderRadius:"50%", flexShrink:0,
          background: gpsState==="active" ? A.green : gpsState==="loading" ? A.amber
            : (gpsState==="denied"||gpsState==="error") ? A.red : T.textDim,
          boxShadow: gpsState==="active" ? `0 0 8px ${A.green}` : "none",
          animation: gpsState==="loading" ? "commPulse 1s ease infinite" : "none",
        }}/>
        <div style={{ flex:1 }}>
          {gpsState==="active" && position ? (
            <div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:9, color:A.green, letterSpacing:1.5 }}>
                GPS ACTIVE · {Math.abs(position.lat).toFixed(4)}°{position.lat>=0?"N":"S"} / {Math.abs(position.lon).toFixed(4)}°{position.lon>=0?"E":"W"}
              </div>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:7, color:T.textDim, marginTop:1 }}>
                ACC ±{Math.round(position.accuracy)}M
                {position.speed!=null ? ` · GS ${Math.round((position.speed||0)*1.944)}KT` : ""}
                {lastUpdate ? ` · ${lastUpdate.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}` : ""}
              </div>
            </div>
          ) : gpsState==="loading" ? (
            <span style={{ fontFamily:"var(--f-mono)", fontSize:9, color:A.amber, letterSpacing:1.5 }}>ACQUIRING GPS…</span>
          ) : gpsState==="denied" ? (
            <span style={{ fontFamily:"var(--f-mono)", fontSize:9, color:A.red, letterSpacing:1.5 }}>GPS DENIED — enable in iPad Settings → Privacy → Location</span>
          ) : gpsState==="error" ? (
            <span style={{ fontFamily:"var(--f-mono)", fontSize:9, color:A.red, letterSpacing:1.5 }}>GPS ERROR — tap retry</span>
          ) : (
            <span style={{ fontFamily:"var(--f-mono)", fontSize:9, color:T.textDim, letterSpacing:1.5 }}>LOCATING…</span>
          )}
        </div>
        {/* Radius selector — only when active */}
        {gpsState==="active" && (
          <div style={{ display:"flex", gap:3 }}>
            {[20,30,50].map(r => (
              <button key={r} onClick={() => setRadius(r)} style={{
                fontFamily:"var(--f-mono)", fontSize:8, padding:"3px 7px",
                borderRadius:3, cursor:"pointer",
                background: radius===r ? `${A.green}20` : "transparent",
                color: radius===r ? A.green : T.textDim,
                border:`1px solid ${radius===r ? A.green : T.border}`,
              }}>{r}NM</button>
            ))}
          </div>
        )}
        {/* Manual retry button for error/denied states */}
        {(gpsState==="error"||gpsState==="idle") && (
          <button onClick={startGps} style={{
            fontFamily:"var(--f-mono)", fontSize:8, padding:"4px 10px",
            borderRadius:3, cursor:"pointer", flexShrink:0,
            background:`${A.green}18`, color:A.green, border:`1px solid ${A.green}`,
          }}>RETRY</button>
        )}
      </div>

      {/* ── Airport cards ── */}
      <div style={{ flex:1, overflowY:"auto", scrollbarWidth:"thin", padding:"8px 0" }}>

        {(gpsState==="idle"||gpsState==="loading") && (
          <div style={{ padding:"40px 20px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10, opacity:0.25 }}>📡</div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:9, color:A.amber, letterSpacing:2, animation:"commPulse 1.5s ease infinite" }}>
              {gpsState==="loading" ? "ACQUIRING GPS POSITION…" : "INITIALIZING…"}
            </div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim, marginTop:8, lineHeight:1.8 }}>
              NEAREST AIRPORTS & FREQUENCIES{"\n"}WILL APPEAR HERE AUTOMATICALLY
            </div>
          </div>
        )}

        {gpsState==="active" && airports.length===0 && (
          <div style={{ padding:"30px 20px", textAlign:"center" }}>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:9, color:T.textDim, letterSpacing:1 }}>NO AIRPORTS FOUND WITHIN {radius}NM</div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim, opacity:0.5, marginTop:4 }}>Increase search radius above</div>
          </div>
        )}

        {gpsState==="active" && airports.map((ap, idx) => {
          const isExpanded = expandedId === ap.id;
          const isFirst    = idx === 0;
          const sortedFreqs = [...ap.freqs].sort((a,b) =>
            (freqMeta(a.type).priority||8) - (freqMeta(b.type).priority||8)
          );
          const topFreqs  = sortedFreqs.filter(f => f.type!=="EMRG").slice(0,3);
          const bearing   = position ? bearingTo(position.lat,position.lon,ap.lat,ap.lon) : "—";
          const typeColor = ap.type==="LARGE" ? A.teal : ap.type==="TOWERED" ? A.blue : A.green;

          return (
            <div key={ap.id} style={{
              margin:"0 10px 8px",
              background:T.cardBg,
              border:`1px solid ${isFirst ? `${A.green}60` : T.border}`,
              borderLeft:`4px solid ${isFirst ? A.green : typeColor}`,
              borderRadius:5, overflow:"hidden", transition:"all 0.15s",
            }}>
              {/* Header row — always visible, tap to expand */}
              <div onClick={() => setExpandedId(isExpanded ? null : ap.id)} style={{
                padding:"10px 12px", cursor:"pointer",
                display:"flex", alignItems:"center", gap:10,
                background: isFirst ? `${A.green}08` : "transparent",
              }}>
                {/* Distance badge */}
                <div style={{
                  flexShrink:0, textAlign:"center",
                  background: isFirst ? `${A.green}20` : `${T.border}40`,
                  border:`1px solid ${isFirst ? A.green : T.border}`,
                  borderRadius:4, padding:"4px 8px", minWidth:58,
                }}>
                  <div style={{ fontFamily:"var(--f-ui)", fontSize:20, fontWeight:700, color:isFirst?A.green:T.textMain, lineHeight:1 }}>
                    {ap.distNm.toFixed(1)}
                  </div>
                  <div style={{ fontFamily:"var(--f-mono)", fontSize:7, color:T.textDim, letterSpacing:1 }}>
                    NM {bearing}
                  </div>
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                    <span style={{ fontFamily:"var(--f-ui)", fontSize:15, fontWeight:700, letterSpacing:2, color:typeColor }}>
                      {ap.id}
                    </span>
                    <span style={{ fontFamily:"var(--f-mono)", fontSize:7, color:typeColor, background:`${typeColor}14`, border:`1px solid ${typeColor}30`, borderRadius:2, padding:"1px 5px", letterSpacing:1 }}>
                      {ap.type}
                    </span>
                    {isFirst && (
                      <span style={{ fontFamily:"var(--f-mono)", fontSize:7, color:A.green, background:`${A.green}14`, border:`1px solid ${A.green}40`, borderRadius:2, padding:"1px 5px", letterSpacing:1 }}>
                        NEAREST
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily:"var(--f-ui)", fontSize:12, color:T.textDim, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:5 }}>
                    {ap.name}
                  </div>
                  {/* Top freq pills */}
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    {topFreqs.map((f,fi) => {
                      const fm = freqMeta(f.type);
                      return (
                        <div key={fi} style={{ display:"flex", alignItems:"center", gap:3, background:`${fm.color}12`, border:`1px solid ${fm.color}30`, borderRadius:3, padding:"2px 6px" }}>
                          <span style={{ fontFamily:"var(--f-mono)", fontSize:7, color:fm.color, letterSpacing:1 }}>{fm.label}</span>
                          <span style={{ fontFamily:"var(--f-mono)", fontSize:10, fontWeight:700, color:fm.color }}>{f.freq}</span>
                        </div>
                      );
                    })}
                    {ap.freqs.length > topFreqs.length && (
                      <span style={{ fontFamily:"var(--f-mono)", fontSize:7, color:T.textDim, alignSelf:"center" }}>
                        +{ap.freqs.length - topFreqs.length} ▾
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize:9, color:T.textDim, transform:isExpanded?"rotate(180deg)":"none", transition:"transform 0.2s", flexShrink:0 }}>▼</div>
              </div>

              {/* Expanded full frequency list */}
              {isExpanded && (
                <div style={{ borderTop:`1px solid ${T.border}`, padding:"8px 12px", display:"flex", flexDirection:"column", gap:4, animation:"commSlideIn 0.15s ease" }}>
                  <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim, letterSpacing:2, marginBottom:4 }}>
                    ALL FREQUENCIES · {ap.id} · ELEV {ap.elev.toLocaleString()} FT MSL
                  </div>
                  {sortedFreqs.map((f,fi) => {
                    const fm = freqMeta(f.type);
                    return (
                      <div key={fi} style={{
                        display:"flex", alignItems:"center", gap:10,
                        padding:"7px 10px",
                        background: f.type==="EMRG" ? `${A.red}08` : `${fm.color}06`,
                        border:`1px solid ${fm.color}20`,
                        borderLeft:`3px solid ${fm.color}`,
                        borderRadius:3,
                      }}>
                        <div style={{ flexShrink:0, width:62, fontFamily:"var(--f-mono)", fontSize:8, fontWeight:700, letterSpacing:1, color:fm.color }}>
                          {fm.label}
                        </div>
                        <div style={{ fontFamily:"var(--f-ui)", fontSize:22, fontWeight:700, color:f.type==="EMRG"?A.red:fm.color, letterSpacing:1, flex:1 }}>
                          {f.freq}
                        </div>
                        <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim, textAlign:"right", flexShrink:0 }}>
                          {f.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMM PAGE — DISPLAY LAYER ONLY
// ─────────────────────────────────────────────────────────────────────────────
export function CommPage({
  lightMode      = false,
  aircraft,
  listening      = false,
  micStatus      = "idle",
  rmsLevel       = 0,
  transcript     = "",
  txLog          = [],
  watchdogState  = "clear",
  watchdogTx     = null,
  ackCountdown   = 0,
  onStartListen  = () => {},
  onStopListen   = () => {},
  onAckCall      = () => {},
  onReplay       = () => {},
  replayActive   = false,
  forceIfrMode   = false,
  onToggleForce  = () => {},
  ifrData        = { C:"",R:"",A:"",F:"",T:"" },
  onSetIfrData   = () => {},
  atisData       = { info:"",wind:"",altimeter:"",visibility:"",sky:"",caution:"" },
  onSetAtisData  = () => {},
  atisArmState   = "idle",
  atisRawText    = "",
  onArmAtis      = () => {},
  onClearAtisRaw = () => {},
  taxiData       = { runway:"",route:"",holdShort:"",instructions:"" },
  onSetTaxiData  = () => {},
  taxiArmState   = "idle",
  taxiRawText    = "",
  onArmTaxi      = () => {},
  onClearTaxiRaw = () => {},
  gndData        = { clearedTo:"",route:"",altitude:"",frequency:"",taxi:"",squawk:"" },
  onSetGndData   = () => {},
  gndArmState    = "idle",
  gndRawText     = "",
  onArmGnd       = () => {},
  onClearGndRaw  = () => {},
  ifrArmState    = "idle",
  ifrRawText     = "",
  onArmIfr       = () => {},
  onClearIfrRaw  = () => {},
}) {
  
  // ── Local UI state only ────────────────────────────────────────────────────
  const [ifrOverlay,  setIfrOverlay]  = useState(false);
  const [activeTab,   setActiveTab]   = useState("active");
  const [replayIndex, setReplayIndex] = useState(null);

  const tail         = aircraft ? aircraft.tail : "UNKNOWN";
  const isAlert      = watchdogState === "alert";
  const isUnanswered = watchdogState === "unanswered";
  const isPending    = watchdogState === "pending";

  const VU_BARS  = 20;
  const vuActive = Math.round(Math.max(0, Math.min(1, rmsLevel)) * VU_BARS);

  const showIfrOverlay = (data) => { onSetIfrData(data); setIfrOverlay(true); };
  const replayEntry    = (entry) => { setReplayIndex(entry.id); setTimeout(() => setReplayIndex(null), 3000); };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height:"100%", display:"flex", flexDirection:"column",
      overflow:"hidden", position:"relative",
      background: T.pageBg,
      fontFamily:"var(--f-ui)",
      animation: isUnanswered ? "commFlash 0.5s ease infinite alternate" : "none",
      transition:"background 0.2s ease",
    }}>

      {/* ═══ SECTION A — HEADER ══════════════════════════════════════════════ */}
      <div style={{
        flexShrink:0, padding:"10px 14px",
        background:T.headerBg,
        borderBottom:`2px solid ${T.headerBorder}`,
        display:"flex", alignItems:"center", gap:12,
        transition:"background 0.2s ease",
      }}>
        {/* Circle icon — teal tinted background with signal SVG */}
        <div style={{
          width:44, height:44, borderRadius:"50%", flexShrink:0,
          background:`${A.teal}1a`, border:`1.5px solid ${A.teal}45`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <svg width={22} height={22} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="2.5" fill={A.teal}/>
            <path d="M10 10 Q6 5 3 2"  stroke={A.teal} strokeWidth="1.5" strokeLinecap="round" opacity={listening?"1":"0.4"}/>
            <path d="M10 10 Q14 5 17 2" stroke={A.teal} strokeWidth="1.5" strokeLinecap="round" opacity={listening?"1":"0.4"}/>
            <path d="M10 10 Q7 7 5 4"  stroke={A.teal} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" opacity={listening?"0.75":"0.18"}/>
            <path d="M10 10 Q13 7 15 4" stroke={A.teal} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" opacity={listening?"0.75":"0.18"}/>
            <line x1="10" y1="12.5" x2="10" y2="18" stroke={A.teal} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--f-ui)", fontSize:17, fontWeight:700, letterSpacing:0.3, color:"var(--t-primary)" }}>
            Smart Communication AI
          </div>
          <div style={{ fontFamily:"var(--f-ui)", fontSize:11, color:"var(--t-secondary)", marginTop:2 }}>
            Callsign: {tail} · {listening ? "Monitoring" : "Standby"}
          </div>
        </div>

        {/* Demo Capture — ghost button */}
        <button style={{
          fontFamily:"var(--f-ui)", fontSize:11, fontWeight:600, letterSpacing:0.3,
          padding:"6px 13px", borderRadius:5, cursor:"pointer",
          background:"transparent",
          color:"var(--t-secondary)",
          border:"1px solid var(--line)",
          transition:"all 0.15s",
          flexShrink:0,
        }}>
          Demo Capture
        </button>

        {/* Listen toggle — solid filled */}
        <button
          onClick={() => {
            if (listening) {
              onStopListen();
            } else {
              onStopListen();
              setTimeout(() => onStartListen(), 50);
            }
          }}
          style={{
            fontFamily:"var(--f-ui)", fontSize:12, fontWeight:700, letterSpacing:1.5,
            padding:"7px 18px", borderRadius:5, cursor:"pointer", flexShrink:0,
            background: listening ? A.red : A.blue,
            color: "#fff",
            border: "none",
            boxShadow: listening ? `0 2px 10px ${A.red}50` : `0 2px 8px ${A.blue}40`,
            animation: listening && micStatus==="active" ? "commGlow 1.8s ease infinite" : "none",
            transition:"all 0.15s",
          }}
        >
          {listening ? "⏹ STOP" : "⏵ LISTEN"}
        </button>
      </div>

      {/* ═══ SECTION B — WATCHDOG ALERT (3 states) ══════════════════════════ */}

      {/* PENDING — quiet visual only, no sound, ATC still transmitting */}
      {isPending && (
        <div style={{
          flexShrink:0, padding:"6px 14px",
          background:`${A.teal}08`,
          borderBottom:`1px solid ${A.teal}30`,
          display:"flex", alignItems:"center", gap:10,
          animation:"commSlideIn 0.2s ease",
        }}>
          <div style={{
            width:8, height:8, borderRadius:"50%", flexShrink:0,
            background:A.teal, opacity:0.7,
            animation:"commGlow 1.5s ease infinite",
          }}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:9, color:A.teal, letterSpacing:1.5 }}>
              CALLSIGN DETECTED · AWAITING TRANSMISSION END
            </div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:10, color:T.textDim, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {watchdogTx?.text || ""}
            </div>
          </div>
          <button onClick={onAckCall} style={{
            fontFamily:"var(--f-mono)", fontSize:8, fontWeight:700, letterSpacing:1,
            padding:"4px 10px", borderRadius:3, cursor:"pointer", flexShrink:0,
            background:"transparent", color:A.teal, border:`1px solid ${A.teal}50`,
          }}>
            DISMISS
          </button>
        </div>
      )}

      {/* ALERT — 5s countdown, moderate urgency */}
      {isAlert && (
        <div style={{
          flexShrink:0, padding:"10px 14px",
          background:"rgba(232,200,74,0.12)",
          borderBottom:`2px solid ${A.amber}`,
          display:"flex", alignItems:"center", gap:12,
          animation:"commSlideIn 0.2s ease",
        }}>
          <div style={{
            width:36, height:36, borderRadius:"50%", flexShrink:0,
            background:"rgba(232,200,74,0.2)",
            border:`2px solid ${A.amber}`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            animation:"commPulse 1.5s ease infinite",
          }}>
            📡
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"var(--f-ui)", fontSize:13, fontWeight:700, letterSpacing:2, color:A.amber }}>
              CALLSIGN ALERT — {ackCountdown}s
            </div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:10, color:T.textMain, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {watchdogTx?.text || ""}
            </div>
          </div>
          <button onClick={onAckCall} style={{
            fontFamily:"var(--f-ui)", fontSize:13, fontWeight:700, letterSpacing:2,
            padding:"8px 18px", borderRadius:4, cursor:"pointer", flexShrink:0,
            background:A.amber, color:"#000", border:"none",
            boxShadow:`0 0 12px ${A.amber}60`,
          }}>
            PTT · ACK CALL
          </button>
        </div>
      )}

      {/* UNANSWERED — full alarm, flashing, persistent chime */}
      {isUnanswered && (
        <div style={{
          flexShrink:0, padding:"10px 14px",
          background:"rgba(232,90,74,0.22)",
          borderBottom:`2px solid ${A.red}`,
          display:"flex", alignItems:"center", gap:12,
          animation:"commSlideIn 0.2s ease",
        }}>
          <div style={{
            width:36, height:36, borderRadius:"50%", flexShrink:0,
            background:"rgba(232,90,74,0.3)",
            border:`2px solid ${A.red}`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            animation:"commPulse 0.8s ease infinite",
          }}>
            🔴
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"var(--f-ui)", fontSize:13, fontWeight:700, letterSpacing:2, color:A.red }}>
              ⚠ UNANSWERED CALL
            </div>
            <div style={{ fontFamily:"var(--f-mono)", fontSize:10, color:T.textMain, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {watchdogTx?.text || ""}
            </div>
          </div>
          <button onClick={onAckCall} style={{
            fontFamily:"var(--f-ui)", fontSize:13, fontWeight:700, letterSpacing:2,
            padding:"8px 18px", borderRadius:4, cursor:"pointer", flexShrink:0,
            background:A.red, color:"#000", border:"none",
            boxShadow:`0 0 20px ${A.red}80`,
            animation:"commPulse 0.8s ease infinite",
          }}>
            PTT · ACK CALL
          </button>
        </div>
      )}

      {/* ═══ SECTION C — VU METER + LIVE PARTIAL ═══════════════════════════ */}
      <div style={{
        flexShrink:0, padding:"6px 14px",
        background:T.vuBg,
        borderBottom:`1px solid ${T.border}`,
        display:"flex", flexDirection:"column", gap:5,
        transition:"background 0.2s ease",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim, letterSpacing:1, width:26, flexShrink:0 }}>
            {listening ? "RX" : "——"}
          </div>
          <div style={{ display:"flex", gap:2, flex:1, height:10, alignItems:"flex-end" }}>
            {Array.from({length:VU_BARS}).map((_,i) => {
              const on  = i < vuActive && listening;
              const hot = i >= VU_BARS * 0.78;
              const mid = i >= VU_BARS * 0.52;
              return <div key={i} style={{
                flex:1, borderRadius:1,
                height: on ? (hot?10:mid?7:4) : 2,
                background: on ? (hot?A.red:mid?A.amber:A.green) : T.border,
                transition:"height 0.05s, background 0.05s",
                animation: on ? "vuBar 0.9s ease infinite" : "none",
              }}/>;
            })}
          </div>
          <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim, width:22, textAlign:"right", flexShrink:0 }}>
            {micStatus==="denied"?"⛔":micStatus==="error"?"ERR":listening?"ON":"OFF"}
          </div>
        </div>
        <div style={{
          fontFamily:"var(--f-mono)", fontSize:11,
          color: transcript ? A.amber : T.textDim,
          minHeight:14, letterSpacing:0.5,
          fontStyle: transcript ? "normal" : "italic",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        }}>
          {transcript
            ? `▶ ${transcript}`
            : listening
              ? "— monitoring —"
              : micStatus==="denied"
                ? "⛔ MICROPHONE DENIED — enable in browser settings"
                : "TAP LISTEN TO BEGIN MONITORING"}
        </div>
      </div>

      {/* ═══ SECTION D — SUB-TABS ═══════════════════════════════════════════ */}
      <div style={{
        flexShrink:0, display:"flex",
        borderBottom:`1px solid ${T.border}`,
        background:T.tabBarBg,
        transition:"background 0.2s ease",
      }}>
        {[
          { key:"active",  label:"ACTIVE FEED",  color:A.teal,  count: txLog.length   },
          { key:"archive", label:"ARCHIVE LOG",   color:A.blue,  count: txLog.length   },
          { key:"nearest", label:"NEAREST FREQS", color:A.green, count: null           },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex:1, padding:"8px 4px", cursor:"pointer", border:"none",
            borderRight:`1px solid ${T.border}`,
            borderBottom:`2px solid ${activeTab===tab.key ? tab.color : "transparent"}`,
            background: activeTab===tab.key ? `${tab.color}10` : "transparent",
            display:"flex", alignItems:"center", justifyContent:"center", gap:5,
            transition:"all 0.12s",
          }}>
            <span style={{ fontFamily:"var(--f-mono)", fontSize:9, fontWeight:700, letterSpacing:1.5, color:activeTab===tab.key?tab.color:T.textDim, textTransform:"uppercase" }}>
              {tab.label}
            </span>
            {tab.count !== null && tab.count > 0 && (
              <span style={{
                fontFamily:"var(--f-mono)", fontSize:8, fontWeight:700,
                background: activeTab===tab.key ? tab.color : `${tab.color}28`,
                color: activeTab===tab.key ? "#fff" : tab.color,
                borderRadius:10, padding:"0px 5px", minWidth:14, textAlign:"center",
                lineHeight:"16px", display:"inline-block",
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ SECTION E — SCROLLABLE CONTENT (flex:1, clipped, overlay host) ═ */}
      <div style={{ flex:1, overflow:"hidden", position:"relative" }}>
        <div style={{
          position:"absolute", inset:0,
          overflowY:"auto", overflowX:"hidden",
          scrollbarWidth:"thin",
        }}>

          {/* ── ACTIVE FEED ── */}
          {activeTab === "active" && (
            <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:12 }}>

              {/* Most recent transmission — large, high-visibility block */}
              {txLog.length > 0 ? (() => {
                const latest = txLog[0];
                const tc = TYPE_META[latest.type] || TYPE_META.general;
                return (
                  <div style={{
                    background:T.cardBg, border:`2px solid ${tc.c}50`,
                    borderLeft:`5px solid ${tc.c}`, borderRadius:5, padding:"12px 14px",
                    animation:"commSlideIn 0.2s ease", transition:"background 0.2s ease",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                      <div style={{ fontFamily:"var(--f-mono)", fontSize:9, fontWeight:700, letterSpacing:2, color:tc.c, background:`${tc.c}14`, padding:"2px 8px", borderRadius:3 }}>
                        {tc.label}
                      </div>
                      <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim }}>
                        {latest.ts.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}Z
                      </div>
                    </div>
                    <div style={{ fontFamily:"var(--f-ui)", fontSize:16, fontWeight:700, lineHeight:1.6, color:T.textMain }}>
                      <TokenText entry={latest}/>
                    </div>
                    {latest.nwkraft && (
                      <button onClick={() => showIfrOverlay(latest.nwkraft)} style={{ marginTop:8, fontFamily:"var(--f-mono)", fontSize:8, fontWeight:700, letterSpacing:1, padding:"3px 10px", borderRadius:3, cursor:"pointer", background:`${A.amber}12`, color:A.amber, border:`1px solid ${A.amber}` }}>
                        ✦ VIEW CRAFT
                      </button>
                    )}
                  </div>
                );
              })() : (
                <div style={{ textAlign:"center", padding:"32px 20px 20px" }}>
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="none"
                    stroke={T.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ opacity:0.32, display:"block", margin:"0 auto 12px" }}>
                    <path d="M12 20v-6M8 8a4 4 0 0 1 8 0M5 5a8 8 0 0 1 14 0M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                  </svg>
                  <div style={{ fontFamily:"var(--f-mono)", fontSize:12, fontWeight:700, letterSpacing:2.5, color:T.textDim, textTransform:"uppercase" }}>
                    Awaiting Transmission
                  </div>
                  <div style={{ fontFamily:"var(--f-ui)", fontSize:12, marginTop:6, color:T.textDim, opacity:0.55 }}>
                    {listening ? `Monitoring · ${tail}` : "Forms below auto-fill from captured ATC audio."}
                  </div>
                </div>
              )}

              {/* Three smart cards */}
             <AtisCard T={T} data={atisData} onSetAtisData={onSetAtisData}
                armState={atisArmState} rawText={atisRawText}
                onArm={onArmAtis} onClearRaw={onClearAtisRaw} />
              <TaxiCard T={T} data={taxiData} onSetTaxiData={onSetTaxiData}
                armState={taxiArmState} rawText={taxiRawText}
                onArm={onArmTaxi} onClearRaw={onClearTaxiRaw} />
              <GndCard  T={T} data={gndData}  onSetGndData={onSetGndData}
                armState={gndArmState} rawText={gndRawText}
                onArm={onArmGnd} onClearRaw={onClearGndRaw} />
              <div style={{ background:T.cardBg, border:`1px solid ${ifrArmState==="armed" ? A.amber : "var(--line)"}`, borderRadius:8, overflow:"hidden", transition:"all 0.2s" }}>
                <div style={{ background:"var(--bg-2)", borderBottom:`2px solid ${A.amber}`, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"var(--f-ui)", fontSize:14, fontWeight:700, letterSpacing:2, color:A.amber }}>IFR CLEARANCE</div>
                    <div style={{ fontFamily:"var(--f-ui)", fontSize:11, color:"var(--t-secondary)", marginTop:2 }}>
                      {ifrArmState==="armed" ? "● Recording…" : ifrArmState==="done" ? "Captured · AI parsed" : "CRAFT format · Tap ARM"}
                    </div>
                  </div>
                  <button onClick={onArmIfr} style={{
                    fontFamily:"var(--f-ui)", fontSize:12, fontWeight:700, letterSpacing:1.5,
                    padding:"8px 18px", borderRadius:6, cursor:"pointer",
                    background: ifrArmState==="armed" ? A.amber : "transparent",
                    color: ifrArmState==="armed" ? "#000" : A.amber,
                    border:`1.5px solid ${A.amber}`,
                    boxShadow: ifrArmState==="armed" ? `0 0 12px ${A.amber}60` : "none",
                    animation: ifrArmState==="armed" ? "commGlow 1.2s ease infinite" : "none",
                    transition:"all 0.15s",
                  }}>
                    {ifrArmState==="armed" ? "⏹ STOP" : "● ARM"}
                  </button>
                  <button onClick={onClearIfrRaw} style={{ fontFamily:"var(--f-mono)", fontSize:10, padding:"7px 12px", borderRadius:5, cursor:"pointer", background:"transparent", color:A.red, border:`1px solid ${A.red}50` }}>↺ CLR</button>
                </div>
                {ifrRawText ? (
                  <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, background: ifrArmState==="done" ? `${A.amber}10` : `${A.amber}06`, borderLeft: ifrArmState==="done" ? `4px solid ${A.amber}` : `4px solid ${A.amber}60` }}>
                    <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:A.amber, letterSpacing:2, fontWeight:700, marginBottom:6 }}>
                      {ifrArmState==="armed" ? "▶ LIVE BUFFER" : "✓ CAPTURED TEXT"}
                    </div>
                    <div style={{ fontFamily:"var(--f-mono)", fontSize:16, fontWeight:700, color: ifrArmState==="armed" ? A.amber : T.textMain, lineHeight:1.6, letterSpacing:0.4 }}>
                      {ifrRawText}
                    </div>
                  </div>
                ) : ifrArmState==="armed" ? (
                  <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, background:`${A.amber}05`, borderLeft:`4px solid ${A.amber}40` }}>
                    <div style={{ fontFamily:"var(--f-mono)", fontSize:11, color:A.amber, letterSpacing:1, fontStyle:"italic", animation:"commPulse 1.5s ease infinite" }}>
                      — listening · minimum 8s recording window active —
                    </div>
                  </div>
                ) : null}
                <div style={{ padding:"8px 12px", display:"flex", flexDirection:"column", gap:6 }}>
                  {CRAFT_FIELDS.map(f => (
                    <MiniScribbleField key={f.key} T={T}
                      label={f.label.replace("— ","")} color={f.color} placeholder={f.hint}
                      value={ifrData[f.key]||""}
                      onChange={v => onSetIfrData({ ...ifrData, [f.key]: v })}
                    />
                  ))}
                  {ifrData.T && (
                    <div style={{ background:`${A.blue}12`, border:`1px solid ${A.blue}40`, borderRadius:4, padding:"7px 12px", display:"flex", alignItems:"center", gap:14, marginTop:2 }}>
                      <div style={{ fontFamily:"var(--f-mono)", fontSize:9, color:A.blue, letterSpacing:2 }}>SQUAWK</div>
                      <div style={{ fontFamily:"var(--f-ui)", fontSize:28, fontWeight:700, color:A.amber, letterSpacing:4 }}>{ifrData.T.replace(/[^0-9]/g,"")||ifrData.T}</div>
                      <div style={{ fontFamily:"var(--f-mono)", fontSize:8, color:T.textDim }}>SET XPDR</div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ── ARCHIVE LOG ── */}
          {activeTab === "archive" && (
            <div style={{ padding:"8px 0" }}>
              {txLog.length === 0 ? (
                <div style={{ padding:"30px 20px", textAlign:"center", fontFamily:"var(--f-mono)", fontSize:9, color:T.textDim, letterSpacing:1 }}>
                  NO TRANSMISSIONS LOGGED
                </div>
              ) : txLog.map(entry => {
                const isReplaying = replayIndex === entry.id;
                const ec = (TYPE_META[entry.type]||TYPE_META.general).c;
                return (
                  <div key={entry.id} style={{
                    padding:"8px 14px", borderBottom:`1px solid ${T.border}`,
                    background: isReplaying ? `${A.amber}08` : "transparent",
                    transition:"background 0.2s",
                  }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                      <div style={{ fontFamily:"var(--f-mono)", fontSize:7, color:ec, letterSpacing:1, flexShrink:0, marginTop:2, padding:"1px 5px", borderRadius:2, background:`${ec}14`, border:`1px solid ${ec}22` }}>
                        {entry.type.replace("_"," ").toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"var(--f-ui)", fontSize:13, color:T.textMain, lineHeight:1.4 }}>
                          <TokenText entry={entry}/>
                        </div>
                        <div style={{ fontFamily:"var(--f-mono)", fontSize:7, color:T.textDim, marginTop:2 }}>
                          {entry.ts.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})} LOCAL
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:3, flexShrink:0 }}>
                        <button onClick={() => replayEntry(entry)} style={{ fontFamily:"var(--f-mono)", fontSize:7, padding:"2px 6px", borderRadius:2, cursor:"pointer", background:"transparent", color:isReplaying?A.amber:T.textDim, border:`1px solid ${isReplaying?A.amber:T.border}` }}>
                          {isReplaying?"▶▶":"▶"}
                        </button>
                        {entry.nwkraft && (
                          <button onClick={() => showIfrOverlay(entry.nwkraft)} style={{ fontFamily:"var(--f-mono)", fontSize:7, padding:"2px 6px", borderRadius:2, cursor:"pointer", background:`${A.amber}08`, color:A.amber, border:`1px solid ${A.amber}28` }}>IFR</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {txLog.length > 0 && (
                <div style={{ padding:"8px 14px" }}>
                  <button style={{ fontFamily:"var(--f-mono)", fontSize:8, padding:"4px 12px", borderRadius:3, cursor:"pointer", background:"transparent", color:A.red, border:`1px solid ${A.red}50` }}>↺ CLEAR LOG</button>
                </div>
              )}
            </div>
          )}

          {/* ── NEAREST FREQS TAB ── */}
          {activeTab === "nearest" && (
            <NearestFreqsTab T={T} A={A} />
          )}

        </div>{/* end inner absolute scroll */}

        {/* ── NWKRAFT ABSOLUTE OVERLAY ── */}
        {ifrOverlay && (
          <div style={{
            position:"absolute", inset:0, zIndex:100,
            background:T.overlayBg,
            display:"flex", flexDirection:"column",
            animation:"commSlideUp 0.22s cubic-bezier(0.25,1,0.5,1)",
            overflowY:"auto", scrollbarWidth:"thin",
            transition:"background 0.2s ease",
          }}>
            <div style={{
              flexShrink:0, padding:"8px 14px",
              background:T.overlayHdr,
              borderBottom:`2px solid ${A.amber}`,
              display:"flex", alignItems:"center", justifyContent:"space-between",
              position:"sticky", top:0, zIndex:10,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontFamily:"var(--f-ui)", fontSize:13, fontWeight:700, letterSpacing:3, color:A.amber }}>
                  ✦ IFR CLEARANCE CAPTURED — CRAFT
                </div>
                {forceIfrMode && (
                  <div style={{ fontFamily:"var(--f-mono)", fontSize:7, color:A.teal, background:`${A.teal}12`, border:`1px solid ${A.teal}38`, padding:"1px 6px", borderRadius:2, letterSpacing:1 }}>
                    FORCED
                  </div>
                )}
              </div>
              <button onClick={() => setIfrOverlay(false)} style={{
                fontFamily:"var(--f-ui)", fontSize:11, fontWeight:700, letterSpacing:1,
                padding:"4px 14px", borderRadius:3, cursor:"pointer",
                background:`${A.red}12`, color:A.red, border:`1px solid ${A.red}`,
              }}>✕ CLOSE</button>
            </div>
            <div style={{ padding:"12px 14px" }}>
              <CraftCard
                T={T}
                data={ifrData}
                tail={tail}
                onClear={() => onSetIfrData({ C:"",R:"",A:"",F:"",T:"" })}
                forceIfrMode={forceIfrMode}
                onToggleForce={onToggleForce}
                onSetIfrData={onSetIfrData}
              />
            </div>
          </div>
        )}

      </div>{/* end Section E */}

      {/* ═══ SECTION F — REPLAY TACTICAL BAR ═══════════════════════════════ */}
      <div style={{ flexShrink:0, borderTop:`1px solid ${T.border}` }}>
        <button
          onClick={() => onReplay(10)}
          style={{
            width:"100%", padding:"11px 14px",
            cursor:"pointer", border:"none", outline:"none",
            background: replayActive ? T.replayBgHot : T.replayBg,
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            transition:"background 0.15s",
          }}
        >
          <svg width={14} height={14} viewBox="0 0 20 20" fill="none">
            <polygon points="16,10 6,4 6,16" fill={replayActive?A.amber:A.blue} opacity="0.92"/>
            <line x1="4" y1="4" x2="4" y2="16" stroke={replayActive?A.amber:A.blue} strokeWidth="2.5" strokeLinecap="round" opacity="0.92"/>
          </svg>
          <span style={{
            fontFamily:"var(--f-ui)", fontSize:12, fontWeight:700, letterSpacing:3,
            color: replayActive ? A.amber : A.blue, textTransform:"uppercase",
          }}>
            {replayActive ? "▶ REPLAYING LAST 10s…" : "⏮ REPLAY LAST 10 SECONDS"}
          </span>
          {replayActive && (
            <div style={{ width:7, height:7, borderRadius:"50%", background:A.amber, animation:"commPulse 0.8s ease infinite" }}/>
          )}
        </button>
      </div>

      {/* ═══ SECTION G — STATUS BAR ═════════════════════════════════════════ */}
      <div style={{
        flexShrink:0, padding:"4px 14px",
        background:T.statusBg, borderTop:`1px solid ${T.border}`,
        display:"flex", alignItems:"center", gap:12,
        transition:"background 0.2s ease",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{
            width:6, height:6, borderRadius:"50%",
            background: listening ? A.green : T.dimDot,
            boxShadow: listening ? `0 0 6px ${A.green}` : "none",
            animation: listening ? "commGlow 2s ease infinite" : "none",
            transition:"all 0.3s",
          }}/>
          <span style={{ fontFamily:"var(--f-mono)", fontSize:7, color:T.textDim, letterSpacing:1.5 }}>
            {listening ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
        <span style={{ fontFamily:"var(--f-mono)", fontSize:7, color:T.textDim, letterSpacing:1 }}>{tail}</span>
        <span style={{ fontFamily:"var(--f-mono)", fontSize:7, color:T.textDim, letterSpacing:1 }}>{txLog.length} TX</span>
        {forceIfrMode && (
          <span style={{ fontFamily:"var(--f-mono)", fontSize:7, color:A.teal, letterSpacing:1, marginLeft:"auto" }}>▶ IFR FORCE</span>
        )}
        {watchdogState !== "clear" && (
          <span style={{ fontFamily:"var(--f-mono)", fontSize:7, color:isUnanswered?A.red:A.amber, letterSpacing:1, marginLeft:"auto", animation:"commPulse 1s ease infinite" }}>
            ⚠ {isUnanswered ? "UNANSWERED" : "ALERT"}
          </span>
        )}
      </div>

    </div>
  );
}

export default CommPage;
