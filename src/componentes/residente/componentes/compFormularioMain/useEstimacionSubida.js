import { useEffect, useRef, useState } from "react";

/** Ventana para calcular la velocidad actual (no el promedio de toda la subida). */
const VENTANA_VELOCIDAD_MS = 10000;

/**
 * Calcula velocidad, tiempos y "falta aprox." de una subida a partir de su avance.
 *
 * progreso = { fase: "subiendo" | "procesando", pct, loaded, total, faseServidor,
 *              inicio?, inicioFase? }   (inicio/inicioFase en ms; si no vienen,
 *              se cuentan desde que se montó el componente / cambió la fase)
 */
export const useEstimacionSubida = (progreso) => {
  const [ahora, setAhora] = useState(Date.now());
  const montado = useRef(Date.now());
  const faseActual = useRef({ fase: null, desde: Date.now() });
  const muestras = useRef([]); // [{ t, loaded }] de la fase "subiendo"

  // Reloj: refresca cada segundo para que el tiempo transcurrido avance solo.
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fase = progreso?.fase === "procesando" ? "procesando" : "subiendo";
  if (faseActual.current.fase !== fase) {
    faseActual.current = { fase, desde: Date.now() };
  }

  const pct = Math.max(0, Math.min(100, Math.round(progreso?.pct || 0)));
  const desdeFase = progreso?.inicioFase || faseActual.current.desde;
  const segFase = Math.max(0, (ahora - desdeFase) / 1000);
  const segTotal = Math.max(0, (ahora - (progreso?.inicio || montado.current)) / 1000);

  let velocidad = 0;
  let faltan = null;

  if (fase === "subiendo") {
    const loaded = progreso?.loaded || 0;
    const ultima = muestras.current[muestras.current.length - 1];
    if (!ultima || ultima.loaded !== loaded) {
      muestras.current.push({ t: Date.now(), loaded });
      const limite = Date.now() - VENTANA_VELOCIDAD_MS;
      while (muestras.current.length > 2 && muestras.current[0].t < limite) {
        muestras.current.shift();
      }
    }
    const primera = muestras.current[0];
    const spanSeg = (Date.now() - primera.t) / 1000;
    if (spanSeg >= 2 && loaded > primera.loaded) {
      velocidad = (loaded - primera.loaded) / spanSeg;
    } else if (segFase >= 2 && loaded > 0) {
      velocidad = loaded / segFase;
    }
    const total = progreso?.total || 0;
    if (velocidad > 0 && total > loaded) {
      faltan = (total - loaded) / velocidad;
    }
  } else if (pct >= 8) {
    // Con ≥8% ya hay base para estimar; antes sería adivinar.
    faltan = (segFase * (100 - pct)) / pct;
  }

  const enCola = fase === "procesando" && progreso?.faseServidor === "en_cola";

  return { fase, pct, velocidad, faltan, segFase, segTotal, enCola };
};
