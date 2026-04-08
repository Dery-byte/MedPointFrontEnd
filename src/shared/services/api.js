import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const API_BASE = import.meta.env.VITE_API_URL || "https://medpointbackend-k6k3.onrender.com/api";




const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear session and redirect to login — but ONLY when an active
// session token existed. A 401 with no token is just a failed login attempt
// or an unauthenticated background request; reloading there would prevent
// the offline fallback from running and trap the user in a reload loop.
// Boot-phase requests are additionally marked _skipAuthCheck to be safe.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?._skipAuthCheck) {
      if (localStorage.getItem("authToken")) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        window.location.reload(); // kicks back to AuthScreen (me: null)
      }
    }
    return Promise.reject(error);
  }
);

export default api;