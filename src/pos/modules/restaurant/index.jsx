import { useApp } from "../../AppContext";
import TableGrid from "./TableGrid";
import OrderPanel from "./OrderPanel";
import RestaurantService from "../../services/Restaurantservice";
import { useState, useEffect } from "react";
import api from "../../../shared/services/api";

function mapTable(t) {
  return {
    id:       t.id,
    name:     t.name ?? `Table ${t.tableNumber ?? t.id}`,
    capacity: t.capacity,
    status:   t.status?.toLowerCase(),
    occ:      t.status?.toLowerCase() === "occupied",
    orderId:  t.activeOrderId ?? null,
  };
}

function mapOrder(order, tableId) {
  return {
    id:      order.id,
    tableId: tableId ?? order.tableId,
    status:  order.status,
    items:   (order.items || []).map(i => ({
      id:    i.menuItemId,
      name:  i.menuItemName,
      qty:   i.quantity,
      price: parseFloat(i.unitPrice),
      cat:   i.category,
      type:  i.type?.toLowerCase(),
    })),
  };
}

export default function RestaurantModule() {
  const { state, dispatch } = useApp();
  const { tables, orders, restoTable } = state;
  const [opening, setOpening]   = useState(false);
  const [syncing, setSyncing]   = useState(false);

  // Sync table state from DB every time this module mounts or regains focus
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      setSyncing(true);
      try {
        const { data } = await api.get("/restaurant/tables");
        if (cancelled) return;

        const freshTables = data.map(mapTable);

        // Also fetch open orders for tables that have an activeOrderId
        const orderFetches = freshTables
          .filter(t => t.orderId)
          .map(t =>
            api.get(`/restaurant/orders/${t.orderId}`)
              .then(r => mapOrder(r.data, t.id))
              .catch(() => null)
          );
        const freshOrders = (await Promise.all(orderFetches)).filter(Boolean);

        dispatch({ type: "SYNC_TABLES", tables: freshTables, orders: freshOrders });
      } catch (err) {
        console.error("Failed to sync tables:", err);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    };
    sync();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tableClick = async (tid) => {
    const t = tables.find(t => t.id === tid);
    if (!t) return;

    // Deselect if already selected — close panel
    if (restoTable === tid) {
      dispatch({ type: "CLOSE_TABLE" });
      return;
    }

    // Table has an open order OR is occupied — open the panel so staff can add items
    // The OrderPanel will always re-fetch fresh state from DB when it mounts
    if (t.orderId || t.occ) {
      dispatch({ type: "SET", key: "restoTable", value: tid });
      return;
    }

    // Table is available — open a new order
    try {
      setOpening(true);
      const order = await RestaurantService.openOrder(tid);
      dispatch({ type: "TABLE_CLICK_OPEN", tableId: tid, orderId: order.id });
      if (order.items?.length) {
        dispatch({ type: "SYNC_ORDER_ITEMS", orderId: order.id, items: order.items });
      }
    } catch (err) {
      console.error("Failed to open table:", err);
      alert("Could not open table. Please try again.");
    } finally {
      setOpening(false);
    }
  };

  return (
    <div>
      <div className="pg-hd">
        <h2>Restaurant &amp; Bar</h2>
        <p>
          {syncing
            ? <span style={{ color: "var(--g400)", fontSize: 13 }}>Syncing tables…</span>
            : "Click a table to take or manage an order"
          }
        </p>
      </div>
      <TableGrid onTableClick={tableClick} />
      {opening && (
        <div style={{ padding: "12px 0", color: "var(--g400)", fontSize: 13 }}>Opening table…</div>
      )}
      {restoTable && <OrderPanel tableId={restoTable} />}
    </div>
  );
}
