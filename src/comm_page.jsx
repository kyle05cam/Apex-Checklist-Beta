// ─────────────────────────────────────────────────────────────────────────────
// APEX AVIATION — COMM PAGE (Module 1: Offline Frequency Guard)
// Standalone component. Import into cessna172s_checklist.jsx.
//
// ARCHITECTURE:
//   • Web Worker scaffold (STT engine slot — Web Speech API now, ONNX-ready)
//   • Float32Array circular ring buffer (196,608 samples @ 16kHz ≈ 12.3s)
//   • Callsign watchdog regex (dynamic from aircraft.tail)
//   • ACK CALL 5-second timeout with audio chime
//   • NWKRAFT overlay (auto-detect + FORCE IFR CAPTURE)
//   • Landing clearance structured card with color-pill key terms
//   • Transmission log with timestamps and replay
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS (matches cessna172s_checklist.jsx) ────────────────────────
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
const SAMPLE_RATE    = 16000;          // 16 kHz mono PCM
const BUFFER_SECONDS = 12;            // ~12s replay window
const BUFFER_SIZE    = SAMPLE_RATE * BUFFER_SECONDS; // 192,000 Float32 samples

// ─── ATC DIRECTIVE VERBS (watchdog) ──────────────────────────────────────────
const ATC_DIRECTIVES = [
  "climb","descend","turn","maintain","fly","cleared","contact",
  "squawk","hold short","hold","report","traffic","expect","cross",
  "taxi","line up","wait","go around","cancel","frequency","departure",
  "approach","heading","altitude","speed","direct","intercept",
];

// ─── NWKRAFT FIELD DEFINITIONS ────────────────────────────────────────────────
const NWKRAFT_FIELDS = [
  { key: "N", label: "N — NAME",        hint: "Clearance name / facility",     color: C.blue   },
  { key: "W", label: "W — WEATHER",     hint: "Wx / filing weather",           color: C.teal   },
  { key: "K", label: "K — KODE",        hint: "Squawk code",                   color: C.amber  },
  { key: "R", label: "R — ROUTE",       hint: "Route of flight",               color: C.green  },
  { key: "A", label: "A — ALTITUDE",    hint: "Initial altitude / expect",     color: C.purple },
  { key: "F", label: "F — FREQUENCY",   hint: "Departure frequency",           color: C.blue   },
  { key: "T", label: "T — TRANSPONDER", hint: "Transponder instructions",      color: C.amber  },
];

// ─── TRAFFIC PATTERN LEGS ─────────────────────────────────────────────────────
const PATTERN_LEGS = [
  "upwind","crosswind","downwind","base","final",
  "left downwind","right downwind","left base","right base",
  "left traffic","right traffic","straight-in","overhead",
];

// ─── LANDING CLEARANCE KEY TERMS ─────────────────────────────────────────────
const LANDING_TERMS = {
  runway:   { color: C.red,    bg: "rgba(232,90,74,0.15)"    },
  leg:      { color: C.teal,   bg: "rgba(74,232,200,0.12)"   },
  direction:{ color: C.amber,  bg: "rgba(232,200,74,0.15)"   },
  general:  { color: C.blue,   bg: "rgba(58,154,212,0.15)"   },
};

// ─── WEB WORKER INLINE BLOB (STT Engine Scaffold) ────────────────────────────
// This worker receives Float32 PCM chunks from the AudioWorklet processor.
// TODAY: passes the audio through a recognition stub (Web Speech API result
//        is injected via postMessage from the main thread).
// NEXT:  replace the stub block below with Whisper-Tiny ONNX inference call.
//        The ring buffer protocol and message contract are already wired.
const WORKER_BLOB = `
// ── APEX COMM WORKER v1.0 ─ STT Engine Scaffold ──────────────────────────────
// Message protocol:
//   IN  { type: "AUDIO_CHUNK",  samples: Float32Array }
//   IN  { type: "TRANSCRIPTION_RESULT", text: string, isFinal: boolean }
//   OUT { type: "TRANSCRIPT",   text: string, isFinal: boolean, ts: number }
//   OUT { type: "BUFFER_READY", rmsDb: number }

// Ring buffer state (owned by worker, mirrored to main via SharedArrayBuffer later)
const SAMPLE_RATE    = 16000;
const BUFFER_SIZE    = 16000 * 12;
const ringBuffer     = new Float32Array(BUFFER_SIZE);
let   writeHead      = 0;   // mutable write pointer — never reallocated

// RMS metering
function calcRms(samples) {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return 20 * Math.log10(Math.sqrt(sum / samples.length) + 1e-9);
}

// Write incoming PCM into the ring buffer without allocation
function writeToRing(samples) {
  for (let i = 0; i < samples.length; i++) {
    ringBuffer[writeHead] = samples[i];
    writeHead = (writeHead + 1) % BUFFER_SIZE;
  }
}

// Export the last N seconds from the ring buffer as a linear copy
function readRingSeconds(seconds) {
  const n     = Math.min(seconds * SAMPLE_RATE, BUFFER_SIZE);
  const out   = new Float32Array(n);
  const start = (writeHead - n + BUFFER_SIZE) % BUFFER_SIZE;
  for (let i = 0; i < n; i++) {
    out[i] = ringBuffer[(start + i) % BUFFER_SIZE];
  }
  return out;
}

self.onmessage = function(e) {
  const { type } = e.data;

  if (type === "AUDIO_CHUNK") {
    const samples = e.data.samples;
    if (!samples || samples.length === 0) return;
    writeToRing(samples);
    const rmsDb = calcRms(samples);
    self.postMessage({ type: "BUFFER_READY", rmsDb });
    // ── ONNX STUB BLOCK ─────────────────────────────────────────────────────
    // TO UPGRADE: load whisper-tiny.en ONNX model here via:
    //   import { pipeline } from "@xenova/transformers";
    //   const asr = await pipeline("automatic-speech-recognition","Xenova/whisper-tiny.en");
    //   const result = await asr(samples, { sampling_rate: 16000 });
    //   self.postMessage({ type:"TRANSCRIPT", text:result.text, isFinal:true, ts:Date.now() });
    // ────────────────────────────────────────────────────────────────────────
    return;
  }

  if (type === "TRANSCRIPTION_RESULT") {
    // Relay Web Speech API results (main thread injection) back up
    self.postMessage({ type: "TRANSCRIPT", text: e.data.text, isFinal: e.data.isFinal, ts: Date.now() });
    return;
  }

  if (type === "GET_REPLAY") {
    const secs = e.data.seconds || 10;
    const pcm  = readRingSeconds(secs);
    self.postMessage({ type: "REPLAY_PCM", pcm, sampleRate: SAMPLE_RATE });
    return;
  }
};
`;

