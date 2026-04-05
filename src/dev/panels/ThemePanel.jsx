import { useState } from "react";
import { useConfig } from "../../config/ConfigContext";
import { THEME_PRESETS } from "../../config/storeConfig";

const inputStyle = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1.5px solid #d1d5db",
  borderRadius: 8,
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

function ColorField({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontWeight: 600, fontSize: "0.8rem", color: "#374151", marginBottom: 4 }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={value || "#000000"}
          onChange={e => onChange(e.target.value)}
          style={{ width: 40, height: 36, padding: 2, border: "1.5px solid #d1d5db", borderRadius: 6, cursor: "pointer", flexShrink: 0 }}
        />
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export default function ThemePanel() {
  const { config, update, applyTheme } = useConfig();
  const [draft, setDraft] = useState({ ...config });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setDraft(prev => ({ ...prev, [k]: v }));

  const handlePreset = (key) => {
    const p = THEME_PRESETS[key];
    if (!p) return;
    setDraft(prev => ({
      ...prev,
      themePreset: key,
      colorPrimary:      p.colorPrimary,
      colorPrimaryLight: p.colorPrimaryLight,
      colorPrimaryDark:  p.colorPrimaryDark,
      colorAccent:       p.colorAccent,
      colorAccentLight:  p.colorAccentLight,
      colorBackground:   p.colorBackground,
      colorSurface:      p.colorSurface,
    }));
  };

  const handleSave = () => {
    update(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", fontWeight: 700, color: "#111" }}>Theme</h2>
      <p style={{ color: "#6b7280", marginTop: 0, marginBottom: "2rem" }}>
        Pick a preset or customise individual colors. Changes are previewed on save.
      </p>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>Theme Presets</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          {Object.entries(THEME_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePreset(key)}
              style={{
                padding: "0.75rem",
                border: draft.themePreset === key ? "2px solid var(--primary, #1e4d2b)" : "2px solid #e5e7eb",
                borderRadius: 10,
                background: draft.themePreset === key ? "#f0fdf4" : "#fff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {preset.preview.map((c, i) => (
                  <span key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c, display: "inline-block" }} />
                ))}
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111" }}>{preset.label}</div>
              {draft.themePreset === key && (
                <div style={{ fontSize: "0.7rem", color: "var(--primary, #1e4d2b)", marginTop: 2 }}>✓ Active</div>
              )}
            </button>
          ))}
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 700 }}>Custom Colors</h3>
        <p style={{ margin: "0 0 1rem", fontSize: "0.8rem", color: "#9ca3af" }}>
          Manual overrides. Changes here switch the theme to "custom".
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
          {[
            ["Primary",       "colorPrimary"],
            ["Primary Light", "colorPrimaryLight"],
            ["Primary Dark",  "colorPrimaryDark"],
            ["Accent",        "colorAccent"],
            ["Accent Light",  "colorAccentLight"],
            ["Background",    "colorBackground"],
            ["Surface",       "colorSurface"],
          ].map(([label, key]) => (
            <ColorField
              key={key}
              label={label}
              value={draft[key]}
              onChange={v => set(key, v)}
            />
          ))}
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>Typography</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          {[["Display font", "fontDisplay"], ["Body font", "fontBody"]].map(([label, key]) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 4 }}>{label}</label>
              <input style={inputStyle} value={draft[key]} onChange={e => set(key, e.target.value)} placeholder="inter" />
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "0.65rem 1.5rem",
            background: saved ? "#10b981" : "var(--primary, #1e4d2b)",
            color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.95rem",
          }}
        >
          {saved ? "✓ Saved" : "Save theme"}
        </button>
      </div>
    </div>
  );
}
