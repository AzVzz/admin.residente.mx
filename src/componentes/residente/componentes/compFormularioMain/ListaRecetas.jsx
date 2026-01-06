import React, { useEffect, useState } from "react";
import { recetasGetTodas, recetaBorrar } from "../../../api/recetasApi";
import { FaTrash, FaEdit, FaCopy, FaEllipsisV } from "react-icons/fa";
import { urlApi, imgApi } from "../../../api/url";

import { useAuth } from "../../../Context";

const ListaRecetas = ({ onEditar, onCopiar, onRecetaEliminada }) => {
  const { usuario } = useAuth();
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(null);

  // 🚀 PAGINACIÓN: 15 recetas por página
  const [paginaActual, setPaginaActual] = useState(1);
  const recetasPorPagina = 15;

  useEffect(() => {
    cargarRecetas();
  }, []);

  const cargarRecetas = async () => {
    setLoading(true);
    setError(null);
    try {
      // 🚀 OPTIMIZADO: Límite de 100 recetas
      const data = await recetasGetTodas(1, 100);
      let recetasData = Array.isArray(data) ? data : [];

      // Filtrar por permisos si no es admin
      if (
        usuario?.permisos &&
        usuario.permisos !== "todos" &&
        usuario.permisos !== "todo"
      ) {
        // Normalizar permiso: 'mama-de-rocco' -> 'Mama De Rocco' (aprox) o usar mapeo específico
        // En ListaNotas usan replace(/-/g, ' ') y Title Case.
        // Vamos a intentar coincidir con 'autor' o 'categoria'

        const permiso = usuario.permisos.toLowerCase();
        // Mapeo específico si es necesario, similar a ListaNotas
        const mapeoPermisos = {
          "mama-de-rocco": "Mamá de Rocco", // Ajustar según lo que devuelve el backend en receta.autor
        };

        const permisoNormalizado =
          mapeoPermisos[usuario.permisos] ||
          usuario.permisos.replace(/-/g, " ");

        recetasData = recetasData.filter((receta) => {
          const autor = (receta.autor || "").toLowerCase();
          const permisoLower = permisoNormalizado.toLowerCase();
          return (
            autor.includes(permisoLower) ||
            autor.includes(permiso.replace(/-/g, " "))
          );
        });
      }

      setRecetas(recetasData);
    } catch (err) {
      setError(err.message || "Error al cargar las recetas");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta receta?")) return;
    setEliminando(id);
    setMenuAbierto(null);
    try {
      await recetaBorrar(id);
      setRecetas(recetas.filter((r) => r.id !== id));
      if (onRecetaEliminada) {
        onRecetaEliminada();
      }
      alert("Receta eliminada correctamente");
    } catch (err) {
      alert(
        "Error al borrar la receta: " + (err.message || "Error desconocido")
      );
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
        id: undefined,
      };
      navigator.clipboard.writeText(JSON.stringify(recetaParaCopiar, null, 2));
      alert("Datos de la receta copiados al portapapeles");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const date = new Date(fecha);
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
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
      // Verificar si hay imagen
      if (!receta?.imagen) {
        return `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
      }

      const imagenStr = String(receta.imagen).trim();

      // Si está vacío después de trim
      if (!imagenStr) {
        return `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
      }

      // Si ya es una URL completa
      if (imagenStr.startsWith("http://") || imagenStr.startsWith("https://")) {
        try {
          const urlObj = new URL(imagenStr);
          const pathname = urlObj.pathname;

          // IMPORTANTE: Si la URL apunta a admin.residente.mx, extraer el nombre del archivo
          // y usar la API del backend para normalizar todas las URLs
          if (urlObj.hostname.includes("admin.residente.mx")) {
            // Extraer el nombre del archivo de la ruta
            const filename = pathname.split("/").pop();
            if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              // Usar la API del backend que sirve las imágenes correctamente
              return `${urlApi.replace(
                /\/$/,
                ""
              )}/api/recetas/imagen/${encodeURIComponent(filename)}`;
            }
          }

          // Si es una URL de residente.mx (no admin), usar directamente
          if (
            urlObj.hostname.includes("residente.mx") &&
            !urlObj.hostname.includes("admin")
          ) {
            // Codificar la URL normalmente
            const pathSegments = pathname.split("/").map((segment) => {
              if (!segment) return "";
              return encodeURIComponent(segment);
            });
            urlObj.pathname = pathSegments.join("/");
            return urlObj.toString();
          }

          // Para otras URLs, intentar extraer el nombre del archivo y usar la API
          const filename = pathname.split("/").pop();
          if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return `${urlApi.replace(
              /\/$/,
              ""
            )}/api/recetas/imagen/${encodeURIComponent(filename)}`;
          }

          // Si no se puede extraer el nombre, usar la URL original codificada
          return encodeURI(imagenStr);
        } catch (e) {
          // Si falla el parsing, intentar extraer el nombre del archivo manualmente
          const match = imagenStr.match(
            /\/([^\/]+\.(webp|jpg|jpeg|png|gif))(\?|$)/i
          );
          if (match && match[1]) {
            return `${urlApi.replace(
              /\/$/,
              ""
            )}/api/recetas/imagen/${encodeURIComponent(match[1])}`;
          }
          // Si falla el parsing, usar placeholder
          return `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
        }
      }

      // Si es una ruta relativa que empieza con /uploads/recetas/ (imágenes antiguas)
      if (imagenStr.startsWith("/uploads/recetas/")) {
        const filename = imagenStr.split("/").pop();
        // Usar la API del backend que normaliza las URLs
        return `${urlApi.replace(
          /\/$/,
          ""
        )}/api/recetas/imagen/${encodeURIComponent(filename)}`;
      }

      // Si es una ruta relativa que empieza con /fotos/ (nuevas imágenes WebP)
      // Construir URL completa con imgApi (residente.mx)
      if (imagenStr.startsWith("/fotos/")) {
        const pathSegments = imagenStr
          .split("/")
          .map((segment) => (segment ? encodeURIComponent(segment) : ""))
          .join("/");
        return `${imgApi.replace(/\/$/, "")}${pathSegments}`;
      }

      // Si es otra ruta relativa, intentar extraer el nombre del archivo si es posible
      const filename = imagenStr.split("/").pop();
      if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return `${urlApi.replace(
          /\/$/,
          ""
        )}/api/recetas/imagen/${encodeURIComponent(filename)}`;
      }

      // Si no se puede determinar, construir URL completa con imgApi
      const imagenPath = imagenStr.startsWith("/")
        ? imagenStr
        : `/${imagenStr}`;
      const pathSegments = imagenPath
        .split("/")
        .map((segment) => (segment ? encodeURIComponent(segment) : ""))
        .join("/");
      return `${imgApi.replace(/\/$/, "")}${pathSegments}`;
    } catch (error) {
      return `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
    }
  };

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

  // 🚀 PAGINACIÓN: Calcular recetas de la página actual
  const totalRecetas = recetas.length;
  const totalPaginas = Math.ceil(totalRecetas / recetasPorPagina);
  const inicioIndice = (paginaActual - 1) * recetasPorPagina;
  const finIndice = Math.min(inicioIndice + recetasPorPagina, totalRecetas);
  const recetasPaginaActual = recetas.slice(inicioIndice, finIndice);

  // Funciones de navegación
  const irAPagina = (pagina) => setPaginaActual(pagina);
  const irAPaginaAnterior = () => setPaginaActual((prev) => Math.max(prev - 1, 1));
  const irAPaginaSiguiente = () => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas));

  return (
    <div className="space-y-6">
      {recetas.length === 0 ? (
        <div className="px-6 py-8 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">No hay recetas registradas</p>
        </div>
      ) : (
        <>
          {/* Grid de recetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recetasPaginaActual.map((receta) => (
              <div
                key={receta.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative cursor-pointer"
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
                      if (e.target.src.includes("/api/recetas/imagen/")) {
                        e.target.src = `${imgApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`;
                        return;
                      }
                      if (receta.imagen) {
                        let filename = null;
                        if (receta.imagen.startsWith("http://") || receta.imagen.startsWith("https://")) {
                          try {
                            const urlObj = new URL(receta.imagen);
                            filename = urlObj.pathname.split("/").pop();
                          } catch (err) {
                            const match = receta.imagen.match(/\/([^\/]+\.(webp|jpg|jpeg|png|gif))(\?|$)/i);
                            if (match && match[1]) filename = match[1];
                          }
                        } else if (receta.imagen.includes("/")) {
                          filename = receta.imagen.split("/").pop();
                        } else {
                          filename = receta.imagen;
                        }
                        if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                          e.target.src = `${urlApi.replace(/\/$/, "")}/api/recetas/imagen/${encodeURIComponent(filename)}`;
                          return;
                        }
                      }
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

          {/* 🚀 PAGINACIÓN */}
          <div className="flex flex-col items-center mt-8 space-y-4">
            {/* Info de paginación */}
            <div className="text-sm text-gray-600">
              Mostrando {inicioIndice + 1} - {finIndice} de {totalRecetas} recetas
            </div>

            {/* Controles de paginación */}
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
