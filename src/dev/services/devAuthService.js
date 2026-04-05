import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const TOKEN_KEY = "devSessionToken";
const USER_KEY  = "devSessionUser";

const devAuthService = {
  /** POST /dev/auth/request — send OTP to developer email */
  async requestToken(email) {
    const { data } = await axios.post(`${API_BASE}/dev/auth/request`, { email });
    return data; // { message, devModeToken? }
  },

  /** POST /dev/auth/verify — verify OTP, receive JWT */
  async verifyToken(email, token) {
    const { data } = await axios.post(`${API_BASE}/dev/auth/verify`, { email, token });
    return data; // { token, name, email }
  },

  /** Persist the dev session for the current browser session */
  storeSession(token, user) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /** Returns { token, user } or null */
  getSession() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const user = JSON.parse(sessionStorage.getItem(USER_KEY) ?? "null");
      return { token, user };
    } catch {
      return { token, user: null };
    }
  },

  clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};

export default devAuthService;
