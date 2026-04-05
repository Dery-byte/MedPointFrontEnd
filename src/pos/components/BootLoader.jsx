import { useEffect, useRef, useState, useCallback } from "react";

const STEPS = [
  "Drug catalogue",
  "Medical services",
  "Consumables",
  "Mart inventory",
  "Restaurant menu",
  "Room categories",
  "Hotel rooms",
  "Tables & layout",
  "Staff directory",
  "Transactions",
];

const TOTAL = STEPS.length;

function Ring({ pct, size = 192, stroke = 9 }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(8,145,178,.1)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#0891b2" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray .44s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

function Counter({ value }) {
  const [display, setDisplay] = useState(0);
  const raf  = useRef();
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current, to = value, t0 = performance.now(), dur = 380;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * e));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display}</>;
}

// Single animated ticker line — slides old label up, new label in from below
function Ticker({ label, isDone }) {
  const [visible, setVisible]   = useState(label);
  const [incoming, setIncoming] = useState(null);
  const [phase, setPhase]       = useState("idle"); // idle | exit | enter
  const timerRef = useRef();

  useEffect(() => {
    if (label === visible && phase === "idle") return;
    clearTimeout(timerRef.current);
    setIncoming(label);
    setPhase("exit");
    timerRef.current = setTimeout(() => {
      setVisible(label);
      setIncoming(null);
      setPhase("enter");
      timerRef.current = setTimeout(() => setPhase("idle"), 320);
    }, 280);
    return () => clearTimeout(timerRef.current);
  }, [label]); // eslint-disable-line

  const exitStyle = {
    transform:  phase === "exit" ? "translateY(-110%)" : "translateY(0)",
    opacity:    phase === "exit" ? 0 : 1,
    transition: "transform .28s cubic-bezier(.4,0,.2,1), opacity .24s ease",
    position:   "absolute",
    inset:      0,
    display:    "flex",
    alignItems: "center",
    gap:        10,
  };
  const enterStyle = {
    transform:  phase === "enter" ? "translateY(0)" : "translateY(110%)",
    opacity:    phase === "enter" ? 1 : 0,
    transition: phase === "enter"
      ? "transform .3s cubic-bezier(.22,1,.36,1), opacity .26s ease"
      : "none",
    position:   "absolute",
    inset:      0,
    display:    "flex",
    alignItems: "center",
    gap:        10,
  };

  const dotBase = { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 };
  const dotActive = { ...dotBase, background: "#0891b2", animation: "bl-dp 1.2s ease-in-out infinite" };
  const dotDone   = { ...dotBase, background: "#34d399" };

  const lbl = (text, done) => (
    <>
      <span style={done ? dotDone : dotActive} />
      <span style={{
        fontSize: 12, fontWeight: 500,
        color: done ? "rgba(255,255,255,.38)" : "rgba(255,255,255,.6)",
        letterSpacing: ".01em", whiteSpace: "nowrap",
      }}>
        {text}
      </span>
    </>
  );

  return (
    <div style={{ position: "relative", height: 26, width: "100%", overflow: "hidden" }}>
      {/* exiting / idle label */}
      <div style={exitStyle}>{lbl(visible, isDone)}</div>
      {/* entering label */}
      {incoming !== null && (
        <div style={enterStyle}>{lbl(incoming, isDone)}</div>
      )}
    </div>
  );
}

export default function BootLoader({ progress, done }) {
  const pct      = Math.round((progress / TOTAL) * 100);
  const stepIdx  = Math.max(0, Math.min(progress, TOTAL - 1));
  const stepLabel = done ? "All systems ready" : STEPS[stepIdx];

  const [exiting, setExiting] = useState(false);
  const [hidden,  setHidden]  = useState(false);

  useEffect(() => {
    if (!done) return;
    const t1 = setTimeout(() => setExiting(true), 700);
    const t2 = setTimeout(() => setHidden(true),  1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [done]);

  if (hidden) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#040d1a", overflow: "hidden",
      animation: exiting ? "bl-out .7s cubic-bezier(.4,0,.2,1) both" : "bl-in .3s ease both",
    }}>
      {/* ambient blobs */}
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%",
        background:"#0891b2", opacity:.11, filter:"blur(90px)",
        top:-120, left:-100, animation:"bl-fl 9s ease-in-out infinite alternate" }} />
      <div style={{ position:"absolute", width:280, height:280, borderRadius:"50%",
        background:"#0284c7", opacity:.09, filter:"blur(90px)",
        bottom:-80, right:-60, animation:"bl-fl 11s ease-in-out infinite alternate",
        animationDelay:"-4s" }} />

      {/* card */}
      <div style={{
        position:"relative", zIndex:1,
        display:"flex", flexDirection:"column", alignItems:"center",
        width:280,
        animation:"bl-card .5s cubic-bezier(.22,1,.36,1) both",
      }}>
        {/* ring */}
        <div style={{ position:"relative", width:192, height:192, marginBottom:20 }}>
          <Ring pct={pct} size={192} stroke={9} />
          <div style={{
            position:"absolute", inset:0,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5,
          }}>
            <div style={{
              width:46, height:46,
              background:"linear-gradient(135deg,#0891b2,#0e7490)",
              borderRadius:13,
              display:"flex", alignItems:"center", justifyContent:"center",
              animation:"bl-glow 2.6s ease-in-out infinite",
            }}>
              <svg viewBox="0 0 40 40" width="33" height="33">
                <rect x="14" y="4"  width="12" height="32" rx="3" fill="white" opacity=".9"/>
                <rect x="4"  y="14" width="32" height="12" rx="3" fill="white" opacity=".9"/>
              </svg>
            </div>
            <div style={{ fontSize:19, fontWeight:800, color:"#fff", letterSpacing:"-.03em",
              lineHeight:1, fontVariantNumeric:"tabular-nums" }}>
              <Counter value={pct} /><sup style={{ fontSize:11, fontWeight:600,
                color:"rgba(255,255,255,.4)", verticalAlign:"super" }}>%</sup>
            </div>
          </div>
        </div>

        {/* brand */}
        <div style={{ fontSize:18, fontWeight:800, color:"#fff", letterSpacing:"-.03em", marginBottom:2 }}>
          MedPoint
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", letterSpacing:".02em", marginBottom:22 }}>
          Starting up
        </div>

        {/* single-step ticker */}
        <Ticker label={stepLabel} isDone={done} />

        {/* thin progress bar */}
        <div style={{ width:"100%", height:2, background:"rgba(255,255,255,.07)",
          borderRadius:1, marginTop:14, overflow:"hidden" }}>
          <div style={{
            height:"100%", background:"#0891b2", borderRadius:1,
            width: pct + "%",
            transition:"width .44s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
      </div>
    </div>
  );
}
