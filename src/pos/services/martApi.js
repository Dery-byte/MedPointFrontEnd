


import api from "../../shared/services/api";

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapProduct(p) {
  return {
    id: p.id, name: p.name, cat: p.category,
    price: parseFloat(p.price),
    costPrice: p.costPrice != null ? parseFloat(p.costPrice) : null,
    stock: p.stock,
    showOnStore: p.showOnStore ?? true,
  };
}

function toProductRequest(product) {
  return {
    name:        product.name,
    category:    product.cat,
    price:       parseFloat(product.price),
    costPrice:   product.costPrice != null ? parseFloat(product.costPrice) : null,
    stock:       parseInt(product.stock),
    showOnStore: product.showOnStore ?? true,
  };
}

function mapCategory(c) {
  return { id: c.id, name: c.name };
}

// ─── Service ──────────────────────────────────────────────────────────────────

const MartService = {

  // ── Products ────────────────────────────────────────────────────────────────

  async getAll() {
    const { data } = await api.get("/mart/products");
    return data.map(mapProduct);
  },

  async getById(id) {
    const { data } = await api.get(`/mart/products/${id}`);
    return mapProduct(data);
  },

  async create(product) {
    const { data } = await api.post("/mart/products", toProductRequest(product));
    return mapProduct(data);
  },

  async update(id, product) {
    const { data } = await api.put(`/mart/products/${id}`, toProductRequest(product));
    return mapProduct(data);
  },

  async remove(id) {
    await api.delete(`/mart/products/${id}`);
  },

  async restock(id, quantity) {
    const { data } = await api.patch(`/mart/products/${id}/restock`, { quantity });
    return mapProduct(data);
  },

  /**
   * Bulk-create mart products from an Excel import.
   * Tries a bulk endpoint first, falls back to sequential single creates.
   */
  async bulkCreate(products) {
    try {
      const { data } = await api.post("/mart/products/bulk", {
        products: products.map(p => toProductRequest(p)),
      });
      return Array.isArray(data) ? data.map(mapProduct) : data.created?.map(mapProduct) || [];
    } catch (bulkErr) {
      if (bulkErr?.response?.status !== 404) throw bulkErr;
      const results = [];
      for (const p of products) {
        const created = await MartService.create(p);
        results.push(created);
      }
      return results;
    }
  },

  // ── Categories ──────────────────────────────────────────────────────────────

  async getCategories() {
    const { data } = await api.get("/mart/categories");
    return data.map(mapCategory);   // [{ id, name }]
  },

  async createCategory(name) {
    const { data } = await api.post("/mart/categories", { name });
    return mapCategory(data);
  },

  async renameCategory(id, name) {
    const { data } = await api.put(`/mart/categories/${id}`, { name });
    return mapCategory(data);
  },

  async deleteCategory(id) {
    await api.delete(`/mart/categories/${id}`);
  },

  async uploadImage(id, file) {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post(`/mart/products/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.imageUrl;
  },



























  async uploadExcel(file) {
  try {
    // Prepare FormData
    const formData = new FormData();
    formData.append("file", file);
    // Make API call
    const { data } = await api.post("/mart/products/upload-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // If the backend returns a list of ProductResponse
    return Array.isArray(data) ? data.map(mapProduct) : [];
  } catch (err) {
    console.error("Excel upload failed", err);
    throw err;
  }
}
};

export default MartService;