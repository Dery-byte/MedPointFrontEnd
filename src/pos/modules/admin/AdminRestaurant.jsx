// import { useState } from "react";
import ModalPortal from "../../components/ModalPortal";
// import { useApp } from "../../AppContext";
// import { fmt } from "../../helpers";
// import { Card, CardHeader, CardBody } from "../../components/Card";

// const FOOD_CATS = ["Starters", "Main Course", "Snacks", "Desserts", "Other"];
// const DRINK_CATS = ["Soft Drinks", "Alcoholic", "Hot Drinks", "Other"];

// function MenuItemModal({ item, onClose }) {
//   const { dispatch } = useApp();
//   const isEdit = !!item;
//   const [name, setName] = useState(item?.name || "");
//   const [type, setType] = useState(item?.type || "food");
//   const [cat, setCat] = useState(item?.cat || FOOD_CATS[0]);
//   const [price, setPrice] = useState(item?.price || "");
//   const [error, setError] = useState("");

//   const cats = type === "food" ? FOOD_CATS : DRINK_CATS;

//   const submit = () => {
//     if (!name || !price) { setError("All fields required."); return; }
//     const obj = { name, type, cat, price: parseFloat(price) };
//     if (isEdit) dispatch({ type: "UPDATE_MENU_ITEM", item: { ...item, ...obj } });
//     else dispatch({ type: "ADD_MENU_ITEM", item: obj });
//     onClose();
//   };

//   return (
//     <div className="modal-bg">
//       <div className="modal">
//         <div className="modal-hd"><h3>{isEdit ? "Edit Menu Item" : "Add Menu Item"}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
//         <div className="modal-bd">
//           {error && <div className="alert alert-err">{error}</div>}
//           <div className="form-group"><label className="form-label">Item Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jollof Rice & Chicken" /></div>
//           <div className="form-row">
//             <div className="form-group"><label className="form-label">Type</label>
//               <select className="form-select" value={type} onChange={e => { setType(e.target.value); setCat(e.target.value === "food" ? FOOD_CATS[0] : DRINK_CATS[0]); }}>
//                 <option value="food">Food</option>
//                 <option value="drink">Drink</option>
//               </select>
//             </div>
//             <div className="form-group"><label className="form-label">Category</label>
//               <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
//                 {cats.map(c => <option key={c}>{c}</option>)}
//               </select>
//             </div>
//           </div>
//           <div className="form-group"><label className="form-label">Price (GH₵)</label><input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} /></div>
//         </div>
//         <div className="modal-ft">
//           <button className="btn btn-sec" onClick={onClose}>Cancel</button>
//           <button className="btn btn-p" onClick={submit}>{isEdit ? "Save Changes" : "Add Item"}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AdminRestaurant() {
//   const { state, dispatch } = useApp();
//   const { menuItems } = state;
//   const [tab, setTab] = useState("food");
//   const [menuModal, setMenuModal] = useState(null);
//   const [query, setQuery] = useState("");

//   const filtered = menuItems
//     .filter(m => m.type === tab)
//     .filter(m => !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.cat.toLowerCase().includes(query.toLowerCase()));

//   return (
//     <div>
//       <div className="pg-hd-row"><h2>🍽️ Restaurant Management</h2></div>
//       <div className="ptabs" style={{ marginBottom: 20 }}>
//         <button className={`ptab ${tab === "food" ? "on" : ""}`} onClick={() => setTab("food")}>Food Menu</button>
//         <button className={`ptab ${tab === "drink" ? "on" : ""}`} onClick={() => setTab("drink")}>Drinks Menu</button>
//       </div>
//       <Card>
//         <CardHeader title={tab === "food" ? "Food Items" : "Drink Items"} action={<button className="btn btn-p btn-sm" onClick={() => setMenuModal({})}>+ Add Item</button>} />
//         <CardBody>
//           <div className="srch" style={{ marginBottom: 12 }}><span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span><input placeholder="Search menu items..." value={query} onChange={e => setQuery(e.target.value)} /></div>
//         </CardBody>
//         <CardBody noPad>
//           <table className="tbl">
//             <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
//             <tbody>
//               {filtered.map(m => (
//                 <tr key={m.id}>
//                   <td><strong>{m.name}</strong></td>
//                   <td style={{ color: "var(--g500)" }}>{m.cat}</td>
//                   <td>{fmt(m.price)}</td>
//                   <td style={{ display: "flex", gap: 6 }}>
//                     <button className="btn btn-sec btn-sm" onClick={() => setMenuModal(m)}>Edit</button>
//                     <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Delete ${m.name}?`)) dispatch({ type: "DELETE_MENU_ITEM", id: m.id }); }}>Del</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </CardBody>
//       </Card>
//       {menuModal && <MenuItemModal item={Object.keys(menuModal).length ? menuModal : null} onClose={() => setMenuModal(null)} />}
//     </div>
//   );
// }






