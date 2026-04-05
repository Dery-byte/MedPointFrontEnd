
import { createContext, useContext, useReducer, useEffect } from "react";
import AuthService from "../shared/services/AuthService";
import api from "../shared/services/api";
import { DEFAULT_CONFIG } from "../config/storeConfig";

// ── Mappers ───────────────────────────────────────────────────────────────────

const mapDrug = (d) => ({
  id: d.id, name: d.name, cat: d.category,
  price: parseFloat(d.price), stock: d.stock,
  expiryDate: d.expiryDate, active: d.active,
  lowStock: d.lowStock, expiryStatus: d.expiryStatus,
});

const mapService = (s) => ({
  id: s.id, name: s.name, cat: s.category,
  price: parseFloat(s.price), active: s.active,
});

const mapNonDrug = (n) => ({
  id: n.id, name: n.name, cat: n.category,
  price: parseFloat(n.price), stock: n.stock,
  active: n.active, lowStock: n.lowStock,
});

const mapProduct = (p) => ({
  id: p.id, name: p.name, cat: p.category,
  price: parseFloat(p.price), stock: p.stock,
  active: p.active, lowStock: p.lowStock,
  showOnStore: p.showOnStore ?? true,
});

const mapMenuItem = (m) => ({
  id: m.id, name: m.name, cat: m.category,
  type: m.type?.toLowerCase(),
  price: parseFloat(m.price), active: m.active,
});

const mapRoomCat = (rc) => ({
  id: rc.id,
  name: rc.name,
  icon: rc.icon ?? "hotel",
  price: parseFloat(rc.pricePerNight),
  totalRooms: rc.totalRooms,
  availableRooms: rc.availableRooms,
  occupiedRooms: rc.occupiedRooms,
});

const mapRoom = (r) => ({
  id:      r.roomNumber,
  _id:     r.id,
  cat:     r.category?.name,
  price:   Number(r.pricePerNight),
  occ:     r.status === "OCCUPIED",
  booking: r.activeBooking ?? null,
});

const mapTable = (t) => ({
  id: t.id,
  name: t.name ?? `Table ${t.tableNumber ?? t.id}`,
  capacity: t.capacity,
  status: t.status?.toLowerCase(),
  occ: t.status?.toLowerCase() === "occupied",
  orderId: t.activeOrderId ?? null,
});

const mapStaff = (u) => ({
  id: u.id, name: u.name, email: u.email,
  role: u.role?.toLowerCase(),
  modules: u.accessModules?.map((m) => m.toLowerCase()) ?? [],
  manageModules: u.manageModules?.map((m) => m.toLowerCase()) ?? [],
  active: u.active,
});

// ── Boot loader ───────────────────────────────────────────────────────────────

