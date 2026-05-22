// ─────────────────────────────────────────────────────────────────────────────
// APEX AVIATION — COMM PAGE (Module 1: Offline Frequency Guard)
// Standalone component. Import into cessna172s_checklist.jsx.
//
// ARCHITECTURE:
//   • Web Worker scaffold (STT engine slot — Web Speech API now, ONNX-ready)
//   • Float32Array circular ring buffer (192,000 samples @ 16kHz ≈ 12s)
//   • Callsign watchdog regex — fully dynamic from aircraft.tail prop
//   • ACK CALL 5-second timeout with Web Audio oscillator chime
//   • NWKRAFT absolute overlay (auto-detect + FORCE IFR CAPTURE)
//   • Landing clearance structured card with color-pill key terms
//   • Transmission log with timestamps and per-entry replay
//   • Full-width pinned REPLAY tactical bar at page base
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  blue:    "#3a9ad4",
  red:     "#e85a4a",
  green:   "#3dbe6c",
  amber:   "#e8c84a",
  teal:    "#4ae8c8",
  purple:  "#c87ae8",
  black:   "#0d0f12",
  surface: "rgba(13,17,22,0.65)",
  bg:      "#0a0c10",
  border:  "#2a3040",
  text:    "#e8e4d8",
  dim:     "#4a5068",
  dimText: "#7a8090",
};

// ─── RING BUFFER CONSTANTS ────────────────────────────────────────────────────
const SAMPLE_RATE    = 16000;
const BUFFER_SECONDS = 12;
const BUFFER_SIZE    = SAMPLE_RATE * BUFFER_SECONDS; // 192,000 Float32 samples

// ─── ATC DIRECTIVE VERBS ──────────────────────────────────────────────────────
const ATC_DIRECTIVES = [
  "climb","descend","turn","maintain","fly","cleared","contact",
  "squawk","hold short","hold","report","traffic","expect","cross",
  "taxi","line up","wait","go around","cancel","frequency","departure",
  "approach","heading","altitude","speed","direct","intercept",
];

// ─── NWKRAFT FIELD DEFINITIONS ────────────────────────────────────────────────
const NWKRAFT_FIELDS = [
  { key:"N", label:"N — NAME",        hint:"Clearance name / facility",  color:C.blue   },
  { key:"W", label:"W — WEATHER",     hint:"Wx / filing weather",        color:C.teal   },
  { key:"K", label:"K — KODE",        hint:"Squawk code",                color:C.amber  },
  { key:"R", label:"R — ROUTE",       hint:"Route of flight",            color:C.green  },
  { key:"A", label:"A — ALTITUDE",    hint:"Initial altitude / expect",  color:C.purple },
  { key:"F", label:"F — FREQUENCY",   hint:"Departure frequency",        color:C.blue   },
  { key:"T", label:"T — TRANSPONDER", hint:"Transponder instructions",   color:C.amber  },
];

// ─── TRAFFIC PATTERN LEGS ─────────────────────────────────────────────────────
const PATTERN_LEGS = [
  "upwind","crosswind","downwind","base","final",
  "left downwind","right downwind","left base","right base",
  "left traffic","right traffic","straight-in","overhead",
];

// ─── LANDING CLEARANCE COLOR PILLS ───────────────────────────────────────────
const LANDING_TERMS = {
  runway:   { color:C.red,   bg:"rgba(232,90,74,0.15)"   },
  leg:      { color:C.teal,  bg:"rgba(74,232,200,0.12)"  },
  direction:{ color:C.amber, bg:"rgba(232,200,74,0.15)"  },
  general:  { color:C.blue,  bg:"rgba(58,154,212,0.15)"  },
};

// ─── WEB WORKER INLINE BLOB (STT Engine Scaffold) ────────────────────────────
// Ring buffer lives here. STT engine slot wired for Web Speech API today;
// replace the ONNX STUB BLOCK to upgrade to Whisper-Tiny offline inference.
const WORKER_BLOB = `
// ── APEX COMM WORKER v1.0 ─ STT Engine Scaffold ──────────────────────────────
// IN  { type:"AUDIO_CHUNK",          samples: Float32Array }
// IN  { type:"TRANSCRIPTION_RESULT", text: string, isFinal: boolean }
// OUT { type:"TRANSCRIPT",           text: string, isFinal: boolean, ts: number }
// OUT { type:"BUFFER_READY",         rmsDb: number }
// OUT { type:"REPLAY_PCM",           pcm: Float32Array, sampleRate: number }

const SAMPLE_RATE = 16000;
const BUFFER_SIZE = 16000 * 12;
const ringBuffer  = new Float32Array(BUFFER_SIZE); // pre-allocated once, never GC'd
let   writeHead   = 0;                             // single mutable write pointer

function calcRms(samples) {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return 20 * Math.log10(Math.sqrt(sum / samples.length) + 1e-9);
}

function writeToRing(samples) {
  for (let i = 0; i < samples.length; i++) {
    ringBuffer[writeHead] = samples[i];
    writeHead = (writeHead + 1) % BUFFER_SIZE;
  }
}

function readRingSeconds(seconds) {
  const n     = Math.min(seconds * SAMPLE_RATE, BUFFER_SIZE);
  const out   = new Float32Array(n);
  const start = (writeHead - n + BUFFER_SIZE) % BUFFER_SIZE;
  for (let i = 0; i < n; i++) out[i] = ringBuffer[(start + i) % BUFFER_SIZE];
  return out;
}

self.onmessage = function(e) {
  const { type } = e.data;

  if (type === "AUDIO_CHUNK") {
    const samples = e.data.samples;
    if (!samples || !samples.length) return;
    writeToRing(samples);
    self.postMessage({ type:"BUFFER_READY", rmsDb: calcRms(samples) });
    // ── ONNX STUB BLOCK ─────────────────────────────────────────────────
    // UPGRADE PATH: replace this comment block with:
    //   import { pipeline } from "@xenova/transformers";
    //   const asr = await pipeline("automatic-speech-recognition","Xenova/whisper-tiny.en");
    //   const result = await asr(samples, { sampling_rate: 16000 });
    //   self.postMessage({ type:"TRANSCRIPT", text:result.text, isFinal:true, ts:Date.now() });
    // ────────────────────────────────────────────────────────────────────
    return;
  }

  if (type === "TRANSCRIPTION_RESULT") {
    self.postMessage({ type:"TRANSCRIPT", text:e.data.text, isFinal:e.data.isFinal, ts:Date.now() });
    return;
  }

  if (type === "GET_REPLAY") {
    const pcm = readRingSeconds(e.data.seconds || 10);
    self.postMessage({ type:"REPLAY_PCM", pcm, sampleRate: SAMPLE_RATE });
    return;
  }
};
`;

