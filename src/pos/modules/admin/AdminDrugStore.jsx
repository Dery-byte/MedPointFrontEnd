// import { useState } from "react";
import ModalPortal from "../../components/ModalPortal";
// import { useApp } from "../../AppContext";
// import { fmt } from "../../helpers";
// import { Card, CardHeader, CardBody } from "../../components/Card";
// import { LOW_STOCK } from "../../constants";

// const DRUG_CATS = ["Analgesic", "Antibiotic", "Anti-inflammatory", "Antidiabetic", "Antacid", "Antimalarial", "Supplement", "Antihypertensive", "Other"];
// const NONDRUG_CATS = ["Consumable", "Fluid", "Diagnostic", "Other"];
// const SVC_CATS = ["Consultation", "Diagnostic", "Treatment", "Other"];

// function DrugModal({ drug, onClose }) {
//   const { dispatch } = useApp();
//   const isEdit = !!drug;
//   const [name, setName] = useState(drug?.name || "");
//   const [cat, setCat] = useState(drug?.cat || DRUG_CATS[0]);
//   const [price, setPrice] = useState(drug?.price || "");
//   const [stock, setStock] = useState(drug?.stock || "");
//   const [error, setError] = useState("");

//   const submit = () => {
//     if (!name || !price || stock === "") { setError("All fields required."); return; }
//     if (isNaN(price) || isNaN(stock)) { setError("Price and stock must be numbers."); return; }
//     const item = { name, cat, price: parseFloat(price), stock: parseInt(stock) };
//     if (isEdit) dispatch({ type: "UPDATE_DRUG", drug: { ...drug, ...item } });
//     else dispatch({ type: "ADD_DRUG", drug: item });
//     onClose();
//   };

