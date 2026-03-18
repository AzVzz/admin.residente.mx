import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { cuponesGetTodas, cuponBorrar, cuponEditar, cuponAsignar } from "../../../api/cuponesGet";
import { restaurantesBasicosGet } from "../../../api/restaurantesBasicosGet.js";
import { FaTrash, FaClock, FaUserTag } from "react-icons/fa";
import { useAuth } from "../../../Context";

const ListaTickets = () => {
  const { usuario, token } = useAuth();
  const [cupones, setCupones] = useState([]);
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

  // Modal caducidad
  const [editingCupon, setEditingCupon] = useState(null);
  const [nuevaFechaCaducidad, setNuevaFechaCaducidad] = useState("");
  const [savingCaducidad, setSavingCaducidad] = useState(false);

  // Modal asignación
  const [asignandoCupon, setAsignandoCupon] = useState(null);
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
          <p className="text-gray-600">No tienes permisos para ver el dashboard de cupones.</p>
        </div>
      </div>
    );
  }

  const cargarCupones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cuponesGetTodas(token, { sortBy, sortOrder, estado: estado || undefined });
      const lista = data.cupones ?? data; // compatibilidad si es array plano
      setTotal(data.total ?? lista.length);

      // Lazy deactivation de expirados
      const now = new Date();
      const expirados = lista.filter((c) => {
        if (!c.activo_manual) return false;
        if (c.fecha_fin && now > new Date(c.fecha_fin)) return true;
        if (c.tiene_caducidad && c.fecha_validez && now > new Date(c.fecha_validez)) return true;
        return false;
      });

      if (expirados.length > 0) {
        await Promise.allSettled(
          expirados.map((c) => cuponEditar(c.id, { activo_manual: false }, token))
        );
        setCupones(lista.map((c) => (expirados.find((e) => e.id === c.id) ? { ...c, activo_manual: false } : c)));
      } else {
        setCupones(lista);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, sortBy, sortOrder, estado]);

  useEffect(() => {
    cargarCupones();
  }, [cargarCupones]);

  // Cargar restaurantes para el modal de asignación (solo admin)
  useEffect(() => {
    if (esAdmin) {
      restaurantesBasicosGet()
        .then(setRestaurantes)
        .catch(() => {});
    }
  }, [esAdmin]);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este cupón?")) return;
    setEliminando(id);
    try {
      await cuponBorrar(id, token);
      setCupones((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Error al borrar el cupón");
    } finally {
      setEliminando(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const cupon = cupones.find((c) => c.id === id);
    if (!cupon) return;

    if (!currentStatus) {
      if (cupon.fecha_fin && new Date() > new Date(cupon.fecha_fin)) {
        alert("No puedes activar este cupón porque su fecha de finalización ya ha pasado.");
        return;
      }
    } else {
      if ((cupon.fecha_inicio || cupon.fecha_fin) &&
        !window.confirm("Este cupón tiene fechas programadas. ¿Deseas desactivarlo manualmente?")) return;
    }

    setToggling(id);
    try {
      await cuponEditar(id, { activo_manual: !currentStatus }, token);
      setCupones((prev) => prev.map((c) => c.id === id ? { ...c, activo_manual: !currentStatus } : c));
    } catch (err) {
      alert("Error al cambiar el estado: " + err.message);
    } finally {
      setToggling(null);
    }
  };

  const getEstado = (cupon) => {
    const { fecha_inicio, fecha_fin, activo_manual, tiene_caducidad, fecha_validez } = cupon;
    if (!activo_manual) return { label: "Inactivo", color: "text-gray-600 bg-gray-200" };
    const now = new Date();
    if (tiene_caducidad && fecha_validez && now > new Date(fecha_validez))
      return { label: "Expirado", color: "text-red-600 bg-red-100" };
    if (fecha_inicio && fecha_fin) {
      if (now < new Date(fecha_inicio)) return { label: "Programado", color: "text-yellow-600 bg-yellow-100" };
      if (now > new Date(fecha_fin)) return { label: "Vencido", color: "text-red-600 bg-red-100" };
    }
    return { label: "Activo", color: "text-green-600 bg-green-100" };
  };

  const handleEditCaducidad = (cupon) => {
    setEditingCupon(cupon);
    setNuevaFechaCaducidad(cupon.fecha_validez ? new Date(cupon.fecha_validez).toISOString().slice(0, 16) : "");
  };

  const handleSaveCaducidad = async (reactivar = false) => {
    if (!editingCupon || !nuevaFechaCaducidad) { alert("Selecciona una fecha"); return; }
    setSavingCaducidad(true);
    try {
      const updateData = { tiene_caducidad: true, fecha_validez: new Date(nuevaFechaCaducidad).toISOString() };
      if (reactivar) updateData.activo_manual = true;
      await cuponEditar(editingCupon.id, updateData, token);
      setCupones((prev) => prev.map((c) => c.id === editingCupon.id ? { ...c, ...updateData } : c));
      setEditingCupon(null);
    } catch (err) {
      alert("Error al actualizar la caducidad: " + err.message);
    } finally {
      setSavingCaducidad(false);
    }
  };

  const handleAbrirAsignacion = (cupon) => {
    setAsignandoCupon(cupon);
    setRestauranteBusqueda(cupon.nombre_restaurante || "");
    setRestauranteSeleccionado(
      cupon.restaurante_id ? restaurantes.find((r) => r.id === cupon.restaurante_id) || null : null
    );
  };

  const handleConfirmarAsignacion = async () => {
    if (!asignandoCupon) return;
    setSavingAsignacion(true);
    try {
      await cuponAsignar(
        asignandoCupon.id,
        { restaurante_id: restauranteSeleccionado?.id || null },
        token
      );
      // Actualizar local
      setCupones((prev) =>
        prev.map((c) =>
          c.id === asignandoCupon.id
            ? {
                ...c,
                restaurante_id: restauranteSeleccionado?.id || null,
                nombre_restaurante: restauranteSeleccionado?.nombre_restaurante || c.nombre_restaurante,
                es_promovido: !!restauranteSeleccionado?.tiene_b2b_activo,
              }
            : c
        )
      );
      setAsignandoCupon(null);
      // Recargar para obtener es_promovido actualizado
      cargarCupones();
    } catch (err) {
      alert("Error al asignar: " + err.message);
    } finally {
      setSavingAsignacion(false);
    }
  };

  const restaurantesFiltrados = restaurantes.filter((r) =>
    r.nombre_restaurante?.toLowerCase().includes(restauranteBusqueda.toLowerCase())
  );

  const cuponesFiltrados = busqueda.trim()
    ? cupones.filter((c) => {
        const q = busqueda.toLowerCase();
        return (
          c.titulo?.toLowerCase().includes(q) ||
          c.nombre_restaurante?.toLowerCase().includes(q)
        );
      })
    : cupones;

  const activePermanent = cupones.find((c) => c.activo_manual && !c.fecha_inicio && !c.fecha_fin);
  const now = new Date();
  const activeDated = cupones.find((c) => {
    if (!c.activo_manual || !c.fecha_inicio || !c.fecha_fin) return false;
    return now >= new Date(c.fecha_inicio) && now <= new Date(c.fecha_fin);
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Mis Cupones
          {total > 0 && <span className="ml-2 text-sm font-normal text-gray-500">({total} total)</span>}
        </h2>
        <Link
          to="/promo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
        >
          <span className="text-xl">+</span> Agregar Cupón
        </Link>
      </div>

      {/* Filtros y ordenamiento */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Ordenar por</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="creado">Fecha creación</option>
            <option value="por_expirar">Por expirar</option>
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
            <option value="expirado">Expirados</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-gray-600">Buscar cupón o restaurante</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre del cupón o restaurante..."
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}

      {activePermanent && activeDated && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded shadow-sm">
          <p className="font-bold">ℹ️ Aviso de Prioridad</p>
          <p className="mt-1">
            Cupón con fecha activo (<strong>{activeDated.titulo}</strong>) vence el{" "}
            {new Date(activeDated.fecha_fin).toLocaleString()}. El cupón permanente (
            <strong>{activePermanent.titulo}</strong>) se mostrará al expirar.
          </p>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <p className="mt-2 text-gray-600">Cargando cupones...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
          {cuponesFiltrados.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              {busqueda ? `Sin resultados para "${busqueda}"` : "No hay cupones con los filtros seleccionados."}
            </div>
          ) : (
            cuponesFiltrados.map((cupon) => {
              const estadoCupon = getEstado(cupon);
              return (
                <div key={cupon.id} className="flex flex-col items-center p-4 relative">
                  {/* Badge Estado */}
                  <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold ${estadoCupon.color}`}>
                    {estadoCupon.label}
                  </div>

                  {/* Badge B2B Promovido */}
                  {cupon.es_promovido && (
                    <div className="absolute top-4 left-4 z-10 px-2 py-1 rounded-full text-xs font-bold bg-yellow-300 text-yellow-900">
                      ★ B2B
                    </div>
                  )}

                  {/* Imagen */}
                  <div className="w-full flex justify-center mb-2">
                    {cupon.imagen_url ? (
                      <img
                        src={cupon.imagen_url}
                        alt={`Cupón: ${cupon.titulo}`}
                        className="h-full w-auto object-contain transform origin-top drop-shadow-[2px_2px_1.5px_rgba(0,0,0,0.4)] rounded-sm"
                      />
                    ) : (
                      <div className="text-gray-400 p-10 border-2 border-dashed border-gray-300 rounded-lg text-center text-sm">
                        <p className="font-semibold">{cupon.titulo}</p>
                        <p className="text-xs mt-1">{cupon.nombre_restaurante}</p>
                      </div>
                    )}
                  </div>

                  {/* Vistas y Clicks */}
                  <div className="flex justify-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      👁 {cupon.views ?? 0}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                      🖱 {cupon.clicks ?? 0}
                    </span>
                  </div>

                  {/* Restaurante */}
                  {cupon.nombre_restaurante && (
                    <p className="text-xs text-gray-500 mb-1 text-center truncate w-full">
                      {cupon.nombre_restaurante}
                    </p>
                  )}

                  {/* Fechas */}
                  <div className="mb-2 text-center text-sm text-gray-600 w-full">
                    {cupon.fecha_inicio && cupon.fecha_fin ? (
                      <>
                        <p><span className="font-semibold">Inicio:</span> {new Date(cupon.fecha_inicio).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Fin:</span> {new Date(cupon.fecha_fin).toLocaleDateString()}</p>
                      </>
                    ) : (
                      <p className="font-bold text-blue-600 text-sm">Cupón Permanente</p>
                    )}
                    {cupon.tiene_caducidad && cupon.fecha_validez && (
                      <p className="mt-1 text-orange-600 font-semibold text-xs">
                        ⏰ Expira: {new Date(cupon.fecha_validez).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="w-full flex flex-col gap-2">
                    <button
                      onClick={() => handleToggleStatus(cupon.id, cupon.activo_manual)}
                      disabled={toggling === cupon.id}
                      className={`w-full py-1 border rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer ${
                        cupon.activo_manual
                          ? "bg-white border-0 text-yellow-600"
                          : "bg-green-500 border-0 text-white hover:bg-green-600"
                      }`}
                    >
                      {toggling === cupon.id ? "Procesando..." : cupon.activo_manual ? "Desactivar" : "Activar"}
                    </button>

                    <button
                      onClick={() => handleEditCaducidad(cupon)}
                      className="w-full py-1 bg-orange-500 border-0 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <FaClock /> Caducidad
                    </button>

                    {/* Asignar restaurante/B2B (solo admin) */}
                    {esAdmin && (
                      <button
                        onClick={() => handleAbrirAsignacion(cupon)}
                        className="w-full py-1 bg-indigo-500 border-0 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                        <FaUserTag /> Asignar
                      </button>
                    )}

                    <button
                      onClick={() => handleEliminar(cupon.id)}
                      disabled={eliminando === cupon.id}
                      className="w-full py-1 bg-white border-0 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <FaTrash /> {eliminando === cupon.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Caducidad */}
      {editingCupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Caducidad</h3>
            <p className="text-gray-600 mb-4">Cupón: <strong>{editingCupon.titulo}</strong></p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nueva fecha de caducidad</label>
              <input
                type="datetime-local"
                value={nuevaFechaCaducidad}
                onChange={(e) => setNuevaFechaCaducidad(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              {!editingCupon.activo_manual && (
                <button
                  onClick={() => handleSaveCaducidad(true)}
                  disabled={savingCaducidad}
                  className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium cursor-pointer"
                >
                  {savingCaducidad ? "Guardando..." : "Guardar y Reactivar"}
                </button>
              )}
              <button
                onClick={() => handleSaveCaducidad(false)}
                disabled={savingCaducidad}
                className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium cursor-pointer"
              >
                {savingCaducidad ? "Guardando..." : "Solo Guardar Fecha"}
              </button>
              <button
                onClick={() => setEditingCupon(null)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignación de Restaurante/B2B */}
      {asignandoCupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-1">Asignar Restaurante</h3>
            <p className="text-gray-500 text-sm mb-4">
              Cupón: <strong>{asignandoCupon.titulo}</strong>
              {asignandoCupon.es_promovido && (
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
                  Si tiene suscripción B2B activa, el cupón se marcará como ★ Promovido automáticamente.
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
                onClick={() => setAsignandoCupon(null)}
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

export default ListaTickets;
