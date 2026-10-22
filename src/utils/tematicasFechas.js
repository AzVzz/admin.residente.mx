const ZONA_HORARIA = "America/Monterrey";

const opcionesFecha = {
  timeZone: ZONA_HORARIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

const opcionesFechaHora = {
  ...opcionesFecha,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
};

export function fechaTematicaParaInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", opcionesFechaHora)
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value: partValue }) => [type, partValue])
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatoFechaTematica(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-MX", {
    ...opcionesFecha,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function estadoTematica(tematica, ahora = Date.now()) {
  if (tematica.estatus !== "publicada") return "Borrador";
  if (tematica.fecha_fin && new Date(tematica.fecha_fin).getTime() < ahora) return "Finalizada";
  if (tematica.fecha_inicio && new Date(tematica.fecha_inicio).getTime() > ahora) return "Programada";
  return "Vigente";
}
