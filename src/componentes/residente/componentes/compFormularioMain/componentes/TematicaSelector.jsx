import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useAuth } from "../../../../Context";
import {
  tematicasGet,
  tematicasActivasGet,
} from "../../../../../componentes/api/tematicasApi.js";

/**
 * Selector de temática orientado a la Revista Digital del main.
 * - Checkbox: poner la nota en la edición activa (tematica_id).
 * - Checkbox: marcarla como nota principal (grande) de esa edición.
 * - Select avanzado: elegir otra temática si hace falta.
 */
const TematicaSelector = () => {
  const { control, watch, setValue } = useFormContext();
  const { token } = useAuth();
  const [tematicas, setTematicas] = useState([]);
  const [activa, setActiva] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mostrarOtras, setMostrarOtras] = useState(false);

  const tematicaId = watch("tematica_id");
  const enRevistaMain = Boolean(
    activa && String(tematicaId || "") === String(activa.id),
  );

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const [todas, activas] = await Promise.all([
          tematicasGet(token).catch(() => []),
          tematicasActivasGet().catch(() => []),
        ]);
        if (cancelado) return;
        const lista = Array.isArray(todas) ? todas : [];
        const vigente = Array.isArray(activas) && activas.length ? activas[0] : null;
        setTematicas(lista);
        setActiva(vigente);

        const tid = watch("tematica_id");
        if (vigente && tid && String(tid) !== String(vigente.id)) {
          setMostrarOtras(true);
        }
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggleRevistaMain = (checked) => {
    if (!activa) return;
    if (checked) {
      setValue("tematica_id", String(activa.id), { shouldDirty: true });
    } else {
      setValue("tematica_id", "", { shouldDirty: true });
      setValue("revista_como_principal", false, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-semibold text-gray-800">Revista Digital (main)</p>

      {isLoading ? (
        <p className="text-xs text-gray-500">Cargando edición activa…</p>
      ) : !activa ? (
        <p className="text-xs text-amber-700">
          No hay una edición de Revista Digital activa ahora. Créala o publícala
          en Temáticas para poder asignar notas aquí.
        </p>
      ) : (
        <>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 text-yellow-500"
              checked={enRevistaMain}
              onChange={(e) => toggleRevistaMain(e.target.checked)}
            />
            <span className="text-sm text-gray-700">
              Mostrar en la <strong>Revista Digital del main</strong>
              <span className="block text-xs text-gray-500 mt-0.5">
                Edición activa: {activa.nombre}
              </span>
            </span>
          </label>

          {enRevistaMain && (
            <label className="flex items-start gap-2 cursor-pointer ml-6">
              <Controller
                name="revista_como_principal"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 text-yellow-500"
                    checked={Boolean(field.value)}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              <span className="text-sm text-gray-700">
                Usar como <strong>nota principal</strong> (la grande de la revista)
                <span className="block text-xs text-gray-500 mt-0.5">
                  Si no marcas esto, aparece en “Además”.
                </span>
              </span>
            </label>
          )}
        </>
      )}

      <button
        type="button"
        className="text-xs text-gray-500 underline hover:text-gray-800"
        onClick={() => setMostrarOtras((v) => !v)}
      >
        {mostrarOtras ? "Ocultar otras temáticas" : "Elegir otra temática…"}
      </button>

      {mostrarOtras && (
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-600">
            Temática
          </label>
          <Controller
            name="tematica_id"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                disabled={isLoading}
              >
                <option value="">Sin temática</option>
                {tematicas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                    {activa && String(t.id) === String(activa.id)
                      ? " (edición activa)"
                      : ""}
                    {t.estatus === "borrador" ? " (borrador)" : ""}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default TematicaSelector;
