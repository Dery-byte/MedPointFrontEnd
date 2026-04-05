import { useLocation, Link } from "react-router-dom";
import Icon from "../../shared/components/Icon";

function fmt(n) { return `GH₵ ${Number(n).toFixed(2)}`; }

export default function OrderConfirmation() {
  const { state } = useLocation();

  if (!state?.reference) {
    return (
      <main className="container" style={{ paddingTop: "4rem" }}>
        <div className="empty-state empty-state-page">
          <Icon name="alert" size={48} color="var(--muted)" />
          <h2>No order found</h2>
          <Link to="/shop" className="btn-primary">Back to shop</Link>
        </div>
      </main>
    );
  }

  const { reference, total, items = [], payMethod, name } = state;

  return (
    <main className="container order-confirm-page">
      <div className="order-confirm-card">
        {/* Success icon */}
        <div className="oc-success-icon">
          <div className="oc-success-ring">
            <Icon name="check" size={36} color="#fff" strokeWidth={3} />
          </div>
        </div>

        <h1 className="oc-title">Order confirmed!</h1>
        <p className="oc-sub">
          Thank you{name ? `, ${name.split(" ")[0]}` : ""}. Your order has been placed successfully.
        </p>

        <div className="oc-reference">
          <span className="oc-ref-label">Order reference</span>
          <span className="oc-ref-value">{reference}</span>
        </div>

        {/* Payment summary */}
        <div className="oc-summary">
          <div className="oc-summary-row">
            <Icon name="credit-card" size={16} color="var(--muted)" />
            <span>Payment via</span>
            <strong>
              {payMethod === "mtn" ? "MTN Mobile Money"
                : payMethod === "vodafone" ? "Vodafone Cash"
                : payMethod === "airteltigo" ? "AirtelTigo Money"
                : payMethod === "card" ? "Card"
                : "Mobile Money"}
            </strong>
          </div>
          <div className="oc-summary-row">
            <Icon name="package" size={16} color="var(--muted)" />
            <span>Items</span>
            <strong>{items.length} product{items.length !== 1 ? "s" : ""}</strong>
          </div>
          <div className="oc-summary-row oc-total-row">
            <Icon name="tag" size={16} color="var(--muted)" />
            <span>Total paid</span>
            <strong className="oc-total-val">{fmt(total)}</strong>
          </div>
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="oc-items">
            <h3 className="oc-items-title">Order items</h3>
            {items.map((item) => (
              <div key={item.id} className="oc-item-row">
                <span className="oc-item-name">{item.name}</span>
                <span className="oc-item-qty">× {item.qty}</span>
                <span className="oc-item-price">{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
        )}

        {/* What next */}
        <div className="oc-next">
          <div className="oc-next-step">
            <div className="oc-next-num">1</div>
            <p>You'll receive a confirmation via SMS or email shortly</p>
          </div>
          <div className="oc-next-step">
            <div className="oc-next-num">2</div>
            <p>Our team will prepare your order for delivery</p>
          </div>
          <div className="oc-next-step">
            <div className="oc-next-num">3</div>
            <p>Your order will be delivered to your address</p>
          </div>
        </div>

        <div className="oc-actions">
          <Link to="/shop" className="btn-primary">
            <Icon name="shopping-bag" size={16} /> Continue shopping
          </Link>
          <Link to="/" className="btn-outline">
            <Icon name="home" size={16} /> Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
