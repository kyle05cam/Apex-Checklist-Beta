// ─────────────────────────────────────────────────────────────────────────────
// POH PARSER — section-aware PDF text extraction using pdf.js
// Extracts V-speeds, weights, fuel, engine specs, performance tables,
// and operating limits from digital POH PDFs.
// ─────────────────────────────────────────────────────────────────────────────
import * as pdfjsLib from "pdfjs-dist";

// Point the worker at the bundled worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

// ── Extract all text from PDF pages ──────────────────────────────────────────
export async function extractPdfText(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page  = await pdf.getPage(i);
    const tc    = await page.getTextContent();
    const text  = tc.items.map(it => it.str).join(" ");
    pages.push(text);
  }
  return pages.join("\n");
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function num(text, pattern) {
  const m = text.match(pattern);
  return m ? parseInt(m[1], 10) : null;
}
function flt(text, pattern) {
  const m = text.match(pattern);
  return m ? parseFloat(m[1]) : null;
}
function str(text, pattern) {
  const m = text.match(pattern);
  return m ? m[1].trim() : null;
}

// Extract a section of text between two headings (case-insensitive)
function section(text, startPattern, endPattern) {
  const s = text.search(startPattern);
  if (s === -1) return "";
  const chunk = text.slice(s);
  if (!endPattern) return chunk.slice(0, 3000);
  const e = chunk.search(endPattern);
  return e === -1 ? chunk.slice(0, 3000) : chunk.slice(0, e);
}

