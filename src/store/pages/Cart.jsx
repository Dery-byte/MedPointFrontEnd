import { Link, useNavigate } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../../shared/services/image";

function fmt(n) { return `GH₵ ${Number(n).toFixed(2)}`; }

function CartRow({ item }) {
  const { increment, decrement, remove, setQty } = useCart();
  return (
    <div className="cart-page-row">
      <div className="cpr-img">
        {item.imageUrl ? (
          <img src={getImageUrl(item.imageUrl)} alt={item.name} />
        ) : (
          <div className="cpr-img-ph">
            <Icon name="package" size={28} color="var(--muted)" />
          </div>
        )}
      </div>
      <div className="cpr-info">
        <Link to={`/product/${item.id}`} className="cpr-name">{item.name}</Link>
        <span className="cpr-cat">{item.cat}</span>
        <span className="cpr-unit-price">{fmt(item.price)} each</span>
      </div>
      <div className="cpr-qty">
        <button className="qty-btn" onClick={() => decrement(item.id)}>
          <Icon name="minus" size={14} />
        </button>
        <input
          className="qty-input"
          type="number"
          min="1"
          max={item.stock}
          value={item.qty}
          onChange={(e) => setQty(item.id, parseInt(e.target.value) || 1)}
        />
        <button
          className="qty-btn"
          onClick={() => increment(item.id)}
          disabled={item.qty >= item.stock}
        >
          <Icon name="plus" size={14} />
        </button>
      </div>
      <div className="cpr-subtotal">{fmt(item.price * item.qty)}</div>
      <button className="cpr-remove" onClick={() => remove(item.id)} aria-label="Remove">
        <Icon name="trash" size={16} />
      </button>
    </div>
  );
}

export default function Cart() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <main className="container cart-page">
        <div className="empty-state empty-state-page">
          <div className="empty-state-icon">
            <Icon name="shopping-bag" size={56} color="var(--muted)" />
          </div>
          <h2>Your cart is empty</h2>
          <p>Add some products from the shop to continue.</p>
          <Link to="/shop" className="btn-primary">
            Start shopping <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container cart-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Icon name="shopping-bag" size={26} /> Your Cart
          </h1>
          <p className="page-sub">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn-outline btn-sm" onClick={clear}>
          <Icon name="trash" size={14} /> Clear cart
        </button>
      </div>

      <div className="cart-page-layout">
        {/* Item list */}
        <div className="cart-page-items">
          <div className="cart-page-table-head">
            <span>Product</span>
            <span>Qty</span>
            <span>Subtotal</span>
            <span />
          </div>
          {items.map((item) => (
            <CartRow key={item.id} item={item} />
          ))}
        </div>

        {/* Order summary */}
        <div className="cart-page-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-rows">
            {items.map((item) => (
              <div key={item.id} className="summary-row">
                <span>{item.name} × {item.qty}</span>
                <span>{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="summary-total-row">
            <span>Total</span>
            <strong>{fmt(total)}</strong>
          </div>
          <p className="summary-note">
            <Icon name="map-pin" size={13} /> Delivery fee calculated at checkout
          </p>
          <button
            className="btn-primary summary-checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to checkout <Icon name="arrow-right" size={16} />
          </button>
          <Link to="/shop" className="summary-continue-link">
            <Icon name="arrow-left" size={14} /> Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
