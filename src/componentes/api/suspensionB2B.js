import { urlApi } from "./url.js";

// ─────────────────────────────────────────────────────────────────────────────
// Suspensión / reactivación temporal de clientes B2B.
//
// Suspender OCULTA todo el contenido del cliente (restaurante, cupones, notas) y
// bloquea su cuenta, pero NO toca Stripe: la suscripción sigue activa y se le sigue
// cobrando normal hasta que pague (no se cancela → sin penalización del año).
// Reactivar restaura EXACTAMENTE lo que estaba visible antes.
// La lógica de contenido es transaccional en el backend (un solo endpoint).
// ─────────────────────────────────────────────────────────────────────────────

const jsonHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// Suspende al cliente. userId = usuarios_residente.id
export const suspenderB2B = async (token, userId, { motivo = null } = {}) => {
  const res = await fetch(`${urlApi}api/usuariosb2b/suspender/${userId}`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify({ motivo }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Error al suspender al cliente B2B");
  }
  return data;
};

// Reactiva al cliente. userId = usuarios_residente.id
export const reactivarB2B = async (token, userId) => {
  const res = await fetch(`${urlApi}api/usuariosb2b/reactivar/${userId}`, {
    method: "PUT",
    headers: jsonHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Error al reactivar al cliente B2B");
  }
  return data;
};
