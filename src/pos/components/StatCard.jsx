export default function StatCard({ icon, value, label, valueStyle }) {
  return (
    <div className="stat-card">
      <div className="stat-ico" style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>{icon}</div>
      <div className="stat-val" style={valueStyle}>{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}
