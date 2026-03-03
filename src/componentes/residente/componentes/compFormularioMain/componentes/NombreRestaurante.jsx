import { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useAuth } from "../../../../Context";
import { restaurantesBasicosGet } from "../../../../api/restaurantesBasicosGet";

const NombreRestaurante = () => {
  const { watch, setValue } = useFormContext();
  const { usuario } = useAuth();
  const [restaurantes, setRestaurantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedIds = watch("restaurantes_ids") || [];

  // Fetch restaurantes al montar
  useEffect(() => {
    restaurantesBasicosGet()
      .then((data) => setRestaurantes(Array.isArray(data) ? data : []))
      .catch(() => setRestaurantes([]));
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ocultar si el usuario es invitado
  if (usuario?.rol === "invitado") {
    return null;
  }

  const filtrados = restaurantes.filter((r) =>
    r.nombre_restaurante?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const toggleRestaurante = (id) => {
    const current = selectedIds;
    if (current.includes(id)) {
      setValue("restaurantes_ids", current.filter((rid) => rid !== id), { shouldDirty: true });
    } else {
      setValue("restaurantes_ids", [...current, id], { shouldDirty: true });
    }
  };

  const removeRestaurante = (id) => {
    setValue("restaurantes_ids", selectedIds.filter((rid) => rid !== id), { shouldDirty: true });
  };

  return (
    <div className="mb-4 pb-4" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Restaurantes etiquetados
      </label>

      {/* Chips de restaurantes seleccionados */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedIds.map((id) => {
            const r = restaurantes.find((rest) => rest.id === id);
            if (!r) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5 text-sm text-blue-800"
              >
                {r.nombre_restaurante}
                <button
                  type="button"
                  onClick={() => removeRestaurante(id)}
                  className="ml-1.5 text-blue-400 hover:text-red-500 font-bold"
                >
                  x
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Input de búsqueda */}
      <input
        type="text"
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Buscar restaurante para etiquetar..."
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 bg-white text-sm"
      />

      {/* Dropdown de resultados */}
      {isOpen && busqueda.length > 0 && filtrados.length > 0 && (
        <ul className="border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto bg-white shadow-lg z-10 relative">
          {filtrados.slice(0, 20).map((r) => {
            const isSelected = selectedIds.includes(r.id);
            return (
              <li
                key={r.id}
                onClick={() => {
                  toggleRestaurante(r.id);
                  setBusqueda("");
                  setIsOpen(false);
                }}
                className={`px-3 py-1.5 cursor-pointer hover:bg-gray-100 text-sm flex justify-between items-center ${
                  isSelected ? "bg-blue-50 font-medium" : ""
                }`}
              >
                <span>{r.nombre_restaurante}</span>
                {isSelected && <span className="text-blue-600 text-xs">seleccionado</span>}
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && busqueda.length > 0 && filtrados.length === 0 && (
        <p className="text-xs text-gray-400 mt-1">No se encontraron restaurantes.</p>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Etiqueta uno o varios restaurantes para vincular esta nota con sus dashboards B2B.
      </p>
    </div>
  );
};

export default NombreRestaurante;
