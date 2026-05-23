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
//   watchdogState   — "clear"|"alert"|"unanswered"
//   watchdogTx      — object|null
//   ackCountdown    — number
//   onStartListen   — fn()
//   onStopListen    — fn()
//   onAckCall       — fn()
//   onReplay        — fn(seconds)
//   replayActive    — bool
//   forceIfrMode    — bool
//   onToggleForce   — fn()
//   ifrData         — { N,W,K,R,A,F,T }
//   onSetIfrData    — fn(data)
//   atisData        — { info,wind,altimeter,visibility,sky }
//   onSetAtisData   — fn(data)
//   gndData         — { clearedTo,route,altitude,frequency,taxi,squawk }
//   onSetGndData    — fn(data)
// ──────
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";

// ─── ACCENT COLORS — always fixed (avionics brand palette) ───────────────────
// Background, text, and border tokens come from the computed theme (T) below.
const A = {
  blue:   "#3a9ad4",
  red:    "#e85a4a",
  green:  "#3dbe6c",
  amber:  "#e8c84a",
  teal:   "#4ae8c8",
  purple: "#c87ae8",
};

// ─── THEME TOKENS — computed from lightMode prop ──────────────────────────────
function buildTheme(light) {
  return light ? {
    // Page structure
    pageBg:       "#f4f5fa",
    headerBg:     "linear-gradient(135deg,#cbd0e2,#d8dce8)",
    headerBorder: "#1a6ab0", // Swapped to deep blue anchor line for contrast
    vuBg:         "#e2e4ee",
    tabBarBg:     "#d8dce8",
    tabBorder:    "#8a94a8",
    statusBg:     "#cbd0e2",
    replayBg:     "#dde0ec",
    replayBgHot:  "rgba(26,106,176,0.22)",
    overlayBg:    "#f4f5fa",
    overlayHdr:   "linear-gradient(90deg,rgba(26,106,176,0.15),transparent)",
    cardBg:       "#ffffff",
    cardBgAlt:    "#dde0ec",
    inputBg:      "#ffffff",
    inputBdr:      (c) => c === A.amber ? "#b08000" : `${c}80`, // Force amber text borders to be darker brown/gold
    // High-Contrast Typography
    textMain:     "#050a15", // Jet black core text
    textMuted:    "#202b40", // Dark charcoal secondary text
    textDim:      "#3a4860", // Visible dark blue-gray details
    // Borders
    border:       "#8a94a8",
    borderLight:  "#cbd0e2",
    // Scrollbar
    scrollBg:     "#a0a8b8",
    // Dim dot
    dimDot:       "#5a6680",
  } : {
    // Page structure
    pageBg:       "#0d0f12",
    headerBg:     "linear-gradient(135deg,#0a0c10,#141820)",
    headerBorder: A.teal,
    vuBg:         "rgba(10,14,20,0.85)",
    tabBarBg:     "#0a0c10",
    tabBorder:    "#2a3040",
    statusBg:     "#070910",
    replayBg:     "linear-gradient(90deg,rgba(58,154,212,0.09) 0%,rgba(10,14,20,0.35) 55%,rgba(58,154,212,0.09) 100%)",
    replayBgHot:  "rgba(58,154,212,0.2)",
    overlayBg:    "rgba(7,9,14,0.97)",
    overlayHdr:   "linear-gradient(90deg,rgba(232,200,74,0.14),rgba(10,14,20,0))",
    cardBg:       "rgba(10,14,20,0.9)",
    cardBgAlt:    "rgba(10,14,20,0.9)",
    inputBg:      "rgba(5,8,12,0.9)",
    inputBdr:     (c) => `${c}30`,
    // Text
    textMain:     "#e8e4d8",
    textMuted:    "#7a8090",
    textDim:      "#4a5068",
    // Borders
    border:       "#2a3040",
    borderLight:  "#1a2030",
    // Scrollbar
    scrollBg:     "#2a3040",
    // Dim dot
    dimDot:       "#4a5068",
  };
}

