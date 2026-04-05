import { useState } from "react";
import { useApp } from "../../AppContext";
import { fmt } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";

export default function ServiceSelector() {
  const { state, dispatch } = useApp();
  const { selSvcs, services } = state;
  const [svcQuery, setSvcQuery] = useState("");

  const filteredSvcs = svcQuery
    ? services.filter(s => s.name.toLowerCase().includes(svcQuery.toLowerCase()) || s.cat.toLowerCase().includes(svcQuery.toLowerCase()))
    : services;

  return (
    <Card style={{ marginBottom: 18 }}>
      <CardHeader title="Services" action={selSvcs.length > 0 ? <span className="bcnt">{selSvcs.length}</span> : null} />
      <CardBody>
        <div className="srch">
          <span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
          <input placeholder="Search & add services..." value={svcQuery} onChange={e => setSvcQuery(e.target.value)} />
        </div>
        <div className="item-list" style={{ maxHeight: 180 }}>
          {filteredSvcs.map(s => {
            const added = selSvcs.some(x => x.id === s.id);
            return (
              <div key={s.id} className={`li ${added ? "ic" : ""}`} onDoubleClick={() => dispatch({ type: "SVC_ADD_SERVICE", svc: s })}>
                <div><div className="li-name">{s.name}</div><div className="li-sub">{s.cat}</div></div>
                <div className="li-right">
                  <span className="li-price">{fmt(s.price)}</span>
                  {added && <span className="badge badge-green">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
        <p className="hint">Double-click to add · Double-click again to remove</p>
      </CardBody>
    </Card>
  );
}