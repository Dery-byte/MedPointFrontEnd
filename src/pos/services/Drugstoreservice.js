import api from "../../shared/services/api";

// ── Mappers ───────────────────────────────────────────────────────────────────

/** DrugResponse → app shape */
export function mapDrug(d) {
  return {
    id: d.id,
    name: d.name,
    cat: d.category,
    price: parseFloat(d.price),
    costPrice: d.costPrice != null ? parseFloat(d.costPrice) : null,
    stock: d.stock,
    expiryDate: d.expiryDate || null,
    active: d.active,
    lowStock: d.lowStock,
    expiryStatus: d.expiryStatus || "OK",
  };
}

/** MedicalServiceResponse → app shape */
export function mapService(s) {
  return {
    id: s.id,
    name: s.name,
    cat: s.category,
    price: parseFloat(s.price),
    costPrice: s.costPrice != null ? parseFloat(s.costPrice) : null,
    active: s.active,
  };
}

/** NonDrugItemResponse → app shape */
export function mapNonDrug(n) {
  return {
    id: n.id,
    name: n.name,
    cat: n.category,
    price: parseFloat(n.price),
    costPrice: n.costPrice != null ? parseFloat(n.costPrice) : null,
    active: n.active,
  };
}

/** TransactionResponse → AppContext ADD_TX shape */
export function mapTransaction(tx) {
  return {
    id: tx.reference,                        // app uses string ref e.g. "TX-5"
    mod: tx.module?.toLowerCase() || "drugstore",
    amount: parseFloat(tx.amount),
    staff: tx.staffName,
    date: tx.createdAt,
    desc: tx.description,
    status: tx.status?.toLowerCase() || "active",
    lineItems: (tx.lineItems || []).map(li => ({
      id: li.id,
      name: li.name,
      qty: li.quantity,
      price: parseFloat(li.unitPrice),
      subtotal: parseFloat(li.subtotal),
      kind: li.kind,
    })),
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

const DrugstoreService = {

  // ── Drugs ──────────────────────────────────────────────────────────────────

  /** GET /drugstore/drugs */
  async getAllDrugs() {
    const { data } = await api.get("/drugstore/drugs");
    return data.map(mapDrug);
  },

  /** POST /drugstore/drugs */
  async createDrug({ name, cat, price, costPrice, stock, expiryDate }) {
    const { data } = await api.post("/drugstore/drugs", {
      name, category: cat, price,
      costPrice: costPrice != null ? parseFloat(costPrice) : null,
      stock,
      expiryDate: expiryDate || null,
    });
    return mapDrug(data);
  },



  
  /** PUT /drugstore/drugs/:id */
  async updateDrug(id, { name, cat, price, costPrice, stock, expiryDate }) {
    const { data } = await api.put(`/drugstore/drugs/${id}`, {
      name,
      category: cat,
      price,
      costPrice: costPrice != null ? parseFloat(costPrice) : null,
      stock,
      expiryDate: expiryDate || null,
    });
    return mapDrug(data);
  },

  /** DELETE /drugstore/drugs/:id */
  async deleteDrug(id) {
    await api.delete(`/drugstore/drugs/${id}`);
  },

  /** PATCH /drugstore/drugs/:id/restock */
  async restockDrug(id, qty) {
    const { data } = await api.patch(`/drugstore/drugs/${id}/restock`, { quantity: qty });
    return mapDrug(data);
  },

  // ── Non-Drug Items ─────────────────────────────────────────────────────────

  // ── Non-Drug Items ─────────────────────────────────────────────────────────

  /** GET /drugstore/non-drug-items */
  async getAllNonDrugs() {
    const { data } = await api.get("/drugstore/non-drug-items");
    return data.map(mapNonDrug);
  },

  /** POST /drugstore/non-drug-items */
  async createNonDrug({ name, cat, price, costPrice }) {
    const { data } = await api.post("/drugstore/non-drug-items", {
      name, category: cat, price,
      costPrice: costPrice != null ? parseFloat(costPrice) : null,
    });
    return mapNonDrug(data);
  },

  /** PUT /drugstore/non-drug-items/:id */
  async updateNonDrug(id, { name, cat, price, costPrice }) {
    const { data } = await api.put(`/drugstore/non-drug-items/${id}`, {
      name, category: cat, price,
      costPrice: costPrice != null ? parseFloat(costPrice) : null,
    });
    return mapNonDrug(data);
  },

  /** DELETE /drugstore/non-drug-items/:id */
  async deleteNonDrug(id) {
    await api.delete(`/drugstore/non-drug-items/${id}`);
  },

  // ── Medical Services ───────────────────────────────────────────────────────

  /** GET /drugstore/services */
  async getAllServices() {
    const { data } = await api.get("/drugstore/services");
    return data.map(mapService);
  },

  /** POST /drugstore/services */
  async createService({ name, cat, price, costPrice }) {
    const { data } = await api.post("/drugstore/services", {
      name, category: cat, price,
      costPrice: costPrice != null ? parseFloat(costPrice) : null,
    });
    return mapService(data);
  },

  /** PUT /drugstore/services/:id */
  async updateService(id, { name, cat, price, costPrice }) {
    const { data } = await api.put(`/drugstore/services/${id}`, {
      name, category: cat, price,
      costPrice: costPrice != null ? parseFloat(costPrice) : null,
    });
    return mapService(data);
  },

  /** DELETE /drugstore/services/:id */
  async deleteService(id) {
    await api.delete(`/drugstore/services/${id}`);
  },

  // ── Bulk Import ────────────────────────────────────────────────────────────

  /**
   * Bulk-create drugs from an Excel import.
   * Falls back to sequential single creates if no bulk endpoint exists.
   * @param {Array<{ name, cat, price, stock, expiryDate? }>} drugs
   * @returns {Promise<Array>} - created drug objects
   */
  async bulkCreateDrugs(drugs) {
    try {
      // Try bulk endpoint first
      const { data } = await api.post("/drugstore/drugs/bulk", {
        drugs: drugs.map(d => ({
          name: d.name,
          category: d.cat,
          price: parseFloat(d.price),
          stock: parseInt(d.stock) || 0,
          expiryDate: d.expiryDate || null,
        })),
      });
      return Array.isArray(data) ? data.map(mapDrug) : data.created?.map(mapDrug) || [];
    } catch (bulkErr) {
      if (bulkErr?.response?.status !== 404) throw bulkErr;
      // Fallback: sequential single creates
      const results = [];
      for (const d of drugs) {
        const created = await DrugstoreService.createDrug(d);
        results.push(created);
      }
      return results;
    }
  },

  /**
   * Bulk-create non-drug items.
   */
  async bulkCreateNonDrugs(items) {
    const results = [];
    for (const item of items) {
      const created = await DrugstoreService.createNonDrug(item);
      results.push(created);
    }
    return results;
  },

  // ── Dispense ───────────────────────────────────────────────────────────────

  /**
   * POST /drugstore/dispense
   * @param {Array<{ id, qty }>} items - app cart items
   */
  async dispenseDrugs(items) {
    const { data } = await api.post("/drugstore/dispense", {
      items: items.map(i => ({ drugId: i.id, quantity: i.qty })),
    });
    return mapTransaction(data);
  },

  /**
   * POST /drugstore/dispense-service
   * @param {number[]} serviceIds
   * @param {Array<{ id, qty, isDrug }>} items - drug + non-drug line items
   */
  async dispenseService(serviceIds, items = []) {
    const { data } = await api.post("/drugstore/dispense-service", {
      serviceIds,
      items: items.map(i => ({
        itemId: i.id,
        isDrug: i.isDrug ?? true,
        quantity: i.qty,
      })),
    });
    return mapTransaction(data);
  },
};

export default DrugstoreService;