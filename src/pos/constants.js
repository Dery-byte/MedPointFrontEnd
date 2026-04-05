export const DRUGS = [
  { id: 1, name: "Paracetamol 500mg", cat: "Analgesic", price: 0.50, stock: 120 },
  { id: 2, name: "Amoxicillin 250mg", cat: "Antibiotic", price: 1.20, stock: 80 },
  { id: 3, name: "Ibuprofen 400mg", cat: "Anti-inflammatory", price: 0.80, stock: 95 },
  { id: 4, name: "Metformin 500mg", cat: "Antidiabetic", price: 0.90, stock: 60 },
  { id: 5, name: "Omeprazole 20mg", cat: "Antacid", price: 1.50, stock: 45 },
  { id: 6, name: "Chloroquine 250mg", cat: "Antimalarial", price: 1.00, stock: 8 },
  { id: 7, name: "Ciprofloxacin 500mg", cat: "Antibiotic", price: 2.00, stock: 55 },
  { id: 8, name: "Vitamin C 1000mg", cat: "Supplement", price: 0.60, stock: 200 },
  { id: 9, name: "Zinc Sulfate 20mg", cat: "Supplement", price: 0.70, stock: 150 },
  { id: 10, name: "Folic Acid 5mg", cat: "Supplement", price: 0.40, stock: 180 },
  { id: 11, name: "Doxycycline 100mg", cat: "Antibiotic", price: 1.80, stock: 7 },
  { id: 12, name: "Aspirin 75mg", cat: "Analgesic", price: 0.30, stock: 300 },
  { id: 13, name: "Metronidazole 200mg", cat: "Antibiotic", price: 0.85, stock: 90 },
  { id: 14, name: "Artemether 20mg", cat: "Antimalarial", price: 2.50, stock: 5 },
  { id: 15, name: "Lisinopril 5mg", cat: "Antihypertensive", price: 1.10, stock: 40 },
  { id: 16, name: "Atenolol 50mg", cat: "Antihypertensive", price: 0.95, stock: 35 },
];

export const SERVICES = [
  { id: 101, name: "General Consultation", cat: "Consultation", price: 10 },
  { id: 102, name: "Blood Pressure Check", cat: "Diagnostic", price: 5 },
  { id: 103, name: "Blood Sugar Test", cat: "Diagnostic", price: 8 },
  { id: 104, name: "Malaria RDT Test", cat: "Diagnostic", price: 6 },
  { id: 105, name: "Pregnancy Test", cat: "Diagnostic", price: 5 },
  { id: 106, name: "Wound Dressing", cat: "Treatment", price: 15 },
  { id: 107, name: "Injection Administration", cat: "Treatment", price: 3 },
  { id: 108, name: "IV Drip Setup", cat: "Treatment", price: 20 },
  { id: 109, name: "Eye Examination", cat: "Consultation", price: 12 },
  { id: 110, name: "Ear Irrigation", cat: "Treatment", price: 8 },
];

export const NONDRUGS = [
  { id: 201, name: "Gloves (pair)", cat: "Consumable", price: 0.50 },
  { id: 202, name: "Syringe 5ml", cat: "Consumable", price: 0.30 },
  { id: 203, name: "IV Cannula", cat: "Consumable", price: 1.00 },
  { id: 204, name: "Gauze Roll", cat: "Consumable", price: 0.80 },
  { id: 205, name: "Bandage 5cm", cat: "Consumable", price: 0.60 },
  { id: 206, name: "Alcohol Swabs (10)", cat: "Consumable", price: 0.50 },
  { id: 207, name: "IV Fluid 500ml", cat: "Fluid", price: 3.50 },
  { id: 208, name: "Blood Collection Tube", cat: "Diagnostic", price: 1.20 },
];

export const PRODUCTS = [
  { id: 301, name: "Jasmine Rice 5kg", cat: "Groceries", price: 8.50, stock: 40 },
  { id: 302, name: "Cooking Oil 2L", cat: "Groceries", price: 4.20, stock: 25 },
  { id: 303, name: "White Sugar 1kg", cat: "Groceries", price: 1.80, stock: 60 },
  { id: 304, name: "Table Salt 500g", cat: "Groceries", price: 0.70, stock: 8 },
  { id: 305, name: "Wheat Flour 2kg", cat: "Groceries", price: 3.50, stock: 30 },
  { id: 306, name: "Coca-Cola 1.5L", cat: "Beverages", price: 2.50, stock: 48 },
  { id: 307, name: "Malt Drink 330ml", cat: "Beverages", price: 1.20, stock: 9 },
  { id: 308, name: "Bottled Water 1.5L", cat: "Beverages", price: 0.80, stock: 100 },
  { id: 309, name: "Fruit Juice 1L", cat: "Beverages", price: 2.80, stock: 35 },
  { id: 310, name: "Bar Soap 200g", cat: "Household", price: 1.50, stock: 6 },
  { id: 311, name: "Washing Powder 1kg", cat: "Household", price: 3.20, stock: 22 },
  { id: 312, name: "Bleach 1L", cat: "Household", price: 1.80, stock: 18 },
  { id: 313, name: "Toothpaste 150g", cat: "Personal Care", price: 2.20, stock: 30 },
  { id: 314, name: "Shampoo 400ml", cat: "Personal Care", price: 4.50, stock: 4 },
  { id: 315, name: "Body Lotion 400ml", cat: "Personal Care", price: 5.00, stock: 15 },
  { id: 316, name: "USB Charger", cat: "Electronics", price: 6.00, stock: 12 },
  { id: 317, name: "Earphones", cat: "Electronics", price: 8.00, stock: 7 },
  { id: 318, name: "Power Bank 10000mAh", cat: "Electronics", price: 22.00, stock: 5 },
];

