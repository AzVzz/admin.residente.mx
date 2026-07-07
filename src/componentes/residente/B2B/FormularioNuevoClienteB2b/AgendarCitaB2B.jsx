import React, { useState, useEffect } from "react";
import { useAuth } from "../../../Context";
import { citaB2bPost } from "../../../api/citasB2bPost.js";

// Formatea un Date a "YYYY-MM-DDTHH:mm" en hora local (para input datetime-local)
const paraInputLocal = (fecha) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(
    fecha.getDate(),
  )}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
};

const MS_SEMANA = 7 * 24 * 60 * 60 * 1000;

/**
 * Sub-flujo de "Agendar cita" dentro de la tarjeta de plan (PlanCard).
 * Muestra: box con nombre del cliente + fecha/hora en vivo, selector de fecha
 * limitado a los próximos 7 días, botón para agendar y, una vez agendada, un
 * contador regresivo hasta la cita.
 */
const AgendarCitaB2B = ({
  nombre,
  plan,
  esSeller,
  clienteEditorialId,
  beneficios = [],
}) => {
  const { token, usuario } = useAuth();

  // Nombre del vendedor segun el perfil que inicio sesion
  const nombreVendedor = usuario?.nombre_usuario || usuario?.nombre || "";

  // Reloj en vivo (día, mes, año y hora que se actualizan solos)
  const [ahora, setAhora] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const [fechaInput, setFechaInput] = useState("");
  const [fechaCita, setFechaCita] = useState(null); // Date, cuando ya se agendó
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  // Límites del selector: desde ahora hasta ahora + 7 días
  const min = paraInputLocal(new Date());
  const max = paraInputLocal(new Date(Date.now() + MS_SEMANA));

  // Contador regresivo hasta la cita agendada
  const [restante, setRestante] = useState(null);
  useEffect(() => {
    if (!fechaCita) return;
    const calcular = () => {
      const diff = fechaCita.getTime() - Date.now();
      if (diff <= 0) {
        setRestante({ dias: 0, horas: 0, min: 0, seg: 0, terminado: true });
        return;
      }
      setRestante({
        dias: Math.floor(diff / 86400000),
        horas: Math.floor((diff / 3600000) % 24),
        min: Math.floor((diff / 60000) % 60),
        seg: Math.floor((diff / 1000) % 60),
        terminado: false,
      });
    };
    calcular();
    const id = setInterval(calcular, 1000);
    return () => clearInterval(id);
  }, [fechaCita]);

  const handleAgendar = async (e) => {
    e.stopPropagation();
    setError(null);

    const nombreLimpio = (nombre || "").trim();
    if (!nombreLimpio) {
      setError("Falta el nombre del cliente.");
      return;
    }
    if (!fechaInput) {
      setError("Elige la fecha y hora de la cita.");
      return;
    }

    const elegida = new Date(fechaInput);
    const ahoraMs = Date.now();
    if (elegida.getTime() < ahoraMs) {
      setError("La fecha no puede ser en el pasado.");
      return;
    }
    if (elegida.getTime() > ahoraMs + MS_SEMANA) {
      setError("Solo puedes agendar dentro de los próximos 7 días.");
      return;
    }

    setEnviando(true);
    try {
      await citaB2bPost(token, {
        nombre: nombreLimpio,
        fechaCita: elegida.toISOString(),
        priceId: plan?.priceId,
        meses: plan?.meses ? parseInt(plan.meses) : undefined,
        clienteEditorialId:
          esSeller && clienteEditorialId ? parseInt(clienteEditorialId) : undefined,
        beneficios: Array.isArray(beneficios) ? beneficios : [],
        // Monto del plan y grupo (A = cliente de la lista; B = cliente nuevo "Otro")
        monto: plan?.precioMensual,
        grupo: clienteEditorialId ? "A" : "B",
      });
      setFechaCita(elegida);
    } catch (err) {
      setError(err.message || "No se pudo agendar la cita.");
    } finally {
      setEnviando(false);
    }
  };

  const fechaHoraViva = ahora.toLocaleString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
      {/* Box: restaurante + vendedor + fecha/hora en vivo */}
      <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-gray-900 truncate">
            {nombre?.trim() || "Cliente"}
          </span>
          <span className="text-xs text-gray-600 text-right leading-tight capitalize">
            {fechaHoraViva}
          </span>
        </div>
        {nombreVendedor && (
          <p className="text-xs text-gray-500 mt-1">
            Vendedor:{" "}
            <span className="font-medium text-gray-700">{nombreVendedor}</span>
          </p>
        )}
      </div>

      {!fechaCita ? (
        <>
          {/* Selector de fecha de la cita (máx. 7 días) */}
          <label className="block text-xs font-medium text-gray-600 mt-3 mb-1">
            Fecha de la cita (máx. 7 días)
          </label>
          <input
            type="datetime-local"
            value={fechaInput}
            min={min}
            max={max}
            onChange={(e) => setFechaInput(e.target.value)}
            onClick={(e) => {
              e.stopPropagation();
              // Abrir el calendario al hacer clic en cualquier parte del campo
              try {
                e.currentTarget.showPicker?.();
              } catch {
                // algunos navegadores no soportan showPicker; se ignora
              }
            }}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 cursor-pointer"
          />

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          {/* Botón agendar */}
          <button
            onClick={handleAgendar}
            disabled={enviando}
            className="text-2xl w-full py-3 px-4 mt-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {enviando ? "Agendando..." : "Agendar cita"}
          </button>
        </>
      ) : (
        <>
          {/* Contador regresivo hasta la cita */}
          <p className="text-center text-sm font-medium text-gray-600 mt-3">
            Tiempo restante para tu cita
          </p>
          {restante && !restante.terminado ? (
            <div className="flex justify-center gap-3 mt-2">
              {[
                { valor: restante.dias, label: "días" },
                { valor: restante.horas, label: "hrs" },
                { valor: restante.min, label: "min" },
                { valor: restante.seg, label: "seg" },
              ].map((u) => (
                <div key={u.label} className="text-center">
                  <div className="text-2xl font-black text-gray-900 tabular-nums">
                    {String(u.valor).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase text-gray-500">
                    {u.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-base font-bold text-gray-900 mt-2">
              Tu cita es ahora. Tus beneficios se activan el viernes entre 12pm y
              6pm.
            </p>
          )}
          <p className="text-center text-xs text-gray-500 mt-3">
            Cita agendada para {" "}
            {fechaCita.toLocaleString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </>
      )}
    </div>
  );
};

export default AgendarCitaB2B;
