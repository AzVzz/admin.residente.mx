import { urlApi } from "./url";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export const clienteMediaMe = async (token) => {
  const res = await fetch(`${urlApi}api/cliente-media/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al cargar dashboard");
  }
  return res.json();
};

export const clienteMediaList = async (token) => {
  const res = await fetch(`${urlApi}api/cliente-media`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al listar clientes media");
  return res.json();
};

export const clienteMediaCreate = async (token, body) => {
  const res = await fetch(`${urlApi}api/cliente-media`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al crear cliente media");
  }
  return res.json();
};

export const clienteMediaUpdate = async (token, id, body) => {
  const res = await fetch(`${urlApi}api/cliente-media/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al actualizar cliente media");
  }
  return res.json();
};

export const clienteMediaCreateBanner = async (token, body) => {
  const res = await fetch(`${urlApi}api/cliente-media/me/banners`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al crear banner");
  }
  return res.json();
};

export const clienteMediaUpdateBanner = async (token, id, body) => {
  const res = await fetch(`${urlApi}api/cliente-media/me/banners/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al actualizar banner");
  }
  return res.json();
};
