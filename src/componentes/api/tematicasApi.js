import { urlApi } from "./url.js";

export const tematicasGet = async (token) => {
  const res = await fetch(`${urlApi}api/tematicas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
  return res.json();
};

export const tematicaGetById = async (id, token) => {
  const res = await fetch(`${urlApi}api/tematicas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
  return res.json();
};

export const tematicaCrear = async (data, token) => {
  const res = await fetch(`${urlApi}api/tematicas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `Error HTTP: ${res.status}`);
  }
  return res.json();
};

export const tematicaEditar = async (id, data, token) => {
  const res = await fetch(`${urlApi}api/tematicas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `Error HTTP: ${res.status}`);
  }
  return res.json();
};

export const tematicaBorrar = async (id, token) => {
  const res = await fetch(`${urlApi}api/tematicas/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
  return res.json();
};
