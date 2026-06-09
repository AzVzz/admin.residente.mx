import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { normalizeFromForm, computeScore } from "../../utils/restaurantScore";

const colorBarra = (score) =>
  score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-400" : "bg-red-400";

// Indicador de completitud en vivo dentro del formulario.
// Sticky arriba: el usuario ve subir el puntaje mientras llena campos.
const ScorePerfilForm = () => {
  const { control } = useFormContext();
  const values = useWatch({ control });
  const [abierto, setAbierto] = useState(false);

  const { score, faltantes } = computeScore(normalizeFromForm(values));

  const irASeccion = (anchor) => {
    const el = document.getElementById(anchor);
    if (!el) return;
    el.querySelectorAll("details").forEach((d) => (d.open = true));
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border border-gray-800 p-3 mb-4">
      <div className="flex items-center gap-4">
        <span className="font-bold whitespace-nowrap text-sm uppercase">
          Perfil: <span className="tabular-nums">{score}%</span>
        </span>
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className={`${colorBarra(score)} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
        {faltantes.length > 0 && (
          <button
            type="button"
            onClick={() => setAbierto(!abierto)}
            className="text-xs underline whitespace-nowrap"
          >
            {abierto ? "Ocultar" : `Falta (${faltantes.length})`}
          </button>
        )}
      </div>
      {abierto && faltantes.length > 0 && (
        <ul className="mt-2 text-xs text-gray-600 grid grid-cols-2 md:grid-cols-3 gap-x-4">
          {faltantes.map((f) => (
            <li key={f.key} className="py-0.5">
              <button
                type="button"
                onClick={() => irASeccion(f.anchor)}
                className="hover:underline text-left"
                title="Ir a esta sección"
              >
                {f.label} <span className="text-gray-400">+{f.peso} →</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ScorePerfilForm;
