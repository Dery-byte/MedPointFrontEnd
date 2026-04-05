import { fmt } from "../../helpers";
import CartItem from "../../components/CartItem";
import EmptyCart from "../../components/EmptyCart";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Icon from "../../../shared/components/Icon";

export default function DrugStoreBill({ cart, onQty, onRemove, onIssue, emptyIcon, emptyMessage, disabled = false }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Card>
      <CardHeader
        title={<span style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon name="receipt" size={15} color="var(--g600)" />Bill</span>}
        action={cart.length > 0 ? <span className="bcnt">{cart.length}</span> : null}
      />
      <CardBody>
        {cart.length === 0 ? (
          <>
            <EmptyCart icon={emptyIcon} message={emptyMessage} />
            <button className="btn-receipt" disabled>
              <Icon name="print" size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Issue Receipt
            </button>
          </>
        ) : (
          <>
            {cart.map(i => (
              <CartItem key={i.id} item={i} onQty={onQty} onRemove={onRemove} />
            ))}
            <div className="totbox">
              <div className="trow"><span>Items ({cart.length})</span><span>{fmt(total)}</span></div>
              <div className="trow grand"><span>Total</span><span>{fmt(total)}</span></div>
            </div>
            <button className="btn-receipt" disabled={disabled} onClick={onIssue}>
              <Icon name="print" size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Issue Receipt
            </button>
          </>
        )}
      </CardBody>
    </Card>
  );
}
