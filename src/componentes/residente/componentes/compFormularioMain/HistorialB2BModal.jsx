import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../Context";
import { historialB2bGet } from "../../../api/historialB2bGet";
import { IoClose } from "react-icons/io5";

const formatMoneda = (valor) => {
  if (valor == null || isNaN(Number(valor))) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(valor));
};

const formatFecha = (fecha) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Estilo del cobro real de Stripe según su estado.
const PAGO_CONFIG = {
  paid: { label: "Pagado", cls: "bg-green-100 text-green-800" },
  failed: { label: "Fallido", cls: "bg-red-100 text-red-800" },
  pending: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-800" },
  unpaid: { label: "Sin pagar", cls: "bg-gray-200 text-gray-700" },
};

// Fecha de arranque del historial: la inscripción; si no hay, el pago real más
// antiguo (algunos clientes tienen pagos pero sin registro de alta de suscripción).
const fechaInicioEfectiva = (fechaInscripcion, pagos) => {
  if (fechaInscripcion) return fechaInscripcion;
  const fechas = (pagos || [])
    .map((p) => p.fecha_facturacion || p.fecha_pago)
    .filter(Boolean)
    .map((x) => new Date(x).getTime())
    .filter((t) => !isNaN(t));
  if (!fechas.length) return null;
  return new Date(Math.min(...fechas)).toISOString();
};

// Construye la línea de tiempo mes a mes desde la inscripción hasta hoy,
// acumulando el precio y cruzando con el cobro real de Stripe de ese mes.
const construirMeses = (fechaInicio, precio, pagos) => {
  if (!fechaInicio || precio == null) return [];
  const inicio = new Date(fechaInicio);
  const ahora = new Date();
  if (isNaN(inicio.getTime())) return [];

  // Indexar pagos por año-mes de la fecha de facturación (o de pago como respaldo)
  const pagoPorMes = new Map();
  for (const p of pagos || []) {
    const base = p.fecha_facturacion || p.fecha_pago;
    if (!base) continue;
    const f = new Date(base);
    if (isNaN(f.getTime())) continue;
    const key = `${f.getFullYear()}-${f.getMonth()}`;
    const prev = pagoPorMes.get(key);
    // Preferir un pago "paid" si hay varios en el mismo mes
    if (!prev || (prev.estado_pago !== "paid" && p.estado_pago === "paid")) {
      pagoPorMes.set(key, p);
    }
  }

  const meses = [];
  let acumulado = 0;
  let y = inicio.getFullYear();
  let m = inicio.getMonth();
  const yFin = ahora.getFullYear();
  const mFin = ahora.getMonth();
  let guard = 0;
  while ((y < yFin || (y === yFin && m <= mFin)) && guard < 240) {
    acumulado += precio;
    meses.push({
      key: `${y}-${m}`,
      etiqueta: new Date(y, m, 1).toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      }),
      precio,
      acumulado,
      pago: pagoPorMes.get(`${y}-${m}`) || null,
    });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    guard += 1;
  }
  return meses;
};

const HistorialB2BModal = ({ cliente, onCerrar }) => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await historialB2bGet(token, cliente.b2b_id);
        if (activo) setData(res);
      } catch (err) {
        if (activo) setError("Error al cargar el historial: " + err.message);
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [token, cliente.b2b_id]);

  const inicioEfectivo = useMemo(
    () => (data ? fechaInicioEfectiva(data.fecha_inscripcion, data.pagos) : null),
    [data],
  );
  const meses = useMemo(
    () => (data ? construirMeses(inicioEfectivo, data.precio, data.pagos) : []),
    [data, inicioEfectivo],
  );

  // Resumen tomado de la fila (ROI/ganancia actuales ya calculados en la lista)
  const roi = (cliente.conversion || 0) + (cliente.fidelizacion || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-4 flex justify-between items-start">
          <div>
            <h3 className="text-white text-lg font-bold leading-tight">
              {data?.nombre || cliente.nombre || "Cliente B2B"}
            </h3>
            <p className="text-indigo-100 text-xs mt-0.5">
              Historial desde la inscripción
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-white/90 hover:text-white cursor-pointer"
            aria-label="Cerrar"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-4 border-b border-gray-100 text-sm">
          <div>
            <p className="text-gray-400 text-xs">
              Inscripción{!data?.fecha_inscripcion && inicioEfectivo ? " (aprox.)" : ""}
            </p>
            <p className="font-semibold text-gray-800">
              {formatFecha(data?.fecha_inscripcion || inicioEfectivo)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Precio mensual</p>
            <p className="font-semibold text-gray-800">
              {formatMoneda(data?.precio ?? cliente.precio)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">ROI generado</p>
            <p className="font-semibold text-blue-700">{formatMoneda(roi)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Ganancia</p>
            <p
              className={`font-semibold ${
                cliente.ganancia == null
                  ? "text-gray-400"
                  : cliente.ganancia >= 0
                    ? "text-emerald-700"
                    : "text-red-600"
              }`}
            >
              {cliente.ganancia == null ? "—" : formatMoneda(cliente.ganancia)}
            </p>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Cargando historial...</p>
            </div>
          ) : error ? (
            <div className="m-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : meses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Sin fecha de inscripción registrada en Stripe, no hay historial que
              mostrar.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Mes
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Precio
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Acumulado
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Cobro Stripe
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {meses.map((mes, idx) => {
                  const pago = mes.pago;
                  const cfg = pago
                    ? PAGO_CONFIG[pago.estado_pago] || {
                        label: pago.estado_pago || "—",
                        cls: "bg-gray-100 text-gray-700",
                      }
                    : null;
                  return (
                    <tr key={mes.key} className="hover:bg-gray-50">
                      <td className="px-4 py-2 capitalize text-gray-700">
                        <span className="text-gray-400 font-mono text-xs mr-1">
                          {idx + 1}.
                        </span>
                        {mes.etiqueta}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {formatMoneda(mes.precio)}
                      </td>
                      <td className="px-4 py-2 font-semibold text-gray-800">
                        {formatMoneda(mes.acumulado)}
                      </td>
                      <td className="px-4 py-2">
                        {cfg ? (
                          <span className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${cfg.cls}`}
                            >
                              {cfg.label}
                            </span>
                            <span className="text-gray-600 text-xs">
                              {formatMoneda(pago.monto)}
                            </span>
                            {pago.fecha_pago && (
                              <span className="text-gray-400 text-xs">
                                {formatFecha(pago.fecha_pago)}
                              </span>
                            )}
                            {pago.url_recibo && (
                              <a
                                href={pago.url_recibo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 text-xs underline"
                              >
                                recibo
                              </a>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-400">
                            Sin registro
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialB2BModal;
