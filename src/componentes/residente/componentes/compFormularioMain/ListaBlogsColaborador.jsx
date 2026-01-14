import { useEffect, useState } from "react";
import { useAuth } from "../../../Context";
import { getColaboradores, getRespuestasPorColaborador, putRespuestaSemana, deleteRespuestaSemana } from "../../../api/temaSemanaApi";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const ListaBlogsColaborador = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [publicaciones, setPublicaciones] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [eliminando, setEliminando] = useState(null);
  const [colaboradorId, setColaboradorId] = useState(null);
  const blogsPorPagina = 15;

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('es-MX', opciones);
  };

  useEffect(() => {
    const loadBlogsColaborador = async () => {
      try {
        const colaboradores = await getColaboradores();

        const colaboradorActual = colaboradores.find(
          (c) => c.usuario_id === usuario?.id
        );

        if (!colaboradorActual) {
          setCargando(false);
          return;
        }

        setColaboradorId(colaboradorActual.id);
        const respuestas = await getRespuestasPorColaborador(colaboradorActual.id);
        const blogs = respuestas.filter((pub) => pub.respuesta_consejo == 0);
        setPublicaciones(blogs);
      } catch (error) {
        console.error("Error cargando blogs del colaborador:", error);
        setPublicaciones([]);
      } finally {
        setCargando(false);
      }
    };

    if (usuario?.id) {
      loadBlogsColaborador();
    }
  }, [usuario]);

  // 🗑️ Eliminar colaboración
  const eliminarColaboracion = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta colaboración?")) {
      return;
    }

    setEliminando(id);
    try {
      await deleteRespuestaSemana(id);
      setPublicaciones(publicaciones.filter(pub => pub.id !== id));
      alert("Colaboración eliminada correctamente");
    } catch (error) {
      console.error("Error eliminando colaboración:", error);
      alert("Error al eliminar la colaboración");
    } finally {
      setEliminando(null);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalBlogs = publicaciones.length;
  const totalPaginas = Math.ceil(totalBlogs / blogsPorPagina);
  const inicioIndice = (paginaActual - 1) * blogsPorPagina;
  const finIndice = Math.min(inicioIndice + blogsPorPagina, totalBlogs);
  const blogsPaginaActual = publicaciones.slice(inicioIndice, finIndice);

  const irAPaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  };

  if (publicaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          Aún no has publicado ninguna colaboración. ¡Empieza ahora!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <h2 className="text-2xl font-bold text-center mb-6">Mis Colaboraciones</h2>

      {/* Lista de colaboraciones como en NotaCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogsPaginaActual.map((pub) => (
          <Link
            key={pub.id}
            to={`/colaboradores?editar=${pub.id}`}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all duration-300 h-full flex-col group relative cursor-pointer block"
            style={{
              minHeight: '300px',
              position: 'relative'
            }}
          >
            {/* Imagen de fondo */}
            {pub.imagen ? (
              <div
                className="absolute inset-0 w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-110"
                style={{
                  backgroundImage: `url(${pub.imagen})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0
                }}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 z-0" />
            )}

            {/* Overlay oscuro en hover para mejor visibilidad de botones */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 z-10" />

            {/* Contenido encima de la imagen */}
            <div className="flex flex-col justify-between items-end h-full relative z-20">
              {/* Badge de tipo en esquina superior derecha */}
              <div className="absolute top-0 right-0 z-30">
                <div className="bg-blue-600 text-white font-bold text-lg px-2 py-1 rounded-bl-lg shadow-lg">
                  COLABORACIÓN
                </div>
              </div>

              { /* Botón de editar en esquina superior izquierda */}
              <div className="absolute top-0 left-0 z-30 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-5px] group-hover:translate-y-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/colaboradores?editar=${pub.id}`);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 inline-block"
                  title="Editar colaboración"
                >
                  <FaEdit size={18} />
                </button>
              </div>

              {/* Datos arriba */}
              <div className="w-full flex items-center flex-col p-2">
                <div className="px-2 pt-2 w-full flex flex-col gap-0">
                  <span className="font-roman font-semibold px-2 py-1 text-xs rounded-full bg-black/30 backdrop-blur-md text-white drop-shadow w-fit">
                    {formatFecha(pub.created_at)}
                  </span>
                  <span className="font-sans font-semibold px-2 py-1 text-xs rounded-full bg-black/30 backdrop-blur-md text-white drop-shadow w-fit">
                    Por: {pub.nombre}
                  </span>
                </div>
              </div>

              {/* Título abajo en recuadro blanco */}
              <div className="w-full">
                <div className="bg-white p-2">
                  <h2 className="text-base font-bold text-gray-900 mb-1 leading-4.5">
                    {pub.titulo}
                  </h2>
                  {/* Botón de eliminar dentro de la tarjeta */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      eliminarColaboracion(pub.id);
                    }}
                    disabled={eliminando === pub.id}
                    className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-all duration-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    title="Eliminar colaboración"
                  >
                    {eliminando === pub.id ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <FaTrash size={14} />
                        <span>Eliminar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex flex-col items-center mt-8 space-y-4">
          {/* Información de paginación */}
          <div className="text-sm text-gray-600">
            Mostrando {inicioIndice + 1} - {finIndice} de {totalBlogs} colaboraciones
          </div>

          {/* Navegación de páginas */}
          <div className="flex items-center space-x-2">
            {/* Botón anterior */}
            <button
              onClick={irAPaginaAnterior}
              disabled={paginaActual === 1}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              ← Anterior
            </button>

            {/* Números de página */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                const mostrarPagina =
                  numero === 1 ||
                  numero === totalPaginas ||
                  (numero >= paginaActual - 2 && numero <= paginaActual + 2);

                if (!mostrarPagina) {
                  if (numero === paginaActual - 3 || numero === paginaActual + 3) {
                    return <span key={numero} className="px-2 py-2 text-gray-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={numero}
                    onClick={() => irAPagina(numero)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${numero === paginaActual
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                  >
                    {numero}
                  </button>
                );
              })}
            </div>

            {/* Botón siguiente */}
            <button
              onClick={irAPaginaSiguiente}
              disabled={paginaActual === totalPaginas}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === totalPaginas
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaBlogsColaborador;