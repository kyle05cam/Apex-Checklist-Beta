const { useState, useEffect, useRef, useMemo, useCallback } = React;

const PAGES = [
  {
    id: "preflight", icon: "✈", label: "PRE\nFLIGHT",
    sections: [
      { title: "Cockpit — Initial", items: [
        { l: "Aircraft Documents (AROW)", a: "CHECK" },
        { l: "Control Lock", a: "REMOVE" },
        { l: "Hobbs / Tach Time", a: "RECORD" },
        { l: "Pitot Cover", a: "REMOVE" },
        { l: "Fuel Quantity", a: "CHECK BOTH" },
        { l: "Avionics / Electrical", a: "OFF" },
        { l: "Master Switch", a: "ON (TEMP)" },
        { l: "Fuel Quantity Gauges", a: "CHECK ACTUAL" },
        { l: "Master Switch", a: "OFF" },
      ]},
      { title: "Empennage", items: [
        { l: "Tail Tie-Down", a: "REMOVE" },
        { l: "Rudder / Elevator Surfaces", a: "CHECK FREEDOM" },
        { l: "Elevator Trim", a: "CHECK" },
        { l: "Tail Structure", a: "INSPECT" },
        { l: "Static Port (left)", a: "CLEAR" },
      ]},
      { title: "Right Wing", items: [
        { l: "Aileron Control", a: "CHECK FREEDOM" },
        { l: "Right Flap", a: "CHECK" },
        { l: "Right Fuel Sump (quick-drain)", a: "DRAIN & CHECK" },
        { type: "note", l: "Check for water, sediment, correct color (blue = 100LL)" },
        { l: "Right Main Tank Fuel Cap", a: "SECURE, VENT CLEAR" },
        { l: "Pitot Tube", a: "CLEAR, COVER OFF" },
        { l: "Right Nav / Strobe Light", a: "INSPECT" },
      ]},
      { title: "Nose", items: [
        { l: "Engine Oil Level", a: "6-8 QTS (MIN 6)" },
        { l: "Fuel & Sump Drains", a: "DRAIN & CHECK" },
        { l: "Propeller & Spinner", a: "INSPECT, NO NICKS" },
        { l: "Air Inlets", a: "CLEAR" },
        { l: "Nosegear / Shimmy Damper", a: "CHECK" },
        { l: "Alternator Belt", a: "TENSION CHECK" },
        { l: "Cowl Fasteners", a: "SECURE" },
      ]},
      { title: "Left Wing & Final", items: [
        { l: "Left Fuel Sump", a: "DRAIN & CHECK" },
        { l: "Left Main Tank Fuel Cap", a: "SECURE, VENT CLEAR" },
        { l: "Left Main Tire", a: "CONDITION / PRESSURE" },
        { l: "Stall Warning Vane", a: "TEST (SUCTION)" },
        { l: "Left Aileron", a: "CHECK FREEDOM" },
        { l: "Fuel Selector", a: "BOTH" },
        { l: "Seats & Seat Belts", a: "ADJUST & LATCH" },
        { l: "Doors", a: "LATCHED" },
      ]},
    ]
  },
  {
    id: "startup", icon: "⚙", label: "START\nUP",
    sections: [
      { title: "Before Start", items: [
        { l: "Preflight Inspection", a: "COMPLETE" },
        { l: "Seats, Belts, Harness", a: "ADJUSTED, LOCKED" },
        { l: "Brakes", a: "TEST & HOLD" },
        { l: "Circuit Breakers", a: "IN (CHECK ALL)" },
        { l: "Electrical Equipment", a: "OFF" },
        { l: "Fuel Selector", a: "BOTH" },
        { l: "Avionics Master", a: "OFF" },
      ]},
      { title: "Engine Start", items: [
        { l: "Master Switch", a: "ON" },
        { l: "Beacon", a: "ON" },
        { type: "caution", l: "CAUTION: Shout CLEAR PROP before start" },
        { l: "Mixture", a: "RICH" },
        { l: "Throttle", a: "1/4 INCH OPEN" },
        { l: "Prime (cold start)", a: "AS REQUIRED (2-3x)" },
        { l: "Ignition Switch", a: "START" },
        { l: "Oil Pressure", a: "CHECK (30 SEC)" },
        { l: "Throttle", a: "REDUCE TO 1000 RPM" },
        { l: "Avionics Master", a: "ON" },
        { l: "Radios / GPS / Transponder", a: "SET", notepad: true, notepadLabel: "FREQ NOTES", notepadFooter: "GND _ _ _ _ TWR _ _ _ _ ATIS _ _ _ _ CTAF _ _ _" },
        { l: "ATIS / Weather", a: "OBTAIN", notepad: true, notepadLabel: "ATIS / WX NOTES", notepadFooter: "INFO _ WIND _ _ _ ALT _ _ _ _ VIS _ _ WX _ _ _ _" },
      ]},
      { title: "Warm-Up Checks", items: [
        { l: "Oil Temp & Pressure", a: "WITHIN LIMITS" },
        { l: "Alternator / Ammeter", a: "CHARGING" },
        { l: "Suction Gauge", a: "4.5-5.4 IN HG" },
        { l: "Altimeter", a: "SET & X-CHECK" },
        { l: "Heading Indicator", a: "ALIGN TO COMPASS" },
        { l: "Flight Instruments", a: "CHECK ALL" },
      ]},
    ]
  },
  {
    id: "taxi", icon: "🛞", label: "TAXI",
    sections: [
      { title: "Taxi Clearance", items: [
        { l: "ATIS Information", a: "COPIED & SET", notepad: true, notepadLabel: "ATIS NOTEPAD", notepadFooter: "INFO _ WIND _ _ _ ALT _ _ _ _ RWY _ _ RMKS _ _" },
        { l: "Clearance / Taxi Instruction", a: "OBTAIN", notepad: true, notepadLabel: "TAXI CLEARANCE", notepadFooter: "RWY _ _ TAXI VIA _ _ _ _ _ HOLD SHORT _ _ _ _ _" },
        { l: "Transponder", a: "1200 / SQUAWK" },
        { l: "Lights", a: "AS REQUIRED" },
        { l: "Parking Brake", a: "RELEASE" },
      ]},
      { title: "While Taxiing", items: [
        { l: "Brakes", a: "TEST IMMEDIATELY" },
        { l: "HSI / Directional Gyro", a: "CHECK DURING TURNS" },
        { l: "Attitude Indicator", a: "UPRIGHT, STABLE" },
        { l: "Turn Coordinator", a: "CORRECT INDICATION" },
        { l: "Magnetic Compass", a: "SWINGS FREELY" },
        { type: "note", l: "Hold-short lines: solid bars = do not cross without clearance" },
      ]},
      { title: "Run-Up Area", items: [
        { l: "Park Into Wind If Possible", a: "POSITION" },
        { l: "Brakes", a: "SET" },
        { l: "Flight Controls", a: "FREE & CORRECT" },
        { l: "Fuel Selector", a: "BOTH" },
        { l: "Elevator Trim", a: "TAKEOFF (T.O.)" },
        { l: "Throttle", a: "1800 RPM" },
        { l: "Magneto Check", a: "L/R MAX 125 RPM DROP" },
        { l: "Engine Instruments", a: "GREEN ARC" },
        { l: "Mixture", a: "RICH (< 3000 MSL)" },
        { l: "Throttle", a: "IDLE CHECK (700 RPM)" },
        { l: "Throttle", a: "1000 RPM" },
        { l: "Carb Heat", a: "CHECK" },
        { l: "Primer", a: "IN & LOCKED" },
      ]},
    ]
  },
  {
    id: "takeoff", icon: "↑", label: "T/O",
    sections: [
      { title: "Before Takeoff", items: [
        { l: "Run-Up Complete", a: "CONFIRMED" },
        { l: "Doors & Windows", a: "CLOSED & LATCHED" },
        { l: "Seats & Harnesses", a: "SECURE" },
        { l: "Brakes", a: "APPLY" },
        { l: "Transponder", a: "ALT" },
        { l: "Lights (Strobes, Landing)", a: "ON" },
        { l: "Fuel Selector", a: "BOTH" },
        { l: "Mixture", a: "RICH" },
        { l: "Flaps", a: "0 NORMAL / 10 SOFT FLD" },
        { l: "DI / Heading Bug", a: "SET R/W HEADING" },
      ]},
      { title: "Takeoff Roll", items: [
        { l: "Cleared for Takeoff", a: "ATC CLEARANCE" },
        { l: "Throttle", a: "FULL (SMOOTHLY)" },
        { l: "Engine Gauges", a: "IN THE GREEN" },
        { l: "Airspeed Alive", a: "CALL OUT" },
        { l: "Rotate (VR)", a: "55 KIAS" },
        { l: "Pitch Attitude", a: "5-8 DEG NOSE UP" },
      ]},
      { title: "Initial Climb", items: [
        { l: "Positive Rate of Climb", a: "CONFIRM" },
        { l: "Airspeed (Vy)", a: "74 KIAS" },
        { l: "Flaps", a: "RETRACT > 60 KIAS" },
        { l: "Trim", a: "AS NEEDED" },
        { l: "Turn Crosswind >= 400 AGL", a: "ATC / PATTERN" },
        { l: "Fuel Gauges", a: "RECHECK" },
        { l: "Engine Instruments", a: "MONITOR" },
      ]},
    ]
  },
  {
    id: "cruise",
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
        <path d="M2 14l3-2 2 1 5-3.5V8l1.5-.5L14 9l4-2.5 2.5-.5L22 7.5l-4 2.5-3 1.5-3 4-2-.5-1-2-3 1.5L2 14z" fill="currentColor" opacity="0.9"/>
        <line x1="2" y1="17" x2="22" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35"/>
      </svg>
    ),
    label: "CRUISE",
    sections: [
      { title: "Cruise Established", items: [
        { l: "Power Setting", a: "2300-2500 RPM" },
        { l: "Altitude", a: "LEVEL OFF + 500 FT" },
        { l: "Mixture (Leaning)", a: "LEAN TO PEAK -50 F" },
        { l: "Throttle", a: "CRUISE POWER" },
        { l: "Trim", a: "ADJUST" },
        { l: "Fuel Selector", a: "RECHECK BOTH" },
        { l: "Fuel Burn & Remaining", a: "CALCULATE" },
      ]},
      { title: "Periodic Checks", items: [
        { l: "Engine Instruments", a: "EVERY 5-10 MIN" },
        { l: "Altimeter", a: "RECHECK / UPDATE" },
        { l: "Heading", a: "TRACK VS PLAN" },
        { l: "Fuel Remaining vs Plan", a: "VERIFY" },
        { l: "ATIS / ASOS Updates", a: "OBTAIN DEST WX" },
        { l: "Transponder & Squawk", a: "VERIFY" },
        { l: "Lights", a: "AS REQUIRED" },
        { type: "note", l: "IMSAFE & PAVE checks should already be complete pre-flight" },
      ]},
    ]
  },
  {
    id: "approach", icon: "↓", label: "APP\nLDG",
    sections: [
      { title: "Approach Preparation", items: [
        { l: "ATIS / AWOS", a: "OBTAIN & SET", notepad: true, notepadLabel: "DEST ATIS", notepadFooter: "INFO _ WIND _ _ _ ALT _ _ _ _ RWY _ _ RMKS _ _ _" },
        { l: "Altimeter", a: "SET & X-CHECK" },
        { l: "Approach Briefing", a: "COMPLETE", notepad: true, notepadLabel: "APPR BRIEF", notepadFooter: "IAF _ _ _ FAF _ _ _ MDA/DA _ _ _ VIS _ _ MAP _ _" },
        { l: "Fuel Selector", a: "BOTH" },
        { l: "Mixture", a: "RICH (BELOW 3K)" },
        { l: "Carb Heat", a: "ON (IF REQD)" },
        { l: "Landing Light", a: "ON" },
      ]},
      { title: "Downwind Leg", items: [
        { l: "Airspeed", a: "REDUCE TO 90 KIAS" },
        { l: "Throttle (Abeam Threshold)", a: "1700 RPM" },
        { l: "Flaps (1st Notch)", a: "10 DEG" },
        { l: "Airspeed", a: "80 KIAS" },
      ]},
      { title: "Base & Final", items: [
        { l: "Flaps", a: "20 DEG" },
        { l: "Airspeed", a: "70-75 KIAS" },
        { l: "Final Flaps", a: "30 DEG (FULL NORMAL)" },
        { l: "Airspeed Final", a: "65 KIAS" },
        { l: "Power", a: "AS REQUIRED" },
        { type: "note", l: "Stabilized by 500 AGL. Go-around if not stable." },
      ]},
      { title: "After Landing", items: [
        { l: "Brakes", a: "APPLY SMOOTHLY" },
        { l: "Flaps", a: "RETRACT" },
        { l: "Carb Heat", a: "OFF" },
        { l: "Transponder", a: "1200 / STBY" },
        { l: "Strobe Lights", a: "OFF" },
        { l: "Taxi Speed", a: "SAFE / ATC INSTR." },
      ]},
    ]
  },
  {
    id: "shutdown", icon: "◼", label: "SHUT\nDOWN",
    sections: [
      { title: "Engine Shutdown", items: [
        { l: "Taxi to Parking", a: "CLEAR & PARK" },
        { l: "ELT", a: "ARM, NOT TRANSMIT" },
        { l: "Avionics Master", a: "OFF" },
        { l: "Throttle (1 Min Cool)", a: "1000 RPM" },
        { l: "Mixture", a: "IDLE CUT-OFF (PULL)" },
        { l: "Ignition Switch", a: "OFF WHEN RPM DROPS" },
        { l: "Master Switch", a: "OFF" },
        { l: "Beacon / All Lights", a: "OFF" },
        { l: "Control Lock", a: "INSTALL" },
      ]},
      { title: "Securing Aircraft", items: [
        { l: "Fuel Selector", a: "BOTH" },
        { l: "Hobbs Time", a: "RECORD" },
        { l: "Parking Brake", a: "SET" },
        { l: "Pitot Cover", a: "INSTALL" },
        { l: "Tie-Down (3 Points)", a: "SECURE" },
        { l: "Chocks", a: "PLACE IF NEEDED" },
        { l: "Squawk Sheet", a: "COMPLETE IF REQD" },
        { l: "Doors & Windows", a: "LOCKED" },
      ]},
    ]
  },
];

