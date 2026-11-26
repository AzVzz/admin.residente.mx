import { urlApi, imgApi } from "./url.js";

const BASE = `${urlApi}api/eventos-proveedores`;

function authHeaders(token, json = true) {
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function mediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("blob:")) return path;
  const clean = String(path).replace(/^\//, "");
  return `${imgApi}${clean}`;
}

export async function proveedoresListar(token, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/todas${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(token),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || body.details || "Error al listar proveedores");
  }
  return body;
}

export async function proveedoresActivos(categoria) {
  const qs = categoria ? `?categoria=${encodeURIComponent(categoria)}` : "";
  const res = await fetch(`${BASE}/activos${qs}`);
  if (!res.ok) throw new Error("Error al obtener proveedores");
  return res.json();
}

export async function proveedorPorSlug(slug, { preview = false } = {}) {
  const qs = preview ? "?preview=1" : "";
  const res = await fetch(`${BASE}/slug/${encodeURIComponent(slug)}${qs}`);
  if (!res.ok) throw new Error("Proveedor no encontrado");
  return res.json();
}

export async function proveedorCrear(token, payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.validationErrors?.join(" | ") || body.error || "Error al crear";
    throw new Error(msg);
  }
  return body;
}

export async function proveedorActualizar(token, idOrSlug, payload) {
  const res = await fetch(`${BASE}/${encodeURIComponent(idOrSlug)}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      body.validationErrors?.join(" | ") || body.error || "Error al actualizar";
    throw new Error(msg);
  }
  return body;
}

export async function proveedorToggleStatus(token, id, status) {
  const res = await fetch(`${BASE}/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      body.validationErrors?.join(" | ") || body.error || "Error al cambiar status";
    throw new Error(msg);
  }
  return body;
}

export async function proveedorEliminar(token, id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar");
  return res.json();
}

export async function proveedorCotizaciones(token, id) {
  const res = await fetch(`${BASE}/${id}/cotizaciones`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener cotizaciones");
  return res.json();
}

export async function enviarCotizacion(idOrSlug, payload) {
  const res = await fetch(
    `${BASE}/${encodeURIComponent(idOrSlug)}/cotizaciones`,
    {
      method: "POST",
      headers: authHeaders(null),
      body: JSON.stringify(payload),
    }
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Error al enviar solicitud");
  return body;
}

export async function proveedorSubirMedia(token, id, formData) {
  const res = await fetch(`${BASE}/${id}/media`, {
    method: "POST",
    headers: authHeaders(token, false),
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir archivos");
  return res.json();
}
