import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../Context";
import { citasB2bGet } from "../../../api/citasB2bGet";
import { IoCalendarNumber, IoList } from "react-icons/io5";
import CalendarioCitasB2B from "./CalendarioCitasB2B.jsx";

const formatMonto = (monto) => {
  if (monto == null || isNaN(Number(monto))) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(Number(monto));
};

const formatFecha = (fecha) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Devuelve el tiempo restante hasta `fecha` respecto a `ahoraMs` (en ms).
const calcularRestante = (fecha, ahoraMs) => {
  const diff = new Date(fecha).getTime() - ahoraMs;
  if (isNaN(diff)) return null;
  if (diff <= 0) return { terminado: true, totalMs: diff };
  return {
    terminado: false,
    totalMs: diff,
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff / 3600000) % 24),
    min: Math.floor((diff / 60000) % 60),
    seg: Math.floor((diff / 1000) % 60),
  };
};

// Semáforo del tiempo restante: verde (faltan días), amarillo (ya mero), rojo (por vencer).
const HORA_MS = 3600000;
const colorRestante = (totalMs) => {
  if (totalMs >= 48 * HORA_MS) return "text-green-600";
  if (totalMs >= 12 * HORA_MS) return "text-yellow-500";
  return "text-red-600";
};

const ESTADO_CONFIG = {
  pendiente: { label: "Pendiente", cls: "bg-gray-100 text-gray-700" },
  confirmada: { label: "Confirmada", cls: "bg-blue-100 text-blue-800" },
  activada: { label: "Activada", cls: "bg-green-100 text-green-800" },
  cancelada: { label: "Cancelada", cls: "bg-red-100 text-red-800" },
};

const CitasB2B = () => {
  const { token } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modo de vista: "lista" (tabla) o "calendario"
  const [modo, setModo] = useState("lista");

  // Mostrar también las citas ya realizadas (ocultas por defecto)
  const [verRealizadas, setVerRealizadas] = useState(false);

  // Reloj compartido: se actualiza cada segundo para el cronómetro en vivo
  const [ahoraMs, setAhoraMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhoraMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const cargarCitas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await citasB2bGet(token, verRealizadas);
      setCitas(data);
    } catch (err) {
      setError("Error al cargar las citas: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) cargarCitas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, verRealizadas]);

  // Ordenar: primero las citas más próximas (fecha ascendente)
  const ordenadas = useMemo(
    () =>
      [...citas].sort(
        (a, b) => new Date(a.fecha_cita).getTime() - new Date(b.fecha_cita).getTime(),
      ),
    [citas],
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <IoCalendarNumber className="mr-2" />
          Citas agendadas
        </h2>
        <div className="flex items-center gap-3">
          {/* Toggle: Lista / Calendario */}
          <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setModo("lista")}
              className={`flex items-center px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                modo === "lista"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <IoList className="mr-1" /> Lista
            </button>
            <button
              onClick={() => setModo("calendario")}
              className={`flex items-center px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                modo === "calendario"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <IoCalendarNumber className="mr-1" /> Calendario
            </button>
          </div>
          <button
            onClick={() => setVerRealizadas((v) => !v)}
            className={`text-sm px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              verRealizadas
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
            title="Mostrar u ocultar las citas ya realizadas (restaurantes que ya se suscribieron)"
          >
            {verRealizadas ? "Ocultar realizadas" : "Ver realizadas"}
          </button>
          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
            {citas.length} citas
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      ) : modo === "calendario" ? (
        <CalendarioCitasB2B citas={ordenadas} />
      ) : (
        <div className="bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3">
            <h3 className="text-white font-semibold">Citas de ventas B2B</h3>
          </div>
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    #
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Restaurante
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Fecha de la cita
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Tiempo restante
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Monto
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Vendedor
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordenadas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                      No hay citas agendadas
                    </td>
                  </tr>
                ) : (
                  ordenadas.map((cita, idx) => {
                    const restante = calcularRestante(cita.fecha_cita, ahoraMs);
                    const estado =
                      ESTADO_CONFIG[cita.estado] || {
                        label: cita.estado || "—",
                        cls: "bg-gray-100 text-gray-700",
                      };
                    return (
                      <tr key={cita.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-400 font-mono text-xs align-top">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 align-top break-words">
                          <span className="font-medium text-gray-900 leading-tight">
                            {cita.nombre || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600 text-xs align-top capitalize">
                          {formatFecha(cita.fecha_cita)}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {cita.estado === "realizada" ? (
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-800">
                              ✓ Suscripción realizada
                            </span>
                          ) : !restante ? (
                            <span className="text-gray-400">—</span>
                          ) : restante.terminado ? (
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800">
                              Cita en curso / vencida
                            </span>
                          ) : (
                            <span
                              className={`font-mono font-bold tabular-nums whitespace-nowrap ${colorRestante(restante.totalMs)}`}
                            >
                              {String(restante.dias).padStart(2, "0")}d{" "}
                              {String(restante.horas).padStart(2, "0")}:
                              {String(restante.min).padStart(2, "0")}:
                              {String(restante.seg).padStart(2, "0")}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span className="font-semibold text-gray-800">
                            {formatMonto(cita.monto)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700 align-top">
                          {cita.vendedor_nombre || "—"}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${estado.cls}`}
                          >
                            {estado.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitasB2B;
