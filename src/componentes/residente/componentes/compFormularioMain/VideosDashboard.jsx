import { useState, useEffect } from "react";
import { useAuth } from "../../../Context";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaEdit,
  FaPlay,
} from "react-icons/fa";
import {
  obtenerVideos,
  eliminarVideo,
  toggleVideoEstadoInteligente,
} from "../../../api/videosApi";

const etiquetaTitulo = (video) => {
  if (video.titulo?.trim()) return video.titulo.trim();
  if (video.archivo) return "Video sin título";
  try {
    const u = new URL(video.url || "");
    if (u.hostname.includes("instagram")) return "Reel de Instagram";
  } catch {
    /* ignore */
  }
  return video.url || "Sin título";
};

const VideoCard = ({
  video,
  formatearFecha,
  onToggle,
  onEdit,
  onDelete,
  cambiando,
}) => {
  const titulo = etiquetaTitulo(video);
  const esArchivo = Boolean(video.archivo);

  return (
    <article className="flex flex-col text-left">
      <div className="group relative overflow-hidden bg-neutral-900 aspect-[7/13] w-full">
        <img
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={video.imagen}
          alt={titulo}
          onError={(e) => {
            e.target.src = "/fotos/fotos-estaticas/fotodeprueba.png";
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white">
            <FaPlay className="translate-x-0.5" />
          </span>
        </div>
        <div className="absolute left-2 top-2">
          <span
            className={`inline-flex px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              video.tipo === "editorial"
                ? "bg-[#fff200] text-black"
                : "bg-purple-600 text-white"
            }`}
          >
            {video.tipo === "editorial" ? "Editorial" : "Comercial"}
          </span>
        </div>
        <div className="absolute right-2 top-2">
          <span
            className={`inline-flex px-2 py-0.5 text-[11px] font-semibold ${
              video.activo
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {video.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <h3 className="mt-2 px-0.5 text-center text-[16px] font-black leading-tight text-black line-clamp-2">
        {titulo}
      </h3>
      <p className="mt-1 text-center text-[12px] text-black/55 font-roman">
        {formatearFecha(video.fecha)}
        {esArchivo ? " · Archivo" : " · Enlace"}
      </p>

      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onToggle(video.id)}
          disabled={cambiando === video.id}
          className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm ${
            cambiando === video.id
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : video.activo
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
          title={video.activo ? "Desactivar" : "Activar"}
        >
          {cambiando === video.id ? (
            <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
          ) : video.activo ? (
            <FaEyeSlash className="h-4 w-4" />
          ) : (
            <FaEye className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onEdit(video.id)}
          className="inline-flex items-center justify-center rounded-md bg-blue-100 px-3 py-2 text-sm text-blue-700 hover:bg-blue-200"
          title="Editar"
        >
          <FaEdit className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(video)}
          className="inline-flex items-center justify-center rounded-md bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200"
          title="Eliminar"
        >
          <FaTrash className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};

const VideosDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [videoCambiando, setVideoCambiando] = useState(null);

  const limpiarMensajes = () => {
    setTimeout(() => {
      setError(null);
      setMensajeExito(null);
    }, 5000);
  };

  useEffect(() => {
    cargarVideos();
  }, []);

  const cargarVideos = async () => {
    try {
      setCargando(true);
      const videosData = await obtenerVideos(token);
      setVideos(videosData);
    } catch (err) {
      setError("Error al cargar los videos");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const toggleEstado = async (id) => {
    try {
      setVideoCambiando(id);
      const videoActual = videos.find((v) => v.id === id);
      if (!videoActual) throw new Error("Video no encontrado");

      const estadoActual = videoActual.activo;
      const nuevoEstado = !estadoActual;
      const resultado = await toggleVideoEstadoInteligente(
        id,
        token,
        estadoActual,
      );

      if (resultado.success) {
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video.id === id
              ? { ...video, activo: nuevoEstado, estado: nuevoEstado }
              : video,
          ),
        );
        setMensajeExito(
          `Video ${nuevoEstado ? "activado" : "desactivado"} exitosamente`,
        );
        limpiarMensajes();
      } else {
        throw new Error(resultado.message || "Error al cambiar estado");
      }
    } catch (err) {
      console.error("Error en toggle estado:", err);
      setError(`Error al cambiar estado: ${err.message}`);
      limpiarMensajes();
    } finally {
      setVideoCambiando(null);
    }
  };

  const activarTodos = async () => {
    try {
      setCargando(true);
      const videosInactivos = videos.filter((v) => !v.activo);
      if (videosInactivos.length === 0) {
        setError("No hay videos inactivos para activar");
        return;
      }

      setVideos((prevVideos) =>
        prevVideos.map((video) => ({
          ...video,
          activo: true,
          estado: true,
        })),
      );

      for (const video of videosInactivos) {
        try {
          await toggleVideoEstadoInteligente(video.id, token, false);
        } catch (err) {
          console.error(`Error activando video ${video.id}:`, err);
        }
      }

      setMensajeExito("Todos los videos han sido activados exitosamente");
      limpiarMensajes();
    } catch (err) {
      console.error("Error al activar todos:", err);
      setError(`Error al activar videos: ${err.message}`);
      limpiarMensajes();
    } finally {
      setCargando(false);
    }
  };

  const desactivarTodos = async () => {
    try {
      setCargando(true);
      const videosActivos = videos.filter((v) => v.activo);
      if (videosActivos.length === 0) {
        setError("No hay videos activos para desactivar");
        return;
      }

      setVideos((prevVideos) =>
        prevVideos.map((video) => ({
          ...video,
          activo: false,
          estado: false,
        })),
      );

      for (const video of videosActivos) {
        try {
          await toggleVideoEstadoInteligente(video.id, token, true);
        } catch (err) {
          console.error(`Error desactivando video ${video.id}:`, err);
        }
      }

      setMensajeExito("Todos los videos han sido desactivados exitosamente");
      limpiarMensajes();
    } catch (err) {
      console.error("Error al desactivar todos:", err);
      setError(`Error al desactivar videos: ${err.message}`);
      limpiarMensajes();
    } finally {
      setCargando(false);
    }
  };

  const eliminarVideoHandler = async (id) => {
    try {
      await eliminarVideo(id, token);
      setVideos((prev) => prev.filter((video) => video.id !== id));
      setConfirmarEliminar(null);
      setMensajeExito("Video eliminado exitosamente");
      limpiarMensajes();
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError(`Error al eliminar video: ${err.message}`);
      limpiarMensajes();
    }
  };

  const formatearFecha = (fecha) =>
    new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const videosActivos = videos.filter((v) => v.activo);
  const videosInactivos = videos.filter((v) => !v.activo);

  if (cargando) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Cargando videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 text-left">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de Videos
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Regresar
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={cargarVideos}
                className="inline-flex items-center rounded-lg border border-yellow-300 bg-yellow-100 px-4 py-2 text-gray-700 hover:bg-yellow-200"
              >
                Recargar
              </button>
              <button
                type="button"
                onClick={activarTodos}
                className="inline-flex items-center rounded-lg border border-green-300 bg-green-100 px-4 py-2 text-green-700 hover:bg-green-200"
              >
                Activar todos
              </button>
              <button
                type="button"
                onClick={desactivarTodos}
                className="inline-flex items-center rounded-lg border border-red-300 bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
              >
                Desactivar todos
              </button>
              <button
                type="button"
                onClick={() => navigate("/videosFormulario")}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Nuevo video
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
          </div>
          <div className="bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Activos</p>
            <p className="text-2xl font-bold text-green-700">
              {videosActivos.length}
            </p>
          </div>
          <div className="bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Inactivos</p>
            <p className="text-2xl font-bold text-red-700">
              {videosInactivos.length}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}
        {mensajeExito && (
          <div className="mb-4 border border-green-200 bg-green-50 p-4 text-green-800">
            {mensajeExito}
          </div>
        )}

        {videos.length === 0 ? (
          <div className="bg-white px-6 py-16 text-center shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">No hay videos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Sube el primero con título y archivo.
            </p>
            <button
              type="button"
              onClick={() => navigate("/videosFormulario")}
              className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Crear video
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <section id="videos-activos">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                <FaEye className="h-5 w-5 text-green-600" />
                Videos activos ({videosActivos.length})
              </h2>
              {videosActivos.length === 0 ? (
                <p className="text-sm text-gray-500">No hay videos activos.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {videosActivos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      formatearFecha={formatearFecha}
                      onToggle={toggleEstado}
                      onEdit={(id) => navigate(`/videosFormulario/${id}`)}
                      onDelete={setConfirmarEliminar}
                      cambiando={videoCambiando}
                    />
                  ))}
                </div>
              )}
            </section>

            <section id="videos-inactivos">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                <FaEyeSlash className="h-5 w-5 text-red-600" />
                Videos inactivos ({videosInactivos.length})
              </h2>
              {videosInactivos.length === 0 ? (
                <p className="text-sm text-gray-500">No hay videos inactivos.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {videosInactivos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      formatearFecha={formatearFecha}
                      onToggle={toggleEstado}
                      onEdit={(id) => navigate(`/videosFormulario/${id}`)}
                      onDelete={setConfirmarEliminar}
                      cambiando={videoCambiando}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {confirmarEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white p-6 shadow-lg">
            <h3 className="text-lg font-medium text-gray-900">
              Confirmar eliminación
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              ¿Eliminar “{etiquetaTitulo(confirmarEliminar)}”? Esta acción no se
              puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmarEliminar(null)}
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => eliminarVideoHandler(confirmarEliminar.id)}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosDashboard;
