// Ported from medpoint-store-fixed/src/admin/dashboard/AdminHome.jsx
// Changed: import paths updated to shared services; no AdminContext dependency
import { useState, useEffect } from "react";
import MartService from "../../../store/services/martService";
import { getStoreOrders } from "../../../store/services/orderService";
import Icon from "../../../shared/components/Icon";

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="stat-icon" style={{ color }}><Icon name={icon} size={20} /></div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function fmt(n) { return `GH₵ ${Number(n).toFixed(2)}`; }

export default function StorefrontDashboard() {
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prods, ords] = await Promise.all([
          MartService.getAllAdmin(),
          getStoreOrders(),
        ]);
        setProducts(prods);
        setOrders(ords);
      } catch { /* ignore — API unavailable */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const totalOrderValue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const lowStock = products.filter(p => p.lowStock || p.stock <= 5).length;
  const outOfStock = products.filter(p => p.stock <= 0).length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    .slice(0, 5);
  const lowStockProducts = products
    .filter(p => p.stock > 0 && p.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Store Dashboard</h1>
        <p className="admin-page-sub">E-commerce overview</p>
      </div>

      <div className="admin-stats-grid">
        <StatCard icon="package"     label="Total Products" value={loading ? "—" : products.length} sub="Active listings"        color="var(--primary, #1e4d2b)" />
        <StatCard icon="trending-up" label="Total Orders"   value={loading ? "—" : orders.length}   sub="All time"               color="#10b981" />
        <StatCard icon="revenue"     label="Revenue"        value={loading ? "—" : fmt(totalOrderValue)} sub="From store orders" color="#8b5cf6" />
        <StatCard icon="alert"       label="Low Stock"      value={loading ? "—" : lowStock}         sub={`${outOfStock} out of stock`} color="#f59e0b" />
      </div>

      <div className="admin-dashboard-cols">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title"><Icon name="clipboard-list" size={16} /> Recent orders</h2>
          </div>
          {loading ? (
            <div className="admin-loading-rows">{[1,2,3].map(i => <div key={i} className="skel skel-row" />)}</div>
          ) : recentOrders.length === 0 ? (
            <div className="admin-empty-state"><Icon name="clipboard-list" size={32} /><p>No orders yet</p></div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Reference</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id ?? o.reference}>
                    <td><code className="ref-code">{o.reference ?? o.id}</code></td>
                    <td>{o.customerName ?? "Guest"}</td>
                    <td>{fmt(o.total ?? 0)}</td>
                    <td><span className={`order-status-badge order-status-${(o.status ?? "pending").toLowerCase()}`}>{o.status ?? "Pending"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title"><Icon name="alert" size={16} color="#f59e0b" /> Low stock alerts</h2>
          </div>
          {loading ? (
            <div className="admin-loading-rows">{[1,2,3].map(i => <div key={i} className="skel skel-row" />)}</div>
          ) : lowStockProducts.length === 0 ? (
            <div className="admin-empty-state"><Icon name="check-circle" size={32} /><p>All products well stocked</p></div>
          ) : (
            <div className="low-stock-list">
              {lowStockProducts.map(p => (
                <div key={p.id} className="low-stock-row">
                  <div className="low-stock-info">
                    <span className="low-stock-name">{p.name}</span>
                    <span className="low-stock-cat">{p.cat}</span>
                  </div>
                  <div className="low-stock-count">
                    <div className="stock-indicator" style={{ background: p.stock === 0 ? "#fecaca" : p.stock <= 3 ? "#fed7aa" : "#fef3c7" }}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
