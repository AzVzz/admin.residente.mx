import React, { useState, useEffect } from "react";
import { urlApi } from "../../../api/url";
import { useAuth } from "../../../Context";

// "2026-05-18" → "18 may". Split manual para evitar corrimiento de zona horaria.
function fmtDay(d) {
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const [, m, day] = String(d).split("-");
  return `${parseInt(day, 10)} ${meses[parseInt(m, 10) - 1] || ""}`;
}

// Tarjeta administrativa: personas reales y sesiones del chatbot. La gráfica
// de línea muestra PERSONAS por día; debajo de cada punto, las SESIONES de
// ese día.
// El endpoint /admin/sessions-daily está gated al rol residente; si lo monta
// otro rol, la petición falla y el componente no renderiza nada (silencioso).
const SesionesChatbotDiarias = ({ days = 30 }) => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch(
          `${urlApi}api/chatbot/admin/sessions-daily?days=${days}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelado) setData(json);
      } catch (e) {
        if (!cancelado) setError(e.message);
      }
    })();
    return () => { cancelado = true; };
  }, [token, days]);

  if (error || !data) return null;

  const porDia = data.por_dia || [];
  const personasTotal = Number(data.total_personas) || 0;
  const sesionesTotal = Number(data.total_sesiones) || 0;
  const n = porDia.length;
  // La línea grafica PERSONAS por día.
  const max = Math.max(1, ...porDia.map((d) => Number(d.personas) || 0));

  // Geometría de la gráfica.
  const W = 560;
  const H = 146;
  const padL = 14;
  const padR = 14;
  const padT = 20;
  const padB = 48;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const baseY = padT + chartH;
  const xAt = (i) => (n <= 1 ? padL + chartW / 2 : padL + (i / (n - 1)) * chartW);
  const yAt = (v) => baseY - (v / max) * chartH;
  const pts = porDia.map((d, i) => {
    const personas = Number(d.personas) || 0;
    return {
      dia: d.dia,
      personas,
      sesiones: Number(d.sesiones) || 0,
      x: xAt(i),
      y: yAt(personas),
    };
  });
  const linePts = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPts = `${padL},${baseY} ${linePts} ${padL + chartW},${baseY}`;
  // Valores por punto solo si caben (pocos días).
  const showValues = n <= 14;
  const labelEvery = Math.max(1, Math.ceil(n / 8));
  const sesRowY = H - 28; // fila de "sesiones del día"
  const dateRowY = H - 10; // fila de fechas

  return (
    <div className="border border-gray-200 rounded-lg p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Uso del chatbot
        </h3>
        <span className="text-xs text-gray-400">últimos {data.days} días</span>
      </div>

      <div className="flex items-end gap-10 mb-1">
        <div>
          <p className="text-4xl font-bold text-gray-900 leading-none">
            {personasTotal.toLocaleString("es-MX")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {personasTotal === 1 ? "persona" : "personas"}
          </p>
        </div>
        <div>
          <p className="text-4xl font-bold text-gray-400 leading-none">
            {sesionesTotal.toLocaleString("es-MX")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {sesionesTotal === 1 ? "sesión" : "sesiones"}
          </p>
        </div>
      </div>

      {n === 0 ? (
        <p className="text-gray-400 text-sm mt-3">Sin datos en el periodo</p>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full mt-2"
          style={{ maxHeight: 175 }}
          role="img"
          aria-label="Personas por día en el chatbot"
        >
          {n >= 2 && <polygon points={areaPts} fill="#FFF200" opacity="0.18" />}
          {n >= 2 && (
            <polyline
              points={linePts}
              fill="none"
              stroke="#FFF200"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {/* Etiqueta de la fila de sesiones */}
          {showValues && (
            <text x={padL} y={sesRowY} textAnchor="start" fontSize="7.5" fill="#d1d5db">
              ses.
            </text>
          )}
          {pts.map((p, i) => (
            <g key={p.dia}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="#FFF200" stroke="#a89800" strokeWidth="1">
                <title>{`${fmtDay(p.dia)}: ${p.personas} personas · ${p.sesiones} sesiones`}</title>
              </circle>
              {/* Personas: número sobre el punto (la línea) */}
              {showValues && (
                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#111827"
                >
                  {p.personas}
                </text>
              )}
              {/* Sesiones del día: debajo */}
              {showValues && (
                <text x={p.x} y={sesRowY} textAnchor="middle" fontSize="9.5" fill="#9ca3af">
                  {p.sesiones}
                </text>
              )}
              {(showValues || i % labelEvery === 0 || i === n - 1) && (
                <text x={p.x} y={dateRowY} textAnchor="middle" fontSize="9" fill="#9ca3af">
                  {fmtDay(p.dia)}
                </text>
              )}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
};

export default SesionesChatbotDiarias;
