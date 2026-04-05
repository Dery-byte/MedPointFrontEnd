import { useApp } from "../../AppContext";
import TableCard from "./TableCard";

export default function TableGrid({ onTableClick }) {
  const { state } = useApp();
  const { tables, orders } = state;

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--g600)", marginBottom: 14 }}>TABLE STATUS</h3>
      <div className="tables-grid">
        {tables.map(t => {
          const ord = t.orderId ? orders.find(o => o.id === t.orderId) : null;
          return <TableCard key={t.id} table={t} order={ord} onClick={onTableClick} />;
        })}
      </div>
    </div>
  );
}
