import { urlApi } from "./url.js";

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

export async function eventoColaboradorGet(id) {
  const response = await fetch(`${urlApi}api/eventos-colaboradores/${id}`);
  if (!response.ok) throw new Error("Error al obtener el evento");
  return await response.json();
}
