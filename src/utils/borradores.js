// Store de borradores de recuperación en localStorage.
//
// Guarda automáticamente lo que se escribe en los formularios de Nota y
// Restaurante para poder recuperarlo si se cierra la pestaña, se cae el
// navegador o se va el internet. Solo texto: los archivos (File/Blob) y las
// URLs blob: se descartan porque no se pueden serializar y no queremos llenar
// el localStorage con imágenes.

const STORAGE_KEY = "residente_borradores";

// Recorre el objeto y elimina valores que no se pueden/deben persistir:
// - File / Blob (imágenes seleccionadas)
// - strings tipo "blob:..." (previews de imágenes)
// Devuelve una copia limpia y serializable.
const sanitizar = (valor) => {
  if (valor == null) return valor;

  // File / Blob no sobreviven a JSON.stringify → se descartan.
  if (typeof File !== "undefined" && valor instanceof File) return undefined;
  if (typeof Blob !== "undefined" && valor instanceof Blob) return undefined;

  if (typeof valor === "string") {
    return valor.startsWith("blob:") ? undefined : valor;
  }

  if (Array.isArray(valor)) {
    return valor.map((item) => sanitizar(item)).filter((item) => item !== undefined);
  }

  if (typeof valor === "object") {
    const limpio = {};
    for (const clave of Object.keys(valor)) {
      const v = sanitizar(valor[clave]);
      if (v !== undefined) limpio[clave] = v;
    }
    return limpio;
  }

  return valor;
};

const leerTodo = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("Error al leer borradores:", error);
    return {};
  }
};

const escribirTodo = (todos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    // Suele ser QuotaExceededError si el navegador está lleno.
    console.error("Error al guardar borrador:", error);
  }
};

// ¿Vale la pena guardar? Evita crear borradores vacíos por el solo hecho de
// abrir el formulario. Consideramos "con contenido" si hay título, o algo en
// contenido/descripción o en cualquiera de los campos de reseña.
const tieneContenido = (data) => {
  if (!data || typeof data !== "object") return false;

  const stripHtml = (html) =>
    typeof html === "string" ? html.replace(/<[^>]*>/g, "").trim() : "";

  if (typeof data.titulo === "string" && data.titulo.trim()) return true;
  if (typeof data.nombre_restaurante === "string" && data.nombre_restaurante.trim())
    return true;
  if (stripHtml(data.contenido)) return true;
  if (stripHtml(data.descripcion)) return true;

  const camposResena = [
    "fundadores",
    "atmosfera",
    "receta_especial",
    "platillo_iconico",
    "promocion",
  ];
  return camposResena.some((c) => stripHtml(data[c]));
};

/**
 * Guarda (o actualiza) un borrador. No hace nada si no hay contenido útil.
 * @param {'nota'|'restaurante'} tipo
 * @param {string} id  - id estable de la sesión de captura (ver getFormId).
 * @param {string} titulo
 * @param {object} data - valores del formulario (se sanitizan).
 */
export const guardarBorrador = (tipo, id, titulo, data) => {
  if (!id) return;
  const dataLimpia = sanitizar(data) || {};
  if (!tieneContenido(dataLimpia)) return;

  const todos = leerTodo();
  todos[id] = {
    id,
    tipo,
    titulo: (titulo && String(titulo).trim()) || "Sin título",
    actualizado: new Date().toISOString(),
    data: dataLimpia,
  };
  escribirTodo(todos);
};

/** Devuelve todos los borradores, más recientes primero. */
export const listarBorradores = () => {
  const todos = leerTodo();
  return Object.values(todos).sort((a, b) =>
    (b.actualizado || "").localeCompare(a.actualizado || ""),
  );
};

/** Devuelve un borrador por id, o null. */
export const obtenerBorrador = (id) => {
  if (!id) return null;
  return leerTodo()[id] || null;
};

// Prefijo de los ids de borradores de captura NUEVA (no edición de un registro).
export const prefijoNuevo = (tipo) => `${tipo}_nuevo_`;

/**
 * Último borrador de captura NUEVA de un tipo. Sirve para el banner cuando se
 * reabre el formulario tras cerrar la pestaña (sessionStorage se pierde, así
 * que no podemos depender del id de sesión).
 */
export const ultimoBorradorNuevo = (tipo) => {
  const p = prefijoNuevo(tipo);
  return (
    listarBorradores().find((b) => typeof b.id === "string" && b.id.startsWith(p)) ||
    null
  );
};

/** Elimina un borrador por id. */
export const eliminarBorrador = (id) => {
  if (!id) return;
  const todos = leerTodo();
  if (todos[id]) {
    delete todos[id];
    escribirTodo(todos);
  }
};

/** Cantidad de borradores guardados (para el badge). */
export const contarBorradores = () => Object.keys(leerTodo()).length;

/** Texto "hace X" a partir de una fecha ISO. */
export const tiempoRelativo = (iso) => {
  if (!iso) return "";
  const seg = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seg < 60) return "hace un momento";
  const min = Math.floor(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const dias = Math.floor(hrs / 24);
  if (dias === 1) return "ayer";
  return `hace ${dias} días`;
};
