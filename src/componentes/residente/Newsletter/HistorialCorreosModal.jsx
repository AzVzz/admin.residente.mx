import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../Context";
import { historialClienteB2B } from "../../api/reportesCorreosApi";
import { IoClose, IoRefresh, IoTime } from "react-icons/io5";

// Colores por estado de envío.
const ESTADO_STYLE = {
  enviado: "bg-emerald-100 text-emerald-700",
  fallo: "bg-red-100 text-red-700",
  omitido: "bg-gray-100 text-gray-500",
  pendiente: "bg-amber-100 text-amber-700",
  enviando: "bg-blue-100 text-blue-700",
  incierto: "bg-purple-100 text-purple-700",
};

const fmtFecha = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? "—" : d.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
};

// Lista todos los correos (reportes + avisos) enviados a un cliente B2B.
const HistorialCorreosModal = ({ cliente, onCerrar }) => {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await historialClienteB2B(token, cliente.b2b_id);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, cliente.b2b_id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-5 py-4 flex justify-between items-start">
          <div className="min-w-0">
            <h3 className="text-white text-lg font-bold leading-tight flex items-center gap-2">
              <IoTime className="shrink-0" />
              <span className="truncate">
                Correos enviados — {cliente.nombre || "Cliente B2B"}
              </span>
            </h3>
            <p className="text-slate-200 text-xs mt-0.5 truncate">
              {cliente.correo}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={cargar}
              disabled={loading}
              className="text-white/90 hover:text-white cursor-pointer disabled:opacity-50"
              aria-label="Actualizar"
            >
              <IoRefresh size={22} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onCerrar}
              className="text-white/90 hover:text-white cursor-pointer"
              aria-label="Cerrar"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
              <p className="mt-2 text-gray-600">Cargando historial...</p>
            </div>
          ) : error ? (
            <div className="m-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              Este cliente no tiene correos registrados todavía.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 text-left sticky top-0">
                <tr>
                  <th className="px-4 py-2 font-semibold">Tipo</th>
                  <th className="px-4 py-2 font-semibold">Estado</th>
                  <th className="px-4 py-2 font-semibold">Correo</th>
                  <th className="px-4 py-2 font-semibold">Enviado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-2">
                      <span className="font-medium text-gray-800">
                        {r.tipo_evento}
                      </span>
                      {r.entidad_tipo && (
                        <span className="block text-xs text-gray-400">
                          {r.entidad_tipo}
                          {r.entidad_id ? ` #${r.entidad_id}` : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          ESTADO_STYLE[r.estado_envio] || "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {r.estado_envio}
                      </span>
                      {r.error_envio && (
                        <span className="block text-xs text-red-500 mt-0.5 max-w-[220px] truncate" title={r.error_envio}>
                          {r.error_envio}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600 max-w-[200px] truncate" title={r.correo}>
                      {r.correo || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                      {fmtFecha(r.enviado_en || r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialCorreosModal;
