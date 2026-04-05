import Icon from "../../shared/components/Icon";

export default function EmptyCart({ icon, message }) {
  return (
    <div className="cart-empty">
      <div className="cart-empty-ico" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
        <Icon name={icon} size={32} color="var(--g300)" />
      </div>
      <p style={{ fontSize: 13, color: "var(--g400)" }}>{message}</p>
    </div>
  );
}
