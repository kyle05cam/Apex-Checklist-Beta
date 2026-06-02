// ─────────────────────────────────────────────────────────────────────────────
// CHECKLIST SCANNER — OCR-based paper checklist importer
// Uses Tesseract.js to read photos of printed checklists (Checkmate, etc.)
// Parses the two-column item / action format and maps sections to tabs.
// All processing is local — no internet required after first load.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";

// ── Phase keyword → tab ID mapping ───────────────────────────────────────────
const PHASE_MAP = [
  { patterns: [/pre.?flight|walk.?around|exterior/i],         id: "preflight",  label: "Pre-Flight" },
  { patterns: [/before\s+start|engine\s+start|start\s+up|cold\s+start/i], id: "startup", label: "Start Up" },
  { patterns: [/taxi(?!\s+check)|before\s+taxi/i],            id: "taxi",       label: "Taxi" },
  { patterns: [/before\s+take.?off|run.?up|power\s+check|engine\s+run/i], id: "takeoff", label: "Takeoff" },
  { patterns: [/take.?off|departure/i],                       id: "takeoff",    label: "Takeoff" },
  { patterns: [/climb|after\s+take.?off/i],                   id: "takeoff",    label: "Takeoff" },
  { patterns: [/cruise|en.?route/i],                          id: "takeoff",    label: "Takeoff" },
  { patterns: [/descent|approach|before\s+land/i],            id: "approach",   label: "Approach & Landing" },
  { patterns: [/landing|touchdown/i],                         id: "approach",   label: "Approach & Landing" },
  { patterns: [/after\s+land|shut.?down|parking|securing/i],  id: "shutdown",   label: "Shutdown" },
  { patterns: [/emergency|mayday|engine\s+fail|engine\s+fire|forced\s+land/i], id: "emg", label: "Emergency" },
];

function detectPhase(header) {
  for (const entry of PHASE_MAP) {
    if (entry.patterns.some(p => p.test(header))) return { id: entry.id, label: entry.label };
  }
  return null;
}

// ── Parse OCR text into sections + items ─────────────────────────────────────
function parseChecklistText(rawText) {
  // Normalize — collapse multiple spaces, fix common OCR substitutions
  const lines = rawText
    .replace(/[|]/g, "I")          // pipe → I (common OCR error)
    .replace(/0(?=[A-Z])/g, "O")   // leading 0 before caps → O
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 1);

  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    // Skip page numbers, lone numbers, very short noise
    if (/^\d{1,3}$/.test(line)) continue;
    if (line.length < 3) continue;

    // Detect section header: ALL CAPS line with no dot leader, min 3 chars
    const isHeader = (
      /^[A-Z0-9\s\/\-&()]{3,}$/.test(line) &&
      !/\.{2,}/.test(line) &&
      line === line.toUpperCase() &&
      !line.match(/^[A-Z]{1,2}$/)  // skip lone abbreviations
    );

    if (isHeader) {
      const phase = detectPhase(line);
      currentSection = {
        header: line,
        phase: phase ?? { id: "preflight", label: "Pre-Flight" },
        items: [],
      };
      sections.push(currentSection);
      continue;
    }

    // Parse item line — split on dot leader (2+ dots) or large gap (3+ spaces)
    // Handles: "Fuel Selector ........ BOTH"
    //          "Mixture          RICH"
    //          "Master Switch - ON"
    const dotMatch = line.match(/^(.+?)\s*\.{2,}\s*(.+)$/);
    const dashMatch = line.match(/^(.+?)\s{3,}(.+)$/);
    const hyphenMatch = line.match(/^(.+?)\s+[-–]\s+(.+)$/);

    let label = null, action = null;

    if (dotMatch) {
      label  = dotMatch[1].trim();
      action = dotMatch[2].trim();
    } else if (hyphenMatch) {
      label  = hyphenMatch[1].trim();
      action = hyphenMatch[2].trim();
    } else if (dashMatch) {
      label  = dashMatch[1].trim();
      action = dashMatch[2].trim();
    } else {
      // Single-column line — treat as a note
      label = line;
    }

    // Clean up label and action
    if (label) label  = label.replace(/^\d+[\.\)]\s*/, "").trim(); // strip leading numbers
    if (action) action = action.replace(/\s+/g, " ").trim();

    // Skip lines that are clearly OCR noise (too short after cleaning, all symbols)
    if (!label || label.length < 2) continue;
    if (/^[^a-zA-Z]+$/.test(label)) continue;

    if (!currentSection) {
      // Items before any header — put in a default section
      currentSection = { header: "CHECKLIST", phase: { id: "preflight", label: "Pre-Flight" }, items: [] };
      sections.push(currentSection);
    }

    currentSection.items.push(action
      ? { l: label, a: action }
      : { type: "note", l: label }
    );
  }

  // Filter out sections with no items
  return sections.filter(s => s.items.length > 0);
}

