import React from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";

// Una sección colapsable con sus platillos (sub-field-array anidado).
const SeccionMenu = ({ secIndex, onRemoveSeccion }) => {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `menu_sections.${secIndex}.platillos`,
  });
  const nombre = useWatch({ control, name: `menu_sections.${secIndex}.nombre` });

  const borrarSeccion = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const label = (nombre || "").trim() || "esta sección";
    if (window.confirm(`¿Eliminar la sección "${label}" y todos sus platillos?`)) {
      onRemoveSeccion();
    }
  };

  const borrarPlatillo = (i) => {
    if (window.confirm("¿Eliminar este platillo?")) remove(i);
  };

  return (
    <details className="border border-gray-200 rounded-lg overflow-hidden">
      <summary className="cursor-pointer list-none flex justify-between items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100">
        <span className="font-bold">
          {(nombre || "").trim() || "Nueva sección"}{" "}
          <span className="text-xs text-gray-500 font-normal">({fields.length})</span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={borrarSeccion}
            className="text-sm text-red-600 hover:underline"
          >
            Eliminar sección
          </button>
          <span className="text-xl text-gray-500" aria-hidden="true">▾</span>
        </span>
      </summary>

      <div className="p-4">
        <input
          type="text"
          placeholder="Nombre de la sección (ej: Entradas)"
          className="w-full border border-gray-300 rounded px-3 py-2 font-bold mb-3"
          {...register(`menu_sections.${secIndex}.nombre`)}
        />

        <div className="flex flex-col gap-2">
          {fields.map((field, i) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_120px_1.5fr_auto] gap-2 items-start"
            >
              <input
                type="text"
                placeholder="Platillo"
                className="border border-gray-300 rounded px-3 py-2"
                {...register(`menu_sections.${secIndex}.platillos.${i}.nombre`)}
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Precio $"
                className="border border-gray-300 rounded px-3 py-2"
                {...register(`menu_sections.${secIndex}.platillos.${i}.precio`)}
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                className="border border-gray-300 rounded px-3 py-2"
                {...register(`menu_sections.${secIndex}.platillos.${i}.descripcion`)}
              />
              <button
                type="button"
                onClick={() => borrarPlatillo(i)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                title="Eliminar platillo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ nombre: "", precio: "", descripcion: "" })}
          className="mt-3 self-start text-sm font-bold text-black border border-black rounded px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
        >
          + Platillo
        </button>
      </div>
    </details>
  );
};

// Editor de menú colapsable. Secciones (categorías) con platillos.
// Serializa a menu_data { source:"manual", items:[{nombre,descripcion,precio_raw,precio_centavos,categoria}] }.
const MenuEditor = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "menu_sections" });
  const secciones = useWatch({ control, name: "menu_sections" }) || [];
  const totalPlatillos = secciones.reduce(
    (n, s) => n + (Array.isArray(s?.platillos) ? s.platillos.length : 0),
    0,
  );

  return (
    <details className="my-8 border border-gray-300 rounded-lg overflow-hidden">
      <summary className="cursor-pointer list-none flex justify-between items-center px-4 py-3 bg-black text-white">
        <span className="text-lg font-bold uppercase">Menú</span>
        <span className="flex items-center gap-3">
          <span className="text-xs font-normal opacity-80">
            {fields.length} secciones · {totalPlatillos} platillos
          </span>
          <span className="text-xl" aria-hidden="true">▾</span>
        </span>
      </summary>

      <div className="p-4">
        <p className="text-sm text-gray-500 mb-4">
          Creá secciones (ej: Entradas, Platos fuertes, Bebidas) y agregá los platillos con su precio.
          El menú editado a mano tiene prioridad y no se sobrescribe con datos automáticos.
        </p>

        <div className="flex flex-col gap-3">
          {fields.map((field, i) => (
            <SeccionMenu key={field.id} secIndex={i} onRemoveSeccion={() => remove(i)} />
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            append({ nombre: "", platillos: [{ nombre: "", precio: "", descripcion: "" }] })
          }
          className="mt-4 font-bold text-black border-2 border-black rounded px-4 py-2 hover:bg-amarillo transition-colors"
        >
          + Agregar sección
        </button>
      </div>
    </details>
  );
};

export default MenuEditor;