// ─── CALLSIGN REGEX BUILDER ───────────────────────────────────────────────────
// Converts "N12345" → matches "november one two three four five", "N12345",
// "N 1 2 3 4 5", etc. Uses ICAO phonetic alphabet for digits and letters.
const PHONETIC_DIGITS = { "0":"zero","1":"one","2":"two","3":"three","4":"four","5":"five","6":"six","7":"seven","8":"eight","9":"nine" };
const PHONETIC_ALPHA  = { A:"alpha",B:"bravo",C:"charlie",D:"delta",E:"echo",F:"foxtrot",G:"golf",H:"hotel",I:"india",J:"juliett",K:"kilo",L:"lima",M:"mike",N:"november",O:"oscar",P:"papa",Q:"quebec",R:"romeo",S:"sierra",T:"tango",U:"uniform",V:"victor",W:"whiskey",X:"xray",Y:"yankee",Z:"zulu" };

function buildCallsignRegex(tail) {
  if (!tail) return null;
  const clean = tail.toUpperCase().replace(/[^A-Z0-9]/g, "");
  // Build alternation: literal | phonetic spoken | spaced literal
  const parts = clean.split("").map(c => {
    const ph = PHONETIC_ALPHA[c] || PHONETIC_DIGITS[c] || c;
    return `(?:${c}|${ph})`;
  });
  // Patterns: N12345 | november one two ... | N 1 2 3 ...
  const literal   = clean;
  const phonetic  = parts.join("[\\s\\-]*");
  const spaced    = clean.split("").join("[\\s]*");
  const combined  = `(?:${literal}|${phonetic}|${spaced})`;

  // Directive verbs alternation
  const verbPart = ATC_DIRECTIVES.map(v => v.replace(/ /g, "\\s+")).join("|");

  // Full watchdog pattern: callsign ... within 30 chars ... directive verb
  return new RegExp(`(${combined})[^.]{0,60}(${verbPart})`, "i");
}

// ─── IFR CLEARANCE PARSER ─────────────────────────────────────────────────────
function parseNwkraft(text) {
  const t = text.toLowerCase();
  const result = { N:"", W:"", K:"", R:"", A:"", F:"", T:"" };

  // N — clearance to / destination
  const destMatch = text.match(/cleared\s+(?:to\s+)?([A-Z][A-Z0-9\s]{2,20}?)(?:\s+via|\s+as\s+filed|\s+climb|\s+maintain|,)/i);
  if (destMatch) result.N = destMatch[1].trim();

  // W — filed weather placeholder (usually briefed externally)
  result.W = t.includes("ifr") ? "IFR FLIGHT PLAN" : "";

  // K — squawk
  const sqkMatch = text.match(/squawk\s+(\d{4})/i);
  if (sqkMatch) result.K = sqkMatch[1];

  // R — route
  const viaMatch = text.match(/via\s+([A-Z0-9\s,]+?)(?:\s+maintain|\s+climb|\s+expect|$)/i);
  if (viaMatch) result.R = viaMatch[1].trim();
  else if (t.includes("as filed")) result.R = "AS FILED";

  // A — initial altitude
  const altMatch = text.match(/(?:maintain|climb\s+and\s+maintain|climb\s+to)\s+(\d[\d,]+\s*(?:feet|ft)?)/i);
  if (altMatch) result.A = altMatch[1].replace(/,/g,"").trim();
  const expectMatch = text.match(/expect\s+(\d[\d,]+)\s*(?:feet|ft)?\s*(?:one\s*zero\s*minutes?|10\s*min)?/i);
  if (expectMatch) result.A = (result.A ? result.A + " / EXP " : "EXP ") + expectMatch[1];

  // F — departure frequency
  const freqMatch = text.match(/(?:contact|departure|frequency)\s+(\d{3}\.\d+)/i);
  if (freqMatch) result.F = freqMatch[1];

  // T — transponder instruction
  result.T = result.K ? `SQUAWK ${result.K}` : "";

  return result;
}