// ─── NWKRAFT FIELD DEFINITIONS ────────────────────────────────────────────────
const NWKRAFT_FIELDS = [
  { key:"N", label:"N — NAME",        hint:"Clearance name / facility",  color:A.blue   },
  { key:"W", label:"W — WEATHER",     hint:"Wx / filing weather",        color:A.teal   },
  { key:"K", label:"K — KODE",        hint:"Squawk code",                color:A.amber  },
  { key:"R", label:"R — ROUTE",       hint:"Route of flight",            color:A.green  },
  { key:"A", label:"A — ALTITUDE",    hint:"Initial altitude / expect",  color:A.purple },
  { key:"F", label:"F — FREQUENCY",   hint:"Departure frequency",        color:A.blue   },
  { key:"T", label:"T — TRANSPONDER", hint:"Transponder instructions",   color:A.amber  },
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
        fontFamily:"'Share Tech Mono',monospace", fontSize:12, fontWeight:700,
        border:`1px solid ${s.color}40`,
      }}>
        {tok.text.toUpperCase()}
      </span>
    );
  });
}

// ─── MINI SCRIBBLE FIELD ──────────────────────────────────────────────────────
// Dual-input field: text box + tap-to-expand inline drawing canvas
function MiniScribbleField({ T, label, value, onChange, color, placeholder }) {
  const [canvasOpen, setCanvasOpen] = useState(false);
  const canvasRef = useRef(null);
  const drawingRef = useRef({ active: false, lastX: 0, lastY: 0 });

  const startDraw = (e) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    drawingRef.current = { active: true, lastX: src.clientX - rect.left, lastY: src.clientY - rect.top };
  };
  const draw = (e) => {
    if (!drawingRef.current.active) return;
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    const x = src.clientX - rect.left, y = src.clientY - rect.top;
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(drawingRef.current.lastX, drawingRef.current.lastY);
    ctx.lineTo(x, y); ctx.stroke();
    drawingRef.current = { active: true, lastX: x, lastY: y };
  };
  const endDraw = () => { drawingRef.current.active = false; };
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Row: label + text input + scribble toggle */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom: canvasOpen ? 4 : 0 }}>
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:color, letterSpacing:1.5, flexShrink:0, width:70 }}>
          {label}
        </div>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex:1, boxSizing:"border-box",
            background:T.inputBg, border:`1px solid ${T.inputBdr(color)}`,
            borderRadius:3, padding:"5px 8px", outline:"none",
            fontFamily:"'Share Tech Mono',monospace", fontSize:14, fontWeight:700,
            color:value ? color : T.textDim, caretColor:color,
          }}
        />
        <button
          onClick={() => setCanvasOpen(o => !o)}
          title={canvasOpen ? "Hide scribble pad" : "Open scribble pad"}
          style={{
            flexShrink:0, width:28, height:28, borderRadius:3, cursor:"pointer", border:`1px solid ${color}40`,
            background: canvasOpen ? `${color}18` : "transparent",
            color: canvasOpen ? color : T.textDim,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, lineHeight:1, transition:"all 0.15s",
          }}
        >
          ✏
        </button>
      </div>
      {/* Inline canvas — only rendered when open */}
      {canvasOpen && (
        <div style={{ position:"relative", marginLeft:76 }}>
          <canvas
            ref={canvasRef}
            width={340} height={52}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
            style={{
              display:"block", width:"100%", height:52, borderRadius:3, cursor:"crosshair",
              background:T.inputBg, border:`1px dashed ${color}40`,
              touchAction:"none",
            }}
          />
          <button
            onClick={clearCanvas}
            style={{
              position:"absolute", top:3, right:3,
              fontFamily:"'Share Tech Mono',monospace", fontSize:7, padding:"1px 5px",
              borderRadius:2, cursor:"pointer", background:"transparent",
              color:T.textDim, border:`1px solid ${T.border}`,
            }}
          >CLR</button>
        </div>
      )}
    </div>
  );
}

