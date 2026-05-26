/* =========================================================
   Generic checklist screens — Startup, Taxi, T/O, Cruise,
   App/Lndg, Shutdown + other emergencies. All thin wrappers
   reusing ChecklistSection with sample data.
   ========================================================= */

const PHASE_DATA = {
  startup: {
    title: "Start Up",
    sub: "Engine start · before taxi",
    sections: [
      {
        id: "before-start", name: "Before Start",
        items: [
          { id: "su1", label: "Preflight Inspection", value: "Complete" },
          { id: "su2", label: "Seats & Belts", value: "Adjust & Lock" },
          { id: "su3", label: "Brakes", value: "Test & Set" },
          { id: "su4", label: "Circuit Breakers", value: "Check In" },
          { id: "su5", label: "Electrical Equipment", value: "Off" },
          { id: "su6", label: "Avionics Master", value: "Off" },
          { id: "su7", label: "Fuel Selector", value: "Both" },
        ],
      },
      {
        id: "engine-start", name: "Engine Start",
        items: [
          { id: "es1b", label: "Throttle", value: "Open 1/4 inch" },
          { id: "es2b", label: "Mixture", value: "Rich" },
          { id: "es3b", label: "Prime", value: "3 strokes (cold)" },
          { id: "es4b", label: "Master Switch", value: "On" },
          { id: "es5b", label: "Beacon", value: "On" },
          { id: "es6b", label: "Propeller Area", value: "Clear" },
          { id: "es7b", label: "Ignition", value: "Start" },
          { id: "es8b", label: "Oil Pressure", value: "Check (<30s)", critical: true },
        ],
      },
    ],
  },
  taxi: {
    title: "Taxi",
    sub: "Ground operations",
    sections: [
      {
        id: "taxi-check", name: "Taxi Check",
        items: [
          { id: "t1", label: "Brakes", value: "Test" },
          { id: "t2", label: "Flight Instruments", value: "Check" },
          { id: "t3", label: "Heading Indicator", value: "Set" },
          { id: "t4", label: "Attitude Indicator", value: "Check" },
          { id: "t5", label: "Turn Coordinator", value: "Check" },
          { id: "t6", label: "ATIS / AWOS", value: "Obtain" },
          { id: "t7", label: "Taxi Clearance", value: "Obtain" },
        ],
      },
    ],
  },
  to: {
    title: "Takeoff",
    sub: "Before takeoff · departure",
    sections: [
      {
        id: "runup", name: "Run-Up · 1700 RPM",
        items: [
          { id: "ru1", label: "Mag Check", value: "≤175 RPM drop" },
          { id: "ru2", label: "Carb Heat", value: "Off" },
          { id: "ru3", label: "Engine Instruments", value: "Green" },
          { id: "ru4", label: "Suction", value: "4.5–5.5 in Hg" },
          { id: "ru5", label: "Throttle Idle", value: "Check 600 RPM" },
        ],
      },
      {
        id: "before-to", name: "Before Takeoff",
        items: [
          { id: "bt1", label: "Flight Controls", value: "Free & Correct" },
          { id: "bt2", label: "Trim", value: "Set Takeoff" },
          { id: "bt3", label: "Flaps", value: "0° (10° short field)" },
          { id: "bt4", label: "Doors & Windows", value: "Closed & Locked" },
          { id: "bt5", label: "Transponder", value: "ALT" },
          { id: "bt6", label: "Lights", value: "As Required" },
        ],
      },
    ],
  },
  cruise: {
    title: "Cruise",
    sub: "En-route operations",
    sections: [
      {
        id: "cruise-set", name: "Cruise",
        items: [
          { id: "c1", label: "Power", value: "Set (65–75%)" },
          { id: "c2", label: "Mixture", value: "Lean for Altitude" },
          { id: "c3", label: "Trim", value: "Adjust" },
          { id: "c4", label: "Engine Instruments", value: "Monitor" },
          { id: "c5", label: "Fuel Quantity", value: "Check" },
          { id: "c6", label: "Position & Time", value: "Log" },
        ],
      },
    ],
  },
  applg: {
    title: "Approach & Landing",
    sub: "Descent · pattern · landing",
    sections: [
      {
        id: "descent", name: "Descent",
        items: [
          { id: "d1", label: "Altimeter", value: "Set" },
          { id: "d2", label: "Mixture", value: "Rich" },
          { id: "d3", label: "Fuel Selector", value: "Both" },
          { id: "d4", label: "Landing Light", value: "On" },
          { id: "d5", label: "Seat Belts", value: "Fastened" },
        ],
      },
      {
        id: "land", name: "Landing",
        items: [
          { id: "l1", label: "Airspeed", value: "65 KIAS" },
          { id: "l2", label: "Flaps", value: "Full" },
          { id: "l3", label: "Trim", value: "Set" },
          { id: "l4", label: "Touchdown", value: "Main Wheels First" },
          { id: "l5", label: "Brakes", value: "As Required" },
        ],
      },
    ],
  },
  shutdown: {
    title: "Shutdown",
    sub: "Securing the aircraft",
    sections: [
      {
        id: "shut", name: "Shutdown",
        items: [
          { id: "sd1", label: "Parking Brake", value: "Set" },
          { id: "sd2", label: "Throttle", value: "Idle" },
          { id: "sd3", label: "Avionics Master", value: "Off" },
          { id: "sd4", label: "Electrical Equipment", value: "Off" },
          { id: "sd5", label: "Mixture", value: "Idle Cut-Off" },
          { id: "sd6", label: "Ignition", value: "Off" },
          { id: "sd7", label: "Master Switch", value: "Off" },
          { id: "sd8", label: "Control Lock", value: "Install" },
          { id: "sd9", label: "Pitot Cover", value: "Install" },
        ],
      },
    ],
  },
};

