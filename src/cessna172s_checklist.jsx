// ─────────────────────────────────────────────────────────────────────────────
// CESSNA 172S SKYHAWK — Checklist Data & Component
// All PAGES, EMG_PAGES, reference data, helper components, and ChecklistApp
// live here. Import { ChecklistApp } into apex_kneeboard.jsx to use.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import { CommPage } from "./comm_page.jsx";

export const PAGES = [
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

export const EMG_PAGES = [
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
      { title: "Engine Fire — In Flight", items: [
        { l: "Mixture", a: "IDLE CUT-OFF" },
        { l: "Fuel Selector", a: "OFF" },
        { l: "Master Switch", a: "OFF" },
        { l: "Cabin Heat & Air", a: "OFF (ALL)" },
        { l: "Airspeed", a: "100 KIAS (SMOTHER)" },
        { type: "caution", l: "DO NOT attempt restart after confirmed engine fire" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
      ]},
      { title: "Cabin Fire", items: [
        { l: "Master Switch", a: "OFF" },
        { l: "Avionics Master", a: "OFF" },
        { l: "All Vents / Cabin Air / Heat", a: "CLOSED" },
        { l: "Fire Extinguisher", a: "DISCHARGE AT FIRE" },
        { l: "Vents", a: "OPEN WHEN FIRE OUT" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
        { type: "caution", l: "After any fire — land immediately regardless of conditions" },
      ]},
      { title: "Engine Fire During Start — Ground", items: [
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
      { title: "Electrical Fire — In Flight", items: [
        { l: "Master Switch", a: "OFF" },
        { l: "All Avionics", a: "OFF" },
        { l: "All Electrical Equipment", a: "OFF" },
        { l: "Vents / Cabin Air", a: "OPEN (VENTILATE)" },
        { l: "Fire Extinguisher", a: "USE IF REQD" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
        { type: "note", l: "Restore electrical one item at a time only if needed for nav" },
      ]},
      { title: "Wing Fire", items: [
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
      { title: "Engine Failure After Takeoff", items: [
        { l: "Airspeed", a: "68 KIAS (GLIDE)" },
        { type: "caution", l: "CRITICAL: NO 180-deg turn back if below 1000 AGL" },
        { l: "Throttle", a: "IDLE" },
        { l: "Fuel Selector", a: "OFF" },
        { l: "Mixture", a: "IDLE CUT-OFF" },
        { l: "Ignition", a: "OFF" },
        { l: "Master Switch", a: "OFF (BEFORE TOUCH)" },
        { l: "Land Straight Ahead", a: "EXECUTE" },
      ]},
      { title: "Engine Failure on Takeoff Roll", items: [
        { l: "Throttle", a: "IDLE" },
        { l: "Brakes", a: "APPLY FIRMLY" },
        { l: "Mixture", a: "IDLE CUT-OFF" },
        { l: "Ignition Switch", a: "OFF" },
        { l: "Master Switch", a: "OFF" },
      ]},
      { title: "Forced Landing Without Power", items: [
        { l: "Airspeed", a: "68 KIAS (GLIDE)" },
        { l: "Field Selection", a: "INTO WIND, FIRM" },
        { l: "Fuel Selector", a: "BOTH → OFF ON FINAL" },
        { l: "Squawk", a: "7700" },
        { l: "Mayday", a: "121.5 / ATC FREQ" },
        { l: "Mixture", a: "IDLE CUT-OFF" },
        { l: "Ignition", a: "OFF" },
        { l: "Flaps", a: "AS REQUIRED" },
        { l: "Master Switch", a: "OFF BEFORE TOUCH" },
        { l: "Doors", a: "UNLATCH BEFORE TOUCH" },
      ]},
      { title: "Engine Roughness / Loss of Power", items: [
        { l: "Carb Heat", a: "ON — CHECK RPM RISE" },
        { l: "Mixture", a: "ENRICH" },
        { l: "Fuel Selector", a: "BOTH" },
        { l: "Primer", a: "IN & LOCKED" },
        { l: "Magnetos", a: "CHECK BOTH / L / R" },
        { l: "Engine Gauges", a: "SCAN ALL" },
        { type: "note", l: "RPM drop then rise on carb heat = ice present. Allow time to clear." },
      ]},
    ]
  },
  {
    id: "spin", label: "SPIN\nRECOV", color: "#4ae8c8", dimColor: "#207a68",
    icon: (size) => (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <path d="M12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21" stroke="#4ae8c8" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3" stroke="#4ae8c8" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 2"/>
        <path d="M8 17l4 4 4-4" stroke="#4ae8c8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="2" fill="#4ae8c8" opacity="0.6"/>
      </svg>
    ),
    sections: [
      { title: "Spin Recovery — PARE Method", items: [
        { l: "P — Power", a: "IDLE" },
        { l: "A — Ailerons", a: "NEUTRAL" },
        { l: "R — Rudder", a: "FULL OPPOSITE SPIN" },
        { l: "E — Elevator", a: "BRISK FORWARD" },
        { type: "caution", l: "Hold inputs until rotation stops — do not rush pull-out" },
        { l: "Rudder", a: "NEUTRALIZE" },
        { l: "Pull Out of Dive", a: "SMOOTH — AVOID SECONDARY" },
        { l: "Power", a: "AS REQUIRED" },
      ]},
      { title: "Incipient Spin / Stall Recovery", items: [
        { l: "Power", a: "IDLE" },
        { l: "Back Pressure", a: "RELEASE" },
        { l: "Rudder", a: "OPPOSITE YAW" },
        { l: "Wings Level", a: "COORDINATED CONTROL" },
        { l: "Airspeed", a: "RECOVER > VS" },
        { type: "note", l: "C172S spin approved only in Utility Category (< 1950 lbs, fwd CG)" },
      ]},
    ]
  },
  {
    id: "icing", label: "ICING", color: "#88d4f0", dimColor: "#2a5a70",
    icon: (size) => (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <line x1="12" y1="2" x2="12" y2="22" stroke="#88d4f0" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="12" y1="7" x2="8" y2="11" stroke="#88d4f0" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="12" y1="7" x2="16" y2="11" stroke="#88d4f0" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="8" y2="13" stroke="#88d4f0" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="16" y2="13" stroke="#88d4f0" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke="#88d4f0" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="5" y1="12" x2="7" y2="9" stroke="#88d4f0" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="5" y1="12" x2="7" y2="15" stroke="#88d4f0" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="19" y1="12" x2="17" y2="9" stroke="#88d4f0" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="19" y1="12" x2="17" y2="15" stroke="#88d4f0" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="2" fill="#88d4f0" opacity="0.5"/>
      </svg>
    ),
    sections: [
      { title: "Inadvertent IMC / Icing Encounter", items: [
        { l: "Pitot Heat", a: "ON" },
        { l: "Cabin Heat", a: "ON (PREVENT WINDSHIELD ICE)" },
        { l: "Carb Heat", a: "ON (FULL)" },
        { l: "Exit Icing ASAP", a: "TURN 180 OR CLIMB/DESCEND" },
        { type: "caution", l: "C172S is NOT certified for flight into known icing (FIKI)" },
        { l: "Declare Emergency", a: "121.5 / ATC IF NEEDED" },
      ]},
      { title: "Carburetor Icing", items: [
        { l: "Carb Heat", a: "FULL ON" },
        { l: "RPM Drop Then Rise", a: "CONFIRMS ICE — LEAVE ON" },
        { l: "Mixture", a: "ADJUST AS NEEDED" },
        { type: "note", l: "Expect 100–300 RPM drop on Carb Heat application — normal. Wait for rise." },
        { l: "Monitor Engine Instruments", a: "CONTINUOUSLY" },
      ]},
      { title: "Airframe Icing", items: [
        { l: "Turn Back / Exit Ice", a: "IMMEDIATE ACTION" },
        { l: "Increase Airspeed", a: "ABOVE NORMAL — ICE ADDS WEIGHT" },
        { l: "Flaps", a: "AVOID FULL (ICE ON TAIL)" },
        { l: "Landing Speed", a: "ADD 5-10 KIAS" },
        { type: "caution", l: "Ice on tail can cause pitch upset with flap extension — extend slowly" },
      ]},
    ]
  },
  {
    id: "electrical", label: "ELEC\nFAIL", color: "#f0d060", dimColor: "#6a5820",
    icon: (size) => (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" stroke="#f0d060" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(240,208,96,0.12)"/>
        <line x1="3" y1="21" x2="7" y2="17" stroke="#e85a4a" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="7" y1="21" x2="3" y2="17" stroke="#e85a4a" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    sections: [
      { title: "Alternator Failure / Low Voltage", items: [
        { l: "Ammeter / Voltmeter", a: "CHECK READINGS" },
        { l: "All Non-Essential Loads", a: "OFF" },
        { l: "Avionics", a: "REDUCE TO MINIMUM" },
        { l: "Lights (Non-Essential)", a: "OFF" },
        { l: "Pitot Heat", a: "OFF IF VMC" },
        { l: "Transponder", a: "SQUAWK 7600" },
        { l: "Declare Emergency", a: "121.5 IF NEEDED" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
        { type: "note", l: "Monitor for total electrical failure. Prepare to fly without instruments." },
      ]},
      { title: "Total Electrical Failure", items: [
        { type: "caution", l: "Engine continues to run — magneto ignition is independent of electrical system" },
        { l: "Master Switch", a: "CHECK ON" },
        { l: "Circuit Breakers", a: "CHECK ALL / RESET ONCE" },
        { l: "Avionics / All Electrics", a: "OFF" },
        { l: "Master Switch", a: "CYCLE OFF / ON" },
        { l: "Land ASAP", a: "NEAREST SUITABLE" },
        { l: "Use Handheld Radio", a: "IF AVAILABLE" },
        { l: "Light Gun Signals", a: "WATCH FOR ATC" },
        { type: "note", l: "VMC: navigate visually. Request light gun clearance at towered airports." },
      ]},
      { title: "Avionics / Bus Failure", items: [
        { l: "Avionics Master", a: "CYCLE OFF / ON" },
        { l: "Individual Avionics CB", a: "CHECK / RESET ONCE" },
        { l: "Primary GPS / Nav", a: "SWITCH TO BACKUP" },
        { l: "Comm — Switch Radios", a: "TRY ALTERNATE COM" },
        { l: "Magnetic Compass", a: "PRIMARY HEADING REF" },
        { l: "Paper Charts / iPad", a: "REVERT TO BACKUP NAV" },
        { type: "note", l: "If G1000 dark: use standby instruments and backup CDI" },
        { l: "Declare if Unable to Nav", a: "121.5 / ATC" },
      ]},
    ]
  },
];

export const VSPEEDS = [
  { group: "Takeoff & Climb", items: [
    { code: "VR",   value: "55",     unit: "KIAS", desc: "Rotation" },
    { code: "VX",   value: "62",     unit: "KIAS", desc: "Best Angle" },
    { code: "VY",   value: "74",     unit: "KIAS", desc: "Best Rate" },
  ]},
  { group: "Approach & Landing", items: [
    { code: "VAPP", value: "65",     unit: "KIAS", desc: "Final Approach" },
    { code: "VSO",  value: "48",     unit: "KIAS", desc: "Stall, L/D" },
    { code: "VFE",  value: "85/110", unit: "K",    desc: "Full/10 Flap" },
  ]},
  { group: "Structural Limits", items: [
    { code: "VA",   value: "105",    unit: "KIAS", desc: "Maneuvering" },
    { code: "VNO",  value: "129",    unit: "KIAS", desc: "Max Structural" },
    { code: "VNE",  value: "163",    unit: "KIAS", desc: "Never Exceed" },
  ]},
];

export const PERF_DATA = [
  {
    group: "Takeoff — Normal (Flaps 0°)",
    note: "2550 LB · Sea Level · Std Temp · Paved/Dry",
    cols: ["Condition", "Grnd Roll", "Over 50ft"],
    rows: [
      ["Sea Level", "960 ft",  "1630 ft"],
      ["2,000 ft",  "1125 ft", "1920 ft"],
      ["4,000 ft",  "1325 ft", "2270 ft"],
      ["6,000 ft",  "1580 ft", "2720 ft"],
    ],
  },
  {
    group: "Takeoff — Short Field (Flaps 10°)",
    note: "2550 LB · Full Power Before Brake Release · VX after liftoff",
    cols: ["Condition", "Grnd Roll", "Over 50ft"],
    rows: [
      ["Sea Level", "795 ft",  "1370 ft"],
      ["2,000 ft",  "940 ft",  "1630 ft"],
      ["4,000 ft",  "1115 ft", "1950 ft"],
      ["6,000 ft",  "1335 ft", "2360 ft"],
    ],
  },
  {
    group: "Landing — Normal (Flaps 30°)",
    note: "2550 LB · Approach 65 KIAS · Paved/Dry/Level",
    cols: ["Condition", "Grnd Roll", "Over 50ft"],
    rows: [
      ["Sea Level", "550 ft",  "1335 ft"],
      ["2,000 ft",  "620 ft",  "1480 ft"],
      ["4,000 ft",  "700 ft",  "1640 ft"],
      ["6,000 ft",  "800 ft",  "1830 ft"],
    ],
  },
];

export const CLIMB_DATA = [
  {
    group: "Best Rate of Climb (VY = 74 KIAS · Flaps 0° · Full Power)",
    cols: ["Pressure Alt", "Rate of Climb", "Time to Climb", "Fuel Used", "Distance"],
    rows: [
      ["Sea Level", "720 FPM", "0 min",  "0 gal",   "0 NM"],
      ["2,000 ft",  "645 FPM", "3 min",  "0.5 gal", "5 NM"],
      ["4,000 ft",  "565 FPM", "7 min",  "1.1 gal", "11 NM"],
      ["6,000 ft",  "480 FPM", "11 min", "1.8 gal", "18 NM"],
      ["8,000 ft",  "395 FPM", "16 min", "2.6 gal", "26 NM"],
      ["10,000 ft", "305 FPM", "22 min", "3.6 gal", "35 NM"],
      ["12,000 ft", "210 FPM", "30 min", "4.9 gal", "47 NM"],
    ],
    note: "2550 LB · Std Temp · 25 PPH fuel flow for climb",
  },
  {
    group: "Service & Absolute Ceiling",
    cols: ["Item", "Value"],
    rows: [
      ["Service Ceiling",  "14,000 ft (100 FPM climb)"],
      ["Absolute Ceiling", "~15,000 ft (0 FPM climb)"],
    ],
  },
];

export const CRUISE_DATA = [
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

export const MORE_REFS = [
  {
    id: "light_gun", title: "ATC Light Gun Signals", color: "#e8c84a",
    cols: ["Signal", "On Ground", "In Flight"],
    rows: [
      ["Steady GREEN",    "Cleared for takeoff",       "Cleared to land"],
      ["Flashing GREEN",  "Cleared to taxi",            "Return for landing"],
      ["Steady RED",      "Stop",                       "Give way — continue"],
      ["Flashing RED",    "Taxi clear of runway",       "Airport unsafe — do not land"],
      ["Flashing WHITE",  "Return to start",            "—"],
      ["Alternating R/G", "Exercise extreme caution",   "Exercise extreme caution"],
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
    id: "wx_minimums", title: "VFR Weather Minimums", color: "#3dbe6c",
    note: "14 CFR 91.155 — Basic VFR minimums",
    cols: ["Airspace", "Visibility", "Cloud Clearance"],
    rows: [
      ["Class A",        "N/A (IFR only)", "N/A"],
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
    id: "airspeed_limits", title: "Airspeed Limits (§91.117)", color: "#e85a4a",
    note: "§91.117 — No person may operate an aircraft at indicated airspeed in excess of these limits",
    cols: ["Rule", "Speed Limit"],
    rows: [
      ["Below 10,000 ft MSL",                         "250 KIAS max"],
      ["In Class B airspace",                         "250 KIAS max"],
      ["Below Class B shelf",                         "200 KIAS max"],
      ["In Class C or D surface area",                "200 KIAS max"],
      ["In tunnel / VFR corridor",                    "200 KIAS max"],
      ["Within 4 NM, 2500 AGL of primary Class C/D", "200 KIAS max"],
    ],
  },
  {
    id: "vfr_altitudes", title: "VFR Cruising Altitudes (§91.159)", color: "#4ae8c8",
    note: "Applies above 3,000 ft AGL in cruising flight",
    cols: ["Magnetic Course", "Altitude"],
    rows: [
      ["000° – 179° (East)",  "Odd thousands + 500 ft (3500, 5500, 7500…)"],
      ["180° – 359° (West)",  "Even thousands + 500 ft (4500, 6500, 8500…)"],
      ["IFR East",            "Odd thousands (3000, 5000, 7000…)"],
      ["IFR West",            "Even thousands (4000, 6000, 8000…)"],
    ],
  },
  {
    id: "airspace_entry", title: "Airspace Entry Requirements", color: "#c87ae8",
    cols: ["Class", "Equipment Required", "Clearance"],
    rows: [
      ["A", "IFR-equipped, IFR flight plan",       "ATC clearance reqd"],
      ["B", "2-way radio, Mode C xpdr, ADS-B",     "Explicit ATC clearance"],
      ["C", "2-way radio, Mode C xpdr, ADS-B",     "ATC contact establ."],
      ["D", "2-way radio",                          "ATC contact establ."],
      ["E", "None for VFR",                         "None for VFR"],
      ["G", "None for VFR",                         "None"],
    ],
  },
  {
    id: "c172_engine", title: "C172S Engine Specifications", color: "#e8c84a",
    cols: ["Item", "Specification"],
    rows: [
      ["Engine Model",          "Lycoming IO-360-L2A"],
      ["Configuration",         "4-cylinder, horizontally opposed"],
      ["Displacement",          "360 cubic inches"],
      ["Horsepower",            "180 HP @ 2700 RPM"],
      ["Compression Ratio",     "8.5 : 1"],
      ["TBO",                   "2,000 hours"],
      ["Oil Pressure (normal)", "60–90 PSI"],
      ["Oil Pressure (min)",    "25 PSI (idle) / 55 PSI (takeoff)"],
      ["Oil Temp (normal)",     "75–240 °F"],
      ["Oil Temp (max)",        "245 °F"],
      ["CHT (max)",             "500 °F"],
      ["Max RPM",               "2,700 RPM"],
      ["Fuel Injection",        "Fuel injected (IO- prefix)"],
    ],
  },
  {
    id: "c172_electrical", title: "C172S Electrical System", color: "#4a9fe8",
    cols: ["Item", "Specification"],
    rows: [
      ["System Voltage",      "28V DC"],
      ["Alternator Output",   "60 amp"],
      ["Battery",             "24V / 13.75 Ah lead-acid"],
      ["Battery Endurance",   "~30 min essential load"],
      ["Ammeter Normal",      "Slight positive (charging)"],
      ["Ammeter (discharge)", "Negative — alternator failed"],
      ["Low Voltage Warning", "< 24.5V — check alternator"],
      ["Bus Voltage (normal)","27.5–28.5V"],
      ["Main Bus",            "Essential + non-essential loads"],
      ["Avionics Bus",        "Avionics master switch controlled"],
      ["Breaker Panel",       "Right side of instrument panel"],
    ],
  },
  {
    id: "runway_markings", title: "Runway Markings & Lighting", color: "#3dbe6c",
    cols: ["Item", "Meaning"],
    rows: [
      ["Threshold (white bars)",    "Beginning of landing area"],
      ["Runway numbers",            "Magnetic heading ÷ 10 (rounded)"],
      ["Centerline (dashed white)", "Runway centerline"],
      ["Touchdown zone (TDZ)",      "First 3,000 ft of runway"],
      ["Fixed distance markers",    "500 ft increments from threshold"],
      ["Hold short (4 yellow lines)","Do not cross without clearance"],
      ["Taxiway centerline (yellow)","Follow for taxi guidance"],
      ["PAPI — 4 red",              "Too low"],
      ["PAPI — 3 red / 1 white",    "Slightly low"],
      ["PAPI — 2 red / 2 white",    "On glidepath (3°)"],
      ["PAPI — 1 red / 3 white",    "Slightly high"],
      ["PAPI — 4 white",            "Too high"],
      ["VASI — red over red",       "Too low (dead, you're dead)"],
      ["VASI — white over red",     "On glidepath"],
      ["VASI — white over white",   "Too high"],
      ["REIL (flashing lights)",    "Runway end identifier"],
      ["MALSR / ALSF",              "Approach light system — aids transition"],
    ],
  },
  {
    id: "fuel_oil", title: "C172S Fuel & Oil Quick Ref", color: "#e85a4a",
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
    id: "weight_cg", title: "C172S Weight & CG Limits", color: "#e85a4a",
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
    id: "tire_pressures", title: "C172S Tire Pressures", color: "#3dbe6c",
    note: "Check cold pressure only. Inspect for cuts, wear, and proper inflation before each flight.",
    cols: ["Tire", "Pressure", "Size / Notes"],
    rows: [
      ["Nose Gear",       "42 PSI", "5.00-5 (tube type)"],
      ["Main Gear (each)","28 PSI", "6.00-6 (tube type)"],
    ],
  },
  {
    id: "phonetic", title: "NATO Phonetic Alphabet", color: "#c87ae8",
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
// SCRATCHPAD CANVAS — persistent draw-on canvas widget
// ─────────────────────────────────────────────────────────────────────────────
function ScratchpadCanvas({ storageKey }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPos = useRef(null);
  const saveTimerRef = useRef(null);
  const [tool, setTool] = useState("pen");
  const [penSize, setPenSize] = useState(2.5);
  const [penColor, setPenColor] = useState("#e8e4d8");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const load = async () => {
      try {
        const result = await window.storage.get(storageKey);
        if (result?.value) {
          const img = new Image();
          img.onload = () => canvas.getContext("2d").drawImage(img, 0, 0);
          img.src = result.value;
        }
      } catch {}
    };
    load();
  }, [storageKey]);

  const persist = () => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try { window.storage.set(storageKey, canvasRef.current.toDataURL()); } catch {}
    }, 400);
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => { e.preventDefault(); drawingRef.current = true; lastPos.current = getPos(e); };
  const draw = (e) => {
    e.preventDefault();
    if (!drawingRef.current || !lastPos.current) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
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
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#0d1a12", borderBottom: "1px solid #1e3528", flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "#0a0c10", border: "1px solid #1e3528", borderRadius: 4, overflow: "hidden" }}>
          {[["pen","✏ PEN"],["eraser","◻ ERASE"]].map(([t, label]) => (
            <button key={t} onClick={() => setTool(t)} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "4px 12px", cursor: "pointer", border: "none", background: tool === t ? "rgba(61,190,108,0.15)" : "transparent", color: tool === t ? "#3dbe6c" : "#4a5068", borderRight: t === "pen" ? "1px solid #1e3528" : "none" }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {PEN_SIZES.map(s => (
            <button key={s} onClick={() => { setPenSize(s); setTool("pen"); }} style={{ width: 26, height: 26, borderRadius: 4, border: `1.5px solid ${penSize === s && tool === "pen" ? "#3dbe6c" : "#1e3528"}`, background: penSize === s && tool === "pen" ? "rgba(61,190,108,0.12)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
              <div style={{ width: s * 2.2, height: s * 2.2, borderRadius: "50%", background: "#e8e4d8" }} />
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {PEN_COLORS.map(c => (
            <button key={c} onClick={() => { setPenColor(c); setTool("pen"); }} style={{ width: 22, height: 22, borderRadius: 4, border: `2px solid ${penColor === c && tool === "pen" ? "#fff" : "transparent"}`, background: c, cursor: "pointer", padding: 0 }} />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={clearCanvas} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 12px", borderRadius: 3, cursor: "pointer", background: "transparent", color: "#6a3030", border: "1px solid #3a2020" }}>↺ CLEAR CANVAS</button>
      </div>
      <div style={{ flex: 1, position: "relative", touchAction: "none", background: "#050e09" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} preserveAspectRatio="none">
          {Array.from({ length: 20 }, (_, i) => <line key={i} x1="0" y1={`${(i + 1) * 5}%`} x2="100%" y2={`${(i + 1) * 5}%`} stroke="rgba(74,159,232,0.06)" strokeWidth="1"/>)}
          <line x1="5%" y1="0" x2="5%" y2="100%" stroke="rgba(232,90,74,0.1)" strokeWidth="1"/>
        </svg>
        <canvas ref={canvasRef} width={1200} height={900} style={{ display: "block", width: "100%", height: "100%", cursor: tool === "eraser" ? "cell" : "crosshair", touchAction: "none" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAWING NOTEPAD — inline notepad for ATIS / clearance items
// ─────────────────────────────────────────────────────────────────────────────
function DrawingNotepad({ title, footer, onClose, storageKey, initialImage, onSave }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPos = useRef(null);
  const saveTimerRef = useRef(null);
  const [penSize, setPenSize] = useState(2.5);
  const [penColor, setPenColor] = useState("#e8e4d8");

  useEffect(() => {
    if (!initialImage || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => { const canvas = canvasRef.current; if (canvas) canvas.getContext("2d").drawImage(img, 0, 0); };
    img.src = initialImage;
  }, [initialImage]);

  const persist = () => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (!canvasRef.current) return;
      const dataUrl = canvasRef.current.toDataURL();
      try { window.storage.set(storageKey, dataUrl); } catch {}
      if (onSave) onSave(dataUrl);
    }, 400);
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => { e.preventDefault(); drawingRef.current = true; lastPos.current = getPos(e); };
  const draw = (e) => {
    e.preventDefault();
    if (!drawingRef.current || !lastPos.current) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastPos.current = pos;
  };
  const endDraw = (e) => { e.preventDefault(); drawingRef.current = false; lastPos.current = null; persist(); };
  const clearCanvas = () => {
    if (!canvasRef.current) return;
    canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    try { window.storage.delete(storageKey); } catch {}
    if (onSave) onSave(null);
  };

  const PEN_COLORS = ["#e8e4d8","#4ae888","#4ab8e8","#e8c84a","#e85a4a"];
  const PEN_SIZES = [1.5, 2.5, 4, 7];

  return (
    <div style={{ border: "1px solid #1e3528", borderRadius: 4, overflow: "hidden", margin: "4px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "#0a1410", borderBottom: "1px solid #1e3528", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "#4a9fe8", letterSpacing: 1, marginRight: 4 }}>{title}</span>
        <div style={{ display: "flex", gap: 3 }}>
          {PEN_SIZES.map(s => (
            <button key={s} onClick={() => setPenSize(s)} style={{ width: 20, height: 20, borderRadius: 3, border: `1px solid ${penSize === s ? "#3dbe6c" : "#1e3528"}`, background: penSize === s ? "rgba(61,190,108,0.1)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
              <div style={{ width: s * 1.8, height: s * 1.8, borderRadius: "50%", background: "#e8e4d8" }} />
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {PEN_COLORS.map(c => (
            <button key={c} onClick={() => setPenColor(c)} style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${penColor === c ? "#fff" : "transparent"}`, background: c, cursor: "pointer", padding: 0 }} />
          ))}
        </div>
        <div style={{ width: 1, height: 16, background: "#1e3528" }} />
        <button onClick={clearCanvas} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, background: "transparent", border: "1px solid #1e3528", color: "#7a8090", padding: "2px 7px", borderRadius: 3, cursor: "pointer" }}>CLR</button>
        <button onClick={onClose} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, background: "transparent", border: "1px solid #1e3528", color: "#7a8090", padding: "2px 7px", borderRadius: 3, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ position: "relative", touchAction: "none", background: "#050e09" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: 160, pointerEvents: "none" }} preserveAspectRatio="none">
          {[1,2,3,4,5,6].map(i => <line key={i} x1="0" y1={i * 24} x2="100%" y2={i * 24} stroke="rgba(74,159,232,0.10)" strokeWidth="1"/>)}
          <line x1="36" y1="0" x2="36" y2="160" stroke="rgba(232,90,74,0.15)" strokeWidth="1"/>
        </svg>
        <canvas ref={canvasRef} width={600} height={160} style={{ display: "block", width: "100%", height: 160, cursor: "crosshair", touchAction: "none" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
      </div>
      {footer && (
        <div style={{ padding: "3px 10px", background: "#0d1a12", borderTop: "1px solid #1e3528" }}>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8.5, color: "#1e3528", letterSpacing: 0.8 }}>{footer}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKLIST APP — the full interactive kneeboard for a single aircraft
// Import this into apex_kneeboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function ChecklistApp({ onBackToHangar, aircraft }) {
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
  const [notepadImages, setNotepadImages] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [customItems, setCustomItems] = useState({});
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemAction, setNewItemAction] = useState("");
  const [inlineEdit, setInlineEdit] = useState(null);
  const [zuluTime, setZuluTime] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [scratchpadMode, setScratchpadMode] = useState("draw");
  const [scratchpadText, setScratchpadText] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeMoreRef, setActiveMoreRef] = useState("light_gun");
  const [activeDrawer, setActiveDrawer] = useState(new Set());   // Set of open keys — multiple allowed
  const [perfSubTab, setPerfSubTab] = useState("perf");     // unused but kept for compat
  const [lightMode, setLightMode] = useState(false);
  const [ttsActive, setTtsActive] = useState(null);
  const [ttsPaused, setTtsPaused] = useState(false);
  const ttsQueueRef = useRef([]);
  const ttsIdxRef = useRef(0);
  const ttsUtterRef = useRef(null);

  // ── COMM AUDIO ENGINE — global background state (survives page changes) ──────
  // Worker + ring buffer live here so monitoring continues across all tabs.
  const [commListening,     setCommListening]     = useState(false);
  const [commMicStatus,     setCommMicStatus]     = useState("idle");
  const [commRmsLevel,      setCommRmsLevel]      = useState(0);
  const [commTranscript,    setCommTranscript]    = useState("");
  const [commTxLog,         setCommTxLog]         = useState([]);
  const [commWatchdogState, setCommWatchdogState] = useState("clear");
  const [commWatchdogTx,    setCommWatchdogTx]    = useState(null);
  const [commAckCountdown,  setCommAckCountdown]  = useState(0);
  const [commReplayActive,  setCommReplayActive]  = useState(false);
  const [commForceIfr,      setCommForceIfr]      = useState(false);
  const [commIfrData,       setCommIfrData]       = useState({ N:"",W:"",K:"",R:"",A:"",F:"",T:"" });
  const commWorkerRef       = useRef(null);
  const commWorkerBlobUrl   = useRef(null);
  const commRecognitionRef  = useRef(null);
  const commStreamRef       = useRef(null);
  const commAudioCtxRef     = useRef(null);
  const commAnimFrameRef    = useRef(null);
  const commAckIntervalRef  = useRef(null);
  const commBeepIntervalRef = useRef(null);
  const commTxIdRef         = useRef(0);
  const commCallsignRxRef   = useRef(null);

  // Directive verbs for watchdog regex
  const COMM_DIRECTIVES = [
    // Original Baseline Core
    "climb","descend","turn","maintain","fly","cleared","contact",
    "squawk","hold short","hold","report","traffic","expect","cross",
    "taxi","line up","wait","go around","cancel","frequency","departure",
    "approach","heading","altitude","speed","direct","intercept",
    
    // High-Risk Safety & Urgent Directives
    "expedite","immediate","say again","verify","correction","unable",
    "avoid","alert","hazard","traffic","alert","nearest","suitable","parallel","upwind","downwind","cross","base","final",
    
    // Advanced Surface & Runway Operations
    "line up","and wait","back taxi","taxi","progressive","movement area",
    "hold position","exit","intersection","apron","ramp","hold short","hold",
    
    // IFR Terminal & En Route Management
    "as filed","ident","resume","own navigation","climb","in route",
    "climb via","descend via","cruise","maintain block","visual",
    "radar contact","lost radar contact","radar service terminated",
    
    // Critical Flight Environment Calls
    "caution wake turbulence","wind shear","microburst","sigmet",
    "airmet","convective","unreported icing","caution","turbulence"
  ];

  const COMM_PHONETIC_D = {"0":"zero","1":"one","2":"two","3":"three","4":"four","5":"five","6":"six","7":"seven","8":"eight","9":"nine"};
  const COMM_PHONETIC_A = {A:"alpha",B:"bravo",C:"charlie",D:"delta",E:"echo",F:"foxtrot",G:"golf",H:"hotel",I:"india",J:"juliett",K:"kilo",L:"lima",M:"mike",N:"november",O:"oscar",P:"papa",Q:"quebec",R:"romeo",S:"sierra",T:"tango",U:"uniform",V:"victor",W:"whiskey",X:"xray",Y:"yankee",Z:"zulu"};

  const buildCommRegex = useCallback((tail) => {
    if (!tail) return null;
    const clean = tail.toUpperCase().replace(/[^A-Z0-9]/g,"");
    const parts = clean.split("").map(c => { const ph=COMM_PHONETIC_A[c]||COMM_PHONETIC_D[c]||c; return `(?:${c}|${ph})`; });
    const combined = `(?:${clean}|${parts.join("[\\s\\-]*")}|${clean.split("").join("[\\s]*")})`;
    const verbPart = COMM_DIRECTIVES.map(v=>v.replace(/ /g,"\\s+")).join("|");
    return new RegExp(`(${combined})[^.]{0,60}(${verbPart})`,"i");
  }, []);

  const commDetectType = (text) => {
    const t = text.toLowerCase();
    if (/cleared\s+(?:to|for)\s+(?:the\s+)?(?:ils|rnav|vor|gps|lda|loc|ndb)\s+approach/.test(t)) return "ifr_approach";
    if (/cleared\s+to\s+[a-z]/.test(t) && /squawk|departure|maintain\s+\d/.test(t)) return "ifr_departure";
    if (/cleared\s+to\s+land/.test(t)||/cleared\s+(?:for|the)\s+(?:option|landing|approach)/.test(t)) return "landing";
    const LEGS=["upwind","crosswind","downwind","base","final","left downwind","right downwind","left base","right base","straight-in"];
    if (/enter|make|report|traffic/.test(t)&&LEGS.some(l=>t.includes(l))) return "pattern";
    return "general";
  };

  const commParseNwkraft = (text) => {
    const r={N:"",W:"",K:"",R:"",A:"",F:"",T:""};
    const dest=text.match(/cleared\s+(?:to\s+)?([A-Z][A-Z0-9\s]{2,20}?)(?:\s+via|\s+as\s+filed|\s+climb|\s+maintain|,)/i);
    if(dest) r.N=dest[1].trim();
    r.W=text.toLowerCase().includes("ifr")?"IFR FLIGHT PLAN":"";
    const sqk=text.match(/squawk\s+(\d{4})/i); if(sqk) r.K=sqk[1];
    const via=text.match(/via\s+([A-Z0-9\s,]+?)(?:\s+maintain|\s+climb|\s+expect|$)/i);
    if(via) r.R=via[1].trim(); else if(text.toLowerCase().includes("as filed")) r.R="AS FILED";
    const alt=text.match(/(?:maintain|climb\s+and\s+maintain|climb\s+to)\s+(\d[\d,]+\s*(?:feet|ft)?)/i);
    if(alt) r.A=alt[1].replace(/,/g,"").trim();
    const exp=text.match(/expect\s+(\d[\d,]+)\s*(?:feet|ft)?/i);
    if(exp) r.A=(r.A?r.A+" / EXP ":"EXP ")+exp[1];
    const frq=text.match(/(?:contact|departure|frequency)\s+(\d{3}.\d+)/i); if(frq) r.F=frq[1];
    r.T=r.K?`SQUAWK ${r.K}`:"";
    return r;
  };

  const commParseLanding = (text) => {
    const LEGS_RX=["upwind","crosswind","downwind","base","final","left\\s+downwind","right\\s+downwind","left\\s+base","right\\s+base","left\\s+traffic","right\\s+traffic","straight-in","overhead"];
    const annotated=[]; const t=text;
    const add=(rx,type)=>{let m;while((m=rx.exec(t))!==null)annotated.push({start:m.index,end:m.index+m[0].length,text:m,type});};
    add(/\b(?:runway|rwy)\s*([0-9]{1,2}[LRC]?)\b/gi,"runway");
    add(new RegExp(`\\b(${LEGS_RX.join("|")})\\b`,"gi"),"leg");
    add(/\b(left|right|straight|north|south|east|west)\b/gi,"direction");
    annotated.sort((a,b)=>a.start-b.start);
    const deduped=[]; let cur=0;
    for(const a of annotated){if(a.start<cur)continue;deduped.push(a);cur=a.end;}
    const out=[]; let pos=0;
    for(const a of deduped){if(a.start>pos)out.push({text:t.slice(pos,a.start),type:"plain"});out.push({text:a.text,type:a.type});pos=a.end;}
    if(pos<t.length)out.push({text:t.slice(pos),type:"plain"});
    return out;
  };

  const commPlayChime = (urgent=false) => {
    try {
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const b=(st,f,d)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type="sine";g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(0.5,st+0.02);g.gain.linearRampToValueAtTime(0,st+d);o.start(st);o.stop(st+d+0.02);};
      const t=ctx.currentTime;
      if(urgent){b(t,1046,0.12);b(t+0.16,1046,0.12);b(t+0.32,1046,0.22);}
      else{b(t,523,0.25);b(t+0.3,659,0.15);}
      setTimeout(()=>{try{ctx.close();}catch{}},1400);
    } catch {}
  };

  const commClearTimers = () => { clearInterval(commAckIntervalRef.current); clearInterval(commBeepIntervalRef.current); };

  const commTriggerWatchdog = useCallback((entry) => {
    commClearTimers();
    setCommWatchdogState("alert");
    setCommWatchdogTx(entry);
    setCommAckCountdown(5);
    commPlayChime(false);
    let rem=5;
    commAckIntervalRef.current=setInterval(()=>{ rem--; setCommAckCountdown(rem); if(rem<=0){ clearInterval(commAckIntervalRef.current); setCommWatchdogState("unanswered"); commPlayChime(true); commBeepIntervalRef.current=setInterval(()=>commPlayChime(true),2000); }},1000);
  },[]);

  const commHandleTranscript = useCallback((text, isFinal) => {
    if (!text?.trim()) return;
    setCommTranscript(isFinal ? "" : text);
    if (!isFinal) return;
    const type    = commDetectType(text);
    const tokens  = (type==="landing"||type==="pattern") ? commParseLanding(text) : null;
    const nwkraft = (type==="ifr_departure"||type==="ifr_approach"||commForceIfr) ? commParseNwkraft(text) : null;
    const entry   = { id:++commTxIdRef.current, text, ts:new Date(), type, tokens, nwkraft };
    setCommTxLog(prev=>[entry,...prev].slice(0,40));
    if (nwkraft) setCommIfrData(nwkraft);
    if (commCallsignRxRef.current && commCallsignRxRef.current.test(text)) commTriggerWatchdog(entry);
  },[commForceIfr, commTriggerWatchdog]);

  // Build comm worker blob inline (same architecture as comm_page.jsx worker)
  const COMM_WORKER_BLOB = `const SAMPLE_RATE=16000,BUFFER_SIZE=16000*12; const ring=new Float32Array(BUFFER_SIZE);let wh=0; function rms(s){let sum=0;for(let i=0;i<s.length;i++)sum+=s[i]*s[i];return 20*Math.log10(Math.sqrt(sum/s.length)+1e-9);} function write(s){for(let i=0;i<s.length;i++){ring[wh]=s[i];wh=(wh+1)%BUFFER_SIZE;}} function read(sec){const n=Math.min(sec*SAMPLE_RATE,BUFFER_SIZE),out=new Float32Array(n),st=(wh-n+BUFFER_SIZE)%BUFFER_SIZE;for(let i=0;i<n;i++)out[i]=ring[(st+i)%BUFFER_SIZE];return out;} self.onmessage=function(e){   if(e.data.type==="AUDIO_CHUNK"){write(e.data.samples);self.postMessage({type:"BUFFER_READY",rmsDb:rms(e.data.samples)});return;}   if(e.data.type==="TRANSCRIPTION_RESULT"){self.postMessage({type:"TRANSCRIPT",text:e.data.text,isFinal:e.data.isFinal,ts:Date.now()});return;}   if(e.data.type==="GET_REPLAY"){self.postMessage({type:"REPLAY_PCM",pcm:read(e.data.seconds||10),sampleRate:SAMPLE_RATE});return;} };`;

  // Spin up worker once on mount
  useEffect(() => {
    const blob=new Blob([COMM_WORKER_BLOB],{type:"application/javascript"});
    commWorkerBlobUrl.current=URL.createObjectURL(blob);
    commWorkerRef.current=new Worker(commWorkerBlobUrl.current);
    commWorkerRef.current.onmessage=(e)=>{
      const{type}=e.data;
      if(type==="BUFFER_READY") setCommRmsLevel(Math.max(0,Math.min(1,(e.data.rmsDb+60)/60)));
      if(type==="TRANSCRIPT")   commHandleTranscript(e.data.text,e.data.isFinal);
      if(type==="REPLAY_PCM")   commPlayPcm(e.data.pcm,e.data.sampleRate);
    };
    return()=>{commWorkerRef.current?.terminate();if(commWorkerBlobUrl.current)URL.revokeObjectURL(commWorkerBlobUrl.current);};
  }, [commHandleTranscript]);

  // Rebuild callsign regex when aircraft prop changes
  useEffect(() => { commCallsignRxRef.current = buildCommRegex(aircraft?.tail); }, [aircraft?.tail, buildCommRegex]);

  // Cleanup all comm resources on unmount
  useEffect(() => {
    return () => {
      commStopListening();
      commClearTimers();
    };
  }, []);

  const commPlayPcm = (pcm,sr) => {
    try {
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const buf=ctx.createBuffer(1,pcm.length,sr); buf.copyToChannel(pcm,0);
      const src=ctx.createBufferSource(); src.buffer=buf; src.connect(ctx.destination); src.start();
      src.onended=()=>{setCommReplayActive(false);ctx.close();};
    } catch { setCommReplayActive(false); }
  };

const commStartListening = async () => {
    // Guard ONLY on real hardware state — not React state flag (async, may lag)
    if (commStreamRef.current) return;
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      commStreamRef.current = stream;
      
      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      commAudioCtxRef.current = ctx;
      
      const source = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      source.connect(proc); 
      proc.connect(ctx.destination);
      
      proc.onaudioprocess = (e) => {
        const s = new Float32Array(e.inputBuffer.getChannelData(0));
        commWorkerRef.current?.postMessage({ type: "AUDIO_CHUNK", samples: s });
      };
      
      // VU animation via analyser
      const analyser = ctx.createAnalyser(); 
      analyser.fftSize = 256; 
      source.connect(analyser);
      
      const vuBuf = new Uint8Array(analyser.frequencyBinCount);
      const animVu = () => {
        analyser.getByteFrequencyData(vuBuf);
        let sum = 0;
        for (let i = 0; i < vuBuf.length; i++) sum += vuBuf[i] * vuBuf[i];
        setCommRmsLevel(Math.sqrt(sum / vuBuf.length) / 255);
        commAnimFrameRef.current = requestAnimationFrame(animVu);
      };
      commAnimFrameRef.current = requestAnimationFrame(animVu);
      
      // Web Speech API injection
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR(); 
        rec.continuous = true; 
        rec.interimResults = true; 
        rec.lang = "en-US"; 
        rec.maxAlternatives = 1;
        
        rec.onresult = (e) => {
          let p = "", f = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) f += r[0].transcript + " ";
            else p += r[0].transcript;
          }
          if (p) setCommTranscript(p);
          if (f.trim()) commWorkerRef.current?.postMessage({ type: "TRANSCRIPTION_RESULT", text: f.trim(), isFinal: true });
        };
        rec.onerror = (e) => { if (e.error === "not-allowed") setCommMicStatus("denied"); };
        rec.onend = () => { try { rec.start(); } catch {} };
        rec.start(); 
        commRecognitionRef.current = rec;
      }
      
      setCommListening(true); 
      setCommMicStatus("active");
    } catch (err) { 
      setCommMicStatus(err.name === "NotAllowedError" ? "denied" : "error"); 
    }
  };

  const commStopListening = () => {
    // 1. Forcefully unbind all listeners before killing the recognition thread
    if (commRecognitionRef.current) {
      commRecognitionRef.current.onresult = null;
      commRecognitionRef.current.onerror = null;
      commRecognitionRef.current.onend = null;
      try { commRecognitionRef.current.stop(); } catch (e) {}
      commRecognitionRef.current = null;
    }
    
    // 2. Clear out underlying hardware media stream tracks cleanly
    if (commStreamRef.current) {
      commStreamRef.current.getTracks().forEach(track => track.stop());
      commStreamRef.current = null;
    }
    
    // 3. Dismantle visual rendering loops and engine contexts
    if (commAnimFrameRef.current) {
      cancelAnimationFrame(commAnimFrameRef.current);
      commAnimFrameRef.current = null;
    }
    
    if (commAudioCtxRef.current) {
      try { commAudioCtxRef.current.close(); } catch (e) {}
      commAudioCtxRef.current = null;
    }
    
    // 4. Return app state back to absolute cold baseline
    setCommListening(false);
    setCommMicStatus("idle");   // reset to idle so button re-enables cleanly
    setCommTranscript("");
    setCommRmsLevel(0);
    commStreamRef.current = null;   // belt-and-suspenders: ensure ref is null
    commAudioCtxRef.current = null; // ensure ctx ref is null after close
  };

  const commAckCall = () => { commClearTimers(); setCommWatchdogState("clear"); setCommWatchdogTx(null); setCommAckCountdown(0); commPlayChime(false); };
  const commReplay = (seconds = 10) => { commWorkerRef.current?.postMessage({ type: "GET_REPLAY", seconds }); setCommReplayActive(true); setTimeout(() => setCommReplayActive(false), seconds * 1000); };
  // ── END COMM AUDIO ENGINE

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const T = lightMode ? {
    appBg:"#e8eaf0", headerBg:"linear-gradient(135deg,#d0d4e0 0%,#c8ccd8 60%,#d0d4e0 100%)",
    headerBorder:"#1a6ab0", leftSideBg:"#d0d4e0", leftSideBorder:"#a0a8c0",
    leftTabActive:"rgba(26,106,176,0.12)", leftTabText:"#1a6ab0", leftTabDim:"#607090",
    leftTabCount:"#40608a", centerBg:"#f0f2f8", centerBorder:"#a0a8c0",
    itemLabel:"#0a1428", itemAction:"#1a3a6a", itemBorder:"rgba(100,120,160,0.25)",
    itemCheckedOp:0.3, checkboxBorder:"#3a70b0", checkboxDone:"rgba(20,120,60,0.2)",
    checkColor:"#1a7040", actionColor:"#1a4a8a",
    sectionBg:"linear-gradient(90deg, rgba(26,106,176,0.15) 0%, rgba(220,226,238,0) 80%)",
    sectionBorder:"#1a6ab0", sectionTitle:"#0a2858", noteColor:"#5a6a20",
    cautionColor:"#8a2010", noteBg:"rgba(120,140,20,0.08)", cautionBg:"rgba(180,40,20,0.06)",
    panelTabBg:"#c8ccd8", editBg:"#dde0ec", editBorder:"#9098b8",
    editHintColor:"#404878", inputBg:"#f8f9fc", scratchBg:"#f0f2f8",
  } : {
    appBg:"#0d0f12", headerBg:"linear-gradient(135deg,#0a0c10 0%,#141820 60%,#0a0c10 100%)",
    headerBorder:"#e8c84a", leftSideBg:"#141820", leftSideBorder:"#2a3040",
    leftTabActive:"rgba(232,200,74,0.07)", leftTabText:"#e8c84a", leftTabDim:"#7a8090",
    leftTabCount:"#444", centerBg:"#0d0f12", centerBorder:"#2a3040",
    itemLabel:"#e8e4d8", itemAction:"#e8c84a", itemBorder:"rgba(42,48,64,0.45)",
    itemCheckedOp:0.35, checkboxBorder:"#3a4050", checkboxDone:"rgba(61,190,108,0.15)",
    checkColor:"#3dbe6c", actionColor:"#e8c84a",
    sectionBg:"linear-gradient(90deg, rgba(232,200,74,0.06) 0%, rgba(13,15,18,0) 80%)",
    sectionBorder:"#e8c84a", sectionTitle:"#e8e4d8", noteColor:"#b8a840",
    cautionColor:"#d06050", noteBg:"rgba(184,168,64,0.06)", cautionBg:"rgba(208,96,80,0.06)",
    panelTabBg:"#141820", editBg:"#0d1018", editBorder:"#2a3040",
    editHintColor:"#4a5068", inputBg:"#141820", scratchBg:"#0a0c10",
  };

  // ── Clock & timer ──────────────────────────────────────────────────────────
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
    return h > 0 ? `${h}:${z(m)}:${z(sec)}` : `${z(m)}:${z(sec)}`;
  };

  // ── Storage load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const ci = await window.storage.get("kneeboard-custom-items");
        if (ci?.value) {
          const parsed = JSON.parse(ci.value);
          const restored = {};
          Object.keys(parsed).forEach(k => {
            restored[k] = { ...parsed[k], removed: new Set(parsed[k].removed || []) };
          });
          setCustomItems(restored);
        }
        const vs = await window.storage.get("kneeboard-vspeeds");
        if (vs?.value) setVspeeds(JSON.parse(vs.value));
        const pd = await window.storage.get("kneeboard-perfdata");
        if (pd?.value) setPerfData(JSON.parse(pd.value));
        const cd = await window.storage.get("kneeboard-climbdata");
        if (cd?.value) setClimbData(JSON.parse(cd.value));
        const crd = await window.storage.get("kneeboard-cruisedata");
        if (crd?.value) setCruiseData(JSON.parse(crd.value));
        // Notepad images
        const keys = await window.storage.list("notepad-");
        if (keys?.keys) {
          const imgs = {};
          for (const key of keys.keys) {
            const r = await window.storage.get(key);
            if (r?.value) imgs[key] = r.value;
          }
          setNotepadImages(imgs);
        }
        const sp = await window.storage.get("scratchpad-text");
        if (sp?.value) setScratchpadText(sp.value);
      } catch {}
    };
    if (typeof window !== "undefined" && window.storage) load();
  }, []);

  // ── Custom items helpers ──────────────────────────────────────────────────
  const getSectionKey = (pageId, sectionTitle) => `${pageId}::${sectionTitle}`;
  const getSectionCustom = (pageId, sectionTitle) => {
    const key = getSectionKey(pageId, sectionTitle);
    return customItems[key] || { removed: new Set(), added: [], order: null, renames: {} };
  };

  const saveCustomItems = async (next) => {
    try {
      const serializable = {};
      Object.keys(next).forEach(k => {
        serializable[k] = { removed: [...next[k].removed], added: next[k].added, order: next[k].order || null, renames: next[k].renames || {} };
      });
      await window.storage.set("kneeboard-custom-items", JSON.stringify(serializable));
    } catch {}
  };

  const saveVspeeds = async (next) => { try { await window.storage.set("kneeboard-vspeeds", JSON.stringify(next)); } catch {} };
  const savePerfData = async (next) => { try { await window.storage.set("kneeboard-perfdata", JSON.stringify(next)); } catch {} };
  const saveClimbData = async (next) => { try { await window.storage.set("kneeboard-climbdata", JSON.stringify(next)); } catch {} };
  const saveCruiseData = async (next) => { try { await window.storage.set("kneeboard-cruisedata", JSON.stringify(next)); } catch {} };

  const updateVspeed = (gi, ii, field, val) => {
    setVspeeds(prev => { const next = prev.map((g, gIdx) => gIdx !== gi ? g : { ...g, items: g.items.map((item, iIdx) => iIdx !== ii ? item : { ...item, [field]: val }) }); saveVspeeds(next); return next; });
  };
  const resetVspeeds = () => { const f = VSPEEDS.map(g => ({ ...g, items: g.items.map(i => ({ ...i })) })); setVspeeds(f); saveVspeeds(f); };
  const updatePerfCell = (si, ri, ci, val) => { setPerfData(prev => { const next = prev.map((s, sIdx) => sIdx !== si ? s : { ...s, rows: s.rows.map((row, rIdx) => rIdx !== ri ? row : row.map((cell, cIdx) => cIdx !== ci ? cell : val)) }); savePerfData(next); return next; }); };
  const resetPerfData = () => { const f = PERF_DATA.map(s => ({ ...s, rows: s.rows.map(r => [...r]) })); setPerfData(f); savePerfData(f); };
  const updateClimbCell = (si, ri, ci, val) => { setClimbData(prev => { const next = prev.map((s, sIdx) => sIdx !== si ? s : { ...s, rows: s.rows.map((row, rIdx) => rIdx !== ri ? row : row.map((cell, cIdx) => cIdx !== ci ? cell : val)) }); saveClimbData(next); return next; }); };
  const resetClimbData = () => { const f = CLIMB_DATA.map(s => ({ ...s, rows: s.rows.map(r => [...r]) })); setClimbData(f); saveClimbData(f); };
  const updateCruiseCell = (si, ri, ci, val) => { setCruiseData(prev => { const next = prev.map((s, sIdx) => sIdx !== si ? s : { ...s, rows: s.rows.map((row, rIdx) => rIdx !== ri ? row : row.map((cell, cIdx) => cIdx !== ci ? cell : val)) }); saveCruiseData(next); return next; }); };
  const resetCruiseData = () => { const f = CRUISE_DATA.map(s => ({ ...s, rows: s.rows.map(r => [...r]) })); setCruiseData(f); saveCruiseData(f); };

  const getMergedItems = (pageId, sectionTitle, sectionItems) => {
    const custom = getSectionCustom(pageId, sectionTitle);
    const renames = custom.renames || {};
    const checkableOriginal = sectionItems.filter(i => !i.type).map(i => ({ ...i, custom: false, originalLabel: i.l, l: renames[i.l] ? renames[i.l].l : i.l, a: renames[i.l] ? renames[i.l].a : i.a }));
    const allCheckable = [...checkableOriginal, ...custom.added.map((i, addedIdx) => ({ ...i, custom: true, addedIdx }))];
    if (!custom.order || custom.order.length !== allCheckable.length) return allCheckable;
    return custom.order.map(i => allCheckable[i]).filter(Boolean);
  };

  const addCustomItem = (pageId, sectionTitle) => {
    if (!newItemLabel.trim()) return;
    const key = getSectionKey(pageId, sectionTitle);
    const newItem = { l: newItemLabel.trim(), a: newItemAction.trim().toUpperCase() || "CHECK", custom: true };
    setCustomItems(prev => { const existing = prev[key] || { removed: new Set(), added: [], order: null }; const next = { ...prev, [key]: { ...existing, added: [...existing.added, newItem] } }; saveCustomItems(next); return next; });
    setNewItemLabel(""); setNewItemAction("");
  };

  const removeAddedItem = (pageId, sectionTitle, addedIdx) => {
    const key = getSectionKey(pageId, sectionTitle);
    setCustomItems(prev => { const existing = prev[key] || { removed: new Set(), added: [], order: null }; const added = existing.added.filter((_, i) => i !== addedIdx); const next = { ...prev, [key]: { ...existing, added, order: null } }; saveCustomItems(next); return next; });
  };

  const reorderSection = (pageId, sectionTitle, fromIdx, toIdx, mergedLength) => {
    if (fromIdx === toIdx) return;
    const key = getSectionKey(pageId, sectionTitle);
    setCustomItems(prev => {
      const existing = prev[key] || { removed: new Set(), added: [], order: null };
      const currentOrder = existing.order && existing.order.length === mergedLength ? [...existing.order] : Array.from({ length: mergedLength }, (_, i) => i);
      const [moved] = currentOrder.splice(fromIdx, 1);
      currentOrder.splice(toIdx, 0, moved);
      const next = { ...prev, [key]: { ...existing, order: currentOrder } };
      saveCustomItems(next);
      return next;
    });
  };

  const dragRef = useRef({ fromIdx: null, sectionKey: null });

  // ── TTS ───────────────────────────────────────────────────────────────────
  const getVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred = ["Samantha","Daniel","Karen","Moira","Alex","Google UK English Female","Google US English"];
    for (const name of preferred) { const v = voices.find(v => v.name === name || v.name.includes(name)); if (v) return v; }
    return voices.find(v => v.lang.startsWith("en")) || voices[0] || null;
  };

  const speakItem = (queue, idx, sectionKey) => {
    if (idx >= queue.length) { setTtsActive(null); setTtsPaused(false); ttsQueueRef.current = []; ttsIdxRef.current = 0; return; }
    const { label, action } = queue[idx];
    setTtsActive({ sectionKey, idx });
    const labelUtter = new SpeechSynthesisUtterance(label);
    labelUtter.voice = getVoice(); labelUtter.rate = 0.85; labelUtter.pitch = 0.9; labelUtter.volume = 1.0;
    labelUtter.onend = () => {
      if (!ttsQueueRef.current.length) return;
      setTimeout(() => {
        const actionUtter = new SpeechSynthesisUtterance(action);
        actionUtter.voice = getVoice(); actionUtter.rate = 0.85; actionUtter.pitch = 0.9; actionUtter.volume = 1.0;
        actionUtter.onend = () => { if (!ttsQueueRef.current.length) return; setTimeout(() => speakItem(queue, idx + 1, sectionKey), 600); };
        actionUtter.onerror = () => speakItem(queue, idx + 1, sectionKey);
        ttsUtterRef.current = actionUtter;
        window.speechSynthesis.speak(actionUtter);
      }, 500);
    };
    labelUtter.onerror = () => speakItem(queue, idx + 1, sectionKey);
    ttsUtterRef.current = labelUtter;
    window.speechSynthesis.speak(labelUtter);
  };

  const startTTS = (sectionKey, mergedItems) => {
    window.speechSynthesis.cancel();
    const queue = mergedItems.map(item => ({ label: item.l, action: item.a || "" }));
    if (!queue.length) return;
    ttsQueueRef.current = queue; ttsIdxRef.current = 0;
    setTtsPaused(false); setTtsActive({ sectionKey, idx: -1 });
    speakItem(queue, 0, sectionKey);
  };

  const pauseResumeTTS = () => {
    if (ttsPaused) { window.speechSynthesis.resume(); setTtsPaused(false); }
    else { window.speechSynthesis.pause(); setTtsPaused(true); }
  };

  const stopTTS = () => { window.speechSynthesis.cancel(); ttsQueueRef.current = []; setTtsActive(null); setTtsPaused(false); };

  // ── Checklist logic ────────────────────────────────────────────────────────
  const toggleCheck = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const resetPage = (pageId) => setChecked(prev => { const next = { ...prev }; Object.keys(next).forEach(k => { if (k.startsWith(pageId + "::")) delete next[k]; }); return next; });

  const countPage = (pageId) => {
    const allPgs = [...PAGES, ...EMG_PAGES];
    const pg = allPgs.find(p => p.id === pageId);
    if (!pg) return { total: 0, done: 0 };
    let total = 0, done = 0;
    pg.sections.forEach(s => {
      const custom = getSectionCustom(pageId, s.title);
      const renames = custom.renames || {};
      const checkableOriginal = s.items.filter(i => !i.type).map(i => ({ ...i, custom: false, originalLabel: i.l, l: renames[i.l] ? renames[i.l].l : i.l }));
      const allCheckable = [...checkableOriginal, ...custom.added.map((i, ai) => ({ ...i, custom: true, addedIdx: ai }))];
      const ordered = custom.order && custom.order.length === allCheckable.length ? custom.order.map(i => allCheckable[i]).filter(Boolean) : allCheckable;
      ordered.forEach((it, idx) => {
        if (custom.removed.has(it.originalLabel || it.l) && !it.custom) return;
        const key = it.custom ? `${pageId}::${s.title}::CUSTOM::${idx}::${it.l}` : `${pageId}::${s.title}::${idx}::${it.originalLabel || it.l}`;
        total++;
        if (checked[key]) done++;
      });
    });
    return { total, done };
  };

  const masterCount = [...PAGES, ...EMG_PAGES].reduce((acc, p) => { const c = countPage(p.id); return { total: acc.total + c.total, done: acc.done + c.done }; }, { total: 0, done: 0 });
  const isEmgPage = EMG_PAGES.some(p => p.id === currentPage);
  const activePg = isEmgPage ? EMG_PAGES.find(p => p.id === currentPage) : PAGES.find(p => p.id === currentPage);

  // ── Inline rename ──────────────────────────────────────────────────────────
  const applyInlineRename = (pageId, sectionTitle, item, newLabel, newAction, addedIdx) => {
    const key = getSectionKey(pageId, sectionTitle);
    if (item.custom && addedIdx !== undefined) {
      setCustomItems(prev => {
        const existing = prev[key] || { removed: new Set(), added: [], order: null, renames: {} };
        const added = existing.added.map((it, i) => i === addedIdx ? { ...it, l: newLabel.trim(), a: newAction.trim().toUpperCase() } : it);
        const next = { ...prev, [key]: { ...existing, added } };
        saveCustomItems(next); return next;
      });
    } else {
      setCustomItems(prev => {
        const existing = prev[key] || { removed: new Set(), added: [], order: null, renames: {} };
        const renames = { ...(existing.renames || {}), [item.originalLabel || item.l]: { l: newLabel.trim(), a: newAction.trim().toUpperCase() } };
        const next = { ...prev, [key]: { ...existing, renames } };
        saveCustomItems(next); return next;
      });
    }
    setInlineEdit(null);
  };

  // ── Render checklist ───────────────────────────────────────────────────────
  const renderChecklist = (pg) => {
    if (!pg) return null;
    const isEmg = EMG_PAGES.some(p => p.id === pg.id);
    const emgMeta = isEmg ? EMG_PAGES.find(p => p.id === pg.id) : null;
    const accentColor = emgMeta ? emgMeta.color : "#4a9fe8";
    const pageCount = countPage(pg.id);
    const isComplete = pageCount.total > 0 && pageCount.done === pageCount.total;

    return (
      <div key={pg.id} style={{ animation: "fadeIn 0.15s ease" }}>
        {/* Page header */}
        <div style={{ background: lightMode ? "#dde2ee" : "#1a1f2a", borderBottom: `2px solid ${isEmg ? accentColor : "#4a9fe8"}`, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: isEmg ? accentColor : "#4a9fe8" }}>
              {pg.id === "approach" ? "APPROACH & LANDING" : pg.id === "engine_fail" ? "ENGINE FAILURES" : pg.id === "spin" ? "SPIN RECOVERY" : pg.id === "fires" ? "FIRES" : pg.id === "icing" ? "ICING" : pg.id === "electrical" ? "ELEC FAILURE" : pg.label || pg.id.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: lightMode ? "#607090" : "#7a8090", marginTop: 1 }}>
              {isEmg ? "MEMORY ITEMS FIRST — C172S" : "CESSNA 172S SKYHAWK"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 3, background: isComplete ? "rgba(61,190,108,0.15)" : "rgba(232,90,74,0.12)", border: `1px solid ${isComplete ? "#3dbe6c" : "#e85a4a"}`, color: isComplete ? "#3dbe6c" : "#e85a4a" }}>
              {isComplete ? `✓ COMPLETED ${pageCount.done}/${pageCount.total}` : `INCOMPLETE ${pageCount.done}/${pageCount.total}`}
            </div>
            <button onClick={() => resetPage(pg.id)} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "3px 8px", borderRadius: 3, cursor: "pointer", background: "transparent", color: lightMode ? "#607090" : "#7a8090", border: `1px solid ${lightMode ? "#a0a8c0" : "#2a3040"}` }}>↺</button>
          </div>
        </div>

        {/* Sections */}
        {pg.sections.map((section, si) => {
          const sectionKey = getSectionKey(pg.id, section.title);
          const custom = getSectionCustom(pg.id, section.title);
          const isEditing = editingSection === sectionKey;

          return (
            <div key={si}>
              {/* Section header */}
              {section.title && (
                <div style={{ padding: "10px 14px 9px", background: T.sectionBg, borderBottom: `2px solid ${isEmg ? accentColor : "#4a9fe8"}`, borderTop: `1px solid ${lightMode ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)"}`, borderLeft: `4px solid ${isEmg ? accentColor : "#4a9fe8"}`, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: isEmg ? accentColor : "#4a9fe8", lineHeight: 1.15 }}>{section.title}</div>
                  </div>
                  {!isEditing && (ttsActive && ttsActive.sectionKey === sectionKey ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={pauseResumeTTS} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "2px 8px", borderRadius: 3, cursor: "pointer", background: "rgba(232,200,74,0.15)", border: "1px solid #e8c84a", color: "#e8c84a" }}>{ttsPaused ? "▶ RESUME" : "⏸ PAUSE"}</button>
                      <button onClick={stopTTS} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "2px 8px", borderRadius: 3, cursor: "pointer", background: "rgba(232,90,74,0.12)", border: "1px solid #e85a4a", color: "#e85a4a" }}>■ STOP</button>
                    </div>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); const mi = getMergedItems(pg.id, section.title, section.items).filter(i => !custom.removed.has(i.originalLabel || i.l) || i.custom); startTTS(sectionKey, mi); }} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "3px 9px", borderRadius: 3, cursor: "pointer", background: "rgba(61,190,108,0.1)", border: "1px solid #3dbe6c", color: "#3dbe6c" }}>▶ READ</button>
                  ))}
                  <button onClick={(e) => { e.stopPropagation(); setEditingSection(isEditing ? null : sectionKey); setNewItemLabel(""); setNewItemAction(""); }} style={{ background: isEditing ? "rgba(232,200,74,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${isEditing ? "#e8c84a" : "rgba(74,159,232,0.3)"}`, borderRadius: 3, padding: "3px 8px", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, color: isEditing ? "#e8c84a" : "#4a6888", display: "flex", alignItems: "center", gap: 3, transition: "all 0.15s" }}>
                    <span style={{ fontSize: 11 }}>{isEditing ? "✕" : "✎"}</span>{isEditing ? "DONE" : "EDIT"}
                  </button>
                </div>
              )}

              {/* Edit mode panel */}
              {isEditing && (
                <div style={{ background: "#0d1018", border: "1px solid #2a3040", borderTop: "none", margin: "0 0 2px" }}>
                  <div style={{ padding: "6px 10px 4px", borderBottom: "1px solid #1a2030", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#e8c84a", letterSpacing: 1.5 }}>✎ EDIT MODE</span>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#4a5068", letterSpacing: 1 }}>TAP LABEL TO RENAME · × TO HIDE · DRAG TO REORDER</span>
                    </div>
                    {(custom.removed.size > 0 || custom.added.length > 0 || Object.keys(custom.renames || {}).length > 0) && (
                      <button onClick={() => { setCustomItems(prev => { const next = { ...prev }; delete next[sectionKey]; saveCustomItems(next); return next; }); }} style={{ background: "transparent", border: "1px solid #3a2020", borderRadius: 3, padding: "2px 8px", cursor: "pointer", fontFamily: "'Share Tech Mono', monospace", fontSize: 8, color: "#c85050", letterSpacing: 1, flexShrink: 0 }}>↺ RESET DEFAULT</button>
                    )}
                  </div>
                  {(() => {
                    const merged = getMergedItems(pg.id, section.title, section.items);
                    return merged.map((item, idx) => {
                      const isRemoved = !item.custom && custom.removed.has(item.originalLabel || item.l);
                      const itemEditKey = sectionKey + "::" + idx;
                      const isInlineEditing = inlineEdit && inlineEdit.key === itemEditKey;
                      return (
                        <div key={(item.custom ? "c-" : "o-") + (item.originalLabel || item.l) + idx}
                          draggable={!isInlineEditing}
                          onDragStart={() => { if (!isInlineEditing) dragRef.current = { fromIdx: idx, sectionKey }; }}
                          onDragOver={e => { e.preventDefault(); if (!isInlineEditing) e.currentTarget.style.borderTop = `2px solid ${accentColor}`; }}
                          onDragLeave={e => { e.currentTarget.style.borderTop = ""; }}
                          onDrop={e => { e.preventDefault(); e.currentTarget.style.borderTop = ""; if (dragRef.current.sectionKey === sectionKey) reorderSection(pg.id, section.title, dragRef.current.fromIdx, idx, merged.length); }}
                          onDragEnd={() => { dragRef.current = { fromIdx: null, sectionKey: null }; }}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderBottom: "1px solid rgba(42,48,64,0.4)", background: isInlineEditing ? "rgba(74,159,232,0.06)" : item.custom ? "rgba(61,190,108,0.04)" : isRemoved ? "rgba(232,90,74,0.05)" : "transparent", opacity: isRemoved ? 0.55 : 1, transition: "opacity 0.15s, border-top 0.1s, background 0.15s", cursor: "grab" }}
                        >
                          <span style={{ color: "#3a4050", fontSize: 10, cursor: "grab", flexShrink: 0 }}>⠿</span>
                          <button onClick={() => {
                            if (item.custom) { removeAddedItem(pg.id, section.title, item.addedIdx); return; }
                            const key = getSectionKey(pg.id, section.title);
                            setCustomItems(prev => {
                              const existing = prev[key] || { removed: new Set(), added: [], order: null, renames: {} };
                              const removed = new Set(existing.removed);
                              if (isRemoved) removed.delete(item.originalLabel || item.l); else removed.add(item.originalLabel || item.l);
                              const next = { ...prev, [key]: { ...existing, removed } };
                              saveCustomItems(next); return next;
                            });
                          }} style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 3, border: `1px solid ${isRemoved ? "#e85a4a" : "#2a3040"}`, background: isRemoved ? "rgba(232,90,74,0.1)" : "transparent", cursor: "pointer", color: isRemoved ? "#e85a4a" : "#4a5068", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {item.custom ? "×" : isRemoved ? "+" : "×"}
                          </button>
                          {isInlineEditing ? (
                            <div style={{ flex: 1, display: "flex", gap: 4 }}>
                              <input value={inlineEdit.l} onChange={e => setInlineEdit(p => ({ ...p, l: e.target.value }))} style={{ flex: 2, background: "#141820", border: "1px solid #4a9fe8", borderRadius: 3, padding: "3px 6px", fontFamily: "'Rajdhani',sans-serif", fontSize: 13, color: "#e8e4d8", outline: "none" }} />
                              <input value={inlineEdit.a} onChange={e => setInlineEdit(p => ({ ...p, a: e.target.value.toUpperCase() }))} style={{ flex: 1, background: "#141820", border: "1px solid #4a9fe8", borderRadius: 3, padding: "3px 6px", fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#e8c84a", outline: "none" }} />
                              <button onClick={() => applyInlineRename(pg.id, section.title, item, inlineEdit.l, inlineEdit.a, item.addedIdx)} style={{ background: "rgba(61,190,108,0.15)", border: "1px solid #3dbe6c", borderRadius: 3, padding: "3px 8px", cursor: "pointer", color: "#3dbe6c", fontSize: 11 }}>✓</button>
                              <button onClick={() => setInlineEdit(null)} style={{ background: "transparent", border: "1px solid #3a4050", borderRadius: 3, padding: "3px 6px", cursor: "pointer", color: "#7a8090", fontSize: 11 }}>✕</button>
                            </div>
                          ) : (
                            <>
                              <span onClick={() => !isRemoved && setInlineEdit({ key: itemEditKey, l: item.l, a: item.a || "" })} style={{ flex: 1, fontFamily: "'Rajdhani',sans-serif", fontSize: 13, color: item.custom ? "#3dbe6c" : isRemoved ? "#3a4050" : "#e8e4d8", cursor: isRemoved ? "default" : "text", textDecoration: isRemoved ? "line-through" : "none", borderBottom: isRemoved ? "none" : "1px dashed rgba(232,200,74,0.2)", paddingBottom: 1 }}>{item.l}</span>
                              <span onClick={() => !isRemoved && setInlineEdit({ key: itemEditKey, l: item.l, a: item.a || "" })} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: item.custom ? "#3dbe6c" : isRemoved ? "#3a4050" : "#e8c84a", cursor: isRemoved ? "default" : "text", borderBottom: isRemoved ? "none" : "1px dashed rgba(232,200,74,0.2)", paddingBottom: 1 }}>{item.a}</span>
                              {item.custom && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "#3dbe6c", opacity: 0.45 }}>★</span>}
                              {!item.custom && (custom.renames || {})[item.originalLabel || item.l] && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "#4a9fe8", opacity: 0.6 }}>✎</span>}
                            </>
                          )}
                        </div>
                      );
                    });
                  })()}
                  {/* Add item form */}
                  <div style={{ padding: "8px 10px", background: "#0a0d14", borderTop: "1px solid #1a2030" }}>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a9fe8", letterSpacing: 1.5, marginBottom: 6 }}>＋ ADD ITEM</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addCustomItem(pg.id, section.title); }} placeholder="Item label..." style={{ flex: 2, background: "#141820", border: "1px solid #2a3040", borderRadius: 3, color: "#e8e4d8", padding: "5px 8px", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 500, outline: "none" }} />
                      <input value={newItemAction} onChange={e => setNewItemAction(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addCustomItem(pg.id, section.title); }} placeholder="Action..." style={{ flex: 1, background: "#141820", border: "1px solid #2a3040", borderRadius: 3, color: "#e8c84a", padding: "5px 8px", fontSize: 11, fontFamily: "'Share Tech Mono',monospace", outline: "none" }} />
                      <button onClick={() => addCustomItem(pg.id, section.title)} style={{ background: newItemLabel.trim() ? "rgba(61,190,108,0.2)" : "rgba(42,48,64,0.4)", border: `1px solid ${newItemLabel.trim() ? "#3dbe6c" : "#2a3040"}`, borderRadius: 3, padding: "5px 10px", cursor: newItemLabel.trim() ? "pointer" : "default", fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, color: newItemLabel.trim() ? "#3dbe6c" : "#3a4050", letterSpacing: 1, transition: "all 0.15s", whiteSpace: "nowrap" }}>ADD ＋</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Normal item render */}
              {!isEditing && (() => {
                const merged = getMergedItems(pg.id, section.title, section.items);
                const nonCheckable = section.items.filter(i => i.type);
                return (
                  <>
                    {nonCheckable.map((item, idx) => {
                      if (item.type === "note") return <div key={"nc-" + idx} style={{ padding: "7px 16px 7px 16px", borderBottom: `1px solid ${T.itemBorder}`, borderLeft: "3px solid rgba(232,200,74,0.45)", background: T.noteBg }}><span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: T.noteColor, fontStyle: "italic" }}>★ {item.l}</span></div>;
                      if (item.type === "caution") return <div key={"nc-" + idx} style={{ padding: "7px 16px 7px 16px", borderBottom: `1px solid ${T.itemBorder}`, borderLeft: "3px solid rgba(232,90,74,0.6)", background: T.cautionBg }}><span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: T.cautionColor, fontStyle: "italic" }}>⚠ {item.l}</span></div>;
                      return null;
                    })}
                    {merged.map((item, idx) => {
                      if (custom.removed.has(item.originalLabel || item.l) && !item.custom) return null;
                      const key = item.custom ? `${pg.id}::${section.title}::CUSTOM::${idx}::${item.l}` : `${pg.id}::${section.title}::${idx}::${item.originalLabel || item.l}`;
                      const isDone = !!checked[key];
                      return (
                        <div key={key}>
                          <div className="check-item" onClick={() => toggleCheck(key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 14px", minHeight: 42, borderBottom: `1px solid ${T.itemBorder}`, cursor: "pointer", opacity: isDone ? T.itemCheckedOp : 1, background: isDone ? T.checkboxDone : "transparent", transition: "all 0.12s", userSelect: "none" }}>
                            <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 4, border: `2px solid ${isDone ? T.checkColor : T.checkboxBorder}`, background: isDone ? T.checkboxDone : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}>
                              {isDone && <svg viewBox="0 0 12 12" width={13} height={13} fill="none"><path d="M2 6l3 3 5-5" stroke={T.checkColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <span style={{ flex: 1, fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 600, color: T.itemLabel, textDecoration: isDone ? "line-through" : "none", lineHeight: 1.3 }}>{item.l}</span>
                            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: T.actionColor, letterSpacing: 0.5, textAlign: "right", flexShrink: 0, maxWidth: 160 }}>{item.a}</span>
                          </div>
                          {item.notepad && openNotepads.has(key) && (
                            <DrawingNotepad title={item.notepadLabel || "NOTEPAD"} footer={item.notepadFooter} storageKey={`notepad-${key}`} initialImage={notepadImages[`notepad-${key}`]} onSave={(dataUrl) => setNotepadImages(prev => ({ ...prev, [`notepad-${key}`]: dataUrl }))} onClose={() => setOpenNotepads(prev => { const next = new Set(prev); next.delete(key); return next; })} />
                          )}
                          {item.notepad && !openNotepads.has(key) && (
                            <button onClick={e => { e.stopPropagation(); setOpenNotepads(prev => { const next = new Set(prev); next.add(key); return next; }); }} style={{ display: "flex", alignItems: "center", gap: 5, margin: "0 10px 4px 36px", padding: "3px 10px", background: "rgba(74,159,232,0.07)", border: "1px solid rgba(74,159,232,0.25)", borderRadius: 4, cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a9fe8", letterSpacing: 1.5 }}>✎ {item.notepadLabel || "OPEN NOTEPAD"}</button>
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

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Rajdhani','Oswald',sans-serif", background: T.appBg, color: "#e8e4d8", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Oswald:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#2a3040;border-radius:2px;}
        .check-item:hover{background:rgba(74,159,232,0.07)!important;}
        .tab-btn:hover{background:rgba(255,255,255,0.05)!important;}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      `}</style>

      {/* HEADER */}
      <div style={{ background: T.headerBg, borderBottom: `2px solid ${T.headerBorder}`, flexShrink: 0 }}>
        {/* Top row */}
        <div style={{ padding: "8px 12px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <div style={{ flexShrink: 0, minWidth: 80 }}>
            {onBackToHangar && (
              <button onClick={onBackToHangar} style={{ display: "flex", alignItems: "center", gap: 5, background: lightMode ? "rgba(26,58,120,0.08)" : "rgba(232,200,74,0.07)", border: `1px solid ${lightMode ? "#1a3a78" : "#3a3010"}`, borderRadius: 5, padding: "4px 10px", cursor: "pointer", transition: "all 0.15s" }}>
                <svg viewBox="0 0 16 16" width={12} height={12} fill="none"><path d="M10 3L5 8l5 5" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, letterSpacing: 1.5, color: lightMode ? "#1a3a78" : "#e8c84a", textTransform: "uppercase" }}>HANGAR</span>
              </button>
            )}
          </div>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", display: "flex", alignItems: "baseline", gap: 8, pointerEvents: "none", whiteSpace: "nowrap" }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 4, color: lightMode ? "#0a2858" : "#e8c84a", textTransform: "uppercase", lineHeight: 1 }}>{aircraft ? aircraft.tail : "N12345"}</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: lightMode ? "#607090" : "#7a8090" }}>—</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 2, color: lightMode ? "#0a2858" : "#e8c84a", textTransform: "uppercase" }}>{aircraft ? aircraft.type : "Cessna 172S Skyhawk"}</div>
          </div>
          <button onClick={() => setLightMode(m => !m)} style={{ display: "flex", alignItems: "center", gap: 6, background: lightMode ? "rgba(26,106,176,0.12)" : "rgba(232,200,74,0.08)", border: `1px solid ${lightMode ? "#1a6ab0" : "#4a5068"}`, borderRadius: 20, padding: "4px 10px 4px 6px", cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ width: 34, height: 18, borderRadius: 9, background: lightMode ? "#1a6ab0" : "#2a3040", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 2, left: lightMode ? 18 : 2, width: 14, height: 14, borderRadius: "50%", background: lightMode ? "#fff" : "#e8c84a", transition: "left 0.2s, background 0.2s", boxShadow: lightMode ? "0 1px 3px rgba(0,0,0,0.3)" : "0 0 6px rgba(232,200,74,0.6)" }} />
            </div>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 1.5, color: lightMode ? "#1a6ab0" : "#7a8090", textTransform: "uppercase" }}>{lightMode ? "DAY" : "NIGHT"}</span>
          </button>
        </div>

        {/* Bottom row — timer | clocks | scratchpad */}
        <div style={{ padding: "5px 12px 7px", display: "flex", alignItems: "center", borderTop: "1px solid rgba(42,48,64,0.6)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "#7a8090", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>FLIGHT TIMER</div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: 2, lineHeight: 1, color: timerRunning ? "#3dbe6c" : timerSeconds > 0 ? "#e8c84a" : "#4a5068", textShadow: timerRunning ? "0 0 10px rgba(61,190,108,0.4)" : "none", transition: "color 0.2s", minWidth: 86 }}>{formatTimer(timerSeconds)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 5, marginTop: 14 }}>
              <button onClick={() => setTimerRunning(r => !r)} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", borderRadius: 3, cursor: "pointer", background: timerRunning ? "rgba(232,90,74,0.2)" : "rgba(61,190,108,0.2)", color: timerRunning ? "#e85a4a" : "#3dbe6c", border: `1px solid ${timerRunning ? "#e85a4a" : "#3dbe6c"}` }}>{timerRunning ? "⏸ STOP" : timerSeconds > 0 ? "▶ CONT" : "▶ START"}</button>
              <button onClick={() => { setTimerRunning(false); setTimerSeconds(0); }} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", borderRadius: 3, cursor: "pointer", background: "transparent", color: "#7a8090", border: "1px solid #2a3040" }}>↺ RESET</button>
            </div>
          </div>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 16 }}>
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
          <button onClick={() => setScratchpadOpen(true)} style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, background: lightMode ? "rgba(26,58,120,0.1)" : "rgba(232,200,74,0.07)", border: `1px solid ${lightMode ? "#1a3a78" : "#3a3010"}`, borderRadius: 5, padding: "6px 12px", cursor: "pointer", transition: "all 0.15s" }}>
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1.4" fill={lightMode ? "rgba(26,58,120,0.08)" : "rgba(232,200,74,0.08)"}/><line x1="6" y1="8" x2="18" y2="8" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/><line x1="6" y1="12" x2="18" y2="12" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/><line x1="6" y1="16" x2="13" y2="16" stroke={lightMode ? "#1a3a78" : "#e8c84a"} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/></svg>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: lightMode ? "#1a3a78" : "#e8c84a", letterSpacing: 1, textTransform: "uppercase" }}>SCRATCHPAD</span>
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left sidebar — normal pages */}
        <div style={{ width: 90, flexShrink: 0, background: T.leftSideBg, borderRight: `1px solid ${T.leftSideBorder}`, display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden" }}>
          {PAGES.map(pg => {
            const isActive = currentPage === pg.id;
            const count = countPage(pg.id);
            const isDone = count.total > 0 && count.done === count.total;
            return (
              <button key={pg.id} className="tab-btn" onClick={() => setCurrentPage(pg.id)} style={{ width: "100%", minHeight: 76, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, background: isActive ? T.leftTabActive : "transparent", outline: "none", borderTop: "none", borderRight: "none", borderBottom: `1px solid ${T.leftSideBorder}`, borderLeft: `3px solid ${isActive ? T.leftTabText : "transparent"}`, cursor: "pointer", padding: "10px 4px", transition: "all 0.12s" }}>
                <div style={{ fontSize: 26, color: isActive ? T.leftTabText : T.leftTabDim, lineHeight: 1 }}>{typeof pg.icon === "string" ? pg.icon : <span style={{ color: isActive ? T.leftTabText : T.leftTabDim }}>{pg.icon}</span>}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: isActive ? T.leftTabText : T.leftTabDim, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.2, textTransform: "uppercase" }}>{pg.label}</div>
                {count.total > 0 && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: isDone ? "#3dbe6c" : T.leftTabCount }}>{count.done}/{count.total}</div>}
              </button>
            );
          })}
          {/* MORE button — pinned to bottom of left sidebar */}
          <div style={{ marginTop: "auto" }}>
            <button className="tab-btn" onClick={() => setMoreOpen(true)} style={{ width: "100%", minHeight: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, background: "transparent", outline: "none", borderTop: `1px solid ${T.leftSideBorder}`, borderRight: "none", borderBottom: "none", borderLeft: "3px solid transparent", cursor: "pointer", padding: "8px 4px", transition: "all 0.12s" }}>
              <svg viewBox="0 0 20 20" width={22} height={22} fill="none">
                <line x1="3" y1="5" x2="17" y2="5" stroke="#8a5aaa" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="10" x2="17" y2="10" stroke="#8a5aaa" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="15" x2="17" y2="15" stroke="#8a5aaa" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: "#8a5aaa", textAlign: "center", lineHeight: 1.2, textTransform: "uppercase" }}>MORE</div>
            </button>
          </div>
        </div>

        {/* Center — checklist OR comm page */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: T.centerBg, position: "relative" }}>
          {/* Main content area — comm page gets height:100% fill; checklist scrolls */}
          <div style={{ flex: 1, overflow: currentPage === "comm" ? "hidden" : "auto", overflowX: "hidden", scrollbarWidth: "thin", display: "flex", flexDirection: "column" }}>
            {currentPage === "comm"
              ? <CommPage
                  aircraft={aircraft}
                  listening={commListening}
                  micStatus={commMicStatus}
                  rmsLevel={commRmsLevel}
                  transcript={commTranscript}
                  txLog={commTxLog}
                  watchdogState={commWatchdogState}
                  watchdogTx={commWatchdogTx}
                  ackCountdown={commAckCountdown}
                  onStartListen={commStartListening}
                  onStopListen={commStopListening}
                  onAckCall={commAckCall}
                  onReplay={commReplay}
                  replayActive={commReplayActive}
                  forceIfrMode={commForceIfr}
                  onToggleForce={() => setCommForceIfr(v => !v)}
                  ifrData={commIfrData}
                  onSetIfrData={setCommIfrData}
                />
              : renderChecklist(activePg)
            }
          </div>

          {/* ── PERFORMANCE DRAWERS — hidden on comm page, absolute overlay on checklist pages ── */}
          {currentPage !== "comm" && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 40, pointerEvents: "none", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 4px 4px 4px" }}>
            <div style={{ pointerEvents: "auto", display: "flex", flexDirection: "column", gap: "0px" }}>
              {[
                { key: "vspeeds", label: "V-SPEEDS · C172S",           color: "#3a9ad4", headerBg: "rgba(58,154,212,0.12)",  contentBg: "rgba(5,17,24,0.96)"  },
                { key: "perf",    label: "T/O & LANDING · C172S",      color: "#e8c84a", headerBg: "rgba(232,200,74,0.12)",  contentBg: "rgba(14,10,0,0.96)"  },
                { key: "climb",   label: "CLIMB PERFORMANCE · C172S",  color: "#3dbe6c", headerBg: "rgba(61,190,108,0.12)",  contentBg: "rgba(2,14,6,0.96)"   },
                { key: "cruise",  label: "CRUISE PERFORMANCE · C172S", color: "#3a9ad4", headerBg: "rgba(58,154,212,0.12)",  contentBg: "rgba(5,17,24,0.96)"  },
              ].map((acc, index) => {
                const isOpen = activeDrawer.has(acc.key);
                const toggle = () => setActiveDrawer(prev => { const next = new Set(prev); isOpen ? next.delete(acc.key) : next.add(acc.key); return next; });
                const isFirst = index === 0;
                return (
                  <div key={acc.key} style={{ display: "flex", flexDirection: "column", borderRadius: "6px", overflow: "hidden", marginTop: isFirst ? "0px" : "-6px", boxShadow: `0 -4px 10px ${acc.color}${isOpen ? "40" : "20"}, 0 4px 12px rgba(0,0,0,0.8)`, borderTop: `1px solid ${isOpen ? acc.color : `${acc.color}55`}`, borderLeft: `1px solid ${isOpen ? acc.color : `${acc.color}55`}`, borderRight: `1px solid ${isOpen ? acc.color : `${acc.color}55`}`, borderBottom: isOpen ? `1px solid ${acc.color}` : "none", backgroundColor: isOpen ? acc.contentBg : "rgba(13,17,22,0.65)", backdropFilter: "blur(4px)", position: "relative", zIndex: isOpen ? 50 : 40 + index, transition: "all 0.2s ease" }}>
                    {/* Header Row */}
                    <button onClick={toggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", cursor: "pointer", background: `linear-gradient(90deg, ${acc.headerBg} 0%, rgba(13,15,18,0.2) 60%, transparent 100%)`, backgroundColor: "transparent", border: "none", outline: "none", textAlign: "left", flexShrink: 0, userSelect: "none" }}>
                      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: acc.color, fontWeight: 700, display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(90deg)", transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}>▲</span>
                      <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 13, color: acc.color, fontWeight: 700, letterSpacing: 2, flex: 1 }}>{acc.label}</span>
                      {acc.key === "vspeeds" && vspeedEditing && <button onClick={e => { e.stopPropagation(); resetVspeeds(); }} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#e85a4a", border: "1px solid #e85a4a", borderRadius: 3, padding: "2px 8px", background: "transparent", cursor: "pointer", marginRight: 4 }}>↺ RESET</button>}
                      {acc.key === "vspeeds" && <button onClick={e => { e.stopPropagation(); setVspeedEditing(v => !v); }} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "3px 10px", borderRadius: 3, cursor: "pointer", background: vspeedEditing ? `${acc.color}25` : "transparent", color: vspeedEditing ? "#e8c84a" : acc.color, border: `1px solid ${vspeedEditing ? "#e8c84a" : acc.color}`, marginRight: 6 }}>{vspeedEditing ? "✓ DONE" : "✎ EDIT"}</button>}
                      {acc.key === "perf" && perfEditing && <button onClick={e => { e.stopPropagation(); resetPerfData(); }} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#e85a4a", border: "1px solid #e85a4a", borderRadius: 3, padding: "2px 8px", background: "transparent", cursor: "pointer", marginRight: 4 }}>↺ RESET</button>}
                      {acc.key === "perf" && <button onClick={e => { e.stopPropagation(); setPerfEditing(v => !v); }} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "3px 10px", borderRadius: 3, cursor: "pointer", background: perfEditing ? `${acc.color}25` : "transparent", color: perfEditing ? "#e8c84a" : acc.color, border: `1px solid ${perfEditing ? "#e8c84a" : acc.color}`, marginRight: 6 }}>{perfEditing ? "✓ DONE" : "✎ EDIT"}</button>}
                      {acc.key === "climb" && climbEditing && <button onClick={e => { e.stopPropagation(); resetClimbData(); }} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#e85a4a", border: "1px solid #e85a4a", borderRadius: 3, padding: "2px 8px", background: "transparent", cursor: "pointer", marginRight: 4 }}>↺ RESET</button>}
                      {acc.key === "climb" && <button onClick={e => { e.stopPropagation(); setClimbEditing(v => !v); }} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "3px 10px", borderRadius: 3, cursor: "pointer", background: climbEditing ? `${acc.color}25` : "transparent", color: climbEditing ? "#e8c84a" : acc.color, border: `1px solid ${climbEditing ? "#e8c84a" : acc.color}`, marginRight: 6 }}>{climbEditing ? "✓ DONE" : "✎ EDIT"}</button>}
                      {acc.key === "cruise" && cruiseEditing && <button onClick={e => { e.stopPropagation(); resetCruiseData(); }} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#e85a4a", border: "1px solid #e85a4a", borderRadius: 3, padding: "2px 8px", background: "transparent", cursor: "pointer", marginRight: 4 }}>↺ RESET</button>}
                      {acc.key === "cruise" && <button onClick={e => { e.stopPropagation(); setCruiseEditing(v => !v); }} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "3px 10px", borderRadius: 3, cursor: "pointer", background: cruiseEditing ? `${acc.color}25` : "transparent", color: cruiseEditing ? "#e8c84a" : acc.color, border: `1px solid ${cruiseEditing ? "#e8c84a" : acc.color}`, marginRight: 6 }}>{cruiseEditing ? "✓ DONE" : "✎ EDIT"}</button>}
                      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: acc.color, opacity: 0.8 }}>▲</span>
                    </button>
                    {/* Collapsible Content Area */}
                    <div style={{ maxHeight: isOpen ? "380px" : "0px", overflow: "hidden", transition: "max-height 0.3s cubic-bezier(0.25, 1, 0.5, 1)" }}>
                      <div style={{ maxHeight: "380px", overflowY: "auto", scrollbarWidth: "thin", padding: "8px 0 16px 0", borderTop: `1px solid ${acc.color}35` }}>
                        {/* V-SPEEDS content */}
                        {acc.key === "vspeeds" && vspeeds.map((group, gi) => (
                          <div key={gi} style={{ padding: "10px 14px 4px" }}>
                            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: acc.color, letterSpacing: 3, marginBottom: 6, opacity: 0.8 }}>{group.group.toUpperCase()}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, paddingBottom: 8 }}>
                              {group.items.map((item, ii) => (
                                <div key={ii} style={{ background: "rgba(10,22,30,0.6)", border: `1px solid ${acc.color}25`, borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
                                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                                    <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color: acc.color, fontWeight: 700 }}>{vspeedEditing ? <input value={item.code} onChange={e => updateVspeed(gi, ii, "code", e.target.value)} style={{ width: 40, background: "#141820", border: `1px solid ${acc.color}`, borderRadius: 2, padding: "1px 4px", fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: acc.color, outline: "none" }} /> : item.code}</span>
                                    <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#5a6578" }}>{item.unit}</span>
                                  </div>
                                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 32, fontWeight: 700, color: "#e8c84a", lineHeight: 1.1 }}>{vspeedEditing ? <input value={item.value} onChange={e => updateVspeed(gi, ii, "value", e.target.value)} style={{ width: 64, background: "#141820", border: "1px solid #e8c84a", borderRadius: 2, padding: "2px 4px", fontFamily: "'Oswald',sans-serif", fontSize: 22, color: "#e8c84a", outline: "none" }} /> : item.value}</div>
                                  <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, color: "#a0a8b5", lineHeight: 1.2 }}>{vspeedEditing ? <input value={item.desc} onChange={e => updateVspeed(gi, ii, "desc", e.target.value)} style={{ width: "100%", background: "#141820", border: "1px solid #2a3040", borderRadius: 2, padding: "1px 4px", fontFamily: "'Rajdhani',sans-serif", fontSize: 10, color: "#e8e4d8", outline: "none" }} /> : item.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {/* T/O & LANDING content */}
                        {acc.key === "perf" && perfData.map((section, si) => (
                          <div key={si} style={{ padding: "10px 14px 4px" }}>
                            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, fontWeight: 700, color: "#e8c84a", letterSpacing: 2, marginBottom: 2 }}>{section.group.toUpperCase()}</div>
                            {section.note && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "rgba(232,200,74,0.6)", marginBottom: 6 }}>{section.note}</div>}
                            <div style={{ border: "1px solid rgba(232,200,74,0.25)", borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
                              <div style={{ display: "grid", gridTemplateColumns: `repeat(${section.cols.length}, 1fr)`, background: "rgba(232,200,74,0.12)" }}>
                                {section.cols.map((col, ci) => <div key={ci} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#e8c84a", letterSpacing: 1, padding: "6px 10px", borderRight: ci < section.cols.length - 1 ? "1px solid rgba(232,200,74,0.15)" : "none", textTransform: "uppercase" }}>{col}</div>)}
                              </div>
                              {section.rows.map((row, ri) => (
                                <div key={ri} style={{ display: "grid", gridTemplateColumns: `repeat(${section.cols.length}, 1fr)`, background: ri % 2 === 0 ? "rgba(232,200,74,0.04)" : "transparent", borderTop: "1px solid rgba(232,200,74,0.1)" }}>
                                  {row.map((cell, ci) => <div key={ci} style={{ fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Share Tech Mono',monospace", fontSize: ci === 0 ? 13 : 12, fontWeight: ci === 0 ? 600 : 400, color: ci === 0 ? "#e8e4d8" : "#e8c84a", padding: "6px 10px", borderRight: ci < section.cols.length - 1 ? "1px solid rgba(232,200,74,0.08)" : "none" }}>{perfEditing ? <input value={cell} onChange={e => updatePerfCell(si, ri, ci, e.target.value)} style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #2a3040", fontFamily: "inherit", fontSize: "inherit", color: "inherit", outline: "none", padding: 0 }} /> : cell}</div>)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {/* CLIMB PERFORMANCE content */}
                        {acc.key === "climb" && climbData.map((section, si) => (
                          <div key={si} style={{ padding: "10px 14px 4px" }}>
                            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, fontWeight: 700, color: "#3dbe6c", letterSpacing: 2, marginBottom: 2 }}>{section.group.toUpperCase()}</div>
                            {section.note && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "rgba(61,190,108,0.6)", marginBottom: 6 }}>{section.note}</div>}
                            <div style={{ border: "1px solid rgba(61,190,108,0.25)", borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
                              <div style={{ display: "grid", gridTemplateColumns: `repeat(${section.cols.length}, 1fr)`, background: "rgba(61,190,108,0.12)" }}>
                                {section.cols.map((col, ci) => <div key={ci} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3dbe6c", letterSpacing: 1, padding: "6px 10px", borderRight: ci < section.cols.length - 1 ? "1px solid rgba(61,190,108,0.15)" : "none", textTransform: "uppercase" }}>{col}</div>)}
                              </div>
                              {section.rows.map((row, ri) => (
                                <div key={ri} style={{ display: "grid", gridTemplateColumns: `repeat(${section.cols.length}, 1fr)`, background: ri % 2 === 0 ? "rgba(61,190,108,0.04)" : "transparent", borderTop: "1px solid rgba(61,190,108,0.1)" }}>
                                  {row.map((cell, ci) => <div key={ci} style={{ fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Share Tech Mono',monospace", fontSize: ci === 0 ? 13 : 12, fontWeight: ci === 0 ? 600 : 400, color: ci === 0 ? "#e8e4d8" : "#3dbe6c", padding: "6px 10px", borderRight: ci < section.cols.length - 1 ? "1px solid rgba(61,190,108,0.08)" : "none" }}>{climbEditing ? <input value={cell} onChange={e => updateClimbCell(si, ri, ci, e.target.value)} style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #2a3040", fontFamily: "inherit", fontSize: "inherit", color: "inherit", outline: "none", padding: 0 }} /> : cell}</div>)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {/* CRUISE PERFORMANCE content */}
                        {acc.key === "cruise" && cruiseData.map((section, si) => (
                          <div key={si} style={{ padding: "10px 14px 4px" }}>
                            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, fontWeight: 700, color: acc.color, letterSpacing: 2, marginBottom: 2 }}>{section.group.toUpperCase()}</div>
                            {section.note && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "rgba(58,154,212,0.6)", marginBottom: 6 }}>{section.note}</div>}
                            <div style={{ border: `1px solid ${acc.color}35`, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
                              <div style={{ display: "grid", gridTemplateColumns: `repeat(${section.cols.length}, 1fr)`, background: "rgba(58,154,212,0.12)" }}>
                                {section.cols.map((col, ci) => <div key={ci} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: acc.color, letterSpacing: 1, padding: "6px 10px", borderRight: ci < section.cols.length - 1 ? "1px solid rgba(58,154,212,0.15)" : "none", textTransform: "uppercase" }}>{col}</div>)}
                              </div>
                              {section.rows.map((row, ri) => (
                                <div key={ri} style={{ display: "grid", gridTemplateColumns: `repeat(${section.cols.length}, 1fr)`, background: ri % 2 === 0 ? "rgba(58,154,212,0.04)" : "transparent", borderTop: "1px solid rgba(58,154,212,0.1)" }}>
                                  {row.map((cell, ci) => <div key={ci} style={{ fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Share Tech Mono',monospace", fontSize: ci === 0 ? 13 : 12, fontWeight: ci === 0 ? 600 : 400, color: ci === 0 ? "#e8e4d8" : acc.color, padding: "6px 10px", borderRight: ci < section.cols.length - 1 ? "1px solid rgba(58,154,212,0.08)" : "none" }}>{cruiseEditing ? <input value={cell} onChange={e => updateCruiseCell(si, ri, ci, e.target.value)} style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #2a3040", fontFamily: "inherit", fontSize: "inherit", color: "inherit", outline: "none", padding: 0 }} /> : cell}</div>)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
           </div>
          </div>}
        </div>
        {/* Right sidebar — emergency pages */}
        <div style={{ width: 90, flexShrink: 0, background: "#100c0c", borderLeft: "1px solid #281818", display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden" }}>
          {/* EMG label header */}
          <div style={{ width: "100%", padding: "6px 0 5px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #281818", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#5a3030", textTransform: "uppercase" }}>EMG</span>
          </div>
          {EMG_PAGES.map(pg => {
            const isActive = currentPage === pg.id;
            const count = countPage(pg.id);
            const isDone = count.total > 0 && count.done === count.total;
            return (
              <button key={pg.id} className="tab-btn" onClick={() => setCurrentPage(pg.id)} style={{ width: "100%", minHeight: 76, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, background: isActive ? `${pg.color}18` : "transparent", outline: "none", borderTop: "none", borderLeft: "none", borderBottom: "1px solid #281818", borderRight: `3px solid ${isActive ? pg.color : "transparent"}`, cursor: "pointer", padding: "10px 4px", transition: "all 0.12s" }}>
                <div style={{ color: isActive ? pg.color : pg.dimColor, transition: "color 0.12s" }}>{pg.icon(28)}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, fontWeight: 700, letterSpacing: 0.5, color: isActive ? pg.color : pg.dimColor, textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.2, textTransform: "uppercase" }}>{pg.label}</div>
                {count.total > 0 && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: isDone ? "#3dbe6c" : pg.dimColor }}>{count.done}/{count.total}</div>}
              </button>
            );
          })}
          {/* COMM — bottom of right sidebar */}
          <div style={{ marginTop: "auto" }}>
            <button
              className="tab-btn"
              onClick={() => setCurrentPage("comm")}
              style={{
                width: "100%", minHeight: 76, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 5,
                background: currentPage === "comm" ? "rgba(74,232,200,0.1)" : "transparent",
                outline: "none", borderTop: "1px solid #1a2a28", borderLeft: "none",
                borderBottom: "none",
                borderRight: `3px solid ${currentPage === "comm" ? "#4ae8c8" : "transparent"}`,
                cursor: "pointer", padding: "10px 4px", transition: "all 0.12s",
              }}
            >
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill={currentPage==="comm"?"#4ae8c8":"#2a4a48"}/>
                <path d="M12 12 Q8 7 4 3" stroke={currentPage==="comm"?"#4ae8c8":"#2a4a48"} strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 12 Q16 7 20 3" stroke={currentPage==="comm"?"#4ae8c8":"#2a4a48"} strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="12" y1="15" x2="12" y2="22" stroke={currentPage==="comm"?"#4ae8c8":"#2a4a48"} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:0.5, color: currentPage==="comm"?"#4ae8c8":"#2a4a48", textAlign:"center", lineHeight:1.2, textTransform:"uppercase" }}>
                COMM{"\n"}WATCH
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ flexShrink: 0, background: lightMode ? "#c8ccd8" : "#141820", borderTop: `1px solid ${T.leftSideBorder}`, padding: "4px 12px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: lightMode ? "#607090" : "#4a5068", letterSpacing: 1.5 }}>
          {masterCount.done}/{masterCount.total} ITEMS
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: lightMode ? "#607090" : "#4a5068", letterSpacing: 1.5 }}>
          {aircraft?.pohRef || "POH REV 2022-05"}
        </div>
      </div>

      {/* More refs overlay */}
      {moreOpen && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200, background: "rgba(8,10,14,0.96)", display: "flex", flexDirection: "column", animation: "fadeIn 0.15s ease" }}>
          <div style={{ background: "linear-gradient(135deg,#0a0c10,#141820)", borderBottom: "2px solid #c87ae8", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 20 20" width={16} height={16} fill="none">
                <line x1="2" y1="5" x2="18" y2="5" stroke="#c87ae8" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="2" y1="10" x2="18" y2="10" stroke="#c87ae8" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="2" y1="15" x2="18" y2="15" stroke="#c87ae8" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 3, color: "#c87ae8" }}>QUICK REFERENCE</span>
            </div>
            <button onClick={() => setMoreOpen(false)} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: "4px 14px", borderRadius: 4, cursor: "pointer", background: "rgba(232,90,74,0.1)", color: "#e85a4a", border: "1px solid #e85a4a" }}>✕ CLOSE</button>
          </div>
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div style={{ width: 160, flexShrink: 0, background: "#0a0c10", borderRight: "1px solid #2a1e3a", overflowY: "auto" }}>
              {MORE_REFS.map(ref => (
                <button key={ref.id} onClick={() => setActiveMoreRef(ref.id)} style={{ width: "100%", textAlign: "left", padding: "10px 12px", cursor: "pointer", background: activeMoreRef === ref.id ? `${ref.color}12` : "transparent", border: "none", borderLeft: `3px solid ${activeMoreRef === ref.id ? ref.color : "transparent"}`, borderBottom: "1px solid rgba(42,30,58,0.8)", transition: "all 0.12s" }}>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: activeMoreRef === ref.id ? ref.color : "#6a5878", textTransform: "uppercase", lineHeight: 1.3 }}>{ref.title}</div>
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", scrollbarWidth: "thin" }}>
              {(() => {
                const ref = MORE_REFS.find(r => r.id === activeMoreRef);
                if (!ref) return null;
                return (
                  <div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2, color: ref.color, textTransform: "uppercase" }}>{ref.title}</div>
                      {ref.note && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#6a5878", letterSpacing: 1, marginTop: 4 }}>{ref.note}</div>}
                    </div>
                    <div style={{ border: `1px solid ${ref.color}30`, borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${ref.cols.length}, 1fr)`, background: `${ref.color}18` }}>
                        {ref.cols.map((col, ci) => <div key={ci} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fontWeight: 700, color: ref.color, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 12px", borderRight: ci < ref.cols.length - 1 ? `1px solid ${ref.color}20` : "none" }}>{col}</div>)}
                      </div>
                      {ref.rows.map((row, ri) => (
                        <div key={ri} style={{ display: "grid", gridTemplateColumns: `repeat(${ref.cols.length}, 1fr)`, background: ri % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderTop: `1px solid ${ref.color}12` }}>
                          {row.map((cell, ci) => <div key={ci} style={{ fontFamily: ci === 0 ? "'Rajdhani',sans-serif" : "'Share Tech Mono',monospace", fontSize: ci === 0 ? 14 : 12, fontWeight: ci === 0 ? 600 : 400, color: ci === 0 ? "#e8e4d8" : ref.color, padding: "9px 12px", lineHeight: 1.3, borderRight: ci < ref.cols.length - 1 ? `1px solid ${ref.color}12` : "none" }}>{cell}</div>)}
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

      {/* Scratchpad overlay */}
      {scratchpadOpen && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200, background: "rgba(8,10,14,0.96)", display: "flex", flexDirection: "column", animation: "fadeIn 0.15s ease" }}>
          <div style={{ background: "linear-gradient(135deg,#0a0c10,#141820)", borderBottom: "2px solid #e8c84a", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 3, color: "#e8c84a", textTransform: "uppercase" }}>PILOT SCRATCHPAD</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", background: "#0d0f12", border: "1px solid #2a3040", borderRadius: 4, overflow: "hidden" }}>
                {["draw","type"].map(mode => (
                  <button key={mode} onClick={() => setScratchpadMode(mode)} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "5px 14px", cursor: "pointer", border: "none", background: scratchpadMode === mode ? "rgba(232,200,74,0.15)" : "transparent", color: scratchpadMode === mode ? "#e8c84a" : "#4a5068", borderRight: mode === "draw" ? "1px solid #2a3040" : "none", textTransform: "uppercase", transition: "all 0.15s" }}>{mode === "draw" ? "✏ DRAW" : "⌨ TYPE"}</button>
                ))}
              </div>
              <button onClick={() => setScratchpadOpen(false)} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: "5px 14px", borderRadius: 4, cursor: "pointer", background: "rgba(232,90,74,0.1)", color: "#e85a4a", border: "1px solid #e85a4a" }}>✕ CLOSE</button>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "10px 14px 14px" }}>
            {scratchpadMode === "draw" ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#050e09", border: "1px solid #1e3528", borderRadius: 6, overflow: "hidden" }}>
                <ScratchpadCanvas storageKey="scratchpad-main-canvas" />
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#4a5068", letterSpacing: 1.5 }}>✎ FREE TEXT · AUTO-SAVED · {scratchpadText.length} CHARS</div>
                <textarea value={scratchpadText} onChange={e => { setScratchpadText(e.target.value); try { window.storage.set("scratchpad-text", e.target.value); } catch {} }} placeholder="ATIS · CLEARANCES · FREQUENCIES · WEATHER · NOTAMS · PIREPS..." style={{ flex: 1, resize: "none", outline: "none", background: "#0a0e0a", border: "1px solid #1e3528", borderRadius: 6, color: "#e8e4d8", fontFamily: "'Share Tech Mono',monospace", fontSize: 14, lineHeight: 1.7, padding: "14px 16px", caretColor: "#e8c84a" }} />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => { setScratchpadText(""); try { window.storage.delete("scratchpad-text"); } catch {}; }} style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 12px", borderRadius: 3, cursor: "pointer", background: "transparent", color: "#6a3030", border: "1px solid #3a2020" }}>↺ CLEAR TEXT</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
