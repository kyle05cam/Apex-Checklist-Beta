// ─────────────────────────────────────────────────────────────────────────────
// APEX AVIATION — COMM PAGE v5 (Cleaned Tactical Layer + Smart NWKRAFT)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";

const A = {
  blue:   "#3a9ad4",
  red:    "#e85a4a",
  green:  "#3dbe6c",
  amber:  "#e8c84a",
  teal:   "#4ae8c8",
  purple: "#c87ae8",
};

function buildTheme(light) {
  return light ? {
    pageBg:       "#f4f5fa",
    headerBg:     "linear-gradient(135deg,#cbd0e2,#d8dce8)",
    headerBorder: "#1a6ab0",
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
    inputBdr:      (c) => c === A.amber ? "#b08000" : `${c}80`,
    textMain:     "#050a15",
    textMuted:    "#202b40",
    textDim:      "#3a4860",
    border:       "#8a94a8",
    borderLight:  "#cbd0e2",
    dimDot:       "#5a6680",
  } : {
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
    textMain:     "#e8e4d8",
    textMuted:    "#7a8090",
    textDim:      "#4a5068",
    border:       "#2a3040",
    borderLight:  "#1a2030",
    dimDot:       "#4a5068",
  };
}

const NWKRAFT_FIELDS = [
  { key:"N", label:"N — NAME",        hint:"Clearance name / facility",  color:A.blue   },
  { key:"W", label:"W — WEATHER",     hint:"Wx / filing weather",        color:A.teal   },
  { key:"K", label:"K — KODE",        hint:"Squawk code (Auto Display)", color:A.amber  },
  { key:"R", label:"R — ROUTE",       hint:"Route of flight",            color:A.green  },
  { key:"A", label:"A — ALTITUDE",    hint:"Initial altitude / expect",  color:A.purple },
  { key:"F", label:"F — FREQUENCY",   hint:"Departure frequency",        color:A.blue   },
  { key:"T", label:"T — TRANSPONDER", hint:"Transponder instructions",   color:A.amber  },
];

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

