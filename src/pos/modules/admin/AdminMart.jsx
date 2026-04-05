import ModalPortal from "../../components/ModalPortal";
import { useState, useMemo, useEffect, useCallback } from "react";
import { fmt } from "../../helpers";
import { Card, CardHeader, CardBody } from "../../components/Card";
import { LOW_STOCK } from "../../constants";
import MartService from "../../services/martApi";
import ExcelImportModal from "../../components/ExcelImportModal";
import { exportToExcel, downloadMartTemplate } from "../../utils/excelUtils";
import { useConfig } from "../../../config/ConfigContext";

// ─── MODALS ───────────────────────────────────────────────────────────────────

function ProductModal({ product, cats, onClose, onSaved, storefrontEnabled }) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name || "");
  const [cat, setCat] = useState(product?.cat || cats[0]?.name || "");
  const [sellingPrice, setSelling] = useState(product?.price || "");
  const [costPrice, setCost] = useState(product?.costPrice ?? "");
  const [stock, setStock] = useState(product?.stock ?? "");
  const [showOnStore, setShowOnStore] = useState(product?.showOnStore ?? true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!name || !sellingPrice || stock === "") { setError("Name, selling price and stock are required."); return; }
    if (isNaN(sellingPrice)) { setError("Selling price must be a number."); return; }
    if (costPrice !== "" && isNaN(costPrice)) { setError("Cost price must be a number."); return; }
    setLoading(true);
    try {
      const payload = {
        name, cat,
        price: parseFloat(sellingPrice),
        costPrice: costPrice !== "" ? parseFloat(costPrice) : null,
        stock,
        showOnStore,
      };
      let saved;
      if (isEdit) saved = await MartService.update(product.id, payload);
      else saved = await MartService.create(payload);

      if (imageFile) {
        const targetId = saved?.id ?? product?.id;
        if (targetId) await MartService.uploadImage(targetId, imageFile).catch(() => {});
      }

      onSaved();
      onClose();
    } catch (e) {
      setError(`${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (<ModalPortal>
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <h3>{isEdit ? "Edit Product" : "Add Product"}</h3>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jasmine Rice 5kg" disabled={loading} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={cat} onChange={e => setCat(e.target.value)} disabled={loading}>
                {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input className="form-input" type="number" value={stock} onChange={e => setStock(e.target.value)} disabled={loading} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Selling Price (GH₵) *</label>
              <input className="form-input" type="number" step="0.01" value={sellingPrice} onChange={e => setSelling(e.target.value)} placeholder="0.00" disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label">Cost Price (GH₵)</label>
              <input className="form-input" type="number" step="0.01" value={costPrice} onChange={e => setCost(e.target.value)} placeholder="0.00" disabled={loading} />
            </div>
          </div>
          {storefrontEnabled && (
            <div className="form-group">
              <label className="form-label">Product Image</label>
              {imagePreview && (
                <img src={imagePreview} alt="preview" style={{ display: "block", width: 80, height: 64, objectFit: "cover", borderRadius: 6, marginBottom: 8, border: "1.5px solid var(--g200)" }} />
              )}
              <input type="file" accept="image/*" onChange={handleImage} disabled={loading} style={{ fontSize: 13 }} />
            </div>
          )}
          {storefrontEnabled && (
            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <input
                id="showOnStore"
                type="checkbox"
                checked={showOnStore}
                onChange={e => setShowOnStore(e.target.checked)}
                disabled={loading}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--p, #1e4d2b)" }}
              />
              <label htmlFor="showOnStore" style={{ cursor: "pointer", fontWeight: 600, fontSize: 13, color: "var(--g700)" }}>
                Show on Webstore
              </label>
            </div>
          )}
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

function RestockModal({ product, onClose, onSaved }) {
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) { setError("Enter a valid quantity."); return; }
    setLoading(true);
    try {
      await MartService.restock(product.id, parseInt(qty));
      onSaved();
      onClose();
    } catch (e) {
      setError(`${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (<ModalPortal>
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <h3>Restock: {product.name}</h3>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div style={{ background: "var(--pal)", padding: "10px 14px", borderRadius: "var(--r)", marginBottom: 14 }}>
            Current stock: <strong>{product.stock}</strong>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity to Add</label>
            <input className="form-input" type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 50" autoFocus />
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>
            {loading ? "Adding…" : "Add Stock"}
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

// catModal state: null=closed | { mode:"add" } | { mode:"rename", cat: { id, name } }
function CategoryModal({ mode, cat, onClose, onSaved }) {
  const [name, setName] = useState(mode === "rename" ? cat.name : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) { setError("Category name required."); return; }
    setLoading(true);
    try {
      if (mode === "rename") await MartService.renameCategory(cat.id, name.trim());
      else await MartService.createCategory(name.trim());
      onSaved();
      onClose();
    } catch (e) {
      setError(`${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (<ModalPortal>
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-hd">
          <h3>{mode === "rename" ? "Rename Category" : "Add Category"}</h3>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fresh Produce" autoFocus />
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-p" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : mode === "rename" ? "Rename" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminMart({ hideHeader = false }) {
  const { config } = useConfig();
  const storefrontEnabled = config.enabledModules?.includes("storefront") ?? true;
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);   // [{ id, name }]
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [tab, setTab] = useState("products");
  const [productModal, setProductModal] = useState(null); // null | "add" | <product>
  const [restockProduct, setRestockProduct] = useState(null);
  const [catModal, setCatModal] = useState(null); // null | { mode, cat? }
  const [query, setQuery] = useState("");
  const [showImport, setShowImport] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [prods, categories] = await Promise.all([
        MartService.getAll(),
        MartService.getCategories(),
      ]);
      setProducts(prods);
      setCats(categories);
    } catch (e) {
      setFetchError(`Failed to load data: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived state ────────────────────────────────────────────────────────────

  const filtered = useMemo(() =>
    query
      ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.cat.toLowerCase().includes(query.toLowerCase())
      )
      : products,
    [products, query]
  );

  // ── Delete product ────────────────────────────────────────────────────────────

  const handleDeleteProduct = async (p) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    try {
      await MartService.remove(p.id);
      setProducts(prev => prev.filter(x => x.id !== p.id));
    } catch (e) {
      alert(`Failed to delete: ${e.response?.data?.message || e.message}`);
    }
  };

  // ── Delete category ────────────────────────────────────────────────────────────

  const handleDeleteCat = async (cat) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await MartService.deleteCategory(cat.id);
      setCats(prev => prev.filter(c => c.id !== cat.id));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div>
      {!hideHeader && <div className="pg-hd-row"><h2>Mart Management</h2></div>}

      <div className="ptabs" style={{ marginBottom: 20 }}>
        <button className={`ptab ${tab === "products" ? "on" : ""}`} onClick={() => setTab("products")}>Products</button>
        <button className={`ptab ${tab === "categories" ? "on" : ""}`} onClick={() => setTab("categories")}>Categories</button>
      </div>
      {fetchError && <div className="alert alert-err" style={{ marginBottom: 16 }}>{fetchError}</div>}

      {tab === "products" && (
        <Card>
          <CardHeader
            title="Products"
            action={
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sec btn-sm" onClick={() => exportToExcel({
                  rows: products.map(p => ({ name: p.name, category: p.cat, price: p.price, costPrice: p.costPrice ?? "", stock: p.stock })),
                  columns: ["name", "category", "Selling Price (GH₵)", "costPrice", "stock"],
                  headers: ["Name", "Category", "Selling Price (GH₵)", "costPrice", "Stock"],
                  // headers: ["Name", "Category", "Price (GH₵)", "Stock"],
                  filename: "mart-stock.xlsx", sheetName: "Products",
                })}>⬇ Export</button>
                <button className="btn btn-sec btn-sm" onClick={() => setShowImport(true)}>📥 Import</button>
                <button className="btn btn-p btn-sm" onClick={() => setProductModal("add")}>+ Add Product</button>
              </div>
            }
          />
          <CardBody>
            <div className="srch" style={{ marginBottom: 8 }}>
              <span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg></span>
              <input placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </CardBody>
          <CardBody noPad>
            {loading ? (
              <div style={{ padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 36, height: 36,
                  border: "2.5px solid var(--pal)",
                  borderTop: "2.5px solid var(--primary, #4f46e5)",
                  borderRadius: "50%",
                  animation: "mart-spin 0.75s linear infinite"
                }} />
                <span style={{ fontSize: 13, color: "var(--g500)", letterSpacing: "0.01em" }}>Loading Product…</span>
                <style>{`@keyframes mart-spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <table className="tbl">
                <thead><tr><th>Product</th><th>Category</th><th>Selling Price</th><th>Cost Price</th><th>Stock</th>{storefrontEnabled && <th>On Store</th>}<th>Actions</th></tr></thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={storefrontEnabled ? 7 : 6} style={{ textAlign: "center", color: "var(--g500)", padding: 20 }}>No products found.</td></tr>
                  )}
                  {filtered.map(p => (
                    <tr key={p.id} style={p.stock < LOW_STOCK ? { background: "var(--redl)" } : {}}>
                      <td><strong>{p.name}</strong></td>
                      <td style={{ color: "var(--g500)" }}>{p.cat}</td>
                      <td>{fmt(p.price)}</td>
                      <td>{fmt(p.costPrice)}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: p.stock < LOW_STOCK ? "var(--red)" : "var(--green)" }}>
                          {p.stock}
                        </span>
                      </td>
                      {storefrontEnabled && (
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: p.showOnStore !== false ? "var(--green, #10b981)" : "var(--g400)" }}>
                            {p.showOnStore !== false ? "Yes" : "No"}
                          </span>
                        </td>
                      )}
                      <td style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sec btn-sm" onClick={() => setRestockProduct(p)}>Restock</button>
                        <button className="btn btn-sec btn-sm" onClick={() => setProductModal(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      {tab === "categories" && (
        <Card>
          <CardHeader
            title="Product Categories"
            action={<button className="btn btn-p btn-sm" onClick={() => setCatModal({ mode: "add" })}>+ Add Category</button>}
          />
          <CardBody noPad>
            {loading ? (
              <div style={{ padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 36, height: 36,
                  border: "2.5px solid var(--pal)",
                  borderTop: "2.5px solid var(--primary, #4f46e5)",
                  borderRadius: "50%",
                  animation: "mart-spin 0.75s linear infinite"
                }} />
                <span style={{ fontSize: 13, color: "var(--g500)", letterSpacing: "0.01em" }}>Loading Category…</span>
                <style>{`@keyframes mart-spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <table className="tbl">
                <thead><tr><th>Category Name</th><th>Products</th><th>Actions</th></tr></thead>
                <tbody>
                  {cats.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--g500)", padding: 20 }}>No categories yet.</td></tr>
                  )}
                  {cats.map(c => {
                    const count = products.filter(p => p.cat === c.name).length;
                    return (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td>{count} product{count !== 1 ? "s" : ""}</td>
                        <td style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-sec btn-sm" onClick={() => setCatModal({ mode: "rename", cat: c })}>Rename</button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteCat(c)}
                            disabled={count > 0}
                            style={count > 0 ? { opacity: 0.4 } : {}}
                          >Del</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      {productModal !== null && (
        <ProductModal
          product={productModal === "add" ? null : productModal}
          cats={cats}
          onClose={() => setProductModal(null)}
          onSaved={fetchAll}
          storefrontEnabled={storefrontEnabled}
        />
      )}

      {restockProduct && (
        <RestockModal
          product={restockProduct}
          onClose={() => setRestockProduct(null)}
          onSaved={fetchAll}
        />
      )}

      {catModal !== null && (
        <CategoryModal
          mode={catModal.mode}
          cat={catModal.cat || null}
          onClose={() => setCatModal(null)}
          onSaved={fetchAll}
        />
      )}

      {showImport && (
        <ExcelImportModal
          title="Import Mart Products from Excel"
          templateFn={downloadMartTemplate}
          columns={[
            { key: "name", label: "Name", required: true },
            { key: "category", label: "Category", required: true },
            { key: "price", label: "Price (GH₵)", required: true, type: "number" },
            { key: "stock", label: "Stock", required: true, type: "int" },
          ]}
          onImport={async (_rows, file) => {
            await MartService.uploadExcel(file);
            await fetchAll();
          }}
          onClose={() => setShowImport(false)}
          hint="Category names must match existing mart categories exactly."
        />
      )}
    </div>
  );
}