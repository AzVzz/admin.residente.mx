import { urlApi } from './url.js';

export async function getNotasUanl() {
  try {
    const res = await fetch(`${urlApi}api/notas/uanl`);
    if (!res.ok) throw new Error("Error al obtener notas UANL");
    return await res.json();
  } catch (error) {
    return [];
  }
}