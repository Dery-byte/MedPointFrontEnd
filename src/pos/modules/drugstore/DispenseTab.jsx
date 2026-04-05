import { useState } from "react";
import { useApp } from "../../AppContext";
import DrugList from "./DrugList";
import DrugStoreBill from "./DrugStoreBill";
import ConfirmReceiptDialog from "../../components/ConfirmReceiptDialog";
import OutOfStockModal from "../../components/OutOfStockModal";
import { issueDispenseReceipt } from "../../services/TransactionService";
import { fmt } from "../../helpers";

export default function DispenseTab() {
  const { state, dispatch } = useApp();
  const { dsCart, drugs } = state;

  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [oosItem, setOosItem]           = useState(null); // drug name for OOS popup

  const toggle = (id) => {
    const drug = drugs.find(d => d.id === id);
    if (!drug) return;
    // Removing from cart — always allow
    if (dsCart.some(c => c.id === id)) { dispatch({ type: "DS_REMOVE", id }); return; }
    // Out of stock — show modal instead of alert
    if (drug.stock <= 0) { setOosItem(drug.name); return; }
    dispatch({ type: "DS_ADD", item: drug });
  };

  const handleIssueClick = () => {
    if (!dsCart.length) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const receipt = await issueDispenseReceipt({
        items: dsCart.map(i => ({ id: i.id, name: i.name, cat: i.cat, price: i.price, qty: i.qty })),
      });

      dispatch({ type: "REDUCE_DRUG_STOCK", items: dsCart });
      dispatch({
        type: "ADD_TX",
        mod: "drugstore",
        amount: receipt.grandTotal,
        desc: `Drug Dispense (${dsCart.length} items)`,
        lineItems: dsCart.map(i => ({ name: i.name, qty: i.qty, price: i.price, cat: i.cat, costPrice: i.costPrice ?? null })),
      });

      const receiptItems = receipt.lineItems
        ? receipt.lineItems.map(li => ({
            id: li.id ?? li.itemId, name: li.name, cat: li.category ?? li.cat,
            price: parseFloat(li.unitPrice ?? li.price), qty: li.quantity ?? li.qty,
          }))
        : dsCart.map(i => ({ ...i }));

      dispatch({
        type: "SHOW_RECEIPT",
        data: {
          type: "Drug Dispense", mod: "drugstore", reference: receipt.reference,
          items: receiptItems, total: receipt.grandTotal, service: null,
        },
      });
      dispatch({ type: "DS_CLEAR" });
      setConfirmOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || "Failed to dispense drugs.";
      console.error("Dispense failed:", msg);
    } finally {
      setLoading(false);
    }
  };

  const total = dsCart.reduce((s, i) => s + i.price * i.qty, 0);
  const summaryRows = dsCart.slice(0, 4).map(i => ({ label: `${i.name} × ${i.qty}`, value: fmt(i.price * i.qty) }));
  if (dsCart.length > 4) summaryRows.push({ label: `+${dsCart.length - 4} more item(s)`, value: "" });

  return (
    <>
      <div className="split">
        <DrugList drugs={drugs} cart={dsCart} onToggle={toggle} />
        <DrugStoreBill
          cart={dsCart}
          onQty={(id, qty) => dispatch({ type: "DS_QTY", id, qty })}
          onRemove={id => dispatch({ type: "DS_REMOVE", id })}
          onIssue={handleIssueClick}
          emptyIcon="pill"
          emptyMessage="Double-click a drug to add"
        />
      </div>

      <ConfirmReceiptDialog
        open={confirmOpen}
        title="Confirm Drug Dispense"
        subtitle={`${dsCart.length} item(s) will be billed and stock updated.`}
        rows={summaryRows}
        total={total}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => !loading && setConfirmOpen(false)}
      />

      {oosItem && <OutOfStockModal drugName={oosItem} onClose={() => setOosItem(null)} />}
    </>
  );
}
