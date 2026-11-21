import React from "react";
import { FaPenNib, FaRegFileAlt, FaRegImage, FaRegUser } from "react-icons/fa";
import {
  APARECERA_CON,
  ARQUITECTURA,
  CANASTO,
  CANDIDATOS_LEGADO,
  CANDIDATOS_VANGUARDIA,
  CRITERIOS_LEGADO,
  CRITERIO_COMERCIAL_LEGADO,
  OBJETIVOS_LEGADO,
  RESUMEN_LEGADO,
  SELECCION_VANGUARDIA,
} from "./legadoContenido";

// Secciones del media kit (slides 2 a 7) con el mismo estilo oscuro de la
// landing. Los textos viven en legadoContenido.js.

const ORO = "var(--accent-gold)";
const BRONCE = "var(--accent-bronze)";
const LINEA = "var(--border-subtle)";

const Linea = ({ className = "", color = LINEA }) => (
  <div className={`h-px w-full ${className}`} style={{ backgroundColor: color }} />
);

const Marca = ({ children }) => (
  <p className="legado-ui tracking-[0.3em]" style={{ color: ORO }}>
    {children}
  </p>
);

// Una categoría con su lista de candidatos (puede traer marcas por grupo)
const Categoria = ({ numero, nombre, cantidad, items }) => (
  <div className="break-inside-avoid pb-8">
    <h4 className="flex items-baseline gap-3">
      <span className="legado-editorial text-[1.9rem] leading-none" style={{ color: BRONCE }}>
        {numero}.
      </span>
      <span className="legado-editorial text-[1.15rem] font-semibold uppercase tracking-[0.08em]">
        {nombre}
      </span>
      <span className="legado-editorial text-[1.1rem]" style={{ color: ORO }}>
        ({cantidad})
      </span>
    </h4>
    <ul className="legado-editorial mt-3 space-y-1 border-t pt-3 text-[1.1rem] leading-snug" style={{ borderColor: LINEA, color: "var(--text-secondary)" }}>
      {items.map((item) =>
        typeof item === "string" ? (
          <li key={item}>{item}</li>
        ) : (
          <li key={item.nombre}>
            <span style={{ color: "var(--text-primary)" }}>{item.nombre}</span>
            <span className="block text-[1rem]">— {item.marcas}</span>
          </li>
        ),
      )}
    </ul>
  </div>
);

const Candidatos = ({ lista }) => (
  <div>
    <h3 className="legado-titulo text-[1.5rem]">Candidatos</h3>
    <Linea className="mt-3 max-w-[90px]" color={ORO} />
    <div className="mt-8 gap-x-10 sm:columns-2 xl:columns-3">
      {lista.map((c, i) => (
        <Categoria key={c.nombre} numero={i + 1} {...c} />
      ))}
    </div>
  </div>
);

const Encabezado = ({ marca, titulo, destacado, resto, intro }) => (
  <>
    <Linea />
    <p className="legado-ui mt-8 tracking-[0.3em]" style={{ color: "var(--text-secondary)" }}>
      {marca}
    </p>
    <h2 className="legado-titulo mt-4 text-[1.9rem] leading-tight sm:text-[2.8rem]">{titulo}</h2>
    <p className="legado-editorial mt-4 text-[1.5rem] leading-snug sm:text-[1.9rem]">
      <span style={{ color: ORO }}>{destacado}</span> {resto}
    </p>
    {intro && (
      <p className="legado-editorial mt-4 max-w-[760px] text-[1.2rem] sm:text-[1.3rem]" style={{ color: "var(--text-secondary)" }}>
        {intro}
      </p>
    )}
  </>
);

