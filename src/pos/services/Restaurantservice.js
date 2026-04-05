import api from "../../shared/services/api";

// ── Menu Item mapping ─────────────────────────────────────────────────────────

function mapMenuItem(item) {
  return {
    ...item,
    cat:       item.category,
    type:      item.type?.toLowerCase(),
    price:     parseFloat(item.price),
    costPrice: item.costPrice != null ? parseFloat(item.costPrice) : null,
  };
}

function mapMenuItemPayload({ name, type, cat, price, costPrice }) {
  return {
    name,
    category:  cat,
    type:      type?.toUpperCase(),
    price,
    costPrice: costPrice != null ? parseFloat(costPrice) : null,
  };
}

// ── Order mapping ─────────────────────────────────────────────────────────────

/**
 * Maps a backend OrderResponse to the local order shape the frontend uses.
 *
 * Backend:  { id, tableNumber, status, items: [{ menuItemId, menuItemName, category, type, quantity, unitPrice }] }
 * Frontend: { id, tableId,    status, items: [{ id, name, cat, type, qty, price }] }
 */
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

// ── Service ───────────────────────────────────────────────────────────────────

const RestaurantService = {

  // ── Menu Items ──────────────────────────────────────────────────────────────

  /** GET /restaurant/menu-items */
  async getMenuItems() {
    const { data } = await api.get("/restaurant/menu-items");
    return data.map(mapMenuItem);
  },

  /** POST /restaurant/menu-items */
  async createMenuItem(payload) {
    const { data } = await api.post("/restaurant/menu-items", mapMenuItemPayload(payload));
    return mapMenuItem(data);
  },

  /** PUT /restaurant/menu-items/{id} */
  async updateMenuItem(id, payload) {
    const { data } = await api.put(`/restaurant/menu-items/${id}`, mapMenuItemPayload(payload));
    return mapMenuItem(data);
  },

  /** DELETE /restaurant/menu-items/{id} */
  async deleteMenuItem(id) {
    await api.delete(`/restaurant/menu-items/${id}`);
  },

  // ── Orders ──────────────────────────────────────────────────────────────────

  /**
   * POST /restaurant/orders { tableId }
   * Opens a new order for the table (or returns existing open order).
   * Returns mapped local order.
   */
  async openOrder(tableId) {
    const { data } = await api.post("/restaurant/orders", { tableId });
    return mapOrder(data, tableId);
  },

  /**
   * PUT /restaurant/orders/{orderId}/items { items: [{ menuItemId, quantity }] }
   * Fully replaces all items on the order.
   * Returns mapped local order.
   */
  async updateOrderItems(orderId, items) {
    const { data } = await api.put(`/restaurant/orders/${orderId}/items`, {
      items: items.map(i => ({ menuItemId: i.id, quantity: i.qty })),
    });
    return mapOrder(data);
  },

  /**
   * POST /restaurant/bill { tableId }
   * Bills the table, closes the order, creates a transaction.
   * Returns raw TransactionResponse.
   */
  async billTable(tableId) {
    const { data } = await api.post("/restaurant/bill", { tableId });
    return data;
  },
/**
   * POST /restaurant/orders/table/{tableId}/free
   * Sets the table status back to AVAILABLE.
   */
  async freeTable(tableId) {
    const { data } = await api.post(`/restaurant/orders/table/${tableId}/free`);
    return data;
  },

  
};

export default RestaurantService;