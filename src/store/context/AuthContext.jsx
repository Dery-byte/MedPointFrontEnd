import { createContext, useContext, useReducer, useEffect } from "react";
import CustomerAuthService from "../services/customerAuthService";

const AuthContext = createContext(null);

const initialState = {
  customer: CustomerAuthService.getStoredCustomer(),
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.value, error: null };
    case "SET_ERROR":
      return { ...state, loading: false, error: action.message };
    case "LOGIN_SUCCESS":
      return { ...state, loading: false, error: null, customer: action.customer };
    case "LOGOUT":
      return { ...state, customer: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Listen for 401 auto-logout events
  useEffect(() => {
    const handler = () => dispatch({ type: "LOGOUT" });
    window.addEventListener("store-logout", handler);
    return () => window.removeEventListener("store-logout", handler);
  }, []);

  const login = async ({ email, password }) => {
    dispatch({ type: "SET_LOADING", value: true });
    try {
      const customer = await CustomerAuthService.login({ email, password });
      dispatch({ type: "LOGIN_SUCCESS", customer });
      return customer;
    } catch (err) {
      dispatch({ type: "SET_ERROR", message: err.message });
      throw err;
    }
  };

  const register = async ({ name, email, phone, password }) => {
    dispatch({ type: "SET_LOADING", value: true });
    try {
      const customer = await CustomerAuthService.register({ name, email, phone, password });
      dispatch({ type: "LOGIN_SUCCESS", customer });
      return customer;
    } catch (err) {
      dispatch({ type: "SET_ERROR", message: err.message });
      throw err;
    }
  };

  const logout = () => {
    CustomerAuthService.logout();
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  return (
    <AuthContext.Provider value={{ state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
