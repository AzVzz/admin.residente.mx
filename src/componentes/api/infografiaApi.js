import axios from 'axios';
import { urlApi, imgApi } from '../../componentes/api/url.js'

const BASE_URL = `${urlApi}api/infografias`;

// Obtener todas las infografías
export const getInfografias = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

// Obtener la última infografía
export const getUltimaInfografia = async () => {
  const res = await axios.get(`${BASE_URL}/ultima`);
  return res.data;
};

// Crear una nueva infografía (imagen y PDF)
export const crearInfografia = async (formData) => {
  const res = await axios.post(BASE_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

// Actualizar una infografía por ID
export const actualizarInfografia = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

// Eliminar una infografía por ID
export const borrarInfografia = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};