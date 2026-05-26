# Handoff: Pilot EFB Redesign

A complete visual + interaction redesign of an electronic flight bag (EFB) app for general aviation pilots. Replaces a cyberpunk/neon aesthetic with a refined, professional palette inspired by ForeFlight and Garmin Pilot — restrained color, purposeful semantic accents, clearer hierarchy.

## ⚠️ About the Design Files

The files in this bundle are **design references created as an HTML prototype** — they show the intended look, behavior, and interactions but are **NOT meant to be shipped as-is**.

Your job is to **recreate these designs in the target codebase's existing environment** (React, React Native, SwiftUI, Vue, etc.) using the patterns, component library, and conventions that are already established there. Use the HTML as a pixel-perfect visual reference — match the colors, spacing, typography, and behavior — but write the actual code in whatever stack the app uses.

If no environment exists yet, React or React Native are good choices (the prototype is built in React and the patterns will translate cleanly).

## Fidelity

**High-fidelity.** All colors, type scales, spacing, animations, and interactions are final. Recreate pixel-perfectly using the codebase's existing component primitives.

---

## App Overview

The app has six main areas:

1. **Top Bar** — global controls (back to hangar, flight timer, tail no., clocks, POH, Notes, Day/Night)
2. **Live Radio Panel** — full-width ATC transcription bar (current + last 3 transmissions)
3. **Left Nav Rail (Phase)** — pre-flight, start up, taxi, takeoff, cruise, app/lndg, shutdown + MORE
4. **Main Content** — checklist for the active phase
5. **Right Nav Rail (EMG)** — emergencies: fires, engine fail, spin recov, icing, elec fail + SMART COMS
6. **Status Bar** — system telemetry (GPS, ADS-B, sync, rev)

Three modal overlays accessible globally:
- **POH Quick Ref** (top bar) — V-speeds, T/O & Landing, Climb, Cruise performance
- **Quick Reference** (MORE bottom-left) — 13 reference tables (light gun signals, transponder codes, weather mins, airspace, NATO phonetic, C172S specs, etc.)
- **Scratchpad** (NOTES top bar) — drawing + typing notepad

---

## Design Tokens

### Color Palette — Night Mode (default)

| Token | Value | Use |
|---|---|---|
| `--bg-0` | `#0A0E14` | App background |
| `--bg-1` | `#0F141C` | Panel |
| `--bg-2` | `#151B25` | Elevated panel / table header |
| `--bg-3` | `#1C2330` | Row hover, input |
| `--bg-inset` | `#070A0F` | Deepest — inputs, canvas |
| `--line` | `#1F2733` | Default divider |
| `--line-strong` | `#2A3441` | Emphasized divider |
| `--line-faint` | `#161C26` | Row dividers in lists |
| `--t-primary` | `#E6ECF2` | Primary text |
| `--t-secondary` | `#9AA5B4` | Secondary text |
| `--t-tertiary` | `#6B7686` | Tertiary text / labels |
| `--t-quiet` | `#4A5462` | Disabled / quiet |

### Color Palette — Day Mode (light)

| Token | Value |
|---|---|
| `--bg-0` | `#F4F6FA` |
| `--bg-1` | `#FAFBFD` |
| `--bg-2` | `#EEF1F6` |
| `--bg-3` | `#E4EAF2` |
| `--bg-inset` | `#FFFFFF` |
| `--line` | `#D7DEE8` |
| `--line-strong` | `#BFC8D6` |
| `--line-faint` | `#E8EDF4` |
| `--t-primary` | `#0F172A` |
| `--t-secondary` | `#475569` |
| `--t-tertiary` | `#64748B` |
| `--t-quiet` | `#94A3B8` |

### Semantic Colors

| Token | Night | Day | Use |
|---|---|---|---|
| `--accent` | `#4DA3FF` | `#2563EB` | Primary accent, section titles, info |
| `--ok` | `#4ADE80` | `#16A34A` | Completed, armed, "go" |
| `--caution` | `#F5B544` | `#D97706` | Caution / amber advisory |
| `--warn` | `#FF6B6B` | `#DC2626` | Warning / emergency / critical |

### Emergency Tab Colors (Right Rail)

