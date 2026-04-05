import { useApp } from "../AppContext";
import ModalPortal from "../components/ModalPortal";
import { fmt, dateStr, timeStr, rxNo, storeThankYou, modLabel } from "../helpers";
import Icon from "../../shared/components/Icon";

// Map receipt type to module key
const typeToMod = (type, receiptData) => {
  if (receiptData?.mod) return receiptData.mod;
  if (type === "Service" || type === "Drug Dispense") return "drugstore";
  if (type === "Mart") return "mart";
  if (type === "Hotel") return "hotel";
  if (type?.toLowerCase().includes("restaurant") || type?.toLowerCase().includes("table")) return "restaurant";
  return null;
};

export default function ReceiptModal() {
  const { state, dispatch } = useApp();
  const { receiptData, me } = state;
  if (!receiptData) return null;

  const { type, service: svc, services, items = [], guestName, checkIn, checkOut, tableId, total, reference } = receiptData;
  const close = () => dispatch({ type: "CLOSE_RECEIPT" });

  const modKey = typeToMod(type, receiptData);
  const thankYou = storeThankYou(modKey);

  const doPrint = () => {
    const zone = document.getElementById("print-zone");
    const inner = document.getElementById("print-receipt-inner");
    if (zone && inner) {
      zone.innerHTML = inner.innerHTML;
      zone.style.display = "block";
      window.print();
      zone.style.display = "none";
      zone.innerHTML = "";
    }
  };

  const allServices = services || (svc ? [svc] : []);

  return (<ModalPortal>
    <div className="modal-bg">
      <div className="modal">
        <div id="print-receipt-inner">
          <div className="rcp-hd">
            <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>
              <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,var(--p),var(--pd))", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="building" size={26} color="white" />
              </div>
            </div>
            <h2>MedPoint Business Suite</h2>
            <p>Cape Coast, Ghana · Tel: +233 000 000 000</p>
            {modKey && (
              <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, background: "var(--pal)", color: "var(--pd)", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                <Icon name={modKey} size={13} color="var(--pd)" />
                {modLabel(modKey)}
              </div>
            )}
          </div>
          <div className="rcp-meta">
            <div className="rcp-mr"><span>Receipt No.</span><span>{reference || rxNo()}</span></div>
            <div className="rcp-mr"><span>Date</span><span>{dateStr()}</span></div>
            <div className="rcp-mr"><span>Time</span><span>{timeStr()}</span></div>
            <div className="rcp-mr"><span>Staff</span><span>{me?.name}</span></div>
            <div className="rcp-mr"><span>Module</span><span>{type}</span></div>
          </div>
          <hr className="rcp-div" />

          {allServices.length > 0 && (
            <>
              <div className="rcp-st">Services</div>
              {/* Group services by category */}
              {(() => {
                const cats = [...new Set(allServices.map(s => s.cat))];
                const showCats = cats.length > 1;
                if (showCats) {
                  return cats.map(cat => {
                    const catSvcs = allServices.filter(s => s.cat === cat);
                    const catTotal = catSvcs.reduce((sum, s) => sum + s.price, 0);
                    return (
                      <div key={cat} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--g400)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 0", display: "flex", justifyContent: "space-between" }}>
                          <span>{cat}</span><span>{fmt(catTotal)}</span>
                        </div>
                        {catSvcs.map((s, i) => (
                          <div key={i} className="rcp-line">
                            <div><div className="rcp-ln">{s.name}</div><div className="rcp-ls">{s.cat}</div></div>
                            <div className="rcp-la">{fmt(s.price)}</div>
                          </div>
                        ))}
                      </div>
                    );
                  });
                }
                return allServices.map((s, i) => (
                  <div key={i} className="rcp-line">
                    <div><div className="rcp-ln">{s.name}</div><div className="rcp-ls">{s.cat}</div></div>
                    <div className="rcp-la">{fmt(s.price)}</div>
                  </div>
                ));
              })()}
              {/* Services subtotal */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--g600)", background: "var(--g50)", borderRadius: 5, padding: "4px 8px", margin: "6px 0 4px" }}>
                <span>Services Subtotal</span>
                <span>{fmt(allServices.reduce((s, sv) => s + sv.price, 0))}</span>
              </div>
              <hr className="rcp-div" />
            </>
          )}

          {guestName && (
            <>
              <div className="rcp-st">Guest Details</div>
              <div className="rcp-line"><div className="rcp-ln">Guest</div><div className="rcp-la">{guestName}</div></div>
              <div className="rcp-line"><div className="rcp-ln">Check-in</div><div className="rcp-la">{checkIn}</div></div>
              <div className="rcp-line"><div className="rcp-ln">Check-out</div><div className="rcp-la">{checkOut}</div></div>
              <hr className="rcp-div" />
            </>
          )}

          {tableId && <div className="rcp-st">Table {tableId}</div>}
          {items.length > 0 && (
            <>
              <div className="rcp-st">{allServices.length > 0 ? "Prescribed Items" : tableId ? "Order Items" : "Items"}</div>
              {/* Group items by category */}
              {(() => {
                const cats = [...new Set(items.map(i => i.cat).filter(Boolean))];
                const showCats = cats.length > 1;
                if (showCats) {
                  return cats.map(cat => {
                    const catItems = items.filter(i => i.cat === cat);
                    const catTotal = catItems.reduce((s, i) => s + i.price * i.qty, 0);
                    return (
                      <div key={cat} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--g400)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 0", display: "flex", justifyContent: "space-between" }}>
                          <span>{cat}</span><span>{fmt(catTotal)}</span>
                        </div>
                        {catItems.map((item, i) => (
                          <div key={i} className="rcp-line">
                            <div><div className="rcp-ln">{item.name}</div><div className="rcp-ls">Qty: {item.qty} × {fmt(item.price)}</div></div>
                            <div className="rcp-la">{fmt(item.price * item.qty)}</div>
                          </div>
                        ))}
                      </div>
                    );
                  });
                }
                return items.map((item, i) => (
                  <div key={i} className="rcp-line">
                    <div><div className="rcp-ln">{item.name}</div><div className="rcp-ls">Qty: {item.qty} × {fmt(item.price)}</div></div>
                    <div className="rcp-la">{fmt(item.price * item.qty)}</div>
                  </div>
                ));
              })()}
              {/* Items subtotal */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--g600)", background: "var(--g50)", borderRadius: 5, padding: "4px 8px", margin: "6px 0 4px" }}>
                <span>Items Subtotal</span>
                <span>{fmt(items.reduce((s, i) => s + i.price * i.qty, 0))}</span>
              </div>
            </>
          )}

          <div className="rcp-tots">
            {allServices.length > 0 && <div className="rcp-tr"><span>Services ({allServices.length})</span><span>{fmt(allServices.reduce((s, sv) => s + sv.price, 0))}</span></div>}
            {items.length > 0 && <div className="rcp-tr"><span>Items Subtotal</span><span>{fmt(items.reduce((s, i) => s + i.price * i.qty, 0))}</span></div>}
            <div className="rcp-grand"><span>TOTAL</span><span>{fmt(total)}</span></div>
          </div>

          <div className="rcp-foot">
            <p style={{ fontWeight: 700 }}>{thankYou.msg}</p>
            <p style={{ marginTop: 4, color: "var(--g500)", fontSize: 12 }}>{thankYou.sub}</p>
          </div>
        </div>
        <div className="rcp-actions">
          <button className="btn-print" onClick={doPrint} style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
            <Icon name="print" size={16} color="white" />Print Receipt
          </button>
          <button className="btn-clsmodal" onClick={close}>Close</button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}
