/* =========================================================
   Root app — state, routing, tweaks
   ========================================================= */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "blue",
  "surface": "navy",
  "density": "comfy",
  "showRadioBar": true,
  "showStatusBar": true,
  "uiFont": "Inter",
  "monoFont": "JetBrains Mono"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = ["blue", "cyan", "sage", "amber", "orange"];
const SURFACE_OPTIONS = ["navy", "slate", "warm"];

function PilotApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [night, setNight] = useState(true); // default to night
  const [active, setActive] = useState("preflight");
  const [live, setLive] = useState(false);
  const [timer, setTimer] = useState({ running: false, seconds: 0 });
  const [checked, setChecked] = useState({});
  const [pohOpen, setPohOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [spOpen, setSpOpen] = useState(false);

  // Apply accent / surface tokens to root html
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-accent", t.accent);
    root.setAttribute("data-surface", t.surface);
    root.classList.toggle("dense", t.density === "dense");
    root.classList.toggle("comfy", t.density !== "dense");
    root.style.setProperty("--f-ui", `"${t.uiFont}", -apple-system, BlinkMacSystemFont, sans-serif`);
    root.style.setProperty("--f-mono", `"${t.monoFont}", "SF Mono", ui-monospace, monospace`);
  }, [t]);

  // Apply day/night mode
  useEffect(() => {
    document.documentElement.setAttribute("data-mode", night ? "night" : "day");
  }, [night]);

  // Flight timer
  useEffect(() => {
    if (!timer.running) return;
    const id = setInterval(() => setTimer((s) => ({ ...s, seconds: s.seconds + 1 })), 1000);
    return () => clearInterval(id);
  }, [timer.running]);

  const toggleItem = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  // Completion counts for left rail
  const completion = useMemo(() => {
    const out = {};
    out.preflight = countDone(PILOT_DATA.PREFLIGHT, checked);
    Object.entries(PHASE_DATA).forEach(([k, v]) => {
      out[k] = countDone(v.sections, checked);
    });
    return out;
  }, [checked]);

  const totalItems = PILOT_DATA.NAV_LEFT.reduce((n, x) => n + x.count, 0);
  const totalDone  = Object.values(completion).reduce((n, x) => n + (x?.done || 0), 0);

  const onPick = (id) => setActive(id);

  let screen = null;
  const emgItem = PILOT_DATA.NAV_RIGHT.find(n => n.id === active);
  const emgColor = emgItem?.color;
  if (active === "preflight") screen = <PreFlightScreen checked={checked} toggleItem={toggleItem} />;
  else if (active === "smartcoms") screen = <SmartComsScreen live={live} onListen={() => setLive(!live)} />;
  else if (active === "fires") screen = <FiresScreen checked={checked} toggleItem={toggleItem} accent={emgColor} />;
  else if (PHASE_DATA[active]) screen = <GenericChecklistScreen phase={active} checked={checked} toggleItem={toggleItem} />;
  else if (EMG_DATA[active]) screen = <GenericChecklistScreen phase={active} checked={checked} toggleItem={toggleItem} tone="warn" accent={emgColor} />;
  else screen = <PreFlightScreen checked={checked} toggleItem={toggleItem} />;

  return (
    <div className="app">
      <TopBar
        night={night}
        setNight={setNight}
        timer={timer}
        onTimer={() => setTimer((s) => ({ ...s, running: !s.running }))}
        onReset={() => setTimer({ running: false, seconds: 0 })}
        onBack={() => setActive("preflight")}
        onScratch={() => setSpOpen(true)}
        onPoh={() => setPohOpen(true)}
      />
      <LeftRail active={active} onPick={onPick} completion={completion} onMore={() => setQrOpen(true)} />
      {t.showRadioBar && active !== "smartcoms" && (
        <RadioBar
          live={live}
          onListen={() => setLive(!live)}
          onSmartComs={() => setActive("smartcoms")}
        />
      )}
      <main className="main">
        <div className="content">{screen}</div>
      </main>
      <RightRail active={active} onPick={onPick} />
      {t.showStatusBar && (
        <StatusBar totalItems={totalItems} totalDone={totalDone} screen={active} />
      )}

      <POHOverlay open={pohOpen} onClose={() => setPohOpen(false)} />
      <QuickRefOverlay open={qrOpen} onClose={() => setQrOpen(false)} />
      <ScratchpadOverlay open={spOpen} onClose={() => setSpOpen(false)} />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Theme">
          <TweakSelect
            label="Accent"
            value={t.accent}
            onChange={(v) => setTweak("accent", v)}
            options={ACCENT_OPTIONS}
          />
          <TweakRadio
            label="Surface"
            value={t.surface}
            onChange={(v) => setTweak("surface", v)}
            options={SURFACE_OPTIONS}
          />
        </TweakSection>
        <TweakSection title="Layout">
          <TweakRadio label="Density" value={t.density} onChange={(v) => setTweak("density", v)} options={["comfy","dense"]} />
          <TweakToggle label="Live radio bar" value={t.showRadioBar} onChange={(v) => setTweak("showRadioBar", v)} />
          <TweakToggle label="Status bar" value={t.showStatusBar} onChange={(v) => setTweak("showStatusBar", v)} />
        </TweakSection>
        <TweakSection title="Type">
          <TweakSelect
            label="UI font"
            value={t.uiFont}
            onChange={(v) => setTweak("uiFont", v)}
            options={["Inter", "IBM Plex Sans", "Geist", "Manrope", "Outfit", "Space Grotesk"]}
          />
          <TweakSelect
            label="Mono font"
            value={t.monoFont}
            onChange={(v) => setTweak("monoFont", v)}
            options={["JetBrains Mono", "IBM Plex Mono", "Geist Mono", "Space Mono", "Fira Code"]}
          />
        </TweakSection>
        <TweakSection title="Demo">
          <TweakButton label="Toggle live radio" onClick={() => setLive(!live)} />
          <TweakButton label="Check 5 items" onClick={() => {
            const ids = PILOT_DATA.PREFLIGHT.flatMap(s => s.items.slice(0,2).map(i => i.id)).slice(0,5);
            const next = {...checked}; ids.forEach(id => next[id] = true); setChecked(next);
          }} />
          <TweakButton label="Clear all checks" onClick={() => setChecked({})} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function countDone(sections, checked) {
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  const done  = sections.reduce((n, s) => n + s.items.filter(i => checked[i.id]).length, 0);
  return { done, total };
}

const ACCENT_SWATCH = {
  blue:   "#4DA3FF",
  cyan:   "#4ED6D6",
  sage:   "#6FCF97",
  amber:  "#F5B544",
  orange: "#FF9F5C",
};

ReactDOM.createRoot(document.getElementById("root")).render(<PilotApp />);
