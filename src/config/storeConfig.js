/**
 * STORE CONFIGURATION
 * ─────────────────────────────────────────────────────────────────
 * This file defines the complete storefront identity.
 * Configuration is persisted to the backend DB via GET/PUT /api/config
 * and served to all clients from there — no localStorage involved.
 *
 * The DEFAULT_CONFIG is used as a fallback when the API is unreachable
 * or returns an empty response.
 */

import { API_BASE } from "../shared/services/apiBase";

export const DEFAULT_CONFIG = {
  // ── Identity ────────────────────────────────────────────────────
  storeName:      "MedPoint Store",
  storeTagline:   "Quality products, delivered to your door.",
  storeLogo:      null,           // URL to logo image, or null to use initials
  storeInitials:  "M",            // shown when no logo
  storeSlogan:    "Your one-stop shop for quality essentials",

  // ── Contact & Location ──────────────────────────────────────────
  contactPhone:   "+233 244 000 000",
  contactEmail:   "store@medpoint.com",
  contactAddress: "Accra, Ghana",
  whatsappNumber: "",             // e.g. "233244000000" — without + sign

  // ── Social Links ────────────────────────────────────────────────
  socialFacebook:  "",
  socialInstagram: "",
  socialTwitter:   "",
  socialTiktok:    "",

  // ── Currency & Region ───────────────────────────────────────────
  currencySymbol:  "GH₵",
  currencyCode:    "GHS",
  currencyLocale:  "en-GH",

  // ── Theme Colors (CSS hex values) ───────────────────────────────
  colorPrimary:       "#1e4d2b",   // main brand color
  colorPrimaryLight:  "#4a9e6a",
  colorPrimaryDark:   "#0f2e18",
  colorAccent:        "#c8972e",   // highlight/gold
  colorAccentLight:   "#e8b84b",
  colorBackground:    "#faf7f2",   // page bg
  colorSurface:       "#ffffff",   // card bg

  // ── Theme Preset (overrides individual colors if set) ───────────
  // Options: "forest" | "ocean" | "sunset" | "midnight" | "rose" | "custom"
  themePreset:    "forest",

  // ── Typography ──────────────────────────────────────────────────
  // Options: "clash" | "cormorant" | "playfair" | "space" | "inter"
  fontDisplay:    "clash",
  fontBody:       "satoshi",

  // ── Storefront Features ─────────────────────────────────────────
  enableWishlist:       true,
  enableGuestCheckout:  true,
  enableReviews:        false,    // future
  enableSearch:         true,
  enableDelivery:       true,
  deliveryFeeThreshold: 100,      // free delivery above this
  deliveryFee:          10,

  // ── Hero Section ────────────────────────────────────────────────
  heroHeadline:   "Your one-stop store for quality products",
  heroSubline:    "Groceries, household essentials, personal care and more — sourced fresh, delivered fast.",
  heroCta:        "Shop now",
  heroImageUrl:   null,

  // ── SEO / Meta ──────────────────────────────────────────────────
  metaTitle:       "MedPoint Store",
  metaDescription: "Quality products, delivered to your door.",
  metaKeywords:    "grocery, household, pharmacy, delivery, Ghana",

  // ── Payment Methods ─────────────────────────────────────────────
  paymentMomo:    true,
  paymentCard:    true,
  paymentCash:    false,          // cash on delivery

  // ── Admin ────────────────────────────────────────────────────────
  apiBaseUrl:     "",             // overrides VITE_API_URL if set

  // ── Enabled POS Modules ──────────────────────────────────────────
  // Controls which modules appear in the POS sidebar.
  // Managed via the Developer Portal at /dev
  enabledModules: ["drugstore", "mart", "hotel", "restaurant", "storefront"],

  // ── Feature Flags ────────────────────────────────────────────────
  // Fine-grained feature toggles within enabled modules.
  // Managed via the Developer Portal → Feature Flags panel.
  featureFlags: {
    // ── Global ──────────────────────────────────────────────────────
    enableCancellation: true,   // allow superadmin/manager to cancel transactions
    enableExcelExport:  true,   // show "Export to Excel" buttons in admin
    showLowStockBanner: true,   // show low-stock alert banner in dashboard & stock
    // ── Drug Store ──────────────────────────────────────────────────
    showExpiryTracking: true,   // show expiry date column in drug stock
    showServicesTab:    true,   // show services tab in drugstore POS
    showNonDrugTab:     true,   // show non-drug items tab in drugstore POS
    // ── Revenue ─────────────────────────────────────────────────────
    showProfitMargin:   true,   // show profit/cost/margin columns in revenue report
  },
};

