// import { useState, useMemo } from "react";
// import { useApp } from "../../AppContext";
// import { fmt, modLabel, modIcon } from "../../helpers";
// import { Card, CardHeader, CardBody } from "../../components/Card";
// import Icon from "../../../shared/components/Icon";

// const COST_RATIOS = { drugstore: 0.55, mart: 0.65, hotel: 0.40, restaurant: 0.50 };
// const MOD_COLORS  = { drugstore: "#0891b2", mart: "#10b981", hotel: "#f59e0b", restaurant: "#8b5cf6" };
// const MODS        = ["drugstore", "mart", "hotel", "restaurant"];

// // ── helpers ────────────────────────────────────────────────
// const startOf = (d, unit) => {
//   const r = new Date(d);
//   if (unit === "week")  { r.setDate(r.getDate() - r.getDay()); r.setHours(0,0,0,0); }
//   if (unit === "month") { r.setDate(1); r.setHours(0,0,0,0); }
//   if (unit === "day")   { r.setHours(0,0,0,0); }
//   return r;
// };

// const periodLabel = (date, period) => {
//   const d = new Date(date);
//   if (period === "daily")   return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
//   if (period === "weekly")  return `Wk ${getWeekNo(d)}, ${d.getFullYear()}`;
//   if (period === "monthly") return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
//   return String(d.getFullYear());
// };

// function getWeekNo(d) {
//   const jan1 = new Date(d.getFullYear(), 0, 1);
//   return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
// }

// function periodKey(date, period) {
//   const d = new Date(date);
//   if (period === "daily")   return d.toISOString().slice(0, 10);
//   if (period === "weekly")  return `${d.getFullYear()}-W${String(getWeekNo(d)).padStart(2,"0")}`;
//   if (period === "monthly") return d.toISOString().slice(0, 7);
//   return String(d.getFullYear());
// }

// // ── component ──────────────────────────────────────────────
// export default function AdminRevenue() {
//   const { state } = useApp();
//   const { transactions } = state;

//   const [reportTab,  setReportTab]  = useState("summary");   // summary | trend | staff | module
//   const [period,     setPeriod]     = useState("daily");     // daily | weekly | monthly | yearly
//   const [modFilter,  setModFilter]  = useState("all");       // all | drugstore | mart | hotel | restaurant
//   const [staffFilter,setStaffFilter]= useState("all");
//   const [dateFrom,   setDateFrom]   = useState("");
//   const [dateTo,     setDateTo]     = useState("");

//   // All staff names
//   const allStaff = useMemo(() => [...new Set(transactions.map(t => t.staff))], [transactions]);

//   // Apply filters
//   const filtered = useMemo(() => {
//     let txs = [...transactions];
//     if (modFilter   !== "all") txs = txs.filter(t => t.mod === modFilter);
//     if (staffFilter !== "all") txs = txs.filter(t => t.staff === staffFilter);
//     if (dateFrom) txs = txs.filter(t => new Date(t.date) >= new Date(dateFrom));
//     if (dateTo)   txs = txs.filter(t => new Date(t.date) <= new Date(dateTo + "T23:59:59"));
//     return txs;
//   }, [transactions, modFilter, staffFilter, dateFrom, dateTo]);

//   const totalRevenue = filtered.reduce((s, t) => s + t.amount, 0);
//   const totalCost    = filtered.reduce((s, t) => s + t.amount * (COST_RATIOS[t.mod] || 0.5), 0);
//   const totalProfit  = totalRevenue - totalCost;
//   const totalMargin  = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

//   // Per-module summary (filtered)
//   const modData = MODS.map(m => {
//     const txs     = filtered.filter(t => t.mod === m);
//     const revenue = txs.reduce((s, t) => s + t.amount, 0);
//     const cost    = revenue * COST_RATIOS[m];
//     const profit  = revenue - cost;
//     const margin  = revenue > 0 ? (profit / revenue) * 100 : 0;
//     return { m, revenue, cost, profit, margin, count: txs.length };
//   });

//   // Period trend data (filtered)
//   const trendMap = {};
//   filtered.forEach(t => {
//     const key = periodKey(t.date, period);
//     if (!trendMap[key]) trendMap[key] = { key, label: periodLabel(t.date, period), revenue: 0, cost: 0 };
//     trendMap[key].revenue += t.amount;
//     trendMap[key].cost    += t.amount * (COST_RATIOS[t.mod] || 0.5);
//   });
//   const trendData = Object.values(trendMap).sort((a, b) => a.key.localeCompare(b.key));
//   const trendMax  = Math.max(...trendData.map(d => d.revenue), 1);

//   // Per-staff summary (filtered)
//   const staffMap = {};
//   filtered.forEach(t => {
//     if (!staffMap[t.staff]) staffMap[t.staff] = { name: t.staff, revenue: 0, cost: 0, count: 0 };
//     staffMap[t.staff].revenue += t.amount;
//     staffMap[t.staff].cost    += t.amount * (COST_RATIOS[t.mod] || 0.5);
//     staffMap[t.staff].count   += 1;
//   });
//   const staffData = Object.values(staffMap).sort((a, b) => b.revenue - a.revenue);
//   const staffMax  = Math.max(...staffData.map(d => d.revenue), 1);

