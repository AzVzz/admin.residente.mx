import { urlApi } from "./url.js";

/**
 * Obtiene el listado de citas de ventas B2B (para el panel de superadmin).
 * Requiere token de vendedor/residente. El backend devuelve todas las citas
 * ordenadas por fecha de la cita.
 *
 * @param {string} token - JWT del vendedor/residente (Bearer).
 * @param {boolean} [soloRealizadas=false] - Si true, devuelve SOLO las citas realizadas; si false, solo las activas.
 * @returns {Promise<Array>} - Array de citas ({ id, nombre, fecha_cita, ... }).
 */
export const citasB2bGet = async (token, soloRealizadas = false) => {
  const query = soloRealizadas ? "?solo_realizadas=true" : "";
  const response = await fetch(`${urlApi}api/b2b/citas${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }
  return Array.isArray(data) ? data : [];
};
