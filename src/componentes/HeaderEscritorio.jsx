import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { imgApi, urlApi } from "./api/url";
import {
  MENU_DATA,
  MEGAMENU_COLUMNAS,
  MEGAMENU_TITULOS,
  MENU_CATEGORIAS,
  MENU_SECCIONES,
  ABRIR_EN_NUEVA_PESTANA,
  quitarSufijoNL,
} from "./headerMenuData";

// Header de escritorio nuevo: es el mismo diseño que el de astro.residente.mx
// (src/sections/Header.astro). El móvil sigue en Header.jsx.

const LOGO_RESIDENTE = `${imgApi}fotos/fotos-estaticas/dashboard/logo-residentemx-99-99-1784043105447.webp`;
const LOGO_RESIDENTE_BLANCO = `${imgApi}fotos/fotos-estaticas/dashboard/logo-residentemx-99-100-1-1784043141368.webp`;
const LOGO_R = `${imgApi}fotos/fotos-estaticas/dashboard/LOGO-R-RESIDENTE-NEGRO-1784051489505.webp`;
// R blanca (círculo blanco con la R negra) para el header oscuro de la landing de Legado.
const LOGO_R_BLANCO = `${imgApi}fotos/fotos-estaticas/dashboard/R_Residente-1795273462936.webp`;
const LOGO_B2B = `${imgApi}fotos/fotos-estaticas/residente-logos/negros/b2b.webp`;

// Franja de marcas de arriba (Vivir&Convivir, B2B, Sur de Texas...). Mismas
// imágenes y medidas que HomeBrandStrip.astro del sitio público.
const MARCAS = [
  {
    nombre: "Vivir & Convivir",
    href: "https://residente.mx/eventos-colaboradores",
    imagen: "vivir-y-convivir.png",
    clase: "w-[172.216px] -ml-[1.5665px] -mr-[2.5455px]",
  },
  {
    nombre: "Residente B2B",
    href: "https://residente.mx/b2b",
    imagen: "b2b-hd.png",
    clase: "w-[117.8px] -ml-[18.4944px] -mr-[18.874px]",
  },
  {
    nombre: "Sur de Texas",
    href: "https://residente.mx/seccion/sur-de-texas",
    imagen: "sur-de-texas-hd.png",
    clase: "w-[125.4px] -ml-[1.963px] -mr-[1.0392px]",
  },
  {
    nombre: "Taquerías Icónicas de Nuevo León",
    href: "https://residente.mx/taquerias",
    imagen: "taquerias-v2.png",
    clase: "w-[148.1544px] -ml-[1.9847px] -mr-[3.5608px]",
  },
  {
    nombre: "Ruta de Cantinas de Nuevo León",
    href: "https://residente.mx/#buscador-cantinas",
    imagen: "ruta-de-cantinas-v2.png",
    clase: "w-[187.986px] -ml-[1.2981px] -mr-[1.693px]",
  },
];

const FranjaMarcas = () => (
  <nav
    aria-label="Medios de Residente"
    className="overflow-x-auto border-b border-black/15 bg-[#DDDDDE] px-4 pb-[5px] pt-[5px]"
  >
    <ul className="mx-auto flex h-14 w-full min-w-max max-w-[1200px] items-center justify-between gap-4">
      {MARCAS.map(({ nombre, href, imagen, clase }, i) => (
        <li key={nombre} className="contents">
          <a
            href={href}
            aria-label={nombre}
            className="flex h-11 shrink-0 items-center justify-center mix-blend-darken transition-opacity hover:opacity-65"
          >
            <img
              src={`${imgApi}images/home-brands/${imagen}`}
              alt={nombre}
              className={`block h-auto max-w-none shrink-0 object-contain ${clase}`}
              loading="eager"
              decoding="async"
            />
          </a>
          {i < MARCAS.length - 1 && <span aria-hidden="true" className="h-11 w-px shrink-0 bg-black/20" />}
        </li>
      ))}
    </ul>
  </nav>
);

