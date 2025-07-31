import { urlApi } from './url';

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
  return await res.json();
};

export const revistaGetUltima = async () => {
  const res = await fetch(`${urlApi}api/revistas`);
  if (!res.ok) throw new Error("Error al obtener revistas");
  const revistas = await res.json();
  // Ordena por fecha descendente y toma la primera
  revistas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return revistas[0];
};