import { useState, useEffect } from "react";
import { useConfig } from "../../config/ConfigContext";
import devApi from "../services/devApi";

const QUICK_PRESETS = [
  {
    id: "full",
    name: "Full Suite",
    icon: "🏢",
    desc: "All 5 modules active",
    modules: ["drugstore", "mart", "hotel", "restaurant", "storefront"],
  },
  {
    id: "pharmacy",
    name: "Pharmacy Only",
    icon: "💊",
    desc: "Drug store only",
    modules: ["drugstore"],
  },
  {
    id: "retail",
    name: "Retail Bundle",
    icon: "🛒",
    desc: "Mart + E-commerce storefront",
    modules: ["mart", "storefront"],
  },
  {
    id: "hospitality",
    name: "Hospitality Suite",
    icon: "🏨",
    desc: "Hotel + Restaurant",
    modules: ["hotel", "restaurant"],
  },
  {
    id: "clinic",
    name: "Clinic Bundle",
    icon: "🩺",
    desc: "Drugstore + Mart (no hospitality)",
    modules: ["drugstore", "mart"],
  },
];

const ALL_MODULE_LABELS = {
  drugstore: "Drug Store",
  mart: "Mart",
  hotel: "Hotel",
  restaurant: "Restaurant",
  storefront: "E-commerce",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ModulePills({ modules }) {
  const arr = Array.isArray(modules) ? modules : [];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
      {arr.map(m => (
        <span key={m} style={{
          fontSize: "0.7rem", fontWeight: 700, padding: "1px 7px",
          borderRadius: 4, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
        }}>
          {ALL_MODULE_LABELS[m] ?? m}
        </span>
      ))}
      {arr.length === 0 && (
        <span style={{ fontSize: "0.7rem", color: "#9ca3af", fontStyle: "italic" }}>No modules</span>
      )}
    </div>
  );
}

