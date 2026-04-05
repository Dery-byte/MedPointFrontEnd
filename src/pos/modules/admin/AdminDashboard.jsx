// import { useApp } from "../../AppContext";
// import { fmt, dateStr, timeStr, modIcon, modLabel } from "../../helpers";
// import StatCard from "../../components/StatCard";
// import Badge from "../../components/Badge";
// import { Card, CardHeader, CardBody } from "../../components/Card";
// import { LOW_STOCK } from "../../constants";
// import Icon from "../../../shared/components/Icon";

// const MOD_COLORS = { drugstore: "#0891b2", mart: "#10b981", hotel: "#f59e0b", restaurant: "#8b5cf6" };

// export default function AdminDashboard() {
//   const { state, dispatch } = useApp();
//   const { transactions, users, drugs, products } = state;

//   const today = new Date().toDateString();
//   const todayRev = transactions.filter(t => new Date(t.date).toDateString() === today).reduce((s, t) => s + t.amount, 0);
//   const totalRev = transactions.reduce((s, t) => s + t.amount, 0);
//   const mods = ["drugstore", "mart", "hotel", "restaurant"];
//   const modRevs = mods.map(m => ({ m, v: transactions.filter(t => t.mod === m).reduce((s, t) => s + t.amount, 0) }));
//   const lowCount = drugs.filter(d => d.stock < LOW_STOCK).length + products.filter(p => p.stock < LOW_STOCK).length;
//   const activeStaff = users.filter(u => u.active && u.role !== "superadmin").length;

//   return (
//     <div>
//       <div className="pg-hd">
//         <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <Icon name="dashboard" size={22} color="var(--p)" />Admin Dashboard
//         </h2>
//         <p>{dateStr()} · {timeStr()}</p>
//       </div>
//       <div className="stats-grid">
//         <StatCard icon={<Icon name="revenue" size={24} color="var(--p)" />} value={fmt(todayRev)} label="Revenue Today" />
//         <StatCard icon={<Icon name="profit" size={24} color="var(--green)" />} value={fmt(totalRev)} label="Total Revenue" />
//         <StatCard icon={<Icon name="staff" size={24} color="var(--pd)" />} value={activeStaff} label="Active Staff" />
//         <StatCard icon={<Icon name="warning" size={24} color="var(--red)" />} value={lowCount} label="Low Stock Items" valueStyle={{ color: "var(--red)" }} />
//       </div>
//       <div className="grid2 section-gap">
//         <Card>
//           <CardHeader title={<span style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon name="revenue" size={14} color="var(--g600)" />Revenue by Module</span>} />
//           <CardBody>
//             {modRevs.map(({ m, v }) => (
//               <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--g100)" }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                   <span style={{ width: 32, height: 32, borderRadius: 8, background: (MOD_COLORS[m] || "#0891b2") + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                     <Icon name={modIcon(m)} size={16} color={MOD_COLORS[m] || "var(--pd)"} />
//                   </span>
//                   <span style={{ fontWeight: 700, color: "var(--g700)" }}>{modLabel(m)}</span>
//                 </div>
//                 <strong style={{ color: "var(--pd)" }}>{fmt(v)}</strong>
//               </div>
//             ))}
//           </CardBody>
//         </Card>
//         <Card>
//           <CardHeader title={<span style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon name="transactions" size={14} color="var(--g600)" />Recent Transactions</span>} />
//           <CardBody noPad>
//             <table className="tbl">
//               <thead><tr><th>Staff</th><th>Module</th><th>Amount</th></tr></thead>
//               <tbody>
//                 {transactions.slice(0, 6).map(t => (
//                   <tr key={t.id}>
//                     <td>{t.staff}</td>
//                     <td>
//                       <Badge type="blue">
//                         <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
//                           <Icon name={modIcon(t.mod)} size={12} color="var(--pd)" />{modLabel(t.mod)}
//                         </span>
//                       </Badge>
//                     </td>
//                     <td><strong style={{ color: "var(--pd)" }}>{fmt(t.amount)}</strong></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//       </div>
//       {lowCount > 0 && (
//         <div className="low-stock-alert" style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <Icon name="warning" size={15} color="var(--red)" />
//           <span><strong>{lowCount} items</strong> are low on stock.{" "}
//             <a href="#" onClick={e => { e.preventDefault(); dispatch({ type: "NAV", mod: "admin", page: "stock" }); }} style={{ color: "inherit", fontWeight: 800 }}>View Stock →</a>
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }



import { useAdminData } from "../../hooks/useAdminData";
import { fmt, dateStr, timeStr, modIcon, modLabel } from "../../helpers";
import StatCard from "../../components/StatCard";
import Badge from "../../components/Badge";
import { Card, CardHeader, CardBody } from "../../components/Card";
import { LOW_STOCK } from "../../constants";
import Icon from "../../../shared/components/Icon";

const MOD_COLORS = { drugstore: "#0891b2", mart: "#10b981", hotel: "#f59e0b", restaurant: "#8b5cf6", storefront: "#6366f1" };

// ── Skeleton shimmer primitives ───────────────────────────────────────────────
function Bone({ w = "100%", h = 16, r = 8, style: s = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "var(--g100)", position: "relative",
      overflow: "hidden", flexShrink: 0, ...s,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.6) 50%, transparent 100%)",
        backgroundSize: "400px 100%",
        animation: "sk-shimmer 1.5s ease-in-out infinite",
      }} />
    </div>
  );
}