// ─── LANDING CLEARANCE PARSER ─────────────────────────────────────────────────
function parseLandingClearance(text) {
  const tokens = [];
  const t = text;

  // Tokenize into segments — label matched spans with pill type
  let remaining = t;
  let output = [];

  // Runway detection
  const rwyRx = /\b(?:runway|rwy)\s*([0-9]{1,2}[LRC]?)\b/gi;
  // Pattern leg detection
  const legRx  = new RegExp(`\\b(${PATTERN_LEGS.map(l=>l.replace(/ /g,"\\s+")).join("|")})\\b`,"gi");
  // Direction detection
  const dirRx  = /\b(left|right|straight|north|south|east|west|northeast|northwest|southeast|southwest)\b/gi;

  // Build annotated token list
  const annotated = [];
  const seen = new Set();

  const addMatch = (rx, type) => {
    let m;
    while ((m = rx.exec(t)) !== null) {
      annotated.push({ start: m.index, end: m.index + m[0].length, text: m[0], type });
    }
  };
  addMatch(rwyRx,  "runway");
  addMatch(legRx,  "leg");
  addMatch(dirRx,  "direction");

  // Sort by start index, deduplicate overlaps
  annotated.sort((a,b) => a.start - b.start);
  const deduped = [];
  let cursor = 0;
  for (const a of annotated) {
    if (a.start < cursor) continue;
    deduped.push(a);
    cursor = a.end;
  }

  // Build final render list
  let pos = 0;
  for (const a of deduped) {
    if (a.start > pos) output.push({ text: t.slice(pos, a.start), type: "plain" });
    output.push({ text: a.text, type: a.type });
    pos = a.end;
  }
  if (pos < t.length) output.push({ text: t.slice(pos), type: "plain" });

  return output;
}

// ─── DETECT CLEARANCE TYPE ────────────────────────────────────────────────────
function detectClearanceType(text) {
  const t = text.toLowerCase();
  if (/cleared\s+(?:to|for)\s+(?:the\s+)?(?:ils|rnav|vor|gps|lda|loc|ndb)\s+approach/.test(t)) return "ifr_approach";
  if (/cleared\s+to\s+[a-z]/.test(t) && (/squawk|departure|maintain\s+\d/.test(t))) return "ifr_departure";
  if (/cleared\s+to\s+land/.test(t) || /cleared\s+(?:for|the)\s+(?:option|landing|approach)/.test(t)) return "landing";
  if (/enter|make|report|traffic/.test(t) && PATTERN_LEGS.some(l => t.includes(l))) return "pattern";
  return "general";
}

