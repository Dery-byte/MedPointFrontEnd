import { useApp } from "../../AppContext";
import MenuPanel from "./MenuPanel";
import OrderBill from "./OrderBill";
import RestaurantService from "../../services/Restaurantservice";
import { useEffect } from "react";
import api from "../../../shared/services/api";

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

export default function OrderPanel({ tableId }) {
  const { state, dispatch } = useApp();
  const { tables, orders } = state;

  const table    = tables.find(t => t.id === tableId);
  const order    = orders.find(o => o.id === table?.orderId);
  const ordItems = order?.items || [];

  // Every time we switch to (or back to) a table that has an open orderId,
  // re-fetch the latest items from the DB so state always matches.
  useEffect(() => {
    if (!table?.orderId) return;
    api.get(`/restaurant/orders/${table.orderId}`)
      .then(r => {
        const fresh = mapOrder(r.data, tableId);
        dispatch({ type: "SYNC_ORDER_ITEMS", orderId: fresh.id, items: fresh.items });
      })
      .catch(err => console.error("Failed to refresh order:", err));
  }, [tableId, table?.orderId]); // re-run whenever we switch tables or orderId changes

  const syncItems = async (updatedItems) => {
    if (!order?.id) return;
    try {
      await RestaurantService.updateOrderItems(order.id, updatedItems);
    } catch (err) {
      console.error("Failed to sync order items:", err);
    }
  };

  // Ensure there's an open order, reopen if table was billed
  const ensureOrder = async () => {
    if (table?.orderId) return order?.id;
    // Table is occupied but orderId cleared — open a fresh order
    const newOrder = await RestaurantService.openOrder(tableId);
    dispatch({ type: "TABLE_REOPEN", tableId, orderId: newOrder.id });
    return newOrder.id;
  };

  const handleToggle = async (item) => {
    const orderId = await ensureOrder();
    if (!orderId) return;

    dispatch({ type: "RESTO_TOGGLE_ITEM", tableId, item });
    const exists = ordItems.some(i => i.id === item.id);
    const nextItems = exists
      ? ordItems.filter(i => i.id !== item.id)
      : [...ordItems, { ...item, qty: 1 }];
    await syncItems(nextItems);
  };

  const handleQty = async (itemId, qty) => {
    dispatch({ type: "RESTO_QTY", tableId, itemId, qty });
    const nextItems = ordItems.map(i => i.id === itemId ? { ...i, qty: Math.max(1, qty) } : i);
    await syncItems(nextItems);
  };

  const handleRemove = async (itemId) => {
    dispatch({ type: "RESTO_REMOVE", tableId, itemId });
    const nextItems = ordItems.filter(i => i.id !== itemId);
    await syncItems(nextItems);
  };

  const bill = async () => {
    if (!ordItems.length) return;
    try {
      const tx = await RestaurantService.billTable(tableId);
      const tot = ordItems.reduce((s, i) => s + i.price * i.qty, 0);

      const receiptItems = tx.lineItems
        ? tx.lineItems.map(li => ({
            id:    li.id ?? li.itemId,
            name:  li.name,
            cat:   li.category ?? li.cat ?? li.type,
            price: parseFloat(li.unitPrice ?? li.price),
            qty:   li.quantity ?? li.qty,
          }))
        : ordItems.map(i => ({ ...i }));

      dispatch({
        type: "ADD_TX",
        mod:   "restaurant",
        amount: tx.amount ?? tot,
        desc:   `Table ${tableId} — ${ordItems.length} items`,
        lineItems: ordItems.map(i => ({ name: i.name, qty: i.qty, price: i.price, cat: i.cat || i.type, costPrice: i.costPrice ?? null })),
      });

      dispatch({
        type: "SHOW_RECEIPT",
        data: {
          type:      "Restaurant & Bar",
          mod:       "restaurant",
          reference: tx.reference,
          tableId,
          items:     receiptItems,
          total:     tx.amount ?? tot,
          service:   null,
        },
      });

      dispatch({ type: "BILL_TABLE", tableId });
    } catch (err) {
      console.error("Failed to bill table:", err);
      throw err;
    }
  };

  return (
    <div className="split" style={{ marginTop: 24 }}>
      <MenuPanel tableId={tableId} ordItems={ordItems} onToggle={handleToggle} />
      <OrderBill
        tableId={tableId}
        ordItems={ordItems}
        onBill={bill}
        onQty={handleQty}
        onRemove={handleRemove}
      />
    </div>
  );
}
