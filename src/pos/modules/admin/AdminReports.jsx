import { useState, useEffect, useCallback } from "react";
import { useApp } from "../../AppContext";
import Icon from "../../../shared/components/Icon";
import {
  fetchReport,
  fetchStoreOrderReport,
  fetchHotelReport,
  fetchInventoryReport,
} from "../../services/reportService";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtGHS(n) {
  return `GH₵ ${Number(n ?? 0).toFixed(2)}`;
}

function today()    { return new Date().toISOString().slice(0, 10); }
function thisWeek() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}
function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

const MODULE_OPTIONS = [
  { value: "",           label: "All Modules" },
  { value: "DRUGSTORE",  label: "Drugstore" },
  { value: "MART",       label: "Mart" },
  { value: "HOTEL",      label: "Hotel" },
  { value: "RESTAURANT", label: "Restaurant" },
];

const TABS = [
  { id: "summary",     label: "Summary",      icon: "bar-chart" },
  { id: "daily",       label: "By Day",        icon: "calendar" },
  { id: "monthly",     label: "By Month",      icon: "calendar" },
  { id: "staff",       label: "By Attendant",  icon: "staff" },
  { id: "category",    label: "By Category",   icon: "category" },
  { id: "product",     label: "By Product",    icon: "package" },
  { id: "storeorders", label: "Store Orders",  icon: "clipboard-list" },
  { id: "hotel",       label: "Hotel",         icon: "hotel" },
  { id: "inventory",   label: "Inventory",     icon: "stock" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }) {
  return (
    <div className="rpt-stat-card">
      <div className="rpt-stat-label">{label}</div>
      <div className="rpt-stat-val" style={color ? { color } : undefined}>{value}</div>
      {sub && <div className="rpt-stat-sub">{sub}</div>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rpt-empty">
      <Icon name="bar-chart" size={40} color="var(--g300)" />
      <p>No data for this period</p>
    </div>
  );
}

function LoadingSkel() {
  return (
    <div className="rpt-skel-wrap">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skel" style={{ height: 38, borderRadius: 8, marginBottom: 6 }} />
      ))}
    </div>
  );
}