const EMG_PAGES = [
  {
    id: "fires", label: "FIRES", color: "#e85a4a", dimColor: "#7a3030",
    icon: (size) => (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <path d="M12 2C12 2 7.5 6.5 7.5 11C7.5 11 5.5 9 5.5 9C5.5 9 3.5 13.5 3.5 16C3.5 20.4 7.4 23.5 12 23.5C16.6 23.5 20.5 20.4 20.5 16C20.5 10.5 12 2 12 2Z" fill="#e85a4a" opacity="0.85"/>
        <path d="M12 8C12 8 9.5 12 9.5 14.5C9.5 14.5 8.2 13 8.2 13C8.2 13 7 15.5 7 16.5C7 18.7 9.2 20.5 12 20.5C14.8 20.5 17 18.7 17 16.5C17 13 12 8 12 8Z" fill="#ff8830" opacity="0.95"/>
        <path d="M12 13.5C12 13.5 10.5 15.5 10.5 16.5C10.5 17.6 11.1 18.5 12 18.5C12.9 18.5 13.5 17.6 13.5 16.5C13.5 15.5 12 13.5 12 13.5Z" fill="#ffe060"/>
      </svg>
    ),
    sections: [
      { title: "Engine Fire — In Flight",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M5 20l4-2 14-6 4-2" stroke="#e85a4a" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M5 22l3-1" stroke="#e85a4a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            <path d="M16 8c0 0-2.5 2.5-2.5 5 0 0-1-1-1-1s-1 2.5-1 4c0 2.5 2 4 4.5 4s4.5-1.5 4.5-4c0-3.5-4.5-8-4.5-8z" fill="#e85a4a" opacity="0.85"/>
            <path d="M16 12c0 0-1.5 2-1.5 3.5 0 0-.8-.8-.8-.8s-.7 1.5-.7 2.3c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5c0-2.2-3-5-3-5z" fill="#ff8830"/>
            <path d="M16 15.5c0 0-1 1.2-1 2s.5 1.5 1 1.5 1-.7 1-1.5-1-2-1-2z" fill="#ffe060"/>
          </svg>
        ),
        items: [
        { l: "Mixture", a: "IDLE CUT-OFF" },
        { l: "Fuel Selector", a: "OFF" },
        { l: "Master Switch", a: "OFF" },
        { l: "Cabin Heat & Air", a: "OFF (ALL)" },
        { l: "Airspeed", a: "100 KIAS (SMOTHER)" },
        { type: "caution", l: "DO NOT attempt restart after confirmed engine fire" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
      ]},
      { title: "Cabin Fire",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <rect x="5" y="12" width="22" height="14" rx="2" stroke="#e85a4a" strokeWidth="1.6" fill="rgba(232,90,74,0.08)"/>
            <path d="M5 16h22" stroke="#e85a4a" strokeWidth="1" opacity="0.3"/>
            <circle cx="9" cy="9" r="2.5" fill="none" stroke="#e85a4a" strokeWidth="1.4"/>
            <circle cx="23" cy="9" r="2.5" fill="none" stroke="#e85a4a" strokeWidth="1.4"/>
            <path d="M16 14c0 0-1.8 2-1.8 3.5 0 0-.8-.8-.8-.8s-.7 2-.7 3c0 1.8 1.5 3 3.3 3s3.3-1.2 3.3-3c0-2.5-3.3-5.7-3.3-5.7z" fill="#e85a4a" opacity="0.9"/>
            <path d="M16 17c0 0-1 1.5-1 2.5s.5 1.8 1 1.8 1-.8 1-1.8-1-2.5-1-2.5z" fill="#ff8830"/>
          </svg>
        ),
        items: [
        { l: "Master Switch", a: "OFF" },
        { l: "Avionics Master", a: "OFF" },
        { l: "All Vents / Cabin Air / Heat", a: "CLOSED" },
        { l: "Fire Extinguisher", a: "DISCHARGE AT FIRE" },
        { l: "Vents", a: "OPEN WHEN FIRE OUT" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
        { type: "caution", l: "After any fire — land immediately regardless of conditions" },
      ]},
      { title: "Engine Fire During Start — Ground",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <ellipse cx="16" cy="26" rx="8" ry="2" fill="rgba(232,90,74,0.15)" stroke="#e85a4a" strokeWidth="1"/>
            <path d="M11 26V18l-3 2V15l8-8 8 8v5l-3-2v8" stroke="#e85a4a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="rgba(232,90,74,0.05)"/>
            <path d="M14 13c0 0-1.5 1.8-1.5 3 0 0-.6-.6-.6-.6s-.6 1.5-.6 2.5c0 1.5 1.2 2.5 2.7 2.5s2.7-1 2.7-2.5c0-2-2.7-4.9-2.7-4.9z" fill="#e85a4a"/>
            <path d="M14 16c0 0-.8 1.2-.8 2s.4 1.3.8 1.3.8-.5.8-1.3-.8-2-.8-2z" fill="#ff8830"/>
          </svg>
        ),
        items: [
        { l: "Continue Cranking", a: "TO BRING FIRE IN" },
        { l: "Mixture", a: "IDLE CUT-OFF" },
        { l: "Fuel Selector", a: "OFF" },
        { l: "Throttle", a: "FULL OPEN" },
        { l: "Master Switch", a: "OFF" },
        { l: "Ignition Switch", a: "OFF" },
        { l: "Parking Brake", a: "SET" },
        { l: "Evacuate Aircraft", a: "IMMEDIATELY" },
        { l: "Fire Extinguisher / Fire Dept", a: "USE / CALL 911" },
      ]},
      { title: "Electrical Fire — In Flight",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M5 20l4-2 14-6 4-2" stroke="#e85a4a" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M5 22l3-1" stroke="#e85a4a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            <path d="M19 6l-4 6h3l-4 8" stroke="#ffe060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 6l-4 6h3l-4 8" stroke="#e85a4a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
          </svg>
        ),
        items: [
        { l: "Master Switch", a: "OFF" },
        { l: "All Avionics", a: "OFF" },
        { l: "All Electrical Equipment", a: "OFF" },
        { l: "Vents / Cabin Air", a: "OPEN (VENTILATE)" },
        { l: "Fire Extinguisher", a: "USE IF REQD" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
        { type: "note", l: "Restore electrical one item at a time only if needed for nav" },
      ]},
      { title: "Wing Fire",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 18l6-2 8-4 10-5" stroke="#e85a4a" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 20l4-1" stroke="#e85a4a" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            <path d="M10 16c0 0-1.2 1.5-1.2 2.8 0 0-.5-.5-.5-.5s-.5 1.2-.5 2c0 1.2 1 2 2.2 2s2.2-.8 2.2-2c0-1.8-2.2-4.3-2.2-4.3z" fill="#e85a4a"/>
            <path d="M10 19c0 0-.6 1-.6 1.8s.3 1.2.6 1.2.6-.4.6-1.2-.6-1.8-.6-1.8z" fill="#ff8830"/>
          </svg>
        ),
        items: [
        { l: "Navigation / Strobe Lights", a: "OFF" },
        { l: "Pitot Heat (if installed)", a: "OFF" },
        { l: "Perform Sideslip", a: "DIRECT FLAMES AWAY" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
        { type: "caution", l: "Wing fire — do NOT fight it from cockpit. Land immediately." },
      ]},
    ]
  },
  {
    id: "engine_fail", label: "ENGINE\nFAIL", color: "#e8c84a", dimColor: "#7a6a20",
    icon: (size) => (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <rect x="2.5" y="8" width="19" height="8" rx="1.5" stroke="#e8c84a" strokeWidth="1.4" fill="rgba(232,200,74,0.1)"/>
        <rect x="6" y="10" width="3" height="4" rx="0.5" fill="#e8c84a" opacity="0.75"/>
        <rect x="10.5" y="10" width="3" height="4" rx="0.5" fill="#e8c84a" opacity="0.75"/>
        <path d="M5.5 8V6M9.5 8V5M14.5 8V6M18.5 8V5" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M2.5 12H1M23 12H21.5" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M5.5 16V18M9.5 16V19M14.5 16V18M18.5 16V19" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="17" cy="12" r="1" fill="#e8c84a"/>
        <line x1="14" y1="20" x2="20" y2="20" stroke="#e85a4a" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="17" y1="20" x2="17" y2="23" stroke="#e85a4a" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    sections: [
      { title: "Engine Failure After Takeoff",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 20l4-2 14-6 4-2" stroke="#e8c84a" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 22l3-1" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            <path d="M16 8l-2 10" stroke="#e8c84a" strokeWidth="2" strokeLinecap="round"/>
            <path d="M13 16l3 2 3-2" stroke="#e8c84a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 22l3 4 3-4" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
          </svg>
        ),
        items: [
        { l: "Airspeed", a: "68 KIAS (GLIDE)" },
        { type: "caution", l: "CRITICAL: NO 180-deg turn back if below 1000 AGL" },
        { l: "Throttle", a: "IDLE" },
        { l: "Fuel Selector", a: "OFF" },
        { l: "Mixture", a: "IDLE CUT-OFF" },
        { l: "Ignition", a: "OFF" },
        { l: "Master Switch", a: "OFF (BEFORE TOUCH)" },
        { l: "Land Straight Ahead", a: "EXECUTE" },
      ]},
      { title: "Engine Failure on Takeoff Roll",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M3 21l5-2 16-7 4-2" stroke="#e8c84a" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M3 23l3-1" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            <line x1="4" y1="26" x2="28" y2="26" stroke="#e8c84a" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
            <path d="M13 21v5" stroke="#e8c84a" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M11 24l2 2 2-2" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="20" y="18" width="5" height="3" rx="1" fill="none" stroke="#e85a4a" strokeWidth="1.3"/>
            <line x1="21" y1="17" x2="22" y2="15" stroke="#e85a4a" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="23" y1="17" x2="23" y2="15" stroke="#e85a4a" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ),
        items: [
        { l: "Throttle", a: "IDLE" },
        { l: "Brakes", a: "APPLY MAXIMUM" },
        { l: "Mixture", a: "IDLE CUT-OFF" },
        { l: "Fuel Selector", a: "OFF" },
        { l: "Ignition", a: "OFF" },
        { l: "Master Switch", a: "OFF" },
        { l: "Evacuate if Fire", a: "IMMEDIATELY" },
      ]},
      { title: "Forced Landing Without Power",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 16l4-2 14-4 4-1" stroke="#e8c84a" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 18l3-1" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            <path d="M8 9 Q16 12 24 22" stroke="#e8c84a" strokeWidth="1.6" strokeDasharray="2 2" strokeLinecap="round" fill="none" opacity="0.6"/>
            <line x1="4" y1="28" x2="28" y2="28" stroke="#e8c84a" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            <path d="M22 22l2 6-4-1" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        items: [
        { l: "Best Glide Speed", a: "68 KIAS" },
        { l: "Fuel Selector", a: "BOTH" },
        { l: "Mixture", a: "RICH" },
        { l: "Primer", a: "IN & LOCKED" },
        { l: "Throttle", a: "ADVANCE (BRIEFLY)" },
        { l: "Ignition", a: "BOTH (ATTEMPT RESTART)" },
        { l: "Carb Heat", a: "ON" },
        { l: "Mayday on 121.5", a: "BROADCAST" },
        { l: "Squawk", a: "7700" },
        { l: "Select Landing Field", a: "INTO WIND / FLAT" },
        { l: "Seatbelts", a: "TIGHT" },
        { l: "Fuel Selector", a: "OFF" },
        { l: "Mixture", a: "IDLE CUT-OFF" },
        { l: "Ignition", a: "OFF" },
        { l: "Master Switch", a: "OFF BEFORE TOUCH" },
        { l: "Doors", a: "UNLATCH BEFORE TOUCH" },
      ]},
      { title: "Precautionary Landing With Power",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 18l4-2 14-5 4-2" stroke="#e8c84a" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 20l3-1" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            <path d="M10 11 Q16 14 22 22" stroke="#e8c84a" strokeWidth="1.4" strokeDasharray="2 2" strokeLinecap="round" fill="none" opacity="0.55"/>
            <line x1="4" y1="28" x2="28" y2="28" stroke="#e8c84a" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            <path d="M19 22l1 4-3 0" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="22" cy="10" r="3" fill="none" stroke="#3dbe6c" strokeWidth="1.5"/>
            <path d="M20.5 10l1 1 2-2" stroke="#3dbe6c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        items: [
        { l: "Airspeed", a: "60 KIAS" },
        { l: "Select Field", a: "INTO WIND, INSPECT" },
        { l: "Low Pass Inspection", a: "50-100 FT AGL" },
        { l: "Flaps on Final", a: "30 DEG" },
        { l: "Airspeed Over Fence", a: "60 KIAS" },
        { l: "Radio / Transponder", a: "SQUAWK 7700 IF REQD" },
        { l: "Mixture", a: "RICH" },
      ]},
      { title: "Engine Roughness / Loss of Power",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 18l4-2 14-5 4-2" stroke="#e8c84a" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 20l3-1" stroke="#e8c84a" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            <path d="M18 6 l2 3 l-2 3 l2 3 l-2 3" stroke="#e85a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="18" cy="6" r="1.5" fill="#e85a4a"/>
          </svg>
        ),
        items: [
        { l: "Carb Heat", a: "ON (CHECK FOR ICE)" },
        { l: "Fuel Selector", a: "SWITCH TANKS" },
        { l: "Mixture", a: "ADJUST (ENRICH)" },
        { l: "Primer", a: "IN & LOCKED" },
        { l: "Ignition Switch", a: "TRY OPPOSITE MAG" },
        { l: "Engine Instruments", a: "CHECK INDICATIONS" },
        { l: "Fuel Pump", a: "ON" },
        { type: "note", l: "If roughness continues — plan precautionary or forced landing" },
      ]},
    ]
  },
  {
    id: "spin", label: "SPIN\nRECOV", color: "#4ae8c8", dimColor: "#206a58",
    icon: (size) => (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <path d="M20 12C20 16.4 16.4 20 12 20C7.6 20 4 16.4 4 12C4 8.2 6.4 5 9.8 3.8" stroke="#4ae8c8" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
        <path d="M16 4L20 4L20 8" stroke="#4ae8c8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 4L14 10" stroke="#4ae8c8" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="12" y1="8" x2="12" y2="16" stroke="#4ae8c8" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="8.5" y1="15" x2="15.5" y2="15" stroke="#4ae8c8" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="8" x2="9.5" y2="11" stroke="#4ae8c8" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="12" y1="8" x2="14.5" y2="11" stroke="#4ae8c8" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    sections: [
      { title: "Spin Recovery — C172S (PARE Method)",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M22 10 C22 16 16 22 10 20 C4 18 4 10 10 8 C13 7 16 8 18 10" stroke="#4ae8c8" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <path d="M18 6l4 4l-4 4" stroke="#4ae8c8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 16l-4-2 4-2" fill="#4ae8c8" opacity="0.7"/>
            <path d="M14 20l2 6" stroke="#4ae8c8" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M12 24l2 2 2-2" stroke="#4ae8c8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        items: [
        { type: "caution", l: "CAUTION: Spins require altitude. Begin recovery IMMEDIATELY." },
        { l: "P — Power", a: "THROTTLE IDLE" },
        { l: "A — Ailerons", a: "NEUTRAL" },
        { l: "R — Rudder", a: "FULL OPPOSITE TO SPIN" },
        { l: "E — Elevator", a: "BRISK FORWARD PUSH" },
        { l: "Hold Inputs Until Rotation Stops", a: "MAINTAIN" },
        { l: "Neutralize Rudder", a: "WHEN SPIN STOPS" },
        { l: "Pull Out of Dive", a: "SMOOTH BACK PRESSURE" },
        { l: "Power", a: "AS REQUIRED — CLIMB" },
        { type: "note", l: "C172S certified for unintentional spins only. Solo: 1850 lb max." },
      ]},
      { title: "Incipient Spin / Stall Recovery",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M6 18l4-2 12-5 5-2" stroke="#4ae8c8" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M6 20l3-1" stroke="#4ae8c8" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            <path d="M14 8 C12 10 12 14 14 16" stroke="#4ae8c8" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="2 1.5"/>
            <path d="M14 16l-3 0 1.5-2.5" stroke="#4ae8c8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        items: [
        { l: "Throttle", a: "IDLE" },
        { l: "Rudder", a: "OPPOSITE TO YAW" },
        { l: "Ailerons", a: "NEUTRAL" },
        { l: "Elevator", a: "FORWARD (REDUCE AOA)" },
        { l: "Level Wings", a: "COORDINATED RUDDER" },
        { l: "Recover from Dive", a: "SMOOTH PULL" },
        { l: "Power", a: "APPLY AS NEEDED" },
      ]},
    ]
  },
  {
    id: "icing", label: "ICING", color: "#a8d8f0", dimColor: "#2a5068",
    icon: (size) => (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        {/* Central vertical shaft */}
        <line x1="12" y1="2" x2="12" y2="22" stroke="#a8d8f0" strokeWidth="1.6" strokeLinecap="round"/>
        {/* Horizontal shaft */}
        <line x1="2" y1="12" x2="22" y2="12" stroke="#a8d8f0" strokeWidth="1.6" strokeLinecap="round"/>
        {/* Diagonal shafts */}
        <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" stroke="#a8d8f0" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="19.1" y1="4.9" x2="4.9" y2="19.1" stroke="#a8d8f0" strokeWidth="1.6" strokeLinecap="round"/>
        {/* Branch tips — vertical */}
        <line x1="9" y1="5" x2="12" y2="8" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="15" y1="5" x2="12" y2="8" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="9" y1="19" x2="12" y2="16" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="15" y1="19" x2="12" y2="16" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round"/>
        {/* Branch tips — horizontal */}
        <line x1="5" y1="9" x2="8" y2="12" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="5" y1="15" x2="8" y2="12" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="19" y1="9" x2="16" y2="12" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="19" y1="15" x2="16" y2="12" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round"/>
        {/* Center dot */}
        <circle cx="12" cy="12" r="1.5" fill="#a8d8f0"/>
      </svg>
    ),
    sections: [
      { title: "Inadvertent Icing Encounter",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 18l4-2 14-5 5-2" stroke="#a8d8f0" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 20l3-1" stroke="#a8d8f0" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            {/* Ice crystals forming on wing leading edge */}
            <path d="M8 13 l1-2 l1 2" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
            <path d="M12 11 l1-2 l1 2" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
            <path d="M16 10 l1-2 l1 2" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
            <path d="M20 11 l1-2 l1 2" stroke="#a8d8f0" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
          </svg>
        ),
        items: [
        { type: "caution", l: "C172S is NOT certified for flight in known icing (FIKI)" },
        { l: "Pitot Heat", a: "ON" },
        { l: "Cabin Heat / Defrost", a: "ON MAX" },
        { l: "Carb Heat", a: "ON (FULL)" },
        { l: "Exit Icing Conditions", a: "IMMEDIATELY" },
        { l: "Turn 180° / Descend / Climb", a: "AS REQD" },
        { l: "ATC", a: "DECLARE / REQUEST VECTORS" },
        { type: "note", l: "Climb if cloud tops reachable; descend to warmer air (>2°C) if possible" },
      ]},
      { title: "Wing / Airframe Ice Accumulation",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 19l4-2 14-5 5-2" stroke="#a8d8f0" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 21l3-1" stroke="#a8d8f0" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            {/* Ice block on wing */}
            <rect x="10" y="8" width="10" height="5" rx="1" fill="rgba(168,216,240,0.15)" stroke="#a8d8f0" strokeWidth="1.2"/>
            <line x1="12" y1="8" x2="12" y2="13" stroke="#a8d8f0" strokeWidth="0.8" opacity="0.5"/>
            <line x1="15" y1="8" x2="15" y2="13" stroke="#a8d8f0" strokeWidth="0.8" opacity="0.5"/>
            <line x1="18" y1="8" x2="18" y2="13" stroke="#a8d8f0" strokeWidth="0.8" opacity="0.5"/>
          </svg>
        ),
        items: [
        { l: "Airspeed", a: "INCREASE 5–10 KIAS" },
        { type: "caution", l: "Stall speed increases significantly with ice — do NOT slow to normal approach speed" },
        { l: "Do Not Use Flaps", a: "AVOID (ICE ON TAIL)" },
        { l: "Autopilot", a: "DISENGAGE" },
        { l: "Landing Approach Speed", a: "ADD 15–20 KIAS" },
        { l: "Plan Longer Runway", a: "EXPECT HIGHER SPEED" },
        { type: "note", l: "If flaps must be used, apply slowly and expect pitch-down tendency" },
      ]},
      { title: "Carburetor Ice",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <rect x="8" y="10" width="16" height="10" rx="2" stroke="#a8d8f0" strokeWidth="1.5" fill="rgba(168,216,240,0.08)"/>
            <path d="M14 10V7M18 10V7" stroke="#a8d8f0" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M14 20v3M18 20v3" stroke="#a8d8f0" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="8" y1="15" x2="6" y2="15" stroke="#a8d8f0" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="24" y1="15" x2="26" y2="15" stroke="#a8d8f0" strokeWidth="1.3" strokeLinecap="round"/>
            {/* Ice inside */}
            <path d="M12 13 l1-1.5 l1 1.5 M16 13 l1-1.5 l1 1.5" stroke="#a8d8f0" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
          </svg>
        ),
        items: [
        { l: "Carb Heat", a: "ON (FULL)" },
        { type: "note", l: "Expect brief RPM drop then RPM increase as ice clears — normal" },
        { l: "Engine Roughness", a: "EXPECT TEMPORARILY" },
        { l: "RPM Recovery", a: "CONFIRM AFTER CLEAR" },
        { l: "Mixture", a: "ENRICHEN IF NEEDED" },
        { l: "Carb Heat", a: "ON CONTINUOUSLY" },
        { type: "caution", l: "Do NOT use partial carb heat — either full ON or full OFF" },
      ]},
      { title: "Pitot / Static Ice",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 18l4-2 14-5 5-2" stroke="#a8d8f0" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 20l3-1" stroke="#a8d8f0" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            {/* Pitot tube */}
            <rect x="14" y="5" width="10" height="3.5" rx="1.5" stroke="#a8d8f0" strokeWidth="1.3" fill="rgba(168,216,240,0.1)"/>
            <circle cx="14" cy="6.75" r="1" fill="#a8d8f0" opacity="0.6"/>
            {/* Ice blocking */}
            <line x1="22" y1="5.5" x2="25" y2="5.5" stroke="#a8d8f0" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
            <line x1="22" y1="8" x2="25" y2="8" stroke="#a8d8f0" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
          </svg>
        ),
        items: [
        { l: "Pitot Heat", a: "ON IMMEDIATELY" },
        { l: "Airspeed Indicator", a: "MONITOR — MAY BE UNRELIABLE" },
        { l: "Altimeter / VSI", a: "CROSS-CHECK IF BLOCKED" },
        { l: "Attitude Indicator", a: "PRIMARY REFERENCE" },
        { l: "Engine Instruments", a: "USE FOR POWER SETTING" },
        { type: "note", l: "Blocked pitot: airspeed may read 0 or freeze. Blocked static: altimeter/VSI unreliable" },
        { l: "Alternate Static Source", a: "OPEN IF INSTALLED" },
      ]},
    ]
  },
  {
    id: "electrical", label: "ELEC\nFAIL", color: "#f0d060", dimColor: "#5a4a10",
    icon: (size) => (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        {/* Lightning bolt */}
        <path d="M13 2L4.5 13.5H11L10 22L19.5 10H13L13 2Z" fill="#f0d060" opacity="0.85" stroke="#f0d060" strokeWidth="0.5" strokeLinejoin="round"/>
        {/* Strike-through circle indicating failure */}
        <circle cx="18" cy="18" r="4.5" fill="#100c00" stroke="#e85a4a" strokeWidth="1.4"/>
        <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" stroke="#e85a4a" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    sections: [
      { title: "Alternator Failure",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 18l4-2 14-5 5-2" stroke="#f0d060" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 20l3-1" stroke="#f0d060" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            {/* Alternator circle with bolt */}
            <circle cx="22" cy="10" r="5" fill="rgba(240,208,96,0.08)" stroke="#f0d060" strokeWidth="1.4"/>
            <path d="M22.5 7l-2 3.5h2l-1.5 2.5" stroke="#f0d060" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            {/* X over it */}
            <line x1="18" y1="18" x2="22" y2="22" stroke="#e85a4a" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="22" y1="18" x2="18" y2="22" stroke="#e85a4a" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
        items: [
        { l: "Ammeter", a: "CHECK (DISCHARGE)" },
        { l: "Avionics Master", a: "OFF" },
        { l: "Master Switch — ALT", a: "CYCLE OFF THEN ON" },
        { l: "Circuit Breakers", a: "CHECK / RESET ONCE" },
        { type: "caution", l: "If alternator fails to restore: reduce electrical load immediately to extend battery" },
        { l: "Non-Essential Electrics", a: "OFF" },
        { l: "Transponder", a: "ON (SQUAWK 7600)" },
        { l: "Comm Radio", a: "ONE ONLY — ESSENTIAL" },
        { l: "GPS / Nav", a: "OFF IF NOT NEEDED" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
        { type: "note", l: "C172S battery typically provides 30 min of essential load at reduced power" },
      ]},
      { title: "Low Voltage / Battery Failure",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 18l4-2 14-5 5-2" stroke="#f0d060" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 20l3-1" stroke="#f0d060" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            {/* Battery icon */}
            <rect x="12" y="7" width="12" height="7" rx="1.5" stroke="#f0d060" strokeWidth="1.4" fill="rgba(240,208,96,0.06)"/>
            <line x1="24" y1="9.5" x2="26" y2="9.5" stroke="#f0d060" strokeWidth="2" strokeLinecap="round"/>
            <line x1="24" y1="11.5" x2="26" y2="11.5" stroke="#f0d060" strokeWidth="2" strokeLinecap="round"/>
            {/* Low charge indicator — only small fill */}
            <rect x="13.5" y="8.5" width="3" height="4" rx="0.5" fill="#e85a4a" opacity="0.8"/>
            <line x1="14" y1="18" x2="24" y2="18" stroke="#e85a4a" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
          </svg>
        ),
        items: [
        { l: "Ammeter / Voltmeter", a: "CHECK READINGS" },
        { l: "All Non-Essential Loads", a: "OFF" },
        { l: "Avionics", a: "REDUCE TO MINIMUM" },
        { l: "Lights (Non-Essential)", a: "OFF" },
        { l: "Pitot Heat", a: "OFF IF VMC" },
        { l: "Transponder", a: "SQUAWK 7600" },
        { l: "Declare Emergency", a: "121.5 IF NEEDED" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
        { type: "note", l: "Monitor for total electrical failure. Be prepared to fly with no instruments if battery depletes" },
      ]},
      { title: "Total Electrical Failure",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 18l4-2 14-5 5-2" stroke="#f0d060" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 20l3-1" stroke="#f0d060" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            {/* Broken circuit */}
            <path d="M13 8 l2 2 l-2 2 l2 2 l-2 2" stroke="#f0d060" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="13" y1="8" x2="10" y2="8" stroke="#f0d060" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="13" y1="16" x2="10" y2="16" stroke="#f0d060" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Gap indicating break */}
            <line x1="17" y1="8" x2="22" y2="8" stroke="#e85a4a" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" strokeDasharray="2 1.5"/>
            <line x1="17" y1="16" x2="22" y2="16" stroke="#e85a4a" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" strokeDasharray="2 1.5"/>
          </svg>
        ),
        items: [
        { type: "caution", l: "Engine continues to run — magneto ignition is independent of electrical system" },
        { l: "Master Switch", a: "CHECK ON" },
        { l: "Circuit Breakers", a: "CHECK ALL / RESET ONCE" },
        { l: "Avionics / All Electrics", a: "OFF" },
        { l: "Master Switch", a: "CYCLE OFF / ON" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
        { l: "Use Handheld Radio", a: "IF AVAILABLE" },
        { l: "Light Gun Signals", a: "WATCH FOR ATC" },
        { type: "note", l: "VMC: navigate visually. Request light gun clearance at towered airports (squawk 7600 if radio available)" },
      ]},
      { title: "Avionics / Bus Failure",
        sectionIcon: (
          <svg viewBox="0 0 32 32" width={28} height={28} fill="none">
            <path d="M4 18l4-2 14-5 5-2" stroke="#f0d060" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M4 20l3-1" stroke="#f0d060" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            {/* Display screen */}
            <rect x="12" y="7" width="12" height="9" rx="1.5" stroke="#f0d060" strokeWidth="1.4" fill="rgba(240,208,96,0.05)"/>
            {/* Error X on screen */}
            <line x1="15" y1="9.5" x2="21" y2="14" stroke="#e85a4a" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="21" y1="9.5" x2="15" y2="14" stroke="#e85a4a" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="16" y1="16" x2="20" y2="16" stroke="#f0d060" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
          </svg>
        ),
        items: [
        { l: "Avionics Master", a: "CYCLE OFF / ON" },
        { l: "Individual Avionics CB", a: "CHECK / RESET ONCE" },
        { l: "Primary GPS / Nav", a: "SWITCH TO BACKUP" },
        { l: "Comm — Switch Radios", a: "TRY ALTERNATE COM" },
        { l: "Magnetic Compass", a: "PRIMARY HEADING REF" },
        { l: "Paper Charts / iPad", a: "REVERT TO BACKUP NAV" },
        { type: "note", l: "If G1000 dark: use standby instruments (airspeed, attitude, altimeter) and backup CDI" },
        { l: "Declare if Unable to Nav", a: "121.5 / ATC" },
      ]},
    ]
  },
];