// import { useState } from "react";
// import { useApp } from "../../AppContext";
// import { fmt } from "../../helpers";
// import { Card, CardHeader, CardBody } from "../../components/Card";
// import RestaurantService from "../../services/Restaurantservice";

// const FOOD_CATS  = ["Starters", "Main Course", "Snacks", "Desserts", "Other"];
// const DRINK_CATS = ["Soft Drinks", "Alcoholic", "Hot Drinks", "Other"];

// function apiErr(err, fallback = "Something went wrong. Please try again.") {
//   return err?.response?.data?.message || fallback;
// }

// // ── Menu Item Modal ───────────────────────────────────────────────────────────
// function MenuItemModal({ item, onClose }) {
//   const { dispatch } = useApp();
//   const isEdit = !!item;
//   const [name, setName]   = useState(item?.name || "");
//   const [type, setType]   = useState(item?.type || "food");
//   const [cat, setCat]     = useState(item?.cat || FOOD_CATS[0]);
//   const [price, setPrice] = useState(item?.price || "");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const cats = type === "food" ? FOOD_CATS : DRINK_CATS;

//   const handleTypeChange = (val) => {
//     setType(val);
//     setCat(val === "food" ? FOOD_CATS[0] : DRINK_CATS[0]);
//   };

//   const submit = async () => {
//     if (!name || !price) { setError("All fields required."); return; }
//     if (isNaN(price))    { setError("Price must be a number."); return; }
//     setLoading(true); setError("");
//     try {
//       const obj = { name, type, cat, price: parseFloat(price) };
//       if (isEdit) {
//         const updated = await RestaurantService.updateMenuItem(item.id, obj);
//         dispatch({ type: "UPDATE_MENU_ITEM", item: updated });
//       } else {
//         const created = await RestaurantService.createMenuItem(obj);
//         dispatch({ type: "ADD_MENU_ITEM", item: created });
//       }
//       onClose();
//     } catch (err) {
//       setError(`${apiErr(err)}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal-bg">
//       <div className="modal">
//         <div className="modal-hd">
//           <h3>{isEdit ? "Edit Menu Item" : "Add Menu Item"}</h3>
//           <button className="modal-x" onClick={onClose}>✕</button>
//         </div>
//         <div className="modal-bd">
//           {error && <div className="alert alert-err">{error}</div>}
//           <div className="form-group">
//             <label className="form-label">Item Name</label>
//             <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jollof Rice & Chicken" disabled={loading} />
//           </div>
//           <div className="form-row">
//             <div className="form-group">
//               <label className="form-label">Type</label>
//               <select className="form-select" value={type} onChange={e => handleTypeChange(e.target.value)} disabled={loading}>
//                 <option value="food">Food</option>
//                 <option value="drink">Drink</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label className="form-label">Category</label>
//               <select className="form-select" value={cat} onChange={e => setCat(e.target.value)} disabled={loading}>
//                 {cats.map(c => <option key={c}>{c}</option>)}
//               </select>
//             </div>
//           </div>
//           <div className="form-group">
//             <label className="form-label">Price (GH₵)</label>
//             <input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} disabled={loading} />
//           </div>
//         </div>
//         <div className="modal-ft">
//           <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
//           <button className="btn btn-p" onClick={submit} disabled={loading}>
//             {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Item"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Delete hook ───────────────────────────────────────────────────────────────
// function useDelete() {
//   const { dispatch } = useApp();
//   const [deleting, setDeleting] = useState(null);

//   const del = async (id, name, serviceFn, dispatchType) => {
//     if (!confirm(`Delete ${name}?`)) return;
//     setDeleting(id);
//     try {
//       await serviceFn(id);
//       dispatch({ type: dispatchType, id });
//     } catch (err) {
//       alert(`${apiErr(err, "Failed to delete. Please try again.")}`);
//     } finally {
//       setDeleting(null);
//     }
//   };

//   return { deleting, del };
// }

