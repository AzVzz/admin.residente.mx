import { Link } from 'react-router-dom';

import residenteAmarillo from '../imagenes/FoodDrinkMedia_Logo_Amarillo.png'
import ednllogo from '../imagenes/logos/blancos/Logo estrellas de NL_Mesa de trabajo 1 copia 3.png';
import b2blogo from '../imagenes/logos/blancos/B2BSoluciones_Logo_Blanco.png';
import { useState, useRef, useEffect } from "react";


import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Verificar si el clic fue fuera del menú Y fuera del botón
      if (dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función para alternar el menú
  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };


  return (
    <header className="bg-[#3B3B3C] relativ flex justify-center items-center h-[97px]">
      <div className="header-content max-w-[1080px] w-full">
        <div className="bg-red-600 flex justify-between items-stretch">

          {/* Logo "Residente. Food&DRinkMEdia" */}
          <Link to="/" className="w-120">
            <img
              src={residenteAmarillo}
              alt="Logo Principal"
              className="w-[100%]"
            />
          </Link>

          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="text-white text-2xl z-50 px-4 py-2 bg-gray-700 rounded-md"
          >
            {isOpen ? "X" : "☰"}
          </button>

          <div className="flex flex-row justify-center items-center bg-amber-500">
            <div className="flex flex-row">
              <img className=" w-[clamp(50px,9vw,100px)] h-auto" src={ednllogo} alt="Estrellas de Nuevo León" />
              <img className=" w-[clamp(50px,9vw,100px)] h-auto" src={b2blogo} alt="B2B Soluciones para la industria" />
            </div>
            <div className="flex flex-row gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="text-white w-5 h-auto" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook className="text-white w-5 h-auto" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaYoutube className="text-white w-5 h-auto" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="text-white w-5 h-auto" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <MdEmail className="text-white w-5 h-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed inset-0 z-40 pt-[97px]"
        >
          <div className="mx-auto px-4 py-8 bg-[#3B3B3C] grid grid-cols-2 md:grid-cols-4 gap-8 max-h-[calc(100vh-97px)] overflow-y-auto">
            <div>
              <p className="text-[#FFF200] mb-3 text-lg font-bold">Residente</p>
              <nav className="flex flex-col gap-2">
                {[
                  ["Nuestros medios", "https://www.estrellasdenuevoleon.com"],
                  ["Historia", "https://www.estrellasdenuevoleon.com/historia"],
                  ["Misión", "https://www.estrellasdenuevoleon.com/mision"],
                  ["Trabajo", "https://www.estrellasdenuevoleon.com/trabajo"],
                  ["Anúnciate", "https://www.estrellasdenuevoleon.com/anunciate"],
                  ["Input OpEd", "https://residente.mx/registro/"],
                  ["Input media", "https://residente.mx/colaboradores/"],
                  ["Input promo", "https://www.estrellasdenuevoleon.com/promo"],
                  ["Guía crítica", "https://residente.mx/guia-critica/"]
                ].map(([text, url]) => (
                  <Link
                    key={text}
                    to={url}
                    className="text-white hover:text-yellow-400"
                    onClick={() => setIsOpen(false)}
                  >
                    {text}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="text-[#FFF200] mb-3 text-lg font-bold">Noticias</p>
              <nav className="flex flex-col gap-2">
                {[
                  ["Opinión", ""],
                  ["Cultura restaurantera", "https://residente.mx/category/cultura-restaurantera/"],
                  ["Postres y snacks", "https://residente.mx/category/postres/"],
                  ["Comida y bebida", "https://residente.mx/category/fooddrink/"],
                  ["Perfiles y entrevistas", "https://residente.mx/category/perfiles/"],
                  ["Gastro destinos", "https://residente.mx/category/gastro-destinos/"]
                ].map(([text, url]) => (
                  <Link
                    key={text}
                    to={url}
                    className="text-white hover:text-yellow-400"
                    onClick={() => setIsOpen(false)}
                  >
                    {text}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="text-[#FFF200] mb-3 text-lg font-bold">Cultura gastronómica</p>
              <nav className="flex flex-col gap-2">
                {[
                  ["Estrellas de Nuevo León", "https://www.estrellasdenuevoleon.com.mx"],
                  ["Mapa Restaurantero de Nuevo León", ""],
                  ["Platillos Icónicos de Nuevo León", "https://www.estrellasdenuevoleon.com/platillos"],
                  ["Los rostros detrás del sabor", "https://www.estrellasdenuevoleon.com/rostros"],
                  ["Cuponera Residente", ""],
                  ["Etiqueta Restaurantera", "https://residente.mx/2022/01/13/del-restaurant-al-comensal/"],
                  ["Recetario Residente", ""]
                ].map(([text, url]) => (
                  <Link
                    key={text}
                    to={url}
                    className="text-white hover:text-yellow-400"
                    onClick={() => setIsOpen(false)}
                  >
                    {text}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[#FFF200] mb-3 text-lg font-bold">Guías zonales</p>
                <nav className="flex flex-col gap-2">
                  {[
                    ["Santiago", ""],
                    ["Centrito Valle", ""],
                    ["Barrio Antiguo", "https://residente.mx/category/barrio-antiguo/"],
                    ["Valle Poniente", ""]
                  ].map(([text, url]) => (
                    <Link
                      key={text}
                      to={url}
                      className="text-white hover:text-yellow-400"
                      onClick={() => setIsOpen(false)}
                    >
                      {text}
                    </Link>
                  ))}
                </nav>
              </div>

              <div>
                <p className="text-[#FFF200] mb-3 text-lg font-bold">Franquicias Nacionales</p>
                <nav className="flex flex-col gap-2">
                  {[
                    ["Residente Rivera Maya", ""],
                    ["Residente Saltillo", ""],
                    ["Residente Ciudad de México", ""]
                  ].map(([text, url]) => (
                    <Link
                      key={text}
                      to={url}
                      className="text-white hover:text-yellow-400"
                      onClick={() => setIsOpen(false)}
                    >
                      {text}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
