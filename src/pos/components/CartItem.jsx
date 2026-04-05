import { fmt } from "../helpers";

export default function CartItem({ item, onQty, onRemove }) {
  return (
    <div className="ci">
      <div className="ci-name-inline">{item.name}</div>
      <div className="ci-controls-inline">
        <button className="qbtn" onClick={() => onQty(item.id, item.qty - 1)}>−</button>
        <input className="qinp" type="number" min="1" value={item.qty} onChange={e => onQty(item.id, parseInt(e.target.value) || 1)} />
        <button className="qbtn" onClick={() => onQty(item.id, item.qty + 1)}>+</button>
        <span className="ci-price-inline">{fmt(item.price * item.qty)}</span>
        <button className="rmbtn" onClick={() => onRemove(item.id)}>✕</button>
      </div>
    </div>
  );
}
