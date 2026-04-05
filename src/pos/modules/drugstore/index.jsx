import { useApp } from "../../AppContext";
import DispenseTab from "./DispenseTab";
import ServiceTab from "./ServiceTab";
import Icon from "../../../shared/components/Icon";

export default function DrugStoreModule() {
  const { state, dispatch } = useApp();
  const { dsTab } = state;

  return (
    <div>
      <div className="pg-hd">
        <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="drugstore" size={22} color="var(--p)" />Drug Store
        </h2>
        <p>Dispense drugs or perform services</p>
      </div>
      <div className="ptabs">
        <button className={`ptab ${dsTab !== "services" ? "on" : ""}`} onClick={() => dispatch({ type: "SET", key: "dsTab", value: "dispense" })} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="pill" size={14} />Dispense Drugs
        </button>
        <button className={`ptab ${dsTab === "services" ? "on" : ""}`} onClick={() => dispatch({ type: "SET", key: "dsTab", value: "services" })} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="service" size={14} />Perform Services
        </button>
      </div>
      {dsTab === "services" ? <ServiceTab /> : <DispenseTab />}
    </div>
  );
}
