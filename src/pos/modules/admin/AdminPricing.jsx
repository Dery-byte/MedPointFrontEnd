// import { useState } from "react";
// import { useApp } from "../../AppContext";
// import { fmt } from "../../helpers";
// import { Card, CardHeader, CardBody } from "../../components/Card";

// function PriceEditor({ label, value, onSave }) {
//   const [editing, setEditing] = useState(false);
//   const [val, setVal] = useState(value);

//   const save = () => {
//     const n = parseFloat(val);
//     if (!isNaN(n) && n > 0) { onSave(n); setEditing(false); }
//   };

//   if (editing) return (
//     <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//       <span>GH₵</span>
//       <input className="form-input" type="number" step="0.01" value={val} onChange={e => setVal(e.target.value)} style={{ width: 90, padding: "4px 8px" }} autoFocus onKeyDown={e => e.key === "Enter" && save()} />
//       <button className="btn btn-p btn-sm" onClick={save}>✓</button>
//       <button className="btn btn-sec btn-sm" onClick={() => { setVal(value); setEditing(false); }}>✕</button>
//     </div>
//   );

//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//       <strong style={{ color: "var(--pd)" }}>{fmt(value)}</strong>
//       <button className="btn btn-sec btn-sm" onClick={() => setEditing(true)}>Edit</button>
//     </div>
//   );
// }

// export default function AdminPricing() {
//   const { state, dispatch } = useApp();
//   const { drugs, products, services, menuItems, nondrugs, roomCats } = state;
//   const [tab, setTab] = useState("drugs");

//   const updateDrug = (id, price) => dispatch({ type: "UPDATE_DRUG", drug: { ...drugs.find(d => d.id === id), price } });
//   const updateProduct = (id, price) => dispatch({ type: "UPDATE_PRODUCT", product: { ...products.find(p => p.id === id), price } });
//   const updateService = (id, price) => dispatch({ type: "UPDATE_SERVICE", service: { ...services.find(s => s.id === id), price } });
//   const updateMenuItem = (id, price) => dispatch({ type: "UPDATE_MENU_ITEM", item: { ...menuItems.find(m => m.id === id), price } });
//   const updateNonDrug = (id, price) => dispatch({ type: "UPDATE_NONDRUG", item: { ...nondrugs.find(n => n.id === id), price } });
//   const updateRoomCat = (name, price) => dispatch({ type: "UPDATE_ROOM_CAT", cat: { ...roomCats.find(r => r.name === name), price } });

//   const tabs = [
//     { key: "drugs", label: "💊 Drugs" },
//     { key: "services", label: "Services" },
//     { key: "nondrugs", label: "Non-Drug" },
//     { key: "products", label: "Mart" },
//     { key: "menu", label: "🍽️ Restaurant" },
//     { key: "hotel", label: "🏨 Hotel" },
//   ];

//   return (
//     <div>
//       <div className="pg-hd"><h2>Global Pricing Dashboard</h2><p>Update prices across all modules in one place</p></div>
//       <div className="ptabs" style={{ flexWrap: "wrap", marginBottom: 20 }}>
//         {tabs.map(t => <button key={t.key} className={`ptab ${tab === t.key ? "on" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
//       </div>

//       {tab === "drugs" && (
//         <Card>
//           <CardHeader title="Drug Prices" />
//           <CardBody noPad>
//             <table className="tbl">
//               <thead><tr><th>Drug</th><th>Category</th><th>Current Price</th><th>Update</th></tr></thead>
//               <tbody>
//                 {drugs.map(d => (
//                   <tr key={d.id}>
//                     <td><strong>{d.name}</strong></td>
//                     <td style={{ color: "var(--g500)" }}>{d.cat}</td>
//                     <td>{fmt(d.price)}</td>
//                     <td><PriceEditor label={d.name} value={d.price} onSave={p => updateDrug(d.id, p)} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//       )}

//       {tab === "services" && (
//         <Card>
//           <CardHeader title="Service Prices" />
//           <CardBody noPad>
//             <table className="tbl">
//               <thead><tr><th>Service</th><th>Category</th><th>Current Price</th><th>Update</th></tr></thead>
//               <tbody>
//                 {services.map(s => (
//                   <tr key={s.id}>
//                     <td><strong>{s.name}</strong></td>
//                     <td style={{ color: "var(--g500)" }}>{s.cat}</td>
//                     <td>{fmt(s.price)}</td>
//                     <td><PriceEditor label={s.name} value={s.price} onSave={p => updateService(s.id, p)} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//       )}

