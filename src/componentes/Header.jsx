import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { catalogoHeadersGet } from "./api/catalogoSeccionesGet";
import { urlApi, imgApi } from "./api/url";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaEnvelope,
  FaSearch,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import SearchResults from "./SearchResults";
import { useAuth } from "./Context";

// Componente ProfileMenu 
const ProfileMenu = ({ fondoOscuro = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { usuario, logout } = useAuth();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  // No autenticado - link simple estilo header
  if (!usuario) {
    return (
      <Link
        to="/registro"
        className={`${fondoOscuro ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"
          } text-sm font-medium`}
        style={{ fontSize: "14px" }}
      >
        Login
      </Link>
    );
  }

  const isB2B = usuario.rol?.toLowerCase() === "b2b";

  // Autenticado - menú desplegable
  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${fondoOscuro ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"
          } text-sm font-medium flex items-center gap-1`}
        style={{ fontSize: "14px" }}
        aria-label="Menú de perfil"
      >
        {usuario.nombre_usuario?.toUpperCase()}
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg border border-gray-200 py-1 z-50">
          {/* Info del usuario */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="font-bold text-sm truncate">
              {usuario.nombre_usuario?.toUpperCase()}
            </p>
            <p className="text-xs text-gray-500 capitalize">{usuario.rol}</p>
          </div>

          {/* Opción: Dashboard según el rol */}
          {isB2B ? (
            <Link
              to="/dashboardb2b"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Dashboard B2B
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Mi Dashboard
            </Link>
          )}

          {/* Opción: Cerrar sesión */}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { usuario } = useAuth();
  const location = useLocation();
  const [menuHeader, setMenuHeader] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    catalogoHeadersGet()
      .then((data) => setMenuHeader(data))
      .catch(() => setMenuHeader([]));
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown !== null) {
        const dropdownElement = event.target.closest(".dropdown-container");
        if (!dropdownElement) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeDropdown]);

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileMenuOpen]);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchTerm("");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const handleBannerClick = () => {
    if (window.gtag) {
      window.gtag("event", "click", {
        event_category: "Banner",
        event_label: "Lucia",
        value: 1,
      });
    }
  };

  const handleDropdownToggle = (idx) => {
    setActiveDropdown(activeDropdown === idx ? null : idx);
  };

  const handleDropdownClose = () => {
    setActiveDropdown(null);
  };

  const filteredMenu = menuHeader
    .filter((section) => section.seccion !== "Guías zonales")
    .map((section) => {
      if (section.submenu) {
        if (section.seccion === "Residente") {
          return {
            ...section,
            submenu: section.submenu.filter(
              (item) => item.nombre !== "Input OpEd"
            ),
          };
        }
        if (section.seccion === "Noticias") {
          return {
            ...section,
            submenu: section.submenu.filter(
              (item) =>
                item.nombre !== "Gastro-Destinos" &&
                item.nombre !== "Gastro-destinos"
            ),
          };
        }
      }
      return section;
    });

  const abrirEnNuevaPestana = [
    "Nuestros medios",
    "Historia",
    "Misión",
    "Rostros detrás del sabor",
    "Platillos icónicos de Nuevo León",
    "Anúnciate",
    "Anunciate",
  ];

  return (
    <header className="w-full">
      {/* ========== HEADER MÓVIL (< 640px) ========== */}
      <div className="sm:hidden">
        <div className="bg-[#fff200] flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-black p-1"
            aria-label="Abrir menú"
          >
            <FaBars className="w-6 h-6" />
          </button>

          {/* Logo centrado */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/logo-r-residente-negro.webp"
              alt="Logo Residente"
              className="h-8 w-8 rounded-full bg-white"
            />
            <span className="text-black font-bold text-sm">
              Residente. Food&Drink Media
            </span>
          </Link>

          <div className="w-6"></div>
        </div>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#fff200] p-4 flex items-center justify-between">
                <span className="font-bold text-black">Menú</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-black p-1"
                  aria-label="Cerrar menú"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4">
                <ul className="space-y-4">
                  {filteredMenu.map((section, idx) => (
                    <li key={idx}>
                      {section.url ? (
                        <a
                          href={section.url}
                          className="block text-black font-semibold py-2 hover:text-gray-600"
                          target={
                            section.url.startsWith("http") ? "_blank" : undefined
                          }
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {section.seccion}
                        </a>
                      ) : (
                        <div>
                          <button
                            onClick={() => handleDropdownToggle(idx)}
                            className="w-full text-left text-black font-semibold py-2 hover:text-gray-600"
                          >
                            {section.seccion}
                          </button>
                          {section.submenu && activeDropdown === idx && (
                            <ul className="ml-4 mt-2 space-y-2">
                              {section.submenu.map((item, subIdx) => (
                                <li key={subIdx}>
                                  <a
                                    href={item.url}
                                    className="block text-gray-600 py-1 hover:text-black"
                                    target={
                                      item.url.startsWith("http")
                                        ? "_blank"
                                        : undefined
                                    }
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {item.nombre === "Antojos"
                                      ? "Antojeria"
                                      : item.nombre}
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

                  <li>
                    <a
                      href="/B2b"
                      className="block text-black font-semibold py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      B2B
                    </a>
                  </li>
                </ul>

                <div className="mt-8 pt-4 border-t">
                  <p className="text-gray-500 text-sm mb-3">Síguenos</p>
                  <div className="flex gap-4">
                    <a
                      href="http://instagram.com/residentemty"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaInstagram className="w-6 h-6 text-black" />
                    </a>
                    <a
                      href="http://facebook.com/residentemx"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFacebookF className="w-6 h-6 text-black" />
                    </a>
                    <a
                      href="http://youtube.com/@revistaresidente5460"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaYoutube className="w-6 h-6 text-black" />
                    </a>
                    <a
                      href="tel:+528114186985"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaWhatsapp className="w-6 h-6 text-black" />
                    </a>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* ========== HEADER DESKTOP (>= 640px) ========== */}
      <div className="hidden sm:block">
        <div className="max-w-[1080px] mx-auto w-full">
          <div className="pt-8 relative z-30">
            {location.pathname === "/heybanco" ? (
              <a>
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/BANNER HeyBanco.webp"
                  alt="Banner HeyBanco"
                />
              </a>
            ) : (
              <a
                href="https://residente.mx/fotos/fotos-estaticas/HEROESPARAWEB.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleBannerClick}
              >
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/BANNER%20HE%CC%81ROES%20DEL%20SERVCIO%20COCA%20COLA%202025.jpg"
                  alt="Banner Principal"
                />
              </a>
            )}
          </div>
          <div className="flex pb-0 pt-8">
            <div className="flex pr-3">
              <Link
                to="/"
                className="h-16 w-16 self-end object-contain bg-white rounded-full"
                aria-label="Ir a inicio (Logo R)"
                title="Ir a inicio"
  </a>
          </div >
          <div className="w-full relative">
            {/* ProfileMenu arriba a la derecha */}
            <div className="absolute top-3 right-0 z-50">
              <ProfileMenu fondoOscuro={false} />
            </div>

            <div className="grid grid-cols-[87%_13%] pb-[9px]">
              <div className="flex sm:flex-col gap-2">
                <div className="flex flex-1 w-full justify-end items-start">
                  <div className="flex flex-col pr-2"></div>
                </div>
                <a
                  href="/"
                  className="flex"
                  aria-label="Ir a inicio (Texto)"
                  title="Ir a inicio"
                >
                  <img
                    src="https://residente.mx/fotos/fotos-estaticas/componente-sin-carpetas/food-drink-media-logo-negro.png"
                    alt="ResidenteNegro"
                    className="h-6 object-contain"
                  />
                </a>
              </div>
            </div>

            {/* Menú Amarillo */}
            <div className="flex flex-col flex-1.1">
              <div className="flex justify-between items-center px-2 -ml-[6px] w-[calc(100%+6px)] py-0 bg-[#fff200] h-[24px]">
                <div className="flex gap-1 sm:gap-4 items-center sm:text-[13px] text-[10px] font-semibold">
                  {filteredMenu.map((section, idx) =>
                    section.url ? (
                      <a
                        key={idx}
                        href={section.url}
                        className="hover:underline text-black font-roman"
                        rel={
                          abrirEnNuevaPestana.includes(section.seccion)
                            ? "noopener noreferrer"
                            : undefined
                        }
                        target={
                          abrirEnNuevaPestana.includes(section.seccion)
                            ? "_blank"
                            : undefined
                        }
                      >
                        {section.seccion}
                      </a>
                    ) : (
                      <div
                        key={idx}
                        className="relative group dropdown-container"
                      >
                        <button
                          onClick={() => handleDropdownToggle(idx)}
                          className="hover:underline text-black font-roman bg-transparent border-none cursor-pointer"
                        >
                          {section.seccion}
                        </button>
                        {section.submenu && (
                          <div
                            className={`absolute left-0 top-full mt-2 bg-gray-900/75 border border-gray-700 rounded shadow-lg z-50 min-w-[260px] transition-all duration-150 backdrop-blur-xs ${activeDropdown === idx
                              ? "opacity-100 visible"
                              : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                              }`}
                          >
                            <ul>
                              {section.submenu.map((item, subIdx) => (
                                <li key={subIdx}>
                                  <a
                                    href={item.url}
                                    rel={abrirEnNuevaPestana.includes(item.nombre) ? "noopener noreferrer" : undefined}
                                    target={abrirEnNuevaPestana.includes(item.nombre) ? "_blank" : undefined}
                                    className="block px-4 py-2 text-white hover:bg-gray-800/70 text-sm cursor-pointer font-roman"
                                    onClick={handleDropdownClose}
                                  >
                                    {item.nombre === "Antojos" ? "Antojeria" : item.nombre}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
                <div className="flex gap-1.5 items-center">
                  {!isSearchOpen ? (
                    <>
                      <a href="/b2b">
                        <img
                          src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/b2b.webp"
                          className="object-contain h-4 w-12 b2b"
                          alt="B2B"
                        />
                      </a>
                      <a
                        href="http://instagram.com/residentemty"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaInstagram className="w-4 h-4 text-black hover:text-gray-400" />
                      </a>
                      <a
                        href="http://facebook.com/residentemx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaFacebookF className="w-4 h-4 text-black hover:text-gray-400" />
                      </a>
                      <a
                        href="http://youtube.com/@revistaresidente5460"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaYoutube className="w-4 h-4 text-black hover:text-gray-400" />
                      </a>
                      <a
                        href="tel:+528114186985"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaWhatsapp className="w-4 h-4 text-black hover:text-gray-400" />
                      </a>
                      <a href="mailto:contacto@residente.mx?subject=%C2%A1Quiero%20mas%20informaci%C3%B3n%20de%20Residente!">
                        <FaEnvelope className="w-4 h-4 text-black hover:text-gray-400" />
                      </a>
                      <button
                        onClick={handleSearchToggle}
                        className="w-4 h-4 text-black hover:text-gray-400 transition-colors"
                        title="Buscar"
                      >
                        <FaSearch className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="relative w-full max-w-md bg-white shadow-sm">
                      <form
                        onSubmit={handleSearchSubmit}
                        className="flex items-center"
                      >
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar notas..."
                          className="flex-1 px-2 text-sm focus:outline-none focus:ring-0 bg-transparent"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSearchClose}
                          className="w-4 h-4 text-black hover:text-gray-400 transition-colors"
                          title="Cerrar búsqueda"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </form>
                      <SearchResults
                        searchTerm={searchTerm}
                        onClose={handleSearchClose}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div >
      </div >
    </div >
  {/* HEADER MOBILE ...igual que ya tienes, solo cuida los tamaños y separaciones */ }
    </header >
  );
};

export default Header;
