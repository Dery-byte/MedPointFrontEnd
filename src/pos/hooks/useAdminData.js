import { useApp } from "../AppContext";
import { useConfig } from "../../config/ConfigContext";

const ALL_MODULES = ["drugstore", "mart", "hotel", "restaurant", "storefront"];

/**
 * Returns all POS state with data pre-filtered by the currently enabled modules.
 * When a module is disabled in the dev portal, zero traces of it appear in any
 * admin view — transactions, staff, stock, revenue — as if it never existed.
 *
 * Reactivity: ConfigContext listens for the localStorage `storage` event, so when
 * the dev portal saves a new enabledModules config, every component using this hook
 * automatically recomputes on the next render — no page refresh required.
 */
export function useAdminData() {
  const { state, dispatch } = useApp();
  const { config } = useConfig();
  const em = config.enabledModules ?? ALL_MODULES;

  return {
    // Spread all raw state so callers get booting, me, mod, page, etc.
    ...state,
    dispatch,

    // Expose the live enabled-modules list so components can build dynamic
    // tabs/dropdowns without re-importing ConfigContext.
    enabledModules: em,

    // ── Transactions: only those whose module is currently enabled ────────
    transactions: state.transactions.filter(t =>
      em.includes(t.mod || t.module?.toLowerCase())
    ),

    // ── Users: hide staff whose only accessible modules are all disabled ──
    // Superadmin is always visible (manages the whole system).
    // Also strips disabled module references from each user's badges.
    users: state.users
      .filter(u =>
        u.role === "superadmin" ||
        (u.modules ?? []).some(m => em.includes(m))
      )
      .map(u => ({
        ...u,
        modules:       (u.modules       ?? []).filter(m => em.includes(m)),
        manageModules: (u.manageModules  ?? []).filter(m => em.includes(m)),
        managePerms:   (u.managePerms    ?? []).filter(m => em.includes(m)),
      })),

    // ── Inventory: empty arrays when the owning module is disabled ────────
    drugs:     em.includes("drugstore")  ? state.drugs     : [],
    services:  em.includes("drugstore")  ? state.services  : [],
    nondrugs:  em.includes("drugstore")  ? state.nondrugs  : [],
    products:  em.includes("mart")       ? state.products   : [],
    menuItems: em.includes("restaurant") ? state.menuItems  : [],
    tables:    em.includes("restaurant") ? state.tables     : [],
    rooms:     em.includes("hotel")      ? state.rooms      : [],
    roomCats:  em.includes("hotel")      ? state.roomCats   : [],
  };
}
