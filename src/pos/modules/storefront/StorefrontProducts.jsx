import { useState, useEffect, useRef } from "react";
import Icon from "../../../shared/components/Icon";
import MartService from "../../../store/services/martService";
import { useToast } from "../../../store/components/Toast";
import { useConfig } from "../../../config/ConfigContext";

/* ─────────────────────────────────────────────────────────────
   VARIATION EDITOR
───────────────────────────────────────────────────────────── */
function VariationsEditor({ variations, onChange }) {
  const add    = ()           => onChange([...variations, { name: "", options: [{ label: "", price: 0, stock: 0, colorHex: "" }] }]);
  const rmGrp  = (gi)        => onChange(variations.filter((_, i) => i !== gi));
  const upGrp  = (gi, k, v)  => onChange(variations.map((g, i) => i === gi ? { ...g, [k]: v } : g));
  const addOpt = (gi)        => onChange(variations.map((g, i) => i === gi ? { ...g, options: [...g.options, { label: "", price: 0, stock: 0, colorHex: "" }] } : g));
  const rmOpt  = (gi, oi)    => onChange(variations.map((g, i) => i === gi ? { ...g, options: g.options.filter((_, j) => j !== oi) } : g));
  const upOpt  = (gi, oi, k, v) => onChange(variations.map((g, i) => i === gi ? { ...g, options: g.options.map((o, j) => j === oi ? { ...o, [k]: v } : o) } : g));

  return (
    <div className="variations-editor">
      {variations.length === 0 && (
        <div className="variations-empty">
          <Icon name="grid" size={32} color="rgba(255,255,255,0.15)" />
          <p>No variations yet. Add a group for options like Size or Color.</p>
        </div>
      )}
      {variations.map((group, gi) => (
        <div key={gi} className="vge-group">
          <div className="vge-group-header">
            <input className="form-input vge-name-input" value={group.name}
              onChange={e => upGrp(gi, "name", e.target.value)}
              placeholder="Group name (e.g. Size, Color, Weight)" />
            <button className="admin-action-btn admin-action-btn-danger" onClick={() => rmGrp(gi)}
              title="Remove group"><Icon name="trash" size={14} /></button>
          </div>
          <div className="vge-options-grid">
            <div className="vge-options-head">
              <span>Label</span><span>Price (GH₵)</span><span>Stock</span><span>Color hex</span><span />
            </div>
            {group.options.map((opt, oi) => (
              <div key={oi} className="vge-option-row">
                <input className="form-input" value={opt.label}
                  onChange={e => upOpt(gi, oi, "label", e.target.value)}
                  placeholder="e.g. XL, Red" />
                <input className="form-input" type="number" min="0" step="0.01" value={opt.price}
                  onChange={e => upOpt(gi, oi, "price", parseFloat(e.target.value) || 0)} />
                <input className="form-input" type="number" min="0" value={opt.stock}
                  onChange={e => upOpt(gi, oi, "stock", parseInt(e.target.value) || 0)} />
                <div className="vge-color-cell">
                  {opt.colorHex && (
                    <span className="vge-color-dot" style={{ background: opt.colorHex }} />
                  )}
                  <input className="form-input" value={opt.colorHex || ""}
                    onChange={e => upOpt(gi, oi, "colorHex", e.target.value)}
                    placeholder="#hex" />
                </div>
                <button className="admin-action-btn admin-action-btn-danger"
                  onClick={() => rmOpt(gi, oi)}
                  disabled={group.options.length === 1}><Icon name="minus" size={13} /></button>
              </div>
            ))}
          </div>
          <button className="vge-add-option-btn" onClick={() => addOpt(gi)}>
            <Icon name="plus" size={13} /> Add option
          </button>
        </div>
      ))}
      <button className="vge-add-group-btn" onClick={add}>
        <Icon name="plus" size={15} /> Add variation group
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOGGLE SWITCH
───────────────────────────────────────────────────────────── */
function Toggle({ value, onChange, label, hint }) {
  return (
    <label className="admin-toggle-row">
      <div className="admin-toggle-text">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
      <button
        className={`admin-toggle${value ? " admin-toggle-on" : ""}`}
        onClick={() => onChange(!value)}
        role="switch" aria-checked={value}>
        <div className="admin-toggle-knob" />
      </button>
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT MODAL (tabbed: Basic / Discount / Variations / Details)
───────────────────────────────────────────────────────────── */
function ProductModal({ product, categories, onClose, onSaved }) {
  const { config } = useConfig();
  const sym = config.currencySymbol;
  const storefrontEnabled = config.enabledModules?.includes("storefront") ?? true;
  const isEdit = !!product;

  const [tab,        setTab]        = useState("basic");
  const [name,       setName]       = useState(product?.name || "");
  const [cat,        setCat]        = useState(product?.cat || categories[0]?.name || "");
  const [price,      setPrice]      = useState(product?.price || "");
  const [costPrice,  setCostPrice]  = useState(product?.costPrice || "");
  const [stock,      setStock]      = useState(product?.stock ?? "");
  const [desc,       setDesc]       = useState(product?.description || "");
  const [tags,       setTags]       = useState((product?.tags || []).join(", "));
  const [featured,   setFeatured]   = useState(product?.featured || false);
  const [variations, setVariations] = useState(product?.variations || []);

  const [hasDiscount, setHasDiscount] = useState(!!product?.discount);
  const [discType,    setDiscType]    = useState(product?.discount?.type || "percent");
  const [discValue,   setDiscValue]   = useState(product?.discount?.value || "");
  const [discLabel,   setDiscLabel]   = useState(product?.discount?.label || "");
  const [discEndsAt,  setDiscEndsAt]  = useState(product?.discount?.endsAt || "");

  const [showOnStore,  setShowOnStore]  = useState(product?.showOnStore ?? true);
  const [isOnSale,     setIsOnSale]     = useState(product?.onSale?.active || false);
  const [saleOldPrice, setSaleOldPrice] = useState(
    product?.onSale?.oldPrice != null ? String(product.onSale.oldPrice)
    : product?.price != null ? String(product.price) : ""
  );
  const [saleNewPrice, setSaleNewPrice] = useState(
    product?.onSale?.newPrice != null ? String(product.onSale.newPrice) : ""
  );

  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const { toast }             = useToast();

  const validate = () => {
    const e = {};
    if (!name.trim())                                      e.name  = "Name required";
    if (!price || isNaN(price) || parseFloat(price) <= 0) e.price = "Valid price required";
    if (stock === "" || isNaN(stock) || parseInt(stock) < 0) e.stock = "Valid stock required";
    if (isOnSale) {
      if (!saleOldPrice || isNaN(saleOldPrice) || parseFloat(saleOldPrice) <= 0)
        e.saleOldPrice = "Valid old price required";
      if (!saleNewPrice || isNaN(saleNewPrice) || parseFloat(saleNewPrice) <= 0)
        e.saleNewPrice = "Valid new price required";
      if (!e.saleOldPrice && !e.saleNewPrice && parseFloat(saleNewPrice) >= parseFloat(saleOldPrice))
        e.saleNewPrice = "New price must be less than old price";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const discountedPrice = () => {
    if (!hasDiscount || !discValue || !price) return null;
    const p = parseFloat(price), v = parseFloat(discValue);
    return discType === "percent" ? p * (1 - v / 100) : Math.max(0, p - v);
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name, cat,
        price, costPrice: costPrice || null, stock,
        description: desc,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        featured,
        variations,
        discount: hasDiscount && discValue
          ? { type: discType, value: parseFloat(discValue), label: discLabel || null, endsAt: discEndsAt || null }
          : null,
        showOnStore,
        onSale: isOnSale && saleOldPrice && saleNewPrice
          ? { active: true, oldPrice: parseFloat(saleOldPrice), newPrice: parseFloat(saleNewPrice) }
          : null,
      };
      if (isEdit) {
        const updated = await MartService.update(product.id, payload);
        onSaved(updated, "edit");
        toast({ message: "Product updated", type: "success" });
      } else {
        const created = await MartService.create(payload);
        onSaved(created, "add");
        toast({ message: "Product added", type: "success" });
      }
      onClose();
    } catch (err) {
      toast({ message: err.response?.data?.message || "Failed to save", type: "error" });
    } finally { setSaving(false); }
  };

  const TABS = [
    { id: "basic",      label: "Basic",      icon: "package" },
    ...(storefrontEnabled ? [
      { id: "onsale",     label: "On Sale",    icon: "tag"     },
      { id: "discount",   label: "Discount",   icon: "tag"     },
      { id: "variations", label: "Variations", icon: "grid"    },
      { id: "details",    label: "Details",    icon: "list"    },
    ] : []),
  ];

  const dp = discountedPrice();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-title-row">
            <h2>{isEdit ? "Edit product" : "Add product"}</h2>
            <div className="modal-title-flags">
              {storefrontEnabled && featured && <span className="flag-badge flag-featured"><Icon name="star" size={11} /> Featured</span>}
              {storefrontEnabled && (hasDiscount || isOnSale) && <span className="flag-badge flag-discount"><Icon name="tag" size={11} /> On sale</span>}
              {storefrontEnabled && variations.length > 0 && <span className="flag-badge flag-variation"><Icon name="grid" size={11} /> {variations.length} variation{variations.length > 1 ? "s" : ""}</span>}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="admin-modal-tabs">
          {TABS.map(t => (
            <button key={t.id}
              className={`admin-modal-tab${tab === t.id ? " admin-modal-tab-active" : ""}`}
              onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={14} />
              {t.label}
              {t.id === "onsale"     && isOnSale              && <span className="tab-dot tab-dot-orange" />}
              {t.id === "discount"   && hasDiscount           && <span className="tab-dot tab-dot-green"  />}
              {t.id === "variations" && variations.length > 0 && <span className="tab-dot tab-dot-blue"   />}
            </button>
          ))}
        </div>

        <div className="admin-modal-body">

          {/* ── BASIC ────────────────────────────────────── */}
          {tab === "basic" && (
            <div className="form-grid-2">
              <div className="form-field form-field-span2">
                <label>Product name <span className="required">*</span></label>
                <input className={`form-input${errors.name ? " input-error" : ""}`}
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jasmine Rice 5kg" autoFocus />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-field">
                <label>Category</label>
                <select className="form-input" value={cat} onChange={e => setCat(e.target.value)}>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Stock quantity <span className="required">*</span></label>
                <input className={`form-input${errors.stock ? " input-error" : ""}`}
                  type="number" min="0" value={stock}
                  onChange={e => setStock(e.target.value)} placeholder="0" />
                {errors.stock && <span className="field-error">{errors.stock}</span>}
              </div>
              <div className="form-field">
                <label>Selling price ({sym}) <span className="required">*</span></label>
                <input className={`form-input${errors.price ? " input-error" : ""}`}
                  type="number" step="0.01" min="0" value={price}
                  onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                {errors.price && <span className="field-error">{errors.price}</span>}
              </div>
              <div className="form-field">
                <label>Cost price ({sym}) <span className="optional">(optional)</span></label>
                <input className="form-input" type="number" step="0.01" min="0"
                  value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0.00" />
              </div>
              {storefrontEnabled && (
                <div className="form-field form-field-span2">
                  <Toggle
                    value={featured}
                    onChange={setFeatured}
                    label="Featured product"
                    hint="Shown in the featured section on the homepage hero" />
                </div>
              )}
              {storefrontEnabled && (
                <div className="form-field form-field-span2">
                  <Toggle
                    value={showOnStore}
                    onChange={setShowOnStore}
                    label="Show on webstore"
                    hint="Hide this product from the public store" />
                </div>
              )}
            </div>
          )}

          {/* ── ON SALE ──────────────────────────────────── */}
          {tab === "onsale" && (
            <div className="discount-editor-panel">
              <Toggle
                value={isOnSale}
                onChange={setIsOnSale}
                label="Mark as on sale"
                hint="Displays a crossed-out original price on the webstore" />

              {isOnSale && (
                <div className="discount-fields-wrap">
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Old price ({sym}) <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.saleOldPrice ? " input-error" : ""}`}
                        type="number" step="0.01" min="0"
                        value={saleOldPrice}
                        onChange={e => setSaleOldPrice(e.target.value)}
                        placeholder="Original price shown crossed out" />
                      {errors.saleOldPrice && <span className="field-error">{errors.saleOldPrice}</span>}
                    </div>
                    <div className="form-field">
                      <label>New price ({sym}) <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.saleNewPrice ? " input-error" : ""}`}
                        type="number" step="0.01" min="0"
                        value={saleNewPrice}
                        onChange={e => setSaleNewPrice(e.target.value)}
                        placeholder="Actual price customers pay" />
                      {errors.saleNewPrice && <span className="field-error">{errors.saleNewPrice}</span>}
                    </div>
                  </div>

                  {saleOldPrice && saleNewPrice &&
                   !isNaN(saleOldPrice) && !isNaN(saleNewPrice) &&
                   parseFloat(saleNewPrice) < parseFloat(saleOldPrice) && (
                    <div className="discount-live-preview">
                      <span className="dlp-label">Live preview</span>
                      <div className="dlp-prices">
                        <span className="dlp-original">{sym} {parseFloat(saleOldPrice).toFixed(2)}</span>
                        <Icon name="arrow-right" size={14} color="var(--muted)" />
                        <span className="dlp-current">{sym} {parseFloat(saleNewPrice).toFixed(2)}</span>
                        <span className="dlp-badge">On Sale</span>
                      </div>
                      <span className="dlp-saving">
                        Customer saves {sym} {(parseFloat(saleOldPrice) - parseFloat(saleNewPrice)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── DISCOUNT ─────────────────────────────────── */}
          {tab === "discount" && (
            <div className="discount-editor-panel">
              <Toggle
                value={hasDiscount}
                onChange={setHasDiscount}
                label="Enable discount"
                hint="Show a sale badge and reduced price on this product" />

              {hasDiscount && (
                <div className="discount-fields-wrap">
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Discount type</label>
                      <select className="form-input" value={discType} onChange={e => setDiscType(e.target.value)}>
                        <option value="percent">Percentage (% off)</option>
                        <option value="fixed">Fixed amount off</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Discount value <span className="required">*</span></label>
                      <input className="form-input" type="number" min="0"
                        max={discType === "percent" ? 100 : undefined}
                        value={discValue} onChange={e => setDiscValue(e.target.value)}
                        placeholder={discType === "percent" ? "e.g. 20" : "e.g. 5.00"} />
                    </div>
                    <div className="form-field">
                      <label>Badge label <span className="optional">(auto-generated if blank)</span></label>
                      <input className="form-input" value={discLabel}
                        onChange={e => setDiscLabel(e.target.value)}
                        placeholder={discType === "percent" ? `${discValue || "20"}% OFF` : "Special offer"} />
                    </div>
                    <div className="form-field">
                      <label>Sale ends at <span className="optional">(optional)</span></label>
                      <input className="form-input" type="datetime-local"
                        value={discEndsAt} onChange={e => setDiscEndsAt(e.target.value)} />
                    </div>
                  </div>

                  {/* Live preview */}
                  {price && discValue && dp !== null && (
                    <div className="discount-live-preview">
                      <span className="dlp-label">Live preview</span>
                      <div className="dlp-prices">
                        <span className="dlp-original">{sym} {parseFloat(price).toFixed(2)}</span>
                        <Icon name="arrow-right" size={14} color="var(--muted)" />
                        <span className="dlp-current">{sym} {dp.toFixed(2)}</span>
                        <span className="dlp-badge">
                          {discLabel || (discType === "percent" ? `${discValue}% OFF` : `Save ${sym} ${discValue}`)}
                        </span>
                      </div>
                      <span className="dlp-saving">
                        Customer saves {sym} {(parseFloat(price) - dp).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── VARIATIONS ───────────────────────────────── */}
          {tab === "variations" && (
            <div>
              <p className="variations-intro">
                Add options like Size, Color, or Weight. Each option can have its own price and stock level.
                Customers must select all variations before they can add the product to cart.
              </p>
              <VariationsEditor variations={variations} onChange={setVariations} />
            </div>
          )}

          {/* ── DETAILS ──────────────────────────────────── */}
          {tab === "details" && (
            <div className="form-grid-2">
              <div className="form-field form-field-span2">
                <label>Product description</label>
                <textarea className="form-input form-textarea"
                  value={desc} onChange={e => setDesc(e.target.value)}
                  rows={5} placeholder="Describe this product in detail..." />
              </div>
              <div className="form-field form-field-span2">
                <label>Tags <span className="optional">(comma-separated)</span></label>
                <input className="form-input" value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="organic, fresh, bestseller, imported" />
                {tags && (
                  <div className="tags-preview">
                    {tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} className="tag-chip">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="admin-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving}>
            {saving
              ? <><Icon name="loader" size={15} className="spin" /> Saving...</>
              : isEdit ? "Save changes" : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   IMAGE UPLOAD MODAL
───────────────────────────────────────────────────────────── */
function ImageUploadModal({ product, onClose, onUploaded }) {
  const fileRef = useRef();
  const [preview,   setPreview]   = useState(product.imageUrl || null);
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const { toast }                 = useToast();

  const onPick = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await MartService.uploadImage(product.id, file);
      onUploaded(product.id, url);
      toast({ message: "Image uploaded successfully", type: "success" });
      onClose();
    } catch (err) {
      toast({ message: err.response?.data?.message || "Upload failed", type: "error" });
    } finally { setUploading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>Product image</h2>
          <button className="modal-close-btn" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div className="admin-modal-body">
          <p className="admin-modal-product-name">{product.name}</p>
          <div className="image-upload-zone" onClick={() => fileRef.current?.click()}>
            {preview
              ? <img src={preview} alt="Preview" className="image-upload-preview" />
              : <div className="image-upload-placeholder">
                  <Icon name="upload" size={40} color="rgba(255,255,255,0.2)" />
                  <p>Click to select an image</p>
                  <span>JPG, PNG, WEBP — max 5 MB</span>
                </div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display: "none" }} onChange={onPick} />
          {preview && (
            <button className="btn-outline image-change-btn"
              onClick={() => fileRef.current?.click()}>
              <Icon name="image" size={15} /> Change image
            </button>
          )}
        </div>
        <div className="admin-modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleUpload} disabled={!file || uploading}>
            {uploading
              ? <><Icon name="loader" size={15} className="spin" /> Uploading...</>
              : <><Icon name="upload" size={15} /> Upload</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function StorefrontProducts() {
  const { config } = useConfig();
  const sym = config.currencySymbol;
  const storefrontEnabled = config.enabledModules?.includes("storefront") ?? true;

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterCat,   setFilterCat]   = useState("All");
  const [filterFlag,  setFilterFlag]  = useState("all");
  const [modal,       setModal]       = useState(null);
  const { toast }                     = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          MartService.getAllAdmin(),
          MartService.getCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch {
        toast({ message: "Failed to load products", type: "error" });
      } finally { setLoading(false); }
    })();
  }, []);

  const handleSaved = (product, type) => {
    setProducts(prev =>
      type === "add"
        ? [product, ...prev]
        : prev.map(p => p.id === product.id ? product : p)
    );
  };

  const handleImageUploaded = (id, url) =>
    setProducts(prev => prev.map(p => p.id === id ? { ...p, imageUrl: url } : p));

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await MartService.remove(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast({ message: "Product deleted", type: "info" });
    } catch { toast({ message: "Failed to delete", type: "error" }); }
  };

  const filtered = products
    .filter(p => filterCat  === "All"        || p.cat === filterCat)
    .filter(p => filterFlag === "featured"   ? p.featured
               : filterFlag === "discounted" ? !!p.discount
               : filterFlag === "variants"   ? p.variations?.length > 0
               : true)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total:      products.length,
    featured:   storefrontEnabled ? products.filter(p => p.featured).length : 0,
    discounted: storefrontEnabled ? products.filter(p => !!p.discount || p.onSale?.active).length : 0,
    variants:   storefrontEnabled ? products.filter(p => p.variations?.length > 0).length : 0,
    oos:        products.filter(p => p.stock <= 0).length,
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-sub">{stats.total} total</p>
        </div>
        <button className="btn-primary" onClick={() => setModal({ type: "add" })}>
          <Icon name="plus" size={16} /> Add product
        </button>
      </div>

      {/* Quick stats row */}
      <div className="products-quick-stats">
        {[
          { label: "Total",    val: stats.total, color: "rgba(255,255,255,0.6)" },
          storefrontEnabled && { label: "Featured", val: stats.featured,   color: "#fbbf24" },
          storefrontEnabled && { label: "On sale",  val: stats.discounted, color: "#34d399" },
          storefrontEnabled && { label: "Variants", val: stats.variants,   color: "#818cf8" },
          { label: "OOS",      val: stats.oos,   color: "#f87171" },
        ].filter(Boolean).map(s => (
          <div key={s.label} className="pqs-item">
            <span className="pqs-val" style={{ color: s.color }}>{s.val}</span>
            <span className="pqs-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-filters-bar">
        <div className="admin-search-field">
          <Icon name="search" size={16} color="var(--muted)" />
          <input className="admin-search-input" placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}>
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
        <select className="admin-cat-filter" value={filterCat}
          onChange={e => setFilterCat(e.target.value)}>
          <option value="All">All categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <div className="admin-flag-filters">
          {[
            ["all",        "All"      ],
            storefrontEnabled && ["featured",   "Featured" ],
            storefrontEnabled && ["discounted", "On sale"  ],
            storefrontEnabled && ["variants",   "Variants" ],
          ].filter(Boolean).map(([val, label]) => (
            <button key={val}
              className={`admin-flag-btn${filterFlag === val ? " admin-flag-btn-active" : ""}`}
              onClick={() => setFilterFlag(val)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading-rows">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skel skel-table-row shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">
          <Icon name="package" size={44} color="rgba(255,255,255,0.15)" />
          <p>No products found</p>
          {search && <button className="btn-outline btn-sm" onClick={() => setSearch("")}>Clear search</button>}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {storefrontEnabled && <th>Image</th>}
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                {storefrontEnabled && <th>Flags</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  {storefrontEnabled && (
                    <td>
                      <div className="admin-product-img-cell">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="admin-product-thumb" />
                          : <div className="admin-product-thumb-ph">
                              <Icon name="image" size={18} color="rgba(255,255,255,0.2)" />
                            </div>}
                        <button className="admin-img-upload-btn"
                          onClick={() => setModal({ type: "image", product: p })}
                          title="Upload image">
                          <Icon name="upload" size={12} />
                        </button>
                      </div>
                    </td>
                  )}
                  <td className="admin-product-name-cell">
                    <span className="admin-product-name">{p.name}</span>
                    <span className="admin-product-id">ID {p.id}</span>
                  </td>
                  <td><span className="cat-badge">{p.cat}</span></td>
                  <td>
                    <div className="admin-price-cell">
                      <span className="admin-price-main">{sym} {p.price.toFixed(2)}</span>
                      {storefrontEnabled && p.discount && (
                        <span className="admin-discount-tag">
                          {p.discount.type === "percent"
                            ? `−${p.discount.value}%`
                            : `−${sym} ${p.discount.value}`}
                        </span>
                      )}
                      {storefrontEnabled && p.onSale?.active && (
                        <span className="admin-discount-tag">
                          {sym} {p.onSale.newPrice?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`stock-badge ${
                      p.stock === 0 ? "stock-oos" : p.stock <= 5 ? "stock-low" : "stock-ok"
                    }`}>
                      {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? `${p.stock} left` : p.stock}
                    </span>
                  </td>
                  {storefrontEnabled && (
                    <td>
                      <div className="admin-flags-cell">
                        {p.featured               && <span className="flag-badge flag-featured"><Icon name="star"  size={10} /> Featured</span>}
                        {(p.discount || p.onSale?.active) && <span className="flag-badge flag-discount"><Icon name="tag"   size={10} /> Sale</span>}
                        {p.variations?.length > 0 && <span className="flag-badge flag-variation"><Icon name="grid" size={10} /> Variants</span>}
                      </div>
                    </td>
                  )}
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-action-btn"
                        onClick={() => setModal({ type: "edit", product: p })}
                        title="Edit">
                        <Icon name="edit" size={15} />
                      </button>
                      <button className="admin-action-btn admin-action-btn-danger"
                        onClick={() => handleDelete(p)}
                        title="Delete">
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.type === "add"   && <ProductModal categories={categories} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.type === "edit"  && <ProductModal product={modal.product} categories={categories} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.type === "image" && storefrontEnabled && <ImageUploadModal product={modal.product} onClose={() => setModal(null)} onUploaded={handleImageUploaded} />}
    </div>
  );
}
