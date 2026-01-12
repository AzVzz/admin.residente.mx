import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cuponesGetTodas, cuponBorrar, cuponEditar } from "../../../api/cuponesGet";
import { FaTrash } from "react-icons/fa";
import { useAuth } from "../../../Context";

const ListaTickets = () => {
  const { usuario, token } = useAuth();
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [toggling, setToggling] = useState(null);

  // Verificar permisos al inicio
  if (!usuario || (usuario.rol !== 'residente' && usuario.rol !== 'b2b' && usuario.permisos !== 'residente' && usuario.permisos !== 'b2b' && usuario.permisos !== 'todos')) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center p-8 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">
            No tienes permisos para ver el dashboard de cupones.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    setLoading(true);
    cuponesGetTodas(token)
      .then(async (data) => {
        setCupones(data);

        // --- LAZY DEACTIVATION LOGIC ---
        // Check for coupons that are active but expired (by fecha_fin or fecha_validez)
        const now = new Date();
        const expiredCoupons = data.filter(c => {
          if (!c.activo_manual) return false;

          // Check fecha_fin expiration
          if (c.fecha_fin) {
            const endDate = new Date(c.fecha_fin);
            if (now > endDate) return true;
          }

          // Check fecha_validez expiration (caducidad automática)
          if (c.tiene_caducidad && c.fecha_validez) {
            const validezDate = new Date(c.fecha_validez);
            if (now > validezDate) return true;
          }

          return false;
        });

        if (expiredCoupons.length > 0) {
          console.log(`Found ${expiredCoupons.length} expired coupons. Deactivating...`);
          let updatedCount = 0;

          // Process deactivations
          // We map to promises to do them in parallel
          const updates = expiredCoupons.map(async (c) => {
            try {
              await cuponEditar(c.id, { activo_manual: false }, token);
              updatedCount++;
              return c.id;
            } catch (err) {
              console.error(`Failed to auto-deactivate coupon ${c.id}`, err);
              return null;
            }
          });

          const deactivatedIds = await Promise.all(updates);
          const successfulIds = deactivatedIds.filter(id => id !== null);

          if (successfulIds.length > 0) {
            // Update local state to reflect changes
            setCupones(prevCupones => prevCupones.map(c =>
              successfulIds.includes(c.id) ? { ...c, activo_manual: false } : c
            ));
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este cupón?")) return;
    setEliminando(id);
    try {
      await cuponBorrar(id, token);
      setCupones(cupones.filter((c) => c.id !== id));
    } catch (err) {
      alert("Error al borrar el cupón");
    } finally {
      setEliminando(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const cupon = cupones.find(c => c.id === id);
    if (!cupon) return;

    // Lógica para ACTIVAR
    if (!currentStatus) {
      // Verificar si ya venció
      if (cupon.fecha_fin) {
        const now = new Date();
        const endDate = new Date(cupon.fecha_fin);
        if (now > endDate) {
          alert("No puedes activar este cupón porque su fecha de finalización ya ha pasado.");
          return;
        }
      }
    }
    // Lógica para DESACTIVAR
    else {
      // Advertencia si tiene fechas
      if (cupon.fecha_inicio || cupon.fecha_fin) {
        const confirmDeactivate = window.confirm(
          "Este cupón tiene fechas programadas. Si lo desactivas manualmente, dejará de mostrarse aunque esté dentro del rango de fechas. ¿Deseas continuar?"
        );
        if (!confirmDeactivate) return;
      }
    }

    setToggling(id);
    try {
      const nuevoStatus = !currentStatus;
      await cuponEditar(id, { activo_manual: nuevoStatus }, token);

      // Actualizar estado local
      setCupones(cupones.map(c =>
        c.id === id ? { ...c, activo_manual: nuevoStatus } : c
      ));
    } catch (err) {
      alert("Error al cambiar el estado: " + err.message);
    } finally {
      setToggling(null);
    }
  };

  // Actualizada para considerar tiene_caducidad y fecha_validez
  const getEstado = (cupon) => {
    const { fecha_inicio, fecha_fin, activo_manual, tiene_caducidad, fecha_validez } = cupon;

    if (!activo_manual) return { label: "Inactivo", color: "text-gray-600 bg-gray-200" };

    const now = new Date();

    // Verificar caducidad automática
    if (tiene_caducidad && fecha_validez) {
      const validezDate = new Date(fecha_validez);
      if (now > validezDate) return { label: "Expirado", color: "text-red-600 bg-red-100" };
    }

    // Verificar rango de fechas de promoción
    if (fecha_inicio && fecha_fin) {
      const startDate = new Date(fecha_inicio);
      const endDate = new Date(fecha_fin);
      if (now < startDate) return { label: "Programado", color: "text-yellow-600 bg-yellow-100" };
      if (now > endDate) return { label: "Vencido", color: "text-red-600 bg-red-100" };
    }

    return { label: "Activo", color: "text-green-600 bg-green-100" };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Mis Cupones (Dashboard)
        </h2>
        <Link
          to="/promo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center gap-2"
        >
          <span className="text-xl">+</span> Agregar Cupón
        </Link>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {(() => {
        const now = new Date();
        const activePermanent = cupones.find(c => c.activo_manual && !c.fecha_inicio && !c.fecha_fin);
        const activeDated = cupones.find(c => {
          if (!c.activo_manual || !c.fecha_inicio || !c.fecha_fin) return false;
          const start = new Date(c.fecha_inicio);
          const end = new Date(c.fecha_fin);
          return now >= start && now <= end;
        });

        if (activePermanent && activeDated) {
          return (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded shadow-sm" role="alert">
              <p className="font-bold flex items-center gap-2">
                <span className="text-xl">ℹ️</span> Aviso de Prioridad
              </p>
              <p className="mt-1">
                Actualmente tienes un cupón con fecha activo (<strong>{activeDated.titulo}</strong>) que vence el {new Date(activeDated.fecha_fin).toLocaleString()}.
                <br />
                Tu cupón permanente (<strong>{activePermanent.titulo}</strong>) está en espera y se mostrará automáticamente cuando el cupón con fecha expire o sea desactivado manualmente.
              </p>
            </div>
          );
        }
        return null;
      })()}

      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <p className="mt-2 text-gray-600">Cargando cupones...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
          {cupones.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              No tienes cupones registrados.
            </div>
          ) : (
            cupones.map((cupon) => {
              const estado = getEstado(cupon);

              return (
                <div key={cupon.id} className="flex flex-col items-center  p-4 relative">

                  {/* Badge de Estado */}
                  <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold font-roman ${estado.color}`}>
                    {estado.label}
                  </div>

                  {/* Visualización del Ticket (Imagen) */}
                  <div className="w-full flex justify-center mb-2">
                    {cupon.imagen_url ? (
                      <img
                        src={cupon.imagen_url}
                        alt={`Cupón: ${cupon.titulo}`}
                        className="h-full w-auto object-contain transform origin-top drop-shadow-[2px_2px_1.5px_rgba(0,0,0,0.4)] rounded-sm"
                      />
                    ) : (
                      <div className="text-gray-400 p-10 border-2 border-dashed border-gray-300 rounded-lg">
                        Imagen no disponible
                      </div>
                    )}
                  </div>

                  {/* Badges de vistas y clicks */}
                  <div className="flex justify-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {cupon.views ?? 0} Vistas
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                      {cupon.clicks ?? 0} Clicks
                    </span>
                  </div>

                  {/* Info de Fechas */}
                  <div className="mb-2 text-center text-sm text-gray-600 w-full max-w-md">
                    {cupon.fecha_inicio && cupon.fecha_fin ? (
                      <>
                        <p><span className="font-semibold">Inicio:</span> {new Date(cupon.fecha_inicio).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Fin:</span> {new Date(cupon.fecha_fin).toLocaleDateString()}</p>
                      </>
                    ) : (
                      <p className="font-bold text-blue-600 text-sm font-roman">Cupón Permanente</p>
                    )}

                    {/* Indicador de Caducidad Automática */}
                    {cupon.tiene_caducidad && cupon.fecha_validez && (
                      <p className="mt-1 text-orange-600 font-semibold">
                        ⏰ Expira: {new Date(cupon.fecha_validez).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="w-full max-w-md flex flex-col gap-2">
                    {/* Toggle Activar/Desactivar */}
                    <button
                      onClick={() => handleToggleStatus(cupon.id, cupon.activo_manual)}
                      disabled={toggling === cupon.id}
                      className={`w-full py-1 border rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-sm font-roman cursor-pointer ${cupon.activo_manual
                        ? "bg-white border-0 text-yellow-600"
                        : "bg-green-500 border-0 text-white hover:bg-green-600"
                        }`}
                    >
                      {toggling === cupon.id ? "Procesando..." : (cupon.activo_manual ? "Desactivar Cupón" : "Activar Cupón")}
                    </button>

                    {/* Acciones */}
                    <button
                      onClick={() => handleEliminar(cupon.id)}
                      disabled={eliminando === cupon.id}
                      className="w-full py-1 bg-white border-0 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm text-sm font-roman cursor-pointer"
                    >
                      <FaTrash />
                      {eliminando === cupon.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ListaTickets;
