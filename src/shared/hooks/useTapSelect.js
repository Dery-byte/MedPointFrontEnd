import { useRef, useCallback } from "react";

/**
 * useTapSelect
 *
 * On desktop: fires onSelect on double-click (existing behaviour).
 * On touch (Android/mobile): fires onSelect on BOTH single tap AND double-tap,
 * so the item gets selected on first touch while a second tap within 350ms
 * also fires (matching the desktop double-click expectation).
 *
 * This keeps "double-tap to zoom" disabled on list items (via touch-action: manipulation)
 * while still allowing both interactions to work.
 */
export default function useTapSelect(onSelect) {
  const lastTap = useRef(0);

  const handleDoubleClick = useCallback(() => {
    onSelect();
  }, [onSelect]);

  const handleTouchEnd = useCallback((e) => {
    // Prevent the synthetic mouse events that follow touchend,
    // so we don't fire twice on mobile.
    e.preventDefault();
    const now = Date.now();
    // Fire on every tap — single tap selects
    onSelect();
    lastTap.current = now;
  }, [onSelect]);

  return {
    onDoubleClick: handleDoubleClick,
    onTouchEnd: handleTouchEnd,
    style: { touchAction: "manipulation" },
  };
}
