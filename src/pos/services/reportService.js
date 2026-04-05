import api from "../../shared/services/api";

function buildParams(obj) {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => { if (v != null && v !== "") p.set(k, v); });
  return p.toString();
}

/** GET /admin/reports — transaction-based report with groupBy */
export async function fetchReport({ module, staffId, fromDate, toDate, groupBy } = {}) {
  const qs = buildParams({ module, staffId, fromDate, toDate, groupBy });
  const { data } = await api.get(`/admin/reports${qs ? "?" + qs : ""}`);
  return data;
}

/** GET /admin/reports/store-orders */
export async function fetchStoreOrderReport(fromDate, toDate) {
  const qs = buildParams({ fromDate, toDate });
  const { data } = await api.get(`/admin/reports/store-orders${qs ? "?" + qs : ""}`);
  return data;
}

/** GET /admin/reports/hotel */
export async function fetchHotelReport(fromDate, toDate) {
  const qs = buildParams({ fromDate, toDate });
  const { data } = await api.get(`/admin/reports/hotel${qs ? "?" + qs : ""}`);
  return data;
}

/** GET /admin/reports/inventory */
export async function fetchInventoryReport() {
  const { data } = await api.get("/admin/reports/inventory");
  return data;
}
