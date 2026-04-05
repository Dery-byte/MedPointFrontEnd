import { useApp } from "../../AppContext";
import { fmt } from "../../helpers";
import useTapSelect from "../../../shared/hooks/useTapSelect";
import Icon from "../../../shared/components/Icon";

function MenuItem({ item, inOrd, onToggle }) {
  const tapProps = useTapSelect(() => onToggle(item));
  return (
    <div className={`li ${inOrd ? "ic" : ""}`} {...tapProps}>
      <div>
        <div className="li-name">{item.name}</div>
        <div className="li-sub">{item.cat}</div>
      </div>
      <div className="li-right">
        <span className="li-price">{fmt(item.price)}</span>
        {inOrd && <span className="badge badge-green">✓</span>}
      </div>
    </div>
  );
}

export default function MenuPanel({ tableId, ordItems, onToggle }) {
  const { state, dispatch } = useApp();
  const { restoOrderTab, menuItems, tables } = state;

  const table      = tables.find(t => t.id === tableId);
  const isOccupied = table?.occ;

  const menuType = restoOrderTab || "food";
  const filtered = menuItems.filter(m => m.type === menuType);
  const cats     = [...new Set(filtered.map(m => m.cat))];

  return (
    <div className="card">
      <div className="card-hd">
        <h3>Menu — Table {tableId}</h3>
        <button
          className="btn btn-sec btn-sm"
          onClick={() => dispatch({ type: "CLOSE_TABLE" })}
        >
          Close
        </button>
      </div>
      <div className="card-bd">
        {isOccupied && (
          <div className="alert alert-warn" style={{ marginBottom: 12 }}>
            <Icon name="receipt" size={14} color="#b45309" />
            Table billed — add items below for a new order.
          </div>
        )}
        <div className="mtabs">
          <button
            className={`mtab ${menuType === "food" ? "on" : ""}`}
            onClick={() => dispatch({ type: "SET", key: "restoOrderTab", value: "food" })}
          >Food</button>
          <button
            className={`mtab ${menuType === "drink" ? "on" : ""}`}
            onClick={() => dispatch({ type: "SET", key: "restoOrderTab", value: "drink" })}
          >Drinks</button>
        </div>

        <div className="item-list">
          {cats.length === 0 ? (
            <div className="nores">No menu items found</div>
          ) : cats.map(cat => (
            <div key={cat}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "var(--g400)",
                textTransform: "uppercase", letterSpacing: ".06em",
                padding: "8px 14px 4px", background: "var(--g50)",
                borderBottom: "1px solid var(--g100)"
              }}>
                {cat}
              </div>
              {filtered.filter(m => m.cat === cat).map(m => (
                <MenuItem key={m.id} item={m} inOrd={ordItems.some(i => i.id === m.id)} onToggle={onToggle} />
              ))}
            </div>
          ))}
        </div>
        <p className="hint">Tap or double-click to add / remove</p>
      </div>
    </div>
  );
}
