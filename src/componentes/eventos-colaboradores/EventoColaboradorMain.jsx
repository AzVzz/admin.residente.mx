import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useAuth } from "../Context";
import {
  eventoColaboradorCrear,
  eventoColaboradorEditar,
  eventoColaboradorGet,
  eventoColaboradorBorrar,
  eventoColaboradorSubirImagen,
  urlImagenEvento,
} from "../api/eventosColaboradoresApi";
import { CATEGORIAS, FORMATOS } from "./ListaEventosColaboradores";
import { EVENTOS_DASHBOARD_BASE } from "./EventosDashboardLayout";
import EventosEtiquetados from "./EventosEtiquetados";
// Mismos componentes del editor de notas de Residente.
import Titulo from "../residente/componentes/compFormularioMain/componentes/Titulo";
import Subtitulo from "../residente/componentes/compFormularioMain/componentes/Subtitulo";
import Autor from "../residente/componentes/compFormularioMain/componentes/Autor";
import Contenido from "../residente/componentes/compFormularioMain/componentes/Contenido";
import SlugInput from "../residente/componentes/compFormularioMain/componentes/SlugInput";
import StickersNotaSelector from "../residente/componentes/compFormularioMain/componentes/StickersNotaSelector";
import BotonSubmitNota from "../residente/componentes/compFormularioMain/componentes/BotonSubmitNota";

const LISTA = `${EVENTOS_DASHBOARD_BASE}/notas`;
const FORMATOS_VALIDOS = FORMATOS.map(([v]) => v);

const campoAside =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelAside = "block text-sm font-medium text-gray-800 mb-2";

