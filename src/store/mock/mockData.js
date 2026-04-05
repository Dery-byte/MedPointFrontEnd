// /**
//  * mockData.js
//  * Seed data for the MedPoint Store local mockup.
//  * Run seedMockData() once on app boot to populate localStorage.
//  */

// export const MOCK_KEYS = {
//   customers:    "mock_customers",
//   adminUsers:   "mock_adminUsers",
//   products:     "mock_products",
//   categories:   "mock_categories",
//   orders:       "mock_orders",
//   transactions: "mock_transactions",
//   seeded:       "mock_seeded",
// };

// // ── Admin / Staff Users ───────────────────────────────────────────────────────
// export const SEED_ADMINS = [
//   {
//     id: 1,
//     name: "Super Admin",
//     email: "admin@medpoint.com",
//     password: "admin123",
//     role: "SUPERADMIN",
//     accessModules: ["drugstore", "mart", "hotel", "restaurant", "storefront"],
//     manageModules: ["drugstore", "mart", "hotel", "restaurant", "storefront"],
//     active: true,
//     token: "mock-admin-token-superadmin",
//   },
//   {
//     id: 2,
//     name: "Store Manager",
//     email: "manager@medpoint.com",
//     password: "manager123",
//     role: "MANAGER",
//     accessModules: ["mart", "storefront"],
//     manageModules: ["mart"],
//     active: true,
//     token: "mock-admin-token-manager",
//   },
//   {
//     id: 3,
//     name: "Pharma Manager",
//     email: "pharma@medpoint.com",
//     password: "pass123",
//     role: "MANAGER",
//     accessModules: ["drugstore"],
//     manageModules: ["drugstore"],
//     active: true,
//     token: "mock-token-pharma",
//   },
//   {
//     id: 4,
//     name: "Mart Attendant",
//     email: "mart@medpoint.com",
//     password: "pass123",
//     role: "STAFF",
//     accessModules: ["mart"],
//     manageModules: [],
//     active: true,
//     token: "mock-token-mart",
//   },
//   {
//     id: 5,
//     name: "Hotel Receptionist",
//     email: "hotel@medpoint.com",
//     password: "pass123",
//     role: "MANAGER",
//     accessModules: ["hotel"],
//     manageModules: ["hotel"],
//     active: true,
//     token: "mock-token-hotel",
//   },
//   {
//     id: 6,
//     name: "Restaurant Staff",
//     email: "resto@medpoint.com",
//     password: "pass123",
//     role: "STAFF",
//     accessModules: ["restaurant"],
//     manageModules: [],
//     active: true,
//     token: "mock-token-resto",
//   },
// ];

// // ── Customer Users ────────────────────────────────────────────────────────────
// export const SEED_CUSTOMERS = [
//   {
//     id: 101,
//     name: "Ama Owusu",
//     email: "ama@example.com",
//     phone: "0244111222",
//     password: "password123",
//     token: "mock-customer-token-ama",
//   },
//   {
//     id: 102,
//     name: "Kofi Mensah",
//     email: "kofi@example.com",
//     phone: "0277333444",
//     password: "password123",
//     token: "mock-customer-token-kofi",
//   },
// ];

// // ── Categories ────────────────────────────────────────────────────────────────
// export const SEED_CATEGORIES = [
//   { id: 1, name: "Pharmaceuticals" },
//   { id: 2, name: "Groceries" },
//   { id: 3, name: "Personal Care" },
//   { id: 4, name: "Household" },
//   { id: 5, name: "Baby & Mother" },
// ];

