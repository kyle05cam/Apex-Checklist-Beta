/* =========================================================
   Quick Reference data — pilot reference tables
   ========================================================= */
const QUICK_REF = [
  {
    id: "light-gun",
    name: "ATC Light Gun Signals",
    section: "Communications",
    sub: "Visual signals when radio fails",
    cols: ["Signal", "On Ground", "In Flight"],
    rows: [
      ["Steady GREEN",     "Cleared for takeoff",       "Cleared to land",            "steady-green"],
      ["Flashing GREEN",   "Cleared to taxi",           "Return for landing",         "flashing-green"],
      ["Steady RED",       "Stop",                      "Give way · continue",        "steady-red"],
      ["Flashing RED",     "Taxi clear of runway",      "Airport unsafe · do not land", "flashing-red"],
      ["Flashing WHITE",   "Return to start",           "—",                          "flashing-white"],
      ["Alternating R/G", "Exercise extreme caution",  "Exercise extreme caution",   "alternating-rg"],
    ],
    tone: "default",
    signalKey: true,
  },
  {
    id: "transponder",
    name: "Transponder Codes",
    section: "Communications",
    sub: "Emergency & standard squawks",
    cols: ["Code", "Meaning"],
    rows: [
      ["1200", "VFR — No ATC communication"],
      ["7500", "Hijacking in progress", "warn"],
      ["7600", "Radio failure (NORDO)", "caution"],
      ["7700", "Emergency / Distress",  "warn"],
      ["7000", "VFR — ICAO standard (intl)"],
    ],
    tone: "default",
  },
  {
    id: "vfr-mins",
    name: "VFR Weather Minimums",
    section: "Regulations",
    sub: "14 CFR 91.155 — Basic VFR minimums",
    cols: ["Airspace", "Visibility", "Cloud Clearance"],
    rows: [
      ["Class A",        "N/A (IFR only)", "—"],
      ["Class B",        "3 SM",           "Clear of clouds"],
      ["Class C",        "3 SM",           "500 below · 1000 above · 2000 horiz"],
      ["Class D",        "3 SM",           "500 below · 1000 above · 2000 horiz"],
      ["Class E < 10K",  "3 SM",           "500 below · 1000 above · 2000 horiz"],
      ["Class E ≥ 10K",  "5 SM",           "1000 below · 1000 above · 1 SM horiz"],
      ["Class G day",    "1 SM",           "Clear of clouds"],
      ["Class G night",  "3 SM",           "500 below · 1000 above · 2000 horiz"],
    ],
  },
  {
    id: "airspeed-limits",
    name: "Airspeed Limits (§91.117)",
    section: "Regulations",
    sub: "Maximum indicated airspeed by location",
    cols: ["Location", "Max IAS"],
    rows: [
      ["Below 10,000 ft MSL",            "250 KIAS"],
      ["Class B underlying / VFR corridor", "200 KIAS"],
      ["Within 4 NM Class C/D < 2,500 AGL", "200 KIAS"],
      ["Reciprocating aircraft (no waiver)", "250 KIAS"],
    ],
  },
  {
    id: "vfr-alts",
    name: "VFR Cruising Altitudes (§91.159)",
    section: "Regulations",
    sub: "Above 3,000 AGL · magnetic course",
    cols: ["Course", "Altitude"],
    rows: [
      ["000° – 179°", "Odd thousands + 500 (e.g. 3,500 · 5,500)"],
      ["180° – 359°", "Even thousands + 500 (e.g. 4,500 · 6,500)"],
    ],
  },
  {
    id: "airspace",
    name: "Airspace Entry Requirements",
    section: "Regulations",
    sub: "Equipment & clearance",
    cols: ["Class", "Entry", "Equipment"],
    rows: [
      ["A", "ATC clearance",          "Mode C, IFR only"],
      ["B", "ATC clearance",          "Mode C, ADS-B Out"],
      ["C", "Two-way radio contact",  "Mode C, ADS-B Out"],
      ["D", "Two-way radio contact",  "Two-way radio"],
      ["E", "None (VFR)",             "Mode C above 10K MSL"],
      ["G", "None",                   "None"],
    ],
  },
  {
    id: "engine",
    name: "C172S Engine Specifications",
    section: "Aircraft · C172S",
    sub: "Lycoming IO-360-L2A",
    cols: ["Parameter", "Value"],
    rows: [
      ["Engine",                "Lycoming IO-360-L2A"],
      ["Horsepower",            "180 HP @ 2,700 RPM"],
      ["Displacement",          "361 cu in"],
      ["Cylinders",             "4, horizontally opposed"],
      ["Fuel injection",        "RSA-5AD1"],
      ["Compression ratio",     "8.5:1"],
      ["Oil capacity",          "8 qt (6 qt min for flight)"],
      ["Oil type",              "Aeroshell W100 or 15W-50"],
      ["TBO",                   "2,000 hrs"],
    ],
  },
  {
    id: "elec",
    name: "C172S Electrical System",
    section: "Aircraft · C172S",
    sub: "28V DC system",
    cols: ["Component", "Spec"],
    rows: [
      ["System voltage",        "28V DC"],
      ["Alternator",            "60A, belt-driven"],
      ["Battery",               "24V, 12.75 amp-hours"],
      ["Bus configuration",     "Single bus, main + avionics"],
      ["External power",        "28V receptacle (optional)"],
    ],
  },
  {
    id: "runway",
    name: "Runway Markings & Lighting",
    section: "Airport",
    sub: "AIM 2-3-3 · 2-3-4",
    cols: ["Marking", "Meaning"],
    rows: [
      ["Solid white lines",            "Runway edge / taxiway hold short"],
      ["Dashed yellow lines",          "Taxiway boundary (may cross)"],
      ["Solid yellow lines",           "Do not cross (taxiway edge)"],
      ["Yellow chevrons (>>>)",        "Unusable surface · do not enter"],
      ["White threshold bars",         "Runway threshold (begin landing)"],
      ["Red lights",                   "End of runway / obstruction"],
      ["Blue lights",                  "Taxiway edge"],
    ],
  },
  {
    id: "fuel-oil",
    name: "C172S Fuel & Oil Quick Ref",
    section: "Aircraft · C172S",
    sub: "Capacities & grades",
    cols: ["Item", "Value"],
    rows: [
      ["Fuel grade",                  "100LL (blue) or 100 (green)"],
      ["Total fuel capacity",         "56 gal (53 usable)"],
      ["Per tank usable",             "26.5 gal"],
      ["Unusable per tank",           "1.5 gal"],
      ["Avg burn (75% pwr)",          "~8.5 gph"],
      ["Min oil for flight",          "6 qt"],
      ["Max oil capacity",            "8 qt"],
    ],
  },
  {
    id: "wb",
    name: "C172S Weight & CG Limits",
    section: "Aircraft · C172S",
    sub: "Normal category",
    cols: ["Limit", "Value"],
    rows: [
      ["Max ramp weight",        "2,558 lb"],
      ["Max takeoff weight",     "2,550 lb"],
      ["Max landing weight",     "2,550 lb"],
      ["Standard empty weight",  "~1,680 lb (varies)"],
      ["CG forward (2,200 lb)",  "35.0 in aft of datum"],
      ["CG forward (2,550 lb)",  "41.0 in aft of datum"],
      ["CG aft (all weights)",   "47.3 in aft of datum"],
      ["Datum",                  "Firewall lower forward"],
    ],
  },
  {
    id: "tires",
    name: "C172S Tire Pressures",
    section: "Aircraft · C172S",
    sub: "Cold tire pressure",
    cols: ["Position", "Pressure"],
    rows: [
      ["Nose tire",   "45 PSI"],
      ["Main tires",  "42 PSI"],
    ],
  },
  {
    id: "nato",
    name: "NATO Phonetic Alphabet",
    section: "Communications",
    sub: "ICAO spelling alphabet",
    cols: ["Letter", "Phonetic", "Pronunciation"],
    rows: [
      ["A", "Alpha",    "AL-fah"],
      ["B", "Bravo",    "BRAH-voh"],
      ["C", "Charlie",  "CHAR-lee"],
      ["D", "Delta",    "DELL-tah"],
      ["E", "Echo",     "ECK-oh"],
      ["F", "Foxtrot",  "FOKS-trot"],
      ["G", "Golf",     "GOLF"],
      ["H", "Hotel",    "hoh-TELL"],
      ["I", "India",    "IN-dee-ah"],
      ["J", "Juliet",   "JEW-lee-et"],
      ["K", "Kilo",     "KEE-loh"],
      ["L", "Lima",     "LEE-mah"],
      ["M", "Mike",     "MIKE"],
      ["N", "November", "no-VEM-ber"],
      ["O", "Oscar",    "OSS-cah"],
      ["P", "Papa",     "pah-PAH"],
      ["Q", "Quebec",   "keh-BECK"],
      ["R", "Romeo",    "ROW-me-oh"],
      ["S", "Sierra",   "see-AIR-rah"],
      ["T", "Tango",    "TANG-go"],
      ["U", "Uniform",  "YOU-nee-form"],
      ["V", "Victor",   "VIK-tah"],
      ["W", "Whiskey",  "WISS-key"],
      ["X", "X-ray",    "ECKS-ray"],
      ["Y", "Yankee",   "YANG-key"],
      ["Z", "Zulu",     "ZOO-loo"],
    ],
  },
];

