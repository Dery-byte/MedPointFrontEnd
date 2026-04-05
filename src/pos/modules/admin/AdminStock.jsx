import { useState, useEffect } from "react";
import { useAdminData } from "../../hooks/useAdminData";
import { stockDisplay } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";
import { LOW_STOCK } from "../../constants";
import Icon from "../../../shared/components/Icon";
import { exportToExcel } from "../../utils/excelUtils";
import NoModulesBanner from "../../components/NoModulesBanner";

function expiryStatus(expiry) {
  if (!expiry) return null;
  const now = new Date();
  const exp = new Date(expiry);
  const diffDays = Math.round((exp - now) / 86400000);
  if (diffDays < 0) return { label: "Expired", cls: "stk-lo", urgent: true };
  if (diffDays <= 30) return { label: `Exp. ${diffDays}d`, cls: "stk-lo", urgent: true };
  if (diffDays <= 90) return { label: `Exp. ${diffDays}d`, cls: "stk-med", urgent: false };
  return { label: new Date(expiry).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), cls: "stk-ok", urgent: false };
}

function StockCell({ n }) {
  const s = stockDisplay(n);
  return <span className={s.cls}>{s.label}</span>;
}

export default function AdminStock() {
  const { drugs, products, enabledModules } = useAdminData();

  // Build the list of visible tabs based on enabled modules
  const stockTabs = [
    enabledModules.includes("drugstore") && { key: "drugs", label: "Drug Store", icon: "drugstore" },
    enabledModules.includes("mart")      && { key: "mart",  label: "Mart",       icon: "mart"      },
  ].filter(Boolean);

  const [activeTab, setActiveTab] = useState(stockTabs[0]?.key ?? "drugs");
  const [filter, setFilter]       = useState("all");      // all | low | expiring

  // If the active tab's module gets disabled mid-session, fall back to the first available tab
  useEffect(() => {
    if (!stockTabs.some(t => t.key === activeTab)) {
      setActiveTab(stockTabs[0]?.key ?? "drugs");
      if (filter === "expiring") setFilter("all");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledModules]);

  // No-modules guard
  if (stockTabs.length === 0) {
    return (
      <div>
        <div className="pg-hd-row" style={{ marginBottom: 4 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="stock" size={22} color="var(--p)" />Stock Overview
          </h2>
        </div>
        <NoModulesBanner />
      </div>
    );
  }

  const lowDrugs    = drugs.filter(d => d.stock < LOW_STOCK);
  const lowProducts = products.filter(p => p.stock < LOW_STOCK);
  const totalLow    = lowDrugs.length + lowProducts.length;

  // Use real expiryDate from drug entity
  const expiringDrugs = drugs.filter(d => expiryStatus(d.expiryDate)?.urgent);

  // Apply filters
  const filteredDrugs = filter === "low"
    ? drugs.filter(d => d.stock < LOW_STOCK)
    : filter === "expiring"
      ? drugs.filter(d => expiryStatus(d.expiryDate)?.urgent)
      : drugs;

  const filteredProducts = filter === "low"
    ? products.filter(p => p.stock < LOW_STOCK)
    : products; // no expiry for mart products

  const currentItems = activeTab === "drugs" ? filteredDrugs : filteredProducts;
  const isExpiring   = filter === "expiring" && activeTab === "drugs";

  const filterOptions = [
    { key: "all",      icon: "stock",   label: "All Items" },
    { key: "low",      icon: "warning", label: `Low Stock${totalLow > 0 ? ` (${totalLow})` : ""}` },
    ...(activeTab === "drugs"
      ? [{ key: "expiring", icon: "tag", label: `Expiring Soon${expiringDrugs.length > 0 ? ` (${expiringDrugs.length})` : ""}` }]
      : []),
  ];

  const handleExportStock = () => {
    const isDrugs = activeTab === "drugs";
    const rows = currentItems.map(item => {
      const base = { name: item.name, category: item.cat, price: item.price, stock: item.stock };
      if (isDrugs) {
        const exp = expiryStatus(item.expiryDate);
        base.expiryDate   = item.expiryDate || "";
        base.expiryStatus = exp ? exp.label : "OK";
      }
      return base;
    });
    const columns = isDrugs
      ? ["name", "category", "price", "stock", "expiryDate", "expiryStatus"]
      : ["name", "category", "price", "stock"];
    const headers = isDrugs
      ? ["Name", "Category", "Price (GH₵)", "Stock", "Expiry Date", "Expiry Status"]
      : ["Name", "Category", "Price (GH₵)", "Stock"];
    const label = filter !== "all" ? `-${filter}` : "";
    exportToExcel({
      rows, columns, headers,
      filename: `${isDrugs ? "drug" : "mart"}-stock${label}.xlsx`,
      sheetName: isDrugs ? "Drug Store" : "Mart",
    });
  };

  return (
    <div>
      <div className="pg-hd-row" style={{ marginBottom: 4 }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="stock" size={22} color="var(--p)" />Stock Overview
        </h2>
        <button className="btn btn-sec btn-sm" onClick={handleExportStock}>
          ⬇ Export to Excel
        </button>
      </div>
      <p style={{ color: "var(--g400)", fontSize: 14, marginBottom: 20 }}>Monitor inventory levels and expiry dates</p>

      {totalLow > 0 && (
        <div className="low-stock-alert" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Icon name="warning" size={15} color="var(--red)" />
          <span><strong>{totalLow} item{totalLow !== 1 ? "s" : ""}</strong> critically low — {lowDrugs.length} drug{lowDrugs.length !== 1 ? "s" : ""}, {lowProducts.length} mart product{lowProducts.length !== 1 ? "s" : ""}.</span>
        </div>
      )}

      {/* Tab + Filter row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        {/* Store tabs — only rendered when more than one module is enabled */}
        {stockTabs.length > 1 && (
          <div className="ptabs" style={{ margin: 0 }}>
            {stockTabs.map(tab => {
              const count = tab.key === "drugs" ? drugs.length : products.length;
              return (
                <button
                  key={tab.key}
                  className={`ptab ${activeTab === tab.key ? "on" : ""}`}
                  onClick={() => { setActiveTab(tab.key); if (filter === "expiring") setFilter("all"); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Icon name={tab.icon} size={14} />{tab.label}
                  <span style={{ marginLeft: 4, background: activeTab === tab.key ? "rgba(255,255,255,.25)" : "var(--g200)", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {stockTabs.length === 1 && <div />}

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8 }}>
          {filterOptions.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 14px", borderRadius: 20, border: "1.5px solid",
                fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .15s",
                borderColor: filter === f.key
                  ? (f.key === "low" || f.key === "expiring" ? "var(--red)" : "var(--p)")
                  : "var(--g200)",
                background: filter === f.key
                  ? (f.key === "low" || f.key === "expiring" ? "var(--redl)" : "var(--pal)")
                  : "var(--white)",
                color: filter === f.key
                  ? (f.key === "low" || f.key === "expiring" ? "var(--red)" : "var(--pd)")
                  : "var(--g500)",
              }}
            >
              <Icon
                name={f.icon}
                size={13}
                color={filter === f.key ? (f.key === "low" || f.key === "expiring" ? "var(--red)" : "var(--pd)") : "var(--g400)"}
              />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader
          title={
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name={activeTab === "drugs" ? "drugstore" : "mart"} size={15} color="var(--g600)" />
              {activeTab === "drugs" ? "Drug Store Stock" : "Mart Stock"}
              <span style={{ fontSize: 12, color: "var(--g400)", fontWeight: 600 }}>
                — {currentItems.length} item{currentItems.length !== 1 ? "s" : ""}
                {filter !== "all" && ` (${filter === "low" ? "low stock" : "expiring soon"})`}
              </span>
            </span>
          }
        />
        <CardBody noPad>
          {currentItems.length === 0 ? (
            <div className="nores" style={{ padding: 32 }}>
              <Icon name="checkmark" size={28} color="var(--green)" style={{ display: "block", margin: "0 auto 8px" }} />
              {filter === "low" ? "No low-stock items — all good!" : "No expiring items in this period."}
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Stock</th>
                  {(isExpiring || (activeTab === "drugs" && filter === "all")) && <th>Expiry</th>}
                </tr>
              </thead>
              <tbody>
                {currentItems.map(item => {
                  const expiry = activeTab === "drugs" ? expiryStatus(item.expiryDate) : null;
                  const isLow  = item.stock < LOW_STOCK;
                  const showExpiry = isExpiring || (activeTab === "drugs" && filter === "all");
                  return (
                    <tr key={item.id} style={isLow ? { background: "var(--redl)" } : expiry?.urgent ? { background: "var(--ambl)" } : {}}>
                      <td><strong>{item.name}</strong></td>
                      <td style={{ color: "var(--g500)" }}>{item.cat}</td>
                      <td><StockCell n={item.stock} /></td>
                      {showExpiry && (
                        <td>
                          {expiry ? (
                            <span className={expiry.cls} style={{ fontSize: 12 }}>{expiry.label}</span>
                          ) : (
                            <span style={{ color: "var(--g300)", fontSize: 12 }}>—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
