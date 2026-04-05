import api from "./storeApi";

/**
 * Maps backend customer response to frontend shape.
 * Expects: { token, id, name, email, phone }
 */
function mapCustomer(data) {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? "",
    token: data.token,
  };
}

const CustomerAuthService = {
  /**
   * Register a new storefront customer.
   * POST /customers/register
   * Body: { name, email, phone, password }
   */
  async register({ name, email, phone, password }) {
    try {
      const { data } = await api.post("/customers/register", {
        name,
        email,
        phone,
        password,
      });
      localStorage.setItem("storeToken", data.token);
      localStorage.setItem("storeCustomer", JSON.stringify(data));
      return mapCustomer(data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? "An account with this email already exists."
          : "Registration failed. Please try again.");
      throw new Error(msg);
    }
  },

  /**
   * Login an existing storefront customer.
   * POST /customers/login
   * Body: { email, password }
   */
  async login({ email, password }) {
    try {
      const { data } = await api.post("/customers/login", { email, password });
      localStorage.setItem("storeToken", data.token);
      localStorage.setItem("storeCustomer", JSON.stringify(data));
      return mapCustomer(data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? "Invalid email or password."
          : "Login failed. Please try again.");
      throw new Error(msg);
    }
  },

  /** Clear customer session */
  logout() {
    localStorage.removeItem("storeToken");
    localStorage.removeItem("storeCustomer");
  },

  /** Restore session on page reload */
  getStoredCustomer() {
    try {
      const raw = localStorage.getItem("storeCustomer");
      const token = localStorage.getItem("storeToken");
      if (!raw || !token) return null;
      return mapCustomer(JSON.parse(raw));
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem("storeToken");
  },
};

export default CustomerAuthService;
