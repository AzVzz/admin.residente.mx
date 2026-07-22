import React, { useState } from "react";
import { useAuth } from "../../Context";
import { enviarPruebaReporte } from "../../api/reportesCorreosApi";
import { IoClose, IoSend, IoWarning } from "react-icons/io5";

// Correo por defecto para pruebas (no se envía a clientes reales).
const CORREO_PRUEBA = "diegoazaelvazquez2016@gmail.com";

// Envía el reporte EN VIVO de un cliente a un correo de prueba arbitrario.
// No toca el historial ni la idempotencia: es puramente para verificar entrega/diseño.
const EnviarPruebaModal = ({ cliente, onCerrar }) => {
  const { token } = useAuth();
  const [to, setTo] = useState(CORREO_PRUEBA);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const enviar = async () => {
    setError("");
    setOk("");
    const correo = to.trim();
    if (!correo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      setError("Escribe un correo válido.");
      return;
    }
    setEnviando(true);
    try {
      const r = await enviarPruebaReporte(token, cliente.b2b_id, correo);
      setOk(r.mensaje || `Reporte de prueba enviado a ${correo}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 flex justify-between items-start">
          <div className="min-w-0">
            <h3 className="text-white text-lg font-bold leading-tight flex items-center gap-2">
              <IoSend className="shrink-0" />
              <span className="truncate">Enviar prueba</span>
            </h3>
            <p className="text-emerald-100 text-xs mt-0.5 truncate">
              {cliente.nombre || "Cliente B2B"}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-white/90 hover:text-white cursor-pointer shrink-0"
            aria-label="Cerrar"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Genera el reporte de métricas <b>en vivo</b> de este cliente y lo
            envía al correo que indiques. No se registra en el historial ni se
            manda al cliente real.
          </p>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">
              Correo destino
            </span>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
              <IoWarning className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {ok && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 px-3 py-2 rounded text-sm">
              {ok}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="px-5 py-4 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onCerrar}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={enviar}
            disabled={enviando}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {enviando ? "Enviando..." : "Enviar prueba"}
            {!enviando && <IoSend />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnviarPruebaModal;