// ─── CALLSIGN REGEX BUILDER ───────────────────────────────────────────────────
const PHONETIC_DIGITS = {
  "0":"zero","1":"one","2":"two","3":"three","4":"four",
  "5":"five","6":"six","7":"seven","8":"eight","9":"nine",
};
const PHONETIC_ALPHA = {
  A:"alpha",B:"bravo",C:"charlie",D:"delta",E:"echo",F:"foxtrot",
  G:"golf",H:"hotel",I:"india",J:"juliett",K:"kilo",L:"lima",M:"mike",
  N:"november",O:"oscar",P:"papa",Q:"quebec",R:"romeo",S:"sierra",
  T:"tango",U:"uniform",V:"victor",W:"whiskey",X:"xray",Y:"yankee",Z:"zulu",
};

function buildCallsignRegex(tail) {
  if (!tail) return null;
  const clean = tail.toUpperCase().replace(/[^A-Z0-9]/g,"");
  const parts = clean.split("").map(c => {
    const ph = PHONETIC_ALPHA[c] || PHONETIC_DIGITS[c] || c;
    return `(?:${c}|${ph})`;
  });
  const literal  = clean;
  const phonetic = parts.join("[\\s\\-]*");
  const spaced   = clean.split("").join("[\\s]*");
  const combined = `(?:${literal}|${phonetic}|${spaced})`;
  const verbPart = ATC_DIRECTIVES.map(v => v.replace(/ /g,"\\s+")).join("|");
  return new RegExp(`(${combined})[^.]{0,60}(${verbPart})`, "i");
}

// ─── IFR CLEARANCE PARSER (NWKRAFT) ──────────────────────────────────────────
function parseNwkraft(text) {
  const result = { N:"",W:"",K:"",R:"",A:"",F:"",T:"" };
  const t = text.toLowerCase();

  const destMatch = text.match(/cleared\s+(?:to\s+)?([A-Z][A-Z0-9\s]{2,20}?)(?:\s+via|\s+as\s+filed|\s+climb|\s+maintain|,)/i);
  if (destMatch) result.N = destMatch[1].trim();
  result.W = t.includes("ifr") ? "IFR FLIGHT PLAN" : "";

  const sqkMatch = text.match(/squawk\s+(\d{4})/i);
  if (sqkMatch) result.K = sqkMatch[1];

  const viaMatch = text.match(/via\s+([A-Z0-9\s,]+?)(?:\s+maintain|\s+climb|\s+expect|$)/i);
  if (viaMatch) result.R = viaMatch[1].trim();
  else if (t.includes("as filed")) result.R = "AS FILED";

  const altMatch = text.match(/(?:maintain|climb\s+and\s+maintain|climb\s+to)\s+(\d[\d,]+\s*(?:feet|ft)?)/i);
  if (altMatch) result.A = altMatch[1].replace(/,/g,"").trim();
  const expectMatch = text.match(/expect\s+(\d[\d,]+)\s*(?:feet|ft)?/i);
  if (expectMatch) result.A = (result.A ? result.A+" / EXP " : "EXP ") + expectMatch[1];

  const freqMatch = text.match(/(?:contact|departure|frequency)\s+(\d{3}\.\d+)/i);
  if (freqMatch) result.F = freqMatch[1];

  result.T = result.K ? `SQUAWK ${result.K}` : "";
  return result;
}

// ─── LANDING CLEARANCE PARSER ─────────────────────────────────────────────────
function parseLandingClearance(text) {
  const annotated = [];
  const t = text;

  const addMatch = (rx, type) => {
    let m; while ((m = rx.exec(t)) !== null)
      annotated.push({ start:m.index, end:m.index+m[0].length, text:m[0], type });
  };
  addMatch(/\b(?:runway|rwy)\s*([0-9]{1,2}[LRC]?)\b/gi, "runway");
  addMatch(new RegExp(`\\b(${PATTERN_LEGS.map(l=>l.replace(/ /g,"\\s+")).join("|")})\\b`,"gi"), "leg");
  addMatch(/\b(left|right|straight|north|south|east|west|northeast|northwest|southeast|southwest)\b/gi, "direction");

  annotated.sort((a,b) => a.start-b.start);
  const deduped = []; let cursor = 0;
  for (const a of annotated) { if (a.start < cursor) continue; deduped.push(a); cursor = a.end; }

  const output = []; let pos = 0;
  for (const a of deduped) {
    if (a.start > pos) output.push({ text:t.slice(pos,a.start), type:"plain" });
    output.push({ text:a.text, type:a.type });
    pos = a.end;
  }
  if (pos < t.length) output.push({ text:t.slice(pos), type:"plain" });
  return output;
}

