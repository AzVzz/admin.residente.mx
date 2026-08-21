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
 * @param {File}   [d.imagen] — foto opcional
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
  imagen,
}) => {
  const formData = new FormData();
  formData.append("dejar_todo", dejarTodo);
  formData.append("dejaste_atras", dejasteAtras);
  formData.append("casi_no_logras", casiNoLogras);
  formData.append("mentor_senal", mentorSenal);
  formData.append("sabes_hoy", sabesHoy);
  formData.append("gente_sienta", genteSienta);
  formData.append("favoritos", favoritos);
  if (imagen) formData.append("imagen", imagen);

  const response = await fetch(`${urlApi}api/notas/centro-entrevistas`, {
    method: "POST",
    // Sin Content-Type: el navegador arma el boundary de multipart.
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }
  return data;
};
