import { useState } from "react";
import { useConfig } from "../config/ConfigContext";
import BrandingPanel      from "./panels/BrandingPanel";
import ThemePanel         from "./panels/ThemePanel";
import ModulesPanel       from "./panels/ModulesPanel";
import CurrencyPanel      from "./panels/CurrencyPanel";
import ExportPanel        from "./panels/ExportPanel";
import ProfilesPanel      from "./panels/ProfilesPanel";
import FeatureFlagsPanel  from "./panels/FeatureFlagsPanel";

const NAV_ITEMS = [
  { id: "branding",  label: "Branding",      icon: "✏️" },
  { id: "theme",     label: "Theme",         icon: "🎨" },
  { id: "modules",   label: "Modules",       icon: "🧩" },
  { id: "profiles",  label: "Profiles",      icon: "📋" },
  { id: "flags",     label: "Feature Flags", icon: "🚩" },
  { id: "currency",  label: "Currency",      icon: "💰" },
  { id: "export",    label: "Export",        icon: "📤" },
];

const PANELS = {
  branding:  <BrandingPanel />,
  theme:     <ThemePanel />,
  modules:   <ModulesPanel />,
  profiles:  <ProfilesPanel />,
  flags:     <FeatureFlagsPanel />,
  currency:  <CurrencyPanel />,
  export:    <ExportPanel />,
};

export default function DevLayout() {
  const [active, setActive] = useState("branding");
  const { config } = useConfig();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--cream, #faf7f2)",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Sidebar nav */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        background: "var(--primary-dark, #0f2e18)",
        color: "#e5e7eb",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        <div style={{ padding: "0 1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
            MedPoint Suite
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
            Developer Portal
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--primary-light, #4a9e6a)", marginTop: 2 }}>
            {config.storeName}
          </div>
        </div>

        <nav style={{ padding: "1rem 0", flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "0.65rem 1.25rem",
                background: active === item.id ? "rgba(255,255,255,0.1)" : "transparent",
                color: active === item.id ? "#fff" : "rgba(255,255,255,0.6)",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: active === item.id ? 600 : 400,
                textAlign: "left",
                borderLeft: active === item.id ? "3px solid var(--accent, #c8972e)" : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <a
            href="/"
            style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
          >
            ← Back to storefront
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {PANELS[active]}
        </div>
      </main>
    </div>
  );
}
