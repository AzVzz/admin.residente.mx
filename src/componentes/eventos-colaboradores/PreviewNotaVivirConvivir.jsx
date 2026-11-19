import React, { useMemo } from "react";
import { Iconografia } from "../utils/Iconografia.jsx";
import { CATEGORIAS } from "./ListaEventosColaboradores";

const MESES_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const todosLosStickers = [
  ...Iconografia.categorias,
  ...Iconografia.ocasiones,
  ...Iconografia.zonas,
];

const limpiarHtml = (html) =>
  String(html || "")
    .replace(/<\s*(script|style|iframe|object|embed|form)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*("|')/gi, '$1="#"');

const fechaLarga = (valor) => {
  if (!valor) return "";
  const d = new Date(String(valor).includes("T") ? valor : `${valor}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
};

const rangoEvento = (inicio, fin) => {
  const a = fechaLarga(inicio);
  if (!a) return "";
  if (!fin) return a;
  const d1 = new Date(String(inicio).includes("T") ? inicio : `${inicio}T12:00:00`);
  const d2 = new Date(String(fin).includes("T") ? fin : `${fin}T12:00:00`);
  if (Number.isNaN(d2.getTime()) || d1.toDateString() === d2.toDateString()) return a;
  return `${a} — ${d2.getDate()} de ${MESES_ES[d2.getMonth()]}`;
};

/**
 * Vista previa en vivo del layout público (NotaVivirConvivir.astro).
 * Misma idea que DetallePost en el formulario de notas normales.
 */
const PreviewNotaVivirConvivir = ({
  titulo,
  subtitulo,
  autor,
  contenido,
  imagenUrl,
  categoria,
  stickers = [],
  esEvento = false,
  fechaInicio,
  fechaFin,
  lugar,
  linkBoletos,
  fechaPublicacion,
}) => {
  const categoriaLabel = CATEGORIAS.find(([v]) => v === categoria)?.[1] || "";
  const fechaPub = fechaLarga(fechaPublicacion) || fechaLarga(new Date().toISOString());
  const fechaVisible = esEvento ? rangoEvento(fechaInicio, fechaFin) : "";
  const enlaceExterno = (linkBoletos || "").trim();

  const stickersResueltos = useMemo(
    () =>
      (Array.isArray(stickers) ? stickers : [])
        .map((clave) => todosLosStickers.find((s) => s.clave === clave))
        .filter(Boolean),
    [stickers],
  );

  const contenidoHtml = useMemo(() => {
    const limpio = limpiarHtml(contenido);
    if (!limpio.trim()) return "";
    if (/<\w+[^>]*>/.test(limpio)) return limpio;
    return limpio
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }, [contenido]);

  const hayAlgo =
    titulo ||
    subtitulo ||
    autor ||
    contenidoHtml ||
    imagenUrl ||
    categoriaLabel ||
    stickersResueltos.length > 0 ||
    (esEvento && (fechaVisible || lugar || enlaceExterno));

  if (!hayAlgo) {
    return (
      <div className="shadow-lg border border-gray-200 p-6 text-center text-gray-500 bg-white">
        <p>Comienza a escribir para ver la vista previa de tu nota</p>
      </div>
    );
  }

  const articulo = (
    <article className="w-full min-w-0 pt-4 pb-8">
      <span className="inline-block mb-6 font-roman text-[13px] uppercase tracking-[0.14em] text-black/60">
        ← Vivir y Convivir
      </span>

      {categoriaLabel && (
        <div className="mb-3">
          <span className="inline-block text-[11px] font-black uppercase tracking-wide text-black bg-[#fff200] px-1.5 pt-[4px] pb-[3px] leading-none">
            {categoriaLabel}
          </span>
        </div>
      )}

      {titulo && (
        <h1 className="font-grotesk font-black text-[28px] md:text-[40px] leading-[1.05] tracking-tight text-black">
          {titulo}
        </h1>
      )}

      {subtitulo && (
        <h2 className="mt-4 font-roman text-[17px] md:text-[20px] leading-snug text-black/70">
          {subtitulo}
        </h2>
      )}

      {(autor || fechaPub) && (
        <p className="mt-4 font-roman text-[13px] text-black/55">
          {autor && <span>Por {autor}</span>}
          {autor && fechaPub && <span> · </span>}
          {fechaPub && <time>{fechaPub}</time>}
        </p>
      )}

      {imagenUrl && (
        <figure className="mt-6">
          <img src={imagenUrl} alt={titulo || "Portada"} className="w-full h-auto" />
        </figure>
      )}

      {esEvento && (fechaVisible || lugar || enlaceExterno) && (
        <div className="mt-6 border border-black/15 bg-white/50 p-4 font-roman text-[15px] flex flex-col gap-1.5">
          {fechaVisible && (
            <p>
              <span className="font-bold">Fecha:</span> {fechaVisible}
            </p>
          )}
          {lugar && (
            <p>
              <span className="font-bold">Lugar:</span> {lugar}
            </p>
          )}
          {enlaceExterno && (
            <p className="mt-1">
              <span className="inline-block bg-black text-white px-5 py-2 rounded-full font-grotesk text-[13px] uppercase tracking-wide">
                Más información
              </span>
            </p>
          )}
        </div>
      )}

      {contenidoHtml && (
        <div
          className="mt-8 font-roman text-[17px] leading-relaxed text-black/90 [&_p]:mb-5 [&_a]:underline [&_a]:text-blue-700 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-5 [&_img]:w-full [&_img]:h-auto [&_img]:my-6 [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: contenidoHtml }}
        />
      )}

      {stickersResueltos.length > 0 && (
        <div className="mt-8 flex items-center gap-4">
          {stickersResueltos.map((s) => (
            <img
              key={s.clave}
              src={s.icono}
              alt={s.nombre}
              title={s.nombre}
              className="w-14 h-14 object-contain"
            />
          ))}
        </div>
      )}
    </article>
  );

  return (
    <div className="bg-[#ebebeb] border border-gray-200 shadow-lg overflow-hidden p-4">
      {/* Preview del shell 3 columnas (Favoritos | nota | Revista) */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)_200px]">
        <aside className="hidden lg:block">
          <h2 className="mb-0 text-left text-[16px] uppercase tracking-[-0.02em] text-black">
            <span className="inline-block font-grotesk" style={{ transform: "skewX(-15deg)" }}>
              Favoritos
            </span>
          </h2>
          <span className="mb-3 mt-2 block h-1 w-8 bg-[#fff200]" aria-hidden="true" />
          <p className="font-roman text-[12px] text-black/45">
            Otras notas de Vivir y Convivir aparecen aquí en el sitio.
          </p>
        </aside>

        <div className="min-w-0 bg-transparent">{articulo}</div>

        <aside className="hidden lg:flex flex-col items-center text-center">
          <h2 className="text-[16px] uppercase tracking-[-0.02em] text-black">
            <span className="inline-block font-grotesk" style={{ transform: "skewX(-15deg)" }}>
              Revista digital
            </span>
          </h2>
          <span className="mt-0.5 font-roman text-[10px] uppercase tracking-wide text-black/70">
            Vivir y Convivir
          </span>
          <span className="mt-4 inline-block bg-[#fff200] px-1.5 pt-[4px] pb-[3px] text-[9px] font-black uppercase text-black">
            Especial
          </span>
          <p className="mt-3 font-roman text-[12px] text-black/45">
            Agenda y “Además” con más notas del micrositio.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default PreviewNotaVivirConvivir;
