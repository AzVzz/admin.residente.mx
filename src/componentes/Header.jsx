import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { catalogoHeadersGet } from "./api/catalogoSeccionesGet";
import { imgApi } from "./api/url";
import { revistaGetUltima } from "./api/revistasGet";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaEnvelope,
  FaTimes,
  FaBars,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from "./Context";

const MEGAMENU_COLUMNAS = [
  "minmax(min-content, 135px)",
  "minmax(min-content, 160px)",
  "minmax(min-content, 135px)",
  "minmax(min-content, 125px)",
  "minmax(min-content, 130px)",
  "minmax(min-content, 130px)",
  "minmax(min-content, 175px)",
];

const MEGAMENU_TITULOS = {
  "Directorio gastronómico zonal": ["DIRECTORIOS", "GASTRONÓMICOS", "ZONAL"],
  "Directorio restaurantero tipo de comida": ["DIRECTORIOS", "RESTAURANTEROS", "TIPO DE COMIDA"],
  "Directorio restaurantero por precio": ["DIRECTORIOS", "RESTAURANTERO", "POR PRECIO"],
  "Directorio de alimentos y bebidas": ["DIRECTORIOS", "DE ALIMENTOS", "Y BEBIDAS"],
  "Directorio de información útil": ["DIRECTORIOS", "DE INFORMACIÓN", "ÚTIL"],
  "Directorio de rutas gastronómicas": ["DIRECTORIOS", "DE RUTAS", "GASTRONÓMICAS"],
  "Directorios de rutas gastronómicas": ["DIRECTORIOS", "DE RUTAS", "GASTRONÓMICAS"],
};

const ABRIR_NUEVA_PESTANA = [
  "Misión", "Rostros detrás del sabor", "Platillos icónicos de Nuevo León", "Anúnciate", "Anunciate",
];

const splitNL = (nombre) => {
  const m = nombre.match(/^(.+)\s+(de Nuevo León|en Nuevo León|por Nuevo León)$/i);
  return m ? { base: m[1] } : null;
};

const toSlug = (str) => str.replace(/\s+/g, "-").toLowerCase();

