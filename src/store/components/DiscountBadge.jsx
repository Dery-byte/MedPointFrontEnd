/**
 * DiscountBadge — shows a discount tag.
 * discount = { type: "percent"|"fixed", value, label? }
 */
export function DiscountBadge({ discount, size = "md", className = "" }) {
  if (!discount) return null;

  const label =
    discount.label ||
    (discount.type === "percent"
      ? `${discount.value}% OFF`
      : `Save ${discount.value}`);

  return (
    <span className={`discount-badge discount-badge-${size} ${className}`}>
      {label}
    </span>
  );
}

/**
 * PriceDisplay — shows current price with optional strikethrough original.
 */
export function PriceDisplay({ price, discount, currencySymbol = "GH₵", className = "" }) {
  const fmt = (n) => `${currencySymbol} ${Number(n).toFixed(2)}`;

  if (!discount) {
    return <span className={`price-display ${className}`}>{fmt(price)}</span>;
  }

  let originalPrice = price;
  let currentPrice = price;

  if (discount.type === "percent") {
    currentPrice = price * (1 - discount.value / 100);
  } else if (discount.type === "fixed") {
    currentPrice = Math.max(0, price - discount.value);
  }

  // If discount.originalPrice is explicitly set, use that
  if (discount.originalPrice) {
    originalPrice = discount.originalPrice;
    currentPrice = price; // price is already the discounted price
  }

  const saving = originalPrice - currentPrice;

  return (
    <div className={`price-display-group ${className}`}>
      <span className="price-current">{fmt(currentPrice)}</span>
      <span className="price-original">{fmt(originalPrice)}</span>
      {saving > 0 && (
        <span className="price-saving">Save {fmt(saving)}</span>
      )}
    </div>
  );
}
