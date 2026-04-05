import { useState, useEffect } from "react";
import Icon from "../../shared/components/Icon";

/**
 * VariationPicker
 *
 * variations = [
 *   { name: "Size", options: [{ label: "S", price: 10, stock: 5 }, ...] },
 *   { name: "Color", options: [{ label: "Red", colorHex: "#e74c3c", price: 12, stock: 3 }, ...] },
 * ]
 *
 * onSelect(selected) — called whenever a selection changes
 *   selected = { Size: { label: "M", price: 12, stock: 8 }, Color: { label: "Blue", ... } }
 */
export default function VariationPicker({ variations = [], onSelect, initialSelected = {} }) {
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => {
    onSelect?.(selected);
  }, [selected]);

  if (!variations || variations.length === 0) return null;

  const choose = (varName, option) => {
    setSelected((prev) => ({ ...prev, [varName]: option }));
  };

  // Computed combined price from all selected variations
  const selectedOptions = Object.values(selected);
  const hasAllSelected = variations.every((v) => selected[v.name]);

  // Stock is the minimum across all selected options
  const combinedStock = hasAllSelected
    ? Math.min(...selectedOptions.map((o) => o.stock ?? 999))
    : null;

  return (
    <div className="variation-picker">
      {variations.map((variation) => {
        const sel = selected[variation.name];
        const isColor = variation.options.some((o) => o.colorHex);

        return (
          <div key={variation.name} className="variation-group">
            <div className="variation-label-row">
              <span className="variation-label">{variation.name}</span>
              {sel && (
                <span className="variation-selected-label">
                  {sel.label}
                  {sel.stock !== undefined && sel.stock <= 5 && sel.stock > 0 && (
                    <span className="variation-low-stock">
                      <Icon name="alert" size={11} /> {sel.stock} left
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className={`variation-options${isColor ? " variation-options-color" : ""}`}>
              {variation.options.map((option) => {
                const isSelected = sel?.label === option.label;
                const oos = option.stock === 0;

                if (isColor) {
                  return (
                    <button
                      key={option.label}
                      className={`variation-color-swatch${isSelected ? " variation-swatch-active" : ""}${oos ? " variation-oos" : ""}`}
                      onClick={() => !oos && choose(variation.name, option)}
                      disabled={oos}
                      title={option.label}
                      aria-label={`${variation.name}: ${option.label}`}
                      style={{ "--swatch-color": option.colorHex }}
                    >
                      <span
                        className="swatch-inner"
                        style={{ background: option.colorHex }}
                      />
                      {isSelected && (
                        <span className="swatch-check">
                          <Icon name="check" size={10} color="#fff" strokeWidth={3} />
                        </span>
                      )}
                      {oos && <span className="swatch-oos-line" />}
                    </button>
                  );
                }

                return (
                  <button
                    key={option.label}
                    className={`variation-pill${isSelected ? " variation-pill-active" : ""}${oos ? " variation-pill-oos" : ""}`}
                    onClick={() => !oos && choose(variation.name, option)}
                    disabled={oos}
                  >
                    {option.label}
                    {option.price != null && option.price !== 0 && (
                      <span className="variation-pill-price">
                        {option.price > 0 ? `+${option.price}` : option.price}
                      </span>
                    )}
                    {oos && <span className="variation-pill-oos-label">OOS</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Combined stock indicator when all selected */}
      {hasAllSelected && combinedStock !== null && combinedStock <= 5 && combinedStock > 0 && (
        <div className="variation-stock-warning">
          <Icon name="alert" size={14} color="var(--warning)" />
          Only {combinedStock} left with these options
        </div>
      )}
      {hasAllSelected && combinedStock === 0 && (
        <div className="variation-stock-warning variation-stock-oos">
          <Icon name="alert" size={14} color="var(--error)" />
          This combination is out of stock
        </div>
      )}
      {!hasAllSelected && (
        <p className="variation-prompt">
          Please select {variations.filter((v) => !selected[v.name]).map((v) => v.name).join(", ")}
        </p>
      )}
    </div>
  );
}
