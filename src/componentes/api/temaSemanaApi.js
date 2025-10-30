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
  const formData = new FormData();
  formData.append("id_consejero", data.id_consejero);
  formData.append("pregunta", data.pregunta);
  formData.append("respuesta_colaboracion", data.respuesta_colaboracion);
  formData.append("titulo", data.titulo);
  if (data.imagen) formData.append("imagen", data.imagen);
  formData.append("respuesta_consejo", data.respuesta_consejo ? 1 : 0);
  formData.append("texto_consejo", data.texto_consejo || "");

  const res = await fetch(`${urlApi}api/respuestas-tema-semanas`, {
    method: "POST",
    body: formData
    // No pongas headers, fetch los pone automáticamente para FormData
  });
  if (!res.ok) throw new Error("No se pudo registrar la respuesta");
  return await res.json();
};

export const getColaboradores = async () => {
  const res = await fetch(`${urlApi}api/consejeros`);
  if (!res.ok) throw new Error("No se pudo obtener la lista de colaboradores");
  return await res.json();
};

export const getRespuestasPorColaborador = async (id_consejero) => {
  const res = await fetch(`${urlApi}api/respuestas-tema-semanas?colaborador=${id_consejero}`);
  if (!res.ok) throw new Error("No se pudo obtener las colaboraciones");
  return await res.json();
};
