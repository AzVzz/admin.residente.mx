import { useEffect, useRef, useState } from "react";
import { formatearMB, formatearTiempo } from "./formatoSubida";

const MB = 1024 * 1024;
/** Ventana para calcular la velocidad actual (no el promedio de toda la subida). */
const VENTANA_VELOCIDAD_MS = 10000;

const Dato = ({ etiqueta, valor }) => (
  <div className="rounded-md bg-white/70 px-3 py-2">
    <dt className="text-[11px] uppercase tracking-wide text-blue-700">
      {etiqueta}
    </dt>
    <dd className="text-sm font-semibold text-blue-950">{valor}</dd>
  </div>
);

/**
 * Barra de avance de la subida de un video.
 *   Paso 1: el navegador manda el archivo al servidor (MB, velocidad, tiempo que falta).
 *   Paso 2: el servidor lo procesa (porcentaje real que reporta ffmpeg).
 *
 * progreso = { fase: "subiendo" | "procesando", pct, loaded, total, mensaje }
 */
const ProgresoSubidaVideo = ({ progreso }) => {
  const [ahora, setAhora] = useState(Date.now());
  const inicioTotal = useRef(Date.now());
  const faseActual = useRef({ fase: null, desde: Date.now() });
  const muestras = useRef([]); // [{ t, loaded }] de la fase "subiendo"

  // Reloj: refresca cada segundo para que el tiempo transcurrido avance solo.
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fase = progreso?.fase === "procesando" ? "procesando" : "subiendo";
  if (faseActual.current.fase !== fase) {
    faseActual.current = { fase, desde: Date.now() };
  }

  const pct = Math.max(0, Math.min(100, Math.round(progreso?.pct || 0)));
  const segFase = (ahora - faseActual.current.desde) / 1000;
  const segTotal = (ahora - inicioTotal.current) / 1000;

  let velocidad = 0;
  let faltan = null;

  if (fase === "subiendo") {
    const loaded = progreso?.loaded || 0;
    const ultima = muestras.current[muestras.current.length - 1];
    if (!ultima || ultima.loaded !== loaded) {
      muestras.current.push({ t: Date.now(), loaded });
      const limite = Date.now() - VENTANA_VELOCIDAD_MS;
      while (muestras.current.length > 2 && muestras.current[0].t < limite) {
        muestras.current.shift();
      }
    }
    const primera = muestras.current[0];
    const spanSeg = (Date.now() - primera.t) / 1000;
    if (spanSeg >= 2 && loaded > primera.loaded) {
      velocidad = (loaded - primera.loaded) / spanSeg;
    } else if (segFase >= 2 && loaded > 0) {
      velocidad = loaded / segFase;
    }
    const total = progreso?.total || 0;
    if (velocidad > 0 && total > loaded) {
      faltan = (total - loaded) / velocidad;
    }
  } else if (pct >= 8) {
    // Con ≥8% ya hay base para estimar; antes sería adivinar.
    faltan = (segFase * (100 - pct)) / pct;
  }

  const enCola = fase === "procesando" && progreso?.faseServidor === "en_cola";

  return (
    <div
      className="space-y-3 rounded-lg border border-blue-100 bg-blue-50 p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between text-sm font-semibold text-blue-900">
        <span>
          {fase === "subiendo"
            ? "Paso 1 de 2: Subiendo el video al servidor"
            : "Paso 2 de 2: Procesando en el servidor"}
        </span>
        <span>{pct}%</span>
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-blue-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {fase === "subiendo" ? (
          <>
            <Dato
              etiqueta="Enviado"
              valor={`${formatearMB(progreso?.loaded)} de ${formatearMB(progreso?.total)}`}
            />
            <Dato
              etiqueta="Velocidad"
              valor={velocidad > 0 ? `${(velocidad / MB).toFixed(1)} MB/s` : "calculando…"}
            />
          </>
        ) : (
          <>
            <Dato
              etiqueta="Qué hace ahora"
              valor={progreso?.mensaje || "Procesando"}
            />
            <Dato etiqueta="Avance" valor={enCola ? "en espera" : `${pct}%`} />
          </>
        )}
        <Dato etiqueta="Transcurrido" valor={formatearTiempo(segFase)} />
        <Dato
          etiqueta="Falta aprox."
          valor={
            faltan !== null
              ? formatearTiempo(faltan)
              : enCola
                ? "—"
                : "calculando…"
          }
        />
      </dl>

      <p className="text-xs text-blue-800">
        {fase === "subiendo"
          ? "No cierres ni recargues esta ventana mientras sube. Después, el servidor se encarga solo."
          : "Ya llegó todo. El servidor sigue trabajando aunque cierres esta ventana; el video aparecerá en el dashboard cuando termine."}
        {" "}Tiempo total: {formatearTiempo(segTotal)}.
      </p>
    </div>
  );
};

export default ProgresoSubidaVideo;
