// import { useState, useMemo } from "react";
// import { useApp } from "../../AppContext";
// import { fmt, modIcon, modLabel } from "../../helpers";
// import Badge from "../../components/Badge";
// import { Card, CardBody } from "../../components/Card";
// import Icon from "../../../shared/components/Icon";

// const TABS = ["all", "drugstore", "mart", "hotel", "restaurant"];
// const MOD_COLORS = { drugstore: "#0891b2", mart: "#10b981", hotel: "#f59e0b", restaurant: "#8b5cf6" };

// function timeAgo(dateStr) {
//   const diff = Date.now() - new Date(dateStr);
//   const mins = Math.floor(diff / 60000);
//   if (mins < 1)  return "Just now";
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24)  return `${hrs}h ago`;
//   return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
// }

// function LineItemsPanel({ tx, onCancel, me }) {
//   const [confirming, setConfirming] = useState(false);
//   const isCancelled = tx.status === "cancelled";
//   const canCancel = !isCancelled && (me?.role === "superadmin" || me?.role === "manager");

//   return (
//     <div style={{ padding: "12px 16px 14px", background: "var(--g50)", borderTop: "1px solid var(--g100)" }}>
//       {/* Line items table */}
//       <div style={{ fontSize: 11, fontWeight: 800, color: "var(--g400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
//         Items / Services
//       </div>
//       {tx.lineItems && tx.lineItems.length > 0 ? (
//         <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
//           <thead>
//             <tr style={{ borderBottom: "1px solid var(--g200)" }}>
//               {["Item / Service", "Category", "Qty", "Unit Price", "Subtotal"].map(h => (
//                 <th key={h} style={{ padding: "4px 8px", textAlign: h === "Qty" || h === "Unit Price" || h === "Subtotal" ? "right" : "left", fontSize: 11, fontWeight: 700, color: "var(--g500)" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {tx.lineItems.map((item, i) => (
//               <tr key={i} style={{ borderBottom: "1px solid var(--g100)" }}>
//                 <td style={{ padding: "6px 8px", fontSize: 13, fontWeight: 600 }}>
//                   {item.type === "service"
//                     ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="service" size={12} color="var(--pd)" />{item.name}</span>
//                     : item.name}
//                 </td>
//                 <td style={{ padding: "6px 8px", fontSize: 12, color: "var(--g400)" }}>{item.cat || "—"}</td>
//                 <td style={{ padding: "6px 8px", fontSize: 13, textAlign: "right", color: "var(--g600)" }}>{item.qty}</td>
//                 <td style={{ padding: "6px 8px", fontSize: 13, textAlign: "right", color: "var(--g600)" }}>{fmt(item.price)}</td>
//                 <td style={{ padding: "6px 8px", fontSize: 13, textAlign: "right", fontWeight: 700, color: "var(--pd)" }}>{fmt(item.price * item.qty)}</td>
//               </tr>
//             ))}
//           </tbody>
//           <tfoot>
//             <tr style={{ borderTop: "2px solid var(--g200)" }}>
//               <td colSpan={4} style={{ padding: "6px 8px", fontSize: 13, fontWeight: 800, color: "var(--g700)" }}>Total</td>
//               <td style={{ padding: "6px 8px", fontSize: 14, fontWeight: 900, textAlign: "right", color: "var(--pd)" }}>{fmt(tx.amount)}</td>
//             </tr>
//           </tfoot>
//         </table>
//       ) : (
//         <div style={{ fontSize: 13, color: "var(--g400)", marginBottom: 12, fontStyle: "italic" }}>No line item details recorded for this transaction.</div>
//       )}