export const ROOM_CATS = [
  { name: "Standard", price: 50, icon: "hotel" },
  { name: "Deluxe", price: 80, icon: "hotel" },
  { name: "Suite", price: 150, icon: "hotel" },
];

export const MENU_ITEMS = [
  { id: 501, name: "Spring Rolls", cat: "Starters", type: "food", price: 3.50 },
  { id: 502, name: "Chicken Wings", cat: "Starters", type: "food", price: 5.00 },
  { id: 503, name: "Garden Salad", cat: "Starters", type: "food", price: 4.00 },
  { id: 504, name: "Jollof Rice & Chicken", cat: "Main Course", type: "food", price: 8.50 },
  { id: 505, name: "Grilled Tilapia & Rice", cat: "Main Course", type: "food", price: 10.00 },
  { id: 506, name: "Fried Rice & Beef", cat: "Main Course", type: "food", price: 9.00 },
  { id: 507, name: "Banku & Okro Stew", cat: "Main Course", type: "food", price: 7.00 },
  { id: 508, name: "Fufu & Light Soup", cat: "Main Course", type: "food", price: 6.50 },
  { id: 509, name: "Club Sandwich", cat: "Snacks", type: "food", price: 5.50 },
  { id: 510, name: "Meat Pie", cat: "Snacks", type: "food", price: 2.50 },
  { id: 511, name: "Chocolate Cake", cat: "Desserts", type: "food", price: 4.00 },
  { id: 512, name: "Ice Cream (2 scoops)", cat: "Desserts", type: "food", price: 3.50 },
  { id: 601, name: "Coca-Cola", cat: "Soft Drinks", type: "drink", price: 2.00 },
  { id: 602, name: "Sprite", cat: "Soft Drinks", type: "drink", price: 2.00 },
  { id: 603, name: "Bottled Water", cat: "Soft Drinks", type: "drink", price: 1.00 },
  { id: 604, name: "Malt Drink", cat: "Soft Drinks", type: "drink", price: 2.50 },
  { id: 605, name: "Fresh Fruit Juice", cat: "Soft Drinks", type: "drink", price: 4.00 },
  { id: 606, name: "Beer (330ml)", cat: "Alcoholic", type: "drink", price: 5.00 },
  { id: 607, name: "Red Wine (glass)", cat: "Alcoholic", type: "drink", price: 8.00 },
  { id: 608, name: "Whiskey (shot)", cat: "Alcoholic", type: "drink", price: 10.00 },
  { id: 609, name: "Gin & Tonic", cat: "Alcoholic", type: "drink", price: 7.00 },
  { id: 610, name: "Espresso", cat: "Hot Drinks", type: "drink", price: 3.00 },
  { id: 611, name: "English Tea", cat: "Hot Drinks", type: "drink", price: 2.00 },
  { id: 612, name: "Hot Chocolate", cat: "Hot Drinks", type: "drink", price: 3.50 },
];

export const ROOM_EXTRAS = [
  { id: 701, name: "Room Service Meal", price: 12.00 },
  { id: 702, name: "Laundry Service", price: 8.00 },
  { id: 703, name: "Airport Shuttle", price: 25.00 },
  { id: 704, name: "Minibar Drinks", price: 15.00 },
  { id: 705, name: "Spa Treatment", price: 40.00 },
  { id: 706, name: "Extra Towels", price: 3.00 },
  { id: 707, name: "Breakfast (1 person)", price: 10.00 },
  { id: 708, name: "Late Checkout Fee", price: 20.00 },
];

export const LOW_STOCK = 10;

export const INITIAL_USERS = [
  { id: 1, name: "Super Admin", email: "admin@medpoint.com", password: "admin123", role: "superadmin", modules: ["drugstore", "mart", "hotel", "restaurant"], active: true },
  { id: 2, name: "Pharma Manager", email: "pharma@medpoint.com", password: "pass123", role: "manager", modules: ["drugstore"], active: true },
  { id: 3, name: "Mart Attendant", email: "mart@medpoint.com", password: "pass123", role: "staff", modules: ["mart"], active: true },
  { id: 4, name: "Hotel Receptionist", email: "hotel@medpoint.com", password: "pass123", role: "manager", modules: ["hotel"], active: true },
  { id: 5, name: "Restaurant Staff", email: "resto@medpoint.com", password: "pass123", role: "staff", modules: ["restaurant"], active: true },
];

export const INITIAL_ROOMS = [
  { id: "101", cat: "Standard", price: 50, occ: false, booking: null },
  { id: "102", cat: "Standard", price: 50, occ: true, booking: null },
  { id: "103", cat: "Standard", price: 50, occ: false, booking: null },
  { id: "104", cat: "Standard", price: 50, occ: false, booking: null },
  { id: "201", cat: "Deluxe", price: 80, occ: false, booking: null },
  { id: "202", cat: "Deluxe", price: 80, occ: true, booking: null },
  { id: "203", cat: "Deluxe", price: 80, occ: false, booking: null },
  { id: "204", cat: "Deluxe", price: 80, occ: false, booking: null },
  { id: "301", cat: "Suite", price: 150, occ: false, booking: null },
  { id: "302", cat: "Suite", price: 150, occ: false, booking: null },
];

export const INITIAL_TABLES = [
  { id: 1, occ: false, orderId: null },
  { id: 2, occ: false, orderId: null },
  { id: 3, occ: true, orderId: null },
  { id: 4, occ: false, orderId: null },
  { id: 5, occ: false, orderId: null },
  { id: 6, occ: true, orderId: null },
  { id: 7, occ: false, orderId: null },
  { id: 8, occ: false, orderId: null },
];
