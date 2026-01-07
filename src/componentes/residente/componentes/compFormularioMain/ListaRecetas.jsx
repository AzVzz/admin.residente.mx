import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { recetasGetTodas, recetaBorrar } from "../../../api/recetasApi";
import { FaSearch } from "react-icons/fa";
import { urlApi, imgApi } from "../../../api/url";
import { useAuth } from "../../../Context";
import useDebounce from "../../../../hooks/useDebounce";

const ListaRecetas = ({ onEditar, onCopiar, onRecetaEliminada }) => {
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [eliminando, setEliminando] = useState(null);

  // Leer página inicial de URL
  const paginaInicial = parseInt(searchParams.get("pageRecetas")) || 1;

  // Estados de paginación del servidor
  const [paginaActual, setPaginaActualInternal] = useState(paginaInicial);
  const [totalRecetas, setTotalRecetas] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const recetasPorPagina = 15;

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

  // Estados de datos
  const [recetas, setRecetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // 🚀 CACHE: Almacena las páginas ya cargadas
  const cacheRef = useRef(new Map());
  const prefetchingRef = useRef(false);
  const isFirstRun = useRef(true);

  // Función para generar clave de caché
  const getCacheKey = useCallback((page, filtros) => {
    return `${page}-${JSON.stringify(filtros)}`;
  }, []);

  // Función para cargar recetas del servidor (con caché)
  const cargarRecetas = useCallback(async (page = 1, filtros = {}, usarCache = true) => {
    const cacheKey = getCacheKey(page, filtros);

    // Si está en caché y podemos usarla, retornar inmediatamente
    if (usarCache && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      setRecetas(cached.recetas);
      setTotalRecetas(cached.total);
      setTotalPaginas(cached.totalPages);
      setCargando(false);
      return cached;
    }

    setCargando(true);
    setError(null);
    try {
      const data = await recetasGetTodas(page, recetasPorPagina, filtros);

      // Filtrar por permisos si no es admin
      let recetasFiltradas = data.recetas;
      if (
        usuario?.permisos &&
        usuario.permisos !== "todos" &&
        usuario.permisos !== "todo"
      ) {
        const permiso = usuario.permisos.toLowerCase();
        const mapeoPermisos = {
          "mama-de-rocco": "Mamá de Rocco",
        };
        const permisoNormalizado =
          mapeoPermisos[usuario.permisos] ||
          usuario.permisos.replace(/-/g, " ");

        recetasFiltradas = data.recetas.filter((receta) => {
          const autor = (receta.autor || "").toLowerCase();
          const permisoLower = permisoNormalizado.toLowerCase();
          return (
            autor.includes(permisoLower) ||
            autor.includes(permiso.replace(/-/g, " "))
          );
        });
      }

      // Guardar en caché
      const resultadoCache = {
        recetas: recetasFiltradas,
        total: data.total,
        totalPages: data.totalPages
      };
      cacheRef.current.set(cacheKey, resultadoCache);

      setRecetas(recetasFiltradas);
      setTotalRecetas(data.total);
      setTotalPaginas(data.totalPages);

      return resultadoCache;
    } catch (err) {
      console.error("Error cargando recetas:", err);
      setError(err.message || "Error al cargar las recetas");
      return null;
    } finally {
      setCargando(false);
    }
  }, [usuario?.permisos, recetasPorPagina, getCacheKey]);

  // 🚀 PREFETCH: Cargar la siguiente página en segundo plano
  const prefetchNextPage = useCallback(async (currentPage, filtros, maxPages) => {
    if (prefetchingRef.current) return;
    if (currentPage >= maxPages) return;

    const nextPage = currentPage + 1;
    const cacheKey = getCacheKey(nextPage, filtros);

    // Si ya está en caché, no prefetch
    if (cacheRef.current.has(cacheKey)) return;

    prefetchingRef.current = true;
    try {
      const data = await recetasGetTodas(nextPage, recetasPorPagina, filtros);

      // Filtrar por permisos
      let recetasFiltradas = data.recetas;
      if (
        usuario?.permisos &&
        usuario.permisos !== "todos" &&
        usuario.permisos !== "todo"
      ) {
        const permiso = usuario.permisos.toLowerCase();
        const mapeoPermisos = { "mama-de-rocco": "Mamá de Rocco" };
        const permisoNormalizado = mapeoPermisos[usuario.permisos] || usuario.permisos.replace(/-/g, " ");

        recetasFiltradas = data.recetas.filter((receta) => {
          const autor = (receta.autor || "").toLowerCase();
          const permisoLower = permisoNormalizado.toLowerCase();
          return autor.includes(permisoLower) || autor.includes(permiso.replace(/-/g, " "));
        });
      }

      cacheRef.current.set(cacheKey, {
        recetas: recetasFiltradas,
        total: data.total,
        totalPages: data.totalPages
      });
      console.log(`[Prefetch] Página ${nextPage} cargada en caché`);
    } catch (err) {
      console.log(`[Prefetch] Error cargando página ${nextPage}:`, err.message);
    } finally {
      prefetchingRef.current = false;
    }
  }, [usuario?.permisos, recetasPorPagina, getCacheKey]);

  // Cargar recetas cuando cambie la página o el filtro de búsqueda
  useEffect(() => {
    const filtros = {};
    if (debouncedSearchTerm.trim()) {
      filtros.q = debouncedSearchTerm.trim();
    }

    cargarRecetas(paginaActual, filtros).then((result) => {
      // Después de cargar, prefetch la siguiente página
      if (result && result.totalPages > paginaActual) {
        setTimeout(() => {
          prefetchNextPage(paginaActual, filtros, result.totalPages);
        }, 500); // Esperar 500ms antes de prefetch
      }
    });
  }, [paginaActual, debouncedSearchTerm, cargarRecetas, prefetchNextPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    cacheRef.current.clear();
    setPaginaActual(1);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta receta?")) return;
    setEliminando(id);
    try {
      await recetaBorrar(id);
      // Limpiar caché y recargar
      cacheRef.current.clear();
      const filtros = debouncedSearchTerm.trim() ? { q: debouncedSearchTerm.trim() } : {};
      cargarRecetas(paginaActual, filtros, false);
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
    if (onEditar) {
      onEditar(receta);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const date = new Date(fecha);
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");
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
      if (imagenStr.startsWith("http://") || imagenStr.startsWith("https://")) {
        try {
          const urlObj = new URL(imagenStr);
          const pathname = urlObj.pathname;
          if (urlObj.hostname.includes("admin.residente.mx")) {
            const filename = pathname.split("/").pop();
            if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              return `${urlApi.replace(/\/$/, "")}/api/recetas/imagen/${encodeURIComponent(filename)}`;
            }
          }
          if (urlObj.hostname.includes("residente.mx") && !urlObj.hostname.includes("admin")) {
            const pathSegments = pathname.split("/").map((segment) => segment ? encodeURIComponent(segment) : "");
            urlObj.pathname = pathSegments.join("/");
            return urlObj.toString();
          }
          const filename = pathname.split("/").pop();
          if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return `${urlApi.replace(/\/$/, "")}/api/recetas/imagen/${encodeURIComponent(filename)}`;
          }
          return encodeURI(imagenStr);
        } catch (e) {
          const match = imagenStr.match(/\/([^\/]+\.(webp|jpg|jpeg|png|gif))(\?|$)/i);
          if (match && match[1]) {
            return `${urlApi.replace(/\/$/, "")}/api/recetas/imagen/${encodeURIComponent(match[1])}`;
          }
          return `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
        }
      }
      if (imagenStr.startsWith("/uploads/recetas/")) {
        const filename = imagenStr.split("/").pop();
        return `${urlApi.replace(/\/$/, "")}/api/recetas/imagen/${encodeURIComponent(filename)}`;
      }
      if (imagenStr.startsWith("/fotos/")) {
        const pathSegments = imagenStr.split("/").map((segment) => segment ? encodeURIComponent(segment) : "").join("/");
        return `${imgApi.replace(/\/$/, "")}${pathSegments}`;
      }
      const filename = imagenStr.split("/").pop();
      if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return `${urlApi.replace(/\/$/, "")}/api/recetas/imagen/${encodeURIComponent(filename)}`;
      }
      const imagenPath = imagenStr.startsWith("/") ? imagenStr : `/${imagenStr}`;
      const pathSegments = imagenPath.split("/").map((segment) => segment ? encodeURIComponent(segment) : "").join("/");
      return `${imgApi.replace(/\/$/, "")}${pathSegments}`;
    } catch (error) {
      return `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
    }
  };

  // Funciones de navegación
  const irAPagina = (pagina) => setPaginaActual(pagina);
  const irAPaginaAnterior = () => setPaginaActual((prev) => Math.max(prev - 1, 1));
  const irAPaginaSiguiente = () => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas));

  // Calcular indices para mostrar
  const inicioIndice = (paginaActual - 1) * recetasPorPagina;
  const finIndice = Math.min(inicioIndice + recetasPorPagina, totalRecetas);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, autor o descripción..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {cargando && (
          <div className="flex items-center text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
            Cargando...
          </div>
        )}
      </div>

      {!cargando && recetas.length === 0 ? (
        <div className="px-6 py-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {searchTerm ? "No se encontraron recetas con ese criterio" : "No hay recetas registradas"}
          </p>
        </div>
      ) : (
        <>
          {/* Grid de recetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recetas.map((receta) => (
              <div
                key={receta.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative cursor-pointer ${eliminando === receta.id ? 'opacity-50' : ''}`}
                onClick={() => handleEditar(receta)}
              >
                {/* Imagen */}
                <div className="relative h-64 overflow-hidden bg-gray-200">
                  <img
                    src={construirUrlImagen(receta)}
                    alt={receta.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (e.target.src.includes("SinFoto")) return;
                      e.target.src = `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
                    }}
                  />
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      Publicada
                    </span>
                  </div>
                  <div className="absolute top-0 right-0 bg-pink-500 text-white px-3 py-1.5 font-bold text-xs z-20">
                    {receta.autor ? receta.autor.toUpperCase() : "AUTOR"}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 text-white">
                    <div className="text-[10px] mb-0.5 font-medium">
                      {formatearFecha(receta.fecha_envio)}
                    </div>
                    <div className="text-[10px] opacity-90">
                      Último autor: {receta.autor || "Desconocido"}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <span className="font-semibold">{receta.autor || "Autor"}:</span>{" "}
                    {receta.descripcion || receta.titulo || "Sin descripción"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación del servidor */}
          <div className="flex flex-col items-center mt-8 space-y-4">
            {/* Info de paginación */}
            <div className="text-sm text-gray-600">
              Mostrando {inicioIndice + 1} - {finIndice} de {totalRecetas} recetas
              {searchTerm && ` (filtradas por "${searchTerm}")`}
            </div>

            {/* Controles de paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center space-x-2">
                {/* Botón anterior */}
                <button
                  onClick={irAPaginaAnterior}
                  disabled={paginaActual === 1 || cargando}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === 1 || cargando
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
                        disabled={cargando}
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
                  disabled={paginaActual === totalPaginas || cargando}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === totalPaginas || cargando
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
    </div>
  );
};

export default ListaRecetas;
