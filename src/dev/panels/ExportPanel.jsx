import { useState } from "react";
import { useConfig } from "../../config/ConfigContext";

export default function ExportPanel() {
  const { config, reset } = useConfig();
  const [copied,    setCopied]    = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleCopy = () => {
    const json = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    if (!window.confirm("Reset ALL configuration to defaults? This cannot be undone.")) return;
    setResetting(true);
    reset();
    setTimeout(() => setResetting(false), 600);
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: "1.4rem", fontWeight: 700, color: "#111" }}>Export & Reset</h2>
      <p style={{ color: "#6b7280", marginTop: 0, marginBottom: "2rem" }}>
        Export the current config as JSON to commit to your deployment, or reset everything to factory defaults.
      </p>

      {/* Copy JSON */}
      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 700 }}>Copy Config as JSON</h3>
        <p style={{ margin: "0 0 1rem", fontSize: "0.875rem", color: "#6b7280" }}>
          Copies the full current config object to your clipboard. Paste it into your codebase as the new <code>DEFAULT_CONFIG</code> to bake it into a deployment.
        </p>
        <pre style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "1rem",
          fontSize: "0.75rem",
          maxHeight: 220,
          overflowY: "auto",
          margin: "0 0 1rem",
          color: "#374151",
        }}>
          {JSON.stringify(config, null, 2)}
        </pre>
        <button
          onClick={handleCopy}
          style={{
            padding: "0.65rem 1.5rem",
            background: copied ? "#10b981" : "var(--primary, #1e4d2b)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          {copied ? "✓ Copied!" : "📋 Copy config JSON"}
        </button>
      </section>

      {/* Reset */}
      <section style={{ background: "#fff", border: "1.5px solid #fecaca", borderRadius: 12, padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 700, color: "#dc2626" }}>Reset to Defaults</h3>
        <p style={{ margin: "0 0 1rem", fontSize: "0.875rem", color: "#6b7280" }}>
          Clears all customisations from localStorage and restores the original <code>DEFAULT_CONFIG</code>.
          This affects the storefront appearance immediately. The POS is unaffected.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          style={{
            padding: "0.65rem 1.5rem",
            background: resetting ? "#9ca3af" : "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: resetting ? "not-allowed" : "pointer",
            fontSize: "0.95rem",
          }}
        >
          {resetting ? "Resetting…" : "⚠ Reset to defaults"}
        </button>
      </section>
    </div>
  );
}
