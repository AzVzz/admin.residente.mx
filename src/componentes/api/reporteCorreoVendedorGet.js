import { urlApi } from "./url.js";

/**
 * Vista previa del correo anticipado al vendedor (diseño dashboard B2B).
 */
export const reporteCorreoVendedorGet = async (token, b2bId, periodo) => {
  const qs = periodo ? `?periodo=${periodo}` : "";
  const response = await fetch(
    `${urlApi}api/newsletter/reportes/preview/${b2bId}/html-vendedor${qs}`,
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
