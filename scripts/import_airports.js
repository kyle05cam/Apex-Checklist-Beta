#!/usr/bin/env node
// =============================================================================
// import_airports.js
// Generates src/nearest_freqs_data.js from OurAirports public-domain CSV data.
//
// OurAirports mirrors FAA NASR (updated every 28 days) and publishes two free
// CSV files (~14,000 US airports + all their frequencies).
//
// USAGE — run once, then re-run every 28 days to stay current:
//
//   1. Download both CSVs into this scripts/ folder:
//        https://davidmegginson.github.io/ourairports-data/airports.csv
//        https://davidmegginson.github.io/ourairports-data/airport-frequencies.csv
//
//   2. From the project root:
//        node scripts/import_airports.js
//
//   3. That's it. src/nearest_freqs_data.js is overwritten with real FAA data.
//      Commit the result and rebuild the app.
//
// The output file is ~4–6 MB of static JS — bundled once at build time,
// works 100% offline in flight with no network dependency.
// =============================================================================

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Paths ─────────────────────────────────────────────────────────────────────
const AIRPORTS_CSV = path.join(__dirname, "airports.csv");
const FREQS_CSV    = path.join(__dirname, "airport-frequencies.csv");
const OUTPUT_JS    = path.join(__dirname, "../src/nearest_freqs_data.js");

// ── Which airport types to include ───────────────────────────────────────────
// OurAirports types: large_airport | medium_airport | small_airport |
//                    heliport | seaplane_base | balloonport | closed
const INCLUDE_TYPES = new Set(["large_airport", "medium_airport", "small_airport"]);

// ── Frequency type map (OurAirports label → our internal code) ────────────────
// OurAirports uses mixed-case / abbreviated labels — we normalize them all.
const TYPE_MAP = {
  // Weather
  "ATIS":      "ATIS",
  "D-ATIS":    "ATIS",
  "ASOS":      "ASOS",
  "AWOS":      "AWOS",
  "AWOS-1":    "AWOS",
  "AWOS-2":    "AWOS",
  "AWOS-3":    "AWOS",
  "AWOS-3P":   "AWOS",
  "AWOS-3PT":  "AWOS",
  "AWOS-3T":   "AWOS",
  "AWOS-A":    "AWOS",
  "AWOS-AV":   "AWOS",
  // Clearance delivery
  "CLD":        "CLNC",
  "CLNC DEL":   "CLNC",
  "CLNC":       "CLNC",
  "CD":         "CLNC",
  "Clearance":  "CLNC",
  "CLEARANCE":  "CLNC",
  // Ground / ramp
  "GND":        "GND",
  "Ground":     "GND",
  "GROUND":     "GND",
  "RMP":        "GND",
  "Ramp":       "GND",
  // Tower / local control
  "TWR":        "TWR",
  "Tower":      "TWR",
  "TOWER":      "TWR",
  "LCL/P":      "TWR",
  "LCL/S":      "TWR",
  "CTLR":       "TWR",
  // Approach
  "APP":        "APP",
  "Approach":   "APP",
  "APPROACH":   "APP",
  "TRACON":     "APP",
  "RAPCON":     "APP",
  "RATCF":      "APP",
  "A/D":        "APP",
  // Departure
  "DEP":        "DEP",
  "Departure":  "DEP",
  "DEPARTURE":  "DEP",
  // CTAF / Unicom (non-towered common traffic advisory)
  "CTAF":       "CTAF",
  "UNIC":       "CTAF",
  "UNICOM":     "CTAF",
  "Unicom":     "CTAF",
  "MULTICOM":   "CTAF",
  "Multicom":   "CTAF",
  "MF":         "CTAF",
  // Emergency — we intentionally skip these (Guard is on every radio)
  "EMERG":      null,
  "EMRG":       null,
  "Guard":      null,
  "GUARD":      null,
  "121.5":      null,
};

// ── Minimal CSV parser (handles quoted fields with embedded commas/newlines) ──
function parseCSV(filePath) {
  console.log(`  Reading ${path.basename(filePath)} …`);
  const text   = fs.readFileSync(filePath, "utf8");
  const lines  = text.split(/\r?\n/);
  const header = splitCSVLine(lines[0]);
  const rows   = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const vals = splitCSVLine(line);
    const obj  = {};
    header.forEach((h, idx) => { obj[h.trim()] = (vals[idx] ?? "").trim(); });
    rows.push(obj);
  }
  return rows;
}

