import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { consultarEstadoSubida } from "../../../api/videosApi";
import { descartarSubida, useSubidasVideo } from "../../../api/subidasVideoStore";
import ProgresoSubidaVideo from "./ProgresoSubidaVideo";

const CADA_CUANTO_MS = 1500;

/**
 * Pantalla a la que lleva la barra del dashboard: muestra el avance de una
 * subida (`?subida=<uploadId>`). Si esta pestaña es la que la envía, lee su
 * avance directo; si no (recargaste, o la subió otra pestaña), le pregunta al
 * servidor por ella.
 */
const SeguimientoSubidaVideo = ({ uploadId, rutaFormulario }) => {
  const navigate = useNavigate();
  const locales = useSubidasVideo();
  const local = locales.find((s) => s.id === uploadId) || null;

  const [remoto, setRemoto] = useState(null);
  const [perdida, setPerdida] = useState(false);
  const inicioRemoto = useRef(null);

  // Enviando el archivo (paso 1) solo esta pestaña lo sabe. En cuanto pasa al
  // servidor (paso 2), o si no hay registro local, se le pregunta al servidor.
  const preguntarAlServidor = !local || local.fase === "procesando";

  useEffect(() => {
    if (!preguntarAlServidor) return undefined;
    let vivo = true;
    let timer;
    const consultar = async () => {
      try {
        const job = await consultarEstadoSubida(uploadId);
        if (!vivo) return;
        if (!job) {
          setPerdida(true);
          return;
        }
        if (inicioRemoto.current === null) {
          inicioRemoto.current = Date.now() - (job.transcurridoSeg || 0) * 1000;
        }
        setRemoto(job);
        if (job.estado === "procesando") timer = setTimeout(consultar, CADA_CUANTO_MS);
      } catch {
        if (vivo) timer = setTimeout(consultar, CADA_CUANTO_MS * 2);
      }
    };
    consultar();
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, [uploadId, preguntarAlServidor]);

  const estado = local?.estado === "procesando" || !local
    ? remoto?.estado || "procesando"
    : local.estado;
  const titulo = local?.titulo || remoto?.titulo || "";
  const mensajeError =
    local?.error ||
    (remoto ? [remoto.error, remoto.detalle].filter(Boolean).join(": ") : "");

  let progreso = null;
  if (local && local.fase === "subiendo") {
    progreso = {
      fase: "subiendo",
      pct: local.pct,
      loaded: local.loaded,
      total: local.total,
      inicio: local.inicio,
    };
  } else if (remoto) {
    progreso = {
      fase: "procesando",
      pct: remoto.porcentaje,
      mensaje: remoto.mensaje,
      faseServidor: remoto.fase,
      inicio: inicioRemoto.current,
      inicioFase: inicioRemoto.current,
    };
  } else if (local) {
    progreso = {
      fase: "procesando",
      pct: local.pct,
      mensaje: local.mensaje,
      faseServidor: local.faseServidor,
      inicio: local.inicio,
    };
  }

  // Terminó: se va al dashboard, donde ya aparece el video.
  useEffect(() => {
    if (estado !== "listo") return;
    descartarSubida(uploadId);
    navigate("/videosDashboard", { replace: true, state: { videoListo: titulo } });
  }, [estado, uploadId, titulo, navigate]);

  const volverAlFormulario = () => {
    descartarSubida(uploadId);
    navigate(rutaFormulario, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/videosDashboard")}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <FaArrowLeft className="mr-2 h-5 w-5" />
            Ir al dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Subida en curso</h1>
        </div>

        <div className="space-y-6 rounded-lg bg-white p-8 shadow">
          {titulo && (
            <p className="text-lg font-semibold text-gray-900">«{titulo}»</p>
          )}

          {perdida && !local ? (
            <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <p>
                Ya no hay una subida en curso con este enlace. Si el video ya
                terminó, lo encuentras en el dashboard. Si cerraste o recargaste
                la pestaña mientras se enviaba el archivo, hay que subirlo de
                nuevo.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/videosDashboard")}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Ir al dashboard
                </button>
                <button
                  type="button"
                  onClick={volverAlFormulario}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Subir otro video
                </button>
              </div>
            </div>
          ) : estado === "error" ? (
            <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <p>
                <strong>No se pudo subir el video.</strong>{" "}
                {mensajeError || "Error al procesar el video."}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={volverAlFormulario}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Volver al formulario
                </button>
                <button
                  type="button"
                  onClick={() => {
                    descartarSubida(uploadId);
                    navigate("/videosDashboard");
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Ir al dashboard
                </button>
              </div>
            </div>
          ) : progreso ? (
            <>
              <ProgresoSubidaVideo progreso={progreso} />
              <p className="text-sm text-gray-500">
                Puedes ir al dashboard: ahí verás una barra con el avance y, al
                terminar, el video aparece solo.
              </p>
            </>
          ) : (
            <p className="text-gray-600">Buscando la subida…</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeguimientoSubidaVideo;
