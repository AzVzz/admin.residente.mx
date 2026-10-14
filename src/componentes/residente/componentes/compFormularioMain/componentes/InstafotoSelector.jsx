import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  notaInstafotoDelete,
  notaInstafotoPut,
} from "../../../../api/notaCrearPostPut";
import { useAuth } from "../../../../Context";
import { generarInstafoto, generarStory } from "./generarInstafoto";

const crearNombreSeguro = (titulo, tipo) => {
  const base = String(titulo || "nota")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return `${tipo}-${base || "nota"}.jpg`;
};

const descargarArchivo = (archivo, nombre) => {
  if (!archivo) return;

  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const prepararUrlImagenExistente = (url) => {
  try {
    const imagenUrl = new URL(url, window.location.origin);

    if (imagenUrl.pathname.startsWith("/fotos/")) {
      return `${imagenUrl.pathname}${imagenUrl.search}`;
    }

    return url;
  } catch {
    return url;
  }
};

const InstafotoSelector = ({
  imagenActual,
  instafotoActual,
  notaId,
  onInstafotoEliminada,
}) => {
  const { watch } = useFormContext();
  const { usuario, token } = useAuth();

  const imagenPrincipal = watch("imagen");
  const titulo = watch("titulo");
  const formato = watch("formato_nota");
  const tipoNota = watch("tiposDeNotaSeleccionadas");

  const [postArchivo, setPostArchivo] = useState(null);
  const [postClaroArchivo, setPostClaroArchivo] = useState(null);
  const [storyArchivo, setStoryArchivo] = useState(null);
  const [storyClaroArchivo, setStoryClaroArchivo] = useState(null);
  const [imagenExistenteArchivo, setImagenExistenteArchivo] = useState(null);
  const [cargandoImagenExistente, setCargandoImagenExistente] = useState(false);
  const [errorImagenExistente, setErrorImagenExistente] = useState("");
  const [postUrl, setPostUrl] = useState(null);
  const [postClaroUrl, setPostClaroUrl] = useState(null);
  const [storyUrl, setStoryUrl] = useState(null);
  const [storyClaroUrl, setStoryClaroUrl] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [errorGeneracion, setErrorGeneracion] = useState("");
  const [regenerarClave, setRegenerarClave] = useState(0);
  const [subiendoLinkInBio, setSubiendoLinkInBio] = useState(false);
  const [mostrarSelectorVersion, setMostrarSelectorVersion] = useState(false);
  const [instafotoSubidaEnSesion, setInstafotoSubidaEnSesion] = useState(false);

  const esImagenPrincipalNueva = Boolean(
    imagenPrincipal && typeof imagenPrincipal !== "string",
  );

  const urlImagenExistente =
    imagenActual ||
    (typeof imagenPrincipal === "string" ? imagenPrincipal : null);

  const imagenParaGenerar = esImagenPrincipalNueva
    ? imagenPrincipal
    : imagenExistenteArchivo;

  const hayImagenDisponible = Boolean(
    esImagenPrincipalNueva || urlImagenExistente,
  );

  const hayInstafotoGuardada = Boolean(
    instafotoActual || instafotoSubidaEnSesion,
  );

  const subirPostLinkInBio = async (archivo) => {
    if (!archivo || !notaId || subiendoLinkInBio) return;

    setSubiendoLinkInBio(true);

    try {
      await notaInstafotoPut(notaId, archivo, token);
      setInstafotoSubidaEnSesion(true);
      setMostrarSelectorVersion(false);
      alert("El Post fue subido correctamente a LinkInBio.");
    } catch (error) {
      console.error("Error subiendo el Post a LinkInBio:", error);
      alert(`No se pudo subir el Post: ${error.message}`);
    } finally {
      setSubiendoLinkInBio(false);
    }
  };

  const eliminarInstafotoGuardada = async () => {
    if (!hayInstafotoGuardada || !notaId) return;

    if (!window.confirm("¿Seguro que deseas eliminar este Post de LinkInBio?")) {
      return;
    }

    try {
      await notaInstafotoDelete(notaId, token);
      setInstafotoSubidaEnSesion(false);
      onInstafotoEliminada?.();
      alert("El Post fue eliminado de LinkInBio.");
    } catch (error) {
      console.error("Error eliminando el Post de LinkInBio:", error);
      alert(`No se pudo eliminar el Post: ${error.message}`);
    }
  };

  useEffect(() => {
    if (esImagenPrincipalNueva || !urlImagenExistente) {
      setImagenExistenteArchivo(null);
      setCargandoImagenExistente(false);
      setErrorImagenExistente("");
      return undefined;
    }

    let cancelado = false;

    const cargarImagenExistente = async () => {
      setCargandoImagenExistente(true);
      setErrorImagenExistente("");

      try {
        const urlDescarga = prepararUrlImagenExistente(urlImagenExistente);
        const respuesta = await fetch(urlDescarga, {
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
        });

        if (!respuesta.ok) {
          throw new Error(`No se pudo descargar la imagen (${respuesta.status})`);
        }

        const blob = await respuesta.blob();

        if (!blob.type.startsWith("image/")) {
          throw new Error("El archivo guardado no es una imagen válida");
        }

        const extension =
          blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        const archivo = new File([blob], `imagen-existente.${extension}`, {
          type: blob.type,
        });

        if (!cancelado) setImagenExistenteArchivo(archivo);
      } catch (error) {
        if (!cancelado) {
          console.error("Error cargando la imagen existente:", error);
          setImagenExistenteArchivo(null);
          setErrorImagenExistente(error.message);
        }
      } finally {
        if (!cancelado) setCargandoImagenExistente(false);
      }
    };

    cargarImagenExistente();

    return () => {
      cancelado = true;
    };
  }, [esImagenPrincipalNueva, urlImagenExistente]);

  useEffect(() => {
    if (!postArchivo) {
      setPostUrl(null);
      return undefined;
    }

    const url = URL.createObjectURL(postArchivo);
    setPostUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [postArchivo]);

  useEffect(() => {
    if (!postClaroArchivo) {
      setPostClaroUrl(null);
      return undefined;
    }

    const url = URL.createObjectURL(postClaroArchivo);
    setPostClaroUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [postClaroArchivo]);

  useEffect(() => {
    if (!storyArchivo) {
      setStoryUrl(null);
      return undefined;
    }

    const url = URL.createObjectURL(storyArchivo);
    setStoryUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [storyArchivo]);

  useEffect(() => {
    if (!storyClaroArchivo) {
      setStoryClaroUrl(null);
      return undefined;
    }

    const url = URL.createObjectURL(storyClaroArchivo);
    setStoryClaroUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [storyClaroArchivo]);

  useEffect(() => {
    if (usuario?.rol === "invitado") return undefined;

    if (!imagenParaGenerar || !titulo?.trim() || !formato || !tipoNota) {
      setPostArchivo(null);
      setPostClaroArchivo(null);
      setStoryArchivo(null);
      setStoryClaroArchivo(null);
      return undefined;
    }

    let cancelado = false;

    const temporizador = setTimeout(async () => {
      setGenerando(true);
      setErrorGeneracion("");

      try {
        const datos = {
          imagen: imagenParaGenerar,
          titulo,
          formato,
          tipoNota,
        };

        const [post, postClaro, story, storyClaro] = await Promise.all([
          generarInstafoto(datos, "oscuro"),
          generarInstafoto(datos, "claro"),
          generarStory(datos, "oscuro"),
          generarStory(datos, "claro"),
        ]);

        if (!cancelado) {
          setPostArchivo(post);
          setPostClaroArchivo(postClaro);
          setStoryArchivo(story);
          setStoryClaroArchivo(storyClaro);
        }
      } catch (error) {
        if (!cancelado) {
          console.error("Error generando imágenes para redes:", error);
          setErrorGeneracion(error.message);
          setPostArchivo(null);
          setPostClaroArchivo(null);
          setStoryArchivo(null);
          setStoryClaroArchivo(null);
        }
      } finally {
        if (!cancelado) setGenerando(false);
      }
    }, 450);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [
    imagenParaGenerar,
    titulo,
    formato,
    tipoNota,
    regenerarClave,
    usuario?.rol,
  ]);

  if (usuario?.rol === "invitado") return null;

  const faltanDatos =
    hayImagenDisponible && (!titulo?.trim() || !formato || !tipoNota);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Imágenes para redes
      </label>

      <p className="mb-3 text-xs text-gray-500">
        Descarga las versiones con fondo negro o blanco. El Post con fondo negro también se puede subir directamente a LinkInBio.
      </p>

      {cargandoImagenExistente && (
        <p className="mt-2 text-sm font-medium text-blue-700">
          Preparando la imagen guardada de la nota...
        </p>
      )}

      {errorImagenExistente && (
        <p className="mt-2 text-xs text-red-600">
          No se pudo usar la imagen guardada: {errorImagenExistente}
        </p>
      )}

      {faltanDatos && (
        <p className="mt-2 text-xs text-amber-700">
          Completa el título, el formato y el tipo de nota para generar las
          imágenes.
        </p>
      )}

      {generando && (
        <p className="mt-2 text-sm font-medium text-blue-700">
          Generando las versiones para redes automáticamente...
        </p>
      )}

      {errorGeneracion && (
        <p className="mt-2 text-xs text-red-600">
          No se pudieron generar: {errorGeneracion}
        </p>
      )}

      {(postUrl || postClaroUrl || storyUrl || storyClaroUrl) && (
        <div className="mt-3 grid grid-cols-2 items-start gap-3">
          {postUrl && (
            <div className="min-w-0">
              <p className="mb-1 text-center text-xs font-bold">
                POST · FONDO NEGRO · 1080 × 1350
              </p>
              <img
                src={postUrl}
                alt="Post para Instagram"
                className="h-auto w-full border shadow"
              />
              <button
                type="button"
                onClick={() =>
                  descargarArchivo(
                    postArchivo,
                    crearNombreSeguro(titulo, "post"),
                  )
                }
                className="mt-2 w-full rounded bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                Descargar Post
              </button>

              <button
                type="button"
                onClick={() => setMostrarSelectorVersion(true)}
                disabled={subiendoLinkInBio || !notaId}
                className="mt-2 w-full rounded px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                }}
              >
                {subiendoLinkInBio
                  ? "Subiendo a LinkInBio..."
                  : hayInstafotoGuardada
                    ? "Reemplazar Post en LinkInBio"
                    : "Subir Post a LinkInBio"}
              </button>

              {!notaId && (
                <p className="mt-1 text-xs text-amber-700">
                  En una nota nueva, guárdala una vez para obtener su ID.
                </p>
              )}
            </div>
          )}

          {postClaroUrl && (
            <div className="min-w-0">
              <p className="mb-1 text-center text-xs font-bold">
                POST · FONDO BLANCO · 1080 × 1350
              </p>
              <img
                src={postClaroUrl}
                alt="Post para Instagram con fondo blanco"
                className="h-auto w-full border shadow"
              />
              <button
                type="button"
                onClick={() =>
                  descargarArchivo(
                    postClaroArchivo,
                    crearNombreSeguro(titulo, "post-blanco"),
                  )
                }
                className="mt-2 w-full rounded bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                Descargar Post blanco
              </button>
            </div>
          )}

          {storyUrl && (
            <div className="min-w-0">
              <p className="mb-1 text-center text-xs font-bold">
                STORY · FONDO NEGRO · 1080 × 1920
              </p>
              <img
                src={storyUrl}
                alt="Story para Instagram"
                className="h-auto w-full border shadow"
              />
              <button
                type="button"
                onClick={() =>
                  descargarArchivo(
                    storyArchivo,
                    crearNombreSeguro(titulo, "story"),
                  )
                }
                className="mt-2 w-full rounded bg-purple-600 px-3 py-2 text-sm font-bold text-white hover:bg-purple-700"
              >
                Descargar Story
              </button>
            </div>
          )}

          {storyClaroUrl && (
            <div className="min-w-0">
              <p className="mb-1 text-center text-xs font-bold">
                STORY · FONDO BLANCO · 1080 × 1920
              </p>
              <img
                src={storyClaroUrl}
                alt="Story para Instagram con fondo blanco"
                className="h-auto w-full border shadow"
              />
              <button
                type="button"
                onClick={() =>
                  descargarArchivo(
                    storyClaroArchivo,
                    crearNombreSeguro(titulo, "story-blanco"),
                  )
                }
                className="mt-2 w-full rounded bg-purple-600 px-3 py-2 text-sm font-bold text-white hover:bg-purple-700"
              >
                Descargar Story blanca
              </button>
            </div>
          )}
        </div>
      )}

      {hayInstafotoGuardada && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3">
          <p className="mb-2 text-sm font-medium text-red-800">
            Esta nota ya tiene un Post guardado en LinkInBio.
          </p>

          <button
            type="button"
            onClick={eliminarInstafotoGuardada}
            className="rounded bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            Eliminar Post de LinkInBio
          </button>
        </div>
      )}

      {mostrarSelectorVersion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="selector-version-linkinbio-titulo"
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
          >
            <h2
              id="selector-version-linkinbio-titulo"
              className="text-lg font-bold text-gray-900"
            >
              ¿Qué versión quieres subir?
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Elige el diseño del Post que aparecerá en LinkInBio.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => subirPostLinkInBio(postArchivo)}
                disabled={subiendoLinkInBio || !postArchivo}
                className="rounded bg-black px-3 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {subiendoLinkInBio ? "Subiendo..." : "Fondo negro"}
              </button>
              <button
                type="button"
                onClick={() => subirPostLinkInBio(postClaroArchivo)}
                disabled={subiendoLinkInBio || !postClaroArchivo}
                className="rounded border border-gray-400 bg-white px-3 py-3 text-sm font-bold text-black hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {subiendoLinkInBio ? "Subiendo..." : "Fondo blanco"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMostrarSelectorVersion(false)}
              disabled={subiendoLinkInBio}
              className="mt-3 w-full rounded px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {hayImagenDisponible && (
        <button
          type="button"
          onClick={() => setRegenerarClave((actual) => actual + 1)}
          disabled={
            generando ||
            cargandoImagenExistente ||
            !imagenParaGenerar ||
            !titulo?.trim() ||
            !formato ||
            !tipoNota
          }
          className="mt-3 rounded bg-yellow-400 px-3 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generando ? "Generando..." : "Regenerar las cuatro versiones"}
        </button>
      )}
    </div>
  );
};

export default InstafotoSelector;
