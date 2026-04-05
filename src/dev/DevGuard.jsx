import { useState, useEffect } from "react";
import devAuthService from "./services/devAuthService";

const cardStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "2.5rem 2rem",
  width: "100%",
  maxWidth: 360,
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
};

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "0.6rem 0.75rem",
  borderRadius: 8,
  border: `1.5px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 8,
});

const btnStyle = (disabled) => ({
  width: "100%",
  padding: "0.65rem",
  background: disabled ? "#9ca3af" : "var(--primary, #1e4d2b)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: "0.95rem",
  cursor: disabled ? "not-allowed" : "pointer",
});

export default function DevGuard({ children }) {
  const [step,    setStep]    = useState("email"); // "email" | "otp" | "unlocked"
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [hint,    setHint]    = useState(""); // dev-mode OTP hint

  // Restore existing session on mount
  useEffect(() => {
    if (devAuthService.getSession()) setStep("unlocked");
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await devAuthService.requestToken(email.trim());
      if (res.devModeToken) {
        setHint(res.devModeToken);
      }
      setStep("otp");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setError(typeof msg === "string" ? msg : "Failed to send token. Check the email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await devAuthService.verifyToken(email.trim(), otp.trim());
      devAuthService.storeSession(res.token, { name: res.name, email: res.email });
      setStep("unlocked");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message;
      setError(typeof msg === "string" ? msg : "Invalid or expired token.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  if (step === "unlocked") return children;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--cream, #faf7f2)",
    }}>
      <div style={cardStyle}>
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🛠️</div>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#111" }}>
            Developer Portal
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
            {step === "email"
              ? "Enter your developer email to receive an access token."
              : `Token sent to ${email}. Enter it below.`}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="developer@example.com"
              autoFocus
              required
              style={inputStyle(!!error)}
            />
            {error && (
              <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "#ef4444" }}>{error}</p>
            )}
            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? "Sending…" : "Send Token"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit}>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.toUpperCase())}
              placeholder="Enter 6-character token"
              autoFocus
              maxLength={6}
              style={inputStyle(!!error)}
            />
            {error && (
              <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "#ef4444" }}>{error}</p>
            )}
            {hint && (
              <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "#6b7280", background: "#f9fafb", padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                Dev mode token: <strong style={{ fontFamily: "monospace" }}>{hint}</strong>
              </p>
            )}
            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? "Verifying…" : "Verify Token"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setError(""); setOtp(""); setHint(""); }}
              style={{ width: "100%", marginTop: 8, padding: "0.5rem", background: "none", border: "none", color: "#6b7280", fontSize: "0.85rem", cursor: "pointer" }}
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
