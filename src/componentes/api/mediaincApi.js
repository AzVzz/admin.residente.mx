import { urlApi } from "./url.js";

export const mediaincGetTodas = async (token) => {
  const response = await fetch(`${urlApi}api/mediainc/todas`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Error al obtener proyectos");
  return await response.json();
};

export const mediaincGetPublicas = async () => {
  const response = await fetch(`${urlApi}api/mediainc`);
  if (!response.ok) throw new Error("Error al obtener proyectos");
  return await response.json();
};

export const mediaincCrear = async (formData, token) => {
  const response = await fetch(`${urlApi}api/mediainc`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Error al crear proyecto");
  }
  return await response.json();
};

export const mediaincEditar = async (id, formData, token) => {
  const response = await fetch(`${urlApi}api/mediainc/${id}`, {
    method: "PUT",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Error al actualizar proyecto");
  }
  return await response.json();
};

export const mediaincBorrar = async (id, token) => {
  const response = await fetch(`${urlApi}api/mediainc/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Error al borrar proyecto");
  return await response.json();
};
