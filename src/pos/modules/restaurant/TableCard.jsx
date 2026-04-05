import Icon from "../../../shared/components/Icon";

export default function TableCard({ table, order, onClick }) {
  const itemCount = order ? order.items.reduce((s, i) => s + i.qty, 0) : 0;
  const hasOrder = !!table.orderId;

  // State logic: occ=true means billed/occupied, hasOrder=true means order open
  const status = table.occ ? "occupied" : hasOrder ? "ordering" : "available";

  const statusConfig = {
    available: { color: "var(--green)",  label: "Available",      dot: "#10b981" },
    ordering:  { color: "var(--amber)",  label: "Taking Order",   dot: "#f59e0b" },
    occupied:  { color: "var(--red)",    label: "Occupied",       dot: "#ef4444" },
  }[status];

  return (
    <div className={`tc ${table.occ ? "occ" : hasOrder ? "ordering" : ""}`} onClick={() => onClick(table.id)}>
      <div className="tc-ico">
        <Icon name={table.occ ? "restaurant" : hasOrder ? "receipt" : "restaurant"} size={22} color={statusConfig.dot} />
      </div>
      <div className="tc-num">Table {table.name || table.id}</div>
      <div className="tc-status" style={{ color: statusConfig.color }}>
        <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: statusConfig.dot, marginRight: 5 }} />
        {statusConfig.label}
      </div>
      {itemCount > 0 && (
        <div className="tc-items">{itemCount} item{itemCount !== 1 ? "s" : ""}</div>
      )}
    </div>
  );
}
