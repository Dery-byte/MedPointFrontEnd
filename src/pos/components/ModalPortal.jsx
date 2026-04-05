import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

/**
 * Renders children into document.body via a portal,
 * bypassing any ancestor overflow/transform stacking context.
 */
export default function ModalPortal({ children }) {
  const el = useRef(document.createElement("div"));

  useEffect(() => {
    const node = el.current;
    document.body.appendChild(node);
    // Prevent body scroll while modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.removeChild(node);
      document.body.style.overflow = "";
    };
  }, []);

  return ReactDOM.createPortal(children, el.current);
}
