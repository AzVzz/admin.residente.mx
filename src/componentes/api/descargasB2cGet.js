import { urlApi } from "./url.js";

/**
 * Obtiene el reporte de descargas/compras B2C guardadas en DB.
 * @param {string} token
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

/**
 * Lista redenciones del cupón B2C directo desde Stripe (p.ej. TRABAJO).
 * @param {string} token
 * @param {string} [promo="TRABAJO"]
 */
export const redencionesPromoB2cGet = async (token, promo = "TRABAJO") => {
  const q = new URLSearchParams({
    promo: promo || "TRABAJO",
    include_zero: "1",
  });
  const response = await fetch(
    `${urlApi}api/tienda-b2c/redenciones-promo?${q.toString()}`,
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

  return {
    total: data.total ?? (Array.isArray(data.data) ? data.data.length : 0),
    promo: data.promo || promo,
    data: Array.isArray(data.data) ? data.data : [],
  };
};
