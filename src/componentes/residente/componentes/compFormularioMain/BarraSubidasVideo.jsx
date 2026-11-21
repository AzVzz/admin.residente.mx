import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerSubidasActivas } from "../../../api/videosApi";
import { descartarSubida, useSubidasVideo } from "../../../api/subidasVideoStore";
import { useEstimacionSubida } from "./useEstimacionSubida";
import { formatearMB, formatearTiempo, rutaSeguimiento } from "./formatoSubida";

const CADA_CUANTO_MS = 3000;
const LLAVE_CERRADAS = "videos_subidas_cerradas";

const leerCerradas = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(LLAVE_CERRADAS) || "[]");
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
};

const guardarCerradas = (ids) => {
  try {
    localStorage.setItem(LLAVE_CERRADAS, JSON.stringify(ids.slice(-50)));
  } catch {
    /* sin almacenamiento: solo se pierde recordar el cierre */
  }
};

const deSubidaLocal = (s) => ({
  id: s.id,
  titulo: s.titulo,
  esEdicion: s.esEdicion,
  videoId: s.videoId,
  estado: s.estado,
  error: s.error,
  progreso: {
    fase: s.fase,
    pct: s.pct,
    loaded: s.loaded,
    total: s.total,
    mensaje: s.mensaje,
    faseServidor: s.faseServidor,
    inicio: s.inicio,
  },
});

const deJobServidor = (j, inicio) => ({
  id: j.uploadId,
  titulo: j.titulo,
  esEdicion: j.esEdicion,
  videoId: j.videoId,
  estado: j.estado,
  error: [j.error, j.detalle].filter(Boolean).join(": "),
  progreso: {
    fase: "procesando",
    pct: j.porcentaje,
    mensaje: j.mensaje,
    faseServidor: j.fase,
    inicio,
    inicioFase: inicio,
  },
});

const ItemSubida = ({ item, onAbrir, onCerrar }) => {
  const { fase, pct, faltan, enCola } = useEstimacionSubida(item.progreso);
  const nombre = item.titulo ? `«${item.titulo}»` : "video";

  if (item.estado === "error") {
    return (
      <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        <span>
          <strong>No se pudo subir {nombre}.</strong>{" "}
          {item.error || "Error al procesar el video."}
        </span>
        <button
          type="button"
          onClick={() => onCerrar(item)}
          className="shrink-0 rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-medium hover:bg-red-100"
        >
          Cerrar
        </button>
      </div>
    );
  }

  const detalle =
    fase === "subiendo"
      ? `Paso 1 de 2 · Enviando ${formatearMB(item.progreso.loaded)} de ${formatearMB(item.progreso.total)}`
      : `Paso 2 de 2 · ${enCola ? "En cola" : item.progreso.mensaje || "Procesando en el servidor"}`;

  return (
    <button
      type="button"
      onClick={() => onAbrir(item)}
      className="block w-full rounded-lg border border-blue-200 bg-blue-50 p-3 text-left transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      title="Ver el avance de esta subida"
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2 font-semibold text-blue-950">
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="truncate">
            {item.esEdicion ? "Reemplazando" : "Subiendo"} {nombre}
          </span>
        </span>
        <span className="shrink-0 font-semibold text-blue-900">{pct}%</span>
      </div>

      <div
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-blue-100"
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

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 text-xs text-blue-800">
        <span>{detalle}</span>
        <span>
          {faltan !== null ? `Falta aprox. ${formatearTiempo(faltan)} · ` : ""}
          <span className="font-semibold underline">Ver detalle</span>
        </span>
      </div>
    </button>
  );
};

/**
 * Barra(s) de subida en el header del dashboard de videos.
 * Junta lo que se sube desde esta pestaña (paso 1 y 2) con lo que el servidor
 * está procesando (aunque se haya iniciado en otra pestaña o compu), y avisa con
 * onVideoListo(titulo) cuando termina uno para que el dashboard se refresque solo.
 */
const BarraSubidasVideo = ({ onVideoListo }) => {
  const navigate = useNavigate();
  const locales = useSubidasVideo();
  const [servidor, setServidor] = useState([]);
  const [cerradas, setCerradas] = useState(leerCerradas);

  const inicios = useRef(new Map()); // uploadId -> ms de inicio (estable entre consultas)
  const vistosEnCurso = useRef(new Set());
  const avisados = useRef(new Set());
  const onListoRef = useRef(onVideoListo);
  onListoRef.current = onVideoListo;

  // Pregunta al servidor cada pocos segundos qué está procesando.
  useEffect(() => {
    let vivo = true;
    let timer;
    const consultar = async () => {
      const jobs = await obtenerSubidasActivas();
      if (vivo) setServidor(jobs);
      if (vivo) timer = setTimeout(consultar, CADA_CUANTO_MS);
    };
    consultar();
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, []);

  // Detecta videos que terminaron y le avisa al dashboard.
  useEffect(() => {
    const avisar = (id, titulo) => {
      if (avisados.current.has(id)) return;
      avisados.current.add(id);
      onListoRef.current?.(titulo);
    };

    for (const s of locales) {
      if (s.estado === "listo") {
        avisar(s.id, s.titulo);
        descartarSubida(s.id);
      }
    }
    for (const j of servidor) {
      if (j.estado === "procesando") vistosEnCurso.current.add(j.uploadId);
      // Solo si lo vimos en curso: lo que ya estaba terminado al abrir la
      // pantalla ya viene en la lista que cargó el dashboard.
      if (j.estado === "listo" && vistosEnCurso.current.has(j.uploadId)) {
        avisar(j.uploadId, j.titulo);
      }
    }
  }, [locales, servidor]);

  const items = useMemo(() => {
    const porId = new Map();

    for (const j of servidor) {
      if (j.estado === "listo") continue;
      if (!inicios.current.has(j.uploadId)) {
        inicios.current.set(j.uploadId, Date.now() - (j.transcurridoSeg || 0) * 1000);
      }
      porId.set(j.uploadId, deJobServidor(j, inicios.current.get(j.uploadId)));
    }
    for (const s of locales) {
      if (s.estado === "listo") continue;
      const delServidor = porId.get(s.id);
      // Enviando el archivo: solo esta pestaña lo sabe. Ya procesando: el
      // servidor tiene el dato más fresco y exacto.
      if (delServidor && s.fase === "procesando" && s.estado !== "error") {
        porId.set(s.id, { ...delServidor, titulo: s.titulo || delServidor.titulo });
      } else {
        porId.set(s.id, deSubidaLocal(s));
      }
    }

    return [...porId.values()].filter(
      (i) => !(i.estado === "error" && cerradas.includes(i.id)),
    );
  }, [locales, servidor, cerradas]);

  if (items.length === 0) return null;

  const cerrar = (item) => {
    descartarSubida(item.id);
    const siguientes = [...cerradas, item.id];
    setCerradas(siguientes);
    guardarCerradas(siguientes);
  };

  return (
    <div className="space-y-2" aria-label="Subidas de video en curso">
      {items.map((item) => (
        <ItemSubida
          key={item.id}
          item={item}
          onAbrir={(i) => navigate(rutaSeguimiento(i))}
          onCerrar={cerrar}
        />
      ))}
    </div>
  );
};

export default BarraSubidasVideo;
