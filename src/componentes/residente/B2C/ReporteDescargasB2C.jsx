import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../Context";
import {
  descargasB2cGet,
  syncDescargasB2c,
} from "../../api/descargasB2cGet";

const formatFecha = (fecha) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const escapeCsv = (value) => {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/** Ficha imprimible (1 página = 1 registro) */
const FichaPdf = ({ d, index }) => (
  <div className="ficha-pdf break-after-page border-2 border-black bg-white p-8 mb-6 last:mb-0">
    <div className="flex items-start justify-between mb-6 border-b-2 border-black pb-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest">Residente</p>
        <h2 className="text-2xl font-black mt-1">Etiqueta Restaurantera®</h2>
        <p className="text-sm text-gray-600 mt-1">Comprobante de descarga</p>
      </div>
      <div className="text-right text-sm">
        <p className="font-bold">#{index}</p>
        <p className="text-gray-600">{formatFecha(d.created_at)}</p>
      </div>
    </div>

    <dl className="space-y-4 text-base">
      <div>
        <dt className="text-xs uppercase tracking-wide text-gray-500 font-bold">
          Nombre
        </dt>
        <dd className="text-xl font-semibold mt-0.5">{d.nombre || "—"}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-gray-500 font-bold">
          Correo
        </dt>
        <dd className="text-xl font-semibold mt-0.5 break-all">
          {d.correo || "—"}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-gray-500 font-bold">
          Restaurante
        </dt>
        <dd className="text-xl font-semibold mt-0.5">
          {d.nombre_restaurante || "—"}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-gray-500 font-bold">
          Descarga / producto
        </dt>
        <dd className="text-xl font-semibold mt-0.5">
          {d.producto || "Video Etiqueta Restaurantera"}
        </dd>
      </div>
      {d.codigo_promocion ? (
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500 font-bold">
            Código promoción
          </dt>
          <dd className="text-lg font-semibold mt-0.5">{d.codigo_promocion}</dd>
        </div>
      ) : null}
    </dl>

    <p className="mt-10 text-xs text-gray-500 border-t pt-4">
      residente.mx/admin/B2C — registro de descarga
    </p>
  </div>
);

const ReporteDescargasB2C = () => {
  const { token } = useAuth();
  const [descargas, setDescargas] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [syncMsg, setSyncMsg] = useState("");
  const [busqueda, setBusqueda] = useState("");
  /** null = no print mode; 'all' = todas; object = una sola */
  const [printMode, setPrintMode] = useState(null);

  const cargar = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await descargasB2cGet(token);
      setDescargas(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err.message || "Error al cargar el reporte");
      setDescargas([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const sincronizarDesdeStripe = async () => {
    if (!token) return;
    setSyncing(true);
    setSyncMsg("");
    setError("");
    try {
      const sync = await syncDescargasB2c(token, "");
      setSyncMsg(
        `Sincronizado: ${sync.creadas || 0} nuevos, ${sync.existentes || 0} ya existían.`,
      );
      const result = await descargasB2cGet(token);
      setDescargas(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(
        err.message ||
          "No se pudo sincronizar. Espera el deploy de pagos o corre el backfill en el servidor.",
      );
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!printMode) return;
    const t = setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 150);
    return () => clearTimeout(t);
  }, [printMode]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return descargas;
    return descargas.filter((d) => {
      const haystack = [
        d.nombre,
        d.nombre_restaurante,
        d.correo,
        d.codigo_promocion,
        d.producto,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [descargas, busqueda]);

  const fichasParaImprimir = useMemo(() => {
    if (!printMode) return [];
    if (printMode === "all") return filtradas;
    return [printMode];
  }, [printMode, filtradas]);

  const exportarCsv = () => {
    const headers = [
      "nombre",
      "nombre_restaurante",
      "correo",
      "codigo_promocion",
      "producto",
      "created_at",
    ];
    const rows = filtradas.map((d) =>
      headers.map((h) => escapeCsv(d[h])).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `descargas-b2c-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-8 max-w-[1080px] mx-auto">
      <style>{`
        @media print {
          @page { margin: 12mm; size: letter; }
          body * { visibility: hidden !important; }
          .print-fichas, .print-fichas * { visibility: visible !important; }
          .print-fichas {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .ficha-pdf {
            break-after: page;
            page-break-after: always;
            margin: 0 !important;
            border-width: 2px !important;
          }
          .ficha-pdf:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .no-print { display: none !important; }
        }
        @media screen {
          .print-fichas { display: none; }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Descargas Etiqueta Restaurantera
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cada registro se imprime como PDF (nombre, correo, restaurante y
            descarga)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={sincronizarDesdeStripe}
            disabled={syncing || loading}
            className="px-4 py-2 rounded-lg bg-yellow-300 text-black text-sm font-bold hover:bg-yellow-400 disabled:opacity-50 cursor-pointer"
          >
            {syncing ? "Trayendo…" : "Traer de Stripe"}
          </button>
          <button
            type="button"
            onClick={cargar}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => setPrintMode("all")}
            disabled={filtradas.length === 0}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            PDF todos ({filtradas.length})
          </button>
          <button
            type="button"
            onClick={exportarCsv}
            disabled={filtradas.length === 0}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="no-print mb-4 rounded-lg bg-green-50 text-green-800 px-4 py-3 text-sm">
          {syncMsg}
        </div>
      )}

      <div className="no-print mb-4">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, restaurante, correo…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
        />
      </div>

      {error && (
        <div className="no-print mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <p className="no-print text-sm text-gray-600 mb-3">
        Total: <strong>{total}</strong>
        {busqueda ? ` · Filtrados: ${filtradas.length}` : null}
      </p>

      {loading ? (
        <p className="no-print text-gray-500 text-sm">Cargando…</p>
      ) : filtradas.length === 0 ? (
        <p className="no-print text-gray-500 text-sm">
          No hay registros. Usa &quot;Traer de Stripe&quot; si ya hubo
          descargas.
        </p>
      ) : (
        <div className="no-print overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Restaurante</th>
                <th className="px-4 py-3 font-semibold">Descarga</th>
                <th className="px-4 py-3 font-semibold">PDF</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d, i) => (
                <tr
                  key={d.id || d.stripe_session_id || `${d.correo}-${i}`}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {d.nombre || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{d.correo || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {d.nombre_restaurante || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {d.producto || "Video Etiqueta Restaurantera"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setPrintMode(d)}
                      className="px-3 py-1.5 rounded-md bg-black text-white text-xs font-medium hover:bg-gray-800 cursor-pointer"
                    >
                      Imprimir PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Zona solo visible al imprimir / Guardar como PDF */}
      <div className="print-fichas">
        {fichasParaImprimir.map((d, i) => (
          <FichaPdf
            key={d.id || d.stripe_session_id || i}
            d={d}
            index={
              printMode === "all"
                ? i + 1
                : filtradas.findIndex(
                    (x) =>
                      (x.id && x.id === d.id) ||
                      x.stripe_session_id === d.stripe_session_id,
                  ) + 1 || 1
            }
          />
        ))}
      </div>

      <p className="no-print mt-4 text-xs text-gray-500">
        Tip: al pulsar Imprimir PDF, en el diálogo elige{" "}
        <strong>&quot;Guardar como PDF&quot;</strong> como destino.
      </p>
    </div>
  );
};

export default ReporteDescargasB2C;
