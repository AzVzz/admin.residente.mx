import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { eventosColaboradoresGetTodas } from "../api/eventosColaboradoresApi";
import ResponsiveImg from "../ResponsiveImg";
import { useAuth } from "../Context";

const ListaEventosColaboradores = () => {
  const { token } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState("creado");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [estado, setEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const cargarEventos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventosColaboradoresGetTodas(token, { sortBy, sortOrder, estado: estado || undefined });
      const lista = data.eventos ?? data;
      setTotal(data.total ?? lista.length);
      setEventos(lista);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, sortBy, sortOrder, estado]);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const getEstado = (evento) => {
    const { fecha_inicio_evento, fecha_fin_evento, activo_manual } = evento;
    if (!activo_manual) return { label: "Inactivo", color: "bg-gray-200 text-gray-700" };
    const now = new Date();
    if (fecha_inicio_evento && fecha_fin_evento) {
      if (now < new Date(fecha_inicio_evento)) return { label: "Programado", color: "bg-yellow-100 text-yellow-800" };
      if (now > new Date(fecha_fin_evento)) return { label: "Vencido", color: "bg-red-100 text-red-800" };
    }
    return { label: "Activo", color: "bg-green-100 text-green-800" };
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  };

  const eventosFiltrados = busqueda.trim()
    ? eventos.filter((e) => e.titulo?.toLowerCase().includes(busqueda.toLowerCase()))
    : eventos;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Mis eventos
          {total > 0 && <span className="ml-2 text-sm font-normal text-gray-500">({total} total)</span>}
        </h2>
        <Link
          to="/dashboard-eventos-colab/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
        >
          <span className="text-xl">+</span> Agregar Evento
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Ordenar por</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="creado">Fecha creación</option>
            <option value="views">Más vistas</option>
            <option value="clicks">Más clicks</option>
            <option value="titulo">A-Z título</option>
            <option value="fecha_inicio">Fecha inicio</option>
            <option value="fecha_fin">Fecha fin</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Orden</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="DESC">Descendente</option>
            <option value="ASC">Ascendente</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-gray-600">Buscar evento</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre del evento..."
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Cargando eventos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {eventosFiltrados.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              {busqueda ? `Sin resultados para "${busqueda}"` : "No hay eventos con los filtros seleccionados."}
            </div>
          ) : (
            eventosFiltrados.map((evento) => {
              const estadoEvento = getEstado(evento);
              return (
                <Link key={evento.id} to={`/dashboard-eventos-colab/editar/${evento.id}`}>
                  <div
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col group relative cursor-pointer"
                    style={{ minHeight: "300px" }}
                  >
                    {/* Imagen de fondo con zoom al hover */}
                    {evento.imagen_url ? (
                      <ResponsiveImg
                        src={evento.imagen_url}
                        alt={evento.titulo}
                        width={400}
                        height={240}
                        widths={[200, 400]}
                        sizes="400px"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 motion-reduce:transition-none"
                        style={{ zIndex: 0 }}
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" style={{ zIndex: 0 }} />
                    )}

                    {/* Contenido encima de la imagen */}
                    <div className="flex flex-col justify-between items-end h-full relative z-10">
                      {/* Badge de tipo en esquina superior derecha */}
                      <div className="absolute top-0 right-0 z-20">
                        <div className="bg-indigo-500 text-white font-bold text-sm shadow-lg px-3 py-1 rounded-bl-lg">
                          EVENTO
                        </div>
                      </div>

                      {/* Datos arriba */}
                      <div className="w-full flex items-center flex-col p-2">
                        <div className="px-2 pt-2 w-full flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs rounded-full w-fit ${estadoEvento.color}`}>
                            {estadoEvento.label}
                          </span>
                          <span className="font-semibold px-2 py-1 text-xs rounded-full bg-black/30 backdrop-blur-md text-white drop-shadow w-fit">
                            {formatFecha(evento.fecha_inicio_evento)}
                          </span>
                          <span className="font-semibold px-2 py-1 text-xs rounded-full bg-black/30 backdrop-blur-md text-white drop-shadow w-fit">
                            vistas: {evento.views ?? 0}
                          </span>
                          <span className="font-semibold px-2 py-1 text-xs rounded-full bg-black/30 backdrop-blur-md text-white drop-shadow w-fit">
                            clicks: {evento.clicks ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Título abajo en recuadro blanco */}
                      <div className="w-full">
                        <div className="bg-white p-2">
                          <h2 className="text-base font-bold text-gray-900 mb-1 leading-tight">
                            {evento.titulo}
                          </h2>
                          {evento.lugar_evento && (
                            <p className="text-xs text-gray-500 truncate">📍 {evento.lugar_evento}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ListaEventosColaboradores;
