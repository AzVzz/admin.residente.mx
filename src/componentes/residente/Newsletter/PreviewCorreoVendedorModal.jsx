import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../Context";
import { reporteCorreoVendedorGet } from "../../api/reporteCorreoVendedorGet";
import { IoClose, IoRefresh, IoMailOpen } from "react-icons/io5";

// Vista previa del correo anticipado al vendedor (7 días antes del corte).
const PreviewCorreoVendedorModal = ({ cliente, onCerrar }) => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reporteCorreoVendedorGet(token, cliente.b2b_id);
      setData(res);
    } catch (err) {
      setError("Error al generar el correo: " + err.message);
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-4 flex justify-between items-start">
          <div className="min-w-0">
            <h3 className="text-white text-lg font-bold leading-tight flex items-center gap-2">
              <IoMailOpen className="shrink-0" />
              <span className="truncate">
                Correo vendedor — {cliente.nombre || "Cliente B2B"}
              </span>
            </h3>
            <p className="text-emerald-100 text-xs mt-0.5">
              {data?.asunto || "Vista previa del reporte anticipado (7 días antes)"}
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

        <div className="flex-1 overflow-hidden bg-gray-100">
          {loading ? (
            <div className="p-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="mt-2 text-gray-600">Generando correo vendedor...</p>
            </div>
          ) : error ? (
            <div className="m-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : !data?.html ? (
            <div className="p-10 text-center text-gray-500">
              Este cliente no tiene restaurantes activos.
            </div>
          ) : (
            <iframe
              title="Vista previa correo vendedor"
              srcDoc={data.html}
              className="w-full h-[70vh] bg-white border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewCorreoVendedorModal;
