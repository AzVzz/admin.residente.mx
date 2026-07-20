import { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useAuth } from "../../../../Context";
import { useDebounce } from "../../../../../hooks/useDebounce";
import { restaurantesBasicosGet } from "../../../../api/restaurantesBasicosGet";
import { urlApi } from "../../../../api/url";

// `seccion` controla qué parte se renderiza para poder colocarlas en columnas
// distintas del formulario:
//   - "nombre"      → solo el input "Nombre del restaurante"
//   - "etiquetados" → solo la UI de restaurantes etiquetados (chips + búsqueda)
//   - "ambos"       → todo (por defecto)
const NombreRestaurante = ({ seccion = "ambos" }) => {
  const { watch, setValue, register } = useFormContext();
  const { usuario, token } = useAuth();
  const [restaurantes, setRestaurantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [autoTagStatus, setAutoTagStatus] = useState(null); // null | "loading" | { added, total }
  const [mencionesSinEtiquetar, setMencionesSinEtiquetar] = useState([]);
  const dropdownRef = useRef(null);
  const autoTagTimer = useRef(null);

  const mostrarNombre = seccion === "nombre" || seccion === "ambos";
  const mostrarEtiquetados = seccion === "etiquetados" || seccion === "ambos";

  const selectedIds = watch("restaurantes_ids") || [];
  // Los ids vigentes, leídos dentro del efecto sin ser una dependencia suya.
  const idsRef = useRef([]);
  idsRef.current = selectedIds.map(Number);

  // Fetch restaurantes al montar (solo si se muestran los etiquetados)
  useEffect(() => {
    if (!mostrarEtiquetados) return;
    restaurantesBasicosGet()
      .then((data) => setRestaurantes(Array.isArray(data) ? data : []))
      .catch(() => setRestaurantes([]));
  }, [mostrarEtiquetados]);

  // Aviso pasivo: restaurantes nombrados en el texto que no fueron etiquetados.
  // Importa porque el correo "te mencionamos en una nota" solo se dispara desde
  // `restaurantes_ids`: si el redactor no etiqueta, el cliente nunca se entera.
  // El botón "Auto-etiquetar" ya resuelve esto, pero solo si alguien lo aprieta.
  // La instancia que solo pinta el input de nombre no necesita nada de esto: se le
  // pasa cadena vacía para no serializar el contenido completo en cada tecleo.
  const activo = mostrarEtiquetados && !!token && usuario?.rol !== "invitado";
  const tituloW = activo ? String(watch("titulo") ?? "") : "";
  const subtituloW = activo ? String(watch("subtitulo") ?? "") : "";
  const contenidoW = activo ? String(watch("contenido") ?? "") : "";
  // NOTA: los ids NO entran en el debounce. Al etiquetar un restaurante basta con
  // quitarlo de la lista local; volver a consultar al servidor por cada chip añadido
  // era una petición completa (y un scan del directorio) por clic.
  const notaDebounced = useDebounce(
    JSON.stringify({ t: tituloW, s: subtituloW, d: contenidoW }),
    1200
  );

  useEffect(() => {
    if (!activo) return;
    const { t: titulo, s: subtitulo, d: descripcion } = JSON.parse(notaDebounced);
    if (!titulo.trim() && !descripcion.trim()) {
      setMencionesSinEtiquetar([]);
      return;
    }

    // AbortController: en conexión lenta y tecleo continuo, sin esto se acumulan
    // peticiones en vuelo que el backend igual procesa aunque ya no sirvan.
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${urlApi}api/notas/verificar-menciones`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Se mandan los ids vigentes al momento del envío, sin que participen en
          // el debounce (se leen por ref para no re-disparar el efecto).
          body: JSON.stringify({
            titulo,
            subtitulo,
            descripcion,
            restaurantes_ids: idsRef.current,
          }),
        });
        if (!res.ok) throw new Error("Error del servidor");
        const data = await res.json();
        // Filtra por si se etiquetó algo mientras la petición viajaba.
        setMencionesSinEtiquetar(
          (data.faltantes || []).filter((r) => !idsRef.current.includes(Number(r.id)))
        );
      } catch (err) {
        // Abortar es lo normal aquí, no un error que deba limpiar el aviso.
        if (err.name === "AbortError") return;
        // Es solo un aviso de ayuda: si falla, no se molesta al redactor.
        setMencionesSinEtiquetar([]);
      }
    })();

    return () => controller.abort();
  }, [notaDebounced, activo, token]);

  // Limpia el temporizador del mensaje de "Auto-etiquetar" si el componente se
  // desmonta antes de que expire (si no, setState sobre un componente desmontado).
  useEffect(() => () => clearTimeout(autoTagTimer.current), []);

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
    const numId = Number(id);
    const current = selectedIds.map(Number);
    if (current.includes(numId)) {
      setValue("restaurantes_ids", current.filter((rid) => rid !== numId), { shouldDirty: true });
    } else {
      setValue("restaurantes_ids", [...current, numId], { shouldDirty: true });
    }
  };

  // Solo añade. El chip del aviso usaba `toggleRestaurante`, así que un segundo clic
  // (el chip sigue visible hasta que llega la siguiente respuesta) QUITABA la etiqueta
  // que se acababa de poner, mientras el botón seguía diciendo "+".
  const agregarRestaurante = (id) => {
    const numId = Number(id);
    const current = selectedIds.map(Number);
    if (!current.includes(numId)) {
      setValue("restaurantes_ids", [...current, numId], { shouldDirty: true });
    }
    // Quitarlo del aviso de inmediato, sin esperar a la siguiente consulta.
    setMencionesSinEtiquetar((prev) => prev.filter((r) => Number(r.id) !== numId));
  };

  const removeRestaurante = (id) => {
    const numId = Number(id);
    setValue("restaurantes_ids", selectedIds.map(Number).filter((rid) => rid !== numId), { shouldDirty: true });
  };

  const autoEtiquetar = async () => {
    setAutoTagStatus("loading");
    try {
      const titulo = watch("titulo") || "";
      const subtitulo = watch("subtitulo") || "";
      const descripcion = watch("contenido") || "";
      const res = await fetch(`${urlApi}api/notas/preview-vincular`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, subtitulo, descripcion }),
      });
      if (!res.ok) throw new Error("Error del servidor");
      const matches = await res.json();
      const current = selectedIds.map(Number);
      const nuevos = matches.map((r) => r.id).filter((id) => !current.includes(id));
      setValue("restaurantes_ids", [...current, ...nuevos], { shouldDirty: true });
      setAutoTagStatus({ added: nuevos.length, total: matches.length });
      autoTagTimer.current = setTimeout(() => setAutoTagStatus(null), 4000);
    } catch {
      setAutoTagStatus({ error: true });
      autoTagTimer.current = setTimeout(() => setAutoTagStatus(null), 3000);
    }
  };

  return (
    <div ref={dropdownRef}>
      {/* Input de nombre_restaurante para post_residente_new2 */}
      {mostrarNombre && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del restaurante
          </label>
          <input
            type="text"
            {...register("nombre_restaurante")}
            placeholder="Nombre del restaurante..."
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 bg-white text-sm"
          />
        </div>
      )}

      {mostrarEtiquetados && (
      <>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">
          Restaurantes etiquetados
        </label>
        <button
          type="button"
          onClick={autoEtiquetar}
          disabled={autoTagStatus === "loading"}
          className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {autoTagStatus === "loading" ? "Detectando…" : "✦ Auto-etiquetar"}
        </button>
      </div>

      {autoTagStatus && autoTagStatus !== "loading" && (
        <p className={`text-xs mb-2 ${autoTagStatus.error ? "text-red-500" : "text-green-600"}`}>
          {autoTagStatus.error
            ? "Error al detectar menciones."
            : autoTagStatus.total === 0
            ? "No se encontraron menciones de restaurantes."
            : autoTagStatus.added === 0
            ? `${autoTagStatus.total} ya etiquetados.`
            : `+${autoTagStatus.added} restaurante${autoTagStatus.added > 1 ? "s" : ""} etiquetado${autoTagStatus.added > 1 ? "s" : ""} (${autoTagStatus.total} en total).`}
        </p>
      )}

      {/* Aviso: mencionados en el texto pero sin etiquetar. Si se publica así,
          el cliente B2B no recibe el correo de que salió en la nota. */}
      {mencionesSinEtiquetar.length > 0 && (
        <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">
            Mencionas {mencionesSinEtiquetar.length === 1 ? "a este restaurante" : "a estos restaurantes"} en el texto
            pero no {mencionesSinEtiquetar.length === 1 ? "está etiquetado" : "están etiquetados"}. Sin la etiqueta no
            se les avisa por correo.
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {mencionesSinEtiquetar.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => agregarRestaurante(r.id)}
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-0.5 text-xs text-amber-900 hover:bg-amber-100 transition-colors"
              >
                + {r.nombre_restaurante}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chips de restaurantes seleccionados */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedIds.map((id) => {
            const numId = Number(id);
            const r = restaurantes.find((rest) => Number(rest.id) === numId);
            const nombre = r?.nombre_restaurante || `Restaurante #${numId}`;
            return (
              <span
                key={numId}
                className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5 text-sm text-blue-800"
              >
                {nombre}
                <button
                  type="button"
                  onClick={() => removeRestaurante(numId)}
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
            const isSelected = selectedIds.map(Number).includes(Number(r.id));
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
      </>
      )}
    </div>
  );
};

export default NombreRestaurante;