//   const clearFilters = () => { setModFilter("all"); setStaffFilter("all"); setDateFrom(""); setDateTo(""); };
//   const hasFilters   = modFilter !== "all" || staffFilter !== "all" || dateFrom || dateTo;

//   const printReport = () => {
//     const zone  = document.getElementById("print-zone");
//     const inner = document.getElementById("revenue-report-inner");
//     if (zone && inner) { zone.innerHTML = inner.innerHTML; zone.style.display = "block"; window.print(); zone.style.display = "none"; zone.innerHTML = ""; }
//   };

//   return (
//     <div>
//       {/* ── Page header ── */}
//       <div className="pg-hd-row">
//         <div>
//           <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <Icon name="revenue" size={22} color="var(--p)" />Revenue & Profit
//           </h2>
//           <p style={{ fontSize: 13, color: "var(--g400)", marginTop: 3 }}>
//             {hasFilters ? `Filtered results — ${filtered.length} transaction${filtered.length !== 1 ? "s" : ""}` : `All-time · ${transactions.length} transactions`}
//           </p>
//         </div>
//         <button className="btn btn-p" onClick={printReport} style={{ display: "flex", alignItems: "center", gap: 7 }}>
//           <Icon name="print" size={15} color="white" />Print Report
//         </button>
//       </div>

//       {/* ── Filter bar ── */}
//       <Card style={{ marginBottom: 20 }}>
//         <CardBody>
//           <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
//             {/* Date from */}
//             <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
//               <label className="form-label">From</label>
//               <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
//             </div>
//             {/* Date to */}
//             <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
//               <label className="form-label">To</label>
//               <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
//             </div>
//             {/* Module */}
//             <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
//               <label className="form-label">Module</label>
//               <select className="form-select" value={modFilter} onChange={e => setModFilter(e.target.value)}>
//                 <option value="all">All Modules</option>
//                 {MODS.map(m => <option key={m} value={m}>{modLabel(m)}</option>)}
//               </select>
//             </div>
//             {/* Staff */}
//             <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
//               <label className="form-label">Staff</label>
//               <select className="form-select" value={staffFilter} onChange={e => setStaffFilter(e.target.value)}>
//                 <option value="all">All Staff</option>
//                 {allStaff.map(s => <option key={s} value={s}>{s}</option>)}
//               </select>
//             </div>
//             {/* Period (for trend view) */}
//             <div className="form-group" style={{ marginBottom: 0, minWidth: 150 }}>
//               <label className="form-label">Group By</label>
//               <select className="form-select" value={period} onChange={e => setPeriod(e.target.value)}>
//                 <option value="daily">Daily</option>
//                 <option value="weekly">Weekly</option>
//                 <option value="monthly">Monthly</option>
//                 <option value="yearly">Yearly</option>
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

//       {/* ── Summary KPIs ── */}
//       <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20 }}>
//         <div className="stat-card">
//           <div className="stat-ico"><Icon name="revenue" size={24} color="var(--p)" /></div>
//           <div className="stat-val">{fmt(totalRevenue)}</div>
//           <div className="stat-lbl">Total Revenue</div>
//           <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 4 }}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-ico"><Icon name="tag" size={24} color="var(--amber)" /></div>
//           <div className="stat-val" style={{ color: "var(--amber)" }}>{fmt(totalCost)}</div>
//           <div className="stat-lbl">Est. Total Cost</div>
//           <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 4 }}>Cost of goods &amp; services</div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-ico"><Icon name="profit" size={24} color="var(--green)" /></div>
//           <div className="stat-val" style={{ color: "var(--green)" }}>{fmt(totalProfit)}</div>
//           <div className="stat-lbl">Net Profit</div>
//           <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 4 }}>After estimated costs</div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-ico"><Icon name="report" size={24} color="var(--pd)" /></div>
//           <div className="stat-val" style={{ color: totalMargin >= 30 ? "var(--green)" : "var(--amber)" }}>{totalMargin.toFixed(1)}%</div>
//           <div className="stat-lbl">Profit Margin</div>
//           <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 4 }}>
//             {totalMargin >= 40 ? "Excellent" : totalMargin >= 25 ? "Good" : filtered.length ? "Needs attention" : "No data"}
//           </div>
//         </div>
//       </div>

//       {/* ── Report tabs ── */}
//       <div className="ptabs" style={{ marginBottom: 20 }}>
//         {[
//           { key: "summary", icon: "dashboard", label: "Summary" },
//           { key: "trend",   icon: "profit",    label: "Trend" },
//           { key: "staff",   icon: "staff",     label: "By Staff" },
//           { key: "module",  icon: "stock",     label: "By Module" },
//         ].map(({ key, icon, label }) => (
//           <button key={key} className={`ptab ${reportTab === key ? "on" : ""}`} onClick={() => setReportTab(key)}
//             style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
//             <Icon name={icon} size={14} />{label}
//           </button>
//         ))}
//       </div>

//       <div id="revenue-report-inner">

