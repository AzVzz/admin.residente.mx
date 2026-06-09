import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeFromApi, computeScore } from "../../utils/restaurantScore";

const colorBarra = (score) =>
  score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-400" : "bg-red-400";

const Barra = ({ score }) => (
  <div className="w-full bg-gray-100 rounded-full h-2">
    <div
      className={`${colorBarra(score)} h-2 rounded-full transition-all duration-300`}
      style={{ width: `${Math.min(score, 100)}%` }}
    />
  </div>
);

// Card de completitud del perfil para el dashboard B2B.
// restaurante = objeto completo de la API (slide activo) | null en slide TOTAL.
// restaurantes = lista completa (para el resumen en TOTAL).
// onAyuda / onAyudaGeo: abren el tooltip-modal del dashboard (mismo patrón que los demás "?")
const ScorePerfilCard = ({ restaurante, restaurantes = [], onAyuda, onAyudaGeo }) => {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);

  const botonAyuda = (onClick, title) => (
    <span
      className="cursor-pointer text-[11px] bg-black text-white rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0"
      onClick={onClick}
      title={title}
    >
      ?
    </span>
  );
  const BotonAyuda = botonAyuda(onAyuda, "¿En qué beneficia completar el perfil?");

  // Encabezado GEO dentro de la caja (mismo borde)
  const EncabezadoGeo = (
    <>
      <p className="font-bold leading-tight text-xl mb-2">
        Solo con Residente tu sitio web puede ser tomado en cuenta por todas
        las I.A.'s (GEO){" "}
        <span className="inline-flex align-middle">
          {botonAyuda(onAyudaGeo, "¿Qué es GEO?")}
        </span>
      </p>
      <p className="text-sm font-roman leading-tight mb-3">
        Aquí tu propio indicador de viabilidad:
      </p>
    </>
  );

  // Slide TOTAL: resumen compacto de todos los restaurantes
  if (!restaurante) {
    if (restaurantes.length < 2) return null;
    return (
      <div className="w-60 border border-gray-800 p-3 mb-6">
        {EncabezadoGeo}
        <div className="flex items-center gap-2 mb-3">
          <p className="font-bold uppercase">Perfil de tus restaurantes</p>
          {BotonAyuda}
        </div>
        <div className="flex flex-col gap-2">
          {restaurantes.map((r) => {
            const { score } = computeScore(normalizeFromApi(r));
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(`/formulario/${r.slug}`)}
                className="flex flex-col gap-1 text-left hover:bg-gray-50 p-1"
              >
                <span className="flex items-center justify-between w-full">
                  <span className="truncate text-sm">{r.nombre_restaurante}</span>
                  <span className="text-sm font-bold tabular-nums">{score}%</span>
                </span>
                <Barra score={score} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const { score, faltantes, opcionales } = computeScore(normalizeFromApi(restaurante));
  const opcionalesFaltan = opcionales.filter((o) => !o.ok);

  return (
    <div className="w-60 border border-gray-800 p-3 mb-6">
      {EncabezadoGeo}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="font-bold uppercase text-sm">
            Perfil: <span className="tabular-nums">{score}%</span>
          </p>
          {BotonAyuda}
        </div>
        <Barra score={score} />
        <div className="flex items-center justify-between gap-2 mt-1">
          {faltantes.length > 0 ? (
            <button
              type="button"
              onClick={() => setAbierto(!abierto)}
              className="text-xs underline"
            >
              {abierto ? "Ocultar" : `Pendientes (${faltantes.length})`}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => navigate(`/formulario/${restaurante.slug}`)}
            className="bg-black text-white text-xs font-bold px-3 py-1.5 hover:bg-gray-800"
          >
            {score >= 100 ? "EDITAR" : "COMPLETAR"}
          </button>
        </div>
      </div>


      {score >= 100 && (
        <p className="text-sm text-green-700 mt-2">
          Perfil completo. Tu restaurante tiene la mejor visibilidad posible.
        </p>
      )}

      {abierto && faltantes.length > 0 && (
        <div className="mt-3 flex flex-col">
          {faltantes.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => navigate(`/formulario/${restaurante.slug}#${f.anchor}`)}
              className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-gray-100 text-left hover:bg-black/5 group"
              title="Ir a esta sección del formulario"
            >
              <span className="group-hover:underline leading-tight">{f.label}</span>
              <span className="text-gray-500 tabular-nums shrink-0">+{f.peso} →</span>
            </button>
          ))}
          {opcionalesFaltan.length > 0 && (
            <div className="md:col-span-2 mt-2">
              <p className="text-xs uppercase text-gray-400 mb-1">Opcionales (no afectan el puntaje)</p>
              <p className="text-sm text-gray-500">
                {opcionalesFaltan.map((o) => o.label).join(" · ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScorePerfilCard;