function SkeletonStatCard({ delay = 0 }) {
  return (
    <div className="stat-card" style={{ animation: `sk-fade .45s ease ${delay}s both` }}>
      <Bone w={38} h={38} r={10} s={{ marginBottom: 14 }} />
      <Bone w="58%" h={26} r={6} s={{ marginBottom: 10 }} />
      <Bone w="42%" h={12} r={5} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="pg-hd" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Bone w={200} h={24} r={6} />
        <Bone w={150} h={13} r={5} />
      </div>

      <div className="stats-grid">
        {[0, 0.07, 0.14, 0.21].map((d, i) => <SkeletonStatCard key={i} delay={d} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 4 }}>
        <div className="card" style={{ animation: "sk-fade .45s ease .26s both" }}>
          <div className="card-hd"><Bone w={150} h={13} r={5} /></div>
          <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[80, 96, 72, 88].map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 3 ? "1px solid var(--g100)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Bone w={30} h={30} r={8} />
                  <Bone w={w} h={12} r={5} />
                </div>
                <Bone w={58} h={12} r={5} />
              </div>
            ))}
          </div>
        </div>

        <div className="card dash-tx-card" style={{ animation: "sk-fade .45s ease .32s both" }}>
          <div className="card-hd"><Bone w={170} h={13} r={5} /></div>
          <div>
            {[100, 86, 114, 90, 72, 98].map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 20px", borderBottom: i < 5 ? "1px solid var(--g100)" : "none" }}>
                <Bone w={w} h={12} r={5} />
                <Bone w={48} h={20} r={10} />
                <Bone w={52} h={12} r={5} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { transactions, users, drugs, products, booting, dispatch, enabledModules } = useAdminData();

  const today     = new Date().toDateString();
  const todayRev  = transactions
    .filter(t => new Date(t.date || t.createdAt).toDateString() === today)
    .filter(t => (t.status ?? "active") !== "cancelled")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalRev  = transactions
    .filter(t => (t.status ?? "active") !== "cancelled")
    .reduce((s, t) => s + Number(t.amount), 0);

  const mods    = enabledModules;
  const modRevs = mods.map(m => ({
    m,
    v: transactions
      .filter(t => (t.mod || t.module?.toLowerCase()) === m)
      .filter(t => (t.status ?? "active") !== "cancelled")
      .reduce((s, t) => s + Number(t.amount), 0),
  }));

  const lowCount    = drugs.filter(d => d.stock < LOW_STOCK).length
                    + products.filter(p => p.stock < LOW_STOCK).length;
  const activeStaff = users.filter(u => u.active && u.role !== "superadmin").length;

  if (booting) return <DashboardSkeleton />;

  return (
    <div>
      <div className="pg-hd">
        <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="dashboard" size={22} color="var(--p)" />Admin Dashboard
        </h2>
        <p>{dateStr()} · {timeStr()}</p>
      </div>

      <div className="stats-grid">
        <StatCard icon={<Icon name="revenue" size={24} color="var(--p)"    />} value={fmt(todayRev)}  label="Revenue Today"   />
        <StatCard icon={<Icon name="profit"  size={24} color="var(--green)"/>} value={fmt(totalRev)}  label="Total Revenue"   />
        <StatCard icon={<Icon name="staff"   size={24} color="var(--pd)"   />} value={activeStaff}    label="Active Staff"    />
        <StatCard icon={<Icon name="warning" size={24} color="var(--red)"  />} value={lowCount}       label="Low Stock Items"
                  valueStyle={{ color: "var(--red)" }} />
      </div>

      <div className="grid2 section-gap">
        <Card>
          <CardHeader title={<span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Icon name="revenue" size={14} color="var(--g600)" />Revenue by Module
          </span>} />
          <CardBody>
            {modRevs.filter(({ v }) => v > 0).map(({ m, v }) => (
              <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "10px 0", borderBottom: "1px solid var(--g100)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8,
                                 background: (MOD_COLORS[m] || "#0891b2") + "18",
                                 display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={modIcon(m)} size={16} color={MOD_COLORS[m] || "var(--pd)"} />
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--g700)" }}>{modLabel(m)}</span>
                </div>
                <strong style={{ color: "var(--pd)" }}>{fmt(v)}</strong>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card className="dash-tx-card">
          <CardHeader title={<span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Icon name="transactions" size={14} color="var(--g600)" />Recent Transactions
          </span>} />
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Staff</th><th>Module</th><th>Amount</th></tr></thead>
              <tbody>
                {transactions.slice(0, 6).map(t => {
                  const tMod = t.mod || t.module?.toLowerCase();
                  return (
                  <tr key={t.id}>
                    <td>{t.staff || t.staffName}</td>
                    <td>
                      <Badge type="blue">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Icon name={modIcon(tMod)} size={12} color="var(--pd)" />
                          {modLabel(tMod)}
                        </span>
                      </Badge>
                    </td>
                    <td><strong style={{ color: "var(--pd)" }}>{fmt(Number(t.amount))}</strong></td>
                  </tr>
                );})}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      {lowCount > 0 && (
        <div className="low-stock-alert" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="warning" size={15} color="var(--red)" />
          <span><strong>{lowCount} items</strong> are low on stock.{" "}
            <a href="#" onClick={e => { e.preventDefault();
              dispatch({ type: "NAV", mod: "admin", page: "stock" }); }}
               style={{ color: "inherit", fontWeight: 800 }}>View Stock →</a>
          </span>
        </div>
      )}
    </div>
  );
}