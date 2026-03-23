import React, { useState, useEffect } from "react";
import { useAuth } from "../../../Context";
import {
  slotsGet,
  slotAssignBanner,
  slotUnassignBanner,
  bannersGet,
} from "../../../api/bannersApi";
import { FaTimes, FaPlus, FaDesktop, FaMobileAlt, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

/* ── Aspect ratios por posición para mockup visual ── */
const slotAspect = {
  top: "aspect-[5/1]",
  between_categories: "aspect-[4/1]",
  sidebar: "aspect-[1/1]",
  inline: "aspect-[3/1]",
  footer: "aspect-[5/1]",
};

const slotLabel = {
  top: "Banner horizontal superior",
  between_categories: "Banner entre secciones",
  sidebar: "Banner lateral",
  inline: "Banner dentro de nota",
  footer: "Banner pie de página",
};

const BannerSlotManager = () => {
  const { token } = useAuth();
  const [slots, setSlots] = useState([]);
  const [banners, setBanners] = useState([]);
  const [slotBanners, setSlotBanners] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [assigningSlot, setAssigningSlot] = useState(null);
  const [selectedBannerId, setSelectedBannerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [slotsData, bannersData] = await Promise.all([
        slotsGet(token),
        bannersGet(token, { estatus: "activo" }),
      ]);
      const slotsList = Array.isArray(slotsData) ? slotsData : slotsData.slots || [];
      setSlots(slotsList);
      setBanners(Array.isArray(bannersData) ? bannersData : bannersData.data || []);

      const bannersMap = {};
      slotsList.forEach((slot) => {
        const asignaciones = slot.banner_asignaciones || [];
        bannersMap[slot.id] = asignaciones
          .filter((a) => a.Banner)
          .map((a) => ({ ...a.Banner, _asignacionId: a.id, _activo: a.activo }))
          .sort((a, b) => {
            // Paid active banners first, then Residente defaults
            if (a.es_pagado && a._activo) return -1;
            if (b.es_pagado && b._activo) return 1;
            return 0;
          });
      });
      setSlotBanners(bannersMap);
    } catch (error) {
      console.error("Error al cargar slots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleAssign = async (slotId) => {
    if (!selectedBannerId) return;
    try {
      await slotAssignBanner(token, slotId, selectedBannerId);
      setAssigningSlot(null);
      setSelectedBannerId("");
      setSearchTerm("");
      fetchData();
    } catch (error) {
      console.error("Error al asignar:", error);
    }
  };

  const handleUnassign = async (slotId, bannerId) => {
    if (!window.confirm("¿Desasignar este banner del slot?")) return;
    try {
      await slotUnassignBanner(token, slotId, bannerId);
      fetchData();
    } catch (error) {
      console.error("Error al desasignar:", error);
    }
  };

  const toggleGroup = (pagina) => {
    setCollapsedGroups((prev) => ({ ...prev, [pagina]: !prev[pagina] }));
  };

  const grouped = slots.reduce((acc, slot) => {
    const page = slot.pagina || "sin_pagina";
    if (!acc[page]) acc[page] = [];
    acc[page].push(slot);
    return acc;
  }, {});

  const filteredBanners = banners.filter((b) =>
    b.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageLabels = {
    homepage: "Homepage",
    nota: "Interior de Nota",
    seccion: "Secciones",
    global: "Global (todas las páginas)",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (slots.length === 0) {
    return <p className="text-gray-500 text-center py-12">No hay slots configurados</p>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([pagina, pageSlots]) => {
        const isCollapsed = collapsedGroups[pagina];
        const totalAssigned = pageSlots.reduce(
          (sum, s) => sum + (slotBanners[s.id]?.length || 0),
          0
        );
        const totalSlots = pageSlots.length;

        return (
          <div key={pagina} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(pagina)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-gray-800">
                  {pageLabels[pagina] || pagina}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {totalAssigned}/{totalSlots} asignados
                </span>
              </div>
              {isCollapsed ? <FaChevronDown className="text-gray-400" /> : <FaChevronUp className="text-gray-400" />}
            </button>

            {!isCollapsed && (
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                {pageSlots.map((slot) => {
                  const assigned = slotBanners[slot.id] || [];
                  const aspect = slotAspect[slot.posicion] || "aspect-[4/1]";
                  const posLabel = slotLabel[slot.posicion] || slot.posicion;

                  return (
                    <div
                      key={slot.id}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors"
                    >
                      {/* Slot header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-gray-400">
                            {slot.dispositivo === "desktop" ? (
                              <FaDesktop className="text-sm" />
                            ) : slot.dispositivo === "mobile" ? (
                              <FaMobileAlt className="text-sm" />
                            ) : (
                              <>
                                <FaDesktop className="text-sm" />
                                <FaMobileAlt className="text-sm" />
                              </>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-700">
                              {slot.nombre || slot.slot_key}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {slot.slot_key}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {slot.vendible && slot.precio_mensual_centavos > 0 ? (
                            <span className="text-[10px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              ${(slot.precio_mensual_centavos / 100).toLocaleString("es-MX")}/mes
                            </span>
                          ) : !slot.vendible ? (
                            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              Solo admin
                            </span>
                          ) : null}
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {posLabel}
                          </span>
                        </div>
                      </div>

                      {/* Visual preview area */}
                      <div className="p-4">
                        {assigned.length > 0 ? (
                          <div className="space-y-3">
                            {assigned.map((b) => (
                              <div key={b.id} className="group relative">
                                {/* Priority status bar */}
                                <div className={`flex items-center justify-between px-2 py-1 rounded-t-md text-[10px] font-medium ${
                                  b.es_pagado && b._activo
                                    ? "bg-green-100 text-green-800"
                                    : !b.es_pagado && !b._activo
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-gray-50 text-gray-500"
                                }`}>
                                  <span>
                                    {b.es_pagado && b._activo
                                      ? "★ En display — Banner de pago activo"
                                      : !b.es_pagado && !b._activo
                                        ? "⏸ En espera — Se activará al vencer el banner de pago"
                                        : "✓ Activo"}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                    b.es_pagado
                                      ? "bg-violet-100 text-violet-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}>
                                    {b.es_pagado ? "Cliente" : "Residente"}
                                  </span>
                                </div>
                                {b.tipo === "revista" ? (
                                  /* Revista: portada + banner side by side */
                                  <div className="flex gap-3 items-start">
                                    {/* Portada */}
                                    {b.imagen_portada && (
                                      <div className="w-20 flex-shrink-0">
                                        <div className="aspect-[3/4] relative rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                          <img
                                            src={b.imagen_portada}
                                            alt="Portada"
                                            className="absolute inset-0 w-full h-full object-cover"
                                          />
                                        </div>
                                        <p className="text-[9px] text-gray-400 text-center mt-1">Portada</p>
                                      </div>
                                    )}
                                    {/* Banner */}
                                    <div className="flex-1 min-w-0">
                                      <div className={`relative ${aspect} w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200`}>
                                        {b.imagen_desktop ? (
                                          <img
                                            src={b.imagen_desktop}
                                            alt={b.alt_text || b.nombre}
                                            className="absolute inset-0 w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">
                                            Sin banner
                                          </div>
                                        )}
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                          <button
                                            onClick={() => handleUnassign(slot.id, b.id)}
                                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 flex items-center gap-1.5 cursor-pointer shadow-lg"
                                          >
                                            <FaTimes className="text-[10px]" /> Quitar
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-[9px] text-gray-400 mt-1">Banner</p>
                                    </div>
                                  </div>
                                ) : (
                                  /* Imagen/Newsletter: solo banner en aspect ratio del slot */
                                  <div className={`relative ${aspect} w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200`}>
                                    {b.imagen_desktop ? (
                                      <img
                                        src={b.imagen_desktop}
                                        alt={b.alt_text || b.nombre}
                                        className="absolute inset-0 w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">
                                        Sin imagen
                                      </div>
                                    )}
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <button
                                        onClick={() => handleUnassign(slot.id, b.id)}
                                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 flex items-center gap-1.5 cursor-pointer shadow-lg"
                                      >
                                        <FaTimes className="text-[10px]" /> Quitar
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {/* Banner name below preview */}
                                <div className="flex items-center justify-between mt-2 px-1">
                                  <span className="text-xs font-medium text-gray-600 truncate">
                                    {b.nombre}
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    b.tipo === "revista"
                                      ? "bg-purple-100 text-purple-700"
                                      : b.tipo === "newsletter"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-blue-100 text-blue-700"
                                  }`}>
                                    {b.tipo}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Empty slot placeholder */
                          <div className={`${aspect} w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300`}>
                            <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs">Sin banner asignado</span>
                          </div>
                        )}

                        {/* Assign button / selector */}
                        {assigningSlot === slot.id ? (
                          <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="relative mb-2">
                              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
                              <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar banner..."
                                className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                              />
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-1 mb-2">
                              {filteredBanners.map((b) => (
                                <button
                                  key={b.id}
                                  onClick={() => setSelectedBannerId(b.id)}
                                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors cursor-pointer ${
                                    selectedBannerId === b.id
                                      ? "bg-blue-200 text-blue-900"
                                      : "hover:bg-blue-100 text-gray-700"
                                  }`}
                                >
                                  {b.imagen_desktop ? (
                                    <img
                                      src={b.imagen_desktop}
                                      alt=""
                                      className="w-10 h-6 object-cover rounded flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-6 bg-gray-200 rounded flex-shrink-0" />
                                  )}
                                  <span className="truncate flex-1">{b.nombre}</span>
                                  <span className="text-[10px] text-gray-400 capitalize">{b.tipo}</span>
                                </button>
                              ))}
                              {filteredBanners.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-2">
                                  No se encontraron banners activos
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAssign(slot.id)}
                                disabled={!selectedBannerId}
                                className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-40 cursor-pointer transition-colors"
                              >
                                Asignar
                              </button>
                              <button
                                onClick={() => {
                                  setAssigningSlot(null);
                                  setSelectedBannerId("");
                                  setSearchTerm("");
                                }}
                                className="px-3 py-1.5 rounded-md text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningSlot(slot.id)}
                            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                          >
                            <FaPlus className="text-[10px]" /> Asignar banner
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BannerSlotManager;
