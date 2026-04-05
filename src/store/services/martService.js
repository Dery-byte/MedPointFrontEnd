// import api from "./storeApi";

import api from "../../shared/services/api"


/**
 * Maps backend product to storefront shape.
 * Backend: { id, name, category, price, costPrice, stock, imageUrl, active, lowStock }
 */
export function mapProduct(p) {
  return {
    id:          p.id,
    name:        p.name,
    cat:         p.category ?? p.cat,
    price:       parseFloat(p.price),
    costPrice:   p.costPrice != null ? parseFloat(p.costPrice) : null,
    stock:       p.stock ?? 0,
    imageUrl:    p.imageUrl ?? null,
    active:      p.active ?? true,
    lowStock:    p.lowStock ?? false,
    featured:    p.featured ?? false,
    discount:    p.discount ?? null,
    onSale:      p.onSale ?? null,
    variations:  p.variations ?? [],
    tags:        p.tags ?? [],
    description: p.description ?? "",
    showOnStore: p.showOnStore ?? true,
  };
}

function mapCategory(c) {
  return {
    id: c.id,
    name: typeof c === "string" ? c : c.name,
  };
}


function buildProductRequest(p) {
  const toStr = (v) => Array.isArray(v) ? v.join(",") : (v ?? null);
  return {
    name:        p.name,
    category:    p.cat,
    price:       parseFloat(p.price),
    costPrice:   p.costPrice ? parseFloat(p.costPrice) : null,
    stock:       parseInt(p.stock),
    featured:    p.featured ?? false,
    discount:    p.discount ?? null,
    onSale:      p.onSale ?? null,
    variations:  toStr(p.variations),
    tags:        toStr(p.tags),
    description: p.description ?? "",
    showOnStore: p.showOnStore ?? true,
  };
}

const MartService = {
  // ── Products ────────────────────────────────────────────────────────────────

  /** GET /mart/products — public, no auth needed */
  async getAll() {
    const { data } = await api.get("/mart/products");
    return data.map(mapProduct).filter((p) => p.active && p.stock > 0);
  },

  /** GET /mart/products/:id */
  async getById(id) {
    const { data } = await api.get(`/mart/products/${id}`);
    return mapProduct(data);
  },

  /** GET /mart/categories */
  async getCategories() {
    const { data } = await api.get("/mart/categories");
    return data.map(mapCategory);
  },

  // ── Admin Product Management ─────────────────────────────────────────────

  /** GET /mart/products — all including inactive, for admin */
  async getAllAdmin() {
    const { data } = await api.get("/mart/products");
    return data.map(mapProduct);
  },

  /** POST /mart/products */
  async create(product) {
    const { data } = await api.post("/mart/products", buildProductRequest(product));
    return mapProduct(data);
  },

  /** PUT /mart/products/:id */
  async update(id, product) {
    const { data } = await api.put(`/mart/products/${id}`, buildProductRequest(product));
    return mapProduct(data);
  },

  /** DELETE /mart/products/:id */
  async remove(id) {
    await api.delete(`/mart/products/${id}`);
  },

  /** PATCH /mart/products/:id/restock */
  async restock(id, quantity) {
    const { data } = await api.patch(`/mart/products/${id}/restock`, {
      quantity,
    });
    return mapProduct(data);
  },

  /**
   * POST /mart/products/:id/image — multipart/form-data
   * @param {number} id
   * @param {File} file
   */
  async uploadImage(id, file) {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post(`/mart/products/${id}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.imageUrl ?? data.url ?? null;
  },

  /** POST /mart/categories */
  async createCategory(name) {
    const { data } = await api.post("/mart/categories", { name });
    return mapCategory(data);
  },

  /** PUT /mart/categories/:id */
  async renameCategory(id, name) {
    const { data } = await api.put(`/mart/categories/${id}`, { name });
    return mapCategory(data);
  },

  /** DELETE /mart/categories/:id */
  async deleteCategory(id) {
    await api.delete(`/mart/categories/${id}`);
  },
};

export default MartService;