Each emergency has its own fixed color used for its rail icon, page title, section accents, progress bars, and warning banners:

| Emergency | Color |
|---|---|
| Fires | `#FF6B6B` (red) |
| Engine Fail | `#F5B544` (amber) |
| Spin Recov | `#5DD4C4` (teal) |
| Icing | `#6BB6FF` (sky blue) |
| Elec Fail | `#FFD166` (yellow) |

### Typography

- **UI font**: `Inter` (weights 400, 450, 500, 600, 700)
- **Mono font** (numerics, identifiers, timestamps, frequencies): `JetBrains Mono` (weights 400, 500, 600)
- Mono numerics use `font-feature-settings: "tnum", "lnum", "ss01"` for tabular figures
- Default body: `14px / 1.4 / -0.005em letter-spacing`
- Page titles: `18px / 600 / uppercase / 0.04em`
- Section titles (normal phase): `16px / 600 / uppercase / 0.04em`
- Section titles (emergency): `18px / 700 / uppercase / 0.02em` (LARGER for crisis scan-ability)
- Mono labels (eyebrows): `9–11px / 0.08–0.14em / uppercase`
- V-Speed values: `36px / 600`
- Live radio current transmission: `20px / 500 / 1.4 line-height`

### Spacing Scale (4px base)

`--s-1: 4px` · `--s-2: 8px` · `--s-3: 12px` · `--s-4: 16px` · `--s-5: 20px` · `--s-6: 24px` · `--s-8: 32px` · `--s-10: 40px` · `--s-12: 48px`

### Radii

`--r-sm: 4px` · `--r-md: 6px` · `--r-lg: 10px`

### Layout

| Token | Value |
|---|---|
| `--rail-l`, `--rail-r` | `92px` |
| `--topbar` | `64px` |
| `--statusbar` | `32px` |

---

## App Layout

The root uses CSS Grid:

```
grid-template-columns: 92px 1fr 92px;
grid-template-rows: 64px auto 1fr 32px;
```

- **Row 1**: Top bar (spans all 3 columns)
- **Row 2**: Live Radio Panel (spans all 3 columns, full-width)
- **Row 3**: Left rail / Main content / Right rail
- **Row 4**: Status bar (spans all 3 columns)

The Live Radio Panel spans full-width by design — it's the most safety-critical persistent element and needs the full screen for transcription readability.

---

## Screens

### 1. Top Bar (`TopBar`)

Three zones — `auto 1fr auto` grid:

**Left:**
- HANGAR back button (ghost, 14px icon "back", uppercase label, 0.1em letter-spacing)

**Center (separated by vertical lines):**
- Flight Timer pill: "FLT TIMER" mono label + HH:MM:SS value (mono, 14px) + START/STOP button (green when running, red when stopping) + reset icon button
- Tail block: 22×22 gradient brand-mark (accent → accent-dim, with brand glow), tail no. (mono 16px, 0.06em) + aircraft type (mono 11px, tertiary, uppercase)
- Clocks block: LOCAL (mono, primary text) + ZULU (mono, accent color, with "Z" suffix)

**Right:**
- POH ghost button (note icon, 14px)
- NOTES ghost button (edit icon, 14px) — opens Scratchpad
- Day/Night toggle: sun/moon icon + 36×20 track with 16px circular thumb + label ("Day" / "Night")

### 2. Left Nav Rail (`LeftRail`)

92px wide. Each item is a button stacked vertically with:
- 20–22px icon (centered)
- 9px mono uppercase label (max 2 lines)
- Mono completion count (e.g. "0/24") in tertiary text — turns ok-green when phase is complete
- Active state: gradient `accent-bg → transparent` from left, 2px left accent border, white text

Phase items (icons updated to be domain-specific — see Icon Catalog below):
- **Pre Flight** — clipboard with checkmark (`preflight`)
- **Start Up** — ignition key (`startup`)
- **Taxi** — top-down plane on dashed taxiway (`taxi`)
- **T/O** — plane climbing off runway (`takeoff`)
- **Cruise** — side-view aircraft in level flight (`cruise`)
- **App / Lndg** — plane descending to runway (`landing`)
- **Shutdown** — IEC power symbol (`power`)

