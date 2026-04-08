import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import ProductCard from "../components/ProductCard";
import AnimateIn, { StaggerGrid } from "../components/AnimateIn";
import { useConfig } from "../../config/ConfigContext";
import MartService from "../services/martService";
import { API_BASE } from "../../shared/services/apiBase";

export default function Landing() {
  const { config }     = useConfig();
  const sym            = config.currencySymbol;
  const [featured,  setFeatured]  = useState([]);
  const [newest,    setNewest]    = useState([]);
  const [onSale,    setOnSale]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [searchQuery, setSearch]  = useState("");
  const navigate                  = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [products, cats] = await Promise.all([
          MartService.getAll(),
          MartService.getCategories(),
        ]);
        setFeatured(products.filter(p => p.featured).slice(0, 8));
        setOnSale(products.filter(p => !!p.discount || p.onSale?.active).slice(0, 4));
        setNewest(products.slice(0, 8));
        setCategories(cats.slice(0, 8));
      } catch { /* show empty states */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim())
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const showFeatured = featured.length > 0;
  const showSale     = onSale.length > 0;
  

  return (
    <main className="landing">

      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob hero-blob-1 blob-morph" />
          <div className="hero-blob hero-blob-2 blob-morph" />
          <div className="hero-grid-lines" />
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            {config.storeSlogan || "Free delivery on orders above " + sym + " " + config.deliveryFeeThreshold}
          </div>

          <h1 className="hero-title">
            {config.heroHeadline
              ? config.heroHeadline.split(" ").slice(0, -2).join(" ") + " "
              : "Your one-stop store for "}
            <span className="hero-title-accent gradient-text">
              {config.heroHeadline
                ? config.heroHeadline.split(" ").slice(-2).join(" ")
                : "quality products"}
            </span>
          </h1>

          <p className="hero-sub">{config.heroSubline}</p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-inner">
              <Icon name="search" size={20} color="var(--muted)" />
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="hero-search-btn">
                {config.heroCta || "Search"}
              </button>
            </div>
          </form>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>500+</strong><span>Products</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>Fast</strong><span>Delivery</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>Momo</strong><span>Payments</span>
            </div>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <Icon name="chevron-down" size={20} color="var(--muted)" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="section categories-section">
          <div className="container">
            <AnimateIn>
              <div className="section-header">
                <h2 className="section-title">Browse categories</h2>
                <Link to="/shop" className="section-link">
                  View all <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </AnimateIn>
            <AnimateIn delay={80}>
              <div className="categories-grid">
                {categories.map((cat, i) => (
                  <Link
                    key={cat.id}
                    to={`/shop?cat=${encodeURIComponent(cat.name)}`}
                    className="category-pill"
                    style={{ animationDelay: `${i * 40}ms` }}>
                    <span className="category-pill-icon">
                      <Icon name="tag" size={16} />
                    </span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
                <Link to="/shop" className="category-pill category-pill-all">
                  <span className="category-pill-icon"><Icon name="grid" size={16} /></span>
                  <span>All products</span>
                </Link>
              </div>
            </AnimateIn>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════════════ */}
      {(showFeatured || loading) && (
        <section className="section featured-section">
          <div className="container">
            <AnimateIn>
              <div className="section-header">
                <div className="section-title-group">
                  <span className="section-eyebrow">
                    <Icon name="star" size={14} color="#fbbf24" /> Handpicked
                  </span>
                  <h2 className="section-title">Featured products</h2>
                </div>
                <Link to="/shop?flag=featured" className="section-link">
                  See all <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </AnimateIn>
            {loading ? (
              <div className="products-skeleton-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="product-skeleton shimmer" />
                ))}
              </div>
            ) : (
              <div className="products-grid">
                {featured.map((p, i) => (
                  <AnimateIn key={p.id} delay={i * 60}>
                    <ProductCard product={p} />
                  </AnimateIn>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          ON SALE BANNER STRIP
      ═══════════════════════════════════════════════ */}
      {showSale && (
        <section className="sale-strip-section">
          <div className="container">
            <AnimateIn>
              <div className="sale-strip-inner">
                <div className="sale-strip-left">
                  <span className="sale-strip-eyebrow">Limited time</span>
                  <h2 className="sale-strip-title">On sale now</h2>
                  <p className="sale-strip-sub">
                    Great deals on selected products. While stocks last.
                  </p>
                  <Link to="/shop?flag=sale" className="btn-primary sale-strip-btn">
                    Shop sale <Icon name="arrow-right" size={15} />
                  </Link>
                </div>
                <div className="sale-strip-cards">
                  {onSale.map((p, i) => {
                    const disc = p.discount.type === "percent"
                      ? p.price * (1 - p.discount.value / 100)
                      : Math.max(0, p.price - p.discount.value);
                    return (
                      <AnimateIn key={p.id} delay={i * 80}>
                        <Link to={`/product/${p.id}`} className="sale-mini-card">
                          <div className="smc-img">
                            {p.imageUrl
                              ? <img src= {`${API_BASE}${p.imageUrl}`} alt={p.imageUrl} />
                              : <div className="smc-img-ph"><Icon name="package" size={24} color="var(--muted)" /></div>}
                            <span className="smc-badge">

<p>{JSON.stringify(p)}</p> 
                              {p.discount.label || (p.discount.type === "percent" ? `${p.discount.value}% OFF` : "Sale")}
                            </span>
                          </div>
                          <div className="smc-info">
                            <p className="smc-name">{p.name}</p>
                            <div className="smc-prices">
                              <span className="smc-price">{sym} {disc.toFixed(2)}</span>
                              <span className="smc-orig">{sym} {p.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </Link>
                      </AnimateIn>
                    );
                  })}
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          ALL / LATEST PRODUCTS
      ═══════════════════════════════════════════════ */}
      <section className="section latest-section">
        <div className="container">
          <AnimateIn>
            <div className="section-header">
              <h2 className="section-title">Browse our store</h2>
              <Link to="/shop" className="section-link">
                All products <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </AnimateIn>
          {loading ? (
            <div className="products-skeleton-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-skeleton shimmer" />
              ))}
            </div>
          ) : newest.length > 0 ? (
            <div className="products-grid">
              {newest.map((p, i) => (
                <AnimateIn key={p.id} delay={i * 50}>
                  <ProductCard product={p} />
                </AnimateIn>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="package" size={48} color="var(--muted)" />
              <p>Products coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TRUST STRIP
      ═══════════════════════════════════════════════ */}
      <AnimateIn>
        <section className="trust-strip">
          <div className="container">
            <div className="trust-grid">
              {[
                { icon: "package",    title: "Quality Guaranteed",  sub: "Every product verified" },
                { icon: "map-pin",    title: "Local Delivery",      sub: "Fast delivery across the area" },
                { icon: "momo",       title: "Easy Payments",       sub: "Momo, Visa, Mastercard" },
                { icon: "refresh-cw", title: "Easy Returns",        sub: "Hassle-free process" },
              ].map(item => (
                <div key={item.title} className="trust-item">
                  <div className="trust-icon">
                    <Icon name={item.icon} size={24} />
                  </div>
                  <div>
                    <h4 className="trust-title">{item.title}</h4>
                    <p className="trust-sub">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* ═══════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════ */}
      <AnimateIn>
        <section className="cta-banner">
          <div className="container">
            <div className="cta-inner">
              <div className="cta-text">
                <h2>Ready to start shopping?</h2>
                <p>Browse our full catalog — fresh stock updated regularly.</p>
              </div>
              <Link to="/shop" className="btn-primary cta-btn">
                {config.heroCta || "Shop now"} <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </div>
        </section>
      </AnimateIn>
    </main>
  );
}
