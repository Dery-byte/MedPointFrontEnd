import axios from "axios";
import { API_BASE } from "../../shared/services/apiBase";


const storeApi = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach customer token (separate key from POS staff token "authToken")
storeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("storeToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear customer session only
storeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("storeToken");
      localStorage.removeItem("storeCustomer");
      window.dispatchEvent(new Event("store-logout"));
    }
    return Promise.reject(error);
  }
);

export default storeApi;