const sinHtml = (html) =>
  (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

/** ISO → valor de <input type="datetime-local"> en hora local. */
const aDatetimeLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const formatoPeso = (bytes) =>
  bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const VALORES_INICIALES = {
  titulo: "",
  subtitulo: "",
  contenido: "",
  slug: "",
  autor: "",
  categoria: "",
  formato: "noticia",
  sticker: [],
  eventosEtiquetados: [],
  opcionPublicacion: "borrador",
  fechaProgramada: "",
  fecha_inicio_evento: "",
  fecha_fin_evento: "",
  lugar_evento: "",
  link_boletos: "",
};

const EventoColaboradorMain = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = !!id;
  const [searchParams] = useSearchParams();
  const formatoQuery = searchParams.get("formato");

  const methods = useForm({
    defaultValues: {
      ...VALORES_INICIALES,
      ...(FORMATOS_VALIDOS.includes(formatoQuery) ? { formato: formatoQuery } : {}),
    },
  });
  const { register, watch, setValue, reset, getValues } = methods;

  const [imagen, setImagen] = useState(null); // { imagen_url, imagen_miniatura_url } de la foto actual
  const [imagenCambiada, setImagenCambiada] = useState(false);
  const [imagenInfo, setImagenInfo] = useState(null);
  const [previewRota, setPreviewRota] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [loading, setLoading] = useState(esEdicion);
  const [isPosting, setIsPosting] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const formato = watch("formato");
  const esEvento = formato === "evento_destacado";
  const listaDestino = esEvento ? `${EVENTOS_DASHBOARD_BASE}/eventos` : LISTA;

  // ---- Cargar nota (edición) ----
  useEffect(() => {
    if (!esEdicion) return;
    eventoColaboradorGet(id, token)
      .then((n) => {
        reset({
          titulo: n.titulo || "",
          subtitulo: n.subtitulo || "",
          contenido: n.contenido || "",
          slug: n.slug || "",
          autor: n.nombre_organizador || "",
          categoria: n.categoria || "",
          formato: n.formato || "noticia",
          sticker: Array.isArray(n.stickers) ? n.stickers : [],
          eventosEtiquetados: Array.isArray(n.eventos_etiquetados) ? n.eventos_etiquetados : [],
          opcionPublicacion:
            n.estado_editorial === "publicado" ? "publicada" : n.estado_editorial === "programado" ? "programar" : "borrador",
          fechaProgramada: aDatetimeLocal(n.fecha_publicacion),
          fecha_inicio_evento: n.fecha_inicio_evento ? n.fecha_inicio_evento.slice(0, 10) : "",
          fecha_fin_evento: n.fecha_fin_evento ? n.fecha_fin_evento.slice(0, 10) : "",
          lugar_evento: n.lugar_evento || "",
          link_boletos: n.link_boletos || "",
        });
        if (n.imagen_url) {
          setImagen({ imagen_url: n.imagen_url, imagen_miniatura_url: n.imagen_miniatura_url });
          setPreviewRota(false);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, esEdicion, token, reset]);

  // ---- Imagen de la nota: se sube al elegirla; el servidor la convierte a AVIF ----
  const subirImagenNota = async (file) => {
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      if (file) setError("La imagen debe ser un archivo válido");
      return;
    }
    setError(null);
    setSubiendoImagen(true);
    try {
      const r = await eventoColaboradorSubirImagen(file, token);
      setImagen({ imagen_url: r.imagen_url, imagen_miniatura_url: r.imagen_miniatura_url });
      setPreviewRota(false);
      setImagenCambiada(true);
      setImagenInfo(`Original ${formatoPeso(r.bytes_original)} → AVIF ${formatoPeso(r.bytes)}`);
    } catch (err) {
      setError(err.message || "No se pudo subir la imagen");
    } finally {
      setSubiendoImagen(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const quitarImagen = () => {
    setImagen(null);
    setPreviewRota(false);
    setImagenCambiada(true);
    setImagenInfo(null);
  };
  // Imágenes dentro del contenido: misma conversión y carpeta de Vivir y Convivir.
  const subirImagenContenido = async (file) => {
    if (!(file instanceof File)) throw new Error("La imagen debe ser un archivo válido");
    const r = await eventoColaboradorSubirImagen(file, token);
    return urlImagenEvento(r.imagen_url);
  };

  // ---- Campos obligatorios para publicar (igual que el editor original) ----
  const v = watch();
  const faltantes = [];
  if (!v.titulo?.trim()) faltantes.push("título");
  if (!v.slug?.trim()) faltantes.push("slug");
  if (!v.subtitulo?.trim()) faltantes.push("subtítulo");
  if (!imagen) faltantes.push("imagen");
  if (!sinHtml(v.contenido)) faltantes.push("contenido");
  if (!v.categoria) faltantes.push("categoría");
  if (!Array.isArray(v.sticker) || v.sticker.length < 2) faltantes.push("selecciona 2 stickers");
  if (esEvento && !v.fecha_inicio_evento) faltantes.push("fecha del evento");
  const faltanCampos = faltantes.length > 0;

  // ---- Guardar ----
  const guardar = async (modo) => {
    // modo: "borrador" | "opcion" (usa Publicada / Programar / Borrador elegido)
    setError(null);
    const d = getValues();
    if (!d.titulo?.trim()) return setError("El título es obligatorio.");

    let estado = "borrador";
    if (modo === "opcion") {
      if (d.opcionPublicacion === "publicada") estado = "publicado";
      else if (d.opcionPublicacion === "programar") estado = "programado";
    }
    if (estado !== "borrador" && faltanCampos) return setError(`Para publicar falta: ${faltantes.join(", ")}.`);
    if (estado === "programado" && !d.fechaProgramada) return setError("Indica la fecha y hora de publicación.");

    const payload = {
      titulo: d.titulo.trim(),
      subtitulo: d.subtitulo?.trim() || null,
      descripcion: d.subtitulo?.trim() || null,
      slug: d.slug?.trim() || null,
      contenido: sinHtml(d.contenido) ? d.contenido : null,
      categoria: d.categoria || null,
      formato: d.formato,
      estado_editorial: estado,
      fecha_publicacion: estado === "programado" ? new Date(d.fechaProgramada).toISOString() : null,
      stickers: d.sticker || [],
      eventos_etiquetados: esEvento ? [] : d.eventosEtiquetados || [],
      nombre_organizador: d.autor?.trim() || null,
      fecha_inicio_evento: esEvento ? d.fecha_inicio_evento || null : null,
      fecha_fin_evento: esEvento ? d.fecha_fin_evento || null : null,
      lugar_evento: esEvento ? d.lugar_evento?.trim() || null : null,
      link_boletos: esEvento ? d.link_boletos?.trim() || null : null,
      activo_manual: true,
    };
    if (imagenCambiada || !esEdicion) {
      payload.imagen_url = imagen?.imagen_url || null;
      payload.imagen_miniatura_url = imagen?.imagen_miniatura_url || null;
    }

    setIsPosting(true);
    try {
      if (esEdicion) await eventoColaboradorEditar(id, payload, token);
      else await eventoColaboradorCrear(payload, token);
      navigate(payload.formato === "evento_destacado" ? `${EVENTOS_DASHBOARD_BASE}/eventos` : LISTA);
    } catch (err) {
      setError(err.message || "Error al guardar");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsPosting(false);
    }
  };

  const eliminar = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar esta nota?")) return;
    setEliminando(true);
    try {
      await eventoColaboradorBorrar(id, token);
      navigate(listaDestino);
    } catch (err) {
      setError(err.message || "Error al eliminar");
      setEliminando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const radioClass = "w-4 h-4 text-yellow-600 bg-white border-yellow-300 focus:ring-yellow-500";

  return (
    <div className="py-2">
      <FormProvider {...methods}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4 text-center">
            <h2 className="leading-tight text-2xl font-bold">{esEdicion ? "Editar Nota" : "Nueva Nota"}</h2>
            <p className="text-gray-600 mt-2">
              {esEdicion ? "Edita la publicación existente" : "Crea una nueva publicación completando los siguientes campos"}
            </p>
          </div>

          <div className="flex gap-6 items-start">
            {/* Columna izquierda */}
            <aside className="w-72 shrink-0">
              <div className="pb-4">
                <label className={labelAside}>Formato de nota</label>
                <select {...register("formato")} className={campoAside}>
                  {FORMATOS.map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="pb-4">
                <Autor />
              </div>
              {!esEvento && (
                <div className="pb-4">
                  <Controller
                    name="eventosEtiquetados"
                    control={methods.control}
                    render={({ field }) => <EventosEtiquetados value={field.value} onChange={field.onChange} />}
                  />
                </div>
              )}
              {esEvento && (
                <>
                  <div className="pb-4">
                    <label className={labelAside}>Fecha del evento *</label>
                    <input type="date" {...register("fecha_inicio_evento")} className={campoAside} />
                  </div>
                  <div className="pb-4">
                    <label className={labelAside}>
                      Fecha final <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                    </label>
                    <input type="date" {...register("fecha_fin_evento")} className={campoAside} />
                  </div>
                  <div className="pb-4">
                    <label className={labelAside}>Lugar</label>
                    <input type="text" {...register("lugar_evento")} className={campoAside} />
                  </div>
                  <div className="pb-4">
                    <label className={labelAside}>Enlace (boletos o sitio)</label>
                    <input type="url" {...register("link_boletos")} className={campoAside} />
                  </div>
                </>
              )}
            </aside>

            {/* Columna derecha */}
            <div className="flex-1 min-w-0">
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{error}</div>
              )}

              <div className="pb-4"><Titulo /></div>
              <div className="pb-4"><Subtitulo /></div>
              <div className="pb-4">
                <Contenido subirImagen={subirImagenContenido} sinMenciones />
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de la nota</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => subirImagenNota(e.target.files?.[0])}
                    className="block w-full text-sm rounded-md py-2 px-3 border border-gray-300 text-gray-500 cursor-pointer bg-white"
                  />
                  {subiendoImagen && <p className="text-xs text-gray-500 mt-1">Subiendo y optimizando…</p>}
                  {imagenInfo && <p className="text-xs text-gray-500 mt-1">{imagenInfo}</p>}
                  {imagen && (
                    <div className="mt-2">
                      {previewRota ? (
                        <div className="mb-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                          La imagen guardada no se pudo cargar. Vuelve a
                          seleccionar un archivo.
                        </div>
                      ) : (
                        <img
                          src={urlImagenEvento(imagen.imagen_url)}
                          alt="Imagen de la nota"
                          className="max-h-68 shadow border mb-2"
                          onError={() => setPreviewRota(true)}
                        />
                      )}
                      <button
                        type="button"
                        onClick={quitarImagen}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Categoría (mismo diseño que las tarjetas de Etiqueta / Ocasión) */}
              <div className="grid grid-cols-5 gap-2 justify-center mb-3 pb-1">
                <div className="p-1 border border-gray-200 rounded-md bg-white flex flex-col h-full">
                  <p className="mb-2 text-lg font-bold bg-gray-100 p-1 text-center rounded text-gray-700">Categoría</p>
                  <div className="flex-1 overflow-y-auto max-h-96 px-1">
                    <Controller
                      name="categoria"
                      control={methods.control}
                      render={({ field }) => (
                        <>
                          {CATEGORIAS.map(([val, label]) => (
                            <label key={val} className="block mb-1 cursor-pointer hover:bg-gray-50 p-1 rounded text-sm">
                              <input
                                type="radio"
                                value={val}
                                checked={field.value === val}
                                onClick={() => {
                                  if (field.value === val) field.onChange("");
                                }}
                                onChange={() => {
                                  if (field.value !== val) field.onChange(val);
                                }}
                                className="mr-1.5 align-middle"
                              />
                              <span className="align-middle">{label}</span>
                            </label>
                          ))}
                          <div className="text-xs text-gray-400 mt-2 italic text-center">Selecciona una.</div>
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="pb-4">
                <SlugInput prefijo="residente.mx/eventos-colaboradores/" />
              </div>

              <div className="pb-4">
                <StickersNotaSelector
                  onStickerSelect={(clave) => setValue("sticker", clave)}
                  stickerSeleccionado={watch("sticker")}
                  maxStickers={2}
                />
              </div>

              {/* Opciones de publicación */}
              <div className="mb-6 pb-4 p-4 bg-white rounded-lg">
                <div className="mt-4">
                  <label className="block text-sm font-medium text-yellow-800 mb-3">Opciones de Publicación</label>

                  {faltanCampos && (
                    <div className="mb-2 text-red-600 text-sm font-medium">
                      Si quieres publicar llena los campos faltantes: {faltantes.join(", ")}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="publicar-ahora"
                        value="publicada"
                        {...register("opcionPublicacion")}
                        className={radioClass}
                        disabled={faltanCampos}
                      />
                      <label
                        htmlFor="publicar-ahora"
                        className={`text-sm text-yellow-800 cursor-pointer ${faltanCampos ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Publicada
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="programar"
                        value="programar"
                        {...register("opcionPublicacion")}
                        className={radioClass}
                        disabled={faltanCampos}
                      />
                      <label
                        htmlFor="programar"
                        className={`text-sm text-yellow-800 cursor-pointer ${faltanCampos ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Programar
                      </label>
                    </div>

                    <div className="ml-6 space-y-2">
                      <label htmlFor="fecha-programada" className="block text-xs text-yellow-700">
                        Fecha y hora de publicación
                      </label>
                      <input
                        id="fecha-programada"
                        type="datetime-local"
                        {...register("fechaProgramada")}
                        className="w-full max-w-xs px-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-yellow-500 disabled:bg-yellow-100 disabled:cursor-not-allowed"
                        disabled={watch("opcionPublicacion") !== "programar"}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="borrador"
                        value="borrador"
                        {...register("opcionPublicacion")}
                        className={radioClass}
                      />
                      <label htmlFor="borrador" className="text-sm text-yellow-800 cursor-pointer">
                        Borrador
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {esEdicion && (
                <div className="flex justify-end pb-4">
                  <button
                    type="button"
                    onClick={eliminar}
                    disabled={eliminando}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      eliminando ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                    }`}
                  >
                    {eliminando ? "Eliminando..." : "Eliminar Nota"}
                  </button>
                </div>
              )}

              <div className="flex w-full gap-5 pb-8 mb-8 border-b-2 border-black/50">
                <BotonSubmitNota
                  isPosting={isPosting}
                  notaId={id}
                  guardarComo="actualizada"
                  onClick={() => guardar("opcion")}
                  disabled={isPosting || subiendoImagen}
                />
                <BotonSubmitNota
                  isPosting={isPosting}
                  notaId={id}
                  guardarComo="cambios"
                  onClick={() => guardar("borrador")}
                  disabled={isPosting || subiendoImagen}
                />
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default EventoColaboradorMain;
