export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ title, action }) {
  return (
    <div className="card-hd">
      <h3>{title}</h3>
      {action}
    </div>
  );
}

export function CardBody({ children, noPad = false }) {
  return <div className="card-bd" style={noPad ? { padding: 0 } : {}}>{children}</div>;
}