//   return (
//     <div className="modal-bg">
//       <div className="modal">
//         <div className="modal-hd"><h3>{isEdit ? "Edit Drug" : "Add Drug"}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
//         <div className="modal-bd">
//           {error && <div className="alert alert-err">{error}</div>}
//           <div className="form-group"><label className="form-label">Drug Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Paracetamol 500mg" /></div>
//           <div className="form-row">
//             <div className="form-group"><label className="form-label">Category</label>
//               <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
//                 {DRUG_CATS.map(c => <option key={c}>{c}</option>)}
//               </select>
//             </div>
//             <div className="form-group"><label className="form-label">Price (GH₵)</label><input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" /></div>
//           </div>
//           <div className="form-group"><label className="form-label">Stock Quantity</label><input className="form-input" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" /></div>
//         </div>
//         <div className="modal-ft">
//           <button className="btn btn-sec" onClick={onClose}>Cancel</button>
//           <button className="btn btn-p" onClick={submit}>{isEdit ? "Save Changes" : "Add Drug"}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function RestockModal({ item, type, onClose }) {
//   const { dispatch } = useApp();
//   const [qty, setQty] = useState("");
//   const [error, setError] = useState("");
//   const submit = () => {
//     if (!qty || isNaN(qty) || parseInt(qty) <= 0) { setError("Enter a valid quantity."); return; }
//     dispatch({ type: type === "drug" ? "RESTOCK_DRUG" : "RESTOCK_PRODUCT", id: item.id, qty: parseInt(qty) });
//     onClose();
//   };
//   return (
//     <div className="modal-bg">
//       <div className="modal">
//         <div className="modal-hd"><h3>Restock: {item.name}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
//         <div className="modal-bd">
//           {error && <div className="alert alert-err">{error}</div>}
//           <div style={{ background: "var(--pal)", padding: "10px 14px", borderRadius: "var(--r)", marginBottom: 14 }}>Current stock: <strong>{item.stock}</strong></div>
//           <div className="form-group"><label className="form-label">Quantity to Add</label><input className="form-input" type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 50" autoFocus /></div>
//         </div>
//         <div className="modal-ft">
//           <button className="btn btn-sec" onClick={onClose}>Cancel</button>
//           <button className="btn btn-p" onClick={submit}>Add Stock</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ServiceModal({ service, onClose }) {
//   const { dispatch } = useApp();
//   const isEdit = !!service;
//   const [name, setName] = useState(service?.name || "");
//   const [cat, setCat] = useState(service?.cat || SVC_CATS[0]);
//   const [price, setPrice] = useState(service?.price || "");
//   const [error, setError] = useState("");
//   const submit = () => {
//     if (!name || !price) { setError("All fields required."); return; }
//     const item = { name, cat, price: parseFloat(price) };
//     if (isEdit) dispatch({ type: "UPDATE_SERVICE", service: { ...service, ...item } });
//     else dispatch({ type: "ADD_SERVICE", service: item });
//     onClose();
//   };
//   return (
//     <div className="modal-bg">
//       <div className="modal">
//         <div className="modal-hd"><h3>{isEdit ? "Edit Service" : "Add Service"}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
//         <div className="modal-bd">
//           {error && <div className="alert alert-err">{error}</div>}
//           <div className="form-group"><label className="form-label">Service Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Blood Pressure Check" /></div>
//           <div className="form-row">
//             <div className="form-group"><label className="form-label">Category</label>
//               <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
//                 {SVC_CATS.map(c => <option key={c}>{c}</option>)}
//               </select>
//             </div>
//             <div className="form-group"><label className="form-label">Price (GH₵)</label><input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} /></div>
//           </div>
//         </div>
//         <div className="modal-ft">
//           <button className="btn btn-sec" onClick={onClose}>Cancel</button>
//           <button className="btn btn-p" onClick={submit}>{isEdit ? "Save" : "Add Service"}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function NonDrugModal({ item, onClose }) {
//   const { dispatch } = useApp();
//   const isEdit = !!item;
//   const [name, setName] = useState(item?.name || "");
//   const [cat, setCat] = useState(item?.cat || NONDRUG_CATS[0]);
//   const [price, setPrice] = useState(item?.price || "");
//   const [error, setError] = useState("");
//   const submit = () => {
//     if (!name || !price) { setError("All fields required."); return; }
//     const obj = { name, cat, price: parseFloat(price) };
//     if (isEdit) dispatch({ type: "UPDATE_NONDRUG", item: { ...item, ...obj } });
//     else dispatch({ type: "ADD_NONDRUG", item: obj });
//     onClose();
//   };
//   return (
//     <div className="modal-bg">
//       <div className="modal">
//         <div className="modal-hd"><h3>{isEdit ? "Edit Non-Drug" : "Add Non-Drug Item"}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
//         <div className="modal-bd">
//           {error && <div className="alert alert-err">{error}</div>}
//           <div className="form-group"><label className="form-label">Item Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gloves (pair)" /></div>
//           <div className="form-row">
//             <div className="form-group"><label className="form-label">Category</label>
//               <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
//                 {NONDRUG_CATS.map(c => <option key={c}>{c}</option>)}
//               </select>
//             </div>
//             <div className="form-group"><label className="form-label">Price (GH₵)</label><input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} /></div>
//           </div>
//         </div>
//         <div className="modal-ft">
//           <button className="btn btn-sec" onClick={onClose}>Cancel</button>
//           <button className="btn btn-p" onClick={submit}>{isEdit ? "Save" : "Add Item"}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AdminDrugStore() {
//   const { state, dispatch } = useApp();
//   const { drugs, services, nondrugs } = state;
//   const [tab, setTab] = useState("drugs");
//   const [drugModal, setDrugModal] = useState(null);
//   const [svcModal, setSvcModal] = useState(null);
//   const [ndModal, setNdModal] = useState(null);
//   const [restockItem, setRestockItem] = useState(null);
//   const [query, setQuery] = useState("");