//       {/* Cancellation section */}
//       {isCancelled ? (
//         <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--red)", background: "var(--redl)", borderRadius: 8, padding: "8px 12px" }}>
//           <Icon name="close" size={14} color="var(--red)" />
//           <span>Cancelled by <strong>{tx.cancelledBy}</strong> · {new Date(tx.cancelledAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
//         </div>
//       ) : canCancel ? (
//         confirming ? (
//           <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--redl)", borderRadius: 8, padding: "10px 14px", border: "1px solid #fecaca" }}>
//             <Icon name="warning" size={15} color="var(--red)" />
//             <span style={{ fontSize: 13, color: "var(--red)", flex: 1 }}>
//               <strong>Cancel this transaction?</strong> Stock will be restored for Drug Store and Mart items.
//             </span>
//             <button className="btn btn-danger btn-sm" onClick={() => { onCancel(tx.id); setConfirming(false); }}>Yes, Cancel</button>
//             <button className="btn btn-sec btn-sm" onClick={() => setConfirming(false)}>No</button>
//           </div>
//         ) : (
//           <button
//             className="btn btn-sec btn-sm"
//             onClick={() => setConfirming(true)}
//             style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--red)", borderColor: "var(--red)" }}
//           >
//             <Icon name="close" size={13} color="var(--red)" />Cancel Transaction
//           </button>
//         )
//       ) : null}
//     </div>
//   );
// }

// export default function AdminTransactions() {
//   const { state, dispatch } = useApp();
//   const { transactions, me } = state;

//   const [activeTab,   setActiveTab]   = useState("all");
//   const [expanded,    setExpanded]    = useState(null);
//   const [search,      setSearch]      = useState("");
//   const [statusFilter,setStatusFilter]= useState("all");   // all | active | cancelled
//   const [dateFrom,    setDateFrom]    = useState("");
//   const [dateTo,      setDateTo]      = useState("");

//   const filtered = useMemo(() => {
//     let txs = [...transactions];
//     if (activeTab !== "all") txs = txs.filter(t => t.mod === activeTab);
//     if (statusFilter !== "all") txs = txs.filter(t => (t.status || "active") === statusFilter);
//     if (dateFrom) txs = txs.filter(t => new Date(t.date) >= new Date(dateFrom));
//     if (dateTo)   txs = txs.filter(t => new Date(t.date) <= new Date(dateTo + "T23:59:59"));
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       txs = txs.filter(t =>
//         t.id.toLowerCase().includes(q) ||
//         t.staff.toLowerCase().includes(q) ||
//         t.desc.toLowerCase().includes(q) ||
//         (t.lineItems || []).some(i => i.name.toLowerCase().includes(q))
//       );
//     }
//     return txs;
//   }, [transactions, activeTab, statusFilter, dateFrom, dateTo, search]);

//   // Tab counts
//   const counts = useMemo(() => {
//     const c = { all: transactions.length };
//     ["drugstore","mart","hotel","restaurant"].forEach(m => { c[m] = transactions.filter(t => t.mod === m).length; });
//     return c;
//   }, [transactions]);

//   const totalFiltered = filtered.reduce((s, t) => t.status !== "cancelled" ? s + t.amount : s, 0);

//   const onCancel = (id) => dispatch({ type: "CANCEL_TX", id });
//   const toggle   = (id) => setExpanded(prev => prev === id ? null : id);

//   const clearFilters = () => { setSearch(""); setStatusFilter("all"); setDateFrom(""); setDateTo(""); };
//   const hasFilters = search || statusFilter !== "all" || dateFrom || dateTo;

//   return (
//     <div>
//       <div className="pg-hd">
//         <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <Icon name="transactions" size={22} color="var(--p)" />Transaction History
//         </h2>
//         <p>Full breakdown of every sale, service, and booking</p>
//       </div>

//       {/* ── Store tabs ── */}
//       <div className="ptabs" style={{ marginBottom: 18 }}>
//         {TABS.map(tab => (
//           <button
//             key={tab}
//             className={`ptab ${activeTab === tab ? "on" : ""}`}
//             onClick={() => { setActiveTab(tab); setExpanded(null); }}
//             style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
//           >
//             {tab !== "all" && <Icon name={modIcon(tab)} size={14} />}
//             {tab === "all" ? "All Stores" : modLabel(tab)}
//             <span style={{
//               marginLeft: 2,
//               background: activeTab === tab ? "rgba(255,255,255,.25)" : "var(--g200)",
//               borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 800
//             }}>
//               {counts[tab]}
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* ── Filters ── */}
//       <Card style={{ marginBottom: 18 }}>
//         <CardBody>
//           <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
//             {/* Search */}
//             <div style={{ flex: "1 1 200px", minWidth: 180 }}>
//               <label className="form-label">Search</label>
//               <div className="srch" style={{ marginBottom: 0 }}>
//                 <span className="srch-ico"><Icon name="search" size={14} color="var(--g400)" /></span>
//                 <input type="text" placeholder="ID, staff, item name…" value={search} onChange={e => setSearch(e.target.value)} />
//               </div>
//             </div>
//             <div className="form-group" style={{ marginBottom: 0, minWidth: 130 }}>
//               <label className="form-label">From</label>
//               <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
//             </div>
//             <div className="form-group" style={{ marginBottom: 0, minWidth: 130 }}>
//               <label className="form-label">To</label>
//               <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
//             </div>
//             <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
//               <label className="form-label">Status</label>
//               <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
//                 <option value="all">All</option>
//                 <option value="active">Active</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>
//             {hasFilters && (
//               <button className="btn btn-sec btn-sm" onClick={clearFilters} style={{ marginBottom: 1, display: "inline-flex", alignItems: "center", gap: 5 }}>
//                 <Icon name="close" size={13} />Clear
//               </button>
//             )}
//           </div>
//         </CardBody>
//       </Card>

