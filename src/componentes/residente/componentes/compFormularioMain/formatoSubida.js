const MB = 1024 * 1024;

/** 46170579 → "44.0 MB" */
export const formatearMB = (bytes) =>
  !bytes || bytes <= 0 ? "0 MB" : `${(bytes / MB).toFixed(1)} MB`;

/** Pantalla de seguimiento de una subida (la que abre la barra del dashboard). */
export const rutaSeguimiento = ({ id, esEdicion, videoId }) =>
  `/videosFormulario${esEdicion && videoId ? `/${videoId}` : ""}?subida=${id}`;

/** 125 → "2 min 05 s" */
export const formatearTiempo = (segundos) => {
  if (!Number.isFinite(segundos) || segundos < 0) return "—";
  const s = Math.round(segundos);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${String(s % 60).padStart(2, "0")} s`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
};
