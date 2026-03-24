import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { eventosGetTodas, eventoBorrar, eventoEditar } from "../api/eventosGet";
import { restaurantesBasicosGet } from "../api/restaurantesBasicosGet.js";
import { FaTrash, FaCalendarAlt, FaUserTag } from "react-icons/fa";
import { useAuth } from "../Context";

const ListaEventos = () => {
  const { usuario, token } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [toggling, setToggling] = useState(null);

  // Filtros y ordenamiento
  const [sortBy, setSortBy] = useState("creado");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [estado, setEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Modal fechas
  const [editingEvento, setEditingEvento] = useState(null);
  const [nuevaFechaInicio, setNuevaFechaInicio] = useState("");
  const [nuevaFechaFin, setNuevaFechaFin] = useState("");
  const [savingFechas, setSavingFechas] = useState(false);

  // Modal asignación
  const [asignandoEvento, setAsignandoEvento] = useState(null);
  const [restaurantes, setRestaurantes] = useState([]);
  const [restauranteBusqueda, setRestauranteBusqueda] = useState("");
  const [restauranteSeleccionado, setRestauranteSeleccionado] = useState(null);
  const [savingAsignacion, setSavingAsignacion] = useState(false);

  const rolActual = usuario?.rol?.toLowerCase();
  const permisosActual = usuario?.permisos?.toLowerCase();
  const esAdmin = rolActual === "residente" || permisosActual === "todos" || permisosActual === "todo";
  const esAutorizado =
    esAdmin ||
    rolActual === "b2b" ||
    rolActual === "vendedor" ||
    permisosActual === "residente" ||
    permisosActual === "b2b";

  if (!usuario || !esAutorizado) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center p-8 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para ver el dashboard de eventos.</p>
        </div>
      </div>
    );
  }

  const cargarEventos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventosGetTodas(token, { sortBy, sortOrder, estado: estado || undefined });
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

  useEffect(() => {
    if (esAdmin) {
      restaurantesBasicosGet()
        .then(setRestaurantes)
        .catch(() => {});
    }
  }, [esAdmin]);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este evento?")) return;
    setEliminando(id);
    try {
      await eventoBorrar(id, token);
      setEventos((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Error al borrar el evento");
    } finally {
      setEliminando(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const evento = eventos.find((e) => e.id === id);
    if (!evento) return;

    if (!currentStatus) {
      if (evento.fecha_fin_evento && new Date() > new Date(evento.fecha_fin_evento)) {
        alert("No puedes activar este evento porque su fecha de finalización ya ha pasado.");
        return;
      }
    }

    setToggling(id);
    try {
      await eventoEditar(id, { activo_manual: !currentStatus }, token);
      setEventos((prev) => prev.map((e) => e.id === id ? { ...e, activo_manual: !currentStatus } : e));
    } catch (err) {
      alert("Error al cambiar el estado: " + err.message);
    } finally {
      setToggling(null);
    }
  };

  const getEstado = (evento) => {
    const { fecha_inicio_evento, fecha_fin_evento, activo_manual } = evento;
    if (!activo_manual) return { label: "Inactivo", color: "text-gray-600 bg-gray-200" };
    const now = new Date();
    if (fecha_inicio_evento && fecha_fin_evento) {
      if (now < new Date(fecha_inicio_evento)) return { label: "Programado", color: "text-yellow-600 bg-yellow-100" };
      if (now > new Date(fecha_fin_evento)) return { label: "Vencido", color: "text-red-600 bg-red-100" };
    }
    return { label: "Activo", color: "text-green-600 bg-green-100" };
  };

  const handleEditFechas = (evento) => {
    setEditingEvento(evento);
    setNuevaFechaInicio(evento.fecha_inicio_evento ? new Date(evento.fecha_inicio_evento).toISOString().slice(0, 16) : "");
    setNuevaFechaFin(evento.fecha_fin_evento ? new Date(evento.fecha_fin_evento).toISOString().slice(0, 16) : "");
  };

  const handleSaveFechas = async () => {
    if (!editingEvento) return;
    setSavingFechas(true);
    try {
      const updateData = {
        fecha_inicio_evento: nuevaFechaInicio ? new Date(nuevaFechaInicio).toISOString() : null,
        fecha_fin_evento: nuevaFechaFin ? new Date(nuevaFechaFin).toISOString() : null,
      };
      await eventoEditar(editingEvento.id, updateData, token);
      setEventos((prev) => prev.map((e) => e.id === editingEvento.id ? { ...e, ...updateData } : e));
      setEditingEvento(null);
    } catch (err) {
      alert("Error al actualizar las fechas: " + err.message);
    } finally {
      setSavingFechas(false);
    }
  };

  const handleAbrirAsignacion = (evento) => {
    setAsignandoEvento(evento);
    setRestauranteBusqueda(evento.nombre_restaurante || "");
    setRestauranteSeleccionado(
      evento.restaurante_id ? restaurantes.find((r) => r.id === evento.restaurante_id) || null : null
    );
  };

  const handleConfirmarAsignacion = async () => {
    if (!asignandoEvento) return;
    setSavingAsignacion(true);
    try {
      await eventoEditar(
        asignandoEvento.id,
        { restaurante_id: restauranteSeleccionado?.id || null },
        token
      );
      setEventos((prev) =>
        prev.map((e) =>
          e.id === asignandoEvento.id
            ? {
                ...e,
                restaurante_id: restauranteSeleccionado?.id || null,
                nombre_restaurante: restauranteSeleccionado?.nombre_restaurante || e.nombre_restaurante,
                es_promovido: !!restauranteSeleccionado?.tiene_b2b_activo,
              }
            : e
        )
      );
      setAsignandoEvento(null);
      cargarEventos();
    } catch (err) {
      alert("Error al asignar: " + err.message);
    } finally {
      setSavingAsignacion(false);
    }
  };

  const restaurantesFiltrados = restaurantes.filter((r) =>
    r.nombre_restaurante?.toLowerCase().includes(restauranteBusqueda.toLowerCase())
  );

  const eventosFiltrados = busqueda.trim()
    ? eventos.filter((e) => {
        const q = busqueda.toLowerCase();
        return (
          e.titulo?.toLowerCase().includes(q) ||
          e.nombre_restaurante?.toLowerCase().includes(q)
        );
      })
    : eventos;

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Mis Eventos
          {total > 0 && <span className="ml-2 text-sm font-normal text-gray-500">({total} total)</span>}
        </h2>
        <Link
          to="/evento"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
        >
          <span className="text-xl">+</span> Agregar Evento
        </Link>
      </div>

      {/* Filtros */}
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
            <option value="restaurante">Restaurante</option>
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
          <label className="text-xs font-medium text-gray-600">Buscar evento o restaurante</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre del evento o restaurante..."
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <p className="mt-2 text-gray-600">Cargando eventos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
          {eventosFiltrados.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              {busqueda ? `Sin resultados para "${busqueda}"` : "No hay eventos con los filtros seleccionados."}
            </div>
          ) : (
            eventosFiltrados.map((evento) => {
              const estadoEvento = getEstado(evento);
              return (
                <div key={evento.id} className="flex flex-col items-center p-4 relative">
                  {/* Badge Estado */}
                  <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold ${estadoEvento.color}`}>
                    {estadoEvento.label}
                  </div>

                  {/* Badge B2B Promovido */}
                  {evento.es_promovido && (
                    <div className="absolute top-4 left-4 z-10 px-2 py-1 rounded-full text-xs font-bold bg-yellow-300 text-yellow-900">
                      ★ B2B
                    </div>
                  )}

                  {/* Imagen */}
                  <div className="w-full flex justify-center mb-2">
                    {evento.imagen_url ? (
                      <img
                        src={evento.imagen_url}
                        alt={`Evento: ${evento.titulo}`}
                        className="h-full w-auto object-contain transform origin-top drop-shadow-[2px_2px_1.5px_rgba(0,0,0,0.4)] rounded-sm"
                      />
                    ) : (
                      <div className="text-gray-400 p-10 border-2 border-dashed border-gray-300 rounded-lg text-center text-sm">
                        <p className="font-semibold">{evento.titulo}</p>
                        <p className="text-xs mt-1">{evento.nombre_restaurante}</p>
                      </div>
                    )}
                  </div>

                  {/* Vistas y Clicks */}
                  <div className="flex justify-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      👁 {evento.views ?? 0}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                      🖱 {evento.clicks ?? 0}
                    </span>
                  </div>

                  {/* Restaurante */}
                  {evento.nombre_restaurante && (
                    <p className="text-xs text-gray-500 mb-1 text-center truncate w-full">
                      {evento.nombre_restaurante}
                    </p>
                  )}

                  {/* Fechas */}
                  <div className="mb-2 text-center text-sm text-gray-600 w-full">
                    <p><span className="font-semibold">Inicio:</span> {formatFecha(evento.fecha_inicio_evento)}</p>
                    <p><span className="font-semibold">Fin:</span> {formatFecha(evento.fecha_fin_evento)}</p>
                  </div>

                  {/* Acciones */}
                  <div className="w-full flex flex-col gap-2">
                    <button
                      onClick={() => handleToggleStatus(evento.id, evento.activo_manual)}
                      disabled={toggling === evento.id}
                      className={`w-full py-1 border rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer ${
                        evento.activo_manual
                          ? "bg-white border-0 text-yellow-600"
                          : "bg-green-500 border-0 text-white hover:bg-green-600"
                      }`}
                    >
                      {toggling === evento.id ? "Procesando..." : evento.activo_manual ? "Desactivar" : "Activar"}
                    </button>

                    <button
                      onClick={() => handleEditFechas(evento)}
                      className="w-full py-1 bg-orange-500 border-0 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <FaCalendarAlt /> Fechas
                    </button>

                    {esAdmin && (
                      <button
                        onClick={() => handleAbrirAsignacion(evento)}
                        className="w-full py-1 bg-indigo-500 border-0 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                        <FaUserTag /> Asignar
                      </button>
                    )}

                    <button
                      onClick={() => handleEliminar(evento.id)}
                      disabled={eliminando === evento.id}
                      className="w-full py-1 bg-white border-0 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <FaTrash /> {eliminando === evento.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Fechas */}
      {editingEvento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Fechas del Evento</h3>
            <p className="text-gray-600 mb-4">Evento: <strong>{editingEvento.titulo}</strong></p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio</label>
              <input
                type="datetime-local"
                value={nuevaFechaInicio}
                onChange={(e) => setNuevaFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de fin</label>
              <input
                type="datetime-local"
                value={nuevaFechaFin}
                onChange={(e) => setNuevaFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveFechas}
                disabled={savingFechas}
                className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium cursor-pointer"
              >
                {savingFechas ? "Guardando..." : "Guardar Fechas"}
              </button>
              <button
                onClick={() => setEditingEvento(null)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignación */}
      {asignandoEvento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Asignar Restaurante</h3>
            <p className="text-gray-500 text-sm mb-4">
              Evento: <strong>{asignandoEvento.titulo}</strong>
              {asignandoEvento.es_promovido && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-xs font-bold">★ B2B activo</span>
              )}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar restaurante</label>
              <input
                type="text"
                value={restauranteBusqueda}
                onChange={(e) => {
                  setRestauranteBusqueda(e.target.value);
                  if (!e.target.value) setRestauranteSeleccionado(null);
                }}
                placeholder="Nombre del restaurante..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            {restauranteBusqueda && restaurantesFiltrados.length > 0 && (
              <div className="border border-gray-200 rounded-lg mb-4 max-h-48 overflow-y-auto">
                {restaurantesFiltrados.slice(0, 20).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRestauranteSeleccionado(r);
                      setRestauranteBusqueda(r.nombre_restaurante);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 border-b border-gray-100 last:border-0 cursor-pointer ${
                      restauranteSeleccionado?.id === r.id ? "bg-indigo-50 font-semibold" : ""
                    }`}
                  >
                    {r.nombre_restaurante}
                    {r.id && <span className="text-gray-400 ml-2 text-xs">#{r.id}</span>}
                  </button>
                ))}
              </div>
            )}

            {restauranteSeleccionado && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4 text-sm">
                <p className="font-semibold text-indigo-800">✓ Seleccionado: {restauranteSeleccionado.nombre_restaurante}</p>
                <p className="text-indigo-600 text-xs mt-1">
                  Si tiene suscripción B2B activa, el evento se marcará como ★ Promovido automáticamente.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleConfirmarAsignacion}
                disabled={savingAsignacion || !restauranteSeleccionado}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingAsignacion ? "Asignando..." : "Confirmar Asignación"}
              </button>
              <button
                onClick={() => setAsignandoEvento(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaEventos;
