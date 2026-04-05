import { useState } from "react";
import { useApp } from "../../AppContext";
import { fmt } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";
import CategoryTabs from "./CategoryTabs";
import useTapSelect from "../../../shared/hooks/useTapSelect";

function ProductRow({ product, inCart, onToggle }) {
  const tapProps = useTapSelect(() => onToggle(product.id));
  return (
    <div className={`li ${inCart ? "ic" : ""}`} {...tapProps}>
      <div>
        <div className="li-name">{product.name}</div>
        <div className="li-sub">{product.cat} · Stock: {product.stock}</div>
      </div>
      <div className="li-right">
        <span className="li-price">{fmt(product.price)}</span>
        {inCart && <span className="badge badge-green">✓</span>}
      </div>
    </div>
  );
}

export default function ProductList({ onToggle }) {
  const { state } = useApp();
  const { mCart, products, martCat } = state;
  const [query, setQuery] = useState("");

  const cats = [...new Set(products.map(p => p.cat))];
  const activeCat = martCat || cats[0];

  let filtered = products;
  if (query) {
    filtered = products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.cat.toLowerCase().includes(query.toLowerCase())
    );
  } else if (activeCat && activeCat !== "all") {
    filtered = products.filter(p => p.cat === activeCat);
  }

  return (
    <Card>
      <CardHeader title="Products" />
      <CardBody>
        <div className="srch">
          <span className="srch-ico">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input placeholder="Search product..." onInput={e => setQuery(e.target.value)} />
        </div>
        <CategoryTabs cats={cats} activeCat={activeCat} query={query} onSelect={() => setQuery("")} />
        <div className="item-list">
          {filtered.length === 0
            ? <div className="nores">No products found</div>
            : filtered.map(p => (
                <ProductRow key={p.id} product={p} inCart={mCart.some(c => c.id === p.id)} onToggle={onToggle} />
              ))
          }
        </div>
        <p className="hint">Tap or double-click to add / remove</p>
      </CardBody>
    </Card>
  );
}