async function bootLoad(dispatch, user) {
  try {
    const boot = { _skipAuthCheck: true };
    const steps = [
      { key: "drugs",        fetch: () => api.get("/drugstore/drugs",           boot), map: (d) => ({ drugs:        d.map(mapDrug) }) },
      { key: "services",     fetch: () => api.get("/drugstore/services",        boot), map: (d) => ({ services:     d.map(mapService) }) },
      { key: "nondrugs",     fetch: () => api.get("/drugstore/non-drug-items",  boot), map: (d) => ({ nondrugs:     d.map(mapNonDrug) }) },
      { key: "products",     fetch: () => api.get("/mart/products",             boot), map: (d) => ({ products:     d.map(mapProduct) }) },
      { key: "menuItems",    fetch: () => api.get("/restaurant/menu-items",     boot), map: (d) => ({ menuItems:    d.map(mapMenuItem) }) },
      { key: "roomCats",     fetch: () => api.get("/hotel/room-categories",     boot), map: (d) => ({ roomCats:     d.map(mapRoomCat) }) },
      { key: "rooms",        fetch: () => api.get("/hotel/rooms",               boot), map: (d) => ({ rooms:        d.map(mapRoom) }) },
      { key: "tables",       fetch: () => api.get("/restaurant/tables",         boot), map: (d) => ({ tables:       d.map(mapTable) }) },
      { key: "users",        fetch: () => user?.role === "superadmin" ? api.get("/admin/staff", boot) : Promise.resolve({ data: [] }), map: (d) => d.length ? { users: d.map(mapStaff) } : {} },
      { key: "transactions", fetch: () => api.get("/admin/transactions", boot),
        map: (d) => ({ transactions: Array.isArray(d) ? d : d.content ?? d.transactions ?? [] }) },
    ];

    const payload = {};
    const promises = steps.map((step, i) =>
      step.fetch()
        .then(res => { Object.assign(payload, step.map(res.data)); })
        .catch(() => { /* silently skip failed steps */ })
        .finally(() => { dispatch({ type: "BOOT_PROGRESS", step: i + 1 }); })
    );

    await Promise.all(promises);
    dispatch({ type: "HYDRATE", payload });
  } catch (err) {
    console.error("Boot load error:", err);
    dispatch({ type: "HYDRATE", payload: {} });
  }
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
  users: [],
  me: null,
  mod: "admin",
  page: "dashboard",
  enabledModules: DEFAULT_CONFIG.enabledModules ?? ["drugstore", "mart", "hotel", "restaurant", "storefront"],
  drugs: [],
  services: [],
  nondrugs: [],
  products: [],
  menuItems: [],
  roomCats: [],
  rooms: [],
  tables: [],
  orders: [],
  transactions: [],
  dsCart: [],
  svcCart: [],
  selSvcs: [],
  dsTab: "dispense",
  svcItemTab: "drugs",
  mCart: [],
  martCat: null,
  hotelExtras: [],
  restoTable: null,
  restoOrderTab: "food",
  nextUid: 1,
  nextBid: 1,
  nextOid: 1,
  nextTxid: 1,
  nextDrugId: 1,
  nextNonDrugId: 1,
  nextProductId: 1,
  nextMenuId: 1,
  receiptData: null,
  booting: false,
  bootProgress: 0,
};

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":  return { ...state, me: action.user, booting: true, bootProgress: 0 };

    case "LOGOUT": return {
      ...initialState,
      enabledModules: state.enabledModules,
      users: state.users,
      drugs: state.drugs,
      services: state.services,
      nondrugs: state.nondrugs,
      products: state.products,
      menuItems: state.menuItems,
      roomCats: state.roomCats,
      rooms: state.rooms,
      tables: state.tables,
      orders: state.orders,
      transactions: state.transactions,
      nextUid: state.nextUid,
      nextBid: state.nextBid,
      nextOid: state.nextOid,
      nextTxid: state.nextTxid,
      nextDrugId: state.nextDrugId,
      nextNonDrugId: state.nextNonDrugId,
      nextProductId: state.nextProductId,
      nextMenuId: state.nextMenuId,
    };

    case "NAV":           return { ...state, mod: action.mod, page: action.page };
    case "SET":           return { ...state, [action.key]: action.value };
    case "BOOT_PROGRESS": return { ...state, bootProgress: action.step };
    case "HYDRATE":       return { ...state, ...action.payload, booting: false, bootProgress: 10 };
    case "SET_TRANSACTIONS": return { ...state, transactions: action.data };
    case "SET_USERS":        return { ...state, users: action.data };
    case "SET_DRUGS":        return { ...state, drugs: action.data };
    case "SET_PRODUCTS":     return { ...state, products: action.data };
    case "SET_ROOMS":     return { ...state, rooms: action.payload };

    case "ADD_TX": {
      const tx = {
        id: action.txId ?? `TX-${state.nextTxid}`,
        mod: action.mod,
        amount: action.amount,
        staff: state.me?.name ?? "",
        date: new Date().toISOString(),
        desc: action.desc,
        lineItems: action.lineItems || [],
        status: "active",
      };
      return { ...state, transactions: [tx, ...state.transactions], nextTxid: state.nextTxid + 1 };
    }

    case "SET_ORDER_ITEMS": {
      const { orderId, items } = action;
      return { ...state, orders: state.orders.map(o => o.id === orderId ? { ...o, items } : o) };
    }

    case "CANCEL_TX": {
      const tx = state.transactions.find(t => t.id === action.id);
      if (!tx || tx.status === "cancelled") return state;
      let drugs = state.drugs;
      let products = state.products;
      if (tx.mod === "drugstore") {
        drugs = state.drugs.map(d => {
          const item = tx.lineItems.find(i => i.name === d.name);
          return item ? { ...d, stock: d.stock + item.qty } : d;
        });
      }
      if (tx.mod === "mart") {
        products = state.products.map(p => {
          const item = tx.lineItems.find(i => i.name === p.name);
          return item ? { ...p, stock: p.stock + item.qty } : p;
        });
      }
      return {
        ...state, drugs, products,
        transactions: state.transactions.map(t =>
          t.id === action.id
            ? { ...t, status: "cancelled", cancelledBy: state.me.name, cancelledAt: new Date().toISOString() }
            : t
        ),
      };
    }

    case "SHOW_RECEIPT":  return { ...state, receiptData: action.data };
    case "CLOSE_RECEIPT": return { ...state, receiptData: null };

    case "ADD_USER":    return { ...state, users: [...state.users, { ...action.user, id: state.nextUid }], nextUid: state.nextUid + 1 };
    case "UPDATE_USER": return { ...state, users: state.users.map(u => u.id === action.user.id ? action.user : u) };
    case "TOGGLE_USER": return { ...state, users: state.users.map(u => u.id === action.id ? { ...u, active: !u.active } : u) };

    case "DS_ADD":    return { ...state, dsCart: [...state.dsCart, { ...action.item, qty: 1 }] };
    case "DS_REMOVE": return { ...state, dsCart: state.dsCart.filter(i => i.id !== action.id) };
    case "DS_QTY":    return { ...state, dsCart: state.dsCart.map(i => i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i) };
    case "DS_CLEAR":  return { ...state, dsCart: [] };

    case "SVC_ADD_SERVICE": {
      if (state.selSvcs.some(s => s.id === action.svc.id)) return state;
      return { ...state, selSvcs: [...state.selSvcs, action.svc] };
    }
    case "SVC_REMOVE_SERVICE": return { ...state, selSvcs: state.selSvcs.filter(s => s.id !== action.id) };
    case "SVC_CLEAR":          return { ...state, selSvcs: [], svcCart: [] };
    case "SVC_ADD":    return { ...state, svcCart: [...state.svcCart, { ...action.item, qty: 1 }] };
    case "SVC_REMOVE": return { ...state, svcCart: state.svcCart.filter(i => i.id !== action.id) };
    case "SVC_QTY":    return { ...state, svcCart: state.svcCart.map(i => i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i) };

    case "REDUCE_DRUG_STOCK": return { ...state, drugs: state.drugs.map(d => { const hit = action.items.find(i => i.id === d.id); return hit ? { ...d, stock: Math.max(0, d.stock - hit.qty) } : d; }) };

    case "MART_ADD":    return { ...state, mCart: [...state.mCart, { ...action.item, qty: 1 }] };
    case "MART_REMOVE": return { ...state, mCart: state.mCart.filter(i => i.id !== action.id) };
    case "MART_QTY":    return { ...state, mCart: state.mCart.map(i => i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i) };
    case "MART_CLEAR":  return { ...state, mCart: [] };

    case "REDUCE_PRODUCT_STOCK": return { ...state, products: state.products.map(p => { const hit = action.items.find(i => i.id === p.id); return hit ? { ...p, stock: Math.max(0, p.stock - hit.qty) } : p; }) };

    case "CHECKIN": {
      return {
        ...state,
        rooms: state.rooms.map(r =>
          r._id === action.rid ? { ...r, occ: true, booking: action.booking } : r
        ),
        nextBid: state.nextBid + 1,
      };
    }
    case "CHECKOUT":     return { ...state, rooms: state.rooms.map(r => (r._id === action.rid || r.id === action.rid) ? { ...r, occ: false, booking: null } : r), hotelExtras: [] };
    case "TOGGLE_EXTRA": {
      const e = action.extra;
      const exists = state.hotelExtras.some(x => x.id === e.id);
      return { ...state, hotelExtras: exists ? state.hotelExtras.filter(x => x.id !== e.id) : [...state.hotelExtras, e] };
    }

    case "TABLE_CLICK_OPEN": {
      const { tableId, orderId } = action;
      return {
        ...state,
        restoTable: tableId,
        tables: state.tables.map(t => t.id === tableId ? { ...t, orderId } : t),
        orders: [...state.orders, { id: orderId, tableId, items: [], status: "open" }],
      };
    }
    case "CLOSE_TABLE": return { ...state, restoTable: null };

    case "SYNC_TABLES": {
      const { tables: freshTables, orders: freshOrders } = action;
      const existingNonResto = state.orders.filter(o => !freshTables.some(t => t.id === o.tableId));
      return { ...state, tables: freshTables, orders: [...existingNonResto, ...freshOrders] };
    }

    case "SYNC_ORDER_ITEMS": {
      return { ...state, orders: state.orders.map(o => o.id === action.orderId ? { ...o, items: action.items } : o) };
    }

    case "RESTO_TOGGLE_ITEM": {
      const { tableId, item } = action;
      const tbl = state.tables.find(t => t.id === tableId);
      const ord = state.orders.find(o => o.id === tbl?.orderId);
      if (!ord) return state;
      const exists = ord.items.some(i => i.id === item.id);
      const newItems = exists ? ord.items.filter(i => i.id !== item.id) : [...ord.items, { ...item, qty: 1 }];
      return { ...state, orders: state.orders.map(o => o.id === ord.id ? { ...o, items: newItems } : o) };
    }
    case "RESTO_QTY": {
      const { tableId, itemId, qty } = action;
      const tbl = state.tables.find(t => t.id === tableId);
      const ord = state.orders.find(o => o.id === tbl?.orderId);
      if (!ord) return state;
      return { ...state, orders: state.orders.map(o => o.id === ord.id ? { ...o, items: o.items.map(i => i.id === itemId ? { ...i, qty: Math.max(1, qty) } : i) } : o) };
    }
    case "RESTO_REMOVE": {
      const { tableId, itemId } = action;
      const tbl = state.tables.find(t => t.id === tableId);
      const ord = state.orders.find(o => o.id === tbl?.orderId);
      if (!ord) return state;
      return { ...state, orders: state.orders.map(o => o.id === ord.id ? { ...o, items: o.items.filter(i => i.id !== itemId) } : o) };
    }
    case "CLEAR_TABLE": {
      const tbl = state.tables.find(t => t.id === action.tableId);
      const ord = state.orders.find(o => o.id === tbl?.orderId);
      if (!ord) return state;
      return { ...state, orders: state.orders.map(o => o.id === ord.id ? { ...o, items: [] } : o) };
    }
    case "BILL_TABLE": {
      const tbl = state.tables.find(t => t.id === action.tableId);
      return {
        ...state,
        tables: state.tables.map(t => t.id === action.tableId ? { ...t, occ: true, orderId: null } : t),
        orders: state.orders.filter(o => o.id !== tbl?.orderId),
        restoTable: null,
      };
    }
    case "FREE_TABLE": {
      return {
        ...state,
        tables: state.tables.map(t => t.id === action.tableId ? { ...t, occ: false, orderId: null } : t),
        restoTable: null,
      };
    }
    case "TABLE_REOPEN": {
      const { tableId, orderId } = action;
      return {
        ...state,
        restoTable: tableId,
        tables: state.tables.map(t => t.id === tableId ? { ...t, occ: false, orderId } : t),
        orders: [...state.orders, { id: orderId, tableId, items: [], status: "open" }],
      };
    }

    case "ADD_DRUG":     return { ...state, drugs: [...state.drugs, { ...action.drug, id: state.nextDrugId }], nextDrugId: state.nextDrugId + 1 };
    case "UPDATE_DRUG":  return { ...state, drugs: state.drugs.map(d => d.id === action.drug.id ? action.drug : d) };
    case "DELETE_DRUG":  return { ...state, drugs: state.drugs.filter(d => d.id !== action.id) };
    case "RESTOCK_DRUG": return { ...state, drugs: state.drugs.map(d => d.id === action.id ? { ...d, stock: d.stock + action.qty } : d) };

    case "ADD_NONDRUG":    return { ...state, nondrugs: [...state.nondrugs, { ...action.item, id: state.nextNonDrugId }], nextNonDrugId: state.nextNonDrugId + 1 };
    case "UPDATE_NONDRUG": return { ...state, nondrugs: state.nondrugs.map(n => n.id === action.item.id ? action.item : n) };
    case "DELETE_NONDRUG": return { ...state, nondrugs: state.nondrugs.filter(n => n.id !== action.id) };

    case "ADD_SERVICE":    return { ...state, services: [...state.services, { ...action.service, id: state.nextDrugId + 100 }], nextDrugId: state.nextDrugId + 1 };
    case "UPDATE_SERVICE": return { ...state, services: state.services.map(s => s.id === action.service.id ? action.service : s) };
    case "DELETE_SERVICE": return { ...state, services: state.services.filter(s => s.id !== action.id) };

    case "ADD_PRODUCT":     return { ...state, products: [...state.products, { ...action.product, id: state.nextProductId }], nextProductId: state.nextProductId + 1 };
    case "UPDATE_PRODUCT":  return { ...state, products: state.products.map(p => p.id === action.product.id ? action.product : p) };
    case "DELETE_PRODUCT":  return { ...state, products: state.products.filter(p => p.id !== action.id) };
    case "RESTOCK_PRODUCT": return { ...state, products: state.products.map(p => p.id === action.id ? { ...p, stock: p.stock + action.qty } : p) };

    case "ADD_MENU_ITEM":    return { ...state, menuItems: [...state.menuItems, { ...action.item, id: state.nextMenuId }], nextMenuId: state.nextMenuId + 1 };
    case "UPDATE_MENU_ITEM": return { ...state, menuItems: state.menuItems.map(m => m.id === action.item.id ? action.item : m) };
    case "DELETE_MENU_ITEM": return { ...state, menuItems: state.menuItems.filter(m => m.id !== action.id) };

    case "UPDATE_ROOM_CAT": return {
      ...state,
      roomCats: state.roomCats.map(rc => rc.name === action.cat.name ? action.cat : rc),
      rooms: state.rooms.map(r => r.cat === action.cat.name ? { ...r, price: action.cat.price } : r),
    };
    case "ADD_ROOM_CAT":    return { ...state, roomCats: [...state.roomCats, action.cat] };
    case "DELETE_ROOM_CAT": return { ...state, roomCats: state.roomCats.filter(rc => rc.name !== action.name) };
    case "ADD_ROOM":        return { ...state, rooms: [...state.rooms, action.room] };
    case "DELETE_ROOM":     return { ...state, rooms: state.rooms.filter(r => r.id !== action.id) };

    default: return state;
  }
}

