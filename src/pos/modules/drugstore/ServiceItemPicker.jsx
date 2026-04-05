import { useState } from "react";
import { useApp } from "../../AppContext";
import { fmt } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";
import OutOfStockModal from "../../components/OutOfStockModal";

export default function ServiceItemPicker() {
  const { state, dispatch } = useApp();
  const { svcCart, svcItemTab, drugs, nondrugs } = state;
  const [query, setQuery] = useState("");
  const [oosItem, setOosItem] = useState(null);

  const itemSrc = svcItemTab === "nondrug" ? nondrugs : drugs;
  const filtered = query
    ? itemSrc.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.cat.toLowerCase().includes(query.toLowerCase()))
    : itemSrc;

  const toggle = (id, type) => {
    const src = type === "drug" ? drugs : nondrugs;
    const item = src.find(d => d.id === id);
    if (!item) return;
    // Removing from cart — always allow
    if (svcCart.some(c => c.id === id)) { dispatch({ type: "SVC_REMOVE", id }); return; }
    // Out of stock — show modal
    if (type === "drug" && item.stock <= 0) { setOosItem(item.name); return; }
    dispatch({ type: "SVC_ADD", item });
  };

  return (
    <>
      <Card>
        <CardHeader title="Add Items (Optional)" />
        <CardBody>
          <div className="mtabs">
            <button className={`mtab ${svcItemTab !== "nondrug" ? "on" : ""}`} onClick={() => { dispatch({ type: "SET", key: "svcItemTab", value: "drugs" }); setQuery(""); }}>Drugs</button>
            <button className={`mtab ${svcItemTab === "nondrug" ? "on" : ""}`} onClick={() => { dispatch({ type: "SET", key: "svcItemTab", value: "nondrug" }); setQuery(""); }}>Non-Drug</button>
          </div>
          <div className="srch"><span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span><input placeholder={`Search ${svcItemTab === "nondrug" ? "non-drug items" : "drugs"}...`} value={query} onChange={e => setQuery(e.target.value)} /></div>
          <div className="item-list" style={{ maxHeight: 220 }}>
            {filtered.length === 0 ? <div className="nores">No items found</div> : filtered.map(d => {
              const inCart = svcCart.some(c => c.id === d.id);
              const outOfStock = svcItemTab !== "nondrug" && d.stock <= 0;
              return (
                <div key={d.id} className={`li ${inCart ? "ic" : ""} ${outOfStock ? "oos" : ""}`} onDoubleClick={() => toggle(d.id, svcItemTab === "nondrug" ? "nd" : "drug")}>
                  <div><div className="li-name">{d.name}</div><div className="li-sub">{d.cat}{outOfStock ? " · Out of stock" : ""}</div></div>
                  <div className="li-right"><span className="li-price">{fmt(d.price)}</span>{inCart && <span className="badge badge-green">✓</span>}{outOfStock && <span className="badge badge-red">OOS</span>}</div>
                </div>
              );
            })}
          </div>
          <p className="hint">Double-click to add / remove</p>
        </CardBody>
      </Card>

      {oosItem && <OutOfStockModal drugName={oosItem} onClose={() => setOosItem(null)} />}
    </>
  );
}
