/* =========================================================
   Pilot Scratchpad — draw + type notepad overlay
   ========================================================= */
const { useState: usp, useEffect: uep, useRef: urp } = React;

function ScratchpadOverlay({ open, onClose }) {
  const [mode, setMode] = usp("draw");
  const [tool, setTool] = usp("pen");      // pen | erase
  const [color, setColor] = usp("#E6ECF2");
  const [size, setSize] = usp(2);          // brush radius
  const [text, setText] = usp("");
  const canvasRef = urp(null);
  const drawing = urp(false);
  const last = urp(null);

  // Close on ESC
  uep(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Resize canvas to fit container
  uep(() => {
    if (!open || mode !== "draw") return;
    const cv = canvasRef.current;
    if (!cv) return;
    const fit = () => {
      const rect = cv.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      // Preserve current drawing
      const tmp = document.createElement("canvas");
      tmp.width = cv.width; tmp.height = cv.height;
      tmp.getContext("2d").drawImage(cv, 0, 0);
      cv.width = rect.width * dpr;
      cv.height = rect.height * dpr;
      cv.style.width = rect.width + "px";
      cv.style.height = rect.height + "px";
      const ctx = cv.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.drawImage(tmp, 0, 0, tmp.width / dpr, tmp.height / dpr);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open, mode]);

  const point = (e) => {
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - r.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - r.top;
    return { x, y };
  };
  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    last.current = point(e);
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const p = point(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size * 2;
    if (tool === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const end = () => { drawing.current = false; };

  const clearCanvas = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.restore();
  };

  if (!open) return null;

  return (
    <div className="sp-overlay-backdrop" onClick={onClose}>
      <div className="sp-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="sp-overlay-head">
          <div className="sp-overlay-title">
            <span className="sp-overlay-eyebrow">Pilot Scratchpad</span>
            <span className="sp-overlay-aircraft">Notes · {PILOT_DATA.AIRCRAFT.tail}</span>
          </div>
          <div className="sp-mode-tabs">
            <button className={`sp-tab${mode === "draw" ? " active" : ""}`} onClick={() => setMode("draw")}>
              <Icon name="edit" size={12}/> DRAW
            </button>
            <button className={`sp-tab${mode === "type" ? " active" : ""}`} onClick={() => setMode("type")}>
              <Icon name="note" size={12}/> TYPE
            </button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ESC <span style={{ marginLeft: 4 }}>✕</span>
          </button>
        </div>

        {mode === "draw" && (
          <div className="sp-toolbar">
            <div className="sp-tool-group">
              <button className={`sp-tool-btn${tool === "pen" ? " active" : ""}`} onClick={() => setTool("pen")}>
                <Icon name="edit" size={12}/> PEN
              </button>
              <button className={`sp-tool-btn${tool === "erase" ? " active" : ""}`} onClick={() => setTool("erase")}>
                <span className="sp-erase-icon">▢</span> ERASE
              </button>
            </div>
            <div className="sp-divider"></div>
            <div className="sp-size-group">
              {[1, 2, 4, 7].map((s) => (
                <button
                  key={s}
                  className={`sp-size-btn${size === s ? " active" : ""}`}
                  onClick={() => setSize(s)}
                  title={`${s*2}px`}
                >
                  <span className="sp-size-dot" style={{ width: s*2 + "px", height: s*2 + "px" }}></span>
                </button>
              ))}
            </div>
            <div className="sp-divider"></div>
            <div className="sp-color-group">
              {SP_COLORS.map((c) => (
                <button
                  key={c}
                  className={`sp-color-btn${color === c && tool === "pen" ? " active" : ""}`}
                  onClick={() => { setColor(c); setTool("pen"); }}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
            <div className="sp-toolbar-spacer"></div>
            <button className="btn btn-warn btn-sm" onClick={clearCanvas}>
              <Icon name="reset" size={11}/> CLEAR
            </button>
          </div>
        )}

        <div className="sp-body">
          {mode === "draw" ? (
            <div className="sp-canvas-wrap">
              <canvas
                ref={canvasRef}
                className="sp-canvas"
                onMouseDown={start}
                onMouseMove={move}
                onMouseUp={end}
                onMouseLeave={end}
                onTouchStart={start}
                onTouchMove={move}
                onTouchEnd={end}
              />
            </div>
          ) : (
            <textarea
              className="sp-textarea"
              placeholder="Type notes here — checklists, ATIS info, clearances, reminders…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
          )}
        </div>

        <div className="sp-statusbar">
          <span className="sp-status-meta">
            {mode === "draw" ? `${tool.toUpperCase()} · ${size * 2}px${tool === "pen" ? " · " + color.toUpperCase() : ""}` : `${text.length} chars · ${text.split(/\s+/).filter(Boolean).length} words`}
          </span>
          <span className="sp-status-hint">ESC to close · Notes persist for this flight</span>
        </div>
      </div>
    </div>
  );
}

const SP_COLORS = ["#E6ECF2", "#4ADE80", "#4DA3FF", "#F5B544", "#FF6B6B", "#A66BFF", "#FF9F5C"];

window.ScratchpadOverlay = ScratchpadOverlay;
