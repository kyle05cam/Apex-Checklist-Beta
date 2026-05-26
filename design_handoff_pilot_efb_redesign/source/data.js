/* =========================================================
   Data: aircraft, checklists, V-speeds, performance
   ========================================================= */

const AIRCRAFT = {
  tail: "N12345",
  type: "Cessna 172S Skyhawk",
  rev: "REV 2026-05",
};

// Pre-flight checklist (full subset for demo)
const PREFLIGHT = [
  {
    id: "cockpit-initial",
    name: "Cockpit — Initial",
    items: [
      { id: "p1",  label: "Aircraft Documents (AROW)",     value: "Check" },
      { id: "p2",  label: "Control Lock",                  value: "Remove" },
      { id: "p3",  label: "Hobbs / Tach Time",             value: "Record" },
      { id: "p4",  label: "Pitot Cover",                   value: "Remove" },
      { id: "p5",  label: "Fuel Quantity",                 value: "Check Both" },
      { id: "p6",  label: "Avionics / Electrical",         value: "Off" },
      { id: "p7",  label: "Master Switch",                 value: "On (Temp)" },
      { id: "p8",  label: "Fuel Quantity Gauges",          value: "Check Actual" },
      { id: "p9",  label: "Master Switch",                 value: "Off" },
    ],
  },
  {
    id: "empennage",
    name: "Empennage",
    items: [
      { id: "e1", label: "Tail Tie-Down",          value: "Remove" },
      { id: "e2", label: "Rudder / Elevator Surfaces", value: "Check Freedom" },
      { id: "e3", label: "Elevator Trim",          value: "Check" },
      { id: "e4", label: "Tail Structure",         value: "Inspect" },
      { id: "e5", label: "Static Port (left)",     value: "Clear" },
    ],
  },
  {
    id: "right-wing",
    name: "Right Wing",
    note: "Check for water, sediment, correct color (blue = 100LL)",
    items: [
      { id: "rw1", label: "Aileron Control",       value: "Check Freedom" },
      { id: "rw2", label: "Right Flap",            value: "Check" },
      { id: "rw3", label: "Right Fuel Sump (quick-drain)", value: "Drain & Check" },
      { id: "rw4", label: "Right Wing Tie-Down",   value: "Remove" },
      { id: "rw5", label: "Main Wheel & Tire",     value: "Inspect" },
    ],
  },
  {
    id: "nose",
    name: "Nose",
    items: [
      { id: "n1", label: "Engine Oil",             value: "Check (6–8 qt)" },
      { id: "n2", label: "Propeller & Spinner",    value: "Inspect" },
      { id: "n3", label: "Air Intake Filter",      value: "Clear" },
      { id: "n4", label: "Nose Strut & Tire",      value: "Inspect" },
      { id: "n5", label: "Fuel Strainer",          value: "Drain & Check" },
    ],
  },
  {
    id: "left-wing",
    name: "Left Wing",
    items: [
      { id: "lw1", label: "Main Wheel & Tire",     value: "Inspect" },
      { id: "lw2", label: "Left Fuel Sump",        value: "Drain & Check" },
      { id: "lw3", label: "Pitot Tube",            value: "Clear / Heat OK" },
      { id: "lw4", label: "Stall Warning Vent",    value: "Clear" },
      { id: "lw5", label: "Left Flap & Aileron",   value: "Check Freedom" },
      { id: "lw6", label: "Left Wing Tie-Down",    value: "Remove" },
    ],
  },
];

const FIRES = [
  {
    id: "engine-fire-flight",
    name: "Engine Fire — In Flight",
    warning: "DO NOT attempt restart after confirmed engine fire.",
    items: [
      { id: "ef1", label: "Mixture",          value: "Idle Cut-Off", critical: true },
      { id: "ef2", label: "Fuel Selector",    value: "Off", critical: true },
      { id: "ef3", label: "Master Switch",    value: "Off", critical: true },
      { id: "ef4", label: "Cabin Heat & Air", value: "Off (All)" },
      { id: "ef5", label: "Airspeed",         value: "100 KIAS (Smother)" },
      { id: "ef6", label: "Land ASAP",        value: "Nearest Suitable", critical: true },
    ],
  },
  {
    id: "cabin-fire",
    name: "Cabin Fire",
    warning: "After any fire — land immediately regardless of conditions.",
    items: [
      { id: "cf1", label: "Master Switch",          value: "Off", critical: true },
      { id: "cf2", label: "Avionics Master",        value: "Off" },
      { id: "cf3", label: "All Vents / Cabin Air",  value: "Closed" },
      { id: "cf4", label: "Fire Extinguisher",      value: "Discharge at Fire", critical: true },
      { id: "cf5", label: "Vents",                  value: "Open When Out" },
      { id: "cf6", label: "Land ASAP",              value: "Nearest Suitable", critical: true },
    ],
  },
  {
    id: "engine-fire-start",
    name: "Engine Fire During Start — Ground",
    items: [
      { id: "es1", label: "Continue Cranking",      value: "To Bring Fire In" },
      { id: "es2", label: "Mixture",                value: "Idle Cut-Off" },
      { id: "es3", label: "Fuel Selector",          value: "Off" },
      { id: "es4", label: "Throttle",               value: "Full Open" },
      { id: "es5", label: "Evacuate",               value: "If Fire Persists", critical: true },
    ],
  },
];

