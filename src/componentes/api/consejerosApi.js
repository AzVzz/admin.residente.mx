//src/componentes/api/consejerosApi.js
import { urlApi } from './url.js';

// Obtener todos los registros
export const consejerosGet = async () => {
  const res = await fetch(`${urlApi}api/consejeros`);
  if (!res.ok) throw new Error("Error al obtener consejeros");
  return await res.json();
};

// Crear nuevo registro (con foto)
export const consejerosPost = async (form) => {
  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    formData.append(key, value);
  });
  if (form.fotografia) formData.append("fotografia", form.fotografia);

  const res = await fetch(`${urlApi}api/consejeros`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al crear registro");
  return await res.json();
};