// ── Group sections by phase tab ───────────────────────────────────────────────
function groupByPhase(sections) {
  const grouped = {};
  for (const sec of sections) {
    const key = sec.phase.id;
    if (!grouped[key]) grouped[key] = { phase: sec.phase, sections: [] };
    grouped[key].sections.push({ title: sec.header, items: sec.items });
  }
  return Object.values(grouped);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCANNER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function ChecklistScanner({ onClose, onApply }) {
  const [stage, setStage]       = useState("capture"); // capture | processing | review | done | error
  const [progress, setProgress] = useState(0);
  const [preview, setPreview]   = useState(null);      // data URL of captured image
  const [parsed, setParsed]     = useState(null);      // grouped phase data
  const [editState, setEditState] = useState(null);    // editable copy of parsed
  const [activePhase, setActivePhase] = useState(0);
  const fileRef = useRef(null);

  const mono = { fontFamily: "var(--f-mono)" };

  // ── Image capture ──────────────────────────────────────────────────────────
  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setStage("processing");
    setProgress(0);

    try {
      const worker = await createWorker("eng", 1, {
        logger: m => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const sections = parseChecklistText(text);
      if (sections.length === 0) {
        setStage("error");
        return;
      }

      const grouped = groupByPhase(sections);
      setParsed(grouped);
      setEditState(JSON.parse(JSON.stringify(grouped))); // deep clone for editing
      setActivePhase(0);
      setStage("review");
    } catch {
      setStage("error");
    }
  };

  // ── Item editing ───────────────────────────────────────────────────────────
  const updateItem = (phaseIdx, secIdx, itemIdx, field, value) => {
    setEditState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[phaseIdx].sections[secIdx].items[itemIdx][field] = value;
      return next;
    });
  };

  const removeItem = (phaseIdx, secIdx, itemIdx) => {
    setEditState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[phaseIdx].sections[secIdx].items.splice(itemIdx, 1);
      return next;
    });
  };

  const apply = () => {
    onApply(editState);
    setStage("done");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="hangar-modal-backdrop centered"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ animation: "hangarFadeIn 0.2s ease" }}
    >
      <div className="hangar-modal-panel" style={{
        animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
        maxWidth: stage === "review" ? 700 : 520,
      }}>

        {/* ── CAPTURE STAGE ── */}
        {stage === "capture" && (
          <>
            <div className="hangar-modal-header">
              <div>
                <div className="hangar-modal-title">Scan Paper Checklist</div>
                <div className="hangar-modal-sub">PHOTOGRAPH A PRINTED CHECKLIST — CHECKMATE, POH CARD, ETC.</div>
              </div>
              <button className="hangar-close-btn" onClick={onClose}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Close
              </button>
            </div>
            <div className="hangar-modal-body">
              {/* Tips */}
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--bg-inset)", border: "1px solid var(--line)", marginBottom: 20 }}>
                <div style={{ ...mono, fontSize: 9, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.14em", marginBottom: 8 }}>TIPS FOR BEST RESULTS</div>
                {[
                  ["Lay flat", "Place card on a flat surface, don't hold it in the air"],
                  ["Good light", "Bright, even lighting — avoid glare and shadows"],
                  ["Fill the frame", "Get close so the checklist fills most of the photo"],
                  ["Keep steady", "Hold still for a sharp image"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px solid var(--line-faint)" }}>
                    <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: "var(--ok)", minWidth: 80 }}>{title}</span>
                    <span style={{ ...mono, fontSize: 10, color: "var(--t-secondary)" }}>{desc}</span>
                  </div>
                ))}
              </div>

              {/* Camera button */}
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 14, padding: "36px 20px", borderRadius: 10, cursor: "pointer",
                border: "2px dashed var(--accent-line)", background: "var(--bg-inset)",
              }}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImage}
                  style={{ display: "none" }}
                />
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <div style={{ textAlign: "center" }}>
                  <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em" }}>TAKE PHOTO OR CHOOSE IMAGE</div>
                  <div style={{ ...mono, fontSize: 10, color: "var(--t-tertiary)", marginTop: 4 }}>Camera · Photos · Files</div>
                </div>
              </label>

              <div style={{ ...mono, fontSize: 9, color: "var(--t-quiet)", marginTop: 14, textAlign: "center", lineHeight: 1.6 }}>
                Processing happens entirely on your device. Your photos are never uploaded anywhere.
              </div>
            </div>
          </>
        )}

        {/* ── PROCESSING STAGE ── */}
        {stage === "processing" && (
          <>
            <div className="hangar-modal-header">
              <div>
                <div className="hangar-modal-title">Reading Checklist…</div>
                <div className="hangar-modal-sub">OCR RUNNING ON-DEVICE · THIS TAKES 10–30 SECONDS</div>
              </div>
            </div>
            <div className="hangar-modal-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "32px 24px" }}>
              {preview && (
                <img src={preview} alt="Captured checklist"
                  style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 8, border: "1px solid var(--line)", objectFit: "contain" }} />
              )}
              <div style={{ width: "100%", maxWidth: 320 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ ...mono, fontSize: 10, color: "var(--t-secondary)" }}>Recognizing text</span>
                  <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: "var(--accent)" }}>{progress}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--bg-3)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: "var(--accent)", width: `${progress}%`, transition: "width 0.3s ease" }} />
                </div>
              </div>
              <div style={{ ...mono, fontSize: 11, color: "var(--t-tertiary)" }}>
                Analyzing checklist structure…
              </div>
            </div>
          </>
        )}

        {/* ── ERROR STAGE ── */}
        {stage === "error" && (
          <>
            <div className="hangar-modal-header">
              <div>
                <div className="hangar-modal-title">Could Not Read Checklist</div>
                <div className="hangar-modal-sub">OCR FOUND NO PARSEABLE CONTENT</div>
              </div>
              <button className="hangar-close-btn" onClick={onClose}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Close
              </button>
            </div>
            <div className="hangar-modal-body">
              {preview && (
                <img src={preview} alt="Captured" style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8, border: "1px solid var(--warn-line)", objectFit: "contain", marginBottom: 16 }} />
              )}
              <div style={{ padding: "12px 14px", borderRadius: 6, background: "var(--warn-bg)", border: "1px solid var(--warn-line)", ...mono, fontSize: 11, color: "var(--warn)", lineHeight: 1.7, marginBottom: 16 }}>
                ⚠ Could not extract checklist items from this image. The photo may be blurry, too dark, or the checklist uses a non-standard format. Try again with better lighting and a flatter angle.
              </div>
              <button
                onClick={() => { setStage("capture"); setPreview(null); setProgress(0); if (fileRef.current) fileRef.current.value = ""; }}
                style={{ width: "100%", padding: "12px 0", borderRadius: 6, border: "1px solid var(--accent-line)", background: "var(--accent-bg)", cursor: "pointer", ...mono, fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em" }}
              >
                Try Again
              </button>
            </div>
          </>
        )}

        {/* ── REVIEW STAGE ── */}
        {stage === "review" && editState && (
          <>
            <div className="hangar-modal-header">
              <div>
                <div className="hangar-modal-title">Review Extracted Checklist</div>
                <div className="hangar-modal-sub">
                  {editState.reduce((n, p) => n + p.sections.reduce((m, s) => m + s.items.length, 0), 0)} ITEMS ACROSS {editState.length} PHASE{editState.length !== 1 ? "S" : ""} · EDIT BEFORE APPLYING
                </div>
              </div>
              <button className="hangar-close-btn" onClick={onClose}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Close
              </button>
            </div>

            {/* Phase tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--line)", background: "var(--bg-0)", overflowX: "auto", flexShrink: 0 }}>
              {editState.map((p, pi) => (
                <button key={pi} onClick={() => setActivePhase(pi)} style={{
                  padding: "10px 16px", border: "none", borderBottom: `2px solid ${activePhase === pi ? "var(--accent)" : "transparent"}`,
                  background: activePhase === pi ? "var(--accent-bg)" : "transparent",
                  cursor: "pointer", ...mono, fontSize: 9, fontWeight: 700,
                  color: activePhase === pi ? "var(--accent)" : "var(--t-quiet)",
                  letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap",
                }}>
                  {p.phase.label}
                  <span style={{ marginLeft: 6, opacity: 0.6 }}>
                    ({p.sections.reduce((n, s) => n + s.items.length, 0)})
                  </span>
                </button>
              ))}
            </div>

            {/* Items */}
            <div className="hangar-modal-body">
              {editState[activePhase]?.sections.map((sec, si) => (
                <div key={si} style={{ marginBottom: 20 }}>
                  <div style={{ ...mono, fontSize: 9, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.14em", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid var(--accent-line)" }}>
                    {sec.title}
                  </div>
                  {sec.items.map((item, ii) => (
                    <div key={ii} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0", borderBottom: "1px solid var(--line-faint)" }}>
                      <input
                        value={item.l}
                        onChange={e => updateItem(activePhase, si, ii, "l", e.target.value)}
                        style={{ flex: 2, background: "var(--bg-inset)", border: "1px solid var(--line)", borderRadius: 4, padding: "4px 8px", color: "var(--t-primary)", fontFamily: "var(--f-mono)", fontSize: 11 }}
                      />
                      {item.type !== "note" && (
                        <input
                          value={item.a || ""}
                          onChange={e => updateItem(activePhase, si, ii, "a", e.target.value)}
                          placeholder="ACTION"
                          style={{ flex: 1, background: "var(--bg-inset)", border: "1px solid var(--line)", borderRadius: 4, padding: "4px 8px", color: "var(--accent)", fontFamily: "var(--f-mono)", fontSize: 11, fontWeight: 700 }}
                        />
                      )}
                      <button
                        onClick={() => removeItem(activePhase, si, ii)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--warn)", padding: "2px 6px", borderRadius: 4, fontSize: 14, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="hangar-modal-footer">
              <button onClick={() => { setStage("capture"); setPreview(null); setProgress(0); if (fileRef.current) fileRef.current.value = ""; }}
                style={{ flex: 1, padding: "10px 0", borderRadius: 6, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", ...mono, fontSize: 11, color: "var(--t-secondary)" }}>
                Rescan
              </button>
              <button onClick={apply}
                style={{ flex: 2, padding: "10px 0", borderRadius: 6, border: "1px solid var(--ok-line)", background: "var(--ok-bg)", cursor: "pointer", ...mono, fontSize: 11, fontWeight: 700, color: "var(--ok)", letterSpacing: "0.08em" }}>
                ✓ Apply to Checklist
              </button>
            </div>
          </>
        )}

        {/* ── DONE STAGE ── */}
        {stage === "done" && (
          <>
            <div className="hangar-modal-header">
              <div>
                <div className="hangar-modal-title">Checklist Applied</div>
                <div className="hangar-modal-sub">SCANNED ITEMS ARE NOW ACTIVE IN THE KNEEBOARD</div>
              </div>
            </div>
            <div className="hangar-modal-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "32px 24px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--ok-bg)", border: "2px solid var(--ok-line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--ok)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: "var(--ok)", letterSpacing: "0.06em" }}>
                Checklist loaded successfully
              </div>
              <div style={{ ...mono, fontSize: 11, color: "var(--t-secondary)", lineHeight: 1.7 }}>
                Open the kneeboard to use your scanned checklist. You can rescan anytime to update it.
              </div>
              <button onClick={onClose}
                style={{ padding: "12px 32px", borderRadius: 6, border: "1px solid var(--accent-line)", background: "var(--accent-bg)", cursor: "pointer", ...mono, fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em" }}>
                Open Kneeboard
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
