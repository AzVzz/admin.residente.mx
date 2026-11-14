import React, { useEffect, useMemo, useState } from "react";
import { eventosColaboradoresGetTodas } from "../api/eventosColaboradoresApi";
import { useAuth } from "../Context";

/**
 * "Eventos etiquetados": asocia una nota con uno o varios eventos de la agenda
 * (registros con formato evento_destacado). Guarda los ids en eventos_etiquetados.
 */
const EventosEtiquetados = ({ value = [], onChange }) => {
  const { token } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    eventosColaboradoresGetTodas(token, { limit: 500 })
      .then((data) => {
        const lista = Array.isArray(data) ? data : data?.eventos;
        setEventos(
          (Array.isArray(lista) ? lista : []).filter((e) => e.formato === "evento_destacado"),
        );
      })
      .catch(() => setEventos([]));
  }, [token]);

  const ids = Array.isArray(value) ? value : [];
  const seleccionados = useMemo(
    () => ids.map((id) => eventos.find((e) => e.id === id) || { id, titulo: `Evento #${id}` }),
    [ids, eventos],
  );
  const sugerencias = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return eventos
      .filter((e) => !ids.includes(e.id) && (!q || e.titulo?.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [eventos, ids, busqueda]);

  const agregar = (id) => {
    onChange([...ids, id]);
    setBusqueda("");
  };
  const quitar = (id) => onChange(ids.filter((x) => x !== id));

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-800 mb-2">Eventos etiquetados</label>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        placeholder="Buscar evento para etiquetar..."
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {abierto && sugerencias.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
          {sugerencias.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => agregar(e.id)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
              >
                {e.titulo}
              </button>
            </li>
          ))}
        </ul>
      )}
      {seleccionados.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {seleccionados.map((e) => (
            <span
              key={e.id}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-xs rounded-full pl-2.5 pr-1 py-1"
            >
              {e.titulo}
              <button
                type="button"
                onClick={() => quitar(e.id)}
                aria-label={`Quitar ${e.titulo}`}
                className="w-4 h-4 rounded-full hover:bg-blue-200 leading-none cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Etiqueta uno o varios eventos de la agenda para asociarlos con esta nota.
      </p>
    </div>
  );
};

export default EventosEtiquetados;
