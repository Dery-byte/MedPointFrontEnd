import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import MartService from "../../../store/services/martService";
import DrugstoreService from "../../services/Drugstoreservice";
import { useApp } from "../../AppContext";
import { useToast } from "../../../store/components/Toast";
import { useConfig } from "../../../config/ConfigContext";
import { useAdminData } from "../../hooks/useAdminData";
import { Card, CardHeader, CardBody } from "../../components/Card";
import ModalPortal from "../../components/ModalPortal";
import ExcelImportModal from "../../components/ExcelImportModal";
import { exportToExcel, downloadMartTemplate } from "../../utils/excelUtils";
import { fmt } from "../../helpers";
import { LOW_STOCK } from "../../constants";
import NoModulesBanner from "../../components/NoModulesBanner";
import { getImageUrl } from "../../../shared/services/image";

import api from "../../../shared/services/api";

// ── Constants ──────────────────────────────────────────────────────────────────
const DRUG_CATS = ["Analgesic", "Antibiotic", "Anti-inflammatory", "Antidiabetic", "Antacid", "Antimalarial", "Supplement", "Antihypertensive", "Other"];
const NONDRUG_CATS = ["Consumable", "Fluid", "Diagnostic", "Other"];
const PROMO_CODES_KEY = "medpoint_promo_codes";
const SEED_PROMOS = [
  { id: "promo_1", code: "MEDPOINT10", type: "percent", value: 10, active: true, expiresAt: null, minOrder: null, note: "10% welcome discount" },
  { id: "promo_2", code: "WELCOME5", type: "percent", value: 5, active: true, expiresAt: null, minOrder: null, note: "5% new customer discount" },
  { id: "promo_3", code: "SAVE15", type: "percent", value: 15, active: true, expiresAt: null, minOrder: 100, note: "15% off orders over GH₵100" },
  { id: "promo_4", code: "FREESHIP", type: "fixed", value: 10, active: true, expiresAt: null, minOrder: null, note: "GH₵10 off — covers standard delivery fee" },
];

function loadPromos() {
  try {
    const stored = localStorage.getItem(PROMO_CODES_KEY);
    if (!stored) { localStorage.setItem(PROMO_CODES_KEY, JSON.stringify(SEED_PROMOS)); return SEED_PROMOS; }
    return JSON.parse(stored);
  } catch { return SEED_PROMOS; }
}
function savePromos(codes) { localStorage.setItem(PROMO_CODES_KEY, JSON.stringify(codes)); }

// ── Toggle ─────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--g800)" }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: "var(--g400)", marginTop: 2 }}>{hint}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
          background: value ? "var(--p)" : "var(--g200)",
          position: "relative", transition: "background .2s", flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: value ? 21 : 3,
          width: 18, height: 18, borderRadius: "50%", background: "white",
          transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)", display: "block",
        }} />
      </button>
    </div>
  );
}

