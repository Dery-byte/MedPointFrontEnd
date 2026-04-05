import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "./Toast";
import { useConfig } from "../../config/ConfigContext";
import {getImageUrl} from "../../shared/services/image";


/* ── Ripple on click ─────────────────────────────────────────── */
function useRipple() {
  const ref = useRef(null);
  const trigger = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect   = el.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  };
  return [ref, trigger];
}

/* ── Computed price from discount ────────────────────────────── */
function getDiscountedPrice(price, discount) {
  if (!discount) return null;
  if (discount.type === "percent") return price * (1 - discount.value / 100);
  if (discount.type === "fixed")   return Math.max(0, price - discount.value);
  return null;
}

/* ── Discount badge label ─────────────────────────────────────── */
function discountLabel(discount, sym) {
  if (!discount) return null;
  if (discount.label) return discount.label;
  if (discount.type === "percent") return `${discount.value}% OFF`;
  return `Save ${sym}${discount.value}`;
}

/* ═══════════════════════════════════════════════════════════════
   GRID CARD
═══════════════════════════════════════════════════════════════ */
export default function ProductCard({ product, layout = "grid" }) {
  const { add, isInCart }    = useCart();
  const { toggle, isFav }    = useFavorites();
  const { toast }            = useToast();
  const { config }           = useConfig();
  const sym                  = config.currencySymbol;
  const [btnRef, ripple]     = useRipple();
  const [adding, setAdding]  = useState(false);
  const [favBurst, setFavBurst] = useState(false);

  const inCart     = isInCart(product.id);
  const favorited  = isFav(product.id);
  const outOfStock = product.stock <= 0;
  const hasVariations = product.variations?.length > 0;

  const saleActive      = product.onSale?.active && product.onSale?.newPrice != null;
  const discounted      = saleActive ? product.onSale.newPrice : getDiscountedPrice(product.price, product.discount);
  const originalForSale = saleActive ? product.onSale.oldPrice : product.price;
  const displayPrice    = discounted ?? product.price;
  const label           = saleActive ? "On Sale" : discountLabel(product.discount, sym);


  const handleAdd = (e) => {
    e.preventDefault();
    if (outOfStock || adding) return;
    // If has variations, go to detail page instead
    if (hasVariations) return;
    ripple(e);
    setAdding(true);
    add({ ...product, price: displayPrice });
    toast({ message: `${product.name} added to cart`, type: "success" });
    setTimeout(() => setAdding(false), 700);
  };

  const handleFav = (e) => {
    e.preventDefault();
    setFavBurst(true);
    toggle(product);
    toast({ message: favorited ? "Removed from favorites" : "Saved to favorites", type: favorited ? "info" : "success" });
    setTimeout(() => setFavBurst(false), 400);
  };

  /* ── LIST LAYOUT ──────────────────────────────────────────── */
  if (layout === "list") {
    return (
      <Link to={`/product/${product.id}`} className="product-list-card">
        <div className="plc-img">
          {product.imageUrl
            ? <img src= {getImageUrl(product.imageUrl)} loading="lazy" alt={product.name} />
            : <div className="plc-img-placeholder"><Icon name="package" size={28} color="var(--muted)" /></div>}
          {(product.discount || saleActive) && <span className="plc-disc-badge">{label}</span>}
        </div>

        {/* <p>{JSON.stringify(product)}</p> */}
        <div className="plc-info">
          {product.featured && <span className="plc-featured-tag"><Icon name="star" size={11} /> Featured</span>}
          <span className="plc-cat">{product.cat}</span>
          <h3 className="plc-name">{product.name}</h3>
          {hasVariations && <span className="plc-variants-hint"><Icon name="grid" size={11} /> {product.variations.length} option type{product.variations.length > 1 ? "s" : ""}</span>}
          {product.lowStock && !outOfStock && (
            <span className="plc-low-stock"><Icon name="alert" size={12} /> Only {product.stock} left</span>
          )}
        </div>
        <div className="plc-right">
          <div className="plc-price-block">
            <span className="plc-price">{sym} {displayPrice.toFixed(2)}</span>
            {discounted && <span className="plc-price-orig">{sym} {originalForSale.toFixed(2)}</span>}
          </div>
          <div className="plc-actions">
            <button
              className={`btn-fav${favorited ? " btn-fav-active" : ""}${favBurst ? " heart-burst" : ""}`}
              onClick={handleFav} aria-label="Favorite">
              <Icon name={favorited ? "heart-filled" : "heart"} size={16}
                color={favorited ? "var(--accent)" : "currentColor"} />
            </button>
            <button
              className={`btn-add-cart${inCart ? " btn-add-cart-in" : ""}${outOfStock ? " btn-add-cart-oos" : ""}`}
              onClick={handleAdd} disabled={outOfStock}>
              <Icon name={inCart ? "check" : "plus"} size={15} />
              {outOfStock ? "Out of stock" : hasVariations ? "Select options" : inCart ? "In cart" : "Add"}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  /* ── GRID LAYOUT ──────────────────────────────────────────── */
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      {/* Image area */}
      <div className="pc-img-wrap">
        {product.imageUrl
          ? <img className="pc-img" src= {getImageUrl(product.imageUrl)} alt={product.name} /> 
          : <div className="pc-img-placeholder">
              <Icon name="package" size={40} color="var(--muted)" />
            </div>}

        {/* Badges */}
        {product.featured && (
          <div className="pc-featured-crown">
            <Icon name="star" size={12} color="#fbbf24" />
          </div>
        )}
        {(product.discount || saleActive) && (
          <div className="pc-discount-badge badge-pop">{label}</div>
        )}
        {outOfStock && (
          <div className="pc-oos-badge">Out of stock</div>
        )}
        {product.lowStock && !outOfStock && !product.discount && !saleActive && (
          <div className="pc-low-badge"><Icon name="alert" size={11} /> Low stock</div>
        )}

        {/* Favorite btn */}
        <button
          className={`pc-fav-btn${favorited ? " pc-fav-btn-active" : ""}${favBurst ? " heart-burst" : ""}`}
          onClick={handleFav}
          aria-label={favorited ? "Remove from favorites" : "Save to favorites"}>
          <Icon name={favorited ? "heart-filled" : "heart"} size={17}
            color={favorited ? "var(--accent)" : "currentColor"} />
        </button>
      </div>

      {/* Info */}
      <div className="pc-body">
        <span className="pc-cat">{product.cat}</span>
        <h3 className="pc-name">{product.name}</h3>

        {hasVariations && (
          <p className="pc-variants-tag">
            <Icon name="grid" size={12} /> {product.variations.map(v => v.name).join(" · ")}
          </p>
        )}

        <div className="pc-footer">
          <div className="pc-price-block">
            <span className="pc-price">{sym} {displayPrice.toFixed(2)}</span>
            {discounted && (
              <span className="pc-price-orig">{sym} {originalForSale.toFixed(2)}</span>
            )}
          </div>

          {/* Add button with ripple */}
          <button
            ref={btnRef}
            className={`pc-add-btn ripple-host${inCart ? " pc-add-btn-in" : ""}${outOfStock ? " pc-add-btn-oos" : ""}${adding ? " pc-add-btn-adding" : ""}`}
            onClick={handleAdd}
            disabled={outOfStock || adding}
            aria-label={hasVariations ? "Select options" : inCart ? "In cart" : "Add to cart"}>
            <Icon name={
              hasVariations ? "chevron-right" :
              inCart        ? "check"         :
              adding        ? "loader"        : "plus"
            } size={16} className={adding ? "spin" : ""} />
          </button>
        </div>
      </div>
    </Link>
  );
}