const IconoLupa = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Lupa que se despliega hacia la izquierda y sugiere búsquedas. Al dar Enter
// abre la página de resultados del sitio (residente.mx/buscar).
const BuscadorLupa = ({ claro = false }) => {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const cajaRef = useRef(null);
  const inputRef = useRef(null);

  const buscar = (consulta) => {
    const q = consulta.trim();
    if (q) window.location.href = `${imgApi}buscar?q=${encodeURIComponent(q)}`;
  };

  useEffect(() => {
    if (!abierto) return undefined;
    inputRef.current?.focus();
    const fuera = (e) => {
      if (cajaRef.current && !cajaRef.current.contains(e.target)) setAbierto(false);
    };
    const tecla = (e) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  useEffect(() => {
    if (texto.trim().length < 2) {
      setSugerencias([]);
      return undefined;
    }
    let vivo = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${urlApi}api/buscar/autocomplete?q=${encodeURIComponent(texto.trim())}&limit=5`,
        );
        const data = await res.json();
        if (vivo) setSugerencias(data.suggestions || []);
      } catch {
        if (vivo) setSugerencias([]);
      }
    }, 250);
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, [texto]);

  return (
    <div ref={cajaRef} className="relative flex items-center">
      <div
        className={`flex items-center rounded-full transition-[width] duration-300 ease-in-out ${
          abierto ? "w-[280px] bg-white" : "w-[34px] overflow-hidden"
        }`}
      >
        <button
          type="button"
          aria-label="Buscar"
          aria-expanded={abierto}
          onClick={() => setAbierto((v) => !v)}
          className={`flex h-[24px] w-[34px] shrink-0 cursor-pointer items-center justify-center ${
            abierto ? "text-[#111]" : claro ? "text-white" : "text-black"
          }`}
        >
          <IconoLupa />
        </button>
        {abierto && (
          <input
            ref={inputRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar(texto)}
            placeholder="Buscar..."
            className="w-[246px] shrink-0 border-0 bg-transparent pr-3 text-[13px] text-[#111] outline-none placeholder:text-gray-500"
          />
        )}
      </div>
      {abierto && sugerencias.length > 0 && (
        <ul className="absolute right-0 top-full z-[300] mt-1 w-[280px] rounded-lg bg-white py-1 text-left shadow-lg">
          {sugerencias.map((s) => (
            <li key={s.query}>
              <button
                type="button"
                onClick={() => buscar(s.query)}
                className="block w-full px-4 py-2 text-left text-[13px] text-[#111] hover:bg-gray-100"
              >
                {s.query}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const enlaceNavClase =
  "inline-flex w-fit items-center font-grotesk text-[10px] leading-[inherit] text-white/70 hover:text-[#fff200] md:text-[12px]";
const etiquetaNavClase =
  "relative z-50 flex shrink-0 items-center border-r border-white/30 pr-3 notranslate font-grotesk text-[10px] leading-[inherit] text-white md:text-[12px]";

const MegaDirectorios = ({ seccion }) => (
  <div className="absolute left-0 right-0 top-full z-[60] overflow-y-auto border-x border-b border-gray-700 bg-gray-900/95 px-1 py-5 shadow-2xl backdrop-blur-sm">
    <div className="grid justify-center" style={{ gridTemplateColumns: MEGAMENU_COLUMNAS.join(" ") }}>
      {seccion.megamenu.map((col) => (
        <div key={col.titulo} className="border-r border-gray-700/50 px-2 text-center last:border-r-0">
          <h3 className="mb-0 px-1 text-[11px] font-bold uppercase leading-tight tracking-wide text-[#fff200]">
            {MEGAMENU_TITULOS[col.titulo]
              ? MEGAMENU_TITULOS[col.titulo].map((linea, i) => (
                  <span key={linea}>
                    {i > 0 && <br />}
                    {linea}
                  </span>
                ))
              : col.titulo}
          </h3>
          <ul className="mt-2">
            {col.items.map((item) => (
              <li key={item.nombre}>
                {item.url ? (
                  <a
                    href={item.url}
                    title={item.nombre}
                    className="block px-1 py-1 text-center font-roman text-[13px] leading-snug text-white hover:bg-gray-700/60"
                  >
                    {quitarSufijoNL(item.nombre)}
                  </a>
                ) : (
                  <span className="block px-1 py-1 text-center font-roman text-[13px] leading-snug text-gray-400">
                    {quitarSufijoNL(item.nombre)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const PanelMenu = ({ cerrar }) => {
  const [idiomaAbierto, setIdiomaAbierto] = useState(false);
  const [directoriosAbierto, setDirectoriosAbierto] = useState(false);
  const directorios = MENU_DATA.find((s) => s.megamenu);

  return (
    <div
      role="navigation"
      aria-label="Sistema de navegación Residente"
      className="absolute left-0 top-full z-[200] mt-2 w-[min(1200px,calc(100vw-2rem))] text-left"
    >
      <div className="relative flex w-full flex-col gap-3 bg-[#111827] p-4 font-roman text-[11px] uppercase tracking-[0.18em] text-white shadow-2xl">
        {/* Idioma, logo, lema y búsqueda */}
        <div className="mt-2 flex w-full items-center justify-between gap-4 border-b border-white/15 px-2 pb-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative z-50 flex shrink-0 items-center border-r border-white/30 pr-3 notranslate" translate="no">
              <button
                type="button"
                onClick={() => setIdiomaAbierto((v) => !v)}
                className="flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 transition-transform hover:scale-110"
                aria-label="Cambiar idioma"
                title="Cambiar idioma"
              >
                <img src="https://flagcdn.com/w40/mx.png" alt="Idioma" className="h-auto w-5 rounded-sm" />
                <svg
                  className={`h-3 w-3 text-white/70 transition-transform ${idiomaAbierto ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {idiomaAbierto && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 text-black shadow-lg">
                  <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm normal-case tracking-normal hover:bg-gray-50" onClick={() => setIdiomaAbierto(false)}>
                    <img src="https://flagcdn.com/w40/mx.png" alt="Español" className="h-auto w-5 rounded-sm" />
                    Español
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm normal-case tracking-normal hover:bg-gray-50" onClick={() => setIdiomaAbierto(false)}>
                    <img src="https://flagcdn.com/w40/us.png" alt="English" className="h-auto w-5 rounded-sm" />
                    English
                  </button>
                </div>
              )}
            </div>
            <a href="https://residente.mx" aria-label="Ir al inicio de Residente" className="inline-flex shrink-0 items-center">
              <img src={LOGO_RESIDENTE_BLANCO} alt="Residente México" className="h-auto w-[116px]" width="148" height="40" />
            </a>
            <div className="flex min-w-0 items-center gap-0">
              <p className="translate-y-px whitespace-nowrap border-l border-white/30 px-2 font-grotesk text-[10px] uppercase leading-[1.35] tracking-[0.12em] md:text-[12px]">
                Desde 2015
              </p>
              <p className="max-w-[240px] translate-y-px whitespace-nowrap text-right font-roman text-[10px] uppercase leading-[1.35] tracking-[0.12em] text-white md:max-w-none md:text-[12px]">
                Toda la riqueza gastronómica de Nuevo León ordenada y en un solo lugar
              </p>
            </div>
          </div>
          <div className="relative ml-auto flex shrink-0 items-center">
            <BuscadorLupa claro />
          </div>
        </div>

        <nav
          aria-label="Categorías del sistema Residente"
          className="mt-2 flex min-h-9 flex-nowrap items-center justify-start gap-x-3 overflow-x-auto border-b border-white/15 px-2 pb-5 font-roman text-[11px] font-semibold uppercase tracking-[0.1em] sm:gap-x-5 md:text-[15px]"
        >
          <span className={etiquetaNavClase} translate="no">Menú</span>
          {MENU_CATEGORIAS.map((c) => (
            <a key={c.href} href={c.href} className={enlaceNavClase}>{c.label}</a>
          ))}
        </nav>

        <nav
          aria-label="Secciones del sistema Residente"
          className="relative mt-2 flex min-h-9 flex-wrap items-center justify-start gap-x-3 gap-y-2 border-b border-white/15 px-2 pb-5 font-roman text-[11px] font-semibold uppercase tracking-[0.1em] sm:gap-x-5 md:text-[15px]"
          onMouseLeave={() => setDirectoriosAbierto(false)}
        >
          <span className={etiquetaNavClase} translate="no">Secciones</span>
          {MENU_SECCIONES.map((s) =>
            s.megaMenu ? (
              <a
                key={s.label}
                href={s.href}
                className={enlaceNavClase}
                onMouseEnter={() => setDirectoriosAbierto(true)}
                onClick={(e) => {
                  e.preventDefault();
                  setDirectoriosAbierto((v) => !v);
                }}
              >
                {s.label}
              </a>
            ) : (
              <a key={s.label} href={s.href} className={enlaceNavClase}>{s.label}</a>
            ),
          )}
          {directoriosAbierto && directorios && <MegaDirectorios seccion={directorios} />}
        </nav>

        <nav
          aria-label="Soluciones para la industria"
          className="mt-2 flex min-h-9 items-center justify-start gap-x-3 border-b border-white/15 px-2 pb-5 font-roman text-[11px] font-semibold uppercase tracking-[0.1em] sm:gap-x-5 md:text-[15px]"
        >
          <a href="https://residente.mx/b2b" aria-label="Ir a B2B" title="B2B" className="flex shrink-0">
            <img src={LOGO_B2B} alt="B2B Residente" className="h-[10px] w-auto invert md:h-[12px]" />
          </a>
          <span className={etiquetaNavClase} translate="no">Soluciones para la industria</span>
          <a href="https://residente.mx/anunciate" className={`${enlaceNavClase} notranslate`}>Anúnciate</a>
          <a href="https://residente.mx/b2b" className={`${enlaceNavClase} notranslate`}>Estudios de mercado</a>
          <a href="/admin/banners" className={`${enlaceNavClase} notranslate`}>Banner-Tienda</a>
        </nav>

        {/* Secciones con sus submenús */}
        <div className="grid grid-cols-[repeat(5,max-content)] items-start justify-start gap-x-10 gap-y-2 px-2 text-[12px] font-semibold">
          {MENU_DATA.filter((s) => s.submenu).map((s) => (
            <div key={s.seccion}>
              <span className="flex items-center font-grotesk text-[10px] leading-[inherit] text-white md:text-[12px]">
                {s.seccion}
              </span>
              <ul role="menu" className="mt-2 flex flex-col border-l border-white/30">
                {s.submenu
                  .filter((item) => !item.url?.includes("cultura-de-la-carne"))
                  .map((item) => {
                    const nuevaPestana = ABRIR_EN_NUEVA_PESTANA.includes(item.nombre);
                    return (
                      <li key={item.nombre}>
                        <a
                          href={item.url}
                          role="menuitem"
                          title={item.nombre}
                          target={nuevaPestana ? "_blank" : undefined}
                          rel={nuevaPestana ? "noopener noreferrer" : undefined}
                          onClick={cerrar}
                          className="block cursor-pointer whitespace-nowrap py-[2px] pl-2 font-roman text-[10px] font-normal uppercase leading-[1.35] tracking-[0.12em] text-white/80 hover:text-white md:text-[11px]"
                        >
                          {item.nombre === "Antojos" ? "Antojeria" : item.nombre}
                        </a>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * @param {{ banner?: import("react").ReactNode, perfil: import("react").ReactNode, oscuro?: boolean }} props
 *   banner: banner superior (se muestra arriba del header grande)
 *   perfil: menú de perfil / login (arriba a la derecha)
 *   oscuro: versión negra (landing de Legado): fondo negro, logo y R blancos,
 *           menú y buscador blancos
 */
const HeaderEscritorio = ({ banner = null, perfil, oscuro = false }) => {
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [fijo, setFijo] = useState(false);
  const [altoReservado, setAltoReservado] = useState(0);

  const barraRef = useRef(null);
  const panelRef = useRef(null);
  const fijoRef = useRef(false);
  const topNaturalRef = useRef(0);
  const altoNaturalRef = useRef(0);

  // El menú se cierra al cambiar de página.
  useEffect(() => setMenuAbierto(false), [location.pathname]);

  // Cierra el panel con clic fuera o Escape.
  useEffect(() => {
    if (!menuAbierto) return undefined;
    const fuera = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setMenuAbierto(false);
    };
    const tecla = (e) => e.key === "Escape" && setMenuAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [menuAbierto]);

  // Barra pegajosa: al pasar de largo el header grande, queda fija arriba en
  // versión compacta; al regresar, se suelta. Igual que en el sitio público.
  useEffect(() => {
    const medir = () => {
      if (fijoRef.current || !barraRef.current) return;
      const r = barraRef.current.getBoundingClientRect();
      topNaturalRef.current = r.bottom + window.scrollY;
      altoNaturalRef.current = r.height;
    };
    const alScroll = () => {
      const y = window.scrollY;
      if (!fijoRef.current && y > topNaturalRef.current) {
        fijoRef.current = true;
        setAltoReservado(altoNaturalRef.current);
        setFijo(true);
      } else if (fijoRef.current && y <= topNaturalRef.current) {
        fijoRef.current = false;
        setFijo(false);
        requestAnimationFrame(medir);
      }
    };
    medir();
    const observador = new ResizeObserver(medir); // el banner carga su imagen después
    if (barraRef.current?.parentElement) observador.observe(barraRef.current.parentElement);
    window.addEventListener("resize", medir);
    window.addEventListener("load", medir);
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => {
      observador.disconnect();
      window.removeEventListener("resize", medir);
      window.removeEventListener("load", medir);
      window.removeEventListener("scroll", alScroll);
    };
  }, []);

  const botonMenu = (
    <div ref={panelRef} className="absolute left-0 top-[48px] z-50 flex items-center gap-2">
      <button
        type="button"
        onClick={() => setMenuAbierto((v) => !v)}
        aria-label="Abrir sistema de navegación Residente"
        aria-expanded={menuAbierto}
        className={`flex h-6 w-7 cursor-pointer items-center justify-start rounded transition-colors ${oscuro ? "text-white" : "text-black"}`}
      >
        {menuAbierto ? (
          <FaTimes className="h-6 w-6" />
        ) : (
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {menuAbierto && <PanelMenu cerrar={() => setMenuAbierto(false)} />}
    </div>
  );

  return (
    <header className={`relative z-40 hidden w-full sm:block ${oscuro ? "bg-[#080808]" : ""}`}>
      <div className="mx-auto w-full max-w-[1200px]">
        {location.pathname !== "/dashboard" && banner}
        {location.pathname !== "/dashboard" && <FranjaMarcas />}

        {fijo && <div aria-hidden="true" style={{ height: altoReservado }} />}

        <div
          ref={barraRef}
          className={
            fijo
              ? oscuro
                ? "fixed inset-x-0 top-0 z-40 bg-[#080808] shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
                : "fixed inset-x-0 top-0 z-40 bg-[#DDDDDD] shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
              : "flex pb-0 pt-5"
          }
        >
          <div className={`relative w-full ${fijo ? "mx-auto max-w-[1200px]" : ""}`}>
            {!fijo && (
              <div className={`absolute left-0 top-[76px] z-50 flex h-5 items-center text-left font-roman uppercase tracking-widest ${oscuro ? "text-white" : "text-black"}`}>
                <a
                  className={`inline-flex w-fit items-center gap-1 text-[9px] uppercase leading-[1] ${oscuro ? "text-white" : "text-black"}`}
                  href="https://residente.mx/anunciate"
                >
                  <span className="inline-block tracking-wide">Anúnciate</span>
                </a>
              </div>
            )}

            <div className={`grid grid-cols-1 pb-1 ${fijo && !oscuro ? "bg-[#fff200]" : ""}`}>
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex items-start justify-center">
                  <a href="https://residente.mx" className="flex" aria-label="Ir a inicio" title="Ir a inicio">
                    <img
                      src={oscuro ? LOGO_RESIDENTE_BLANCO : LOGO_RESIDENTE}
                      alt="Residente.mx"
                      className={`${fijo ? "h-10" : "h-17"} object-contain`}
                    />
                  </a>
                  <img
                    src={oscuro ? LOGO_R_BLANCO : LOGO_R}
                    alt="R Residente"
                    className="absolute left-full top-[20%] ml-1 h-6 w-6 -translate-y-[20%] object-contain"
                  />
                </div>
              </div>
            </div>

            {!fijo && (
              <span className="relative isolate z-0 mx-auto mt-1 block w-122 px-2 font-roman text-[10px] uppercase leading-none tracking-widest text-black">
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-1/2 -z-10 h-[1.55em] w-[calc(100%+1rem)] -translate-y-[65%]"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  style={{ transform: "skewX(-20deg)" }}
                >
                  <path d="M0 0 H100 V20 H0 Z" fill="#fff200" />
                </svg>
              </span>
            )}

            <div className="absolute right-0 top-[48px] z-50 flex flex-col items-end">
              <BuscadorLupa claro={oscuro} />
              <div className="mt-1 flex items-center font-sans normal-case leading-normal tracking-normal">
                {perfil}
              </div>
            </div>

            {botonMenu}

            {/* En la versión fija esta franja vacía conserva el alto de la barra */}
            {fijo && <div className="min-h-9 w-full" />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderEscritorio;
