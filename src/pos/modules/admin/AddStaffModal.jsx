import { useState } from "react";
import { useApp } from "../../AppContext";
import { useConfig } from "../../../config/ConfigContext";
import ModulesCheckbox from "./ModulesCheckbox";
import StaffService from "../../services/Staffservice";
import ModalPortal from "../../components/ModalPortal";

const ALL_MANAGE_MODULES = [
  { key: "drugstore",  label: "Drug Store" },
  { key: "mart",       label: "Mart" },
  { key: "hotel",      label: "Hotel" },
  { key: "restaurant", label: "Restaurant" },
];

export default function AddStaffModal({ onClose }) {
  const { dispatch } = useApp();
  const { config } = useConfig();
  const em = config.enabledModules ?? ["drugstore","mart","hotel","restaurant","storefront"];
  const manageModules = ALL_MANAGE_MODULES.filter(m => em.includes(m.key));
  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState("");
  const [pass, setPass]               = useState("");
  const [role, setRole]               = useState("staff");
  const [modules, setModules]         = useState([]);
  const [managePerms, setManagePerms] = useState([]);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  const toggleManage = (key) =>
    setManagePerms(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    );

  const submit = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!firstName.trim() || !lastName.trim()) { setError("Enter both first and last name."); return; }
    if (!email || !pass)   { setError("Fill in all required fields."); return; }
    if (pass.length < 6)   { setError("Password must be at least 6 characters."); return; }
    if (!modules.length)   { setError("Assign at least one access module."); return; }

    setLoading(true); setError("");
    try {
      const newUser = await StaffService.create({
        name: fullName, firstName: firstName.trim(), lastName: lastName.trim(),
        email, password: pass, role, modules, manageModules: managePerms,
      });
      dispatch({ type: "ADD_USER", user: newUser });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || "Failed to create staff.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="modal-bg">
        <div className="modal modal-wide" style={{ maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="modal-hd">
            <h3>Add New Staff</h3>
            <button className="modal-x" onClick={onClose}>✕</button>
          </div>
          <div className="modal-bd" style={{ padding: "16px 24px", overflow: "hidden", flex: 1 }}>
            {error && <div className="alert alert-err" style={{ marginBottom: 10 }}>{error}</div>}

            {/* Row 1: First + Last + Email + Password in 2x2 grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginBottom: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name *</label>
                <input className="form-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" disabled={loading} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Last Name *</label>
                <input className="form-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" disabled={loading} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="staff@medpoint.com" disabled={loading} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Min. 6 characters" disabled={loading} />
              </div>
            </div>

            {/* Row 2: Role */}
            <div style={{ marginBottom: 10 }}>
              <label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value)} disabled={loading} style={{ maxWidth: 220 }}>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            {/* Row 3: Access Modules + Management Permissions side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <div>
                <label className="form-label">Access Modules *</label>
                <ModulesCheckbox selected={modules} onChange={setModules} allowedModules={em} />
                {!modules.length && <div style={{ fontSize: 12, color: "var(--g400)", marginTop: 3 }}>Click a module to assign access</div>}
              </div>
              <div>
                <label className="form-label">Management Permissions</label>
                <div className="chk-group">
                  {manageModules.map(({ key, label }) => (
                    <button key={key} type="button"
                      className={`chk-opt ${managePerms.includes(key) ? "on" : ""}`}
                      onClick={() => toggleManage(key)} disabled={loading}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-ft">
            <button className="btn btn-sec" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-p" onClick={submit} disabled={loading}>
              {loading ? "Creating…" : "Create Staff"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
