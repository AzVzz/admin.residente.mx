import { urlApi } from "./url.js";

/**
 * Agenda una cita de ventas B2B desde la tarjeta de plan (SelectorPlanesB2B).
 * La cita solo puede caer dentro de los próximos 7 días (validado también en el
 * servidor). El backend calcula la fecha de activación de beneficios (primer
 * viernes ≥ fecha de la cita, 12pm hora de México) y guarda el registro.
 *
 * @param {string} token                  - JWT del vendedor/residente (Bearer).
 * @param {Object} d
 * @param {string} d.nombre               - Nombre del cliente/restaurante (obligatorio).
 * @param {string} d.fechaCita            - Fecha/hora de la cita en ISO (obligatorio).
 * @param {string} [d.priceId]            - Price ID de Stripe del plan elegido.
 * @param {number} [d.meses]              - Meses de la membresía (6/9/12).
 * @param {number} [d.clienteEditorialId] - Id del cliente de la lista (caso A).
 * @param {string} [d.correo]             - Correo de contacto (opcional).
 * @param {string} [d.telefono]           - Teléfono de contacto (opcional).
 * @returns {Promise<object>} - Respuesta del backend ({ ...cita }).
 */
export const citaB2bPost = async (
  token,
  { nombre, fechaCita, priceId, meses, clienteEditorialId, correo, telefono, beneficios, monto, grupo },
) => {
  const response = await fetch(`${urlApi}api/b2b/citas`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre,
      fecha_cita: fechaCita,
      price_id: priceId,
      plan_meses: meses,
      cliente_editorial_id: clienteEditorialId,
      correo,
      telefono,
      beneficios,
      monto,
      grupo,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Error HTTP: ${response.status}`);
  }
  return data;
};
