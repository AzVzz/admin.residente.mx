import { urlApi } from "./url.js";

/**
 * Envía una entrevista desde el formulario público "Centro de Entrevistas"
 * (sin login). Entra como BORRADOR con tipo_nota2="centro-entrevistas".
 *
 * @param {Object} d
 * @param {string} d.dejarTodo
 * @param {string} d.dejasteAtras
 * @param {string} d.casiNoLogras
 * @param {string} d.mentorSenal
 * @param {string} d.sabesHoy
 * @param {string} d.genteSienta
 * @param {string} d.favoritos
 * @returns {Promise<object>}
 */
export const centroEntrevistasEnviar = async ({
  dejarTodo,
  dejasteAtras,
  casiNoLogras,
  mentorSenal,
  sabesHoy,
  genteSienta,
  favoritos,
}) => {
  const response = await fetch(`${urlApi}api/notas/centro-entrevistas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dejar_todo: dejarTodo,
      dejaste_atras: dejasteAtras,
      casi_no_logras: casiNoLogras,
      mentor_senal: mentorSenal,
      sabes_hoy: sabesHoy,
      gente_sienta: genteSienta,
      favoritos,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }
  return data;
};
