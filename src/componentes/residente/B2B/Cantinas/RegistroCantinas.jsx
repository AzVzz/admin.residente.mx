import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import "./cantinas.css"; // fuentes y colores de esta landing

// Landing de "La Ruta de las Cantinas de Nuevo León" a partir del media kit (páginas 1 y 3):
// portada con el libro y la participación con la inversión. Armada con texto (no la imagen del PDF)
// para poder editarla y que se lea bien en celular. Las fotos salen del mismo media kit.

const LIBRO = `${import.meta.env.BASE_URL}cantinas/libro.jpg`;
const BARRA = `${import.meta.env.BASE_URL}cantinas/barra.jpg`;

// Muestras del capítulo de una cantina (8 páginas), en este orden: primero la 1 y luego la 2.
const MUESTRAS = [
  { src: `${import.meta.env.BASE_URL}cantinas/muestra-1.webp`, alt: "Muestra 1: capítulo Bar Salón Progreso, 8 páginas", w: 1448, h: 1086 },
  { src: `${import.meta.env.BASE_URL}cantinas/muestra-2.webp`, alt: "Muestra 2: capítulo Bar Salón Progreso, 8 páginas", w: 1536, h: 1024 },
];

const WHATSAPP_CANTINAS = `https://wa.me/528114186985?text=${encodeURIComponent(
  "Hola, me interesa que mi cantina aparezca en LA RUTA DE LAS CANTINAS DE NUEVO LEÓN. ¿Me pueden dar más información?",
)}`;

const Linea = ({ className = "" }) => <div className={`h-px w-full bg-[var(--c-line)] ${className}`} />;

// "RESIDENTE  PRESENTA" (arriba de cada página del media kit)
const Presenta = () => (
  <p className="flex items-baseline gap-4">
    <span className="cantinas-titulo text-[1.6rem] sm:text-[2rem]">Residente</span>
    <span className="cantinas-etiqueta text-[0.75rem] sm:text-[0.85rem]">Presenta</span>
  </p>
);

