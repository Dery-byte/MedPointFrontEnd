import { useState } from "react";
import { useConfig } from "../../config/ConfigContext";

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

export default function PaymentPanel() {
  const { config, update } = useConfig();
  const [draft, setDraft] = useState({ ...config });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setDraft(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    update(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", fontWeight: 700, color: "#111" }}>Payment Configuration</h2>
      <p style={{ color: "#6b7280", marginTop: 0, marginBottom: "2rem" }}>
        Configure the primary payment gateway and online payment methods for the storefront.
      </p>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>Payment Gateway</h3>
        <Field label="Active Gateway" hint="Select the provider used for online payments">
          <select 
            style={inputStyle} 
            value={draft.paymentGateway || "paystack"} 
            onChange={e => set("paymentGateway", e.target.value)}
          >
            <option value="paystack">Paystack (Default)</option>
            <option value="moolre">Moolre Payment</option>
          </select>
        </Field>

        {draft.paymentGateway === "moolre" && (
          <div style={{ marginTop: "1rem", padding: "1rem", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <h4 style={{ margin: "0 0 1rem", fontSize: "0.875rem", fontWeight: 700, color: "#374151" }}>Moolre Credentials</h4>
            <Field label="Moolre API User">
              <input style={inputStyle} value={draft.moolreApiUser || ""} onChange={e => set("moolreApiUser", e.target.value)} placeholder="API User" />
            </Field>
            <Field label="Moolre API Key">
              <input style={inputStyle} type="password" value={draft.moolreApiKey || ""} onChange={e => set("moolreApiKey", e.target.value)} placeholder="API Key" />
            </Field>
          </div>
        )}
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>Enabled Methods</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            ["Mobile Money (Momo)", "paymentMomo"],
            ["Visa / Mastercard", "paymentCard"],
            ["Cash on Delivery", "paymentCash"],
          ].map(([label, key]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: "0.9rem" }}>
              <input 
                type="checkbox" 
                checked={!!draft[key]} 
                onChange={e => set(key, e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--primary)" }}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "0.65rem 1.5rem",
            background: saved ? "#10b981" : "var(--primary, #1e4d2b)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          {saved ? "✓ Saved" : "Save payment settings"}
        </button>
      </div>
    </div>
  );
}