// ─── ProfileMenu ───
const ProfileMenu = ({ fondoOscuro = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { usuario, logout } = useAuth();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "https://residente.mx";
  };

  const isB2B = usuario?.rol?.toLowerCase() === "b2b";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${fondoOscuro ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"} text-sm font-medium flex items-center gap-1`}
        style={{ fontSize: "14px" }}
        aria-label="Menú de perfil"
      >
        {usuario ? usuario.nombre_usuario?.toUpperCase() : "LOGIN / REGISTRO"}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg border border-gray-200 py-1 z-50">
          {usuario ? (
            <>
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-bold text-sm truncate">{usuario.nombre_usuario?.toUpperCase()}</p>
                <p className="text-xs text-gray-500 capitalize">{usuario.rol}</p>
              </div>
              {isB2B ? (
                <Link to="/dashboardb2b" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Dashboard B2B</Link>
              ) : (
                <Link to="/dashboard" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Mi Dashboard</Link>
              )}
              {((usuario.rol === "residente" && usuario.permisos === "todos") ||
                (usuario.rol === "vendedor" && usuario.permisos === "vendedor")) && (
                <a href="/admin/registrob2b" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Registro B2B</a>
              )}
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <a href="/admin/registro" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Inicia sesión</a>
              <a href="/admin/registroinvitados" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Registro Invitados</a>
              <a href="/admin/registrocolaboradores" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Registro Colaboradores</a>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Header principal ───
const Header = () => {
  const { usuario } = useAuth();
  const location = useLocation();
  const [menuHeader, setMenuHeader] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ultimaRevista, setUltimaRevista] = useState(null);
  const [openMegaSlug, setOpenMegaSlug] = useState(null);
  const [clickLocked, setClickLocked] = useState(false);
  const [megaPos, setMegaPos] = useState({ top: 0, left: 0, width: 0 });
  const [langOpen, setLangOpen] = useState(false);
  const yellowBarRef = useRef(null);
  const langRef = useRef(null);
  const megaCloseTimer = useRef(null);

  const scheduleMegaClose = () => {
    megaCloseTimer.current = setTimeout(() => {
      if (!clickLocked) setOpenMegaSlug(null);
    }, 120);
  };

  const cancelMegaClose = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
  };

  useEffect(() => {
    catalogoHeadersGet().then(setMenuHeader).catch(() => setMenuHeader([]));
    revistaGetUltima().then(setUltimaRevista).catch(() => setUltimaRevista(null));
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileMenuOpen]);

  // Cerrar dropdown de idioma al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cerrar megamenú al click fuera o Escape
  useEffect(() => {
    if (!openMegaSlug) return;
    const onKey = (e) => {
      if (e.key === "Escape") { setOpenMegaSlug(null); setClickLocked(false); }
    };
    const onClick = (e) => {
      if (!e.target.closest(`[data-mega-slug="${openMegaSlug}"]`)) {
        setOpenMegaSlug(null);
        setClickLocked(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [openMegaSlug]);

  const updateMegaPos = () => {
    if (yellowBarRef.current) {
      const r = yellowBarRef.current.getBoundingClientRect();
      setMegaPos({ top: r.bottom, left: r.left, width: r.width });
    }
  };

  const handleBannerClick = () => {
    if (window.gtag) window.gtag("event", "click", { event_category: "Banner", event_label: "Lucia", value: 1 });
  };

  // Construir menuData con las mismas transformaciones que el Astro original
  const menuData = menuHeader.map((section) => {
    if (section.seccion === "Eventos" || section.seccion === "eventos") {
      return { ...section, url: "/eventos", submenu: undefined };
    }
    if (section.submenu) {
      if (section.seccion === "Residente") {
        return {
          ...section,
          submenu: section.submenu
            .filter((item) => item.nombre !== "Input OpEd")
            .map((item) => item.nombre === "Nuestros medios" ? { ...item, url: "/medios-de-comunicacion" } : item),
        };
      }
      if (section.seccion === "Información") {
        return {
          ...section,
          submenu: section.submenu.filter(
            (item) => item.nombre !== "Gastro-Destinos" && item.nombre !== "Gastro-destinos"
          ),
        };
      }
    }
    return section;
  });

  // Separar links principales de Anunciate/Banner-Tienda (van junto a los iconos)
  const mainMenu = menuData.filter((s) => s.seccion !== "Anunciate" && s.seccion !== "Banner-Tienda");
  const extraLinks = menuData.filter((s) => s.seccion === "Anunciate" || s.seccion === "Banner-Tienda");

  const isB2B = location.pathname.startsWith("/b2b") || usuario?.rol?.toLowerCase() === "b2b";

  return (
    <header className="w-full">
      {/* ════════════ MOBILE ════════════ */}
      <div className="sm:hidden">
        <div className="bg-[#fff200] flex items-center justify-between px-4 py-3">
          <button onClick={() => setMobileMenuOpen(true)} className="text-black p-1" aria-label="Abrir menú">
            <FaBars className="w-6 h-6" />
          </button>
          <a href="https://residente.mx" className="flex items-center gap-2">
            <img
              src={`${imgApi}fotos/fotos-estaticas/residente-logos/negros/logo-r-residente-negro.webp`}
              alt="Logo Residente"
              className="h-8 w-8 rounded-full"
            />
            <span className="text-black font-bold text-sm">Residente. Food&Drink Media</span>
          </a>
          <div className="w-6" />
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#fff200] p-4 flex items-center justify-between">
                <span className="font-bold text-black">Menú</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-black p-1" aria-label="Cerrar menú">
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4">
                <ul className="space-y-3">
                  {mainMenu.map((section, idx) => (
                    <li key={idx}>
                      {section.url ? (
                        <a
                          href={section.url}
                          className="block text-black font-semibold py-2 hover:text-gray-600"
                          target={section.url.startsWith("http") ? "_blank" : undefined}
                          rel={section.url.startsWith("http") ? "noopener noreferrer" : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {section.seccion === "Entrevista" ? "Entrevistas" : section.seccion}
                        </a>
                      ) : (
                        <div>
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === idx ? null : idx)}
                            className="w-full text-left text-black font-semibold py-2 hover:text-gray-600 flex justify-between items-center"
                          >
                            {section.seccion}
                            <span className={`text-xs transition-transform ${activeDropdown === idx ? "rotate-180" : ""}`}>▼</span>
                          </button>
                          {activeDropdown === idx && (
                            <ul className="ml-4 mt-1 space-y-1">
                              {(section.submenu || section.megamenu?.flatMap((c) => c.items) || []).map((item, subIdx) => (
                                <li key={subIdx}>
                                  <a
                                    href={item.url}
                                    className="block text-gray-600 py-1 hover:text-black text-sm"
                                    target={item.url?.startsWith("http") ? "_blank" : undefined}
                                    rel={item.url?.startsWith("http") ? "noopener noreferrer" : undefined}
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {item.nombre === "Antojos" ? "Antojeria" : item.nombre}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                  <li className="border-t pt-4">
                    <ProfileMenu fondoOscuro={false} />
                  </li>
                </ul>
                <div className="mt-6 pt-4 border-t">
                  <p className="text-gray-500 text-sm mb-3">Síguenos</p>
                  <div className="flex gap-4">
                    <a href="http://instagram.com/residentemty" target="_blank" rel="noopener noreferrer"><FaInstagram className="w-6 h-6 text-black" /></a>
                    <a href="http://facebook.com/residentemx" target="_blank" rel="noopener noreferrer"><FaFacebookF className="w-6 h-6 text-black" /></a>
                    <a href="http://youtube.com/@revistaresidente5460" target="_blank" rel="noopener noreferrer"><FaYoutube className="w-6 h-6 text-black" /></a>
                    <a href="tel:+528114186985" target="_blank" rel="noopener noreferrer"><FaWhatsapp className="w-6 h-6 text-black" /></a>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* ════════════ DESKTOP ════════════ */}
      <div className="hidden sm:block">
        <div className="max-w-[1080px] mx-auto w-full">
          {/* Banner superior */}
          <div className="pt-8 relative z-30">
            {location.pathname === "/heybanco" ? (
              <a>
                <img src="https://residente.mx/fotos/fotos-estaticas/BANNER HeyBanco.webp" alt="Banner HeyBanco" />
              </a>
            ) : ultimaRevista?.imagen_banner ? (
              <a href={ultimaRevista.pdf || "#"} target="_blank" rel="noopener noreferrer" onClick={handleBannerClick}>
                <img src={ultimaRevista.imagen_banner} alt={ultimaRevista.titulo || "Banner Principal"} />
              </a>
            ) : null}
          </div>

          <div className="flex pb-0 pt-8">
            {/* Logo R */}
            <div className="flex pr-3">
              <a href="https://residente.mx" className="h-16 w-16 self-end object-contain rounded-full" aria-label="Ir a inicio (Logo R)" title="Ir a inicio">
                <img
                  src={isB2B
                    ? `${imgApi}fotos/fotos-estaticas/residente-logos/amarillos/R%20AMARILLA.png`
                    : `${imgApi}fotos/fotos-estaticas/residente-logos/negros/logo-r-residente-negro.webp`}
                  alt="Logo Residente R"
                  className="h-16 w-16 self-end object-contain rounded-full"
                />
              </a>
            </div>

            <div className="w-full relative">
              {/* ProfileMenu arriba derecha */}
              <div className="absolute top-3 right-0 z-50">
                <ProfileMenu fondoOscuro={isB2B} />
              </div>

              <div className="grid grid-cols-[87%_13%] pb-[8px]">
                <div className="flex sm:flex-col gap-2">
                  <div className="flex flex-1 w-full justify-end items-start">
                    <div className="flex flex-col pr-2" />
                  </div>
                  <div className="flex items-start gap-1">
                    <a href="https://residente.mx" className="flex" aria-label="Ir a inicio (Texto)" title="Ir a inicio">
                      <img
                        src={isB2B
                          ? `${imgApi}fotos/fotos-estaticas/residente-logos/blancos/Residente-FOOD-AND-DRINK-MEDIA.png`
                          : `${imgApi}fotos/fotos-estaticas/componente-sin-carpetas/food-drink-media-logo-negro.png`}
                        alt="ResidenteNegro"
                        className="h-6 object-contain"
                      />
                    </a>
                    <span className={`font-roman text-[9px] font-bold leading-none uppercase tracking-tighter ${isB2B ? "text-white" : "text-black"}`}>EST. 2015</span>
                  </div>
                </div>
              </div>

              {/* Barra Amarilla */}
              <div className="flex flex-col flex-1">
                <div
                  ref={yellowBarRef}
                  className="flex justify-between items-center px-2 -ml-[6px] w-[calc(100%+6px)] py-0 bg-[#fff200] h-[24px]"
                >
                  {/* Links del menú principal */}
                  <div className="flex gap-1 sm:gap-4 items-center sm:text-[13px] text-[10px] font-semibold">
                    {mainMenu.map((section, idx) => {
                      const slug = toSlug(section.seccion);

                      if (section.url) {
                        return (
                          <a
                            key={idx}
                            href={section.url}
                            className="hover:underline text-black font-roman"
                            title={section.seccion}
                            target={section.url.startsWith("http") || ABRIR_NUEVA_PESTANA.includes(section.seccion) ? "_blank" : undefined}
                            rel={section.url.startsWith("http") || ABRIR_NUEVA_PESTANA.includes(section.seccion) ? "noopener noreferrer" : undefined}
                          >
                            {section.seccion === "Entrevista" ? "Entrevistas" : section.seccion}
                          </a>
                        );
                      }

                      return (
                        <div
                          key={idx}
                          className="relative group"
                          data-mega-slug={section.megamenu ? slug : undefined}
                          onMouseEnter={() => { if (section.megamenu) { cancelMegaClose(); if (!clickLocked) { updateMegaPos(); setOpenMegaSlug(slug); } } }}
                          onMouseLeave={() => { if (section.megamenu && !clickLocked) scheduleMegaClose(); }}
                        >
                          <button
                            className="hover:underline text-black font-roman cursor-pointer bg-transparent border-0 p-0 m-0 leading-[inherit]"
                            onClick={() => {
                              if (section.megamenu) {
                                if (openMegaSlug === slug && clickLocked) {
                                  setOpenMegaSlug(null);
                                  setClickLocked(false);
                                } else {
                                  updateMegaPos();
                                  setOpenMegaSlug(slug);
                                  setClickLocked(true);
                                }
                              } else {
                                setActiveDropdown(activeDropdown === idx ? null : idx);
                              }
                            }}
                          >
                            {section.seccion}
                          </button>

                          {/* Megamenú (position fixed, ancho completo de la barra) */}
                          {section.megamenu && openMegaSlug === slug && (
                            <div
                              className="fixed bg-gray-900/90 border-x border-b border-gray-700 rounded-b shadow-2xl z-50 backdrop-blur-sm px-1 py-4"
                              style={{ top: megaPos.top, left: megaPos.left, width: megaPos.width }}
                              data-mega-slug={slug}
                              onMouseEnter={() => { cancelMegaClose(); if (!clickLocked) { updateMegaPos(); setOpenMegaSlug(slug); } }}
                              onMouseLeave={() => { if (!clickLocked) scheduleMegaClose(); }}
                            >
                              <div className="grid" style={{ gridTemplateColumns: MEGAMENU_COLUMNAS.join(" ") }}>
                                {section.megamenu.map((col, colIdx) => (
                                  <div key={colIdx} className="border-r border-gray-700/50 last:border-r-0 px-2">
                                    <h3 className="text-[#fff200] text-[11px] font-bold uppercase tracking-wide mb-0 leading-tight px-1">
                                      {MEGAMENU_TITULOS[col.titulo]
                                        ? MEGAMENU_TITULOS[col.titulo].map((line, i) => (
                                            <span key={i}>{i > 0 && <br />}{line}</span>
                                          ))
                                        : col.titulo}
                                    </h3>
                                    {col.items.length > 0 ? (
                                      <ul className="mt-2">
                                        {col.items.map((item, itemIdx) => {
                                          const nl = splitNL(item.nombre);
                                          return (
                                            <li key={itemIdx}>
                                              {item.url ? (
                                                <a
                                                  href={item.url}
                                                  className="block px-1 py-1 text-white hover:bg-gray-700/60 text-[13px] cursor-pointer font-roman leading-snug"
                                                  title={item.nombre}
                                                  onClick={() => { setOpenMegaSlug(null); setClickLocked(false); }}
                                                >
                                                  {nl ? nl.base : item.nombre}
                                                </a>
                                              ) : (
                                                <span className="block px-1 py-1 text-gray-400 text-[13px] font-roman leading-snug">
                                                  {nl ? nl.base : item.nombre}
                                                </span>
                                              )}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    ) : (
                                      <p className="text-gray-500 text-xs italic px-3 mt-2">Próximamente</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Submenú desplegable regular */}
                          {section.submenu && (
                            <div
                              className={`absolute -left-2 top-full bg-gray-900/75 border border-gray-700 rounded-b shadow-lg z-50 transition-all duration-150 backdrop-blur-sm flex flex-col min-w-[200px] ${
                                activeDropdown === idx
                                  ? "opacity-100 visible"
                                  : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                              }`}
                            >
                              <ul role="menu">
                                {section.submenu
                                  .filter((item) => !item.url?.includes("cultura-de-la-carne"))
                                  .map((item, subIdx) => (
                                    <li key={subIdx}>
                                      <a
                                        href={item.url}
                                        className="block px-4 py-2 text-white hover:bg-gray-800/70 text-sm cursor-pointer font-roman whitespace-nowrap"
                                        role="menuitem"
                                        title={item.nombre}
                                        target={ABRIR_NUEVA_PESTANA.includes(item.nombre) ? "_blank" : undefined}
                                        rel={ABRIR_NUEVA_PESTANA.includes(item.nombre) ? "noopener noreferrer" : undefined}
                                        onClick={() => setActiveDropdown(null)}
                                      >
                                        {item.nombre === "Antojos" ? "Antojeria" : item.nombre === "Entrevista" ? "Entrevistas" : item.nombre}
                                      </a>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Lado derecho: Anunciate + iconos + idioma */}
                  <div className="hidden sm:flex gap-1.5 items-center relative">
                    {/* Anunciate / Banner-Tienda */}
                    {extraLinks.length > 0 && (
                      <div className="flex items-center gap-4 mr-1">
                        {extraLinks.map((section, idx) => (
                          <a
                            key={idx}
                            href={section.url}
                            className="hover:underline text-black font-roman sm:text-[13px] text-[10px] font-semibold"
                            title={section.seccion}
                            target={section.url?.startsWith("http") ? "_blank" : undefined}
                            rel={section.url?.startsWith("http") ? "noopener noreferrer" : undefined}
                          >
                            {section.seccion}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Iconos sociales */}
                    <a href="https://residente.mx/b2b">
                      <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/negros/b2b.webp`} className="object-contain h-4 w-12" alt="B2B" />
                    </a>
                    <a href="http://instagram.com/residentemty" target="_blank" rel="noopener noreferrer"><FaInstagram className="w-4 h-4 text-black hover:text-gray-400" /></a>
                    <a href="http://facebook.com/residentemx" target="_blank" rel="noopener noreferrer"><FaFacebookF className="w-4 h-4 text-black hover:text-gray-400" /></a>
                    <a href="http://youtube.com/@revistaresidente5460" target="_blank" rel="noopener noreferrer"><FaYoutube className="w-4 h-4 text-black hover:text-gray-400" /></a>
                    <a href="https://x.com/Residente_mty" target="_blank" rel="noopener noreferrer"><FaXTwitter className="w-4 h-4 text-black hover:text-gray-400" /></a>
                    <a href="https://www.linkedin.com/company/residente/" target="_blank" rel="noopener noreferrer"><FaLinkedin className="w-4 h-4 text-black hover:text-gray-400" /></a>
                    <a href="tel:+528114186985" target="_blank" rel="noopener noreferrer"><FaWhatsapp className="w-4 h-4 text-black hover:text-gray-400" /></a>
                    <a href="mailto:contacto@residente.mx?subject=%C2%A1Quiero%20mas%20informaci%C3%B3n%20de%20Residente!"><FaEnvelope className="w-4 h-4 text-black hover:text-gray-400" /></a>

                    {/* Separador + dropdown idioma */}
                    <span className="text-black/30 text-sm select-none">|</span>
                    <div ref={langRef} className="relative">
                      <button
                        onClick={() => setLangOpen(!langOpen)}
                        className="flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 hover:scale-110 transition-transform"
                        aria-label="Cambiar idioma"
                        title="Cambiar idioma"
                      >
                        <img src="https://flagcdn.com/w40/mx.png" alt="Idioma" className="w-5 h-auto rounded-sm" />
                        <svg
                          className={`w-3 h-3 text-black/60 transition-transform ${langOpen ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {langOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left" onClick={() => setLangOpen(false)}>
                            <img src="https://flagcdn.com/w40/mx.png" alt="Español" className="w-5 h-auto rounded-sm" />
                            Español
                          </button>
                          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left" onClick={() => setLangOpen(false)}>
                            <img src="https://flagcdn.com/w40/us.png" alt="English" className="w-5 h-auto rounded-sm" />
                            English
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
