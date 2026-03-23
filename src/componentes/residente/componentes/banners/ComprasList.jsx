import React, { useState, useEffect } from "react";
import { useAuth } from "../../../Context";
import {
  comprasGet,
  compraUpdate,
  compraAsignarNotas,
  compraGetNotas,
  notasDisponiblesCount,
} from "../../../api/bannersApi";
import { FaRandom, FaList, FaTimes, FaCheck, FaStripe } from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";

const estatusBadge = {
  pendiente: "bg-yellow-100 text-yellow-800",
  activa: "bg-green-100 text-green-800",
  completada: "bg-blue-100 text-blue-800",
  cancelada: "bg-red-100 text-red-600",
};

const ComprasList = () => {
  const { token } = useAuth();
  const [compras, setCompras] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [asignarId, setAsignarId] = useState(null);
  const [asignarMode, setAsignarMode] = useState("random");
  const [cantidadRandom, setCantidadRandom] = useState("");
  const [notaIds, setNotaIds] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [notasCompra, setNotasCompra] = useState({});
  const [notasDisponibles, setNotasDisponibles] = useState(null);
  const [asignarCompra, setAsignarCompra] = useState(null);
  const [asignarError, setAsignarError] = useState(null);
  const [asignarSuccess, setAsignarSuccess] = useState(null);

  const fetchCompras = async () => {
    setIsLoading(true);
    try {
      const data = await comprasGet(token, {
        estatus: filtroEstatus || undefined,
      });
      setCompras(Array.isArray(data) ? data : data.compras || []);
    } catch (error) {
      console.error("Error al cargar compras:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCompras();
  }, [token, filtroEstatus]);

  const handleStatusUpdate = async (id, nuevoEstatus) => {
    try {
      await compraUpdate(token, id, { estatus: nuevoEstatus });
      fetchCompras();
    } catch (error) {
      console.error("Error al actualizar estatus:", error);
    }
  };

  const openAsignar = async (compra) => {
    setAsignarId(compra.id);
    setAsignarCompra(compra);
    setAsignarMode("random");
    setNotaIds("");
    setAsignarError(null);
    setAsignarSuccess(null);
    setNotasDisponibles(null);

    // Calcular cuántas notas faltan del paquete
    const restantes = (compra.notas_total ?? 0) - (compra.notas_asignadas ?? 0);
    setCantidadRandom(restantes > 0 ? String(restantes) : "");

    try {
      const [notasData, disponiblesData] = await Promise.all([
        compraGetNotas(token, compra.id),
        notasDisponiblesCount(token, compra.id),
      ]);
      setNotasCompra((prev) => ({
        ...prev,
        [compra.id]: Array.isArray(notasData) ? notasData : notasData.notas || [],
      }));
      setNotasDisponibles(disponiblesData.total ?? null);
    } catch {
      // ignore
    }
  };

  const handleAsignar = async () => {
    if (!asignarId) return;
    setIsAssigning(true);
    setAsignarError(null);
    setAsignarSuccess(null);
    try {
      const body =
        asignarMode === "random"
          ? { random: true, cantidad: Number(cantidadRandom) }
          : {
              nota_ids: notaIds
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map(Number),
            };

      const res = await compraAsignarNotas(token, asignarId, body);
      setAsignarSuccess(`${res.asignadas ?? res.message} notas asignadas correctamente.`);
      // Recargar notas asignadas y disponibles
      const [notasData, disponiblesData] = await Promise.all([
        compraGetNotas(token, asignarId),
        notasDisponiblesCount(token, asignarId),
      ]);
      setNotasCompra((prev) => ({
        ...prev,
        [asignarId]: Array.isArray(notasData) ? notasData : notasData.notas || [],
      }));
      setNotasDisponibles(disponiblesData.total ?? null);
      fetchCompras();
    } catch (error) {
      console.error("Error al asignar notas:", error);
      setAsignarError("Error al asignar notas. Intenta de nuevo.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold">Compras de Banners</h3>
        <select
          value={filtroEstatus}
          onChange={(e) => setFiltroEstatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Todos los estatus</option>
          <option value="pendiente">Pendiente</option>
          <option value="activa">Activa</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : compras.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No hay compras</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">Comprador</th>
                <th className="pb-3 pr-4">Tipo</th>
                <th className="pb-3 pr-4">Banner</th>
                <th className="pb-3 pr-4">Detalle</th>
                <th className="pb-3 pr-4">Estatus</th>
                <th className="pb-3 pr-4">Periodo</th>
                <th className="pb-3 pr-4">Stripe</th>
                <th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => (
                <React.Fragment key={c.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4 text-gray-400">#{c.id}</td>
                    <td className="py-3 pr-4">
                      <div>
                        <p className="font-medium">
                          {c.Usuario?.nombre ||
                            c.comprador_nombre ||
                            c.usuario_id ||
                            "-"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {c.Usuario?.correo || c.comprador_correo || ""}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {c.tipo_compra === "slot_fijo" ? (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">
                          Slot Fijo
                        </span>
                      ) : c.tipo_compra === "notas_azar" ? (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          Notas Azar
                        </span>
                      ) : c.tipo_compra === "seccion" ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                          Sección
                        </span>
                      ) : c.paquete_id ? (
                        <span className="text-gray-500 text-xs">{c.paquete?.nombre || c.Paquete?.nombre || "Paquete"}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Manual</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {(c.banner?.imagen_desktop || c.Banner?.imagen_desktop) && (
                          <img
                            src={c.banner?.imagen_desktop || c.Banner?.imagen_desktop}
                            alt="banner"
                            className="w-10 h-6 object-cover rounded border border-gray-200 flex-shrink-0"
                          />
                        )}
                        <span className="text-xs text-gray-700 truncate max-w-[120px]">
                          {c.banner?.nombre || c.Banner?.nombre || c.banner_nombre || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {c.tipo_compra === "seccion" ? (
                        <div className="text-xs">
                          <span className="text-gray-700 font-medium">{c.seccion}</span>
                          <span className="text-gray-400"> / </span>
                          <span className="text-gray-700">{c.categoria}</span>
                          <a
                            href={`https://residente.mx/seccion/${c.seccion}/categoria/${c.categoria}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-500 hover:underline mt-0.5 truncate max-w-[160px]"
                          >
                            Ver página ↗
                          </a>
                        </div>
                      ) : c.tipo_compra === "slot_fijo" ? (
                        <span className="text-xs text-gray-600">
                          Slot #{c.slot_id}
                        </span>
                      ) : (
                        <>
                          <span className="font-medium">
                            {c.notas_asignadas ?? 0}
                          </span>
                          <span className="text-gray-400">
                            /{c.notas_total ?? "?"}
                          </span>
                          <span className="text-gray-300 text-xs"> notas</span>
                        </>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          estatusBadge[c.estatus] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c.estatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs">
                      {c.fecha_inicio || c.fecha_fin ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-500">
                            {c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString("es-MX") : "?"} — {c.fecha_fin ? new Date(c.fecha_fin).toLocaleDateString("es-MX") : "?"}
                          </span>
                          {(c.duracion_tipo || c.meses) && (
                            <span className="text-purple-600 font-medium">
                              {c.duracion_tipo === "semanal" ? "Semanal (7 días)"
                                : c.duracion_tipo === "mensual" ? "Mensual (30 días)"
                                : c.duracion_tipo === "trimestral" ? "Trimestral (90 días)"
                                : `${c.meses} días`}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString("es-MX") : "-"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-xs">
                      {c.stripe_subscription_id ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-mono">
                            {c.stripe_subscription_id.slice(0, 20)}...
                          </span>
                          <span className="text-gray-400 text-[10px]">Auto-Stripe</span>
                        </div>
                      ) : (
                        <span className="text-gray-300">Manual</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tipo_compra !== "seccion" && (
                          <button
                            onClick={() => openAsignar(c)}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 cursor-pointer"
                          >
                            Asignar Notas
                          </button>
                        )}
                        {c.estatus === "pendiente" && (
                          <button
                            onClick={() => handleStatusUpdate(c.id, "activa")}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 cursor-pointer"
                          >
                            Activar
                          </button>
                        )}
                        {c.estatus === "activa" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(c.id, "completada")
                            }
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 cursor-pointer"
                          >
                            Completar
                          </button>
                        )}
                        {c.estatus !== "cancelada" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(c.id, "cancelada")
                            }
                            className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Asignar notas inline */}
                  {asignarId === c.id && (
                    <tr className="bg-purple-50">
                      <td colSpan={9} className="p-4">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-semibold text-purple-800">
                            Asignar notas — compra #{c.id}
                          </span>
                          <button
                            onClick={() => setAsignarId(null)}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
                          >
                            <FaTimes />
                          </button>
                        </div>

                        {/* Stats bar */}
                        <div className="flex flex-wrap gap-4 mb-4 text-xs">
                          <div className="bg-white rounded px-3 py-2 border border-purple-200">
                            <span className="text-gray-500">Paquete: </span>
                            <span className="font-semibold">{c.notas_total ?? "?"} notas</span>
                          </div>
                          <div className="bg-white rounded px-3 py-2 border border-purple-200">
                            <span className="text-gray-500">Ya asignadas: </span>
                            <span className="font-semibold text-green-700">{notasCompra[c.id]?.length ?? c.notas_asignadas ?? 0}</span>
                          </div>
                          <div className="bg-white rounded px-3 py-2 border border-purple-200">
                            <span className="text-gray-500">Faltan asignar: </span>
                            <span className="font-semibold text-orange-600">
                              {(c.notas_total ?? 0) - (notasCompra[c.id]?.length ?? c.notas_asignadas ?? 0)}
                            </span>
                          </div>
                          <div className="bg-white rounded px-3 py-2 border border-purple-200">
                            <span className="text-gray-500">Notas publicadas disponibles: </span>
                            {notasDisponibles === null ? (
                              <span className="text-gray-400">cargando...</span>
                            ) : (
                              <span className="font-semibold text-blue-700">{notasDisponibles.toLocaleString()}</span>
                            )}
                          </div>
                        </div>

                        {/* Notas ya asignadas (ids) */}
                        {notasCompra[c.id]?.length > 0 && (
                          <div className="mb-3 bg-white rounded px-3 py-2 border border-gray-200 text-xs text-gray-500">
                            <span className="font-medium text-gray-700">IDs asignados: </span>
                            {notasCompra[c.id].map((n) => n.nota_id || n.id).join(", ")}
                          </div>
                        )}

                        {/* Feedback */}
                        {asignarSuccess && (
                          <div className="mb-3 bg-green-50 border border-green-200 rounded px-3 py-2 text-xs text-green-700">
                            {asignarSuccess}
                          </div>
                        )}
                        {asignarError && (
                          <div className="mb-3 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-600">
                            {asignarError}
                          </div>
                        )}

                        {/* Mode tabs */}
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => setAsignarMode("random")}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded cursor-pointer ${
                              asignarMode === "random"
                                ? "bg-purple-600 text-white"
                                : "bg-white border border-gray-300 text-gray-600"
                            }`}
                          >
                            <FaRandom /> Al Azar
                          </button>
                          <button
                            onClick={() => setAsignarMode("manual")}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded cursor-pointer ${
                              asignarMode === "manual"
                                ? "bg-purple-600 text-white"
                                : "bg-white border border-gray-300 text-gray-600"
                            }`}
                          >
                            <FaList /> IDs Manual
                          </button>
                        </div>

                        {asignarMode === "random" ? (
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <input
                                type="number"
                                value={cantidadRandom}
                                onChange={(e) => setCantidadRandom(e.target.value)}
                                placeholder="Cantidad"
                                min="1"
                                max={notasDisponibles ?? undefined}
                                className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32"
                              />
                              {notasDisponibles !== null && Number(cantidadRandom) > notasDisponibles && (
                                <span className="text-xs text-red-500">
                                  Máximo {notasDisponibles.toLocaleString()} disponibles
                                </span>
                              )}
                            </div>
                            <button
                              onClick={handleAsignar}
                              disabled={!cantidadRandom || isAssigning || Number(cantidadRandom) < 1}
                              className="flex items-center gap-1 bg-purple-600 text-white px-4 py-1.5 rounded text-xs hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                            >
                              {isAssigning ? (
                                <span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" />
                              ) : (
                                <FaCheck />
                              )}
                              Asignar al Azar
                            </button>
                            <span className="text-xs text-gray-400">
                              Se seleccionarán notas publicadas al azar que no estén ya asignadas
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={notaIds}
                              onChange={(e) => setNotaIds(e.target.value)}
                              placeholder="IDs separados por coma: 123, 456, 789"
                              className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1"
                            />
                            <button
                              onClick={handleAsignar}
                              disabled={!notaIds.trim() || isAssigning}
                              className="flex items-center gap-1 bg-purple-600 text-white px-4 py-1.5 rounded text-xs hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                            >
                              {isAssigning ? (
                                <span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" />
                              ) : (
                                <FaCheck />
                              )}
                              Asignar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComprasList;
