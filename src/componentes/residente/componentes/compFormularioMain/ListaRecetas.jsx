import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { recetasGetTodas, recetaBorrar } from "../../../api/recetasApi";
import { FaTrash, FaEdit, FaCopy, FaEllipsisV } from "react-icons/fa";
import { urlApi, imgApi } from "../../../api/url";

import { useAuth } from "../../../Context";

const ListaRecetas = ({ onEditar, onCopiar, onRecetaEliminada }) => {
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(null);

  // Estados para paginación
  const recetasPorPagina = 15;
  const paginaInicial = parseInt(searchParams.get("pageRecetas")) || 1;
  const [paginaActual, setPaginaActualInternal] = useState(paginaInicial);
  const [totalRecetas, setTotalRecetas] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  // Función para cambiar página y actualizar URL
  const setPaginaActual = useCallback((pagina) => {
    const nuevaPagina = typeof pagina === 'function' ? pagina(paginaActual) : pagina;
    setPaginaActualInternal(nuevaPagina);

    // Actualizar URL manteniendo otros params
    const newParams = new URLSearchParams(searchParams);
    if (nuevaPagina === 1) {
      newParams.delete("pageRecetas");
    } else {
      newParams.set("pageRecetas", nuevaPagina.toString());
    }
    setSearchParams(newParams, { replace: true });
  }, [paginaActual, searchParams, setSearchParams]);

  const cargarRecetas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Determinar si es admin o invitado
      const esAdmin = usuario?.permisos === 'todos' || usuario?.permisos === 'todo';
      const esInvitado = usuario?.rol?.toLowerCase() === 'invitado';

      // Construir filtros para la API
      const filtros = {};

      if (!esAdmin) {
        // Para invitados, filtrar por nombre_usuario como autor
        // Para otros usuarios, filtrar por permisos como autor
        filtros.autor = esInvitado
          ? usuario.nombre_usuario
          : usuario.permisos?.replace(/-/g, ' ');
      }

      // Usar paginación del servidor CON filtro de autor
      const response = await recetasGetTodas(paginaActual, recetasPorPagina, filtros);
      const recetasData = response?.recetas || [];

      setRecetas(recetasData);
      setTotalRecetas(response?.total || recetasData.length);
      setTotalPaginas(response?.totalPages || Math.ceil((response?.total || recetasData.length) / recetasPorPagina));
    } catch (err) {
      setError(err.message || 'Error al cargar las recetas');
    } finally {
      setLoading(false);
    }
  }, [paginaActual, usuario?.permisos, usuario?.rol, usuario?.nombre_usuario]);

  useEffect(() => {
    cargarRecetas();
  }, [cargarRecetas]);

  // Funciones de navegación de páginas
  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const irAPagina = (pagina) => {
    setPaginaActual(pagina);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta receta?")) return;
    setEliminando(id);
    setMenuAbierto(null);
    try {
      await recetaBorrar(id);
      setRecetas(recetas.filter(r => r.id !== id));
      if (onRecetaEliminada) {
        onRecetaEliminada();
      }
      alert("Receta eliminada correctamente");
    } catch (err) {
      alert("Error al borrar la receta: " + (err.message || "Error desconocido"));
    } finally {
      setEliminando(null);
    }
  };

  const handleEditar = (receta) => {
    setMenuAbierto(null);
    if (onEditar) {
      onEditar(receta);
    }
  };

  const handleCopiar = (receta) => {
    setMenuAbierto(null);
    if (onCopiar) {
      onCopiar(receta);
    } else {
      const recetaParaCopiar = {
        ...receta,
        id: undefined
      };
      navigator.clipboard.writeText(JSON.stringify(recetaParaCopiar, null, 2));
      alert("Datos de la receta copiados al portapapeles");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const date = new Date(fecha);
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${mes} ${dia}, ${año} ${horas}:${minutos}`;
  };

  // Función helper para construir la URL de la imagen
  const construirUrlImagen = (receta) => {
    try {
      if (!receta?.imagen) {
        return `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
      }

      const imagenStr = String(receta.imagen).trim();

      if (!imagenStr) {
        return `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
      }

      if (imagenStr.startsWith('http://') || imagenStr.startsWith('https://')) {
        try {
          const urlObj = new URL(imagenStr);
          const pathname = urlObj.pathname;

          if (urlObj.hostname.includes('admin.residente.mx')) {
            const filename = pathname.split('/').pop();
            if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              return `${urlApi.replace(/\/$/, '')}/api/recetas/imagen/${encodeURIComponent(filename)}`;
            }
          }

          if (urlObj.hostname.includes('residente.mx') && !urlObj.hostname.includes('admin')) {
            const pathSegments = pathname.split('/').map(segment => {
              if (!segment) return '';
              return encodeURIComponent(segment);
            });
            urlObj.pathname = pathSegments.join('/');
            return urlObj.toString();
          }

          const filename = pathname.split('/').pop();
          if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return `${urlApi.replace(/\/$/, '')}/api/recetas/imagen/${encodeURIComponent(filename)}`;
          }

          return encodeURI(imagenStr);
        } catch (e) {
          const match = imagenStr.match(/\/([^\/]+\.(webp|jpg|jpeg|png|gif))(\?|$)/i);
          if (match && match[1]) {
            return `${urlApi.replace(/\/$/, '')}/api/recetas/imagen/${encodeURIComponent(match[1])}`;
          }
          return `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
        }
      }

      if (imagenStr.startsWith('/uploads/recetas/')) {
        const filename = imagenStr.split('/').pop();
        return `${urlApi.replace(/\/$/, '')}/api/recetas/imagen/${encodeURIComponent(filename)}`;
      }

      if (imagenStr.startsWith('/fotos/')) {
        const pathSegments = imagenStr.split('/').map(segment =>
          segment ? encodeURIComponent(segment) : ''
        ).join('/');
        return `${imgApi.replace(/\/$/, '')}${pathSegments}`;
      }

      const filename = imagenStr.split('/').pop();
      if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return `${urlApi.replace(/\/$/, '')}/api/recetas/imagen/${encodeURIComponent(filename)}`;
      }

      const imagenPath = imagenStr.startsWith('/') ? imagenStr : `/${imagenStr}`;
      const pathSegments = imagenPath.split('/').map(segment =>
        segment ? encodeURIComponent(segment) : ''
      ).join('/');
      return `${imgApi.replace(/\/$/, '')}${pathSegments}`;
    } catch (error) {
      return `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
    }
  };

  // Calcular índices para mostrar
  const inicioIndice = (paginaActual - 1) * recetasPorPagina;
  const finIndice = Math.min(inicioIndice + recetasPorPagina, totalRecetas);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Cargando recetas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recetas.length === 0 ? (
        <div className="px-6 py-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">No hay recetas registradas</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recetas.map((receta) => (
              <div
                key={receta.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
              >
                {/* Imagen */}
                <div className="relative h-64 overflow-hidden bg-gray-200">
                  <img
                    src={construirUrlImagen(receta)}
                    alt={receta.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (e.target.src.includes('SinFoto')) {
                        return;
                      }
                      if (e.target.src.includes('/api/recetas/imagen/')) {
                        e.target.src = `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
                        return;
                      }
                      if (receta.imagen) {
                        let filename = null;
                        if (receta.imagen.startsWith('http://') || receta.imagen.startsWith('https://')) {
                          try {
                            const urlObj = new URL(receta.imagen);
                            filename = urlObj.pathname.split('/').pop();
                          } catch (err) {
                            const match = receta.imagen.match(/\/([^\/]+\.(webp|jpg|jpeg|png|gif))(\?|$)/i);
                            if (match && match[1]) {
                              filename = match[1];
                            }
                          }
                        } else if (receta.imagen.includes('/')) {
                          filename = receta.imagen.split('/').pop();
                        } else {
                          filename = receta.imagen;
                        }
                        if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                          const urlApiBackend = `${urlApi.replace(/\/$/, '')}/api/recetas/imagen/${encodeURIComponent(filename)}`;
                          e.target.src = urlApiBackend;
                          return;
                        }
                      }
                      e.target.src = `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
                    }}
                  />

                  {/* Tag de estado */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      Publicada
                    </span>
                  </div>

                  {/* Banner rosa con nombre del autor */}
                  <div className="absolute top-0 right-0 bg-pink-500 text-white px-3 py-1.5 font-bold text-xs z-20">
                    {receta.autor ? receta.autor.toUpperCase() : "AUTOR"}
                  </div>

                  {/* Menú de acciones */}
                  <div className="absolute top-10 right-3 z-20">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuAbierto(menuAbierto === receta.id ? null : receta.id);
                        }}
                        className="bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-colors"
                        title="Opciones"
                      >
                        <FaEllipsisV className="text-gray-700 text-xs" />
                      </button>
                      {menuAbierto === receta.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-30">
                          <button
                            onClick={() => handleEditar(receta)}
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                          >
                            <FaEdit className="text-xs" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleCopiar(receta)}
                            className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                          >
                            <FaCopy className="text-xs" />
                            Copiar
                          </button>
                          <button
                            onClick={() => handleEliminar(receta.id)}
                            disabled={eliminando === receta.id}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                          >
                            <FaTrash className="text-xs" />
                            {eliminando === receta.id ? "Eliminando..." : "Borrar"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información sobrepuesta en la imagen */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 text-white">
                    <div className="text-[10px] mb-0.5 font-medium">
                      {formatearFecha(receta.fecha_envio)}
                    </div>
                    <div className="text-[10px] opacity-90">
                      Último autor: {receta.autor || "Desconocido"}
                    </div>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <span className="font-semibold">{receta.autor || "Autor"}:</span> {receta.descripcion || receta.titulo || "Sin descripción"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Información y controles de paginación */}
          <div className="flex flex-col items-center mt-8 space-y-4">
            {/* Información de paginación */}
            <div className="text-sm text-gray-600">
              Mostrando {inicioIndice + 1} - {finIndice} de {totalRecetas} recetas
            </div>

            {/* Navegación de páginas */}
            {totalPaginas > 1 && (
              <div className="flex items-center space-x-2">
                {/* Botón anterior */}
                <button
                  onClick={irAPaginaAnterior}
                  disabled={paginaActual === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
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
                        return (
                          <span key={numero} className="px-2 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={numero}
                        onClick={() => irAPagina(numero)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${numero === paginaActual
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
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
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Cerrar menú al hacer clic fuera */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setMenuAbierto(null)}
        />
      )}
    </div>
  );
};

export default ListaRecetas;
