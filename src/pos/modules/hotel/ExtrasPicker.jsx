import { useApp } from "../../AppContext";
import { fmt } from "../../helpers";
import { ROOM_EXTRAS } from "../../constants";

export default function ExtrasPicker() {
  const { state, dispatch } = useApp();
  const { hotelExtras } = state;

  return (
    <div className="form-group">
      <label className="form-label">Add Extras (click to toggle)</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 200, overflowY: "auto" }}>
        {ROOM_EXTRAS.map(e => {
          const active = hotelExtras.some(x => x.id === e.id);
          return (
            <div
              key={e.id}
              className={`li ${active ? "ic" : ""}`}
              style={{ borderRadius: 8, border: "1.5px solid var(--g200)" }}
              onClick={() => dispatch({ type: "TOGGLE_EXTRA", extra: e })}
            >
              <div><div className="li-name" style={{ fontSize: 12 }}>{e.name}</div></div>
              <span className="li-price">{fmt(e.price)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