//         {/* ── SUMMARY ── */}
//         {reportTab === "summary" && (
//           <Card>
//             <CardHeader title="Revenue vs Profit by Module" />
//             <CardBody>
//               {totalRevenue === 0 ? (
//                 <div className="nores">No transactions match the current filters.</div>
//               ) : (
//                 <>
//                   <div style={{ display: "flex", gap: 20, alignItems: "flex-end", height: 180, paddingBottom: 8 }}>
//                     {modData.map(d => {
//                       const revH  = Math.max(6, (d.revenue / Math.max(...modData.map(x => x.revenue), 1)) * 160);
//                       const profH = Math.max(0, (d.profit  / Math.max(...modData.map(x => x.revenue), 1)) * 160);
//                       return (
//                         <div key={d.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
//                           <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g600)" }}>{fmt(d.revenue)}</div>
//                           <div style={{ display: "flex", gap: 4, alignItems: "flex-end", width: "100%" }}>
//                             <div title="Revenue" style={{ flex: 1, height: revH,  background: MOD_COLORS[d.m], borderRadius: "5px 5px 0 0", opacity: .85 }} />
//                             <div title="Profit"  style={{ flex: 1, height: profH, background: "var(--green)",  borderRadius: "5px 5px 0 0" }} />
//                           </div>
//                           <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g500)", textAlign: "center", display: "flex", alignItems: "center", gap: 4 }}>
//                             <Icon name={modIcon(d.m)} size={12} color={MOD_COLORS[d.m]} />{modLabel(d.m)}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                   <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10 }}>
//                     {[["var(--p)", "Revenue"], ["var(--green)", "Profit"]].map(([c, l]) => (
//                       <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--g500)" }}>
//                         <span style={{ width: 12, height: 12, background: c, borderRadius: 3, display: "inline-block" }} />{l}
//                       </span>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </CardBody>
//           </Card>
//         )}

//         {/* ── TREND ── */}
//         {reportTab === "trend" && (
//           <Card>
//             <CardHeader title={`Revenue Trend — ${period.charAt(0).toUpperCase() + period.slice(1)}`} />
//             <CardBody>
//               {trendData.length === 0 ? (
//                 <div className="nores">No transactions match the current filters.</div>
//               ) : (
//                 <>
//                   {/* Bar chart */}
//                   <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 160, paddingBottom: 8, overflowX: "auto", paddingTop: 4 }}>
//                     {trendData.map(d => {
//                       const profit = d.revenue - d.cost;
//                       const revH   = Math.max(6,  (d.revenue / trendMax) * 140);
//                       const profH  = Math.max(0,  (profit    / trendMax) * 140);
//                       return (
//                         <div key={d.key} style={{ minWidth: 48, flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
//                           <div style={{ fontSize: 10, fontWeight: 700, color: "var(--g600)" }}>{fmt(d.revenue)}</div>
//                           <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
//                             <div title="Revenue" style={{ width: 18, height: revH,  background: "var(--p)",     borderRadius: "4px 4px 0 0", opacity: .85 }} />
//                             <div title="Profit"  style={{ width: 18, height: profH, background: "var(--green)", borderRadius: "4px 4px 0 0" }} />
//                           </div>
//                           <div style={{ fontSize: 9, fontWeight: 700, color: "var(--g400)", textAlign: "center", maxWidth: 52, wordBreak: "break-word" }}>{d.label}</div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                   <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, marginBottom: 16 }}>
//                     {[["var(--p)", "Revenue"], ["var(--green)", "Profit"]].map(([c, l]) => (
//                       <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--g500)" }}>
//                         <span style={{ width: 12, height: 12, background: c, borderRadius: 3, display: "inline-block" }} />{l}
//                       </span>
//                     ))}
//                   </div>
//                   {/* Table */}
//                   <table className="tbl">
//                     <thead><tr><th>Period</th><th className="text-right">Revenue</th><th className="text-right">Est. Cost</th><th className="text-right">Profit</th><th className="text-right">Margin</th></tr></thead>
//                     <tbody>
//                       {trendData.map(d => {
//                         const profit = d.revenue - d.cost;
//                         const margin = d.revenue > 0 ? (profit / d.revenue) * 100 : 0;
//                         return (
//                           <tr key={d.key}>
//                             <td style={{ fontWeight: 700 }}>{d.label}</td>
//                             <td className="text-right"><strong style={{ color: "var(--pd)" }}>{fmt(d.revenue)}</strong></td>
//                             <td className="text-right" style={{ color: "var(--amber)" }}>{fmt(d.cost)}</td>
//                             <td className="text-right"><strong style={{ color: "var(--green)" }}>{fmt(profit)}</strong></td>
//                             <td className="text-right">
//                               <span style={{ fontSize: 12, fontWeight: 700, color: margin >= 30 ? "var(--green)" : "var(--amber)" }}>{margin.toFixed(1)}%</span>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                     <tfoot>
//                       <tr style={{ background: "var(--g50)" }}>
//                         <td><strong>Total</strong></td>
//                         <td className="text-right"><strong style={{ color: "var(--pd)" }}>{fmt(totalRevenue)}</strong></td>
//                         <td className="text-right" style={{ color: "var(--amber)" }}>{fmt(totalCost)}</td>
//                         <td className="text-right"><strong style={{ color: "var(--green)" }}>{fmt(totalProfit)}</strong></td>
//                         <td className="text-right"><strong style={{ color: totalMargin >= 30 ? "var(--green)" : "var(--amber)" }}>{totalMargin.toFixed(1)}%</strong></td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </>
//               )}
//             </CardBody>
//           </Card>
//         )}

