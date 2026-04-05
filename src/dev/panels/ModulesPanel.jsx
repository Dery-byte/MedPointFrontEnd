import { useState, useMemo, useEffect } from "react";
import { useConfig } from "../../config/ConfigContext";
import api from "../../shared/services/api";

const ALL_MODULES = [
  { key: "drugstore",  label: "Drug Store",       icon: "💊", desc: "Pharmacy dispensing and drug management" },
  { key: "mart",       label: "Mart",             icon: "🛒", desc: "Retail mart / convenience store POS" },
  { key: "hotel",      label: "Hotel",            icon: "🏨", desc: "Room booking, check-in and check-out" },
  { key: "restaurant", label: "Restaurant & Bar", icon: "🍽️", desc: "Table service and order management" },
  { key: "storefront", label: "E-commerce Store", icon: "🛍️", desc: "Public online storefront and customer orders" },
];

const TS_KEY = "medpoint_module_timestamps";

function relTime(ts) {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 2)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ModulesPanel() {
  const { config, update } = useConfig();

  const [enabled, setEnabled] = useState(
    config.enabledModules ?? ALL_MODULES.map(m => m.key)
  );
  const [saved, setSaved]               = useState(false);
  const [pendingDisable, setPendingDisable] = useState(null); // module key or null

  // Read toggle timestamps from localStorage
  const [toggleTimes, setToggleTimes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TS_KEY) ?? "{}"); }
    catch { return {}; }
  });

  // Fetch transaction counts per module from the backend
  const [txStats, setTxStats] = useState({});
  useEffect(() => {
    api.get("/admin/transactions", { _skipAuthCheck: true })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.content ?? res.data.transactions ?? [];
        const counts = data.reduce((acc, t) => {
          const m = (t.mod || t.module)?.toLowerCase();
          if (m) acc[m] = (acc[m] ?? 0) + 1;
          return acc;
        }, {});
        setTxStats(counts);
      })
      .catch(() => { /* silently ignore if not authenticated */ });
  }, []);

  const stampToggle = (key) => {
    const next = { ...toggleTimes, [key]: Date.now() };
    setToggleTimes(next);
    try { localStorage.setItem(TS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const toggle = (key) => {
    const isOn = enabled.includes(key);
    if (isOn && (txStats[key] ?? 0) > 0) {
      // Has data — ask for confirmation before hiding
      setPendingDisable(key);
      return;
    }
    stampToggle(key);
    setEnabled(prev => isOn ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const confirmDisable = () => {
    stampToggle(pendingDisable);
    setEnabled(prev => prev.filter(k => k !== pendingDisable));
    setPendingDisable(null);
  };

  const handleSave = () => {
    update({ enabledModules: enabled });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enableAll  = () => setEnabled(ALL_MODULES.map(m => m.key));
  const disableAll = () => {
    const withData = ALL_MODULES.filter(m => (txStats[m.key] ?? 0) > 0).map(m => m.label);
    if (withData.length > 0) {
      if (!window.confirm(`This will hide all module data including transactions from: ${withData.join(", ")}.\n\nProceed?`)) return;
    }
    setEnabled([]);
  };

  // Confirmation banner module info
  const pendingMod = ALL_MODULES.find(m => m.key === pendingDisable);

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", fontWeight: 700, color: "#111" }}>Modules</h2>
      <p style={{ color: "#6b7280", marginTop: 0, marginBottom: "1.5rem" }}>
        Toggle which modules are active in this deployment. Disabled modules are completely invisible
        in the admin — their transactions, staff, stock, and revenue disappear entirely.
      </p>

      {/* Bulk actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        <button
          onClick={enableAll}
          style={{ padding: "5px 14px", borderRadius: 6, border: "1.5px solid #d1fae5", background: "#f0fdf4", color: "#166534", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
        >
          ✓ Enable All
        </button>
        <button
          onClick={disableAll}
          style={{ padding: "5px 14px", borderRadius: 6, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#991b1b", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
        >
          ✕ Disable All
        </button>
      </div>

      {/* Confirmation banner */}
      {pendingDisable && pendingMod && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
          padding: "14px 18px", marginBottom: "1rem",
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "1.4rem" }}>{pendingMod.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#991b1b", fontSize: "0.9rem" }}>
              Hide {pendingMod.label}?
            </div>
            <div style={{ fontSize: "0.8rem", color: "#b91c1c", marginTop: 2 }}>
              {txStats[pendingDisable]} transaction{txStats[pendingDisable] !== 1 ? "s" : ""} will be hidden from all admin views until re-enabled.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={confirmDisable}
              style={{ padding: "6px 14px", borderRadius: 6, background: "#dc2626", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
            >
              Yes, hide it
            </button>
            <button
              onClick={() => setPendingDisable(null)}
              style={{ padding: "6px 14px", borderRadius: 6, background: "#fff", color: "#6b7280", border: "1px solid #e5e7eb", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Module list */}
      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem" }}>
        {ALL_MODULES.map((mod, i) => {
          const on  = enabled.includes(mod.key);
          const txCount = txStats[mod.key] ?? 0;
          const ts  = toggleTimes[mod.key];

          return (
            <div
              key={mod.key}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "1rem 1.5rem",
                borderTop: i > 0 ? "1px solid #f3f4f6" : "none",
                background: on ? "#fff" : "#f9fafb",
                gap: "1rem",
                transition: "background 0.15s",
              }}
            >
              <div style={{ fontSize: "1.75rem", flexShrink: 0, opacity: on ? 1 : 0.45 }}>{mod.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: on ? "#111" : "#9ca3af" }}>
                  {mod.label}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: 2 }}>{mod.desc}</div>

                {/* Data impact badge */}
                {txCount > 0 && (
                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 700,
                      background: on ? "#eff6ff" : "#fef2f2",
                      color: on ? "#1d4ed8" : "#dc2626",
                      border: `1px solid ${on ? "#bfdbfe" : "#fecaca"}`,
                      borderRadius: 4, padding: "1px 7px",
                    }}>
                      {txCount} tx{on ? "" : " — hidden"}
                    </span>
                    {ts && (
                      <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                        toggled {relTime(ts)}
                      </span>
                    )}
                  </div>
                )}
                {!txCount && ts && (
                  <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 3 }}>
                    toggled {relTime(ts)}
                  </div>
                )}

                {mod.key === "storefront" && !on && (
                  <div style={{
                    marginTop: 4, fontSize: "0.75rem", color: "#f59e0b",
                    background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: 4, padding: "2px 8px", display: "inline-block",
                  }}>
                    ⚠ Also hides public store routes (/, /shop, etc.)
                  </div>
                )}
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => toggle(mod.key)}
                role="switch"
                aria-checked={on}
                style={{
                  width: 46, height: 26, borderRadius: 13,
                  background: on ? "var(--primary, #1e4d2b)" : "#d1d5db",
                  border: "none", cursor: "pointer", padding: 3,
                  flexShrink: 0, position: "relative", transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3,
                  left: on ? "calc(100% - 23px)" : 3,
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </button>
              <span style={{
                fontSize: "0.75rem", fontWeight: 700,
                color: on ? "var(--primary, #1e4d2b)" : "#9ca3af",
                minWidth: 28,
              }}>
                {on ? "ON" : "OFF"}
              </span>
            </div>
          );
        })}
      </section>

      {/* Active summary */}
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#166534" }}>
          <strong>Active ({enabled.length}/{ALL_MODULES.length}):</strong>{" "}
          {enabled.length === 0
            ? "None — all module data is hidden from admin"
            : enabled.map(k => ALL_MODULES.find(m => m.key === k)?.label).filter(Boolean).join(", ")}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "0.65rem 1.5rem",
            background: saved ? "#10b981" : "var(--primary, #1e4d2b)",
            color: "#fff", border: "none", borderRadius: 8,
            fontWeight: 600, cursor: "pointer", fontSize: "0.95rem",
            transition: "background 0.2s",
          }}
        >
          {saved ? "✓ Saved" : "Save modules"}
        </button>
      </div>
    </div>
  );
}
