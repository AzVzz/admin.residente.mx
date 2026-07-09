import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../Context";
import { metricasB2bGet } from "../../../api/metricasB2bGet";
import { IoStatsChart } from "react-icons/io5";
import HistorialB2BModal from "./HistorialB2BModal.jsx";

const formatMoneda = (valor) => {
  if (valor == null || isNaN(Number(valor))) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(valor));
};

const MetricasB2B = () => {
  const { token } = useAuth();
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Cliente seleccionado para ver su historial (abre el modal)
  const [clienteHistorial, setClienteHistorial] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await metricasB2bGet(token);
      setFilas(data);
    } catch (err) {
      setError("Error al cargar las métricas: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) cargar();
    // Auto-refresh cada 60s (sin depender de focus para no parpadear la tabla)
    const interval = setInterval(() => {
      if (token) cargar();
    }, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Mostrar primero las ganancias en rojo (negativas), de la más negativa hacia
  // arriba; el resto mantiene el orden que ya trae el backend (por ROI desc).
  const ordenadas = useMemo(() => {
    const esRojo = (f) => f.ganancia != null && f.ganancia < 0;
    return [...filas].sort((a, b) => {
      const ar = esRojo(a);
      const br = esRojo(b);
      if (ar !== br) return ar ? -1 : 1;
      if (ar && br) return a.ganancia - b.ganancia;
      return 0;
    });
  }, [filas]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <IoStatsChart className="mr-2" />
          Métricas B2B
        </h2>
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
          {filas.length} clientes
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && filas.length === 0 ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      ) : (
        <div className="bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3">
            <h3 className="text-white font-semibold">
              Rendimiento de clientes B2B activos
            </h3>
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
                    Precio pagado
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Conversión
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Fidelización
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                    Ganancia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                      No hay clientes B2B activos
                    </td>
                  </tr>
                ) : (
                  ordenadas.map((f, idx) => (
                    <tr
                      key={f.b2b_id}
                      onClick={() => setClienteHistorial(f)}
                      className="hover:bg-indigo-50 cursor-pointer"
                      title="Ver historial del cliente"
                    >
                      <td className="px-3 py-2 text-gray-400 font-mono text-xs align-top">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 align-top break-words">
                        <span className="font-medium text-gray-900 leading-tight">
                          {f.nombre || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        <span className="font-semibold text-gray-800">
                          {formatMoneda(f.precio)}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        <span className="font-semibold text-green-700">
                          {formatMoneda(f.conversion)}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        <span className="font-semibold text-blue-700">
                          {formatMoneda(f.fidelizacion)}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        {f.ganancia == null ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <span
                            title={`Conversión + Fidelización (${formatMoneda(
                              (f.conversion || 0) + (f.fidelizacion || 0),
                            )}) − invertido (${f.meses} ${
                              f.meses === 1 ? "mes pagado" : "meses pagados"
                            } × ${formatMoneda(f.precio)} = ${formatMoneda(
                              f.pagado,
                            )})`}
                            className={`font-bold ${
                              f.ganancia >= 0 ? "text-emerald-700" : "text-red-600"
                            }`}
                          >
                            {formatMoneda(f.ganancia)}
                          </span>
                        )}
                        {f.pagado != null && (
                          <span className="block text-[11px] text-gray-400 font-normal">
                            invertido {formatMoneda(f.pagado)} · {f.meses}m
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {clienteHistorial && (
        <HistorialB2BModal
          cliente={clienteHistorial}
          onCerrar={() => setClienteHistorial(null)}
        />
      )}
    </div>
  );
};

export default MetricasB2B;
