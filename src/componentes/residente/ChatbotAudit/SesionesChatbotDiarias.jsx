import React, { useState, useEffect } from "react";
import { urlApi } from "../../api/url";
import { useAuth } from "../../Context";

// "2026-05-18" → "18 may". Split manual para evitar corrimiento de zona horaria.
function fmtDay(d) {
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const [, m, day] = String(d).split("-");
  return `${parseInt(day, 10)} ${meses[parseInt(m, 10) - 1] || ""}`;
}

// Hoy en zona horaria de Monterrey → "YYYY-MM-DD".
function todayMTY() {
  const parts = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Monterrey",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// "YYYY-MM-DD" + n días (puede ser negativo).
function shiftDay(s, n) {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// Rellena días sin actividad con 0 entre startYMD y endYMD inclusive.
function fillMissingDays(porDia, startYMD, endYMD) {
  if (!startYMD || !endYMD || startYMD > endYMD) return porDia;
  const map = new Map(porDia.map((d) => [String(d.dia).slice(0, 10), d]));
  const out = [];
  for (let cur = startYMD; cur <= endYMD; cur = shiftDay(cur, 1)) {
    out.push(map.get(cur) || { dia: cur, sesiones: 0, personas: 0 });
  }
  return out;
}

// Recorta días sin actividad al inicio, incluyendo registros aislados (un día
// con actividad seguido de muchos días en cero). Devuelve desde el primer día
// activo que tenga algún seguimiento dentro de los siguientes 7 días.
function trimLeadingEmpty(porDia, windowDays = 7) {
  let i = 0;
  while (i < porDia.length) {
    const has = (Number(porDia[i].sesiones) || 0) > 0 || (Number(porDia[i].personas) || 0) > 0;
    if (!has) { i++; continue; }
    const end = Math.min(i + windowDays + 1, porDia.length);
    const followup = porDia.slice(i + 1, end).some(
      (x) => (Number(x.sesiones) || 0) > 0 || (Number(x.personas) || 0) > 0
    );
    if (followup) return porDia.slice(i);
    i++; // día aislado: lo descartamos también
  }
  return [];
}

// Gráfica de uso del chatbot: personas reales y sesiones, con una línea de
// PERSONAS por día y las SESIONES de cada día debajo de su punto.
const SesionesChatbotDiarias = ({ days = 30, customFrom = "", customTo = "" }) => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    // En modo custom, no consultamos hasta que ambas fechas estén definidas.
    if (days === "custom" && (!customFrom || !customTo)) return;
    let cancelado = false;
    (async () => {
      try {
        const url = days === "custom"
          ? `${urlApi}api/chatbot/admin/sessions-daily?from=${customFrom}&to=${customTo}`
          : `${urlApi}api/chatbot/admin/sessions-daily?days=${days}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelado) setData(json);
      } catch (e) {
        if (!cancelado) setError(e.message);
      }
    })();
    return () => { cancelado = true; };
  }, [token, days, customFrom, customTo]);

  if (error || !data) return null;

  // Determinar rango y rellenar días sin actividad con 0.
  const today = todayMTY();
  let startYMD, endYMD;
  if (data.days === "custom") {
    startYMD = data.from ? String(data.from).slice(0, 10) : today;
    endYMD = data.to ? String(data.to).slice(0, 10) : today;
  } else if (data.days === "all") {
    startYMD = data.first_day ? String(data.first_day).slice(0, 10) : today;
    endYMD = today;
  } else {
    const dnum = Number(data.days) || 30;
    startYMD = shiftDay(today, -(dnum - 1));
    endYMD = today;
  }
  // Llenar todos los días + recortar el "calentamiento" del inicio:
  // si hubo un día aislado (ej. 27 abr) seguido de semanas en cero, no lo
  // mostramos. La gráfica arranca desde el primer día con actividad continua.
  const porDia = trimLeadingEmpty(fillMissingDays(data.por_dia || [], startYMD, endYMD));
  const personasTotal = Number(data.total_personas) || 0;
  const sesionesTotal = Number(data.total_sesiones) || 0;
  const n = porDia.length;
  // La línea grafica PERSONAS por día.
  const max = Math.max(1, ...porDia.map((d) => Number(d.personas) || 0));

  // Geometría de la gráfica (más alta que antes para ver bien la curva).
  const W = 560;
  const H = 240;
  const padL = 14;
  const padR = 14;
  const padT = 24;
  const padB = 52;
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
  // Tamaño del texto por punto: se reduce cuando hay muchos días para no
  // saturar. Se muestra siempre en días con actividad (skip los días con 0).
  const isDense = n > 30;
  const valSize = isDense ? 7.5 : n > 14 ? 8.5 : 10;
  const labelEvery = Math.max(1, Math.ceil(n / 8));
  const sesRowY = H - 28; // fila de "sesiones del día"
  const dateRowY = H - 10; // fila de fechas

  return (
    <div className="border border-gray-200 rounded-lg p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Uso del chatbot
        </h3>
        <span className="text-xs text-gray-400">
          {data.days === "custom"
            ? `${fmtDay(data.from)} – ${fmtDay(data.to)}`
            : data.days === "all"
            ? "histórico"
            : `últimos ${data.days} días`}
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-12 mb-3">
        <div>
          <p className="text-6xl font-bold text-gray-900 leading-none">
            {personasTotal.toLocaleString("es-MX")}
          </p>
          <p className="text-base font-semibold text-gray-800 mt-2">
            {personasTotal === 1 ? "usuario único" : "usuarios únicos"}
          </p>
        </div>
        <div>
          <p className="text-6xl font-bold text-gray-900 leading-none">
            {sesionesTotal.toLocaleString("es-MX")}
          </p>
          <p className="text-base font-semibold text-gray-800 mt-2">
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
          style={{ maxHeight: 320 }}
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
          {pts.map((p, i) => {
            const hasActivity = p.personas > 0 || p.sesiones > 0;
            return (
              <g key={p.dia}>
                <circle cx={p.x} cy={p.y} r="3.5" fill="#FFF200" stroke="#a89800" strokeWidth="1">
                  <title>{`${fmtDay(p.dia)}: ${p.personas} personas · ${p.sesiones} sesiones`}</title>
                </circle>
                {hasActivity && (
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fontSize={valSize}
                    fontWeight="bold"
                    fill="#111827"
                  >
                    {p.personas}
                  </text>
                )}
                {hasActivity && (
                  <text
                    x={p.x}
                    y={sesRowY}
                    textAnchor="middle"
                    fontSize={valSize}
                    fontWeight="bold"
                    fill="#374151"
                  >
                    {p.sesiones}
                  </text>
                )}
                {i % labelEvery === 0 && (
                  <text x={p.x} y={dateRowY} textAnchor="middle" fontSize="9" fill="#9ca3af">
                    {fmtDay(p.dia)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};

export default SesionesChatbotDiarias;
