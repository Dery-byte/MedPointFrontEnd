import ModalPortal from "./ModalPortal";

export default function OutOfStockModal({ drugName, onClose }) {
  return (
    <ModalPortal>
      <div className="oos-bg">
        <div className="oos-box">
          <div className="oos-icon">🚫</div>
          <div className="oos-title">Out of Stock</div>
          <div className="oos-msg">
            <strong>{drugName}</strong> is currently out of stock and cannot be dispensed.
            Please restock before dispensing.
          </div>
          <button className="oos-btn" onClick={onClose} autoFocus>Got it</button>
        </div>
      </div>
    </ModalPortal>
  );
}
