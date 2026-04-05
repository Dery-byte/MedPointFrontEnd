import { Link } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import ProductCard from "../components/ProductCard";
import { useFavorites } from "../context/FavoritesContext";

export default function Favorites() {
  const { items, clear } = useFavorites();

  return (
    <main className="container favorites-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Icon name="heart-filled" size={26} color="var(--accent)" /> Favorites
          </h1>
          <p className="page-sub">
            {items.length === 0
              ? "No saved items yet"
              : `${items.length} saved item${items.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {items.length > 0 && (
          <button className="btn-outline btn-sm" onClick={clear}>
            <Icon name="trash" size={14} /> Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state empty-state-page">
          <div className="empty-state-icon">
            <Icon name="heart" size={56} color="var(--muted)" />
          </div>
          <h2>Nothing saved yet</h2>
          <p>Click the heart icon on any product to save it here for later.</p>
          <Link to="/shop" className="btn-primary">
            Browse products <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
