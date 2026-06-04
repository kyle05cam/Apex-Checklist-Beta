# Apex Kneeboard

**Project:** `/Users/bexx/Desktop/Apex-Checklist` — React + Vite aviation EFB companion app.

> This app is designed to work **alongside** ForeFlight, Garmin Pilot, etc. — not to replace them. The primary use case is running side-by-side or in iPadOS Slide Over on top of another EFB.

---

## Tech Stack

- React 18 + Vite
- pdfjs-dist — PDF text extraction for POH parsing
- tesseract.js — On-device OCR for paper checklist scanning
- IndexedDB (via `src/pohDb.js`) — Local profile persistence

---

## Key Files

| File | Purpose |
|---|---|
| `src/apex_kneeboard.jsx` | Root app, Hangar view, Aircraft Edit Modal, Add Aircraft Modal, POH upload section |
| `src/cessna172s_checklist.jsx` | All checklist data, `ChecklistApp` component, `PAGES`/`EMG_PAGES`, `MORE_REFS` reference tables, compact mode logic |
| `src/comm_page.jsx` | Smart Communications page — ATC transcription, clearance capture cards, archive log, nearest freqs |
| `src/pohParser.js` | pdf.js PDF text extractor + section-aware regex parser |
| `src/pohDb.js` | IndexedDB save/load for aircraft profile (localStorage fallback) |
| `src/checklistScanner.jsx` | Tesseract.js paper checklist OCR scanner component |
| `src/styles.css` | All CSS — includes `@media (max-width: 400px)` compact mode block at the bottom |

---

## Aircraft Profile Schema

Key fields stored in IndexedDB under the primary profile:

```js
{
  pohVSpeeds:       null,  // { vso, vs1, vr, vx, vy, va, vfe, vno, vne, vapp }
  pohWeights:       null,  // { maxGross, maxRamp, emptyWeight, usefulLoad, maxBaggage, cgFwd, cgAft }
  pohFuel:          null,  // { totalGal, usableGal, type, oilType, oilCapMax, oilCapMin }
  pohEngine:        null,  // { model, horsepower, cylinders, displacement, tbo, maxRpm, oilPressMin, oilPressMax, oilTempMax, chtMax }
  pohLimits:        null,  // { maxCrosswind }
  pohTakeoff:       null,  // { gndRoll: [[alt,ft]…], over50ft: [[alt,ft]…] }
  pohLanding:       null,  // { gndRoll: [[alt,ft]…], over50ft: [[alt,ft]…] }
  pohMaxXwind:      null,  // number — max demonstrated crosswind kt
  scannedChecklist: null,  // [{ phase: {id, label}, sections: [{title, items}] }]
}
```

---

## What Was Recently Completed — iPad Slide Over / Compact Mode

The entire `@media (max-width: 400px)` compact layout was built and refined. This is the primary view when running as an iPadOS Slide Over panel on top of ForeFlight or Garmin Pilot.

### Compact Layout Structure

- **Grid:** `48px 1fr` (narrow left rail + full-width main). No right rail.
- **Row 1:** ATC strip (resizable 25–60vh via drag handle `•••`)
- **Row 2:** Left rail + checklist main content
- **Row 3:** Status bar

### ATC Strip (top zone)
- Takes upper 35% of screen by default; drag handle at bottom lets pilot resize between 25–60vh
- Idle state: centered antenna icon + LISTEN button
- Live state: large transcript text, tiny timestamp, type badge hidden when "general", history rows wrap full text
- NRST widget hidden in compact (not enough room)
- Topbar (HANGAR, timer, tail number, clocks, POH, NOTES) hidden entirely in compact

### Left Rail (48px wide, icon-only)
- Phase icons: preflight → startup → taxi → takeoff → cruise → approach/ldg → shutdown
- Icons 24px, items 68px tall minimum — easy to tap in turbulence
- **Scrollable inner wrapper** (`.efb-rail-pages`) — phase icons scroll independently
- **EMG/STD button pinned at bottom** — ALWAYS visible, never scrolls away
  - Red "EMG" label → taps to show emergency procedure icons in rail
  - Green "STD" label when in EMG mode → taps to return to normal phases
  - Rail stays on emergency pages when navigating between emergency checklists (fixed bug)

### Emergency Procedure Order (left rail in EMG mode)
1. 🔴 FIRES
2. 🟡 ENGINE FAIL
3. 🔵 ELEC FAIL (moved up from bottom — more likely than spin/icing)
4. 🩵 SPIN RECOV
5. ❄️ ICING

