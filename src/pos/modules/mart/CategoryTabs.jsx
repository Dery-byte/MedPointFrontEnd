import { useApp } from "../../AppContext";

export default function CategoryTabs({ cats, activeCat, query, onSelect }) {
  const { dispatch } = useApp();

  const handleSelect = (cat) => {
    onSelect();
    dispatch({ type: "SET", key: "martCat", value: cat });
  };

  return (
    <div className="mtabs">
      {cats.map(c => (
        <button key={c} className={`mtab ${activeCat === c && !query ? "on" : ""}`} onClick={() => handleSelect(c)}>{c}</button>
      ))}
      <button className={`mtab ${activeCat === "all" && !query ? "on" : ""}`} onClick={() => handleSelect("all")}>All</button>
    </div>
  );
}