Bottom button (separated by `border-top: 1px solid var(--line)`):
- **MORE** — opens Quick Reference overlay (22px icon)

A "PHASE" mono label (8px, 0.14em) sits at the top.

### 3. Right Nav Rail (`RightRail`)

Same 92px width. **Emergency variant** styling:
- Larger 36×36 colored icon tiles (`color-mix(emg 8%) bg, emg 22% border, emg color`)
- Icon size 28px
- Hover: tile background → 16%, lifts -1px, glows with emg-color shadow
- Active state: background uses emergency's color (not generic red), 2px right border in emergency color, label + count both colored

Items:
- **Fires** (`#FF6B6B` red, `fire` icon)
- **Engine Fail** (`#F5B544` amber, `engine` icon)
- **Spin Recov** (`#5DD4C4` teal, `spin` icon)
- **Icing** (`#6BB6FF` sky-blue, `snow` icon)
- **Elec Fail** (`#FFD166` yellow, `bolt` icon)

Top label: "EMG" in warn red.

Bottom button:
- **SMART COMS** — opens the AI Smart Communications screen (22px mic icon)

### 4. Live Radio Panel (`RadioBar`)

Spans full window width. Two states:

**Standby (idle):**
- Header strip (`bg-2` background) with: status dot (gray) + antenna icon + "Live Radio" mono label + "Standby · Tap Listen to begin monitoring" + Smart Coms ghost button + LISTEN primary button (accent)
- Body shows a dashed-border placeholder card: antenna icon + "No active transmission" title + "Live ATC transcription will appear here · last 3 transmissions retained" sub

**Live (listening):**
- Header strip: green pulsing dot + antenna + "Live Radio" + "121.500 MHz" freq pill + STOP warn button
- Panel background: subtle green tint via `linear-gradient(180deg, bg-1, color-mix(ok 4%, bg-1))` + inset top border in ok-color
- **Current transmission hero** (`bg-1 + 5% ok mix` background, 4px left ok-color border):
  - Meta row: time (e.g. "16:48Z"), source badge ("TOWER" in ok-bg pill, 0.14em), frequency (accent mono), confidence ("conf 96%" tertiary), right-aligned pulsing live dot + "LIVE" label
  - Text: 20px, weight 500, line-height 1.4, primary color, wrapped in quotes
- **History list** (last 3 prior transmissions):
  - Grid: `70px 90px 80px 1fr 28px` for time / source / freq / text / replay
  - Each row has subtle `bg-2` hover
  - Time/freq are mono tertiary, source is accent mono uppercase 0.12em, text truncates with ellipsis
  - Replay button: 24×24 with play icon, accent on hover

Hide entirely when on Smart Coms screen (the Smart Coms screen has its own bigger radio interface).

### 5. Status Bar (`StatusBar`)

32px tall, mono 11px tertiary text, 0.04em letter-spacing:
- GPS · 8 SV (with ok dot)
- ADS-B IN (with accent dot)
- SYNC · Cloud (with ok dot)
- Spacer
- "{done}/{total} CHECKLIST ITEMS · {SCREEN}" right-aligned
- "REV 2026-05"

### 6. Checklist Screen (`PreFlightScreen` and `GenericChecklistScreen`)

Standard page layout: `content-inner` (max-width 1280px, centered, padding `20px 24px`):

**Page header:**
- Title (18px / 600 / uppercase / 0.04em)
- Subtitle (mono 11px / tertiary / 0.08em / uppercase)
- Right side: chip ("IN PROGRESS · 0/30") + reset icon button. Chip uses `chip-progress` (caution-bg/line/text) until complete, then `chip-done` (ok variant). Emergency screens use `chip-warn` tinted to the emergency color.

**Checklist section** (`ChecklistSection`):
- `bg-1` panel, 1px line border, 10px radius
- Header (`bg-2` background, 16px padding):
  - 2–4px left accent bar (accent color for normal phases, emergency color for emergencies)
  - Section name (16px / 600 / uppercase / accent color; 18px / 700 for emergency)
  - Done/Total count (mono 12px tertiary)
  - **Per-section progress bar** (flex, max 280px): 4px-tall track + percentage label (mono 10px). Bar fills accent (normal) or emergency-color (warn) or ok-green (when complete)
  - READ green button + EDIT default button (sm size)