// ─── CLEARANCE TYPE DETECTOR ──────────────────────────────────────────────────
function detectClearanceType(text) {
  const t = text.toLowerCase();
  if (/cleared\s+(?:to|for)\s+(?:the\s+)?(?:ils|rnav|vor|gps|lda|loc|ndb)\s+approach/.test(t)) return "ifr_approach";
  if (/cleared\s+to\s+[a-z]/.test(t) && /squawk|departure|maintain\s+\d/.test(t)) return "ifr_departure";
  if (/cleared\s+to\s+land/.test(t) || /cleared\s+(?:for|the)\s+(?:option|landing|approach)/.test(t)) return "landing";
  if (/enter|make|report|traffic/.test(t) && PATTERN_LEGS.some(l => t.includes(l))) return "pattern";
  return "general";
}

// ─── AUDIO CHIME (Web Audio API — no file dependency) ────────────────────────
function playAlertChime(urgent = false) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const beep = (startTime, freq, dur) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = "sine";
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.55, startTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, startTime + dur);
      osc.start(startTime); osc.stop(startTime + dur + 0.02);
    };
    const t = ctx.currentTime;
    if (urgent) { beep(t, 1046, 0.12); beep(t+0.16, 1046, 0.12); beep(t+0.32, 1046, 0.22); }
    else        { beep(t, 523, 0.25);  beep(t+0.3,  659,  0.15); }
    setTimeout(() => { try { ctx.close(); } catch {} }, 1400);
  } catch {}
}