// ── VariationsEditor ───────────────────────────────────────────────────────────
function VariationsEditor({ variations, onChange }) {
  const add = () => onChange([...variations, { name: "", options: [{ label: "", price: 0, stock: 0, colorHex: "" }] }]);
  const rmGrp = (gi) => onChange(variations.filter((_, i) => i !== gi));
  const upGrp = (gi, k, v) => onChange(variations.map((g, i) => i === gi ? { ...g, [k]: v } : g));
  const addOpt = (gi) => onChange(variations.map((g, i) => i === gi ? { ...g, options: [...g.options, { label: "", price: 0, stock: 0, colorHex: "" }] } : g));
  const rmOpt = (gi, oi) => onChange(variations.map((g, i) => i === gi ? { ...g, options: g.options.filter((_, j) => j !== oi) } : g));
  const upOpt = (gi, oi, k, v) => onChange(variations.map((g, i) => i === gi ? { ...g, options: g.options.map((o, j) => j === oi ? { ...o, [k]: v } : o) } : g));

  return (
    <div>
      {variations.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: "var(--g400)", fontSize: 13, background: "var(--g50)", borderRadius: "var(--r)", marginBottom: 12 }}>
          No variations yet. Add a group for options like Size or Color.
        </div>
      )}
      {variations.map((group, gi) => (
        <div key={gi} style={{ border: "1.5px solid var(--g200)", borderRadius: "var(--r)", marginBottom: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--g50)" }}>
            <input className="form-input" value={group.name} onChange={e => upGrp(gi, "name", e.target.value)} placeholder="Group name (e.g. Size, Color, Weight)" style={{ flex: 1 }} />
            <button className="btn btn-danger btn-sm" onClick={() => rmGrp(gi)}>Remove</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--g50)" }}>
                  {["Label", "Price adj. (GH₵)", "Stock", "Color hex", ""].map(h => (
                    <th key={h} style={{ padding: "6px 10px", fontSize: 11, fontWeight: 700, color: "var(--g500)", textAlign: "left", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.options.map((opt, oi) => (
                  <tr key={oi} style={{ borderTop: "1px solid var(--g100)" }}>
                    <td style={{ padding: "6px 8px" }}><input className="form-input" value={opt.label} onChange={e => upOpt(gi, oi, "label", e.target.value)} placeholder="e.g. XL, Red" /></td>
                    <td style={{ padding: "6px 8px" }}><input className="form-input" type="number" min="0" step="0.01" value={opt.price} onChange={e => upOpt(gi, oi, "price", parseFloat(e.target.value) || 0)} /></td>
                    <td style={{ padding: "6px 8px" }}><input className="form-input" type="number" min="0" value={opt.stock} onChange={e => upOpt(gi, oi, "stock", parseInt(e.target.value) || 0)} /></td>
                    <td style={{ padding: "6px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {opt.colorHex && <span style={{ width: 16, height: 16, borderRadius: "50%", background: opt.colorHex, border: "1px solid var(--g200)", flexShrink: 0 }} />}
                        <input className="form-input" value={opt.colorHex || ""} onChange={e => upOpt(gi, oi, "colorHex", e.target.value)} placeholder="#hex" />
                      </div>
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <button className="btn btn-danger btn-sm" onClick={() => rmOpt(gi, oi)} disabled={group.options.length === 1}>−</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "8px 12px" }}>
            <button className="btn btn-sec btn-sm" onClick={() => addOpt(gi)}>+ Add option</button>
          </div>
        </div>
      ))}
      <button className="btn btn-sec btn-sm" onClick={add}>+ Add variation group</button>
    </div>
  );
}

// ── Discount editor (shared by Mart & Drug modals) ────────────────────────────
function DiscountEditor({ sym, price, hasDiscount, setHasDiscount, discType, setDiscType, discValue, setDiscValue, discLabel, setDiscLabel, discEndsAt, setDiscEndsAt, hint }) {
  const dp = (() => {
    if (!hasDiscount || !discValue || !price) return null;
    const p = parseFloat(price), v = parseFloat(discValue);
    if (isNaN(p) || isNaN(v) || p <= 0 || v <= 0) return null;
    return discType === "percent" ? p * (1 - v / 100) : Math.max(0, p - v);
  })();

  return (
    <div>
      {hint && <p style={{ fontSize: 13, color: "var(--g400)", marginBottom: 10 }}>{hint}</p>}
      <Toggle value={hasDiscount} onChange={setHasDiscount} label="Enable discount" hint="Show a sale badge and reduced price on this product" />
      {hasDiscount && (
        <div style={{ marginTop: 8 }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Discount Type</label>
              <select className="form-select" value={discType} onChange={e => setDiscType(e.target.value)}>
                <option value="percent">Percentage (% off)</option>
                <option value="fixed">Fixed amount off</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Value *</label>
              <input className="form-input" type="number" min="0" max={discType === "percent" ? 100 : undefined} value={discValue} onChange={e => setDiscValue(e.target.value)} placeholder={discType === "percent" ? "e.g. 20" : "e.g. 5.00"} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Badge Label (optional)</label>
              <input className="form-input" value={discLabel} onChange={e => setDiscLabel(e.target.value)} placeholder={discType === "percent" ? `${discValue || "20"}% OFF` : "Special offer"} />
            </div>
            <div className="form-group">
              <label className="form-label">Sale Ends At (optional)</label>
              <input className="form-input" type="datetime-local" value={discEndsAt} onChange={e => setDiscEndsAt(e.target.value)} />
            </div>
          </div>
          {dp !== null && (
            <div style={{ background: "var(--pal)", border: "1px solid var(--pl)", borderRadius: "var(--r)", padding: "12px 16px", marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--pd)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Live Preview</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ color: "var(--g400)", textDecoration: "line-through", fontSize: 14 }}>{sym} {parseFloat(price ?? 0).toFixed(2)}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--p)" }}>{sym} {(dp ?? 0).toFixed(2)}</span>
                <span style={{ background: "var(--p)", color: "white", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                  {discLabel || (discType === "percent" ? `${discValue}% OFF` : `Save ${sym}${discValue}`)}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--g500)", marginTop: 4 }}>Customer saves {sym} {(parseFloat(price ?? 0) - (dp ?? 0)).toFixed(2)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MART PANEL
// ─────────────────────────────────────────────────────────────────────────────

function MartProductModal({ product, categories, onClose, onSaved }) {
  const { config } = useConfig();
  const sym = config.currencySymbol || "GH₵";
  const storefrontEnabled = config.enabledModules?.includes("storefront") ?? true;
  const { toast } = useToast();
  const isEdit = !!product;

  const [tab, setTab] = useState("basic");
  const [name, setName] = useState(product?.name || "");
  const [cat, setCat] = useState(product?.cat || categories[0]?.name || "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [costPrice, setCostPrice] = useState(product?.costPrice ?? "");
  const [stock, setStock] = useState(product?.stock ?? "");
  const [showOnStore, setShowOnStore] = useState(product?.showOnStore ?? true);
  const [featured, setFeatured] = useState(product?.featured || false);
  const [desc, setDesc] = useState(product?.description || "");
  const [tags, setTags] = useState(() => {
  // Check if product.tags exists
  if (!product?.tags) return "";
    // If it's already a string, return it
  if (typeof product.tags === "string") return product.tags;

  if (Array.isArray(product.tags)) return product.tags.join(", "); 
  return "";});
  // const [tags, setTags] = useState((product?.tags || []).join(", "));
  // const [variations, setVariations] = useState(product?.variations || []);

  // const [variations, setVariations] = useState(Array.isArray(product?.variations) ? product.variations : []);


const [variations, setVariations] = useState([]);

useEffect(() => {
  if (product?.variations) {
    try {
      const parsed = typeof product.variations === 'string'
        ? JSON.parse(product.variations)
        : product.variations;
      setVariations(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error('Failed to parse variations:', error);
      setVariations([]);
    }
  } else {
    setVariations([]);
  }
}, [product?.variations]); // Re-run when product changes

  const [hasDiscount, setHasDiscount] = useState(!!product?.discount);
  // const [discType, setDiscType] = useState(product?.discount?.type || "percent");
  const [discType, setDiscType] = useState(product?.discountType?.toLowerCase() || "percent");

  // const [discountType, setDiscountType] = useState(product?.discountType || "PERCENT");


  const [discValue, setDiscValue] = useState(product?.discount ?? "");


  // const [discValue, setDiscValue] = useState(product?.discount?.value ?? "");
  const [discLabel, setDiscLabel] = useState(product?.discount?.label || "");
  const [discEndsAt, setDiscEndsAt] = useState(product?.discount?.endsAt || "");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim()) { setError("Product name is required."); return; }
    if (!price || isNaN(price) || parseFloat(price) <= 0) { setError("Valid selling price required."); return; }
    if (stock === "" || isNaN(stock) || parseInt(stock) < 0) { setError("Valid stock quantity required."); return; }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(), cat,
        price: parseFloat(price),
        costPrice: costPrice !== "" ? parseFloat(costPrice) : null,
        stock: parseInt(stock),
        showOnStore, featured,
        description: desc,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        variations: JSON.stringify(variations), // 👈 Convert to JSON string
        discount: hasDiscount && discValue
          ? { type: discType, value: parseFloat(discValue), label: discLabel || null, endsAt: discEndsAt || null }
          : null,
      };
      let saved;
      if (isEdit) saved = await MartService.update(product.id, payload);
      else saved = await MartService.create(payload);
      onSaved(saved, isEdit ? "edit" : "add");
      toast({ message: isEdit ? "Product updated" : "Product added", type: "success" });
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to save product");
    } finally { setSaving(false); }
  };

  const TABS = [
    { id: "basic", label: "Basic" },
    ...(storefrontEnabled ? [
      { id: "discount", label: `Discount${hasDiscount ? " ●" : ""}` },
      { id: "variations", label: `Variations${variations.length > 0 ? ` (${variations.length})` : ""}` },
      { id: "details", label: "Details" },
    ] : []),
  ];

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal" style={{ maxWidth: 620, width: "95vw" }}>
          <div className="modal-hd">
            <h3>{isEdit ? "Edit Product" : "Add Product"}</h3>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>
          <div className="ptabs" style={{ padding: "0 26px", marginBottom: 0 }}>
            {TABS.map(t => (
              <button key={t.id} className={`ptab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)} style={{ fontSize: 13 }}>{t.label}</button>
            ))}
          </div>
          <div className="modal-bd" style={{ maxHeight: "54vh", overflowY: "auto" }}>
            {error && <div className="alert alert-err" style={{ marginBottom: 14 }}>{error}</div>}

            {tab === "basic" && (
              <>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jasmine Rice 5kg" autoFocus disabled={saving} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={cat} onChange={e => setCat(e.target.value)} disabled={saving}>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input className="form-input" type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" disabled={saving} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Selling Price ({sym}) *</label>
                    <input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" disabled={saving} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost Price ({sym}) (optional)</label>
                    <input className="form-input" type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0.00" disabled={saving} />
                  </div>
                </div>
                {storefrontEnabled && <Toggle value={featured} onChange={setFeatured} label="Featured product" hint="Shown in the featured section on the webstore homepage" />}
                {storefrontEnabled && <Toggle value={showOnStore} onChange={setShowOnStore} label="Show on Webstore" hint="Customers can browse and purchase this product online" />}
              </>
            )}

            {tab === "discount" && (
              <DiscountEditor
                sym={sym} price={price}
                hasDiscount={hasDiscount} setHasDiscount={setHasDiscount}
                discType={discType} setDiscType={setDiscType}
                discValue={discValue} setDiscValue={setDiscValue}
                discLabel={discLabel} setDiscLabel={setDiscLabel}
                discEndsAt={discEndsAt} setDiscEndsAt={setDiscEndsAt}
              />
            )}

            {tab === "variations" && (
              <div>
                <p style={{ fontSize: 13, color: "var(--g500)", marginBottom: 12 }}>
                  Add options like Size, Color, or Weight. Each option can have its own price modifier and stock.
                  Customers must select all variations before adding to cart.
                </p>
                <VariationsEditor variations={variations} onChange={setVariations} />
              </div>
            )}

            {tab === "details" && (
              <div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={5} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe this product in detail…" style={{ resize: "vertical" }} disabled={saving} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="organic, fresh, bestseller, imported" disabled={saving} />
                  {tags && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} style={{ background: "var(--pal)", border: "1px solid var(--pl)", color: "var(--pd)", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn btn-p" onClick={submit} disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function MartImageModal({ product, onClose, onUploaded }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(product.imageUrl || null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const onPick = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true); setError("");
    try {
      const url = await MartService.uploadImage(product.id, file);
      onUploaded(product.id, url);
      toast({ message: "Image uploaded", type: "success" });
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal" style={{ maxWidth: 400 }}>
          <div className="modal-hd">
            <h3>Product Image</h3>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>
          <div className="modal-bd">
            <div style={{ fontSize: 13, color: "var(--g600)", fontWeight: 600, marginBottom: 12 }}>{product.name}</div>
            {error && <div className="alert alert-err" style={{ marginBottom: 10 }}>{error}</div>}
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed var(--g200)", borderRadius: "var(--rl)", cursor: "pointer",
                minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", background: "var(--g50)",
              }}
            >
              {preview
                ? <img src={preview} alt="preview" style={{ width: "100%", height: 180, objectFit: "cover" }} />
                : <div style={{ textAlign: "center", color: "var(--g400)", padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Click to select image</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG, WEBP</div>
                </div>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPick} />
            {preview && (
              <button className="btn btn-sec btn-sm" style={{ marginTop: 8 }} onClick={() => fileRef.current?.click()}>
                Change image
              </button>
            )}
          </div>
          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose} disabled={uploading}>Cancel</button>


            <button className="btn btn-p" onClick={upload} disabled={!file || uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </button>


          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function MartRestockModal({ product, onClose, onSaved }) {
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) { setError("Enter a valid quantity."); return; }
    setLoading(true);
    try {
      const updated = await MartService.restock(product.id, parseInt(qty));
      onSaved(updated); onClose();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal">
          <div className="modal-hd"><h3>Restock: {product.name}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
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
            <button className="btn btn-p" onClick={submit} disabled={loading}>{loading ? "Adding…" : "Add Stock"}</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function MartCategoryModal({ mode, cat, onClose, onSaved }) {
  const [name, setName] = useState(mode === "rename" ? cat.name : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) { setError("Category name required."); return; }
    setLoading(true);
    try {
      if (mode === "rename") await MartService.renameCategory(cat.id, name.trim());
      else await MartService.createCategory(name.trim());
      onSaved(); onClose();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  return (
    <ModalPortal>
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

function MartPanel() {
  const { config } = useConfig();
  const sym = config.currencySymbol || "GH₵";
  const storefrontEnabled = config.enabledModules?.includes("storefront") ?? true;
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [innerTab, setInnerTab] = useState("products");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterFlag, setFilterFlag] = useState("all");
  const [modal, setModal] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true); setFetchError("");
    try {
      const [prods, categories] = await Promise.all([MartService.getAllAdmin(), MartService.getCategories()]);
      setProducts(prods); setCats(categories);
    } catch (e) {
      setFetchError(`Failed to load: ${e.response?.data?.message || e.message}`);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaved = (product, type) =>
    setProducts(prev => type === "add" ? [product, ...prev] : prev.map(p => p.id === product.id ? product : p));

  const handleImageUploaded = (id, url) =>
    setProducts(prev => prev.map(p => p.id === id ? { ...p, imageUrl: url } : p));

  const handleRestocked = (updated) =>
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await MartService.remove(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast({ message: "Product deleted", type: "info" });
    } catch { toast({ message: "Failed to delete", type: "error" }); }
  };

  const filtered = useMemo(() => products
    .filter(p => filterCat === "All" || p.cat === filterCat)
    .filter(p => filterFlag === "featured" ? p.featured : filterFlag === "discounted" ? !!p.discount : filterFlag === "variants" ? p.variations?.length > 0 : true)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())),
    [products, filterCat, filterFlag, search]);

  const stats = {
    total: products.length,
    featured: products.filter(p => p.featured).length,
    discounted: products.filter(p => !!p.discount).length,
    variants: products.filter(p => p.variations?.length > 0).length,
    oos: products.filter(p => p.stock <= 0).length,
  };

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total", val: stats.total, color: "var(--g700)" },
          { label: "Featured", val: stats.featured, color: "var(--amber)" },
          { label: "On Sale", val: stats.discounted, color: "var(--green)" },
          { label: "Variants", val: stats.variants, color: "#818cf8" },
          { label: "OOS", val: stats.oos, color: "var(--red)" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", border: "1.5px solid var(--g100)", borderRadius: "var(--r)", padding: "10px 18px", minWidth: 90 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--g400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="ptabs" style={{ marginBottom: 20 }}>
        <button className={`ptab ${innerTab === "products" ? "on" : ""}`} onClick={() => setInnerTab("products")}>Products</button>
        <button className={`ptab ${innerTab === "categories" ? "on" : ""}`} onClick={() => setInnerTab("categories")}>Categories</button>
      </div>

      {fetchError && <div className="alert alert-err" style={{ marginBottom: 16 }}>{fetchError}</div>}

      {innerTab === "products" && (
        <Card>
          <CardHeader
            title="Products"
            action={
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-sec btn-sm" onClick={() => exportToExcel({
                  rows: products.map(p => ({ name: p.name, category: p.cat, price: p.price, costPrice: p.costPrice ?? '', stock: p.stock })),
                  columns: ["name", "category", "price", "costPrice", "stock"],
                  headers: ["Name", "Category", "Selling Price (GH₵)", "Cost Price", "Stock"],
                  filename: "mart-products.xlsx", sheetName: "Products"
                })}> ⬆ Export</button>
                <button className="btn btn-sec btn-sm" onClick={() => setShowImport(true)}>📥 Import</button>
                <button className="btn btn-p btn-sm" onClick={() => setModal({ type: "add" })}>+ Add Product</button>
              </div>
            }
          />
          <CardBody>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div className="srch" style={{ flex: 1, minWidth: 160 }}>
                <span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg></span>
                <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-select" style={{ width: "auto", minWidth: 140 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="All">All categories</option>
                {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              {storefrontEnabled && (
                <div style={{ display: "flex", gap: 4 }}>
                  {[["all", "All"], ["featured", "Featured"], ["discounted", "On Sale"], ["variants", "Variants"]].map(([val, label]) => (
                    <button key={val} className={`btn btn-sm ${filterFlag === val ? "btn-p" : "btn-sec"}`} onClick={() => setFilterFlag(val)}>{label}</button>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
          <CardBody noPad>
            {loading
              ? <div style={{ padding: 32, textAlign: "center", color: "var(--g400)" }}>Loading products…</div>
              : <table className="tbl">
                <thead><tr>
                  {storefrontEnabled && <th>Image</th>}
                  <th>Product</th><th>Category</th><th>Selling Price (GH₵) </th><th>Cost Price (GH₵)</th><th>Stock</th>
                  {storefrontEnabled && <th>Flags</th>}
                  <th>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={storefrontEnabled ? 7 : 5} style={{ textAlign: "center", padding: 28, color: "var(--g400)" }}>No products found.</td></tr>}
                  {filtered.map(p => (
                    <tr key={p.id}>

                      {/* <p>{JSON.stringify(p)}</p> */}

                      {storefrontEnabled && (
                        <td>
                          <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
                            {p.imageUrl
                              ? <img src={getImageUrl(p.imageUrl)} alt={p.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, display: "block" }} />
                              : <div style={{ width: 48, height: 48, borderRadius: 6, background: "var(--g100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>
                            }
                            <button
                              onClick={() => setModal({ type: "image", product: p })}
                              style={{ position: "absolute", bottom: -4, right: -4, width: 20, height: 20, borderRadius: "50%", background: "var(--p)", border: "2px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white" }}
                              title="Upload image"
                            >📷</button>
                          </div>
                        </td>


                      )}
                      <td>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--g400)" }}>ID {p.id}</div>
                      </td>
                      <td><span style={{ background: "var(--g100)", color: "var(--g600)", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>{p.cat}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sym} {(p.price ?? 0).toFixed(2)}</div>
                        {p.discount && (
                          <span style={{ background: "var(--green)", color: "white", borderRadius: 4, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>
                            {p.discounType === "PERCENT" ? `−${p.discount}%` : `−${sym}${p.discount}`}
                            {/* {p.discountType === "PERCENT"
                              ? `−${p.discount}%`
                              : `−${sym}${p.discount}`
                            }
                            {p.discountType} */}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sym} {(p.price ?? 0).toFixed(2)}</div>
                      </td>




                      <td>
                        {p.stock === 0
                          ? <span style={{ color: "var(--red)", fontWeight: 700, fontSize: 12 }}>Out of stock</span>
                          : p.stock <= 5
                            ? <span style={{ color: "var(--amber)", fontWeight: 700 }}>{p.stock} left</span>
                            : <span style={{ color: "var(--green)", fontWeight: 700 }}>{p.stock}</span>
                        }
                      </td>
                      {storefrontEnabled && (
                        <td>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {p.featured && <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 99, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>⭐ Featured</span>}
                            {p.discount && <span style={{ background: "var(--greenl)", color: "#065f46", borderRadius: 99, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>🏷️ Sale</span>}
                            {p.variations?.length > 0 && <span style={{ background: "#ede9fe", color: "#5b21b6", borderRadius: 99, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>🎛️ Variants</span>}
                            {!p.showOnStore && <span style={{ background: "var(--g100)", color: "var(--g500)", borderRadius: 99, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>Hidden</span>}
                          </div>
                        </td>
                      )}
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="btn btn-sec btn-sm" onClick={() => setModal({ type: "restock", product: p })}>Restock</button>
                          <button className="btn btn-sec btn-sm" onClick={() => setModal({ type: "edit", product: p })}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </CardBody>
        </Card>
      )}

      {innerTab === "categories" && (
        <Card>
          <CardHeader title="Product Categories" action={<button className="btn btn-p btn-sm" onClick={() => setModal({ type: "addCat" })}>+ Add Category</button>} />
          <CardBody noPad>
            {loading
              ? <div style={{ padding: 32, textAlign: "center", color: "var(--g400)" }}>Loading…</div>
              : <table className="tbl">
                <thead><tr><th>Category</th><th>Products</th><th>Actions</th></tr></thead>
                <tbody>
                  {cats.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", padding: 28, color: "var(--g400)" }}>No categories yet.</td></tr>}
                  {cats.map(c => {
                    const count = products.filter(p => p.cat === c.name).length;
                    return (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td>{count} product{count !== 1 ? "s" : ""}</td>
                        <td style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-sec btn-sm" onClick={() => setModal({ type: "renameCat", cat: c })}>Rename</button>
                          <button className="btn btn-danger btn-sm" disabled={count > 0} style={count > 0 ? { opacity: .4 } : {}}
                            onClick={async () => { if (!confirm(`Delete "${c.name}"?`)) return; try { await MartService.deleteCategory(c.id); setCats(prev => prev.filter(x => x.id !== c.id)); } catch (e) { alert(e.response?.data?.message || e.message); } }}>Del</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            }
          </CardBody>
        </Card>
      )}

      {modal?.type === "add" && <MartProductModal categories={cats} onClose={() => setModal(null)} onSaved={(p) => { handleSaved(p, "add"); }} />}
      {modal?.type === "edit" && <MartProductModal product={modal.product} categories={cats} onClose={() => setModal(null)} onSaved={(p) => handleSaved(p, "edit")} />}
      {modal?.type === "image" && <MartImageModal product={modal.product} onClose={() => setModal(null)} onUploaded={handleImageUploaded} />}
      {modal?.type === "restock" && <MartRestockModal product={modal.product} onClose={() => setModal(null)} onSaved={handleRestocked} />}
      {modal?.type === "addCat" && <MartCategoryModal mode="add" onClose={() => setModal(null)} onSaved={fetchAll} />}
      {modal?.type === "renameCat" && <MartCategoryModal mode="rename" cat={modal.cat} onClose={() => setModal(null)} onSaved={fetchAll} />}
      {showImport && (
        <ExcelImportModal
          title="Import Mart Products"
          templateFn={downloadMartTemplate}
          columns={[
            { key: "name", label: "Name", required: true },
            { key: "category", label: "Category", required: true },
            { key: "Selling", label: "Selling Price (GH₵)", required: true, type: "number" },
            { key: "Cost", label: "Cost Price (GH₵)", required: true, type: "number" },
            { key: "stock", label: "Stock", required: true, type: "int" },
          ]}
          onImport={async (rows) => {
            for (const r of rows) await MartService.create({ name: r.name, cat: r.category, price: parseFloat(r.price) || 0, stock: parseInt(r.stock) || 0 });
            await fetchAll();
          }}
          onClose={() => setShowImport(false)}
          hint="Category names must match existing mart categories exactly."
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRUGSTORE PANEL
// ─────────────────────────────────────────────────────────────────────────────

function DrugModal({ drug, onClose, onSaved }) {
  const { config } = useConfig();
  const sym = config.currencySymbol || "GH₵";
  const storefrontEnabled = config.enabledModules?.includes("storefront") ?? true;
  const isEdit = !!drug;
  const [tab, setTab] = useState("basic");
  const [name, setName] = useState(drug?.name || "");
  const [cat, setCat] = useState(drug?.cat || DRUG_CATS[0]);
  const [price, setPrice] = useState(drug?.price ?? "");
  const [costPrice, setCostPrice] = useState(drug?.costPrice ?? "");
  const [stock, setStock] = useState(drug?.stock ?? "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImgPrev] = useState(drug?.imageUrl || null);
  const [desc, setDesc] = useState(drug?.description || "");
  const [tags, setTags] = useState((drug?.tags || []).join(", "));
  const [hasDiscount, setHasDiscount] = useState(!!drug?.discount);
  const [discType, setDiscType] = useState(drug?.discountType || "PERCENT");
  const [discValue, setDiscValue] = useState(drug?.discount?.value ?? "");
  const [discLabel, setDiscLabel] = useState(drug?.discount?.label || "");
  const [discEndsAt, setDiscEndsAt] = useState(drug?.discount?.endsAt || "");
  const [error, setError] = useState("");



  


  const handleImage = e => { const f = e.target.files[0]; if (!f) return; setImageFile(f); setImgPrev(URL.createObjectURL(f)); };

  const submit = async () => {
    if (!name.trim() || price === "" || stock === "") { setError("Name, price and stock are required."); return; }
    if (isNaN(price) || isNaN(stock)) { setError("Price and stock must be numbers."); return; }
    const item = {
      name: name.trim(), cat,
      price: parseFloat(price),
      costPrice: costPrice !== "" ? parseFloat(costPrice) : null,
      stock: parseInt(stock),
      description: desc,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      discount: hasDiscount && discValue ? { type: discType, value: parseFloat(discValue), label: discLabel || null, endsAt: discEndsAt || null } : null,
    };
    try {
      const saved = isEdit
        ? await DrugstoreService.updateDrug(drug.id, item)
        : await DrugstoreService.createDrug(item);
      onSaved(saved, isEdit);
      onClose();
    } catch (e) { setError(e.response?.data?.message || e.message || "Save failed."); }
  };

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal" style={{ maxWidth: 580, width: "95vw" }}>
          <div className="modal-hd">
            <h3>{isEdit ? "Edit Drug" : "Add Drug"}</h3>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>
          <div className="ptabs" style={{ padding: "0 26px" }}>
            {[["basic", "Basic"], ["discount", `Discount${hasDiscount ? " ●" : ""}`], ["details", "Details"]].map(([id, label]) => (
              <button key={id} className={`ptab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)} style={{ fontSize: 13 }}>{label}</button>
            ))}
          </div>
          <div className="modal-bd" style={{ maxHeight: "52vh", overflowY: "auto" }}>
            {error && <div className="alert alert-err" style={{ marginBottom: 12 }}>{error}</div>}

            {tab === "basic" && (
              <>
                <div className="form-group">
                  <label className="form-label">Drug Name *</label>
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Paracetamol 500mg" autoFocus />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
                      {DRUG_CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input className="form-input" type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Selling Price ({sym}) *</label>
                    <input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost Price ({sym})</label>
                    <input className="form-input" type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0.00" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  {imagePreview && <img src={imagePreview} alt="preview" style={{ display: "block", width: 80, height: 64, objectFit: "cover", borderRadius: 6, marginBottom: 8, border: "1.5px solid var(--g200)" }} />}
                  <input type="file" accept="image/*" onChange={handleImage} style={{ fontSize: 13 }} />
                </div>
              </>
            )}

            {tab === "discount" && (
              <DiscountEditor
                sym={sym} price={price}
                hasDiscount={hasDiscount} setHasDiscount={setHasDiscount}
                discType={discType} setDiscType={setDiscType}
                discValue={discValue} setDiscValue={setDiscValue}
                discLabel={discLabel} setDiscLabel={setDiscLabel}
                discEndsAt={discEndsAt} setDiscEndsAt={setDiscEndsAt}
                hint="Applies when this drug is shown on the webstore."
              />
            )}

            {tab === "details" && (
              <div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={5} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe this drug…" style={{ resize: "vertical" }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="analgesic, pain relief, fever" />
                  {tags && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} style={{ background: "var(--pal)", border: "1px solid var(--pl)", color: "var(--pd)", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-p" onClick={submit}>{isEdit ? "Save Changes" : "Add Drug"}</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function NonDrugModal({ item, onClose, onSaved }) {
  const { config } = useConfig();
  const sym = config.currencySymbol || "GH₵";
  const isEdit = !!item;
  const [tab, setTab] = useState("basic");
  const [name, setName] = useState(item?.name || "");
  const [cat, setCat] = useState(item?.cat || NONDRUG_CATS[0]);
  const [price, setPrice] = useState(item?.price ?? "");
  const [stock, setStock] = useState(item?.stock ?? "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImgPrev] = useState(item?.imageUrl || null);
  const [desc, setDesc] = useState(item?.description || "");
  const [tags, setTags] = useState((item?.tags || []).join(", "));
  const [error, setError] = useState("");

  const handleImage = e => { const f = e.target.files[0]; if (!f) return; setImageFile(f); setImgPrev(URL.createObjectURL(f)); };

  const submit = async () => {
    if (!name.trim() || price === "" || stock === "") { setError("Name, price and stock are required."); return; }
    const entry = {
      name: name.trim(), cat,
      price: parseFloat(price), stock: parseInt(stock),
      description: desc,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    try {
      const saved = isEdit
        ? await DrugstoreService.updateNonDrug(item.id, entry)
        : await DrugstoreService.createNonDrug(entry);
      onSaved(saved, isEdit);
      onClose();
    } catch (e) { setError(e.response?.data?.message || e.message || "Save failed."); }
  };

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal" style={{ maxWidth: 520, width: "95vw" }}>
          <div className="modal-hd">
            <h3>{isEdit ? "Edit Item" : "Add Non-Drug Item"}</h3>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>
          <div className="ptabs" style={{ padding: "0 26px" }}>
            {[["basic", "Basic"], ["details", "Details"]].map(([id, label]) => (
              <button key={id} className={`ptab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)} style={{ fontSize: 13 }}>{label}</button>
            ))}
          </div>
          <div className="modal-bd" style={{ maxHeight: "52vh", overflowY: "auto" }}>
            {error && <div className="alert alert-err" style={{ marginBottom: 12 }}>{error}</div>}

            {tab === "basic" && (
              <>
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gloves (pair)" autoFocus />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
                      {NONDRUG_CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input className="form-input" type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Price ({sym}) *</label>
                  <input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  {imagePreview && <img src={imagePreview} alt="preview" style={{ display: "block", width: 80, height: 64, objectFit: "cover", borderRadius: 6, marginBottom: 8, border: "1.5px solid var(--g200)" }} />}
                  <input type="file" accept="image/*" onChange={handleImage} style={{ fontSize: 13 }} />
                </div>
              </>
            )}

            {tab === "details" && (
              <div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={5} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe this item…" style={{ resize: "vertical" }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="consumable, disposable" />
                  {tags && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} style={{ background: "var(--pal)", border: "1px solid var(--pl)", color: "var(--pd)", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-p" onClick={submit}>{isEdit ? "Save Changes" : "Add Item"}</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function DrugRestockModal({ item, type, onClose, onSaved }) {
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) { setError("Enter a valid quantity."); return; }
    try {
      const updated = type === "drug"
        ? await DrugstoreService.restockDrug(item.id, parseInt(qty))
        : await DrugstoreService.updateNonDrug(item.id, { ...item, stock: item.stock + parseInt(qty) });
      onSaved(updated);
      onClose();
    } catch (e) { setError(e.response?.data?.message || e.message || "Restock failed."); }
  };

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal">
          <div className="modal-hd"><h3>Restock: {item.name}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
          <div className="modal-bd">
            {error && <div className="alert alert-err">{error}</div>}
            <div style={{ background: "var(--pal)", padding: "10px 14px", borderRadius: "var(--r)", marginBottom: 14 }}>
              Current stock: <strong>{item.stock}</strong>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity to Add</label>
              <input className="form-input" type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 50" autoFocus />
            </div>
          </div>
          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-p" onClick={submit}>Add Stock</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function DrugstorePanel() {
  const { state, dispatch } = useApp();
  const { drugs = [], nondrugs = [] } = state;
  const [subTab, setSubTab] = useState("drugs");
  const [drugModal, setDrugModal] = useState(null);
  const [nonDrugModal, setNonDrugModal] = useState(null);
  const [restockModal, setRestockModal] = useState(null);
  const [query, setQuery] = useState("");

  const filteredDrugs = useMemo(() =>
    query ? drugs.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.cat.toLowerCase().includes(query.toLowerCase())) : drugs,
    [drugs, query]);

  const filteredNonDrugs = useMemo(() =>
    query ? nondrugs.filter(n => n.name.toLowerCase().includes(query.toLowerCase()) || n.cat.toLowerCase().includes(query.toLowerCase())) : nondrugs,
    [nondrugs, query]);

  const SearchBar = ({ ph }) => (
    <div className="srch">
      <span className="srch-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg></span>
      <input placeholder={ph} value={query} onChange={e => setQuery(e.target.value)} />
    </div>
  );

  const handleDeleteDrug = async (d) => {
    if (!confirm(`Delete ${d.name}?`)) return;
    try {
      await DrugstoreService.deleteDrug(d.id);
      dispatch({ type: "SET_DRUGS", data: drugs.filter(x => x.id !== d.id) });
    } catch (e) { alert(e.response?.data?.message || e.message || "Delete failed."); }
  };

  const handleDeleteNonDrug = async (n) => {
    if (!confirm(`Delete ${n.name}?`)) return;
    try {
      await DrugstoreService.deleteNonDrug(n.id);
      dispatch({ type: "SET", key: "nondrugs", value: nondrugs.filter(x => x.id !== n.id) });
    } catch (e) { alert(e.response?.data?.message || e.message || "Delete failed."); }
  };

  return (
    <div>
      <div className="ptabs" style={{ marginBottom: 20 }}>
        <button className={`ptab ${subTab === "drugs" ? "on" : ""}`} onClick={() => { setSubTab("drugs"); setQuery(""); }}>Drugs</button>
        <button className={`ptab ${subTab === "nondrugs" ? "on" : ""}`} onClick={() => { setSubTab("nondrugs"); setQuery(""); }}>Non-Drug Items</button>
      </div>

      {subTab === "drugs" && (
        <Card>
          <CardHeader title="Drugs" action={<button className="btn btn-p btn-sm" onClick={() => setDrugModal("add")}>+ Add Drug</button>} />
          <CardBody><SearchBar ph="Search drugs…" /></CardBody>
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Discount</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredDrugs.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 28, color: "var(--g400)" }}>No drugs found.</td></tr>}
                {filteredDrugs.map(d => (
                  <tr key={d.id} style={d.stock < LOW_STOCK ? { background: "var(--redl)" } : {}}>
                    <td>{d.imageUrl
                      ? <img src={d.imageUrl} alt={d.name} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }} />
                      : <div style={{ width: 36, height: 36, borderRadius: 4, background: "var(--pal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💊</div>
                    }</td>
                    <td><strong>{d.name}</strong></td>
                    <td style={{ color: "var(--g500)" }}>{d.cat}</td>
                    <td>{fmt(d.price)}</td>
                    <td><span style={{ fontWeight: 700, color: d.stock < LOW_STOCK ? "var(--red)" : "var(--green)" }}>{d.stock}</span></td>
                    <td>
                      {d.discount
                        ? <span style={{ background: "var(--greenl)", color: "#065f46", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                          {d.discount.type === "percent" ? `${d.discount.value}% off` : `${fmt(d.discount.value)} off`}
                        </span>
                        : <span style={{ color: "var(--g300)" }}>—</span>
                      }
                    </td>
                    <td style={{ display: "flex", gap: 5 }}>
                      <button className="btn btn-sec btn-sm" onClick={() => setRestockModal({ item: d, type: "drug" })}>Restock</button>
                      <button className="btn btn-sec btn-sm" onClick={() => setDrugModal(d)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDrug(d)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {subTab === "nondrugs" && (
        <Card>
          <CardHeader title="Non-Drug Items" action={<button className="btn btn-p btn-sm" onClick={() => setNonDrugModal("add")}>+ Add Item</button>} />
          <CardBody><SearchBar ph="Search items…" /></CardBody>
          <CardBody noPad>
            <table className="tbl">
              <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredNonDrugs.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 28, color: "var(--g400)" }}>No items found.</td></tr>}
                {filteredNonDrugs.map(n => (
                  <tr key={n.id} style={(n.stock ?? 99) < LOW_STOCK ? { background: "var(--redl)" } : {}}>
                    <td>{n.imageUrl
                      ? <img src={n.imageUrl} alt={n.name} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }} />
                      : <div style={{ width: 36, height: 36, borderRadius: 4, background: "var(--pal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🩺</div>
                    }</td>
                    <td><strong>{n.name}</strong></td>
                    <td style={{ color: "var(--g500)" }}>{n.cat}</td>
                    <td>{fmt(n.price)}</td>
                    <td><span style={{ fontWeight: 700, color: (n.stock ?? 99) < LOW_STOCK ? "var(--red)" : "var(--green)" }}>{n.stock ?? '—'}</span></td>
                    <td style={{ display: "flex", gap: 5 }}>
                      <button className="btn btn-sec btn-sm" onClick={() => setNonDrugModal(n)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteNonDrug(n)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {drugModal !== null && <DrugModal drug={drugModal === "add" ? null : drugModal} onClose={() => setDrugModal(null)}
        onSaved={(saved, isEdit) => dispatch({ type: isEdit ? "UPDATE_DRUG" : "ADD_DRUG", drug: saved })} />}
      {nonDrugModal !== null && <NonDrugModal item={nonDrugModal === "add" ? null : nonDrugModal} onClose={() => setNonDrugModal(null)}
        onSaved={(saved, isEdit) => dispatch({ type: isEdit ? "UPDATE_NONDRUG" : "ADD_NONDRUG", item: saved })} />}
      {restockModal && <DrugRestockModal item={restockModal.item} type={restockModal.type} onClose={() => setRestockModal(null)}
        onSaved={(updated) => dispatch({ type: "UPDATE_DRUG", drug: updated })} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMO CODES PANEL
// ─────────────────────────────────────────────────────────────────────────────

function PromoCodeModal({ code, codes, onClose, onSaved }) {
  const { config } = useConfig();
  const sym = config.currencySymbol || "GH₵";
  const isEdit = !!code;
  const [codeStr, setCodeStr] = useState(code?.code || "");
  const [type, setType] = useState(code?.type || "percent");
  const [value, setValue] = useState(code?.value ?? "");
  const [minOrder, setMinOrder] = useState(code?.minOrder ?? "");
  const [expiresAt, setExpiresAt] = useState(code?.expiresAt || "");
  const [active, setActive] = useState(code?.active ?? true);
  const [note, setNote] = useState(code?.note || "");
  const [error, setError] = useState("");

  const submit = () => {
    const trimCode = codeStr.trim().toUpperCase();
    if (!trimCode) { setError("Promo code is required."); return; }
    if (!value || isNaN(value) || parseFloat(value) <= 0) { setError("Value must be a positive number."); return; }
    if (type === "percent" && parseFloat(value) > 100) { setError("Percent discount cannot exceed 100%."); return; }
    if (codes.find(c => c.code === trimCode && c.id !== code?.id)) { setError("A code with this name already exists."); return; }
    onSaved({
      id: code?.id || `promo_${Date.now()}`,
      code: trimCode, type,
      value: parseFloat(value),
      minOrder: minOrder !== "" && !isNaN(minOrder) && parseFloat(minOrder) > 0 ? parseFloat(minOrder) : null,
      expiresAt: expiresAt || null,
      active, note,
    });
    onClose();
  };

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal" style={{ maxWidth: 500 }}>
          <div className="modal-hd">
            <h3>{isEdit ? "Edit Promo Code" : "Add Promo Code"}</h3>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>
          <div className="modal-bd">
            {error && <div className="alert alert-err" style={{ marginBottom: 12 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Promo Code *</label>
              <input className="form-input" value={codeStr} onChange={e => setCodeStr(e.target.value.toUpperCase())} placeholder="e.g. SAVE20" autoFocus style={{ fontFamily: "monospace", letterSpacing: ".1em" }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Discount Type</label>
                <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="percent">Percentage (% off)</option>
                  <option value="fixed">Fixed amount ({sym} off)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Value *</label>
                <input className="form-input" type="number" min="0" step="0.01" value={value} onChange={e => setValue(e.target.value)} placeholder={type === "percent" ? "e.g. 20" : "e.g. 10.00"} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min Order ({sym}) (optional)</label>
                <input className="form-input" type="number" min="0" value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder="0 = no minimum" />
              </div>
              <div className="form-group">
                <label className="form-label">Expires At (optional)</label>
                <input className="form-input" type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Internal Note</label>
              <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Campaign for product launch" />
            </div>
            <Toggle value={active} onChange={setActive} label="Active" hint="Inactive codes cannot be applied at checkout" />
          </div>
          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose}>Cancel</button>
            <button className="btn btn-p" onClick={submit}>{isEdit ? "Save Changes" : "Add Code"}</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function PromoCodesPanel() {
  const { config } = useConfig();
  const sym = config.currencySymbol || "GH₵";
  const [codes, setCodes] = useState(loadPromos);
  const [modal, setModal] = useState(null);
  const [copied, setCopied] = useState(null);
  const now = new Date();

  const save = (updated) => { savePromos(updated); setCodes(updated); };

  const handleSaved = (entry) => {
    save(codes.find(c => c.id === entry.id) ? codes.map(c => c.id === entry.id ? entry : c) : [entry, ...codes]);
  };

  const handleDelete = (code) => {
    if (!confirm(`Delete promo code "${code.code}"?`)) return;
    save(codes.filter(c => c.id !== code.id));
  };

  const toggleActive = (code) => save(codes.map(c => c.id === code.id ? { ...c, active: !c.active } : c));

  const copyCode = async (code) => {
    try { await navigator.clipboard.writeText(code.code); setCopied(code.id); setTimeout(() => setCopied(null), 2000); } catch { }
  };

  const getStatus = (c) => {
    if (c.expiresAt && new Date(c.expiresAt) < now) return "expired";
    return c.active ? "active" : "inactive";
  };

  const STATUS_STYLE = {
    active: { background: "var(--greenl)", color: "#065f46" },
    inactive: { background: "var(--g100)", color: "var(--g500)" },
    expired: { background: "var(--ambl)", color: "#92400e" },
  };

  const activeCnt = codes.filter(c => getStatus(c) === "active").length;
  const expiringSoon = codes.filter(c => {
    if (!c.expiresAt) return false;
    const diff = new Date(c.expiresAt) - now;
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const inactiveCnt = codes.filter(c => getStatus(c) !== "active").length;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Active", val: activeCnt, color: "var(--green)" },
          { label: "Expiring Soon", val: expiringSoon, color: "var(--amber)" },
          { label: "Inactive/Expired", val: inactiveCnt, color: "var(--g400)" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", border: "1.5px solid var(--g100)", borderRadius: "var(--r)", padding: "10px 18px", minWidth: 120 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--g400)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="Promo Codes" action={<button className="btn btn-p btn-sm" onClick={() => setModal({ type: "add" })}>+ Add Code</button>} />
        <CardBody noPad>
          <table className="tbl">
            <thead>
              <tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Expires</th><th>Status</th><th>Note</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {codes.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 28, color: "var(--g400)" }}>No promo codes yet.</td></tr>}
              {codes.map(c => {
                const status = getStatus(c);
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, background: "var(--g100)", padding: "2px 8px", borderRadius: 4, letterSpacing: ".08em", fontSize: 13 }}>{c.code}</span>
                        <button className="btn btn-sec btn-sm" onClick={() => copyCode(c)} style={{ padding: "2px 8px", fontSize: 11 }}>
                          {copied === c.id ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    </td>
                    <td><strong>{c.type === "percent" ? `${c.value}% off` : `${sym}${c.value} off`}</strong></td>
                    <td style={{ color: "var(--g500)", fontSize: 13 }}>{c.minOrder ? `${sym}${c.minOrder}+` : "No minimum"}</td>
                    <td style={{ color: "var(--g500)", fontSize: 13 }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "No expiry"}</td>
                    <td>
                      <span style={{ ...STATUS_STYLE[status], borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td style={{ color: "var(--g400)", fontSize: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.note || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="btn btn-sec btn-sm" onClick={() => toggleActive(c)}>{c.active ? "Disable" : "Enable"}</button>
                        <button className="btn btn-sec btn-sm" onClick={() => setModal({ type: "edit", code: c })}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {modal?.type === "add" && <PromoCodeModal codes={codes} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.type === "edit" && <PromoCodeModal code={modal.code} codes={codes} onClose={() => setModal(null)} onSaved={handleSaved} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminProducts() {
  const { enabledModules } = useAdminData();

  const allTabs = [
    enabledModules.includes("mart") && { key: "mart", label: "Mart Products" },
    enabledModules.includes("drugstore") && { key: "drugstore", label: "Drugstore Products" },
    enabledModules.includes("storefront") && { key: "promos", label: "Promo Codes" },
  ].filter(Boolean);

  const [tab, setTab] = useState(allTabs[0]?.key ?? null);

  // If the active tab's module gets disabled mid-session, reset to first available
  useEffect(() => {
    if (tab && !allTabs.some(t => t.key === tab)) {
      setTab(allTabs[0]?.key ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledModules]);

  if (allTabs.length === 0) {
    return (
      <div>
        <div className="pg-hd-row"><h2>Products</h2></div>
        <NoModulesBanner />
      </div>
    );
  }

  return (
    <div>
      <div className="pg-hd-row"><h2>Products</h2></div>
      <div className="ptabs" style={{ marginBottom: 24 }}>
        {allTabs.map(t => (
          <button key={t.key} className={`ptab ${tab === t.key ? "on" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "mart" && <MartPanel />}
      {tab === "drugstore" && <DrugstorePanel />}
      {tab === "promos" && <PromoCodesPanel />}
    </div>
  );
}
