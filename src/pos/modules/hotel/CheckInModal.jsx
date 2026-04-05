import { useState } from "react";
import { useApp } from "../../AppContext";
import ModalPortal from "../../components/ModalPortal";
import Icon from "../../../shared/components/Icon";
import { fmt, nights } from "../../helpers";
import { ROOM_EXTRAS } from "../../constants";
import api from "../../../shared/services/api";

const ID_TYPES = ["National ID", "Passport", "Driver's License", "Voter's ID", "Student ID", "Other"];

function Section({ title, icon, open, onToggle, children }) {
  return (
    <div className="ci-section">
      <button className="ci-section-hd" onClick={onToggle}>
        <span className="ci-section-title">
          <Icon name={icon} size={14} color={open ? "var(--p)" : "var(--g500)"} />
          {title}
        </span>
        <Icon
          name="chevron"
          size={14}
          color="var(--g400)"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
        />
      </button>
      {open && <div className="ci-section-bd">{children}</div>}
    </div>
  );
}

// extraDays: { [extraId]: number }
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

export default function CheckInModal({ room, onClose }) {
  const { dispatch } = useApp();
  const today = new Date().toISOString().split("T")[0];
  const tom   = new Date(); tom.setDate(tom.getDate() + 1);

  const [form, setForm] = useState({
    guestName: "", phone: "", nationality: "", address: "",
    idType: "National ID", idNumber: "",
    checkIn: today, checkOut: tom.toISOString().split("T")[0],
  });

  // selectedExtras: { id, name, price (per day), days }
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState("guest");
  const toggle = (s) => setOpenSection(o => o === s ? null : s);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const n      = nights(form.checkIn, form.checkOut);
  const base   = n * room.price;
  const extTot = selectedExtras.reduce((s, e) => s + e.price * e.days, 0);
  const total  = base + extTot;

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

  const buildReceiptItems = () => [
    { name: `Room ${room.id} (${room.cat})`, cat: "Accommodation", price: room.price, qty: n },
    ...selectedExtras.map(e => ({
      name: `${e.name}${e.days > 1 ? ` × ${e.days} days` : ""}`,
      cat: "Service", price: e.price * e.days, qty: 1,
    })),
  ];

  // Combined: check in AND immediately show receipt
  const submit = async () => {
    if (!form.guestName.trim()) { setError("Guest name is required."); return; }
    if (!form.phone.trim())     { setError("Phone number is required."); return; }
    if (!form.idNumber.trim())  { setError("ID number is required."); return; }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      setError("Check-out must be after check-in."); return;
    }

    const payload = {
      roomId:      room._id,
      guestName:   form.guestName.trim(),
      phone:       form.phone.trim(),
      nationality: form.nationality.trim(),
      address:     form.address.trim(),
      idType:      form.idType,
      idNumber:    form.idNumber.trim(),
      checkIn:     form.checkIn,
      checkOut:    form.checkOut,
      extraIds: selectedExtras.map(e => e.id),
    };

    try {
      setLoading(true);
      setError("");
      const { data: booking } = await api.post("/hotel/check-in", payload);
      dispatch({ type: "CHECKIN", rid: room._id, booking });

      // Issue receipt immediately on check-in
      const items = buildReceiptItems();
      dispatch({
        type: "SHOW_RECEIPT",
        data: {
          type:      "Hotel Check-In",
          mod:       "hotel",
          guestName: form.guestName.trim(),
          checkIn:   form.checkIn,
          checkOut:  form.checkOut,
          items,
          total,
          service:   null,
        },
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      {/* No onClick on backdrop — only closes via X */}
      <div className="modal-bg">
        <div className="modal modal-xl">
          <div className="modal-hd">
            <h3>Check In — Room {room.id}</h3>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>

          {/* Room summary strip */}
          <div className="ci-room-strip">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="ci-room-badge">
                <Icon name="hotel" size={16} color="var(--pd)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Room {room.id}</div>
                <div style={{ fontSize: 12, color: "var(--g500)" }}>{room.cat}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--pd)" }}>{fmt(room.price)}/night</div>
              <div style={{ fontSize: 12, color: "var(--g400)" }}>{n} night{n !== 1 ? "s" : ""} = {fmt(total)}</div>
            </div>
          </div>

          <div className="modal-bd" style={{ padding: "0 0 4px" }}>
            {error && (
              <div className="alert alert-err" style={{ margin: "0 24px 12px" }}>
                <Icon name="warning" size={14} color="var(--red)" /> {error}
              </div>
            )}

            {/* Section 1: Guest Details */}
            <Section title="Guest Details" icon="staff" open={openSection === "guest"} onToggle={() => toggle("guest")}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.guestName} onChange={e => set("guestName", e.target.value)} placeholder="Full legal name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+233 000 000 000" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <input className="form-input" value={form.nationality} onChange={e => set("nationality", e.target.value)} placeholder="e.g. Ghanaian" />
                </div>
                <div className="form-group">
                  <label className="form-label">Home Address</label>
                  <input className="form-input" value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street, City" />
                </div>
              </div>
            </Section>

            {/* Section 2: Identification */}
            <Section title="Identification" icon="transactions" open={openSection === "id"} onToggle={() => toggle("id")}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ID Type *</label>
                  <select className="form-select" value={form.idType} onChange={e => set("idType", e.target.value)}>
                    {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ID Number *</label>
                  <input className="form-input" value={form.idNumber} onChange={e => set("idNumber", e.target.value)} placeholder="ID / Passport number" />
                </div>
              </div>
            </Section>

            {/* Section 3: Stay Dates */}
            <Section title="Stay Dates" icon="revenue" open={openSection === "dates"} onToggle={() => toggle("dates")}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Check-In Date</label>
                  <input className="form-input" type="date" value={form.checkIn} onChange={e => set("checkIn", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-Out Date</label>
                  <input className="form-input" type="date" value={form.checkOut} onChange={e => set("checkOut", e.target.value)} />
                </div>
              </div>
              <div className="ci-nights-pill">
                <Icon name="revenue" size={13} color="var(--pd)" />
                {n} night{n !== 1 ? "s" : ""} · {fmt(room.price)}/night · Base: {fmt(base)}
              </div>
            </Section>

            {/* Section 4: Services with days */}
            <Section
              title={`Services at Check-in${selectedExtras.length ? ` (${selectedExtras.length} selected)` : ""}`}
              icon="service"
              open={openSection === "services"}
              onToggle={() => toggle("services")}
            >
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
              {selectedExtras.length > 0 && (
                <div className="ci-nights-pill" style={{ marginTop: 12 }}>
                  <Icon name="receipt" size={13} color="var(--pd)" />
                  {selectedExtras.length} service{selectedExtras.length !== 1 ? "s" : ""} · {fmt(extTot)} total
                </div>
              )}
            </Section>

            {/* Total */}
            <div className="ci-total-row">
              <span style={{ color: "var(--g500)", fontSize: 13 }}>Total Estimated Charge</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: "var(--pdd)" }}>{fmt(total)}</span>
            </div>
          </div>

          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-p" onClick={submit} disabled={loading}>
              {loading
                ? <><span className="spin-ring" /> Checking in…</>
                : <><Icon name="building" size={15} color="white" /> Check In &amp; Issue Receipt</>
              }
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