// ─── AUDIO CHIME (Web Audio API oscillator) ───────────────────────────────────
function playAlertChime(continuous = false) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playBeep = (startTime, freq = 880, dur = 0.18) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.0, startTime);
      gain.gain.linearRampToValueAtTime(0.6, startTime + 0.02);
      gain.gain.linearRampToValueAtTime(0.0, startTime + dur);
      osc.start(startTime);
      osc.stop(startTime + dur + 0.02);
    };
    const t = ctx.currentTime;
    if (continuous) {
      // Triple urgent beep pattern
      playBeep(t,       1046, 0.12);
      playBeep(t + 0.16, 1046, 0.12);
      playBeep(t + 0.32, 1046, 0.22);
    } else {
      // Single acknowledgment tone
      playBeep(t, 523, 0.25);
      playBeep(t + 0.3, 659, 0.15);
    }
    setTimeout(() => { try { ctx.close(); } catch {} }, 1200);
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// COMM PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function CommPage({ aircraft }) {
  // ── Core state ─────────────────────────────────────────────────────────────
  const [listening,       setListening]       = useState(false);
  const [micStatus,       setMicStatus]       = useState("idle"); // idle | active | error | denied
  const [rmsLevel,        setRmsLevel]        = useState(-60);   // dBFS
  const [transcript,      setTranscript]      = useState("");    // live partial
  const [txLog,           setTxLog]           = useState([]);    // [{id,text,ts,type,tokens,nwkraft}]
  const [watchdogState,   setWatchdogState]   = useState("clear"); // clear | alert | unanswered
  const [watchdogTx,      setWatchdogTx]      = useState(null);  // the flagged transmission
  const [ackCountdown,    setAckCountdown]    = useState(0);
  const [ifrOverlay,      setIfrOverlay]      = useState(false);
  const [ifrData,         setIfrData]         = useState({ N:"",W:"",K:"",R:"",A:"",F:"",T:"" });
  const [forceIfrMode,    setForceIfrMode]    = useState(false); // FORCE IFR CAPTURE toggle
  const [replayActive,    setReplayActive]    = useState(false);
  const [replayIndex,     setReplayIndex]     = useState(null);  // log index being replayed
  const [activeTab,       setActiveTab]       = useState("live"); // live | log | nwkraft

  // ── Refs ───────────────────────────────────────────────────────────────────
  const workerRef         = useRef(null);
  const workerBlobUrl     = useRef(null);
  const recognitionRef    = useRef(null);
  const mediaStreamRef    = useRef(null);
  const audioCtxRef       = useRef(null);
  const analyserRef       = useRef(null);
  const animFrameRef      = useRef(null);
  const ackTimerRef       = useRef(null);
  const ackIntervalRef    = useRef(null);
  const beepIntervalRef   = useRef(null);
  const txIdRef           = useRef(0);
  const callsignRegexRef  = useRef(null);
  const replaySourceRef   = useRef(null);

  const tail = aircraft?.tail || "N12345";

  // ── Build callsign regex whenever tail changes ─────────────────────────────
  useEffect(() => {
    callsignRegexRef.current = buildCallsignRegex(tail);
  }, [tail]);

  // ── Spin up Web Worker ─────────────────────────────────────────────────────
  useEffect(() => {
    const blob = new Blob([WORKER_BLOB], { type: "application/javascript" });
    workerBlobUrl.current = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerBlobUrl.current);

    workerRef.current.onmessage = (e) => {
      const { type } = e.data;
      if (type === "BUFFER_READY") {
        setRmsLevel(e.data.rmsDb);
      }
      if (type === "TRANSCRIPT") {
        handleTranscript(e.data.text, e.data.isFinal);
      }
      if (type === "REPLAY_PCM") {
        playPcmAudio(e.data.pcm, e.data.sampleRate);
      }
    };

    return () => {
      workerRef.current?.terminate();
      if (workerBlobUrl.current) URL.revokeObjectURL(workerBlobUrl.current);
    };
  }, []);

  // ── Handle transcript from worker ─────────────────────────────────────────
  const handleTranscript = useCallback((text, isFinal) => {
    if (!text?.trim()) return;
    setTranscript(isFinal ? "" : text);

    if (!isFinal) return;

    const type    = detectClearanceType(text);
    const tokens  = (type === "landing" || type === "pattern") ? parseLandingClearance(text) : null;
    const nwkraft = (type === "ifr_departure" || type === "ifr_approach" || forceIfrMode)
                    ? parseNwkraft(text) : null;

    const entry = {
      id:      ++txIdRef.current,
      text,
      ts:      new Date(),
      type,
      tokens,
      nwkraft,
    };

    setTxLog(prev => [entry, ...prev].slice(0, 40)); // keep last 40

    // If IFR clearance detected (or forced), show overlay
    if (nwkraft) {
      setIfrData(nwkraft);
      setIfrOverlay(true);
      setActiveTab("nwkraft");
    }

    // Watchdog — check callsign + directive
    if (callsignRegexRef.current && callsignRegexRef.current.test(text)) {
      triggerWatchdog(entry);
    }
  }, [forceIfrMode]);

  // ── Watchdog trigger ───────────────────────────────────────────────────────
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
      if (remaining <= 0) {
        clearInterval(ackIntervalRef.current);
        escalateWatchdog();
      }
    }, 1000);
  };

  const escalateWatchdog = () => {
    setWatchdogState("unanswered");
    playAlertChime(true);
    // Continuous beep every 2s
    beepIntervalRef.current = setInterval(() => playAlertChime(true), 2000);
  };

  const acknowledgeCall = () => {
    clearWatchdogTimers();
    setWatchdogState("clear");
    setWatchdogTx(null);
    setAckCountdown(0);
    playAlertChime(false); // confirmation tone
  };

  const clearWatchdogTimers = () => {
    clearTimeout(ackTimerRef.current);
    clearInterval(ackIntervalRef.current);
    clearInterval(beepIntervalRef.current);
  };

  // ── Start listening ────────────────────────────────────────────────────────
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1, sampleRate: SAMPLE_RATE, echoCancellation: false,
        noiseSuppression: false, autoGainControl: false,
      }});
      mediaStreamRef.current = stream;

      // Audio context + analyser for VU meter
      const ctx     = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
      audioCtxRef.current = ctx;
      const source  = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Script processor to feed PCM into worker ring buffer
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      source.connect(proc);
      proc.connect(ctx.destination);
      proc.onaudioprocess = (e) => {
        const samples = new Float32Array(e.inputBuffer.getChannelData(0));
        workerRef.current?.postMessage({ type: "AUDIO_CHUNK", samples });
      };

      // VU meter animation
      const vuBuf = new Uint8Array(analyser.frequencyBinCount);
      const animVu = () => {
        analyser.getByteFrequencyData(vuBuf);
        let sum = 0; for (let i=0; i<vuBuf.length; i++) sum += vuBuf[i]*vuBuf[i];
        const rms = Math.sqrt(sum / vuBuf.length);
        setRmsLevel(rms / 255);
        animFrameRef.current = requestAnimationFrame(animVu);
      };
      animFrameRef.current = requestAnimationFrame(animVu);

      // Web Speech API (STT engine — injects results into worker as TRANSCRIPTION_RESULT)
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.continuous     = true;
        rec.interimResults = true;
        rec.lang           = "en-US";
        rec.maxAlternatives = 1;

        rec.onresult = (e) => {
          let partial = "", final_ = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i];
            if (res.isFinal) final_ += res[0].transcript + " ";
            else             partial += res[0].transcript;
          }
          if (partial) {
            setTranscript(partial);
          }
          if (final_.trim()) {
            workerRef.current?.postMessage({
              type: "TRANSCRIPTION_RESULT", text: final_.trim(), isFinal: true,
            });
          }
        };

        rec.onerror = (e) => {
          if (e.error === "not-allowed") setMicStatus("denied");
        };

        rec.onend = () => { if (listening) { try { rec.start(); } catch {} } };

        rec.start();
        recognitionRef.current = rec;
      }

      setListening(true);
      setMicStatus("active");

    } catch (err) {
      setMicStatus(err.name === "NotAllowedError" ? "denied" : "error");
    }
  };

  // ── Stop listening ─────────────────────────────────────────────────────────
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

  // ── Replay last 10s from ring buffer ──────────────────────────────────────
  const replayBuffer = (seconds = 10) => {
    workerRef.current?.postMessage({ type: "GET_REPLAY", seconds });
    setReplayActive(true);
    setTimeout(() => setReplayActive(false), seconds * 1000);
  };

  // ── Play PCM Float32Array via Web Audio ───────────────────────────────────
  const playPcmAudio = (pcm, sr) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, pcm.length, sr);
      buf.copyToChannel(pcm, 0);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start();
      src.onended = () => { setReplayActive(false); ctx.close(); };
      replaySourceRef.current = src;
    } catch { setReplayActive(false); }
  };

  // ── Replay a specific log entry (re-transcribe display only) ──────────────
  const replayLogEntry = (entry) => {
    setReplayIndex(entry.id);
    setTimeout(() => setReplayIndex(null), 3000);
  };

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopListening();
      clearWatchdogTimers();
    };
  }, []);

  // ── VU meter bar count ─────────────────────────────────────────────────────
  const vuBars   = 20;
  const vuActive = Math.round(rmsLevel * vuBars);

  // ── Watchdog flash style ───────────────────────────────────────────────────
  const isUnanswered = watchdogState === "unanswered";
  const isAlert      = watchdogState === "alert";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: C.black, position: "relative", overflow: "hidden",
      fontFamily: "'Rajdhani',sans-serif",
      animation: isUnanswered ? "commFlash 0.5s ease infinite alternate" : "none",
    }}>

      {/* ── KEYFRAMES injected once ── */}
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
        @keyframes commSlideIn {
          from { opacity:0; transform: translateY(-6px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes commSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes vuPulse {
          0%   { opacity: 0.7; }
          50%  { opacity: 1.0; }
          100% { opacity: 0.7; }
        }
      `}</style>

      {/* ── HEADER BAR ── */}
      <div style={{
        flexShrink: 0, padding: "8px 14px",
        background: "linear-gradient(135deg,#0a0c10,#141820)",
        borderBottom: `2px solid ${C.teal}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {/* Antenna icon */}
        <svg width={18} height={18} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="2.5" fill={C.teal}/>
          <path d="M10 10 Q6 5 3 2" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" opacity={listening?"1":"0.35"}/>
          <path d="M10 10 Q14 5 17 2" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" opacity={listening?"1":"0.35"}/>
          <path d="M10 10 Q7 7 5 4" stroke={C.teal} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" opacity={listening?"0.7":"0.2"}/>
          <path d="M10 10 Q13 7 15 4" stroke={C.teal} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" opacity={listening?"0.7":"0.2"}/>
          <line x1="10" y1="12.5" x2="10" y2="18" stroke={C.teal} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, fontWeight:700, letterSpacing:3, color:C.teal, textTransform:"uppercase" }}>
            COMM WATCHDOG
          </div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim, letterSpacing:1.5, marginTop:1 }}>
            CALLSIGN: {tail} · {listening ? "MONITORING" : "STANDBY"}
          </div>
        </div>

        {/* FORCE IFR CAPTURE toggle */}
        <button
          onClick={() => setForceIfrMode(v => !v)}
          style={{
            fontFamily:"'Share Tech Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:1,
            padding:"4px 10px", borderRadius:3, cursor:"pointer",
            background: forceIfrMode ? "rgba(74,232,200,0.18)" : "transparent",
            color: forceIfrMode ? C.teal : C.dim,
            border: `1px solid ${forceIfrMode ? C.teal : C.border}`,
            transition:"all 0.15s",
          }}
        >
          {forceIfrMode ? "▶ IFR CAPTURE ON" : "IFR CAPTURE"}
        </button>

        {/* MIC toggle */}
        <button
          onClick={() => listening ? stopListening() : startListening()}
          style={{
            fontFamily:"'Oswald',sans-serif", fontSize:11, fontWeight:700, letterSpacing:2,
            padding:"5px 14px", borderRadius:4, cursor:"pointer",
            background: listening ? "rgba(232,90,74,0.15)" : "rgba(74,232,200,0.12)",
            color:  listening ? C.red : C.teal,
            border: `1.5px solid ${listening ? C.red : C.teal}`,
            animation: listening && micStatus==="active" ? "commPulse 1.8s ease infinite" : "none",
            transition:"all 0.15s",
          }}
        >
          {listening ? "⏹ STOP" : "⏵ LISTEN"}
        </button>
      </div>

      {/* ── ACK CALL ALERT PANEL ── */}
      {(isAlert || isUnanswered) && (
        <div style={{
          flexShrink: 0, padding:"10px 14px",
          background: isUnanswered ? "rgba(232,90,74,0.22)" : "rgba(232,200,74,0.12)",
          borderBottom: `2px solid ${isUnanswered ? C.red : C.amber}`,
          display:"flex", alignItems:"center", gap:12,
          animation:"commSlideIn 0.2s ease",
        }}>
          {/* Warning icon */}
          <div style={{
            width:36, height:36, borderRadius:"50%", flexShrink:0,
            background: isUnanswered ? "rgba(232,90,74,0.3)" : "rgba(232,200,74,0.2)",
            border: `2px solid ${isUnanswered ? C.red : C.amber}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, animation: isUnanswered ? "commPulse 0.8s ease infinite" : "commPulse 1.5s ease infinite",
          }}>
            {isUnanswered ? "🔴" : "📡"}
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:13, fontWeight:700, letterSpacing:2, color: isUnanswered ? C.red : C.amber, textTransform:"uppercase" }}>
              {isUnanswered ? "⚠ UNANSWERED CALL" : `CALLSIGN ALERT — ${ackCountdown}s`}
            </div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:C.text, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {watchdogTx?.text || ""}
            </div>
          </div>

          {/* ACK CALL button */}
          <button
            onClick={acknowledgeCall}
            style={{
              fontFamily:"'Oswald',sans-serif", fontSize:13, fontWeight:700, letterSpacing:2,
              padding:"8px 18px", borderRadius:4, cursor:"pointer", flexShrink:0,
              background: isUnanswered ? C.red : C.amber,
              color:"#000",
              border:"none",
              boxShadow: isUnanswered ? `0 0 20px ${C.red}80` : `0 0 12px ${C.amber}60`,
              animation: isUnanswered ? "commPulse 0.8s ease infinite" : "none",
            }}
          >
            PTT · ACK CALL
          </button>
        </div>
      )}

      {/* ── VU METER + LIVE TRANSCRIPT ── */}
      <div style={{
        flexShrink:0, padding:"8px 14px", background:"rgba(10,14,20,0.8)",
        borderBottom:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column", gap:6,
      }}>
        {/* VU bar */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim, letterSpacing:1, width:30, flexShrink:0 }}>
            {listening ? "RX" : "——"}
          </div>
          <div style={{ display:"flex", gap:2, flex:1, height:10, alignItems:"center" }}>
            {Array.from({length:vuBars}).map((_,i) => {
              const active = i < vuActive && listening;
              const bright = i >= vuBars * 0.75;
              const mid    = i >= vuBars * 0.5;
              return (
                <div key={i} style={{
                  flex:1, height: active ? (bright ? 10 : mid ? 8 : 5) : 3,
                  borderRadius:1,
                  background: active
                    ? (bright ? C.red : mid ? C.amber : C.green)
                    : C.border,
                  transition:"height 0.06s, background 0.06s",
                  animation: active ? "vuPulse 0.8s ease infinite" : "none",
                }}/>
              );
            })}
          </div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim, width:24, textAlign:"right", flexShrink:0 }}>
            {micStatus === "denied" ? "⛔" : micStatus === "error" ? "ERR" : listening ? "ON" : "OFF"}
          </div>
        </div>

        {/* Live partial transcript */}
        <div style={{
          fontFamily:"'Share Tech Mono',monospace", fontSize:11, color: transcript ? C.amber : C.dim,
          minHeight:16, letterSpacing:0.5, fontStyle: transcript ? "normal" : "italic",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        }}>
          {transcript
            ? `▶ ${transcript}`
            : listening
              ? "— listening —"
              : micStatus === "denied"
                ? "⛔ MICROPHONE ACCESS DENIED — enable in browser settings"
                : "TAP LISTEN TO BEGIN MONITORING"}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ flexShrink:0, display:"flex", borderBottom:`1px solid ${C.border}`, background:"#0a0c10" }}>
        {[
          { key:"live",    label:"LIVE FEED",  color:C.teal  },
          { key:"log",     label:"TX LOG",     color:C.blue  },
          { key:"nwkraft", label:"NWKRAFT",    color:C.amber },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex:1, padding:"7px 4px", cursor:"pointer", border:"none", borderBottom:"none",
            borderRight:`1px solid ${C.border}`,
            background: activeTab===tab.key ? `${tab.color}14` : "transparent",
            borderTop: `2px solid ${activeTab===tab.key ? tab.color : "transparent"}`,
            transition:"all 0.12s",
          }}>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:1.5, color: activeTab===tab.key ? tab.color : C.dim, textTransform:"uppercase" }}>
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", scrollbarWidth:"thin" }}>

        {/* ────────── LIVE FEED TAB ────────── */}
        {activeTab === "live" && (
          <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>

            {/* Latest transmission card */}
            {txLog.length > 0 && (() => {
              const latest = txLog[0];
              const typeColors = {
                ifr_departure:{ c:C.teal,  label:"IFR CLEARANCE"  },
                ifr_approach: { c:C.teal,  label:"IFR APPROACH"   },
                landing:      { c:C.green, label:"LANDING CLRNCE"  },
                pattern:      { c:C.blue,  label:"PATTERN INSTR"  },
                general:      { c:C.dim,   label:"GENERAL"        },
              };
              const tc = typeColors[latest.type] || typeColors.general;
              return (
                <div style={{
                  background:"rgba(10,14,20,0.9)", border:`1.5px solid ${tc.c}30`,
                  borderLeft:`4px solid ${tc.c}`, borderRadius:5,
                  padding:"10px 12px", animation:"commSlideIn 0.2s ease",
                }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:2, color:tc.c, background:`${tc.c}15`, padding:"2px 8px", borderRadius:3 }}>
                      {tc.label}
                    </div>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim }}>
                      {latest.ts.toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}Z
                    </div>
                  </div>

                  {/* Rendered text — plain or tokenized */}
                  <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:14, lineHeight:1.6, color:C.text }}>
                    {latest.tokens
                      ? latest.tokens.map((tok,i) => {
                          if (tok.type === "plain") return <span key={i}>{tok.text}</span>;
                          const s = LANDING_TERMS[tok.type] || LANDING_TERMS.general;
                          return (
                            <span key={i} style={{
                              background:s.bg, color:s.color, borderRadius:3, padding:"0 5px",
                              fontFamily:"'Share Tech Mono',monospace", fontSize:12, fontWeight:700,
                              border:`1px solid ${s.color}40`, margin:"0 2px",
                            }}>
                              {tok.text.toUpperCase()}
                            </span>
                          );
                        })
                      : latest.text
                    }
                  </div>

                  {/* Action row */}
                  <div style={{ display:"flex", gap:6, marginTop:8 }}>
                    <button onClick={() => replayBuffer(10)} disabled={replayActive} style={{
                      fontFamily:"'Share Tech Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:1,
                      padding:"3px 10px", borderRadius:3, cursor:replayActive?"not-allowed":"pointer",
                      background:"transparent", color:replayActive?C.dim:C.blue, border:`1px solid ${replayActive?C.border:C.blue}`,
                    }}>
                      {replayActive ? "▶ REPLAYING…" : "⏮ REPLAY 10s"}
                    </button>
                    {latest.nwkraft && (
                      <button onClick={() => { setIfrData(latest.nwkraft); setIfrOverlay(true); setActiveTab("nwkraft"); }} style={{
                        fontFamily:"'Share Tech Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:1,
                        padding:"3px 10px", borderRadius:3, cursor:"pointer",
                        background:"rgba(232,200,74,0.1)", color:C.amber, border:`1px solid ${C.amber}`,
                      }}>
                        ✦ VIEW NWKRAFT
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Empty state */}
            {txLog.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:C.dim }}>
                <div style={{ fontSize:32, marginBottom:10, opacity:0.4 }}>📡</div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, letterSpacing:3, color:C.dim }}>AWAITING TRANSMISSION</div>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, marginTop:6, color:"#2a3040" }}>
                  {listening ? `MONITORING · ${tail}` : "TAP LISTEN TO BEGIN"}
                </div>
              </div>
            )}

            {/* Replay control */}
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={() => replayBuffer(10)}
                disabled={!listening && txLog.length===0}
                style={{
                  flex:1, padding:"10px", borderRadius:4, cursor:"pointer",
                  background:"rgba(58,154,212,0.1)", color:C.blue,
                  border:`1px solid ${C.blue}40`,
                  fontFamily:"'Oswald',sans-serif", fontSize:11, fontWeight:700, letterSpacing:2,
                }}
              >
                ⏮ REPLAY LAST 10s
              </button>
              <button
                onClick={() => { setIfrOverlay(true); setActiveTab("nwkraft"); }}
                style={{
                  flex:1, padding:"10px", borderRadius:4, cursor:"pointer",
                  background:"rgba(232,200,74,0.1)", color:C.amber,
                  border:`1px solid ${C.amber}40`,
                  fontFamily:"'Oswald',sans-serif", fontSize:11, fontWeight:700, letterSpacing:2,
                }}
              >
                ✦ OPEN NWKRAFT
              </button>
            </div>
          </div>
        )}

        {/* ────────── TX LOG TAB ────────── */}
        {activeTab === "log" && (
          <div style={{ padding:"8px 0" }}>
            {txLog.length === 0 ? (
              <div style={{ padding:"30px 20px", textAlign:"center", fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.dim, letterSpacing:1 }}>
                NO TRANSMISSIONS LOGGED
              </div>
            ) : txLog.map(entry => {
              const isReplaying = replayIndex === entry.id;
              const typeColors = {
                ifr_departure:C.teal, ifr_approach:C.teal,
                landing:C.green, pattern:C.blue, general:C.dim,
              };
              const ec = typeColors[entry.type] || C.dim;
              return (
                <div key={entry.id} style={{
                  padding:"8px 14px", borderBottom:`1px solid ${C.border}`,
                  background: isReplaying ? `${C.amber}08` : "transparent",
                  animation: isReplaying ? "commSlideIn 0.15s ease" : "none",
                  transition:"background 0.2s",
                }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:ec, letterSpacing:1, flexShrink:0, marginTop:2, padding:"1px 5px", borderRadius:2, background:`${ec}15`, border:`1px solid ${ec}25` }}>
                      {entry.type.replace("_"," ").toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:13, color:C.text, lineHeight:1.4 }}>
                        {entry.tokens
                          ? entry.tokens.map((tok,i) => {
                              if (tok.type==="plain") return <span key={i}>{tok.text}</span>;
                              const s = LANDING_TERMS[tok.type]||LANDING_TERMS.general;
                              return <span key={i} style={{ background:s.bg, color:s.color, borderRadius:2, padding:"0 4px", fontFamily:"'Share Tech Mono',monospace", fontSize:10, margin:"0 1px" }}>{tok.text.toUpperCase()}</span>;
                            })
                          : entry.text
                        }
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
                        <button onClick={() => { setIfrData(entry.nwkraft); setActiveTab("nwkraft"); }} style={{
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
                }}>
                  ↺ CLEAR LOG
                </button>
              </div>
            )}
          </div>
        )}

        {/* ────────── NWKRAFT TAB ────────── */}
        {activeTab === "nwkraft" && (
          <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>

            {/* Header */}
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
                <button onClick={() => setIfrData({N:"",W:"",K:"",R:"",A:"",F:"",T:""})} style={{
                  fontFamily:"'Share Tech Mono',monospace", fontSize:8, padding:"4px 10px", borderRadius:3, cursor:"pointer",
                  background:"transparent", color:"#6a3030", border:"1px solid #3a2020",
                }}>↺ CLEAR</button>
              </div>
            </div>

            {/* NWKRAFT fields */}
            {NWKRAFT_FIELDS.map(field => (
              <div key={field.key} style={{
                background:"rgba(10,14,20,0.9)", border:`1px solid ${field.color}25`,
                borderLeft:`4px solid ${field.color}`, borderRadius:4,
                padding:"8px 12px",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <div style={{
                    fontFamily:"'Oswald',sans-serif", fontSize:22, fontWeight:700, color:field.color,
                    lineHeight:1, width:24, textAlign:"center",
                  }}>
                    {field.key}
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:field.color, letterSpacing:2 }}>
                      {field.label}
                    </div>
                    <div style={{ fontFamily:"'Rajdhani',monospace", fontSize:9, color:C.dim, letterSpacing:0.5 }}>
                      {field.hint}
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  value={ifrData[field.key] || ""}
                  onChange={e => setIfrData(prev => ({...prev, [field.key]: e.target.value}))}
                  placeholder={field.hint}
                  style={{
                    width:"100%", boxSizing:"border-box",
                    background:"rgba(5,8,12,0.9)", border:`1px solid ${field.color}35`,
                    borderRadius:3, padding:"6px 10px", outline:"none",
                    fontFamily:"'Share Tech Mono',monospace", fontSize:13, color:C.text,
                    caretColor:field.color,
                  }}
                />
              </div>
            ))}

            {/* FORCE IFR button */}
            <button
              onClick={() => setForceIfrMode(v => !v)}
              style={{
                padding:"10px", borderRadius:4, cursor:"pointer",
                background: forceIfrMode ? "rgba(74,232,200,0.12)" : "rgba(10,14,20,0.6)",
                color: forceIfrMode ? C.teal : C.dim,
                border: `1.5px solid ${forceIfrMode ? C.teal : C.border}`,
                fontFamily:"'Oswald',sans-serif", fontSize:11, fontWeight:700, letterSpacing:2,
                transition:"all 0.15s",
              }}
            >
              {forceIfrMode ? "⏹ FORCE IFR CAPTURE — ON · TAP TO DEACTIVATE" : "⏵ FORCE IFR CAPTURE"}
            </button>

            {/* Squawk quick-display */}
            {ifrData.K && (
              <div style={{
                background:"rgba(58,154,212,0.1)", border:`1px solid ${C.blue}40`,
                borderRadius:5, padding:"10px 14px", display:"flex", alignItems:"center", gap:14,
              }}>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:C.blue, letterSpacing:2 }}>SQUAWK</div>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:32, fontWeight:700, color:C.amber, letterSpacing:4 }}>
                  {ifrData.K}
                </div>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:C.dim }}>SET XPDR</div>
              </div>
            )}
          </div>
        )}

      </div>{/* end scroll area */}

      {/* ── STATUS BAR ── */}
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
            animation: listening ? "commPulse 2s ease infinite" : "none",
          }}/>
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.dim, letterSpacing:1.5 }}>
            {listening ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.dim, letterSpacing:1 }}>
          {tail}
        </span>
        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.dim, letterSpacing:1 }}>
          {txLog.length} TX LOGGED
        </span>
        {forceIfrMode && (
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:C.teal, letterSpacing:1, marginLeft:"auto" }}>
            ▶ IFR CAPTURE ACTIVE
          </span>
        )}
        {watchdogState !== "clear" && (
          <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color: isUnanswered?C.red:C.amber, letterSpacing:1, marginLeft:"auto", animation:"commPulse 1s ease infinite" }}>
            ⚠ {isUnanswered ? "UNANSWERED" : "ALERT"}
          </span>
        )}
      </div>

    </div>
  );
}

export default CommPage;
