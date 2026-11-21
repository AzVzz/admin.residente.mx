import React, { useEffect, useState } from "react";
import { FaBookOpen, FaCoins, FaShoppingCart, FaWhatsapp } from "react-icons/fa";
import { ArquitecturaEditorial, CanastoDeValor, SeleccionLegado, SeleccionVanguardia } from "./SeccionesLegado";
import "./legado.css"; // paleta y tipografía (variables y clases) de esta landing

// Landing de "Noreste: Legado" (libro de colección). Una sola columna,
// fondo negro y detalles dorados, igual que la presentación del proyecto.
// Colores y fuentes salen de legado.css:
//   .legado-titulo    → Cinzel (títulos y cifras)
//   .legado-editorial → Cormorant Garamond (subtítulos y párrafos)
//   .legado-ui        → Montserrat (etiquetas, botones y pie)

const WHATSAPP_LEGADO = `https://wa.me/528114186985?text=${encodeURIComponent(
  "Hola, me interesa aparecer en NORESTE: LEGADO. ¿Me pueden dar más información?",
)}`;

const DATOS = [
  { numero: "25", etiqueta: "Restaurantes clásicos" },
  { numero: "270", etiqueta: "Páginas" },
  { numero: "10", etiqueta: "Páginas por restaurante" },
  { icono: FaBookOpen, etiqueta: "Pasta dura, cosido, 23 x 30 cm" },
  { numero: "1,000", etiqueta: "Ejemplares" },
];

const Regla = ({ className = "", color = "var(--accent-gold)" }) => (
  <div className={`h-px w-full ${className}`} style={{ backgroundColor: color }} />
);

const RegistroLegado = () => {
  // Mientras sube la cortina negra el fondo de la página es transparente; al
  // terminar, la cortina se quita y el fondo negro queda en la propia página
  // (así no tapa el footer al hacer scroll).
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const sinMovimiento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Seguro por si la animación no llega a terminar
    const id = setTimeout(() => setListo(true), sinMovimiento ? 0 : 1500);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className="legado-landing legado-editorial -mx-10 min-h-[70vh] px-6 py-12 text-center sm:mx-0 sm:px-10 sm:py-16"
      style={{
        backgroundColor: listo ? "var(--bg-primary)" : "transparent",
        color: "var(--text-primary)",
      }}
    >
      {!listo && (
        <div
          aria-hidden="true"
          className="legado-cortina"
          onAnimationEnd={() => setListo(true)}
        />
      )}
      <div className="legado-escalonado relative mx-auto flex w-full max-w-[1200px] flex-col items-center">
        {/* Encabezado */}
        <p
          className="legado-ui tracking-[0.35em]"
          style={{ color: "var(--accent-gold)" }}
        >
          Presentado por USDA + Residente
        </p>

        {/* Una sola fila: libros a la izquierda, texto a la derecha */}
        <div className="mt-10 grid w-full grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
          <img
            src="https://residente.mx/fotos/fotos-estaticas/dashboard/Legado-Noreste_-Libros-de-Montaa-1795286141763.webp"
            alt="Libros NORESTE Legado y NORESTE Vanguardia"
            width="1447"
            height="1087"
            className="order-2 mx-auto h-auto w-full max-w-[560px] mix-blend-lighten"
            decoding="async"
          />

          <div className="order-1 flex flex-col items-center text-center md:items-start md:text-left">
            <h1 className="w-full max-w-[300px] sm:max-w-[380px]">
              <img
                src={`${import.meta.env.BASE_URL}legado/noreste-legado-titulo.webp`}
                alt="NORESTE: LEGADO"
                width="1299"
                height="512"
                className="h-auto w-full"
                decoding="async"
              />
            </h1>

            <h2 className="legado-editorial mt-8 text-[1.6rem] leading-[1.3] sm:text-[2rem]">
              25 restaurantes que han construido la identidad gastronómica del
              noreste de México.
            </h2>

            <div
              className="legado-editorial mt-6 max-w-[520px] space-y-3 text-[1.2rem] sm:text-[1.3rem]"
              style={{ color: "var(--text-secondary)" }}
            >
              <p>
                Este proyecto reúne 50 restaurantes del noreste de México en dos
                libros de colección.
              </p>
              <p className="italic">
                Este documento presenta la oportunidad de aparecer en{" "}
                <span style={{ color: "var(--accent-gold)" }}>NORESTE: LEGADO</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Una sola fila: ediciones a la izquierda, datos del libro a la derecha */}
        <div className="mt-14 grid w-full grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
          <img
            src={`${import.meta.env.BASE_URL}legado/noreste-ediciones.webp`}
            alt="Ediciones especiales con Heineken y Sigma"
            width="665"
            height="395"
            loading="lazy"
            className="mx-auto h-auto w-full max-w-[460px] mix-blend-lighten"
            decoding="async"
          />

          <div className="flex w-full flex-col items-center">
            <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
              {DATOS.map(({ numero, icono: Icono, etiqueta }) => (
                <li
                  key={etiqueta}
                  className="flex flex-col items-center justify-start gap-3 px-2"
                >
                  {Icono ? (
                    <Icono className="h-10 w-10" style={{ color: "var(--accent-gold)" }} />
                  ) : (
                    <span
                      className="legado-titulo text-[2.75rem] leading-none sm:text-[2.5rem]"
                      style={{ color: "var(--accent-gold)" }}
                    >
                      {numero}
                    </span>
                  )}
                  <span className="legado-ui leading-snug">
                    {etiqueta}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Media kit: slides 2 a 7 */}
        <SeleccionLegado />
        <SeleccionVanguardia />
        <CanastoDeValor />

        {/* Inversión */}
        <div
          className="mt-12 flex w-full max-w-[520px] flex-col items-center gap-3 px-6 py-8"
        >
          <div className="flex items-center gap-4">
            <FaCoins className="h-10 w-10" style={{ color: "var(--accent-gold)" }} />
            <div className="text-left">
              <p
                className="legado-ui tracking-[0.3em]"
                style={{ color: "var(--accent-gold)" }}
              >
                Inversión:
              </p>
              <p
                className="legado-titulo mt-1 text-[2.5rem] leading-none sm:text-[3.25rem]"
                style={{ color: "var(--accent-gold)" }}
              >
                $100,000{" "}
                <span className="text-[1.1rem] sm:text-[1.4rem]">MXN</span>
              </p>
            </div>
          </div>
          <Regla className="mt-2 max-w-[360px]" />
          <p className="legado-ui flex items-center gap-3 text-center leading-relaxed">
            <FaShoppingCart className="h-5 w-5 shrink-0" style={{ color: "var(--accent-gold)" }} />
            <span>$1,000 por volumen / $1,500 la colección</span>
          </p>
        </div>

        {/* Contacto */}
        <a
          href={WHATSAPP_LEGADO}
          target="_blank"
          rel="noopener noreferrer"
          className="legado-ui mt-12 inline-flex items-center justify-center gap-3 bg-[var(--accent-gold)] px-8 py-4 text-[var(--bg-primary)] transition-colors hover:bg-[var(--accent-bronze)]"
        >
          <FaWhatsapp className="h-5 w-5" />
          Quiero aparecer en Legado
        </a>

        <ArquitecturaEditorial />

        {/* Pie */}
        <div className="mt-16 flex w-full max-w-[760px] flex-col items-center gap-5">
          <Regla color="var(--border-subtle)" />
          <p
            className="legado-ui leading-relaxed tracking-[0.3em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Gala de presentación y reconocimiento
            <span className="mx-2">·</span>
            <span className="whitespace-nowrap">26 de noviembre de 2027</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistroLegado;
