import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "../../../shared/components/Icon";
import MartService from "../../../store/services/martService";
import { useToast } from "../../../store/components/Toast";

export default function StorefrontCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { type: "add" | "edit", cat? }
  const [catName, setCatName] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [cats, prods] = await Promise.all([
          MartService.getCategories(),
          MartService.getAllAdmin(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch {
        toast({ message: "Failed to load", type: "error" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const countFor = (name) => products.filter((p) => p.cat === name).length;

  const openAdd = () => { setCatName(""); setModal({ type: "add" }); };
  const openEdit = (cat) => { setCatName(cat.name); setModal({ type: "edit", cat }); };

  const handleSave = async () => {
    if (!catName.trim()) return;
    setSaving(true);
    try {
      if (modal.type === "add") {
        const created = await MartService.createCategory(catName.trim());
        setCategories((prev) => [...prev, created]);
        toast({ message: "Category added", type: "success" });
      } else {
        const updated = await MartService.renameCategory(modal.cat.id, catName.trim());
        setCategories((prev) =>
          prev.map((c) => (c.id === modal.cat.id ? updated : c))
        );
        toast({ message: "Category renamed", type: "success" });
      }
      setModal(null);
    } catch (err) {
      toast({ message: err.response?.data?.message || "Failed to save", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const count = countFor(cat.name);
    if (count > 0) {
      toast({
        message: `Cannot delete — ${count} product${count !== 1 ? "s" : ""} use this category`,
        type: "error",
      });
      return;
    }
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await MartService.deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast({ message: "Category deleted", type: "info" });
    } catch {
      toast({ message: "Failed to delete", type: "error" });
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-sub">{categories.length} categories</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Icon name="plus" size={16} /> Add category
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-rows">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skel skel-table-row" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="admin-empty-state">
          <Icon name="category" size={44} color="var(--muted)" />
          <p>No categories yet</p>
          <button className="btn-primary" onClick={openAdd}>Add first category</button>
        </div>
      ) : (
        <div className="categories-admin-grid">
          {categories.map((cat) => {
            const count = countFor(cat.name);
            return (
              <div key={cat.id} className="category-admin-card">
                <div className="cac-icon">
                  <Icon name="tag" size={22} color="var(--primary)" />
                </div>
                <div className="cac-info">
                  <h3 className="cac-name">{cat.name}</h3>
                  <p className="cac-count">
                    {count} product{count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="cac-actions">
                  <button
                    className="admin-action-btn"
                    onClick={() => openEdit(cat)}
                    title="Rename"
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button
                    className="admin-action-btn admin-action-btn-danger"
                    onClick={() => handleDelete(cat)}
                    title="Delete"
                    disabled={count > 0}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal — rendered via portal to escape transform stacking context */}
      {modal && createPortal(
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{modal.type === "add" ? "Add category" : "Rename category"}</h2>
              <button className="modal-close-btn" onClick={() => setModal(null)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="form-field">
                <label>Category name <span className="required">*</span></label>
                <input
                  className="form-input"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Groceries"
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                  autoFocus
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || !catName.trim()}>
                {saving
                  ? <><Icon name="loader" size={15} className="spin" /> Saving...</>
                  : modal.type === "add" ? "Add" : "Rename"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
