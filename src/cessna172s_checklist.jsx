// ─────────────────────────────────────────────────────────────────────────────
// CESSNA 172S SKYHAWK — Checklist Data & Component
// All PAGES, EMG_PAGES, reference data, helper components, and ChecklistApp
// live here. Import { ChecklistApp } into apex_kneeboard.jsx to use.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import { CommPage, NrstWidget } from "./comm_page.jsx";
import { Icon } from "./icons.jsx";

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
    { code: "VSO",  value: "48",     unit: "KIAS", desc: "Stall, Landing",  caution: true },
    { code: "VFE",  value: "85/110", unit: "K",    desc: "Full/10 Flap" },
  ]},
  { group: "Structural Limits", items: [
    { code: "VA",   value: "105",    unit: "KIAS", desc: "Maneuvering" },
    { code: "VNO",  value: "129",    unit: "KIAS", desc: "Max Structural",  caution: true },
    { code: "VNE",  value: "163",    unit: "KIAS", desc: "Never Exceed",    danger:  true },
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
    id: "light_gun", title: "ATC Light Gun Signals", color: "#4a9fe8",
    cols: ["Signal", "On Ground", "In Flight"],
    rows: [
      ["Steady GREEN",    "Cleared for takeoff",       "Cleared to land"],
      ["Flashing GREEN",  "Cleared to taxi",            "Return for landing"],
      ["Steady RED",      "Stop",                       "Give way — continue"],
      ["Flashing RED",    "Taxi clear of runway",       "Airport unsafe — do not land"],
      ["Flashing WHITE",  "Return to start",            "—"],
      ["Alternating R/G", "Exercise extreme caution",   "Exercise extreme caution"],
    ],
    signalDots: ["steady-green", "flash-green", "steady-red", "flash-red", "flash-white", "alt-rg"],
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
    id: "wx_minimums", title: "VFR Weather Minimums", color: "#4a9fe8",
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
    id: "airspeed_limits", title: "Airspeed Limits (§91.117)", color: "#4a9fe8",
    note: "§91.117 — No person may operate an aircraft at indicated airspeed in excess of these limits",
    cols: ["Rule", "Speed Limit"],
    rows: [
      ["Below 10,000 ft MSL",                          "250 KIAS max"],
      ["In Class B airspace",                          "250 KIAS max"],
      ["Below Class B shelf",                          "200 KIAS max"],
      ["In Class C or D surface area",                "200 KIAS max"],
      ["In tunnel / VFR corridor",                    "200 KIAS max"],
      ["Within 4 NM, 2500 AGL of primary Class C/D", "200 KIAS max"],
    ],
  },
  {
    id: "vfr_altitudes", title: "VFR Cruising Altitudes (§91.159)", color: "#4a9fe8",
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
    id: "airspace_entry", title: "Airspace Entry Requirements", color: "#4a9fe8",
    cols: ["Class", "Equipment Required", "Clearance"],
    rows: [
      ["A", "IFR-equipped, IFR flight plan",       "ATC clearance reqd"],
      ["B", "2-way radio, Mode C xpdr, ADS-B",     "Explicit ATC clearance"],
      ["C", "2-way radio, Mode C xpdr, ADS-B",     "ATC contact establ."],
      ["D", "2-way radio",                          "ATC contact establ."],
      ["E", "None for VFR",                        "None for VFR"],
      ["G", "None for VFR",                        "None"],
    ],
  },
  {
    id: "c172_engine", title: "C172S Engine Specifications", color: "#4a9fe8",
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
    id: "runway_markings", title: "Runway Markings & Lighting", color: "#4a9fe8",
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
      ["VASI — white over red",      "On glidepath"],
      ["VASI — white over white",   "Too high"],
      ["REIL (flashing lights)",    "Runway end identifier"],
      ["MALSR / ALSF",              "Approach light system — aids transition"],
    ],
  },
  {
    id: "fuel_oil", title: "C172S Fuel & Oil Quick Ref", color: "#4a9fe8",
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
    id: "weight_cg", title: "C172S Weight & CG Limits", color: "#4a9fe8",
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
    id: "tire_pressures", title: "C172S Tire Pressures", color: "#4a9fe8",
    note: "Check cold pressure only. Inspect for cuts, wear, and proper inflation before each flight.",
    cols: ["Tire", "Pressure", "Size / Notes"],
    rows: [
      ["Nose Gear",       "42 PSI", "5.00-5 (tube type)"],
      ["Main Gear (each)","28 PSI", "6.00-6 (tube type)"],
    ],
  },
  {
    id: "phonetic", title: "NATO Phonetic Alphabet", color: "#4a9fe8",
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
function ScratchpadCanvas({ storageKey, tool, penSize, penColor, clearRef }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPos = useRef(null);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const img = new Image();
          img.onload = () => {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.onerror = () => {};
          img.src = saved;
        }
      } catch {}
    }, 50);
    return () => clearTimeout(timer);
  }, [storageKey]);

  const persist = () => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        localStorage.setItem(storageKey, canvas.toDataURL());
      } catch {}
    }, 600);
  };

  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    try { localStorage.removeItem(storageKey); } catch {}
  }, [storageKey]);

  // Expose clear function to parent via ref
  useEffect(() => { if (clearRef) clearRef.current = clearCanvas; }, [clearRef, clearCanvas]);

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
      ctx.lineWidth = 28;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
    }
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastPos.current = pos;
  };
  const endDraw = (e) => { e.preventDefault(); drawingRef.current = false; lastPos.current = null; persist(); };

  return (
    <div className="efb-sp-canvas-wrap">
      <canvas
        ref={canvasRef}
        className="efb-sp-canvas"
        width={1800} height={1200}
        style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
      />
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
      try { localStorage.setItem(storageKey, dataUrl); } catch {}
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
    try { localStorage.removeItem(storageKey); } catch {}
    if (onSave) onSave(null);
  };

  const PEN_COLORS = ["var(--t-primary)","#4ae888","#4ab8e8","#e8c84a","#e85a4a"];
  const PEN_SIZES  = [1.5, 2.5, 4, 7];

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", overflow: "hidden", margin: "4px 0" }}>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "var(--bg-2)", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>

        {/* Title */}
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginRight: 4, textTransform: "uppercase" }}>
          {title}
        </span>

        {/* Pen size pickers */}
        <div style={{ display: "flex", gap: 3 }}>
          {PEN_SIZES.map(s => (
            <button key={s} onClick={() => setPenSize(s)} style={{
              width: 20, height: 20, borderRadius: "var(--r-sm)",
              border: `1px solid ${penSize === s ? "var(--accent-line)" : "var(--line)"}`,
              background: penSize === s ? "var(--accent-bg)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0,
            }}>
              <div style={{ width: s * 1.8, height: s * 1.8, borderRadius: "50%", background: "var(--t-secondary)" }}/>
            </button>
          ))}
        </div>

        {/* Color pickers */}
        <div style={{ display: "flex", gap: 3 }}>
          {PEN_COLORS.map(c => (
            <button key={c} onClick={() => setPenColor(c)} style={{
              width: 16, height: 16, borderRadius: "var(--r-sm)",
              border: `2px solid ${penColor === c ? "var(--t-primary)" : "transparent"}`,
              background: c, cursor: "pointer", padding: 0,
            }}/>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: "var(--line)" }}/>

        {/* CLR + Close */}
        <button onClick={clearCanvas} style={{
          fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.06em",
          background: "transparent", border: "1px solid var(--line)",
          color: "var(--t-tertiary)", padding: "2px 7px",
          borderRadius: "var(--r-sm)", cursor: "pointer",
        }}>CLR</button>
        <button onClick={onClose} style={{
          fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.06em",
          background: "transparent", border: "1px solid var(--line)",
          color: "var(--t-tertiary)", padding: "2px 7px",
          borderRadius: "var(--r-sm)", cursor: "pointer",
        }}>✕</button>
      </div>

      {/* ── Canvas area ── */}
      <div style={{ position: "relative", touchAction: "none", background: "var(--bg-inset)" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: 160, pointerEvents: "none" }} preserveAspectRatio="none">
          {[1,2,3,4,5,6].map(i => (
            <line key={i} x1="0" y1={i * 24} x2="100%" y2={i * 24} stroke="rgba(77,163,255,0.07)" strokeWidth="1"/>
          ))}
          <line x1="36" y1="0" x2="36" y2="160" stroke="rgba(255,107,107,0.12)" strokeWidth="1"/>
        </svg>
        <canvas
          ref={canvasRef} width={600} height={160}
          style={{ display: "block", width: "100%", height: 160, cursor: "crosshair", touchAction: "none" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
      </div>

      {/* ── Footer prompt ── */}
      {footer && (
        <div style={{ padding: "4px 10px", background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, color: "var(--t-quiet)", letterSpacing: "0.06em" }}>
            {footer}
          </span>
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
  const [spTool, setSpTool] = useState("pen");
  const [spPenSize, setSpPenSize] = useState(4);
  const [spPenColor, setSpPenColor] = useState("#e6ecf2");
  const spClearRef = useRef(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeMoreRef, setActiveMoreRef] = useState("light_gun");
  const [activeDrawer, setActiveDrawer] = useState(new Set());   // Set of open keys — multiple allowed
  const [pohTab, setPohTab] = useState("vspeeds");               // Active tab in POH overlay
  const [perfSubTab, setPerfSubTab] = useState("perf");     // unused but kept for compat
  const [lightMode, setLightMode] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.mode = lightMode ? "day" : "night";
  }, [lightMode]);
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
  const [commFreqTabTrigger, setCommFreqTabTrigger] = useState(0);
  const [commForceIfr,      setCommForceIfr]      = useState(false);
  const [commIfrData,       setCommIfrData]       = useState({ C:"",R:"",A:"",F:"",T:"" });
  const [commAtisData,      setCommAtisData]      = useState({ info:"",wind:"",altimeter:"",visibility:"",sky:"",caution:"" });
  const [commGndData,       setCommGndData]        = useState({ clearedTo:"",route:"",altitude:"",frequency:"",taxi:"",squawk:"" });
  const [commTaxiData,      setCommTaxiData]      = useState({ runway:"",route:"",holdShort:"",instructions:"" });
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

  // ── ATC SPEECH CORRECTION — runs on raw transcript before any parsing ────
  // The browser speech engine has no aviation context and maps spoken ATC
  // words to common English homophones. This pass corrects the most frequent
  // substitutions seen in practice before any downstream parser touches the text.
  const normalizeAtcSpeech = (text) => {
    let t = text;

    // ── PHONETIC ALPHABET MISHEARINGS ─────────────────────────────────────
    // Engine maps NATO phonetics to similar-sounding common words
    t = t.replace(/\bzillow\b/gi,      "zulu");
    t = t.replace(/\bzuloo\b/gi,       "zulu");
    t = t.replace(/\bzoolu\b/gi,       "zulu");
    t = t.replace(/\bjuliet\s+juliet\b/gi, "juliet"); // duplicate
    t = t.replace(/\bcharlie\s+charlie\b/gi, "charlie");
    t = t.replace(/\bfoxtail\b/gi,     "foxtrot");
    t = t.replace(/\bfox\s+trot\b/gi,  "foxtrot");
    t = t.replace(/\bwhiskey\s+tango\b/gi, "whiskey tango");
    t = t.replace(/\bnove?m?ber\b/gi,  "november");
    t = t.replace(/\bindigo\b/gi,      "india");
    t = t.replace(/\bkiller\b/gi,      "kilo");
    t = t.replace(/\bkilow\b/gi,       "kilo");
    t = t.replace(/\blima\s+bean\b/gi, "lima");
    t = t.replace(/\bpapa\s+bear\b/gi, "papa");
    t = t.replace(/\bsurrey\b/gi,      "sierra");
    t = t.replace(/\bsierra\s+nevada\b/gi, "sierra");
    t = t.replace(/\btango\s+down\b/gi,"tango");
    t = t.replace(/\buniform\s+code\b/gi, "uniform");
    t = t.replace(/\bvictor\s+hugo\b/gi, "victor");
    t = t.replace(/\bwhisky\b/gi,      "whiskey");
    t = t.replace(/\byankee\s+doodle\b/gi, "yankee");

    // ── WEATHER / ATIS KEYWORDS ────────────────────────────────────────────
    t = t.replace(/\bautomatic\s+weather\b/gi,    "automated weather");
    t = t.replace(/\bauto\s+weather\b/gi,         "automated weather");
    t = t.replace(/\bbroadcasting\s+system\b/gi,  "reporting system");
    t = t.replace(/\bobservation\s+system\b/gi,   "reporting system");

    // ── WIND SPEED AS TIME FORMAT ──────────────────────────────────────────
    // Speech engine formats single-digit wind speeds as times: "6" → "6:00"
    // Strip the colon and trailing zeros: "6:00" → "6", "12:00" → "12"
    t = t.replace(/\b(\d{1,2}):00\b/g, "$1");
    t = t.replace(/\b(\d{1,2}):(\d{2})\b/g, "$1$2"); // "6:15" → "615" edge case

    // ── GUST VARIANTS ─────────────────────────────────────────────────────
    t = t.replace(/\bguessing\b/gi,    "gusting");
    t = t.replace(/\bgusted\b/gi,      "gusting");
    t = t.replace(/\bjust\s+ing\b/gi,  "gusting");
    t = t.replace(/\btesting\b/gi,     "gusting");   // "testing 12" in wind context
    t = t.replace(/\bgas\s+tank\b/gi,  "gusting");   // "gas tank 15" misread
    t = t.replace(/\bgust\s+to\b/gi,   "gusting");

    // ── VISIBILITY DIGITS ──────────────────────────────────────────────────
    // Only fix these in direct visibility context to avoid corrupting other text
    t = t.replace(/\bvisibility\s+or\b/gi,  "visibility 4");
    t = t.replace(/\bvisibility\s+for\b/gi, "visibility 4");
    t = t.replace(/\bvisibility\s+to\b/gi,  "visibility 2");
    t = t.replace(/\bvisibility\s+too\b/gi, "visibility 2");
    t = t.replace(/\bvisibility\s+won\b/gi, "visibility 1");
    t = t.replace(/\bvisibility\s+ate\b/gi, "visibility 8");

    // ── ALTIMETER CONTEXT ──────────────────────────────────────────────────
    t = t.replace(/\baltimeter\s+to\b/gi,   "altimeter 2");  // "altimeter to niner 84" → "altimeter 2984"
    t = t.replace(/\baltimeter\s+too\b/gi,  "altimeter 2");
    t = t.replace(/\baltimeter\s+for\b/gi,  "altimeter 4");

    // ── ATC OPERATIONAL TERMS ─────────────────────────────────────────────
    t = t.replace(/\bclear\s+to\s+land\b/gi,       "cleared to land");
    t = t.replace(/\bclear\s+for\s+takeoff\b/gi,   "cleared for takeoff");
    t = t.replace(/\bclear\s+for\s+the\b/gi,       "cleared for the");
    t = t.replace(/\bclear\s+to\b/gi,              "cleared to");
    t = t.replace(/\bholds?\s+short\b/gi,          "hold short");
    t = t.replace(/\bline\s+up\s+and\s+weight\b/gi,"line up and wait");
    t = t.replace(/\btax\s+i\b/gi,                 "taxi");
    t = t.replace(/\btaxy\b/gi,                    "taxi");
    t = t.replace(/\brun\s+way\b/gi,               "runway");
    t = t.replace(/\brun-way\b/gi,                 "runway");
    t = t.replace(/\btower\s+control\b/gi,         "tower");
    t = t.replace(/\bdeparture\s+control\b/gi,     "departure");
    t = t.replace(/\bapproach\s+control\b/gi,      "approach");
    t = t.replace(/\bground\s+control\b/gi,        "ground");
    t = t.replace(/\bsquak\b/gi,                   "squawk");
    t = t.replace(/\bsquak\b/gi,                   "squawk");
    t = t.replace(/\btransponder\s+code\b/gi,      "squawk");
    t = t.replace(/\bsquat\b/gi,                   "squawk");   // very common mishearing
    t = t.replace(/\bsquad\b/gi,                   "squawk");
    t = t.replace(/\bsquak\b/gi,                   "squawk");

    // ── WIND DIRECTION SPOKEN AS FULL WORDS ───────────────────────────────
    t = t.replace(/\bwind\s+calm\b/gi,             "wind calm");
    t = t.replace(/\bwinds?\s+variable\b/gi,       "wind variable");

    // ── KNOTS / UNITS ──────────────────────────────────────────────────────
    t = t.replace(/\b(\d+)\s*knots?\b/gi,   "$1KT");
    t = t.replace(/\b(\d+)\s*not\b/gi,      "$1KT");   // "12 not" → "12KT"
    t = t.replace(/\b(\d+)\s*nautical\b/gi, "$1KT");
    t = t.replace(/\bstatute\s+miles?\b/gi, "SM");
    t = t.replace(/\bstat\s+miles?\b/gi,    "SM");

    // ── INFORMATION IDENTIFIER ────────────────────────────────────────────
    // Engine sometimes drops "information" and writes the letter as a word
    t = t.replace(/\binformation\s+zelda\b/gi,  "information Z");
    t = t.replace(/\binformation\s+echo\b/gi,   "information E");

    // ── SPEECH ENGINE ZERO INSERTION FIX ──────────────────────────────────
    // When pilot says "two niner four eight", the speech engine groups "two niner"
    // as the number 29 and then inserts a leading zero before the next group:
    // "two niner four eight" → "29048" instead of "2948".
    // Scope this ONLY to altimeter context to avoid corrupting squawk codes.
    t = t.replace(
      /\baltimeter\s+(2[89]|3[01])0(\d{2})\b/gi,
      (_, prefix, suffix) => `altimeter ${prefix}${suffix}`
    );

    // ── CLEARED / DIRECT VARIANTS ──────────────────────────────────────────
    t = t.replace(/\bcrude\s+direct\b/gi,    "cleared direct");
    t = t.replace(/\bcrude\b/gi,             "cleared");        // catch standalone
    t = t.replace(/\bcleared\s+direkt\b/gi,  "cleared direct");
    t = t.replace(/\bdirect\s+to\b/gi,       "direct");         // "direct to X" = "direct X" in ATC

    // ── TAXI & SURFACE MOVEMENT MISHEARINGS ───────────────────────────────
    // IMPORTANT: runway re-insertion for word-digit case must happen FIRST,
    // before "tax review" → "taxi via" replacement, so the lookahead still
    // sees the original "tax" keyword to anchor the match.
    // e.g. "one two right tax review" → "runway one two right taxi via"
    t = t.replace(
      /\b(zero|one|two|three|four|five|six|seven|eight|nine|niner)\s+(zero|one|two|three|four|five|six|seven|eight|nine|niner)?\s*(right|left|center)\s+(?=tax)/gi,
      (_, d1, d2, dir) => `runway ${d1} ${d2 ? d2 + " " : ""}${dir} `
    );

    // "taxi via" is the most critical phrase for taxi parsing — many variants
    t = t.replace(/\btax\s+review\b/gi,      "taxi via");   // most common mishearing
    t = t.replace(/\btax\s+via\b/gi,         "taxi via");
    t = t.replace(/\btaxi\s+the\b/gi,        "taxi via");
    t = t.replace(/\btaxi\s+buy\b/gi,        "taxi via");
    t = t.replace(/\btaxi\s+by\b/gi,         "taxi via");
    t = t.replace(/\btaxi\s+vie\b/gi,        "taxi via");
    t = t.replace(/\btaksi\b/gi,             "taxi");
    t = t.replace(/\btaxiway\s+via\b/gi,     "taxi via");

    // "hold short" variants
    t = t.replace(/\bold\s+short\b/gi,        "hold short");   // dropped H — most common
    t = t.replace(/\bhold\s+short\b/gi,       "hold short");   // already correct — keep
    t = t.replace(/\bhold\s+in\s+the\s+holding\s+area\b/gi, "hold position");
    t = t.replace(/\bholding\s+area\b/gi,     "hold position");
    t = t.replace(/\bhold\s+your\s+position\b/gi, "hold position");
    t = t.replace(/\bhold\s+at\b/gi,          "hold short");
    t = t.replace(/\bholds\s+short\b/gi,      "hold short");
    t = t.replace(/\bho\s+short\b/gi,         "hold short");   // slurred H

    // Run-up / advisory variants
    t = t.replace(/\bvalleys\s+on\b/gi,       "advise when");  // "advise on" → "valleys on"
    t = t.replace(/\bvalise\s+on\b/gi,        "advise when");
    t = t.replace(/\badvised\s+on\b/gi,       "advise when");
    t = t.replace(/\badvised\s+when\b/gi,     "advise when");
    t = t.replace(/\badvised\b/gi,            "advise");
    t = t.replace(/\badvise\s+on\b/gi,        "advise when");
    t = t.replace(/\bright\s+up\s+area\b/gi,  "run up area");  // "run up" → "right up"
    t = t.replace(/\brun-up\b/gi,             "run up");
    t = t.replace(/\brunup\b/gi,              "run up");
    t = t.replace(/\brun\s+up\s+complete\b/gi, "run up complete");
    t = t.replace(/\brun\s+up\s+area\b/gi,    "run up area");

    // Runway suffix spoken words — normalize before digit expansion
    t = t.replace(/\brunway\s+(\d{1,2})\s+right\b/gi,  "runway $1R");
    t = t.replace(/\brunway\s+(\d{1,2})\s+left\b/gi,   "runway $1L");
    t = t.replace(/\brunway\s+(\d{1,2})\s+center\b/gi, "runway $1C");
    // Re-insert "runway" when speech engine drops it entirely.
    // Must handle BOTH numeric digits ("12 right taxi via") AND
    // phonetic word digits ("one two right tax review") since normalizePhonetic
    // hasn't run yet at this point in the pipeline.
    // Numeric digit case — e.g. "12 right taxi via"
    t = t.replace(/\b(\d{1,2})\s+(right|left|center)\s+(?=taxi|tax\s|hold\s|via\s)/gi,
      "runway $1 $2 ");
    // Word digit case — e.g. "one two right tax review" or "two seven left taxi"
    t = t.replace(
      /\b(zero|one|two|three|four|five|six|seven|eight|nine|niner)\s+(zero|one|two|three|four|five|six|seven|eight|nine|niner)?\s*(right|left|center)\s+(?=taxi|tax\s|hold\s|via\s)/gi,
      "runway $1 $2 $3 ");
    t = t.replace(/\bwrong\s+way\b/gi, "runway");  // occasional mishearing

    // ── NINER ─────────────────────────────────────────────────────────────
    t = t.replace(/\bnine-r\b/gi,   "niner");
    t = t.replace(/\bnine\s+er\b/gi,"niner");

    return t;
  };

  // ── PHONETIC WORD → DIGIT/LETTER NORMALIZER ──────────────────────────────
  const PHONETIC_DIGITS = {
    "zero":"0","niner":"9","nine":"9","one":"1","two":"2","three":"3",
    "four":"4","five":"5","six":"6","seven":"7","eight":"8",
  };
  const PHONETIC_ALPHA_MAP = {
    "alpha":"A","bravo":"B","charlie":"C","delta":"D","echo":"E",
    "foxtrot":"F","golf":"G","hotel":"H","india":"I","juliett":"J",
    "juliet":"J","kilo":"K","lima":"L","mike":"M","november":"N",
    "oscar":"O","papa":"P","quebec":"Q","romeo":"R","sierra":"S",
    "tango":"T","uniform":"U","victor":"V","whiskey":"W","xray":"X",
    "yankee":"Y","zulu":"Z",
  };
  const normalizePhonetic = (text) => {
    // Step 1 — spoken frequency decimals: "one two niner point four" → "129.4"
    let t = text.replace(
      /\b((?:(?:zero|one|two|three|four|five|six|seven|eight|niner|nine)\s+)+)point\s+((?:(?:zero|one|two|three|four|five|six|seven|eight|niner|nine)\s*)+)/gi,
      (_, left, right) => {
        const l = left.trim().split(/\s+/).map(w => PHONETIC_DIGITS[w.toLowerCase()]||w).join("");
        const r = right.trim().split(/\s+/).map(w => PHONETIC_DIGITS[w.toLowerCase()]||w).join("");
        return `${l}.${r}`;
      }
    );
    // Step 2 — remaining digit words to numerals
    t = t.replace(/\b(zero|one|two|three|four|five|six|seven|eight|niner|nine)\b/gi,
      w => PHONETIC_DIGITS[w.toLowerCase()] || w
    );
    // Step 3 — phonetic alphabet letters in known ATC contexts only
    t = t.replace(
      /\b(information|with|squawk|ident|have)\s+(alpha|bravo|charlie|delta|echo|foxtrot|golf|hotel|india|juliett|juliet|kilo|lima|mike|november|oscar|papa|quebec|romeo|sierra|tango|uniform|victor|whiskey|xray|yankee|zulu)\b/gi,
      (_, prefix, letter) => `${prefix} ${PHONETIC_ALPHA_MAP[letter.toLowerCase()] || letter.toUpperCase()}`
    );
    return t;
  };

  // ── ARM STATE — independent per card, multi-arm supported ────────────────
  // "armed"  = listening, accumulating transcript buffer
  // "done"   = capture complete, raw text visible, fields populated
  // "idle"   = default
  const [atisArmState,  setAtisArmState]  = useState("idle"); // "idle"|"armed"|"done"
  const [taxiArmState,  setTaxiArmState]  = useState("idle");
  const [gndArmState,   setGndArmState]   = useState("idle");
  const [ifrArmState,   setIfrArmState]   = useState("idle");

  // Raw captured text buffers — displayed below each card header after capture
  const [atisRawText,   setAtisRawText]   = useState("");
  const [taxiRawText,   setTaxiRawText]   = useState("");
  const [gndRawText,    setGndRawText]    = useState("");
  const [ifrRawText,    setIfrRawText]    = useState("");

  // Accumulation refs — hold growing buffer between transcript callbacks
  const atisBufferRef  = useRef("");
  const taxiBufferRef  = useRef("");
  const gndBufferRef   = useRef("");
  const ifrBufferRef   = useRef("");

  // Silence timeout refs
  const atisSilenceRef  = useRef(null);
  const taxiSilenceRef  = useRef(null);
  const gndSilenceRef   = useRef(null);
  const ifrSilenceRef   = useRef(null);
  const atisArmStateRef = useRef("idle"); // ref mirror of atisArmState — safe inside timers & callbacks
  const taxiArmStateRef = useRef("idle"); // ref mirror of taxiArmState
  const gndArmStateRef  = useRef("idle"); // ref mirror of gndArmState
  const ifrArmStateRef  = useRef("idle"); // ref mirror of ifrArmState

  // Parse + commit a completed buffer to a card.
  // Always resets ref mirrors so the STOP button never gets orphaned.
  const commitAtisBuffer = useCallback(() => {
    const buf = atisBufferRef.current.trim();
    atisArmStateRef.current = buf ? "done" : "idle";
    if (!buf) { setAtisArmState("idle"); return; }
    setAtisRawText(buf);
    setCommAtisData(commParseAtis(buf));
    setAtisArmState("done");
    atisBufferRef.current = "";
  }, []);

  const commitTaxiBuffer = useCallback(() => {
    const buf = taxiBufferRef.current.trim();
    taxiArmStateRef.current = buf ? "done" : "idle";
    if (!buf) { setTaxiArmState("idle"); return; }
    setTaxiRawText(buf);
    setCommTaxiData(commParseTaxi(buf));
    setTaxiArmState("done");
    taxiBufferRef.current = "";
  }, []);

  const commitGndBuffer = useCallback(() => {
    const buf = gndBufferRef.current.trim();
    gndArmStateRef.current = buf ? "done" : "idle";
    if (!buf) { setGndArmState("idle"); return; }
    setGndRawText(buf);
    setCommGndData(commParseGround(buf));
    setGndArmState("done");
    gndBufferRef.current = "";
  }, []);

  const commitIfrBuffer = useCallback(() => {
    const buf = ifrBufferRef.current.trim();
    ifrArmStateRef.current = buf ? "done" : "idle";
    if (!buf) { setIfrArmState("idle"); return; }
    setIfrRawText(buf);
    setCommIfrData(commParseCraft(buf));
    setIfrArmState("done");
    ifrBufferRef.current = "";
  }, []);

  // ARM toggle handlers — read atisArmStateRef (not atisArmState) so STOP always
  // fires immediately regardless of React render timing or the MIN_RECORD window.
  const handleArmAtis = useCallback(() => {
    if (atisArmStateRef.current === "armed") {
      clearTimeout(atisSilenceRef.current);
      atisArmStateRef.current = "idle";
      commitAtisBuffer();
    } else {
      atisBufferRef.current   = "";
      setAtisRawText("");
      atisArmStateRef.current = "armed";
      setAtisArmState("armed");
    }
  }, [commitAtisBuffer]);

  const handleArmTaxi = useCallback(() => {
    if (taxiArmStateRef.current === "armed") {
      clearTimeout(taxiSilenceRef.current);
      taxiArmStateRef.current = "idle";
      commitTaxiBuffer();
    } else {
      taxiBufferRef.current   = "";
      setTaxiRawText("");
      taxiArmStateRef.current = "armed";
      setTaxiArmState("armed");
    }
  }, [commitTaxiBuffer]);

  const handleArmGnd = useCallback(() => {
    if (gndArmStateRef.current === "armed") {
      clearTimeout(gndSilenceRef.current);
      gndArmStateRef.current = "idle";
      commitGndBuffer();
    } else {
      gndBufferRef.current   = "";
      setGndRawText("");
      gndArmStateRef.current = "armed";
      setGndArmState("armed");
    }
  }, [commitGndBuffer]);

  const handleArmIfr = useCallback(() => {
    if (ifrArmStateRef.current === "armed") {
      clearTimeout(ifrSilenceRef.current);
      ifrArmStateRef.current = "idle";
      commitIfrBuffer();
    } else {
      ifrBufferRef.current   = "";
      setIfrRawText("");
      ifrArmStateRef.current = "armed";
      setIfrArmState("armed");
    }
  }, [commitIfrBuffer]);
  
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

const commParseCraft = (text) => {
    // CRAFT = Clearance limit, Route, Altitude, Frequency, Transponder
    const r = { C:"", R:"", A:"", F:"", T:"" };
    const t = normalizePhonetic(text);

    // C — Clearance limit (destination / cleared to)
    const dest = t.match(/cleared\s+(?:to\s+)?([A-Z][A-Z0-9\s]{2,20}?)(?:\s+via|\s+as\s+filed|\s+climb|\s+maintain|,)/i);
    if (dest) r.C = dest[1].trim();
    else if (/cleared\s+as\s+filed/i.test(t)) r.C = "AS FILED";
    else if (/cleared\s+direct/i.test(t)) {
      const dir = t.match(/cleared\s+direct\s+([A-Z][A-Z0-9\s]{2,20}?)(?:\s+via|\s+climb|\s+maintain|,|$)/i);
      if (dir) r.C = `DIRECT ${dir[1].trim()}`;
    }

    // R — Route
    const via = t.match(/via\s+([A-Z0-9\s,]+?)(?:\s+maintain|\s+climb|\s+expect|$)/i);
    if (via) r.R = via[1].trim();
    else if (/radar\s+vectors/i.test(t)) r.R = "RADAR VECTORS";
    else if (/as\s+filed/i.test(t)) r.R = "AS FILED";
    else if (/direct/i.test(t)) r.R = "DIRECT";

    // A — Altitude (initial + expect)
    const alt = t.match(/(?:maintain|climb\s+(?:and\s+)?maintain|climb\s+to)\s+(\d[\d,]+\s*(?:feet|ft)?)/i);
    if (alt) r.A = alt[1].replace(/,/g,"").trim();
    const exp = t.match(/expect\s+(\d[\d,]+)(?:\s+(\d+)\s+minutes?\s+after\s+(?:departure|takeoff))?/i);
    if (exp) {
      const expAlt = exp[1].replace(/,/g,"");
      const expMin = exp[2] ? ` / ${exp[2]} MIN AFT DEP` : "";
      r.A = (r.A ? r.A + " / EXP " : "EXP ") + expAlt + expMin;
    }

    // F — Departure frequency
    const frq = t.match(/(?:contact|departure|frequency)\s+(\d{2,3}\.\d+)/i);
    if (frq) r.F = frq[1];

    // T — Transponder / squawk
    const sqk = t.match(/squawk\s+(\d{4})/i);
    if (sqk) r.T = `SQUAWK ${sqk[1]}`;

    return r;
  };

const commParseTaxi = (text) => {
    const r = { runway:"", route:"", holdShort:"", instructions:"" };
    // normalizePhonetic converts digit words → numerals, then tFreq adds frequency/tense fixes
    const t = normalizePhonetic(text);

    // Normalize "advised tower on 12298" → "advise tower on 122.98"
    // Speech engine drops the decimal in frequencies after "on" or "tower on"
    const tFreq = t
      .replace(/\badvised\b/gi, "advise")  // past tense → present
      // Merge spaced single digits that belong together: "1 2" → "12" (only in runway context)
      .replace(/\b(\d)\s+(\d)\b(?=\s+(?:left|right|center|charlie|romeo|lima))/gi, "$1$2")
      .replace(/\b(tower\s+on|on\s+frequency|contact\s+tower\s+on|advise\s+tower\s+on)\s+(\d{3})(\d{2})\b/gi,
        (_, prefix, a, b) => `${prefix} ${a}.${b}`)  // 12298 → 122.98
      .replace(/\b(tower\s+on|on\s+frequency|contact\s+tower\s+on|advise\s+tower\s+on)\s+(\d{2})(\d{2})\b/gi,
        (_, prefix, a, b) => `${prefix} ${a}.${b}`); // 1298 → 12.98 edge case

    // Expand phonetic runway suffixes: charlie→C, romeo→R, lima→L
    const RUNWAY_PHONETIC = { charlie:"C", romeo:"R", lima:"L", left:"L", right:"R", center:"C" };
    const expandRunway = (s) => s.replace(
      /\b(\d{1,2})\s+(charlie|romeo|lima|left|right|center)\b/gi,
      (_, num, suffix) => num + (RUNWAY_PHONETIC[suffix.toLowerCase()]||suffix.toUpperCase())
    );
    const tRwy = expandRunway(tFreq);

    // Expand phonetic taxiway names: "Yankee 1" → "Y1", "Bravo" → "B"
    const TAXIWAY_PHONETIC = {
      alpha:"A",bravo:"B",charlie:"C",delta:"D",echo:"E",foxtrot:"F",
      golf:"G",hotel:"H",india:"I",juliet:"J",juliett:"J",kilo:"K",
      lima:"L",mike:"M",november:"N",oscar:"O",papa:"P",quebec:"Q",
      romeo:"R",sierra:"S",tango:"T",uniform:"U",victor:"V",
      whiskey:"W",xray:"X",yankee:"Y",zulu:"Z",
    };
    // Expand each phonetic name+optional digit, then insert " > " between adjacent
    // single-letter taxiway tokens so "Yankee Yankee 1 Bravo Hotel" → "Y > Y1 > B > H"
    const expandTaxiways = (s) => {
      // Step 1: replace each phonetic+digit with its letter(+digit)
      let expanded = s.replace(
        /\b(alpha|bravo|charlie|delta|echo|foxtrot|golf|hotel|india|juliett?|kilo|lima|mike|november|oscar|papa|quebec|romeo|sierra|tango|uniform|victor|whiskey|xray|yankee|zulu)\s*(\d*)\b/gi,
        (_, name, num) => "__TW__" + (TAXIWAY_PHONETIC[name.toLowerCase()]||name.toUpperCase()) + num + "__TW__"
      );
      // Step 2: merge adjacent taxiway tokens separated by commas/spaces into " > " list
      expanded = expanded.replace(/__TW__([A-Z0-9]+)__TW__(\s*[,]?\s*)(?=__TW__)/g, "$1 > ");
      expanded = expanded.replace(/__TW__([A-Z0-9]+)__TW__/g, "$1");
      return expanded;
    };

    // ── RUNWAY — extract ONLY from the "taxi to runway X" phrase, NOT from hold short ──
    // Strategy: find the runway designation that appears BEFORE "hold short" in the text.
    // Also handle "runway 12R taxi via..." pattern where runway comes before the verb.
    // We scan for all runway matches and take the first one (closest to start of transmission).
    const allRwyMatches = [...tRwy.matchAll(/(?:runway\s+|rwy\s+)(\d{1,2}[LRC])/gi)];
    const hsPos = tRwy.search(/hold\s+short/i);
    // Take the first runway match that appears BEFORE "hold short"
    const destRwy = allRwyMatches.find(m => hsPos === -1 || m.index < hsPos);
    if (destRwy) r.runway = `RWY ${destRwy[1].toUpperCase()}`;

    // ── ROUTE — "via X, Y, Z" up to "hold short" or instructions ──
    // Use tRwy (which went through normalizePhonetic + expandRunway) so digit
    // words like "one" are already "1" before taxiway expansion runs.
    // Stop pattern also covers pre-normalization forms in case any slip through.
    const viaMatch = tRwy.match(/via\s+(.+?)(?:\s+hold\s+short|\s+hold\s+position|\s+old\s+short|\s+run\s+up|\s+advise|\s+contact|,?\s*advise|$)/i);
    if (viaMatch) {
      let raw = viaMatch[1].replace(/,/g, " ").trim();
      r.route = expandTaxiways(raw).replace(/\s+/g," ").trim().toUpperCase();
    }

    // ── HOLD SHORT — capture full phrase, not just the keyword ──
    // Priority: runway number > full descriptive phrase > bare keyword
    const hsMatch = tRwy.match(/hold\s+short\s+(?:of\s+)?(?:runway\s+)?(\d{1,2}[LRC])/i);
    if (hsMatch) {
      r.holdShort = `RWY ${hsMatch[1].toUpperCase()}`;
    } else {
      // No runway number — capture descriptive phrase after "hold short"
      // e.g. "hold short in the run up area" → "HOLD SHORT IN THE RUN UP AREA"
      // Stop before any instruction keywords
      const hsPhrase = tFreq.match(/hold\s+short\s+((?:in\s+the\s+|at\s+the\s+|in\s+)?[a-z\s]+?)(?:\s+advise|\s+contact|\s+and\s+advise|\s+run\s+up\s+complete|\s+when\s+ready|[,.]|$)/i);
      if (hsPhrase && hsPhrase[1].trim().length > 1 && !/^and$/i.test(hsPhrase[1].trim())) {
        r.holdShort = `HOLD SHORT ${hsPhrase[1].trim().toUpperCase()}`;
      } else if (/hold\s+position/i.test(tFreq)) {
        r.holdShort = "HOLD POSITION";
      } else {
        r.holdShort = "HOLD SHORT";
      }
    }

    // ── INSTRUCTIONS — contact/advise tower, run up, follow company ──
    // Don't re-capture run up area in instructions if it's already in holdShort
    const instPatterns = [
      /advise\s+tower\s+on\s+[\d.]+/i,                                // advise tower on 122.98
      /contact\s+(?:tower|ground|approach|departure)[^,.]*/i,          // contact tower ...
      /advise\s+when\s+(?:run\s*up\s*complete|ready|airborne)[^,.]*/i, // advise when run up complete
      /advise\s+(?:run\s*up\s*complete|ready|airborne)[^,.]*/i,        // advise run up complete
      ...(!r.holdShort.includes("RUN UP") ? [/run\s*up\s*area/i] : []), // only if not in holdShort
      /follow\s+(?:company|traffic|the)[^,.]*/i,
      /monitor\s+(?:tower|ground)[^,.]*/i,
      /when\s+ready[^,.]*/i,
    ];
    const rawInstMatches = instPatterns
      .map(rx => { const m = tFreq.match(rx); return m ? m[0].trim() : null; })
      .filter(Boolean);
    // Deduplicate: remove any match that is a substring of a longer match
    const instMatches = rawInstMatches.filter(
      (a, _, arr) => !arr.some(b => b !== a && b.toLowerCase().includes(a.toLowerCase()))
    );
    if (instMatches.length) r.instructions = instMatches.join(" · ").toUpperCase();

    return r;
  };

const commParseAtis = (text) => {
    const r = { info:"", wind:"", altimeter:"", visibility:"", sky:"", caution:"" };
    const t = normalizePhonetic(text);

    // Information identifier — broadcast: "information B" or pilot readback:
    // "with B", "we have B", "have information B"
    const infoFull = t.match(/information\s+([A-Z])\b/i);
    const infoWith = t.match(/\bwith\s+([A-Z])\b/i);
    const infoHave = t.match(/\bwe\s+have\s+([A-Z])\b/i) || t.match(/\bhave\s+information\s+([A-Z])\b/i);
    const infoMatch = infoFull || infoWith || infoHave;
    if (infoMatch) r.info = infoMatch[1].toUpperCase();

    // Wind — after normalizeAtcSpeech all gust homophones are already corrected.
    // Strip colons from time-formatted numbers: "6:00" → "600" then trim to 2 digits
    // since the speech engine formats wind speeds like times (e.g. "6:00" for "6").
    const tWind = t.replace(/\b(\d+):(\d{2})\b/g, (_, h, m) => m === "00" ? h : h + m);
    if (/wind\s+calm/i.test(tWind)) {
      r.wind = "CALM";
    } else {
      const wind = tWind.match(/wind\s+(\d{1,3})\s+(?:at\s+)?(\d{1,3})(?:\s+(?:gusts?|gusting|gust)\s+(\d{1,3}))?/i);
      if (wind) r.wind = wind[3] ? `${wind[1]}° AT ${wind[2]} GUSTING ${wind[3]}` : `${wind[1]}° AT ${wind[2]}KT`;
    }

    // Altimeter — find ALL matches and score them, prefer the cleanest 4-digit value.
    // When the broadcast is read twice, the parser would otherwise pick the last
    // (potentially garbled) match. Instead we score each candidate: a clean 4-digit
    // value beats a 5-digit error or a 3-digit truncation.
    const altmRx = /altimeter\s+(\d{2,5}(?:\.\d+)?)/gi;
    let altmMatch, bestAltm = null, bestScore = -1;
    while ((altmMatch = altmRx.exec(t)) !== null) {
      let raw = altmMatch[1].replace(/\./g,"");
      let score = 0;
      if (raw.length === 4) score = 3;       // perfect — clean 4 digits
      else if (raw.length === 3) score = 2;  // recoverable 3-digit
      else if (raw.length === 5) score = 1;  // noisy 5-digit, trim needed
      else score = 0;
      if (score > bestScore) { bestScore = score; bestAltm = altmMatch[1]; }
    }
    if (bestAltm) {
      let raw = bestAltm.replace(/\./g,"");
      if (raw.length === 5) {
        // Check if this is the "29048" zero-insertion pattern:
        // digits 0-1 are in altimeter range (28-31) and digit 2 is 0
        const prefix = parseInt(raw.slice(0,2));
        if (prefix >= 28 && prefix <= 31 && raw[2] === "0") {
          raw = raw.slice(0,2) + raw.slice(3); // remove the inserted zero → 2948
        } else {
          raw = raw.slice(0, 4); // fallback: trim last digit
        }
      }
      if (raw.length === 3) {
        const n = parseInt(raw);
        // "298" → pilot said "two niner eight" dropping the last digit → "2980" or "2985"
        // Best we can do is append 0 as the missing digit and let pilot correct manually
        if (n >= 280 && n <= 319) raw = raw + "0"; // e.g. 298 → 2980
        else if (n >= 900 && n <= 999) raw = "2" + raw; // 9XX → 29XX (three spoken digits)
        else if (n >= 800 && n <= 899) raw = "2" + raw;
        else if (n >= 100 && n <= 199) raw = "3" + raw;
        else raw = "29" + raw.slice(1);
      }
      r.altimeter = raw.length === 4 && !bestAltm.includes(".")
        ? `${raw.slice(0,2)}.${raw.slice(2)}`
        : bestAltm;
    }

    // Visibility — after normalizeAtcSpeech homophones are already corrected
    const vis = t.match(/visibility\s+(\d+(?:\.\d+)?)/i);
    if (vis) r.visibility = `${vis[1]}SM`;

    // Sky condition
    if (/(?:sky\s+clear|cavok|clear\s+below)/i.test(t)) {
      r.sky = "SKY CLEAR";
    } else {
      const sky = t.match(/(few|scattered|broken|overcast)\s+(?:clouds?\s+)?(?:at\s+)?(\d[\d,]+)/i);
      if (sky) r.sky = `${sky[1].toUpperCase()} ${parseInt(sky[2].replace(/,/g,"")).toLocaleString()}`;
    }

    // Caution / NOTAMs — capture anything after "caution" to end of sentence or
    // next keyword. Common in ATIS: "caution construction on taxiway alpha",
    // "caution birds in vicinity", "caution drone activity"
    const cautionMatch = t.match(/caution\s+([^.!?]+?)(?:\s+(?:wind|altimeter|visibility|sky|information|automated|notice|notam|$))/i)
      || t.match(/caution\s+(.+?)(?:[.!?]|$)/i);
    if (cautionMatch) r.caution = cautionMatch[1].trim().toUpperCase();

    return r;
  };

const commParseGround = (text) => {
    const r = { clearedTo:"", route:"", altitude:"", frequency:"", taxi:"", squawk:"" };
    const t = normalizePhonetic(text);

    // Cleared to destination
    const dest = t.match(/cleared\s+(?:to\s+)?([A-Z][A-Za-z\s]{2,30}?)(?:\s+via|\s+as\s+filed|\s+climb|\s+maintain|,|\s+runway|\s+taxi)/i);
    if (dest) r.clearedTo = dest[1].trim().toUpperCase();
    else if (/cleared\s+as\s+filed/i.test(t)) r.clearedTo = "AS FILED";

    // Route: "via [departure]", "radar vectors", "as filed"
    const via = t.match(/via\s+([A-Z0-9\s,\.]+?)(?:\s+maintain|\s+climb|\s+expect|\s+squawk|,|$)/i);
    if (via) r.route = via[1].trim().toUpperCase();
    else if (/radar\s+vectors/i.test(t)) r.route = "RADAR VECTORS";
    else if (/as\s+filed/i.test(t)) r.route = "AS FILED";

    // Altitude: "climb and maintain 5000" / "expect 7000 6 minutes after departure"
    const alt = t.match(/(?:maintain|climb\s+(?:and\s+)?maintain|climb\s+to)\s+(\d[\d,]+)/i);
    if (alt) r.altitude = alt[1].replace(/,/g,"");
    // Capture full expect phrase including optional time qualifier
    const exp = t.match(/expect\s+(\d[\d,]+)(?:\s+(\d+)\s+minutes?\s+after\s+(?:departure|takeoff))?/i);
    if (exp) {
      const expAlt = exp[1].replace(/,/g,"");
      const expMin = exp[2] ? ` / ${exp[2]} MIN AFT DEP` : "";
      r.altitude = (r.altitude ? r.altitude + " / EXP " : "EXP ") + expAlt + expMin;
    }

    // Frequency — after normalization "one two niner point four" → "129.4"
    const frq = t.match(/(?:contact|departure|frequency|on)\s+(\d{2,3}\.\d+)/i);
    if (frq) r.frequency = frq[1];

    // Taxi instructions
    const taxi = t.match(/taxi\s+(?:to\s+)?(?:runway\s+)?([A-Z0-9][A-Z0-9\s,]*?)(?:\s+hold|\s+contact|\s+via|$)/i);
    if (taxi) r.taxi = taxi[1].trim().toUpperCase();

    // Squawk — after normalization "four two one five" → "4215"
    const sqk = t.match(/squawk\s+(\d{4})/i);
    if (sqk) r.squawk = sqk[1];

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
      const b=(st,f,d)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.start(st);o.frequency.setValueAtTime(f,st);g.gain.setValueAtTime(0.15,st);g.gain.exponentialRampToValueAtTime(0.001,st+d);o.stop(st+d);};
      const t=ctx.currentTime;
      if(urgent){b(t,1046,0.12);b(t+0.16,1046,0.12);b(t+0.32,1046,0.22);}
      else{b(t,523,0.25);b(t+0.3,659,0.15);}
      setTimeout(()=>{try{ctx.close();}catch{}},1400);
    } catch {}
  };

  const commClearTimers = () => { clearInterval(commAckIntervalRef.current); clearInterval(commBeepIntervalRef.current); };

  // ── WATCHDOG PENDING STATE ─────────────────────────────────────────────────
  // Refs that track the smart gated alert system.
  // When callsign is detected we enter "pending" — we do NOT start the countdown.
  // Two gates must both clear before countdown begins:
  //   Gate A: speech engine interim text has stopped (isFinal confirmed)
  //   Gate B: RMS has been below silence threshold for SILENCE_CONFIRM_MS
  // If new voice activity is detected during the 5s countdown, auto-standdown.
  const watchdogPendingEntryRef  = useRef(null);  // the tx entry that triggered pending
  const watchdogSilenceTimerRef  = useRef(null);  // timer waiting for confirmed silence
  const watchdogInterimActiveRef = useRef(false); // true while interim text is flowing
  const watchdogCountdownRef     = useRef(false); // true while 5s countdown is actively running
  const watchdogUnansweredRef    = useRef(false); // true once countdown expired — blocks RMS standdown
  const SILENCE_CONFIRM_MS       = 1800;          // ms of RMS silence before countdown starts
  const RMS_SILENCE_THRESHOLD    = 0.04;          // RMS below this = radio silence

  // Called from the VU animation loop on every audio frame when watchdog is pending
  // or counting down. Exported via ref so it's accessible inside requestAnimationFrame.
  const watchdogRmsCheckRef = useRef(null);

  const commTriggerWatchdog = useCallback((entry) => {
    // Enter PENDING state immediately — no chime, no countdown yet
    commClearTimers();
    clearTimeout(watchdogSilenceTimerRef.current);
    watchdogPendingEntryRef.current = entry;
    watchdogCountdownRef.current    = false;
    watchdogUnansweredRef.current   = false;
    setCommWatchdogState("pending");
    setCommWatchdogTx(entry);
    setCommAckCountdown(0);
  }, []);

  // Start the actual 5-second countdown — only called after both gates clear
  const commStartWatchdogCountdown = useCallback(() => {
    if (watchdogCountdownRef.current) return; // already running
    if (!watchdogPendingEntryRef.current) return; // pending was cleared
    watchdogCountdownRef.current = true;
    setCommWatchdogState("alert");
    setCommAckCountdown(5);
    // No chime here — chime fires only when countdown expires (unanswered)
    let rem = 5;
    commAckIntervalRef.current = setInterval(() => {
      rem--;
      setCommAckCountdown(rem);
      if (rem <= 0) {
        clearInterval(commAckIntervalRef.current);
        watchdogCountdownRef.current  = false; // countdown done — stop RMS standdown gate
        watchdogUnansweredRef.current = true;  // lock out RMS/silence handlers until ACK
        setCommWatchdogState("unanswered");
        commPlayChime(true);
        commBeepIntervalRef.current = setInterval(() => commPlayChime(true), 2000);
      }
    }, 1000);
  }, []);

  // Called when interim text arrives — resets the silence gate
  const commWatchdogOnInterim = useCallback(() => {
    watchdogInterimActiveRef.current = true;
    clearTimeout(watchdogSilenceTimerRef.current);
    // If countdown was already running and we hear new speech — auto standdown
    // (either pilot readback or ATC transmitting again — either way, hold off)
    if (watchdogCountdownRef.current) {
      commClearTimers();
      watchdogCountdownRef.current = false;
      setCommWatchdogState("pending");
      setCommAckCountdown(0);
    }
  }, []);

  // Called when a final transcript arrives — clears interim gate, starts silence wait
  const commWatchdogOnFinal = useCallback(() => {
    watchdogInterimActiveRef.current = false;
    // Only arm the silence timer if pending (not yet counting down, not unanswered)
    if (watchdogPendingEntryRef.current && !watchdogCountdownRef.current && !watchdogUnansweredRef.current) {
      clearTimeout(watchdogSilenceTimerRef.current);
      watchdogSilenceTimerRef.current = setTimeout(() => {
        commStartWatchdogCountdown();
      }, SILENCE_CONFIRM_MS);
    }
  }, [commStartWatchdogCountdown]);

  // Wire RMS check into the watchdog — called from VU meter animation frame
  watchdogRmsCheckRef.current = (rmsLevel) => {
    if (!watchdogPendingEntryRef.current) return;
    if (watchdogUnansweredRef.current) return; // unanswered — only ACK button clears this
    if (rmsLevel > RMS_SILENCE_THRESHOLD) {
      // Audio detected — reset the silence confirmation timer
      clearTimeout(watchdogSilenceTimerRef.current);
      watchdogInterimActiveRef.current = true;
      // If countdown is actively running and audio spikes, pilot is transmitting — standdown
      if (watchdogCountdownRef.current) {
        commClearTimers();
        watchdogCountdownRef.current = false;
        setCommWatchdogState("pending");
        setCommAckCountdown(0);
      }
    }
  };

  // ── Stable ref that always holds the latest transcript handler ────────────
  // This is the core fix: SpeechRecognition and the worker both call
  // commHandleTranscriptRef.current() so they ALWAYS get the current closure,
  // even if React hasn't re-rendered yet. No stale captures, no missed chunks.
  const commHandleTranscriptRef = useRef(null);

  const commHandleTranscript = useCallback((text, isFinal) => {
    if (!text?.trim()) return;

    // ── Interim text gate — resets silence timer, holds countdown ────────────
    if (!isFinal) {
      setCommTranscript(text);
      commWatchdogOnInterim();
      return;
    }
    setCommTranscript("");

    // ── ATC correction pass — fix speech engine homophones before anything else
    const corrected = normalizeAtcSpeech(text);

    // ── Standard watchdog + tx log ────────────────────────────────────────
    const type   = commDetectType(corrected);
    const tokens = (type==="landing"||type==="pattern") ? commParseLanding(corrected) : null;
    const nwkraft= (type==="ifr_departure"||type==="ifr_approach"||commForceIfr) ? commParseCraft(corrected) : null;
    const entry  = { id:++commTxIdRef.current, text:corrected, ts:new Date(), type, tokens, nwkraft };
    setCommTxLog(prev => { const next = [entry, ...prev]; saveCommTxLog(next); return next; });
    if (nwkraft) setCommIfrData(nwkraft);
    if (commCallsignRxRef.current && commCallsignRxRef.current.test(corrected)) commTriggerWatchdog(entry);
    // Final text arrived — start silence confirmation window for watchdog
    commWatchdogOnFinal();

    // ── ARMED BUFFER ACCUMULATION ─────────────────────────────────────────
    // Every final chunk is appended to the buffer AND immediately shown in
    // the card's live display so the pilot can see text growing in real time.
    // The silence timer is a 30-second safety fallback only — the pilot is
    // expected to press STOP when done. This prevents any premature commit.

    if (atisArmStateRef.current === "armed") {
      const newBuf = (atisBufferRef.current + " " + corrected).trim();
      atisBufferRef.current = newBuf;
      setAtisRawText(newBuf); // live update so pilot sees accumulation
      clearTimeout(atisSilenceRef.current);
      atisSilenceRef.current = setTimeout(commitAtisBuffer, 30000); // 30s safety fallback
    }

    if (taxiArmStateRef.current === "armed") {
      const newBuf = (taxiBufferRef.current + " " + corrected).trim();
      taxiBufferRef.current = newBuf;
      setTaxiRawText(newBuf);
      clearTimeout(taxiSilenceRef.current);
      taxiSilenceRef.current = setTimeout(commitTaxiBuffer, 30000);
    }

    if (gndArmStateRef.current === "armed") {
      const newBuf = (gndBufferRef.current + " " + corrected).trim();
      gndBufferRef.current = newBuf;
      setGndRawText(newBuf);
      clearTimeout(gndSilenceRef.current);
      gndSilenceRef.current = setTimeout(commitGndBuffer, 30000);
    }

    if (ifrArmStateRef.current === "armed") {
      const newBuf = (ifrBufferRef.current + " " + corrected).trim();
      ifrBufferRef.current = newBuf;
      setIfrRawText(newBuf);
      clearTimeout(ifrSilenceRef.current);
      ifrSilenceRef.current = setTimeout(commitIfrBuffer, 30000);
    }

  }, [commForceIfr, commTriggerWatchdog, commWatchdogOnInterim, commWatchdogOnFinal, commitAtisBuffer, commitTaxiBuffer, commitGndBuffer, commitIfrBuffer]);

  // Keep the ref in sync with the latest version of the handler every render.
  // Cost: negligible. Benefit: every caller always gets the fresh closure.
  commHandleTranscriptRef.current = commHandleTranscript;

  // Worker handles AUDIO_CHUNK (ring buffer) and REPLAY_PCM only.
  // Transcript routing is now done directly in SpeechRecognition.onresult
  // so there is zero round-trip delay and zero stale-closure risk.
  const COMM_WORKER_BLOB = `const SAMPLE_RATE=16000,BUFFER_SIZE=16000*12; const ring=new Float32Array(BUFFER_SIZE);let wh=0; function rms(s){let sum=0;for(let i=0;i<s.length;i++)sum+=s[i]*s[i];return 20*Math.log10(Math.sqrt(sum/s.length)+1e-9);} function write(s){for(let i=0;i<s.length;i++){ring[wh]=s[i];wh=(wh+1)%BUFFER_SIZE;}} function read(sec){const n=Math.min(sec*SAMPLE_RATE,BUFFER_SIZE),out=new Float32Array(n),st=(wh-n+BUFFER_SIZE)%BUFFER_SIZE;for(let i=0;i<n;i++)out[i]=ring[(st+i)%BUFFER_SIZE];return out;} self.onmessage=function(e){   if(e.data.type==="AUDIO_CHUNK"){write(e.data.samples);self.postMessage({type:"BUFFER_READY",rmsDb:rms(e.data.samples)});return;}   if(e.data.type==="GET_REPLAY"){self.postMessage({type:"REPLAY_PCM",pcm:read(e.data.seconds||10),sampleRate:SAMPLE_RATE});return;} };`;

  useEffect(() => {
    const blob=new Blob([COMM_WORKER_BLOB],{type:"application/javascript"});
    commWorkerBlobUrl.current=URL.createObjectURL(blob);
    commWorkerRef.current=new Worker(commWorkerBlobUrl.current);
    commWorkerRef.current.onmessage=(e)=>{
      const{type}=e.data;
      if(type==="BUFFER_READY") setCommRmsLevel(Math.max(0,Math.min(1,(e.data.rmsDb+60)/60)));
      if(type==="REPLAY_PCM")   commPlayPcm(e.data.pcm,e.data.sampleRate);
      // TRANSCRIPT type removed — transcripts now route directly from SpeechRecognition
    };
    return()=>{commWorkerRef.current?.terminate();if(commWorkerBlobUrl.current)URL.revokeObjectURL(commWorkerBlobUrl.current);};
  }, []); // stable — no deps, worker is created once and lives for the session

  useEffect(() => { commCallsignRxRef.current = buildCommRegex(aircraft?.tail); }, [aircraft?.tail, buildCommRegex]);

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
    try {
      if (commStreamRef.current) {
        commStreamRef.current.getAudioTracks().forEach(track => { track.enabled = true; });
        if (commAudioCtxRef.current && commAudioCtxRef.current.state === "suspended") {
          await commAudioCtxRef.current.resume();
        }
        if (!commAnimFrameRef.current) {
          const analyser = commAudioCtxRef.current._analyser || commAudioCtxRef.current.createAnalyser();
          const vuBuf = new Uint8Array(analyser.frequencyBinCount);
          const animVu = () => {
            commAnimFrameRef.current = requestAnimationFrame(animVu);
            if (!commAudioCtxRef.current || commAudioCtxRef.current.state === "suspended") {
              setCommRmsLevel(0);
              return;
            }
            analyser.getByteFrequencyData(vuBuf);
            let sum = 0;
            for (let i = 0; i < vuBuf.length; i++) sum += vuBuf[i] * vuBuf[i];
            setCommRmsLevel(Math.sqrt(sum / vuBuf.length) / 255);
          };
          commAnimFrameRef.current = requestAnimationFrame(animVu);
        }
        if (commRecognitionRef.current) {
          try { commRecognitionRef.current.start(); } catch(e) {}
        }
        setCommListening(true);
        setCommMicStatus("active");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      commStreamRef.current = stream;
      
      const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      commAudioCtxRef.current = ctx;
      
      const source = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      source.connect(proc); 
      proc.connect(ctx.destination);
      
      proc.onaudioprocess = (e) => {
        if (!commStreamRef.current || !commStreamRef.current.getAudioTracks()[0].enabled) return;
        const s = new Float32Array(e.inputBuffer.getChannelData(0));
        commWorkerRef.current?.postMessage({ type: "AUDIO_CHUNK", samples: s });
      };
      
      const analyser = ctx.createAnalyser(); 
      analyser.fftSize = 256; 
      source.connect(analyser);
      ctx._analyser = analyser;
      
      const vuBuf = new Uint8Array(analyser.frequencyBinCount);
      const animVu = () => {
        commAnimFrameRef.current = requestAnimationFrame(animVu);
        if (!commAudioCtxRef.current || commAudioCtxRef.current.state === "suspended") {
          setCommRmsLevel(0);
          return;
        }
        analyser.getByteFrequencyData(vuBuf);
        let sum = 0;
        for (let i = 0; i < vuBuf.length; i++) sum += vuBuf[i] * vuBuf[i];
        const rms = Math.sqrt(sum / vuBuf.length) / 255;
        setCommRmsLevel(rms);
        // Feed RMS into watchdog gate on every frame
        watchdogRmsCheckRef.current?.(rms);
      };
      commAnimFrameRef.current = requestAnimationFrame(animVu);
      
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
          // Interim: update live display directly
          if (p) setCommTranscript(p);
          // Final: call handler via stable ref — always the latest closure,
          // zero worker round-trip, guaranteed to see current arm state
          if (f.trim()) commHandleTranscriptRef.current?.(f.trim(), true);
        };
        rec.onerror = (e) => { if (e.error === "not-allowed") setCommMicStatus("denied"); };
        rec.onend = () => { 
          if (commStreamRef.current && commStreamRef.current.getAudioTracks()[0].enabled) {
            try { rec.start(); } catch {} 
          }
        };
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
    if (commRecognitionRef.current) {
      try { commRecognitionRef.current.stop(); } catch(e) {}
    }
    if (commStreamRef.current) {
      commStreamRef.current.getAudioTracks().forEach(track => { track.enabled = false; });
    }
    if (commAudioCtxRef.current && commAudioCtxRef.current.state === "running") {
      try { commAudioCtxRef.current.suspend(); } catch(e) {}
    }
    if (commAnimFrameRef.current) {
      cancelAnimationFrame(commAnimFrameRef.current);
      commAnimFrameRef.current = null;
    }
    setCommListening(false);
    setCommMicStatus("idle");   
    setCommTranscript("");
    setCommRmsLevel(0);
  };
  const commAckCall = () => {
    commClearTimers();
    clearTimeout(watchdogSilenceTimerRef.current);
    watchdogPendingEntryRef.current  = null;
    watchdogCountdownRef.current     = false;
    watchdogUnansweredRef.current    = false;
    watchdogInterimActiveRef.current = false;
    setCommWatchdogState("clear");
    setCommWatchdogTx(null);
    setCommAckCountdown(0);
    commPlayChime(false);
  };
  const commReplay = (seconds = 10) => { commWorkerRef.current?.postMessage({ type: "GET_REPLAY", seconds }); setCommReplayActive(true); setTimeout(() => setCommReplayActive(false), seconds * 1000); };


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

  // ── Synchronous Storage load (Swapped to localStorage for Safari) ──────────
  useEffect(() => {
    const load = () => {
      try {
        const ci = localStorage.getItem("kneeboard-custom-items");
        if (ci) {
          const parsed = JSON.parse(ci);
          const restored = {};
          Object.keys(parsed).forEach(k => {
            restored[k] = { ...parsed[k], removed: new Set(parsed[k].removed || []) };
          });
          setCustomItems(restored);
        }
        const vs = localStorage.getItem("kneeboard-vspeeds");
        if (vs) setVspeeds(JSON.parse(vs));
        const pd = localStorage.getItem("kneeboard-perfdata");
        if (pd) setPerfData(JSON.parse(pd));
        const cd = localStorage.getItem("kneeboard-climbdata");
        if (cd) setClimbData(JSON.parse(cd));
        const crd = localStorage.getItem("kneeboard-cruisedata");
        if (crd) setCruiseData(JSON.parse(crd));
        
        // Inline Notepad index rebuild loops
        const imgs = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("notepad-")) {
            const val = localStorage.getItem(k);
            if (val) imgs[k] = val;
          }
        }
        setNotepadImages(imgs);
        
        const sp = localStorage.getItem("scratchpad-text");
        if (sp) setScratchpadText(sp);

        const tl = localStorage.getItem("apex-tx-log");
        if (tl) {
          const parsed = JSON.parse(tl);
          setCommTxLog(parsed);
          // Restore ID counter so new entries don't collide with stored IDs
          if (parsed.length > 0) {
            commTxIdRef.current = Math.max(...parsed.map(e => (typeof e.id === "number" ? e.id : 0)));
          }
        }
      } catch {}
    };
    if (typeof window !== "undefined") load();
  }, []);

  const getSectionKey = (pageId, sectionTitle) => `${pageId}::${sectionTitle}`;
  const getSectionCustom = (pageId, sectionTitle) => {
    const key = getSectionKey(pageId, sectionTitle);
    return customItems[key] || { removed: new Set(), added: [], order: null, renames: {} };
  };

  const saveCustomItems = (next) => {
    try {
      const serializable = {};
      Object.keys(next).forEach(k => {
        serializable[k] = { removed: [...next[k].removed], added: next[k].added, order: next[k].order || null, renames: next[k].renames || {} };
      });
      localStorage.setItem("kneeboard-custom-items", JSON.stringify(serializable));
    } catch {}
  };

  const saveVspeeds   = (next) => { try { localStorage.setItem("kneeboard-vspeeds",  JSON.stringify(next)); } catch {} };
  const savePerfData  = (next) => { try { localStorage.setItem("kneeboard-perfdata",  JSON.stringify(next)); } catch {} };
  const saveClimbData = (next) => { try { localStorage.setItem("kneeboard-climbdata", JSON.stringify(next)); } catch {} };
  const saveCruiseData= (next) => { try { localStorage.setItem("kneeboard-cruisedata",JSON.stringify(next)); } catch {} };
  const saveCommTxLog = (next) => { try { localStorage.setItem("apex-tx-log",         JSON.stringify(next)); } catch {} };

  const commClearTxLog = () => {
    setCommTxLog([]);
    try { localStorage.removeItem("apex-tx-log"); } catch {}
  };

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

  // ── Add row / item helpers ────────────────────────────────────────────────
  const addPerfRow  = (si) => { setPerfData(prev  => { const next = prev.map((s, i)  => i !== si ? s : { ...s, rows: [...s.rows,  Array(s.cols.length).fill("")]  }); savePerfData(next);  return next; }); };
  const addClimbRow = (si) => { setClimbData(prev  => { const next = prev.map((s, i)  => i !== si ? s : { ...s, rows: [...s.rows,  Array(s.cols.length).fill("")]  }); saveClimbData(next); return next; }); };
  const addCruiseRow= (si) => { setCruiseData(prev => { const next = prev.map((s, i)  => i !== si ? s : { ...s, rows: [...s.rows,  Array(s.cols.length).fill("")]  }); saveCruiseData(next);return next; }); };
  const addVspeedItem=(gi) => { setVspeeds(prev    => { const next = prev.map((g, i)  => i !== gi  ? g : { ...g, items:[...g.items, { code:"", value:"", unit:"KIAS", desc:"" }] }); saveVspeeds(next); return next; }); };

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
    t_queueRef.current = queue; ttsIdxRef.current = 0;
    setTtsPaused(false); setTtsActive({ sectionKey, idx: -1 });
    speakItem(queue, 0, sectionKey);
  };

  const pauseResumeTTS = () => {
    if (ttsPaused) { window.speechSynthesis.resume(); setTtsPaused(false); }
    else { window.speechSynthesis.pause(); setTtsPaused(true); }
  };

  const stopTTS = () => { window.speechSynthesis.cancel(); ttsQueueRef.current = []; setTtsActive(null); setTtsPaused(false); };

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

  const renderChecklist = (pg) => {
    if (!pg) return null;
    const isEmg = EMG_PAGES.some(p => p.id === pg.id);
    const emgMeta = isEmg ? EMG_PAGES.find(p => p.id === pg.id) : null;
    const accentColor = emgMeta ? emgMeta.color : "var(--accent)";
    const pageCount = countPage(pg.id);
    const isComplete = pageCount.total > 0 && pageCount.done === pageCount.total;

    return (
      <div key={pg.id} style={{ animation: "efb-fade-in 0.15s ease", padding: "12px 12px 88px" }}>
        {/* Sticky page header */}
        <div className="efb-page-header" style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-0)" }}>
          <div>
            <h1 className="efb-page-title" style={isEmg ? { color: accentColor } : {}}>
              {pg.id === "approach"     ? "APPROACH & LANDING"
               : pg.id === "engine_fail" ? "ENGINE FAILURES"
               : pg.id === "spin"        ? "SPIN RECOVERY"
               : pg.id === "fires"       ? "FIRES"
               : pg.id === "icing"       ? "ICING"
               : pg.id === "electrical"  ? "ELECTRICAL FAILURE"
               : pg.label || pg.id.toUpperCase()}
            </h1>
            <div className="efb-page-subtitle">
              {isEmg
                ? "CESSNA 172S · MEMORY ITEMS FIRST"
                : `CESSNA 172S SKYHAWK · ${
                    pg.id === "preflight" ? "EXTERNAL & COCKPIT WALK-AROUND"
                  : pg.id === "startup"   ? "ENGINE START SEQUENCE"
                  : pg.id === "taxi"      ? "TAXI & RUN-UP"
                  : pg.id === "takeoff"   ? "TAKEOFF & CLIMB"
                  : pg.id === "cruise"    ? "CRUISE CHECKLIST"
                  : pg.id === "approach"  ? "APPROACH & LANDING"
                  : pg.id === "shutdown"  ? "SHUTDOWN & SECURING"
                  : "CHECKLIST"
                }`
              }
            </div>
          </div>
          <div className="efb-page-meta">
            <div className={`efb-chip${
              isComplete           ? " done"
              : pageCount.done > 0 ? " progress"
              : ""
            }`}>
              {isComplete
                ? <><span>✓ COMPLETE</span><span className="efb-chip-num"> · {pageCount.done}/{pageCount.total}</span></>
                : pageCount.done > 0
                  ? <><span>IN PROGRESS</span><span className="efb-chip-num"> · {pageCount.done}/{pageCount.total}</span></>
                  : <span className="efb-chip-num">{pageCount.total} ITEMS</span>
              }
            </div>
            <button className="efb-btn sm ghost" onClick={() => resetPage(pg.id)}>
              <Icon name="reset" size={12}/>
            </button>
          </div>
        </div>

        {pg.sections.map((section, si) => {
          const sectionKey = getSectionKey(pg.id, section.title);
          const custom = getSectionCustom(pg.id, section.title);
          const isEditing = editingSection === sectionKey;

          // Per-section progress — must use same key formula as the check rows below
          const secMerged = getMergedItems(pg.id, section.title, section.items);
          const secTotal  = secMerged.filter(i => !(custom.removed.has(i.originalLabel || i.l) && !i.custom)).length;
          const secDone   = secMerged.reduce((acc, item, idx) => {
            if (custom.removed.has(item.originalLabel || item.l) && !item.custom) return acc;
            const k = item.custom
              ? `${pg.id}::${section.title}::CUSTOM::${idx}::${item.l}`
              : `${pg.id}::${section.title}::${idx}::${item.originalLabel || item.l}`;
            return acc + (checked[k] ? 1 : 0);
          }, 0);
          const secPct    = secTotal > 0 ? Math.round(secDone / secTotal * 100) : 0;
          const secIsDone = secTotal > 0 && secDone === secTotal;

          return (
            <div key={si} className={`efb-cl-section${isEmg ? " emg" : ""}${secIsDone ? " done" : ""}`} style={isEmg ? { "--emg-color": accentColor } : {}}>
              {section.title && (
                <div className="efb-cl-head">
                  <div className="efb-cl-title">
                    <span className="efb-cl-name">{section.title}</span>
                    <span className="efb-cl-count">{secDone}/{secTotal}</span>
                  </div>
                  {secTotal > 0 && (
                    <div className="efb-cl-progress">
                      <div className="efb-cl-bar">
                        <div
                          className={`efb-cl-bar-fill${secIsDone ? " ok" : ""}`}
                          style={{ width: `${secPct}%` }}
                        />
                      </div>
                      <span className="efb-cl-pct">{secPct}%</span>
                    </div>
                  )}
                  <div className="efb-cl-actions">
                    {!isEditing && (ttsActive && ttsActive.sectionKey === sectionKey ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="efb-btn sm caution" onClick={pauseResumeTTS}>{ttsPaused ? "▶ RESUME" : "⏸ PAUSE"}</button>
                        <button className="efb-btn sm warn" onClick={stopTTS}>■ STOP</button>
                      </div>
                    ) : (
                      <button className="efb-btn sm ok" onClick={(e) => { e.stopPropagation(); const mi = getMergedItems(pg.id, section.title, section.items).filter(i => !custom.removed.has(i.originalLabel || i.l) || i.custom); startTTS(sectionKey, mi); }}>
                        <Icon name="play" size={10}/> READ
                      </button>
                    ))}
                    <button className={`efb-btn sm${isEditing ? " caution" : ""}`} onClick={(e) => { e.stopPropagation(); setEditingSection(isEditing ? null : sectionKey); setNewItemLabel(""); setNewItemAction(""); }}>
                      {isEditing ? "✕ DONE" : "✎ EDIT"}
                    </button>
                  </div>
                </div>
              )}

              {isEditing && (
                <div style={{ background: "var(--bg-inset)", border: "1px solid var(--line)", borderTop: "none", margin: "0 0 2px" }}>
                  <div style={{ padding: "6px 10px 4px", borderBottom: "1px solid var(--line-faint)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--caution)", letterSpacing: 1.5 }}>✎ EDIT MODE</span>
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--t-quiet)", letterSpacing: 1 }}>TAP LABEL TO RENAME · × TO HIDE · DRAG TO REORDER</span>
                    </div>
                    {(custom.removed.size > 0 || custom.added.length > 0 || Object.keys(custom.renames || {}).length > 0) && (
                      <button className="efb-btn sm warn" onClick={() => { setCustomItems(prev => { const next = { ...prev }; delete next[sectionKey]; saveCustomItems(next); return next; }); }}>↺ RESET DEFAULT</button>
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
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderBottom: "1px solid var(--line-faint)", background: isInlineEditing ? "rgba(77,163,255,0.06)" : item.custom ? "rgba(74,222,128,0.04)" : isRemoved ? "rgba(255,107,107,0.05)" : "transparent", opacity: isRemoved ? 0.55 : 1, transition: "opacity 0.15s, border-top 0.1s, background 0.15s", cursor: "grab" }}
                        >
                          <span style={{ color: "var(--t-quiet)", fontSize: 10, cursor: "grab", flexShrink: 0 }}>⠿</span>
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
                          }} style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 3, border: `1px solid ${isRemoved ? "var(--warn)" : "var(--line)"}`, background: isRemoved ? "var(--warn-bg)" : "transparent", cursor: "pointer", color: isRemoved ? "var(--warn)" : "var(--t-tertiary)", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {item.custom ? "×" : isRemoved ? "+" : "×"}
                          </button>
                          {isInlineEditing ? (
                            <div style={{ flex: 1, display: "flex", gap: 4 }}>
                              <input value={inlineEdit.l} onChange={e => setInlineEdit(p => ({ ...p, l: e.target.value }))} style={{ flex: 2, background: "var(--bg-inset)", border: "1px solid var(--accent)", borderRadius: 3, padding: "3px 6px", fontFamily: "var(--f-ui)", fontSize: 13, color: "var(--t-primary)", outline: "none" }} />
                              <input value={inlineEdit.a} onChange={e => setInlineEdit(p => ({ ...p, a: e.target.value.toUpperCase() }))} style={{ flex: 1, background: "var(--bg-inset)", border: "1px solid var(--accent)", borderRadius: 3, padding: "3px 6px", fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--caution)", outline: "none" }} />
                              <button className="efb-btn sm ok" onClick={() => applyInlineRename(pg.id, section.title, item, inlineEdit.l, inlineEdit.a, item.addedIdx)}>✓</button>
                              <button className="efb-btn sm ghost" onClick={() => setInlineEdit(null)}>✕</button>
                            </div>
                          ) : (
                            <>
                              <span onClick={() => !isRemoved && setInlineEdit({ key: itemEditKey, l: item.l, a: item.a || "" })} style={{ flex: 1, fontFamily: "var(--f-ui)", fontSize: 13, color: item.custom ? "var(--ok)" : isRemoved ? "var(--t-quiet)" : "var(--t-primary)", cursor: isRemoved ? "default" : "text", textDecoration: isRemoved ? "line-through" : "none", borderBottom: isRemoved ? "none" : "1px dashed var(--caution-line)", paddingBottom: 1 }}>{item.l}</span>
                              <span onClick={() => !isRemoved && setInlineEdit({ key: itemEditKey, l: item.l, a: item.a || "" })} style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: item.custom ? "var(--ok)" : isRemoved ? "var(--t-quiet)" : "var(--caution)", cursor: isRemoved ? "default" : "text", borderBottom: isRemoved ? "none" : "1px dashed var(--caution-line)", paddingBottom: 1 }}>{item.a}</span>
                              {item.custom && <span style={{ fontFamily: "var(--f-mono)", fontSize: 7, color: "var(--ok)", opacity: 0.45 }}>★</span>}
                              {!item.custom && (custom.renames || {})[item.originalLabel || item.l] && <span style={{ fontFamily: "var(--f-mono)", fontSize: 7, color: "var(--accent)", opacity: 0.6 }}>✎</span>}
                            </>
                          )}
                        </div>
                      );
                    });
                  })()}
                  <div style={{ padding: "8px 10px", background: "var(--bg-inset)", borderTop: "1px solid var(--line-faint)" }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--accent)", letterSpacing: 1.5, marginBottom: 6 }}>＋ ADD ITEM</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input value={newItemLabel} onChange={e => setNewItemLabel(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addCustomItem(pg.id, section.title); }} placeholder="Item label..." style={{ flex: 2, background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 3, color: "var(--t-primary)", padding: "5px 8px", fontSize: 12, fontFamily: "var(--f-ui)", fontWeight: 500, outline: "none" }} />
                      <input value={newItemAction} onChange={e => setNewItemAction(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addCustomItem(pg.id, section.title); }} placeholder="Action..." style={{ flex: 1, background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 3, color: "var(--caution)", padding: "5px 8px", fontSize: 11, fontFamily: "var(--f-mono)", outline: "none" }} />
                      <button className={`efb-btn sm${newItemLabel.trim() ? " ok" : ""}`} onClick={() => addCustomItem(pg.id, section.title)}>ADD ＋</button>
                    </div>
                  </div>
                </div>
              )}

              {!isEditing && (() => {
                const merged = getMergedItems(pg.id, section.title, section.items);
                const nonCheckable = section.items.filter(i => i.type);
                return (
                  <>
                    {nonCheckable.map((item, idx) => {
                      if (item.type === "note") return <div key={"nc-" + idx} className="efb-cl-note">★ {item.l}</div>;
                      if (item.type === "caution") return <div key={"nc-" + idx} className="efb-cl-warning">⚠ {item.l}</div>;
                      return null;
                    })}
                    {merged.map((item, idx) => {
                      if (custom.removed.has(item.originalLabel || item.l) && !item.custom) return null;
                      const key = item.custom ? `${pg.id}::${section.title}::CUSTOM::${idx}::${item.l}` : `${pg.id}::${section.title}::${idx}::${item.originalLabel || item.l}`;
                      const isDone = !!checked[key];
                      return (
                        <div key={key}>
                          <div className={`efb-check-row${isDone ? " checked" : ""}`} onClick={() => toggleCheck(key)}>
                            <div className="efb-check-box">
                              <Icon name="check" size={11} stroke={2.5}/>
                            </div>
                            <span className="efb-check-label">{item.l}</span>
                            <span className="efb-check-value">{item.a}</span>
                          </div>
                          {item.notepad && openNotepads.has(key) && (
                            <DrawingNotepad title={item.notepadLabel || "NOTEPAD"} footer={item.notepadFooter} storageKey={`notepad-${key}`} initialImage={notepadImages[`notepad-${key}`]} onSave={(dataUrl) => setNotepadImages(prev => ({ ...prev, [`notepad-${key}`]: dataUrl }))} onClose={() => setOpenNotepads(prev => { const next = new Set(prev); next.delete(key); return next; })} />
                          )}
                          {item.notepad && !openNotepads.has(key) && (
                            <button onClick={e => { e.stopPropagation(); setOpenNotepads(prev => { const next = new Set(prev); next.add(key); return next; }); }} style={{ display: "flex", alignItems: "center", gap: 5, margin: "0 10px 4px 36px", padding: "3px 10px", background: "var(--accent-bg)", border: "1px solid var(--accent-line)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 8, color: "var(--accent)", letterSpacing: 1.5 }}>✎ {item.notepadLabel || "OPEN NOTEPAD"}</button>
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

  // ── Radio strip helpers ────────────────────────────────────────────────────
  const fmtRxTs = ts => {
    const d = new Date(ts);
    return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}Z`;
  };
  const rxTypeColor = t => {
    if (!t) return "var(--t-secondary)";
    const u = t.toUpperCase();
    if (u.includes("TOWER") || u.includes("TRACON"))     return "#3dbe6c";
    if (u.includes("GROUND"))                            return "#4ae8c8";
    if (u.includes("CLNC") || u.includes("DEL"))        return "#3a9ad4";
    if (u.includes("ATIS"))                              return "#e8c84a";
    if (u.includes("APPROACH") || u.includes("DEPART")) return "#c87ae8";
    return "var(--t-secondary)";
  };

  return (
    <div className="efb-app">

      {/* ── TOPBAR ── */}
      <header className="efb-topbar">

        {/* ── LEFT: back nav + flight timer ── */}
        <div className="efb-topbar-left">
          {onBackToHangar && (
            <>
              <button className="efb-btn ghost" onClick={onBackToHangar}>
                <Icon name="back" size={14}/> HANGAR
              </button>
              <span className="efb-divider-v"/>
            </>
          )}
          <div className="efb-flight-timer">
            <span className="efb-flight-timer-label">FLT TIMER</span>
            <span className={`efb-flight-timer-value${timerRunning ? " running" : ""}`}>
              {formatTimer(timerSeconds)}
            </span>
            <button
              className={`efb-btn sm${timerRunning ? " warn" : " ok"}`}
              onClick={() => setTimerRunning(r => !r)}
            >
              {timerRunning ? "⏸ STOP" : timerSeconds > 0 ? "▶ CONT" : "▶ START"}
            </button>
            <button
              className="efb-btn sm ghost icon-only"
              onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
              title="Reset timer"
            >
              <Icon name="reset" size={11}/>
            </button>
          </div>
        </div>

        {/* ── CENTER: aircraft ident (centered) + clocks (right) ── */}
        <div className="efb-topbar-center">
          <div className="efb-tail-center">
            <div className="efb-tail">
              <span className="efb-tail-no">{aircraft ? aircraft.tail : "N12345"}</span>
              <span className="efb-tail-type">
                {aircraft ? aircraft.type : "CESSNA 172S SKYHAWK"}
              </span>
            </div>
          </div>
          <div className="efb-clocks">
            <div className="efb-clock">
              <span className="efb-clock-label">LOCAL</span>
              <span className="efb-clock-value">{localTime}</span>
            </div>
            <div className="efb-clock zulu">
              <span className="efb-clock-label">ZULU</span>
              <span className="efb-clock-value">{zuluTime}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: POH · NOTES · theme toggle ── */}
        <div className="efb-topbar-right">
          <button
            className="efb-btn ghost"
            onClick={() => setActiveDrawer(prev =>
              prev.size > 0
                ? new Set()
                : new Set(["vspeeds", "perf", "climb", "cruise"])
            )}
            title="Performance data (POH)"
          >
            <Icon name="note" size={14}/> POH
          </button>
          <button
            className="efb-btn ghost"
            onClick={() => setScratchpadOpen(true)}
            title="Pilot scratchpad"
          >
            <Icon name="edit" size={14}/> NOTES
          </button>
          <span className="efb-divider-v"/>
          <label
            className={`efb-toggle${lightMode ? " on" : ""}`}
            onClick={() => setLightMode(m => !m)}
          >
            <span className="efb-toggle-track"><span className="efb-toggle-thumb"/></span>
            <span className="efb-toggle-label">{lightMode ? "DAY" : "NIGHT"}</span>
          </label>
        </div>

      </header>
      {/* ── RADIO MONITORING STRIP — row 2 ─────────────────────────────────────
           Single row: transcript display (left) + NRST widget (right)
           Watchdog banner appears conditionally above when ACK is needed.
      ────────────────────────────────────────────────────────────────────────── */}
      {currentPage !== "comm" && (
        <div className="efb-rx-wrap">

          {/* ── WATCHDOG BANNER ─────────────────────────────────────────────────────
               pending    → amber, no ACK button: callsign heard, tx still in progress
               alert      → amber + countdown: tx ended, 5s for pilot to respond
               unanswered → red + pulse + ACK: countdown expired, needs acknowledgment
          ────────────────────────────────────────────────────────────────────── */}
          {commWatchdogState !== "clear" && (
            <div className="efb-rx-watchdog" data-state={commWatchdogState}>
              <span className={`efb-status-dot ${commWatchdogState === "unanswered" ? "warn" : "caution"}`}/>
              <Icon name="antenna" size={13}/>
              <span className="efb-rx-watchdog-msg">
                {commWatchdogState === "pending"
                  ? "ATC calling — monitoring for pilot response"
                  : commWatchdogState === "alert"
                  ? "ATC call detected — respond or press ACK"
                  : "ATC call unanswered — acknowledgment required"}
              </span>
              {commWatchdogState !== "pending" && (
                <div className="efb-rx-watchdog-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className={`efb-btn sm ${commWatchdogState === "unanswered" ? "warn" : "caution"}`}
                    onClick={commAckCall}
                  >
                    {commWatchdogState === "unanswered"
                      ? "ACK CALL"
                      : `ACK [${commAckCountdown}s]`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── TRANSCRIPT + NRST area ── */}
          <div className="efb-rx-area">
            {/* Transcript side — clicking goes to Active Feed */}
            <div
              className="efb-rx-transcript"
              onClick={() => setCurrentPage("comm")}
            >
            {(commTranscript || commTxLog.length > 0) ? (
              /* ── ACTIVE / LIVE state ── */
              <div className="efb-rx-live">

                {/* Info header: timestamp · type badge · freq · confidence · ●LIVE · LISTEN btn */}
                <div className="efb-rx-live-header">
                  {commTxLog[0] && (
                    <>
                      <span className="efb-rx-live-ts">{fmtRxTs(commTxLog[0].ts)}</span>
                      {commTxLog[0].type && (
                        <span
                          className="efb-rx-live-type"
                          style={{
                            color:       rxTypeColor(commTxLog[0].type),
                            borderColor: `${rxTypeColor(commTxLog[0].type)}55`,
                            background:  `${rxTypeColor(commTxLog[0].type)}18`,
                          }}
                        >
                          {commTxLog[0].type.toUpperCase()}
                        </span>
                      )}
                      {commTxLog[0].tokens?.freq && (
                        <span className="efb-rx-live-freq">{commTxLog[0].tokens.freq}</span>
                      )}
                      {commTxLog[0].tokens?.conf != null && (
                        <span className="efb-rx-live-conf">
                          CONF {Math.round(commTxLog[0].tokens.conf * 100)}%
                        </span>
                      )}
                    </>
                  )}
                  {commTranscript && (
                    <span className="efb-rx-live-pill">
                      <span className="efb-status-dot ok"/>
                      LIVE
                    </span>
                  )}
                  {/* LISTEN / STOP button — right-aligned */}
                  <button
                    className={`efb-rb-listen-btn${commListening ? " active" : ""}`}
                    style={{ marginLeft: "auto" }}
                    onClick={e => {
                      e.stopPropagation();
                      if (commListening) { commStopListening(); }
                      else { commStopListening(); setTimeout(() => commStartListening(), 50); }
                    }}
                  >
                    <Icon name={commListening ? "stop" : "play"} size={11}/>
                    <span>{commListening ? "STOP" : "LISTEN"}</span>
                  </button>
                </div>

                {/* Main transcript text — large and legible */}
                <div className="efb-rx-live-main">
                  &ldquo;{commTranscript || commTxLog[0]?.text || ""}&rdquo;
                </div>

                {/* Previous transmissions log — up to 3 rows */}
                {commTxLog
                  .slice(commTranscript ? 0 : 1, commTranscript ? 3 : 4)
                  .map(entry => (
                    <div key={entry.id} className="efb-rx-log-row">
                      <span className="efb-rx-log-ts">{fmtRxTs(entry.ts)}</span>
                      {entry.type && (
                        <span
                          className="efb-rx-log-type"
                          style={{ color: rxTypeColor(entry.type) }}
                        >
                          {entry.type.toUpperCase()}
                        </span>
                      )}
                      {entry.tokens?.freq && (
                        <span className="efb-rx-log-freq">{entry.tokens.freq}</span>
                      )}
                      <span className="efb-rx-log-text">{entry.text}</span>
                      <span
                        className="efb-rx-log-replay"
                        onClick={e => { e.stopPropagation(); commReplay && commReplay(entry.id); }}
                      >
                        <Icon name="play" size={11}/>
                      </span>
                    </div>
                  ))
                }

              </div>
            ) : (
              /* ── IDLE state: no transmissions yet ── */
              <div className="efb-rx-idle">
                <Icon name="antenna" size={22}/>
                <div className="efb-rx-idle-body">
                  <span className="efb-rx-idle-title">NO ACTIVE TRANSMISSION</span>
                  <span className="efb-rx-idle-sub">
                    Live ATC transcription will appear here · last 3 transmissions retained
                  </span>
                </div>
                {/* LISTEN button — right side of idle row */}
                <button
                  className={`efb-rb-listen-btn${commListening ? " active" : ""}`}
                  style={{ marginLeft: "auto", flexShrink: 0 }}
                  onClick={e => {
                    e.stopPropagation();
                    if (commListening) { commStopListening(); }
                    else { commStopListening(); setTimeout(() => commStartListening(), 50); }
                  }}
                >
                  <Icon name={commListening ? "stop" : "play"} size={11}/>
                  <span>{commListening ? "STOP" : "LISTEN"}</span>
                </button>
              </div>
            )}
            </div>{/* end efb-rx-transcript */}

            {/* NRST widget — right side, tapping jumps to Nearest Freqs tab */}
            <NrstWidget
              onNavigate={() => {
                setCurrentPage("comm");
                setCommFreqTabTrigger(n => n + 1);
              }}
            />

          </div>

        </div>
      )}

      {/* ── LEFT RAIL ── */}
      <nav className="efb-rail-l">
        {PAGES.map(pg => {
          const iconMap = { preflight:"preflight", startup:"startup", taxi:"taxi", takeoff:"takeoff", cruise:"cruise", approach:"landing", shutdown:"power" };
          const isActive = currentPage === pg.id;
          const count = countPage(pg.id);
          const isDone = count.total > 0 && count.done === count.total;
          return (
            <button key={pg.id} className={`efb-rail-item${isActive ? " active" : ""}${isDone ? " complete" : ""}`} onClick={() => setCurrentPage(pg.id)}>
              <span className="efb-rail-ico"><Icon name={iconMap[pg.id] || "plane"} size={22}/></span>
              <span className="efb-rail-lbl">{pg.label}</span>
              {count.total > 0 && <span className="efb-rail-cnt">{isDone ? "✓" : `${count.done}/${count.total}`}</span>}
            </button>
          );
        })}
        <div className="efb-rail-spacer"/>
        <button className="efb-rail-item" onClick={() => setMoreOpen(true)}>
          <span className="efb-rail-ico"><Icon name="menu" size={20}/></span>
          <span className="efb-rail-lbl">MORE</span>
        </button>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="efb-main">
        <div style={{ flex: 1, overflow: currentPage === "comm" ? "hidden" : "auto", overflowX: "hidden", scrollbarWidth: "thin", display: "flex", flexDirection: "column" }}>
            {currentPage === "comm"
              ? <CommPage
                  lightMode={lightMode}
                  aircraft={aircraft}
                  listening={commListening}
                  forceFreqTab={commFreqTabTrigger}
                  micStatus={commMicStatus}
                  rmsLevel={commRmsLevel}
                  transcript={commTranscript}
                  txLog={commTxLog}
                  onClearLog={commClearTxLog}
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
                 atisData={commAtisData}
                  onSetAtisData={setCommAtisData}
                  atisArmState={atisArmState}
                  atisRawText={atisRawText}
                  onArmAtis={handleArmAtis}
                  onClearAtisRaw={() => { setAtisRawText(""); atisArmStateRef.current = "idle"; setAtisArmState("idle"); setCommAtisData({ info:"",wind:"",altimeter:"",visibility:"",sky:"",caution:"" }); clearTimeout(atisSilenceRef.current); }}
                  taxiData={commTaxiData}
                  onSetTaxiData={setCommTaxiData}
                  taxiArmState={taxiArmState}
                  taxiRawText={taxiRawText}
                  onArmTaxi={handleArmTaxi}
                  onClearTaxiRaw={() => { setTaxiRawText(""); taxiArmStateRef.current = "idle"; setTaxiArmState("idle"); setCommTaxiData({ runway:"",route:"",holdShort:"",instructions:"" }); clearTimeout(taxiSilenceRef.current); }}
                  gndData={commGndData}
                  onSetGndData={setCommGndData}
                  gndArmState={gndArmState}
                  gndRawText={gndRawText}
                  onArmGnd={handleArmGnd}
                  onClearGndRaw={() => { setGndRawText(""); gndArmStateRef.current = "idle"; setGndArmState("idle"); setCommGndData({ clearedTo:"",route:"",altitude:"",frequency:"",taxi:"",squawk:"" }); clearTimeout(gndSilenceRef.current); }}
                  ifrArmState={ifrArmState}
                  ifrRawText={ifrRawText}
                  onArmIfr={handleArmIfr}
                  onClearIfrRaw={() => { setIfrRawText(""); ifrArmStateRef.current = "idle"; setIfrArmState("idle"); setCommIfrData({ C:"",R:"",A:"",F:"",T:"" }); clearTimeout(ifrSilenceRef.current); }}
                />
              : renderChecklist(activePg)
            }
        </div>

      </main>

      {/* ── RIGHT RAIL ── */}
      <aside className="efb-rail-r">
        <div className="efb-rail-section-label">EMG</div>
        {EMG_PAGES.map(pg => {
          const iconMap = { fires:"fire", engine_fail:"engine", spin:"spin", icing:"snow", electrical:"bolt" };
          const isActive = currentPage === pg.id;
          const count = countPage(pg.id);
          const isDone = count.total > 0 && count.done === count.total;
          return (
            <button key={pg.id} className={`efb-rail-item efb-rail-emg${isActive ? " active" : ""}${isDone ? " complete" : ""}`} style={{"--emg-color": pg.color}} onClick={() => setCurrentPage(pg.id)}>
              <span className="efb-rail-ico"><Icon name={iconMap[pg.id] || "alert"} size={20}/></span>
              <span className="efb-rail-lbl">{pg.label}</span>
              {count.total > 0 && <span className="efb-rail-cnt">{isDone ? "✓" : `${count.done}/${count.total}`}</span>}
            </button>
          );
        })}
        <div className="efb-rail-spacer"/>
        <button className={`efb-rail-item${currentPage === "comm" ? " active" : ""}`} onClick={() => setCurrentPage("comm")}>
          <span className="efb-rail-ico"><Icon name="mic" size={20}/></span>
          <span className="efb-rail-lbl">{"SMART\nCOMS"}</span>
        </button>
      </aside>

      {/* ── STATUS BAR ── */}
      <footer className="efb-statusbar">
        <span className="efb-status-item">
          <span className={`efb-status-dot${commListening ? " ok" : commWatchdogState !== "clear" ? " warn" : ""}`}/>
          {" COM"}
        </span>
        <span className="efb-divider-v"/>
        <span className="efb-status-item">{masterCount.done}/{masterCount.total} ITEMS</span>
        <span className="efb-status-spacer"/>
        <span className="efb-status-item">{aircraft?.pohRef || "POH REV 2022-05"}</span>
      </footer>

      {/* ── QR OVERLAY ── */}
      {moreOpen && (
        <div className="efb-qr-backdrop" onClick={() => setMoreOpen(false)}>
          <div className="efb-qr-panel" onClick={e => e.stopPropagation()}>
            <div className="efb-qr-head">
              <div className="efb-qr-head-title">
                <span className="efb-qr-head-super">Quick Reference</span>
                <span className="efb-qr-head-sub">
                  {aircraft?.tail || "N12345"} · {aircraft?.type || "Cessna 172S Skyhawk"}
                </span>
              </div>
              <button className="efb-btn warn" onClick={() => setMoreOpen(false)}>✕ CLOSE</button>
            </div>
            <div className="efb-qr-body">
              <div className="efb-qr-sidebar">
                {[
                  { label: "Communications", ids: ["light_gun", "transponder", "phonetic"] },
                  { label: "Regulations",    ids: ["wx_minimums", "airspeed_limits", "vfr_altitudes", "airspace_entry"] },
                  { label: "Aircraft",       ids: ["c172_engine", "c172_electrical", "fuel_oil", "weight_cg", "tire_pressures"] },
                  { label: "Airport",        ids: ["runway_markings"] },
                ].map(group => (
                  <div key={group.label} className="efb-qr-group">
                    <div className="efb-qr-group-label">{group.label}</div>
                    {group.ids.map(id => {
                      const ref = MORE_REFS.find(r => r.id === id);
                      if (!ref) return null;
                      return (
                        <button
                          key={ref.id}
                          className={`efb-qr-nav-item${activeMoreRef === ref.id ? " active" : ""}`}
                          style={activeMoreRef === ref.id ? {"--accent": ref.color} : {}}
                          onClick={() => setActiveMoreRef(ref.id)}
                        >
                          {ref.title}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="efb-qr-content">
                {(() => {
                  const ref = MORE_REFS.find(r => r.id === activeMoreRef);
                  if (!ref) return null;
                  return (
                    <>
                      <div className="efb-qr-content-head">
                        <span className="efb-qr-content-title" style={{color: ref.color}}>{ref.title}</span>
                        {ref.note && <span className="efb-qr-content-sub">{ref.note}</span>}
                      </div>
                      <table className="efb-qr-table">
                        <thead>
                          <tr>{ref.cols.map((col, ci) => <th key={ci}>{col}</th>)}</tr>
                        </thead>
                        <tbody>
                          {ref.rows.map((row, ri) => (
                            <tr key={ri}>
                              {row.map((cell, ci) => (
                                <td key={ci} className={ci === 0 ? "efb-qr-cell-key" : ""}>
                                  {ci === 0 && ref.signalDots?.[ri] ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                      <span className={`lgd-dot lgd-${ref.signalDots[ri]}`}/>
                                      {cell}
                                    </span>
                                  ) : cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── POH OVERLAY ── */}
      {activeDrawer.size > 0 && (
        <div className="efb-poh-backdrop" onClick={() => setActiveDrawer(new Set())}>
          <div className="efb-poh-panel" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="efb-poh-head">
              <div>
                <div className="efb-poh-eyebrow">QUICK REFERENCE</div>
                <div className="efb-poh-aircraft">{aircraft?.tailNumber || "N12345"} · Cessna 172S Skyhawk</div>
              </div>
              <button className="efb-btn ghost" onClick={() => setActiveDrawer(new Set())}>ESC ✕</button>
            </div>

            {/* Tab bar */}
            <div className="efb-poh-tabs">
              {[
                { key: "vspeeds", label: "V-SPEEDS",   dot: "#3a9ad4" },
                { key: "perf",    label: "T/O & LNDG", dot: "#3a9ad4" },
                { key: "climb",   label: "CLIMB PERF", dot: "#3a9ad4" },
                { key: "cruise",  label: "CRUISE PERF",dot: "#3a9ad4" },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`efb-poh-tab${pohTab === tab.key ? " active" : ""}`}
                  style={pohTab === tab.key ? { color: "var(--t-primary)", borderBottomColor: tab.dot } : {}}
                  onClick={() => setPohTab(tab.key)}
                >
                  <span className="efb-poh-tab-dot" style={{ background: tab.dot }}/>
                  {tab.label}
                </button>
              ))}
              <div className="efb-poh-tab-actions">
                {pohTab === "vspeeds" && vspeedEditing && (
                  <button className="efb-btn sm warn" onClick={resetVspeeds}>↺ RESET</button>
                )}
                {pohTab === "vspeeds" && (
                  <button className={`efb-btn sm${vspeedEditing ? "" : " ghost"}`} onClick={() => setVspeedEditing(v => !v)}>
                    {vspeedEditing ? "✓ DONE" : "✎ EDIT"}
                  </button>
                )}
                {pohTab === "perf" && perfEditing && (
                  <button className="efb-btn sm warn" onClick={resetPerfData}>↺ RESET</button>
                )}
                {pohTab === "perf" && (
                  <button className={`efb-btn sm${perfEditing ? "" : " ghost"}`} onClick={() => setPerfEditing(v => !v)}>
                    {perfEditing ? "✓ DONE" : "✎ EDIT"}
                  </button>
                )}
                {pohTab === "climb" && climbEditing && (
                  <button className="efb-btn sm warn" onClick={resetClimbData}>↺ RESET</button>
                )}
                {pohTab === "climb" && (
                  <button className={`efb-btn sm${climbEditing ? "" : " ghost"}`} onClick={() => setClimbEditing(v => !v)}>
                    {climbEditing ? "✓ DONE" : "✎ EDIT"}
                  </button>
                )}
                {pohTab === "cruise" && cruiseEditing && (
                  <button className="efb-btn sm warn" onClick={resetCruiseData}>↺ RESET</button>
                )}
                {pohTab === "cruise" && (
                  <button className={`efb-btn sm${cruiseEditing ? "" : " ghost"}`} onClick={() => setCruiseEditing(v => !v)}>
                    {cruiseEditing ? "✓ DONE" : "✎ EDIT"}
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="efb-poh-content">

              {/* ── V-SPEEDS ── */}
              {pohTab === "vspeeds" && vspeeds.map((group, gi) => (
                <div key={gi} className="efb-poh-group">
                  <div className="efb-poh-group-label">{group.group.toUpperCase()}</div>
                  <div className="efb-poh-cards">
                    {group.items.map((item, ii) => {
                      const codeColor = item.danger ? "var(--warn)" : item.caution ? "var(--caution)" : "var(--accent)";
                      return (
                        <div key={ii} className="efb-poh-card">
                          <div className="efb-poh-card-top">
                            <span className="efb-poh-card-code" style={{ color: codeColor }}>
                              {vspeedEditing
                                ? <input value={item.code} onChange={e => updateVspeed(gi, ii, "code", e.target.value)} className="efb-poh-input" style={{ color: codeColor, borderColor: codeColor }}/>
                                : item.code}
                            </span>
                            <span className="efb-poh-card-unit">{item.unit}</span>
                          </div>
                          <div className="efb-poh-card-value">
                            {vspeedEditing
                              ? <input value={item.value} onChange={e => updateVspeed(gi, ii, "value", e.target.value)} className="efb-poh-input wide"/>
                              : item.value}
                          </div>
                          <div className="efb-poh-card-desc">
                            {vspeedEditing
                              ? <input value={item.desc} onChange={e => updateVspeed(gi, ii, "desc", e.target.value)} className="efb-poh-input full"/>
                              : item.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {vspeedEditing && (
                    <button className="efb-poh-add-row" onClick={() => addVspeedItem(gi)}>
                      + Add Speed
                    </button>
                  )}
                </div>
              ))}

              {/* ── T/O & LANDING ── */}
              {pohTab === "perf" && perfData.map((section, si) => (
                <div key={si} className="efb-poh-group">
                  <div className="efb-poh-section-title" style={{ color: "#3a9ad4" }}>{section.group.toUpperCase()}</div>
                  {section.note && <div className="efb-poh-group-note">{section.note}</div>}
                  <table className="efb-poh-table">
                    <thead>
                      <tr>{section.cols.map((col, ci) => <th key={ci}>{col}</th>)}</tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} className={ci === 0 ? "efb-poh-td-key" : ""}>
                              {perfEditing
                                ? <input value={cell} onChange={e => updatePerfCell(si, ri, ci, e.target.value)} className="efb-poh-input full"/>
                                : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {perfEditing && (
                    <button className="efb-poh-add-row" onClick={() => addPerfRow(si)}>
                      + Add Row
                    </button>
                  )}
                </div>
              ))}

              {/* ── CLIMB PERFORMANCE ── */}
              {pohTab === "climb" && climbData.map((section, si) => (
                <div key={si} className="efb-poh-group">
                  <div className="efb-poh-section-title" style={{ color: "#3a9ad4" }}>{section.group.toUpperCase()}</div>
                  {section.note && <div className="efb-poh-group-note">{section.note}</div>}
                  <table className="efb-poh-table">
                    <thead>
                      <tr>{section.cols.map((col, ci) => <th key={ci}>{col}</th>)}</tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} className={ci === 0 ? "efb-poh-td-key" : ""}>
                              {climbEditing
                                ? <input value={cell} onChange={e => updateClimbCell(si, ri, ci, e.target.value)} className="efb-poh-input full"/>
                                : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {climbEditing && (
                    <button className="efb-poh-add-row" onClick={() => addClimbRow(si)}>
                      + Add Row
                    </button>
                  )}
                </div>
              ))}

              {/* ── CRUISE PERFORMANCE ── */}
              {pohTab === "cruise" && cruiseData.map((section, si) => (
                <div key={si} className="efb-poh-group">
                  <div className="efb-poh-section-title" style={{ color: "#3a9ad4" }}>{section.group.toUpperCase()}</div>
                  {section.note && <div className="efb-poh-group-note">{section.note}</div>}
                  <table className="efb-poh-table">
                    <thead>
                      <tr>{section.cols.map((col, ci) => <th key={ci}>{col}</th>)}</tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} className={ci === 0 ? "efb-poh-td-key" : ""}>
                              {cruiseEditing
                                ? <input value={cell} onChange={e => updateCruiseCell(si, ri, ci, e.target.value)} className="efb-poh-input full"/>
                                : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {cruiseEditing && (
                    <button className="efb-poh-add-row" onClick={() => addCruiseRow(si)}>
                      + Add Row
                    </button>
                  )}
                </div>
              ))}

            </div>
          </div>
        </div>
      )}

      {/* ── SCRATCHPAD OVERLAY ── */}
      {scratchpadOpen && (() => {
        const SP_COLORS = ["#e6ecf2","#4ae888","#4ab8e8","#e8c84a","#e85a4a","#c87ae8","#e8a030"];
        const SP_SIZES  = [1.5, 4, 8];
        return (
          <div className="efb-sp-backdrop" onClick={() => setScratchpadOpen(false)}>
            <div className="efb-sp-panel" onClick={e => e.stopPropagation()}>

              {/* ── Head ── */}
              <div className="efb-sp-head">
                <div>
                  <div className="efb-sp-eyebrow">PILOT SCRATCHPAD</div>
                  <div className="efb-sp-title">Notes · {aircraft?.tailNumber || "N12345"}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                  <div className="efb-sp-mode-tabs">
                    <button className={`efb-sp-tab${scratchpadMode==="draw"?" active":""}`} onClick={() => setScratchpadMode("draw")}>✏ DRAW</button>
                    <button className={`efb-sp-tab${scratchpadMode==="type"?" active":""}`} onClick={() => setScratchpadMode("type")}>☰ TYPE</button>
                  </div>
                  <button className="efb-btn ghost" onClick={() => setScratchpadOpen(false)}>ESC ✕</button>
                </div>
              </div>

              {/* ── Draw toolbar ── */}
              {scratchpadMode === "draw" && (
                <div className="efb-sp-toolbar">
                  <div className="efb-sp-tool-group">
                    <button className={`efb-sp-tool-btn${spTool==="pen"?" active":""}`} onClick={() => setSpTool("pen")}>✏ PEN</button>
                    <button className={`efb-sp-tool-btn${spTool==="eraser"?" active":""}`} onClick={() => setSpTool("eraser")}>◻ ERASE</button>
                  </div>
                  <span className="efb-sp-divider"/>
                  <div className="efb-sp-size-group">
                    {SP_SIZES.map(s => (
                      <button key={s} className={`efb-sp-size-btn${spPenSize===s&&spTool==="pen"?" active":""}`}
                        onClick={() => { setSpPenSize(s); setSpTool("pen"); }}>
                        <span className="efb-sp-size-dot" style={{ width: Math.max(s*2, 4), height: Math.max(s*2, 4) }}/>
                      </button>
                    ))}
                  </div>
                  <span className="efb-sp-divider"/>
                  <div className="efb-sp-color-group">
                    {SP_COLORS.map(c => (
                      <button key={c} className={`efb-sp-color-btn${spPenColor===c&&spTool==="pen"?" active":""}`}
                        style={{ background: c }}
                        onClick={() => { setSpPenColor(c); setSpTool("pen"); }}/>
                    ))}
                  </div>
                  <span className="efb-sp-toolbar-spacer"/>
                  <button className="efb-btn sm warn" onClick={() => spClearRef.current && spClearRef.current()}>↺ CLEAR</button>
                </div>
              )}

              {/* ── Body ── */}
              <div className="efb-sp-body">
                {scratchpadMode === "draw" ? (
                  <ScratchpadCanvas
                    storageKey="scratchpad-main-canvas"
                    tool={spTool}
                    penSize={spPenSize}
                    penColor={spPenColor}
                    clearRef={spClearRef}
                  />
                ) : (
                  <textarea
                    className="efb-sp-textarea"
                    value={scratchpadText}
                    onChange={e => { setScratchpadText(e.target.value); try { localStorage.setItem("scratchpad-text", e.target.value); } catch {} }}
                    placeholder="ATIS · CLEARANCES · FREQUENCIES · WEATHER · NOTAMS · PIREPS..."
                  />
                )}
              </div>

              {/* ── Status bar ── */}
              <div className="efb-sp-statusbar">
                <span>
                  {scratchpadMode === "type"
                    ? `FREE TEXT · AUTO-SAVED · ${scratchpadText.length} CHARS`
                    : spTool === "eraser"
                      ? "ERASER · DRAG TO ERASE"
                      : `PEN · ${spPenSize}PX · ${spPenColor.toUpperCase()}`
                  }
                </span>
                <span>ESC TO CLOSE · NOTES PERSIST FOR THIS FLIGHT</span>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
