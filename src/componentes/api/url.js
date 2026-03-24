// Base de la API (siempre termina en /).
// Ejemplos: https://admin.residente.mx/ | http://localhost:3000/ (gateway Docker) | http://localhost:3006/ (solo eventos)
// NO uses localhost:4321 (Astro) como API salvo que reenvíes /api/eventos al backend.
// Ver .env.example en la raíz del proyecto admin.
export const urlApi =
  import.meta.env.VITE_API_URL || "https://admin.residente.mx/";
export const imgApi = import.meta.env.VITE_IMG_URL || "https://residente.mx/";