const EMG_DATA = {
  engine: {
    title: "Engine Failure",
    sub: "Memory items · partial / complete power loss",
    sections: [
      {
        id: "ef-flight", name: "Engine Failure In Flight",
        warning: "Fly the airplane first — establish best glide before troubleshooting.",
        items: [
          { id: "egf1", label: "Airspeed", value: "68 KIAS Best Glide", critical: true },
          { id: "egf2", label: "Best Field", value: "Select", critical: true },
          { id: "egf3", label: "Fuel Selector", value: "Both" },
          { id: "egf4", label: "Mixture", value: "Rich" },
          { id: "egf5", label: "Carb Heat", value: "On" },
          { id: "egf6", label: "Ignition", value: "Try Both / Start" },
          { id: "egf7", label: "Primer", value: "In & Locked" },
          { id: "egf8", label: "Mayday", value: "121.5", critical: true },
        ],
      },
    ],
  },
  spin: {
    title: "Spin Recovery", sub: "P · A · R · E",
    sections: [{
      id: "spin", name: "Spin Recovery — PARE",
      warning: "Apply controls firmly, in sequence. Hold until rotation stops.",
      items: [
        { id: "sp1", label: "P · Power", value: "Idle", critical: true },
        { id: "sp2", label: "A · Ailerons", value: "Neutral", critical: true },
        { id: "sp3", label: "R · Rudder", value: "Opposite Spin", critical: true },
        { id: "sp4", label: "E · Elevator", value: "Forward (Briskly)", critical: true },
      ],
    }],
  },
  icing: {
    title: "Inadvertent Icing", sub: "Exit icing conditions immediately",
    sections: [{
      id: "ice", name: "Icing Encounter",
      items: [
        { id: "ic1", label: "Pitot Heat", value: "On" },
        { id: "ic2", label: "Carb Heat", value: "On" },
        { id: "ic3", label: "Cabin Heat / Defrost", value: "Max" },
        { id: "ic4", label: "Altitude", value: "Change (out of ice)" },
        { id: "ic5", label: "Airspeed", value: "+10 KIAS (Tail Stall)" },
      ],
    }],
  },
  elec: {
    title: "Electrical Failure", sub: "Loss of alternator / battery",
    sections: [{
      id: "alt-fail", name: "Alternator Failure",
      items: [
        { id: "el1", label: "ALT Field Switch", value: "Off then On" },
        { id: "el2", label: "Avionics Master", value: "Off" },
        { id: "el3", label: "All Non-Essential", value: "Off" },
        { id: "el4", label: "Land ASAP", value: "Nearest Suitable", critical: true },
      ],
    }],
  },
};

function GenericChecklistScreen({ phase, checked, toggleItem, tone = "default", accent }) {
  const data = PHASE_DATA[phase] || EMG_DATA[phase];
  if (!data) return null;
  const total = data.sections.reduce((n, s) => n + s.items.length, 0);
  const done = data.sections.reduce((n, s) => n + s.items.filter(i => checked[i.id]).length, 0);
  const pct = total ? Math.round((done/total)*100) : 0;
  const allDone = done === total;
  const titleColor = accent || (tone === "warn" ? "var(--warn)" : undefined);

  return (
    <div className="content-inner" style={accent ? { "--screen-accent": accent } : undefined}>
      <header className="page-header" style={tone === "warn" ? { borderBottomColor: accent ? accent : "var(--warn-line)" } : undefined}>
        <div>
          <h1 className="page-title" style={titleColor ? { color: titleColor } : undefined}>{data.title}</h1>
          <div className="page-subtitle">{data.sub}</div>
        </div>
        <div className="page-meta">
          <span className={`chip ${allDone ? "chip-done" : tone === "warn" ? "chip-warn" : "chip-progress"}`}>
            {allDone ? "READY" : "IN PROGRESS"} · <span className="chip-num">{done}/{total}</span>
          </span>
          <button className="btn btn-icon"><Icon name="reset" size={14}/></button>
        </div>
      </header>

      {data.sections.map((sec) => (
        <ChecklistSection key={sec.id} section={sec} checked={checked} toggleItem={toggleItem} tone={tone}/>
      ))}
    </div>
  );
}

window.GenericChecklistScreen = GenericChecklistScreen;
window.PHASE_DATA = PHASE_DATA;
window.EMG_DATA = EMG_DATA;
