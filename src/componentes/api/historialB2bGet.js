import { urlApi } from "./url.js";

/**
 * Obtiene el historial de un cliente B2B (panel superadmin): fecha de inscripción,
 * precio mensual y los pagos reales registrados en Stripe. El frontend arma con
 * esto la línea de tiempo mes a mes.
 *
 * @param {string} token - JWT del residente/superadmin (Bearer).
 * @param {number} b2bId - id del cliente B2B (usuarios_b2b.id).
 * @returns {Promise<Object>} - { b2b_id, nombre, fecha_inscripcion, precio, pagos }.
 */
export const historialB2bGet = async (token, b2bId) => {
  const response = await fetch(
    `${urlApi}api/usuariosb2b/superadmin/metricas-roi/${b2bId}/historial`,
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
