/* =========================================================
   Icon set — minimal stroke icons (no emoji)
   ========================================================= */
const Icon = ({ name, size = 18, stroke = 1.6 }) => {
  const s = { width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const P = (d) => <svg viewBox="0 0 24 24" {...s}><path d={d} /></svg>;
  switch (name) {
    case "plane":   return P("M21 12l-9-2-4-7-2 1 2 7-5 2v2l5 1 1 5 2 1 3-5 7 -1z");
    case "preflight": return <svg viewBox="0 0 24 24" {...s}>
      {/* Clipboard body */}
      <rect x="5" y="4" width="14" height="17" rx="2"/>
      {/* Clip at top */}
      <path d="M9 4V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"/>
      {/* Top line */}
      <path d="M9 9h6"/>
      {/* Checkmark in middle */}
      <path d="M8.5 14l2 2 4-4" strokeWidth="2"/>
      {/* Bottom line */}
      <path d="M9 18h4"/>
    </svg>;
    case "gear":    return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3h0a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>;
    case "startup": return <svg viewBox="0 0 24 24" {...s}>
      {/* Ignition key — head + shaft + teeth */}
      <circle cx="8" cy="12" r="4"/>
      <circle cx="8" cy="12" r="1.2" fill="currentColor"/>
      <path d="M12 12h9"/>
      <path d="M17 12v3"/>
      <path d="M20 12v2"/>
    </svg>;
    case "wheel":   return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/></svg>;
    case "taxi": return <svg viewBox="0 0 24 24" {...s}>
      {/* Curved taxiway path with dashes */}
      <path d="M3 19c4 0 5-4 9-4s5 4 9 4" strokeDasharray="2 2" opacity="0.7"/>
      {/* Top-down aircraft silhouette */}
      <g transform="translate(12 9)">
        {/* Fuselage */}
        <path d="M0 -4v8"/>
        {/* Wings */}
        <path d="M-5 -0.5h10"/>
        {/* Tail */}
        <path d="M-2 3.5h4"/>
        {/* Nose dot */}
        <circle cx="0" cy="-4" r="0.6" fill="currentColor"/>
      </g>
    </svg>;
    case "up":      return P("M12 19V5M5 12l7-7 7 7");
    case "takeoff": return <svg viewBox="0 0 24 24" {...s}>
      {/* Runway line */}
      <path d="M3 20h18" strokeLinecap="round"/>
      {/* Plane angled up, climbing */}
      <path d="M20.5 3.5l-7.5 6.5 -5 -1.5 -1.5 1.5 4 3 -1.5 2.5 2 1 4.5 -5 5.5 -3z" strokeLinejoin="round"/>
    </svg>;
    case "down":    return P("M12 5v14M5 12l7 7 7-7");
    case "landing": return <svg viewBox="0 0 24 24" {...s}>
      {/* Runway line */}
      <path d="M3 20h18" strokeLinecap="round"/>
      {/* Plane descending — takeoff shape mirrored vertically */}
      <g transform="translate(0 17) scale(1 -1) translate(0 -3)">
        <path d="M20.5 3.5l-7.5 6.5 -5 -1.5 -1.5 1.5 4 3 -1.5 2.5 2 1 4.5 -5 5.5 -3z" strokeLinejoin="round"/>
      </g>
    </svg>;
    case "cruise":  return <svg viewBox="0 0 24 24" {...s}>
      {/* Side-view aircraft in level cruise flight */}
      {/* Fuselage */}
      <path d="M2 12l3-1.5 9-1.5 6 0.5 2 1.5-2 1.5-6 0.5-9-1.5z" strokeLinejoin="round"/>
      {/* Wing */}
      <path d="M11 10.5l-2 -4 2 0 4 4" strokeLinejoin="round"/>
      {/* Tail fin */}
      <path d="M3.5 11.2l-1.5 -3 1.5 0 2 2.5" strokeLinejoin="round"/>
      {/* Cockpit window dot */}
      <circle cx="20" cy="12" r="0.6" fill="currentColor"/>
    </svg>;
    case "stop":    return <svg viewBox="0 0 24 24" {...s}><rect x="5" y="5" width="14" height="14" rx="1.5"/></svg>;
    case "power":   return <svg viewBox="0 0 24 24" {...s}>
      {/* Classic IEC power symbol — open ring + vertical line */}
      <path d="M12 3v9" strokeLinecap="round"/>
      <path d="M6.5 7.5a8 8 0 1 0 11 0" strokeLinecap="round"/>
    </svg>;
    case "fire":    return P("M12 2s4 3 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 9 11 10 11c0-3 2-5 2-9zM7 14a5 5 0 0 0 10 0c0-1-.5-2-1-3 0 2-1.5 3-3 3 0-2-1-3-2-4-1 2-4 2-4 4z");
    case "engine":  return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="7" width="14" height="10" rx="1"/><path d="M17 10h3v4h-3M7 7v-2M11 7v-2M15 7v-2M7 17v2M11 17v2M15 17v2"/></svg>;
    case "spin":    return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18" strokeDasharray="2 3"/><circle cx="12" cy="12" r="2.5"/></svg>;
    case "snow":    return P("M12 2v20M4.2 7l15.6 10M4.2 17l15.6-10M2 12h20");
    case "bolt":    return P("M13 2L4 14h7l-1 8 9-12h-7l1-8z");
    case "menu":    return P("M4 7h16M4 12h16M4 17h16");
    case "back":    return P("M15 18l-6-6 6-6");
    case "play":    return <svg viewBox="0 0 24 24" {...s}><path d="M6 4l14 8-14 8z" fill="currentColor"/></svg>;
    case "reset":   return P("M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5");
    case "edit":    return P("M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z");
    case "note":    return <svg viewBox="0 0 24 24" {...s}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>;
    case "mic":     return <svg viewBox="0 0 24 24" {...s}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>;
    case "mic-off": return <svg viewBox="0 0 24 24" {...s}><path d="M2 2l20 20M9 9v2a3 3 0 0 0 5 2M15 9V6a3 3 0 0 0-5-2M5 11a7 7 0 0 0 11 5.4M12 18v3M9 21h6"/></svg>;
    case "radar":   return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6-6"/></svg>;
    case "check":   return P("M5 12l4 4 10-10");
    case "alert":   return P("M12 3l10 18H2L12 3zM12 10v5M12 18v.5");
    case "more":    return P("M4 6h16M4 12h16M4 18h16");
    case "copy":    return <svg viewBox="0 0 24 24" {...s}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>;
    case "antenna": return P("M12 20v-6M8 8a4 4 0 0 1 8 0M5 5a8 8 0 0 1 14 0M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z");
    case "moon":    return P("M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z");
    case "sun":     return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>;
    case "tower":   return P("M5 21l3-9 4-1 4 1 3 9M12 11V3M9 5h6");
    default: return null;
  }
};

window.Icon = Icon;
