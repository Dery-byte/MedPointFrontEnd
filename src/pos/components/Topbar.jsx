import { useApp } from "../AppContext";
import { modIcon, modLabel, roleBadgeClass, roleLabel } from "../helpers";
import Icon from "../../shared/components/Icon";

export default function Topbar({ onSidebarToggle, darkMode, onToggleDark }) {
  const { state, dispatch } = useApp();
  const { me, mod } = state;

  return (
    <nav className="topbar">
      <div className="topbar-left">
        <button className="sb-toggle-btn" onClick={onSidebarToggle} aria-label="Toggle sidebar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="t-logo">
          <div className="t-logo-ico"><Icon name="building" size={18} color="white" /></div>
          <div><h2>MedPoint</h2><small>Business Suite</small></div>
        </div>
        <div className="t-divider" />
        <div className="t-mod-badge">
          <Icon name={modIcon(mod)} size={13} color="var(--pd)" />
          {modLabel(mod)}
        </div>
      </div>
      <div className="topbar-right">
        <div className="t-user">
          <div className="t-avatar">{me?.name[0].toUpperCase()}</div>
          <div className="t-user-info">
            <div className="t-user-name">{me?.name}</div>
            <div className="t-user-role">
              <span className={`rbadge ${roleBadgeClass(me?.role)}`}>{roleLabel(me?.role)}</span>
            </div>
          </div>
        </div>
        <button
          className="theme-toggle-btn"
          onClick={onToggleDark}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        <button
          className="btn btn-sec btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
          onClick={() => dispatch({ type: "LOGOUT" })}
        >
          <Icon name="logout" size={14} />
          <span className="logout-label">Logout</span>
        </button>
      </div>
    </nav>
  );
}