//       {/* ── Results summary ── */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
//         <span style={{ fontSize: 13, color: "var(--g500)" }}>
//           <strong style={{ color: "var(--g800)" }}>{filtered.length}</strong> transaction{filtered.length !== 1 ? "s" : ""}
//           {hasFilters ? " (filtered)" : ""}
//         </span>
//         <span style={{ fontSize: 13, fontWeight: 700, color: "var(--pd)" }}>
//           Active total: {fmt(totalFiltered)}
//         </span>
//       </div>

//       {/* ── Transaction list ── */}
//       <Card>
//         <CardBody noPad>
//           {filtered.length === 0 ? (
//             <div className="nores" style={{ padding: 40 }}>No transactions found.</div>
//           ) : (
//             <div>
//               {filtered.map((tx, idx) => {
//                 const isOpen      = expanded === tx.id;
//                 const isCancelled = tx.status === "cancelled";
//                 const modColor    = MOD_COLORS[tx.mod] || "var(--p)";
//                 const itemCount   = tx.lineItems?.length || 0;

//                 return (
//                   <div
//                     key={tx.id}
//                     style={{
//                       borderBottom: idx < filtered.length - 1 ? "1px solid var(--g100)" : "none",
//                       opacity: isCancelled ? 0.65 : 1,
//                       background: isOpen ? "var(--g50)" : "transparent",
//                       transition: "background .15s",
//                     }}
//                   >
//                     {/* ── Row ── */}
//                     <div
//                       onClick={() => toggle(tx.id)}
//                       style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", cursor: "pointer", userSelect: "none" }}
//                     >
//                       {/* Module dot */}
//                       <div style={{ width: 36, height: 36, borderRadius: 10, background: modColor + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                         <Icon name={modIcon(tx.mod)} size={17} color={modColor} />
//                       </div>

//                       {/* Main info */}
//                       <div style={{ flex: 1, minWidth: 0 }}>
//                         <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
//                           <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--g400)", fontWeight: 700 }}>{tx.id}</span>
//                           {isCancelled && (
//                             <span style={{ fontSize: 10, fontWeight: 800, background: "var(--redl)", color: "var(--red)", borderRadius: 4, padding: "1px 6px", textTransform: "uppercase" }}>Cancelled</span>
//                           )}
//                           <span style={{ fontSize: 11, color: "var(--g400)" }}>{timeAgo(tx.date)}</span>
//                         </div>
//                         <div style={{ fontSize: 13, fontWeight: 700, color: "var(--g800)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                           {tx.desc}
//                         </div>
//                         <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
//                           <span style={{ fontSize: 11, color: "var(--g500)" }}>
//                             <Icon name="user" size={11} color="var(--g400)" style={{ marginRight: 3, verticalAlign: "middle" }} />
//                             {tx.staff}
//                           </span>
//                           {itemCount > 0 && (
//                             <span style={{ fontSize: 11, color: "var(--g400)" }}>
//                               {itemCount} line item{itemCount !== 1 ? "s" : ""}
//                             </span>
//                           )}
//                           <span style={{ fontSize: 11, color: "var(--g400)" }}>
//                             {new Date(tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
//                             {" · "}
//                             {new Date(tx.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Amount + chevron */}
//                       <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
//                         <div style={{ textAlign: "right" }}>
//                           <div style={{ fontSize: 15, fontWeight: 900, color: isCancelled ? "var(--g400)" : "var(--pd)", textDecoration: isCancelled ? "line-through" : "none" }}>
//                             {fmt(tx.amount)}
//                           </div>
//                           <div style={{ fontSize: 11, color: modColor, fontWeight: 700 }}>{modLabel(tx.mod)}</div>
//                         </div>
//                         <div style={{ transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
//                           <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--g400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                             <polyline points="6 9 12 15 18 9" />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>

