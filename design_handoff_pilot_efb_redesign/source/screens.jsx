/* =========================================================
   Screens — PreFlight, Fires, SmartComs
   ========================================================= */

/* ---- Checkbox row ---- */
function CheckRow({ item, checked, onToggle }) {
  return (
    <div className={`check-row${checked ? " checked" : ""}`} onClick={onToggle}>
      <div className="check-box">
        <Icon name="check" size={12} stroke={2.5} />
      </div>
      <div className="check-label">{item.label}</div>
      <div className={`check-value${item.critical ? " critical" : ""}`}>{item.value}</div>
    </div>
  );
}

/* ---- Section block (e.g. Cockpit Initial) ---- */
function ChecklistSection({ section, checked, toggleItem, tone = "default" }) {
  const total = section.items.length;
  const done = section.items.filter(i => checked[i.id]).length;
  const pct = total ? Math.round((done/total)*100) : 0;
  const allDone = done === total && total > 0;
  return (
    <div className={`checklist-section${tone === "warn" ? " warn" : ""}${allDone ? " done" : ""}`}>
      <div className="checklist-section-head">
        <div className="checklist-section-title">
          <span className="checklist-section-name">
            {section.name}
          </span>
          <span className="checklist-section-count">{done}/{total}</span>
        </div>
        <div className="checklist-section-progress">
          <div className="checklist-section-bar">
            <div
              className={`checklist-section-bar-fill${allDone ? " ok" : ""}${tone === "warn" && !allDone ? " warn" : ""}`}
              style={{ width: `${pct}%` }}
            ></div>
          </div>
          <span className="checklist-section-pct">{pct}%</span>
        </div>
        <div className="checklist-section-actions">
          <button className="btn btn-sm btn-ok"><Icon name="play" size={10}/> READ</button>
          <button className="btn btn-sm"><Icon name="edit" size={10}/> EDIT</button>
        </div>
      </div>
      {section.warning && (
        <div className="checklist-warning">
          <Icon name="alert" size={14} />
          <span>{section.warning}</span>
        </div>
      )}
      {section.note && (
        <div className="checklist-note">★ {section.note}</div>
      )}
      <div>
        {section.items.map((it) => (
          <CheckRow key={it.id} item={it} checked={!!checked[it.id]} onToggle={() => toggleItem(it.id)} />
        ))}
      </div>
    </div>
  );
}

/* ---- POH collapsible card ---- */
function POHCard({ id, title, accent, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`poh-card${open ? " expanded" : ""}`}>
      <div className="poh-card-head" onClick={() => setOpen(!open)}>
        <div className="poh-card-title">
          <span className="accent-dot" style={accent ? { background: accent } : undefined}></span>
          <span style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.18s", color: "var(--t-tertiary)" }}>▸</span>
          {title}
        </div>
        <button className="btn btn-sm" onClick={(e) => e.stopPropagation()}>
          <Icon name="edit" size={10}/> EDIT
        </button>
      </div>
      {open && <div className="poh-card-body">{children}</div>}
    </div>
  );
}

