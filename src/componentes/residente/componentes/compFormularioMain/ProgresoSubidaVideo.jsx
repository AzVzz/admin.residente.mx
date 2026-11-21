import { formatearMB, formatearTiempo } from "./formatoSubida";
import { useEstimacionSubida } from "./useEstimacionSubida";

const MB = 1024 * 1024;

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
 * progreso = { fase: "subiendo" | "procesando", pct, loaded, total, mensaje,
 *              faseServidor, inicio?, inicioFase? }
 */
const ProgresoSubidaVideo = ({ progreso }) => {
  const { fase, pct, velocidad, faltan, segFase, segTotal, enCola } =
    useEstimacionSubida(progreso);

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
          ? "Puedes ir a otras pantallas del admin, pero no cierres ni recargues esta pestaña mientras se envía el archivo."
          : "Ya llegó todo. El servidor sigue trabajando aunque cierres esta ventana; el video aparecerá en el dashboard cuando termine."}
        {" "}Tiempo total: {formatearTiempo(segTotal)}.
      </p>
    </div>
  );
};

export default ProgresoSubidaVideo;