// // ── Products ──────────────────────────────────────────────────────────────────
// export const SEED_PRODUCTS = [
//   {
//     id: 1,
//     name: "Paracetamol 500mg (Pack of 24)",
//     category: "Pharmaceuticals",
//     price: 8.5,
//     costPrice: 5.0,
//     stock: 150,
//     imageUrl: "https://placehold.co/400x300/e8f5e9/1e4d2b?text=Paracetamol",
//     active: true,
//     lowStock: false,
//     featured: true,
//     discount: null,
//     variations: [],
//     tags: ["pain relief", "fever"],
//     description: "Fast-acting paracetamol tablets for pain and fever relief.",
//     showOnStore: true,
//   },
//   {
//     id: 2,
//     name: "Vitamin C 1000mg Effervescent (20 tabs)",
//     category: "Pharmaceuticals",
//     price: 25.0,
//     costPrice: 14.0,
//     stock: 80,
//     imageUrl: "https://placehold.co/400x300/e8f5e9/1e4d2b?text=Vitamin+C",
//     active: true,
//     lowStock: false,
//     featured: true,
//     discount: 10,
//     variations: [
//       { label: "Flavour", options: ["Orange", "Lemon", "Berry"] },
//     ],
//     tags: ["vitamins", "immune"],
//     description: "Immune-boosting effervescent Vitamin C tablets.",
//     showOnStore: true,
//   },
//   {
//     id: 3,
//     name: "Oral Rehydration Salts (ORS x5 sachets)",
//     category: "Pharmaceuticals",
//     price: 6.0,
//     costPrice: 3.0,
//     stock: 200,
//     imageUrl: "https://placehold.co/400x300/e8f5e9/1e4d2b?text=ORS",
//     active: true,
//     lowStock: false,
//     featured: false,
//     discount: null,
//     variations: [],
//     tags: ["hydration", "diarrhea"],
//     description: "WHO-formula ORS sachets for dehydration management.",
//     showOnStore: true,
//   },
//   {
//     id: 4,
//     name: "Basmati Rice 5kg",
//     category: "Groceries",
//     price: 72.0,
//     costPrice: 55.0,
//     stock: 60,
//     imageUrl: "https://placehold.co/400x300/fff8e1/c8972e?text=Basmati+Rice",
//     active: true,
//     lowStock: false,
//     featured: true,
//     discount: null,
//     variations: [],
//     tags: ["rice", "staple"],
//     description: "Premium long-grain basmati rice, fragrant and fluffy.",
//     showOnStore: true,
//   },
//   {
//     id: 5,
//     name: "Sunflower Cooking Oil 3L",
//     category: "Groceries",
//     price: 55.0,
//     costPrice: 40.0,
//     stock: 45,
//     imageUrl: "https://placehold.co/400x300/fff8e1/c8972e?text=Cooking+Oil",
//     active: true,
//     lowStock: false,
//     featured: false,
//     discount: 5,
//     variations: [],
//     tags: ["oil", "cooking"],
//     description: "Light and healthy sunflower oil for everyday cooking.",
//     showOnStore: true,
//   },
//   {
//     id: 6,
//     name: "Dove Body Wash 500ml",
//     category: "Personal Care",
//     price: 38.0,
//     costPrice: 24.0,
//     stock: 7,
//     imageUrl: "https://placehold.co/400x300/e3f2fd/0c4a6e?text=Body+Wash",
//     active: true,
//     lowStock: true,
//     featured: false,
//     discount: null,
//     variations: [
//       { label: "Scent", options: ["Original", "Shea Butter", "Sensitive"] },
//     ],
//     tags: ["shower", "skin"],
//     description: "Moisturising body wash with ¼ moisturising cream.",
//     showOnStore: true,
//   },
//   {
//     id: 7,
//     name: "Colgate Total Toothpaste 75ml",
//     category: "Personal Care",
//     price: 14.5,
//     costPrice: 9.0,
//     stock: 120,
//     imageUrl: "https://placehold.co/400x300/e3f2fd/0c4a6e?text=Toothpaste",
//     active: true,
//     lowStock: false,
//     featured: false,
//     discount: null,
//     variations: [],
//     tags: ["oral care", "teeth"],
//     description: "12-hour antibacterial protection for whole-mouth health.",
//     showOnStore: true,
//   },
//   {
//     id: 8,
//     name: "Dettol Antiseptic Liquid 500ml",
//     category: "Household",
//     price: 28.0,
//     costPrice: 18.0,
//     stock: 55,
//     imageUrl: "https://placehold.co/400x300/e8f5e9/1e4d2b?text=Dettol",
//     active: true,
//     lowStock: false,
//     featured: true,
//     discount: null,
//     variations: [],
//     tags: ["disinfectant", "hygiene"],
//     description: "Trusted antiseptic for cuts, wounds and household disinfection.",
//     showOnStore: true,
//   },
//   {
//     id: 9,
//     name: "Pampers Active Baby Diapers (Size 3, 40pcs)",
//     category: "Baby & Mother",
//     price: 95.0,
//     costPrice: 68.0,
//     stock: 30,
//     imageUrl: "https://placehold.co/400x300/fce4ec/881337?text=Pampers",
//     active: true,
//     lowStock: false,
//     featured: true,
//     discount: 8,
//     variations: [
//       { label: "Size", options: ["Size 2", "Size 3", "Size 4", "Size 5"] },
//     ],
//     tags: ["diapers", "baby"],
//     description: "Ultra-absorbent diapers for babies 6–10 kg.",
//     showOnStore: true,
//   },
//   {
//     id: 10,
//     name: "Johnson's Baby Lotion 300ml",
//     category: "Baby & Mother",
//     price: 32.0,
//     costPrice: 20.0,
//     stock: 3,
//     imageUrl: "https://placehold.co/400x300/fce4ec/881337?text=Baby+Lotion",
//     active: true,
//     lowStock: true,
//     featured: false,
//     discount: null,
//     variations: [],
//     tags: ["baby skin", "lotion"],
//     description: "Clinically proven gentle lotion for delicate baby skin.",
//     showOnStore: true,
//   },
//   {
//     id: 11,
//     name: "Ibuprofen 400mg (Pack of 16)",
//     category: "Pharmaceuticals",
//     price: 12.0,
//     costPrice: 7.5,
//     stock: 0,
//     imageUrl: "https://placehold.co/400x300/e8f5e9/1e4d2b?text=Ibuprofen",
//     active: false,
//     lowStock: false,
//     featured: false,
//     discount: null,
//     variations: [],
//     tags: ["pain", "anti-inflammatory"],
//     description: "Anti-inflammatory for pain and fever. (Out of stock)",
//     showOnStore: true,
//   },
// ];

