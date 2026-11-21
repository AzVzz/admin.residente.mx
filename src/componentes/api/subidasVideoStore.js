// Subidas de video en curso en ESTA pestaña.
//
// Vive fuera de los componentes a propósito: la subida sigue corriendo aunque
// el admin cambie de pantalla (del formulario al dashboard y de vuelta), y
// cualquier pantalla puede leer su avance con useSubidasVideo().
//
// Ojo: si se cierra o recarga la pestaña mientras el archivo todavía se está
// ENVIANDO (paso 1), esa subida se pierde (por eso el aviso al salir). Ya en el
// paso 2 el servidor sigue solo y el dashboard lo ve por /upload/activos.

import { useSyncExternalStore } from "react";
import { crearVideo, editarVideo } from "./videosApi";

const subidas = new Map(); // uploadId -> subida
const oyentes = new Set();
let instantanea = [];

const avisarAlSalir = (event) => {
  event.preventDefault();
  event.returnValue = "";
};
let avisoPuesto = false;

const actualizarAvisoAlSalir = () => {
  if (typeof window === "undefined") return;
  const enviando = [...subidas.values()].some(
    (s) => s.estado === "procesando" && s.fase === "subiendo",
  );
  if (enviando && !avisoPuesto) {
    window.addEventListener("beforeunload", avisarAlSalir);
    avisoPuesto = true;
  } else if (!enviando && avisoPuesto) {
    window.removeEventListener("beforeunload", avisarAlSalir);
    avisoPuesto = false;
  }
};

const emitir = () => {
  instantanea = [...subidas.values()];
  actualizarAvisoAlSalir();
  oyentes.forEach((fn) => fn());
};

const actualizar = (id, parche) => {
  const actual = subidas.get(id);
  if (!actual) return;
  subidas.set(id, { ...actual, ...parche });
  emitir();
};

const suscribir = (fn) => {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
};
const leer = () => instantanea;

/** Lista (reactiva) de las subidas de esta pestaña. */
export const useSubidasVideo = () => useSyncExternalStore(suscribir, leer, leer);

export const obtenerSubida = (id) => subidas.get(id) || null;

export const descartarSubida = (id) => {
  if (subidas.delete(id)) emitir();
};

/**
 * Empieza a subir un video. Devuelve una promesa con el uploadId en cuanto el
 * servidor acepta la subida (el resto sigue corriendo por su cuenta y se lee
 * con useSubidasVideo). Si el servidor rechaza el inicio, la promesa falla.
 *
 * @param {{ formData: FormData, token: string, titulo: string,
 *           esEdicion?: boolean, videoId?: string|number }} opciones
 */
export const iniciarSubida = ({ formData, token, titulo, esEdicion, videoId }) =>
  new Promise((resolve, reject) => {
    let uploadId = null;

    const onProgress = (info) => {
      if (!uploadId && info?.uploadId) {
        uploadId = info.uploadId;
        subidas.set(uploadId, {
          id: uploadId,
          titulo,
          esEdicion: Boolean(esEdicion),
          videoId: videoId ? String(videoId) : null,
          estado: "procesando", // procesando | listo | error
          fase: "subiendo", // subiendo | procesando
          pct: 0,
          loaded: 0,
          total: 0,
          mensaje: "",
          faseServidor: "",
          error: null,
          video: null,
          inicio: Date.now(),
        });
        emitir();
        resolve(uploadId);
      }
      if (!uploadId) return;
      const actual = subidas.get(uploadId);
      actualizar(uploadId, {
        fase: info.fase === "procesando" ? "procesando" : "subiendo",
        pct: typeof info.pct === "number" ? info.pct : actual.pct,
        loaded: info.loaded ?? actual.loaded,
        total: info.total ?? actual.total,
        mensaje: info.mensaje ?? actual.mensaje,
        faseServidor: info.faseServidor ?? actual.faseServidor,
      });
    };

    const operacion = esEdicion
      ? editarVideo(videoId, formData, token, onProgress)
      : crearVideo(formData, token, onProgress);

    operacion
      .then((video) => {
        if (uploadId) {
          actualizar(uploadId, {
            estado: "listo",
            fase: "procesando",
            pct: 100,
            video,
          });
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        if (uploadId) {
          actualizar(uploadId, {
            estado: "error",
            error: error?.message || "Error al procesar el video",
          });
        } else {
          reject(error);
        }
      });
  });
