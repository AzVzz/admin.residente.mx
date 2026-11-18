import { urlApi, imgApi } from "./url.js";

export async function eventosColaboradoresGetTodas(token, { sortBy, sortOrder, estado, page, limit } = {}) {
  const params = new URLSearchParams();
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);
  if (estado) params.append("estado", estado);
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  const response = await fetch(`${urlApi}api/eventos-colaboradores/todas?${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Error al obtener los eventos");
  return await response.json();
}

// Rutas relativas (/fotos-vivir-convivir/...): se sirven en el sitio público
// (imgApi = https://residente.mx/), no en la API (urlApi = admin).
export function urlImagenEvento(ruta) {
  if (!ruta) return null;
  if (/^https?:\/\//i.test(ruta) || ruta.startsWith("data:") || ruta.startsWith("blob:")) return ruta;
  return `${imgApi}${ruta.replace(/^\//, "")}`;
}

// Sube una foto (multipart, igual que el Subidor). El backend la convierte a AVIF
// y devuelve { imagen_url, imagen_miniatura_url, bytes, bytes_original }.
export async function eventoColaboradorSubirImagen(file, token) {
  // Solo File/Blob reales: un string/URL haría Multer fallar y dejaría preview roto.
  if (!(file instanceof Blob)) {
    throw new Error("La imagen debe ser un archivo válido");
  }
  const formData = new FormData();
  formData.append("imagen", file);
  const response = await fetch(`${urlApi}api/eventos-colaboradores/imagen`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al subir la imagen");
  }
  const data = await response.json();
  if (!data?.imagen_url) {
    throw new Error("La API no devolvió la URL de la imagen subida");
  }
  return data;
}

export async function eventoColaboradorCrear(data, token) {
  const response = await fetch(`${urlApi}api/eventos-colaboradores`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al crear el evento");
  }
  return await response.json();
}

export async function eventoColaboradorEditar(id, data, token) {
  const response = await fetch(`${urlApi}api/eventos-colaboradores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al actualizar el evento");
  }
  return await response.json();
}

export async function eventoColaboradorBorrar(id, token) {
  const response = await fetch(`${urlApi}api/eventos-colaboradores/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Error al borrar el evento");
  return await response.json();
}

export async function eventoColaboradorGet(id, token) {
  const response = await fetch(`${urlApi}api/eventos-colaboradores/admin/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) throw new Error("Error al obtener el evento");
  return await response.json();
}
