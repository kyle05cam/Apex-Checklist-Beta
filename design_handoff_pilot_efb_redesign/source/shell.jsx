/* =========================================================
   Shell — TopBar, NavRails, StatusBar, RadioBar
   ========================================================= */
const { useState, useEffect, useRef, useMemo } = React;

/* ---- Top Bar ---- */
function TopBar({ night, setNight, timer, onTimer, onReset, onBack, onScratch, onPoh }) {
  const local = useLocalClock();
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <Icon name="back" size={14} />
          <span style={{ letterSpacing: "0.1em" }}>HANGAR</span>
        </button>
      </div>

      <div className="topbar-center">
        <div className="flight-timer">
          <span className="flight-timer-label">Flt Timer</span>
          <span className={`flight-timer-value${timer.running ? " running" : ""}`}>
            {fmtTimer(timer.seconds)}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button className={`btn ${timer.running ? "btn-warn" : "btn-ok"} btn-sm`} onClick={onTimer}>
              <Icon name={timer.running ? "stop" : "play"} size={11} />
              {timer.running ? "STOP" : "START"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onReset} title="Reset timer">
              <Icon name="reset" size={11} />
            </button>
          </div>
        </div>

        <div className="tail">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12l-9-2-4-7-2 1 2 7-5 2v2l5 1 1 5 2 1 3-5 7-1z"/></svg>
          </span>
          <span className="tail-no">{PILOT_DATA.AIRCRAFT.tail}</span>
          <span className="tail-type">{PILOT_DATA.AIRCRAFT.type}</span>
        </div>

        <div className="clocks">
          <div className="clock">
            <span className="clock-label">Local</span>
            <span className="clock-value">{local.local}</span>
          </div>
          <div className="clock zulu">
            <span className="clock-label">Zulu</span>
            <span className="clock-value">{local.zulu}Z</span>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <button className="btn btn-ghost btn-sm" onClick={onPoh} title="POH Quick Reference">
          <Icon name="note" size={14} />
          <span style={{ letterSpacing: "0.08em" }}>POH</span>
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onScratch} title="Scratchpad">
          <Icon name="edit" size={14} />
          <span style={{ letterSpacing: "0.08em" }}>NOTES</span>
        </button>
        <div className="divider-v"></div>
        <button className={`toggle${night ? " on" : ""}`} onClick={() => setNight(!night)}>
          <Icon name={night ? "moon" : "sun"} size={14} />
          <span className="toggle-track"><span className="toggle-thumb"></span></span>
          <span className="toggle-label">{night ? "Night" : "Day"}</span>
        </button>
      </div>
    </header>
  );
}

function useLocalClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    local: `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`,
    zulu:  `${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}`,
  };
}
function fmtTimer(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  const pad = (n) => String(n).padStart(2,"0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/* ---- Left rail (normal ops) ---- */
function LeftRail({ active, onPick, completion, onMore }) {
  return (
    <nav className="rail-l">
      <div className="rail-section-label">Phase</div>
      {PILOT_DATA.NAV_LEFT.map((n) => {
        const c = completion[n.id] || { done: 0, total: n.count };
        const isComplete = c.done >= c.total && c.total > 0;
        return (
          <button
            key={n.id}
            className={`rail-item${active === n.id ? " active" : ""}${isComplete ? " complete" : ""}`}
            onClick={() => onPick(n.id)}
          >
            <span className="ico"><Icon name={n.icon} size={20} /></span>
            <span className="lbl">{n.label}</span>
            <span className="cnt">{c.done}/{c.total}</span>
          </button>
        );
      })}
      <div className="rail-spacer"></div>
      <button
        className="rail-item"
        title="Quick Reference"
        onClick={onMore}
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <span className="ico"><Icon name="more" size={22} /></span>
        <span className="lbl">More</span>
      </button>
    </nav>
  );
}

/* ---- Right rail (emergencies) ---- */
function RightRail({ active, onPick }) {
  return (
    <nav className="rail-r">
      <div className="rail-section-label" style={{ color: "var(--warn)" }}>EMG</div>
      {PILOT_DATA.NAV_RIGHT.map((n) => (
        <button
          key={n.id}
          className={`rail-item rail-emg${active === n.id ? " active" : ""}`}
          onClick={() => onPick(n.id)}
          style={{ "--emg-color": n.color }}
        >
          <span className="ico"><Icon name={n.icon} size={28} stroke={1.6} /></span>
          <span className="lbl">{n.label}</span>
          <span className="cnt">0/{n.count}</span>
        </button>
      ))}
      <div className="rail-spacer"></div>
      <button
        className={`rail-item${active === "smartcoms" ? " active" : ""}`}
        onClick={() => onPick("smartcoms")}
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <span className="ico"><Icon name="mic" size={22} /></span>
        <span className="lbl">Smart<br/>Coms</span>
      </button>
    </nav>
  );
}

/* ---- Live radio panel (above content) ---- */
function RadioBar({ live, onListen, onSmartComs }) {
  return (
    <div className={`radio-panel${live ? " live" : ""}`}>
      <div className="radio-panel-head">
        <div className="radio-panel-status">
          <span className={`radio-dot${live ? " live" : ""}`}></span>
          <Icon name="antenna" size={14} />
          <span className="radio-label">Live Radio</span>
          {live && <span className="radio-freq">121.500 MHz</span>}
          {!live && <span className="radio-substatus">Standby · Tap Listen to begin monitoring</span>}
        </div>
        <div className="radio-panel-actions">
          <button className="btn btn-ghost btn-sm" onClick={onSmartComs}>
            <Icon name="radar" size={12} />
            Smart Coms
          </button>
          <button className={`btn ${live ? "btn-warn" : "btn-primary"} btn-sm`} onClick={onListen}>
            <Icon name={live ? "mic" : "play"} size={11} />
            {live ? "STOP" : "LISTEN"}
          </button>
        </div>
      </div>

      {live ? (
        <>
          {/* Current transmission — large + readable */}
          <div className="radio-current">
            <div className="radio-current-meta">
              <span className="radio-current-time">16:48Z</span>
              <span className="radio-current-from">TOWER</span>
              <span className="radio-current-freq">121.500</span>
              <span className="radio-current-conf">conf 96%</span>
              <span className="radio-current-live-dot"></span>
              <span className="radio-current-live-label">LIVE</span>
            </div>
            <div className="radio-current-text">
              "Skyhawk one-two-three-four-five, cleared for takeoff runway one-two center, fly heading one-three-zero, contact departure on one-two-zero-point-nine."
            </div>
          </div>

          {/* History — last 3 transmissions */}
          <div className="radio-history">
            {RADIO_HISTORY.map((h, i) => (
              <div key={i} className="radio-history-row">
                <span className="rh-time">{h.time}</span>
                <span className="rh-from">{h.from}</span>
                <span className="rh-freq">{h.freq}</span>
                <span className="rh-text">{h.text}</span>
                <button className="rh-replay" title="Replay"><Icon name="play" size={10}/></button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="radio-idle">
          <div className="radio-idle-message">
            <Icon name="antenna" size={28} />
            <div>
              <div className="radio-idle-title">No active transmission</div>
              <div className="radio-idle-sub">Live ATC transcription will appear here · last 3 transmissions retained</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const RADIO_HISTORY = [
  { time: "16:42Z", from: "GROUND",   freq: "121.900", text: "Skyhawk 12345, taxi to runway 12 center via Yankee, hold short Bravo." },
  { time: "16:35Z", from: "CLNC DEL", freq: "119.650", text: "Cleared to KOAK via JANIC, climb maintain 4000, expect 8000, squawk 4271." },
  { time: "16:30Z", from: "ATIS",     freq: "128.500", text: "Information Charlie, wind 270 at 12, altimeter 29.92, runway 12C in use." },
];

/* ---- Status bar (footer) ---- */
function StatusBar({ totalItems, totalDone, screen }) {
  return (
    <footer className="statusbar">
      <span className="status-item">
        <span className="status-dot ok"></span>
        <span>GPS · 8 SV</span>
      </span>
      <span className="status-item">
        <span className="status-dot accent"></span>
        <span>ADS-B IN</span>
      </span>
      <span className="status-item">
        <span className="status-dot ok"></span>
        <span>SYNC · Cloud</span>
      </span>
      <span className="status-spacer"></span>
      <span>{totalDone}/{totalItems} CHECKLIST ITEMS · {screen.toUpperCase()}</span>
      <span className="status-item">{PILOT_DATA.AIRCRAFT.rev}</span>
    </footer>
  );
}

Object.assign(window, { TopBar, LeftRail, RightRail, RadioBar, StatusBar });
