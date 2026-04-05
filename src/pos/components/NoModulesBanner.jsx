export default function NoModulesBanner() {
  return (
    <div style={{
      textAlign: "center",
      padding: "60px 24px",
      border: "2px dashed var(--g200)",
      borderRadius: "var(--r)",
      color: "var(--g400)",
      marginTop: 16,
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--g600)", marginBottom: 6 }}>
        No modules are enabled
      </div>
      <div style={{ fontSize: 13 }}>
        Enable at least one module in the Developer Portal{" "}
        (<a href="/dev" style={{ color: "var(--p)", fontWeight: 600 }}>/dev</a>)
        {" "}to use this section.
      </div>
    </div>
  );
}
