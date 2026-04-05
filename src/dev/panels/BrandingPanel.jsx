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

export default function BrandingPanel() {
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
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", fontWeight: 700, color: "#111" }}>Branding</h2>
      <p style={{ color: "#6b7280", marginTop: 0, marginBottom: "2rem" }}>
        Configure the store's identity, contact details, and social links.
      </p>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>Store Identity</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          <Field label="Store name">
            <input style={inputStyle} value={draft.storeName} onChange={e => set("storeName", e.target.value)} placeholder="My Store" />
          </Field>
          <Field label="Initials" hint="(shown when no logo)">
            <input style={inputStyle} value={draft.storeInitials} onChange={e => set("storeInitials", e.target.value.slice(0,2))} maxLength={2} />
          </Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Logo URL" hint="(PNG/SVG; leave blank for initials)">
              <input style={inputStyle} value={draft.storeLogo || ""} onChange={e => set("storeLogo", e.target.value)} placeholder="https://..." />
            </Field>
          </div>
          <Field label="Tagline">
            <input style={inputStyle} value={draft.storeTagline} onChange={e => set("storeTagline", e.target.value)} />
          </Field>
          <Field label="Slogan">
            <input style={inputStyle} value={draft.storeSlogan} onChange={e => set("storeSlogan", e.target.value)} />
          </Field>
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>Contact & Location</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          <Field label="Phone">
            <input style={inputStyle} value={draft.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="+233 244 000 000" />
          </Field>
          <Field label="Email">
            <input style={inputStyle} type="email" value={draft.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
          </Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Address">
              <input style={inputStyle} value={draft.contactAddress} onChange={e => set("contactAddress", e.target.value)} placeholder="City, Country" />
            </Field>
          </div>
          <Field label="WhatsApp number" hint="(digits + country code)">
            <input style={inputStyle} value={draft.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)} placeholder="233244000000" />
          </Field>
        </div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>Social Links</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
          {[
            ["Facebook", "socialFacebook", "https://facebook.com/..."],
            ["Instagram", "socialInstagram", "https://instagram.com/..."],
            ["Twitter / X", "socialTwitter", "https://twitter.com/..."],
            ["TikTok", "socialTiktok", "https://tiktok.com/@..."],
          ].map(([label, key, ph]) => (
            <Field key={key} label={label}>
              <input style={inputStyle} value={draft[key] || ""} onChange={e => set(key, e.target.value)} placeholder={ph} />
            </Field>
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
          {saved ? "✓ Saved" : "Save branding"}
        </button>
      </div>
    </div>
  );
}