Electrical failure changed from yellow `#f0d060` → blue `#60a5f5` to distinguish from amber engine fail.

### Checklist Display
- Page header block (PRE FLIGHT / CESSNA 172S SKYHAWK title) hidden in compact
- Section headers: 15px bold title, wraps fully — no truncation, no count badges, no progress bar, no READ/EDIT buttons
- **Checklist row layout:** CSS grid `28px 1fr minmax(0, 45%)` inside `.efb-check-content`
  - Label: left column (`1fr`), white, 15px/500 weight, wraps within itself if long
  - Value: right column (up to 45%), **amber `var(--caution)`**, 13px/700 weight, wraps within itself
  - Both columns always stay in their lane — no bleed-off-screen
- Scroll-to-top on every page change (`mainScrollRef.current.scrollTop = 0`)

### Smart Coms Page (comm page in compact)
- Left rail hidden entirely — full-width comm page
- Smart Communication AI hero block (waveform + header) hidden
- **Two-pane resizable split:**
  - Upper pane: tabs (Active Feed / Archive Log / Nearest Freqs) + live transmission feed
  - Drag handle `•••` between panes — user slides to give more/less space to each
  - Lower pane: Replay Last 10 Seconds button + ATIS / Taxi Instructions / Ground Clearance / IFR capture cards
- "Tap ARM to capture" sub-text hidden on clearance card headers
- **← BACK TO CHECKLIST** button pinned at bottom
- "GENERAL" type badge suppressed everywhere (both compact and full) — only meaningful labels (TOWER, GROUND, APPROACH, etc.) shown
- Replay Last 10 Seconds button moved above ATIS card (was at bottom of page)

### Global Changes (apply to both compact and full size)
- **Dot leaders removed** — replaced with amber color differentiation for action values
- **Checklist item layout** — `.efb-check-content` grid wrapper added in JSX around label+value in every checklist row
- **"GENERAL" type** filtered from ATC live header and archive log in `cessna172s_checklist.jsx` and `comm_page.jsx`
- **`fmtType()` in `comm_page.jsx`** — returns `null` for "general" type; archive log conditionally renders type badge

---

## Next Feature To Build — ATC Transcription Accuracy

The ATC speech-to-text engine uses the browser's `SpeechRecognition` API with a custom correction pass (`src/cessna172s_checklist.jsx` around line 1835). The goal is to maximize accuracy for aviation-specific phraseology.

### What exists today
- **ATC correction pass** (`applyAtcCorrections`) — runs on every raw transcript before parsing. Fixes common speech engine errors (homophones, phonetic alphabet, numbers, frequencies, etc.)
- **Comm worker** — ring-buffer audio capture, RMS level monitoring, watchdog for missed calls
- **Watchdog** — detects when ATC calls the aircraft callsign and triggers an acknowledgment prompt

### What needs improvement
- The browser speech engine has zero aviation context. It mishears:
  - Frequencies: "one two four point niner" → needs to become "124.9"
  - Runway numbers: "runway two seven" → "runway 27"
  - Altitudes: "climb and maintain six thousand" → "climb and maintain 6,000"
  - Squawk codes: "squawk four five three two" → "squawk 4532"
  - Phonetic alphabet: "november" → "N", "kilo" → "K" (in callsign context only)
  - ATC facility names: "socal approach", "norcal departure", "LA center"
  - Common homophones: "to/two/too", "for/four", "won/one", "ate/eight"
  - Clearance phrases: "cleared ILS runway", "turn left heading", "descend via the"

### Key files for this work
- **`src/cessna172s_checklist.jsx` lines ~1835–1960** — `applyAtcCorrections()` function — add regex replacements here
- **`src/cessna172s_checklist.jsx` lines ~2255–2261** — `classifyTransmission()` — improves type detection (TOWER, GROUND, etc.)
- The SpeechRecognition is initialized around line 2800 — `continuous: true`, `interimResults: true`, `lang: "en-US"` — consider if custom vocabulary hints are possible

### Approach
The correction pass already exists and works. The next step is:
1. Audit real-world ATC audio and identify the most common misrecognitions
2. Add targeted regex replacements to `applyAtcCorrections()`
3. Improve `classifyTransmission()` to catch more TOWER/GROUND/APPROACH patterns
4. Consider adding a custom word list or grammar hints if the browser API supports it

---

## Pending Function Tests

- POH PDF upload and parsing (needs a real digital POH PDF)
- Checklist scanner (needs a Checkmate card photo)
- ATC transcription accuracy (needs real flight audio)