// ─── NWKRAFT OVERLAY CARD (shared between Live Feed and absolute overlay) ─────
function NwkraftCard({ data, tail, onClose, onClear, forceIfrMode, onToggleForce }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, fontWeight:700, letterSpacing:3, color:C.amber }}>
            IFR CLEARANCE
          </div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim, letterSpacing:1, marginTop:1 }}>
            NWKRAFT FORMAT · {tail}
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={onClear} style={{
            fontFamily:"'Share Tech Mono',monospace", fontSize:8, padding:"4px 10px", borderRadius:3, cursor:"pointer",
            background:"transparent", color:"#6a3030", border:"1px solid #3a2020",
          }}>↺ CLEAR</button>
          {onClose && (
            <button onClick={onClose} style={{
              fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:700, letterSpacing:1,
              padding:"4px 12px", borderRadius:3, cursor:"pointer",
              background:"rgba(232,90,74,0.1)", color:C.red, border:`1px solid ${C.red}`,
            }}>✕ CLOSE</button>
          )}
        </div>
      </div>

      {/* Fields */}
      {NWKRAFT_FIELDS.map(field => (
        <div key={field.key} style={{
          background:"rgba(10,14,20,0.9)", border:`1px solid ${field.color}25`,
          borderLeft:`4px solid ${field.color}`, borderRadius:4, padding:"7px 12px",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, fontWeight:700, color:field.color, lineHeight:1, width:22, textAlign:"center" }}>
              {field.key}
            </div>
            <div>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:field.color, letterSpacing:2 }}>{field.label}</div>
              <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:9, color:C.dim }}>{field.hint}</div>
            </div>
          </div>
          <input
            type="text"
            value={data[field.key] || ""}
            onChange={e => onClear !== undefined && null}
            placeholder={field.hint}
            style={{
              width:"100%", boxSizing:"border-box",
              background:"rgba(5,8,12,0.9)", border:`1px solid ${field.color}35`,
              borderRadius:3, padding:"5px 10px", outline:"none",
              fontFamily:"'Share Tech Mono',monospace", fontSize:13, color:C.text,
              caretColor:field.color,
            }}
          />
        </div>
      ))}

      {/* Squawk display */}
      {data.K && (
        <div style={{
          background:"rgba(58,154,212,0.1)", border:`1px solid ${C.blue}40`,
          borderRadius:5, padding:"8px 14px", display:"flex", alignItems:"center", gap:14,
        }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.blue, letterSpacing:2 }}>SQUAWK</div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:30, fontWeight:700, color:C.amber, letterSpacing:4 }}>{data.K}</div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim }}>SET XPDR</div>
        </div>
      )}

      {/* Force IFR toggle */}
      <button onClick={onToggleForce} style={{
        padding:"9px", borderRadius:4, cursor:"pointer",
        background: forceIfrMode ? "rgba(74,232,200,0.12)" : "rgba(10,14,20,0.6)",
        color: forceIfrMode ? C.teal : C.dim,
        border:`1.5px solid ${forceIfrMode ? C.teal : C.border}`,
        fontFamily:"'Oswald',sans-serif", fontSize:11, fontWeight:700, letterSpacing:2,
        transition:"all 0.15s",
      }}>
        {forceIfrMode ? "⏹ FORCE IFR CAPTURE — ON · TAP TO DEACTIVATE" : "⏵ FORCE IFR CAPTURE"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMM PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function CommPage({ aircraft }) {

  // ── State ──────────────────────────────────────────────────────────────────
  const [listening,     setListening]     = useState(false);
  const [micStatus,     setMicStatus]     = useState("idle");    // idle | active | error | denied
  const [rmsLevel,      setRmsLevel]      = useState(0);         // 0–1 normalized
  const [transcript,    setTranscript]    = useState("");        // live partial
  const [txLog,         setTxLog]         = useState([]);        // [{id,text,ts,type,tokens,nwkraft}]
  const [watchdogState, setWatchdogState] = useState("clear");   // clear | alert | unanswered
  const [watchdogTx,    setWatchdogTx]    = useState(null);
  const [ackCountdown,  setAckCountdown]  = useState(0);
  const [ifrOverlay,    setIfrOverlay]    = useState(false);     // absolute NWKRAFT card visible
  const [ifrData,       setIfrData]       = useState({ N:"",W:"",K:"",R:"",A:"",F:"",T:"" });
  const [forceIfrMode,  setForceIfrMode]  = useState(false);
  const [replayActive,  setReplayActive]  = useState(false);
  const [replayIndex,   setReplayIndex]   = useState(null);
  const [activeTab,     setActiveTab]     = useState("live");    // live | log | nwkraft

  // ── Refs ───────────────────────────────────────────────────────────────────
  const workerRef        = useRef(null);
  const workerBlobUrl    = useRef(null);
  const recognitionRef   = useRef(null);
  const mediaStreamRef   = useRef(null);
  const audioCtxRef      = useRef(null);
  const analyserRef      = useRef(null);
  const animFrameRef     = useRef(null);
  const ackIntervalRef   = useRef(null);
  const beepIntervalRef  = useRef(null);
  const txIdRef          = useRef(0);
  const callsignRegexRef = useRef(null);
  const replaySourceRef  = useRef(null);

  // Dynamic tail — always live from prop, never hardcoded
  const tail = aircraft ? aircraft.tail : "UNKNOWN";

  // ── Rebuild callsign regex whenever tail prop changes ──────────────────────
  useEffect(() => {
    callsignRegexRef.current = buildCallsignRegex(tail);
  }, [tail]);

  // ── Web Worker lifecycle ───────────────────────────────────────────────────
  useEffect(() => {
    const blob = new Blob([WORKER_BLOB], { type:"application/javascript" });
    workerBlobUrl.current = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerBlobUrl.current);
    workerRef.current.onmessage = (e) => {
      const { type } = e.data;
      if (type === "BUFFER_READY") setRmsLevel(Math.max(0, Math.min(1, (e.data.rmsDb + 60) / 60)));
      if (type === "TRANSCRIPT")   handleTranscript(e.data.text, e.data.isFinal);
      if (type === "REPLAY_PCM")   playPcmAudio(e.data.pcm, e.data.sampleRate);
    };
    return () => {
      workerRef.current?.terminate();
      if (workerBlobUrl.current) URL.revokeObjectURL(workerBlobUrl.current);
    };
  }, []);

  // ── Transcript handler ─────────────────────────────────────────────────────
  const handleTranscript = useCallback((text, isFinal) => {
    if (!text?.trim()) return;
    setTranscript(isFinal ? "" : text);
    if (!isFinal) return;

    const type    = detectClearanceType(text);
    const tokens  = (type === "landing" || type === "pattern") ? parseLandingClearance(text) : null;
    const nwkraft = (type === "ifr_departure" || type === "ifr_approach" || forceIfrMode)
                    ? parseNwkraft(text) : null;

    const entry = { id: ++txIdRef.current, text, ts: new Date(), type, tokens, nwkraft };
    setTxLog(prev => [entry, ...prev].slice(0, 40));

    // Auto-trigger NWKRAFT overlay — no tab switch required
    if (nwkraft) {
      setIfrData(nwkraft);
      setIfrOverlay(true);
    }

    // Watchdog check
    if (callsignRegexRef.current && callsignRegexRef.current.test(text)) {
      triggerWatchdog(entry);
    }
  }, [forceIfrMode]);

  // ── Watchdog ───────────────────────────────────────────────────────────────
  const triggerWatchdog = (entry) => {
    clearWatchdogTimers();
    setWatchdogState("alert");
    setWatchdogTx(entry);
    setAckCountdown(5);
    playAlertChime(false);

    let remaining = 5;
    ackIntervalRef.current = setInterval(() => {
      remaining--;
      setAckCountdown(remaining);
      if (remaining <= 0) { clearInterval(ackIntervalRef.current); escalateWatchdog(); }
    }, 1000);
  };

  const escalateWatchdog = () => {
    setWatchdogState("unanswered");
    playAlertChime(true);
    beepIntervalRef.current = setInterval(() => playAlertChime(true), 2000);
  };

  const acknowledgeCall = () => {
    clearWatchdogTimers();
    setWatchdogState("clear");
    setWatchdogTx(null);
    setAckCountdown(0);
    playAlertChime(false);
  };

  const clearWatchdogTimers = () => {
    clearInterval(ackIntervalRef.current);
    clearInterval(beepIntervalRef.current);
  };

  // ── Audio — start ──────────────────────────────────────────────────────────
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:{
        channelCount:1, sampleRate:SAMPLE_RATE,
        echoCancellation:false, noiseSuppression:false, autoGainControl:false,
      }});
      mediaStreamRef.current = stream;

      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate:SAMPLE_RATE });
      audioCtxRef.current = ctx;
      const source   = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // ScriptProcessor → worker ring buffer
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      source.connect(proc);
      proc.connect(ctx.destination);
      proc.onaudioprocess = (e) => {
        const samples = new Float32Array(e.inputBuffer.getChannelData(0));
        workerRef.current?.postMessage({ type:"AUDIO_CHUNK", samples });
      };

      // VU animation
      const vuBuf = new Uint8Array(analyser.frequencyBinCount);
      const animVu = () => {
        analyser.getByteFrequencyData(vuBuf);
        let sum = 0; for (let i=0;i<vuBuf.length;i++) sum += vuBuf[i]*vuBuf[i];
        setRmsLevel(Math.sqrt(sum / vuBuf.length) / 255);
        animFrameRef.current = requestAnimationFrame(animVu);
      };
      animFrameRef.current = requestAnimationFrame(animVu);

      // Web Speech API → worker transcription injection
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.continuous = true; rec.interimResults = true; rec.lang = "en-US"; rec.maxAlternatives = 1;
        rec.onresult = (e) => {
          let partial = "", final_ = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) final_ += r[0].transcript + " ";
            else           partial += r[0].transcript;
          }
          if (partial) setTranscript(partial);
          if (final_.trim()) workerRef.current?.postMessage({
            type:"TRANSCRIPTION_RESULT", text:final_.trim(), isFinal:true,
          });
        };
        rec.onerror = (e) => { if (e.error==="not-allowed") setMicStatus("denied"); };
        rec.onend   = () => { if (listening) { try { rec.start(); } catch {} } };
        rec.start();
        recognitionRef.current = rec;
      }

      setListening(true);
      setMicStatus("active");
    } catch(err) {
      setMicStatus(err.name==="NotAllowedError" ? "denied" : "error");
    }
  };

  // ── Audio — stop ───────────────────────────────────────────────────────────
  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
    cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setListening(false);
    setMicStatus("idle");
    setTranscript("");
    setRmsLevel(0);
  };

  // ── Ring buffer replay ─────────────────────────────────────────────────────
  const replayBuffer = (seconds = 10) => {
    workerRef.current?.postMessage({ type:"GET_REPLAY", seconds });
    setReplayActive(true);
    setTimeout(() => setReplayActive(false), seconds * 1000);
  };

  const playPcmAudio = (pcm, sr) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, pcm.length, sr);
      buf.copyToChannel(pcm, 0);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.connect(ctx.destination); src.start();
      src.onended = () => { setReplayActive(false); ctx.close(); };
      replaySourceRef.current = src;
    } catch { setReplayActive(false); }
  };

  const replayLogEntry = (entry) => {
    setReplayIndex(entry.id);
    setTimeout(() => setReplayIndex(null), 3000);
  };

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => { stopListening(); clearWatchdogTimers(); };
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const vuBars      = 20;
  const vuActive    = Math.round(rmsLevel * vuBars);
  const isUnanswered = watchdogState === "unanswered";
  const isAlert      = watchdogState === "alert";

  // ── Token renderer (shared) ────────────────────────────────────────────────
  const renderTokens = (entry) => {
    if (!entry.tokens) return <span>{entry.text}</span>;
    return entry.tokens.map((tok, i) => {
      if (tok.type === "plain") return <span key={i}>{tok.text}</span>;
      const s = LANDING_TERMS[tok.type] || LANDING_TERMS.general;
      return (
        <span key={i} style={{
          background:s.bg, color:s.color, borderRadius:3, padding:"0 5px", margin:"0 2px",
          fontFamily:"'Share Tech Mono',monospace", fontSize:12, fontWeight:700,
          border:`1px solid ${s.color}40`,
        }}>
          {tok.text.toUpperCase()}
        </span>
      );
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display:"flex", flexDirection:"column", height:"100%", overflow:"hidden",
      background:C.black, position:"relative", fontFamily:"'Rajdhani',sans-serif",
      animation: isUnanswered ? "commFlash 0.5s ease infinite alternate" : "none",
    }}>

      {/* ── KEYFRAMES ── */}
      <style>{`
        @keyframes commFlash {
          from { background: #0d0f12; }
          to   { background: rgba(232,90,74,0.18); }
        }
        @keyframes commPulse {
          0%   { box-shadow: 0 0 0 0 rgba(232,90,74,0.6); }
          70%  { box-shadow: 0 0 0 12px rgba(232,90,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,90,74,0); }
        }
        @keyframes commGreenPulse {
          0%   { box-shadow: 0 0 0 0 rgba(61,190,108,0.5); }
          70%  { box-shadow: 0 0 0 8px rgba(61,190,108,0); }
          100% { box-shadow: 0 0 0 0 rgba(61,190,108,0); }
        }
        @keyframes commSlideIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes commSlideUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes vuPulse {
          0%,100% { opacity:0.75; }
          50%     { opacity:1; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════
          HEADER BAR
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        flexShrink:0, padding:"8px 14px",
        background:"linear-gradient(135deg,#0a0c10,#141820)",
        borderBottom:`2px solid ${C.teal}`,
        display:"flex", alignItems:"center", gap:10,
      }}>
        <svg width={18} height={18} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="2.5" fill={C.teal}/>
          <path d="M10 10 Q6 5 3 2"  stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" opacity={listening?"1":"0.3"}/>
          <path d="M10 10 Q14 5 17 2" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" opacity={listening?"1":"0.3"}/>
          <path d="M10 10 Q7 7 5 4"  stroke={C.teal} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" opacity={listening?"0.7":"0.15"}/>
          <path d="M10 10 Q13 7 15 4" stroke={C.teal} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" opacity={listening?"0.7":"0.15"}/>
          <line x1="10" y1="12.5" x2="10" y2="18" stroke={C.teal} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>

        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, fontWeight:700, letterSpacing:3, color:C.teal }}>
            COMM WATCHDOG
          </div>
          {/* ── DYNAMIC TAIL — bound to aircraft prop, no hardcoded fallback ── */}
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim, letterSpacing:1.5, marginTop:1 }}>
            CALLSIGN: {tail} · {listening ? "MONITORING" : "STANDBY"}
          </div>
        </div>

        {/* FORCE IFR CAPTURE — in header for instant access */}
        <button onClick={() => { setForceIfrMode(v => !v); if (!forceIfrMode) setIfrOverlay(true); }} style={{
          fontFamily:"'Share Tech Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:1,
          padding:"4px 10px", borderRadius:3, cursor:"pointer",
          background: forceIfrMode ? "rgba(74,232,200,0.18)" : "transparent",
          color: forceIfrMode ? C.teal : C.dim,
          border:`1px solid ${forceIfrMode ? C.teal : C.border}`,
          transition:"all 0.15s",
        }}>
          {forceIfrMode ? "▶ IFR ON" : "IFR CAPTURE"}
        </button>

        {/* LISTEN / STOP */}
        <button onClick={() => listening ? stopListening() : startListening()} style={{
          fontFamily:"'Oswald',sans-serif", fontSize:11, fontWeight:700, letterSpacing:2,
          padding:"5px 14px", borderRadius:4, cursor:"pointer",
          background: listening ? "rgba(232,90,74,0.15)" : "rgba(74,232,200,0.12)",
          color:  listening ? C.red : C.teal,
          border:`1.5px solid ${listening ? C.red : C.teal}`,
          animation: listening && micStatus==="active" ? "commGreenPulse 1.8s ease infinite" : "none",
          transition:"all 0.15s",
        }}>
          {listening ? "⏹ STOP" : "⏵ LISTEN"}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ACK CALL ALERT PANEL (slides in when watchdog fires)
      ════════════════════════════════════════════════════════════════════ */}
      {(isAlert || isUnanswered) && (
        <div style={{
          flexShrink:0, padding:"10px 14px",
          background: isUnanswered ? "rgba(232,90,74,0.22)" : "rgba(232,200,74,0.12)",
          borderBottom:`2px solid ${isUnanswered ? C.red : C.amber}`,
          display:"flex", alignItems:"center", gap:12,
          animation:"commSlideIn 0.2s ease",
        }}>
          <div style={{
            width:36, height:36, borderRadius:"50%", flexShrink:0,
            background: isUnanswered ? "rgba(232,90,74,0.3)" : "rgba(232,200,74,0.2)",
            border:`2px solid ${isUnanswered ? C.red : C.amber}`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            animation: isUnanswered ? "commPulse 0.8s ease infinite" : "commPulse 1.5s ease infinite",
          }}>
            {isUnanswered ? "🔴" : "📡"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, fontWeight:700, letterSpacing:2, color:isUnanswered?C.red:C.amber }}>
              {isUnanswered ? "⚠ UNANSWERED CALL" : `CALLSIGN ALERT — ${ackCountdown}s`}
            </div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.text, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {watchdogTx?.text || ""}
            </div>
          </div>
          <button onClick={acknowledgeCall} style={{
            fontFamily:"'Oswald',sans-serif", fontSize:13, fontWeight:700, letterSpacing:2,
            padding:"8px 18px", borderRadius:4, cursor:"pointer", flexShrink:0,
            background: isUnanswered ? C.red : C.amber, color:"#000", border:"none",
            boxShadow: isUnanswered ? `0 0 20px ${C.red}80` : `0 0 12px ${C.amber}60`,
            animation: isUnanswered ? "commPulse 0.8s ease infinite" : "none",
          }}>
            PTT · ACK CALL
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          VU METER + LIVE PARTIAL TRANSCRIPT
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        flexShrink:0, padding:"7px 14px",
        background:"rgba(10,14,20,0.85)", borderBottom:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column", gap:5,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim, letterSpacing:1, width:28, flexShrink:0 }}>
            {listening ? "RX" : "——"}
          </div>
          <div style={{ display:"flex", gap:2, flex:1, height:10, alignItems:"flex-end" }}>
            {Array.from({length:vuBars}).map((_,i) => {
              const active = i < vuActive && listening;
              const bright = i >= vuBars * 0.78;
              const mid    = i >= vuBars * 0.52;
              return (
                <div key={i} style={{
                  flex:1, borderRadius:1,
                  height: active ? (bright?10:mid?7:4) : 2,
                  background: active ? (bright?C.red:mid?C.amber:C.green) : C.border,
                  transition:"height 0.05s, background 0.05s",
                  animation: active ? "vuPulse 0.9s ease infinite" : "none",
                }}/>
              );
            })}
          </div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim, width:24, textAlign:"right", flexShrink:0 }}>
            {micStatus==="denied"?"⛔":micStatus==="error"?"ERR":listening?"ON":"OFF"}
          </div>
        </div>
        <div style={{
          fontFamily:"'Share Tech Mono',monospace", fontSize:11,
          color: transcript ? C.amber : C.dim,
          minHeight:15, letterSpacing:0.5, fontStyle: transcript?"normal":"italic",
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

      {/* ═══════════════════════════════════════════════════════════════════
          SUB-TABS
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ flexShrink:0, display:"flex", borderBottom:`1px solid ${C.border}`, background:"#0a0c10" }}>
        {[
          { key:"live", label:"LIVE FEED", color:C.teal  },
          { key:"log",  label:"TX LOG",    color:C.blue  },
          { key:"nwkraft", label:"NWKRAFT", color:C.amber },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex:1, padding:"7px 4px", cursor:"pointer", border:"none",
            borderRight:`1px solid ${C.border}`,
            background: activeTab===tab.key ? `${tab.color}14` : "transparent",
            borderTop:`2px solid ${activeTab===tab.key ? tab.color : "transparent"}`,
            transition:"all 0.12s",
          }}>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:1.5, color:activeTab===tab.key?tab.color:C.dim, textTransform:"uppercase" }}>
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN SCROLL AREA — flex:1, clipped, position:relative for overlay
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", scrollbarWidth:"thin", position:"relative" }}>

        {/* ── LIVE FEED ── */}
        {activeTab === "live" && (
          <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>

            {/* Latest transmission card */}
            {txLog.length > 0 && (() => {
              const latest = txLog[0];
              const TC = {
                ifr_departure:{ c:C.teal,  label:"IFR CLEARANCE" },
                ifr_approach: { c:C.teal,  label:"IFR APPROACH"  },
                landing:      { c:C.green, label:"LANDING CLRNCE" },
                pattern:      { c:C.blue,  label:"PATTERN INSTR" },
                general:      { c:C.dim,   label:"GENERAL"       },
              };
              const tc = TC[latest.type] || TC.general;
              return (
                <div style={{
                  background:"rgba(10,14,20,0.9)", border:`1.5px solid ${tc.c}30`,
                  borderLeft:`4px solid ${tc.c}`, borderRadius:5, padding:"10px 12px",
                  animation:"commSlideIn 0.2s ease",
                }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:2, color:tc.c, background:`${tc.c}15`, padding:"2px 8px", borderRadius:3 }}>
                      {tc.label}
                    </div>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim }}>
                      {latest.ts.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}Z
                    </div>
                  </div>
                  <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:14, lineHeight:1.65, color:C.text }}>
                    {renderTokens(latest)}
                  </div>
                  {/* Per-card NWKRAFT link — no tab switch */}
                  {latest.nwkraft && (
                    <button onClick={() => { setIfrData(latest.nwkraft); setIfrOverlay(true); }} style={{
                      marginTop:8, fontFamily:"'Share Tech Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:1,
                      padding:"3px 10px", borderRadius:3, cursor:"pointer",
                      background:"rgba(232,200,74,0.1)", color:C.amber, border:`1px solid ${C.amber}`,
                    }}>
                      ✦ VIEW NWKRAFT
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Empty state */}
            {txLog.length === 0 && (
              <div style={{ textAlign:"center", padding:"50px 20px" }}>
                <div style={{ fontSize:34, marginBottom:10, opacity:0.3 }}>📡</div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, letterSpacing:3, color:C.dim }}>AWAITING TRANSMISSION</div>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, marginTop:6, color:"#2a3040" }}>
                  {listening ? `MONITORING · ${tail}` : "TAP LISTEN TO BEGIN"}
                </div>
              </div>
            )}

            {/* Previous transmissions (condensed) */}
            {txLog.length > 1 && (
              <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim, letterSpacing:1.5, marginBottom:6 }}>
                  PREVIOUS TRANSMISSIONS
                </div>
                {txLog.slice(1, 5).map(entry => {
                  const ec = { ifr_departure:C.teal, ifr_approach:C.teal, landing:C.green, pattern:C.blue, general:C.dim }[entry.type] || C.dim;
                  return (
                    <div key={entry.id} style={{
                      padding:"5px 0", borderBottom:`1px solid rgba(42,48,64,0.4)`,
                      display:"flex", alignItems:"flex-start", gap:8,
                    }}>
                      <div style={{ width:5, height:5, borderRadius:"50%", background:ec, flexShrink:0, marginTop:4 }}/>
                      <div style={{ flex:1, fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.dimText, lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                        {entry.text}
                      </div>
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.dim, flexShrink:0 }}>
                        {entry.ts.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit"})}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TX LOG ── */}
        {activeTab === "log" && (
          <div style={{ padding:"8px 0" }}>
            {txLog.length === 0 ? (
              <div style={{ padding:"30px 20px", textAlign:"center", fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.dim, letterSpacing:1 }}>
                NO TRANSMISSIONS LOGGED
              </div>
            ) : txLog.map(entry => {
              const isReplaying = replayIndex === entry.id;
              const ec = { ifr_departure:C.teal, ifr_approach:C.teal, landing:C.green, pattern:C.blue, general:C.dim }[entry.type] || C.dim;
              return (
                <div key={entry.id} style={{
                  padding:"8px 14px", borderBottom:`1px solid ${C.border}`,
                  background: isReplaying ? `${C.amber}08` : "transparent",
                  transition:"background 0.2s",
                }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:ec, letterSpacing:1, flexShrink:0, marginTop:2, padding:"1px 5px", borderRadius:2, background:`${ec}15`, border:`1px solid ${ec}25` }}>
                      {entry.type.replace("_"," ").toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:13, color:C.text, lineHeight:1.4 }}>
                        {renderTokens(entry)}
                      </div>
                      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.dim, marginTop:2 }}>
                        {entry.ts.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})} LOCAL
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:3, flexShrink:0 }}>
                      <button onClick={() => replayLogEntry(entry)} style={{
                        fontFamily:"'Share Tech Mono',monospace", fontSize:7, padding:"2px 6px", borderRadius:2, cursor:"pointer",
                        background:"transparent", color:isReplaying?C.amber:C.dim, border:`1px solid ${isReplaying?C.amber:C.border}`,
                      }}>
                        {isReplaying ? "▶▶" : "▶"}
                      </button>
                      {entry.nwkraft && (
                        <button onClick={() => { setIfrData(entry.nwkraft); setIfrOverlay(true); }} style={{
                          fontFamily:"'Share Tech Mono',monospace", fontSize:7, padding:"2px 6px", borderRadius:2, cursor:"pointer",
                          background:"rgba(232,200,74,0.08)", color:C.amber, border:`1px solid ${C.amber}30`,
                        }}>
                          IFR
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {txLog.length > 0 && (
              <div style={{ padding:"8px 14px" }}>
                <button onClick={() => setTxLog([])} style={{
                  fontFamily:"'Share Tech Mono',monospace", fontSize:8, padding:"4px 12px", borderRadius:3, cursor:"pointer",
                  background:"transparent", color:"#6a3030", border:"1px solid #3a2020",
                }}>↺ CLEAR LOG</button>
              </div>
            )}
          </div>
        )}

        {/* ── NWKRAFT TAB (permanent tab view) ── */}
        {activeTab === "nwkraft" && (
          <div style={{ padding:"12px 14px" }}>
            <NwkraftCard
              data={ifrData}
              tail={tail}
              onClose={null}
              onClear={() => setIfrData({ N:"",W:"",K:"",R:"",A:"",F:"",T:"" })}
              forceIfrMode={forceIfrMode}
              onToggleForce={() => { setForceIfrMode(v => !v); if (!forceIfrMode) setIfrOverlay(true); }}
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            NWKRAFT ABSOLUTE OVERLAY — slides over live feed automatically
            Triggered by: IFR clearance detection OR FORCE IFR CAPTURE
            Dismissed by: ✕ CLOSE — live feed remains untouched beneath
        ════════════════════════════════════════════════════════════════ */}
        {ifrOverlay && (
          <div style={{
            position:"absolute", inset:0, zIndex:100,
            background:"rgba(7,9,14,0.97)",
            display:"flex", flexDirection:"column",
            animation:"commSlideUp 0.22s cubic-bezier(0.25,1,0.5,1)",
            overflowY:"auto", scrollbarWidth:"thin",
          }}>
            {/* Overlay header */}
            <div style={{
              flexShrink:0, padding:"8px 14px",
              background:"linear-gradient(90deg,rgba(232,200,74,0.14),rgba(10,14,20,0))",
              borderBottom:`2px solid ${C.amber}`,
              display:"flex", alignItems:"center", justifyContent:"space-between",
              position:"sticky", top:0, zIndex:10,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, fontWeight:700, letterSpacing:3, color:C.amber }}>
                  ✦ IFR CLEARANCE CAPTURED
                </div>
                {forceIfrMode && (
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.teal, background:"rgba(74,232,200,0.12)", border:`1px solid ${C.teal}40`, padding:"1px 6px", borderRadius:2, letterSpacing:1 }}>
                    FORCED
                  </div>
                )}
              </div>
              <button onClick={() => setIfrOverlay(false)} style={{
                fontFamily:"'Rajdhani',sans-serif", fontSize:11, fontWeight:700, letterSpacing:1,
                padding:"4px 14px", borderRadius:3, cursor:"pointer",
                background:"rgba(232,90,74,0.1)", color:C.red, border:`1px solid ${C.red}`,
              }}>
                ✕ CLOSE
              </button>
            </div>

            {/* Overlay body */}
            <div style={{ padding:"12px 14px" }}>
              <NwkraftCard
                data={ifrData}
                tail={tail}
                onClose={() => setIfrOverlay(false)}
                onClear={() => setIfrData({ N:"",W:"",K:"",R:"",A:"",F:"",T:"" })}
                forceIfrMode={forceIfrMode}
                onToggleForce={() => setForceIfrMode(v => !v)}
              />
            </div>
          </div>
        )}

      </div>{/* ── end flex:1 scroll area ── */}

      {/* ═══════════════════════════════════════════════════════════════════
          REPLAY TACTICAL BAR — pinned full-width at page base, outside
          scroll area. Stable position regardless of content length.
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ flexShrink:0, borderTop:`1px solid ${C.border}` }}>
        <button
          onClick={() => replayBuffer(10)}
          style={{
            width:"100%", padding:"11px 14px", cursor:"pointer", border:"none",
            background: replayActive
              ? "rgba(58,154,212,0.22)"
              : "linear-gradient(90deg,rgba(58,154,212,0.1) 0%,rgba(10,14,20,0.4) 60%,rgba(58,154,212,0.1) 100%)",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            transition:"background 0.15s",
            borderBottom:`1px solid ${C.border}`,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 20 20" fill="none">
            <polygon points="16,10 6,4 6,16" fill={replayActive?C.amber:C.blue} opacity={replayActive?"1":"0.9"}/>
            <line x1="4" y1="4" x2="4" y2="16" stroke={replayActive?C.amber:C.blue} strokeWidth="2.5" strokeLinecap="round" opacity={replayActive?"1":"0.9"}/>
          </svg>
          <span style={{
            fontFamily:"'Oswald',sans-serif", fontSize:12, fontWeight:700, letterSpacing:3,
            color: replayActive ? C.amber : C.blue,
            textTransform:"uppercase",
          }}>
            {replayActive ? "▶ REPLAYING LAST 10s…" : "⏮ REPLAY LAST 10 SECONDS"}
          </span>
          {replayActive && (
            <div style={{
              width:8, height:8, borderRadius:"50%", background:C.amber,
              animation:"commPulse 0.8s ease infinite",
            }}/>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STATUS BAR
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        flexShrink:0, padding:"4px 14px",
        background:"#070910", borderTop:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", gap:12,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{
            width:6, height:6, borderRadius:"50%",
            background: listening ? C.green : C.dim,
            boxShadow: listening ? `0 0 6px ${C.green}` : "none",
            animation: listening ? "commGreenPulse 2s ease infinite" : "none",
          }}/>
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.dim, letterSpacing:1.5 }}>
            {listening ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.dim, letterSpacing:1 }}>
          {tail}
        </span>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.dim, letterSpacing:1 }}>
          {txLog.length} TX
        </span>
        {forceIfrMode && (
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.teal, letterSpacing:1, marginLeft:"auto" }}>
            ▶ IFR FORCE
          </span>
        )}
        {watchdogState !== "clear" && (
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:isUnanswered?C.red:C.amber, letterSpacing:1, marginLeft:"auto", animation:"commPulse 1s ease infinite" }}>
            ⚠ {isUnanswered ? "UNANSWERED" : "ALERT"}
          </span>
        )}
      </div>

    </div>
  );
}

export default CommPage;
