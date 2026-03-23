import React, { useState, useEffect } from "react";
import { useAuth } from "../../../Context";
import {
  bannersGet,
  bannerDelete,
  bannerGetNotasAsignadas,
  bannerAsignarNotas,
  bannerClearNotas,
} from "../../../api/bannersApi";
import { FaPlus, FaTrash, FaEdit, FaRandom, FaList, FaCheck, FaTimes, FaNewspaper, FaDesktop, FaMobileAlt, FaBook, FaEye } from "react-icons/fa";
import BannerForm from "./BannerForm";

const estatusBadge = {
  activo: "bg-green-100 text-green-800 border-green-200",
  programado: "bg-blue-100 text-blue-800 border-blue-200",
  expirado: "bg-gray-100 text-gray-600 border-gray-200",
  borrador: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const tipoBadge = {
  imagen: "bg-blue-50 text-blue-700 border-blue-200",
  revista: "bg-purple-50 text-purple-700 border-purple-200",
  newsletter: "bg-orange-50 text-orange-700 border-orange-200",
};

const BannersList = () => {
  const { token } = useAuth();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [filtroOrigen, setFiltroOrigen] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Estado del panel de asignacion
  const [asignarId, setAsignarId] = useState(null);
  const [asignarMode, setAsignarMode] = useState("random");
  const [cantidadRandom, setCantidadRandom] = useState("100");
  const [notaIds, setNotaIds] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [asignarStats, setAsignarStats] = useState(null);
  const [asignarError, setAsignarError] = useState(null);
  const [asignarSuccess, setAsignarSuccess] = useState(null);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const data = await bannersGet(token, {
        tipo: filtroTipo || undefined,
        estatus: filtroEstatus || undefined,
        es_pagado: filtroOrigen === "" ? undefined : filtroOrigen === "cliente" ? true : false,
      });
      setBanners(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error al cargar banners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBanners();
  }, [token, filtroTipo, filtroEstatus, filtroOrigen]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este banner?")) return;
    try {
      await bannerDelete(token, id);
      fetchBanners();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleEdit = (banner) => {
    setEditBanner(banner);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditBanner(null);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditBanner(null);
    fetchBanners();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditBanner(null);
  };

  const openAsignar = async (bannerId) => {
    setAsignarId(bannerId);
    setAsignarMode("random");
    setCantidadRandom("100");
    setNotaIds("");
    setAsignarError(null);
    setAsignarSuccess(null);
    setAsignarStats(null);
    try {
      const stats = await bannerGetNotasAsignadas(token, bannerId);
      setAsignarStats(stats);
    } catch {
      // ignore
    }
  };

  const closeAsignar = () => {
    setAsignarId(null);
    setAsignarStats(null);
    setAsignarError(null);
    setAsignarSuccess(null);
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

      const res = await bannerAsignarNotas(token, asignarId, body);
      setAsignarSuccess(res.message || `${res.asignadas} notas asignadas correctamente`);
      const stats = await bannerGetNotasAsignadas(token, asignarId);
      setAsignarStats(stats);
      fetchBanners();
    } catch (error) {
      console.error("Error al asignar:", error);
      setAsignarError("Error al asignar. Intenta de nuevo.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClearNotas = async () => {
    if (!window.confirm("¿Eliminar todas las asignaciones directas de este banner?")) return;
    try {
      const res = await bannerClearNotas(token, asignarId);
      setAsignarSuccess(res.message);
      setAsignarError(null);
      const stats = await bannerGetNotasAsignadas(token, asignarId);
      setAsignarStats(stats);
      fetchBanners();
    } catch {
      setAsignarError("Error al limpiar asignaciones.");
    }
  };

  if (showForm) {
    return (
      <BannerForm
        banner={editBanner}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div>
      {/* Filters + New button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Todos los tipos</option>
            <option value="imagen">Imagen</option>
            <option value="revista">Revista</option>
            <option value="newsletter">Newsletter</option>
          </select>

          <select
            value={filtroEstatus}
            onChange={(e) => setFiltroEstatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Todos los estatus</option>
            <option value="activo">Activo</option>
            <option value="programado">Programado</option>
            <option value="expirado">Expirado</option>
            <option value="borrador">Borrador</option>
          </select>
          <select
            value={filtroOrigen}
            onChange={(e) => setFiltroOrigen(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Todos los orígenes</option>
            <option value="residente">Solo Residente</option>
            <option value="cliente">Solo clientes</option>
          </select>
        </div>

        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <FaPlus /> Nuevo Banner
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : banners.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No hay banners</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Main preview (collapsed) */}
              <button
                onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                className="w-full cursor-pointer relative group"
              >
                {b.tipo === "revista" && b.imagen_portada ? (
                  /* Revista: solo portada */
                  <div className="bg-gray-100 flex justify-center py-3">
                    <div className="aspect-[3/4] w-28 relative rounded-md overflow-hidden shadow-md">
                      <img
                        src={b.imagen_portada}
                        alt="Portada"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : b.imagen_desktop ? (
                  /* Imagen/Newsletter: solo desktop */
                  <div className="aspect-[16/9] relative bg-gray-100">
                    <img
                      src={b.imagen_desktop}
                      alt={b.alt_text || b.nombre}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center text-gray-300">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Expand hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                    {expandedId === b.id ? "Colapsar" : "Ver detalle"}
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {expandedId === b.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-3">
                  {/* Revista: banner + titulo + descripcion */}
                  {b.tipo === "revista" && (
                    <>
                      {b.imagen_desktop && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <FaDesktop className="text-[9px]" /> Banner
                          </p>
                          <div className="aspect-[4/1] relative rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={b.imagen_desktop}
                              alt="Banner"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      {b.titulo && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Titulo</p>
                          <p className="text-sm font-medium text-gray-800">{b.titulo}</p>
                        </div>
                      )}
                      {b.descripcion && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Descripcion</p>
                          <p className="text-xs text-gray-600 line-clamp-3">{b.descripcion}</p>
                        </div>
                      )}
                      {b.pdf && (
                        <a
                          href={b.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1.5 rounded-md border border-red-200"
                        >
                          <FaBook className="text-[10px]" /> Ver PDF
                        </a>
                      )}
                    </>
                  )}

                  {/* Imagen/Newsletter: mobile version */}
                  {b.tipo !== "revista" && (
                    <>
                      {b.imagen_mobile && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <FaMobileAlt className="text-[9px]" /> Version mobile
                          </p>
                          <div className="aspect-[16/9] relative rounded-lg overflow-hidden border border-gray-200 max-w-[200px]">
                            <img
                              src={b.imagen_mobile}
                              alt="Mobile"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      {b.url_destino && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">URL destino</p>
                          <a href={b.url_destino} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                            {b.url_destino}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Card body */}
              <div className="p-4">
                {/* Name + badges */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-800 truncate">
                      {b.nombre}
                    </h3>
                    {b.tipo === "revista" && b.titulo && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {b.titulo}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-2 flex-shrink-0 justify-end">
                    {b.es_pagado ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border bg-violet-50 text-violet-700 border-violet-200">
                        Cliente
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border bg-yellow-50 text-yellow-700 border-yellow-200">
                        Residente
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      tipoBadge[b.tipo] || "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                      {b.tipo}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      estatusBadge[b.estatus] || "bg-gray-100 text-gray-600 border-gray-200"
                    }`}>
                      {b.estatus}
                    </span>
                    {b.es_default_seccion && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border bg-teal-50 text-teal-700 border-teal-200">
                        Default Sección
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span title="Impresiones">
                    <FaEye className="inline mr-1 text-gray-400" />
                    {(b.impresiones ?? 0).toLocaleString()}
                  </span>
                  <span title="Clicks">
                    <svg className="inline w-3 h-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                    {(b.clicks ?? 0).toLocaleString()}
                  </span>
                  <span className="font-mono text-[10px]" title="Prioridad">
                    P:{b.prioridad ?? 0}
                  </span>
                  {b.fecha_inicio && (
                    <span title="Fecha inicio">
                      {new Date(b.fecha_inicio).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                    </span>
                  )}
                  {b.fecha_fin && (
                    <span title="Fecha fin">
                      → {new Date(b.fecha_fin).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(b)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                  >
                    <FaEdit className="text-[10px]" /> Editar
                  </button>
                  <button
                    onClick={() => asignarId === b.id ? closeAsignar() : openAsignar(b.id)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                      asignarId === b.id
                        ? "bg-purple-100 text-purple-800"
                        : "text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                    }`}
                  >
                    <FaNewspaper className="text-[10px]" /> Notas
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ml-auto"
                  >
                    <FaTrash className="text-[10px]" />
                  </button>
                </div>

                {/* Nota assignment panel */}
                {asignarId === b.id && (
                  <div className="mt-3 bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold text-purple-800">
                        Asignar a notas
                      </span>
                      <button
                        onClick={closeAsignar}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer ml-auto"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="bg-white rounded px-2 py-1.5 border border-purple-200 text-[11px]">
                        <span className="text-gray-500">Asignadas: </span>
                        {asignarStats === null ? (
                          <span className="text-gray-400">...</span>
                        ) : (
                          <span className="font-semibold text-green-700">
                            {asignarStats.total_asignadas.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="bg-white rounded px-2 py-1.5 border border-purple-200 text-[11px]">
                        <span className="text-gray-500">Disponibles: </span>
                        {asignarStats === null ? (
                          <span className="text-gray-400">...</span>
                        ) : (
                          <span className="font-semibold text-blue-700">
                            {asignarStats.total_disponibles.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {asignarStats?.total_asignadas > 0 && (
                        <button
                          onClick={handleClearNotas}
                          className="bg-white rounded px-2 py-1.5 border border-red-200 text-[11px] text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>

                    {/* Feedback */}
                    {asignarSuccess && (
                      <div className="mb-2 bg-green-50 border border-green-200 rounded px-2 py-1.5 text-[11px] text-green-700">
                        {asignarSuccess}
                      </div>
                    )}
                    {asignarError && (
                      <div className="mb-2 bg-red-50 border border-red-200 rounded px-2 py-1.5 text-[11px] text-red-600">
                        {asignarError}
                      </div>
                    )}

                    {/* Mode tabs */}
                    <div className="flex gap-1.5 mb-2">
                      <button
                        onClick={() => setAsignarMode("random")}
                        className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded cursor-pointer ${
                          asignarMode === "random"
                            ? "bg-purple-600 text-white"
                            : "bg-white border border-gray-300 text-gray-600"
                        }`}
                      >
                        <FaRandom /> Al Azar
                      </button>
                      <button
                        onClick={() => setAsignarMode("manual")}
                        className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded cursor-pointer ${
                          asignarMode === "manual"
                            ? "bg-purple-600 text-white"
                            : "bg-white border border-gray-300 text-gray-600"
                        }`}
                      >
                        <FaList /> IDs Manual
                      </button>
                    </div>

                    {asignarMode === "random" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={cantidadRandom}
                          onChange={(e) => setCantidadRandom(e.target.value)}
                          placeholder="Cantidad"
                          min="1"
                          className="border border-gray-300 rounded px-2 py-1.5 text-xs w-24"
                        />
                        <button
                          onClick={handleAsignar}
                          disabled={!cantidadRandom || Number(cantidadRandom) < 1 || isAssigning}
                          className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded text-[11px] hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                        >
                          {isAssigning ? (
                            <span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" />
                          ) : (
                            <FaCheck />
                          )}
                          Asignar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={notaIds}
                          onChange={(e) => setNotaIds(e.target.value)}
                          placeholder="IDs: 123, 456, 789"
                          className="border border-gray-300 rounded px-2 py-1.5 text-xs flex-1"
                        />
                        <button
                          onClick={handleAsignar}
                          disabled={!notaIds.trim() || isAssigning}
                          className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded text-[11px] hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannersList;
