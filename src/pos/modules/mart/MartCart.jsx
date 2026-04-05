import { useState } from "react";
import { useApp } from "../../AppContext";
import { fmt } from "../../helpers";
import CartItem from "../../components/CartItem";
import EmptyCart from "../../components/EmptyCart";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Icon from "../../../shared/components/Icon";
import ConfirmReceiptDialog from "../../components/ConfirmReceiptDialog";

export default function MartCart({ onCheckout }) {
  const { state, dispatch } = useApp();
  const { mCart } = state;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = mCart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleCheckoutClick = () => {
    if (!mCart.length) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onCheckout();
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const summaryRows = mCart.slice(0, 4).map(i => ({
    label: `${i.name} × ${i.qty}`,
    value: fmt(i.price * i.qty),
  }));
  if (mCart.length > 4) {
    summaryRows.push({ label: `+${mCart.length - 4} more item(s)`, value: "" });
  }

  return (
    <>
      <Card>
        <CardHeader
          title={
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="cart" size={15} color="var(--g600)" />Cart
            </span>
          }
          action={mCart.length > 0 ? <span className="bcnt">{mCart.length}</span> : null}
        />
        <CardBody>
          {mCart.length === 0 ? (
            <>
              <EmptyCart icon="cart" message="Double-click a product to add" />
              <button className="btn-receipt" disabled>
                <Icon name="print" size={14} />Checkout &amp; Receipt
              </button>
            </>
          ) : (
            <>
              {mCart.map(i => (
                <CartItem key={i.id} item={i}
                  onQty={(id, qty) => dispatch({ type: "MART_QTY", id, qty })}
                  onRemove={id => dispatch({ type: "MART_REMOVE", id })}
                />
              ))}
              <div className="totbox">
                <div className="trow"><span>Items ({mCart.length})</span><span>{fmt(total)}</span></div>
                <div className="trow grand"><span>Total</span><span>{fmt(total)}</span></div>
              </div>
              <button className="btn-receipt" onClick={handleCheckoutClick}>
                <Icon name="print" size={14} />Checkout &amp; Receipt
              </button>
            </>
          )}
        </CardBody>
      </Card>

      <ConfirmReceiptDialog
        open={confirmOpen}
        title="Confirm Mart Checkout"
        subtitle={`${mCart.length} item(s) will be checked out and stock updated.`}
        rows={summaryRows}
        total={total}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => !loading && setConfirmOpen(false)}
      />
    </>
  );
}
