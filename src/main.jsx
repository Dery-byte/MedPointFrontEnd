import React from "react";
import ReactDOM from "react-dom/client";
import Router from "./router";

// ── Styles ────────────────────────────────────────────────────────────────────
// POS variables use --p, --pd, --g* etc. (no clash with store)
// Store variables use --primary, --accent etc.
// Both are imported globally; storefront pages are scoped under .store-shell if needed
import "./styles/pos.css";
import "./styles/store.css";
import "./styles/animations.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
