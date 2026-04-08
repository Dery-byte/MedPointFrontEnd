import { API_BASE } from "./apiBase";

export const getImageUrl = (path) => {
  if (!path) return null;
  // already absolute URL
  if (path.startsWith("http")) return path;

  // ensure leading slash exists
  if (!path.startsWith("/")) path = "/" + path;

  return `${API_BASE}${path}`;
};