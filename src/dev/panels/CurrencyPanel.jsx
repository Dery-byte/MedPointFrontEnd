import { useState } from "react";
import { useConfig } from "../../config/ConfigContext";

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

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 4 }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const PRESETS = [
  { label: "Ghana (GH₵)", symbol: "GH₵", code: "GHS", locale: "en-GH" },
  { label: "Nigeria (₦)",  symbol: "₦",   code: "NGN", locale: "en-NG" },
  { label: "USA ($)",      symbol: "$",   code: "USD", locale: "en-US" },
  { label: "UK (£)",       symbol: "£",   code: "GBP", locale: "en-GB" },
  { label: "Euro (€)",     symbol: "€",   code: "EUR", locale: "de-DE" },
];

export default function CurrencyPanel() {
  const { config, update } = useConfig();
  const [draft, setDraft] = useState({
    currencySymbol: config.currencySymbol,
    currencyCode:   config.currencyCode,
    currencyLocale: config.currencyLocale,
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setDraft(prev => ({ ...prev, [k]: v }));

  const applyPreset = (p) => {
    setDraft({ currencySymbol: p.symbol, currencyCode: p.code, currencyLocale: p.locale });
  };

  const handleSave = () => {
    update(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const preview = `${draft.currencySymbol} ${Number(49.99).toLocaleString(draft.currencyLocale || "en-GH", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", fontWeight: 700, color: "#111" }}>Currency & Region</h2>
      <p style={{ color: "#6b7280", marginTop: 0, marginBottom: "2rem" }}>
        Configure the currency displayed across the storefront and POS.
      </p>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>Quick Presets</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PRESETS.map(p => (
            <button
              key={p.code}
              onClick={() => applyPreset(p)}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: 8,
                border: draft.currencyCode === p.code ? "2px solid var(--primary, #1e4d2b)" : "1.5px solid #d1d5db",
                background: draft.currencyCode === p.code ? "#f0fdf4" : "#fff",
                color: draft.currencyCode === p.code ? "var(--primary, #1e4d2b)" : "#374151",
                fontWeight: draft.currencyCode === p.code ? 700 : 400,
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>Custom Configuration</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 1rem" }}>
          <Field label="Symbol" hint="(e.g. GH₵, $, £)">
            <input style={inputStyle} value={draft.currencySymbol} onChange={e => set("currencySymbol", e.target.value)} placeholder="GH₵" />
          </Field>
          <Field label="ISO Code" hint="(e.g. GHS, USD)">
            <input style={inputStyle} value={draft.currencyCode} onChange={e => set("currencyCode", e.target.value)} placeholder="GHS" />
          </Field>
          <Field label="Locale" hint="(e.g. en-GH)">
            <input style={inputStyle} value={draft.currencyLocale} onChange={e => set("currencyLocale", e.target.value)} placeholder="en-GH" />
          </Field>
        </div>

        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem 1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: 4 }}>Preview</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#111" }}>{preview}</div>
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
          {saved ? "✓ Saved" : "Save currency"}
        </button>
      </div>
    </div>
  );
}
