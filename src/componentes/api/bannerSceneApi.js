import { urlApi } from "./url.js";

// Creates a draft banner with optional scene_json; returns { id, slug, edit_token }.
export const bannerSceneCreate = async (formData) => {
  const res = await fetch(`${urlApi}api/banners/public/crear`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status} al crear banner`);
  }
  return res.json();
};

// Loads scene + metadata for re-edit; returns { scene_json (object), nombre, url_destino, imagen_desktop, imagen_mobile }.
export const bannerSceneLoadByToken = async (editToken) => {
  const res = await fetch(`${urlApi}api/banners/public/edit/${encodeURIComponent(editToken)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status} al cargar escena`);
  }
  return res.json();
};

// Updates scene_json + optional re-uploaded images on a borrador by token.
export const bannerSceneUpdateByToken = async (editToken, formData) => {
  const res = await fetch(`${urlApi}api/banners/public/edit/${encodeURIComponent(editToken)}`, {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status} al actualizar escena`);
  }
  return res.json();
};

// Uploads a single asset image for use inside the scene; returns { url }.
export const bannerAssetUpload = async (file) => {
  const form = new FormData();
  form.append("imagen", file);
  const res = await fetch(`${urlApi}api/banners/public/asset-upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status} al subir asset`);
  }
  return res.json();
};