// Tira de datos con puntos separadores (pie de cada página del media kit)
const Tira = ({ items }) => (
  <div className="mt-10">
    <Linea />
    <p className="cantinas-etiqueta flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-5 text-[0.8rem] tracking-[0.22em] sm:justify-between sm:text-[1.05rem]">
      {items.map((item, i) => (
        <React.Fragment key={item}>
          {i > 0 ? <span aria-hidden="true">•</span> : null}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </p>
  </div>
);

// Datos de la página 3
const DATOS = [
  ["30 cantinas", "seleccionadas"],
  ["8 páginas", "por cantina"],
  ["Formato", "13 × 21 cm"],
  ["Edición de", "colección"],
];

const RegistroCantinas = () => {
  // Igual que Legado: una "cortina" del color de la página sube desde abajo y el contenido entra
  // bloque por bloque; al terminar se quita la cortina y el fondo queda en la propia página.
  const [listo, setListo] = useState(false);
  const [abierta, setAbierta] = useState(null); // muestra ampliada
  useEffect(() => {
    const sinMovimiento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(() => setListo(true), sinMovimiento ? 0 : 1500); // seguro si la animación no termina
    return () => clearTimeout(id);
  }, []);
  return (
  <div className="cantinas-landing -mx-10 min-h-[70vh] px-6 py-12 sm:mx-0 sm:px-12 sm:py-16" style={{ backgroundColor: listo ? "var(--c-bg)" : "transparent" }}>
    {!listo && <div aria-hidden="true" className="cantinas-cortina" onAnimationEnd={() => setListo(true)} />}
    <div className="cantinas-escalonado relative mx-auto w-full max-w-[1200px]">
      {/* ───── Página 1: portada ───── */}
      <section>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.15fr_1fr]">
          <div>
            <Presenta />
            <h1 className="cantinas-titulo mt-6 text-[3.4rem] sm:text-[5.2rem] lg:text-[6.4rem]">
              La ruta de las
              <br />
              cantinas
              <br />
              de Nuevo León
            </h1>
            <Linea className="mt-8 max-w-[260px]" />
            <p className="cantinas-texto mt-8 max-w-[520px] text-[1.25rem] leading-snug sm:text-[1.5rem]">
              Un libro editorial que reunirá 30 cantinas emblemáticas de Nuevo León en una pieza cultural de colección.
            </p>
          </div>
          <img
            src={LIBRO}
            alt="Libro La Ruta de las Cantinas de Nuevo León"
            width="570"
            height="960"
            decoding="async"
            className="mx-auto h-auto w-full max-w-[420px]"
          />
        </div>
        <Tira items={["30 cantinas", "8 páginas por cantina", "13 x 21 cm", "$25,000 + IVA"]} />
      </section>

      {/* ───── Página 3: participación ───── */}
      <section className="mt-24">
        <Presenta />
        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[1fr_1.15fr]">
          <img
            src={BARRA}
            alt="Parroquiano en la barra de una cantina"
            width="704"
            height="696"
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-cover"
          />
          <div>
            <h2 className="cantinas-titulo text-[3.6rem] sm:text-[5rem] lg:text-[5.8rem]">Participación</h2>
            <p className="cantinas-titulo mt-2 text-[1.7rem] sm:text-[2.3rem]">Sea parte de la ruta</p>
            <Linea className="mt-6 max-w-[300px]" />
            <p className="cantinas-texto mt-6 text-[1.15rem] leading-snug sm:text-[1.35rem]">
              Una edición de colección que reunirá a 30 cantinas emblemáticas de Nuevo León en un libro de alto valor
              cultural, editorial y de gran permanencia.
            </p>
            <Linea className="mt-8" />
            <div className="grid grid-cols-2 gap-y-5 py-6 sm:grid-cols-4">
              {DATOS.map(([a, b], i) => (
                <p
                  key={a}
                  className={`cantinas-titulo px-3 text-[1.15rem] leading-[1.15] sm:text-[1.35rem] ${i % 2 === 1 ? "border-l border-[var(--c-line)]" : ""} ${i === 2 ? "sm:border-l sm:border-[var(--c-line)]" : ""}`}
                >
                  {a}
                  <br />
                  {b}
                </p>
              ))}
            </div>
            <Linea />
            <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="cantinas-titulo text-[1.35rem] sm:text-[1.6rem]">Inversión por cantina</p>
                <p className="cantinas-titulo whitespace-nowrap text-[2.8rem] sm:text-[3.3rem]">$25,000 MXN</p>
                <p className="cantinas-titulo text-[1.4rem]">+ IVA</p>
              </div>
              <p className="cantinas-texto self-center border-[var(--c-line)] text-[1.1rem] leading-snug sm:border-l sm:pl-6 sm:text-[1.2rem]">
                Incluye reportaje editorial, producción fotográfica, diseño, ilustración, edición e impresión del libro.
              </p>
            </div>
          </div>
        </div>
        <Tira items={["30 cantinas", "Un libro de colección", "Patrimonio cultural de Nuevo León"]} />
      </section>

      {/* Muestras del libro: chiquitas; al tocarlas se ven en grande */}
      <section className="mt-20">
        <Linea />
        <p className="cantinas-etiqueta pt-5 text-center text-[0.8rem] sm:text-[0.9rem]">Muestras del capítulo</p>
        <div className="mx-auto mt-6 grid max-w-[1000px] grid-cols-1 gap-10">
          {MUESTRAS.map((m, i) => (
            <button key={m.src} type="button" onClick={() => setAbierta(m)} className="group cursor-zoom-in text-left" aria-label={`Ver en grande: ${m.alt}`}>
              <img src={m.src} alt={m.alt} width={m.w} height={m.h} loading="lazy" decoding="async"
                className="h-auto w-full border border-[var(--c-line)] shadow-sm transition-transform group-hover:-translate-y-1" />
              <span className="cantinas-etiqueta mt-2 block text-center text-[0.7rem]">Muestra {i + 1}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Contacto por WhatsApp (mismo número que Legado) */}
      <div className="mt-16 flex justify-center">
        <a
          href={WHATSAPP_CANTINAS}
          target="_blank"
          rel="noopener noreferrer"
          className="cantinas-etiqueta inline-flex items-center gap-3 bg-[var(--c-ink)] px-8 py-4 text-[0.9rem] tracking-[0.2em] text-white hover:opacity-90"
        >
          <FaWhatsapp className="h-5 w-5" />
          Quiero participar
        </a>
      </div>
    </div>
    {abierta ? (
      <div role="dialog" aria-modal="true" aria-label={abierta.alt} onClick={() => setAbierta(null)}
        className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-4">
        <img src={abierta.src} alt={abierta.alt} className="max-h-full max-w-full object-contain" />
        <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/15 text-2xl leading-none text-white hover:bg-white/25">×</button>
      </div>
    ) : null}
  </div>
  );
};

export default RegistroCantinas;
