// /**
//  * mockAdapter.js
//  * Intercepts all axios requests and routes them to localStorage.
//  * Install this ONCE at app boot (before any service is called).
//  *
//  * Covered endpoints:
//  *   POST /customers/register
//  *   POST /customers/login
//  *   POST /auth/login              (admin)
//  *   GET  /mart/products
//  *   GET  /mart/products/:id
//  *   POST /mart/products
//  *   PUT  /mart/products/:id
//  *   DELETE /mart/products/:id
//  *   PATCH /mart/products/:id/restock
//  *   POST /mart/products/:id/image  (stub — returns placeholder)
//  *   GET  /mart/categories
//  *   POST /mart/categories
//  *   PUT  /mart/categories/:id
//  *   DELETE /mart/categories/:id
//  *   POST /store/orders
//  *   GET  /store/orders
//  */

// import axios from "axios";
// import MockAdapter from "axios-mock-adapter";
// import {
//   MOCK_KEYS,
//   getAll,
//   setAll,
//   nextId,
//   SEED_TRANSACTIONS,
// } from "./mockData";

// // ── delay helper (simulates network) ─────────────────────────────────────────
// const DELAY = 300; // ms

// // ── token → user lookup ───────────────────────────────────────────────────────
// function customerByToken(token) {
//   return getAll(MOCK_KEYS.customers).find((c) => c.token === token) ?? null;
// }
// function adminByToken(token) {
//   // In mock mode accept any non-empty token so existing sessions don't break
//   if (token) return { role: "superadmin" };
//   return null;
// }

// // ── extract Bearer token from request config ──────────────────────────────────
// function bearerToken(config) {
//   const auth = config.headers?.Authorization ?? "";
//   return auth.startsWith("Bearer ") ? auth.slice(7) : null;
// }

// // ── install ───────────────────────────────────────────────────────────────────
// export function installMockAdapter() {
//   // Patch axios.create so future instances also get the mock
//   const originalCreate = axios.create.bind(axios);
//   axios.create = function (...args) {
//     const instance = originalCreate(...args);
//     applyRoutes(new MockAdapter(instance, { delayResponse: DELAY, onNoMatch: "passthrough" }));
//     return instance;
//   };

//   // Apply to the default axios instance
//   const mock = new MockAdapter(axios, { delayResponse: DELAY, onNoMatch: "passthrough" });
//   applyRoutes(mock);
// }

// /**
//  * Patch an already-created axios instance with mock routes.
//  * Call this from api.js / adminAuthService.js after their instances are created,
//  * since those modules are evaluated before installMockAdapter() runs.
//  */
// export function patchInstance(instance) {
//   applyRoutes(new MockAdapter(instance, { delayResponse: DELAY, onNoMatch: "passthrough" }));
// }

// function applyRoutes(mock) {

//   // ── helpers ──────────────────────────────────────────────────────────────
//   const ok    = (data)    => [200, data];
//   const created = (data)  => [201, data];
//   const notFound = (msg)  => [404, { message: msg ?? "Not found" }];
//   const badReq  = (msg)   => [400, { message: msg ?? "Bad request" }];
//   const unauth  = (msg)   => [401, { message: msg ?? "Unauthorized" }];
//   const conflict = (msg)  => [409, { message: msg ?? "Conflict" }];

//   // ────────────────────────────────────────────────────────────────────────────
//   // CUSTOMER AUTH
//   // ────────────────────────────────────────────────────────────────────────────

//   // POST /customers/register
//   mock.onPost(/\/customers\/register/).reply((config) => {
//     const body = JSON.parse(config.data);
//     const customers = getAll(MOCK_KEYS.customers);

//     if (customers.find((c) => c.email === body.email)) {
//       return conflict("An account with this email already exists.");
//     }

//     const newCustomer = {
//       id:       nextId(customers),
//       name:     body.name,
//       email:    body.email,
//       phone:    body.phone ?? "",
//       password: body.password,
//       token:    `mock-token-${Date.now()}`,
//     };

//     setAll(MOCK_KEYS.customers, [...customers, newCustomer]);

//     const { password: _p, ...safe } = newCustomer;
//     return created(safe);
//   });

//   // POST /customers/login
//   mock.onPost(/\/customers\/login/).reply((config) => {
//     const { email, password } = JSON.parse(config.data);
//     const customer = getAll(MOCK_KEYS.customers).find(
//       (c) => c.email === email && c.password === password
//     );
//     if (!customer) return unauth("Invalid email or password.");
//     const { password: _p, ...safe } = customer;
//     return ok(safe);
//   });

//   // ────────────────────────────────────────────────────────────────────────────
//   // ADMIN AUTH
//   // ────────────────────────────────────────────────────────────────────────────