// ───── Slide 2 ─────
export const SeleccionLegado = () => (
  <section className="mt-20 w-full text-left">
    <Encabezado
      marca="NORESTE: LEGADO · MEDIA KIT · LIBRO 1: LEGADO"
      titulo="Selección por invitación"
      destacado="43"
      resto="marcas de tradición gastronómica de Nuevo León. Solo 25 lugares disponibles."
      intro="Esta selección preliminar identifica a las marcas candidatas a ser invitadas para formar parte de NORESTE: LEGADO, el volumen dedicado a las empresas que han construido la identidad gastronómica de Nuevo León."
    />

    <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,330px)_1fr]">
      <div>
        <h3 className="legado-titulo text-[1.5rem]">Criterios de selección</h3>
        <Linea className="mt-3 max-w-[90px]" color={ORO} />
        <ol className="mt-6">
          {CRITERIOS_LEGADO.map(({ titulo, texto }, i) => (
            <li key={titulo} className="flex gap-5 border-b py-5" style={{ borderColor: LINEA }}>
              <span className="legado-editorial w-8 shrink-0 text-[2.6rem] leading-none" style={{ color: BRONCE }}>
                {i + 1}
              </span>
              <p className="legado-editorial text-[1.2rem]" style={{ color: "var(--text-secondary)" }}>
                <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {titulo}:
                </strong>{" "}
                {texto}
              </p>
            </li>
          ))}
        </ol>
        <p className="legado-editorial mt-6 text-[1.15rem]" style={{ color: "var(--text-secondary)" }}>
          <strong className="font-semibold" style={{ color: ORO }}>
            Criterio comercial adicional:
          </strong>{" "}
          {CRITERIO_COMERCIAL_LEGADO}
        </p>
      </div>

      <div className="lg:border-l lg:pl-12" style={{ borderColor: LINEA }}>
        <Candidatos lista={CANDIDATOS_LEGADO} />

        {/* Resumen */}
        <div className="mt-2 max-w-[520px] px-6 py-6" style={{ backgroundColor: "var(--bg-surface-dark)" }}>
          <h3 className="legado-titulo text-[1.2rem]">Resumen</h3>
          <Linea className="mt-3" color={BRONCE} />
          <ul className="legado-editorial mt-4 grid grid-cols-1 gap-x-10 text-[1.1rem] sm:grid-cols-2">
            {RESUMEN_LEGADO.filas.map(([nombre, n]) => (
              <li key={nombre} className="flex justify-between gap-4 py-0.5" style={{ color: "var(--text-secondary)" }}>
                <span>{nombre}</span>
                <span style={{ color: "var(--text-primary)" }}>{n}</span>
              </li>
            ))}
          </ul>
          <Linea className="mt-4" color={LINEA} />
          <p className="legado-titulo mt-3 flex justify-between text-[1.2rem]" style={{ color: ORO }}>
            <span>Total</span>
            <span>{RESUMEN_LEGADO.total}</span>
          </p>
        </div>
      </div>
    </div>

    <Linea className="mt-12" />
    <div className="legado-editorial mt-6 grid grid-cols-1 gap-6 text-[1.1rem] sm:grid-cols-2" style={{ color: "var(--text-secondary)" }}>
      <p>
        <strong className="font-semibold" style={{ color: ORO }}>Objetivo editorial:</strong> {OBJETIVOS_LEGADO.editorial}
      </p>
      <p className="sm:border-l sm:pl-6" style={{ borderColor: LINEA }}>
        <strong className="font-semibold" style={{ color: ORO }}>Objetivo comercial:</strong> {OBJETIVOS_LEGADO.comercial}
      </p>
    </div>
  </section>
);

