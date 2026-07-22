import { urlApi } from "./url.js";

// Endpoints del servicio mail para los reportes mensuales de micrositios B2B.
// Todos requieren token con rol `residente` (Bearer).

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

async function parse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error HTTP: ${res.status}`);
  return data;
}

// Lista de clientes B2B con sus datos de suscripción Stripe
// (incluye suscripcion_datos.fecha_fin_periodo_actual = próxima fecha de cobro).
export const listarClientesB2B = async (token) => {
  const res = await fetch(`${urlApi}api/usuariosb2b`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return parse(res);
};

// Resumen de correos ENVIADOS por cliente y tipo de evento (+ último envío).
// Filas: { b2b_id, tipo_evento, total, ultimo_envio }.
export const historialReportes = async (token) => {
  const res = await fetch(`${urlApi}api/newsletter/reportes/historial`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return parse(res);
};

// Detalle de todos los correos enviados a un cliente (últimos 300).
export const historialClienteB2B = async (token, b2bId) => {
  const res = await fetch(
    `${urlApi}api/newsletter/reportes/historial/${b2bId}`,
    { method: "GET", headers: authHeaders(token) },
  );
  return parse(res);
};

// Envía el reporte EN VIVO de un cliente a un correo ARBITRARIO (prueba de
// entregabilidad). No crea registro en historial ni respeta idempotencia.
export const enviarPruebaReporte = async (token, b2bId, to) => {
  const res = await fetch(
    `${urlApi}api/newsletter/reportes/enviar-prueba/${b2bId}?to=${encodeURIComponent(to)}`,
    { method: "POST", headers: authHeaders(token) },
  );
  return parse(res);
};

// Dispara el envío REAL a los clientes cuyo día de corte coincide con `dia`
// (default backend: mañana = un día antes del cobro). Idempotente por periodo.
export const enviarCorte = async (token, dia) => {
  const qs = dia ? `?dia=${dia}` : "";
  const res = await fetch(
    `${urlApi}api/newsletter/reportes/enviar-corte${qs}`,
    { method: "POST", headers: authHeaders(token) },
  );
  return parse(res);
};