- Optional warning row (`warn-bg → transparent` gradient + warn-line bottom border, italic warn text with alert icon)
- Optional note row (`caution-bg` background, italic caution text, prefixed with "★")
- Check rows:
  - `32px 1fr auto` grid: checkbox, label, value
  - Min height 48px (52px for emergencies)
  - 18×18 checkbox: line-strong border, bg-inset background. On check: fills ok-green with white checkmark
  - Label: 14px / 450 weight (15px / 500 for emergency)
  - Value: mono 12px / 500 / uppercase / 0.06em / secondary (13px / 600 for emergency)
  - Critical values use warn color
  - Hover: bg-2
  - Checked: ok-tinted bg, label strikes through and dims, value goes ok-green
- When section fully done: name + left bar + percentage all turn ok-green

### 7. Live Radio panel hides on Smart Coms screen

### 8. Smart Coms (`SmartComsScreen`)

- **Radio Hero card** (`bg-1`, 1px line, 10px radius, 24px padding):
  - Header: 36px accent-bg icon tile (radar icon) + "Smart Communication AI" title (16px / 600) + "Callsign: N12345 · Standby/Listening" mono sub. Right side: Demo Capture button + STOP/LISTEN button
  - Waveform: 60px tall bg-inset rectangle, ~64 bars animated when live (random heights bouncing 4–48px, opacity tied to height). Idle: all bars 3px, opacity 0.2, quiet color
  - Status caption: "TAP LISTEN TO BEGIN MONITORING" / "TRANSCRIBING · 121.500 MHz · conf 96%"
- **Tabs** (border-bottom line, accent active): Active Feed (3) · Archive Log (12) · Nearest Freqs (6)
- **Active Feed** = three "clearance cards":
  - **ATIS** — fields: Information, Wind, Altimeter, Visibility, Sky, Caution
  - **Taxi Instructions** — fields: Runway, Taxi Via, Hold Short (critical!), Instructions
  - **Ground Clearance** — fields: Cleared To, Route, Altitude, Departure, Squawk
  - Each card has ARM/CLR buttons. ARM toggles ok state (border-ok-line). CLR clears values.
  - Each row: 90px label + flex input + 32px copy button
  - Hold Short fields show a sticky warn-tinted "HOLD SHORT" banner above the input
  - Filled inputs get accent border + subtle accent bg tint
  - Critical-filled inputs use warn coloring
- **Archive Log** — list of past transmissions with time / source / text / replay duration
- **Nearest Freqs** — 2-col grid of frequency cards (name + airport+distance / large accent mono freq)
- Sticky "Replay Last 10 Seconds" button at bottom

### 9. POH Quick Reference Overlay (`POHOverlay`)

Triggered by POH button in top bar.

- Backdrop: `rgba(5,8,12,0.7)` + 6px blur, fade-in
- Panel: 960px max-width, 88vh max-height, `bg-1` + line-strong border + 10px radius + heavy shadow
- Animations: backdrop fades 160ms, panel slides up 8px + fades 180ms
- Header (`bg-2`, 16/20 padding):
  - "Quick Reference" mono eyebrow in accent color
  - "N12345 · Cessna 172S Skyhawk" mono primary
  - ESC button (ghost) on right with "✕"
- Tabs (in `bg-2`, border-bottom): V-Speeds / T/O & Lndg / Climb Perf / Cruise Perf — each with colored dot
  - Active tab: primary text + bottom border in its accent color
- Body (auto-scroll, 20px padding):
  - **V-Speeds tab**: 3 groups (Takeoff & Climb / Approach & Landing / Structural Limits), each is a 3-col grid of cards
  - **T/O & Lndg tab**: 2 performance tables (Normal Flaps 0° and Short Field Flaps 10°)
  - **Climb / Cruise**: placeholders ("Tap EDIT to load…")