//   // POST /auth/login
//   mock.onPost(/\/auth\/login/).reply((config) => {
//     const { email, password } = JSON.parse(config.data);
//     const admin = getAll(MOCK_KEYS.adminUsers).find(
//       (a) => a.email === email && a.password === password
//     );
//     if (!admin) return unauth("Invalid credentials.");
//     const { password: _p, ...safe } = admin;
//     return ok(safe);
//   });

//   // ────────────────────────────────────────────────────────────────────────────
//   // PRODUCTS
//   // ────────────────────────────────────────────────────────────────────────────

//   // GET /mart/products
//   mock.onGet(/\/mart\/products$/).reply(() => {
//     return ok(getAll(MOCK_KEYS.products));
//   });

//   // GET /mart/products/:id
//   mock.onGet(/\/mart\/products\/\d+/).reply((config) => {
//     const id = parseInt(config.url.split("/").pop());
//     const product = getAll(MOCK_KEYS.products).find((p) => p.id === id);
//     return product ? ok(product) : notFound("Product not found.");
//   });

//   // POST /mart/products
//   mock.onPost(/\/mart\/products$/).reply((config) => {
//     const token = bearerToken(config);
//     if (!token || !adminByToken(token)) return unauth();

//     const body = JSON.parse(config.data);
//     const products = getAll(MOCK_KEYS.products);
//     const newProduct = {
//       id:          nextId(products),
//       name:        body.name,
//       category:    body.category,
//       price:       parseFloat(body.price),
//       costPrice:   body.costPrice ? parseFloat(body.costPrice) : null,
//       stock:       parseInt(body.stock ?? 0),
//       imageUrl:    null,
//       active:      body.active ?? true,
//       lowStock:    (parseInt(body.stock ?? 0)) < 10,
//       featured:    body.featured ?? false,
//       discount:    body.discount ?? null,
//       onSale:      body.onSale ?? null,
//       variations:  body.variations ?? [],
//       tags:        body.tags ?? [],
//       description: body.description ?? "",
//       showOnStore: body.showOnStore ?? true,
//     };
//     setAll(MOCK_KEYS.products, [...products, newProduct]);
//     return created(newProduct);
//   });

//   // PUT /mart/products/:id
//   mock.onPut(/\/mart\/products\/\d+/).reply((config) => {
//     const token = bearerToken(config);
//     if (!token || !adminByToken(token)) return unauth();

//     const id = parseInt(config.url.split("/").filter((s) => /^\d+$/.test(s)).pop());
//     const body = JSON.parse(config.data);
//     const products = getAll(MOCK_KEYS.products);
//     const idx = products.findIndex((p) => p.id === id);
//     if (idx === -1) return notFound("Product not found.");

//     const updated = {
//       ...products[idx],
//       name:        body.name        ?? products[idx].name,
//       category:    body.category    ?? products[idx].category,
//       price:       body.price != null ? parseFloat(body.price) : products[idx].price,
//       costPrice:   body.costPrice != null ? parseFloat(body.costPrice) : products[idx].costPrice,
//       stock:       body.stock != null ? parseInt(body.stock) : products[idx].stock,
//       featured:    body.featured    ?? products[idx].featured,
//       discount:    body.discount    ?? products[idx].discount,
//       onSale:      body.hasOwnProperty("onSale") ? body.onSale : (products[idx].onSale ?? null),
//       variations:  body.variations  ?? products[idx].variations,
//       tags:        body.tags        ?? products[idx].tags,
//       description: body.description ?? products[idx].description,
//       active:      body.active      ?? products[idx].active,
//       showOnStore: body.showOnStore !== undefined ? body.showOnStore : (products[idx].showOnStore ?? true),
//     };
//     updated.lowStock = updated.stock < 10 && updated.stock > 0;

//     const newList = [...products];
//     newList[idx] = updated;
//     setAll(MOCK_KEYS.products, newList);
//     return ok(updated);
//   });

//   // DELETE /mart/products/:id
//   mock.onDelete(/\/mart\/products\/\d+/).reply((config) => {
//     const token = bearerToken(config);
//     if (!token || !adminByToken(token)) return unauth();

//     const id = parseInt(config.url.split("/").filter((s) => /^\d+$/.test(s)).pop());
//     const products = getAll(MOCK_KEYS.products);
//     setAll(MOCK_KEYS.products, products.filter((p) => p.id !== id));
//     return ok({ success: true });
//   });

//   // PATCH /mart/products/:id/restock
//   mock.onPatch(/\/mart\/products\/\d+\/restock/).reply((config) => {
//     const token = bearerToken(config);
//     if (!token || !adminByToken(token)) return unauth();

