import { createContext, useContext, useReducer, useCallback } from "react";
import Icon from "../../shared/components/Icon";

const ToastContext = createContext(null);

let _id = 0;

function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const toast = useCallback(
    ({ message, type = "info", duration = 3500 }) => {
      const id = ++_id;
      dispatch({ type: "ADD", toast: { id, message, type } });
      setTimeout(() => dispatch({ type: "REMOVE", id }), duration);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon
              name={
                t.type === "success"
                  ? "check-circle"
                  : t.type === "error"
                  ? "alert"
                  : "alert"
              }
              size={16}
            />
            <span>{t.message}</span>
            <button
              className="toast-close"
              onClick={() => dispatch({ type: "REMOVE", id: t.id })}
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