window.QUICK_REF = QUICK_REF;

/* =========================================================
   Quick Reference Overlay
   ========================================================= */
function QuickRefOverlay({ open, onClose }) {
  const [pick, setPick] = React.useState(QUICK_REF[0].id);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = query
    ? QUICK_REF.filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
    : QUICK_REF;

  // Group by section, preserving order
  const groups = [];
  const seen = {};
  filtered.forEach(r => {
    if (!seen[r.section]) { seen[r.section] = []; groups.push([r.section, seen[r.section]]); }
    seen[r.section].push(r);
  });

  const active = QUICK_REF.find(r => r.id === pick) || QUICK_REF[0];

  return (
    <div className="qr-overlay-backdrop" onClick={onClose}>
      <div className="qr-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="qr-overlay-head">
          <div className="qr-overlay-title">
            <span className="qr-overlay-eyebrow">Quick Reference</span>
            <span className="qr-overlay-aircraft">{PILOT_DATA.AIRCRAFT.tail} · {PILOT_DATA.AIRCRAFT.type}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ESC <span style={{ marginLeft: 4 }}>✕</span>
          </button>
        </div>

        <div className="qr-overlay-body">
          <aside className="qr-sidebar">
            <div className="qr-search">
              <input
                className="qr-search-input"
                placeholder="Search reference…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {groups.map(([section, items]) => (
              <div key={section} className="qr-group">
                <div className="qr-group-label">{section}</div>
                {items.map((r) => (
                  <button
                    key={r.id}
                    className={`qr-nav-item${pick === r.id ? " active" : ""}`}
                    onClick={() => setPick(r.id)}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="qr-empty">No matches for "{query}"</div>
            )}
          </aside>
          <main className="qr-content">
            <header className="qr-content-head">
              <div>
                <h2 className="qr-content-title">{active.name}</h2>
                <div className="qr-content-sub">{active.sub}</div>
              </div>
              <span className="qr-section-pill">{active.section}</span>
            </header>
            <table className="qr-table">
              <thead>
                <tr>
                  {active.cols.map((c, i) => <th key={i}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {active.rows.map((row, ri) => {
                  // Signal-key tables embed a light-kind as the last cell
                  let signalKind = null;
                  let cells = row;
                  if (active.signalKey) {
                    signalKind = row[row.length - 1];
                    cells = row.slice(0, -1);
                  } else {
                    const last = row[row.length - 1];
                    const hasTone = last === "warn" || last === "caution" || last === "ok";
                    if (hasTone) cells = row.slice(0, -1);
                    var tone = hasTone ? last : null;
                  }
                  return (
                    <tr key={ri} className={tone ? `qr-row-${tone}` : ""}>
                      {cells.map((c, ci) => (
                        <td key={ci} className={ci === 0 ? "qr-cell-key" : ""}>
                          {ci === 0 && signalKind && <SignalLight kind={signalKind} />}
                          <span>{c}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </main>
        </div>
      </div>
    </div>
  );
}

window.QuickRefOverlay = QuickRefOverlay;

/* Light-gun signal indicator */
function SignalLight({ kind }) {
  return <span className={`signal-light signal-${kind}`} aria-hidden="true"><span className="signal-dot"></span></span>;
}