// // ── Seed Transactions ─────────────────────────────────────────────────────────
// export const SEED_TRANSACTIONS = [
//   {
//     id: "TX-STORE-001",
//     mod: "storefront",
//     amount: 45.0,
//     staff: "Webstore",
//     date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
//     desc: "Online order ORD-001",
//     lineItems: [
//       { name: "Paracetamol 500mg (Pack of 24)", qty: 2, price: 8.5 },
//       { name: "Dettol Antiseptic Liquid 500ml", qty: 1, price: 28.0 },
//     ],
//     status: "active",
//   },
//   {
//     id: "TX-STORE-002",
//     mod: "storefront",
//     amount: 159.0,
//     staff: "Webstore",
//     date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
//     desc: "Online order ORD-002",
//     lineItems: [
//       { name: "Pampers Active Baby Diapers (Size 3, 40pcs)", qty: 1, price: 95.0 },
//       { name: "Johnson's Baby Lotion 300ml", qty: 2, price: 32.0 },
//     ],
//     status: "active",
//   },
// ];

// // ── Sample Orders ─────────────────────────────────────────────────────────────
// export const SEED_ORDERS = [
//   {
//     id: "ORD-001",
//     reference: "MP-LX2A1B-C3D4",
//     customerName: "Ama Owusu",
//     customerEmail: "ama@example.com",
//     phone: "0244111222",
//     address: "14 Ring Road, Accra",
//     items: [
//       { productId: 1, name: "Paracetamol 500mg (Pack of 24)", quantity: 2, unitPrice: 8.5 },
//       { productId: 8, name: "Dettol Antiseptic Liquid 500ml", quantity: 1, unitPrice: 28.0 },
//     ],
//     total: 45.0,
//     paymentMethod: "momo",
//     paymentReference: "MP-LX2A1B-C3D4",
//     status: "delivered",
//     createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
//   },
//   {
//     id: "ORD-002",
//     reference: "MP-LX5E6F-G7H8",
//     customerName: "Kofi Mensah",
//     customerEmail: "kofi@example.com",
//     phone: "0277333444",
//     address: "5 Tema Station Road, Tema",
//     items: [
//       { productId: 9, name: "Pampers Active Baby Diapers (Size 3, 40pcs)", quantity: 1, unitPrice: 95.0 },
//       { productId: 10, name: "Johnson's Baby Lotion 300ml", quantity: 2, unitPrice: 32.0 },
//     ],
//     total: 159.0,
//     paymentMethod: "card",
//     paymentReference: "MP-LX5E6F-G7H8",
//     status: "processing",
//     createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
//   },
//   {
//     id: "ORD-003",
//     reference: "MP-LX9I0J-K1L2",
//     customerName: "Guest",
//     customerEmail: null,
//     phone: "0200123456",
//     address: "Cape Coast Castle Rd, Cape Coast",
//     items: [
//       { productId: 4, name: "Basmati Rice 5kg", quantity: 2, unitPrice: 72.0 },
//       { productId: 5, name: "Sunflower Cooking Oil 3L", quantity: 1, unitPrice: 55.0 },
//     ],
//     total: 199.0,
//     paymentMethod: "momo",
//     paymentReference: "MP-LX9I0J-K1L2",
//     status: "pending",
//     createdAt: new Date().toISOString(),
//   },
// ];

