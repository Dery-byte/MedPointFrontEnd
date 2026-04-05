import { Link } from "react-router-dom";
import Icon from "../../shared/components/Icon";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="navbar-logo-mark">M</span>
            <span className="navbar-logo-text">
              Med<strong>Point</strong>
              <small>Store</small>
            </span>
          </Link>
          <p className="footer-tagline">
            Quality products, delivered to your door.
          </p>
          <div className="footer-socials">
            <a href="#" className="footer-social-btn" aria-label="Phone">
              <Icon name="phone" size={16} />
            </a>
            <a href="#" className="footer-social-btn" aria-label="Email">
              <Icon name="mail" size={16} />
            </a>
            <a href="#" className="footer-social-btn" aria-label="Location">
              <Icon name="map-pin" size={16} />
            </a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-group-title">Shop</h4>
          <ul className="footer-links">
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/favorites">Favorites</Link></li>
            <li><Link to="/checkout">Checkout</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-group-title">Account</h4>
          <ul className="footer-links">
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-group-title">Payment Methods</h4>
          <div className="footer-payments">
            <span className="footer-pay-badge">MTN Momo</span>
            <span className="footer-pay-badge">Vodafone Cash</span>
            <span className="footer-pay-badge">AirtelTigo</span>
            <span className="footer-pay-badge">Visa / Mastercard</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} MedPoint Store. All rights reserved.</p>
        <p>Powered by MedPoint Suite</p>
      </div>
    </footer>
  );
}