//       {tab === "nondrugs" && (
//         <Card>
//           <CardHeader title="Non-Drug Item Prices" />
//           <CardBody noPad>
//             <table className="tbl">
//               <thead><tr><th>Item</th><th>Category</th><th>Current Price</th><th>Update</th></tr></thead>
//               <tbody>
//                 {nondrugs.map(n => (
//                   <tr key={n.id}>
//                     <td><strong>{n.name}</strong></td>
//                     <td style={{ color: "var(--g500)" }}>{n.cat}</td>
//                     <td>{fmt(n.price)}</td>
//                     <td><PriceEditor label={n.name} value={n.price} onSave={p => updateNonDrug(n.id, p)} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//       )}

//       {tab === "products" && (
//         <Card>
//           <CardHeader title="Mart Product Prices" />
//           <CardBody noPad>
//             <table className="tbl">
//               <thead><tr><th>Product</th><th>Category</th><th>Current Price</th><th>Update</th></tr></thead>
//               <tbody>
//                 {products.map(p => (
//                   <tr key={p.id}>
//                     <td><strong>{p.name}</strong></td>
//                     <td style={{ color: "var(--g500)" }}>{p.cat}</td>
//                     <td>{fmt(p.price)}</td>
//                     <td><PriceEditor label={p.name} value={p.price} onSave={pr => updateProduct(p.id, pr)} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//       )}

//       {tab === "menu" && (
//         <Card>
//           <CardHeader title="Restaurant Menu Prices" />
//           <CardBody noPad>
//             <table className="tbl">
//               <thead><tr><th>Item</th><th>Type</th><th>Category</th><th>Current Price</th><th>Update</th></tr></thead>
//               <tbody>
//                 {menuItems.map(m => (
//                   <tr key={m.id}>
//                     <td><strong>{m.name}</strong></td>
//                     <td><span style={{ fontSize: 11 }}>{m.type === "food" ? "Food" : "Drink"}</span></td>
//                     <td style={{ color: "var(--g500)" }}>{m.cat}</td>
//                     <td>{fmt(m.price)}</td>
//                     <td><PriceEditor label={m.name} value={m.price} onSave={p => updateMenuItem(m.id, p)} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//       )}

//       {tab === "hotel" && (
//         <Card>
//           <CardHeader title="Room Category Prices" />
//           <CardBody noPad>
//             <table className="tbl">
//               <thead><tr><th>Category</th><th>Icon</th><th>Current Price/Night</th><th>Update</th></tr></thead>
//               <tbody>
//                 {roomCats.map(rc => (
//                   <tr key={rc.name}>
//                     <td><strong>{rc.name}</strong></td>
//                     <td style={{ fontSize: 20 }}>{rc.icon}</td>
//                     <td>{fmt(rc.price)}</td>
//                     <td><PriceEditor label={rc.name} value={rc.price} onSave={p => updateRoomCat(rc.name, p)} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//       )}
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { useAdminData } from "../../hooks/useAdminData";
import { fmt } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";
import api from "../../../shared/services/api";
import NoModulesBanner from "../../components/NoModulesBanner";

// ── Shared price-update helpers ───────────────────────────────────────────────

function apiErr(err, fallback = "Failed to update price. Please try again.") {
  return err?.response?.data?.message || fallback;
}

// Dedicated PATCH /price endpoints
const pricePatch = {
  drug:       (id, price) => api.patch(`/drugstore/drugs/${id}/price`,    { price }),
  nondrug:    (id, price) => api.patch(`/drugstore/non-drug-items/${id}/price`, { price }), // uses full PUT — see note below
  service:    (id, price) => api.patch(`/drugstore/services/${id}/price`, { price }),       // uses full PUT — see note below
  product:    (id, price) => api.patch(`/mart/products/${id}/price`,      { price }),
  menuItem:   (id, price) => api.put(`/restaurant/menu-items/${id}`,      null),            // overridden per-item below
  roomCat:    (id, price) => api.put(`/hotel/room-categories/${id}`,      { price }),
};