//                     {/* ── Expanded line items ── */}
//                     {isOpen && (
//                       <LineItemsPanel tx={tx} onCancel={onCancel} me={me} />
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </CardBody>
//       </Card>
//     </div>
//   );
// }
































import { useState, useMemo, useEffect } from "react";
import { useAdminData } from "../../hooks/useAdminData";
import { fmt, modIcon, modLabel } from "../../helpers";
import { Card, CardBody } from "../../components/Card";
import Icon from "../../../shared/components/Icon";
import api from "../../../shared/services/api";
import NoModulesBanner from "../../components/NoModulesBanner";

const MOD_COLORS = { drugstore: "#0891b2", mart: "#10b981", hotel: "#f59e0b", restaurant: "#8b5cf6" };

// ── field normalizers ──────────────────────────────────────
const txDate   = (t) => t.createdAt ?? t.date;
const txMod    = (t) => (t.module ?? t.mod)?.toLowerCase();
const txStaff  = (t) => t.staffName ?? t.staff;
const txAmount = (t) => Number(t.amount ?? 0);
const txId     = (t) => t.reference ?? t.id;
const txDesc   = (t) => t.description ?? t.desc;
const txStatus = (t) => (t.status ?? "ACTIVE").toLowerCase();
const txLineItems = (t) => (t.lineItems ?? []).map(li => ({
  name:  li.name,
  cat:   li.category ?? li.cat,
  qty:   li.quantity ?? li.qty,
  price: Number(li.unitPrice ?? li.price ?? 0),
  type:  (li.kind ?? li.type)?.toLowerCase(),
}));

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function LineItemsPanel({ tx, onCancel, me }) {
  const [confirming, setConfirming] = useState(false);
  const isCancelled = txStatus(tx) === "cancelled";
  const canCancel   = !isCancelled && (me?.role === "superadmin" || me?.role === "manager");
  const lineItems   = txLineItems(tx);
  const cancelledBy = tx.cancelledByName ?? tx.cancelledBy;

  return (
    <div className="tx-expanded-inner" style={{ padding: "12px 16px 14px", background: "var(--g50)", borderTop: "1px solid var(--g100)" }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--g400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        Items / Services
      </div>
      {lineItems.length > 0 ? (
        <div className="tx-expanded-table" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: 12 }}>
          <table className="tbl" style={{ minWidth: 340, marginBottom: 0 }}>
            <thead>
              <tr>
                {["Item / Service", "Category", "Qty", "Unit Price", "Subtotal"].map(h => (
                  <th key={h} style={{ textAlign: h === "Qty" || h === "Unit Price" || h === "Subtotal" ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>
                    {item.type === "service"
                      ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="service" size={12} color="var(--pd)" />{item.name}</span>
                      : item.name}
                  </td>
                  <td style={{ color: "var(--g400)" }}>{item.cat || "—"}</td>
                  <td style={{ textAlign: "right", color: "var(--g600)" }}>{item.qty}</td>
                  <td style={{ textAlign: "right", color: "var(--g600)" }}>{fmt(item.price)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--pd)" }}>{fmt(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--g200)" }}>
                <td colSpan={4} style={{ fontWeight: 800, color: "var(--g700)" }}>Total</td>
                <td style={{ fontWeight: 900, textAlign: "right", color: "var(--pd)", fontSize: 14 }}>{fmt(txAmount(tx))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "var(--g400)", marginBottom: 12, fontStyle: "italic" }}>No line item details recorded for this transaction.</div>
      )}

      {isCancelled ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--red)", background: "var(--redl)", borderRadius: 8, padding: "8px 12px" }}>
          <Icon name="close" size={14} color="var(--red)" />
          <span>Cancelled by <strong>{cancelledBy}</strong> · {new Date(tx.cancelledAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      ) : canCancel ? (
        confirming ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--redl)", borderRadius: 8, padding: "10px 14px", border: "1px solid #fecaca" }}>
            <Icon name="warning" size={15} color="var(--red)" />
            <span style={{ fontSize: 13, color: "var(--red)", flex: 1 }}>
              <strong>Cancel this transaction?</strong> Stock will be restored for Drug Store and Mart items.
            </span>
            <button className="btn btn-danger btn-sm" onClick={() => { onCancel(tx.id); setConfirming(false); }}>Yes, Cancel</button>
            <button className="btn btn-sec btn-sm" onClick={() => setConfirming(false)}>No</button>
          </div>
        ) : (
          <button
            className="btn btn-sec btn-sm"
            onClick={() => setConfirming(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--red)", borderColor: "var(--red)" }}
          >
            <Icon name="close" size={13} color="var(--red)" />Cancel Transaction
          </button>
        )
      ) : null}
    </div>
  );
}