// // ── Promo Codes ───────────────────────────────────────────────────────────────
// export const PROMO_CODES_KEY = "medpoint_promo_codes";

// export const SEED_PROMO_CODES = [
//   { id: "promo_1", code: "MEDPOINT10", type: "percent", value: 10, active: true, expiresAt: null, minOrder: null, note: "10% welcome discount" },
//   { id: "promo_2", code: "WELCOME5",   type: "percent", value: 5,  active: true, expiresAt: null, minOrder: null, note: "5% new customer discount" },
//   { id: "promo_3", code: "SAVE15",     type: "percent", value: 15, active: true, expiresAt: null, minOrder: 100,  note: "15% off orders over GH₵100" },
//   { id: "promo_4", code: "FREESHIP",   type: "fixed",   value: 10, active: true, expiresAt: null, minOrder: null, note: "GH₵10 off — covers standard delivery fee" },
// ];

// // ── Seed Function ─────────────────────────────────────────────────────────────

// /**
//  * Seeds localStorage with mock data.
//  * Call with force=true to re-seed (e.g. after clearing storage).
//  */
// // Bump this version string whenever seed data changes — forces a re-seed in all browsers.
// const SEED_VERSION = "v7";

// export function seedMockData(force = false) {
//   const storedVersion = localStorage.getItem(MOCK_KEYS.seeded);

//   // Re-seed if forced, never seeded, or seed version is outdated
//   if (!force && storedVersion === SEED_VERSION) return;

//   // Always overwrite all keys so stale/missing data from previous broken
//   // sessions gets replaced with fresh seed data.
//   localStorage.setItem(MOCK_KEYS.customers,    JSON.stringify(SEED_CUSTOMERS));
//   localStorage.setItem(MOCK_KEYS.adminUsers,   JSON.stringify(SEED_ADMINS));
//   localStorage.setItem(MOCK_KEYS.products,     JSON.stringify(SEED_PRODUCTS));
//   localStorage.setItem(MOCK_KEYS.categories,   JSON.stringify(SEED_CATEGORIES));
//   localStorage.setItem(MOCK_KEYS.orders,       JSON.stringify(SEED_ORDERS));
//   localStorage.setItem(MOCK_KEYS.transactions, JSON.stringify(SEED_TRANSACTIONS));
//   localStorage.setItem(PROMO_CODES_KEY,        JSON.stringify(SEED_PROMO_CODES));
//   localStorage.setItem(MOCK_KEYS.seeded,       SEED_VERSION);

//   console.log(`[MockDB] Seeded localStorage with demo data (${SEED_VERSION}).`);
// }

// // ── Storage Helpers ───────────────────────────────────────────────────────────

// export function getAll(key) {
//   try { return JSON.parse(localStorage.getItem(key)) ?? []; }
//   catch { return []; }
// }

// export function setAll(key, data) {
//   localStorage.setItem(key, JSON.stringify(data));
// }

// export function nextId(items) {
//   return items.length > 0 ? Math.max(...items.map((i) => i.id ?? 0)) + 1 : 1;
// }
