import { useState } from "react";
import { useAdminData } from "../../hooks/useAdminData";
import { modIcon } from "../../helpers";
import Badge from "../../components/Badge";
import AddStaffModal from "./AddStaffModal";
import EditStaffModal from "./EditStaffModal";
import StaffService from "../../services/Staffservice";

function StaffCard({ u, onEdit, onToggle, togglingId }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`staff-row${expanded ? " staff-row--open" : ""}`}>
      {/* Tap/click header */}
      <div className="staff-row-header" onClick={() => setExpanded(e => !e)}>
        <div className="staff-info">
          <div className="staff-avatar">{(u.name || "?")[0].toUpperCase()}</div>
          <div className="staff-details">
            <div className="staff-name">{u.name}</div>
            <div className="staff-email">{u.email}</div>
            <div className="staff-meta">
              <span className={`rbadge ${u.role === "superadmin" ? "rb-super" : u.role === "manager" ? "rb-manager" : "rb-staff"}`}>
                {u.role === "superadmin" ? "Super Admin" : u.role === "manager" ? "Manager" : "Staff"}
              </span>
              <Badge type={u.active ? "green" : "red"}>{u.active ? "Active" : "Inactive"}</Badge>
            </div>
          </div>
        </div>
        <span className="staff-chevron">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Modules — desktop: always visible; mobile: toggled */}
      <div className={`staff-modules${expanded ? " staff-modules--visible" : ""}`}>
        <div className="staff-mod-label">Access</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {u.modules.map(m => (
            <span key={m} className="badge badge-blue" style={{ fontSize: 11 }}>{modIcon(m)} {m}</span>
          ))}
          {!u.modules.length && <span style={{ color: "var(--g400)", fontSize: 12 }}>—</span>}
        </div>
        {(u.managePerms || u.manageModules || []).length > 0 && (
          <>
            <div className="staff-mod-label" style={{ marginTop: 6 }}>Manages</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {(u.managePerms || u.manageModules || []).map(m => (
                <span key={m} className="badge badge-green" style={{ fontSize: 11 }}>{modIcon(m)} {m}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Actions — desktop: always visible; mobile: toggled */}
      <div className={`staff-actions${expanded ? " staff-actions--visible" : ""}`}>
        {u.role !== "superadmin" ? (
          <>
            <button className="btn btn-sec btn-sm" onClick={e => { e.stopPropagation(); onEdit(u); }}>Edit</button>
            <button
              className={`btn btn-sm ${u.active ? "btn-danger" : "btn-success"}`}
              onClick={e => { e.stopPropagation(); onToggle(u); }}
              disabled={togglingId === u.id}
            >
              {togglingId === u.id ? "…" : u.active ? "Deactivate" : "Activate"}
            </button>
          </>
        ) : (
          <span style={{ color: "var(--g300)", fontSize: 13 }}>—</span>
        )}
      </div>
    </div>
  );
}

export default function AdminStaff() {
  const { users, me, dispatch } = useAdminData();
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleToggle = async (u) => {
    setTogglingId(u.id);
    try {
      const updated = await StaffService.toggle(u.id);
      dispatch({ type: "UPDATE_USER", user: updated });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update staff status.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <div className="pg-hd-row">
        <h2>Staff Management</h2>
        {me.role === "superadmin" && (
          <button className="btn btn-p" onClick={() => setShowAdd(true)}>+ Add Staff</button>
        )}
      </div>

      <div className="staff-list">
        {users.map(u => (
          <StaffCard key={u.id} u={u} onEdit={setEditUser} onToggle={handleToggle} togglingId={togglingId} />
        ))}
      </div>

      {showAdd && <AddStaffModal onClose={() => setShowAdd(false)} />}
      {editUser && <EditStaffModal user={editUser} onClose={() => setEditUser(null)} />}
    </div>
  );
}
