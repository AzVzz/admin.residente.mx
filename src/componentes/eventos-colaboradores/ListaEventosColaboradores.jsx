import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { eventosColaboradoresGetTodas, urlImagenEvento } from "../api/eventosColaboradoresApi";
import ResponsiveImg from "../ResponsiveImg";
import { useAuth } from "../Context";
import { EVENTOS_DASHBOARD_BASE } from "./EventosDashboardLayout";

export const CATEGORIAS = [
  ["conciertos-musica", "Conciertos"],
  ["negocios-empresariales", "Negocios"],
  ["religiosos", "Religiosos"],
  ["deportivos", "Deportivos"],
  ["culturales", "Culturales"],
  ["gastronomicos", "Gastronómicos"],
  ["familiares", "Familiares"],
  ["academicos", "Académicos"],
  ["comunitarios", "Comunitarios"],
];

export const FORMATOS = [
  ["noticia", "Noticia"],
  ["idea", "Idea"],
  ["plan", "Plan"],
  ["evento_destacado", "Evento destacado"],
];

const nombreCategoria = (id) => CATEGORIAS.find(([v]) => v === id)?.[1] ?? "Sin categoría";
const nombreFormato = (id) => FORMATOS.find(([v]) => v === id)?.[1] ?? id;

const selectClass =
  "border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none";

/**
 * modo "notas": noticia / idea / plan.  modo "eventos": solo evento_destacado.
 * Son la misma tabla (eventos_colaboradores); el formato decide dónde se ve.
 */
const ListaEventosColaboradores = ({ modo = "notas" }) => {
  const esEventos = modo === "eventos";
  const { token } = useAuth();
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoria, setCategoria] = useState("");
  const [formato, setFormato] = useState("");
  const [estadoEditorial, setEstadoEditorial] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Más nuevas primero.
      const data = await eventosColaboradoresGetTodas(token, {
        sortBy: "creado",
        sortOrder: "DESC",
        limit: 500,
      });
      const lista = Array.isArray(data) ? data : data?.eventos;
      setNotas(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setNotas([]);
      setError(err.message || "Error al obtener las notas");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return notas.filter(
      (n) =>
        (esEventos ? n.formato === "evento_destacado" : n.formato !== "evento_destacado") &&
        (!categoria || n.categoria === categoria) &&
        (!formato || n.formato === formato) &&
        (!estadoEditorial || n.estado_editorial === estadoEditorial) &&
        (!q || n.titulo?.toLowerCase().includes(q)),
    );
  }, [notas, esEventos, categoria, formato, estadoEditorial, busqueda]);

  const formatFecha = (fecha) =>
    fecha
      ? new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
      : "Sin fecha";

  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          Categoría
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={selectClass}>
            <option value="">Todas</option>
            {CATEGORIAS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>
        {!esEventos && (
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Tipo de nota
            <select value={formato} onChange={(e) => setFormato(e.target.value)} className={selectClass}>
              <option value="">Todos</option>
              {FORMATOS.filter(([v]) => v !== "evento_destacado").map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          Estado
          <select value={estadoEditorial} onChange={(e) => setEstadoEditorial(e.target.value)} className={selectClass}>
            <option value="">Todos</option>
            <option value="borrador">Borrador</option>
            <option value="programado">Programada</option>
            <option value="publicado">Publicada</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 flex-1 min-w-[180px]">
          Buscar
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={esEventos ? "Nombre del evento..." : "Título de la nota..."}
            className={selectClass}
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={cargar} className="underline font-medium cursor-pointer">Reintentar</button>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      ) : (
        !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtradas.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">
                {notas.filter((n) => (n.formato === "evento_destacado") === esEventos).length === 0 ? (esEventos ? "Aún no hay eventos." : "Aún no hay notas.") : "Nada coincide con los filtros."}
              </div>
            ) : (
              filtradas.map((nota) => {
                const publicado = nota.estado_editorial === "publicado";
                return (
                  <Link key={nota.id} to={`${EVENTOS_DASHBOARD_BASE}/notas/editar/${nota.id}`}>
                    <div
                      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col group relative cursor-pointer"
                      style={{ minHeight: "320px" }}
                    >
                      {nota.imagen_url ? (
                        <ResponsiveImg
                          src={urlImagenEvento(nota.imagen_miniatura_url || nota.imagen_url)}
                          alt={nota.titulo}
                          width={400}
                          height={240}
                          widths={[200, 400]}
                          sizes="400px"
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 motion-reduce:transition-none"
                          style={{ zIndex: 0 }}
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" style={{ zIndex: 0 }} />
                      )}

                      <div className="flex flex-col justify-between items-end h-full relative z-10">
                        <div className="absolute top-0 right-0 z-20">
                          <div className="bg-indigo-500 text-white font-bold text-sm shadow-lg px-3 py-1 rounded-bl-lg uppercase">
                            {nombreCategoria(nota.categoria)}
                          </div>
                        </div>

                        <div className="w-full flex flex-col gap-1 p-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full w-fit font-medium ${
                              publicado
                                ? "bg-green-100 text-green-800"
                                : nota.estado_editorial === "programado"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {publicado
                              ? "Publicada"
                              : nota.estado_editorial === "programado"
                                ? `Programada ${nota.fecha_publicacion ? new Date(nota.fecha_publicacion).toLocaleString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}`
                                : "Borrador"}
                          </span>
                          <span className="font-semibold px-2 py-1 text-xs rounded-full bg-black/40 backdrop-blur-md text-white w-fit">
                            {nombreFormato(nota.formato)}
                          </span>
                          <span className="font-semibold px-2 py-1 text-xs rounded-full bg-black/40 backdrop-blur-md text-white w-fit">
                            {formatFecha(nota.fecha_inicio_evento)}
                          </span>
                          <span className="font-semibold px-2 py-1 text-xs rounded-full bg-black/40 backdrop-blur-md text-white w-fit">
                            vistas: {nota.views ?? 0} · clicks: {nota.clicks ?? 0}
                          </span>
                        </div>

                        <div className="w-full">
                          <div className="bg-white p-3">
                            <h2 className="text-base font-bold text-gray-900 leading-tight">{nota.titulo}</h2>
                            {nota.lugar_evento && (
                              <p className="text-xs text-gray-500 truncate mt-1">📍 {nota.lugar_evento}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )
      )}
    </div>
  );
};

export default ListaEventosColaboradores;