//         {/* ── BY STAFF ── */}
//         {reportTab === "staff" && (
//           <Card>
//             <CardHeader title="Revenue & Profit by Staff Member" />
//             <CardBody>
//               {staffData.length === 0 ? (
//                 <div className="nores">No transactions match the current filters.</div>
//               ) : (
//                 <>
//                   {/* Staff bar chart */}
//                   <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
//                     {staffData.map(d => {
//                       const profit = d.revenue - d.cost;
//                       const pct    = staffMax > 0 ? (d.revenue / staffMax) * 100 : 0;
//                       const margin = d.revenue > 0 ? (profit / d.revenue) * 100 : 0;
//                       return (
//                         <div key={d.name}>
//                           <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
//                             <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                               <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--pl)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "var(--pd)" }}>
//                                 {d.name[0].toUpperCase()}
//                               </span>
//                               {d.name}
//                               <span style={{ fontSize: 11, color: "var(--g400)", fontWeight: 600 }}>{d.count} tx</span>
//                             </span>
//                             <span style={{ display: "flex", gap: 14, fontSize: 12 }}>
//                               <span style={{ color: "var(--pd)" }}>{fmt(d.revenue)}</span>
//                               <span style={{ color: "var(--green)" }}>+{fmt(profit)}</span>
//                               <span style={{ color: margin >= 30 ? "var(--green)" : "var(--amber)", fontWeight: 800 }}>{margin.toFixed(0)}%</span>
//                             </span>
//                           </div>
//                           <div style={{ height: 8, borderRadius: 4, background: "var(--g100)", overflow: "hidden" }}>
//                             <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,var(--p),var(--pd))", borderRadius: 4, transition: "width .4s ease" }} />
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                   <table className="tbl">
//                     <thead><tr><th>Staff</th><th className="text-right">Revenue</th><th className="text-right">Est. Cost</th><th className="text-right">Profit</th><th className="text-right">Margin</th><th className="text-right">Transactions</th></tr></thead>
//                     <tbody>
//                       {staffData.map(d => {
//                         const profit = d.revenue - d.cost;
//                         const margin = d.revenue > 0 ? (profit / d.revenue) * 100 : 0;
//                         return (
//                           <tr key={d.name}>
//                             <td><strong>{d.name}</strong></td>
//                             <td className="text-right"><strong style={{ color: "var(--pd)" }}>{fmt(d.revenue)}</strong></td>
//                             <td className="text-right" style={{ color: "var(--amber)" }}>{fmt(d.cost)}</td>
//                             <td className="text-right"><strong style={{ color: "var(--green)" }}>{fmt(profit)}</strong></td>
//                             <td className="text-right"><span style={{ fontSize: 12, fontWeight: 700, color: margin >= 30 ? "var(--green)" : "var(--amber)" }}>{margin.toFixed(1)}%</span></td>
//                             <td className="text-right" style={{ color: "var(--g500)" }}>{d.count}</td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </>
//               )}
//             </CardBody>
//           </Card>
//         )}

//         {/* ── BY MODULE ── */}
//         {reportTab === "module" && (
//           <Card>
//             <CardHeader title="Profit & Loss by Module" />
//             <CardBody noPad>
//               {totalRevenue === 0 ? (
//                 <div className="nores" style={{ padding: 24 }}>No transactions match the current filters.</div>
//               ) : (
//                 <table className="tbl">
//                   <thead>
//                     <tr><th>Module</th><th className="text-right">Revenue</th><th className="text-right">Est. Cost</th><th className="text-right">Profit</th><th className="text-right">Margin</th><th className="text-right">Tx</th></tr>
//                   </thead>
//                   <tbody>
//                     {modData.map(d => (
//                       <tr key={d.m}>
//                         <td>
//                           <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                             <span style={{ width: 28, height: 28, borderRadius: 7, background: MOD_COLORS[d.m] + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                               <Icon name={modIcon(d.m)} size={14} color={MOD_COLORS[d.m]} />
//                             </span>
//                             <strong>{modLabel(d.m)}</strong>
//                           </span>
//                         </td>
//                         <td className="text-right"><strong style={{ color: "var(--pd)" }}>{fmt(d.revenue)}</strong></td>
//                         <td className="text-right" style={{ color: "var(--amber)" }}>{fmt(d.cost)}</td>
//                         <td className="text-right"><strong style={{ color: "var(--green)" }}>{fmt(d.profit)}</strong></td>
//                         <td className="text-right">
//                           <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
//                             <span style={{ width: 48, height: 6, borderRadius: 3, background: "var(--g100)", display: "inline-block", overflow: "hidden" }}>
//                               <span style={{ display: "block", width: `${Math.min(d.margin, 100)}%`, height: "100%", background: d.margin >= 30 ? "var(--green)" : "var(--amber)", borderRadius: 3 }} />
//                             </span>
//                             <span style={{ fontSize: 12, fontWeight: 700, color: d.margin >= 30 ? "var(--green)" : "var(--amber)" }}>{d.margin.toFixed(1)}%</span>
//                           </span>
//                         </td>
//                         <td className="text-right" style={{ color: "var(--g500)" }}>{d.count}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot>
//                     <tr style={{ background: "var(--g50)" }}>
//                       <td><strong>TOTAL</strong></td>
//                       <td className="text-right"><strong style={{ color: "var(--pd)" }}>{fmt(totalRevenue)}</strong></td>
//                       <td className="text-right" style={{ color: "var(--amber)" }}>{fmt(totalCost)}</td>
//                       <td className="text-right"><strong style={{ color: "var(--green)" }}>{fmt(totalProfit)}</strong></td>
//                       <td className="text-right"><strong style={{ color: totalMargin >= 30 ? "var(--green)" : "var(--amber)" }}>{totalMargin.toFixed(1)}%</strong></td>
//                       <td className="text-right" style={{ color: "var(--g500)" }}>{filtered.length}</td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               )}
//             </CardBody>
//           </Card>
//         )}