V-Speed Card:
- 16px padding, `bg-2` bg, line border, 6px radius
- Top row: code (mono 11px / 600 / accent / 0.08em) + unit (mono 9px / tertiary)
- Big value (36px / 600 / -0.02em letter-spacing / primary, tabular figures)
- Name (11px tertiary)
- Tone variants: `caution` (code in caution color) and `danger` (code in warn color)

Perf Table:
- Block title (12px / 600 / uppercase / 0.06em primary)
- Sub (mono 10px tertiary)
- Table: mono 10px uppercase headers in tertiary, mono 13px secondary cells, first column primary 500 weight. Row hover lifts to primary text + bg-2 background

### 10. Quick Reference Overlay (`QuickRefOverlay`)

Triggered by MORE in bottom-left rail.

- Backdrop: `rgba(5,8,12,0.78)` + 8px blur
- Panel: 1240px × 820px (or 92vh max), shares style with POH overlay
- Header: same pattern as POH (eyebrow + aircraft + ESC)
- Body: `280px sidebar | 1fr content` grid
- **Sidebar**:
  - Sticky search input at top (bg-inset, line border, 6px radius). Focus = accent border
  - Groups (e.g. "Communications", "Regulations", "Airport", "Aircraft · C172S"):
    - Group label (mono 9px / 0.14em / quiet / uppercase)
    - Nav items: 13px secondary text, full-width, left-padding, hover bg-2 + primary text, active has accent-bg + accent text + 2px left accent border + 500 weight
  - Empty state when search matches none: mono 11px tertiary centered
- **Content**:
  - Header: 22px / 600 / uppercase title + mono 11px sub citation. Right pill ("Communications" etc.) in mono 10px / 0.1em / uppercase, pill-shaped border
  - Table: separated rows with rounded outer border. Headers mono 10px / 0.14em / uppercase tertiary in bg-2. Cells 13px secondary, first col mono / 600 / primary
  - Tone rows: `qr-row-warn` (warn-tinted bg + warn key text), `qr-row-caution`, `qr-row-ok`
- **Special**: Light Gun Signals table uses a `SignalLight` component in column 1 — a 20×20 recessed bezel with a 14px colored core that animates:
  - `steady-green` / `steady-red`: solid lit dot with glow
  - `flashing-*`: 1.8s on/off blink with synced glow
  - `alternating-rg`: single dot swapping red↔green every 1.3s (2.6s cycle)

### 11. Scratchpad Overlay (`ScratchpadOverlay`)

Triggered by NOTES in top bar.

- Panel: 1400 × 900 (94vh max), z-index 70
- Header: 3-column: eyebrow+aircraft / centered mode tabs / ESC button
- Mode tabs are a segmented control inside bg-inset + line border + 6px radius:
  - DRAW (edit icon) and TYPE (note icon)
  - Active tab: accent-bg + accent text + inset 1px accent-line border
- **DRAW mode**:
  - Toolbar (`bg-2`, 12/20 padding):
    - PEN/ERASE tool buttons (active = accent-bg variant)
    - Vertical 1px divider
    - 4 brush sizes (1, 2, 4, 7 — rendered as a 30×30 button with a centered colored dot of size×2 px)
    - Vertical divider
    - 7 color swatches (28×28, 4px radius, 2px line border, hover scales 1.1, active gets 2px ring with `currentColor`):
      - `#E6ECF2` white, `#4ADE80` green, `#4DA3FF` blue, `#F5B544` yellow, `#FF6B6B` red, `#A66BFF` purple, `#FF9F5C` orange
    - Spacer
    - CLEAR warn button
  - Canvas surface: full-bleed, faint 40px grid (subtle accent-tinted lines for blueprint feel). Cursor: crosshair. Eraser uses `globalCompositeOperation: "destination-out"`.
- **TYPE mode**:
  - Full-bleed textarea with monospace font (14px / 1.7 line-height / 0.01em letter-spacing)
  - Subtle horizontal rule lines via repeating-linear-gradient (every 23.8px to match line-height)
  - Padding: 24/32px
- **Status bar** (bottom): live tool + size + color OR char + word count. Mono 10px / 0.1em / uppercase / tertiary.
- ESC closes

---

## Icon Catalog (Custom SVG)

