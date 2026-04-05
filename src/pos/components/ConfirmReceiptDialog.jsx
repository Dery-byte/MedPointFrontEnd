import Icon from "../../shared/components/Icon";
import ModalPortal from "../components/ModalPortal";
import { fmt } from "../helpers";

/**
 * ConfirmReceiptDialog
 * Props:
 *   open        – boolean
 *   title       – e.g. "Confirm Drug Dispense"
 *   subtitle    – e.g. "The following items will be billed and saved."
 *   rows        – [{ label, value }] for the summary table
 *   total       – number
 *   loading     – boolean (shows spinner on confirm button)
 *   onConfirm   – () => void
 *   onCancel    – () => void
 */
export default function ConfirmReceiptDialog({
  open,
  title = "Confirm & Issue Receipt",
  subtitle = "Review the details below before issuing. This action will save the record.",
  rows = [],
  total,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (<ModalPortal>
    <div className="confirm-bg">
      <div className="confirm-box">
        <div className="confirm-hd">
          <div className="confirm-icon-wrap">
            <Icon name="receipt" size={26} color="white" />
          </div>
          <div className="confirm-title">{title}</div>
          <div className="confirm-sub">{subtitle}</div>
        </div>

        {(rows.length > 0 || total != null) && (
          <div className="confirm-summary">
            {rows.map((r, i) => (
              <div key={i} className="confirm-summary-row">
                <span>{r.label}</span>
                <span style={{ fontWeight: 700, color: "var(--g800)" }}>{r.value}</span>
              </div>
            ))}
            {total != null && (
              <div className="confirm-summary-row total">
                <span>Total</span>
                <span style={{ color: "var(--pd)" }}>{fmt(total)}</span>
              </div>
            )}
          </div>
        )}

        <div className="confirm-ft">
          <button className="confirm-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="confirm-ok" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <span className="spin-ring" />
                Processing...
              </>
            ) : (
              <>
                <Icon name="print" size={15} color="white" />
                Confirm & Issue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}
