const ALL_MODS = [
  { key: "drugstore",  label: "Drug Store" },
  { key: "mart",       label: "Mart" },
  { key: "hotel",      label: "Hotel" },
  { key: "restaurant", label: "Restaurant" },
  { key: "storefront", label: "E-commerce Store" },
];

// allowedModules: optional array of enabled module keys — filters the displayed list.
// When omitted, all modules are shown (backwards-compatible default).
export default function ModulesCheckbox({ selected, onChange, allowedModules }) {
  const mods = allowedModules
    ? ALL_MODS.filter(m => allowedModules.includes(m.key))
    : ALL_MODS;

  const toggle = (key) => {
    const next = selected.includes(key)
      ? selected.filter(x => x !== key)
      : [...selected, key];
    onChange(next);
  };

  return (
    <div className="chk-group">
      {mods.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`chk-opt ${selected.includes(key) ? "on" : ""}`}
          onClick={() => toggle(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
