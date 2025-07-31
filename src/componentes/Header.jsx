import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { catalogoHeadersGet } from './api/CatalogoSeccionesGet';
import { revistaGetUltima } from "./api/revistasGet";

import PortadaRevista from '../imagenes/bannerRevista/PortadaRevista.jpg';
import apodaca from '../imagenes/Iconografia/negroBlanco/apo.png';
import escobedo from '../imagenes/Iconografia/negroBlanco/esc.png';
import guadalupe from '../imagenes/Iconografia/negroBlanco/gpe.png';
import monterrey from '../imagenes/Iconografia/negroBlanco/mty.png';
import sannicolas from '../imagenes/Iconografia/negroBlanco/snn.png';
import sanpedro from '../imagenes/Iconografia/negroBlanco/spg.png';
import santacatarina from '../imagenes/Iconografia/negroBlanco/sta.png';
import ResidenteNegro from '../imagenes/FoodDrinkMedia_Logo_Negro.png';
import LogoCirculoResidente from '../imagenes/R_Circulo_Logo_Negro.png';
import b2blogo from "../imagenes/logos/blancos/B2BSoluciones_Logo_Blanco.png";

import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp, FaEnvelope } from "react-icons/fa";

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
    <header className="bg-[#fff200] w-full">
      <div className="max-w-[1080px] mx-auto w-full">
        <div className="flex pb-0 pt-5">
          <div className="sm:flex pr-3 hidden">
            <Link to="/residente" className="h-24 w-24 self-end object-contain">
              <img src={LogoCirculoResidente} alt="Logo Residente Circulo" />
            </Link>
          </div>
          <div className="w-full">
            <div className="flex flex-col-reverse sm:flex-row pb-3 gap-2">
              <Link to="/residente" className="flex flex-col justify-end">
                <img src={ResidenteNegro} alt="ResidenteNegro" className="h-10 object-contain" />
              </Link>
              <div className="flex flex-1 w-full justify-end items-start">
                <div className="flex flex-col gap-2 mr-auto">
                  <div className="flex gap-1.5">
                    {iconosZonales.map((icon, idx) => (
                      <img key={idx} src={icon.src} alt={icon.alt} className="h-7.5 w-7.5 shadow-md rounded-full" />
                    ))}
                  </div>
                  <div className="flex flex-col text-right">
                    <div className="text-xs font-semibold font-sans">
                      {revistaActual ? revistaActual.titulo : "COLEMAN"}<br />
                      {revistaActual ? revistaActual.descripcion : "Deliciosas propuestas de comida oriental"}
                    </div>
                    <div className="text-xs text-gray-500 font-sans">{fechaActual}</div>
                  </div>
                </div>
                {/*descarga el PDF*/}
                {revistaActual && revistaActual.pdf ? (
                  <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                    <img
                      src={revistaActual.imagen_portada}
                      alt="Portada Revista"
                      className="h-auto sm:w-32 w-22 object-cover cursor-pointer"
                      title="Descargar PDF"
                    />
                  </a>
                ) : (
                  <img
                    src={revistaActual ? revistaActual.imagen_portada : PortadaRevista}
                    alt="Portada Revista"
                    className="h-auto sm:w-32 w-22 object-cover"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="sm:flex justify-between items-center sm:px-5 px-2 sm:py-2 py-1 bg-black hidden">
                <div className="flex gap-1 sm:gap-6 items-center sm:text-sm text-[8px] font-semibold">
                  {menuHeader.map((section, idx) =>
                    section.url ? (
                      <a
                        key={idx}
                        href={section.url}
                        className="hover:underline text-white"
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
                        <a href="#" className="hover:underline text-white">{section.seccion}</a>
                        {/* Submenú desplegable */}
                        {section.submenu && (
                          <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded z-50 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                            <ul>
                              {section.submenu.map((item, subIdx) => (
                                <li key={subIdx}>
                                  <a
                                    href={item.url}
                                    rel="noopener noreferrer"
                                    className="block px-4 py-2 text-black hover:bg-yellow-100"
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
                  <img src={b2blogo} className="object-contain h-4 w-12 b2b cursor-pointer" />
                  <a href="http://instagram.com/residentemty" target="_blank" rel="noopener noreferrer"><FaInstagram className="w-4 h-4 text-white hover:text-gray-400" /></a>
                  <a href="http://facebook.com/residentemx" target="_blank" rel="noopener noreferrer"><FaFacebookF className="w-4 h-4 text-white hover:text-gray-400" /></a>
                  <a href="http://youtube.com/@revistaresidente5460" target="_blank" rel="noopener noreferrer"><FaYoutube className="w-4 h-4 text-white hover:text-gray-400" /></a>
                  <a href="tel:+528114186985" target="_blank" rel="noopener noreferrer"><FaWhatsapp className="w-4 h-4 text-white hover:text-gray-400" /></a>
                  <a href="mailto:contacto@residente.mx?subject=%C2%A1Quiero%20mas%20informaci%C3%B3n%20de%20Residente!"><FaEnvelope className="w-4 h-4 text-white hover:text-gray-400" /></a>
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