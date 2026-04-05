import { useState, useEffect } from "react";
import Icon from "../../../shared/components/Icon";
import { getStoreOrders, updateOrderStatus } from "../../../store/services/orderService";

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

/**
 * Valid one-directional transitions.
 * pending → processing → delivered (terminal)
 * Any active state → cancelled
 * cancelled → pending (restore)
 */
const NEXT_STATUSES = {
  pending:    ["processing", "cancelled"],
  processing: ["delivered",  "cancelled"],
  delivered:  [],   // terminal — shown as locked
  cancelled:  [],   // use Restore button instead
};

function StatusBadge({ status }) {
  const s = (status ?? "pending").toLowerCase();
  const sc = STATUS_COLORS[s] ?? STATUS_COLORS.pending;
  return (
    <span className="order-status-badge" style={{ background: sc.bg, color: sc.text }}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

/** Opens a print-ready popup with the shipping label for this order. */
function printShippingLabel(order) {
  const win = window.open("", "_blank", "width=420,height=320");
  if (!win) return;
  const addr = order.address || order.deliveryAddress || "No address provided";
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Shipping Label — ${order.reference ?? order.id}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: Arial, sans-serif;
          padding: 28px 32px;
          width: 380px;
        }
        .label-box {
          border: 2.5px solid #000;
          border-radius: 4px;
          padding: 20px 22px;
        }
        .label-from {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #555;
          margin-bottom: 12px;
        }
        .label-from strong { display: block; font-size: 11px; color: #000; margin-top: 2px; }
        .label-divider { border: none; border-top: 1.5px dashed #aaa; margin: 12px 0; }
        .label-to {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #555;
          margin-bottom: 8px;
        }
        .label-name { font-size: 18px; font-weight: 700; color: #000; margin-bottom: 4px; }
        .label-phone { font-size: 13px; color: #333; margin-bottom: 4px; }
        .label-addr { font-size: 13px; color: #000; line-height: 1.5; }
        .label-ref {
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px dashed #ccc;
          font-size: 10px;
          color: #777;
          display: flex;
          justify-content: space-between;
        }
      </style>
    </head>
    <body>
      <div class="label-box">
        <p class="label-from">From<strong>MedPoint Store, Accra</strong></p>
        <hr class="label-divider" />
        <p class="label-to">Ship To</p>
        <p class="label-name">${order.customerName ?? "Customer"}</p>
        ${order.phone ? `<p class="label-phone">Tel: ${order.phone}</p>` : ""}
        <p class="label-addr">${addr.replace(/\n/g, "<br/>")}</p>
        <div class="label-ref">
          <span>Ref: ${order.reference ?? order.id}</span>
          <span>${new Date(order.createdAt).toLocaleDateString("en-GH")}</span>
        </div>
      </div>
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

// ── Status timeline entry ──────────────────────────────────────────────────

function HistoryTimeline({ history }) {
  if (!history || history.length === 0) return null;
  return (
    <div className="so-history-wrap">
      <h4 className="so-section-title">Status history</h4>
      <div className="so-history-list">
        {history.map((h, i) => {
          const sc = STATUS_COLORS[h.toStatus?.toLowerCase()] ?? STATUS_COLORS.pending;
          return (
            <div key={i} className="so-history-entry">
              <span
                className="so-history-dot"
                style={{ background: sc.text }}
              />
              <div className="so-history-body">
                <span className="so-history-badge" style={{ background: sc.bg, color: sc.text }}>
                  {h.fromStatus
                    ? `${h.fromStatus} → ${h.toStatus}`
                    : h.toStatus}
                </span>
                <span className="so-history-meta">
                  {h.changedBy && <>{h.changedBy} · </>}
                  {fmtDateTime(h.changedAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Status control ────────────────────────────────────────────────────────

function StatusControl({ order, onUpdated }) {
  const current = (order.status ?? "pending").toLowerCase();
  const nextOptions = NEXT_STATUSES[current] ?? [];
  const isTerminal  = current === "delivered";
  const isCancelled = current === "cancelled";

  const [selected, setSelected] = useState(nextOptions[0] ?? "");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);

  // Reset selected when order status changes externally
  useEffect(() => {
    setSelected(NEXT_STATUSES[(order.status ?? "pending").toLowerCase()]?.[0] ?? "");
  }, [order.status]);

  async function save(statusToSave) {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, statusToSave);
      onUpdated(updated);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  if (isTerminal) {
    return (
      <div className="so-status-locked">
        <Icon name="check-circle" size={14} color="#059669" />
        <span>Order delivered — no further changes</span>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="so-status-cancelled-wrap">
        <p className="so-cancelled-note">
          <Icon name="alert-circle" size={13} color="#dc2626" /> Order is cancelled.
        </p>
        <button
          className="so-restore-btn"
          disabled={saving}
          onClick={() => save("pending")}
        >
          {saving ? "Restoring…" : "↩ Restore to Pending"}
        </button>
        {error && <p className="so-save-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="so-status-control-wrap">
      <div className="so-status-control">
        <select
          className="so-status-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={saving || nextOptions.length === 0}
        >
          {nextOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          className="so-save-btn"
          onClick={() => save(selected)}
          disabled={saving || !selected}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {error && <p className="so-save-error">{error}</p>}
      {order.statusChangedBy && (
        <p className="so-audit-tag">
          <Icon name="clock" size={12} />
          Last changed by <strong>{order.statusChangedBy}</strong> · {fmtDateTime(order.statusChangedAt)}
        </p>
      )}
    </div>
  );
}

// ── Order row card ────────────────────────────────────────────────────────

function OrderRow({ order, onUpdated }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="so-card">
      {/* Header — always visible */}
      <button
        className={`so-card-header${open ? " so-card-header-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="so-ref">
          <Icon name="clipboard-list" size={14} color="var(--muted)" />
          <code>{order.reference ?? order.id}</code>
        </span>

        <span className="so-customer">
          <Icon name="user" size={13} color="var(--muted)" />
          {order.customerName ?? "Guest"}
          {order.phone && <span className="so-phone">{order.phone}</span>}
        </span>

        <span className="so-meta-group">
          <span className="so-items-count">{order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}</span>
          <strong className="so-total">{fmt(order.total ?? 0)}</strong>
        </span>

        <StatusBadge status={order.status} />

        <span className="so-date">{fmtDateTime(order.createdAt)}</span>

        <span className={`so-chevron${open ? " so-chevron-open" : ""}`}>
          <Icon name="chevron-down" size={16} />
        </span>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="so-card-body">
          <div className="so-body-grid">
            {/* Customer info */}
            <div className="so-detail-section">
              <div className="so-section-header">
                <h4 className="so-section-title">Customer</h4>
                {(order.address || order.deliveryAddress || order.phone) && (
                  <button
                    className="so-print-label-btn"
                    title="Print shipping label"
                    onClick={(e) => { e.stopPropagation(); printShippingLabel(order); }}
                  >
                    <Icon name="printer" size={13} /> Print label
                  </button>
                )}
              </div>
              <p><Icon name="user" size={13} /> {order.customerName ?? "Guest"}</p>
              {order.phone && <p><Icon name="phone" size={13} /> {order.phone}</p>}
              {order.customerEmail && <p><Icon name="mail" size={13} /> {order.customerEmail}</p>}
              {order.address && <p><Icon name="map-pin" size={13} /> {order.address}</p>}
            </div>

            {/* Payment info */}
            <div className="so-detail-section">
              <h4 className="so-section-title">Payment</h4>
              <p>Method: <strong>{order.paymentMethod ?? "—"}</strong></p>
              <p>Total: <strong>{fmt(order.total ?? 0)}</strong></p>
              <p>Placed: <span>{fmtDateTime(order.createdAt)}</span></p>
            </div>

            {/* Status control */}
            <div className="so-detail-section">
              <h4 className="so-section-title">Update Status</h4>
              <StatusControl order={order} onUpdated={onUpdated} />
            </div>
          </div>

          {/* Items list */}
          {order.items?.length > 0 && (
            <div className="so-items-section">
              <h4 className="so-section-title">Items</h4>
              <div className="so-items-list">
                {order.items.map((item, i) => (
                  <div key={i} className="so-item-row">
                    <div className="so-item-img-wrap">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="so-item-thumb"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="so-item-thumb-placeholder"
                        style={{ display: item.imageUrl ? "none" : "flex" }}
                      >
                        <Icon name="shopping-bag" size={18} color="var(--muted)" />
                      </div>
                    </div>
                    <div className="so-item-details">
                      <span className="so-item-name">{item.name}</span>
                      <span className="so-item-qty">× {item.quantity ?? item.qty}</span>
                    </div>
                    <div className="so-item-pricing">
                      <span className="so-item-unit">{fmt(item.unitPrice ?? item.price)}</span>
                      <span className="so-item-subtotal">{fmt((item.unitPrice ?? item.price) * (item.quantity ?? item.qty))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status history timeline */}
          {order.statusHistory?.length > 0 && (
            <div className="so-items-section so-history-section">
              <HistoryTimeline history={order.statusHistory} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

const FILTER_STATUSES = ["pending", "processing", "delivered", "cancelled"];

export default function StorefrontOrders() {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await getStoreOrders();
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleOrderUpdated(updated) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  const filtered = orders
    .filter((o) => filterStatus === "all" || (o.status ?? "pending").toLowerCase() === filterStatus)
    .filter((o) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (o.reference ?? "").toLowerCase().includes(s) ||
        (o.customerName ?? "").toLowerCase().includes(s)
      );
    });

  const totalRevenue = orders.reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-sub">
            {orders.length} total · {fmt(totalRevenue)} revenue
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters-bar">
        <div className="admin-search-field">
          <Icon name="search" size={16} color="var(--muted)" />
          <input
            className="admin-search-input"
            placeholder="Search by reference or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="admin-cat-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          {FILTER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading-rows">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skel skel-table-row" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">
          <Icon name="clipboard-list" size={44} color="var(--muted)" />
          <p>{orders.length === 0 ? "No orders yet" : "No orders match your filters"}</p>
        </div>
      ) : (
        <div className="so-list">
          {filtered.map((o) => (
            <OrderRow key={o.id ?? o.reference} order={o} onUpdated={handleOrderUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
