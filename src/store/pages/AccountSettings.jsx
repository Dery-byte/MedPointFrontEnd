import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Icon from "../../shared/components/Icon";
import AnimateIn from "../components/AnimateIn";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import api from "../services/storeApi";

function fmt(n) { return `GH₵ ${Number(n).toFixed(2)}`; }

/* ── Password strength helper ─────────────────────────────────── */
function pwStrength(pw) {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  if (pw.length < 10) return 2;
  return /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 4 : 3;
}
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "#e74c3c", "#e67e22", "#3498db", "#27ae60"];

/* ── Tab ──────────────────────────────────────────────────────── */
function Tab({ label, icon, active, onClick }) {
  return (
    <button className={`account-tab${active ? " account-tab-active" : ""}`} onClick={onClick}>
      <Icon name={icon} size={17} />
      {label}
    </button>
  );
}

export default function AccountSettings() {
  const { state: authState } = useAuth();
  const { customer } = authState;
  const { toast } = useToast();
  const [tab, setTab] = useState("profile");

  if (!customer) return <Navigate to="/login" state={{ from: "/account" }} replace />;

  return (
    <main className="container account-page">
      <AnimateIn>
        <div className="account-header">
          <div className="account-avatar-large">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="account-name">{customer.name}</h1>
            <p className="account-email">{customer.email}</p>
          </div>
        </div>
      </AnimateIn>

      <AnimateIn delay={100}>
        <div className="account-tabs">
          <Tab label="Profile" icon="user"          active={tab === "profile"}  onClick={() => setTab("profile")}  />
          <Tab label="Password" icon="lock"          active={tab === "password"} onClick={() => setTab("password")} />
          <Tab label="Orders" icon="clipboard-list"  active={tab === "orders"}   onClick={() => setTab("orders")}   />
        </div>
      </AnimateIn>

      <AnimateIn delay={180} key={tab}>
        <div className="account-panel">
          {tab === "profile"  && <ProfileTab customer={customer} toast={toast} />}
          {tab === "password" && <PasswordTab toast={toast} />}
          {tab === "orders"   && <OrdersTab />}
        </div>
      </AnimateIn>
    </main>
  );
}

