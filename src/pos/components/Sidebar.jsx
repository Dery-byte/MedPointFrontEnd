import { useApp } from "../AppContext";
import { useConfig } from "../../config/ConfigContext";
import { modIcon, modLabel } from "../helpers";
import Icon from "../../shared/components/Icon";

export default function Sidebar({ collapsed, onToggle }) {
  const { state, dispatch } = useApp();
  const { me, mod, page } = state;
  const { config } = useConfig();

  const nav = (m, pg) => {
    dispatch({ type: "NAV", mod: m, page: pg });
    if (window.innerWidth < 768) onToggle();
  };
  const active = (m, pg) => mod === m && page === pg;

  const Item = ({ modKey, pg, icon, label }) => (
    <div
      className={`sb-item ${active(modKey, pg) ? "active" : ""}`}
      onClick={() => nav(modKey, pg)}
      title={collapsed ? label : undefined}
    >
      <span className="sb-ico"><Icon name={icon} size={16} /></span>
      {!collapsed && <span className="sb-label-text">{label}</span>}
    </div>
  );

  const em = config.enabledModules ?? ["drugstore", "mart", "hotel", "restaurant", "storefront"];

  const visibleModules = me.role === "superadmin"
    ? em
    : (me.modules ?? []).filter(m => em.includes(m));

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      {me.role === "superadmin" && (
        <>
          {!collapsed && <div className="sb-label">Admin</div>}
          <Item modKey="admin" pg="dashboard"    icon="dashboard"    label="Dashboard" />
          <Item modKey="admin" pg="staff"        icon="staff"        label="Staff" />
          <Item modKey="admin" pg="products"     icon="package"      label="Products" />
          <Item modKey="admin" pg="stock"        icon="stock"        label="Stock" />
          <Item modKey="admin" pg="revenue"      icon="revenue"      label="Revenue" />
          <Item modKey="admin" pg="transactions" icon="transactions" label="Transactions" />
          <Item modKey="admin" pg="reports"      icon="bar-chart"    label="Reports" />
          <Item modKey="admin" pg="pricing"      icon="pricing"      label="Pricing" />
          {!collapsed && <div className="sb-label" style={{ marginTop: 8 }}>Management</div>}
          {collapsed && <div className="sb-divider" />}
          {em.includes("drugstore")  && <Item modKey="admin" pg="manage-drugstore"  icon="drugstore"  label="Drug Store" />}
          {em.includes("mart")       && <Item modKey="admin" pg="manage-mart"       icon="mart"       label="Mart" />}
          {em.includes("hotel")      && <Item modKey="admin" pg="manage-hotel"      icon="hotel"      label="Hotel" />}
          {em.includes("restaurant") && <Item modKey="admin" pg="manage-restaurant" icon="restaurant" label="Restaurant" />}
          {em.includes("storefront") && (
            <>
              {!collapsed && <div className="sb-label" style={{ marginTop: 8 }}>Store</div>}
              {collapsed && <div className="sb-divider" />}
              <Item modKey="storefront" pg="dashboard"  icon="dashboard"      label="Overview" />
              <Item modKey="storefront" pg="categories" icon="category"       label="Categories" />
              <Item modKey="storefront" pg="orders"     icon="clipboard-list" label="Orders" />
            </>
          )}
          {!collapsed && <div className="sb-label" style={{ marginTop: 8 }}>Modules</div>}
          {collapsed && <div className="sb-divider" />}
        </>
      )}
      {me.role !== "superadmin" && !collapsed && (
        <div className="sb-label">My Modules</div>
      )}

      {visibleModules.filter(m => m !== "storefront").map(m => (
        <Item key={m} modKey={m} pg="home" icon={modIcon(m)} label={modLabel(m)} />
      ))}

    </aside>
  );
}
