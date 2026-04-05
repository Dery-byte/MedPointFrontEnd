/**
 * excelUtils.js
 * Excel import/export helpers using SheetJS (xlsx) loaded from CDN.
 * We load it lazily the first time it's needed.
 */

let XLSX = null;

async function loadXLSX() {
  if (XLSX) return XLSX;
  return new Promise((resolve, reject) => {
    if (window.XLSX) { XLSX = window.XLSX; return resolve(XLSX); }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => { XLSX = window.XLSX; resolve(XLSX); };
    script.onerror = () => reject(new Error("Failed to load XLSX library"));
    document.head.appendChild(script);
  });
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

/**
 * Export an array of objects to an .xlsx file download.
 * @param {Object[]} rows       - Data rows (array of plain objects)
 * @param {string[]} columns    - Ordered column keys to include
 * @param {string[]} headers    - Display header labels (same order as columns)
 * @param {string}   filename   - e.g. "drug-stock.xlsx"
 * @param {string}   sheetName  - Sheet tab label
 */
export async function exportToExcel({ rows, columns, headers, filename, sheetName = "Sheet1" }) {
  const xl = await loadXLSX();

  // Build header row + data rows
  const wsData = [
    headers,
    ...rows.map(r => columns.map(k => r[k] ?? "")),
  ];

  const ws = xl.utils.aoa_to_sheet(wsData);

  // Auto-width columns
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map(r => String(r[columns[i]] ?? "").length)
    );
    return { wch: Math.min(maxLen + 4, 40) };
  });
  ws["!cols"] = colWidths;

  const wb = xl.utils.book_new();
  xl.utils.book_append_sheet(wb, ws, sheetName);
  xl.writeFile(wb, filename);
}

// ─── IMPORT ──────────────────────────────────────────────────────────────────

/**
 * Parse an uploaded .xlsx / .xls / .csv file.
 * Returns { headers: string[], rows: Object[] }
 * where each row is { header: value, ... } using the first sheet's first row as headers.
 *
 * @param {File} file
 * @returns {Promise<{ headers: string[], rows: Object[] }>}
 */
export async function parseExcelFile(file) {
  const xl = await loadXLSX();
  const buffer = await file.arrayBuffer();
  const wb = xl.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = xl.utils.sheet_to_json(ws, { header: 1, defval: "" });

  if (!raw.length) return { headers: [], rows: [] };

  const headers = raw[0].map(h => String(h).trim());
  const rows = raw.slice(1)
    .filter(r => r.some(cell => cell !== ""))   // skip blank rows
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = r[i] ?? ""; });
      return obj;
    });

  return { headers, rows };
}

// ─── TEMPLATE GENERATORS ────────────────────────────────────────────────────

/**
 * Download a blank template .xlsx for drug import.
 */
export async function downloadDrugTemplate() {
  await exportToExcel({
    rows: [
      { name: "Paracetamol 500mg", category: "Analgesic", price: 5.00, stock: 100, expiryDate: "2026-12-31" },
      { name: "Amoxicillin 250mg", category: "Antibiotic", price: 12.50, stock: 50,  expiryDate: "2027-06-30" },
    ],
    columns: ["name", "category", "price", "stock", "expiryDate"],
    headers: ["Name", "Category", "Price (GH₵)", "Stock", "Expiry Date (YYYY-MM-DD)"],
    filename: "drug-import-template.xlsx",
    sheetName: "Drugs",
  });
}

/**
 * Download a blank template .xlsx for mart product import.
 */
export async function downloadMartTemplate() {
  await exportToExcel({
    rows: [
      { name: "Jasmine Rice 5kg", category: "Grains", "Selling Price": 55.00, "Cost Price": 12.00, stock: 30 },
      { name: "Cooking Oil 1L",   category: "Oils",   "Selling Price": 55.00, "Cost Price": 22.00, stock: 60 },
    ],
    columns: ["name", "category", "Selling Price", "Cost Price", "stock"],
    headers: ["Name", "Category", "Selling Price (GH₵)", "Cost Price (GH₵)", "Stock"],
    filename: "mart-import-template.xlsx",
    sheetName: "Products",
  });
}
