import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Icon from "../../shared/components/Icon";

import { getImageUrl } from "../../shared/services/image";

function fmt(n) {
  return `GH₵ ${Number(n).toFixed(2)}`;
}

function CartItemRow({ item }) {
  const { increment, decrement, remove } = useCart();
  return (
    <div className="cart-item-row">
      <div className="cart-item-img">
        {item.imageUrl ? (
          <img src={getImageUrl(item.imageUrl)} alt={item.name} />
        ) : (
          <div className="cart-item-img-placeholder">
            <Icon name="package" size={22} color="var(--muted)" />
          </div>
        )}
      </div>
      <div className="cart-item-info">
        <p className="cart-item-name">{item.name}</p>
        <p className="cart-item-cat">{item.cat}</p>
        <p className="cart-item-price">{fmt(item.price)}</p>
      </div>
      <div className="cart-item-qty">
        <button
          className="qty-btn"
          onClick={() => decrement(item.id)}
          aria-label="Decrease"
        >
          <Icon name="minus" size={14} />
        </button>
        <span className="qty-value">{item.qty}</span>
        <button
          className="qty-btn"
          onClick={() => increment(item.id)}
          disabled={item.qty >= item.stock}
          aria-label="Increase"
        >
          <Icon name="plus" size={14} />
        </button>
      </div>
      <button
        className="cart-item-remove"
        onClick={() => remove(item.id)}
        aria-label="Remove"
      >
        <Icon name="trash" size={15} />
      </button>
    </div>
  );
}

export default function CartDrawer({ open, onClose }) {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop${open ? " drawer-backdrop-open" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={`cart-drawer${open ? " cart-drawer-open" : ""}`}>
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <Icon name="shopping-bag" size={20} />
            <h2>Your Cart</h2>
          </div>
          <button className="cart-drawer-close" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <Icon name="shopping-bag" size={48} color="var(--muted)" />
            </div>
            <p className="cart-empty-title">Your cart is empty</p>
            <p className="cart-empty-sub">Add some products to get started</p>
            <button className="btn-primary cart-empty-btn" onClick={onClose}>
              Browse products
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
            <div className="cart-drawer-footer">
              <div className="cart-summary-row">
                <span>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                <strong>{`GH₵ ${total.toFixed(2)}`}</strong>
              </div>
              <p className="cart-summary-note">
                Shipping and taxes calculated at checkout
              </p>
              <button className="btn-primary cart-checkout-btn" onClick={goCheckout}>
                Proceed to checkout
                <Icon name="arrow-right" size={16} />
              </button>
              <button className="cart-clear-btn" onClick={clear}>
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
