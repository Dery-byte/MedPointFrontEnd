import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { getMyOrders } from "../services/orderService";

function fmt(n) { return `GH₵ ${Number(n).toFixed(2)}`; }

function fmtDateTime(val) {
  if (!val) return "—";
  return new Date(val).toLocaleString("en-GH", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_COLORS = {
  pending:    { bg: "#fef3c7", text: "#d97706" },
  processing: { bg: "#dbeafe", text: "#2563eb" },
  delivered:  { bg: "#d1fae5", text: "#059669" },
  cancelled:  { bg: "#fee2e2", text: "#dc2626" },
};

function StatusBadge({ status }) {
  const s = (status ?? "pending").toLowerCase();
  const sc = STATUS_COLORS[s] ?? STATUS_COLORS.pending;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: sc.bg,
        color: sc.text,
      }}
    >
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-order-card">
      <button
        className={`my-order-header${open ? " my-order-header-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="my-order-ref">
          <Icon name="clipboard-list" size={14} color="var(--muted)" />
          <code>{order.reference ?? order.id}</code>
        </span>

        <span className="my-order-meta">
          <span className="my-order-date">{fmtDateTime(order.createdAt)}</span>
          <StatusBadge status={order.status} />
          <strong className="my-order-total">{fmt(order.total ?? 0)}</strong>
        </span>

        <span className={`my-order-chevron${open ? " my-order-chevron-open" : ""}`}>
          <Icon name="chevron-down" size={16} />
        </span>
      </button>

      {open && (
        <div className="my-order-body">
          {order.items?.length > 0 ? (
            <div className="my-order-items">
              {order.items.map((item, i) => (
                <div key={i} className="my-order-item-row">
                  <div className="my-order-item-img">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="my-order-thumb"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="my-order-thumb-placeholder"
                      style={{ display: item.imageUrl ? "none" : "flex" }}
                    >
                      <Icon name="shopping-bag" size={20} color="var(--muted)" />
                    </div>
                  </div>
                  <div className="my-order-item-info">
                    <span className="my-order-item-name">{item.name}</span>
                    <span className="my-order-item-qty">Qty: {item.quantity ?? item.qty}</span>
                  </div>
                  <div className="my-order-item-price">
                    <span>{fmt(item.unitPrice ?? item.price)} each</span>
                    <strong>{fmt((item.unitPrice ?? item.price) * (item.quantity ?? item.qty))}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="my-order-no-items">No item details available.</p>
          )}

          <div className="my-order-footer">
            <span>Payment: <strong>{order.paymentMethod ?? "—"}</strong></span>
            <span>Total: <strong>{fmt(order.total ?? 0)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  return (
    <div className="store-page orders-page">
      <div className="orders-page-header">
        <h1>My Orders</h1>
        <p className="orders-page-sub">Track all your purchases</p>
      </div>

      {loading ? (
        <div className="orders-loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skel" style={{ height: 64, borderRadius: 10, marginBottom: 10 }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <Icon name="clipboard-list" size={52} color="var(--muted)" />
          <h3>No orders yet</h3>
          <p>When you place an order it will appear here.</p>
          <Link to="/shop" className="btn-primary">Start shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <OrderCard key={o.id ?? o.reference} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
