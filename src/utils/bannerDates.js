export const BANNER_TIME_ZONE = "America/Monterrey";

const localPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BANNER_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const zonedParts = (date) =>
  Object.fromEntries(
    localPartsFormatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, Number(value)]),
  );

export function formatMonterreyDateTimeLocal(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = zonedParts(date);
  const pad = (part) => String(part).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function monterreyDateTimeLocalToIso(value) {
  if (value === "" || value === null || value === undefined) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Ingresa una fecha y hora válidas.");

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const target = {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
    hour: Number(hourText),
    minute: Number(minuteText),
  };
  const targetAsUtc = Date.UTC(target.year, target.month - 1, target.day, target.hour, target.minute);
  const normalized = new Date(targetAsUtc);
  if (
    normalized.getUTCFullYear() !== target.year ||
    normalized.getUTCMonth() + 1 !== target.month ||
    normalized.getUTCDate() !== target.day ||
    target.hour > 23 ||
    target.minute > 59
  ) {
    throw new Error("Ingresa una fecha y hora válidas.");
  }

  let timestamp = targetAsUtc;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = zonedParts(new Date(timestamp));
    const zonedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const nextTimestamp = targetAsUtc - (zonedAsUtc - timestamp);
    if (nextTimestamp === timestamp) break;
    timestamp = nextTimestamp;
  }

  const result = new Date(timestamp);
  const actual = zonedParts(result);
  if (
    actual.year !== target.year ||
    actual.month !== target.month ||
    actual.day !== target.day ||
    actual.hour !== target.hour ||
    actual.minute !== target.minute
  ) {
    throw new Error(`La hora no existe en ${BANNER_TIME_ZONE}.`);
  }
  return result.toISOString();
}

export function validateMonterreyDateRange(startValue, endValue) {
  const start = monterreyDateTimeLocalToIso(startValue);
  const end = monterreyDateTimeLocalToIso(endValue);
  if (start && end && new Date(end).getTime() <= new Date(start).getTime()) {
    throw new Error("La fecha final debe ser posterior a la fecha inicial.");
  }
  return { fecha_inicio: start, fecha_fin: end };
}
