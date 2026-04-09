import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import AnimateIn from "../components/AnimateIn";
import VariationPicker from "../components/VariationPicker";
import { DiscountBadge, PriceDisplay } from "../components/DiscountBadge";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../components/Toast";
import { useConfig } from "../../config/ConfigContext";
import MartService from "../services/martService";
import { getImageUrl } from "../../shared/services/image";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, increment, decrement, isInCart, items } = useCart();
  const { toggle, isFav } = useFavorites();
  const { toast } = useToast();
  const { config } = useConfig();
  const sym = config.currencySymbol;

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});   // variation selections
  const [allPicked, setAllPicked] = useState(false);
  const [localQty, setLocalQty] = useState(1);    // qty before adding to cart




  useEffect(() => {
    setLoading(true);
    setSelected({});
    setLocalQty(1);
    MartService.getById(id)
    .then(async p => {
  // Normalize variations
  let variations = p.variations;
  if (typeof variations === "string" && variations.trim().startsWith("[")) {
    try { variations = JSON.parse(variations); } catch { variations = []; }
  } else if (!Array.isArray(variations)) {
    variations = [];
  }

  // Normalize tags
  let tags = p.tags;
  if (typeof tags === "string" && tags.trim()) {
    tags = tags.split(",").map(t => t.trim());
  } else if (!Array.isArray(tags)) {
    tags = [];
  }

  setProduct({ ...p, variations, tags });
  const all = await MartService.getAll();
  setRelated(all.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4));
})
      .catch(() => navigate("/shop"))
      .finally(() => setLoading(false));
  }, [id]);

  // When no variations, allPicked is always true
  // useEffect(() => {
  //   if (!product) return;
  //   if (!product.variations?.length) { setAllPicked(true); return; }
  //   setAllPicked(product.variations.every(v => selected[v.name]));
  // }, [selected, product]);

  useEffect(() => {
    if (!product) return;
    const vars = Array.isArray(product.variations) ? product.variations : [];
    if (!vars.length) { setAllPicked(true); return; }
    setAllPicked(vars.every(v => selected[v.name]));
  }, [selected, product]);

  if (loading) return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "4rem" }}>
      <div className="product-detail-skeleton">
        <div className="pds-img shimmer" />
        <div className="pds-info">
          {[1, 2, 3, 4].map(i => <div key={i} className={`skel shimmer ${["skel-lg", "skel-md", "skel-sm", "skel-btn"][i - 1]}`} />)}
        </div>
      </div>
    </main>
  );
  if (!product) return null;

  /* ── Computed values ──────────────────────────────────────── */
  const inCart = isInCart(product.id);
  const cartItem = items.find(i => i.id === product.id);
  const favorited = isFav(product.id);
  // const hasVars = product.variations?.length > 0;
  const hasVars = Array.isArray(product.variations) && product.variations.length > 0;

  // Variation-driven price / stock
  let displayPrice = product.price;
  let displayStock = product.stock;
  if (hasVars && allPicked) {
    const selOptions = Object.values(selected);
    const priceAdjust = selOptions.reduce((s, o) => s + (o.price || 0), 0);
    displayPrice = product.price + priceAdjust;
    displayStock = Math.min(...selOptions.map(o => o.stock ?? product.stock));
  }

  // Apply discount on top of variation price
  // let finalPrice = displayPrice;
  // if (product.discount) {
  //   if (product.discount.type === "percent")
  //     finalPrice = displayPrice * (1 - product.discount.value / 100);
  //   else
  //     finalPrice = Math.max(0, displayPrice - product.discount.value);
  // }

  // WITH:
  let finalPrice = displayPrice;
  if (product.discount) {
    if (product.discounType === "PERCENT")
      finalPrice = displayPrice * (1 - product.discount / 100);
    else
      finalPrice = Math.max(0, displayPrice - product.discount);
  }



  const outOfStock = hasVars ? (allPicked && displayStock <= 0) : product.stock <= 0;

  const handleAdd = () => {
    if (!allPicked || outOfStock) return;
    add({ ...product, price: finalPrice, _selectedVariations: selected });
    toast({ message: `${product.name} added to cart`, type: "success" });
  };

  const handleFav = () => {
    toggle(product);
    toast({
      message: favorited ? "Removed from favorites" : "Saved to favorites",
      type: favorited ? "info" : "success"
    });
  };

  // const discountLabel = product.discount?.label
  //   || (product.discountype === "PERCENT" ? `${product.discount}% OFF`
  //     : `Save ${sym} ${product.discount}`);


  // WITH:
  const discountLabel = product.discounType === "PERCENT"
    ? `${product.discount}% OFF`
    : `Save ${sym} ${product.discount?.toFixed(2)}`;
  return (
    <main className="container product-detail-page">

      {/* Breadcrumb */}
      <AnimateIn>
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <Icon name="chevron-right" size={13} />
          <Link to="/shop">Shop</Link>
          <Icon name="chevron-right" size={13} />
          <Link to={`/shop?cat=${encodeURIComponent(product.cat)}`}>{product.cat}</Link>
          <Icon name="chevron-right" size={13} />
          <span>{product.name}</span>
        </nav>
      </AnimateIn>

      <div className="product-detail">

        {/* ── Image ─────────────────────────────────────── */}
        <AnimateIn from="left" className="pd-image-col">
          <div className="pd-image-wrap">
            {product.imageUrl
              ? <img className="pd-image" src={getImageUrl(product.imageUrl)} loading="lazy" alt={product.name} />
              : <div className="pd-image-placeholder">
                <Icon name="package" size={80} color="var(--muted)" />
              </div>}
            {/* <p>{JSON.stringify(product)}</p> */}
            {product.discount && (
              <div className="pd-discount-badge badge-pop">{discountLabel}</div>
            )}
            {product.featured && (
              <div className="pd-featured-badge">
                <Icon name="star" size={13} color="#fbbf24" /> Featured
              </div>
            )}
          </div>
        </AnimateIn>

        {/* ── Info ──────────────────────────────────────── */}
        <AnimateIn from="right" delay={80} className="pd-info">
          {product.featured && (
            <div className="pd-featured-tag reveal-up">
              <Icon name="star" size={13} color="#fbbf24" /> Featured product
            </div>
          )}
          <span className="pd-cat">{product.cat}</span>
          <h1 className="pd-name">{product.name}</h1>

          {/* Tags */}
          {(() => {
            const tags = Array.isArray(product.tags)
              ? product.tags
              : typeof product.tags === "string" && product.tags.trim()
                ? product.tags.split(",").map(t => t.trim())
                : [];
            return tags.length > 0 ? (
              <div className="pd-tags">
                {tags.map(tag => <span key={tag} className="pd-tag">{tag}</span>)}
              </div>
            ) : null;
          })()}
          {/* {product.tags?.length > 0 && (
            <div className="pd-tags">
              {product.tags.map(tag => (
                <span key={tag} className="pd-tag">{tag}</span>
              ))}
            </div>
          )} */}

          {/* Price */}
          <div className="pd-price-area">
            {product.discount ? (
              <>
                <div className="pd-price-row">
                  <span className="pd-price pd-price-discounted">
                    {sym} {finalPrice.toFixed(2)}
                  </span>
                  <span className="pd-price-original">
                    {sym} {displayPrice.toFixed(2)}
                  </span>
                  <span className="pd-discount-chip">{discountLabel}</span>
                </div>
                <p className="pd-saving">
                  <Icon name="tag" size={13} color="var(--success)" />
                  You save {sym} {(displayPrice - finalPrice).toFixed(2)}
                </p>
              </>
            ) : (
              <span className="pd-price">{sym} {finalPrice.toFixed(2)}</span>
            )}

            {/* Stock indicator */}
            {allPicked && (
              outOfStock
                ? <span className="pd-oos-tag"><Icon name="alert" size={13} /> Out of stock</span>
                : displayStock <= 5
                  ? <span className="pd-low-tag"><Icon name="alert" size={13} /> Only {displayStock} left</span>
                  : <span className="pd-stock-tag"><Icon name="check-circle" size={13} color="var(--success)" /> In stock</span>
            )}
          </div>

          <div className="pd-divider" />

          {/* Variation picker */}
          {hasVars && (
            <VariationPicker
              variations={product.variations}
              onSelect={sel => setSelected(sel)}
              initialSelected={selected} />
          )}

          {/* Quantity — always shown when product is available */}
          {!outOfStock && allPicked ? (
            <div className="pd-qty-row">
              <span className="pd-qty-label">Quantity:</span>
              <div className="pd-qty-controls">
                <button className="qty-btn" onClick={() => {
                  const newQty = localQty - 1;
                  if (newQty < 1) return;
                  setLocalQty(newQty);
                  if (inCart) decrement(product.id);
                }}>
                  <Icon name="minus" size={16} />
                </button>
                <span className="qty-value">{localQty}</span>
                <button className="qty-btn"
                  onClick={() => {
                    if (localQty >= displayStock) return;
                    setLocalQty(q => q + 1);
                    if (inCart) increment(product.id);
                  }}
                  disabled={localQty >= displayStock}>
                  <Icon name="plus" size={16} />
                </button>
              </div>
              <span className="pd-qty-sub">
                {sym} {(localQty * finalPrice).toFixed(2)}
              </span>
            </div>
          ) : null}

          {/* Actions — Checkout primary, Add to cart secondary */}
          <div className="pd-actions">
            {outOfStock && allPicked && (
              <button className="btn-primary pd-add-btn" disabled>
                Out of stock
              </button>
            )}
            {!outOfStock && !allPicked && hasVars && (
              <button className="btn-primary pd-add-btn pd-add-btn-disabled" disabled>
                <Icon name="shopping-bag" size={18} />
                Select options above
              </button>
            )}
            {!outOfStock && allPicked && (<>
              {/* Primary: Checkout Now */}
              <button
                className="btn-primary pd-add-btn"
                onClick={() => {
                  if (!inCart) {
                    add({ ...product, price: finalPrice, _selectedVariations: selected });
                    for (let i = 1; i < localQty; i++) increment(product.id);
                  }
                  navigate("/checkout");
                }}>
                <Icon name="arrow-right" size={18} />
                Checkout now
              </button>
              {/* Secondary: Add to cart (optional) */}
              <button
                className="btn-outline pd-cart-btn"
                onClick={() => {
                  if (!inCart) {
                    add({ ...product, price: finalPrice, _selectedVariations: selected });
                    for (let i = 1; i < localQty; i++) increment(product.id);
                  } else {
                    // sync qty changes
                    const diff = localQty - (cartItem?.qty ?? 0);
                    if (diff > 0) for (let i = 0; i < diff; i++) increment(product.id);
                    if (diff < 0) for (let i = 0; i < -diff; i++) decrement(product.id);
                  }
                  toast({ message: `${product.name} added to cart`, type: "success" });
                }}>
                <Icon name="shopping-bag" size={16} />
                {inCart ? "Update cart" : "Add to cart"}
              </button>
            </>)}
            <button
              className={`btn-icon-lg${favorited ? " btn-icon-lg-active" : ""}`}
              onClick={handleFav}
              aria-label="Favorite">
              <Icon name={favorited ? "heart-filled" : "heart"} size={20}
                color={favorited ? "var(--accent)" : "currentColor"} />
            </button>
          </div>

          <div className="pd-divider" />

          {/* Description */}
          {product.description && (
            <div className="pd-description">
              <h3 className="pd-desc-title">About this product</h3>
              <p>{product.description}</p>
            </div>
          )}

          {/* Meta */}
          <div className="pd-meta">
            <div className="pd-meta-row">
              <Icon name="tag" size={14} color="var(--muted)" />
              <span>Category: <strong>{product.cat}</strong></span>
            </div>
            <div className="pd-meta-row">
              <Icon name="package" size={14} color="var(--muted)" />
              <span>SKU: <strong>MP-{String(product.id).padStart(5, "0")}</strong></span>
            </div>
          </div>
        </AnimateIn>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <AnimateIn delay={200}>
          <section className="related-section">
            <h2 className="related-title">More from {product.cat}</h2>
            <div className="products-grid">
              {related.map(p => {
                // const rDisc = p.discount
                //   ? (p.discount.type === "percent"
                //     ? p.price * (1 - p.discount.value / 100)
                //     : Math.max(0, p.price - p.discount.value))
                //   : null;

                const rDisc = p.discount
                  ? (p.discountType === "PERCENT"
                    ? p.price * (1 - p.discount / 100)
                    : Math.max(0, p.price - p.discount))
                  : null;
                return (
                  <Link key={p.id} to={`/product/${p.id}`} className="product-card">
                    <div className="pc-img-wrap">
                      {p.imageUrl
                        ? <img className="pc-img" src={getImageUrl(p.imageUrl)} loading="lazy" alt={p.name} />
                        : <div className="pc-img-placeholder"><Icon name="package" size={36} color="var(--muted)" /></div>}
                      {p.discount && <div className="pc-discount-badge">
                        {p.discount.label || `${p.discount.value}${p.discount.type === "percent" ? "%" : ""} OFF`}
                      </div>}
                    </div>
                    <div className="pc-body">
                      <span className="pc-cat">{p.cat}</span>
                      <h3 className="pc-name">{p.name}</h3>
                      <div className="pc-footer">
                        <div className="pc-price-block">
                          <span className="pc-price">{sym} {(rDisc ?? p.price).toFixed(2)}</span>
                          {rDisc && <span className="pc-price-orig">{sym} {p.price.toFixed(2)}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </AnimateIn>
      )}
    </main>
  );
}