// ── Hash-based routing helpers ────────────────────────────────────────────────

// Read the current URL hash and return { mod, page } if valid, else null.
function readHashNav() {
  const hash = window.location.hash.slice(1); // strip leading '#'
  if (!hash) return null;
  const [mod, page] = hash.split("/");
  if (mod && page) return { mod, page };
  return null;
}

// Write mod/page into the URL hash without triggering a navigation event.
function writeHashNav(mod, page) {
  const next = `#${mod}/${page}`;
  if (window.location.hash !== next) {
    window.history.replaceState(null, "", next);
  }
}

// ── Context & Provider ────────────────────────────────────────────────────────

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const storedUser = AuthService.getStoredUser();

  // Restore mod/page from hash on refresh (only when a user is already logged in)
  const hashNav = storedUser ? readHashNav() : null;
  const defaultMod = storedUser
    ? storedUser.role === "superadmin" ? "admin" : storedUser.modules[0]
    : "admin";

  // ↓ renamed to rawDispatch so we can wrap it below
  const [state, rawDispatch] = useReducer(reducer, {
    ...initialState,
    me: storedUser,
    mod:  hashNav ? hashNav.mod  : defaultMod,
    page: hashNav ? hashNav.page : "dashboard",
    booting: !!storedUser,
    bootProgress: 0,
  });

  // ↓ THE FIX: call AuthService.logout() before dispatching LOGOUT
  // ↓ THE FIX: call AuthService.logout() before dispatching LOGOUT
  //   so localStorage is cleared and a page refresh won't restore the session
  const dispatch = (action) => {
    if (action.type === "LOGOUT") {
      AuthService.logout();
      window.history.replaceState(null, "", window.location.pathname); // clear hash on logout
    }

    rawDispatch(action);
  };

  // Sync hash whenever mod/page changes
  useEffect(() => {
    if (state.me) {
      writeHashNav(state.mod, state.page);
    }
  }, [state.me, state.mod, state.page]);

  useEffect(() => {
    if (state.booting && state.me) {
      bootLoad(rawDispatch, state.me); // ↓ use rawDispatch here — no side-effects needed during boot
    }
  }, [state.booting, state.me]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}