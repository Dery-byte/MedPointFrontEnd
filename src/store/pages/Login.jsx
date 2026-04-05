import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login: customerLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setGlobalError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await customerLogin({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setGlobalError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-split">
        {/* Left panel */}
        <div className="auth-panel-left">
          <div className="auth-panel-content">
            <Link to="/" className="auth-logo">
              <span className="navbar-logo-mark">M</span>
              <span className="navbar-logo-text">
                Med<strong>Point</strong><small>Store</small>
              </span>
            </Link>
            <h2 className="auth-panel-title">Shop smarter,<br />live better.</h2>
            <p className="auth-panel-sub">
              Quality groceries, household essentials, and personal care products
              — with fast delivery right to your door.
            </p>
            <div className="auth-panel-features">
              {["Momo &amp; Card payments", "Fast local delivery", "Easy returns"].map((f) => (
                <div key={f} className="auth-panel-feat">
                  <Icon name="check-circle" size={16} color="var(--primary-light)" />
                  <span dangerouslySetInnerHTML={{ __html: f }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="auth-panel-right">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <h1 className="auth-form-title">Welcome back</h1>
              <p className="auth-form-sub">
                Sign in to your account to continue
              </p>
            </div>

            {globalError && (
              <div className="auth-error">
                <Icon name="alert" size={16} />
                {globalError}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="email">Email address</label>
                <div className="input-icon-wrap">
                  <Icon name="mail" size={16} color="var(--muted)" className="input-icon" />
                  <input
                    id="email"
                    className={`form-input input-with-icon${errors.email ? " input-error" : ""}`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="password">Password</label>
                <div className="input-icon-wrap">
                  <Icon name="lock" size={16} color="var(--muted)" className="input-icon" />
                  <input
                    id="password"
                    className={`form-input input-with-icon input-with-icon-right${errors.password ? " input-error" : ""}`}
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    <Icon name={showPw ? "eye-off" : "eye"} size={16} color="var(--muted)" />
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <button
                type="submit"
                className="btn-primary auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <><Icon name="loader" size={16} className="spin" /> Signing in...</>
                ) : (
                  <>Sign in <Icon name="arrow-right" size={16} /></>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
