import { urlApi } from "./url.js";

/**
 * Genera EN VIVO el correo de reporte mensual de un cliente B2B (mismo diseño
 * que se enviaría hoy) y lo devuelve ya renderizado como HTML completo
 * (header + cuerpo + footer). Sirve para previsualizarlo en el admin dentro de
 * un iframe, con las métricas del mes actual actualizadas al momento.
 *
 * @param {string} token - JWT del residente/superadmin (Bearer).
 * @param {number} b2bId - id del cliente B2B (usuarios_b2b.id).
 * @returns {Promise<Object>} - { b2b_id, correo, restaurantes_count, mes, asunto, html }.
 */
export const reporteCorreoGet = async (token, b2bId) => {
  const response = await fetch(
    `${urlApi}api/newsletter/reportes/preview/${b2bId}/html`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }
  return data;
};
