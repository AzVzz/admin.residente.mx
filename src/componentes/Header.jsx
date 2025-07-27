import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { catalogoHeadersGet } from './api/catalogoSeccionesGet';

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

  useEffect(() => {
    catalogoHeadersGet()
      .then(data => setMenuHeader(data))
      .catch(() => setMenuHeader([]));
  }, []);

  return (
    <header className="bg-[#fff200] w-full">
      <div className="max-w-[1080px] mx-auto w-full">
        <div className="flex pb-8 pt-5">
          <div className="flex justify-end pr-3">
            <Link to="/residente" className="h-24 w-24 self-end object-contain">
              <img src={LogoCirculoResidente} alt="Logo Residente Circulo" />
            </Link>
          </div>
          <div className="w-full">
            <div className="flex items-end pb-3 gap-2 ">
              <Link to="/residente">
                <img src={ResidenteNegro} alt="ResidenteNegro" className="h-10" />
              </Link>
              <div className="flex items-center ml-auto" >
                <div className="flex flex-col justify-center items-end mr-4 gap-2">
                  <div className="flex gap-1 items-center relative -top-7 mb-2 w-40 justify-end">
                    {iconosZonales.map((icon, idx) => (
                      <img key={idx} src={icon.src} alt={icon.alt} className="h-7 w-7 shadow-md rounded-full" />
                    ))}
                  </div>
                  <div className="flex flex-col justify-center w-40 items-end text-right relative -top-3">
                    <div className="text-xs font-semibold font-sans">COLEMAN <br /> Deliciosas propuestas de comida oriental</div>
                    <div className="text-xs text-gray-500 font-sans">{fechaActual}</div>
                  </div>
                </div>
                <img src={PortadaRevista} alt="Portada Revista" className="h-40 w-32 object-cover" />
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="border-black my-0 ml-25" />
              <div className="flex justify-between items-center px-5 py-2 bg-black">
                <div className="flex gap-6 items-center text-sm font-semibold bg">
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
                <div className="flex gap-1.5">
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