/* ── Profile Tab ──────────────────────────────────────────────── */
function ProfileTab({ customer, toast }) {
  const [name,  setName]  = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/customers/me", { name, phone });
      toast({ message: "Profile updated", type: "success" });
    } catch (err) {
      toast({ message: err.response?.data?.message || "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-form">
      <h2 className="account-form-title">Profile information</h2>
      <div className="form-grid-2">
        <div className="form-field form-field-span2">
          <label>Full name</label>
          <div className="input-icon-wrap">
            <Icon name="user" size={16} color="var(--muted)" className="input-icon" />
            <input className="form-input input-with-icon" value={name} onChange={e => setName(e.target.value)} />
          </div>
        </div>
        <div className="form-field form-field-span2">
          <label>Email address <span className="optional">(cannot be changed)</span></label>
          <div className="input-icon-wrap">
            <Icon name="mail" size={16} color="var(--muted)" className="input-icon" />
            <input className="form-input input-with-icon" value={customer.email} disabled style={{ opacity: 0.6 }} />
          </div>
        </div>
        <div className="form-field form-field-span2">
          <label>Phone number</label>
          <div className="input-icon-wrap">
            <Icon name="phone" size={16} color="var(--muted)" className="input-icon" />
            <input className="form-input input-with-icon" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
          </div>
        </div>
      </div>
      <button className="btn-primary account-save-btn" onClick={save} disabled={saving}>
        {saving ? <><Icon name="loader" size={16} className="spin" /> Saving...</> : <><Icon name="check" size={16} /> Save changes</>}
      </button>
    </div>
  );
}

/* ── Password Tab ─────────────────────────────────────────────── */
function PasswordTab({ toast }) {
  const [current,    setCurrent]    = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [errors,     setErrors]     = useState({});

  const strength = pwStrength(newPw);

  const validate = () => {
    const e = {};
    if (!current)            e.current = "Current password required";
    if (!newPw)              e.newPw   = "New password required";
    else if (newPw.length < 8) e.newPw = "Must be at least 8 characters";
    if (newPw !== confirm)   e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put("/customers/me/password", { currentPassword: current, newPassword: newPw });
      toast({ message: "Password changed successfully", type: "success" });
      setCurrent(""); setNewPw(""); setConfirm("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password";
      if (msg.toLowerCase().includes("current") || err.response?.status === 400) {
        setErrors(e => ({ ...e, current: "Incorrect current password" }));
      } else {
        toast({ message: msg, type: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-form">
      <h2 className="account-form-title">Change password</h2>
      <div className="form-field">
        <label>Current password</label>
        <div className="input-icon-wrap">
          <Icon name="lock" size={16} color="var(--muted)" className="input-icon" />
          <input
            className={`form-input input-with-icon input-with-icon-right${errors.current ? " input-error" : ""}`}
            type={showCur ? "text" : "password"}
            value={current}
            onChange={e => setCurrent(e.target.value)}
            placeholder="••••••••"
          />
          <button type="button" className="input-pw-toggle" onClick={() => setShowCur(v => !v)}>
            <Icon name={showCur ? "eye-off" : "eye"} size={16} color="var(--muted)" />
          </button>
        </div>
        {errors.current && <span className="field-error">{errors.current}</span>}
      </div>

      <div className="form-field">
        <label>New password</label>
        <div className="input-icon-wrap">
          <Icon name="lock" size={16} color="var(--muted)" className="input-icon" />
          <input
            className={`form-input input-with-icon input-with-icon-right${errors.newPw ? " input-error" : ""}`}
            type={showNew ? "text" : "password"}
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="Min. 8 characters"
          />
          <button type="button" className="input-pw-toggle" onClick={() => setShowNew(v => !v)}>
            <Icon name={showNew ? "eye-off" : "eye"} size={16} color="var(--muted)" />
          </button>
        </div>
        {newPw && (
          <div className="pw-strength">
            <div className="pw-strength-bars">
              {[1,2,3,4].map(i => (
                <div key={i} className="pw-strength-bar" style={{ background: i <= strength ? STRENGTH_COLORS[strength] : "var(--border)" }} />
              ))}
            </div>
            <span style={{ color: STRENGTH_COLORS[strength], fontSize: "12px", fontWeight: 600 }}>
              {STRENGTH_LABELS[strength]}
            </span>
          </div>
        )}
        {errors.newPw && <span className="field-error">{errors.newPw}</span>}
      </div>

      <div className="form-field">
        <label>Confirm new password</label>
        <div className="input-icon-wrap">
          <Icon name="lock" size={16} color="var(--muted)" className="input-icon" />
          <input
            className={`form-input input-with-icon${errors.confirm ? " input-error" : ""}`}
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat new password"
          />
        </div>
        {errors.confirm && <span className="field-error">{errors.confirm}</span>}
      </div>

      <button className="btn-primary account-save-btn" onClick={save} disabled={saving}>
        {saving ? <><Icon name="loader" size={16} className="spin" /> Updating...</> : <><Icon name="lock" size={16} /> Update password</>}
      </button>
    </div>
  );
}

/* ── Orders Tab ───────────────────────────────────────────────── */
function OrdersTab() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded]   = useState(false);

  // Lazy load on first render of this tab
  if (!loaded) {
    setLoaded(true);
    api.get("/customers/me/orders")
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }

  const STATUS_COLORS = {
    pending:    { bg: "#fef3c7", text: "#d97706" },
    processing: { bg: "#dbeafe", text: "#2563eb" },
    delivered:  { bg: "#d1fae5", text: "#059669" },
    cancelled:  { bg: "#fee2e2", text: "#dc2626" },
  };

  return (
    <div className="account-orders">
      <h2 className="account-form-title">Order history</h2>
      {loading ? (
        <div className="account-orders-loading">
          {[1,2,3].map(i => <div key={i} className="skel skel-row shimmer" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: "32px" }}>
          <Icon name="clipboard-list" size={44} color="var(--muted)" />
          <h3>No orders yet</h3>
          <p>Your order history will appear here.</p>
          <Link to="/shop" className="btn-primary">
            Start shopping <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      ) : (
        <div className="account-orders-list">
          {orders.map(order => {
            const status = (order.status ?? "pending").toLowerCase();
            const sc = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
            return (
              <div key={order.id ?? order.reference} className="account-order-card">
                <div className="aoc-top">
                  <div>
                    <code className="ref-code aoc-ref">{order.reference ?? order.id}</code>
                    <p className="aoc-date">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                  <span className="order-status-badge" style={{ background: sc.bg, color: sc.text }}>
                    {order.status ?? "Pending"}
                  </span>
                </div>
                <div className="aoc-items">
                  {(order.items ?? []).map((item, i) => (
                    <div key={i} className="aoc-item">
                      <span>{item.name}</span>
                      <span>× {item.quantity ?? item.qty}</span>
                      <span>{fmt((item.unitPrice ?? item.price) * (item.quantity ?? item.qty))}</span>
                    </div>
                  ))}
                </div>
                <div className="aoc-total">
                  Total: <strong>{fmt(order.total ?? 0)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