export default function AdminTransactions() {
  const { transactions, me, dispatch, enabledModules } = useAdminData();

  // Dynamic tabs: only include module tabs for enabled modules
  const MODULE_TABS = ["drugstore", "mart", "hotel", "restaurant"].filter(m => enabledModules.includes(m));
  const TABS = ["all", ...MODULE_TABS];

  const [activeTab,    setActiveTab]    = useState("all");
  const [expanded,     setExpanded]     = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");

  // If the active module tab gets disabled mid-session, reset to "all"
  useEffect(() => {
    if (activeTab !== "all" && !enabledModules.includes(activeTab)) {
      setActiveTab("all");
      setExpanded(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledModules]);

  const filtered = useMemo(() => {
    let txs = [...transactions];
    if (activeTab !== "all")    txs = txs.filter(t => txMod(t) === activeTab);
    if (statusFilter !== "all") txs = txs.filter(t => txStatus(t) === statusFilter);
    if (dateFrom) txs = txs.filter(t => new Date(txDate(t)) >= new Date(dateFrom));
    if (dateTo)   txs = txs.filter(t => new Date(txDate(t)) <= new Date(dateTo + "T23:59:59"));
    if (search.trim()) {
      const q = search.toLowerCase();
      txs = txs.filter(t =>
        String(txId(t)).toLowerCase().includes(q) ||
        (txStaff(t) || "").toLowerCase().includes(q) ||
        (txDesc(t)  || "").toLowerCase().includes(q) ||
        txLineItems(t).some(i => i.name.toLowerCase().includes(q))
      );
    }
    return txs;
  }, [transactions, activeTab, statusFilter, dateFrom, dateTo, search]);

  const counts = useMemo(() => {
    const c = { all: transactions.length };
    MODULE_TABS.forEach(m => {
      c[m] = transactions.filter(t => txMod(t) === m).length;
    });
    return c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, enabledModules]);

  const totalFiltered = filtered.reduce((s, t) => txStatus(t) !== "cancelled" ? s + txAmount(t) : s, 0);

  const onCancel = async (id) => {
    try {
      const tx = transactions.find(t => (t.reference ?? t.id) === id || t.id === id);
      const backendId = tx?.id ?? id;
      await api.patch(`/admin/transactions/${backendId}/cancel`);
    } catch (err) {
      console.warn("Cancel API failed, updating locally:", err);
    }
    dispatch({ type: "CANCEL_TX", id });
  };
  const toggle   = (id) => setExpanded(prev => prev === id ? null : id);

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setDateFrom(""); setDateTo(""); };
  const hasFilters = search || statusFilter !== "all" || dateFrom || dateTo;

  if (MODULE_TABS.length === 0) {
    return (
      <div>
        <div className="pg-hd">
          <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="transactions" size={22} color="var(--p)" />Transaction History
          </h2>
          <p>Full breakdown of every sale, service, and booking</p>
        </div>
        <NoModulesBanner />
      </div>
    );
  }

  return (
    <div>
      <div className="pg-hd">
        <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="transactions" size={22} color="var(--p)" />Transaction History
        </h2>
        <p>Full breakdown of every sale, service, and booking</p>
      </div>

      <div className="ptabs" style={{ marginBottom: 18 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`ptab ${activeTab === tab ? "on" : ""}`}
            onClick={() => { setActiveTab(tab); setExpanded(null); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {tab !== "all" && <Icon name={modIcon(tab)} size={14} />}
            {tab === "all" ? "All Stores" : modLabel(tab)}
            <span style={{
              marginLeft: 2,
              background: activeTab === tab ? "rgba(255,255,255,.25)" : "var(--g200)",
              borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 800,
            }}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      <Card style={{ marginBottom: 18 }}>
        <CardBody>
          <div className="tx-filters" style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px", minWidth: 180 }}>
              <label className="form-label">Search</label>
              <div className="srch" style={{ marginBottom: 0 }}>
                <span className="srch-ico"><Icon name="search" size={14} color="var(--g400)" /></span>
                <input type="text" placeholder="ID, staff, item name…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 130 }}>
              <label className="form-label">From</label>
              <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 130 }}>
              <label className="form-label">To</label>
              <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
              <label className="form-label">Status</label>
              <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {hasFilters && (
              <button className="btn btn-sec btn-sm" onClick={clearFilters} style={{ marginBottom: 1, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="close" size={13} />Clear
              </button>
            )}
          </div>
        </CardBody>
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "var(--g500)" }}>
          <strong style={{ color: "var(--g800)" }}>{filtered.length}</strong> transaction{filtered.length !== 1 ? "s" : ""}
          {hasFilters ? " (filtered)" : ""}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--pd)" }}>
          Active total: {fmt(totalFiltered)}
        </span>
      </div>

      <Card>
        <CardBody noPad>
          {filtered.length === 0 ? (
            <div className="nores" style={{ padding: 40 }}>No transactions found.</div>
          ) : (
            <div>
              {filtered.map((tx, idx) => {
                const isOpen      = expanded === tx.id;
                const isCancelled = txStatus(tx) === "cancelled";
                const mod         = txMod(tx);
                const modColor    = MOD_COLORS[mod] || "var(--p)";
                const itemCount   = txLineItems(tx).length;
                const date        = txDate(tx);

                return (
                  <div
                    key={tx.id}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? "1px solid var(--g100)" : "none",
                      opacity: isCancelled ? 0.65 : 1,
                      background: isOpen ? "var(--g50)" : "transparent",
                      transition: "background .15s",
                    }}
                  >
                    <div
                      onClick={() => toggle(tx.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", cursor: "pointer", userSelect: "none" }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: modColor + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name={modIcon(mod)} size={17} color={modColor} />
                      </div>

                      <div className="tx-row-info" style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--g400)", fontWeight: 700 }}>{txId(tx)}</span>
                          {isCancelled && (
                            <span style={{ fontSize: 10, fontWeight: 800, background: "var(--redl)", color: "var(--red)", borderRadius: 4, padding: "1px 6px", textTransform: "uppercase" }}>Cancelled</span>
                          )}
                          <span style={{ fontSize: 11, color: "var(--g400)" }}>{timeAgo(date)}</span>
                        </div>
                        <div className="tx-row-desc" style={{ fontSize: 13, fontWeight: 700, color: "var(--g800)", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {txDesc(tx)}
                        </div>
                        <div className="tx-row-meta" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
                          <span style={{ fontSize: 11, color: "var(--g500)" }}>
                            <Icon name="user" size={11} color="var(--g400)" style={{ marginRight: 3, verticalAlign: "middle" }} />
                            {txStaff(tx)}
                          </span>
                          {itemCount > 0 && (
                            <span style={{ fontSize: 11, color: "var(--g400)" }}>
                              {itemCount} line item{itemCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: "var(--g400)" }}>
                            {new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            {" · "}
                            {new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 15, fontWeight: 900, color: isCancelled ? "var(--g400)" : "var(--pd)", textDecoration: isCancelled ? "line-through" : "none" }}>
                            {fmt(txAmount(tx))}
                          </div>
                          <div style={{ fontSize: 11, color: modColor, fontWeight: 700 }}>{modLabel(mod)}</div>
                        </div>
                        <div style={{ transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--g400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {isOpen && <LineItemsPanel tx={tx} onCancel={onCancel} me={me} />}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}