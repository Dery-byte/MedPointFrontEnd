import { useState } from "react";
import { useApp } from "../../AppContext";
import ModalPortal from "../../components/ModalPortal";
import Icon from "../../../shared/components/Icon";
import { fmt, nights } from "../../helpers";
import { ROOM_EXTRAS } from "../../constants";
import HotelService from "../../services/Hotelapi";

function ExtraRow({ extra, active, days, onToggle, onDaysChange }) {
  const total = extra.price * (days || 1);
  return (
    <div
      className={`svc-extra-row ${active ? "ic" : ""}`}
      style={{ border: `1.5px solid ${active ? "var(--p)" : "var(--g200)"}` }}
    >
      <div className="svc-extra-info" onClick={onToggle}>
        <div className="li-name" style={{ fontSize: 12 }}>{extra.name}</div>
        <div style={{ fontSize: 11, color: "var(--g500)" }}>{fmt(extra.price)}/day</div>
      </div>
      {active ? (
        <div className="svc-extra-controls" onClick={e => e.stopPropagation()}>
          <button className="qbtn" onClick={() => onDaysChange(Math.max(1, days - 1))}>−</button>
          <span className="svc-extra-days">{days}d</span>
          <button className="qbtn" onClick={() => onDaysChange(days + 1)}>+</button>
          <span className="svc-extra-total">{fmt(total)}</span>
          <button className="rmbtn" onClick={onToggle}>✕</button>
        </div>
      ) : (
        <button className="svc-extra-add" onClick={onToggle}>+ Add</button>
      )}
    </div>
  );
}

export default function CheckOutModal({ room, onClose }) {
  const { state, dispatch } = useApp();
  const bk = room.booking;
  const n  = nights(bk.checkIn, bk.checkOut);
  const base = n * room.price;

  // Pre-populate any extras already on the booking
  const [selectedExtras, setSelectedExtras] = useState(() => {
    if (!bk.extras?.length) return [];
    return ROOM_EXTRAS
      .filter(e => bk.extras.some(be => be.id === e.id || be === e.id))
      .map(e => ({ ...e, days: 1 }));
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const toggleExtra = (extra) => {
    setSelectedExtras(prev => {
      const exists = prev.some(x => x.id === extra.id);
      if (exists) return prev.filter(x => x.id !== extra.id);
      return [...prev, { ...extra, days: 1 }];
    });
  };

  const setDays = (extraId, days) => {
    setSelectedExtras(prev => prev.map(x => x.id === extraId ? { ...x, days } : x));
  };

  const extTot = selectedExtras.reduce((s, e) => s + e.price * e.days, 0);
  const grand  = base + extTot;

  const onCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const tx = await HotelService.checkOut(bk.id, selectedExtras.map(e => e.id));

      const receiptItems = [
        { name: `Room ${room.id} (${room.cat})`, cat: "Accommodation", price: room.price, qty: n },
        ...selectedExtras.map(e => ({
          name: `${e.name}${e.days > 1 ? ` × ${e.days} days` : ""}`,
          cat: "Service", price: e.price * e.days, qty: 1,
        })),
      ];

      dispatch({
        type: "ADD_TX",
        mod: "hotel",
        amount: tx.amount ?? grand,
        desc: `Room ${room.id} checkout — ${bk.guestName}`,
        lineItems: receiptItems.map(i => ({ name: i.name, qty: i.qty, price: i.price, cat: i.cat })),
      });

      dispatch({
        type: "SHOW_RECEIPT",
        data: {
          type:      "Hotel Checkout",
          mod:       "hotel",
          reference: tx.reference,
          guestName: bk.guestName,
          checkIn:   bk.checkIn,
          checkOut:  bk.checkOut,
          items:     receiptItems,
          total:     tx.amount ?? grand,
          service:   null,
        },
      });

      dispatch({ type: "CHECKOUT", rid: room.id });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal modal-wide">
          <div className="modal-hd">
            <h3>Check Out — Room {room.id}</h3>
            <button className="modal-x" onClick={onClose} disabled={loading}>✕</button>
          </div>

          <div className="modal-bd">
            {error && (
              <div className="alert alert-err" style={{ marginBottom: 16 }}>
                <Icon name="warning" size={14} color="var(--red)" /> {error}
              </div>
            )}

            {/* Guest & stay summary */}
            <div className="co-guest-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{bk.guestName}</div>
                  <div style={{ fontSize: 12, color: "var(--g500)", marginTop: 2 }}>
                    Room {room.id} · {room.cat}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "var(--g500)" }}>{bk.checkIn} → {bk.checkOut}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pd)", marginTop: 2 }}>
                    {n} night{n !== 1 ? "s" : ""} × {fmt(room.price)} = {fmt(base)}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional services with days */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g500)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                Additional Services
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ROOM_EXTRAS.map(e => {
                  const sel = selectedExtras.find(x => x.id === e.id);
                  return (
                    <ExtraRow
                      key={e.id}
                      extra={e}
                      active={!!sel}
                      days={sel?.days || 1}
                      onToggle={() => toggleExtra(e)}
                      onDaysChange={(d) => setDays(e.id, d)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bill breakdown */}
            <div className="co-bill-box">
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g500)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                Bill Summary
              </div>
              <div className="co-bill-row">
                <span>Accommodation ({n} night{n !== 1 ? "s" : ""})</span>
                <span>{fmt(base)}</span>
              </div>
              {selectedExtras.map(e => (
                <div key={e.id} className="co-bill-row">
                  <span>{e.name} × {e.days} day{e.days !== 1 ? "s" : ""}</span>
                  <span>{fmt(e.price * e.days)}</span>
                </div>
              ))}
              <div className="co-bill-total">
                <span>Total</span>
                <span>{fmt(grand)}</span>
              </div>
            </div>
          </div>

          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-p" onClick={onCheckout} disabled={loading}>
              {loading
                ? <><span className="spin-ring" /> Processing…</>
                : <><Icon name="print" size={15} color="white" /> Checkout & Receipt</>
              }
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