//   const filteredDrugs = query ? drugs.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.cat.toLowerCase().includes(query.toLowerCase())) : drugs;
//   const filteredSvcs  = query ? services.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.cat.toLowerCase().includes(query.toLowerCase())) : services;
//   const filteredNd    = query ? nondrugs.filter(n => n.name.toLowerCase().includes(query.toLowerCase()) || n.cat.toLowerCase().includes(query.toLowerCase())) : nondrugs;

//   return (
//     <div>
//       <div className="pg-hd-row"><h2>Drug Store Management</h2></div>
//       <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
//         <div className="ptabs" style={{ marginBottom: 0 }}>
//           <button className={`ptab ${tab === "drugs" ? "on" : ""}`} onClick={() => setTab("drugs")}>Drugs</button>
//           <button className={`ptab ${tab === "services" ? "on" : ""}`} onClick={() => setTab("services")}>Services</button>
//           <button className={`ptab ${tab === "nondrugs" ? "on" : ""}`} onClick={() => setTab("nondrugs")}>Non-Drug Items</button>
//         </div>
//         <div className="srch" style={{ flex: 1, marginBottom: 0 }}><span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span><input placeholder="Search..." value={query} onChange={e => { setQuery(e.target.value); }} /></div>
//       </div>

//       {tab === "drugs" && (
//         <Card>
//           <CardHeader title="Drugs" action={<button className="btn btn-p btn-sm" onClick={() => setDrugModal({})}>+ Add Drug</button>} />
//           <CardBody noPad>
//             <table className="tbl">
//               <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
//               <tbody>
//                 {filteredDrugs.map(d => (
//                   <tr key={d.id} style={d.stock < LOW_STOCK ? { background: "var(--redl)" } : {}}>
//                     <td><strong>{d.name}</strong></td>
//                     <td style={{ color: "var(--g500)" }}>{d.cat}</td>
//                     <td>{fmt(d.price)}</td>
//                     <td><span style={{ fontWeight: 700, color: d.stock < LOW_STOCK ? "var(--red)" : "var(--green)" }}>{d.stock}</span></td>
//                     <td style={{ display: "flex", gap: 6 }}>
//                       <button className="btn btn-sec btn-sm" onClick={() => setRestockItem({ item: d, type: "drug" })}>Restock</button>
//                       <button className="btn btn-sec btn-sm" onClick={() => setDrugModal(d)}>Edit</button>
//                       <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Delete ${d.name}?`)) dispatch({ type: "DELETE_DRUG", id: d.id }); }}>Del</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//       )}

//       {tab === "services" && (
//         <Card>
//           <CardHeader title="Services" action={<button className="btn btn-p btn-sm" onClick={() => setSvcModal({})}>+ Add Service</button>} />
//           <CardBody noPad>
//             <table className="tbl">
//               <thead><tr><th>Service</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
//               <tbody>
//                 {filteredSvcs.map(s => (
//                   <tr key={s.id}>
//                     <td><strong>{s.name}</strong></td>
//                     <td style={{ color: "var(--g500)" }}>{s.cat}</td>
//                     <td>{fmt(s.price)}</td>
//                     <td style={{ display: "flex", gap: 6 }}>
//                       <button className="btn btn-sec btn-sm" onClick={() => setSvcModal(s)}>Edit</button>
//                       <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Delete ${s.name}?`)) dispatch({ type: "DELETE_SERVICE", id: s.id }); }}>Del</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//       )}

//       {tab === "nondrugs" && (
//         <Card>
//           <CardHeader title="Non-Drug Items" action={<button className="btn btn-p btn-sm" onClick={() => setNdModal({})}>+ Add Item</button>} />
//           <CardBody noPad>
//             <table className="tbl">
//               <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
//               <tbody>
//                 {filteredNd.map(n => (
//                   <tr key={n.id}>
//                     <td><strong>{n.name}</strong></td>
//                     <td style={{ color: "var(--g500)" }}>{n.cat}</td>
//                     <td>{fmt(n.price)}</td>
//                     <td style={{ display: "flex", gap: 6 }}>
//                       <button className="btn btn-sec btn-sm" onClick={() => setNdModal(n)}>Edit</button>
//                       <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Delete ${n.name}?`)) dispatch({ type: "DELETE_NONDRUG", id: n.id }); }}>Del</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//       )}

