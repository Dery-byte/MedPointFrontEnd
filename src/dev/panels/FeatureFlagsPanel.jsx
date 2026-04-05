import { useConfig } from "../../config/ConfigContext";

const FLAG_GROUPS = [
  {
    label: "Global",
    icon: "⚙️",
    flags: [
      {
        key: "enableCancellation",
        label: "Transaction Cancellation",
        desc: "Allow superadmin / manager to cancel transactions and restore stock",
      },
      {
        key: "enableExcelExport",
        label: "Excel Export",
        desc: "Show \"Export to Excel\" buttons throughout the admin interface",
      },
      {
        key: "showLowStockBanner",
        label: "Low Stock Alert Banner",
        desc: "Show the low-stock warning banner on Dashboard and Stock pages",
      },
    ],
  },
  {
    label: "Drug Store",
    icon: "💊",
    module: "drugstore",
    flags: [
      {
        key: "showExpiryTracking",
        label: "Expiry Date Tracking",
        desc: "Show expiry date column and \"Expiring Soon\" filter in stock overview",
      },
      {
        key: "showServicesTab",
        label: "Services Tab",
        desc: "Show the Services tab inside the Drug Store POS module",
      },
      {
        key: "showNonDrugTab",
        label: "Non-drug Items Tab",
        desc: "Show the Non-drug items tab inside the Drug Store POS module",
      },
    ],
  },
  {
    label: "Revenue",
    icon: "📊",
    flags: [
      {
        key: "showProfitMargin",
        label: "Profit & Margin Columns",
        desc: "Show estimated cost, net profit, and margin % in the Revenue report",
      },
    ],
  },
];

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
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
  );
}

export default function FeatureFlagsPanel() {
  const { config, update } = useConfig();
  const flags = config.featureFlags ?? {};

  const setFlag = (key, value) => {
    update({ featureFlags: { ...flags, [key]: value } });
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", fontWeight: 700, color: "#111" }}>Feature Flags</h2>
      <p style={{ color: "#6b7280", marginTop: 0, marginBottom: "2rem" }}>
        Fine-grained toggles within enabled modules. Use these to tailor the
        admin experience for specific client deployments without disabling entire modules.
      </p>

      {FLAG_GROUPS.map((group, gi) => (
        <section
          key={group.label}
          style={{
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 12, overflow: "hidden",
            marginBottom: gi < FLAG_GROUPS.length - 1 ? "1.5rem" : 0,
          }}
        >
          {/* Group header */}
          <div style={{
            padding: "0.75rem 1.5rem",
            background: "#f9fafb", borderBottom: "1px solid #f3f4f6",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: "1.1rem" }}>{group.icon}</span>
            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {group.label}
            </span>
          </div>

          {/* Flags */}
          {group.flags.map((flag, fi) => {
            const on = flags[flag.key] !== false; // default true when not set
            return (
              <div
                key={flag.key}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderTop: fi > 0 ? "1px solid #f3f4f6" : "none",
                  background: on ? "#fff" : "#f9fafb",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: on ? "#111" : "#9ca3af" }}>
                    {flag.label}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 2 }}>
                    {flag.desc}
                  </div>
                </div>
                <Toggle on={on} onToggle={() => setFlag(flag.key, !on)} />
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: on ? "var(--primary, #1e4d2b)" : "#9ca3af", minWidth: 28 }}>
                  {on ? "ON" : "OFF"}
                </span>
              </div>
            );
          })}
        </section>
      ))}

      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "0.75rem 1rem", marginTop: "1.5rem" }}>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#92400e" }}>
          <strong>Note:</strong> Flag changes take effect immediately and are saved automatically.
          No "Save" button needed — changes persist to your browser config.
        </p>
      </div>
    </div>
  );
}
