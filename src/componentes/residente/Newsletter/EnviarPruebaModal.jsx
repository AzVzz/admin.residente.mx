import React, { useState } from "react";
import { useAuth } from "../../Context";
import { enviarPruebaReporte } from "../../api/reportesCorreosApi";
import { IoClose, IoSend, IoWarning } from "react-icons/io5";

// Envía el reporte EN VIVO de un cliente SOLO al vendedor asignado.
// No toca el historial ni se manda al cliente. El corte real sí va a ambos.
const EnviarPruebaModal = ({ cliente, onCerrar }) => {
  const { token } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const vendedor = cliente?.vendedor;
  const correoVend = String(vendedor?.correo || "").trim();
  const nombreVend = vendedor?.nombre_usuario || "Sin asignar";
  const esPlaceholder =
    !correoVend || /@no-reply\.local$/i.test(correoVend);
  const puedeEnviar = Boolean(vendedor?.id && correoVend && !esPlaceholder);

  const enviar = async () => {
    setError("");
    setOk("");
    if (!vendedor?.id) {
      setError("Asigna un vendedor en Inscrito por antes de mandar la prueba.");
      return;
    }
    if (esPlaceholder) {
      setError(
        "El vendedor no tiene un correo real (tiene @no-reply.local). Actualízalo en su perfil.",
      );
      return;
    }
    setEnviando(true);
    try {
      // Solo al vendedor: el backend recibe ?to= y nunca usa el correo del cliente.
      const r = await enviarPruebaReporte(token, cliente.b2b_id, correoVend);
      setOk(r.mensaje || `Prueba enviada a ${nombreVend} (${correoVend}).`);
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

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            La prueba llega <b>solo al vendedor asignado</b>, para verificar que
            le llega. El cliente no recibe este correo. En la fecha de corte sí
            les llega a los dos: cliente y su vendedor.
          </p>

          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Destino
            </p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {nombreVend}
            </p>
            <p className="text-xs text-gray-500 truncate" title={correoVend}>
              {correoVend || "Sin correo en el perfil"}
            </p>
            {esPlaceholder && (
              <p className="text-xs text-amber-700 mt-1">
                Correo inválido o placeholder. Edita el perfil del vendedor antes de probar.
              </p>
            )}
          </div>

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

        <div className="px-5 py-4 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onCerrar}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={enviar}
            disabled={enviando || !puedeEnviar}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {enviando ? "Enviando..." : "Enviar prueba al vendedor"}
            {!enviando && <IoSend />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnviarPruebaModal;
