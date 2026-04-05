// import { useState } from "react";
import ModalPortal from "../../components/ModalPortal";
// import { useApp } from "../../AppContext";
// import { fmt } from "../../helpers";
// import { Card, CardHeader, CardBody } from "../../components/Card";

// function RoomCatModal({ cat, onClose }) {
//   const { dispatch } = useApp();
//   const isEdit = !!cat;
//   const [name, setName]   = useState(cat?.name || "");
//   const [icon, setIcon]   = useState(cat?.icon || "🛏️");
//   const [price, setPrice] = useState(cat?.price || "");
//   const [error, setError] = useState("");

//   const submit = () => {
//     if (!name.trim())                           { setError("Category name required."); return; }
//     if (!price || isNaN(price) || +price <= 0)  { setError("Enter a valid price."); return; }
//     if (isEdit) {
//       dispatch({ type: "UPDATE_ROOM_CAT", cat: { ...cat, price: parseFloat(price), icon } });
//     } else {
//       dispatch({ type: "ADD_ROOM_CAT", cat: { name: name.trim(), icon, price: parseFloat(price) } });
//     }
//     onClose();
//   };

//   return (
//     <div className="modal-bg">
//       <div className="modal">
//         <div className="modal-hd"><h3>{isEdit ? "Edit Category" : "Add Room Category"}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
//         <div className="modal-bd">
//           {error && <div className="alert alert-err">{error}</div>}
//           {!isEdit && (
//             <div className="form-group">
//               <label className="form-label">Category Name</label>
//               <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Presidential" />
//             </div>
//           )}
//           <div className="form-row">
//             <div className="form-group"><label className="form-label">Icon</label><input className="form-input" value={icon} onChange={e => setIcon(e.target.value)} style={{ fontSize: 20 }} /></div>
//             <div className="form-group"><label className="form-label">Price per Night (GH₵)</label><input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} /></div>
//           </div>
//           {isEdit && (
//             <div style={{ background: "var(--pal)", borderRadius: "var(--r)", padding: "10px 14px", fontSize: 13, color: "var(--g600)" }}>
//               ℹ️ Price update applies to all <strong>{cat.name}</strong> rooms automatically.
//             </div>
//           )}
//         </div>
//         <div className="modal-ft">
//           <button className="btn btn-sec" onClick={onClose}>Cancel</button>
//           <button className="btn btn-p" onClick={submit}>{isEdit ? "Save Changes" : "Add Category"}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function AddRoomModal({ roomCats, onClose }) {
//   const { dispatch } = useApp();
//   const [roomId, setRoomId] = useState("");
//   const [cat, setCat]       = useState(roomCats[0]?.name || "");
//   const [error, setError]   = useState("");

//   const submit = () => {
//     if (!roomId.trim()) { setError("Room number/ID required."); return; }
//     if (!cat)           { setError("Select a category."); return; }
//     const catObj = roomCats.find(r => r.name === cat);
//     dispatch({ type: "ADD_ROOM", room: { id: roomId.trim(), cat, price: catObj.price, occ: false, booking: null } });
//     onClose();
//   };

//   return (
//     <div className="modal-bg">
//       <div className="modal">
//         <div className="modal-hd"><h3>Add Room</h3><button className="modal-x" onClick={onClose}>✕</button></div>
//         <div className="modal-bd">
//           {error && <div className="alert alert-err">{error}</div>}
//           <div className="form-row">
//             <div className="form-group"><label className="form-label">Room Number / ID</label><input className="form-input" value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="e.g. 105" /></div>
//             <div className="form-group"><label className="form-label">Category</label>
//               <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
//                 {roomCats.map(rc => <option key={rc.name} value={rc.name}>{rc.icon} {rc.name}</option>)}
//               </select>
//             </div>
//           </div>
//         </div>
//         <div className="modal-ft">
//           <button className="btn btn-sec" onClick={onClose}>Cancel</button>
//           <button className="btn btn-p" onClick={submit}>Add Room</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AdminHotel() {
//   const { state, dispatch } = useApp();
//   const { roomCats, rooms } = state;
//   const [catModal, setCatModal] = useState(null);   // null=closed, {}=add, cat=edit
//   const [addRoom, setAddRoom]   = useState(false);

//   return (
//     <div>
//       <div className="pg-hd-row"><h2>Hotel Management</h2></div>

