import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { catalogoHeadersGet } from './api/CatalogoSeccionesGet';
import { revistaGetUltima } from "./api/revistasGet";
import { urlApi } from './api/url';


import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp, FaEnvelope } from "react-icons/fa";

const apodaca = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/apo.webp`;
const escobedo = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/esc.webp`;
const guadalupe = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/gpe.webp`;
const monterrey = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/mty.webp`;
const sannicolas = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/snn.webp`;
const sanpedro = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/spg.webp`;
const santacatarina = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/sta.webp`;

const iconosZonales = [
  { src: apodaca, alt: "Apodaca" },
  { src: escobedo, alt: "Escobedo" },
  { src: guadalupe, alt: "Guadalupe" },
  { src: monterrey, alt: "Monterrey" },
  { src: sannicolas, alt: "San Nicolás" },
  { src: sanpedro, alt: "San Pedro" },
  { src: santacatarina, alt: "Santa Catarina" },
];


const Header = () => {
  const fechaActual = new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const [menuHeader, setMenuHeader] = useState([]);
  const [revistaActual, setRevistaActual] = useState(null);


  useEffect(() => {
    catalogoHeadersGet()
      .then(data => setMenuHeader(data))
      .catch(() => setMenuHeader([]));
    revistaGetUltima()
      .then(data => setRevistaActual(data))
      .catch(() => setRevistaActual(null));
  }, []);

  return (
    <header className="bg-[#CCCCCC] w-full">

      <div className="max-w-[1080px] mx-auto w-full">
        {revistaActual && revistaActual.pdf ? (
          <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
            <img
              src={revistaActual.imagen_banner}
              alt="Banner Revista"
              className="w-full mb-4 cursor-pointer pt-5"
              title="Descargar Revista"
            />
          </a>
        ) : (
          <img
            src={revistaActual?.imagen_banner}
            alt="Banner Revista"
            className="w-full mb-4"
          />
        )}

        <div className="flex pb-0 pt-3"> {/** Antes pt-5 */}
          <div className="sm:flex pr-3 hidden">
            <Link to="/residente" className="h-16 w-16 self-end object-contain bg-white rounded-full">
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
                <Link to="/residente" className="flex">
                  <img src={`${urlApi}/fotos/fotos-estaticas/componente-sin-carpetas/food-drink-media-logo-negro.png`} alt="ResidenteNegro" className="h-6 object-contain" />
                </Link>
              </div>

            </div>

            {/* Menú Amarillo */}
            <div className="flex flex-col flex-1">
              <div className="sm:flex justify-between items-center sm:px-5 px-2 sm:py-0.5 py-0 bg-[#fff200] hidden">
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
                                    {item.nombre}
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
                <div className="sm:flex gap-1.5 hidden">
                  <img src={`${urlApi}/fotos/fotos-estaticas/residente-logos/negros/b2b.webp`} className="object-contain h-4 w-12 b2b cursor-pointer" />
                  <a href="http://instagram.com/residentemty" target="_blank" rel="noopener noreferrer"><FaInstagram className="w-4 h-4 text-black hover:text-gray-400" /></a>
                  <a href="http://facebook.com/residentemx" target="_blank" rel="noopener noreferrer"><FaFacebookF className="w-4 h-4 text-black hover:text-gray-400" /></a>
                  <a href="http://youtube.com/@revistaresidente5460" target="_blank" rel="noopener noreferrer"><FaYoutube className="w-4 h-4 text-black hover:text-gray-400" /></a>
                  <a href="tel:+528114186985" target="_blank" rel="noopener noreferrer"><FaWhatsapp className="w-4 h-4 text-black hover:text-gray-400" /></a>
                  <a href="mailto:contacto@residente.mx?subject=%C2%A1Quiero%20mas%20informaci%C3%B3n%20de%20Residente!"><FaEnvelope className="w-4 h-4 text-black hover:text-gray-400" /></a>
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