//         <div style={{ marginTop: 14, fontSize: 12, color: "var(--g400)", fontStyle: "italic", display: "flex", alignItems: "center", gap: 5 }}>
//           <Icon name="warning" size={13} color="var(--amber)" />
//           Profit figures are estimates based on standard cost ratios (Drug Store 55%, Mart 65%, Hotel 40%, Restaurant 50%). Actual figures may vary.
//         </div>
//       </div>
//     </div>
//   );
// }




import { useState, useMemo, useEffect } from "react";
import { useAdminData } from "../../hooks/useAdminData";
import { fmt, modLabel, modIcon } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Icon from "../../../shared/components/Icon";
import NoModulesBanner from "../../components/NoModulesBanner";

const FALLBACK_RATIOS = { drugstore: 0.55, mart: 0.65, hotel: 0.40, restaurant: 0.50 };
const MOD_COLORS  = { drugstore: "#0891b2", mart: "#10b981", hotel: "#f59e0b", restaurant: "#8b5cf6" };
const ALL_REVENUE_MODS = ["drugstore", "mart", "hotel", "restaurant"];

// ── field normalizers ──────────────────────────────────────
const txDate   = (t) => t.createdAt ?? t.date;
const txMod    = (t) => (t.module ?? t.mod)?.toLowerCase();
const txStaff  = (t) => t.staffName ?? t.staff;
const txAmount = (t) => Number(t.amount ?? 0);

/**
 * Compute actual cost of a transaction from its line items.
 * Each line item may carry costPrice (set when the item was sold).
 * Falls back to module ratio if no costPrice data is available.
 */
function txCost(t) {
  const items = t.lineItems ?? t.items ?? [];
  if (items.length > 0) {
    const computed = items.reduce((sum, li) => {
      const cp  = li.costPrice ?? li.cost_price ?? null;
      const qty = li.qty ?? li.quantity ?? 1;
      const sp  = li.price ?? li.unitPrice ?? 0;
      if (cp != null && !isNaN(cp)) return sum + parseFloat(cp) * qty;
      // fallback: use item-level ratio if no costPrice
      return sum + parseFloat(sp) * qty * (FALLBACK_RATIOS[txMod(t)] ?? 0.5);
    }, 0);
    if (computed > 0) return computed;
  }
  // No line items — fall back to module ratio on total amount
  return txAmount(t) * (FALLBACK_RATIOS[txMod(t)] ?? 0.5);
}

const txLineItems = (t) => t.lineItems ?? t.items ?? [];

// ── helpers ────────────────────────────────────────────────
const periodLabel = (date, period) => {
  const d = new Date(date);
  if (!date || isNaN(d)) return "—";
  if (period === "daily")   return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  if (period === "weekly")  return `Wk ${getWeekNo(d)}, ${d.getFullYear()}`;
  if (period === "monthly") return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  return String(d.getFullYear());
};

function getWeekNo(d) {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
}

function periodKey(date, period) {
  const d = new Date(date);
  if (!date || isNaN(d)) return "invalid";
  if (period === "daily")   return d.toISOString().slice(0, 10);
  if (period === "weekly")  return `${d.getFullYear()}-W${String(getWeekNo(d)).padStart(2, "0")}`;
  if (period === "monthly") return d.toISOString().slice(0, 7);
  return String(d.getFullYear());
}