//       {/* Room Categories */}
//       <Card style={{ marginBottom: 20 }}>
//         <CardHeader
//           title="Room Categories & Pricing"
//           action={<button className="btn btn-p btn-sm" onClick={() => setCatModal({})}>+ Add Category</button>}
//         />
//         <CardBody noPad>
//           <table className="tbl">
//             <thead><tr><th>Category</th><th>Icon</th><th>Price/Night</th><th>Rooms</th><th>Available</th><th>Occupied</th><th>Actions</th></tr></thead>
//             <tbody>
//               {roomCats.map(rc => {
//                 const catRooms = rooms.filter(r => r.cat === rc.name);
//                 const avail = catRooms.filter(r => !r.occ).length;
//                 const occ   = catRooms.filter(r => r.occ).length;
//                 return (
//                   <tr key={rc.name}>
//                     <td><strong>{rc.name}</strong></td>
//                     <td style={{ fontSize: 20 }}>{rc.icon}</td>
//                     <td><strong style={{ color: "var(--pd)" }}>{fmt(rc.price)}</strong></td>
//                     <td>{catRooms.length}</td>
//                     <td><span style={{ color: "var(--green)", fontWeight: 700 }}>{avail}</span></td>
//                     <td><span style={{ color: "var(--red)", fontWeight: 700 }}>{occ}</span></td>
//                     <td style={{ display: "flex", gap: 6 }}>
//                       <button className="btn btn-sec btn-sm" onClick={() => setCatModal(rc)}>Edit</button>
//                       {catRooms.length === 0 && (
//                         <button className="btn btn-danger btn-sm" onClick={() => {
//                           if (confirm(`Delete category "${rc.name}"?`)) dispatch({ type: "DELETE_ROOM_CAT", name: rc.name });
//                         }}>Del</button>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </CardBody>
//       </Card>

//       {/* Rooms */}
//       <Card>
//         <CardHeader
//           title="All Rooms"
//           action={<button className="btn btn-p btn-sm" onClick={() => setAddRoom(true)}>+ Add Room</button>}
//         />
//         <CardBody noPad>
//           <table className="tbl">
//             <thead><tr><th>Room</th><th>Category</th><th>Price/Night</th><th>Status</th><th>Guest</th><th>Actions</th></tr></thead>
//             <tbody>
//               {rooms.map(r => (
//                 <tr key={r.id}>
//                   <td><strong>Room {r.id}</strong></td>
//                   <td>{r.cat}</td>
//                   <td>{fmt(r.price)}</td>
//                   <td><span style={{ fontWeight: 700, color: r.occ ? "var(--red)" : "var(--green)" }}>{r.occ ? "Occupied" : "Available"}</span></td>
//                   <td style={{ color: "var(--g500)" }}>{r.booking?.guestName || "—"}</td>
//                   <td>
//                     {!r.occ ? (
//                       <button className="btn btn-danger btn-sm" onClick={() => {
//                         if (confirm(`Remove Room ${r.id}?`)) dispatch({ type: "DELETE_ROOM", id: r.id });
//                       }}>Remove</button>
//                     ) : <span style={{ fontSize: 11, color: "var(--g400)" }}>Occupied</span>}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </CardBody>
//       </Card>

//       {catModal !== null && (
//         <RoomCatModal
//           cat={Object.keys(catModal).length ? catModal : null}
//           onClose={() => setCatModal(null)}
//         />
//       )}
//       {addRoom && <AddRoomModal roomCats={roomCats} onClose={() => setAddRoom(false)} />}
//     </div>
//   );
// }






















import { useState, useEffect, useCallback } from "react";
import { fmt } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";
import HotelService from "../../services/Hotelapi";

// ─── MODALS ───────────────────────────────────────────────────────────────────

