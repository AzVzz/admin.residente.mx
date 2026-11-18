import { urlApi } from "./url";

/**
 * Borra el perfil del usuario autenticado (DELETE /api/usuarios/me).
 * Si es B2B con suscripción, puede devolver requiresPayment + invoiceUrl (402).
 */
export async function borrarPerfil(token) {
  const response = await fetch(`${urlApi}api/usuarios/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => ({
    success: false,
    error: "Error al borrar el perfil",
  }));

  if (!response.ok) {
    const err = new Error(data.error || "Error al borrar el perfil");
    err.data = data;
    err.status = response.status;
    throw err;
  }

  return data;
}