// ── V-speeds ──────────────────────────────────────────────────────────────────
function parseVSpeeds(text) {
  // Prefer the airspeed limitations section for accuracy
  const limSection = section(text, /airspeed\s+(indicator\s+)?limit/i, /weight\s+limit|fuel\s+limit|section\s+[3-9]/i);
  const t = limSection || text;

  const vs = {
    vso: num(t, /V[Ss][Oo0][\s.:–\-]*(\d{2,3})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /stall(?:ing)?\s+speed[^.]{0,60}(?:land|flap)[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i),
    vs1: num(t, /V[Ss]1[\s.:–\-]*(\d{2,3})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /stall(?:ing)?\s+speed[^.]{0,60}clean[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i),
    vr:  num(t, /V[Rr][\s.:–\-]*(\d{2,3})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /rotation\s+speed[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i),
    vx:  num(t, /V[Xx][\s.:–\-]*(\d{2,3})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /best\s+angle[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i),
    vy:  num(t, /V[Yy][\s.:–\-]*(\d{2,3})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /best\s+rate[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i),
    va:  num(t, /V[Aa][\s.:–\-]*(\d{2,3})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /maneuver(?:ing)?\s+speed[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i),
    vfe: num(t, /V[Ff][Ee][\s.:–\-]*(\d{2,3})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /(?:max(?:imum)?\s+)?flap\s+(?:extension\s+)?speed[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i),
    vno: num(t, /V[Nn][Oo][\s.:–\-]*(\d{2,3})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /max(?:imum)?\s+structural\s+cruis[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i),
    vne: num(t, /V[Nn][Ee][\s.:–\-]*(\d{2,3})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /never[\s\-]exceed[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i),
    vapp: num(t, /V[Aa][Pp][Pp][\s.:–\-]*(\d{2,3})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /(?:normal\s+)?approach\s+speed[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i)
      ?? num(t, /final\s+approach[^.]{0,30}(\d{2,3})\s*(?:KIAS|KT)/i),
  };
  return Object.values(vs).some(v => v !== null) ? vs : null;
}

// ── Weights ───────────────────────────────────────────────────────────────────
function parseWeights(text) {
  const t = section(text, /weight\s+limit|section\s+2/i, /performance|fuel\s+cap|section\s+[3-9]/i) || text;
  const w = {
    maxGross:    num(t, /max(?:imum)?\s+(?:gross\s+)?(?:takeoff\s+|ramp\s+)?weight[^.]{0,30}?(\d{3,5})\s*(?:lbs?|pounds?)/i)
      ?? num(t, /gross\s+weight[^.]{0,30}(\d{3,5})\s*(?:lbs?|pounds?)/i),
    maxRamp:     num(t, /max(?:imum)?\s+ramp\s+(?:weight[^.]{0,30})?(\d{3,5})\s*(?:lbs?|pounds?)/i),
    emptyWeight: num(t, /(?:standard\s+)?empty\s+weight[^.]{0,30}(\d{3,5})\s*(?:lbs?|pounds?)/i),
    usefulLoad:  num(t, /useful\s+load[^.]{0,30}(\d{3,5})\s*(?:lbs?|pounds?)/i),
    maxBaggage:  num(t, /(?:max(?:imum)?\s+)?baggage[^.]{0,30}(\d{1,3})\s*(?:lbs?|pounds?)/i),
    cgFwd:       flt(t, /(?:fwd?|forward)\s+(?:cg|c\.g\.?|limit)[^.]{0,40}([\d.]+)\s*in(?:ch(?:es)?)?/i),
    cgAft:       flt(t, /(?:aft|rear)\s+(?:cg|c\.g\.?|limit)[^.]{0,40}([\d.]+)\s*in(?:ch(?:es)?)?/i),
  };
  return Object.values(w).some(v => v !== null) ? w : null;
}

// ── Fuel & Oil ────────────────────────────────────────────────────────────────
function parseFuel(text) {
  const t = section(text, /fuel\s+(?:cap|sys|req|and\s+oil)/i, /section\s+[3-9]|performance|weight/i) || text;
  const f = {
    totalGal:  flt(t, /total\s+(?:fuel\s+)?capacity[^.]{0,30}([\d.]+)\s*(?:U\.?S\.?\s*)?gal/i)
      ?? flt(t, /fuel\s+capacity[^.]{0,30}([\d.]+)\s*(?:U\.?S\.?\s*)?gal/i),
    usableGal: flt(t, /usable[^.]{0,30}([\d.]+)\s*(?:U\.?S\.?\s*)?gal/i),
    type:      str(t, /(?:fuel\s+(?:grade|type|spec)|approved\s+fuel)[^.]{0,40}?(100\s*LL|Jet\s*A|Avgas|100\s*Octane|Mogas)/i),
    oilType:   str(t, /(?:oil\s+(?:type|grade|spec)|approved\s+oil)[^.]{0,40}?((?:SAE|MIL)[\w\s\-]+(?:aviation|aero)?)/i),
    oilCapMax: flt(t, /oil\s+cap(?:acity)?[^.]{0,30}([\d.]+)\s*(?:qt(?:s)?|quarts?)/i),
    oilCapMin: flt(t, /(?:min(?:imum)?\s+oil|do\s+not\s+fly\s+(?:below|with\s+less\s+than))[^.]{0,30}([\d.]+)\s*(?:qt(?:s)?|quarts?)/i),
  };
  return Object.values(f).some(v => v !== null) ? f : null;
}

// ── Engine specs ──────────────────────────────────────────────────────────────
function parseEngine(text) {
  const t = section(text, /engine\s+(?:spec|desc|type|model|data)/i, /section\s+[3-9]|fuel\s+sys|propeller/i) || text;
  const e = {
    model:         str(t, /engine\s+(?:model|make|manufacturer)[^.]{0,30}?([A-Z]{1,4}[\w\s\-\.]{3,40}(?:\d{3,4}[\w\-]*))/i),
    horsepower:    num(t, /(\d{2,4})\s*(?:HP|BHP|horsepower)/i),
    cylinders:     num(t, /(\d)\s*[\-\s]?cylinder/i),
    displacement:  num(t, /(\d{2,4})\s*cu(?:bic)?\s*in(?:ch(?:es)?)?/i),
    tbo:           num(t, /TBO[^.]{0,30}(\d{3,5})\s*(?:hr|hour)/i)
      ?? num(t, /time\s+between\s+overhaul[^.]{0,30}(\d{3,5})\s*(?:hr|hour)/i),
    maxRpm:        num(t, /max(?:imum)?\s+(?:continuous\s+)?(?:engine\s+)?RPM[^.]{0,20}(\d{3,4})/i)
      ?? num(t, /(\d{3,4})\s*RPM[^.]{0,20}(?:max|red\s*line|limit)/i),
    oilPressMin:   num(t, /oil\s+press(?:ure)?[^.]{0,60}(?:min(?:imum)?|idle)[^.]{0,20}(\d{2,3})\s*(?:PSI|psi)/i),
    oilPressMax:   num(t, /oil\s+press(?:ure)?[^.]{0,60}(?:max(?:imum)?|normal\s+max)[^.]{0,20}(\d{2,3})\s*(?:PSI|psi)/i),
    oilTempMax:    num(t, /oil\s+temp(?:erature)?[^.]{0,60}(?:max(?:imum)?)[^.]{0,20}(\d{2,3})\s*(?:°\s*[FC]|deg)/i),
    chtMax:        num(t, /(?:CHT|cylinder\s+head\s+temp(?:erature)?)[^.]{0,40}(?:max(?:imum)?)[^.]{0,20}(\d{2,3})\s*(?:°\s*[FC]|deg)/i),
  };
  return Object.values(e).some(v => v !== null) ? e : null;
}

// ── Operating limits ──────────────────────────────────────────────────────────
function parseLimits(text) {
  const t = section(text, /limit(?:ation)?s|section\s+2/i, /normal\s+procedure|section\s+[3-9]/i) || text;
  return {
    maxCrosswind: num(t, /max(?:imum)?\s+demonstrated\s+crosswind[^.]{0,30}(\d{1,2})\s*(?:KIAS|KT|knots)?/i)
      ?? num(t, /crosswind[^.]{0,30}demonstrated[^.]{0,30}(\d{1,2})\s*(?:KIAS|KT|knots)?/i),
  };
}

// ── Takeoff performance table ─────────────────────────────────────────────────
// Attempts to pull ground roll and 50ft obstacle distances from the takeoff
// chart. POHs vary widely in table format, so this is best-effort.
function parseTakeoffPerf(text) {
  const t = section(text, /takeoff\s+(?:distance|performance|data)/i, /landing\s+(?:distance|performance)|climb\s+performance|section\s+[6-9]/i);
  if (!t) return null;

  // Look for altitude-distance pairs: "Sea Level ... 960 ... 1630"
  const altitudes  = [...t.matchAll(/(\d{1,2}[,.]?\d{3}|sea\s+level)\s*(?:ft)?(?:\s+msl)?/gi)];
  const distances  = [...t.matchAll(/(\d{3,5})\s*(?:ft|feet)?(?:\s|$)/g)];
  if (distances.length < 4) return null;

  // Heuristic: first 4 distance numbers as ground rolls, next 4 as over-50ft
  const nums = distances.map(m => parseInt(m[1], 10)).filter(n => n > 100 && n < 10000);
  if (nums.length < 4) return null;

  const gndRoll = [
    [0,    nums[0]],
    [2000, nums[1]],
    [4000, nums[2]],
    [6000, nums[3]],
  ];
  const over50ft = nums.length >= 8 ? [
    [0,    nums[4]],
    [2000, nums[5]],
    [4000, nums[6]],
    [6000, nums[7]],
  ] : null;

  return { gndRoll, over50ft };
}

// ── Landing performance table ─────────────────────────────────────────────────
function parseLandingPerf(text) {
  const t = section(text, /landing\s+(?:distance|performance|data)/i, /climb\s+performance|cruise\s+performance|section\s+[6-9]/i);
  if (!t) return null;

  const distances = [...t.matchAll(/(\d{3,5})\s*(?:ft|feet)?(?:\s|$)/g)];
  const nums = distances.map(m => parseInt(m[1], 10)).filter(n => n > 100 && n < 10000);
  if (nums.length < 4) return null;

  const gndRoll = [
    [0,    nums[0]],
    [2000, nums[1]],
    [4000, nums[2]],
    [6000, nums[3]],
  ];
  const over50ft = nums.length >= 8 ? [
    [0,    nums[4]],
    [2000, nums[5]],
    [4000, nums[6]],
    [6000, nums[7]],
  ] : null;

  return { gndRoll, over50ft };
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function parsePoh(arrayBuffer) {
  const text = await extractPdfText(arrayBuffer);

  // Heuristic: scanned PDF produces very little real text
  const wordCount = text.split(/\s+/).filter(w => w.length > 3).length;
  if (wordCount < 200) return { scanned: true };

  const vSpeeds   = parseVSpeeds(text);
  const weights   = parseWeights(text);
  const fuel      = parseFuel(text);
  const engine    = parseEngine(text);
  const limits    = parseLimits(text);
  const takeoff   = parseTakeoffPerf(text);
  const landing   = parseLandingPerf(text);

  const hasAny = (obj) => obj && Object.values(obj).some(v => v !== null);

  return {
    scanned:  false,
    vSpeeds:  hasAny(vSpeeds)  ? vSpeeds  : null,
    weights:  hasAny(weights)  ? weights  : null,
    fuel:     hasAny(fuel)     ? fuel     : null,
    engine:   hasAny(engine)   ? engine   : null,
    limits:   hasAny(limits)   ? limits   : null,
    takeoff:  takeoff          ?? null,
    landing:  landing          ?? null,
    maxXwind: limits?.maxCrosswind ?? null,
  };
}
