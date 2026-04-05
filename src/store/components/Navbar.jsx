import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import { useConfig } from "../../config/ConfigContext";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const { count } = useCart();
  const { items: favs } = useFavorites();
  const { state: authState, logout } = useAuth();
  const { customer } = authState;
  const { config } = useConfig();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            {config.storeLogo
              ? <img src={config.storeLogo} alt={config.storeName} className="navbar-logo-img" />
              : <span className="navbar-logo-mark">{config.storeInitials || "M"}</span>}
            <span className="navbar-logo-text">
              {config.storeName || "MedPoint Store"}
              <small>Shop</small>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="navbar-links">
            <Link to="/" className={`nav-link${isActive("/") ? " nav-link-active" : ""}`}>
              Home
            </Link>
            <Link to="/shop" className={`nav-link${isActive("/shop") ? " nav-link-active" : ""}`}>
              Shop
            </Link>
            <Link
              to="/favorites"
              className={`nav-link${isActive("/favorites") ? " nav-link-active" : ""}`}
            >
              Favorites
            </Link>
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Search toggle */}
            <button
              className="nav-icon-btn"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
            >
              <Icon name="search" size={20} />
            </button>

            {/* Favorites */}
            <Link to="/favorites" className="nav-icon-btn" aria-label="Favorites">
              <Icon name={favs.length > 0 ? "heart-filled" : "heart"} size={20} color={favs.length > 0 ? "var(--accent)" : "currentColor"} />
              {favs.length > 0 && (
                <span className="nav-badge">{favs.length}</span>
              )}
            </Link>

            {/* Cart */}
            <button
              className="nav-icon-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Cart"
            >
              <Icon name="cart" size={20} />
              {count > 0 && <span className="nav-badge">{count}</span>}
            </button>

            {/* Auth */}
            {customer ? (
              <div className="nav-user-menu">
                <button className="nav-user-btn">
                  <span className="nav-user-avatar">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="nav-user-name">{customer.name.split(" ")[0]}</span>
                  <Icon name="chevron-down" size={14} />
                </button>
                <div className="nav-dropdown">
                  <div className="nav-dropdown-header">
                    <p className="nav-dropdown-name">{customer.name}</p>
                    <p className="nav-dropdown-email">{customer.email}</p>
                  </div>
                  <Link to="/orders" className="nav-dropdown-item">
                    <Icon name="clipboard-list" size={15} />
                    My Orders
                  </Link>
                  <a className="nav-dropdown-item" href="/account">
                    <Icon name="user" size={15} />
                    Account settings
                  </a>
                  <button
                    className="nav-dropdown-item"
                    onClick={() => { logout(); navigate("/"); }}
                  >
                    <Icon name="log-out" size={15} />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="nav-auth-btns">
                <Link to="/login" className="btn-nav-ghost">Sign in</Link>
                <Link to="/register" className="btn-nav-solid">Register</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="nav-icon-btn nav-mobile-toggle"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="navbar-search-bar">
            <form onSubmit={handleSearch} className="navbar-search-form">
              <Icon name="search" size={18} color="var(--muted)" />
              <input
                className="navbar-search-input"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" className="navbar-search-btn">
                Search
              </button>
              <button
                type="button"
                className="nav-icon-btn"
                onClick={() => setSearchOpen(false)}
              >
                <Icon name="close" size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link">
              <Icon name="home" size={18} /> Home
            </Link>
            <Link to="/shop" className="mobile-nav-link">
              <Icon name="shopping-bag" size={18} /> Shop
            </Link>
            <Link to="/favorites" className="mobile-nav-link">
              <Icon name="heart" size={18} /> Favorites{" "}
              {favs.length > 0 && <span className="nav-badge nav-badge-inline">{favs.length}</span>}
            </Link>
            <div className="mobile-nav-divider" />
            {customer ? (
              <>
                <Link to="/orders" className="mobile-nav-link">
                  <Icon name="clipboard-list" size={18} /> My Orders
                </Link>
                <Link to="/account" className="mobile-nav-link">
                  <Icon name="user" size={18} /> Account settings
                </Link>
                <button
                  className="mobile-nav-link mobile-nav-link-danger"
                  onClick={() => { logout(); navigate("/"); }}
                >
                  <Icon name="log-out" size={18} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-nav-link">
                  <Icon name="user" size={18} /> Sign in
                </Link>
                <Link to="/register" className="mobile-nav-link mobile-nav-link-primary">
                  <Icon name="user" size={18} /> Create account
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      {/* Spacer so content doesn't hide behind fixed navbar */}
      <div className="navbar-spacer" />

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
