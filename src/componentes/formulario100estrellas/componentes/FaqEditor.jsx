import React from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";

// Editor de preguntas frecuentes. Colapsado por defecto.
// Serializa a faqs: [{ q, a }]. Las manuales tienen prioridad sobre las
// auto-generadas en la ficha pública.
const FaqEditor = () => {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "faqs" });
  const faqs = useWatch({ control, name: "faqs" }) || [];
  const completas = faqs.filter((f) => (f?.q || "").trim() && (f?.a || "").trim()).length;

  const borrar = (i) => {
    if (window.confirm("¿Eliminar esta pregunta?")) remove(i);
  };

  return (
    <details className="my-8 border border-gray-300 rounded-lg overflow-hidden">
      <summary className="cursor-pointer list-none flex justify-between items-center px-4 py-3 bg-black text-white">
        <span className="text-lg font-bold uppercase">Preguntas frecuentes</span>
        <span className="flex items-center gap-3">
          <span className="text-xs font-normal opacity-80">{completas} preguntas</span>
          <span className="text-xl" aria-hidden="true">▾</span>
        </span>
      </summary>

      <div className="p-4">
        <p className="text-sm text-gray-500 mb-4">
          Preguntas y respuestas que aparecen en la ficha pública del restaurante.
          Las que escribas aquí tienen prioridad sobre las generadas automáticamente
          (ubicación, horario, costo, etc.).
        </p>

        <div className="flex flex-col gap-3">
          {fields.map((field, i) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Pregunta (ej: ¿Aceptan reservaciones?)"
                    className="border border-gray-300 rounded px-3 py-2 font-bold"
                    {...register(`faqs.${i}.q`)}
                  />
                  <textarea
                    rows={2}
                    placeholder="Respuesta"
                    className="border border-gray-300 rounded px-3 py-2"
                    {...register(`faqs.${i}.a`)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => borrar(i)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                  title="Eliminar pregunta"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ q: "", a: "" })}
          className="mt-4 font-bold text-black border-2 border-black rounded px-4 py-2 hover:bg-amarillo transition-colors"
        >
          + Agregar pregunta
        </button>
      </div>
    </details>
  );
};

export default FaqEditor;