const VSPEEDS = [
  { group: "Takeoff & Climb", items: [
    { code: "VR", value: "55", unit: "KIAS", desc: "Rotation" },
    { code: "VX", value: "62", unit: "KIAS", desc: "Best Angle" },
    { code: "VY", value: "74", unit: "KIAS", desc: "Best Rate" },
  ]},
  { group: "Approach & Landing", items: [
    { code: "VAPP", value: "65", unit: "KIAS", desc: "Final Approach" },
    { code: "VSO", value: "48", unit: "KIAS", desc: "Stall, L/D" },
    { code: "VFE", value: "85/110", unit: "K", desc: "Full/10 Flap" },
  ]},
  { group: "Structural Limits", items: [
    { code: "VA", value: "105", unit: "KIAS", desc: "Maneuvering" },
    { code: "VNO", value: "129", unit: "KIAS", desc: "Max Structural" },
    { code: "VNE", value: "163", unit: "KIAS", desc: "Never Exceed" },
  ]},
];

const PERF_DATA = [
  {
    group: "Takeoff — Normal (Flaps 0°)",
    note: "2550 LB · Sea Level · Std Temp · Paved/Dry",
    cols: ["Condition", "Grnd Roll", "Over 50ft"],
    rows: [
      ["Sea Level", "960 ft", "1630 ft"],
      ["2,000 ft", "1125 ft", "1920 ft"],
      ["4,000 ft", "1325 ft", "2270 ft"],
      ["6,000 ft", "1580 ft", "2720 ft"],
    ],
  },
  {
    group: "Takeoff — Short Field (Flaps 10°)",
    note: "2550 LB · Full Power Before Brake Release · VX after liftoff",
    cols: ["Condition", "Grnd Roll", "Over 50ft"],
    rows: [
      ["Sea Level", "795 ft", "1370 ft"],
      ["2,000 ft", "940 ft", "1630 ft"],
      ["4,000 ft", "1115 ft", "1950 ft"],
      ["6,000 ft", "1335 ft", "2360 ft"],
    ],
  },
  {
    group: "Landing — Normal (Flaps 30°)",
    note: "2550 LB · Approach 65 KIAS · Paved/Dry/Level",
    cols: ["Condition", "Grnd Roll", "Over 50ft"],
    rows: [
      ["Sea Level", "550 ft", "1335 ft"],
      ["2,000 ft", "575 ft", "1395 ft"],
      ["4,000 ft", "600 ft", "1455 ft"],
      ["6,000 ft", "625 ft", "1515 ft"],
    ],
  },
  {
    group: "Landing — Short Field (Flaps 30°)",
    note: "2550 LB · Approach 61 KIAS · Max Braking After TD",
    cols: ["Condition", "Grnd Roll", "Over 50ft"],
    rows: [
      ["Sea Level", "535 ft", "1295 ft"],
      ["2,000 ft", "560 ft", "1350 ft"],
      ["4,000 ft", "585 ft", "1410 ft"],
      ["6,000 ft", "610 ft", "1475 ft"],
    ],
  },
  {
    group: "Key Corrections",
    note: "Apply to POH distances above",
    cols: ["Factor", "Correction"],
    rows: [
      ["Headwind 9 kt", "−10% dist"],
      ["Tailwind 2 kt", "+10% dist"],
      ["Wet/Soft Grass", "+15% T/O · +35% Ldg"],
      ["Uphill Slope 2%", "+10% T/O dist"],
      ["Downhill Slope 2%", "+10% Ldg dist"],
    ],
  },
];
function ScratchpadCanvas({ storageKey }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPos = useRef(null);
  const saveTimerRef = useRef(null);
  const [penSize, setPenSize] = useState(2.5);
  const [penColor, setPenColor] = useState("#e8e4d8");
  const [tool, setTool] = useState("pen"); // "pen" | "eraser"

  useEffect(() => {
    if (!storageKey || !canvasRef.current) return;
    const load = async () => {
      try {
        const result = await window.storage.get(storageKey);
        if (result && result.value) {
          const img = new Image();
          img.onload = () => { if (canvasRef.current) canvasRef.current.getContext("2d").drawImage(img, 0, 0); };
          img.src = result.value;
        }
      } catch {}
    };
    load();
  }, []);

  const persist = () => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (!canvasRef.current) return;
      try { window.storage.set(storageKey, canvasRef.current.toDataURL("image/png")); } catch {}
    }, 400);
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * (canvas.width / rect.width), y: (src.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const startDraw = (e) => { e.preventDefault(); drawingRef.current = true; lastPos.current = getPos(e, canvasRef.current); };
  const draw = (e) => {
    e.preventDefault();
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = 24;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
    }
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastPos.current = pos;
  };
  const endDraw = (e) => { e.preventDefault(); drawingRef.current = false; lastPos.current = null; persist(); };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    try { window.storage.delete(storageKey); } catch {}
  };

  const PEN_COLORS = ["#e8e4d8","#4ae888","#4ab8e8","#e8c84a","#e85a4a","#c87ae8","#e8a030"];
  const PEN_SIZES = [1.5, 2.5, 4, 7];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#0d1a12", borderBottom: "1px solid #1e3528", flexShrink: 0, flexWrap: "wrap" }}>
        {/* Tool toggle */}
        <div style={{ display: "flex", background: "#0a0c10", border: "1px solid #1e3528", borderRadius: 4, overflow: "hidden" }}>
          {[["pen","✏ PEN"],["eraser","◻ ERASE"]].map(([t, label]) => (
            <button key={t} onClick={() => setTool(t)} style={{
              fontFamily: "'Rajdhani',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1,
              padding: "4px 12px", cursor: "pointer", border: "none",
              background: tool === t ? "rgba(61,190,108,0.15)" : "transparent",
              color: tool === t ? "#3dbe6c" : "#4a5068",
              borderRight: t === "pen" ? "1px solid #1e3528" : "none",
            }}>{label}</button>
          ))}
        </div>
        {/* Pen sizes */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {PEN_SIZES.map(s => (
            <button key={s} onClick={() => { setPenSize(s); setTool("pen"); }} style={{
              width: 26, height: 26, borderRadius: 4,
              border: `1.5px solid ${penSize === s && tool === "pen" ? "#3dbe6c" : "#1e3528"}`,
              background: penSize === s && tool === "pen" ? "rgba(61,190,108,0.12)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0,
            }}>
              <div style={{ width: s * 2.2, height: s * 2.2, borderRadius: "50%", background: "#e8e4d8" }} />
            </button>
          ))}
        </div>
        {/* Colors */}
        <div style={{ display: "flex", gap: 4 }}>
          {PEN_COLORS.map(c => (
            <button key={c} onClick={() => { setPenColor(c); setTool("pen"); }} style={{
              width: 22, height: 22, borderRadius: 4,
              border: `2px solid ${penColor === c && tool === "pen" ? "#fff" : "transparent"}`,
              background: c, cursor: "pointer", padding: 0,
            }} />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={clearCanvas} style={{
          fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1,
          padding: "4px 12px", borderRadius: 3, cursor: "pointer",
          background: "transparent", color: "#6a3030", border: "1px solid #3a2020",
        }}>↺ CLEAR CANVAS</button>
      </div>
      {/* Canvas */}
      <div style={{ flex: 1, position: "relative", touchAction: "none", background: "#050e09" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} preserveAspectRatio="none">
          {Array.from({ length: 20 }, (_, i) => (
            <line key={i} x1="0" y1={`${(i + 1) * 5}%`} x2="100%" y2={`${(i + 1) * 5}%`} stroke="rgba(74,159,232,0.06)" strokeWidth="1"/>
          ))}
          <line x1="5%" y1="0" x2="5%" y2="100%" stroke="rgba(232,90,74,0.1)" strokeWidth="1"/>
        </svg>
        <canvas
          ref={canvasRef} width={1200} height={900}
          style={{ display: "block", width: "100%", height: "100%", cursor: tool === "eraser" ? "cell" : "crosshair", touchAction: "none" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
      </div>
    </div>
  );
}

function DrawingNotepad({ title, footer, onClose, storageKey, initialImage, onSave }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPos = useRef(null);
  const saveTimerRef = useRef(null);
  const [penSize, setPenSize] = useState(2.5);
  const [penColor, setPenColor] = useState("#e8e4d8");

  // Draw saved image onto canvas once it mounts
  useEffect(() => {
    if (!initialImage || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) canvas.getContext("2d").drawImage(img, 0, 0);
    };
    img.src = initialImage;
  }, []); // run once on mount only

  const persistCanvas = () => {
    if (!canvasRef.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      if (onSave) onSave(dataUrl);
      if (storageKey) {
        try { window.storage.set(storageKey, dataUrl); } catch {}
      }
    }, 300);
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    e.preventDefault();
    drawingRef.current = false;
    lastPos.current = null;
    persistCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    clearTimeout(saveTimerRef.current);
    if (onSave) onSave(null);
    if (storageKey) {
      try { window.storage.delete(storageKey); } catch {}
    }
  };

  const PEN_COLORS = [
    { c: "#e8e4d8", label: "WHT" },
    { c: "#4ae888", label: "GRN" },
    { c: "#4ab8e8", label: "BLU" },
    { c: "#e8c84a", label: "YLW" },
    { c: "#e85a4a", label: "RED" },
  ];

  return (
    <div style={{ background: "#09120d", border: "1px solid #1e3528", borderRadius: 4, margin: "4px 8px 6px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", background: "#0d1a12", borderBottom: "1px solid #1e3528" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#3dbe6c", letterSpacing: 1.5 }}>✏ {title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Pen size */}
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            {[1.5, 2.5, 4].map(s => (
              <button key={s} onClick={() => setPenSize(s)} style={{
                width: 22, height: 22, borderRadius: 3, border: `1px solid ${penSize === s ? "#3dbe6c" : "#1e3528"}`,
                background: penSize === s ? "rgba(61,190,108,0.15)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0,
              }}>
                <div style={{ width: s * 2.5, height: s * 2.5, borderRadius: "50%", background: "#e8e4d8" }} />
              </button>
            ))}
          </div>
          {/* Pen colors */}
          <div style={{ display: "flex", gap: 3 }}>
            {PEN_COLORS.map(({ c, label }) => (
              <button key={c} onClick={() => setPenColor(c)} title={label} style={{
                width: 18, height: 18, borderRadius: 3, border: `1.5px solid ${penColor === c ? "#fff" : "transparent"}`,
                background: c, cursor: "pointer", padding: 0,
              }} />
            ))}
          </div>
          <div style={{ width: 1, height: 16, background: "#1e3528" }} />
          <button onClick={clearCanvas} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, background: "transparent", border: "1px solid #1e3528", color: "#7a8090", padding: "2px 7px", borderRadius: 3, cursor: "pointer" }}>CLR</button>
          <button onClick={onClose} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, background: "transparent", border: "1px solid #1e3528", color: "#7a8090", padding: "2px 7px", borderRadius: 3, cursor: "pointer" }}>✕</button>
        </div>
      </div>
      {/* Canvas */}
      <div style={{ position: "relative", touchAction: "none", background: "#050e09" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: 160, pointerEvents: "none" }} preserveAspectRatio="none">
          {[1,2,3,4,5,6].map(i => (
            <line key={i} x1="0" y1={i * 24} x2="100%" y2={i * 24} stroke="rgba(74,159,232,0.10)" strokeWidth="1"/>
          ))}
          <line x1="36" y1="0" x2="36" y2="160" stroke="rgba(232,90,74,0.15)" strokeWidth="1"/>
        </svg>
        <canvas
          ref={canvasRef} width={600} height={160}
          style={{ display: "block", width: "100%", height: 160, cursor: "crosshair", touchAction: "none" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
      </div>
      {/* Footer hint */}
      {footer && (
        <div style={{ padding: "3px 10px", background: "#0d1a12", borderTop: "1px solid #1e3528" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8.5, color: "#1e3528", letterSpacing: 0.8 }}>{footer}</span>
        </div>
      )}
    </div>
  );
}

const CLIMB_DATA = [
  {
    group: "Best Rate of Climb (VY = 74 KIAS · Flaps 0° · Full Power)",
    cols: ["Pressure Alt", "Rate of Climb", "Time to Climb", "Fuel Used", "Distance"],
    rows: [
      ["Sea Level", "720 FPM", "0 min",  "0 gal",  "0 NM"],
      ["2,000 ft",  "645 FPM", "3 min",  "0.5 gal","5 NM"],
      ["4,000 ft",  "565 FPM", "7 min",  "1.1 gal","11 NM"],
      ["6,000 ft",  "480 FPM", "11 min", "1.8 gal","18 NM"],
      ["8,000 ft",  "395 FPM", "16 min", "2.6 gal","26 NM"],
      ["10,000 ft", "305 FPM", "22 min", "3.6 gal","35 NM"],
      ["12,000 ft", "210 FPM", "30 min", "4.9 gal","47 NM"],
    ],
    note: "2550 LB · Std Temp · 25 PPH fuel flow for climb",
  },
  {
    group: "Service & Absolute Ceiling",
    cols: ["Item", "Value"],
    rows: [
      ["Service Ceiling",   "14,000 ft (100 FPM climb)"],
      ["Absolute Ceiling",  "~15,000 ft (0 FPM climb)"],
    ],
  },
];

const CRUISE_DATA = [
  {
    group: "Cruise Performance — 4,000 ft Pressure Altitude (Std Temp)",
    cols: ["Power", "RPM", "TAS", "Fuel Flow"],
    rows: [
      ["75%", "2650", "122 KTAS", "9.0 GPH"],
      ["65%", "2550", "114 KTAS", "7.6 GPH"],
      ["55%", "2400", "105 KTAS", "6.5 GPH"],
    ],
  },
  {
    group: "Cruise Performance — 8,000 ft Pressure Altitude (Std Temp)",
    cols: ["Power", "RPM", "TAS", "Fuel Flow"],
    rows: [
      ["75%", "2700", "125 KTAS", "9.0 GPH"],
      ["65%", "2600", "117 KTAS", "7.6 GPH"],
      ["55%", "2450", "107 KTAS", "6.5 GPH"],
    ],
  },
  {
    group: "Cruise Performance — 12,000 ft Pressure Altitude (Std Temp)",
    cols: ["Power", "RPM", "TAS", "Fuel Flow"],
    rows: [
      ["75%", "2700", "128 KTAS", "9.0 GPH"],
      ["65%", "2700", "120 KTAS", "7.6 GPH"],
      ["55%", "2550", "110 KTAS", "6.5 GPH"],
    ],
  },
  {
    group: "Range & Endurance (55% Power · 8,000 ft · No Reserve)",
    cols: ["Fuel Load", "Range", "Endurance"],
    rows: [
      ["53 gal usable", "~522 NM", "~8.1 hrs"],
      ["40 gal",        "~396 NM", "~6.2 hrs"],
      ["30 gal",        "~297 NM", "~4.6 hrs"],
    ],
    note: "Lean to peak EGT -50°F for best economy",
  },
];

const MORE_REFS = [
  {
    id: "light_gun", title: "ATC Light Gun Signals", color: "#e8c84a",
    cols: ["Signal", "On Ground", "In Flight"],
    rows: [
      ["Steady GREEN",    "Cleared for takeoff",     "Cleared to land"],
      ["Flashing GREEN",  "Cleared to taxi",         "Return for landing"],
      ["Steady RED",      "Stop",                    "Give way — continue"],
      ["Flashing RED",    "Taxi clear of runway",    "Airport unsafe — do not land"],
      ["Flashing WHITE",  "Return to start",         "—"],
      ["Alternating R/G", "Exercise extreme caution","Exercise extreme caution"],
    ],
  },
  {
    id: "transponder", title: "Transponder Codes", color: "#4a9fe8",
    cols: ["Code", "Meaning"],
    rows: [
      ["1200", "VFR — No ATC communication"],
      ["7500", "Hijacking in progress"],
      ["7600", "Radio failure (NORDO)"],
      ["7700", "Emergency / Distress"],
      ["7000", "VFR — ICAO standard (intl)"],
    ],
  },
  {
    id: "vfr_wx", title: "VFR Weather Minimums", color: "#3dbe6c",
    cols: ["Airspace", "Visibility", "Cloud Clearance"],
    rows: [
      ["Class A",       "N/A (IFR only)",  "N/A"],
      ["Class B",       "3 SM",            "Clear of clouds"],
      ["Class C",       "3 SM",            "500 below · 1000 above · 2000 horiz"],
      ["Class D",       "3 SM",            "500 below · 1000 above · 2000 horiz"],
      ["Class E < 10K", "3 SM",            "500 below · 1000 above · 2000 horiz"],
      ["Class E ≥ 10K", "5 SM",            "1000 below · 1000 above · 1 SM horiz"],
      ["Class G day",   "1 SM",            "Clear of clouds"],
      ["Class G night", "3 SM",            "500 below · 1000 above · 2000 horiz"],
    ],
  },
  {
    id: "speed_limits", title: "Airspeed Limits (§91.117)", color: "#e85a4a",
    cols: ["Rule", "Speed Limit"],
    rows: [
      ["Below 10,000 ft MSL",          "250 KIAS max"],
      ["In Class B airspace",          "250 KIAS max"],
      ["Below Class B shelf",          "200 KIAS max"],
      ["In Class C or D surface area", "200 KIAS max"],
      ["In tunnel / VFR corridor",     "200 KIAS max"],
      ["Within 4 NM, 2500 AGL of primary Class C/D", "200 KIAS max"],
    ],
    note: "§91.117 — No person may operate an aircraft at indicated airspeed in excess of these limits",
  },
  {
    id: "cruising_alt", title: "VFR Cruising Altitudes (§91.159)", color: "#4ae8c8",
    cols: ["Magnetic Course", "Altitude"],
    rows: [
      ["000° – 179°  (East)", "Odd thousands + 500 ft  (3500, 5500, 7500…)"],
      ["180° – 359°  (West)", "Even thousands + 500 ft  (4500, 6500, 8500…)"],
      ["IFR East",            "Odd thousands  (3000, 5000, 7000…)"],
      ["IFR West",            "Even thousands  (4000, 6000, 8000…)"],
    ],
    note: "Applies above 3,000 ft AGL in cruising flight",
  },
  {
    id: "airspace", title: "Airspace Entry Requirements", color: "#c87ae8",
    cols: ["Class", "Equipment Required", "Clearance"],
    rows: [
      ["A", "IFR-equipped, IFR flight plan", "ATC clearance reqd"],
      ["B", "2-way radio, Mode C xpdr, ADS-B", "Explicit ATC clearance"],
      ["C", "2-way radio, Mode C xpdr, ADS-B", "ATC contact establ."],
      ["D", "2-way radio", "ATC contact establ."],
      ["E", "None for VFR", "None for VFR"],
      ["G", "None for VFR", "None"],
    ],
  },
  {
    id: "engine_specs", title: "C172S Engine Specifications", color: "#e8c84a",
    cols: ["Item", "Specification"],
    rows: [
      ["Engine Model",         "Lycoming IO-360-L2A"],
      ["Configuration",        "4-cylinder, horizontally opposed"],
      ["Displacement",         "360 cubic inches"],
      ["Horsepower",           "180 HP @ 2700 RPM"],
      ["Compression Ratio",    "8.5 : 1"],
      ["TBO",                  "2,000 hours"],
      ["Oil Pressure (normal)","60–90 PSI"],
      ["Oil Pressure (min)",   "25 PSI (idle) / 55 PSI (takeoff)"],
      ["Oil Temp (normal)",    "75–240 °F"],
      ["Oil Temp (max)",       "245 °F"],
      ["CHT (max)",            "500 °F"],
      ["Max RPM",              "2,700 RPM"],
      ["Fuel Injection",       "Fuel injected (IO- prefix)"],
    ],
  },
  {
    id: "electrical_specs", title: "C172S Electrical System", color: "#f0d060",
    cols: ["Item", "Specification"],
    rows: [
      ["System Voltage",       "28V DC"],
      ["Alternator Output",    "60 amp"],
      ["Battery",              "24V / 13.75 Ah lead-acid"],
      ["Battery Endurance",    "~30 min essential load"],
      ["Ammeter Normal",       "Slight positive (charging)"],
      ["Ammeter (discharge)",  "Negative — alternator failed"],
      ["Low Voltage Warning",  "< 24.5V — check alternator"],
      ["Bus Voltage (normal)", "27.5–28.5V"],
      ["Main Bus",             "Essential + non-essential loads"],
      ["Avionics Bus",         "Avionics master switch controlled"],
      ["Breaker Panel",        "Right side of instrument panel"],
    ],
  },
  {
    id: "runway_markings", title: "Runway Markings & Lighting", color: "#4a9fe8",
    cols: ["Item", "Meaning"],
    rows: [
      ["Threshold (white bars)",      "Beginning of landing area"],
      ["Runway numbers",              "Magnetic heading ÷ 10 (rounded)"],
      ["Centerline (dashed white)",   "Runway centerline"],
      ["Touchdown zone (TDZ)",        "First 3,000 ft of runway"],
      ["Fixed distance markers",      "500 ft increments from threshold"],
      ["Hold short (4 yellow lines)", "Do not cross without clearance"],
      ["Taxiway centerline (yellow)", "Follow for taxi guidance"],
      ["PAPI — 4 red",                "Too low"],
      ["PAPI — 3 red / 1 white",      "Slightly low"],
      ["PAPI — 2 red / 2 white",      "On glidepath (3°)"],
      ["PAPI — 1 red / 3 white",      "Slightly high"],
      ["PAPI — 4 white",              "Too high"],
      ["VASI — red over red",         "Too low (dead, you're dead)"],
      ["VASI — white over red",       "On glidepath"],
      ["VASI — white over white",     "Too high"],
      ["REIL (flashing lights)",      "Runway end identifier"],
      ["MALSR / ALSF",                "Approach light system — aids transition"],
    ],
  },
  {
    id: "fuel_oil", title: "C172S Fuel & Oil Quick Ref", color: "#e8a030",
    cols: ["Item", "Specification"],
    rows: [
      ["Fuel Type",           "100LL AVGAS (blue)"],
      ["Total Fuel",          "56 USG total / 53 USG usable"],
      ["Tanks",               "2 × 28 USG wing tanks"],
      ["Fuel Selector",       "BOTH for T/O & Landing"],
      ["Oil Type",            "SAE 15W-50 or 20W-50 aviation"],
      ["Oil Capacity",        "8 USG max / 6 USG minimum"],
      ["Oil Change Interval", "Every 50 hrs or 4 months"],
      ["Fuel Burn (cruise)",  "~8.5 GPH at 75% power"],
    ],
  },
  {
    id: "weight_bal", title: "C172S Weight & CG Limits", color: "#e85a4a",
    cols: ["Limit", "Value"],
    rows: [
      ["Max Gross Weight",    "2,550 lb"],
      ["Max Ramp Weight",     "2,558 lb"],
      ["Empty Weight (typ)",  "~1,663 lb"],
      ["Max Useful Load",     "~887 lb"],
      ["CG Range (fwd)",      "35.0 in aft of datum"],
      ["CG Range (aft)",      "47.3 in aft of datum"],
      ["Max Baggage",         "120 lb (aft baggage area)"],
    ],
  },
  {
    id: "tire_pressure", title: "C172S Tire Pressures", color: "#3dbe6c",
    cols: ["Tire", "Pressure", "Size / Notes"],
    rows: [
      ["Nose Gear",       "42 PSI",  "5.00-5 (tube type)"],
      ["Main Gear (each)","28 PSI",  "6.00-6 (tube type)"],
    ],
    note: "Check cold pressure only. Inspect for cuts, wear, and proper inflation before each flight.",
  },
  {
    id: "phonetic", title: "NATO Phonetic Alphabet", color: "#7a8090",
    cols: ["Letter", "Word", "Letter", "Word"],
    rows: [
      ["A","Alpha",   "N","November"],
      ["B","Bravo",   "O","Oscar"],
      ["C","Charlie", "P","Papa"],
      ["D","Delta",   "Q","Quebec"],
      ["E","Echo",    "R","Romeo"],
      ["F","Foxtrot", "S","Sierra"],
      ["G","Golf",    "T","Tango"],
      ["H","Hotel",   "U","Uniform"],
      ["I","India",   "V","Victor"],
      ["J","Juliet",  "W","Whiskey"],
      ["K","Kilo",    "X","X-ray"],
      ["L","Lima",    "Y","Yankee"],
      ["M","Mike",    "Z","Zulu"],
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FLEET DATA — saved aircraft in the hangar
// ─────────────────────────────────────────────────────────────────────────────
const FLEET = [
  {
    id: "n12345",
    tail: "N12345",
    type: "Cessna 172S Skyhawk",
    year: "2019",
    engine: "Lycoming IO-360-L2A · 180 HP",
    avionics: "Garmin G1000 NXi",
    status: "AIRWORTHY",
    lastFlight: "MAY 14, 2026",
    totalTime: "1,842.4 HRS",
    annualDue: "NOV 2026",
    color: "#e8c84a",
    accentColor: "#4a9fe8",
    silhouette: "C172",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HANGAR VIEW
// ─────────────────────────────────────────────────────────────────────────────
function HangarView({ onSelectAircraft }) {
  const [zuluTime, setZuluTime] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setZuluTime(now.toUTCString().slice(17, 22) + "Z");
      setLocalTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: "100%", height: "100vh", overflow: "hidden",
      background: "#080a0e",
      display: "flex", flexDirection: "column",
      fontFamily: "'Rajdhani', sans-serif",
      position: "relative",
    }}>
      {/* Injected fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Oswald:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');
        @keyframes hangarFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hangarPulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes scanline { 0% { transform:translateY(-100%); } 100% { transform:translateY(400%); } }
        @keyframes glow { 0%,100% { text-shadow:0 0 8px rgba(232,200,74,0.4); } 50% { text-shadow:0 0 18px rgba(232,200,74,0.9), 0 0 30px rgba(232,200,74,0.4); } }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(74,159,232,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(74,159,232,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Radial glow center */}
      <div style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 600, height: 400,
        background: "radial-gradient(ellipse at center, rgba(232,200,74,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── TOP HEADER ── */}
      <div style={{
        flexShrink: 0,
        background: "linear-gradient(135deg,#0a0c10 0%,#141820 60%,#0a0c10 100%)",
        borderBottom: "2px solid #e8c84a",
        padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56,
        position: "relative", zIndex: 10,
      }}>
        {/* Logo / Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Apex logo SVG */}
          <svg viewBox="0 0 36 36" width={36} height={36} fill="none">
            <polygon points="18,3 33,30 3,30" stroke="#e8c84a" strokeWidth="2" fill="rgba(232,200,74,0.06)" strokeLinejoin="round"/>
            <line x1="18" y1="3" x2="18" y2="30" stroke="#e8c84a" strokeWidth="0.8" opacity="0.3"/>
            <circle cx="18" cy="18" r="3.5" fill="#e8c84a" opacity="0.9"/>
            <path d="M12 23l6-10 6 10" stroke="#e8c84a" strokeWidth="1" fill="none" opacity="0.5"/>
          </svg>
          <div>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 4, color: "#e8c84a", lineHeight: 1, textTransform: "uppercase" }}>
              APEX AVIATION
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 2, marginTop: 2 }}>
              FLIGHT TRAINING CENTER · KNEEBOARD v2
            </div>
          </div>
        </div>

        {/* Center title */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: 6, color: "#e8e4d8", textTransform: "uppercase", lineHeight: 1, animation: "glow 4s ease-in-out infinite" }}>
            THE HANGAR
          </div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 2.5, marginTop: 3 }}>
            SELECT AIRCRAFT TO OPEN KNEEBOARD
          </div>
        </div>

        {/* Clock */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 16, fontWeight: 400, color: "#e8c84a", letterSpacing: 2, lineHeight: 1, animation: "hangarPulse 2s ease-in-out infinite" }}>{zuluTime}</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#4a5068", letterSpacing: 1.5, marginTop: 2 }}>LCL {localTime}</div>
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div style={{
        flexShrink: 0,
        background: "#0d0f14",
        borderBottom: "1px solid #1e2430",
        padding: "6px 20px",
        display: "flex", alignItems: "center", gap: 20,
      }}>
        {[
          { label: "AIRCRAFT ON FILE", value: FLEET.length },
          { label: "AIRWORTHY", value: FLEET.filter(a => a.status === "AIRWORTHY").length, color: "#3dbe6c" },
          { label: "ACTIVE PILOT", value: "PIC ON DUTY", color: "#e8c84a" },
          { label: "POH REF", value: "REV 2022-05", color: "#4a9fe8" },
        ].map((stat, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#3a4050", letterSpacing: 1.5 }}>{stat.label}</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: stat.color || "#7a8090", letterSpacing: 1, fontWeight: 700 }}>{stat.value}</div>
            {i < 3 && <div style={{ width: 1, height: 12, background: "#1e2430", marginLeft: 8 }} />}
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        padding: "28px 24px",
        display: "flex", flexDirection: "column", gap: 20,
        position: "relative", zIndex: 1,
      }}>

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a4050", letterSpacing: 3, textTransform: "uppercase" }}>
            ── YOUR FLEET ──────────────────────
          </div>
        </div>

        {/* Aircraft Cards */}
        {FLEET.map((ac, idx) => {
          const isHovered = hovered === ac.id;
          return (
            <button
              key={ac.id}
              onClick={() => onSelectAircraft(ac)}
              onMouseEnter={() => setHovered(ac.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "block", width: "100%",
                background: isHovered
                  ? "linear-gradient(135deg,#141c28 0%,#1a2234 40%,#141c28 100%)"
                  : "linear-gradient(135deg,#0e1218 0%,#141820 40%,#0e1218 100%)",
                border: `1.5px solid ${isHovered ? ac.color : "#2a3040"}`,
                borderRadius: 10,
                cursor: "pointer", padding: 0,
                textAlign: "left",
                boxShadow: isHovered
                  ? `0 0 24px rgba(232,200,74,0.12), 0 4px 20px rgba(0,0,0,0.5)`
                  : "0 2px 12px rgba(0,0,0,0.4)",
                transition: "all 0.18s ease",
                animation: `hangarFadeIn 0.35s ease ${idx * 0.1}s both`,
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Card shimmer line */}
              {isHovered && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${ac.color}, transparent)`,
                  animation: "none",
                }} />
              )}

              {/* Scan line effect on hover */}
              {isHovered && (
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: 10,
                }}>
                  <div style={{
                    position: "absolute", left: 0, right: 0, height: "25%",
                    background: `linear-gradient(transparent, rgba(232,200,74,0.03), transparent)`,
                    animation: "scanline 2s linear infinite",
                  }} />
                </div>
              )}

              {/* ── CARD INNER ── */}
              <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 24 }}>

                {/* Aircraft silhouette */}
                <div style={{
                  flexShrink: 0, width: 110, height: 80,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `radial-gradient(ellipse at center, ${ac.color}0a 0%, transparent 70%)`,
                  borderRadius: 8,
                  border: `1px solid ${ac.color}20`,
                  transition: "all 0.18s",
                }}>
                  {/* C172 top-down silhouette */}
                  <svg viewBox="0 0 110 80" width={110} height={80} fill="none">
                    {/* Fuselage */}
                    <ellipse cx="55" cy="40" rx="6" ry="30" fill={ac.color} opacity={isHovered ? 0.75 : 0.4} />
                    {/* Main wings */}
                    <ellipse cx="55" cy="40" rx="48" ry="5" fill={ac.color} opacity={isHovered ? 0.6 : 0.3} />
                    {/* Wing sweep taper */}
                    <path d="M7 38 Q30 35 55 37 Q80 35 103 38 Q80 45 55 43 Q30 45 7 42Z" fill={ac.color} opacity={isHovered ? 0.35 : 0.18} />
                    {/* H-stab */}
                    <ellipse cx="55" cy="68" rx="22" ry="2.5" fill={ac.color} opacity={isHovered ? 0.55 : 0.25} />
                    {/* Rudder */}
                    <ellipse cx="55" cy="10" rx="3" ry="8" fill={ac.color} opacity={isHovered ? 0.6 : 0.3} />
                    {/* Prop arc */}
                    <path d="M55 10 Q62 8 64 12 Q62 16 55 14 Q48 16 46 12 Q48 8 55 10Z" fill={ac.color} opacity={isHovered ? 0.8 : 0.4} />
                    {/* Gear dots */}
                    <circle cx="37" cy="43" r="2" fill={ac.color} opacity={isHovered ? 0.5 : 0.25} />
                    <circle cx="73" cy="43" r="2" fill={ac.color} opacity={isHovered ? 0.5 : 0.25} />
                    <circle cx="55" cy="65" r="1.5" fill={ac.color} opacity={isHovered ? 0.4 : 0.2} />
                    {/* Registration on fuselage */}
                    <text x="55" y="42" textAnchor="middle" fontFamily="'Share Tech Mono',monospace" fontSize="4.5" fill={ac.color} opacity={isHovered ? 1 : 0.6} letterSpacing="0.5">{ac.tail}</text>
                  </svg>
                </div>

                {/* Aircraft info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                    <div style={{
                      fontFamily: "'Oswald',sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: 3,
                      color: ac.color, lineHeight: 1, transition: "all 0.18s",
                      textShadow: isHovered ? `0 0 16px ${ac.color}60` : "none",
                    }}>{ac.tail}</div>
                    <div style={{
                      fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: ac.accentColor,
                      letterSpacing: 2, lineHeight: 1, paddingTop: 2,
                    }}>{ac.type}</div>
                    <div style={{ marginLeft: "auto" }}>
                      <span style={{
                        fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: 2,
                        padding: "3px 10px", borderRadius: 3,
                        background: ac.status === "AIRWORTHY" ? "rgba(61,190,108,0.12)" : "rgba(232,90,74,0.12)",
                        border: `1px solid ${ac.status === "AIRWORTHY" ? "#3dbe6c" : "#e85a4a"}`,
                        color: ac.status === "AIRWORTHY" ? "#3dbe6c" : "#e85a4a",
                      }}>{ac.status}</span>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, marginTop: 8 }}>
                    {[
                      { label: "YEAR", value: ac.year },
                      { label: "TOTAL TIME", value: ac.totalTime },
                      { label: "LAST FLIGHT", value: ac.lastFlight },
                      { label: "ANNUAL DUE", value: ac.annualDue },
                    ].map((s, i) => (
                      <div key={i} style={{
                        padding: "8px 12px",
                        background: isHovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                        borderRadius: 4,
                        borderLeft: i === 0 ? `2px solid ${ac.color}50` : "2px solid transparent",
                        transition: "all 0.18s",
                      }}>
                        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "#3a4050", letterSpacing: 2, marginBottom: 3 }}>{s.label}</div>
                        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 700, color: "#c8c4b8", letterSpacing: 0.5 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Engine / Avionics row */}
                  <div style={{ display: "flex", gap: 16, marginTop: 8, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg viewBox="0 0 16 16" width={11} height={11} fill="none">
                        <rect x="1" y="4" width="14" height="8" rx="1" stroke="#4a5068" strokeWidth="1.2"/>
                        <rect x="3" y="6" width="2" height="4" rx="0.3" fill="#4a5068" opacity="0.6"/>
                        <rect x="7" y="6" width="2" height="4" rx="0.3" fill="#4a5068" opacity="0.6"/>
                        <path d="M3 4V2M6 4V1.5M10 4V2M13 4V1.5" stroke="#4a5068" strokeWidth="1" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#4a5068", letterSpacing: 0.5 }}>{ac.engine}</span>
                    </div>
                    <div style={{ width: 1, height: 10, background: "#1e2430" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg viewBox="0 0 16 16" width={11} height={11} fill="none">
                        <rect x="1" y="3" width="14" height="10" rx="1" stroke={ac.accentColor} strokeWidth="1.2" opacity="0.5"/>
                        <line x1="3" y1="6" x2="13" y2="6" stroke={ac.accentColor} strokeWidth="0.8" opacity="0.4"/>
                        <line x1="3" y1="9" x2="10" y2="9" stroke={ac.accentColor} strokeWidth="0.8" opacity="0.4"/>
                      </svg>
                      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#4a5068", letterSpacing: 0.5 }}>{ac.avionics}</span>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        fontFamily: "'Oswald',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3,
                        color: isHovered ? ac.color : "#3a4050",
                        transition: "all 0.18s",
                        textTransform: "uppercase",
                      }}>
                        {isHovered ? "OPEN KNEEBOARD →" : "TAP TO OPEN"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* Empty slot card */}
        <button
          disabled
          style={{
            display: "block", width: "100%",
            background: "transparent",
            border: "1.5px dashed #1e2430",
            borderRadius: 10,
            cursor: "default", padding: "28px 24px",
            opacity: 0.4,
            animation: "hangarFadeIn 0.35s ease 0.2s both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 110, height: 80,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px dashed #2a3040", borderRadius: 8,
            }}>
              <span style={{ fontSize: 28, opacity: 0.3 }}>＋</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 3, color: "#3a4050" }}>ADD AIRCRAFT</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#2a3040", letterSpacing: 2, marginTop: 4 }}>COMING SOON · MANAGE YOUR FLEET</div>
            </div>
          </div>
        </button>

        {/* Bottom padding */}
        <div style={{ height: 20 }} />
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        flexShrink: 0,
        background: "#0a0c10",
        borderTop: "1px solid #1a1e28",
        padding: "8px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#252830", letterSpacing: 2 }}>
          APEX AVIATION FLIGHT TRAINING CENTER · KNEEBOARD SYSTEM v2.0 · FOR SIMULATION USE
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#252830", letterSpacing: 2 }}>
          POH REF: CESSNA 172S · REV 2022-05
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP — controls view state + localStorage persistence
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  // Initialise view from localStorage so refresh restores last state
  const [view, setView] = useState(() => {
    try {
      const saved = localStorage.getItem("apex_kneeboard_view");
      if (saved === "checklist") return "checklist";
    } catch {}
    return "hangar";
  });
  const [selectedAircraft, setSelectedAircraft] = useState(() => {
    try {
      const saved = localStorage.getItem("apex_kneeboard_aircraft");
      if (saved) {
        const ac = FLEET.find(a => a.id === saved);
        if (ac) return ac;
      }
    } catch {}
    return null;
  });

  const openChecklist = (aircraft) => {
    setSelectedAircraft(aircraft);
    setView("checklist");
    try {
      localStorage.setItem("apex_kneeboard_view", "checklist");
      localStorage.setItem("apex_kneeboard_aircraft", aircraft.id);
    } catch {}
  };

  const goToHangar = () => {
    setView("hangar");
    try {
      localStorage.setItem("apex_kneeboard_view", "hangar");
      localStorage.removeItem("apex_kneeboard_aircraft");
    } catch {}
  };

  if (view === "checklist" && selectedAircraft) {
    return <ChecklistApp onBackToHangar={goToHangar} aircraft={selectedAircraft} />;
  }
  return <HangarView onSelectAircraft={openChecklist} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKLIST APP (formerly export default App)
// ─────────────────────────────────────────────────────────────────────────────
function ChecklistApp({ onBackToHangar, aircraft }) {
  const [currentPage, setCurrentPage] = useState("preflight");
  const [checked, setChecked] = useState({});
  const [vspeedOpen, setVspeedOpen] = useState(false);
  const [perfOpen, setPerfOpen] = useState(false);
  const [climbOpen, setClimbOpen] = useState(false);
  const [cruisePanelOpen, setCruisePanelOpen] = useState(false);
  const [climbEditing, setClimbEditing] = useState(false);
  const [cruiseEditing, setCruiseEditing] = useState(false);
  const [climbData, setClimbData] = useState(CLIMB_DATA.map(s => ({ ...s, rows: s.rows.map(r => [...r]) })));
  const [cruiseData, setCruiseData] = useState(CRUISE_DATA.map(s => ({ ...s, rows: s.rows.map(r => [...r]) })));
  const [vspeedEditing, setVspeedEditing] = useState(false);
  const [perfEditing, setPerfEditing] = useState(false);
  const [vspeeds, setVspeeds] = useState(VSPEEDS.map(g => ({ ...g, items: g.items.map(i => ({ ...i })) })));
  const [perfData, setPerfData] = useState(PERF_DATA.map(s => ({ ...s, rows: s.rows.map(r => [...r]) })));
  const [openNotepads, setOpenNotepads] = useState(new Set());
  const [notepadImages, setNotepadImages] = useState({}); // { storageKey: dataUrl }
  const [editingSection, setEditingSection] = useState(null); // "pageId::sectionTitle"
  const [customItems, setCustomItems] = useState({}); // { "pageId::sectionTitle": { removed: Set<label>, added: [{l,a}] } }
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemAction, setNewItemAction] = useState("");
  const [inlineEdit, setInlineEdit] = useState(null); // { sectionKey, itemKey, l, a }
  const [zuluTime, setZuluTime] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [scratchpadMode, setScratchpadMode] = useState("draw"); // "draw" | "type"
  const [scratchpadText, setScratchpadText] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeMoreRef, setActiveMoreRef] = useState("light_gun");
  const [lightMode, setLightMode] = useState(false);

  // Theme tokens — all color decisions flow through here
  const T = lightMode ? {
    // Light mode — high contrast for daylight/iPad outdoors
    appBg:        "#e8eaf0",
    headerBg:     "linear-gradient(135deg,#d0d4e0 0%,#c8ccd8 60%,#d0d4e0 100%)",
    headerBorder: "#1a6ab0",
    leftSideBg:   "#d0d4e0",
    leftSideBorder:"#a0a8c0",
    leftTabActive: "rgba(26,106,176,0.12)",
    leftTabText:  "#1a6ab0",
    leftTabDim:   "#607090",
    leftTabCount: "#40608a",
    centerBg:     "#f0f2f8",
    centerBorder: "#a0a8c0",
    itemLabel:    "#0a1428",
    itemAction:   "#1a3a6a",
    itemBorder:   "rgba(100,120,160,0.25)",
    itemCheckedOp: 0.3,
    checkboxBorder:"#3a70b0",
    checkboxDone: "rgba(20,120,60,0.2)",
    checkColor:   "#1a7040",
    actionColor:  "#1a4a8a",
    sectionBg:    "linear-gradient(90deg, rgba(26,106,176,0.15) 0%, rgba(220,226,238,0) 80%)",
    sectionBorder:"#1a6ab0",
    sectionTitle: "#0a2858",
    noteColor:    "#5a6a20",
    cautionColor: "#8a2010",
    noteBg:       "rgba(120,140,20,0.08)",
    cautionBg:    "rgba(180,40,20,0.06)",
    panelTabBg:   "#c8ccd8",
    editBg:       "#dde0ec",
    editBorder:   "#9098b8",
    editHintColor:"#404878",
    inputBg:      "#f8f9fc",
    scratchBg:    "#f0f2f8",
  } : {
    // Dark mode — original
    appBg:        "#0d0f12",
    headerBg:     "linear-gradient(135deg,#0a0c10 0%,#141820 60%,#0a0c10 100%)",
    headerBorder: "#e8c84a",
    leftSideBg:   "#141820",
    leftSideBorder:"#2a3040",
    leftTabActive: "rgba(232,200,74,0.07)",
    leftTabText:  "#e8c84a",
    leftTabDim:   "#7a8090",
    leftTabCount: "#444",
    centerBg:     "#0d0f12",
    centerBorder: "#2a3040",
    itemLabel:    "#e8e4d8",
    itemAction:   "#e8c84a",
    itemBorder:   "rgba(42,48,64,0.45)",
    itemCheckedOp: 0.35,
    checkboxBorder:"#3a4050",
    checkboxDone: "rgba(61,190,108,0.15)",
    checkColor:   "#3dbe6c",
    actionColor:  "#e8c84a",
    sectionBg:    "linear-gradient(90deg, rgba(74,159,232,0.14) 0%, rgba(20,24,32,0) 80%)",
    sectionBorder:"#4a9fe8",
    sectionTitle: "#4a9fe8",
    noteColor:    "#b8a840",
    cautionColor: "#d06050",
    noteBg:       "rgba(232,200,74,0.03)",
    cautionBg:    "rgba(232,90,74,0.07)",
    panelTabBg:   "#141820",
    editBg:       "#0d1018",
    editBorder:   "#2a3040",
    editHintColor:"#4a5068",
    inputBg:      "#141820",
    scratchBg:    "#0a0e0a",
  };

  // Speech synthesis state
  const [ttsActive, setTtsActive] = useState(null);    // { sectionKey, idx } — which section+item is speaking
  const [ttsPaused, setTtsPaused] = useState(false);
  const ttsQueueRef = useRef([]);                       // array of { text, checkKey } to speak
  const ttsIdxRef = useRef(0);
  const ttsUtterRef = useRef(null);

  // Load persisted customizations and notepad images on mount
  useEffect(() => {
    const load = async () => {
      try {
        // Load checklist customizations
        const result = await window.storage.get("kneeboard-custom-items");
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          const restored = {};
          Object.keys(parsed).forEach(k => {
            restored[k] = {
              removed: new Set(parsed[k].removed || []),
              added: parsed[k].added || [],
              order: parsed[k].order || null,
              renames: parsed[k].renames || {},
            };
          });
          setCustomItems(restored);
        }
        // Load all notepad images — list keys with our prefix
        const keyList = await window.storage.list("notepad-canvas::");
        if (keyList && keyList.keys && keyList.keys.length > 0) {
          const images = {};
          await Promise.all(keyList.keys.map(async (k) => {
            try {
              const r = await window.storage.get(k);
              if (r && r.value) images[k] = r.value;
            } catch {}
          }));
          setNotepadImages(images);
        }
        // Load custom V-speeds
        const vsResult = await window.storage.get("kneeboard-vspeeds");
        if (vsResult && vsResult.value) {
          try { setVspeeds(JSON.parse(vsResult.value)); } catch {}
        }
        // Load custom perf data
        const perfResult = await window.storage.get("kneeboard-perfdata");
        if (perfResult && perfResult.value) {
          try { setPerfData(JSON.parse(perfResult.value)); } catch {}
        }
        // Load custom climb data
        const climbResult = await window.storage.get("kneeboard-climbdata");
        if (climbResult && climbResult.value) {
          try { setClimbData(JSON.parse(climbResult.value)); } catch {}
        }
        // Load custom cruise data
        const cruiseResult = await window.storage.get("kneeboard-cruisedata");
        if (cruiseResult && cruiseResult.value) {
          try { setCruiseData(JSON.parse(cruiseResult.value)); } catch {}
        }
        // Load scratchpad text
        const spResult = await window.storage.get("scratchpad-text");
        if (spResult && spResult.value) setScratchpadText(spResult.value);
      } catch {}
    };
    if (typeof window !== "undefined" && window.storage) load();
  }, []);

  // Persist customItems whenever they change
  const saveCustomItems = async (next) => {
    try {
      const serializable = {};
      Object.keys(next).forEach(k => {
        serializable[k] = {
          removed: [...next[k].removed],
          added: next[k].added,
          order: next[k].order || null,
          renames: next[k].renames || {},
        };
      });
      await window.storage.set("kneeboard-custom-items", JSON.stringify(serializable));
    } catch {}
  };

  const getSectionKey = (pageId, sectionTitle) => `${pageId}::${sectionTitle}`;

  const saveVspeeds = async (next) => {
    try { await window.storage.set("kneeboard-vspeeds", JSON.stringify(next)); } catch {}
  };

  const updateVspeed = (gi, ii, field, val) => {
    setVspeeds(prev => {
      const next = prev.map((g, gIdx) => gIdx !== gi ? g : {
        ...g, items: g.items.map((item, iIdx) => iIdx !== ii ? item : { ...item, [field]: val })
      });
      saveVspeeds(next);
      return next;
    });
  };

  const resetVspeeds = () => {
    const fresh = VSPEEDS.map(g => ({ ...g, items: g.items.map(i => ({ ...i })) }));
    setVspeeds(fresh); saveVspeeds(fresh);
  };

  const savePerfData = async (next) => {
    try { await window.storage.set("kneeboard-perfdata", JSON.stringify(next)); } catch {}
  };

  const saveClimbData = async (next) => {
    try { await window.storage.set("kneeboard-climbdata", JSON.stringify(next)); } catch {}
  };

  const saveCruiseData = async (next) => {
    try { await window.storage.set("kneeboard-cruisedata", JSON.stringify(next)); } catch {}
  };

  const updateClimbCell = (si, ri, ci, val) => {
    setClimbData(prev => {
      const next = prev.map((s, sIdx) => sIdx !== si ? s : { ...s, rows: s.rows.map((row, rIdx) => rIdx !== ri ? row : row.map((cell, cIdx) => cIdx !== ci ? cell : val)) });
      saveClimbData(next); return next;
    });
  };

  const updateCruiseCell = (si, ri, ci, val) => {
    setCruiseData(prev => {
      const next = prev.map((s, sIdx) => sIdx !== si ? s : { ...s, rows: s.rows.map((row, rIdx) => rIdx !== ri ? row : row.map((cell, cIdx) => cIdx !== ci ? cell : val)) });
      saveCruiseData(next); return next;
    });
  };

  const resetClimbData = () => { const f = CLIMB_DATA.map(s => ({ ...s, rows: s.rows.map(r => [...r]) })); setClimbData(f); saveClimbData(f); };
  const resetCruiseData = () => { const f = CRUISE_DATA.map(s => ({ ...s, rows: s.rows.map(r => [...r]) })); setCruiseData(f); saveCruiseData(f); };

  const updatePerfCell = (si, ri, ci, val) => {
    setPerfData(prev => {
      const next = prev.map((s, sIdx) => sIdx !== si ? s : {
        ...s, rows: s.rows.map((row, rIdx) => rIdx !== ri ? row : row.map((cell, cIdx) => cIdx !== ci ? cell : val))
      });
      savePerfData(next);
      return next;
    });
  };

  const resetPerfData = () => {
    const fresh = PERF_DATA.map(s => ({ ...s, rows: s.rows.map(r => [...r]) }));
    setPerfData(fresh);
    savePerfData(fresh);
  };

  const getSectionCustom = (pageId, sectionTitle) => {
    const key = getSectionKey(pageId, sectionTitle);
    return customItems[key] || { removed: new Set(), added: [], order: null, renames: {} };
  };

  const toggleRemoveItem = (pageId, sectionTitle, label) => {
    const key = getSectionKey(pageId, sectionTitle);
    setCustomItems(prev => {
      const existing = prev[key] || { removed: new Set(), added: [], order: null, renames: {} };
      const removed = new Set(existing.removed);
      if (removed.has(label)) removed.delete(label); else removed.add(label);
      const next = { ...prev, [key]: { ...existing, removed } };
      saveCustomItems(next);
      return next;
    });
  };

  // Rename an original (POH) item — stores override under original label key
  const renameOriginalItem = (pageId, sectionTitle, originalLabel, newLabel, newAction) => {
    if (!newLabel.trim()) return;
    const key = getSectionKey(pageId, sectionTitle);
    setCustomItems(prev => {
      const existing = prev[key] || { removed: new Set(), added: [], order: null, renames: {} };
      const renames = { ...existing.renames, [originalLabel]: { l: newLabel.trim(), a: newAction.trim().toUpperCase() } };
      const next = { ...prev, [key]: { ...existing, renames } };
      saveCustomItems(next);
      return next;
    });
    setInlineEdit(null);
  };

  // Rename a custom-added item by its index in added[]
  const renameCustomAddedItem = (pageId, sectionTitle, addedIdx, newLabel, newAction) => {
    if (!newLabel.trim()) return;
    const key = getSectionKey(pageId, sectionTitle);
    setCustomItems(prev => {
      const existing = prev[key] || { removed: new Set(), added: [], order: null, renames: {} };
      const added = existing.added.map((it, i) =>
        i === addedIdx ? { ...it, l: newLabel.trim(), a: newAction.trim().toUpperCase() } : it
      );
      const next = { ...prev, [key]: { ...existing, added } };
      saveCustomItems(next);
      return next;
    });
    setInlineEdit(null);
  };

  const dragRef = useRef({ fromIdx: null, sectionKey: null });

  const addCustomItem = (pageId, sectionTitle) => {
    if (!newItemLabel.trim()) return;
    const key = getSectionKey(pageId, sectionTitle);
    const newItem = { l: newItemLabel.trim(), a: newItemAction.trim().toUpperCase() || "CHECK", custom: true };
    setCustomItems(prev => {
      const existing = prev[key] || { removed: new Set(), added: [], order: null };
      const next = { ...prev, [key]: { ...existing, added: [...existing.added, newItem] } };
      saveCustomItems(next);
      return next;
    });
    setNewItemLabel("");
    setNewItemAction("");
  };

  const removeAddedItem = (pageId, sectionTitle, addedIdx) => {
    const key = getSectionKey(pageId, sectionTitle);
    setCustomItems(prev => {
      const existing = prev[key] || { removed: new Set(), added: [], order: null };
      const added = existing.added.filter((_, i) => i !== addedIdx);
      // Clear order so it auto-recomputes without the removed item
      const next = { ...prev, [key]: { ...existing, added, order: null } };
      saveCustomItems(next);
      return next;
    });
  };

  // Build a merged display list for a section: original items + custom added, respecting saved order and renames
  const getMergedItems = (pageId, sectionTitle, sectionItems) => {
    const key = getSectionKey(pageId, sectionTitle);
    const custom = getSectionCustom(pageId, sectionTitle);
    const renames = custom.renames || {};
    const checkableOriginal = sectionItems.filter(i => !i.type).map(i => ({
      ...i,
      custom: false,
      originalLabel: i.l, // always keep the original for keying/storage
      l: renames[i.l] ? renames[i.l].l : i.l,
      a: renames[i.l] ? renames[i.l].a : i.a,
    }));
    const allCheckable = [...checkableOriginal, ...custom.added.map((i, addedIdx) => ({ ...i, custom: true, addedIdx }))];
    if (!custom.order || custom.order.length !== allCheckable.length) return allCheckable;
    return custom.order.map(i => allCheckable[i]).filter(Boolean);
  };

  const reorderSection = (pageId, sectionTitle, fromIdx, toIdx, mergedLength) => {
    if (fromIdx === toIdx) return;
    const key = getSectionKey(pageId, sectionTitle);
    setCustomItems(prev => {
      const existing = prev[key] || { removed: new Set(), added: [], order: null };
      // Build current order array
      const currentOrder = existing.order && existing.order.length === mergedLength
        ? [...existing.order]
        : Array.from({ length: mergedLength }, (_, i) => i);
      const [moved] = currentOrder.splice(fromIdx, 1);
      currentOrder.splice(toIdx, 0, moved);
      const next = { ...prev, [key]: { ...existing, order: currentOrder } };
      saveCustomItems(next);
      return next;
    });
  };

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const z = v => String(v).padStart(2, "0");
      setZuluTime(`${z(n.getUTCHours())}${z(n.getUTCMinutes())}Z`);
      setLocalTime(`${z(n.getHours())}:${z(n.getMinutes())}:${z(n.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const formatTimer = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const z = v => String(v).padStart(2, "0");
    return h > 0 ? `${z(h)}:${z(m)}:${z(sec)}` : `${z(m)}:${z(sec)}`;
  };

  // --- TTS ENGINE ---
  const getVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred = [
      "Samantha",
      "Daniel",
      "Siri",
      "Siri Female",
      "Siri Male",
      "Karen",
      "Moira",
      "Alex",
      "Google UK English Female",
      "Google US English",
    ];
    for (const name of preferred) {
      const v = voices.find(v => v.name === name || v.name.includes(name));
      if (v) return v;
    }
    return voices.find(v => v.lang.startsWith("en")) || voices[0] || null;
  };

  const speakItem = (queue, idx, sectionKey) => {
    if (idx >= queue.length) {
      setTtsActive(null); setTtsPaused(false);
      ttsQueueRef.current = []; ttsIdxRef.current = 0;
      return;
    }
    const { label, action } = queue[idx];
    setTtsActive({ sectionKey, idx });

    const labelUtter = new SpeechSynthesisUtterance(label);
    labelUtter.voice = getVoice();
    labelUtter.rate = 0.85;
    labelUtter.pitch = 0.9;
    labelUtter.volume = 1.0;

    labelUtter.onend = () => {
      if (!ttsQueueRef.current.length) return;
      setTimeout(() => {
        const actionUtter = new SpeechSynthesisUtterance(action);
        actionUtter.voice = getVoice();
        actionUtter.rate = 0.85;
        actionUtter.pitch = 0.9;
        actionUtter.volume = 1.0;
        actionUtter.onend = () => {
          if (!ttsQueueRef.current.length) return;
          setTimeout(() => speakItem(queue, idx + 1, sectionKey), 600);
        };
        actionUtter.onerror = () => speakItem(queue, idx + 1, sectionKey);
        ttsUtterRef.current = actionUtter;
        window.speechSynthesis.speak(actionUtter);
      }, 500);
    };
    labelUtter.onerror = () => speakItem(queue, idx + 1, sectionKey);
    ttsUtterRef.current = labelUtter;
    window.speechSynthesis.speak(labelUtter);
  };

  const startTTS = (sectionKey, mergedItems, pg, section) => {
    window.speechSynthesis.cancel();
    const queue = mergedItems.map(item => ({
      label: item.l,
      action: item.a || "",
    }));
    if (!queue.length) return;
    ttsQueueRef.current = queue;
    ttsIdxRef.current = 0;
    setTtsPaused(false);
    setTtsActive({ sectionKey, idx: -1 });
    speakItem(queue, 0, sectionKey);
  };

  const pauseResumeTTS = () => {
    if (ttsPaused) {
      window.speechSynthesis.resume();
      setTtsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setTtsPaused(true);
    }
  };

  const stopTTS = () => {
    window.speechSynthesis.cancel();
    ttsQueueRef.current = [];
    ttsIdxRef.current = 0;
    ttsUtterRef.current = null;
    setTtsActive(null);
    setTtsPaused(false);
  };

  const toggleItem = (pageId, sectionTitle, label) => {
    const key = `${pageId}::${sectionTitle}::${label}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetPage = (pageId) => {
    setChecked(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.startsWith(pageId + "::")) delete next[k]; });
      return next;
    });
  };

  const countPage = (pageId) => {
    const allPgs = [...PAGES, ...EMG_PAGES];
    const pg = allPgs.find(p => p.id === pageId);
    if (!pg) return { total: 0, done: 0 };
    let total = 0, done = 0;
    pg.sections.forEach(s => {
      const custom = getSectionCustom(pageId, s.title);
      const renames = custom.renames || {};
      // Build merged list the same way getMergedItems does so indices match
      const checkableOriginal = s.items.filter(i => !i.type).map(i => ({
        ...i, custom: false, originalLabel: i.l,
        l: renames[i.l] ? renames[i.l].l : i.l,
      }));
      const allCheckable = [...checkableOriginal, ...custom.added.map((i, ai) => ({ ...i, custom: true, addedIdx: ai }))];
      const ordered = custom.order && custom.order.length === allCheckable.length
        ? custom.order.map(i => allCheckable[i]).filter(Boolean)
        : allCheckable;

      ordered.forEach((it, idx) => {
        if (custom.removed.has(it.originalLabel || it.l) && !it.custom) return;
        const key = it.custom
          ? `${pageId}::${s.title}::CUSTOM::${idx}::${it.l}`
          : `${pageId}::${s.title}::${idx}::${it.originalLabel || it.l}`;
        total++;
        if (checked[key]) done++;
      });
    });
    return { total, done };
  };

  const masterCount = [...PAGES, ...EMG_PAGES].reduce((acc, p) => {
    const c = countPage(p.id);
    return { total: acc.total + c.total, done: acc.done + c.done };
  }, { total: 0, done: 0 });

  const isEmgPage = EMG_PAGES.some(p => p.id === currentPage);
  const activePg = isEmgPage
    ? EMG_PAGES.find(p => p.id === currentPage)
    : PAGES.find(p => p.id === currentPage);

  const renderChecklist = (pg) => {
    if (!pg) return null;
    const isEmg = EMG_PAGES.some(p => p.id === pg.id);
    const emgMeta = isEmg ? EMG_PAGES.find(p => p.id === pg.id) : null;
    const accentColor = emgMeta ? emgMeta.color : "#e8c84a";
    const pageCount = countPage(pg.id);
    const isComplete = pageCount.total > 0 && pageCount.done === pageCount.total;

    return (
      <div key={pg.id} style={{ animation: "fadeIn 0.15s ease" }}>
        <div style={{
          background: lightMode ? "#dde2ee" : "#1a1f2a",
          borderBottom: `2px solid ${isEmg ? accentColor : T.centerBorder}`,
          padding: "7px 10px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: isEmg ? accentColor : T.sectionTitle }}>
              {pg.id === "approach" ? "APPROACH & LANDING"
                : pg.id === "engine_fail" ? "ENGINE FAILURES"
                : pg.id === "spin" ? "SPIN RECOVERY"
                : pg.id === "fires" ? "FIRES"
                : pg.id === "icing" ? "ICING"
                : pg.id === "electrical" ? "ELEC FAILURE"
                : pg.label || pg.id.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: lightMode ? "#607090" : "#7a8090", marginTop: 1 }}>
              {isEmg ? "MEMORY ITEMS FIRST — C172S" : "CESSNA 172S SKYHAWK"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: 9, fontWeight: 700,
              letterSpacing: 0.5, padding: "3px 7px", borderRadius: 3,
              background: isComplete ? "rgba(61,190,108,0.15)" : "rgba(232,90,74,0.12)",
              border: `1px solid ${isComplete ? "#3dbe6c" : "#e85a4a"}`,
              color: isComplete ? "#3dbe6c" : "#e85a4a",
              whiteSpace: "nowrap",
            }}>
              {isComplete ? "COMPLETED" : "INCOMPLETE"} {pageCount.done}/{pageCount.total}
            </div>
            <button onClick={() => resetPage(pg.id)} style={{
              fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: 1, textTransform: "uppercase", background: "transparent",
              border: `1px solid ${T.centerBorder}`, color: lightMode ? "#607090" : "#7a8090",
              padding: "3px 7px", borderRadius: 3, cursor: "pointer",
            }}>↺</button>
          </div>
        </div>

        {pg.sections.map(section => {
          const sectionKey = getSectionKey(pg.id, section.title);
          const isEditing = editingSection === sectionKey;
          const custom = getSectionCustom(pg.id, section.title);

          return (
          <div key={section.title}>
            {isEmg ? (
              <div style={{
                padding: "10px 12px 8px",
                background: `linear-gradient(90deg, rgba(${emgMeta.id === "fires" ? "232,90,74" : emgMeta.id === "engine_fail" ? "232,200,74" : emgMeta.id === "icing" ? "168,216,240" : emgMeta.id === "electrical" ? "240,208,96" : "74,232,200"},0.12) 0%, rgba(20,24,32,0) 80%)`,
                borderBottom: `2px solid ${accentColor}`,
                borderTop: "1px solid rgba(255,255,255,0.04)",
                marginTop: 2,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                {section.sectionIcon && (
                  <div style={{ flexShrink: 0, opacity: 0.92 }}>{section.sectionIcon}</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 19, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: accentColor, lineHeight: 1.15 }}>
                    {section.title}
                  </div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: accentColor, opacity: 0.5, letterSpacing: 1, marginTop: 2 }}>
                    {section.items.filter(i => !i.type && !custom.removed.has(i.l)).length + custom.added.length} ITEMS
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {/* TTS controls — hidden while editing */}
                  {!isEditing && (ttsActive && ttsActive.sectionKey === sectionKey ? (
                    <>
                      <button onClick={pauseResumeTTS} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "3px 9px", borderRadius: 3, cursor: "pointer", background: "rgba(232,200,74,0.15)", border: "1px solid #e8c84a", color: "#e8c84a" }}>
                        {ttsPaused ? "▶ RESUME" : "⏸ PAUSE"}
                      </button>
                      <button onClick={stopTTS} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "3px 9px", borderRadius: 3, cursor: "pointer", background: "rgba(232,90,74,0.12)", border: "1px solid #e85a4a", color: "#e85a4a" }}>
                        ■ STOP
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); const mi = getMergedItems(pg.id, section.title, section.items).filter(i => !custom.removed.has(i.originalLabel || i.l) || i.custom); startTTS(sectionKey, mi, pg, section); }}
                      style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "3px 9px", borderRadius: 3, cursor: "pointer", background: "rgba(61,190,108,0.1)", border: "1px solid #3dbe6c", color: "#3dbe6c", display: "flex", alignItems: "center", gap: 3 }}
                    >▶ READ</button>
                  ))}
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingSection(isEditing ? null : sectionKey); setNewItemLabel(""); setNewItemAction(""); }}
                    style={{
                      background: isEditing ? "rgba(232,200,74,0.18)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isEditing ? "#e8c84a" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 3, padding: "3px 8px", cursor: "pointer", flexShrink: 0,
                      fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700,
                      letterSpacing: 1, color: isEditing ? "#e8c84a" : "#7a8090",
                      display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 12 }}>{isEditing ? "✕" : "✎"}</span>
                    {isEditing ? "DONE" : "EDIT"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                padding: "9px 12px 8px",
                background: T.sectionBg,
                borderBottom: `2px solid ${T.sectionBorder}`,
                borderTop: `1px solid ${lightMode ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)"}`,
                marginTop: 2,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: T.sectionTitle, lineHeight: 1.15 }}>
                    {section.title}
                  </div>
                </div>
                {/* TTS controls — hidden while editing */}
                {!isEditing && (ttsActive && ttsActive.sectionKey === sectionKey ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={pauseResumeTTS} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "2px 8px", borderRadius: 3, cursor: "pointer", background: "rgba(232,200,74,0.15)", border: "1px solid #e8c84a", color: "#e8c84a", display: "flex", alignItems: "center", gap: 3 }}>
                      {ttsPaused ? "▶ RESUME" : "⏸ PAUSE"}
                    </button>
                    <button onClick={stopTTS} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "2px 8px", borderRadius: 3, cursor: "pointer", background: "rgba(232,90,74,0.12)", border: "1px solid #e85a4a", color: "#e85a4a" }}>
                      ■ STOP
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); const mi = getMergedItems(pg.id, section.title, section.items).filter(i => !custom.removed.has(i.originalLabel || i.l) || i.custom); startTTS(sectionKey, mi, pg, section); }}
                    style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "3px 9px", borderRadius: 3, cursor: "pointer", background: "rgba(61,190,108,0.1)", border: "1px solid #3dbe6c", color: "#3dbe6c", display: "flex", alignItems: "center", gap: 3 }}
                  >▶ READ</button>
                ))}
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingSection(isEditing ? null : sectionKey); setNewItemLabel(""); setNewItemAction(""); }}
                  style={{
                    background: isEditing ? "rgba(232,200,74,0.18)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isEditing ? "#e8c84a" : "rgba(74,159,232,0.3)"}`,
                    borderRadius: 3, padding: "3px 8px", cursor: "pointer",
                    fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700,
                    letterSpacing: 1, color: isEditing ? "#e8c84a" : "#4a6888",
                    display: "flex", alignItems: "center", gap: 3, transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 11 }}>{isEditing ? "✕" : "✎"}</span>
                  {isEditing ? "DONE" : "EDIT"}
                </button>
              </div>
            )}

            {/* EDIT MODE PANEL */}
            {isEditing && (
              <div style={{ background: "#0d1018", border: "1px solid #2a3040", borderTop: "none", margin: "0 0 2px" }}>
                <div style={{ padding: "6px 10px 4px", borderBottom: "1px solid #1a2030", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#e8c84a", letterSpacing: 1.5 }}>✎ EDIT MODE</span>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#4a5068", letterSpacing: 1 }}>TAP LABEL TO RENAME · × TO HIDE · DRAG TO REORDER</span>
                  </div>
                  {(custom.removed.size > 0 || custom.added.length > 0 || Object.keys(custom.renames || {}).length > 0) && (
                    <button
                      onClick={() => {
                        setCustomItems(prev => {
                          const next = { ...prev };
                          delete next[sectionKey];
                          saveCustomItems(next);
                          return next;
                        });
                      }}
                      style={{
                        background: "transparent", border: "1px solid #3a2020",
                        borderRadius: 3, padding: "2px 8px", cursor: "pointer",
                        fontFamily: "'Share Tech Mono', monospace", fontSize: 8,
                        color: "#c85050", letterSpacing: 1, flexShrink: 0,
                      }}
                    >↺ RESET DEFAULT</button>
                  )}
                </div>

                {/* Draggable merged item list */}
                {(() => {
                  const merged = getMergedItems(pg.id, section.title, section.items);
                  return merged.map((item, idx) => {
                    const isRemoved = !item.custom && custom.removed.has(item.originalLabel || item.l);
                    const itemEditKey = sectionKey + "::" + idx;
                    const isInlineEditing = inlineEdit && inlineEdit.key === itemEditKey;

                    return (
                      <div
                        key={(item.custom ? "c-" : "o-") + (item.originalLabel || item.l) + idx}
                        draggable={!isInlineEditing}
                        onDragStart={() => { if (!isInlineEditing) dragRef.current = { fromIdx: idx, sectionKey }; }}
                        onDragOver={e => { e.preventDefault(); if (!isInlineEditing) e.currentTarget.style.borderTop = `2px solid ${accentColor}`; }}
                        onDragLeave={e => { e.currentTarget.style.borderTop = ""; }}
                        onDrop={e => {
                          e.preventDefault();
                          e.currentTarget.style.borderTop = "";
                          if (dragRef.current.sectionKey === sectionKey) {
                            reorderSection(pg.id, section.title, dragRef.current.fromIdx, idx, merged.length);
                          }
                        }}
                        onDragEnd={() => { dragRef.current = { fromIdx: null, sectionKey: null }; }}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                          borderBottom: "1px solid rgba(42,48,64,0.4)",
                          background: isInlineEditing ? "rgba(74,159,232,0.06)" : item.custom ? "rgba(61,190,108,0.04)" : isRemoved ? "rgba(232,90,74,0.05)" : "transparent",
                          opacity: isRemoved ? 0.55 : 1, transition: "opacity 0.15s, border-top 0.1s, background 0.15s",
                          cursor: isInlineEditing ? "default" : "grab",
                        }}
                      >
                        {/* Drag handle */}
                        <div style={{
                          display: "flex", flexDirection: "column", gap: 3, flexShrink: 0,
                          padding: "2px 3px", cursor: isInlineEditing ? "default" : "grab",
                          opacity: isInlineEditing ? 0.1 : 0.35,
                        }}>
                          {[0,1,2].map(i => (
                            <div key={i} style={{ width: 14, height: 1.5, background: "#e8e4d8", borderRadius: 1 }} />
                          ))}
                        </div>

                        {/* Remove / restore button */}
                        {!isInlineEditing && (item.custom ? (
                          <button
                            onClick={() => {
                              const addedIdx = typeof item.addedIdx === "number" ? item.addedIdx : custom.added.findIndex(a => a.l === item.l);
                              removeAddedItem(pg.id, section.title, addedIdx);
                            }}
                            style={{
                              width: 22, height: 22, borderRadius: 3, flexShrink: 0,
                              border: "1.5px solid #e85a4a", background: "rgba(232,90,74,0.15)",
                              color: "#e85a4a", fontSize: 13, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >✕</button>
                        ) : (
                          <button
                            onClick={() => toggleRemoveItem(pg.id, section.title, item.originalLabel || item.l)}
                            style={{
                              width: 22, height: 22, borderRadius: 3, flexShrink: 0,
                              border: `1.5px solid ${isRemoved ? "#e85a4a" : "#3a4050"}`,
                              background: isRemoved ? "rgba(232,90,74,0.2)" : "transparent",
                              color: isRemoved ? "#e85a4a" : "#4a5068",
                              fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}
                          >{isRemoved ? "＋" : "✕"}</button>
                        ))}

                        {/* Inline edit inputs OR tappable label/action */}
                        {isInlineEditing ? (
                          <>
                            <input
                              autoFocus
                              value={inlineEdit.l}
                              onChange={e => setInlineEdit(prev => ({ ...prev, l: e.target.value }))}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  if (item.custom) {
                                    const addedIdx = typeof item.addedIdx === "number" ? item.addedIdx : custom.added.findIndex(a => a.l === item.l);
                                    renameCustomAddedItem(pg.id, section.title, addedIdx, inlineEdit.l, inlineEdit.a);
                                  } else {
                                    renameOriginalItem(pg.id, section.title, item.originalLabel || item.l, inlineEdit.l, inlineEdit.a);
                                  }
                                }
                                if (e.key === "Escape") setInlineEdit(null);
                              }}
                              style={{
                                flex: 2, background: "#0d1018", border: "1px solid #4a9fe8", borderRadius: 3,
                                color: "#e8e4d8", padding: "4px 7px", fontSize: 13,
                                fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, outline: "none",
                              }}
                            />
                            <input
                              value={inlineEdit.a}
                              onChange={e => setInlineEdit(prev => ({ ...prev, a: e.target.value }))}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  if (item.custom) {
                                    const addedIdx = typeof item.addedIdx === "number" ? item.addedIdx : custom.added.findIndex(a => a.l === item.l);
                                    renameCustomAddedItem(pg.id, section.title, addedIdx, inlineEdit.l, inlineEdit.a);
                                  } else {
                                    renameOriginalItem(pg.id, section.title, item.originalLabel || item.l, inlineEdit.l, inlineEdit.a);
                                  }
                                }
                                if (e.key === "Escape") setInlineEdit(null);
                              }}
                              placeholder="ACTION"
                              style={{
                                flex: 1, background: "#0d1018", border: "1px solid #4a9fe8", borderRadius: 3,
                                color: "#e8c84a", padding: "4px 7px", fontSize: 11,
                                fontFamily: "'Share Tech Mono', monospace", outline: "none",
                              }}
                            />
                            {/* Confirm */}
                            <button
                              onClick={() => {
                                if (item.custom) {
                                  const addedIdx = typeof item.addedIdx === "number" ? item.addedIdx : custom.added.findIndex(a => a.l === item.l);
                                  renameCustomAddedItem(pg.id, section.title, addedIdx, inlineEdit.l, inlineEdit.a);
                                } else {
                                  renameOriginalItem(pg.id, section.title, item.originalLabel || item.l, inlineEdit.l, inlineEdit.a);
                                }
                              }}
                              style={{
                                width: 24, height: 24, borderRadius: 3, flexShrink: 0,
                                border: "1.5px solid #3dbe6c", background: "rgba(61,190,108,0.2)",
                                color: "#3dbe6c", fontSize: 14, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >✓</button>
                            {/* Cancel */}
                            <button
                              onClick={() => setInlineEdit(null)}
                              style={{
                                width: 24, height: 24, borderRadius: 3, flexShrink: 0,
                                border: "1.5px solid #3a4050", background: "transparent",
                                color: "#7a8090", fontSize: 13, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >✕</button>
                          </>
                        ) : (
                          <>
                            <span
                              onClick={() => !isRemoved && setInlineEdit({ key: itemEditKey, l: item.l, a: item.a })}
                              title={isRemoved ? "" : "Tap to rename"}
                              style={{
                                flex: 1, fontSize: 13, fontWeight: 500,
                                color: item.custom ? "#aaddbb" : isRemoved ? "#5a6070" : "#e8e4d8",
                                textDecoration: isRemoved ? "line-through" : "none",
                                cursor: isRemoved ? "default" : "text",
                                borderBottom: isRemoved ? "none" : "1px dashed rgba(74,159,232,0.25)",
                                paddingBottom: 1,
                              }}
                            >{item.l}</span>
                            <span
                              onClick={() => !isRemoved && setInlineEdit({ key: itemEditKey, l: item.l, a: item.a })}
                              title={isRemoved ? "" : "Tap to rename"}
                              style={{
                                fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 0.5,
                                color: item.custom ? "#3dbe6c" : isRemoved ? "#3a4050" : "#e8c84a",
                                cursor: isRemoved ? "default" : "text",
                                borderBottom: isRemoved ? "none" : "1px dashed rgba(232,200,74,0.2)",
                                paddingBottom: 1,
                              }}
                            >{item.a}</span>
                            {item.custom && (
                              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 7, color: "#3dbe6c", opacity: 0.45, letterSpacing: 1 }}>★</span>
                            )}
                            {!item.custom && (custom.renames || {})[item.originalLabel || item.l] && (
                              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 7, color: "#4a9fe8", opacity: 0.6, letterSpacing: 1 }}>✎</span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  });
                })()}

                {/* Add new item form */}
                <div style={{ padding: "8px 10px", background: "#0a0d14", borderTop: "1px solid #1a2030" }}>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#4a9fe8", letterSpacing: 1.5, marginBottom: 6 }}>＋ ADD ITEM</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      value={newItemLabel}
                      onChange={e => setNewItemLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addCustomItem(pg.id, section.title); }}
                      placeholder="Item label..."
                      style={{
                        flex: 2, background: "#141820", border: "1px solid #2a3040", borderRadius: 3,
                        color: "#e8e4d8", padding: "5px 8px", fontSize: 12,
                        fontFamily: "'Rajdhani', sans-serif", fontWeight: 500,
                        outline: "none",
                      }}
                    />
                    <input
                      value={newItemAction}
                      onChange={e => setNewItemAction(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addCustomItem(pg.id, section.title); }}
                      placeholder="Action..."
                      style={{
                        flex: 1, background: "#141820", border: "1px solid #2a3040", borderRadius: 3,
                        color: "#e8c84a", padding: "5px 8px", fontSize: 11,
                        fontFamily: "'Share Tech Mono', monospace",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={() => addCustomItem(pg.id, section.title)}
                      style={{
                        background: newItemLabel.trim() ? "rgba(61,190,108,0.2)" : "rgba(42,48,64,0.4)",
                        border: `1px solid ${newItemLabel.trim() ? "#3dbe6c" : "#2a3040"}`,
                        borderRadius: 3, padding: "5px 10px", cursor: newItemLabel.trim() ? "pointer" : "default",
                        fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700,
                        color: newItemLabel.trim() ? "#3dbe6c" : "#3a4050", letterSpacing: 1,
                        transition: "all 0.15s", whiteSpace: "nowrap",
                      }}
                    >ADD ＋</button>
                  </div>
                  {/* Reset moved to edit panel header */}
                </div>
              </div>
            )}

            {/* NORMAL ITEM RENDER — unified merged order, skip removed */}
            {!isEditing && (() => {
              const merged = getMergedItems(pg.id, section.title, section.items);
              // Prepend non-checkable items (notes/cautions) first, in original order
              const nonCheckable = section.items.filter(i => i.type);
              return (
                <>
                  {nonCheckable.map((item, idx) => {
                    if (item.type === "note") return (
                      <div key={"nc-" + idx} style={{ padding: "5px 10px 5px 12px", borderBottom: `1px solid ${T.itemBorder}`, borderLeft: "2px solid rgba(232,200,74,0.35)", background: T.noteBg }}>
                        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: T.noteColor, fontStyle: "italic" }}>★ {item.l}</span>
                      </div>
                    );
                    if (item.type === "caution") return (
                      <div key={"nc-" + idx} style={{ padding: "5px 10px 5px 12px", borderBottom: `1px solid ${T.itemBorder}`, borderLeft: "2px solid rgba(232,90,74,0.5)", background: T.cautionBg }}>
                        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: T.cautionColor, fontStyle: "italic" }}>⚠ {item.l}</span>
                      </div>
                    );
                    return null;
                  })}
                  {merged.map((item, idx) => {
                    if (custom.removed.has(item.originalLabel || item.l) && !item.custom) return null;
                    const checkKey = item.custom
                      ? `${pg.id}::${section.title}::CUSTOM::${idx}::${item.l}`
                      : `${pg.id}::${section.title}::${idx}::${item.originalLabel || item.l}`;
                    const isChecked = !!checked[checkKey];
                    const isSpeaking = ttsActive && ttsActive.sectionKey === sectionKey && ttsActive.idx === idx;
                    const notepadKey = checkKey + "::notepad";
                    const isNotepadOpen = openNotepads.has(notepadKey);
                    const toggleNotepad = (e) => {
                      e.stopPropagation();
                      setOpenNotepads(prev => {
                        const next = new Set(prev);
                        if (next.has(notepadKey)) next.delete(notepadKey);
                        else next.add(notepadKey);
                        return next;
                      });
                    };
                    const closeNotepad = () => setOpenNotepads(prev => { const n = new Set(prev); n.delete(notepadKey); return n; });

                    return (
                      <div key={checkKey}>
                        <div
                          className="check-item"
                          onClick={() => setChecked(prev => ({ ...prev, [checkKey]: !prev[checkKey] }))}
                          style={{
                            display: "flex", alignItems: "flex-start",
                            padding: "8px 10px",
                            borderBottom: isNotepadOpen ? "none" : `1px solid ${isSpeaking ? "rgba(232,200,74,0.4)" : T.itemBorder}`,
                            borderLeft: isSpeaking ? "3px solid #e8c84a" : isEmg ? `2px solid rgba(232,90,74,0.18)` : "2px solid transparent",
                            borderRight: isSpeaking ? "3px solid #e8c84a" : "none",
                            borderTop: isSpeaking ? "2px solid rgba(232,200,74,0.4)" : "none",
                            cursor: "pointer", gap: 9, minHeight: 38,
                            opacity: isChecked ? T.itemCheckedOp : 1,
                            background: isSpeaking ? "rgba(232,200,74,0.07)" : "transparent",
                            boxShadow: isSpeaking ? "inset 0 0 12px rgba(232,200,74,0.08)" : "none",
                            transition: "opacity 0.15s, background 0.12s, border 0.12s",
                            userSelect: "none",
                          }}
                        >
                          <div style={{
                            width: 19, height: 19,
                            border: `1.5px solid ${isChecked ? T.checkColor : T.checkboxBorder}`,
                            borderRadius: 2, flexShrink: 0, marginTop: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: isChecked ? T.checkboxDone : "transparent",
                            transition: "all 0.15s", fontSize: 13, color: T.checkColor,
                          }}>{isChecked ? "✓" : ""}</div>
                          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              fontSize: 16, fontWeight: 500, lineHeight: 1.3,
                              color: isChecked ? (lightMode ? "#9098a8" : "#6a7080") : isEmg ? "#e8b0a0" : T.itemLabel,
                              textDecoration: isChecked ? "line-through" : "none",
                            }}>{item.l}</span>
                            {item.notepad && (
                              <button
                                onClick={toggleNotepad}
                                title={isNotepadOpen ? "Close notepad" : "Open notepad"}
                                style={{
                                  background: isNotepadOpen ? "rgba(61,190,108,0.15)" : "rgba(74,159,232,0.08)",
                                  border: `1px solid ${isNotepadOpen ? "#3dbe6c" : "#2a4050"}`,
                                  borderRadius: 3, width: 20, height: 20,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  cursor: "pointer", flexShrink: 0, padding: 0, transition: "all 0.15s",
                                }}
                              >
                                <span style={{ fontSize: 11, lineHeight: 1, color: isNotepadOpen ? "#3dbe6c" : "#4a9fe8" }}>
                                  {isNotepadOpen ? "▾" : "✏"}
                                </span>
                              </button>
                            )}
                          </div>
                          <span style={{
                            fontFamily: "'Share Tech Mono', monospace", fontSize: 13,
                            color: isChecked ? T.checkColor : isEmg ? accentColor : T.actionColor,
                            textTransform: "uppercase", letterSpacing: 0.5,
                            flexShrink: 0, marginTop: 2, textAlign: "right", maxWidth: 110,
                          }}>{item.a}</span>
                        </div>
                        {item.notepad && isNotepadOpen && (
                          <div style={{ borderBottom: "1px solid rgba(42,48,64,0.45)" }}>
                            {(() => {
                              const sk = "notepad-canvas::" + notepadKey;
                              return (
                                <DrawingNotepad
                                  title={item.notepadLabel || "NOTEPAD"}
                                  footer={item.notepadFooter}
                                  onClose={closeNotepad}
                                  storageKey={sk}
                                  initialImage={notepadImages[sk] || null}
                                  onSave={(dataUrl) => setNotepadImages(prev => {
                                    if (dataUrl === null) {
                                      const next = { ...prev };
                                      delete next[sk];
                                      return next;
                                    }
                                    return { ...prev, [sk]: dataUrl };
                                  })}
                                />
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Rajdhani','Oswald',sans-serif", background: "#0d0f12", color: "#e8e4d8", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Oswald:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#2a3040;border-radius:2px;}
        .check-item:hover{background:rgba(74,159,232,0.07)!important;}
        .tab-btn:hover{background:rgba(255,255,255,0.05)!important;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(3px);}to{opacity:1;transform:translateY(0);}}
      `}</style>

      {/* HEADER */}
      <div style={{ background: T.headerBg, borderBottom: `2px solid ${T.headerBorder}`, flexShrink: 0 }}>

        {/* TOP ROW */}
        <div style={{ padding: "8px 12px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Hangar back button */}
            {onBackToHangar && (
              <button
                onClick={onBackToHangar}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: lightMode ? "rgba(26,58,120,0.08)" : "rgba(232,200,74,0.07)",
                  border: `1px solid ${lightMode ? "#1a3a78" : "#3a3010"}`,
                  borderRadius: 5, padding: "4px 10px", cursor: "pointer",
                  transition: "all 0.15s", flexShrink: 0,
                }}
              >
                <svg viewBox="0 0 16 16" width={12} height={12} fill="none">
                  <path d="M10 3L5 8l5 5" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, letterSpacing: 1.5, color: lightMode ? "#1a3a78" : "#e8c84a", textTransform: "uppercase" }}>HANGAR</span>
              </button>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 4, color: lightMode ? "#0a2858" : "#e8c84a", textTransform: "uppercase", lineHeight: 1 }}>APEX AVIATION</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 2, color: lightMode ? "#607090" : "#7a8090" }}>· {aircraft ? aircraft.tail : "N12345"}</div>
            </div>
          </div>
          {/* LIGHT / DARK TOGGLE */}
          <button
            onClick={() => setLightMode(m => !m)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: lightMode ? "rgba(26,106,176,0.12)" : "rgba(232,200,74,0.08)",
              border: `1px solid ${lightMode ? "#1a6ab0" : "#4a5068"}`,
              borderRadius: 20, padding: "4px 10px 4px 6px",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {/* Track */}
            <div style={{ width: 34, height: 18, borderRadius: 9, background: lightMode ? "#1a6ab0" : "#2a3040", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{
                position: "absolute", top: 2, left: lightMode ? 18 : 2,
                width: 14, height: 14, borderRadius: "50%",
                background: lightMode ? "#fff" : "#e8c84a",
                transition: "left 0.2s, background 0.2s",
                boxShadow: lightMode ? "0 1px 3px rgba(0,0,0,0.3)" : "0 0 6px rgba(232,200,74,0.6)",
              }} />
            </div>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 1.5, color: lightMode ? "#1a6ab0" : "#7a8090", textTransform: "uppercase" }}>
              {lightMode ? "DAY" : "NIGHT"}
            </span>
          </button>
        </div>

        {/* BOTTOM ROW — flight timer | clocks (truly centered) | scratchpad */}
        <div style={{ padding: "5px 12px 7px", display: "flex", alignItems: "center", borderTop: "1px solid rgba(42,48,64,0.6)", position: "relative" }}>

          {/* FLIGHT TIMER — left */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "#7a8090", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>FLIGHT TIMER</div>
              <div style={{
                fontFamily: "'Oswald',sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: 2, lineHeight: 1,
                color: timerRunning ? "#3dbe6c" : timerSeconds > 0 ? "#e8c84a" : "#4a5068",
                textShadow: timerRunning ? "0 0 10px rgba(61,190,108,0.4)" : "none",
                transition: "color 0.2s", minWidth: 86,
              }}>{formatTimer(timerSeconds)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 5, marginTop: 14 }}>
              <button
                onClick={() => setTimerRunning(r => !r)}
                style={{
                  fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  padding: "4px 10px", borderRadius: 3, cursor: "pointer",
                  background: timerRunning ? "rgba(232,90,74,0.2)" : "rgba(61,190,108,0.2)",
                  color: timerRunning ? "#e85a4a" : "#3dbe6c",
                  border: `1px solid ${timerRunning ? "#e85a4a" : "#3dbe6c"}`,
                }}
              >{timerRunning ? "⏸ STOP" : timerSeconds > 0 ? "▶ CONT" : "▶ START"}</button>
              <button
                onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
                style={{
                  fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  padding: "4px 10px", borderRadius: 3, cursor: "pointer",
                  background: "transparent", color: "#7a8090",
                  border: "1px solid #2a3040",
                }}
              >↺ RESET</button>
            </div>
          </div>

          {/* CLOCKS — absolutely centered in the row */}
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: lightMode ? "#3a4a60" : "#7a8090", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>LOCAL</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 18, color: lightMode ? "#0a1428" : "#e8e4d8", letterSpacing: 1, lineHeight: 1 }}>{localTime}</div>
            </div>
            <div style={{ width: 1, height: 28, background: "#2a3040" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: lightMode ? "#3a4a60" : "#7a8090", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>ZULU</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 18, color: lightMode ? "#1a3a80" : "#4a9fe8", letterSpacing: 1, lineHeight: 1 }}>{zuluTime}</div>
            </div>
          </div>

          {/* SCRATCHPAD BUTTON — right */}
          <button
            onClick={() => setScratchpadOpen(true)}
            style={{
              marginLeft: "auto",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
              background: lightMode ? "rgba(26,58,120,0.1)" : "rgba(232,200,74,0.07)",
              border: `1px solid ${lightMode ? "#1a3a78" : "#3a3010"}`,
              borderRadius: 5, padding: "6px 12px", cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1.4" fill={lightMode ? "rgba(26,58,120,0.08)" : "rgba(232,200,74,0.08)"}/>
              <line x1="6" y1="8" x2="18" y2="8" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
              <line x1="6" y1="12" x2="18" y2="12" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
              <line x1="6" y1="16" x2="13" y2="16" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
              <circle cx="19" cy="17" r="3" fill={lightMode ? "#d8dce8" : "#141820"} stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1"/>
              <path d="M18 17.5l.8.8 1.5-1.5" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: lightMode ? "#1a3a78" : "#e8c84a", letterSpacing: 1, textTransform: "uppercase" }}>SCRATCHPAD</span>
          </button>

        </div>
      </div>

      {/* 3-COLUMN MAIN */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", background: T.appBg }}>

        {/* LEFT SIDEBAR */}
        <div style={{ width: 106, background: T.leftSideBg, borderRight: `1px solid ${T.leftSideBorder}`, display: "flex", flexDirection: "column", alignItems: "stretch", overflowY: "auto", flexShrink: 0 }}>
          {PAGES.map(p => {
            const c = countPage(p.id);
            const isActive = currentPage === p.id;
            const isDone = c.total > 0 && c.done === c.total;
            return (
              <button key={p.id} onClick={() => setCurrentPage(p.id)} className="tab-btn" style={{
                width: "100%", minHeight: 84, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer",
                border: "none", borderLeft: isActive ? `3px solid ${T.leftTabText}` : "3px solid transparent",
                background: isActive ? T.leftTabActive : "transparent",
                color: isActive ? T.leftTabText : isDone ? "#3dbe6c" : T.leftTabDim,
                padding: "5px 4px", transition: "all 0.12s",
              }}>
                <span style={{ fontSize: 26, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {typeof p.icon === "string" ? p.icon : p.icon}
                </span>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.1, maxWidth: 96 }}>{p.label}</span>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: isDone ? "#3dbe6c" : isActive ? (lightMode ? "#607090" : "#888") : T.leftTabCount }}>{c.done}/{c.total}</span>
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setMoreOpen(true)}
            className="tab-btn"
            style={{
              width: "100%", minHeight: 84, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer",
              border: "none", borderLeft: moreOpen ? "3px solid #c87ae8" : "3px solid transparent",
              background: moreOpen ? "rgba(200,122,232,0.07)" : "transparent",
              color: moreOpen ? "#c87ae8" : lightMode ? "#708090" : "#5a4a6a",
              padding: "5px 4px", transition: "all 0.12s",
              borderTop: `1px solid ${T.leftSideBorder}`, flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" width={28} height={28} fill="none">
              <rect x="3" y="4" width="18" height="3" rx="1.5" fill="currentColor" opacity="0.9"/>
              <rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="currentColor" opacity="0.9"/>
              <rect x="3" y="17" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.9"/>
              <circle cx="20.5" cy="18.5" r="3.5" fill="currentColor" opacity="0.85"/>
              <line x1="20.5" y1="17.2" x2="20.5" y2="19.8" stroke={lightMode ? "#e8eaf0" : "#0d0f12"} strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="19.2" y1="18.5" x2="21.8" y2="18.5" stroke={lightMode ? "#e8eaf0" : "#0d0f12"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>MORE</span>
          </button>
        </div>

        {/* CENTER */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 95 + (vspeedOpen ? 310 : 0) + (perfOpen ? 300 : 0) + (climbOpen ? 280 : 0) + (cruisePanelOpen ? 280 : 0), background: T.centerBg }}>
          {renderChecklist(activePg)}
        </div>

        {/* RIGHT SIDEBAR — Emergency */}
        <div style={{ width: 106, background: lightMode ? "#d8dce8" : "#141018", borderLeft: `1px solid ${lightMode ? "#a0a8c0" : "#2a1a2a"}`, display: "flex", flexDirection: "column", alignItems: "stretch", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, letterSpacing: 2, color: lightMode ? "#607090" : "#a06080", textTransform: "uppercase", textAlign: "center", padding: "7px 2px 5px", borderBottom: `1px solid ${lightMode ? "#a0a8c0" : "#2a1a2a"}`, background: lightMode ? "#c8ccd8" : "#1a0f18" }}>
            EMG
          </div>
          {EMG_PAGES.map(p => {
            const c = countPage(p.id);
            const isActive = currentPage === p.id;
            const isDone = c.total > 0 && c.done === c.total;
            return (
              <button key={p.id} onClick={() => setCurrentPage(p.id)} className="tab-btn" style={{
                width: "100%", minHeight: 90, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer",
                border: "none", borderRight: isActive ? `3px solid ${p.color}` : "3px solid transparent",
                background: isActive ? (lightMode ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)") : "transparent",
                padding: "5px 4px", transition: "all 0.12s",
              }}>
                <span style={{
                  filter: isActive
                    ? `drop-shadow(0 0 6px ${p.color}) drop-shadow(0 0 12px ${p.color}80)`
                    : `drop-shadow(0 0 3px ${p.color}60)`,
                  transition: "filter 0.2s", opacity: 1,
                }}>{p.icon(30)}</span>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.1, maxWidth: 96, color: isActive ? p.color : (lightMode ? p.color : p.color + "99") }}>{p.label}</span>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: isDone ? "#1a7040" : isActive ? (lightMode ? "#20304a" : "#aaa") : (lightMode ? "#304060" : "#6a5060") }}>{c.done}/{c.total}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PANEL DOCK — V-Speeds top, T/O, Climb, Cruise bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 106, right: 106, zIndex: 50,
        display: "flex", flexDirection: "column",
        pointerEvents: "none",
      }}>

        {/* 1. V-SPEEDS — top of stack, most important */}
        <div style={{ pointerEvents: "all" }}>
          <div onClick={() => { setVspeedOpen(o => !o); if (vspeedOpen) setVspeedEditing(false); }} style={{ background: lightMode ? "linear-gradient(90deg,#c8d4e8,#d0daf0)" : "linear-gradient(90deg,#1a1f2a,#0f1520)", border: "1px solid #4a9fe8", borderBottom: "none", borderRadius: "5px 5px 0 0", padding: "7px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", boxShadow: lightMode ? "0 -3px 12px rgba(74,159,232,0.35)" : "none" }}>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 13, letterSpacing: 2.5, color: lightMode ? "#0a3070" : "#4a9fe8" }}>▲ V-SPEEDS · C172S</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {vspeedOpen && (<button onClick={e => { e.stopPropagation(); setVspeedEditing(o => !o); }} style={{ background: vspeedEditing ? "rgba(232,200,74,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${vspeedEditing ? "#e8c84a" : "rgba(255,255,255,0.15)"}`, borderRadius: 3, padding: "2px 8px", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: vspeedEditing ? "#e8c84a" : "#7a8090", display: "flex", alignItems: "center", gap: 3 }}><span>{vspeedEditing ? "✕" : "✎"}</span>{vspeedEditing ? "DONE" : "EDIT"}</button>)}
              <span style={{ fontSize: 13, color: "#4a9fe8", transition: "transform 0.32s", transform: vspeedOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▲</span>
            </div>
          </div>
          <div style={{ overflow: "hidden", maxHeight: vspeedOpen ? 310 : 0, transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ background: lightMode ? "#dde4f0" : "#1a1f2a", border: "1px solid #4a9fe8", borderTop: "none", borderBottom: "none", padding: "8px 12px", maxHeight: 310, overflowY: "auto" }}>
              {vspeedEditing && (<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, padding: "4px 2px" }}><span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#e8c84a", letterSpacing: 1.5 }}>✎ TAP ANY VALUE TO EDIT · ENTER TO CONFIRM</span><button onClick={resetVspeeds} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#6a3030", background: "transparent", border: "1px solid #3a2020", borderRadius: 3, padding: "2px 8px", cursor: "pointer", letterSpacing: 1 }}>↺ RESET</button></div>)}
              {vspeeds.map((group, gi) => (
                <div key={gi}>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 1.5, color: lightMode ? "#204880" : "#7a8090", textTransform: "uppercase", margin: "5px 0 4px", paddingBottom: 3, borderBottom: `1px solid ${lightMode ? "#a0b8d8" : "#2a3040"}` }}>{group.group}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 }}>
                    {group.items.map((vs, ii) => (
                      <div key={ii} style={{ background: lightMode ? "#f0f4fc" : "#141820", border: `1px solid ${lightMode ? "#a0b8d8" : (vspeedEditing ? "#2a3a50" : "#2a3040")}`, borderRadius: 4, padding: "7px 8px", textAlign: "center" }}>
                        {vspeedEditing ? (<><input value={vs.code} onChange={e => updateVspeed(gi, ii, "code", e.target.value)} style={{ width: "100%", background: "#0d1018", border: "1px solid #4a9fe8", borderRadius: 2, color: "#4a9fe8", textAlign: "center", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, fontWeight: 700, padding: "2px 3px", marginBottom: 3, outline: "none", letterSpacing: 1 }} /><input value={vs.value} onChange={e => updateVspeed(gi, ii, "value", e.target.value)} style={{ width: "100%", background: "#0d1018", border: "1px solid #e8c84a", borderRadius: 2, color: "#e8c84a", textAlign: "center", fontFamily: "'Oswald',sans-serif", fontSize: 16, fontWeight: 600, padding: "2px 3px", marginBottom: 3, outline: "none" }} /><input value={vs.unit} onChange={e => updateVspeed(gi, ii, "unit", e.target.value)} style={{ width: "100%", background: "#0d1018", border: "1px solid #2a3040", borderRadius: 2, color: "#7a8090", textAlign: "center", fontFamily: "'Share Tech Mono',monospace", fontSize: 9, padding: "2px 3px", marginBottom: 3, outline: "none" }} /><input value={vs.desc} onChange={e => updateVspeed(gi, ii, "desc", e.target.value)} style={{ width: "100%", background: "#0d1018", border: "1px solid #2a3040", borderRadius: 2, color: "#7a8090", textAlign: "center", fontFamily: "'Rajdhani',sans-serif", fontSize: 9, padding: "2px 3px", outline: "none" }} /></>) : (<><span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 13, fontWeight: 700, color: lightMode ? "#0a3070" : "#4a9fe8", display: "block", letterSpacing: 1 }}>{vs.code}</span><span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 22, fontWeight: 600, color: lightMode ? "#6a3800" : "#e8c84a", display: "block", lineHeight: 1.1, marginTop: 2 }}>{vs.value}<span style={{ fontSize: 10, color: lightMode ? "#405070" : "#7a8090", fontWeight: 400 }}> {vs.unit}</span></span><span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 500, color: lightMode ? "#304060" : "#7a8090", display: "block", marginTop: 3, letterSpacing: 0.3 }}>{vs.desc}</span></>)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. T/O & LANDING */}
        <div style={{ pointerEvents: "all" }}>
          <div onClick={() => { setPerfOpen(o => !o); if (perfOpen) setPerfEditing(false); }} style={{ background: lightMode ? "linear-gradient(90deg,#e8d8b0,#f0dfc0)" : "linear-gradient(90deg,#1f1508,#150e02)", border: "1px solid #e8a030", borderBottom: "none", borderRadius: "5px 5px 0 0", padding: "7px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", boxShadow: lightMode ? "0 -3px 12px rgba(232,160,48,0.4)" : "none" }}>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 13, letterSpacing: 2.5, color: lightMode ? "#6a3000" : "#e8a030" }}>▲ T/O & LANDING · C172S</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {perfOpen && (<button onClick={e => { e.stopPropagation(); setPerfEditing(o => !o); }} style={{ background: perfEditing ? "rgba(232,200,74,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${perfEditing ? "#e8c84a" : "rgba(255,255,255,0.15)"}`, borderRadius: 3, padding: "2px 8px", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: perfEditing ? "#e8c84a" : "#7a8090", display: "flex", alignItems: "center", gap: 3 }}><span>{perfEditing ? "✕" : "✎"}</span>{perfEditing ? "DONE" : "EDIT"}</button>)}
              <span style={{ fontSize: 13, color: "#e8a030", transition: "transform 0.32s", transform: perfOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▲</span>
            </div>
          </div>
          <div style={{ overflow: "hidden", maxHeight: perfOpen ? 300 : 0, transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ background: lightMode ? "#f5ece0" : "#181008", border: "1px solid #e8a030", borderTop: "none", borderBottom: "none", padding: "6px 8px", maxHeight: 300, overflowY: "auto" }}>
              {perfEditing && (<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5, padding: "3px 2px" }}><span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#e8c84a", letterSpacing: 1.5 }}>✎ TAP ANY CELL TO EDIT</span><button onClick={resetPerfData} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#6a3030", background: "transparent", border: "1px solid #3a2020", borderRadius: 3, padding: "2px 8px", cursor: "pointer", letterSpacing: 1 }}>↺ RESET</button></div>)}
              {perfData.map((section, si) => (
                <div key={si} style={{ marginBottom: si < perfData.length - 1 ? 6 : 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid #3a2808", paddingBottom: 2, marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#e8a030", textTransform: "uppercase" }}>{section.group}</span>
                    <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: lightMode ? "#6a3800" : "#7a5030", letterSpacing: 0.5 }}>{section.note}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: section.cols.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr", gap: "1px 2px" }}>
                    {section.cols.map((col, ci) => (<div key={ci} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7.5, color: lightMode ? "#6a3800" : "#7a5030", letterSpacing: 1, textTransform: "uppercase", padding: "1px 4px", background: lightMode ? "#e8c890" : "#100a04", textAlign: ci === 0 ? "left" : "center" }}>{col}</div>))}
                    {section.rows.map((row, ri) => row.map((cell, ci) => (
                      perfEditing
                        ? <input key={`${ri}-${ci}`} value={cell} onChange={e => updatePerfCell(si, ri, ci, e.target.value)} style={{ width: "100%", boxSizing: "border-box", background: ri % 2 === 0 ? "rgba(232,160,48,0.08)" : "#0e0904", border: "1px solid #3a2808", borderRadius: 2, color: ci === 0 ? "#c89060" : "#e8c84a", fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Oswald',sans-serif", fontSize: ci === 0 ? 11 : 12, fontWeight: ci === 0 ? 500 : 600, padding: "3px 4px", textAlign: ci === 0 ? "left" : "center", outline: "none", letterSpacing: ci === 0 ? 0 : 0.5 }} />
                        : <div key={`${ri}-${ci}`} style={{ fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Oswald',sans-serif", fontSize: ci === 0 ? 11 : 13, fontWeight: ci === 0 ? 500 : 600, color: ci === 0 ? (lightMode ? "#3a1800" : "#c89060") : (lightMode ? "#6a3000" : "#e8c84a"), background: ri % 2 === 0 ? (lightMode ? "rgba(232,160,48,0.12)" : "rgba(232,160,48,0.05)") : "transparent", padding: "2px 4px", textAlign: ci === 0 ? "left" : "center", letterSpacing: ci === 0 ? 0 : 0.5 }}>{cell}</div>
                    )))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. CLIMB PERFORMANCE */}
        <div style={{ pointerEvents: "all" }}>
          <div onClick={() => { setClimbOpen(o => !o); if (climbOpen) setClimbEditing(false); }} style={{ background: lightMode ? "linear-gradient(90deg,#c0e0c8,#d0eed8)" : "linear-gradient(90deg,#0a1a10,#061008)", border: "1px solid #3dbe6c", borderBottom: "none", borderRadius: "5px 5px 0 0", padding: "7px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", boxShadow: lightMode ? "0 -3px 12px rgba(61,190,108,0.4)" : "none" }}>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 13, letterSpacing: 2.5, color: lightMode ? "#0a4820" : "#3dbe6c" }}>▲ CLIMB PERFORMANCE · C172S</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {climbOpen && (<button onClick={e => { e.stopPropagation(); setClimbEditing(o => !o); }} style={{ background: climbEditing ? "rgba(232,200,74,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${climbEditing ? "#e8c84a" : "rgba(255,255,255,0.15)"}`, borderRadius: 3, padding: "2px 8px", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: climbEditing ? "#e8c84a" : "#7a8090", display: "flex", alignItems: "center", gap: 3 }}><span>{climbEditing ? "✕" : "✎"}</span>{climbEditing ? "DONE" : "EDIT"}</button>)}
              <span style={{ fontSize: 13, color: "#3dbe6c", transition: "transform 0.32s", transform: climbOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▲</span>
            </div>
          </div>
          <div style={{ overflow: "hidden", maxHeight: climbOpen ? 280 : 0, transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ background: lightMode ? "#e8f5ec" : "#081008", border: "1px solid #3dbe6c", borderTop: "none", borderBottom: "none", padding: "6px 10px", maxHeight: 280, overflowY: "auto" }}>
              {climbEditing && (<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5, padding: "3px 2px" }}><span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#e8c84a", letterSpacing: 1.5 }}>✎ TAP ANY CELL TO EDIT</span><button onClick={resetClimbData} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#6a3030", background: "transparent", border: "1px solid #3a2020", borderRadius: 3, padding: "2px 8px", cursor: "pointer", letterSpacing: 1 }}>↺ RESET</button></div>)}
              {climbData.map((section, si) => (
                <div key={si} style={{ marginBottom: si < climbData.length - 1 ? 6 : 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid #1a3020", paddingBottom: 2, marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#3dbe6c", textTransform: "uppercase" }}>{section.group}</span>
                    {section.note && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "#2a5030", letterSpacing: 0.5 }}>{section.note}</span>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${section.cols.length}, 1fr)`, gap: "1px 2px" }}>
                    {section.cols.map((col, ci) => (<div key={ci} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7.5, color: "#2a6035", letterSpacing: 1, textTransform: "uppercase", padding: "1px 4px", background: "#050e05", textAlign: ci === 0 ? "left" : "center" }}>{col}</div>))}
                    {section.rows.map((row, ri) => row.map((cell, ci) => (
                      climbEditing
                        ? <input key={`${ri}-${ci}`} value={cell} onChange={e => updateClimbCell(si, ri, ci, e.target.value)} style={{ width: "100%", boxSizing: "border-box", background: ri % 2 === 0 ? "rgba(61,190,108,0.08)" : "#060c06", border: "1px solid #1a3020", borderRadius: 2, color: ci === 0 ? "#70c890" : "#3dbe6c", fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Oswald',sans-serif", fontSize: ci === 0 ? 11 : 12, fontWeight: ci === 0 ? 500 : 600, padding: "3px 4px", textAlign: ci === 0 ? "left" : "center", outline: "none", letterSpacing: ci === 0 ? 0 : 0.5 }} />
                        : <div key={`${ri}-${ci}`} style={{ fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Oswald',sans-serif", fontSize: ci === 0 ? 11 : 13, fontWeight: ci === 0 ? 500 : 600, color: ci === 0 ? (lightMode ? "#083820" : "#70c890") : (lightMode ? "#0a5828" : "#3dbe6c"), background: ri % 2 === 0 ? (lightMode ? "rgba(61,190,108,0.12)" : "rgba(61,190,108,0.05)") : "transparent", padding: "2px 4px", textAlign: ci === 0 ? "left" : "center", letterSpacing: ci === 0 ? 0 : 0.5 }}>{cell}</div>
                    )))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. CRUISE PERFORMANCE — bottom of stack, least urgent */}
        <div style={{ pointerEvents: "all" }}>
          <div onClick={() => { setCruisePanelOpen(o => !o); if (cruisePanelOpen) setCruiseEditing(false); }} style={{ background: lightMode ? "linear-gradient(90deg,#c0d4e8,#d0e2f0)" : "linear-gradient(90deg,#0a1520,#060e18)", border: "1px solid #7ab8e8", borderBottom: "none", borderRadius: "5px 5px 0 0", padding: "7px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", boxShadow: lightMode ? "0 -3px 12px rgba(122,184,232,0.4)" : "none" }}>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 13, letterSpacing: 2.5, color: lightMode ? "#082858" : "#7ab8e8" }}>▲ CRUISE PERFORMANCE · C172S</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {cruisePanelOpen && (<button onClick={e => { e.stopPropagation(); setCruiseEditing(o => !o); }} style={{ background: cruiseEditing ? "rgba(232,200,74,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${cruiseEditing ? "#e8c84a" : "rgba(255,255,255,0.15)"}`, borderRadius: 3, padding: "2px 8px", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: cruiseEditing ? "#e8c84a" : "#7a8090", display: "flex", alignItems: "center", gap: 3 }}><span>{cruiseEditing ? "✕" : "✎"}</span>{cruiseEditing ? "DONE" : "EDIT"}</button>)}
              <span style={{ fontSize: 13, color: "#7ab8e8", transition: "transform 0.32s", transform: cruisePanelOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▲</span>
            </div>
          </div>
          <div style={{ overflow: "hidden", maxHeight: cruisePanelOpen ? 280 : 0, transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ background: lightMode ? "#e8f0f8" : "#060c14", border: "1px solid #7ab8e8", borderTop: "none", borderBottom: "none", padding: "6px 10px", maxHeight: 280, overflowY: "auto" }}>
              {cruiseEditing && (<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5, padding: "3px 2px" }}><span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#e8c84a", letterSpacing: 1.5 }}>✎ TAP ANY CELL TO EDIT</span><button onClick={resetCruiseData} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#6a3030", background: "transparent", border: "1px solid #3a2020", borderRadius: 3, padding: "2px 8px", cursor: "pointer", letterSpacing: 1 }}>↺ RESET</button></div>)}
              {cruiseData.map((section, si) => (
                <div key={si} style={{ marginBottom: si < cruiseData.length - 1 ? 6 : 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid #1a2838", paddingBottom: 2, marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#7ab8e8", textTransform: "uppercase" }}>{section.group}</span>
                    {section.note && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "#2a4060", letterSpacing: 0.5 }}>{section.note}</span>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${section.cols.length}, 1fr)`, gap: "1px 2px" }}>
                    {section.cols.map((col, ci) => (<div key={ci} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7.5, color: "#2a4860", letterSpacing: 1, textTransform: "uppercase", padding: "1px 4px", background: "#040a10", textAlign: ci === 0 ? "left" : "center" }}>{col}</div>))}
                    {section.rows.map((row, ri) => row.map((cell, ci) => (
                      cruiseEditing
                        ? <input key={`${ri}-${ci}`} value={cell} onChange={e => updateCruiseCell(si, ri, ci, e.target.value)} style={{ width: "100%", boxSizing: "border-box", background: ri % 2 === 0 ? "rgba(122,184,232,0.08)" : "#050810", border: "1px solid #1a2838", borderRadius: 2, color: ci === 0 ? "#90b8d8" : "#7ab8e8", fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Oswald',sans-serif", fontSize: ci === 0 ? 11 : 12, fontWeight: ci === 0 ? 500 : 600, padding: "3px 4px", textAlign: ci === 0 ? "left" : "center", outline: "none", letterSpacing: ci === 0 ? 0 : 0.5 }} />
                        : <div key={`${ri}-${ci}`} style={{ fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Oswald',sans-serif", fontSize: ci === 0 ? 11 : 13, fontWeight: ci === 0 ? 500 : 600, color: ci === 0 ? (lightMode ? "#082048" : "#90b8d8") : (lightMode ? "#0a3878" : "#7ab8e8"), background: ri % 2 === 0 ? (lightMode ? "rgba(122,184,232,0.15)" : "rgba(122,184,232,0.05)") : "transparent", padding: "2px 4px", textAlign: ci === 0 ? "left" : "center", letterSpacing: ci === 0 ? 0 : 0.5 }}>{cell}</div>
                    )))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>


      {/* MORE REFERENCE OVERLAY */}
      {moreOpen && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 200,
          background: lightMode ? "rgba(220,224,236,0.98)" : "rgba(8,10,14,0.97)",
          display: "flex", flexDirection: "column",
          animation: "fadeIn 0.15s ease",
        }}>
          <div style={{
            background: lightMode ? "linear-gradient(135deg,#c8ccd8,#d4d8e8)" : "linear-gradient(135deg,#0a0c10,#141820)",
            borderBottom: "2px solid #c87ae8",
            padding: "10px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
                <rect x="3" y="4" width="18" height="3" rx="1.5" fill="#c87ae8" opacity="0.9"/>
                <rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="#c87ae8" opacity="0.9"/>
                <rect x="3" y="17" width="11" height="3" rx="1.5" fill="#c87ae8" opacity="0.9"/>
              </svg>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 3, color: "#c87ae8", textTransform: "uppercase" }}>QUICK REFERENCE</span>
            </div>
            <button onClick={() => setMoreOpen(false)} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: "5px 14px", borderRadius: 4, cursor: "pointer", background: "rgba(200,122,232,0.1)", color: "#c87ae8", border: "1px solid #c87ae8" }}>✕ CLOSE</button>
          </div>
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Left nav */}
            <div style={{ width: 160, background: lightMode ? "#c8ccd8" : "#0d0f14", borderRight: `1px solid ${lightMode ? "#a0a8c0" : "#1e2030"}`, display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
              {MORE_REFS.map(ref => (
                <button key={ref.id} onClick={() => setActiveMoreRef(ref.id)} style={{
                  width: "100%", padding: "10px 12px", textAlign: "left", cursor: "pointer",
                  background: activeMoreRef === ref.id ? (lightMode ? "rgba(200,122,232,0.12)" : "rgba(200,122,232,0.08)") : "transparent",
                  border: "none", borderLeft: `3px solid ${activeMoreRef === ref.id ? ref.color : "transparent"}`,
                  borderBottom: `1px solid ${lightMode ? "rgba(100,110,160,0.3)" : "rgba(30,32,48,0.8)"}`, transition: "all 0.12s",
                }}>
                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: activeMoreRef === ref.id ? ref.color : (lightMode ? "#404878" : "#5a6070"), textTransform: "uppercase", lineHeight: 1.2 }}>{ref.title}</div>
                </button>
              ))}
            </div>
            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", background: lightMode ? "#d8dce8" : "transparent" }}>
              {(() => {
                const ref = MORE_REFS.find(r => r.id === activeMoreRef);
                if (!ref) return null;
                return (
                  <div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2, color: ref.color, textTransform: "uppercase" }}>{ref.title}</div>
                      {ref.note && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: lightMode ? "#506080" : "#5a6070", letterSpacing: 1, marginTop: 4 }}>{ref.note}</div>}
                    </div>
                    <div style={{ border: `1px solid ${ref.color}30`, borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${ref.cols.length}, 1fr)`, background: lightMode ? `${ref.color}22` : `${ref.color}18` }}>
                        {ref.cols.map((col, ci) => (
                          <div key={ci} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, color: ref.color, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 12px", borderRight: ci < ref.cols.length - 1 ? `1px solid ${ref.color}20` : "none" }}>{col}</div>
                        ))}
                      </div>
                      {ref.rows.map((row, ri) => (
                        <div key={ri} style={{ display: "grid", gridTemplateColumns: `repeat(${ref.cols.length}, 1fr)`, background: ri % 2 === 0 ? (lightMode ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.02)") : "transparent", borderTop: `1px solid ${lightMode ? "rgba(100,110,160,0.15)" : "rgba(255,255,255,0.04)"}` }}>
                          {row.map((cell, ci) => (
                            <div key={ci} style={{
                              fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Share Tech Mono',monospace",
                              fontSize: ci === 0 ? 14 : 12, fontWeight: ci === 0 ? 600 : 400,
                              color: ci === 0 ? (lightMode ? "#1a2840" : "#e8e4d8") : ref.color,
                              padding: "9px 12px", lineHeight: 1.3,
                              borderRight: ci < ref.cols.length - 1 ? `1px solid ${lightMode ? "rgba(100,110,160,0.15)" : "rgba(255,255,255,0.04)"}` : "none",
                            }}>{cell}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {scratchpadOpen && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 200,
          background: "rgba(8,10,14,0.96)",
          display: "flex", flexDirection: "column",
          animation: "fadeIn 0.15s ease",
        }}>
          {/* Scratchpad header */}
          <div style={{
            background: "linear-gradient(135deg,#0a0c10,#141820)",
            borderBottom: "2px solid #e8c84a",
            padding: "10px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#e8c84a" strokeWidth="1.4" fill="rgba(232,200,74,0.08)"/>
                <line x1="6" y1="8" x2="18" y2="8" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
                <line x1="6" y1="12" x2="18" y2="12" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
                <line x1="6" y1="16" x2="13" y2="16" stroke="#e8c84a" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
              </svg>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 3, color: "#e8c84a", textTransform: "uppercase" }}>PILOT SCRATCHPAD</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Mode toggle */}
              <div style={{ display: "flex", background: "#0d0f12", border: "1px solid #2a3040", borderRadius: 4, overflow: "hidden" }}>
                {["draw", "type"].map(mode => (
                  <button key={mode} onClick={() => setScratchpadMode(mode)} style={{
                    fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                    padding: "5px 14px", cursor: "pointer", border: "none",
                    background: scratchpadMode === mode ? "rgba(232,200,74,0.15)" : "transparent",
                    color: scratchpadMode === mode ? "#e8c84a" : "#4a5068",
                    borderRight: mode === "draw" ? "1px solid #2a3040" : "none",
                    textTransform: "uppercase",
                    transition: "all 0.15s",
                  }}>
                    {mode === "draw" ? "✏ DRAW" : "⌨ TYPE"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setScratchpadOpen(false)}
                style={{
                  fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1,
                  padding: "5px 14px", borderRadius: 4, cursor: "pointer",
                  background: "rgba(232,90,74,0.1)", color: "#e85a4a",
                  border: "1px solid #e85a4a",
                }}
              >✕ CLOSE</button>
            </div>
          </div>

          {/* Scratchpad content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "10px 14px 14px" }}>
            {scratchpadMode === "draw" ? (
              /* DRAW MODE — full-size DrawingNotepad */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#050e09", border: "1px solid #1e3528", borderRadius: 6, overflow: "hidden" }}>
                {/* Mini toolbar row above canvas */}
                <ScratchpadCanvas storageKey="scratchpad-main-canvas" />
              </div>
            ) : (
              /* TYPE MODE — large textarea */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 1.5 }}>
                  ✎ FREE TEXT · AUTO-SAVED · {scratchpadText.length} CHARS
                </div>
                <textarea
                  value={scratchpadText}
                  onChange={e => {
                    setScratchpadText(e.target.value);
                    try { window.storage.set("scratchpad-text", e.target.value); } catch {}
                  }}
                  placeholder="ATIS · CLEARANCES · FREQUENCIES · WEATHER · NOTAMS · PIREPS..."
                  style={{
                    flex: 1, resize: "none", outline: "none",
                    background: "#0a0e0a",
                    border: "1px solid #1e3528",
                    borderRadius: 6,
                    color: "#e8e4d8",
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: 14, lineHeight: 1.7,
                    padding: "14px 16px",
                    caretColor: "#e8c84a",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => { setScratchpadText(""); try { window.storage.delete("scratchpad-text"); } catch {} }}
                    style={{
                      fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                      padding: "4px 12px", borderRadius: 3, cursor: "pointer",
                      background: "transparent", color: "#6a3030",
                      border: "1px solid #3a2020",
                    }}
                  >↺ CLEAR TEXT</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
(function() {
  const mountApp = () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(React.createElement(App));
    }
  };
  mountApp();
})();