function splitCSVLine(line) {
  const result = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) {
      result.push(cur); cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

// ── Normalise frequency to "NNN.NNN" format ───────────────────────────────────
function fmtFreq(raw) {
  const n = parseFloat(raw);
  if (isNaN(n) || n < 100 || n > 140) return null; // VHF aviation band only
  // Always show at least N.N (trim trailing zeros past first decimal place)
  let s = n.toFixed(3);
  s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s;
}

// ── Human-readable name for a freq entry ─────────────────────────────────────
function freqName(ourType, description, mappedType) {
  if (description && description.length > 1 && description.length < 40) {
    // Clean up common abbreviations
    return description
      .replace(/\bATIS\b/i,      "ATIS")
      .replace(/\bGROUND\b/i,    "Ground")
      .replace(/\bTOWER\b/i,     "Tower")
      .replace(/\bCLEARANCE\b/i, "Clearance Delivery")
      .replace(/\bAPPROACH\b/i,  "Approach")
      .replace(/\bDEPARTURE\b/i, "Departure")
      .replace(/\bUNICOM\b/i,    "Unicom")
      .replace(/\bCTAF\b/i,      "CTAF / Unicom")
      .trim();
  }
  // Fall back to a clean label from the mapped type
  const defaults = {
    ATIS: "ATIS", AWOS: "AWOS", ASOS: "ASOS",
    CLNC: "Clearance Delivery",
    GND:  "Ground", TWR: "Tower",
    APP:  "Approach", DEP: "Departure",
    CTAF: "CTAF / Unicom",
  };
  return defaults[mappedType] ?? mappedType;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("\n=== Apex Aviation — Airport Database Import ===\n");

// Validate input files exist
for (const f of [AIRPORTS_CSV, FREQS_CSV]) {
  if (!fs.existsSync(f)) {
    console.error(`ERROR: Missing file: ${f}`);
    console.error("\nDownload it from:");
    console.error("  https://davidmegginson.github.io/ourairports-data/airports.csv");
    console.error("  https://davidmegginson.github.io/ourairports-data/airport-frequencies.csv");
    process.exit(1);
  }
}

const rawAirports = parseCSV(AIRPORTS_CSV);
const rawFreqs    = parseCSV(FREQS_CSV);

console.log(`  ${rawAirports.length} total airports in source`);
console.log(`  ${rawFreqs.length} total frequency entries in source\n`);

// ── Build frequency index by airport ident ────────────────────────────────────
const freqIndex = {};
for (const row of rawFreqs) {
  const ident = row.airport_ident;
  if (!ident) continue;

  const rawType    = (row.type ?? "").trim();
  const mappedType = TYPE_MAP[rawType];
  if (mappedType === null) continue;           // explicitly excluded (Guard etc.)
  if (mappedType === undefined) continue;      // unknown type — skip

  const freq = fmtFreq(row.frequency_mhz);
  if (!freq) continue;

  if (!freqIndex[ident]) freqIndex[ident] = [];
  freqIndex[ident].push({
    type: mappedType,
    freq,
    name: freqName(rawType, row.description, mappedType),
  });
}

// Deduplicate freq entries per airport (same type + freq)
for (const ident of Object.keys(freqIndex)) {
  const seen = new Set();
  freqIndex[ident] = freqIndex[ident].filter(f => {
    const key = `${f.type}:${f.freq}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Build airport records ─────────────────────────────────────────────────────
const airports = rawAirports
  .filter(a =>
    a.iso_country === "US" &&
    INCLUDE_TYPES.has(a.type) &&
    a.latitude_deg  && parseFloat(a.latitude_deg)  !== 0 &&
    a.longitude_deg && parseFloat(a.longitude_deg) !== 0
  )
  .map(a => {
    const freqs = freqIndex[a.ident] ?? [];
    return {
      id:    a.ident,
      name:  a.name,
      lat:   parseFloat(a.latitude_deg),
      lon:   parseFloat(a.longitude_deg),
      elev:  parseInt(a.elevation_ft || "0", 10) || 0,
      type:  a.type === "large_airport"  ? "LARGE"       :
             a.type === "medium_airport" ? "TOWERED"     : "NON-TOWERED",
      freqs,
    };
  })
  .filter(a => !isNaN(a.lat) && !isNaN(a.lon));

// ── Tallies ───────────────────────────────────────────────────────────────────
const byState = {};
for (const ap of airports) {
  // OurAirports stores US state in iso_region as "US-AZ" etc.
  const row   = rawAirports.find(r => r.ident === ap.id);
  const state = (row?.iso_region ?? "").replace("US-", "") || "??";
  byState[state] = (byState[state] ?? 0) + 1;
}
const stateList = Object.entries(byState).sort((a, b) => b[1] - a[1]);
console.log("Top 10 states by airport count:");
stateList.slice(0, 10).forEach(([s, n]) => console.log(`  ${s}: ${n}`));
console.log(`  (${stateList.length} states/territories total)\n`);

// ── Serialise ─────────────────────────────────────────────────────────────────
const date    = new Date().toISOString().slice(0, 10);
const entries = airports.map(a => {
  const freqLines = a.freqs.length === 0
    ? "      // no frequency data in source"
    : a.freqs.map(f =>
        `      { type:${JSON.stringify(f.type)}, freq:${JSON.stringify(f.freq)}, name:${JSON.stringify(f.name)} },`
      ).join("\n");
  return (
    `  { id:${JSON.stringify(a.id)}, name:${JSON.stringify(a.name)}, ` +
    `lat:${a.lat}, lon:${a.lon}, elev:${a.elev}, type:${JSON.stringify(a.type)},\n` +
    `    freqs:[\n${freqLines}\n    ]},`
  );
}).join("\n");

const output = `// =============================================================================
// APEX AVIATION — FAA FREQUENCY DATABASE (offline bundle)
// Source : OurAirports public-domain data — https://ourairports.com
// Generated : ${date}
// Airports : ${airports.length} (US small / medium / large)
//
// To refresh: node scripts/import_airports.js  (run every 28 days)
// =============================================================================

export const AIRPORT_DB = [
${entries}
];

// ─── GREAT-CIRCLE DISTANCE (Haversine) ───────────────────────────────────────
// Returns distance in nautical miles between two lat/lon points.
export function distanceNm(lat1, lon1, lat2, lon2) {
  const R    = 3440.065; // Earth radius in NM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── GET NEAREST AIRPORTS ────────────────────────────────────────────────────
// Returns up to \`count\` airports within \`maxNm\` nautical miles, sorted nearest-first.
export function getNearestAirports(lat, lon, count = 5, maxNm = 50) {
  return AIRPORT_DB
    .map(ap => ({ ...ap, distNm: distanceNm(lat, lon, ap.lat, ap.lon) }))
    .filter(ap => ap.distNm <= maxNm)
    .sort((a, b) => a.distNm - b.distNm)
    .slice(0, count);
}

// ─── FREQ TYPE METADATA ──────────────────────────────────────────────────────
export const FREQ_META = {
  ATIS:  { color: "#4ae8c8", label: "ATIS",     priority: 1 },
  AWOS:  { color: "#4ae8c8", label: "AWOS",     priority: 1 },
  ASOS:  { color: "#4ae8c8", label: "ASOS",     priority: 1 },
  CLNC:  { color: "#c87ae8", label: "CLNC DEL", priority: 2 },
  GND:   { color: "#3dbe6c", label: "GROUND",   priority: 3 },
  TWR:   { color: "#3a9ad4", label: "TOWER",    priority: 4 },
  APP:   { color: "#e8c84a", label: "APPROACH", priority: 5 },
  DEP:   { color: "#e8c84a", label: "DEPART",   priority: 5 },
  CTAF:  { color: "#3dbe6c", label: "CTAF",     priority: 3 },
  UNIC:  { color: "#3dbe6c", label: "UNICOM",   priority: 3 },
  EMRG:  { color: "#e85a4a", label: "GUARD",    priority: 9 },
};
`;

fs.writeFileSync(OUTPUT_JS, output, "utf8");
const sizeKB = Math.round(fs.statSync(OUTPUT_JS).size / 1024);
console.log(`✓  Written → src/nearest_freqs_data.js`);
console.log(`   ${airports.length} airports · ${sizeKB} KB\n`);
