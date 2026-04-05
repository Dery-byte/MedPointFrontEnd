import { useState, useRef } from "react";
import ModalPortal from "./ModalPortal";
import Icon from "../../shared/components/Icon";
import { parseExcelFile } from "../utils/excelUtils";


import MartService from "../services/martApi";

/**
 * ExcelImportModal
 *
 * Props:
 *   title          - Modal title e.g. "Import Drugs from Excel"
 *   templateFn     - async fn to download the template
 *   columns        - [{ key, label, required?, type? }] - defines expected columns
 *   onImport       - async (rows) => void - called with parsed+validated rows
 *   onClose        - () => void
 *   hint           - Optional extra instructions string
 */
export default function ExcelImportModal({ title, templateFn, columns, onImport, onClose, hint }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);   // { headers, rows, errors }
  const [loading, setLoading] = useState(false);
  const [templLoading, setTemplLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = async (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      setError("Please upload an .xlsx, .xls, or .csv file.");
      return;
    }
    setFile(f);
    setError("");
    setSuccess("");
    setPreview(null);

    try {
      setLoading(true);
      const { headers, rows } = await parseExcelFile(f);

      // Validate columns
      const missingRequired = columns
        .filter(c => c.required !== false)
        .filter(c => !headers.some(h => h.toLowerCase() === c.label.toLowerCase() || h.toLowerCase() === c.key.toLowerCase()));

      const rowErrors = [];
      const parsedRows = rows.map((r, i) => {
        const mapped = {};
        const rowErr = [];
        columns.forEach(col => {
          // Match header case-insensitively
          const matchKey = Object.keys(r).find(
            k => k.toLowerCase() === col.label.toLowerCase() || k.toLowerCase() === col.key.toLowerCase()
          );
          const raw = matchKey !== undefined ? r[matchKey] : "";
          if (col.required !== false && (raw === "" || raw === undefined || raw === null)) {
            rowErr.push(`Row ${i + 2}: "${col.label}" is required`);
          }
          if (col.type === "number") {
            const n = parseFloat(raw);
            if (raw !== "" && isNaN(n)) rowErr.push(`Row ${i + 2}: "${col.label}" must be a number`);
            mapped[col.key] = isNaN(n) ? 0 : n;
          } else if (col.type === "int") {
            const n = parseInt(raw);
            if (raw !== "" && isNaN(n)) rowErr.push(`Row ${i + 2}: "${col.label}" must be a whole number`);
            mapped[col.key] = isNaN(n) ? 0 : n;
          } else {
            mapped[col.key] = String(raw).trim();
          }
        });
        rowErrors.push(...rowErr);
        return mapped;
      });

      setPreview({
        headers,
        rows: parsedRows,
        missingRequired,
        rowErrors: rowErrors.slice(0, 5), // show max 5 errors
        hasMore: rowErrors.length > 5,
        file: f,
      });
    } catch (e) {
      setError("Failed to read file. Please check the format.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleConfirm = async () => {
    if (!preview?.rows?.length) return;
    setLoading(true);
    setError("");
    try {
      await onImport(preview.rows, preview.file);
      setSuccess(`${preview.rows.length} item${preview.rows.length !== 1 ? "s" : ""} imported successfully!`);
      setPreview(null);
      setFile(null);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = preview && (preview.missingRequired?.length > 0 || preview.rowErrors?.length > 0);

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal modal-wide">
          <div className="modal-hd">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>📥</span> {title}
            </h3>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>

          <div className="modal-bd" style={{ padding: "18px 24px" }}>
            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20 }}>
              {["Download Template", "Fill & Upload", "Review & Import"].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800,
                      background: i === 0 ? "var(--p)" : file && i === 1 ? "var(--p)" : preview && i === 2 ? "var(--green)" : "var(--g200)",
                      color: i <= 1 || preview ? "white" : "var(--g500)",
                      transition: "all .2s",
                    }}>
                      {preview && i === 2 ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--g500)", textAlign: "center" }}>{step}</span>
                  </div>
                  {i < 2 && <div style={{ height: 1, flex: 0, width: 20, background: "var(--g200)", marginBottom: 18 }} />}
                </div>
              ))}
            </div>

            {/* Template download */}
            <div style={{
              background: "var(--pal)", border: "1px solid var(--pa)", borderRadius: "var(--r)",
              padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--pdd)" }}>Step 1: Download the template</div>
                <div style={{ fontSize: 12, color: "var(--g500)", marginTop: 2 }}>
                  Fill in your data using the provided format. Required columns are marked.
                </div>
                {hint && <div style={{ fontSize: 12, color: "var(--g400)", marginTop: 2 }}>{hint}</div>}
              </div>
              <button
                className="btn btn-sec btn-sm"
                style={{ flexShrink: 0, marginLeft: 16 }}
                disabled={templLoading}
                onClick={async () => {
                  setTemplLoading(true);
                  try { await templateFn(); } finally { setTemplLoading(false); }
                }}
              >
                {templLoading ? "Downloading…" : "⬇ Template"}
              </button>
            </div>

            {/* File drop zone */}
            <div
              style={{
                border: `2px dashed ${dragging ? "var(--p)" : file ? "var(--green)" : "var(--g300)"}`,
                borderRadius: "var(--r)", padding: "24px 20px", textAlign: "center", cursor: "pointer",
                background: dragging ? "var(--pal)" : file ? "#f0fdf4" : "var(--g50)",
                transition: "all .2s", marginBottom: 14,
              }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                onChange={e => handleFile(e.target.files[0])}
              />
              {loading ? (
                <div style={{ color: "var(--g500)", fontSize: 14 }}>
                  <span className="spin-ring" style={{ display: "inline-block", marginRight: 8, borderColor: "var(--g300)", borderTopColor: "var(--p)" }} />
                  Reading file…
                </div>
              ) : file ? (
                <div>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📊</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--g900)" }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: "var(--g400)", marginTop: 3 }}>Click to change file</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--g700)" }}>Drop your Excel file here</div>
                  <div style={{ fontSize: 12, color: "var(--g400)", marginTop: 4 }}>or click to browse — .xlsx, .xls, .csv accepted</div>
                </div>
              )}
            </div>

            {/* Validation errors */}
            {hasErrors && (
              <div className="alert alert-err" style={{ marginBottom: 12, fontSize: 13 }}>
                {preview.missingRequired?.length > 0 && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>Missing required columns:</strong> {preview.missingRequired.map(c => c.label).join(", ")}
                  </div>
                )}
                {preview.rowErrors?.map((e, i) => <div key={i}>{e}</div>)}
                {preview.hasMore && <div style={{ color: "var(--g500)", marginTop: 4 }}>…and more errors. Fix the file and re-upload.</div>}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="alert alert-ok" style={{ marginBottom: 12 }}>
                ✅ {success}
              </div>
            )}

            {/* Error */}
            {error && <div className="alert alert-err" style={{ marginBottom: 12 }}>{error}</div>}

            {/* Preview table */}
            {preview && !hasErrors && preview.rows.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--g700)" }}>
                  Preview — {preview.rows.length} row{preview.rows.length !== 1 ? "s" : ""} ready to import
                </div>
                <div style={{ overflowX: "auto", maxHeight: 200, borderRadius: "var(--r)", border: "1px solid var(--g200)" }}>
                  <table className="tbl" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        {columns.map(c => <th key={c.key}>{c.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.slice(0, 8).map((r, i) => (
                        <tr key={i}>
                          {columns.map(c => (
                            <td key={c.key} style={{ fontSize: 12 }}>{String(r[c.key] ?? "")}</td>
                          ))}
                        </tr>
                      ))}
                      {preview.rows.length > 8 && (
                        <tr>
                          <td colSpan={columns.length} style={{ textAlign: "center", color: "var(--g400)", fontSize: 12, padding: "8px" }}>
                            …{preview.rows.length - 8} more rows not shown
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose} disabled={loading}>
              {success ? "Close" : "Cancel"}
            </button>
            {!success && (
              <button
                className="btn btn-p"
                disabled={!preview || hasErrors || !preview.rows.length || loading}
                onClick={handleConfirm}
              >
                {loading
                  ? <><span className="spin-ring" /> Importing…</>
                  : <>📥 Import {preview?.rows?.length ? `${preview.rows.length} Items` : ""}</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
