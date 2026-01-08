import { urlApi, imgApi } from './url';

// =============================================================================
// CACHÉ PARA REVISTAS - TTL 15 minutos
// =============================================================================
let revistaUltimaCache = null;
let revistaCacheTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutos

export const clearRevistaCache = () => {
  revistaUltimaCache = null;
  revistaCacheTime = 0;
};

// =============================================================================
// FUNCIONES DE API
// =============================================================================

export const revistasGetById = async (id) => {
  const res = await fetch(`${urlApi}api/revistas/${id}`);
  if (!res.ok) throw new Error("Error al obtener revista");
  return await res.json();
};

export const revistasPut = async (id, form) => {
  const formData = new FormData();
  formData.append("titulo", form.titulo);
  formData.append("descripcion", form.descripcion);
  if (form.imagen_portada) formData.append("imagen_portada", form.imagen_portada);
  if (form.imagen_banner) formData.append("imagen_banner", form.imagen_banner);
  if (form.pdf) formData.append("pdf", form.pdf);

  const res = await fetch(`${urlApi}api/revistas/${id}`, {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al actualizar revista");
  // Limpiar caché después de actualizar
  clearRevistaCache();
  return await res.json();
};

export const revistasPost = async (form) => {
  const formData = new FormData();
  formData.append("titulo", form.titulo);
  formData.append("descripcion", form.descripcion);
  if (form.imagen_portada) formData.append("imagen_portada", form.imagen_portada);
  if (form.imagen_banner) formData.append("imagen_banner", form.imagen_banner);
  if (form.pdf) formData.append("pdf", form.pdf);

  const res = await fetch(`${urlApi}api/revistas`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al crear revista");
  // Limpiar caché después de crear
  clearRevistaCache();
  return await res.json();
};

export const revistaGetUltima = async () => {
  // Retornar caché si es válido
  if (revistaUltimaCache && Date.now() - revistaCacheTime < CACHE_TTL) {
    return revistaUltimaCache;
  }

  const res = await fetch(`${urlApi}api/revistas/ultima`);
  if (!res.ok) throw new Error("Error al obtener la última revista");
  const data = await res.json();

  // Guardar en caché
  revistaUltimaCache = data;
  revistaCacheTime = Date.now();

  return data;
};