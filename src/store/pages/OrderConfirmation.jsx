import { useState, useEffect } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { verifyPayment, submitOrder } from "../services/orderService";

function fmt(n) { return `GH₵ ${Number(n).toFixed(2)}`; }

function SuccessCard({ reference, total, items = [], payMethod, name }) {
  return (
    <main className="container order-confirm-page">
      <div className="order-confirm-card">
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

        <div className="oc-summary">
          <div className="oc-summary-row">
            <Icon name="credit-card" size={16} color="var(--muted)" />
            <span>Payment via</span>
            <strong>
              {payMethod === "mtn" ? "MTN Mobile Money"
                : payMethod === "vodafone" ? "Vodafone Cash"
                : payMethod === "airteltigo" ? "AirtelTigo Money"
                : payMethod === "card" ? "Card"
                : "Paystack"}
            </strong>
          </div>
          <div className="oc-summary-row">
            <Icon name="package" size={16} color="var(--muted)" />
            <span>Items</span>
            <strong>{items.length} product{items.length !== 1 ? "s" : ""}</strong>
          </div>
          {total != null && (
            <div className="oc-summary-row oc-total-row">
              <Icon name="tag" size={16} color="var(--muted)" />
              <span>Total paid</span>
              <strong className="oc-total-val">{fmt(total)}</strong>
            </div>
          )}
        </div>

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

export default function OrderConfirmation() {
  const { state }          = useLocation();
  const [searchParams]     = useSearchParams();
  const [recovered, setRecovered]       = useState(null);
  const [recovering, setRecovering]     = useState(false);
  const [recoverError, setRecoverError] = useState("");

  // Handle backend redirect: /order-confirmation?reference=xxx
  useEffect(() => {
    const ref = searchParams.get("reference");
    if (!ref || state?.reference) return; // already have state, nothing to do
    setRecovering(true);
    (async () => {
      try {
        const verified = await verifyPayment(ref);
        if (!verified.success) throw new Error("Payment could not be confirmed");

        // Recover pending order data saved before payment redirect
        const pendingRaw = localStorage.getItem(`pending_order_${ref}`);
        const pending    = pendingRaw ? JSON.parse(pendingRaw) : null;

        if (pending) {
          await submitOrder({
            customer:         { name: pending.name, email: pending.email, phone: pending.phone },
            items:            pending.items,
            total:            pending.grandTotal,
            paymentMethod:    "PAYSTACK",
            paymentReference: ref,
            deliveryAddress:  pending.deliveryAddress,
          });
          localStorage.removeItem(`pending_order_${ref}`);
        }

        setRecovered({
          reference: ref,
          total:     pending?.grandTotal ?? verified.amount,
          items:     pending?.items ?? [],
          payMethod: "PAYSTACK",
          name:      pending?.name ?? "",
        });
      } catch (e) {
        setRecoverError(e.message || "Could not confirm your order. Please contact support.");
      } finally {
        setRecovering(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading state during redirect recovery
  if (recovering) {
    return (
      <main className="container" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <span className="spin-ring" style={{ display: "inline-block", width: 32, height: 32, borderWidth: 3, marginBottom: 16 }} />
        <p style={{ color: "var(--muted)" }}>Confirming your payment…</p>
      </main>
    );
  }

  // Recovery error state
  if (recoverError) {
    return (
      <main className="container" style={{ paddingTop: "4rem" }}>
        <div className="empty-state empty-state-page">
          <Icon name="alert" size={48} color="var(--muted)" />
          <h2>Payment confirmation failed</h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>{recoverError}</p>
          <Link to="/shop" className="btn-primary">Back to shop</Link>
        </div>
      </main>
    );
  }

  // No order data at all
  const data = state ?? recovered;
  if (!data?.reference) {
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

  return <SuccessCard {...data} />;
}
