export default function Badge({ type, children }) {
  const cls = { green: "badge-green", red: "badge-red", amber: "badge-amber", blue: "badge-blue", gray: "badge-gray" }[type] || "badge-gray";
  return <span className={`badge ${cls}`}>{children}</span>;
}
