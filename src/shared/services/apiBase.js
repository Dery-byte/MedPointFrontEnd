/**
 * Single source of truth for the backend base URL.
 * Set VITE_API_URL in your .env to switch environments.
 * Example: VITE_API_URL=http://localhost:8080/api
 */
export const API_BASE =
  import.meta.env.VITE_API_URL || "https://medpointbackend-k6k3.onrender.com/api";
    //  import.meta.env.VITE_API_URL || "http://localhost:8080/api";
