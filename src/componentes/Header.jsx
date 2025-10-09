import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { catalogoHeadersGet } from './api/CatalogoSeccionesGet';
import { revistaGetUltima } from "./api/revistasGet";
import { urlApi } from './api/url';
import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp, FaEnvelope, FaSearch, FaTimes } from "react-icons/fa";
import BannerHorizontal from "./residente/componentes/BannerHorizontal";
import SearchResults from "./SearchResults";

const Header = () => {
  const [menuHeader, setMenuHeader] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    catalogoHeadersGet().then(data => setMenuHeader(data)).catch(() => setMenuHeader([]));
    // revistaGetUltima().then(data => setRevistaActual(data)).catch(() => setRevistaActual(null));
  }, []);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchTerm('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirigir a página de resultados de búsqueda
      window.location.href = `/buscar?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const handleBannerClick = () => {
    if (window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'Banner',
        event_label: 'Lucia',
        value: 1
      });
    }
  };

  return (
    <header className="w-full">

      <div className="max-w-[1080px] mx-auto w-full">

        <div className="pt-8"> {/*agregue 3 pixeles más*/}
          {/*<BannerHorizontal size="big" />*/}
          <a
            href="https://residente.mx/fotos/fotos-estaticas/AGENDA_FISL_2025.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBannerClick} // <-- Agrega esto
          >
            <img src="https://residente.mx/fotos/fotos-estaticas/BANNER%20SANTA%20LUCÍA.webp" />
          </a>
        </div>


        <div className="flex pb-0 pt-11"> {/** Antes pt-5 (agregue 8 pixeles más)*/}
          <div className="flex pr-3 ">
            <Link to="" className="h-16 w-16 self-end object-contain bg-white rounded-full">
              <img src={`${urlApi}/fotos/fotos-estaticas/residente-logos/negros/logo-r-residente-negro.webp`} alt="Logo Residente Circulo" />
            </Link>
          </div>
          <div className="w-full">
            <div className="grid  grid-cols-[87%_13%] pb-3">
              <div className="flex sm:flex-col gap-2">
                <div className="flex flex-1 w-full justify-end items-start">
                  <div className="flex flex-col pr-2">
                  </div>

                </div>
                <Link to="" className="flex">
                  <img src={`${urlApi}/fotos/fotos-estaticas/componente-sin-carpetas/food-drink-media-logo-negro.png`} alt="ResidenteNegro" className="h-6 object-contain" />
                </Link>
              </div>

            </div>

            {/* Menú Amarillo */}
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center sm:px-5 px-2 sm:py-0.5 py-0 bg-[#fff200] ">
                <div className="flex gap-1 sm:gap-6 items-center sm:text-sm text-[8px] font-semibold">
                  {menuHeader.map((section, idx) =>
                    section.url ? (
                      <a
                        key={idx}
                        href={section.url}
                        className="hover:underline text-black font-roman"
                        rel="noopener noreferrer"
                        target={section.url.startsWith('http') ? '_blank' : undefined}
                      >
                        {section.seccion}
                      </a>
                    ) : (
                      <div
                        key={idx}
                        className="relative group"
                      >
                        <a href="#" className="hover:underline text-black font-roman">{section.seccion}</a>
                        {/* Submenú desplegable */}
                        {section.submenu && (
                          <div className="absolute left-0 top-full mt-2 bg-gray-900/75 border border-gray-700 rounded shadow-lg z-50 min-w-[260px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 backdrop-blur-xs">
                            <ul>
                              {section.submenu.map((item, subIdx) => (
                                <li key={subIdx}>
                                  <a
                                    href={item.url}
                                    rel="noopener noreferrer"
                                    className="block px-4 py-2 text-white hover:bg-gray-800/70 text-sm cursor-pointer font-roman"
                                    target={item.url.startsWith('http') ? '_blank' : undefined}
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
                <div className="sm:flex gap-1.5 hidden items-center">
                  {!isSearchOpen ? (
                    <>
                      <a href="/b2b">
                        <img src={`${urlApi}/fotos/fotos-estaticas/residente-logos/negros/b2b.webp`} className="object-contain h-4 w-12 b2b cursor-pointer" alt="B2B" />
                      </a>
                      <a href="http://instagram.com/residentemty" target="_blank" rel="noopener noreferrer"><FaInstagram className="w-4 h-4 text-black hover:text-gray-400" /></a>
                      <a href="http://facebook.com/residentemx" target="_blank" rel="noopener noreferrer"><FaFacebookF className="w-4 h-4 text-black hover:text-gray-400" /></a>
                      <a href="http://youtube.com/@revistaresidente5460" target="_blank" rel="noopener noreferrer"><FaYoutube className="w-4 h-4 text-black hover:text-gray-400" /></a>
                      <a href="tel:+528114186985" target="_blank" rel="noopener noreferrer"><FaWhatsapp className="w-4 h-4 text-black hover:text-gray-400" /></a>
                      <a href="mailto:contacto@residente.mx?subject=%C2%A1Quiero%20mas%20informaci%C3%B3n%20de%20Residente!"><FaEnvelope className="w-4 h-4 text-black hover:text-gray-400" /></a>
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
                      <form onSubmit={handleSearchSubmit} className="flex items-center">
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
                      
                      {/* Dropdown de resultados */}
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
    </header>
  );
};

export default Header;