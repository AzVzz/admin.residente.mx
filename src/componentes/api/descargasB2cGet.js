import { urlApi } from "./url.js";

/**
 * Obtiene el reporte de descargas/compras B2C (Etiqueta Restaurantera).
 * Requiere token de admin (rol residente).
 *
 * @param {string} token
 * @returns {Promise<{ total: number, data: Array }>}
 */
export const descargasB2cGet = async (token) => {
  const response = await fetch(`${urlApi}api/descargas-b2c`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }

  return {
    total: data.total ?? (Array.isArray(data.data) ? data.data.length : 0),
    data: Array.isArray(data.data) ? data.data : [],
  };
};
