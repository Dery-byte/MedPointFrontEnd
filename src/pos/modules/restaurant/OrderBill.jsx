import { useState } from "react";
import { useApp } from "../../AppContext";
import { fmt } from "../../helpers";
import CartItem from "../../components/CartItem";
import EmptyCart from "../../components/EmptyCart";
import Icon from "../../../shared/components/Icon";
import ConfirmReceiptDialog from "../../components/ConfirmReceiptDialog";
import RestaurantService from "../../services/Restaurantservice";

export default function OrderBill({ tableId, ordItems, onBill, onQty, onRemove }) {
  const { state, dispatch } = useApp();
  const { tables } = state;
  const table = tables.find(t => t.id === tableId);
  const isOccupied = table?.occ;

  const tot = ordItems.reduce((s, i) => s + i.price * i.qty, 0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [clearing, setClearing]       = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onBill();
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClearTable = async () => {
    if (!window.confirm("Clear this table and mark it as available?")) return;
    try {
      setClearing(true);
      await RestaurantService.freeTable(tableId);
      dispatch({ type: "FREE_TABLE", tableId });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to clear table.");
    } finally {
      setClearing(false);
    }
  };

  const summaryRows = ordItems.slice(0, 4).map(i => ({
    label: `${i.name} × ${i.qty}`, value: fmt(i.price * i.qty),
  }));
  if (ordItems.length > 4) summaryRows.push({ label: `+${ordItems.length - 4} more`, value: "" });

  return (
    <>
      <div className="card">
        <div className="card-hd">
          <h3>Table {tableId}{isOccupied ? " — Occupied" : " — Order"}</h3>
          {ordItems.length > 0 && (
            <span className="bcnt">{ordItems.reduce((s, i) => s + i.qty, 0)}</span>
          )}
        </div>
        <div className="card-bd">
          {ordItems.length === 0 ? (
            <EmptyCart icon="food" message="No items yet — tap from the menu to add" />
          ) : (
            <>
              {ordItems.map(i => (
                <CartItem key={i.id} item={i}
                  onQty={(id, qty) => onQty(id, qty)}
                  onRemove={(id) => onRemove(id)}
                />
              ))}
              <div className="totbox">
                <div className="trow"><span>Items ({ordItems.length})</span><span>{fmt(tot)}</span></div>
                <div className="trow grand"><span>Total</span><span>{fmt(tot)}</span></div>
              </div>
            </>
          )}

          <button
            className="btn-receipt"
            style={{ marginTop: 14 }}
            disabled={!ordItems.length}
            onClick={() => ordItems.length && setConfirmOpen(true)}
          >
            <Icon name="receipt" size={15} />Bill &amp; Receipt
          </button>

          <button
            className="btn btn-danger btn-full"
            style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            onClick={handleClearTable}
            disabled={clearing}
          >
            <Icon name="trash" size={14} color="white" />
            {clearing ? "Clearing…" : "Clear Table"}
          </button>
        </div>
      </div>

      <ConfirmReceiptDialog
        open={confirmOpen}
        title={`Bill Table ${tableId}`}
        subtitle="The order will be finalised and a receipt issued."
        rows={summaryRows}
        total={tot}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => !loading && setConfirmOpen(false)}
      />
    </>
  );
}
