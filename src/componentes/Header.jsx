import { useState } from "react";
import { Link } from 'react-router-dom';

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

// Ejemplo de estructura de submenús (puedes adaptar según tu MegaMenu)
const menuSections = {
  residente: {
    title: "Residente",
    items: [
      { name: "Nuestros medios", url: "https://www.estrellasdenuevoleon.com/" },
      { name: "Historia", url: "https://www.estrellasdenuevoleon.com/historia" },
      { name: "Misión", url: "https://www.estrellasdenuevoleon.com/mision" },
      { name: "Trabajo", url: "https://www.estrellasdenuevoleon.com/trabajo" },
      { name: "Anúnciate", url: "https://www.estrellasdenuevoleon.com/anunciate" },
      { name: "Input OpEd", url: "https://residente.mx/registro/" },
      { name: "Input media", url: "https://residente.mx/colaboradores/" },
      { name: "Input promo", url: "https://www.estrellasdenuevoleon.com/promo" },
      { name: "Guía crítica", url: "https://residente.mx/guia-critica/" },
    ],
  },
  noticias: {
    title: "Noticias",
    items: [
      { name: "Opinion", url: "#" },
      { name: "Cultura restaurantera", url: "https://residente.mx/category/cultura-restaurantera/" },
      { name: "Postres y snacks", url: "https://residente.mx/category/postres-y-snacks/" },
      { name: "Comida y bebida", url: "https://residente.mx/category/comida-y-bebida/" },
      { name: "Perfiles y entrevistas", url: "https://residente.mx/category/perfiles-y-entrevistas/" },
    ],
  },
  cultura: {
    title: "Cultura Gastronómica",
    items: [
      { name: "Estrellas de Nuevo León", url: "https://estrellasdenuevoleon.com.mx" },
      { name: "Mapa Restaurantero de Nuevo León", url: "#" },
      { name: "Platillos icónicos de Nuevo León", url: "https://www.estrellasdenuevoleon.com/platillos" },
      { name: "Los rostros detrás del sabor", url: "https://www.estrellasdenuevoleon.com/rostros" },
      { name: "Cuponera Residente", url: "#" },
      { name: "Etiqueta Restaurantera", url: "https://residente.mx/2022/01/13/del-restaurant-al-comensal/" },
      { name: "Recetario Residente", url: "#" },
      { name: "Mamá de Rocco", url: "/mama-de-rocco" },
    ],
  },
  guias: {
    title: "Guías Zonales",
    items: [
      { name: "Santiago", url: "#" },
      { name: "Centrito valle", url: "#" },
      { name: "Barrio Antiguo", url: "/barrio-antiguo" },
      { name: "Valle Poniente", url: "#" },
    ],
  },
  franquicias: {
    title: "Franquicias Nacionales",
    items: [
      { name: "Residente Rivera Maya", url: "#" },
      { name: "Residente Saltillo", url: "#" },
      { name: "Residente Ciudad de México", url: "#" },
    ],
  },
  anunciate: {
    title: "Anúnciate",
    items: [
      { name: "Contacto", url: "https://www.estrellasdenuevoleon.com/anunciate" }
    ],
  }
};

const Header = () => {
  const fechaActual = new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const [hoveredMenu, setHoveredMenu] = useState(null);

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
            <div className="flex items-end pb-3 gap-2 "> {/* Primer div: RCirculo y ResidenteFoodLetras */}
              <Link to="/residente">
                <img src={ResidenteNegro} alt="ResidenteNegro" className="h-10" />
              </Link>
              {/* Bloque derecho: iconos, título/fecha y portada */}
              <div className="flex items-center ml-auto" >
                {/* Iconos zonales */}
                <div className="flex flex-col justify-center items-end mr-4 gap-8">
                  <div className="flex gap-2 items-center -mt-2 mb-2 w-40 justify-end">
                    {iconosZonales.map((icon, idx) => (
                      <img key={idx} src={icon.src} alt={icon.alt} className="h-6 w-6 shadow-md rounded-full" />
                    ))}
                  </div>
                  {/* Título y fecha al lado izquierdo de la portada */}
                  <div className="flex flex-col justify-center w-40 items-end text-right">
                    <div className="text-xs font-semibold font-sans">COLEMAN <br /> Deliciosas propuestas de comida oriental</div>
                    <div className="text-xs text-gray-500 font-sans">{fechaActual}</div>
                  </div>
                </div>
                {/* Portada revista al final derecho */}
                <img src={PortadaRevista} alt="Portada Revista" className="h-40 w-32 object-cover" />
              </div>
            </div>

            <div className="flex flex-col flex-1"> {/* Segundo div: menú y líneas */}
              {/* Línea superior */}
              <div className="border-black my-0 ml-25" />
              {/* Menú principal con submenús tipo hover */}
              <div className="flex justify-between items-center px-5 py-2 bg-black">
                <div className="flex gap-6 items-center text-sm font-semibold bg">
                  {Object.entries(menuSections).map(([key, section]) => (
                    key === "anunciate" ? (
                      <a
                        key={key}
                        href={section.items[0].url}
                        className="hover:underline text-white"
                        rel="noopener noreferrer"
                      >
                        {section.title}
                      </a>
                    ) : (
                      <div
                        key={key}
                        className="relative group"
                      >
                        <a href="#" className="hover:underline text-white">{section.title}</a>
                        {/* Submenú desplegable */}
                        <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded z-50 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                          <ul>
                            {section.items.map((item, idx) => (
                              <li key={idx}>
                                <a
                                  href={item.url}
                                  rel="noopener noreferrer"
                                  className="block px-4 py-2 text-black hover:bg-yellow-100"
                                >
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <img src={b2blogo} className="object-contain h-4 w-auto b2b cursor-pointer" />
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