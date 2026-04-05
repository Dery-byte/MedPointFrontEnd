// /**
//  * mockSetup.js
//  * Singleton that installs mock routes on any axios instance passed to it.
//  * Imported by service files so the mock is applied synchronously at module
//  * evaluation time — before any HTTP call is ever made.
//  *
//  * Remove this file (and the imports in api.js / adminAuthService.js) when
//  * connecting a real backend.
//  */
// import axios from "axios";
// import MockAdapter from "axios-mock-adapter";
// import { MOCK_KEYS, getAll, setAll, nextId, seedMockData } from "./mockData";

// // Shared key with AppContext TX_STORE_KEY — keep in sync
// const TX_STORE_KEY = "mock_transactions";

// const DELAY = 300;

// // Seed localStorage on first load
// seedMockData();

// // ── token helpers ────────────────────────────────────────────────────────────
// function customerByToken(t) {
//   return getAll(MOCK_KEYS.customers).find((c) => c.token === t) ?? null;
// }
// function adminByToken(t) {
//   // In mock mode accept any non-empty token so existing sessions don't break
//   if (t) return { role: "superadmin" };
//   return null;
// }
// function bearerToken(config) {
//   const auth = config.headers?.Authorization ?? "";
//   return auth.startsWith("Bearer ") ? auth.slice(7) : null;
// }

// // ── response helpers ─────────────────────────────────────────────────────────
// const ok       = (d) => [200, d];
// const created  = (d) => [201, d];
// const notFound = (m) => [404, { message: m ?? "Not found" }];
// const badReq   = (m) => [400, { message: m ?? "Bad request" }];
// const unauth   = (m) => [401, { message: m ?? "Unauthorized" }];
// const conflict = (m) => [409, { message: m ?? "Conflict" }];

// function applyRoutes(mock) {
//   // POST /customers/register
//   mock.onPost(/\/customers\/register/).reply((config) => {
//     const body = JSON.parse(config.data);
//     const customers = getAll(MOCK_KEYS.customers);
//     if (customers.find((c) => c.email === body.email))
//       return conflict("An account with this email already exists.");
//     const newCustomer = {
//       id: nextId(customers), name: body.name, email: body.email,
//       phone: body.phone ?? "", password: body.password,
//       token: `mock-token-${Date.now()}`,
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

//   // POST /auth/login — intentionally NOT mocked: passes through to the real
//   // backend so a genuine JWT is returned and all protected APIs work correctly.

//   // GET /mart/products
//   mock.onGet(/\/mart\/products$/).reply(() => ok(getAll(MOCK_KEYS.products)));

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
//       id: nextId(products), name: body.name, category: body.category,
//       price: parseFloat(body.price), costPrice: body.costPrice ? parseFloat(body.costPrice) : null,
//       stock: parseInt(body.stock ?? 0), imageUrl: null,
//       active: body.active ?? true, lowStock: parseInt(body.stock ?? 0) < 10,
//       featured: body.featured ?? false, discount: body.discount ?? null,
//       onSale: body.onSale ?? null,
//       variations: body.variations ?? [], tags: body.tags ?? [],
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
//       name: body.name ?? products[idx].name,
//       category: body.category ?? products[idx].category,
//       price: body.price != null ? parseFloat(body.price) : products[idx].price,
//       costPrice: body.costPrice != null ? parseFloat(body.costPrice) : products[idx].costPrice,
//       stock: body.stock != null ? parseInt(body.stock) : products[idx].stock,
//       featured: body.featured ?? products[idx].featured,
//       discount: body.discount ?? products[idx].discount,
//       onSale: body.hasOwnProperty("onSale") ? body.onSale : (products[idx].onSale ?? null),
//       variations: body.variations ?? products[idx].variations,
//       tags: body.tags ?? products[idx].tags,
//       description: body.description ?? products[idx].description,
//       active: body.active ?? products[idx].active,
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
//     setAll(MOCK_KEYS.products, getAll(MOCK_KEYS.products).filter((p) => p.id !== id));
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
//     const updated = { ...products[idx], stock: products[idx].stock + parseInt(quantity) };
//     updated.lowStock = updated.stock < 10 && updated.stock > 0;
//     const newList = [...products];
//     newList[idx] = updated;
//     setAll(MOCK_KEYS.products, newList);
//     return ok(updated);
//   });

