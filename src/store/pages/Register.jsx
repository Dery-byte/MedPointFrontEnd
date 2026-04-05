import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const { state, register, clearError } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
    if (!phone.trim()) e.phone = "Phone number is required";
    else if (phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (password !== confirmPw) e.confirmPw = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await register({ name, email, phone, password });
      navigate("/", { replace: true });
    } catch {
      // error shown via state.error
    }
  };

  const strength = !password ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#e74c3c", "#e67e22", "#3498db", "#27ae60"][strength];

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
            <h2 className="auth-panel-title">Join the<br />MedPoint family.</h2>
            <p className="auth-panel-sub">
              Create a free account and start shopping today.
              Thousands of products at your fingertips.
            </p>
            <div className="auth-panel-features">
              {[
                "Exclusive deals for members",
                "Track your orders",
                "Save favorites across devices",
              ].map((f) => (
                <div key={f} className="auth-panel-feat">
                  <Icon name="check-circle" size={16} color="var(--primary-light)" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="auth-panel-right">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <h1 className="auth-form-title">Create an account</h1>
              <p className="auth-form-sub">Free — takes less than a minute</p>
            </div>

            {state.error && (
              <div className="auth-error">
                <Icon name="alert" size={16} />
                {state.error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="fullname">Full name</label>
                <div className="input-icon-wrap">
                  <Icon name="user" size={16} color="var(--muted)" className="input-icon" />
                  <input
                    id="fullname"
                    className={`form-input input-with-icon${errors.name ? " input-error" : ""}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Mensah"
                    autoComplete="name"
                  />
                </div>
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label htmlFor="reg-email">Email address</label>
                  <div className="input-icon-wrap">
                    <Icon name="mail" size={16} color="var(--muted)" className="input-icon" />
                    <input
                      id="reg-email"
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
                  <label htmlFor="reg-phone">Phone number</label>
                  <div className="input-icon-wrap">
                    <Icon name="phone" size={16} color="var(--muted)" className="input-icon" />
                    <input
                      id="reg-phone"
                      className={`form-input input-with-icon${errors.phone ? " input-error" : ""}`}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0244 000 000"
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="reg-pw">Password</label>
                <div className="input-icon-wrap">
                  <Icon name="lock" size={16} color="var(--muted)" className="input-icon" />
                  <input
                    id="reg-pw"
                    className={`form-input input-with-icon input-with-icon-right${errors.password ? " input-error" : ""}`}
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="input-pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    <Icon name={showPw ? "eye-off" : "eye"} size={16} color="var(--muted)" />
                  </button>
                </div>
                {password && (
                  <div className="pw-strength">
                    <div className="pw-strength-bars">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="pw-strength-bar"
                          style={{ background: i <= strength ? strengthColor : "var(--border)" }}
                        />
                      ))}
                    </div>
                    <span style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="confirm-pw">Confirm password</label>
                <div className="input-icon-wrap">
                  <Icon name="lock" size={16} color="var(--muted)" className="input-icon" />
                  <input
                    id="confirm-pw"
                    className={`form-input input-with-icon${errors.confirmPw ? " input-error" : ""}`}
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPw && <span className="field-error">{errors.confirmPw}</span>}
              </div>

              <button
                type="submit"
                className="btn-primary auth-submit-btn"
                disabled={state.loading}
              >
                {state.loading ? (
                  <><Icon name="loader" size={16} className="spin" /> Creating account...</>
                ) : (
                  <>Create account <Icon name="arrow-right" size={16} /></>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