function GroupTable({ rows, col1 = "Label" }) {
  if (!rows || rows.length === 0) return <EmptyState />;
  return (
    <div className="rpt-tbl-wrap">
      <table className="rpt-tbl">
        <thead>
          <tr>
            <th>{col1}</th>
            <th style={{ textAlign: "right" }}>Count</th>
            <th style={{ textAlign: "right" }}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.label}</td>
              <td style={{ textAlign: "right" }}>{r.count}</td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "var(--pd)" }}>{fmtGHS(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="rpt-tbl-foot">
            <td><strong>Total</strong></td>
            <td style={{ textAlign: "right" }}><strong>{rows.reduce((s, r) => s + r.count, 0)}</strong></td>
            <td style={{ textAlign: "right" }}><strong>{fmtGHS(rows.reduce((s, r) => s + Number(r.revenue ?? 0), 0))}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function ItemTable({ items, col1 = "Product", showStock }) {
  if (!items || items.length === 0) return <EmptyState />;
  return (
    <div className="rpt-tbl-wrap">
      <table className="rpt-tbl">
        <thead>
          <tr>
            <th>{col1}</th>
            <th>Category</th>
            <th style={{ textAlign: "right" }}>{showStock ? "Stock" : "Qty"}</th>
            {!showStock && <th style={{ textAlign: "right" }}>Revenue</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td>{it.name}</td>
              <td style={{ color: "var(--g500)", fontSize: 12 }}>{it.category ?? "—"}</td>
              <td style={{ textAlign: "right", color: showStock && it.stock < 5 ? "#dc2626" : undefined, fontWeight: showStock ? 700 : 400 }}>
                {showStock ? it.stock : it.totalQty}
              </td>
              {!showStock && (
                <td style={{ textAlign: "right", fontWeight: 700, color: "var(--pd)" }}>{fmtGHS(it.totalRevenue)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminReports() {
  const { state } = useApp();
  const users = state.users ?? [];

  // Filters
  const [tab,       setTab]       = useState("summary");
  const [fromDate,  setFromDate]  = useState(thisMonth());
  const [toDate,    setToDate]    = useState(today());
  const [module,    setModule]    = useState("");
  const [staffId,   setStaffId]   = useState("");

  // Data
  const [report,    setReport]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  // Determine groupBy from tab
  const groupByForTab = (t) => {
    if (t === "daily")    return "daily";
    if (t === "monthly")  return "monthly";
    if (t === "staff")    return "staff";
    if (t === "category") return "category";
    if (t === "product")  return "product";
    return "daily"; // summary / fallback
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (tab === "storeorders") {
        data = await fetchStoreOrderReport(fromDate, toDate);
      } else if (tab === "hotel") {
        data = await fetchHotelReport(fromDate, toDate);
      } else if (tab === "inventory") {
        data = await fetchInventoryReport();
      } else {
        data = await fetchReport({
          module:   module || undefined,
          staffId:  staffId || undefined,
          fromDate: fromDate || undefined,
          toDate:   toDate || undefined,
          groupBy:  tab === "summary" ? "daily" : groupByForTab(tab),
        });
      }
      setReport(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, [tab, fromDate, toDate, module, staffId]);

  useEffect(() => { load(); }, [load]);

  const isInventory    = tab === "inventory";
  const isStoreOrders  = tab === "storeorders";
  const isHotel        = tab === "hotel";

  function handlePrint() { window.print(); }

  function applyPeriod(p) {
    const t = today();
    if (p === "today")  { setFromDate(t); setToDate(t); }
    if (p === "week")   { setFromDate(thisWeek()); setToDate(t); }
    if (p === "month")  { setFromDate(thisMonth()); setToDate(t); }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="admin-page rpt-page">

      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reports</h1>
          <p className="admin-page-sub">Generate and print reports for all modules</p>
        </div>
        <button className="rpt-print-btn" onClick={handlePrint}>
          <Icon name="printer" size={15} /> Print
        </button>
      </div>

      {/* Filters */}
      <div className="rpt-filters">
        <div className="rpt-period-btns">
          <button className="rpt-period-btn" onClick={() => applyPeriod("today")}>Today</button>
          <button className="rpt-period-btn" onClick={() => applyPeriod("week")}>This Week</button>
          <button className="rpt-period-btn" onClick={() => applyPeriod("month")}>This Month</button>
        </div>

        {!isInventory && (
          <>
            <div className="rpt-filter-group">
              <label className="rpt-filter-label">From</label>
              <input type="date" className="rpt-filter-input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="rpt-filter-group">
              <label className="rpt-filter-label">To</label>
              <input type="date" className="rpt-filter-input" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </>
        )}

        {!isInventory && !isStoreOrders && !isHotel && (
          <>
            <div className="rpt-filter-group">
              <label className="rpt-filter-label">Module</label>
              <select className="rpt-filter-input" value={module} onChange={e => setModule(e.target.value)}>
                {MODULE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="rpt-filter-group">
              <label className="rpt-filter-label">Attendant</label>
              <select className="rpt-filter-input" value={staffId} onChange={e => setStaffId(e.target.value)}>
                <option value="">All Staff</option>
                {users.filter(u => u.active).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <button className="btn-primary rpt-go-btn" onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Generate"}
        </button>
      </div>

      {/* Tabs */}
      <div className="rpt-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`rpt-tab${tab === t.id ? " rpt-tab-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <p className="rpt-error">{error}</p>}

      {/* Summary cards (always shown for non-inventory) */}
      {!isInventory && report && (
        <div className="rpt-summary-grid">
          <StatCard
            label="Total Revenue"
            value={fmtGHS(report.totalRevenue)}
            color="var(--pd)"
          />
          <StatCard
            label="Transactions"
            value={report.totalTransactions}
            sub={`${report.cancelledCount} cancelled`}
          />
          <StatCard
            label="Cancelled"
            value={report.cancelledCount}
            color="#dc2626"
          />
          <StatCard
            label="Net Revenue"
            value={fmtGHS(report.totalRevenue)}
            sub="Active transactions only"
            color="var(--green, #10b981)"
          />
        </div>
      )}

      {/* Body */}
      <div className="rpt-body">
        {loading ? (
          <LoadingSkel />
        ) : !report ? null : (
          <>
            {/* Summary — daily breakdown */}
            {tab === "summary" && (
              <>
                <h3 className="rpt-section-title">Daily Breakdown</h3>
                <GroupTable rows={report.groups} col1="Date" />
              </>
            )}

            {/* By Day */}
            {tab === "daily" && (
              <>
                <h3 className="rpt-section-title">Revenue by Day</h3>
                <GroupTable rows={report.groups} col1="Date" />
              </>
            )}

            {/* By Month */}
            {tab === "monthly" && (
              <>
                <h3 className="rpt-section-title">Revenue by Month</h3>
                <GroupTable rows={report.groups} col1="Month" />
              </>
            )}

            {/* By Staff */}
            {tab === "staff" && (
              <>
                <h3 className="rpt-section-title">Revenue by Attendant</h3>
                <GroupTable rows={report.groups} col1="Attendant" />
              </>
            )}

            {/* By Category */}
            {tab === "category" && (
              <>
                <h3 className="rpt-section-title">Revenue by Category</h3>
                <GroupTable rows={report.groups} col1="Category" />
                {report.topItems?.length > 0 && (
                  <>
                    <h3 className="rpt-section-title" style={{ marginTop: 24 }}>Top Categories</h3>
                    <ItemTable items={report.topItems} col1="Category" />
                  </>
                )}
              </>
            )}

            {/* By Product */}
            {tab === "product" && (
              <>
                <h3 className="rpt-section-title">Top Products / Items</h3>
                <ItemTable items={report.topItems ?? report.groups?.map(g => ({ name: g.label, totalQty: g.count, totalRevenue: g.revenue })) ?? []} col1="Product" />
              </>
            )}

            {/* Store Orders */}
            {tab === "storeorders" && (
              <>
                <h3 className="rpt-section-title">Store Orders by Status</h3>
                <GroupTable rows={report.groups} col1="Status" />
              </>
            )}

            {/* Hotel */}
            {tab === "hotel" && (
              <>
                <h3 className="rpt-section-title">Bookings by Room Category</h3>
                <GroupTable rows={report.groups} col1="Room Category" />
              </>
            )}

            {/* Inventory */}
            {tab === "inventory" && (
              <>
                <h3 className="rpt-section-title">Low Stock & Expiring Items</h3>
                {report.topItems?.length === 0
                  ? <div className="rpt-empty"><Icon name="check-circle" size={36} color="var(--green, #10b981)" /><p>All items are well-stocked!</p></div>
                  : <ItemTable items={report.topItems} col1="Item" showStock />
                }
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
