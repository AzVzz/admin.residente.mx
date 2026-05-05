import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useAuth } from "../../../../Context";
import { tematicasGet } from "../../../../../componentes/api/tematicasApi.js";

const TematicaSelector = () => {
  const { control } = useFormContext();
  const { token } = useAuth();
  const [tematicas, setTematicas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tematicasGet(token)
      .then((data) => setTematicas(Array.isArray(data) ? data : []))
      .catch(() => setTematicas([]))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-gray-700">
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white"
            disabled={isLoading}
          >
            <option value="">Sin temática</option>
            {tematicas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
                {t.estatus === "borrador" ? " (borrador)" : ""}
              </option>
            ))}
          </select>
        )}
      />
      <p className="text-xs text-gray-400">
        La nota aparecerá en el carrusel de la temática seleccionada cuando esté publicada y vigente.
      </p>
    </div>
  );
};

export default TematicaSelector;
