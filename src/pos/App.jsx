import { useState, useEffect } from "react";
import { useApp } from "./AppContext";
import { useConfig } from "../config/ConfigContext";
import AuthScreen from "./components/AuthScreen";
import BootLoader from "./components/BootLoader";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import ReceiptModal from "./components/ReceiptModal";
import {
  AdminDashboard, AdminStaff, AdminStock, AdminRevenue, AdminTransactions,
  AdminDrugStore, AdminMart, AdminHotel, AdminRestaurant, AdminPricing, AdminProducts,
  AdminReports
} from "./modules/admin/index";
import DrugStoreModule from "./modules/drugstore/index";
import MartModule from "./modules/mart/index";
import HotelModule from "./modules/hotel/index";
import RestaurantModule from "./modules/restaurant/index";
import StorefrontDashboard from "./modules/storefront/StorefrontDashboard";
import StorefrontCategories from "./modules/storefront/StorefrontCategories";
import StorefrontOrders from "./modules/storefront/StorefrontOrders";

function PageContent() {
  const { state } = useApp();
  const { mod, page } = state;
  const { config } = useConfig();
  const em = config.enabledModules ?? ["drugstore", "mart", "hotel", "restaurant", "storefront"];
  const key = `${mod}:${page}`;

  const pages = {
    "admin:dashboard":          <AdminDashboard />,
    "admin:staff":              <AdminStaff />,
    "admin:products":           <AdminProducts />,
    "admin:stock":              <AdminStock />,
    "admin:revenue":            <AdminRevenue />,
    "admin:transactions":       <AdminTransactions />,
    "admin:pricing":            <AdminPricing />,
    "admin:reports":            <AdminReports />,
    ...(em.includes("drugstore")  && { "admin:manage-drugstore":  <AdminDrugStore /> }),
    ...(em.includes("mart")       && { "admin:manage-mart":       <AdminMart /> }),
    ...(em.includes("hotel")      && { "admin:manage-hotel":      <AdminHotel /> }),
    ...(em.includes("restaurant") && { "admin:manage-restaurant": <AdminRestaurant /> }),
    ...(em.includes("drugstore")  && { "drugstore:home": <DrugStoreModule /> }),
    ...(em.includes("mart")       && { "mart:home":      <MartModule /> }),
    ...(em.includes("hotel")      && { "hotel:home":     <HotelModule /> }),
    ...(em.includes("restaurant") && { "restaurant:home": <RestaurantModule /> }),
    ...(em.includes("storefront") && {
      "storefront:dashboard":   <StorefrontDashboard />,
      "storefront:categories":  <StorefrontCategories />,
      "storefront:orders":      <StorefrontOrders />,
    }),
  };

  return (
    <main className="main">
      {pages[key] || (
        <div className="empty-st">
          <div className="empty-st-ico" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--g300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <p>Page not found</p>
        </div>
      )}
    </main>
  );
}

export default function App() {
  const { state } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("pos_dark_mode") === "true"
  );

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const toggleDark = () => {
    setDarkMode(d => {
      const next = !d;
      localStorage.setItem("pos_dark_mode", String(next));
      return next;
    });
  };

  if (!state.me) return <AuthScreen />;
  if (state.booting) return <BootLoader progress={state.bootProgress} done={false} />;

  return (
    <div className={`app-wrap${darkMode ? " pos-dark" : ""}`}>
      <Topbar onSidebarToggle={() => setSidebarOpen(o => !o)} darkMode={darkMode} onToggleDark={toggleDark} />
      <div className="app-body" data-sidebar={sidebarOpen ? "open" : "collapsed"}>
        {sidebarOpen && (
          <div className="sb-overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
        <PageContent />
      </div>
      <ReceiptModal />
      <div id="print-zone" style={{ display: "none" }} />
    </div>
  );
}
