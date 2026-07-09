import { urlApi } from "./url.js";

/**
 * Obtiene las métricas ROI de todos los clientes B2B activos (panel superadmin).
 * Cada fila trae: restaurante, precio pagado (grupo A/B) y el ROI de
 * conversión y fidelización, calculado en el backend con la misma fórmula
 * del dashboard del cliente.
 *
 * @param {string} token - JWT del residente/superadmin (Bearer).
 * @returns {Promise<Array>} - Array de filas de métricas.
 */
export const metricasB2bGet = async (token) => {
  const response = await fetch(`${urlApi}api/usuariosb2b/superadmin/metricas-roi`, {
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
