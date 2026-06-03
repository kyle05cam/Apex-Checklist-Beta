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
| `src/cessna172s_checklist.jsx` | All checklist data, `ChecklistApp` component, `PAGES`/`EMG_PAGES`, `MORE_REFS` reference tables |
| `src/pohParser.js` | pdf.js PDF text extractor + section-aware regex parser |
| `src/pohDb.js` | IndexedDB save/load for aircraft profile (localStorage fallback) |
| `src/checklistScanner.jsx` | Tesseract.js paper checklist OCR scanner component |
| `src/styles.css` | All CSS — includes `.hangar-modal-backdrop.centered` for centered dialogs |

---

## Aircraft Profile Schema

Key fields stored in IndexedDB under the primary profile:

```js
{
  // POH extracted data
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

When `scannedChecklist` is populated, `ChecklistApp` uses those pages instead of the built-in C172S default pages. When POH fields are populated, all "Aircraft" reference sections (Engine Specs, Weight & CG, Fuel & Oil, Operating Limits) display the uploaded values.

---

## What Was Recently Completed

- **POH PDF parser** — `src/pohParser.js` uses pdf.js for proper text extraction (replaces old raw-byte scanner). Section-aware, extracts V-speeds, weights, fuel, engine specs, takeoff/landing performance tables. Stored in IndexedDB.
- **Generic aircraft labels** — All hardcoded "C172S" section titles renamed to "Aircraft Engine Specifications", "Aircraft Fuel & Oil Quick Ref", "Aircraft Weight & CG Limits", "Aircraft Operating Limits", "Aircraft Tire Pressures", "Aircraft Electrical System".
- **Dynamic reference sections** — Weight/CG, Fuel/Oil, Engine Specs, Operating Limits tables in the More tab now populate from uploaded POH data, with "— (Manual Entry)" shown for missing fields.
- **Density altitude banner** — Now uses uploaded POH takeoff/landing distance tables when available; falls back to built-in defaults.
- **Add Aircraft modal** — Fixed from bottom sheet to centered dialog using `.hangar-modal-backdrop.centered` CSS class.
- **Checklist scanner** — `src/checklistScanner.jsx` uses Tesseract.js OCR. Reads photos of Checkmate cards and printed POH checklists. Parses two-column item/action format, maps section headers to checklist tabs (BEFORE TAKEOFF → takeoff tab, etc.), shows editable review screen before applying.
- **Bug fixes:**
  - `ttsQueueRef` typo corrected in `startTTS` (was `t_queueRef`)
  - Wind string parser in `handleSetAtisData` rewritten — now handles `270° AT 15KT`, `27015KT`, `15 @ 270`, `270/15`, CALM, `00000KT`, and preserves existing values when no format matches instead of silently dropping them

---

## Next Feature To Build — iPad Slide Over / Compact Mode

### What the user wants

The app should work in **iPadOS Slide Over** on top of ForeFlight or Garmin Pilot. In Slide Over, the app renders at approximately **320px wide**. The current layout breaks at this width because it uses fixed-width sidebars.

### How iPadOS Slide Over works

No OS-level code is needed. The user puts ForeFlight in full screen, swipes in from the right edge, and this app appears as a floating panel. iPadOS handles all of that. Our job is purely **CSS/layout** — make the app usable at ≤400px width.

### What the compact layout should do

When the viewport width is **≤400px**:

- **Hide both rails** — `.efb-rail-l` and `.efb-rail-r` disappear entirely
- **Full-width checklist** — the main content column takes 100% width
- **No sidebars, no POH tab, no More tab** — just the active checklist phase
- **Large tap targets** — checklist items need bigger touch areas for one-thumb use
- **Phase switcher at the bottom** — a minimal horizontal strip showing phase icons, user taps to switch phases (replaces the left rail nav)
- **Header stays** — the topbar with aircraft name and time stays visible

### Files to touch

1. **`src/styles.css`** — Add `@media (max-width: 400px)` block:
   - `.efb-app` grid changes from 3 columns to 1 column
   - `.efb-rail-l`, `.efb-rail-r` → `display: none`
   - `.efb-main` → `grid-column: 1`, full width
   - Checklist item rows → taller padding, larger font
   - Add `.efb-compact-nav` styles for the bottom phase switcher strip

2. **`src/cessna172s_checklist.jsx`** — Inside `ChecklistApp`:
   - Detect compact mode: `const isCompact = window.innerWidth <= 400` (or use a `useWindowSize` hook / `ResizeObserver`)
   - Conditionally render a bottom `<nav className="efb-compact-nav">` with phase icons instead of the left rail
   - Hide the right rail content (POH drawer, More refs) in compact mode
   - Increase checklist item touch target size conditionally

### Important note on the left rail

The left rail (`.efb-rail-l`) contains the phase navigation icons — preflight, startup, taxi, takeoff, approach, shutdown, and the emergency pages. In compact mode this nav needs to move to a **bottom strip** so it's thumb-reachable, since the left edge is not accessible in Slide Over.

---

## Pending Function Tests

The user has not yet tested these with real data:
- POH PDF upload and parsing (needs a real digital POH PDF)
- Checklist scanner (needs a Checkmate card photo)