function NwkraftCard({ T, data, tail, onClear, forceIfrMode, onToggleForce, onSetIfrData }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, fontWeight:700, letterSpacing:3, color:A.amber }}>
            IFR CLEARANCE ASSISTANT
          </div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim, letterSpacing:1, marginTop:1 }}>
            NWKRAFT PERSISTENT LOGS · {tail}
          </div>
        </div>
        <button onClick={onClear} style={{
          fontFamily:"'Share Tech Mono',monospace", fontSize:8, padding:"4px 10px", borderRadius:3, cursor:"pointer",
          background:"transparent", color:A.red, border:`1px solid ${A.red}60`,
        }}>↺ WIPE COCKPIT LOGS</button>
      </div>

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
            </div>
          </div>
          <input
            type="text"
            value={data[f.key] || ""}
            onChange={e => onSetIfrData({ ...data, [f.key]: e.target.value })}
            placeholder={f.hint}
            style={{
              width:"100%", boxSizing:"border-box",
              background:T.inputBg, border:`1px solid ${T.inputBdr(f.color)}`,
              borderRadius:3, padding:"5px 10px", outline:"none",
              fontFamily:"'Share Tech Mono',monospace", fontSize:13, color:T.textMain,
              caretColor:f.color,
            }}
          />
        </div>
      ))}

      {data.K && (
        <div style={{
          background:`${A.blue}12`, border:`1px solid ${A.blue}40`,
          borderRadius:5, padding:"8px 14px",
          display:"flex", alignItems:"center", gap:14, marginTop:4
        }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:A.blue, letterSpacing:2 }}>SQUAWK CODE</div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:30, fontWeight:700, color:A.amber, letterSpacing:4 }}>{data.K}</div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim }}>SET AIRFRAME TRANSPONDER</div>
        </div>
      )}
    </div>
  );
}

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
}) {
  const T = buildTheme(lightMode);
  const [ifrOverlay,  setIfrOverlay]  = useState(false);
  const [activeTab,   setActiveTab]   = useState("live");
  const [replayIndex, setReplayIndex] = useState(null);

  const tail         = aircraft ? aircraft.tail : "UNKNOWN";
  const isAlert      = watchdogState === "alert";
  const isUnanswered = watchdogState === "unanswered";

  const VU_BARS  = 20;
  const vuActive = Math.round(Math.max(0, Math.min(1, rmsLevel)) * VU_BARS);

  const showIfrOverlay = (data) => { onSetIfrData(data); setIfrOverlay(true); };
  const replayEntry    = (entry) => { setReplayIndex(entry.id); setTimeout(() => setReplayIndex(null), 3000); };

  return (
    <div style={{
      height:"100%", display:"flex", flexDirection:"column",
      overflow:"hidden", position:"relative", background: T.pageBg,
      fontFamily:"'Rajdhani',sans-serif",
      animation: isUnanswered ? "commFlash 0.5s ease infinite alternate" : "none",
      transition:"background 0.2s ease",
    }}>

      <style>{`
        @keyframes commFlash { from { background:${lightMode?"#f4f5fa":"#0d0f12"}; } to { background:rgba(232,90,74,0.18); } }
        @keyframes commPulse { 0% { box-shadow:0 0 0 0 rgba(232,90,74,0.6); } 70% { box-shadow:0 0 0 10px rgba(232,90,74,0); } 100% { box-shadow:0 0 0 0 rgba(232,90,74,0); } }
        @keyframes commGlow { 0% { box-shadow:0 0 0 0 rgba(61,190,108,0.5); } 70% { box-shadow:0 0 0 8px rgba(61,190,108,0); } 100% { box-shadow:0 0 0 0 rgba(61,190,108,0); } }
        @keyframes commSlideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes commSlideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes vuBar { 0%,100% { opacity:0.72; } 50% { opacity:1; } }
      `}</style>

      {/* ═══ SECTION A — HEADER ══════════════════════════════════════════════ */}
      <div style={{
        flexShrink:0, padding:"8px 14px", background:T.headerBg,
        borderBottom:`2px solid ${T.headerBorder}`, display:"flex", alignItems:"center", gap:10,
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
            FREQUENCY DECK RATIO · ACTIVE LIGHT COUPLING
          </div>
        </div>

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
          {listening ? "⏹ STOP WATCH" : "⏵ LISTEN"}
        </button>
      </div>

      {/* ═══ SECTION B — WATCHDOG PANEL ALERT ═════════════════════════════ */}
      {(isAlert || isUnanswered) && (
        <div style={{
          flexShrink:0, padding:"10px 14px",
          background: isUnanswered ? "rgba(232,90,74,0.22)" : "rgba(232,200,74,0.12)",
          borderBottom:`2px solid ${isUnanswered ? A.red : A.amber}`,
          display:"flex", alignItems:"center", gap:12, animation:"commSlideIn 0.2s ease",
        }}>
          <div style={{
            width:36, height:36, borderRadius:"50%", flexShrink:0,
            background: isUnanswered ? "rgba(232,90,74,0.3)" : "rgba(232,200,74,0.2)",
            border:`2px solid ${isUnanswered ? A.red : A.amber}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
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

      {/* ═══ SECTION C — VU METER ══════════════════════════════════════════ */}
      <div style={{
        flexShrink:0, padding:"6px 14px", background:T.vuBg, borderBottom:`1px solid ${T.border}`,
        display:"flex", flexDirection:"column", gap:5, transition:"background 0.2s ease",
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
                flex:1, borderRadius:1, height: on ? (hot?10:mid?7:4) : 2,
                background: on ? (hot?A.red:mid?A.amber:A.green) : T.border,
                transition:"height 0.05s, background 0.05s", animation: on ? "vuBar 0.9s ease infinite" : "none",
              }}/>;
            })}
          </div>
        </div>
        <div style={{
          fontFamily:"'Share Tech Mono',monospace", fontSize:11, color: transcript ? A.amber : T.textDim,
          minHeight:14, letterSpacing:0.5, fontStyle: transcript ? "normal" : "italic",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        }}>
          {transcript ? `▶ ${transcript}` : commListening ? "— listening frequency —" : "TAP LISTEN UP IN THE CHECKS HEADER TO DEPLOY TRANSCRIPTS"}
        </div>
      </div>

      {/* ═══ SECTION D — SUB-TABS ═══════════════════════════════════════════ */}
      <div style={{ flexShrink:0, display:"flex", borderBottom:`1px solid ${T.border}`, background:T.tabBarBg, transition:"background 0.2s ease" }}>
        {[
          { key:"live",    label:"ACTIVE RADIO CELL", color:A.teal  },
          { key:"log",     label:"MASTER COCKPIT ARCHIVE", color:A.blue  },
          { key:"nwkraft", label:"IFR NWKRAFT FORM", color:A.amber },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex:1, padding:"10px 4px", cursor:"pointer", border:"none", borderRight:`1px solid ${T.border}`,
            background: activeTab===tab.key ? `${tab.color}14` : "transparent",
            borderTop:`2px solid ${activeTab===tab.key ? tab.color : "transparent"}`, transition:"all 0.12s",
          }}>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:1.5, color:activeTab===tab.key?tab.color:T.textDim, textTransform:"uppercase" }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ═══ SECTION E — CORE DISPLAY PANELS ════════════════════════════════ */}
      <div style={{ flex:1, overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, overflowY:"auto", overflowX:"hidden", scrollbarWidth:"thin" }}>

          {/* ── LIVE TAB: CLEAN RADIUS HIGH CONTRAST FOCUS CARD ── */}
          {activeTab === "live" && (
            <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
              {txLog.length > 0 ? (() => {
                const latest = txLog[0];
                const tc = TYPE_META[latest.type] || TYPE_META.general;
                return (
                  <div style={{
                    background:T.cardBg, border:`1.5px solid ${tc.c}30`, borderLeft:`5px solid ${tc.c}`,
                    borderRadius:6, padding:"14px 16px", animation:"commSlideIn 0.2s ease", transition:"background 0.2s ease",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:2, color:tc.c, background:`${tc.c}14`, padding:"2px 8px", borderRadius:3 }}>
                        {tc.label}
                      </div>
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:T.textDim }}>
                        {latest.ts.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}Z
                      </div>
                    </div>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:16, fontWeight:700, lineHeight:1.5, color:T.textMain }}>
                      <TokenText entry={latest}/>
                    </div>
                  </div>
                );
              })() : (
                <div style={{ textAlign:"center", padding:"60px 20px" }}>
                  <div style={{ fontSize:34, marginBottom:10, opacity:0.28 }}>📡</div>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, letterSpacing:3, color:T.textDim }}>AWAITING FREQUENCY BLOCK ACTIVE EVENT</div>
                </div>
              )}
            </div>
          )}

          {/* ── ARCHIVE LOG TAB ── */}
          {activeTab === "log" && (
            <div style={{ padding:"4px 0" }}>
              {txLog.length === 0 ? (
                <div style={{ padding:"30px 20px", textAlign:"center", fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:T.textDim, letterSpacing:1 }}>
                  NO DATA ENTRIES PRESENT
                </div>
              ) : txLog.map(entry => {
                const isReplaying = replayIndex === entry.id;
                const ec = (TYPE_META[entry.type]||TYPE_META.general).c;
                return (
                  <div key={entry.id} style={{
                    padding:"10px 14px", borderBottom:`1px solid ${T.border}`,
                    background: isReplaying ? `${A.amber}08` : "transparent", transition: "background 0.2s",
                  }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:ec, letterSpacing:1, flexShrink:0, marginTop:2, padding:"1px 5px", borderRadius:2, background:`${ec}14`, border:`1px solid ${ec}22` }}>
                        {entry.type.replace("_"," ").toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:13, color:T.textMain, lineHeight:1.4 }}>
                          <TokenText entry={entry}/>
                        </div>
                        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:T.textDim, marginTop:3 }}>
                          {entry.ts.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}Z LOCAL TRACK
                        </div>
                      </div>
                      <button onClick={() => replayEntry(entry)} style={{
                        fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"3px 8px", borderRadius:3, cursor:"pointer",
                        background:"transparent", color:isReplaying?A.amber:T.textDim, border:`1px solid ${isReplaying?A.amber:T.border}`, flexShrink:0
                      }}>
                        {isReplaying?"▶▶ AUDIO":"▶ AUD"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── NWKRAFT SCRATCHPAD FORM TAB ── */}
          {activeTab === "nwkraft" && (
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
          )}

        </div>
      </div>

      {/* ═══ SECTION F — REPLAY CONTROLLER FOOTER ══════════════════════════ */}
      <div style={{ flexShrink:0, borderTop:`1px solid ${T.border}` }}>
        <button
          onClick={() => onReplay(10)}
          style={{
            width:"100%", padding:"12px 14px", cursor:"pointer", border:"none", outline:"none",
            background: replayActive ? T.replayBgHot : T.replayBg,
            display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"background 0.15s",
          }}
        >
          <svg width={14} height={14} viewBox="0 0 20 20" fill="none">
            <polygon points="16,10 6,4 6,16" fill={replayActive?A.amber:A.blue} opacity="0.92"/>
            <line x1="4" y1="4" x2="4" y2="16" stroke={replayActive?A.amber:A.blue} strokeWidth="2.5" strokeLinecap="round" opacity="0.92"/>
          </svg>
          <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:12, fontWeight:700, letterSpacing:3, color: replayActive ? A.amber : A.blue, textTransform:"uppercase" }}>
            {replayActive ? "▶ DISPATCHING LIVE AUDIO FLUSH FEED…" : "⏮ REPLAY COCKPIT AUDIO STREAM (LAST 10s)"}
          </span>
        </button>
      </div>

    </div>
  );
}

export default CommPage;
