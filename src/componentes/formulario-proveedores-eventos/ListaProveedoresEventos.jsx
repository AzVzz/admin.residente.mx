import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context";
import Login from "../Login";
import {
  proveedoresListar,
  proveedorToggleStatus,
  proveedorEliminar,
  proveedorCotizaciones,
  mediaUrl,
} from "../api/proveedoresEventosApi";
import { CATEGORIAS_PROVEEDOR } from "./constantesProveedorEventos";

export default function ListaProveedoresEventos() {
  const { usuario, token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroCat, setFiltroCat] = useState("");
  const [q, setQ] = useState("");
  const [cotizaciones, setCotizaciones] = useState(null);
  const [cotProveedor, setCotProveedor] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proveedoresListar(token, {
        categoria: filtroCat || undefined,
        q: q || undefined,
      });
      setRows(data.proveedores || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filtroCat]);

  if (!usuario || !token) return <Login />;

  const labelCat = (slug) =>
    CATEGORIAS_PROVEEDOR.find((c) => c.slug === slug)?.label || slug;

  const toggle = async (p) => {
    try {
      const next = p.status === 1 ? 0 : 1;
      const updated = await proveedorToggleStatus(token, p.id, next);
      setRows((prev) =>
        prev.map((r) => (r.id === p.id ? { ...r, status: updated.status } : r))
      );
    } catch (e) {
      alert(e.message);
    }
  };

  const eliminar = async (p) => {
    if (!confirm(`¿Eliminar «${p.nombre_comercial}»?`)) return;
    try {
      await proveedorEliminar(token, p.id);
      setRows((prev) => prev.filter((r) => r.id !== p.id));
    } catch (e) {
      alert(e.message);
    }
  };

  const verCotizaciones = async (p) => {
    try {
      const data = await proveedorCotizaciones(token, p.id);
      setCotProveedor(p);
      setCotizaciones(data.cotizaciones || []);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Vivir y Convivir
          </p>
          <h1 className="font-haas text-2xl font-semibold">
            Proveedores de eventos
          </h1>
        </div>
        <Link
          to="/formulario-proveedor-eventos"
          className="inline-flex rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium"
        >
          Nuevo proveedor
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filtroCat}
          onChange={(e) => setFiltroCat(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS_PROVEEDOR.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar…"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={cargar}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          Buscar
        </button>
      </div>

      {loading ? <p>Cargando…</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      <div className="space-y-3">
        {rows.map((p) => (
          <article
            key={p.id}
            className="flex flex-col sm:flex-row gap-3 rounded-xl border border-neutral-200 bg-white p-4"
          >
            <img
              src={
                mediaUrl(p.foto_principal_cuadrada || p.foto_principal || p.url_logo) ||
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23eee' width='80' height='80'/%3E%3C/svg%3E"
              }
              alt=""
              className="h-20 w-20 rounded-lg object-cover border border-neutral-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-medium text-lg truncate">
                  {p.nombre_comercial}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 1
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {p.status === 1 ? "Publicado" : "Borrador"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100">
                  {labelCat(p.categoria)}
                </span>
              </div>
              <p className="text-sm text-neutral-500 truncate">
                {p.municipio || "—"} · /{p.slug}
              </p>
              <div className="flex flex-wrap gap-2 mt-2 text-sm">
                <Link
                  to={`/formulario-proveedor-eventos/${p.slug}`}
                  className="underline"
                >
                  Editar
                </Link>
                <a
                  href={`https://residente.mx/proveedores-eventos/${p.slug}${
                    p.status === 1 ? "" : "?preview=1"
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Ver micrositio
                </a>
                {usuario?.rol === "residente" ? (
                  <>
                    <button type="button" onClick={() => toggle(p)} className="underline">
                      {p.status === 1 ? "Despublicar" : "Publicar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => verCotizaciones(p)}
                      className="underline"
                    >
                      Cotizaciones
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminar(p)}
                      className="underline text-red-600"
                    >
                      Eliminar
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        ))}
        {!loading && rows.length === 0 ? (
          <p className="text-neutral-500 text-sm">No hay proveedores aún.</p>
        ) : null}
      </div>

      {cotizaciones && cotProveedor ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-auto p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium">
                Cotizaciones · {cotProveedor.nombre_comercial}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCotizaciones(null);
                  setCotProveedor(null);
                }}
                className="text-sm"
              >
                Cerrar
              </button>
            </div>
            {cotizaciones.length === 0 ? (
              <p className="text-sm text-neutral-500">Sin solicitudes aún.</p>
            ) : (
              <ul className="space-y-3">
                {cotizaciones.map((c) => (
                  <li
                    key={c.id}
                    className="border border-neutral-200 rounded-lg p-3 text-sm"
                  >
                    <p className="font-medium">{c.nombre}</p>
                    <p className="text-neutral-600">
                      {[c.telefono, c.email].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-neutral-500 mt-1">
                      {c.tipo_evento || "—"} · {c.municipio_venue || "—"} ·{" "}
                      {c.invitados_aprox != null
                        ? `${c.invitados_aprox} invitados`
                        : ""}
                    </p>
                    {c.descripcion ? (
                      <p className="mt-1 text-neutral-700">{c.descripcion}</p>
                    ) : null}
                    <p className="text-xs text-neutral-400 mt-1">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleString("es-MX")
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
