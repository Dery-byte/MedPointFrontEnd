import { useState } from "react";
import { useApp } from "../../AppContext";
import { fmt } from "../../helpers";
import CartItem from "../../components/CartItem";
import EmptyCart from "../../components/EmptyCart";
import { Card, CardHeader, CardBody } from "../../components/Card";
import ServiceSelector from "./ServiceSelector";
import ServiceItemPicker from "./ServiceItemPicker";
import Icon from "../../../shared/components/Icon";
import ConfirmReceiptDialog from "../../components/ConfirmReceiptDialog";
import { issueServiceReceipt } from "../../services/TransactionService";

export default function ServiceTab() {
  const { state, dispatch } = useApp();
  const { svcCart, selSvcs, drugs } = state;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleIssueClick = () => {
    if (!selSvcs.length) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const receipt = await issueServiceReceipt({
        services: selSvcs.map(s => ({ id: s.id, name: s.name, cat: s.cat, price: s.price })),
        items:    svcCart.map(i => ({ id: i.id, name: i.name, cat: i.cat, price: i.price, qty: i.qty })),
      });

      dispatch({ type: "REDUCE_DRUG_STOCK", items: svcCart.filter(i => drugs.some(d => d.id === i.id)) });
      dispatch({
        type: "ADD_TX",
        mod: "drugstore",
        amount: receipt.grandTotal,
        desc: `Services: ${selSvcs.map(s => s.name).join(", ")}`,
        lineItems: [
          ...selSvcs.map(s => ({ name: s.name, qty: 1, price: s.price, cat: s.cat, type: "service", costPrice: s.costPrice ?? null })),
          ...svcCart.map(i => ({ name: i.name, qty: i.qty, price: i.price, cat: i.cat, type: "item", costPrice: i.costPrice ?? null })),
        ],
      });

      // Build services/items from backend response when available
      const receiptServices = receipt.services
        ? receipt.services.map(s => ({
            id:    s.id,
            name:  s.name,
            cat:   s.category ?? s.cat,
            price: parseFloat(s.price),
          }))
        : selSvcs;

      const receiptItems = receipt.lineItems
        ? receipt.lineItems
            .filter(li => li.kind === "item" || li.type === "item")
            .map(li => ({
              id:    li.id ?? li.itemId,
              name:  li.name,
              cat:   li.category ?? li.cat,
              price: parseFloat(li.unitPrice ?? li.price),
              qty:   li.quantity ?? li.qty,
            }))
        : svcCart.map(i => ({ ...i }));

      dispatch({
        type: "SHOW_RECEIPT",
        data: {
          type:      "Service",
          mod:       "drugstore",
          reference: receipt.reference,
          services:  receiptServices,
          items:     receiptItems,
          total:     receipt.grandTotal,
        },
      });

      dispatch({ type: "SVC_CLEAR" });
      setConfirmOpen(false);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "Failed to issue receipt. Please try again.";
      console.error("Failed to issue receipt", msg);
    } finally {
      setLoading(false);
    }
  };

  const svcTotal  = selSvcs.reduce((s, sv) => s + sv.price, 0);
  const itemTotal = svcCart.reduce((s, i) => s + i.price * i.qty, 0);
  const grand     = svcTotal + itemTotal;
  const billCount = selSvcs.length + svcCart.length;

  const summaryRows = [
    ...selSvcs.slice(0, 3).map(s => ({ label: s.name, value: fmt(s.price) })),
    ...(selSvcs.length > 3 ? [{ label: `+${selSvcs.length - 3} more service(s)`, value: "" }] : []),
    ...(svcCart.length > 0 ? [{ label: `Prescribed items (${svcCart.length})`, value: fmt(itemTotal) }] : []),
  ];

  return (
    <>
      <div className="split">
        <div>
          <ServiceSelector />
          {selSvcs.length > 0 && <ServiceItemPicker />}
        </div>
        <Card>
          <CardHeader
            title={<span style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon name="receipt" size={15} color="var(--g600)" />Bill</span>}
            action={billCount > 0 ? <span className="bcnt">{billCount}</span> : null}
          />
          <CardBody>
            {!selSvcs.length && !svcCart.length ? (
              <>
                <EmptyCart icon="service" message="Select a service first" />
                <button className="btn-receipt" disabled>
                  <Icon name="print" size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Issue Receipt
                </button>
              </>
            ) : (
              <>
                {selSvcs.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--g400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Services</div>
                    {selSvcs.map(svc => (
                      <div key={svc.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: "1px solid var(--g100)" }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{svc.name}</div>
                          <div style={{ fontSize: 11, color: "var(--g400)" }}>{svc.cat}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <strong style={{ color: "var(--pd)" }}>{fmt(svc.price)}</strong>
                          <button className="chip-clr" onClick={() => dispatch({ type: "SVC_REMOVE_SERVICE", id: svc.id })}>✕</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--g600)", padding: "5px 0", borderTop: "1px solid var(--g200)", marginTop: 2 }}>
                      <span>Services Subtotal</span><span>{fmt(svcTotal)}</span>
                    </div>
                  </div>
                )}

                {svcCart.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--g400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Prescribed Items</div>
                    {svcCart.map(i => (
                      <CartItem key={i.id} item={i}
                        onQty={(id, qty) => dispatch({ type: "SVC_QTY", id, qty })}
                        onRemove={id => dispatch({ type: "SVC_REMOVE", id })}
                      />
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--g600)", padding: "5px 0", borderTop: "1px solid var(--g200)", marginTop: 2 }}>
                      <span>Items Subtotal</span><span>{fmt(itemTotal)}</span>
                    </div>
                  </div>
                )}

                <div className="totbox">
                  {selSvcs.length > 0 && <div className="trow"><span>Services ({selSvcs.length})</span><span>{fmt(svcTotal)}</span></div>}
                  {svcCart.length > 0 && <div className="trow"><span>Items ({svcCart.length})</span><span>{fmt(itemTotal)}</span></div>}
                  <div className="trow grand"><span>Total</span><span>{fmt(grand)}</span></div>
                </div>
                <button className="btn-receipt" disabled={!selSvcs.length} onClick={handleIssueClick}>
                  <Icon name="print" size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Issue Receipt
                </button>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmReceiptDialog
        open={confirmOpen}
        title="Confirm Service Receipt"
        subtitle={`${selSvcs.length} service(s)${svcCart.length ? ` + ${svcCart.length} prescribed item(s)` : ""} will be billed and saved.`}
        rows={summaryRows}
        total={grand}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => !loading && setConfirmOpen(false)}
      />
    </>
  );
}
