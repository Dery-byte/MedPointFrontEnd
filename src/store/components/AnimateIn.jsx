import { useEffect, useRef, useState } from "react";

/**
 * AnimateIn — wraps children in a scroll-reveal container.
 * Children fade+slide up when they enter the viewport.
 *
 * Props:
 *   delay    — ms delay before animation fires (default 0)
 *   stagger  — if true, auto-adds stagger-N classes to direct children
 *   from     — "up" | "left" | "right" | "down" (default "up")
 *   className — additional classes on wrapper
 *   as       — wrapper element tag (default "div")
 *   threshold — intersection threshold 0–1 (default 0.12)
 *   once     — only animate once (default true)
 */
export default function AnimateIn({
  children,
  delay = 0,
  stagger = false,
  from = "up",
  className = "",
  as: Tag = "div",
  threshold = 0.12,
  once = true,
  style = {},
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  const dirClass = {
    up:    "animate-hidden",
    left:  "animate-hidden animate-from-left",
    right: "animate-hidden animate-from-right",
    down:  "animate-hidden animate-from-down",
  }[from] || "animate-hidden";

  return (
    <Tag
      ref={ref}
      className={`${dirClass} ${visible ? "animate-visible" : ""} ${className}`}
      style={{
        transitionDelay: visible ? `${delay}ms` : "0ms",
        ...style,
      }}
    >
      {stagger
        ? (Array.isArray(children) ? children : [children]).map((child, i) =>
            child
              ? <span key={i} className={`stagger-${Math.min(i + 1, 8)}`}>{child}</span>
              : null
          )
        : children}
    </Tag>
  );
}

/**
 * StaggerGrid — wraps a list of items so each gets a stagger delay.
 * Useful for product grids.
 */
export function StaggerGrid({ children, className = "", threshold = 0.06 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {(Array.isArray(children) ? children : [children]).map((child, i) =>
        child ? (
          <div
            key={i}
            className="animate-hidden"
            style={{
              transitionDelay: visible ? `${i * 60}ms` : "0ms",
              ...(visible ? { opacity: 1, transform: "translateY(0)" } : {}),
            }}
          >
            {child}
          </div>
        ) : null
      )}
    </div>
  );
}
