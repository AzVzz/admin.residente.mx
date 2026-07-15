import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../Context";
import { descargasB2cGet } from "../../api/descargasB2cGet";

const formatMonto = (monto) => {
  if (monto == null || isNaN(Number(monto))) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(monto));
};

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

const ReporteDescargasB2C = () => {
  const { token } = useAuth();
  const [descargas, setDescargas] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

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

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  const totalMonto = useMemo(
    () =>
      filtradas.reduce((acc, d) => acc + (Number(d.monto) || 0), 0),
    [filtradas],
  );

  const exportarCsv = () => {
    const headers = [
      "id",
      "nombre",
      "nombre_restaurante",
      "correo",
      "codigo_promocion",
      "producto",
      "monto",
      "stripe_session_id",
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reporte de descargas B2C
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Etiqueta Restaurantera — compras confirmadas
          </p>
        </div>
        <div className="flex gap-2">
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
            onClick={exportarCsv}
            disabled={filtradas.length === 0}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Total descargas
          </p>
          <p className="text-3xl font-bold mt-1">{total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Mostrando
          </p>
          <p className="text-3xl font-bold mt-1">{filtradas.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Monto filtrado
          </p>
          <p className="text-3xl font-bold mt-1">{formatMonto(totalMonto)}</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, restaurante, correo o código…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando…</p>
      ) : filtradas.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No hay descargas registradas todavía.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Restaurante</th>
                <th className="px-4 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Monto</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d) => (
                <tr
                  key={d.id || d.stripe_session_id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {d.nombre || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {d.nombre_restaurante || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{d.correo || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {d.codigo_promocion || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                    {formatMonto(d.monto)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatFecha(d.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReporteDescargasB2C;
