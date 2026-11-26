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

function normalizarLista(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.proveedores)) return payload.proveedores;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export async function proveedoresListar(token, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    )
  ).toString();

  let adminRows = [];
  let adminError = null;
  try {
    const res = await fetch(`${BASE}/todas${qs ? `?${qs}` : ""}`, {
      headers: authHeaders(token),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      adminError = body.error || body.details || "Error al listar proveedores";
    } else {
      adminRows = normalizarLista(body);
    }
  } catch (e) {
    adminError = e.message || "Error al listar proveedores";
  }

  // Si /todas viene vacío o falla (p. ej. filtro viejo por usuario_id en prod),
  // completar con publicados de /activos para no perder micrositios editables.
  if (adminRows.length === 0) {
    try {
      const activos = await proveedoresActivos(params.categoria);
      const publicados = normalizarLista(activos);
      const q = String(params.q || "")
        .trim()
        .toLowerCase();
      const filtrados = q
        ? publicados.filter((p) => {
            const haystack = [p.nombre_comercial, p.municipio, p.slug]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return haystack.includes(q);
          })
        : publicados;
      if (filtrados.length > 0) {
        return { proveedores: filtrados, total: filtrados.length, fuente: "activos" };
      }
    } catch {
      /* si activos también falla, devolvemos admin */
    }
  }

  if (adminRows.length === 0 && adminError) {
    throw new Error(adminError);
  }

  return { proveedores: adminRows, total: adminRows.length, fuente: "todas" };
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
