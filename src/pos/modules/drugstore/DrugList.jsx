import { useState } from "react";
import { fmt } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Icon from "../../../shared/components/Icon";
import useTapSelect from "../../../shared/hooks/useTapSelect";

function DrugRow({ drug, inCart, onToggle }) {
  const outOfStock = drug.stock <= 0;
  const tapProps = useTapSelect(() => onToggle(drug.id));
  return (
    <div className={`li ${inCart ? "ic" : ""} ${outOfStock && !inCart ? "oos" : ""}`} {...tapProps}>
      <div>
        <div className="li-name">{drug.name}</div>
        <div className="li-sub">{drug.cat} · {outOfStock ? "Out of stock" : `Stock: ${drug.stock}`}</div>
      </div>
      <div className="li-right">
        <span className="li-price">{fmt(drug.price)}</span>
        {inCart && <span className="badge badge-green">✓</span>}
        {outOfStock && !inCart && <span className="badge badge-red">OOS</span>}
      </div>
    </div>
  );
}

export default function DrugList({ drugs, cart, onToggle }) {
  const [query, setQuery] = useState("");
  const filtered = query
    ? drugs.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.cat.toLowerCase().includes(query.toLowerCase())
      )
    : drugs;

  return (
    <Card>
      <CardHeader title="Drug Catalogue" />
      <CardBody>
        <div className="srch">
          <span className="srch-ico">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input placeholder="Search drug name or category..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="item-list">
          {filtered.length === 0
            ? <div className="nores">No drugs found</div>
            : filtered.map(d => (
                <DrugRow key={d.id} drug={d} inCart={cart.some(c => c.id === d.id)} onToggle={onToggle} />
              ))
          }
        </div>
        <p className="hint">Tap or double-click to add / remove</p>
      </CardBody>
    </Card>
  );
}
