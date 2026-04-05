import { useState } from "react";
import ModalPortal from "../../components/ModalPortal";
import Icon from "../../../shared/components/Icon";
import { fmt, nights } from "../../helpers";
import { ROOM_EXTRAS } from "../../constants";
import { useApp } from "../../AppContext";
import api from "../../../shared/services/api";

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

export default function InStayPanel({ room, onClose }) {
  const { dispatch } = useApp();
  const bk = room.booking;
  const n  = nights(bk.checkIn, bk.checkOut);

  const [tab, setTab]               = useState("services");
  const [selectedExtras, setSelected] = useState([]);
  const [newCheckOut, setNewCheckOut] = useState(bk.checkOut);
  const [saving, setSaving]           = useState(false);
  const [success, setSuccess]         = useState("");
  const [error, setError]             = useState("");

  const toggleExtra = (extra) => {
    setSelected(prev => {
      const exists = prev.some(x => x.id === extra.id);
      if (exists) return prev.filter(x => x.id !== extra.id);
      return [...prev, { ...extra, days: 1 }];
    });
  };

  const setDays = (extraId, days) => {
    setSelected(prev => prev.map(x => x.id === extraId ? { ...x, days } : x));
  };

  const extTot = selectedExtras.reduce((s, e) => s + e.price * e.days, 0);

  const handleAddServices = async () => {
    if (!selectedExtras.length) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/hotel/bookings/${bk.id}/extras`, {
        extraIds: selectedExtras.map(e => e.id),
      });
      dispatch({
        type: "ADD_TX",
        mod: "hotel",
        amount: extTot,
        desc: `In-stay services — Room ${room.id} (${bk.guestName})`,
        lineItems: selectedExtras.map(e => ({
          name: `${e.name}${e.days > 1 ? ` × ${e.days} days` : ""}`,
          qty: 1, price: e.price * e.days, cat: "Service",
        })),
      });
      setSuccess(`${selectedExtras.length} service${selectedExtras.length !== 1 ? "s" : ""} added successfully.`);
      setSelected([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add services. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleExtend = async () => {
    if (!newCheckOut || newCheckOut <= bk.checkOut) {
      setError("New check-out date must be after the current date."); return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/hotel/bookings/${bk.id}`, { checkOut: newCheckOut });
      dispatch({ type: "CHECKIN", rid: room._id, booking: { ...bk, checkOut: newCheckOut } });
      const extraNights = nights(bk.checkOut, newCheckOut);
      setSuccess(`Stay extended by ${extraNights} night${extraNights !== 1 ? "s" : ""} to ${newCheckOut}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to extend stay. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const newNights   = newCheckOut > bk.checkOut ? nights(bk.checkOut, newCheckOut) : 0;
  const extraCharge = newNights * room.price;

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal modal-wide">
          <div className="modal-hd">
            <div>
              <h3>Manage Stay — Room {room.id}</h3>
              <div style={{ fontSize: 12, color: "var(--g400)", marginTop: 2, fontWeight: 400 }}>
                {bk.guestName} · {bk.checkIn} → {bk.checkOut} · {n} night{n !== 1 ? "s" : ""}
              </div>
            </div>
            <button className="modal-x" onClick={onClose} disabled={saving}>✕</button>
          </div>

          <div className="modal-bd">
            <div className="mtabs" style={{ marginBottom: 20 }}>
              <button
                className={`mtab ${tab === "services" ? "on" : ""}`}
                onClick={() => { setTab("services"); setError(""); setSuccess(""); }}
              >
                <Icon name="service" size={13} color={tab === "services" ? "white" : "var(--g500)"} style={{ marginRight: 5 }} />
                Add Services
              </button>
              <button
                className={`mtab ${tab === "extend" ? "on" : ""}`}
                onClick={() => { setTab("extend"); setError(""); setSuccess(""); }}
              >
                <Icon name="revenue" size={13} color={tab === "extend" ? "white" : "var(--g500)"} style={{ marginRight: 5 }} />
                Extend Stay
              </button>
            </div>

            {error   && <div className="alert alert-err"  style={{ marginBottom: 14 }}><Icon name="warning" size={13} color="var(--red)" /> {error}</div>}
            {success && <div className="alert alert-ok"   style={{ marginBottom: 14 }}><Icon name="building" size={13} color="var(--green)" /> {success}</div>}

            {/* Services tab */}
            {tab === "services" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--g500)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                  Select Services &amp; Duration
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
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

                {selectedExtras.length > 0 && (
                  <div className="co-bill-box" style={{ marginBottom: 16 }}>
                    {selectedExtras.map(e => (
                      <div key={e.id} className="co-bill-row">
                        <span>{e.name} × {e.days} day{e.days !== 1 ? "s" : ""}</span>
                        <span>{fmt(e.price * e.days)}</span>
                      </div>
                    ))}
                    <div className="co-bill-total">
                      <span>Total</span>
                      <span>{fmt(extTot)}</span>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-p btn-full"
                  disabled={!selectedExtras.length || saving}
                  onClick={handleAddServices}
                >
                  {saving
                    ? <><span className="spin-ring" /> Adding…</>
                    : <><Icon name="service" size={14} color="white" /> Add {selectedExtras.length || ""} Service{selectedExtras.length !== 1 ? "s" : ""}</>
                  }
                </button>
              </>
            )}

            {/* Extend stay tab */}
            {tab === "extend" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Current Check-out</label>
                    <input className="form-input" value={bk.checkOut} disabled style={{ background: "var(--g50)", color: "var(--g500)" }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Check-out Date</label>
                    <input
                      className="form-input"
                      type="date"
                      value={newCheckOut}
                      min={bk.checkOut}
                      onChange={e => { setNewCheckOut(e.target.value); setError(""); setSuccess(""); }}
                    />
                  </div>
                </div>

                {newNights > 0 && (
                  <div className="co-bill-box" style={{ marginBottom: 16 }}>
                    <div className="co-bill-row">
                      <span>Extension ({newNights} extra night{newNights !== 1 ? "s" : ""})</span>
                      <span>{fmt(extraCharge)}</span>
                    </div>
                    <div className="co-bill-total">
                      <span>Additional Charge</span>
                      <span>{fmt(extraCharge)}</span>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-p btn-full"
                  disabled={newNights <= 0 || saving}
                  onClick={handleExtend}
                >
                  {saving
                    ? <><span className="spin-ring" /> Extending…</>
                    : <><Icon name="revenue" size={14} color="white" /> Extend Stay to {newCheckOut}</>
                  }
                </button>
              </>
            )}
          </div>

          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose} disabled={saving}>Close</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
