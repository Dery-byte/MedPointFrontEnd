import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import ProductCard from "../components/ProductCard";
import MartService from "../services/martService";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [cardSize, setCardSize] = useState(220);

  const q = searchParams.get("q") || "";
  const activeCat = searchParams.get("cat") || "All";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          MartService.getAll(),
          MartService.getCategories(),
        ]);
        // Only show products marked for the webstore (default true for legacy products)
        setProducts(prods.filter(p => p.showOnStore !== false));
        setCategories([{ id: "all", name: "All" }, ...cats]);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const setCategory = (cat) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "All") next.delete("cat");
    else next.set("cat", cat);
    setSearchParams(next);
  };

  const setSearch = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set("q", val);
    else next.delete("q");
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    console.log(products);
    if (activeCat && activeCat !== "All") {
      list = list.filter((p) => p.cat === activeCat);
    }
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(lq) ||
          p.cat.toLowerCase().includes(lq)
      );
    }
    switch (sortBy) {
      case "price-asc":  list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "name-asc":   list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc":  list.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: break;
    }
    return list;
  }, [products, activeCat, q, sortBy]);

  return (
    <main className="shop-page">
      <div className="container">
        {/* Page header */}
        <div className="shop-header">
          <div>
            <h1 className="shop-title">
              {q ? `Results for "${q}"` : activeCat !== "All" ? activeCat : "All Products"}
            </h1>
            <p className="shop-count">
              {loading ? "Loading..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {/* Toolbar */}
          <div className="shop-toolbar">
            {/* Mobile filter toggle */}
            <button
              className="shop-filter-toggle"
              onClick={() => setFilterOpen((v) => !v)}
            >
              <Icon name="filter" size={16} />
              Filters
            </button>

            {/* Sort */}
            <div className="shop-sort">
              <Icon name="chevron-down" size={14} color="var(--muted)" />
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A–Z</option>
                <option value="name-desc">Name: Z–A</option>
              </select>
            </div>

            {/* Layout toggle */}
            <div className="layout-toggle">
              <button
                className={`layout-btn${layout === "grid" ? " layout-btn-active" : ""}`}
                onClick={() => setLayout("grid")}
                aria-label="Grid view"
              >
                <Icon name="grid" size={16} />
              </button>
              <button
                className={`layout-btn${layout === "list" ? " layout-btn-active" : ""}`}
                onClick={() => setLayout("list")}
                aria-label="List view"
              >
                <Icon name="list" size={16} />
              </button>
            </div>

            {/* Card size slider — grid layout only */}
            {layout === "grid" && (
              <div className="shop-size-control" title={`Card size: ${cardSize}px`}>
                <Icon name="grid" size={12} color="var(--muted)" />
                <input
                  type="range"
                  className="card-size-range"
                  min={140}
                  max={320}
                  step={20}
                  value={cardSize}
                  onChange={e => setCardSize(Number(e.target.value))}
                  aria-label="Card size"
                />
                <Icon name="grid" size={18} color="var(--muted)" />
              </div>
            )}
          </div>
        </div>

        <div className="shop-body">
          {/* Sidebar / Filter Panel */}
          <aside className={`shop-sidebar${filterOpen ? " shop-sidebar-open" : ""}`}>
            <div className="sidebar-section">
              <h3 className="sidebar-label">Searchaaaaa</h3>
              <div className="sidebar-search">
                <Icon name="search" size={16} color="var(--muted)" />
                <input
                  className="sidebar-search-input"
                  type="text"
                  placeholder="Search products..."
                  value={q}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {q && (
                  <button onClick={() => setSearch("")}>
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-label">Category</h3>
              <ul className="sidebar-cats">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      className={`sidebar-cat-btn${activeCat === cat.name || (cat.name === "All" && !activeCat) ? " sidebar-cat-active" : ""}`}
                      onClick={() => setCategory(cat.name)}
                    >
                      <Icon name="tag" size={13} />
                      {cat.name}
                      {cat.name !== "All" && (
                        <span className="sidebar-cat-count">
                          {products.filter((p) => p.cat === cat.name && p.showOnStore !== false).length}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Close button for mobile */}
            <button
              className="sidebar-close-btn"
              onClick={() => setFilterOpen(false)}
            >
              <Icon name="close" size={16} /> Close filters
            </button>
          </aside>

          {/* Product area */}
          <div className="shop-products">
            {loading ? (
              <div className={layout === "grid" ? "products-skeleton-grid" : "products-skeleton-list"}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="product-skeleton" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <Icon name="package" size={52} color="var(--muted)" />
                <h3>No products found</h3>
                <p>
                  {q
                    ? `No results for "${q}". Try a different search.`
                    : "No products in this category yet."}
                </p>
                <button
                  className="btn-outline"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div
                className={layout === "grid" ? "products-grid" : "products-list"}
                style={layout === "grid" ? { gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize}px, 1fr))` } : undefined}
              >
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} layout={layout} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
