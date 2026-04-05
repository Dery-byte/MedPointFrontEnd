import axios from "axios";
import devAuthService from "./devAuthService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const devApi = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

devApi.interceptors.request.use((config) => {
  const session = devAuthService.getSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

export default devApi;