function RoomCatModal({ cat, onClose, onSaved }) {
  const isEdit = !!cat;
  const [name, setName]   = useState(cat?.name  || "");
  const [icon, setIcon]   = useState(cat?.icon  || "hotel");
  const [price, setPrice] = useState(cat?.price || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!isEdit && !name.trim())              { setError("Category name required."); return; }
    if (!price || isNaN(price) || +price <= 0) { setError("Enter a valid price."); return; }
    setLoading(true);
    try {
      if (isEdit) await HotelService.updateCategoryPrice(cat.id, parseFloat(price));
      else        await HotelService.createCategory(name.trim(), parseFloat(price));
      onSaved();
      onClose();
    } catch (e) {
      setError(`${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (<ModalPortal>
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <h3>{isEdit ? "Edit Category" : "Add Room Category"}</h3>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Presidential" />
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Icon</label>
              <input className="form-input" value={icon} onChange={e => setIcon(e.target.value)} style={{ fontSize: 20 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Price per Night (GH₵)</label>
              <input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
          </div>
          {isEdit && (
            <div style={{ background: "var(--pal)", borderRadius: "var(--r)", padding: "10px 14px", fontSize: 13, color: "var(--g600)" }}>
              ℹ️ Price update applies to all <strong>{cat.name}</strong> rooms automatically.
            </div>
          )}
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

function AddRoomModal({ roomCats, onClose, onSaved }) {
  const [roomNumber, setRoomNumber] = useState("");
  const [categoryId, setCategoryId] = useState(roomCats[0]?.id || "");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const submit = async () => {
    if (!roomNumber.trim()) { setError("Room number/ID required."); return; }
    if (!categoryId)        { setError("Select a category."); return; }
    setLoading(true);
    try {
      await HotelService.addRoom(roomNumber.trim(), categoryId);
      onSaved();
      onClose();
    } catch (e) {
      setError(`${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (<ModalPortal>
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <h3>Add Room</h3>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Room Number / ID</label>
              <input className="form-input" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} placeholder="e.g. 105" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
                {roomCats.map(rc => (
                  <option key={rc.id} value={rc.id}>{rc.icon} {rc.name} — {fmt(rc.price)}/night</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>
            {loading ? "Adding…" : "Add Room"}
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminHotel() {
  const [roomCats, setRoomCats] = useState([]);
  const [rooms, setRooms]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [catModal, setCatModal] = useState(null);  // null | {} (add) | cat (edit)
  const [addRoom, setAddRoom]   = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [cats, roomList] = await Promise.all([
        HotelService.getCategories(),
        HotelService.getRooms(),
      ]);
      setRoomCats(cats);
      setRooms(roomList);
    } catch (e) {
      setFetchError(`Failed to load data: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Delete handlers ───────────────────────────────────────────────────────────

  const handleDeleteCat = async (cat) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await HotelService.deleteCategory(cat.id);
      setRoomCats(prev => prev.filter(c => c.id !== cat.id));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!confirm(`Remove Room ${room.roomNumber}?`)) return;
    try {
      await HotelService.deleteRoom(room.id);
      setRooms(prev => prev.filter(r => r.id !== room.id));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="pg-hd-row"><h2>Hotel Management</h2></div>

      {fetchError && <div className="alert alert-err" style={{ marginBottom: 16 }}>{fetchError}</div>}

      {/* Room Categories */}
      <Card style={{ marginBottom: 20 }}>
        <CardHeader
          title="Room Categories & Pricing"
          action={<button className="btn btn-p btn-sm" onClick={() => setCatModal({})}>+ Add Category</button>}
        />
        <CardBody noPad>
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--g500)" }}>Loading…</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr><th>Category</th><th>Icon</th><th>Price/Night</th><th>Rooms</th><th>Available</th><th>Occupied</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {roomCats.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--g500)", padding: 20 }}>No categories yet.</td></tr>
                )}
                {roomCats.map(rc => (
                  <tr key={rc.id}>
                    <td><strong>{rc.name}</strong></td>
                    <td style={{ fontSize: 20 }}>{rc.icon}</td>
                    <td><strong style={{ color: "var(--pd)" }}>{fmt(rc.price)}</strong></td>
                    <td>{rc.totalRooms}</td>
                    <td><span style={{ color: "var(--green)", fontWeight: 700 }}>{rc.availableRooms}</span></td>
                    <td><span style={{ color: "var(--red)", fontWeight: 700 }}>{rc.occupiedRooms}</span></td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sec btn-sm" onClick={() => setCatModal(rc)}>Edit</button>
                      {rc.totalRooms === 0 && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCat(rc)}>Del</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Rooms */}
      <Card>
        <CardHeader
          title="All Rooms"
          action={<button className="btn btn-p btn-sm" onClick={() => setAddRoom(true)}>+ Add Room</button>}
        />
        <CardBody noPad>
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--g500)" }}>Loading…</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr><th>Room</th><th>Category</th><th>Price/Night</th><th>Status</th><th>Guest</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {rooms.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--g500)", padding: 20 }}>No rooms yet.</td></tr>
                )}
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td><strong>Room {r.roomNumber}</strong></td>
                    <td>{r.cat}</td>
                    <td>{fmt(r.price)}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: r.occ ? "var(--red)" : "var(--green)" }}>
                        {r.occ ? "Occupied" : "Available"}
                      </span>
                    </td>
                    <td style={{ color: "var(--g500)" }}>{r.booking?.guestName || "—"}</td>
                    <td>
                      {!r.occ ? (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRoom(r)}>Remove</button>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--g400)" }}>Occupied</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {catModal !== null && (
        <RoomCatModal
          cat={Object.keys(catModal).length ? catModal : null}
          onClose={() => setCatModal(null)}
          onSaved={fetchAll}
        />
      )}
      {addRoom && (
        <AddRoomModal
          roomCats={roomCats}
          onClose={() => setAddRoom(false)}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}