const VSPEEDS = {
  takeoff: {
    label: "Takeoff & Climb",
    items: [
      { code: "VR",  name: "Rotation",     value: 55,  unit: "KIAS" },
      { code: "VX",  name: "Best Angle",   value: 62,  unit: "KIAS" },
      { code: "VY",  name: "Best Rate",    value: 74,  unit: "KIAS" },
    ],
  },
  landing: {
    label: "Approach & Landing",
    items: [
      { code: "VAPP", name: "Final Approach", value: 65,  unit: "KIAS" },
      { code: "VS0",  name: "Stall, Landing", value: 48,  unit: "KIAS", tone: "caution" },
      { code: "VFE",  name: "Flap Extended",  value: "85/110", unit: "KIAS" },
    ],
  },
  limits: {
    label: "Structural Limits",
    items: [
      { code: "VA",  name: "Maneuvering",   value: 105, unit: "KIAS" },
      { code: "VNO", name: "Max Structural", value: 129, unit: "KIAS", tone: "caution" },
      { code: "VNE", name: "Never Exceed",  value: 163, unit: "KIAS", tone: "danger" },
    ],
  },
};

const TAKEOFF_NORMAL = {
  title: "Takeoff — Normal (Flaps 0°)",
  sub: "2550 lb · Sea Level · Std Temp · Paved / Dry",
  rows: [
    ["Sea Level",  "960 ft",  "1630 ft"],
    ["2,000 ft",   "1125 ft", "1920 ft"],
    ["4,000 ft",   "1325 ft", "2270 ft"],
    ["6,000 ft",   "1580 ft", "2720 ft"],
    ["8,000 ft",   "1900 ft", "3300 ft"],
  ],
};

const TAKEOFF_SHORT = {
  title: "Takeoff — Short Field (Flaps 10°)",
  sub: "2550 lb · Full Power Before Brake Release · VX after liftoff",
  rows: [
    ["Sea Level",  "795 ft",  "1370 ft"],
    ["2,000 ft",   "940 ft",  "1630 ft"],
    ["4,000 ft",   "1115 ft", "1950 ft"],
    ["6,000 ft",   "1335 ft", "2360 ft"],
    ["8,000 ft",   "1605 ft", "2890 ft"],
  ],
};

const CLEARANCES = [
  {
    id: "atis",
    name: "ATIS",
    sub: "Tap ARM to capture",
    fields: [
      { id: "ident",  label: "Information", placeholder: "Ident letter" },
      { id: "wind",   label: "Wind",        placeholder: "Dir/speed (e.g. 270° at 12kt)" },
      { id: "alt",    label: "Altimeter",   placeholder: "e.g. 29.92" },
      { id: "vis",    label: "Visibility",  placeholder: "e.g. 10SM" },
      { id: "sky",    label: "Sky",         placeholder: "e.g. FEW 3500" },
      { id: "caut",   label: "Caution",     placeholder: "NOTAMs / hazards / advisories" },
    ],
  },
  {
    id: "taxi",
    name: "Taxi Instructions",
    sub: "Ground frequency",
    fields: [
      { id: "rwy",    label: "Runway",       placeholder: "e.g. 12C" },
      { id: "via",    label: "Taxi Via",     placeholder: "e.g. Y > Y1 > B > H" },
      { id: "hold",   label: "Hold Short",   placeholder: "e.g. RWY 12R", critical: true },
      { id: "instr",  label: "Instructions", placeholder: "e.g. Contact tower 119.9 when ready" },
    ],
  },
  {
    id: "clearance",
    name: "Ground Clearance",
    sub: "IFR / VFR",
    fields: [
      { id: "to",     label: "Cleared To",   placeholder: "Destination" },
      { id: "route",  label: "Route",        placeholder: "Via / as filed" },
      { id: "alt2",   label: "Altitude",     placeholder: "Maintain / expect" },
      { id: "freq",   label: "Departure",    placeholder: "e.g. 124.9" },
      { id: "sq",     label: "Squawk",       placeholder: "e.g. 4271" },
    ],
  },
];

const NAV_LEFT = [
  { id: "preflight", label: "Pre Flight", count: PREFLIGHT.reduce((n, s) => n + s.items.length, 0), icon: "preflight" },
  { id: "startup",   label: "Start Up",   count: 24, icon: "startup" },
  { id: "taxi",      label: "Taxi",       count: 23, icon: "taxi" },
  { id: "to",        label: "T/O",        count: 23, icon: "takeoff" },
  { id: "cruise",    label: "Cruise",     count: 14, icon: "cruise" },
  { id: "applg",     label: "App / Lndg", count: 22, icon: "landing" },
  { id: "shutdown",  label: "Shutdown",   count: 17, icon: "power" },
];

const NAV_RIGHT = [
  { id: "fires",   label: "Fires",      count: FIRES.reduce((n, s) => n + s.items.length, 0), icon: "fire",   color: "#FF6B6B" },
  { id: "engine",  label: "Engine Fail",count: 28, icon: "engine", color: "#F5B544" },
  { id: "spin",    label: "Spin Recov", count: 12, icon: "spin",   color: "#5DD4C4" },
  { id: "icing",   label: "Icing",      count: 13, icon: "snow",   color: "#6BB6FF" },
  { id: "elec",    label: "Elec Fail",  count: 22, icon: "bolt",   color: "#FFD166" },
];

window.PILOT_DATA = {
  AIRCRAFT, PREFLIGHT, FIRES, VSPEEDS,
  TAKEOFF_NORMAL, TAKEOFF_SHORT,
  CLEARANCES, NAV_LEFT, NAV_RIGHT,
};
