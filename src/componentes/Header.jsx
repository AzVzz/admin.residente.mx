import { useState, useEffect } from "react";
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

  return (
    <header className="w-full">
      {/* ========== HEADER MÓVIL (< 640px) ========== */}
      <div className="sm:hidden">
        <div className="bg-[#fff200] flex items-center justify-between px-4 py-3">
          {/* Menú hamburguesa */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-black p-1"
            aria-label="Abrir menú"
          >
            <FaBars className="w-6 h-6" />
          </button>
          
          {/* Logo centrado */}
          <Link to="https://residente.mx" className="flex items-center gap-2">
            <img
              src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/logo-r-residente-negro.webp"
              alt="Logo Residente"
              className="h-8 w-8 rounded-full bg-white"
            />
            <span className="text-black font-bold text-sm">Residente. Food&Drink Media</span>
          </Link>
          
          {/* Espacio vacío para balancear */}
          <div className="w-6"></div>
        </div>

        {/* Menú móvil desplegable */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)}>
            <div 
              className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del menú */}
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
              
              {/* Items del menú */}
              <nav className="p-4">
                <ul className="space-y-4">
                  {menuHeader.map((section, idx) => (
                    <li key={idx}>
                      {section.url ? (
                        <a
                          href={section.url}
                          className="block text-black font-semibold py-2 hover:text-gray-600"
                          target={section.url.startsWith("http") ? "_blank" : undefined}
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
                                    target={item.url.startsWith("http") ? "_blank" : undefined}
                                    rel="noopener noreferrer"
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
                  
                  {/* Link de sesión */}
                  <li className="border-t pt-4">
                    {!usuario ? (
                      <Link
                        to="/registro"
                        className="block text-black font-semibold py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Iniciar Sesión
                      </Link>
                    ) : (
                      <Link
                        to={usuario.rol === "b2b" ? "/dashboardb2b" : "/dashboard"}
                        className="block text-black font-semibold py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                  </li>
                  
                  {/* B2B Link */}
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
                
                {/* Redes sociales */}
                <div className="mt-8 pt-4 border-t">
                  <p className="text-gray-500 text-sm mb-3">Síguenos</p>
                  <div className="flex gap-4">
                    <a href="http://instagram.com/residentemty" target="_blank" rel="noopener noreferrer">
                      <FaInstagram className="w-6 h-6 text-black" />
                    </a>
                    <a href="http://facebook.com/residentemx" target="_blank" rel="noopener noreferrer">
                      <FaFacebookF className="w-6 h-6 text-black" />
                    </a>
                    <a href="http://youtube.com/@revistaresidente5460" target="_blank" rel="noopener noreferrer">
                      <FaYoutube className="w-6 h-6 text-black" />
                    </a>
                    <a href="tel:+528114186985" target="_blank" rel="noopener noreferrer">
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

          <div className="flex pb-0 pt-5 relative z-10">
            <div className="flex pr-3">
              <Link
                to="https://residente.mx"
                className="h-16 w-16 self-end object-contain bg-white rounded-full"
              >
                <img
                  src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/logo-r-residente-negro.webp"
                  alt="Logo Residente Circulo"
                />
              </Link>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-[87%_13%] pb-3">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-1 w-full justify-end items-start">
                    <div className="flex flex-col pr-2"></div>
                  </div>
                  <Link to="" className="flex">
                    <img
                      src="https://residente.mx/fotos/fotos-estaticas/componente-sin-carpetas/food-drink-media-logo-negro.png"
                      alt="ResidenteNegro"
                      className="h-6 object-contain"
                    />
                  </Link>
                </div>
              </div>

              {/* Menú Amarillo */}
              <div className="flex flex-col flex-1 relative z-10">
                <div className="flex justify-between items-center px-5 py-0.5 bg-[#fff200] relative z-10">
                  <div className="flex gap-6 items-center text-sm font-semibold">
                    {menuHeader.map((section, idx) =>
                      section.url ? (
                        <a
                          key={idx}
                          href={section.url}
                          className="hover:underline text-black font-roman"
                          rel="noopener noreferrer"
                          target={
                            section.url.startsWith("http") ? "_blank" : undefined
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
                              className={`absolute left-0 top-full mt-2 bg-gray-900/75 border border-gray-700 rounded shadow-lg z-50 min-w-[260px] transition-all duration-150 backdrop-blur-xs ${
                                activeDropdown === idx
                                  ? "opacity-100 visible"
                                  : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                              }`}
                            >
                              <ul>
                                {section.submenu.map((item, subIdx) => (
                                  <li key={subIdx}>
                                    <a
                                      href={item.url}
                                      rel="noopener noreferrer"
                                      className="block px-4 py-2 text-white hover:bg-gray-800/70 text-sm cursor-pointer font-roman"
                                      target={
                                        item.url.startsWith("http")
                                          ? "_blank"
                                          : undefined
                                      }
                                      onClick={handleDropdownClose}
                                    >
                                      {item.nombre === "Antojos"
                                        ? "Antojeria"
                                        : item.nombre}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    )}
                    {!usuario ? (
                      <Link
                        to="/registro"
                        className="hover:underline text-black font-roman"
                      >
                        Iniciar Sesión
                      </Link>
                    ) : usuario.rol === "b2b" ? (
                      <Link
                        to="/dashboardb2b"
                        className="hover:underline text-black font-roman"
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        className="hover:underline text-black font-roman"
                      >
                        Dashboard
                      </Link>
                    )}
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {!isSearchOpen ? (
                      <>
                        <a href="/B2b">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