/* ---- V-Speeds Grid ---- */
function VSpeedsGrid() {
  const { VSPEEDS } = PILOT_DATA;
  return (
    <>
      {Object.entries(VSPEEDS).map(([k, group]) => (
        <div key={k} className="vspeed-group">
          <div className="vspeed-group-label">{group.label}</div>
          <div className="vspeed-grid">
            {group.items.map((v) => (
              <div key={v.code} className={`vspeed-card${v.tone ? " " + v.tone : ""}`}>
                <div className="vspeed-card-top">
                  <span className="vspeed-code">{v.code}</span>
                  <span className="vspeed-unit">{v.unit}</span>
                </div>
                <div className="vspeed-value">{v.value}</div>
                <div className="vspeed-name">{v.name}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/* ---- Performance table ---- */
function PerfTable({ data }) {
  return (
    <div className="perf-block">
      <div className="perf-block-head">
        <div className="perf-block-title">{data.title}</div>
        <div className="perf-block-sub">{data.sub}</div>
      </div>
      <table className="perf-table">
        <thead>
          <tr>
            <th>Condition</th>
            <th>Grnd Roll</th>
            <th>Over 50 ft</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, i) => (
            <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---- Pre-Flight screen ---- */
function PreFlightScreen({ checked, toggleItem }) {
  const total = PILOT_DATA.PREFLIGHT.reduce((n, s) => n + s.items.length, 0);
  const done = PILOT_DATA.PREFLIGHT.reduce((n, s) => n + s.items.filter(i => checked[i.id]).length, 0);
  const allDone = done === total;

  return (
    <div className="content-inner">
      <header className="page-header">
        <div>
          <h1 className="page-title">Pre-Flight</h1>
          <div className="page-subtitle">{PILOT_DATA.AIRCRAFT.type} · External & cockpit walk-around</div>
        </div>
        <div className="page-meta">
          <span className={`chip ${allDone ? "chip-done" : "chip-progress"}`}>
            {allDone ? "READY" : "IN PROGRESS"} · <span className="chip-num">{done}/{total}</span>
          </span>
          <button className="btn btn-icon" title="Reset"><Icon name="reset" size={14}/></button>
        </div>
      </header>

      {PILOT_DATA.PREFLIGHT.map((sec) => (
        <ChecklistSection key={sec.id} section={sec} checked={checked} toggleItem={toggleItem} />
      ))}
    </div>
  );
}

/* ---- POH Quick Reference Overlay — globally accessible ---- */
function POHOverlay({ open, onClose }) {
  const [tab, setTab] = useState("vspeeds");
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const tabs = [
    { id: "vspeeds", label: "V-Speeds",    accent: "var(--accent)",  body: <VSpeedsGrid /> },
    { id: "to",      label: "T/O & Lndg",  accent: "var(--caution)", body: <><PerfTable data={PILOT_DATA.TAKEOFF_NORMAL}/><PerfTable data={PILOT_DATA.TAKEOFF_SHORT}/></> },
    { id: "climb",   label: "Climb Perf",  accent: "var(--ok)",      body: <div style={{ color: "var(--t-tertiary)", fontFamily: "var(--f-mono)", fontSize: 12 }}>Tap EDIT to load climb tables for your weight & temperature.</div> },
    { id: "cruise",  label: "Cruise Perf", accent: "#9F7AEA",        body: <div style={{ color: "var(--t-tertiary)", fontFamily: "var(--f-mono)", fontSize: 12 }}>Tap EDIT to load cruise power tables.</div> },
  ];
  const active = tabs.find(t => t.id === tab);

  return (
    <div className="poh-overlay-backdrop" onClick={onClose}>
      <div className="poh-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="poh-overlay-head">
          <div className="poh-overlay-title">
            <span className="poh-overlay-eyebrow">Quick Reference</span>
            <span className="poh-overlay-aircraft">{PILOT_DATA.AIRCRAFT.tail} · {PILOT_DATA.AIRCRAFT.type}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ESC <span style={{ marginLeft: 4 }}>✕</span>
          </button>
        </div>
        <div className="poh-overlay-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`poh-overlay-tab${tab === t.id ? " active" : ""}`}
              style={{ "--tab-accent": t.accent }}
              onClick={() => setTab(t.id)}
            >
              <span className="poh-tab-dot" style={{ background: t.accent }}></span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="poh-overlay-body">
          {active?.body}
        </div>
      </div>
    </div>
  );
}

window.POHOverlay = POHOverlay;

/* ---- Fires (emergency) screen ---- */
function FiresScreen({ checked, toggleItem, accent }) {
  const total = PILOT_DATA.FIRES.reduce((n, s) => n + s.items.length, 0);
  const done = PILOT_DATA.FIRES.reduce((n, s) => n + s.items.filter(i => checked[i.id]).length, 0);
  const titleColor = accent || "var(--warn)";
  return (
    <div className="content-inner" style={accent ? { "--screen-accent": accent } : undefined}>
      <header className="page-header" style={{ borderBottomColor: accent || "var(--warn-line)" }}>
        <div>
          <h1 className="page-title" style={{ color: titleColor }}>Fires</h1>
          <div className="page-subtitle">Memory items first · C172S</div>
        </div>
        <div className="page-meta">
          <span className="chip chip-warn"><span className="chip-num">{done}/{total}</span> INCOMPLETE</span>
          <button className="btn btn-icon"><Icon name="reset" size={14}/></button>
        </div>
      </header>
      {PILOT_DATA.FIRES.map((sec) => (
        <ChecklistSection key={sec.id} section={sec} checked={checked} toggleItem={toggleItem} tone="warn"/>
      ))}
    </div>
  );
}

/* ---- Smart Coms screen ---- */
function SmartComsScreen({ live, onListen }) {
  const [tab, setTab] = useState("active");
  const [armed, setArmed] = useState({});
  const [values, setValues] = useState({});
  const armToggle = (id) => setArmed((a) => ({ ...a, [id]: !a[id] }));
  const setField = (id, v) => setValues((s) => ({ ...s, [id]: v }));

  const seedExample = () => {
    setValues({
      ident: "Charlie", wind: "270° AT 12KT", alt: "29.92", vis: "10SM", sky: "FEW 3500", caut: "Birds in vicinity",
      rwy: "12C", via: "Y > Y1 > B", hold: "RWY 12R", instr: "Contact tower 119.9 when ready",
    });
    setArmed({ atis: true, taxi: true });
  };

  return (
    <div className="content-inner">
      <div className="radio-hero">
        <div className="radio-hero-head">
          <div className="radio-hero-title">
            <span className="radio-hero-icon"><Icon name="radar" size={18}/></span>
            <div>
              <div className="radio-hero-name">Smart Communication AI</div>
              <div className="radio-hero-sub">Callsign: {PILOT_DATA.AIRCRAFT.tail} · {live ? "Listening" : "Standby"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm" onClick={seedExample}>Demo Capture</button>
            <button className={`btn btn-sm ${live ? "btn-warn" : "btn-primary"}`} onClick={onListen}>
              <Icon name={live ? "mic" : "play"} size={11}/>
              {live ? "STOP" : "LISTEN"}
            </button>
          </div>
        </div>

        <Waveform live={live} />

        <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--t-tertiary)", letterSpacing: "0.06em", textAlign: "center" }}>
          {live
            ? <>TRANSCRIBING · 121.500 MHz · <span style={{ color: "var(--accent)" }}>conf 96%</span></>
            : "TAP LISTEN TO BEGIN MONITORING"}
        </div>
      </div>

      <div className="radio-tabs">
        <div className={`radio-tab${tab === "active" ? " active" : ""}`} onClick={() => setTab("active")}>
          Active Feed <span className="tab-count">3</span>
        </div>
        <div className={`radio-tab${tab === "archive" ? " active" : ""}`} onClick={() => setTab("archive")}>
          Archive Log <span className="tab-count">12</span>
        </div>
        <div className={`radio-tab${tab === "freq" ? " active" : ""}`} onClick={() => setTab("freq")}>
          Nearest Freqs <span className="tab-count">6</span>
        </div>
      </div>

      {tab === "active" && (
        <>
          {!live && Object.keys(values).length === 0 && (
            <div className="radio-empty">
              <div className="radio-empty-icon"><Icon name="antenna" size={22}/></div>
              <div className="radio-empty-title">Awaiting Transmission</div>
              <div className="radio-empty-sub">Forms below auto-fill from captured ATC audio.</div>
            </div>
          )}

          {PILOT_DATA.CLEARANCES.map((c) => (
            <div key={c.id} className={`clearance-card${armed[c.id] ? " armed" : ""}`}>
              <div className="clearance-head">
                <div className="clearance-title">
                  <span className="clearance-name">{c.name}</span>
                  <span className="clearance-sub">{c.sub}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className={`btn btn-sm ${armed[c.id] ? "btn-ok" : ""}`}
                    onClick={() => armToggle(c.id)}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: armed[c.id] ? "var(--ok)" : "var(--t-quiet)" }}></span>
                    {armed[c.id] ? "ARMED" : "ARM"}
                  </button>
                  <button
                    className="btn btn-sm btn-warn"
                    onClick={() => { c.fields.forEach(f => setField(f.id, "")); setArmed(a => ({...a, [c.id]: false})); }}
                  >
                    <Icon name="reset" size={10}/> CLR
                  </button>
                </div>
              </div>
              <div className="clearance-body">
                {c.fields.map((f) => (
                  <React.Fragment key={f.id}>
                    {f.critical && (
                      <div className="hold-short-banner">
                        <Icon name="alert" size={10}/>
                        Hold Short
                      </div>
                    )}
                    <span className="field-label">{f.label}</span>
                    <input
                      className={`field-input${f.critical ? " critical" : ""}${values[f.id] ? " has-value" : ""}`}
                      placeholder={f.placeholder}
                      value={values[f.id] || ""}
                      onChange={(e) => setField(f.id, e.target.value)}
                    />
                    <button className="field-copy" title="Copy"><Icon name="copy" size={12}/></button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}

          <div className="radio-replay-bar">
            <Icon name="play" size={11}/>
            Replay Last 10 Seconds
          </div>
        </>
      )}

      {tab === "archive" && <ArchiveLog />}
      {tab === "freq" && <NearestFreqs />}
    </div>
  );
}

function Waveform({ live }) {
  const [bars, setBars] = useState(() => Array.from({ length: 64 }, () => 6));
  useEffect(() => {
    if (!live) { setBars(Array.from({ length: 64 }, () => 3)); return; }
    const id = setInterval(() => {
      setBars((prev) => prev.map((_, i) => {
        // smooth-ish random
        const base = 8 + Math.sin(Date.now()/300 + i*0.4) * 12;
        const noise = Math.random() * 30;
        return Math.max(4, Math.min(48, base + noise));
      }));
    }, 80);
    return () => clearInterval(id);
  }, [live]);
  return (
    <div className={`waveform${live ? "" : " idle"}`}>
      {bars.map((h, i) => (
        <div key={i} className="waveform-bar" style={{ height: h, opacity: live ? 0.35 + (h/48)*0.6 : 0.2 }} />
      ))}
    </div>
  );
}

function ArchiveLog() {
  const entries = [
    { t: "16:48Z", from: "TOWER", text: "Skyhawk 12345, cleared for takeoff runway 12 center, fly heading 130." },
    { t: "16:42Z", from: "GROUND", text: "Skyhawk 12345, taxi to runway 12 center via Yankee, hold short Bravo." },
    { t: "16:35Z", from: "CLNC DEL", text: "Cleared to KOAK via JANIC, climb maintain 4000, expect 8000 in 10, squawk 4271." },
    { t: "16:30Z", from: "ATIS", text: "Information Charlie, wind 270 at 12, altimeter 29.92, runway 12 center in use." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {entries.map((e, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 90px 1fr auto", gap: 12, padding: "12px 16px", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--t-tertiary)", letterSpacing: "0.06em" }}>{e.t}</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{e.from}</span>
          <span style={{ color: "var(--t-secondary)", fontSize: 13 }}>{e.text}</span>
          <button className="btn btn-sm btn-ghost"><Icon name="play" size={10}/> 4s</button>
        </div>
      ))}
    </div>
  );
}

function NearestFreqs() {
  const freqs = [
    { name: "Tower",       freq: "118.300", apt: "KOAK", dist: "0 NM" },
    { name: "Ground",      freq: "121.900", apt: "KOAK", dist: "0 NM" },
    { name: "ATIS",        freq: "128.500", apt: "KOAK", dist: "0 NM" },
    { name: "NorCal App",  freq: "120.900", apt: "Sector 9", dist: "—" },
    { name: "CTAF",        freq: "122.800", apt: "KLVK", dist: "23 NM" },
    { name: "Guard",       freq: "121.500", apt: "—",   dist: "—" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
      {freqs.map((f, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t-primary)" }}>{f.name}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--t-tertiary)", letterSpacing: "0.06em" }}>{f.apt} · {f.dist}</div>
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 18, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.04em" }}>{f.freq}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { PreFlightScreen, FiresScreen, SmartComsScreen });
