import { urlApi } from "./url.js";

const BENEFICIOS_VALIDOS = [
  "estudios_mercado",
  "revista_residente",
  "nota_publicitaria",
  "giveaway",
  "suscripcion_extra",
];

/**
 * Actualiza flags de beneficios de un usuario B2B (solo admin residente).
 * @param {string} token
 * @param {number} b2bId - id en usuarios_b2b
 * @param {Record<string, boolean>} flags - ej: { suscripcion_extra: true }
 */
export const actualizarBeneficiosB2B = async (token, b2bId, flags) => {
  const body = {};
  for (const key of BENEFICIOS_VALIDOS) {
    if (Object.prototype.hasOwnProperty.call(flags, key)) {
      body[key] = !!flags[key];
    }
  }

  const res = await fetch(`${urlApi}api/usuariosb2b/${b2bId}/beneficios`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error HTTP: ${res.status}`);
  }

  return res.json();
};