// ─── ATIS CARD ────────────────────────────────────────────────────────────────
function AtisCard({ T, data, onSetAtisData }) {
  const FIELDS = [
    { key:"info",       label:"INFORMATION", color:A.teal,   hint:"Ident letter" },
    { key:"wind",       label:"WIND",        color:A.blue,   hint:"Dir/speed (e.g. 270° AT 12KT)" },
    { key:"altimeter",  label:"ALTIMETER",   color:A.amber,  hint:"e.g. 29.92" },
    { key:"visibility", label:"VISIBILITY",  color:A.green,  hint:"e.g. 10SM" },
    { key:"sky",        label:"SKY",         color:A.purple, hint:"e.g. FEW 3500" },
  ];
  return (
    <div style={{ background:T.cardBg, border:`1px solid ${A.teal}28`, borderRadius:5, overflow:"hidden", transition:"background 0.2s" }}>
      <div style={{ background:`${A.teal}12`, borderBottom:`2px solid ${A.teal}`, padding:"7px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, fontWeight:700, letterSpacing:3, color:A.teal }}>ATIS</div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim, letterSpacing:1 }}>AUTO-FILL · AI PARSED</div>
        </div>
        <button onClick={() => onSetAtisData({ info:"",wind:"",altimeter:"",visibility:"",sky:"" })} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, padding:"3px 9px", borderRadius:3, cursor:"pointer", background:"transparent", color:A.red, border:`1px solid ${A.red}50` }}>↺ CLEAR</button>
      </div>
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

// ─── GROUND CLEARANCE CARD ────────────────────────────────────────────────────
function GndCard({ T, data, onSetGndData }) {
  const FIELDS = [
    { key:"clearedTo",  label:"CLEARED TO",  color:A.green,  hint:"Destination" },
    { key:"route",      label:"ROUTE",       color:A.blue,   hint:"Via / as filed" },
    { key:"altitude",   label:"ALTITUDE",    color:A.purple, hint:"Maintain / expect" },
    { key:"frequency",  label:"FREQUENCY",   color:A.teal,   hint:"Departure freq" },
    { key:"taxi",       label:"TAXI",        color:A.amber,  hint:"Taxi instructions" },
    { key:"squawk",     label:"SQUAWK",      color:A.red,    hint:"4-digit code" },
  ];
  return (
    <div style={{ background:T.cardBg, border:`1px solid ${A.green}28`, borderRadius:5, overflow:"hidden", transition:"background 0.2s" }}>
      <div style={{ background:`${A.green}10`, borderBottom:`2px solid ${A.green}`, padding:"7px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, fontWeight:700, letterSpacing:3, color:A.green }}>GROUND CLEARANCE</div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim, letterSpacing:1 }}>AUTO-FILL · AI PARSED</div>
        </div>
        <button onClick={() => onSetGndData({ clearedTo:"",route:"",altitude:"",frequency:"",taxi:"",squawk:"" })} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, padding:"3px 9px", borderRadius:3, cursor:"pointer", background:"transparent", color:A.red, border:`1px solid ${A.red}50` }}>↺ CLEAR</button>
      </div>
      <div style={{ padding:"8px 12px", display:"flex", flexDirection:"column", gap:6 }}>
        {FIELDS.map(f => (
          <MiniScribbleField key={f.key} T={T} label={f.label} color={f.color} placeholder={f.hint}
            value={data[f.key]||""}
            onChange={v => onSetGndData({ ...data, [f.key]: v })}
          />
        ))}
        {data.squawk && (
          <div style={{ background:`${A.red}12`, border:`1px solid ${A.red}40`, borderRadius:4, padding:"7px 12px", display:"flex", alignItems:"center", gap:14, marginTop:2 }}>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:A.red, letterSpacing:2 }}>SQUAWK</div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, fontWeight:700, color:A.amber, letterSpacing:4 }}>{data.squawk}</div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim }}>SET XPDR</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NWKRAFT CARD ─────────────────────────────────────────────────────────────