// // ── Main Page ─────────────────────────────────────────────────────────────────
// export default function AdminRestaurant() {
//   const { state } = useApp();
//   const { menuItems } = state;
//   const [tab, setTab]           = useState("food");
//   const [menuModal, setMenuModal] = useState(null);
//   const [query, setQuery]       = useState("");
//   const { deleting, del }       = useDelete();

//   const filtered = menuItems
//     .filter(m => m.type === tab)
//     .filter(m => !query ||
//       m.name.toLowerCase().includes(query.toLowerCase()) ||
//       m.cat.toLowerCase().includes(query.toLowerCase())
//     );

//   return (
//     <div>
//       <div className="pg-hd-row"><h2>🍽️ Restaurant Management</h2></div>
//       <div className="ptabs" style={{ marginBottom: 20 }}>
//         <button className={`ptab ${tab === "food" ? "on" : ""}`} onClick={() => setTab("food")}>Food Menu</button>
//         <button className={`ptab ${tab === "drink" ? "on" : ""}`} onClick={() => setTab("drink")}>Drinks Menu</button>
//       </div>
//       <Card>
//         <CardHeader
//           title={tab === "food" ? "Food Items" : "Drink Items"}
//           action={<button className="btn btn-p btn-sm" onClick={() => setMenuModal({})}>+ Add Item</button>}
//         />
//         <CardBody>
//           <div className="srch" style={{ marginBottom: 12 }}>
//             <span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
//             <input placeholder="Search menu items..." value={query} onChange={e => setQuery(e.target.value)} />
//           </div>
//         </CardBody>
//         <CardBody noPad>
//           <table className="tbl">
//             <thead>
//               <tr><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr>
//             </thead>
//             <tbody>
//               {filtered.map(m => (
//                 <tr key={m.id}>
//                   <td><strong>{m.name}</strong></td>
//                   <td style={{ color: "var(--g500)" }}>{m.cat}</td>
//                   <td>{fmt(m.price)}</td>
//                   <td style={{ display: "flex", gap: 6 }}>
//                     <button className="btn btn-sec btn-sm" onClick={() => setMenuModal(m)}>Edit</button>
//                     <button
//                       className="btn btn-danger btn-sm"
//                       disabled={deleting === m.id}
//                       onClick={() => del(m.id, m.name, RestaurantService.deleteMenuItem, "DELETE_MENU_ITEM")}
//                     >
//                       {deleting === m.id ? "…" : "Del"}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filtered.length === 0 && (
//                 <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--g400)", padding: 24 }}>No items found.</td></tr>
//               )}
//             </tbody>
//           </table>
//         </CardBody>
//       </Card>

//       {menuModal && (
//         <MenuItemModal
//           item={Object.keys(menuModal).length ? menuModal : null}
//           onClose={() => setMenuModal(null)}
//         />
//       )}
//     </div>
//   );
// }












import { useState, useEffect } from "react";
import { useApp } from "../../AppContext";
import { fmt } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";
import RestaurantService from "../../services/Restaurantservice";
import RoomService from "../../services/RoomService";

const FOOD_CATS  = ["Starters", "Main Course", "Snacks", "Desserts", "Other"];
const DRINK_CATS = ["Soft Drinks", "Alcoholic", "Hot Drinks", "Other"];
const ROOM_STATUSES = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"];

function apiErr(err, fallback = "Something went wrong. Please try again.") {
  return err?.response?.data?.message || fallback;
}

