export default function Button({ variant = "sec", size = "", full = false, disabled = false, onClick, children, className = "" }) {
  const variantCls = { p: "btn-p", sec: "btn-sec", danger: "btn-danger", success: "btn-success", warn: "btn-warn" }[variant] || "btn-sec";
  const sizeCls = { sm: "btn-sm", lg: "btn-lg" }[size] || "";
  return (
    <button className={`btn ${variantCls} ${sizeCls} ${full ? "btn-full" : ""} ${className}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
