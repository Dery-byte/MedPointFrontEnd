import { useState } from "react";
import ModalPortal from "../../components/ModalPortal";
import { useApp } from "../../AppContext";
import { useConfig } from "../../../config/ConfigContext";
import ModulesCheckbox from "./ModulesCheckbox";

const ALL_MANAGE_MODULES = [
  { key: "drugstore", label: "Drug Store" },
  { key: "mart",      label: "Mart" },
  { key: "hotel",     label: "Hotel" },
  { key: "restaurant", label: "Restaurant" },
];

export default function EditStaffModal({ user, onClose }) {
  const { dispatch } = useApp();
  const { config } = useConfig();
  const em = config.enabledModules ?? ["drugstore","mart","hotel","restaurant","storefront"];
  const manageModules = ALL_MANAGE_MODULES.filter(m => em.includes(m.key));
  const [name, setName]       = useState(user.name);
  const [role, setRole]       = useState(user.role);
  const [pass, setPass]       = useState("");
  const [modules, setModules] = useState([...user.modules]);
  const [managePerms, setManagePerms] = useState([...(user.managePerms || [])]);
  const [error, setError]     = useState("");

  const toggleManage = (key) => {
    setManagePerms(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    );
  };

  const submit = () => {
    if (!name)           { setError("Name is required."); return; }
    if (!modules.length) { setError("Assign at least one access module."); return; }
    const updated = { ...user, name, role, modules, managePerms };
    if (pass.length >= 6) updated.password = pass;
    dispatch({ type: "UPDATE_USER", user: updated });
    onClose();
  };

  return (<ModalPortal>
    <div className="modal-bg">
      <div className="modal modal-wide">
        <div className="modal-hd"><h3>Edit Staff: {user.name}</h3><button className="modal-x" onClick={onClose}>✕</button></div>
        <div className="modal-bd">
          {error && <div className="alert alert-err">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">New Password (leave blank to keep)</label><input className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Leave blank to keep" /></div>
          <div className="form-group">
            <label className="form-label">Access Modules <span style={{color:"var(--red)"}}>*</span></label>
            <ModulesCheckbox selected={modules} onChange={setModules} allowedModules={em} />
          </div>
          <div className="form-group">
            <label className="form-label">Module Management Permissions</label>
            <p style={{fontSize:11,color:"var(--g400)",marginBottom:6}}>Allow this staff to add/edit/price items in these modules</p>
            <div className="chk-group">
              {manageModules.map(({ key, label }) => (
                <button key={key} type="button"
                  className={`chk-opt ${managePerms.includes(key) ? "on" : ""}`}
                  onClick={() => toggleManage(key)}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-sec" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={submit}>Save Changes</button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}
