// import { useState } from "react";
// import { useApp } from "../AppContext";

// export default function AuthScreen() {
//   const { state, dispatch } = useApp();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const doLogin = () => {
//     const user = state.users.find(u => u.email === email && u.password === password && u.active);
//     if (!user) { setError("⚠️ Invalid email or password."); return; }
//     setError("");
//     dispatch({ type: "LOGIN", user });
//     if (user.role === "superadmin") dispatch({ type: "NAV", mod: "admin", page: "dashboard" });
//     else dispatch({ type: "NAV", mod: user.modules[0], page: "home" });
//   };

//   return (
//     <div className="auth-scr">
//       <div className="auth-card">
//         <div className="auth-logo">
//           <div className="auth-logo-ico"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
//           <div><h1>MedPoint</h1><span>Business Suite</span></div>
//         </div>
//         <div className="auth-title">Welcome back</div>
//         <div className="auth-sub">Sign in to access your modules</div>
//         {error && <div className="alert alert-err">{error}</div>}
//         <div className="form-group">
//           <label className="form-label">Email Address</label>
//           <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@medpoint.com" />
//         </div>
//         <div className="form-group">
//           <label className="form-label">Password</label>
//           <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && doLogin()} />
//         </div>
//         <button className="btn btn-p btn-lg btn-full" onClick={doLogin}>Sign In →</button>
//         <p style={{ fontSize: 12, color: "var(--g400)", textAlign: "center", marginTop: 16, lineHeight: 1.7 }}>
//           <strong>Admin:</strong> admin@medpoint.com / admin123<br />
//           <strong>Drug Store:</strong> pharma@medpoint.com / pass123<br />
//           <strong>Mart:</strong> mart@medpoint.com / pass123 &nbsp;|&nbsp; <strong>Hotel:</strong> hotel@medpoint.com / pass123<br />
//           <strong>Restaurant:</strong> resto@medpoint.com / pass123
//         </p>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { useApp } from "../AppContext";
import AuthService from "../../shared/services/AuthService";

export default function AuthScreen() {
  const { dispatch } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await AuthService.login(email, password);
      dispatch({ type: "LOGIN", user });
      if (user.role === "superadmin") dispatch({ type: "NAV", mod: "admin", page: "dashboard" });
      else dispatch({ type: "NAV", mod: user.modules[0], page: "home" });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-scr">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-ico"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <div><h1>MedPoint</h1><span>Business Suite</span></div>
        </div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to access your modules</div>
        {error && <div className="alert alert-err">{error}</div>}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@medpoint.com"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && doLogin()}
            disabled={loading}
          />
        </div>
        <button className="btn btn-p btn-lg btn-full" onClick={doLogin} disabled={loading}>
          {loading ? "Signing in…" : "Sign In →"}
        </button>
        <p style={{ fontSize: 12, color: "var(--g400)", textAlign: "center", marginTop: 16, lineHeight: 1.7 }}>
          <strong>Admin:</strong> admin@medpoint.com / admin123<br />
          <strong>Drug Store:</strong> pharma@medpoint.com / pass123<br />
          <strong>Mart:</strong> mart@medpoint.com / pass123 &nbsp;|&nbsp; <strong>Hotel:</strong> hotel@medpoint.com / pass123<br />
          <strong>Restaurant:</strong> resto@medpoint.com / pass123
        </p>
      </div>
    </div>
  );
}