export default function ProfilesPanel() {
  const { config, update } = useConfig();
  const [profiles,  setProfiles]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [newName,   setNewName]   = useState("");
  const [applied,   setApplied]   = useState(null);
  const [saved,     setSaved]     = useState(false);

  const currentModules = config.enabledModules ?? [];

  // Load profiles from API on mount
  useEffect(() => {
    devApi.get("/dev/profiles")
      .then(res => setProfiles(res.data))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  const applyProfile = (modules, id) => {
    update({ enabledModules: modules });
    setApplied(id);
    setTimeout(() => setApplied(null), 2000);
  };

  const saveCurrentAsProfile = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const res = await devApi.post("/dev/profiles", {
        name,
        modulesJson: JSON.stringify(currentModules),
        themePreset: config.themePreset ?? "forest",
      });
      setProfiles(prev => [res.data, ...prev]);
      setNewName("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  const deleteProfile = async (id) => {
    try {
      await devApi.delete(`/dev/profiles/${id}`);
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete profile", err);
    }
  };

  // Parse modulesJson string → array for display
  const parseModules = (p) => {
    if (Array.isArray(p.modulesJson)) return p.modulesJson;
    try { return JSON.parse(p.modulesJson ?? "[]"); } catch { return []; }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", fontWeight: 700, color: "#111" }}>Config Profiles</h2>
      <p style={{ color: "#6b7280", marginTop: 0, marginBottom: "2rem" }}>
        Save and load named deployment configurations. Quickly switch between bundles
        when demoing or configuring for different clients.
      </p>

      {/* ── Quick Presets ── */}
      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem" }}>
          Quick Presets
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {QUICK_PRESETS.map(p => {
            const isActive = applied === p.id;
            const isCurrent = JSON.stringify(currentModules.slice().sort()) === JSON.stringify(p.modules.slice().sort());
            return (
              <div
                key={p.id}
                style={{
                  background: "#fff",
                  border: `1.5px solid ${isCurrent ? "var(--primary, #1e4d2b)" : "#e5e7eb"}`,
                  borderRadius: 10, padding: "12px 14px",
                  display: "flex", flexDirection: "column", gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>{p.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#111" }}>{p.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{p.desc}</div>
                    </div>
                  </div>
                  {isCurrent ? (
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--primary, #1e4d2b)", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "2px 7px" }}>
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => applyProfile(p.modules, p.id)}
                      style={{
                        padding: "4px 12px", borderRadius: 6, border: "1.5px solid #d1d5db",
                        background: isActive ? "#10b981" : "#fff", color: isActive ? "#fff" : "#374151",
                        fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", flexShrink: 0,
                        transition: "all 0.15s",
                      }}
                    >
                      {isActive ? "✓ Applied" : "Apply"}
                    </button>
                  )}
                </div>
                <ModulePills modules={p.modules} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Save Current Config ── */}
      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem", marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.88rem", fontWeight: 700, color: "#111" }}>Save Current Config as Profile</h3>
        <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#6b7280" }}>
          Currently active: <strong>{currentModules.length}</strong> module{currentModules.length !== 1 ? "s" : ""}
          {currentModules.length > 0 ? ` (${currentModules.map(m => ALL_MODULE_LABELS[m] ?? m).join(", ")})` : ""}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveCurrentAsProfile()}
            placeholder="Profile name (e.g. Client A — Pharmacy)"
            style={{
              flex: 1, padding: "0.55rem 0.85rem", border: "1.5px solid #d1d5db",
              borderRadius: 7, fontSize: "0.875rem", outline: "none",
            }}
          />
          <button
            onClick={saveCurrentAsProfile}
            disabled={!newName.trim()}
            style={{
              padding: "0.55rem 1.2rem", borderRadius: 7, border: "none",
              background: saved ? "#10b981" : "var(--primary, #1e4d2b)",
              color: "#fff", fontWeight: 600, fontSize: "0.875rem",
              cursor: newName.trim() ? "pointer" : "not-allowed",
              opacity: newName.trim() ? 1 : 0.5,
              transition: "background 0.2s",
            }}
          >
            {saved ? "✓ Saved" : "Save"}
          </button>
        </div>
      </section>

      {/* ── Saved Profiles ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af", fontSize: "0.875rem" }}>
          Loading profiles…
        </div>
      )}

      {!loading && profiles.length > 0 && (
        <section>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem" }}>
            Saved Profiles ({profiles.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {profiles.map(p => {
              const modules = parseModules(p);
              const isActive = applied === p.id;
              const isCurrent = JSON.stringify(currentModules.slice().sort()) === JSON.stringify(modules.slice().sort());
              return (
                <div
                  key={p.id}
                  style={{
                    background: "#fff", border: `1.5px solid ${isCurrent ? "var(--primary, #1e4d2b)" : "#e5e7eb"}`,
                    borderRadius: 10, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111" }}>{p.name}</span>
                      {isCurrent && (
                        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--primary, #1e4d2b)", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "1px 6px" }}>
                          Active
                        </span>
                      )}
                    </div>
                    <ModulePills modules={modules} />
                    <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 4 }}>
                      Saved {formatDate(p.savedAt)} · {modules.length} module{modules.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {!isCurrent && (
                      <button
                        onClick={() => applyProfile(modules, p.id)}
                        style={{
                          padding: "5px 12px", borderRadius: 6,
                          border: "1.5px solid #d1d5db",
                          background: isActive ? "#10b981" : "#fff",
                          color: isActive ? "#fff" : "#374151",
                          fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {isActive ? "✓ Applied" : "Apply"}
                      </button>
                    )}
                    <button
                      onClick={() => deleteProfile(p.id)}
                      style={{
                        padding: "5px 10px", borderRadius: 6,
                        border: "1.5px solid #fecaca", background: "#fef2f2",
                        color: "#dc2626", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!loading && profiles.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af", fontSize: "0.875rem" }}>
          No saved profiles yet. Save your current configuration above.
        </div>
      )}
    </div>
  );
}
