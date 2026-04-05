import Icon from "../../shared/components/Icon";

export default function Loader({ size = 32, text = "" }) {
  return (
    <div className="loader-wrap">
      <Icon name="loader" size={size} color="var(--primary)" />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}

export function PageLoader({ text = "Loading..." }) {
  return (
    <div className="page-loader">
      <div className="page-loader-inner">
        <div className="page-loader-logo">M</div>
        <Icon name="loader" size={28} color="var(--primary)" />
        <p>{text}</p>
      </div>
    </div>
  );
}
