import axios from "axios";
import { urlApi } from "./url.js";

// Cliente API para la sección COMUNIDAD (nombre + foto) administrable.
// GET es público; crear/editar/eliminar requieren el token del admin.
const BASE_URL = `${urlApi}api/comunidad-autores`;

// Lista de autores de comunidad (nombre + tag + foto absoluta + activo + orden)
export const getComunidadAutores = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

// Crear (formData: nombre, tag, foto, activo, orden)
export const crearComunidadAutor = async (formData, token) => {
  const res = await axios.post(BASE_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Editar por ID (formData con los campos a cambiar; foto opcional)
export const editarComunidadAutor = async (id, formData, token) => {
  const res = await axios.put(`${BASE_URL}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Eliminar por ID
export const eliminarComunidadAutor = async (id, token) => {
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
