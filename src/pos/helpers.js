export const fmt = (n) => "GH₵" + Number(n).toFixed(2);
export const dateStr = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
export const timeStr = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
export const rxNo = () => "RX-" + Date.now().toString().slice(-6);
export const nights = (ci, co) => Math.max(1, Math.round((new Date(co) - new Date(ci)) / 86400000));

export const modLabel = (m) => ({ admin: "Admin", drugstore: "Drug Store", mart: "Mart", hotel: "Hotel", restaurant: "Restaurant & Bar", storefront: "Store" }[m] || m);
export const modIcon = (m) => ({ admin: "admin", drugstore: "drugstore", mart: "mart", hotel: "hotel", restaurant: "restaurant", storefront: "shopping-bag" }[m] || "building");

// Store-specific receipt messages
export const storeThankYou = (mod) => ({
  drugstore: { msg: "Thank you for choosing MedPoint Drug Store!", sub: "Your health is our priority. Get well soon." },
  mart:       { msg: "Thank you for shopping at MedPoint Mart!", sub: "We appreciate your patronage. Come again!" },
  hotel:      { msg: "Thank you for staying at MedPoint Hotel!", sub: "We hope you enjoyed your stay. See you soon." },
  restaurant: { msg: "Thank you for dining at MedPoint Restaurant & Bar!", sub: "We hope you enjoyed your meal. Bon appétit!" },
}[mod] || { msg: "Thank you for choosing MedPoint!", sub: "Your satisfaction is our priority." });

export const stockDisplay = (n) => {
  if (n <= 0) return { label: "Out of Stock", cls: "stk-lo" };
  if (n < 10) return { label: `Low: ${n}`, cls: "stk-lo" };
  if (n < 20) return { label: String(n), cls: "stk-med" };
  return { label: String(n), cls: "stk-ok" };
};

export const roleBadgeClass = (role) => ({ superadmin: "rb-super", manager: "rb-manager", staff: "rb-staff" }[role] || "rb-staff");
export const roleLabel = (role) => ({ superadmin: "Super Admin", manager: "Manager", staff: "Staff" }[role] || role);

export const seedInitialData = () => {
  const today = new Date();
  const ci = new Date(today); ci.setDate(ci.getDate() - 2);
  const co = new Date(today); co.setDate(co.getDate() + 1);

  const bookings = [
    { rid: "102", guestName: "Mr. Kofi Asante" },
    { rid: "202", guestName: "Ms. Ama Owusu" },
  ].map((b, i) => ({
    id: `BK-${i + 1}`,
    roomId: b.rid,
    guestName: b.guestName,
    checkIn: ci.toISOString().split("T")[0],
    checkOut: co.toISOString().split("T")[0],
    extras: [],
    paid: false,
  }));

  const orders = [3, 6].map((tid, i) => ({
    id: `ORD-${i + 1}`,
    tableId: tid,
    items: [
      { id: 504, name: "Jollof Rice & Chicken", price: 8.50, qty: 2, type: "food" },
      { id: 601, name: "Coca-Cola", price: 2.00, qty: 2, type: "drink" },
    ],
    status: "open",
  }));

  const transactions = [
    { id: "TX-1", mod: "drugstore", amount: 12.50, staff: "Pharma Manager", date: today.toISOString(), desc: "Drug Dispense", status: "active",
      lineItems: [{ name: "Paracetamol 500mg", qty: 10, price: 0.50, cat: "Analgesic" }, { name: "Vitamin C 1000mg", qty: 5, price: 0.60, cat: "Supplement" }, { name: "Aspirin 75mg", qty: 6, price: 0.30, cat: "Analgesic" }] },
    { id: "TX-2", mod: "mart", amount: 34.70, staff: "Mart Attendant", date: today.toISOString(), desc: "Mart Sale", status: "active",
      lineItems: [{ name: "Jasmine Rice 5kg", qty: 2, price: 8.50, cat: "Groceries" }, { name: "Cooking Oil 2L", qty: 1, price: 4.20, cat: "Groceries" }, { name: "Coca-Cola 1.5L", qty: 3, price: 2.50, cat: "Beverages" }, { name: "Bottled Water 1.5L", qty: 4, price: 0.80, cat: "Beverages" }] },
    { id: "TX-3", mod: "hotel", amount: 160, staff: "Hotel Receptionist", date: today.toISOString(), desc: "Room 102 checkout - Mr. Kofi Asante", status: "active",
      lineItems: [{ name: "Room 102 (Standard) - 2 nights", qty: 2, price: 50, cat: "Accommodation" }, { name: "Breakfast (1 person)", qty: 2, price: 10, cat: "Extra" }] },
    { id: "TX-4", mod: "restaurant", amount: 24.50, staff: "Restaurant Staff", date: today.toISOString(), desc: "Table 4 — 4 items", status: "active",
      lineItems: [{ name: "Jollof Rice & Chicken", qty: 2, price: 8.50, cat: "Main Course" }, { name: "Coca-Cola", qty: 2, price: 2.00, cat: "Soft Drinks" }, { name: "Spring Rolls", qty: 1, price: 3.50, cat: "Starters" }] },
  ];

  return { bookings, orders, transactions };
};