// ── Theme Presets ────────────────────────────────────────────────────────────
export const THEME_PRESETS = {
  forest: {
    label: "Forest Green",
    colorPrimary:      "#1e4d2b",
    colorPrimaryLight: "#4a9e6a",
    colorPrimaryDark:  "#0f2e18",
    colorAccent:       "#c8972e",
    colorAccentLight:  "#e8b84b",
    colorBackground:   "#faf7f2",
    colorSurface:      "#ffffff",
    preview:           ["#1e4d2b","#c8972e","#faf7f2"],
  },
  ocean: {
    label: "Ocean Blue",
    colorPrimary:      "#0c4a6e",
    colorPrimaryLight: "#0ea5e9",
    colorPrimaryDark:  "#082f49",
    colorAccent:       "#f59e0b",
    colorAccentLight:  "#fbbf24",
    colorBackground:   "#f0f9ff",
    colorSurface:      "#ffffff",
    preview:           ["#0c4a6e","#f59e0b","#f0f9ff"],
  },
  sunset: {
    label: "Sunset Coral",
    colorPrimary:      "#9a1750",
    colorPrimaryLight: "#e9537e",
    colorPrimaryDark:  "#6b0f37",
    colorAccent:       "#f97316",
    colorAccentLight:  "#fb923c",
    colorBackground:   "#fff7f5",
    colorSurface:      "#ffffff",
    preview:           ["#9a1750","#f97316","#fff7f5"],
  },
  midnight: {
    label: "Midnight Indigo",
    colorPrimary:      "#312e81",
    colorPrimaryLight: "#6366f1",
    colorPrimaryDark:  "#1e1b4b",
    colorAccent:       "#f59e0b",
    colorAccentLight:  "#fbbf24",
    colorBackground:   "#f5f5ff",
    colorSurface:      "#ffffff",
    preview:           ["#312e81","#f59e0b","#f5f5ff"],
  },
  rose: {
    label: "Rose Gold",
    colorPrimary:      "#881337",
    colorPrimaryLight: "#f43f5e",
    colorPrimaryDark:  "#4c0519",
    colorAccent:       "#b45309",
    colorAccentLight:  "#d97706",
    colorBackground:   "#fff1f2",
    colorSurface:      "#ffffff",
    preview:           ["#881337","#b45309","#fff1f2"],
  },
  slate: {
    label: "Slate Modern",
    colorPrimary:      "#1e293b",
    colorPrimaryLight: "#475569",
    colorPrimaryDark:  "#0f172a",
    colorAccent:       "#3b82f6",
    colorAccentLight:  "#60a5fa",
    colorBackground:   "#f8fafc",
    colorSurface:      "#ffffff",
    preview:           ["#1e293b","#3b82f6","#f8fafc"],
  },
};

// ── Config storage key (kept for backwards compat; no longer written to) ─────
export const STORAGE_KEY = import.meta.env.VITE_STORE_CONFIG_KEY || "storeConfig_v1";

/**
 * Fetch config from the backend API.
 * Returns DEFAULT_CONFIG merged with the persisted config on success,
 * or DEFAULT_CONFIG alone if the request fails.
 */
export async function fetchConfig() {
  try {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) return { ...DEFAULT_CONFIG };
    const remote = await res.json();
    // Remote may be {} on first boot — merge with defaults
    return { ...DEFAULT_CONFIG, ...remote };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Persist the full config object to the backend.
 * Requires a valid dev JWT.
 */
export async function persistConfig(config, devToken) {
  if (!devToken) return;
  try {
    await fetch(`${API_BASE}/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${devToken}`,
      },
      body: JSON.stringify(config),
    });
  } catch (err) {
    console.warn("[storeConfig] Failed to persist config:", err);
  }
}

/** Reset config to defaults in the backend */
export async function resetConfig(devToken) {
  await persistConfig(DEFAULT_CONFIG, devToken);
  return { ...DEFAULT_CONFIG };
}

// ── Color helpers ─────────────────────────────────────────────────────────────
function darkenHex(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = 1 - factor;
  return `#${[r, g, b].map(v => Math.round(v * f).toString(16).padStart(2, "0")).join("")}`;
}

function lightenHex(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${[r, g, b].map(v => Math.round(v + (255 - v) * factor).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Injects CSS variables into :root based on config colors.
 * Sets both webstore variables (--primary, --accent, etc.) and
 * POS variables (--p, --pd, --pl, etc.) so all shells react to theme changes.
 * Called once on app boot and whenever config changes.
 */
export function applyConfigToDOM(config) {
  const root = document.documentElement;

  // ── Webstore variables ───────────────────────────────────────────────────────
  root.style.setProperty("--primary",       config.colorPrimary);
  root.style.setProperty("--primary-light", config.colorPrimaryLight);
  root.style.setProperty("--primary-dark",  config.colorPrimaryDark);
  root.style.setProperty("--accent",        config.colorAccent);
  root.style.setProperty("--accent-light",  config.colorAccentLight);
  root.style.setProperty("--cream",         config.colorBackground);
  root.style.setProperty("--surface",       config.colorSurface);

  // ── POS variables (mirrors pos.css :root defaults) ──────────────────────────
  const extraDark = darkenHex(config.colorPrimaryDark, 0.35);
  const palLight  = lightenHex(config.colorPrimary, 0.93);
  root.style.setProperty("--p",   config.colorPrimary);
  root.style.setProperty("--pd",  config.colorPrimaryDark);
  root.style.setProperty("--pdd", extraDark);
  root.style.setProperty("--pl",  config.colorPrimaryLight);
  root.style.setProperty("--pal", palLight);
  root.style.setProperty("--acl", config.colorAccentLight);
  root.style.setProperty("--bg",  config.colorBackground);
  root.style.setProperty("--sb",  extraDark);

  // Update document title
  if (config.metaTitle) document.title = config.metaTitle;

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && config.metaDescription) metaDesc.content = config.metaDescription;
}