All icons are inline SVG in `icons.jsx`, 24×24 viewBox, currentColor stroke, customizable size and stroke-width. Domain-specific icons:

| Name | Description |
|---|---|
| `preflight` | Clipboard with checkmark in center |
| `startup` | Ignition key (circle head + shaft + 2 teeth) |
| `taxi` | Top-down aircraft on dashed curved taxiway |
| `takeoff` | Plane angled up, climbing off runway line |
| `cruise` | Side-view aircraft in level flight (fuselage + wing + tail + cockpit dot) |
| `landing` | Plane descending to runway (vertical mirror of takeoff) |
| `power` | Classic IEC power symbol (open ring + vertical line) |
| `fire` | Flame |
| `engine` | Engine block with mounting points |
| `spin` | Dashed circle + crosshair + center dot |
| `snow` | 8-point snowflake |
| `bolt` | Lightning bolt |
| `antenna` | Tower with signal arcs |
| `radar` | Concentric circles + sweep line |
| `mic`, `mic-off`, `play`, `reset`, `edit`, `note`, `check`, `alert`, `more`, `copy`, `back`, `moon`, `sun`, `tower`, `up`, `down` | Standard utility icons |

---

## Interactions & Behavior

### State (top-level)
- `night: boolean` — controls day/night theme via `[data-mode]` on `<html>`
- `active: string` — current screen id (e.g. `"preflight"`, `"fires"`)
- `live: boolean` — radio listening state
- `timer: { running, seconds }` — flight timer (1Hz interval when running)
- `checked: { [itemId]: boolean }` — per-item checklist state
- `pohOpen`, `qrOpen`, `spOpen: boolean` — overlay visibility

### Navigation
- Clicking a left or right rail item sets `active` to its id
- Clicking MORE opens Quick Ref overlay
- Clicking POH opens POH overlay
- Clicking NOTES opens Scratchpad overlay
- Clicking SMART COMS sets `active = "smartcoms"`
- Clicking HANGAR resets `active = "preflight"`
- All overlays close on ESC and backdrop click

### Flight Timer
- Starts/stops on button. Reset zeroes. Counts in seconds, formats as HH:MM:SS.

### Clocks
- Reads `new Date()` every 1s. Local in `HH:MM:SS`. Zulu in `HHMM` + `Z` suffix.

### Live Radio
- LISTEN toggles `live`. When `live === true`:
  - Header dot pulses ok-green (1.6s cycle)
  - Current transmission block becomes visible (with quoted demo text — to be replaced with real ASR)
  - History list shows 3 prior transmissions
  - In the standalone Smart Coms screen: waveform animates (random heights, 80ms tick)
- LISTEN button becomes STOP (warn-styled)

### Checklist
- Clicking a row toggles `checked[item.id]`
- Section header computes done/total live
- When all items in a section are checked: section name, left bar, percentage, and progress fill all turn ok-green
- Page header chip flips to "READY" (chip-done) when all sections complete

### POH Overlay
- 4 internal tabs (V-Speeds default). Each has a colored bottom border when active.
- Body re-renders the matching content
- Animated entry: backdrop fades 160ms, panel slides up + fades 180ms

### Quick Ref Overlay
- Search filters sidebar items by name (case-insensitive substring)
- Picking a sidebar item updates the right content table
- Light gun signal indicators animate per their kind (CSS keyframes — no JS):
  - `sig-flash` — 1.8s steps(2) blink + glow sync
  - `sig-alt` — 2.6s steps(2) red↔green swap

### Scratchpad
- DRAW: HTML5 canvas. Auto-sizes to container (with DPR scaling). Stroke uses `lineCap: round`, `lineJoin: round`, `lineWidth: size*2`. Eraser uses `globalCompositeOperation: "destination-out"`.
- TYPE: controlled textarea. Char and word count update live.
- Status bar updates with active tool/size/color in DRAW or char/word count in TYPE.

### Day / Night
- Toggle in top right. Sets `[data-mode="day" | "night"]` on `<html>`. All tokens swap via CSS variables. No JS theming logic needed beyond the attribute.

---

## Animations