//       {drugModal && <DrugModal drug={Object.keys(drugModal).length ? drugModal : null} onClose={() => setDrugModal(null)} />}
//       {svcModal && <ServiceModal service={Object.keys(svcModal).length ? svcModal : null} onClose={() => setSvcModal(null)} />}
//       {ndModal && <NonDrugModal item={Object.keys(ndModal).length ? ndModal : null} onClose={() => setNdModal(null)} />}
//       {restockItem && <RestockModal item={restockItem.item} type={restockItem.type} onClose={() => setRestockItem(null)} />}
//     </div>
//   );
// }


import { useState } from "react";
import { useApp } from "../../AppContext";
import { fmt } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";
import { LOW_STOCK } from "../../constants";
import DrugstoreService from "../../services/Drugstoreservice";
import ExcelImportModal from "../../components/ExcelImportModal";
import { exportToExcel, downloadDrugTemplate } from "../../utils/excelUtils";

const DRUG_CATS    = ["Analgesic", "Antibiotic", "Anti-inflammatory", "Antidiabetic", "Antacid", "Antimalarial", "Supplement", "Antihypertensive", "Other"];
const NONDRUG_CATS = ["Consumable", "Fluid", "Diagnostic", "Other"];
const SVC_CATS     = ["Consultation", "Diagnostic", "Treatment", "Other"];

// ── Shared error extractor ────────────────────────────────────────────────────
function apiErr(err, fallback = "Something went wrong. Please try again.") {
  return err?.response?.data?.message || fallback;
}