//   // POST /mart/products/:id/image
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

//   // GET /mart/categories
//   mock.onGet(/\/mart\/categories/).reply(() => ok(getAll(MOCK_KEYS.categories)));

//   // POST /mart/categories
//   mock.onPost(/\/mart\/categories/).reply((config) => {
//     const token = bearerToken(config);
//     if (!token || !adminByToken(token)) return unauth();
//     const { name } = JSON.parse(config.data);
//     const cats = getAll(MOCK_KEYS.categories);
//     if (cats.find((c) => c.name.toLowerCase() === name.toLowerCase()))
//       return conflict("Category already exists.");
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
//     setAll(MOCK_KEYS.categories, getAll(MOCK_KEYS.categories).filter((c) => c.id !== id));
//     return ok({ success: true });
//   });

//   // POST /store/orders
//   mock.onPost(/\/store\/orders/).reply((config) => {
//     const body = JSON.parse(config.data);
//     const orders = getAll(MOCK_KEYS.orders);
//     const newOrder = {
//       id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
//       reference: body.paymentReference, customerName: body.customerName,
//       customerEmail: body.customerEmail ?? null, phone: body.phone ?? null,
//       address: body.address, items: body.items, total: body.total,
//       paymentMethod: body.paymentMethod, paymentReference: body.paymentReference,
//       status: "pending", createdAt: new Date().toISOString(),
//     };
//     const products = getAll(MOCK_KEYS.products);
//     body.items.forEach((item) => {
//       const idx = products.findIndex((p) => p.id === item.productId);
//       if (idx !== -1) {
//         products[idx] = { ...products[idx], stock: Math.max(0, products[idx].stock - item.quantity) };
//         products[idx].lowStock = products[idx].stock < 10 && products[idx].stock > 0;
//         products[idx].active = products[idx].stock > 0;
//       }
//     });
//     setAll(MOCK_KEYS.products, products);
//     setAll(MOCK_KEYS.orders, [...orders, newOrder]);

//     // Create a unified transaction so POS admin dashboard shows webstore sales
//     try {
//       const txs = JSON.parse(localStorage.getItem(TX_STORE_KEY) ?? "[]");
//       const storeTx = {
//         id:        `TX-STORE-${String(orders.length + 1).padStart(3, "0")}`,
//         mod:       "storefront",
//         amount:    body.total,
//         staff:     "Webstore",
//         date:      newOrder.createdAt,
//         desc:      `Online order ${newOrder.id}`,
//         lineItems: (body.items ?? []).map(i => ({ name: i.name, qty: i.quantity, price: i.unitPrice ?? i.price ?? 0 })),
//         status:    "active",
//       };
//       if (!txs.find(t => t.id === storeTx.id)) {
//         localStorage.setItem(TX_STORE_KEY, JSON.stringify([storeTx, ...txs]));
//       }
//     } catch { /* ignore */ }

//     return created(newOrder);
//   });

//   // GET /store/orders
//   mock.onGet(/\/store\/orders/).reply((config) => {
//     const token = bearerToken(config);
//     if (!token || !adminByToken(token)) return unauth();
//     return ok(getAll(MOCK_KEYS.orders));
//   });

//   console.log("[MockDB] Routes registered on instance.");
// }

// /**
//  * Call this with any axios instance to apply all mock routes to it.
//  * Designed to be called synchronously at module evaluation time.
//  */
// export function applyMockToInstance(instance) {
//   applyRoutes(new MockAdapter(instance, { delayResponse: DELAY, onNoMatch: "passthrough" }));
// }