// ── Menu Item Modal ───────────────────────────────────────────────────────────
function MenuItemModal({ item, onClose }) {
  const { dispatch } = useApp();
  const isEdit = !!item;
  const [name, setName]            = useState(item?.name || "");
  const [type, setType]            = useState(item?.type || "food");
  const [cat, setCat]              = useState(item?.cat || FOOD_CATS[0]);
  const [sellingPrice, setSelling]  = useState(item?.price || "");
  const [costPrice, setCost]        = useState(item?.costPrice ?? "");
  const [error, setError]          = useState("");
  const [loading, setLoading]      = useState(false);

  const cats = type === "food" ? FOOD_CATS : DRINK_CATS;

  const handleTypeChange = (val) => {
    setType(val);
    setCat(val === "food" ? FOOD_CATS[0] : DRINK_CATS[0]);
  };

  const submit = async () => {
    if (!name || !sellingPrice) { setError("Name and selling price are required."); return; }
    if (isNaN(sellingPrice))    { setError("Selling price must be a number."); return; }
    if (costPrice !== "" && isNaN(costPrice)) { setError("Cost price must be a number."); return; }
    setLoading(true); setError("");
    try {
      const obj = {
        name, type, cat,
        price:     parseFloat(sellingPrice),
        costPrice: costPrice !== "" ? parseFloat(costPrice) : null,
      };
      if (isEdit) {
        const updated = await RestaurantService.updateMenuItem(item.id, obj);
        dispatch({ type: "UPDATE_MENU_ITEM", item: updated });
      } else {
        const created = await RestaurantService.createMenuItem(obj);
        dispatch({ type: "ADD_MENU_ITEM", item: created });
      }
      onClose();
    } catch (err) {
      setError(`${apiErr(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (<ModalPortal>
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <h3>{isEdit ? "Edit Menu Item" : "Add Menu Item"}</h3>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jollof Rice & Chicken" disabled={loading} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={type} onChange={e => handleTypeChange(e.target.value)} disabled={loading}>
                <option value="food">Food</option>
                <option value="drink">Drink</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={cat} onChange={e => setCat(e.target.value)} disabled={loading}>
                {cats.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Selling Price (GH₵) *</label>
              <input className="form-input" type="number" step="0.01" value={sellingPrice} onChange={e => setSelling(e.target.value)} placeholder="0.00" disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label">Cost Price (GH₵)</label>
              <input className="form-input" type="number" step="0.01" value={costPrice} onChange={e => setCost(e.target.value)} placeholder="0.00 (optional)" disabled={loading} />
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

// ── Room Modal ────────────────────────────────────────────────────────────────
function RoomModal({ room, categories, onClose, onSaved }) {
  const isEdit = !!room;
  const [roomNumber, setRoomNumber] = useState(room?.roomNumber || "");
  const [categoryId, setCategoryId] = useState(room?.category?.id || categories[0]?.id || "");
  const [status, setStatus]         = useState(room?.status || "AVAILABLE");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const submit = async () => {
    if (!roomNumber || !categoryId) { setError("All fields required."); return; }
    setLoading(true); setError("");
    try {
      const payload = { roomNumber, categoryId: parseInt(categoryId), status };
      const saved = isEdit
        ? await RoomService.updateRoom(room.id, payload)
        : await RoomService.createRoom(payload);
      onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      setError(`${apiErr(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = { AVAILABLE: "#22c55e", OCCUPIED: "#ef4444", MAINTENANCE: "#f59e0b" };

  return (<ModalPortal>
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <h3>{isEdit ? "Edit Room" : "Add Room"}</h3>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div className="form-group">
            <label className="form-label">Room Number</label>
            <input
              className="form-input"
              value={roomNumber}
              onChange={e => setRoomNumber(e.target.value)}
              placeholder="e.g. 101"
              disabled={loading}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                disabled={loading}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
                disabled={loading}
                style={{ color: statusColors[status] }}
              >
                {ROOM_STATUSES.map(s => (
                  <option key={s} value={s} style={{ color: statusColors[s] }}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Room"}
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

// ── Rooms Tab ─────────────────────────────────────────────────────────────────
function RoomsTab() {
  const [rooms, setRooms]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [roomModal, setRoomModal]   = useState(null);
  const [query, setQuery]           = useState("");
  const [deleting, setDeleting]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [roomsData, catsData] = await Promise.all([
          RoomService.getRooms(),
          RoomService.getCategories(),
        ]);
        setRooms(roomsData);
        setCategories(catsData);
      } catch (err) {
        setError("Failed to load rooms.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaved = (saved, isEdit) => {
    setRooms(prev =>
      isEdit ? prev.map(r => r.id === saved.id ? saved : r) : [...prev, saved]
    );
  };

  const handleDelete = async (id, roomNumber) => {
    if (!confirm(`Delete Room ${roomNumber}?`)) return;
    setDeleting(id);
    try {
      await RoomService.deleteRoom(id);
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(`${apiErr(err, "Failed to delete room.")}`);
    } finally {
      setDeleting(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      AVAILABLE:   { bg: "#dcfce7", color: "#16a34a", label: "Available" },
      OCCUPIED:    { bg: "#fee2e2", color: "#dc2626", label: "Occupied" },
      MAINTENANCE: { bg: "#fef9c3", color: "#b45309", label: "Maintenance" },
    };
    const s = map[status] || { bg: "#f3f4f6", color: "#6b7280", label: status };
    return (
      <span style={{
        background: s.bg, color: s.color,
        borderRadius: 6, padding: "2px 10px",
        fontSize: 12, fontWeight: 600
      }}>{s.label}</span>
    );
  };

  const filtered = rooms.filter(r =>
    !query ||
    r.roomNumber.toLowerCase().includes(query.toLowerCase()) ||
    r.category?.name?.toLowerCase().includes(query.toLowerCase()) ||
    r.status.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader
          title="Rooms"
          action={
            <button
              className="btn btn-p btn-sm"
              onClick={() => setRoomModal({})}
              disabled={categories.length === 0}
            >
              + Add Room
            </button>
          }
        />
        <CardBody>
          <div className="srch" style={{ marginBottom: 12 }}>
            <span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
            <input
              placeholder="Search by room number, category or status..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          {error && <div className="alert alert-err">{error}</div>}
        </CardBody>
        <CardBody noPad>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--g400)" }}>Loading rooms…</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Room No.</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.roomNumber}</strong></td>
                    <td style={{ color: "var(--g500)" }}>{r.category?.name || "—"}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-sec btn-sm"
                        onClick={() => setRoomModal(r)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={deleting === r.id}
                        onClick={() => handleDelete(r.id, r.roomNumber)}
                      >
                        {deleting === r.id ? "…" : "Del"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--g400)", padding: 24 }}>
                      No rooms found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {roomModal && (
        <RoomModal
          room={Object.keys(roomModal).length ? roomModal : null}
          categories={categories}
          onClose={() => setRoomModal(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

// ── Delete hook ───────────────────────────────────────────────────────────────
function useDelete() {
  const { dispatch } = useApp();
  const [deleting, setDeleting] = useState(null);

  const del = async (id, name, serviceFn, dispatchType) => {
    if (!confirm(`Delete ${name}?`)) return;
    setDeleting(id);
    try {
      await serviceFn(id);
      dispatch({ type: dispatchType, id });
    } catch (err) {
      alert(`${apiErr(err, "Failed to delete. Please try again.")}`);
    } finally {
      setDeleting(null);
    }
  };

  return { deleting, del };
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminRestaurant() {
  const { state } = useApp();
  const { menuItems } = state;
  const [tab, setTab]             = useState("food");
  const [menuModal, setMenuModal] = useState(null);
  const [query, setQuery]         = useState("");
  const { deleting, del }         = useDelete();

  const filtered = menuItems
    .filter(m => m.type === tab)
    .filter(m => !query ||
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.cat.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div>
      <div className="pg-hd-row"><h2>Restaurant & Rooms</h2></div>

      <div className="ptabs" style={{ marginBottom: 20 }}>
        <button className={`ptab ${tab === "food"  ? "on" : ""}`} onClick={() => setTab("food")}>Food Menu</button>
        <button className={`ptab ${tab === "drink" ? "on" : ""}`} onClick={() => setTab("drink")}>Drinks Menu</button>
        <button className={`ptab ${tab === "rooms" ? "on" : ""}`} onClick={() => setTab("rooms")}>Rooms</button>
      </div>

      {tab === "rooms" ? (
        <RoomsTab />
      ) : (
        <>
          <Card>
            <CardHeader
              title={tab === "food" ? "Food Items" : "Drink Items"}
              action={<button className="btn btn-p btn-sm" onClick={() => setMenuModal({})}>+ Add Item</button>}
            />
            <CardBody>
              <div className="srch" style={{ marginBottom: 12 }}>
                <span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
                <input placeholder="Search menu items..." value={query} onChange={e => setQuery(e.target.value)} />
              </div>
            </CardBody>
            <CardBody noPad>
              <table className="tbl">
                <thead>
                  <tr><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.name}</strong></td>
                      <td style={{ color: "var(--g500)" }}>{m.cat}</td>
                      <td>{fmt(m.price)}</td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sec btn-sm" onClick={() => setMenuModal(m)}>Edit</button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={deleting === m.id}
                          onClick={() => del(m.id, m.name, RestaurantService.deleteMenuItem, "DELETE_MENU_ITEM")}
                        >
                          {deleting === m.id ? "…" : "Del"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--g400)", padding: 24 }}>No items found.</td></tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {menuModal && (
            <MenuItemModal
              item={Object.keys(menuModal).length ? menuModal : null}
              onClose={() => setMenuModal(null)}
            />
          )}
        </>
      )}
    </div>
  );
}