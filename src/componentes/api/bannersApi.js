import { urlApi } from "./url";

// =============================================================================
// BANNERS API
// =============================================================================

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// --- Banners CRUD ---

export const bannersGet = async (token, { tipo, estatus, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams();
  if (tipo) params.set("tipo", tipo);
  if (estatus) params.set("estatus", estatus);
  params.set("page", page);
  params.set("limit", limit);

  const res = await fetch(`${urlApi}api/banners?${params}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener banners");
  return await res.json();
};

export const bannerGetById = async (token, id) => {
  const res = await fetch(`${urlApi}api/banners/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener banner");
  return await res.json();
};

export const bannerCreate = async (token, formData) => {
  const res = await fetch(`${urlApi}api/banners`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Error al crear banner");
  return await res.json();
};

export const bannerUpdate = async (token, id, formData) => {
  const res = await fetch(`${urlApi}api/banners/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Error al actualizar banner");
  return await res.json();
};

export const bannerDelete = async (token, id) => {
  const res = await fetch(`${urlApi}api/banners/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar banner");
};

export const bannerGetNotasAsignadas = async (token, id) => {
  const res = await fetch(`${urlApi}api/banners/${id}/notas-asignadas`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener notas asignadas");
  return await res.json();
};

export const bannerAsignarNotas = async (token, id, body) => {
  const res = await fetch(`${urlApi}api/banners/${id}/asignar-notas`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al asignar notas");
  return await res.json();
};

export const bannerClearNotas = async (token, id) => {
  const res = await fetch(`${urlApi}api/banners/${id}/notas`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al limpiar notas");
  return await res.json();
};

export const bannerGetStats = async (token, id) => {
  const res = await fetch(`${urlApi}api/banners/${id}/stats`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener estadisticas");
  return await res.json();
};

// --- Slots ---

export const slotsGet = async (token, { pagina, dispositivo } = {}) => {
  const params = new URLSearchParams();
  if (pagina) params.set("pagina", pagina);
  if (dispositivo) params.set("dispositivo", dispositivo);

  const res = await fetch(`${urlApi}api/banner-slots?${params}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener slots");
  return await res.json();
};

export const slotCreate = async (token, data) => {
  const res = await fetch(`${urlApi}api/banner-slots`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear slot");
  return await res.json();
};

export const slotUpdate = async (token, id, data) => {
  const res = await fetch(`${urlApi}api/banner-slots/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar slot");
  return await res.json();
};

export const slotAssignBanner = async (token, slotId, bannerId, orden = 0) => {
  const res = await fetch(`${urlApi}api/banner-slots/${slotId}/assign`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ banner_id: bannerId, orden }),
  });
  if (!res.ok) throw new Error("Error al asignar banner");
  return await res.json();
};

export const slotUnassignBanner = async (token, slotId, bannerId) => {
  const res = await fetch(`${urlApi}api/banner-slots/${slotId}/assign/${bannerId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al desasignar banner");
};

export const slotGetBanners = async (token, slotId) => {
  const res = await fetch(`${urlApi}api/banner-slots/${slotId}/banners`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener banners del slot");
  return await res.json();
};

// --- Paquetes ---

export const paquetesGet = async (token) => {
  const res = await fetch(`${urlApi}api/banner-paquetes`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener paquetes");
  return await res.json();
};

export const paqueteCreate = async (token, data) => {
  const res = await fetch(`${urlApi}api/banner-paquetes`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear paquete");
  return await res.json();
};

export const paqueteUpdate = async (token, id, data) => {
  const res = await fetch(`${urlApi}api/banner-paquetes/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar paquete");
  return await res.json();
};

export const paqueteDelete = async (token, id) => {
  const res = await fetch(`${urlApi}api/banner-paquetes/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar paquete");
  return await res.json();
};

// --- Stripe Banners (compra publica) ---

export const stripeBannersConfig = async () => {
  const res = await fetch(`${urlApi}api/stripe-banners/config`);
  if (!res.ok) throw new Error("Error al obtener config de banners");
  return await res.json();
};

export const stripeBannersCreateCheckout = async (body) => {
  const res = await fetch(`${urlApi}api/stripe-banners/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear checkout");
  }
  return await res.json();
};

export const stripeBannersCreateCheckoutSlot = async (body) => {
  const res = await fetch(`${urlApi}api/stripe-banners/create-checkout-session-slot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear checkout de slot");
  }
  return await res.json();
};

export const bannerPublicCrear = async (formData) => {
  const res = await fetch(`${urlApi}api/banners/public/crear`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear banner");
  }
  return await res.json();
};

// --- Compras ---

export const comprasGet = async (token, { estatus } = {}) => {
  const params = new URLSearchParams();
  if (estatus) params.set("estatus", estatus);

  const res = await fetch(`${urlApi}api/banner-compras?${params}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener compras");
  return await res.json();
};

export const compraCreate = async (token, data) => {
  const res = await fetch(`${urlApi}api/banner-compras`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear compra");
  return await res.json();
};

export const compraUpdate = async (token, id, data) => {
  const res = await fetch(`${urlApi}api/banner-compras/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar compra");
  return await res.json();
};

export const compraAsignarNotas = async (token, compraId, body) => {
  const res = await fetch(`${urlApi}api/banner-compras/${compraId}/asignar-notas`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error al asignar notas");
  return await res.json();
};

export const compraGetNotas = async (token, compraId) => {
  const res = await fetch(`${urlApi}api/banner-compras/${compraId}/notas`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener notas de compra");
  return await res.json();
};

export const notasDisponiblesCount = async (token, compraId) => {
  const params = compraId ? `?compra_id=${compraId}` : "";
  const res = await fetch(`${urlApi}api/banner-compras/notas-disponibles${params}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener conteo de notas");
  return await res.json();
};
