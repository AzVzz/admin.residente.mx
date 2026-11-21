import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { catalogoHeadersGet } from "./api/catalogoSeccionesGet";
import { imgApi } from "./api/url";
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
import HeaderEscritorio from "./HeaderEscritorio";
import PerfilMenuEscritorio from "./PerfilMenuEscritorio";

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
  const location = useLocation();
  const [menuHeader, setMenuHeader] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    catalogoHeadersGet().then(setMenuHeader).catch(() => setMenuHeader([]));
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileMenuOpen]);

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

  // La landing de Legado usa el header en negro (igual que su fondo)
  const oscuro = location.pathname === "/registrob2b-legado";

  const mainMenu = menuData.filter((s) => s.seccion !== "Anunciate" && s.seccion !== "Banner-Tienda");

  return (
    <header className="w-full">
      {/* ════════════ MOBILE ════════════ */}
      <div className="sm:hidden">
        <div className={`${oscuro ? "bg-[#080808]" : "bg-[#fff200]"} flex items-center justify-between px-4 py-3`}>
          <button onClick={() => setMobileMenuOpen(true)} className={`${oscuro ? "text-white" : "text-black"} p-1`} aria-label="Abrir menú">
            <FaBars className="w-6 h-6" />
          </button>
          <a href="https://residente.mx" className="flex items-center gap-2">
            <img
              src={oscuro ? `${imgApi}fotos/fotos-estaticas/dashboard/R_Residente-1795273462936.webp` : `${imgApi}fotos/fotos-estaticas/residente-logos/negros/logo-r-residente-negro.webp`}
              alt="Logo Residente"
              className="h-8 w-8 rounded-full"
            />
            <span className={`${oscuro ? "text-white" : "text-black"} font-bold text-sm`}>Residente. Food&Drink Media</span>
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

      {/* ════════════ DESKTOP (header nuevo, igual al del sitio público) ════════════ */}
      <HeaderEscritorio
        oscuro={oscuro}
        perfil={<PerfilMenuEscritorio oscuro={oscuro} />}
        banner={
          location.pathname === "/heybanco" ? (
            <div className="relative z-30 pt-3">
              <a>
                <img src="https://residente.mx/fotos/fotos-estaticas/BANNER HeyBanco.webp" alt="Banner HeyBanco" />
              </a>
            </div>
          ) : null
        }
      />
    </header>
  );
};

export default Header;