//     const parts = config.url.split("/");
//     const id = parseInt(parts[parts.indexOf("products") + 1]);
//     const { quantity } = JSON.parse(config.data);

//     const products = getAll(MOCK_KEYS.products);
//     const idx = products.findIndex((p) => p.id === id);
//     if (idx === -1) return notFound("Product not found.");

//     const updated = {
//       ...products[idx],
//       stock: products[idx].stock + parseInt(quantity),
//     };
//     updated.lowStock = updated.stock < 10 && updated.stock > 0;

//     const newList = [...products];
//     newList[idx] = updated;
//     setAll(MOCK_KEYS.products, newList);
//     return ok(updated);
//   });

//   // POST /mart/products/:id/image  — stub, returns a placeholder
//   mock.onPost(/\/mart\/products\/\d+\/image/).reply((config) => {
//     const id = parseInt(config.url.split("/").filter((s) => /^\d+$/.test(s)).pop());
//     const products = getAll(MOCK_KEYS.products);
//     const idx = products.findIndex((p) => p.id === id);
//     if (idx === -1) return notFound();

//     const imageUrl = `https://placehold.co/400x300/e8f5e9/1e4d2b?text=Product+${id}`;
//     const newList = [...products];
//     newList[idx] = { ...newList[idx], imageUrl };
//     setAll(MOCK_KEYS.products, newList);
//     return ok({ imageUrl });
//   });

//   // ────────────────────────────────────────────────────────────────────────────
//   // CATEGORIES
//   // ────────────────────────────────────────────────────────────────────────────

//   // GET /mart/categories
//   mock.onGet(/\/mart\/categories/).reply(() => {
//     return ok(getAll(MOCK_KEYS.categories));
//   });

//   // POST /mart/categories
//   mock.onPost(/\/mart\/categories/).reply((config) => {
//     const token = bearerToken(config);
//     if (!token || !adminByToken(token)) return unauth();

//     const { name } = JSON.parse(config.data);
//     const cats = getAll(MOCK_KEYS.categories);
//     if (cats.find((c) => c.name.toLowerCase() === name.toLowerCase())) {
//       return conflict("Category already exists.");
//     }
//     const newCat = { id: nextId(cats), name };
//     setAll(MOCK_KEYS.categories, [...cats, newCat]);
//     return created(newCat);
//   });

//   // PUT /mart/categories/:id
//   mock.onPut(/\/mart\/categories\/\d+/).reply((config) => {
//     const token = bearerToken(config);
//     if (!token || !adminByToken(token)) return unauth();

//     const id = parseInt(config.url.split("/").pop());
//     const { name } = JSON.parse(config.data);
//     const cats = getAll(MOCK_KEYS.categories);
//     const idx = cats.findIndex((c) => c.id === id);
//     if (idx === -1) return notFound("Category not found.");

//     const newList = [...cats];
//     newList[idx] = { ...newList[idx], name };
//     setAll(MOCK_KEYS.categories, newList);
//     return ok(newList[idx]);
//   });

//   // DELETE /mart/categories/:id
//   mock.onDelete(/\/mart\/categories\/\d+/).reply((config) => {
//     const token = bearerToken(config);
//     if (!token || !adminByToken(token)) return unauth();

//     const id = parseInt(config.url.split("/").pop());
//     const cats = getAll(MOCK_KEYS.categories);
//     setAll(MOCK_KEYS.categories, cats.filter((c) => c.id !== id));
//     return ok({ success: true });
//   });

//   // ────────────────────────────────────────────────────────────────────────────
//   // TRANSACTIONS
//   // ────────────────────────────────────────────────────────────────────────────

//   // GET /transactions
//   mock.onGet(/\/transactions$/).reply((config) => {
//     let txs = getAll(MOCK_KEYS.transactions);
//     const mod = new URLSearchParams(config.url?.split("?")[1] ?? "").get("mod");
//     if (mod) txs = txs.filter((t) => t.mod === mod);
//     return ok(txs);
//   });

//   // POST /transactions  — called by POS ADD_TX (fire-and-forget persist)
//   mock.onPost(/\/transactions$/).reply((config) => {
//     const body = JSON.parse(config.data);
//     const txs  = getAll(MOCK_KEYS.transactions);
//     // Avoid duplicates if the same tx is submitted twice
//     if (txs.find((t) => t.id === body.id)) return ok(body);
//     setAll(MOCK_KEYS.transactions, [body, ...txs]);
//     return created(body);
//   });

//   // PATCH /transactions/:id/cancel
//   mock.onPatch(/\/transactions\/[^/]+\/cancel/).reply((config) => {
//     const parts = config.url.split("/");
//     const id    = parts[parts.indexOf("transactions") + 1];
//     const txs   = getAll(MOCK_KEYS.transactions);
//     const idx   = txs.findIndex((t) => t.id === id);
//     if (idx === -1) return notFound("Transaction not found.");

