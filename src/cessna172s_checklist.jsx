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
        { l: "Fire Extinguisher