// ── component ──────────────────────────────────────────────
export default function AdminRevenue() {
  const { transactions, enabledModules } = useAdminData();

  // Only include revenue module tabs for enabled modules
  const MODS = ALL_REVENUE_MODS.filter(m => enabledModules.includes(m));

  const [reportTab,   setReportTab]   = useState("summary");
  const [period,      setPeriod]      = useState("daily");
  const [modFilter,   setModFilter]   = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");

  // If the active module filter points to a now-disabled module, reset it
  useEffect(() => {
    if (modFilter !== "all" && !enabledModules.includes(modFilter)) {
      setModFilter("all");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledModules]);

  const allStaff = useMemo(() => [...new Set(transactions.map(t => txStaff(t)).filter(Boolean))], [transactions]);

  const filtered = useMemo(() => {
    let txs = [...transactions];
    if (modFilter   !== "all") txs = txs.filter(t => txMod(t) === modFilter);
    if (staffFilter !== "all") txs = txs.filter(t => txStaff(t) === staffFilter);
    if (dateFrom) txs = txs.filter(t => new Date(txDate(t)) >= new Date(dateFrom));
    if (dateTo)   txs = txs.filter(t => new Date(txDate(t)) <= new Date(dateTo + "T23:59:59"));
    return txs;
  }, [transactions, modFilter, staffFilter, dateFrom, dateTo]);

  const totalRevenue = filtered.reduce((s, t) => s + txAmount(t), 0);
  const totalCost    = filtered.reduce((s, t) => s + txCost(t), 0);
  const totalProfit  = totalRevenue - totalCost;
  const totalMargin  = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const modData = MODS.map(m => {
    const txs     = filtered.filter(t => txMod(t) === m);
    const revenue = txs.reduce((s, t) => s + txAmount(t), 0);
    const cost    = txs.reduce((s, t) => s + txCost(t), 0);
    const profit  = revenue - cost;
    const margin  = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { m, revenue, cost, profit, margin, count: txs.length };
  });

  const trendMap = {};
  filtered.forEach(t => {
    const date = txDate(t);
    if (!date) return;
    const key = periodKey(date, period);
    if (key === "invalid") return;
    if (!trendMap[key]) trendMap[key] = { key, label: periodLabel(date, period), revenue: 0, cost: 0 };
    trendMap[key].revenue += txAmount(t);
    trendMap[key].cost    += txCost(t);
  });
  const trendData = Object.values(trendMap).sort((a, b) => a.key.localeCompare(b.key));
  const trendMax  = Math.max(...trendData.map(d => d.revenue), 1);

  const staffMap = {};
  filtered.forEach(t => {
    const name = txStaff(t);
    if (!name) return;
    if (!staffMap[name]) staffMap[name] = { name, revenue: 0, cost: 0, count: 0 };
    staffMap[name].revenue += txAmount(t);
    staffMap[name].cost    += txCost(t);
    staffMap[name].count   += 1;
  });
  const staffData = Object.values(staffMap).sort((a, b) => b.revenue - a.revenue);
  const staffMax  = Math.max(...staffData.map(d => d.revenue), 1);

  const clearFilters = () => { setModFilter("all"); setStaffFilter("all"); setDateFrom(""); setDateTo(""); };
  const hasFilters   = modFilter !== "all" || staffFilter !== "all" || dateFrom || dateTo;

  const printReport = () => {
    const zone  = document.getElementById("print-zone");
    const inner = document.getElementById("revenue-report-inner");
    if (zone && inner) { zone.innerHTML = inner.innerHTML; zone.style.display = "block"; window.print(); zone.style.display = "none"; zone.innerHTML = ""; }
  };

  if (MODS.length === 0) {
    return (
      <div>
        <div className="pg-hd-row">
          <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="revenue" size={22} color="var(--p)" />Revenue & Profit
          </h2>
        </div>
        <NoModulesBanner />
      </div>
    );
  }

  return (
    <div>
      <div className="pg-hd-row">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="revenue" size={22} color="var(--p)" />Revenue & Profit
          </h2>
          <p style={{ fontSize: 13, color: "var(--g400)", marginTop: 3 }}>
            {hasFilters ? `Filtered results — ${filtered.length} transaction${filtered.length !== 1 ? "s" : ""}` : `All-time · ${transactions.length} transactions`}
          </p>
        </div>
        <button className="btn btn-p" onClick={printReport} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Icon name="print" size={15} color="white" />Print Report
        </button>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <CardBody>
          <div className="rev-filters" style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
              <label className="form-label">From</label>
              <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
              <label className="form-label">To</label>
              <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
              <label className="form-label">Module</label>
              <select className="form-select" value={modFilter} onChange={e => setModFilter(e.target.value)}>
                <option value="all">All Modules</option>
                {MODS.map(m => <option key={m} value={m}>{modLabel(m)}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
              <label className="form-label">Staff</label>
              <select className="form-select" value={staffFilter} onChange={e => setStaffFilter(e.target.value)}>
                <option value="all">All Staff</option>
                {allStaff.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 150 }}>
              <label className="form-label">Group By</label>
              <select className="form-select" value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
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

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-ico"><Icon name="revenue" size={24} color="var(--p)" /></div>
          <div className="stat-val">{fmt(totalRevenue)}</div>
          <div className="stat-lbl">Total Revenue</div>
          <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 4 }}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="stat-card">
          <div className="stat-ico"><Icon name="tag" size={24} color="var(--amber)" /></div>
          <div className="stat-val" style={{ color: "var(--amber)" }}>{fmt(totalCost)}</div>
          <div className="stat-lbl">Total Cost</div>
          <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 4 }}>Real cost prices where set</div>
        </div>
        <div className="stat-card">
          <div className="stat-ico"><Icon name="profit" size={24} color="var(--green)" /></div>
          <div className="stat-val" style={{ color: "var(--green)" }}>{fmt(totalProfit)}</div>
          <div className="stat-lbl">Net Profit</div>
          <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 4 }}>Revenue minus cost</div>
        </div>
        <div className="stat-card">
          <div className="stat-ico"><Icon name="report" size={24} color="var(--pd)" /></div>
          <div className="stat-val" style={{ color: totalMargin >= 30 ? "var(--green)" : "var(--amber)" }}>{totalMargin.toFixed(1)}%</div>
          <div className="stat-lbl">Profit Margin</div>
          <div style={{ fontSize: 11, color: "var(--g400)", marginTop: 4 }}>
            {totalMargin >= 40 ? "Excellent" : totalMargin >= 25 ? "Good" : filtered.length ? "Needs attention" : "No data"}
          </div>
        </div>
      </div>

      <div className="ptabs" style={{ marginBottom: 20 }}>
        {[
          { key: "summary", icon: "dashboard", label: "Summary" },
          { key: "trend",   icon: "profit",    label: "Trend" },
          { key: "staff",   icon: "staff",     label: "By Staff" },
          { key: "module",  icon: "stock",     label: "By Module" },
        ].map(({ key, icon, label }) => (
          <button key={key} className={`ptab ${reportTab === key ? "on" : ""}`} onClick={() => setReportTab(key)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name={icon} size={14} />{label}
          </button>
        ))}
      </div>

      <div id="revenue-report-inner">
        {reportTab === "summary" && (
          <Card>
            <CardHeader title="Revenue vs Profit by Module" />
            <CardBody>
              {totalRevenue === 0 ? (
                <div className="nores">No transactions match the current filters.</div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-end", height: 180, paddingBottom: 8 }}>
                    {modData.map(d => {
                      const revH  = Math.max(6, (d.revenue / Math.max(...modData.map(x => x.revenue), 1)) * 160);
                      const profH = Math.max(0, (d.profit  / Math.max(...modData.map(x => x.revenue), 1)) * 160);
                      return (
                        <div key={d.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g600)" }}>{fmt(d.revenue)}</div>
                          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", width: "100%" }}>
                            <div title="Revenue" style={{ flex: 1, height: revH,  background: MOD_COLORS[d.m], borderRadius: "5px 5px 0 0", opacity: .85 }} />
                            <div title="Profit"  style={{ flex: 1, height: profH, background: "var(--green)",  borderRadius: "5px 5px 0 0" }} />
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g500)", textAlign: "center", display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name={modIcon(d.m)} size={12} color={MOD_COLORS[d.m]} />{modLabel(d.m)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10 }}>
                    {[["var(--p)", "Revenue"], ["var(--green)", "Profit"]].map(([c, l]) => (
                      <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--g500)" }}>
                        <span style={{ width: 12, height: 12, background: c, borderRadius: 3, display: "inline-block" }} />{l}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        )}

        {reportTab === "trend" && (
          <Card>
            <CardHeader title={`Revenue Trend — ${period.charAt(0).toUpperCase() + period.slice(1)}`} />
            <CardBody>
              {trendData.length === 0 ? (
                <div className="nores">No transactions match the current filters.</div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 160, paddingBottom: 8, overflowX: "auto", paddingTop: 4 }}>
                    {trendData.map(d => {
                      const profit = d.revenue - d.cost;
                      const revH   = Math.max(6,  (d.revenue / trendMax) * 140);
                      const profH  = Math.max(0,  (profit    / trendMax) * 140);
                      return (
                        <div key={d.key} style={{ minWidth: 48, flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--g600)" }}>{fmt(d.revenue)}</div>
                          <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                            <div title="Revenue" style={{ width: 18, height: revH,  background: "var(--p)",     borderRadius: "4px 4px 0 0", opacity: .85 }} />
                            <div title="Profit"  style={{ width: 18, height: profH, background: "var(--green)", borderRadius: "4px 4px 0 0" }} />
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--g400)", textAlign: "center", maxWidth: 52, wordBreak: "break-word" }}>{d.label}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, marginBottom: 16 }}>
                    {[["var(--p)", "Revenue"], ["var(--green)", "Profit"]].map(([c, l]) => (
                      <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--g500)" }}>
                        <span style={{ width: 12, height: 12, background: c, borderRadius: 3, display: "inline-block" }} />{l}
                      </span>
                    ))}
                  </div>
                  <table className="tbl">
                    <thead><tr><th>Period</th><th className="text-right">Revenue</th><th className="text-right">Est. Cost</th><th className="text-right">Profit</th><th className="text-right">Margin</th></tr></thead>
                    <tbody>
                      {trendData.map(d => {
                        const profit = d.revenue - d.cost;
                        const margin = d.revenue > 0 ? (profit / d.revenue) * 100 : 0;
                        return (
                          <tr key={d.key}>
                            <td style={{ fontWeight: 700 }}>{d.label}</td>
                            <td className="text-right"><strong style={{ color: "var(--pd)" }}>{fmt(d.revenue)}</strong></td>
                            <td className="text-right" style={{ color: "var(--amber)" }}>{fmt(d.cost)}</td>
                            <td className="text-right"><strong style={{ color: "var(--green)" }}>{fmt(profit)}</strong></td>
                            <td className="text-right">
                              <span style={{ fontSize: 12, fontWeight: 700, color: margin >= 30 ? "var(--green)" : "var(--amber)" }}>{margin.toFixed(1)}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "var(--g50)" }}>
                        <td><strong>Total</strong></td>
                        <td className="text-right"><strong style={{ color: "var(--pd)" }}>{fmt(totalRevenue)}</strong></td>
                        <td className="text-right" style={{ color: "var(--amber)" }}>{fmt(totalCost)}</td>
                        <td className="text-right"><strong style={{ color: "var(--green)" }}>{fmt(totalProfit)}</strong></td>
                        <td className="text-right"><strong style={{ color: totalMargin >= 30 ? "var(--green)" : "var(--amber)" }}>{totalMargin.toFixed(1)}%</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </>
              )}
            </CardBody>
          </Card>
        )}

        {reportTab === "staff" && (
          <Card>
            <CardHeader title="Revenue & Profit by Staff Member" />
            <CardBody>
              {staffData.length === 0 ? (
                <div className="nores">No transactions match the current filters.</div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {staffData.map(d => {
                      const profit = d.revenue - d.cost;
                      const pct    = staffMax > 0 ? (d.revenue / staffMax) * 100 : 0;
                      const margin = d.revenue > 0 ? (profit / d.revenue) * 100 : 0;
                      return (
                        <div key={d.name}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--pl)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "var(--pd)" }}>
                                {d.name[0].toUpperCase()}
                              </span>
                              {d.name}
                              <span style={{ fontSize: 11, color: "var(--g400)", fontWeight: 600 }}>{d.count} tx</span>
                            </span>
                            <span style={{ display: "flex", gap: 14, fontSize: 12 }}>
                              <span style={{ color: "var(--pd)" }}>{fmt(d.revenue)}</span>
                              <span style={{ color: "var(--green)" }}>+{fmt(profit)}</span>
                              <span style={{ color: margin >= 30 ? "var(--green)" : "var(--amber)", fontWeight: 800 }}>{margin.toFixed(0)}%</span>
                            </span>
                          </div>
                          <div style={{ height: 8, borderRadius: 4, background: "var(--g100)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,var(--p),var(--pd))", borderRadius: 4, transition: "width .4s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <table className="tbl">
                    <thead><tr><th>Staff</th><th className="text-right">Revenue</th><th className="text-right">Est. Cost</th><th className="text-right">Profit</th><th className="text-right">Margin</th><th className="text-right">Transactions</th></tr></thead>
                    <tbody>
                      {staffData.map(d => {
                        const profit = d.revenue - d.cost;
                        const margin = d.revenue > 0 ? (profit / d.revenue) * 100 : 0;
                        return (
                          <tr key={d.name}>
                            <td><strong>{d.name}</strong></td>
                            <td className="text-right"><strong style={{ color: "var(--pd)" }}>{fmt(d.revenue)}</strong></td>
                            <td className="text-right" style={{ color: "var(--amber)" }}>{fmt(d.cost)}</td>
                            <td className="text-right"><strong style={{ color: "var(--green)" }}>{fmt(profit)}</strong></td>
                            <td className="text-right"><span style={{ fontSize: 12, fontWeight: 700, color: margin >= 30 ? "var(--green)" : "var(--amber)" }}>{margin.toFixed(1)}%</span></td>
                            <td className="text-right" style={{ color: "var(--g500)" }}>{d.count}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </CardBody>
          </Card>
        )}

        {reportTab === "module" && (
          <Card>
            <CardHeader title="Profit & Loss by Module" />
            <CardBody noPad>
              {totalRevenue === 0 ? (
                <div className="nores" style={{ padding: 24 }}>No transactions match the current filters.</div>
              ) : (
                <table className="tbl">
                  <thead>
                    <tr><th>Module</th><th className="text-right">Revenue</th><th className="text-right">Est. Cost</th><th className="text-right">Profit</th><th className="text-right">Margin</th><th className="text-right">Tx</th></tr>
                  </thead>
                  <tbody>
                    {modData.map(d => (
                      <tr key={d.m}>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 28, height: 28, borderRadius: 7, background: MOD_COLORS[d.m] + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Icon name={modIcon(d.m)} size={14} color={MOD_COLORS[d.m]} />
                            </span>
                            <strong>{modLabel(d.m)}</strong>
                          </span>
                        </td>
                        <td className="text-right"><strong style={{ color: "var(--pd)" }}>{fmt(d.revenue)}</strong></td>
                        <td className="text-right" style={{ color: "var(--amber)" }}>{fmt(d.cost)}</td>
                        <td className="text-right"><strong style={{ color: "var(--green)" }}>{fmt(d.profit)}</strong></td>
                        <td className="text-right">
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 48, height: 6, borderRadius: 3, background: "var(--g100)", display: "inline-block", overflow: "hidden" }}>
                              <span style={{ display: "block", width: `${Math.min(d.margin, 100)}%`, height: "100%", background: d.margin >= 30 ? "var(--green)" : "var(--amber)", borderRadius: 3 }} />
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: d.margin >= 30 ? "var(--green)" : "var(--amber)" }}>{d.margin.toFixed(1)}%</span>
                          </span>
                        </td>
                        <td className="text-right" style={{ color: "var(--g500)" }}>{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "var(--g50)" }}>
                      <td><strong>TOTAL</strong></td>
                      <td className="text-right"><strong style={{ color: "var(--pd)" }}>{fmt(totalRevenue)}</strong></td>
                      <td className="text-right" style={{ color: "var(--amber)" }}>{fmt(totalCost)}</td>
                      <td className="text-right"><strong style={{ color: "var(--green)" }}>{fmt(totalProfit)}</strong></td>
                      <td className="text-right"><strong style={{ color: totalMargin >= 30 ? "var(--green)" : "var(--amber)" }}>{totalMargin.toFixed(1)}%</strong></td>
                      <td className="text-right" style={{ color: "var(--g500)" }}>{filtered.length}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </CardBody>
          </Card>
        )}

        <div style={{ marginTop: 14, fontSize: 12, color: "var(--g400)", fontStyle: "italic", display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="warning" size={13} color="var(--amber)" />
          Profit figures are estimates based on standard cost ratios (Drug Store 55%, Mart 65%, Hotel 40%, Restaurant 50%). Actual figures may vary.
        </div>
      </div>
    </div>
  );
}
