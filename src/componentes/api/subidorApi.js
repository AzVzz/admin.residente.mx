import { urlApi } from "./url";

// =============================================================================
// SUBIDOR GENERAL API
// Endpoints en el monolito: /api/subidor (montado en routes/index.js).
// Las fotos viven en /fotos/fotos-estaticas/dashboard del servidor.
// =============================================================================

// Sube una foto. preferida = { width, height } px de la version grande.
export const subidorUpload = async (token, file, { width = 680, height = 418 } = {}) => {
  const formData = new FormData();
  formData.append("imagen", file);
  formData.append("width", String(width));
  formData.append("height", String(height));

  const res = await fetch(`${urlApi}api/subidor/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al subir la foto");
  }
  return await res.json();
};

// Lista las fotos (mas nuevas primero).
export const subidorList = async (token) => {
  const res = await fetch(`${urlApi}api/subidor/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener las fotos");
  return await res.json();
};

// Borra una foto (sus 3 variantes) por su "base".
export const subidorDelete = async (token, base) => {
  const res = await fetch(`${urlApi}api/subidor/${base}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al borrar la foto");
  return await res.json();
};
