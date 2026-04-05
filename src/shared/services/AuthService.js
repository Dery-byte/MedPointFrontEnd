import api from "./api";

/**
 * Maps the backend response to the shape AppContext expects.
 * Backend:  { token, tokenType, id, name, email, role, accessModules, manageModules, active }
 * App:      { id, name, email, role (lowercase), modules (lowercase[]), manageModules (lowercase[]), active, token }
 */
function mapUser(data) {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role.toLowerCase(),                         // "SUPERADMIN" → "superadmin"
    modules: data.accessModules.map((m) => m.toLowerCase()), // ["MART"] → ["mart"]
    manageModules: data.manageModules.map((m) => m.toLowerCase()),
    active: data.active,
    token: data.token,
  };
}

const AuthService = {
  /**
   * Login — calls POST /auth/login, persists token + user, returns mapped user.
   * Throws an Error with a user-friendly message on failure.
   */
  async login(email, password) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      // Persist for page refresh / guard checks
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data));

      return mapUser(data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401 ? "Invalid email or password." : "Server error. Please try again.");
      throw new Error(msg);
    }
  },

  /**
   * Logout — clears storage. Call dispatch({ type: "LOGOUT" }) after this.
   */
  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  },

  /**
   * Returns the persisted user (from localStorage) if a valid session exists,
   * or null if not. Use this on app boot to restore session.
   */
  getStoredUser() {
    try {
      const raw = localStorage.getItem("authUser");
      const token = localStorage.getItem("authToken");
      if (!raw || !token) return null;
      return mapUser(JSON.parse(raw));
    } catch {
      return null;
    }
  },

  /**
   * Returns true if a token is currently stored (i.e. user is considered logged in).
   */
  isAuthenticated() {
    return !!localStorage.getItem("authToken");
  },
};

export default AuthService;