| Element | Animation |
|---|---|
| Live-radio dot pulse | `0 → 5px box-shadow → 0` over 1.6s infinite |
| Overlay fade-in | `opacity 0→1` 160ms |
| Overlay panel slide-up | `translateY(8px) + opacity 0 → 0 + 1` 180ms |
| Section progress bar | `width 0.3s ease` |
| Hover states | `all 0.12s ease` generally |
| Radio waveform | 80ms tick interval (smooth sine-wave-ish + random noise) |
| Light gun flashing | `1.8s steps(2, end) infinite` |
| Light gun alternating | `2.6s steps(2, end) infinite` |
| Emergency rail icon hover | `translateY(-1px) + emg-color shadow` |

---

## Files in this Bundle

### Root
- `Pilot EFB.html` — entry HTML. Loads React 18.3.1, ReactDOM, Babel Standalone, Google Fonts (Inter, JetBrains Mono, and font alternatives), then all source scripts in order.

### `source/`
- `styles.css` — all design tokens, base styles, layout grid, every component's styles. Single source of truth for visual design.
- `data.js` — aircraft metadata, checklist items, V-speeds, performance tables, clearance form schema, nav menu definitions.
- `icons.jsx` — Icon catalog component (single `<Icon name={...} size={...} />`).
- `shell.jsx` — TopBar, LeftRail, RightRail, RadioBar, StatusBar, and clock/timer helpers.
- `screens.jsx` — PreFlightScreen, FiresScreen, SmartComsScreen, ChecklistSection, POHOverlay, and supporting widgets (Waveform, ArchiveLog, NearestFreqs, V-Speeds grid, PerfTable, CheckRow).
- `screens-extra.jsx` — GenericChecklistScreen + PHASE_DATA / EMG_DATA for all other phases and emergencies.
- `quickref.jsx` — QUICK_REF data + QuickRefOverlay + SignalLight indicator.
- `scratchpad.jsx` — ScratchpadOverlay with draw + type modes.
- `app.jsx` — Root PilotApp component. Wires state, theme application, tweaks panel, and renders everything.

---

## Implementation Notes for the Developer

1. **Reuse the codebase's existing primitives**. If you have a Button, Card, or Modal component already, use it — don't ship raw HTML/CSS from the prototype.

2. **Treat `styles.css` as a token bible, not source code**. Extract:
   - The color tokens into your theme/tokens file
   - Typography rules into your text component
   - Spacing scale into your spacing utility

3. **Theme switching**: implement via CSS variables keyed to a root attribute, just like the prototype. This is the cleanest approach.

4. **Icons**: All icons are simple stroked SVG; port them into your icon system. Keep the domain-specific ones (preflight clipboard, startup key, taxi, takeoff, cruise, landing, power) — they're carefully chosen to be instantly recognizable to pilots.

5. **The Live Radio panel must stay full-width and persistently visible** — this is the safety-critical anchor of the app. Don't tuck it into the main column.

6. **Emergency screens use larger type** (18px / 700 for section titles, 15px labels) — this is intentional for crisis scan-ability. Maintain the larger scale.

7. **Light-gun signal indicators are CSS-only animations** — no JS needed. Port the keyframes verbatim.

8. **All overlay components share the same envelope** (backdrop + header + body + ESC). Consider building a shared `<Overlay>` component to dedupe.

9. **Tweaks panel** in the prototype lets the designer try different accents, surfaces, density, and font swaps. This is a prototype-only affordance — strip it from production.

10. **Real integrations TBD**:
    - Live ATC transcription needs an ASR engine (e.g. Whisper) and a parser that fills the clearance form fields
    - Real airport / frequency data (FAA NASR or aviationapi)
    - Real aircraft profile loading (M&B, performance per N-number)
    - Persistence: scratchpad notes, checklist state, flight timer should survive reload (localStorage or backend)
    - Authentication / user profile
    - Offline support: the prototype loads React + Babel + Google Fonts from CDNs. Production should bundle locally.

---

## Questions for the Designer

If any of these are unclear, re-open the prototype to check:
- Hover, focus, active states on every interactive element
- Exact transition timings
- Edge cases (very long aircraft type names, very long ATC transmissions, search with zero results)
- Empty/loading states (the prototype only shows the populated state for most lists)
