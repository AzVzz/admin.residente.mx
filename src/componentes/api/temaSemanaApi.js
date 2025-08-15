import { urlApi } from "./url";

// Obtener la pregunta más reciente de la semana
export const getPreguntaActual = async () => {
  const res = await fetch(`${urlApi}api/preguntas-tema-semanas/ultimo`);
  if (!res.ok) throw new Error("No se pudo obtener la pregunta actual");
  return await res.json();
};

// Obtener IDs y nombres de todos los consejeros
export const getConsejerosNombres = async () => {
  const res = await fetch(`${urlApi}api/consejeros/nombres`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de consejeros");
  return await res.json();
};

// Registrar respuesta de consejero
export const postRespuestaSemana = async (data) => {
  const res = await fetch(`${urlApi}api/respuestas-tema-semanas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("No se pudo registrar la respuesta");
  return await res.json();
};
