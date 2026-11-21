import React from "react";

// Portada de la landing: "Residente presenta", los dos libros con su reflejo y
// el mensaje principal. Se arma con texto (no es una imagen) para poder editarlo.
// Los libros dicen "Legado Noreste"; la foto ya trae el reflejo y aquí se desvanece
// hacia abajo para que no quede cortado en seco.
const LIBROS =
  "https://residente.mx/fotos/fotos-estaticas/dashboard/Legado-Noreste_-Libros-de-Montaa-1795286141763.webp";

const ORO = "var(--accent-gold)";

const Filetes = ({ children, className = "" }) => (
  <div className={`flex w-full items-center justify-center gap-4 sm:gap-6 ${className}`}>
    <span className="h-px w-8 sm:w-24" style={{ backgroundColor: ORO }} />
    {children}
    <span className="h-px w-8 sm:w-24" style={{ backgroundColor: ORO }} />
  </div>
);

const HeroLegado = () => (
  <section className="mb-20 w-full text-center">
    {/* Encabezado */}
    <Filetes>
      <p className="legado-titulo text-[0.95rem] tracking-[0.3em] sm:text-[1.15rem]" style={{ color: ORO }}>
        Residente presenta
      </p>
    </Filetes>
    <p className="legado-ui mt-3 text-[0.7rem] tracking-[0.35em] sm:text-[0.75rem]" style={{ color: ORO }}>
      USDA + Residente
    </p>

    {/* Libros a la izquierda, mensaje a la derecha */}
    <div className="mt-8 grid grid-cols-1 items-center gap-8 md:grid-cols-[1.35fr_1fr] md:gap-10">
      <img
        src={LIBROS}
        alt="Libros Legado Noreste"
        width="1447"
        height="1087"
        decoding="async"
        className="mx-auto h-auto w-full mix-blend-lighten [mask-image:linear-gradient(to_bottom,#000_78%,transparent_100%)]"
      />

      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <h2 className="legado-editorial text-[2rem] font-semibold uppercase leading-[1.05] sm:text-[3rem] lg:text-[3.6rem]" style={{ color: ORO }}>
          Dos libros.
          <br />
          Una región.
          <br />
          50 protagonistas.
        </h2>
        <span className="mt-8 h-px w-48" style={{ backgroundColor: ORO }} />
        <p className="legado-editorial mt-8 max-w-[520px] text-[1.3rem] leading-snug sm:text-[1.5rem]" style={{ color: "var(--text-primary)" }}>
          <span style={{ color: ORO }}>NORESTE</span> es un proyecto editorial que reunirá 25 restaurantes de legado y 25
          propuestas de vanguardia para celebrar la historia, la innovación y la identidad gastronómica de Nuevo León.
        </p>
      </div>
    </div>

    {/* Pie */}
    <Filetes className="mt-6">
      <p className="legado-ui text-[0.6rem] leading-relaxed tracking-[0.3em] sm:text-[0.7rem]" style={{ color: ORO }}>
        Media kit 2027 · Libro 1: Legado / Libro 2: Vanguardia
      </p>
    </Filetes>
  </section>
);

export default HeroLegado;