// ───── Slide 3 ─────
export const SeleccionVanguardia = () => (
  <section className="mt-20 w-full text-left">
    <Encabezado
      marca="NORESTE: VANGUARDIA · MEDIA KIT · LIBRO 2"
      titulo="Selección por invitación"
      destacado="40"
      resto="grupos y marcas de innovación gastronómica de Nuevo León. Solo 25 lugares disponibles."
      intro="Candidaturas para NORESTE: VANGUARDIA, el libro de las propuestas que están transformando la escena gastronómica."
    />

    <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,330px)_1fr]">
      <div>
        <h3 className="legado-titulo text-[1.5rem]">Selección editorial</h3>
        <Linea className="mt-3 max-w-[90px]" color={ORO} />
        <ul className="mt-6">
          {SELECCION_VANGUARDIA.map(({ numero, etiqueta }) => (
            <li key={etiqueta} className="flex items-center gap-6 border-b py-5" style={{ borderColor: LINEA }}>
              <span className="legado-editorial w-16 shrink-0 text-[3rem] leading-none" style={{ color: BRONCE }}>
                {numero}
              </span>
              <span className="legado-editorial text-[1.2rem]" style={{ color: "var(--text-secondary)" }}>
                {etiqueta}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="legado-titulo mt-10 text-[1.1rem]">Participación por invitación</h3>
        <p className="legado-editorial mt-3 text-[1.15rem]" style={{ color: "var(--text-secondary)" }}>
          Residente invitará a 25 protagonistas de la innovación gastronómica de NL. No es una convocatoria abierta.
        </p>

        <Linea className="mt-8" color={BRONCE} />
        <h3 className="legado-titulo mt-6 text-[1.1rem]">Inversión por restaurante</h3>
        <p className="legado-titulo mt-2 text-[2rem]" style={{ color: ORO }}>
          $100,000 MXN
        </p>
        <p className="legado-editorial mt-1 text-[1.1rem]" style={{ color: "var(--text-secondary)" }}>
          25 participaciones: $2,500,000 brutos.
        </p>
      </div>

      <div className="lg:border-l lg:pl-12" style={{ borderColor: LINEA }}>
        <Candidatos lista={CANDIDATOS_VANGUARDIA} />
      </div>
    </div>

    <Linea className="mt-12" />
    <p className="legado-editorial mt-6 text-[1.1rem]" style={{ color: "var(--text-secondary)" }}>
      <strong className="font-semibold" style={{ color: ORO }}>Objetivo editorial:</strong> 25 protagonistas de la innovación gastronómica de Nuevo León.
    </p>
  </section>
);

// ───── Slides 4 a 7 ─────
export const CanastoDeValor = () => (
  <>
    {CANASTO.map(({ etiqueta, titulo, tituloDorado, imagen, ancho, alto, maxAncho, alt, items }) => (
      <section
        key={titulo}
        className="mt-20 grid w-full grid-cols-1 items-center gap-10 text-left md:grid-cols-2 md:gap-0"
      >
        <img
          src={`${import.meta.env.BASE_URL}legado/${imagen}`}
          alt={alt}
          width={ancho}
          height={alto}
          loading="lazy"
          decoding="async"
          style={{ maxWidth: maxAncho || 560 }}
          className="mx-auto h-auto w-full md:pr-10"
        />

        <div className="md:border-l md:pl-12" style={{ borderColor: BRONCE }}>
          <Marca>{etiqueta}</Marca>
          <Linea className="mt-3 max-w-[56px]" color={ORO} />
          <h2 className="legado-editorial mt-5 text-[2.6rem] font-medium leading-[1.05] sm:text-[3.4rem]">
            {titulo}
            {tituloDorado && (
              <>
                <br />
                <span style={{ color: ORO }}>{tituloDorado}</span>
              </>
            )}
          </h2>
          <ol className="mt-8">
            {items.map((texto, i) => (
              <li key={texto} className="flex items-baseline gap-5 border-t py-4 first:border-t-0" style={{ borderColor: LINEA }}>
                <span className="legado-editorial w-10 shrink-0 text-[1.9rem] leading-none" style={{ color: BRONCE }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="legado-editorial text-[1.2rem] leading-snug sm:text-[1.3rem]">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    ))}
  </>
);

// ───── Arquitectura editorial ─────
const ICONOS_APARECE = [FaRegUser, FaRegImage, FaRegFileAlt, FaPenNib, null];

export const ArquitecturaEditorial = () => (
  <section
    className="mt-20 ml-[calc(50%-50vw)] w-screen self-start px-6 py-14 text-center sm:px-12"
    style={{ backgroundColor: "#F9F8F6", color: "#161616" }}
  >
    <div className="mx-auto w-full max-w-[1200px]">
    <h2 className="legado-titulo text-[1.9rem] leading-tight tracking-[0.18em] sm:text-[2.8rem]">
      Arquitectura editorial
    </h2>
    <p className="legado-editorial mt-3 text-[1.3rem] italic sm:text-[1.6rem]" style={{ color: "#6B6760" }}>
      Así participará cada restaurante en sus 10 páginas dentro del libro
    </p>

    <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2">
      {ARQUITECTURA.map(({ paginas, titulo, texto, imagen, alto }, i) => (
        <figure key={paginas} className={i === ARQUITECTURA.length - 1 ? "md:col-span-2 md:mx-auto md:w-[calc(50%-0.75rem)]" : ""}>
          <img
            src={imagen}
            alt={`${paginas}: ${titulo}`}
            width="1500"
            height={alto}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
          <figcaption className="mt-5">
            <p className="legado-ui flex items-center justify-center gap-4 text-[0.95rem] tracking-[0.3em]">
              <span className="hidden h-px w-10 sm:block" style={{ backgroundColor: BRONCE }} />
              {paginas} — {titulo}
            </p>
            <p className="legado-editorial mt-3 text-[1.35rem] italic leading-snug" style={{ color: "#6B6760" }}>
              {texto}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>

    {/* Cada restaurante aparecerá con */}
    <Linea className="mt-14" color={BRONCE} />
    <div className="mt-10 flex flex-col items-center gap-10">
      <p className="legado-ui tracking-[0.3em]">Cada restaurante aparecerá con:</p>
      <ul className="grid w-full grid-cols-2 items-start gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {APARECERA_CON.map((etiqueta, i) => {
          const Icono = ICONOS_APARECE[i];
          return (
            <li key={etiqueta} className="flex flex-col items-center gap-3 text-center">
              {Icono ? (
                <Icono className="h-7 w-7 shrink-0" style={{ color: BRONCE }} />
              ) : (
                <span className="legado-editorial w-7 shrink-0 text-center text-[2rem] italic leading-none" style={{ color: BRONCE }}>
                  K
                </span>
              )}
              <span className="legado-ui leading-snug tracking-[0.12em]">{etiqueta}</span>
            </li>
          );
        })}
      </ul>
    </div>
    <p className="legado-ui mt-8 text-left text-[0.6rem] tracking-[0.15em]" style={{ color: "#6B6760" }}>
      Maqueta ilustrativa · retratos, interiores y fachada por validar con Koli
    </p>
    </div>
  </section>
);
