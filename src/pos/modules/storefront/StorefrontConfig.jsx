import { useState } from "react";
import Icon from "../../../shared/components/Icon";
import { useConfig } from "../../../config/ConfigContext";
import { THEME_PRESETS } from "../../../config/storeConfig";
import { useToast } from "../../../store/components/Toast";

function Section({ title, icon, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="config-section">
      <button className="config-section-header" onClick={() => setOpen(v => !v)}>
        <div className="config-section-title">
          <Icon name={icon} size={18} color="var(--primary-light)" />
          {title}
        </div>
        <Icon name={open ? "chevron-down" : "chevron-right"} size={16} color="rgba(255,255,255,0.4)" />
      </button>
      {open && <div className="config-section-body">{children}</div>}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="config-field">
      <div className="config-field-label">
        <span>{label}</span>
        {hint && <span className="config-field-hint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <div className="config-toggle-row">
      <button
        className={`config-toggle${value ? " config-toggle-on" : ""}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        type="button"
      >
        <span className="config-toggle-knob" />
      </button>
      {label && <span className="config-toggle-label">{label}</span>}
    </div>
  );
}

export default function StorefrontConfig() {
  const { config, update, applyTheme, reset } = useConfig();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  // Local draft state so changes are previewed but not committed until Save
  const [draft, setDraft] = useState({ ...config });

  const set = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    update(draft);
    setSaved(true);
    toast({ message: "Store configuration saved", type: "success" });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTheme = (preset) => {
    const p = THEME_PRESETS[preset];
    if (!p) return;
    setDraft(prev => ({
      ...prev,
      themePreset: preset,
      colorPrimary:      p.colorPrimary,
      colorPrimaryLight: p.colorPrimaryLight,
      colorPrimaryDark:  p.colorPrimaryDark,
      colorAccent:       p.colorAccent,
      colorAccentLight:  p.colorAccentLight,
      colorBackground:   p.colorBackground,
      colorSurface:      p.colorSurface,
    }));
  };

  const handleReset = () => {
    if (!window.confirm("Reset all configuration to defaults?")) return;
    reset();
    setDraft({ ...config });
    toast({ message: "Configuration reset to defaults", type: "info" });
  };

  return (
    <div className="admin-page config-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Configuration</h1>
          <p className="admin-page-sub">
            Customize this storefront for any business. Changes apply instantly after saving.
          </p>
        </div>
        <div className="config-header-actions">
          <button className="btn-outline config-reset-btn" onClick={handleReset}>
            <Icon name="refresh-cw" size={14} /> Reset
          </button>
          <button className="btn-primary" onClick={handleSave}>
            {saved
              ? <><Icon name="check" size={15} /> Saved</>
              : <><Icon name="check" size={15} /> Save changes</>}
          </button>
        </div>
      </div>

      <div className="config-layout">
        {/* ── Left column ────────────────────────────────── */}
        <div className="config-col">

          {/* Identity */}
          <Section title="Business Identity" icon="star">
            <Field label="Store name" hint="Displayed in navbar and browser tab">
              <input className="form-input" value={draft.storeName} onChange={e => set("storeName", e.target.value)} placeholder="My Store" />
            </Field>
            <Field label="Initials / Icon letter" hint="Shown in navbar when no logo is set">
              <input className="form-input" value={draft.storeInitials} onChange={e => set("storeInitials", e.target.value.slice(0,2))} placeholder="M" maxLength={2} />
            </Field>
            <Field label="Logo URL" hint="Link to logo image (PNG, SVG). Leave blank to use initials.">
              <input className="form-input" value={draft.storeLogo || ""} onChange={e => set("storeLogo", e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Tagline" hint="Short line under the store name">
              <input className="form-input" value={draft.storeTagline} onChange={e => set("storeTagline", e.target.value)} />
            </Field>
            <Field label="Slogan" hint="Hero section subtitle">
              <input className="form-input" value={draft.storeSlogan} onChange={e => set("storeSlogan", e.target.value)} />
            </Field>
          </Section>

          {/* Hero */}
          <Section title="Hero Section" icon="trending-up">
            <Field label="Main headline">
              <input className="form-input" value={draft.heroHeadline} onChange={e => set("heroHeadline", e.target.value)} />
            </Field>
            <Field label="Sub-headline">
              <textarea className="form-input form-textarea" value={draft.heroSubline} onChange={e => set("heroSubline", e.target.value)} rows={2} />
            </Field>
            <Field label="CTA button text">
              <input className="form-input" value={draft.heroCta} onChange={e => set("heroCta", e.target.value)} placeholder="Shop now" />
            </Field>
            <Field label="Hero image URL" hint="Optional background image for hero section">
              <input className="form-input" value={draft.heroImageUrl || ""} onChange={e => set("heroImageUrl", e.target.value)} placeholder="https://..." />
            </Field>
          </Section>

          {/* Contact */}
          <Section title="Contact & Location" icon="map-pin">
            <Field label="Phone number">
              <input className="form-input" value={draft.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="+233 244 000 000" />
            </Field>
            <Field label="Email address">
              <input className="form-input" value={draft.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="store@example.com" type="email" />
            </Field>
            <Field label="Physical address">
              <input className="form-input" value={draft.contactAddress} onChange={e => set("contactAddress", e.target.value)} placeholder="City, Country" />
            </Field>
            <Field label="WhatsApp number" hint="Digits only, with country code. E.g. 233244000000">
              <input className="form-input" value={draft.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)} placeholder="233244000000" />
            </Field>
          </Section>

          {/* Social */}
          <Section title="Social Links" icon="star">
            {[
              ["Facebook URL", "socialFacebook", "https://facebook.com/..."],
              ["Instagram URL", "socialInstagram", "https://instagram.com/..."],
              ["Twitter / X URL", "socialTwitter", "https://twitter.com/..."],
              ["TikTok URL", "socialTiktok", "https://tiktok.com/@..."],
            ].map(([label, key, ph]) => (
              <Field key={key} label={label}>
                <input className="form-input" value={draft[key] || ""} onChange={e => set(key, e.target.value)} placeholder={ph} />
              </Field>
            ))}
          </Section>

        </div>

        {/* ── Right column ───────────────────────────────── */}
        <div className="config-col">

          {/* Theme Presets */}
          <Section title="Theme Preset" icon="settings">
            <div className="theme-preset-grid">
              {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  className={`theme-preset-card${draft.themePreset === key ? " theme-preset-active" : ""}`}
                  onClick={() => handleTheme(key)}
                >
                  <div className="theme-preset-swatches">
                    {preset.preview.map((color, i) => (
                      <span key={i} className="theme-swatch" style={{ background: color }} />
                    ))}
                  </div>
                  <span className="theme-preset-label">{preset.label}</span>
                  {draft.themePreset === key && (
                    <span className="theme-preset-check">
                      <Icon name="check" size={12} color="#fff" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Section>

          {/* Custom Colors */}
          <Section title="Custom Colors" icon="settings">
            <p className="config-note">Override theme colors manually. Changes here set the theme to "custom".</p>
            <div className="color-fields-grid">
              {[
                ["Primary color", "colorPrimary"],
                ["Primary light", "colorPrimaryLight"],
                ["Primary dark",  "colorPrimaryDark"],
                ["Accent color",  "colorAccent"],
                ["Accent light",  "colorAccentLight"],
                ["Background",    "colorBackground"],
                ["Card surface",  "colorSurface"],
              ].map(([label, key]) => (
                <div key={key} className="color-field">
                  <label className="config-color-label">{label}</label>
                  <div className="color-input-row">
                    <input
                      type="color"
                      className="color-swatch-input"
                      value={draft[key] || "#000000"}
                      onChange={e => set(key, e.target.value)}
                    />
                    <input
                      className="form-input color-hex-input"
                      value={draft[key] || ""}
                      onChange={e => set(key, e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Currency */}
          <Section title="Currency & Region" icon="tag">
            <Field label="Currency symbol" hint="Displayed before prices">
              <input className="form-input" value={draft.currencySymbol} onChange={e => set("currencySymbol", e.target.value)} placeholder="GH₵" />
            </Field>
            <Field label="Currency code" hint="ISO code (e.g. GHS, USD, NGN)">
              <input className="form-input" value={draft.currencyCode} onChange={e => set("currencyCode", e.target.value)} placeholder="GHS" />
            </Field>
          </Section>

          {/* Delivery */}
          <Section title="Delivery & Fees" icon="package">
            <Field label="Delivery fee (in your currency)">
              <input className="form-input" type="number" min="0" value={draft.deliveryFee} onChange={e => set("deliveryFee", parseFloat(e.target.value)||0)} />
            </Field>
            <Field label="Free delivery threshold" hint="Orders above this get free delivery. Set 0 to always charge.">
              <input className="form-input" type="number" min="0" value={draft.deliveryFeeThreshold} onChange={e => set("deliveryFeeThreshold", parseFloat(e.target.value)||0)} />
            </Field>
            <Field label="Features">
              <div className="config-toggles">
                <Toggle value={draft.enableGuestCheckout} onChange={v => set("enableGuestCheckout", v)} label="Allow guest checkout" />
                <Toggle value={draft.enableWishlist} onChange={v => set("enableWishlist", v)} label="Enable wishlist / favorites" />
                <Toggle value={draft.enableSearch} onChange={v => set("enableSearch", v)} label="Enable search" />
                <Toggle value={draft.enableDelivery} onChange={v => set("enableDelivery", v)} label="Offer delivery" />
              </div>
            </Field>
          </Section>

          {/* Payment */}
          <Section title="Payment Methods" icon="credit-card">
            <Field label="Accepted payment methods">
              <div className="config-toggles">
                <Toggle value={draft.paymentMomo} onChange={v => set("paymentMomo", v)} label="Mobile Money (Momo)" />
                <Toggle value={draft.paymentCard} onChange={v => set("paymentCard", v)} label="Visa / Mastercard" />
                <Toggle value={draft.paymentCash} onChange={v => set("paymentCash", v)} label="Cash on delivery" />
              </div>
            </Field>
          </Section>

          {/* SEO */}
          <Section title="SEO & Meta" icon="search">
            <Field label="Browser tab title">
              <input className="form-input" value={draft.metaTitle} onChange={e => set("metaTitle", e.target.value)} />
            </Field>
            <Field label="Meta description">
              <textarea className="form-input form-textarea" value={draft.metaDescription} onChange={e => set("metaDescription", e.target.value)} rows={2} />
            </Field>
            <Field label="Keywords" hint="Comma-separated">
              <input className="form-input" value={draft.metaKeywords} onChange={e => set("metaKeywords", e.target.value)} />
            </Field>
          </Section>

          {/* API */}
          <Section title="API Configuration" icon="settings">
            <Field label="Backend API URL" hint="Leave blank to use VITE_API_URL from .env">
              <input className="form-input" value={draft.apiBaseUrl || ""} onChange={e => set("apiBaseUrl", e.target.value)} placeholder="http://localhost:8080/api" />
            </Field>
            <div className="config-deploy-hint">
              <Icon name="alert" size={14} color="var(--accent)" />
              <p>To deploy this storefront for a new business: change the values on this page, save, then export or redeploy. Each deployed instance is independent.</p>
            </div>
          </Section>

        </div>
      </div>

      {/* Save bar */}
      <div className="config-save-bar">
        <p className="config-save-note">
          <Icon name="alert" size={14} /> Configuration is saved to this browser's localStorage. For production, export and commit the config to your deployment.
        </p>
        <button className="btn-primary config-save-btn" onClick={handleSave}>
          {saved ? <><Icon name="check" size={16} /> Saved</> : <><Icon name="check" size={16} /> Save configuration</>}
        </button>
      </div>
    </div>
  );
}
