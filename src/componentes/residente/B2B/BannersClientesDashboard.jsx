import React, { useEffect, useState } from "react";
import { useAuth } from "../../Context";
import {
  getBannersClientes,
  getBannersClienteStats,
} from "../../api/bannersApi";

/**
 * Pantalla genérica multi-cliente (NO es el dashboard B2B de restaurantes).
 * - Menú hamburguesa → "Banners clientes"
 * - Lista de clientes (Trebol 21, el siguiente, etc.)
 * - Al elegir uno: Checa tus Resultados con Alcance Total + lista de banners
 *
 * Convención: banners con slug "{cliente}-{ubicacion}"
 * (ej. trebol21-portada, heypago-sidebar). Para un cliente nuevo solo hay que
 * dar de alta sus banners con ese prefijo; aparecen solos aquí.
 */
const BannersClientesDashboard = () => {
  const { token } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [clienteKey, setClienteKey] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState(null);
  const [orden, setOrden] = useState("vistas");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      setError(null);
      try {
        const data = await getBannersClientes(token);
        if (!cancelled) setClientes(data.clientes || []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Error al cargar clientes");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !clienteKey) {
      setDetalle(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingDetalle(true);
      setError(null);
      try {
        const stats = await getBannersClienteStats(token, clienteKey);
        if (!cancelled) setDetalle(stats);
      } catch (e) {
        if (!cancelled) setError(e.message || "Error al cargar estadísticas");
      } finally {
        if (!cancelled) setLoadingDetalle(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, clienteKey]);

  const banners = detalle?.banners || [];
  const total = detalle?.total || {
    impresiones: 0,
    clicks: 0,
    ctr: 0,
    cantidad: 0,
  };
  const nombreCliente =
    detalle?.cliente?.nombre ||
    clientes.find((c) => c.key === clienteKey)?.nombre ||
    clienteKey;

  const bannersOrdenados = [...banners].sort((a, b) => {
    if (orden === "vistas") return (b.impresiones || 0) - (a.impresiones || 0);
    if (orden === "clicks") return (b.clicks || 0) - (a.clicks || 0);
    if (orden === "nombre")
      return String(a.nombre || "").localeCompare(String(b.nombre || ""));
    return 0;
  });

  if (loadingList) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-500">Cargando clientes...</span>
      </div>
    );
  }

  // ——— Lista de clientes ———
  if (!clienteKey) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-6 text-left bg-[#f0f0f0] min-h-[70vh]">
        <p className="text-[22px] font-bold text-black leading-[1.1] mb-1">
          Banners clientes
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Elige un cliente para ver views y clicks de sus banners
        </p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {clientes.length === 0 ? (
          <p className="text-xs text-gray-400">
            Aún no hay clientes con banners. Registra banners con slug{" "}
            <code className="text-[11px]">cliente-ubicacion</code> (ej.{" "}
            <code className="text-[11px]">trebol21-portada</code>).
          </p>
        ) : (
          <div className="space-y-2">
            {clientes.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setClienteKey(c.key)}
                className="w-full text-left bg-white border border-gray-300 px-4 py-3 hover:border-black transition-colors"
              >
                <div className="flex justify-between items-baseline gap-3">
                  <span className="text-[20px] font-bold text-black leading-[1]">
                    {c.nombre}
                  </span>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    {c.banners_count} banner{c.banners_count === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex gap-6 mt-2">
                  <div>
                    <p className="text-[28px] font-bold text-black leading-[1]">
                      {(c.impresiones || 0).toLocaleString("es-MX")}
                    </p>
                    <p className="text-xs text-black -mt-0.5">Vistas</p>
                  </div>
                  <div>
                    <p className="text-[28px] font-bold text-black leading-[1]">
                      {(c.clicks || 0).toLocaleString("es-MX")}
                    </p>
                    <p className="text-xs text-black -mt-0.5">Clicks</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ——— Detalle de un cliente (estilo Checa tus Resultados) ———
  if (loadingDetalle) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-500">Cargando {nombreCliente}...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 text-left bg-[#f0f0f0] min-h-[70vh]">
      <button
        type="button"
        onClick={() => {
          setClienteKey(null);
          setDetalle(null);
        }}
        className="text-[12px] text-gray-500 underline mb-3 hover:text-black"
      >
        ← Todos los clientes
      </button>

      <p className="text-[22px] font-bold text-black leading-[1.1] mb-1">
        Checa tus Resultados
      </p>
      <p className="text-[32px] font-bold text-black leading-[1] mb-6">
        {nombreCliente}
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="mb-8">
        <p className="text-[25px] leading-[1] underline mb-1">Alcance Total</p>
        <div className="flex gap-8 mt-1">
          <div>
            <p className="text-[40px] font-bold text-black leading-[1]">
              {(total.impresiones || 0).toLocaleString("es-MX")}
            </p>
            <p className="text-sm text-black -mt-1">Vistas totales</p>
          </div>
          <div>
            <p className="text-[40px] font-bold text-black leading-[1]">
              {(total.clicks || 0).toLocaleString("es-MX")}
            </p>
            <p className="text-sm text-black -mt-1">Clicks totales</p>
          </div>
        </div>
        {total.cantidad > 0 && (
          <p className="text-[10px] text-gray-400 leading-tight mt-1">
            Suma de {total.cantidad} banners
          </p>
        )}
      </div>

      <div className="mb-9">
        <span className="text-[25px] leading-[1] underline pr-2">Banners</span>
        <span>{nombreCliente}</span>
        <span className="text-sm font-bold text-black">
          {banners.length > 0 ? ` (${banners.length})` : ""}
        </span>

        {banners.length === 0 ? (
          <p className="text-xs text-gray-400 mt-2">
            Este cliente aún no tiene banners.
          </p>
        ) : (
          <>
            <div className="leading-tight mb-1 mt-2">
              <p className="text-[40px] font-bold text-black leading-[1]">
                {(total.impresiones || 0).toLocaleString("es-MX")}
              </p>
              <p className="text-sm text-black -mt-1">
                Suma de vistas de banners
              </p>
            </div>
            <div className="leading-tight mb-2">
              <p className="text-[40px] font-bold text-black leading-[1]">
                {(total.clicks || 0).toLocaleString("es-MX")}
              </p>
              <p className="text-sm text-black -mt-1">
                Suma de clicks de banners
              </p>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span className="text-[11px] text-gray-400">Ordenar:</span>
                {[
                  { key: "vistas", label: "Vistas" },
                  { key: "clicks", label: "Clicks" },
                  { key: "nombre", label: "Nombre" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOrden(key)}
                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                      orden === key
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-0.5">
                {bannersOrdenados.map((banner) => (
                  <div
                    key={banner.banner_id}
                    className="flex justify-between items-center text-xs py-0.5"
                  >
                    <span
                      className="truncate max-w-[55%] text-black font-medium"
                      title={banner.nombre}
                    >
                      {banner.nombre}
                    </span>
                    <span className="text-gray-600 whitespace-nowrap text-right">
                      {(banner.impresiones || 0).toLocaleString("es-MX")} v
                      &middot;{" "}
                      {(banner.clicks || 0).toLocaleString("es-MX")} cl
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BannersClientesDashboard;