function NwkraftCard({ T, data, tail, onClear, forceIfrMode, onToggleForce, onSetIfrData }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, fontWeight:700, letterSpacing:3, color:A.amber }}>
            IFR CLEARANCE
          </div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim, letterSpacing:1, marginTop:1 }}>
            NWKRAFT FORMAT · {tail}
          </div>
        </div>
        <button onClick={onClear} style={{
          fontFamily:"'Share Tech Mono',monospace", fontSize:8, padding:"4px 10px", borderRadius:3, cursor:"pointer",
          background:"transparent", color:A.red, border:`1px solid ${A.red}60`,
        }}>↺ CLEAR</button>
      </div>

      {/* Fields */}
      {NWKRAFT_FIELDS.map(f => (
        <div key={f.key} style={{
          background:T.cardBg, border:`1px solid ${f.color}22`,
          borderLeft:`4px solid ${f.color}`, borderRadius:4, padding:"7px 12px",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, fontWeight:700, color:f.color, lineHeight:1, width:22, textAlign:"center" }}>
              {f.key}
            </div>
            <div>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:f.color, letterSpacing:2 }}>{f.label}</div>
              <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:9, color:T.textDim }}>{f.hint}</div>
            </div>
          </div>
          <MiniScribbleField
            T={T} label="" color={f.color} placeholder={f.hint}
            value={data[f.key]||""}
            onChange={v => onSetIfrData({ ...data, [f.key]: v })}
          />
        </div>
      ))}

      {/* Squawk display */}
      {data.K && (
        <div style={{
          background:`${A.blue}12`, border:`1px solid ${A.blue}40`,
          borderRadius:5, padding:"8px 14px",
          display:"flex", alignItems:"center", gap:14,
        }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:A.blue, letterSpacing:2 }}>SQUAWK</div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:30, fontWeight:700, color:A.amber, letterSpacing:4 }}>{data.K}</div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim }}>SET XPDR</div>
        </div>
      )}

      {/* Force IFR toggle */}
      <button onClick={onToggleForce} style={{
        padding:"9px", borderRadius:4, cursor:"pointer",
        background: forceIfrMode ? `${A.teal}18` : T.cardBg,
        color: forceIfrMode ? A.teal : T.textDim,
        border:`1.5px solid ${forceIfrMode ? A.teal : T.border}`,
        fontFamily:"'Oswald',sans-serif", fontSize:11, fontWeight:700, letterSpacing:2,
        transition:"all 0.15s",
      }}>
        {forceIfrMode ? "⏹ FORCE IFR CAPTURE — ON · TAP TO DEACTIVATE" : "⏵ FORCE IFR CAPTURE"}
      </button>
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
  ifrData        = { N:"",W:"",K:"",R:"",A:"",F:"",T:"" },
  onSetIfrData   = () => {},
  atisData       = { info:"",wind:"",altimeter:"",visibility:"",sky:"" },
  onSetAtisData  = () => {},
  gndData        = { clearedTo:"",route:"",altitude:"",frequency:"",taxi:"",squawk:"" },
  onSetGndData   = () => {},
}) {
  // ── Theme computed from prop — recalculates on every lightMode toggle ──────
  const T = buildTheme(lightMode);

  // ── Local UI state only ────────────────────────────────────────────────────
  const [ifrOverlay,  setIfrOverlay]  = useState(false);
  const [activeTab,   setActiveTab]   = useState("active");
  const [replayIndex, setReplayIndex] = useState(null);

  const tail         = aircraft ? aircraft.tail : "UNKNOWN";
  const isAlert      = watchdogState === "alert";
  const isUnanswered = watchdogState === "unanswered";

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
      fontFamily:"'Rajdhani',sans-serif",
      animation: isUnanswered ? "commFlash 0.5s ease infinite alternate" : "none",
      transition:"background 0.2s ease",
    }}>

      <style>{`
        @keyframes commFlash {
          from { background:${lightMode?"#f4f5fa":"#0d0f12"}; }
          to   { background:rgba(232,90,74,0.18); }
        }
        @keyframes commPulse {
          0%   { box-shadow:0 0 0 0 rgba(232,90,74,0.6); }
          70%  { box-shadow:0 0 0 10px rgba(232,90,74,0); }
          100% { box-shadow:0 0 0 0 rgba(232,90,74,0); }
        }
        @keyframes commGlow {
          0%   { box-shadow:0 0 0 0 rgba(61,190,108,0.5); }
          70%  { box-shadow:0 0 0 8px rgba(61,190,108,0); }
          100% { box-shadow:0 0 0 0 rgba(61,190,108,0); }
        }
        @keyframes commSlideIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes commSlideUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes vuBar {
          0%,100% { opacity:0.72; }
          50%     { opacity:1; }
        }
      `}</style>

      {/* ═══ SECTION A — HEADER ══════════════════════════════════════════════ */}
      <div style={{
        flexShrink:0, padding:"8px 14px",
        background:T.headerBg,
        borderBottom:`2px solid ${T.headerBorder}`,
        display:"flex", alignItems:"center", gap:10,
        transition:"background 0.2s ease",
      }}>
        <svg width={18} height={18} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="2.5" fill={A.teal}/>
          <path d="M10 10 Q6 5 3 2"   stroke={A.teal} strokeWidth="1.5" strokeLinecap="round" opacity={listening?"1":"0.28"}/>
          <path d="M10 10 Q14 5 17 2"  stroke={A.teal} strokeWidth="1.5" strokeLinecap="round" opacity={listening?"1":"0.28"}/>
          <path d="M10 10 Q7 7 5 4"   stroke={A.teal} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" opacity={listening?"0.7":"0.12"}/>
          <path d="M10 10 Q13 7 15 4"  stroke={A.teal} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" opacity={listening?"0.7":"0.12"}/>
          <line x1="10" y1="12.5" x2="10" y2="18" stroke={A.teal} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>

        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, fontWeight:700, letterSpacing:3, color:A.teal }}>
            COMM WATCHDOG
          </div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim, letterSpacing:1.5, marginTop:1 }}>
            CALLSIGN: {tail} · {listening ? "MONITORING" : "STANDBY"}
          </div>
        </div>

        {/* Force IFR */}
        <button onClick={() => { onToggleForce(); if (!forceIfrMode) setIfrOverlay(true); }} style={{
          fontFamily:"'Share Tech Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:1,
          padding:"4px 10px", borderRadius:3, cursor:"pointer",
          background: forceIfrMode ? `${A.teal}18` : "transparent",
          color: forceIfrMode ? A.teal : T.textDim,
          border:`1px solid ${forceIfrMode ? A.teal : T.border}`,
          transition:"all 0.15s",
        }}>
          {forceIfrMode ? "▶ IFR ON" : "IFR CAPTURE"}
        </button>

        {/* Listen toggle */}
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
            fontFamily:"'Oswald',sans-serif", fontSize:11, fontWeight:700, letterSpacing:2,
            padding:"5px 14px", borderRadius:4, cursor:"pointer",
            background: listening ? `${A.red}18` : `${A.teal}12`,
            color:  listening ? A.red : A.teal,
            border:`1.5px solid ${listening ? A.red : A.teal}`,
            animation: listening && micStatus==="active" ? "commGlow 1.8s ease infinite" : "none",
            transition:"all 0.15s",
          }}
        >
          {listening ? "⏹ STOP" : "⏵ LISTEN"}
        </button>
      </div>

      {/* ═══ SECTION B — ACK CALL ALERT ════════════════════════════════════ */}
      {(isAlert || isUnanswered) && (
        <div style={{
          flexShrink:0, padding:"10px 14px",
          background: isUnanswered ? "rgba(232,90,74,0.22)" : "rgba(232,200,74,0.12)",
          borderBottom:`2px solid ${isUnanswered ? A.red : A.amber}`,
          display:"flex", alignItems:"center", gap:12,
          animation:"commSlideIn 0.2s ease",
        }}>
          <div style={{
            width:36, height:36, borderRadius:"50%", flexShrink:0,
            background: isUnanswered ? "rgba(232,90,74,0.3)" : "rgba(232,200,74,0.2)",
            border:`2px solid ${isUnanswered ? A.red : A.amber}`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            animation: isUnanswered ? "commPulse 0.8s ease infinite" : "commPulse 1.5s ease infinite",
          }}>
            {isUnanswered ? "🔴" : "📡"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, fontWeight:700, letterSpacing:2, color:isUnanswered?A.red:A.amber }}>
              {isUnanswered ? "⚠ UNANSWERED CALL" : `CALLSIGN ALERT — ${ackCountdown}s`}
            </div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:T.textMain, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {watchdogTx?.text || ""}
            </div>
          </div>
          <button onClick={onAckCall} style={{
            fontFamily:"'Oswald',sans-serif", fontSize:13, fontWeight:700, letterSpacing:2,
            padding:"8px 18px", borderRadius:4, cursor:"pointer", flexShrink:0,
            background: isUnanswered ? A.red : A.amber, color:"#000", border:"none",
            boxShadow: isUnanswered ? `0 0 20px ${A.red}80` : `0 0 12px ${A.amber}60`,
            animation: isUnanswered ? "commPulse 0.8s ease infinite" : "none",
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
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim, letterSpacing:1, width:26, flexShrink:0 }}>
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
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim, width:22, textAlign:"right", flexShrink:0 }}>
            {micStatus==="denied"?"⛔":micStatus==="error"?"ERR":listening?"ON":"OFF"}
          </div>
        </div>
        <div style={{
          fontFamily:"'Share Tech Mono',monospace", fontSize:11,
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
          { key:"active",  label:"ACTIVE FEED", color:A.teal  },
          { key:"archive", label:"ARCHIVE LOG",  color:A.blue  },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex:1, padding:"7px 4px", cursor:"pointer", border:"none",
            borderRight:`1px solid ${T.border}`,
            background: activeTab===tab.key ? `${tab.color}14` : "transparent",
            borderTop:`2px solid ${activeTab===tab.key ? tab.color : "transparent"}`,
            transition:"all 0.12s",
          }}>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:1.5, color:activeTab===tab.key?tab.color:T.textDim, textTransform:"uppercase" }}>
              {tab.label}
            </span>
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
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:2, color:tc.c, background:`${tc.c}14`, padding:"2px 8px", borderRadius:3 }}>
                        {tc.label}
                      </div>
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim }}>
                        {latest.ts.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}Z
                      </div>
                    </div>
                    <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:16, fontWeight:700, lineHeight:1.6, color:T.textMain }}>
                      <TokenText entry={latest}/>
                    </div>
                    {latest.nwkraft && (
                      <button onClick={() => showIfrOverlay(latest.nwkraft)} style={{ marginTop:8, fontFamily:"'Share Tech Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:1, padding:"3px 10px", borderRadius:3, cursor:"pointer", background:`${A.amber}12`, color:A.amber, border:`1px solid ${A.amber}` }}>
                        ✦ VIEW NWKRAFT
                      </button>
                    )}
                  </div>
                );
              })() : (
                <div style={{ textAlign:"center", padding:"30px 20px" }}>
                  <div style={{ fontSize:32, marginBottom:8, opacity:0.28 }}>📡</div>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:3, color:T.textDim }}>AWAITING TRANSMISSION</div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, marginTop:5, color:T.textDim, opacity:0.5 }}>
                    {listening ? `MONITORING · ${tail}` : "TAP LISTEN TO BEGIN"}
                  </div>
                </div>
              )}

              {/* Three smart cards */}
              <AtisCard T={T} data={atisData} onSetAtisData={onSetAtisData} />
              <GndCard  T={T} data={gndData}  onSetGndData={onSetGndData}  />
              <div style={{ background:T.cardBg, border:`1px solid ${A.amber}28`, borderRadius:5, overflow:"hidden", transition:"background 0.2s" }}>
                <div style={{ background:`${A.amber}10`, borderBottom:`2px solid ${A.amber}`, padding:"7px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, fontWeight:700, letterSpacing:3, color:A.amber }}>IFR CLEARANCE</div>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim, letterSpacing:1 }}>NWKRAFT FORMAT · AUTO-FILL</div>
                  </div>
                  <button onClick={() => onSetIfrData({ N:"",W:"",K:"",R:"",A:"",F:"",T:"" })} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, padding:"3px 9px", borderRadius:3, cursor:"pointer", background:"transparent", color:A.red, border:`1px solid ${A.red}50` }}>↺ CLEAR</button>
                </div>
                <div style={{ padding:"8px 12px", display:"flex", flexDirection:"column", gap:6 }}>
                  {NWKRAFT_FIELDS.map(f => (
                    <MiniScribbleField key={f.key} T={T}
                      label={f.label.replace("— ","")} color={f.color} placeholder={f.hint}
                      value={ifrData[f.key]||""}
                      onChange={v => onSetIfrData({ ...ifrData, [f.key]: v })}
                    />
                  ))}
                  {ifrData.K && (
                    <div style={{ background:`${A.blue}12`, border:`1px solid ${A.blue}40`, borderRadius:4, padding:"7px 12px", display:"flex", alignItems:"center", gap:14, marginTop:2 }}>
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:A.blue, letterSpacing:2 }}>SQUAWK</div>
                      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, fontWeight:700, color:A.amber, letterSpacing:4 }}>{ifrData.K}</div>
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim }}>SET XPDR</div>
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
                <div style={{ padding:"30px 20px", textAlign:"center", fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:T.textDim, letterSpacing:1 }}>
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
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:ec, letterSpacing:1, flexShrink:0, marginTop:2, padding:"1px 5px", borderRadius:2, background:`${ec}14`, border:`1px solid ${ec}22` }}>
                        {entry.type.replace("_"," ").toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:13, color:T.textMain, lineHeight:1.4 }}>
                          <TokenText entry={entry}/>
                        </div>
                        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:T.textDim, marginTop:2 }}>
                          {entry.ts.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})} LOCAL
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:3, flexShrink:0 }}>
                        <button onClick={() => replayEntry(entry)} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, padding:"2px 6px", borderRadius:2, cursor:"pointer", background:"transparent", color:isReplaying?A.amber:T.textDim, border:`1px solid ${isReplaying?A.amber:T.border}` }}>
                          {isReplaying?"▶▶":"▶"}
                        </button>
                        {entry.nwkraft && (
                          <button onClick={() => showIfrOverlay(entry.nwkraft)} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, padding:"2px 6px", borderRadius:2, cursor:"pointer", background:`${A.amber}08`, color:A.amber, border:`1px solid ${A.amber}28` }}>IFR</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {txLog.length > 0 && (
                <div style={{ padding:"8px 14px" }}>
                  <button style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, padding:"4px 12px", borderRadius:3, cursor:"pointer", background:"transparent", color:A.red, border:`1px solid ${A.red}50` }}>↺ CLEAR LOG</button>
                </div>
              )}
            </div>
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
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, fontWeight:700, letterSpacing:3, color:A.amber }}>
                  ✦ IFR CLEARANCE CAPTURED
                </div>
                {forceIfrMode && (
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:A.teal, background:`${A.teal}12`, border:`1px solid ${A.teal}38`, padding:"1px 6px", borderRadius:2, letterSpacing:1 }}>
                    FORCED
                  </div>
                )}
              </div>
              <button onClick={() => setIfrOverlay(false)} style={{
                fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:700, letterSpacing:1,
                padding:"4px 14px", borderRadius:3, cursor:"pointer",
                background:`${A.red}12`, color:A.red, border:`1px solid ${A.red}`,
              }}>✕ CLOSE</button>
            </div>
            <div style={{ padding:"12px 14px" }}>
              <NwkraftCard
                T={T}
                data={ifrData}
                tail={tail}
                onClear={() => onSetIfrData({ N:"",W:"",K:"",R:"",A:"",F:"",T:"" })}
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
            fontFamily:"'Oswald',sans-serif", fontSize:12, fontWeight:700, letterSpacing:3,
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
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:T.textDim, letterSpacing:1.5 }}>
            {listening ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:T.textDim, letterSpacing:1 }}>{tail}</span>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:T.textDim, letterSpacing:1 }}>{txLog.length} TX</span>
        {forceIfrMode && (
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:A.teal, letterSpacing:1, marginLeft:"auto" }}>▶ IFR FORCE</span>
        )}
        {watchdogState !== "clear" && (
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:isUnanswered?A.red:A.amber, letterSpacing:1, marginLeft:"auto", animation:"commPulse 1s ease infinite" }}>
            ⚠ {isUnanswered ? "UNANSWERED" : "ALERT"}
          </span>
        )}
      </div>

    </div>
  );
}

export default CommPage;
