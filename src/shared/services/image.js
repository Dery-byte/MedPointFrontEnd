// // utils/image.js
// export const getImageUrl = (path) => {
//   const BASE = "http://localhost:8080/api";
//   if (!path) return null;
//   return `${BASE}${path.replace(/^\/+/, "")}`;
// };


// utils/image.js

const BASE = "http://localhost:8080/api";
export const getImageUrl = (path) => {
  if (!path) return null;
  // already absolute URL
  if (path.startsWith("http")) return path;

  // ensure leading slash exists
  if (!path.startsWith("/")) path = "/" + path;

  return `${BASE}${path}`;
};