//     const body      = config.data ? JSON.parse(config.data) : {};
//     const cancelled = {
//       ...txs[idx],
//       status:      "cancelled",
//       cancelledBy: body.cancelledBy ?? "Staff",
//       cancelledAt: new Date().toISOString(),
//     };

//     // Restore mart stock on cancel
//     if (cancelled.mod === "mart" && Array.isArray(cancelled.lineItems)) {
//       const products = getAll(MOCK_KEYS.products);
//       cancelled.lineItems.forEach((item) => {
//         const pi = products.findIndex((p) => p.name === item.name);
//         if (pi !== -1) products[pi] = { ...products[pi], stock: products[pi].stock + (item.qty ?? 0) };
//       });
//       setAll(MOCK_KEYS.products, products);
//     }

//     const newList = [...txs];
//     newList[idx]  = cancelled;
//     setAll(MOCK_KEYS.transactions, newList);
//     return ok(cancelled);
//   });

//   // ────────────────────────────────────────────────────────────────────────────
//   // POS STUBS — return data so bootLoad doesn't fail silently
//   // ────────────────────────────────────────────────────────────────────────────

//   // GET /admin/staff — no mock backend yet; 404 makes bootLoad skip and preserve INITIAL_USERS seed
//   mock.onGet(/\/admin\/staff/).reply(() => notFound());

//   // These POS endpoints have no mock backend yet.
//   // Returning 404 makes bootLoad silently skip them, preserving seed data from constants.js.
//   mock.onGet(/\/drugstore\/drugs/).reply(() => notFound());
//   mock.onGet(/\/drugstore\/services/).reply(() => notFound());
//   mock.onGet(/\/drugstore\/non-drug-items/).reply(() => notFound());
//   mock.onGet(/\/restaurant\/menu-items/).reply(() => notFound());
//   mock.onGet(/\/hotel\/room-categories/).reply(() => notFound());
//   mock.onGet(/\/hotel\/rooms/).reply(() => notFound());
//   mock.onGet(/\/restaurant\/tables/).reply(() => notFound());

//   // ────────────────────────────────────────────────────────────────────────────
//   // ORDERS
//   // ────────────────────────────────────────────────────────────────────────────

//   // POST /store/orders
//   mock.onPost(/\/store\/orders/).reply((config) => {
//     const body = JSON.parse(config.data);
//     const orders = getAll(MOCK_KEYS.orders);
//     const newOrder = {
//       id:               `ORD-${String(orders.length + 1).padStart(3, "0")}`,
//       reference:        body.paymentReference,
//       customerName:     body.customerName,
//       customerEmail:    body.customerEmail ?? null,
//       phone:            body.phone ?? null,
//       address:          body.address,
//       items:            body.items,
//       total:            body.total,
//       paymentMethod:    body.paymentMethod,
//       paymentReference: body.paymentReference,
//       status:           "pending",
//       createdAt:        new Date().toISOString(),
//     };

//     // Deduct stock
//     const products = getAll(MOCK_KEYS.products);
//     body.items.forEach((item) => {
//       const idx = products.findIndex((p) => p.id === item.productId);
//       if (idx !== -1) {
//         products[idx] = {
//           ...products[idx],
//           stock: Math.max(0, products[idx].stock - item.quantity),
//         };
//         products[idx].lowStock = products[idx].stock < 10 && products[idx].stock > 0;
//         products[idx].active   = products[idx].stock > 0;
//       }
//     });
//     setAll(MOCK_KEYS.products, products);
//     setAll(MOCK_KEYS.orders, [...orders, newOrder]);

//     // Create a unified transaction record so the POS admin can see webstore sales
//     const txs = getAll(MOCK_KEYS.transactions);
//     const storeTx = {
//       id:        `TX-STORE-${String(orders.length + 1).padStart(3, "0")}`,
//       mod:       "storefront",
//       amount:    body.total,
//       staff:     "Webstore",
//       date:      newOrder.createdAt,
//       desc:      `Online order ${newOrder.id}`,
//       lineItems: (body.items ?? []).map((i) => ({ name: i.name, qty: i.quantity, price: i.unitPrice ?? i.price ?? 0 })),
//       status:    "active",
//     };
//     setAll(MOCK_KEYS.transactions, [storeTx, ...txs]);

//     return created(newOrder);
//   });

//   // GET /store/orders
//   mock.onGet(/\/store\/orders/).reply((config) => {
//     const token = bearerToken(config);
//     if (!token || !adminByToken(token)) return unauth();
//     return ok(getAll(MOCK_KEYS.orders));
//   });

//   console.log("[MockAdapter] Routes registered.");
// }