// ── Drug Modal ────────────────────────────────────────────────────────────────
function DrugModal({ drug, onClose }) {
  const { dispatch } = useApp();
  const isEdit = !!drug;
  const [name, setName]           = useState(drug?.name || "");
  const [cat, setCat]             = useState(drug?.cat || DRUG_CATS[0]);
  const [sellingPrice, setSelling] = useState(drug?.price || "");
  const [costPrice, setCost]       = useState(drug?.costPrice ?? "");
  const [stock, setStock]         = useState(drug?.stock || "");
  const [expiryDate, setExpiry]   = useState(drug?.expiryDate || "");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);









  
  const submit = async () => {
    if (!name || !sellingPrice || stock === "") { setError("Name, selling price and stock are required."); return; }
    if (isNaN(sellingPrice) || isNaN(stock))   { setError("Price and stock must be numbers."); return; }
    if (costPrice !== "" && isNaN(costPrice))   { setError("Cost price must be a number."); return; }
    setLoading(true); setError("");
    try {
      const item = {
        name, cat,
        price:      parseFloat(sellingPrice),
        costPrice:  costPrice !== "" ? parseFloat(costPrice) : null,
        stock:      parseInt(stock),
        expiryDate: expiryDate || null,
      };
      if (isEdit) {
        const updated = await DrugstoreService.updateDrug(drug.id, item);
        dispatch({ type: "UPDATE_DRUG", drug: updated });
      } else {
        const created = await DrugstoreService.createDrug(item);
        dispatch({ type: "ADD_DRUG", drug: created });
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
        <div className="modal-hd"><h3>{isEdit ? "Edit Drug" : "Add Drug"}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div className="form-group"><label className="form-label">Drug Name *</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Paracetamol 500mg" disabled={loading} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={cat} onChange={e => setCat(e.target.value)} disabled={loading}>
                {DRUG_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Stock Quantity *</label><input className="form-input" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" disabled={loading} /></div>
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
          <div className="form-group"><label className="form-label">Expiry Date</label><input className="form-input" type="date" value={expiryDate} onChange={e => setExpiry(e.target.value)} disabled={loading} /></div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>{loading ? "Saving…" : isEdit ? "Save Changes" : "Add Drug"}</button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

// ── Restock Modal ─────────────────────────────────────────────────────────────
function RestockModal({ item, type, onClose }) {
  const { dispatch } = useApp();
  const [qty, setQty]     = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) { setError("Enter a valid quantity."); return; }
    setLoading(true); setError("");
    try {
      if (type === "drug") {
        const updated = await DrugstoreService.restockDrug(item.id, parseInt(qty));
        dispatch({ type: "UPDATE_DRUG", drug: updated });
      } else {
        // Non-drugs don't have a restock endpoint — keep local for now
        dispatch({ type: "RESTOCK_PRODUCT", id: item.id, qty: parseInt(qty) });
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
        <div className="modal-hd"><h3>Restock: {item.name}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div style={{ background: "var(--pal)", padding: "10px 14px", borderRadius: "var(--r)", marginBottom: 14 }}>
            Current stock: <strong>{item.stock}</strong>
          </div>
          <div className="form-group"><label className="form-label">Quantity to Add</label><input className="form-input" type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 50" autoFocus disabled={loading} /></div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>{loading ? "Adding…" : "Add Stock"}</button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

// ── Service Modal ─────────────────────────────────────────────────────────────
function ServiceModal({ service, onClose }) {
  const { dispatch } = useApp();
  const isEdit = !!service;
  const [name, setName]           = useState(service?.name || "");
  const [cat, setCat]             = useState(service?.cat || SVC_CATS[0]);
  const [sellingPrice, setSelling] = useState(service?.price || "");
  const [costPrice, setCost]       = useState(service?.costPrice ?? "");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const submit = async () => {
    if (!name || !sellingPrice) { setError("Name and selling price are required."); return; }
    setLoading(true); setError("");
    try {
      const item = {
        name, cat,
        price:     parseFloat(sellingPrice),
        costPrice: costPrice !== "" ? parseFloat(costPrice) : null,
      };
      if (isEdit) {
        const updated = await DrugstoreService.updateService(service.id, item);
        dispatch({ type: "UPDATE_SERVICE", service: updated });
      } else {
        const created = await DrugstoreService.createService(item);
        dispatch({ type: "ADD_SERVICE", service: created });
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
        <div className="modal-hd"><h3>{isEdit ? "Edit Service" : "Add Service"}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div className="form-group"><label className="form-label">Service Name *</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Blood Pressure Check" disabled={loading} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={cat} onChange={e => setCat(e.target.value)} disabled={loading}>
                {SVC_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Selling Price (GH₵) *</label><input className="form-input" type="number" step="0.01" value={sellingPrice} onChange={e => setSelling(e.target.value)} placeholder="0.00" disabled={loading} /></div>
          </div>
          <div className="form-group"><label className="form-label">Cost Price (GH₵)</label><input className="form-input" type="number" step="0.01" value={costPrice} onChange={e => setCost(e.target.value)} placeholder="0.00 (optional)" disabled={loading} /></div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>{loading ? "Saving…" : isEdit ? "Save" : "Add Service"}</button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

// ── Non-Drug Modal ────────────────────────────────────────────────────────────
function NonDrugModal({ item, onClose }) {
  const { dispatch } = useApp();
  const isEdit = !!item;
  const [name, setName]            = useState(item?.name || "");
  const [cat, setCat]              = useState(item?.cat || NONDRUG_CATS[0]);
  const [sellingPrice, setSelling]  = useState(item?.price || "");
  const [costPrice, setCost]        = useState(item?.costPrice ?? "");
  const [error, setError]          = useState("");
  const [loading, setLoading]      = useState(false);

  const submit = async () => {
    if (!name || !sellingPrice) { setError("Name and selling price are required."); return; }
    setLoading(true); setError("");
    try {
      const obj = {
        name, cat,
        price:     parseFloat(sellingPrice),
        costPrice: costPrice !== "" ? parseFloat(costPrice) : null,
      };
      if (isEdit) {
        const updated = await DrugstoreService.updateNonDrug(item.id, obj);
        dispatch({ type: "UPDATE_NONDRUG", item: updated });
      } else {
        const created = await DrugstoreService.createNonDrug(obj);
        dispatch({ type: "ADD_NONDRUG", item: created });
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
        <div className="modal-hd"><h3>{isEdit ? "Edit Non-Drug" : "Add Non-Drug Item"}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div className="form-group"><label className="form-label">Item Name *</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gloves (pair)" disabled={loading} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={cat} onChange={e => setCat(e.target.value)} disabled={loading}>
                {NONDRUG_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Selling Price (GH₵) *</label><input className="form-input" type="number" step="0.01" value={sellingPrice} onChange={e => setSelling(e.target.value)} placeholder="0.00" disabled={loading} /></div>
          </div>
          <div className="form-group"><label className="form-label">Cost Price (GH₵)</label><input className="form-input" type="number" step="0.01" value={costPrice} onChange={e => setCost(e.target.value)} placeholder="0.00 (optional)" disabled={loading} /></div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>{loading ? "Saving…" : isEdit ? "Save" : "Add Item"}</button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

// ── Delete helper ─────────────────────────────────────────────────────────────
function useDelete() {
  const { dispatch } = useApp();
  const [deleting, setDeleting] = useState(null); // tracks id being deleted

  const del = async (type, id, name, serviceFn, dispatchType) => {
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
export default function AdminDrugStore() {
  const { state, dispatch } = useApp();
  const { drugs, services, nondrugs } = state;
  const [tab, setTab]             = useState("drugs");
  const [drugModal, setDrugModal] = useState(null);
  const [svcModal, setSvcModal]   = useState(null);
  const [ndModal, setNdModal]     = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [query, setQuery]         = useState("");
  const [importModal, setImportModal] = useState(null); // "drugs" | "nondrugs" | null
  const { deleting, del }         = useDelete();

  const filteredDrugs = query ? drugs.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.cat.toLowerCase().includes(query.toLowerCase())) : drugs;
  const filteredSvcs  = query ? services.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.cat.toLowerCase().includes(query.toLowerCase())) : services;
  const filteredNd    = query ? nondrugs.filter(n => n.name.toLowerCase().includes(query.toLowerCase()) || n.cat.toLowerCase().includes(query.toLowerCase())) : nondrugs;

  const handleExportDrugs = () => exportToExcel({
    rows: drugs.map(d => ({
      name: d.name, category: d.cat, price: d.price, stock: d.stock,
      expiryDate: d.expiryDate || "", expiryStatus: d.expiryStatus || "",
    })),
    columns: ["name", "category", "price", "stock", "expiryDate", "expiryStatus"],
    headers: ["Name", "Category", "Price (GH₵)", "Stock", "Expiry Date", "Expiry Status"],
    filename: "drug-store-stock.xlsx",
    sheetName: "Drugs",
  });

  const handleExportNonDrugs = () => exportToExcel({
    rows: nondrugs.map(n => ({ name: n.name, category: n.cat, price: n.price })),
    columns: ["name", "category", "price"],
    headers: ["Name", "Category", "Price (GH₵)"],
    filename: "non-drug-items.xlsx",
    sheetName: "Non-Drug Items",
  });

  const handleImportDrugs = async (rows) => {
    const created = await DrugstoreService.bulkCreateDrugs(
      rows.map(r => ({
        name: r.name, cat: r.category, price: parseFloat(r.price) || 0,
        stock: parseInt(r.stock) || 0, expiryDate: r["expiryDate"] || r["Expiry Date (YYYY-MM-DD)"] || null,
      }))
    );
    created.forEach(drug => dispatch({ type: "ADD_DRUG", drug }));
  };

  const handleImportNonDrugs = async (rows) => {
    const created = await DrugstoreService.bulkCreateNonDrugs(
      rows.map(r => ({ name: r.name, cat: r.category, price: parseFloat(r.price) || 0 }))
    );
    created.forEach(item => dispatch({ type: "ADD_NONDRUG", item }));
  };

  const DRUG_IMPORT_COLUMNS = [
    { key: "name",     label: "Name",                          required: true },
    { key: "category", label: "Category",                      required: true },
    { key: "price",    label: "Price (GH₵)",                   required: true,  type: "number" },
    { key: "stock",    label: "Stock",                         required: true,  type: "int" },
    { key: "expiryDate", label: "Expiry Date (YYYY-MM-DD)",    required: false },
  ];

  const ND_IMPORT_COLUMNS = [
    { key: "name",     label: "Name",        required: true },
    { key: "category", label: "Category",    required: true },
    { key: "price",    label: "Price (GH₵)", required: true, type: "number" },
  ];

  return (
    <div>
      <div className="pg-hd-row"><h2>Drug Store Management</h2></div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div className="ptabs" style={{ marginBottom: 0 }}>
          <button className={`ptab ${tab === "drugs" ? "on" : ""}`} onClick={() => setTab("drugs")}>Drugs</button>
          <button className={`ptab ${tab === "services" ? "on" : ""}`} onClick={() => setTab("services")}>Services</button>
          <button className={`ptab ${tab === "nondrugs" ? "on" : ""}`} onClick={() => setTab("nondrugs")}>Non-Drug Items</button>
        </div>
        <div className="srch" style={{ flex: 1, marginBottom: 0 }}>
          <span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
          <input placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      {tab === "drugs" && (
        <Card>
          <CardHeader
            title="Drugs"
            action={
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sec btn-sm" onClick={handleExportDrugs} title="Export to Excel">⬇ Export</button>
                <button className="btn btn-sec btn-sm" onClick={() => setImportModal("drugs")} title="Import from Excel">📥 Import</button>
                <button className="btn btn-p btn-sm" onClick={() => setDrugModal({})}>+ Add Drug</button>
              </div>
            }
          />
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Name</th><th>Category</th><th>Selling Price</th><th>Cost Price</th><th>Stock</th><th>Expiry</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredDrugs.map(d => (
                  <tr key={d.id} style={d.stock < LOW_STOCK ? { background: "var(--redl)" } : {}}>
                    <td><strong>{d.name}</strong></td>
                    <td style={{ color: "var(--g500)" }}>{d.cat}</td>
                    <td><strong style={{ color: "var(--pd)" }}>{fmt(d.price)}</strong></td>
                    <td style={{ color: d.costPrice ? "var(--g700)" : "var(--g300)" }}>
                      {d.costPrice ? fmt(d.costPrice) : "—"}
                      {d.costPrice && d.price > 0 && (
                        <span style={{ fontSize: 11, color: "var(--green)", marginLeft: 5 }}>
                          {(((d.price - d.costPrice) / d.price) * 100).toFixed(0)}% margin
                        </span>
                      )}
                    </td>
                    <td><span style={{ fontWeight: 700, color: d.stock < LOW_STOCK ? "var(--red)" : "var(--green)" }}>{d.stock}</span></td>
                    <td style={{ fontSize: 12, color: d.expiryStatus === "EXPIRED" ? "var(--red)" : d.expiryStatus === "EXPIRING_SOON" ? "var(--orange)" : "var(--g500)" }}>
                      {d.expiryDate || "—"}{d.expiryStatus && d.expiryStatus !== "OK" ? ` (${d.expiryStatus.replace("_", " ")})` : ""}
                    </td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sec btn-sm" onClick={() => setRestockItem({ item: d, type: "drug" })}>Restock</button>
                      <button className="btn btn-sec btn-sm" onClick={() => setDrugModal(d)}>Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={deleting === d.id}
                        onClick={() => del("drug", d.id, d.name, DrugstoreService.deleteDrug, "DELETE_DRUG")}
                      >
                        {deleting === d.id ? "…" : "Del"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === "services" && (
        <Card>
          <CardHeader title="Services" action={<button className="btn btn-p btn-sm" onClick={() => setSvcModal({})}>+ Add Service</button>} />
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Service</th><th>Category</th><th>Selling Price</th><th>Cost Price</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredSvcs.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td style={{ color: "var(--g500)" }}>{s.cat}</td>
                    <td><strong style={{ color: "var(--pd)" }}>{fmt(s.price)}</strong></td>
                    <td style={{ color: s.costPrice ? "var(--g700)" : "var(--g300)" }}>{s.costPrice ? fmt(s.costPrice) : "—"}</td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sec btn-sm" onClick={() => setSvcModal(s)}>Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={deleting === s.id}
                        onClick={() => del("service", s.id, s.name, DrugstoreService.deleteService, "DELETE_SERVICE")}
                      >
                        {deleting === s.id ? "…" : "Del"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {tab === "nondrugs" && (
        <Card>
          <CardHeader
            title="Non-Drug Items"
            action={
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sec btn-sm" onClick={handleExportNonDrugs}>⬇ Export</button>
                <button className="btn btn-sec btn-sm" onClick={() => setImportModal("nondrugs")}>📥 Import</button>
                <button className="btn btn-p btn-sm" onClick={() => setNdModal({})}>+ Add Item</button>
              </div>
            }
          />
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Item</th><th>Category</th><th>Selling Price</th><th>Cost Price</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredNd.map(n => (
                  <tr key={n.id}>
                    <td><strong>{n.name}</strong></td>
                    <td style={{ color: "var(--g500)" }}>{n.cat}</td>
                    <td><strong style={{ color: "var(--pd)" }}>{fmt(n.price)}</strong></td>
                    <td style={{ color: n.costPrice ? "var(--g700)" : "var(--g300)" }}>{n.costPrice ? fmt(n.costPrice) : "—"}</td>
                    <td style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sec btn-sm" onClick={() => setNdModal(n)}>Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={deleting === n.id}
                        onClick={() => del("nondrug", n.id, n.name, DrugstoreService.deleteNonDrug, "DELETE_NONDRUG")}
                      >
                        {deleting === n.id ? "…" : "Del"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {drugModal  && <DrugModal    drug={Object.keys(drugModal).length ? drugModal : null}   onClose={() => setDrugModal(null)} />}
      {svcModal   && <ServiceModal service={Object.keys(svcModal).length ? svcModal : null}  onClose={() => setSvcModal(null)} />}
      {ndModal    && <NonDrugModal item={Object.keys(ndModal).length ? ndModal : null}        onClose={() => setNdModal(null)} />}
      {restockItem && <RestockModal item={restockItem.item} type={restockItem.type}           onClose={() => setRestockItem(null)} />}

      {importModal === "drugs" && (
        <ExcelImportModal
          title="Import Drugs from Excel"
          templateFn={downloadDrugTemplate}
          columns={DRUG_IMPORT_COLUMNS}
          onImport={handleImportDrugs}
          onClose={() => setImportModal(null)}
          hint="Leave 'Expiry Date' blank if not applicable. Category must match existing categories."
        />
      )}
      {importModal === "nondrugs" && (
        <ExcelImportModal
          title="Import Non-Drug Items from Excel"
          templateFn={async () => exportToExcel({
            rows: [{ name: "Gloves (pair)", category: "Consumable", price: 3.50 }],
            columns: ["name", "category", "price"],
            headers: ["Name", "Category", "Price (GH₵)"],
            filename: "nondrug-import-template.xlsx",
            sheetName: "Non-Drug Items",
          })}
          columns={ND_IMPORT_COLUMNS}
          onImport={handleImportNonDrugs}
          onClose={() => setImportModal(null)}
        />
      )}
    </div>
  );
}
