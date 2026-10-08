import { urlApi } from "./url.js";

/**
 * Cajas disponibles del formulario FISL y a dónde se han enviado.
 * @returns {Promise<{ total: number, usadas: number, disponibles: number,
 *   entregas: { id: number, cantidadCajas: number, domicilio: string, nombreRecibe: string,
 *     fechaEntrega: string }[] }>} - fechaEntrega en formato YYYY-MM-DD.
 */
export const fislInventarioGet = async () => {
  const response = await fetch(`${urlApi}api/fisl`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }
  return data;
};

/**
 * Envía una solicitud de entrega desde el formulario FISL (sin login).
 * El backend la guarda, la resta de las cajas disponibles y la manda por correo.
 * Responde 409 si se piden más cajas de las que quedan.
 *
 * @param {Object} d
 * @param {number} d.cantidadCajas  - Cantidad de cajas (entero > 0).
 * @param {string} d.domicilio      - Domicilio de entrega.
 * @param {string} d.nombreRecibe   - Nombre de la persona que recibe.
 * @param {string} d.fechaEntrega   - Fecha de entrega (YYYY-MM-DD).
 * @param {string} d.horaDesde      - Inicio del horario de entrega (HH:MM).
 * @param {string} d.horaHasta      - Fin del horario de entrega (HH:MM).
 * @param {string} [d.observaciones]
 * @returns {Promise<object>} - Respuesta del backend ({ success, disponibles }).
 */
export const fislEnviar = async (datos) => {
  const response = await fetch(`${urlApi}api/fisl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }
  return data;
};