// ── PriceEditor ───────────────────────────────────────────────────────────────
// saveFn: async (newPrice) — called when user confirms
function PriceEditor({ value, saveFn }) {
  const [editing, setEditing]   = useState(false);
  const [val, setVal]           = useState(value);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const save = async () => {
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) { setError("Invalid price."); return; }
    setSaving(true); setError("");
    try {
      await saveFn(n);
      setEditing(false);
    } catch (err) {
      setError(apiErr(err));
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => { setVal(value); setEditing(false); setError(""); };

  if (editing) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>GH₵</span>
        <input
          className="form-input"
          type="number"
          step="0.01"
          value={val}
          onChange={e => setVal(e.target.value)}
          style={{ width: 90, padding: "4px 8px" }}
          autoFocus
          disabled={saving}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
        />
        <button className="btn btn-p btn-sm" onClick={save} disabled={saving}>{saving ? "…" : "✓"}</button>
        <button className="btn btn-sec btn-sm" onClick={cancel} disabled={saving}>✕</button>
      </div>
      {error && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>{error}</div>}
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <strong style={{ color: "var(--pd)" }}>{fmt(value)}</strong>
      <button className="btn btn-sec btn-sm" onClick={() => setEditing(true)}>Edit</button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPricing() {
  const { drugs, products, services, menuItems, nondrugs, roomCats, dispatch, enabledModules } = useAdminData();

  // Build tabs dynamically — only show tabs for enabled modules
  const allTabs = [
    enabledModules.includes("drugstore")  && { key: "drugs",    label: "Drugs",      module: "drugstore"  },
    enabledModules.includes("drugstore")  && { key: "services", label: "Services",   module: "drugstore"  },
    enabledModules.includes("drugstore")  && { key: "nondrugs", label: "Non-Drug",   module: "drugstore"  },
    enabledModules.includes("mart")       && { key: "products", label: "Mart",       module: "mart"       },
    enabledModules.includes("restaurant") && { key: "menu",     label: "Restaurant", module: "restaurant" },
    enabledModules.includes("hotel")      && { key: "hotel",    label: "Hotel",      module: "hotel"      },
  ].filter(Boolean);

  const [tab, setTab] = useState(allTabs[0]?.key ?? "drugs");

  // If the active tab's module gets disabled mid-session, reset to first available tab
  useEffect(() => {
    if (!allTabs.some(t => t.key === tab)) {
      setTab(allTabs[0]?.key ?? "drugs");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledModules]);

  // ── Save handlers — call API then update AppContext ────────────────────────

  const saveDrugPrice = (drug) => async (price) => {
    const { data } = await api.patch(`/drugstore/drugs/${drug.id}/price`, { price });
    dispatch({ type: "UPDATE_DRUG", drug: { ...drug, price: parseFloat(data.price) } });
  };

  const saveServicePrice = (svc) => async (price) => {
    // No dedicated /price endpoint for services — use full PUT with existing fields
    const { data } = await api.put(`/drugstore/services/${svc.id}`, {
      name: svc.name,
      category: svc.cat,
      price,
    });
    dispatch({ type: "UPDATE_SERVICE", service: { ...svc, price: parseFloat(data.price) } });
  };

  const saveNonDrugPrice = (item) => async (price) => {
    // No dedicated /price endpoint for non-drugs — use full PUT with existing fields
    const { data } = await api.put(`/drugstore/non-drug-items/${item.id}`, {
      name: item.name,
      category: item.cat,
      price,
    });
    dispatch({ type: "UPDATE_NONDRUG", item: { ...item, price: parseFloat(data.price) } });
  };

  const saveProductPrice = (product) => async (price) => {
    const { data } = await api.patch(`/mart/products/${product.id}/price`, { price });
    dispatch({ type: "UPDATE_PRODUCT", product: { ...product, price: parseFloat(data.price) } });
  };

  const saveMenuItemPrice = (menuItem) => async (price) => {
    // Restaurant uses full PUT for updates
    const { data } = await api.put(`/restaurant/menu-items/${menuItem.id}`, {
      name: menuItem.name,
      category: menuItem.cat,
      type: menuItem.type.toUpperCase(),
      price,
    });

    console.log(data);
    dispatch({ type: "UPDATE_MENU_ITEM", item: { ...menuItem, price: parseFloat(data.price) } });
  };


  const saveRoomCatPrice = (rc) => async (price) => {
    const { data } = await api.put(`/hotel/room-categories/${rc.id}`, { 
        pricePerNight: parseFloat(price)  // match DTO field name + ensure it's a number
    });
    console.log(data, "This is payload");
    dispatch({ type: "UPDATE_ROOM_CAT", cat: { ...rc, price: parseFloat(data.pricePerNight) } });
};

  // const saveRoomCatPrice = (rc) => async (price) => {
  //   const { data } = await api.put(`/hotel/room-categories/${rc.id}`, { price });
  //   console(data, "This is payload")
  //   // Backend returns RoomCategoryResponse — update roomCat by name (app uses name as key)
  //   dispatch({ type: "UPDATE_ROOM_CAT", cat: { ...rc, price: parseFloat(data.pricePerNight) } });
  // };

  if (allTabs.length === 0) {
    return (
      <div>
        <div className="pg-hd"><h2>Global Pricing Dashboard</h2><p>Update prices across all modules in one place</p></div>
        <NoModulesBanner />
      </div>
    );
  }

  return (
    <div>
      <div className="pg-hd"><h2>Global Pricing Dashboard</h2><p>Update prices across all modules in one place</p></div>
      <div className="ptabs" style={{ flexWrap: "wrap", marginBottom: 20 }}>
        {allTabs.map(t => (
          <button key={t.key} className={`ptab ${tab === t.key ? "on" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "drugs" && (
        <Card>
          <CardHeader title="Drug Prices" />
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Drug</th><th>Category</th><th>Current Price</th><th>Update</th></tr></thead>
              <tbody>
                {drugs.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong></td>
                    <td style={{ color: "var(--g500)" }}>{d.cat}</td>
                    <td>{fmt(d.price)}</td>
                    <td><PriceEditor value={d.price} saveFn={saveDrugPrice(d)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === "services" && (
        <Card>
          <CardHeader title="Service Prices" />
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Service</th><th>Category</th><th>Current Price</th><th>Update</th></tr></thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td style={{ color: "var(--g500)" }}>{s.cat}</td>
                    <td>{fmt(s.price)}</td>
                    <td><PriceEditor value={s.price} saveFn={saveServicePrice(s)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === "nondrugs" && (
        <Card>
          <CardHeader title="Non-Drug Item Prices" />
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Item</th><th>Category</th><th>Current Price</th><th>Update</th></tr></thead>
              <tbody>
                {nondrugs.map(n => (
                  <tr key={n.id}>
                    <td><strong>{n.name}</strong></td>
                    <td style={{ color: "var(--g500)" }}>{n.cat}</td>
                    <td>{fmt(n.price)}</td>
                    <td><PriceEditor value={n.price} saveFn={saveNonDrugPrice(n)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === "products" && (
        <Card>
          <CardHeader title="Mart Product Prices" />
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Product</th><th>Category</th><th>Current Price</th><th>Update</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td style={{ color: "var(--g500)" }}>{p.cat}</td>
                    <td>{fmt(p.price)}</td>
                    <td><PriceEditor value={p.price} saveFn={saveProductPrice(p)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === "menu" && (
        <Card>
          <CardHeader title="Restaurant Menu Prices" />
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Item</th><th>Type</th><th>Category</th><th>Current Price</th><th>Update</th></tr></thead>
              <tbody>
                {menuItems.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td><span style={{ fontSize: 11 }}>{m.type === "food" ? "Food" : "Drink"}</span></td>
                    <td style={{ color: "var(--g500)" }}>{m.cat}</td>
                    <td>{fmt(m.price)}</td>
                    <td><PriceEditor value={m.price} saveFn={saveMenuItemPrice(m)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === "hotel" && (
        <Card>
          <CardHeader title="Room Category Prices" />
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Category</th><th>Icon</th><th>Rooms</th><th>Current Price/Night</th><th>Update</th></tr></thead>
              <tbody>
                {roomCats.map(rc => (
                  <tr key={rc.name}>
                    <td><strong>{rc.name}</strong></td>
                    <td style={{ fontSize: 20 }}>{rc.icon}</td>
                    <td style={{ color: "var(--g500)", fontSize: 12 }}>
                      {rc.totalRooms ?? "—"} total · {rc.availableRooms ?? "—"} free
                    </td>
                    <td>{fmt(rc.price)}</td>
                    <td><PriceEditor value={rc.price} saveFn={saveRoomCatPrice(rc)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}