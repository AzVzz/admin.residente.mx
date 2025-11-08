"use client"
import './MegaMenu.css';

import { Link } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { catalogoHeadersGet } from './api/CatalogoSeccionesGet';

import { FaInstagram } from "react-icons/fa"
import { FaFacebook } from "react-icons/fa6"
import { FaYoutube } from "react-icons/fa"
import { FaWhatsapp } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import { urlApi, imgApi } from './api/url';


const MegaMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const [isMenuSectionsOpen, setIsMenuSectionsOpen] = useState(null);
    const [menuHeader, setMenuHeader] = useState([]);

    useEffect(() => {
        catalogoHeadersGet()
            .then(data => setMenuHeader(data))
            .catch(() => setMenuHeader([]));
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="relative" ref={menuRef}>
            {/* Header Principal */}
            <header className="bg-[#3B3B3C] text-white">
                {/* Contenedor 1 */}
                <div className="max-w-[1080px] mx-auto w-full contenedor-header-1">
                    {/* Contenedor 2 */}
                    <div className="flex items-center justify-between px-0 py-3 contenedor-header-2">
                        {/* Logo Principal */}
                        <div className="flex items-center contenedor-header-3">
                            <Link to="/" className="flex-shrink-0">
                                <img
                                    src={`${imgApi}fotos/fotos-estaticas/residente-logos/food-drink-media-logo-amarillo.webp` || "/placeholder.svg"} alt="Residente Food & Drink Media"
                                    className="object-contain h-8 w-auto max-w-[380px]  [@media(max-width:800px)]:h-12" />
                            </Link>
                            <button onClick={toggleMenu} className="flex items-center space-x-2 hover:opacity-80 transition-opacity pl-3 pr-3">
                                <svg
                                    className={`w-6 h-6 text-[#FFF200] transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Logos y Redes Sociales */}
                        <div className="flex items-center space-x-4 contenedor-header-4">
                            <button onClick={toggleMenu} className="flex items-center space-x-2 hover:opacity-80 transition-opacity pl-3 pr-3">
                                <svg
                                    className={`w-6 h-6 text-[#FFF200] transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {/* se elimino el href */}
                            <a
                                href="/b2b"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0"
                            >
                                <img
                                    src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/B2BSoluciones-logo-blanco.webp` || "/placeholder.svg"}
                                    alt="B2B Soluciones"
                                    className="object-contain h-8 w-auto b2b"
                                    onError={e => { e.target.src = "/placeholder.svg"; }}
                                />
                            </a>

                            {/* Iconos de Redes Sociales */}
                            <div className="flex flex-row gap-3 justify-between">
                                <a href="https://www.instagram.com/residentemty/" className="text-white hover:text-[#FFF200] transition-colors">
                                    <FaInstagram size={20} />
                                </a>
                                <a href="https://www.facebook.com/residentemx" className="text-white hover:text-[#FFF200] transition-colors">
                                    <FaFacebook size={20} />
                                </a>
                                <a href="https://www.youtube.com/@revistaresidente5460" className="text-white hover:text-[#FFF200] transition-colors">
                                    <FaYoutube size={20} />
                                </a>
                                <a href="tel:+528114186987" className="text-white hover:text-[#FFF200] transition-colors">
                                    <FaWhatsapp size={20} />
                                </a>
                                <a href="mailto:contacto@residente.mx?subject=%C2%A1Quiero%20m%C3%A1s%20informaci%C3%B3n%20de%20Residente!" className="text-white hover:text-[#FFF200] transition-colors">
                                    <MdEmail size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menú Desplegable */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 w-full z-50 bg-[#3B3B3C] border-t border-gray-600 shadow-xl">
                        <div className="max-w-[1080px] mx-auto w-full pt-2">
                            {/* Subtítulo */}
                            <div className="px-0 py-3 border-b border-[#3B3B3C]">
                                <p className="text-[clamp(.7rem,1.4vw,1rem)] text-white uppercase tracking-wide">
                                    TODOS LOS RESTAURANTES, ALIMENTOS, BEBIDAS, POSTRES Y EXPERIENCIAS GASTRONÓMICAS DE NUEVO LEÓN
                                </p>
                            </div>

                            {/* Grid de Secciones del Menú */}
                            <div className="flex flex-row gap-8 px-0 pb-8 justify-between contenedor-header-menu">

                                {/* Secciones del menú (COMPUTADORA) */}
                                {menuHeader.map((section, idx) => (
                                    <div key={idx} className="space-y-4 secciones-container-computadora">
                                        {section.submenu ? (
                                            <>
                                                <h3 className="text-[#FFF200] font-bold text-lg mb-1">{section.seccion}</h3>
                                                <ul>
                                                    {section.submenu.map((item, subIdx) => (
                                                        <li key={subIdx}>
                                                            <a
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-white hover:text-[#FFF200] transition-colors text-base block py-[2px] font-roman"
                                                                onClick={() => setIsMenuOpen(false)}
                                                            >
                                                                {item.nombre}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        ) : (
                                            <ul>
                                                <li>
                                                    <a
                                                        href={section.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#FFF200] font-bold text-lg mb-1 block" // amarillo como título
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        {section.seccion}
                                                    </a>
                                                </li>
                                            </ul>
                                        )}
                                    </div>
                                ))}

                                {/* Secciones del menú (CELULAR) */}
                                <div className="secciones-container-celular">
                                    {menuHeader.map((section, idx) => (
                                        <div className="mb-4" key={idx}>
                                            <button
                                                className="flex items-center w-full justify-between"
                                                onClick={() => setIsMenuSectionsOpen(prev => prev === idx ? null : idx)}
                                            >
                                                <h3 className="text-[#FFF200] text-lg mb-1 text-left">{section.seccion}</h3>
                                                <svg
                                                    className={`w-5 h-5 text-[#FFF200] transition-transform duration-200 ${isMenuSectionsOpen === idx ? "rotate-180" : ""}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            <div>
                                                {isMenuSectionsOpen === idx && (
                                                    <div className="pl-2">
                                                        {section.url ? (
                                                            <a
                                                                href={section.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-roman text-white hover:text-[#FFF200] transition-colors text-base block py-1"
                                                                onClick={() => setIsMenuOpen(false)}
                                                            >
                                                                {section.seccion}
                                                            </a>
                                                        ) : (
                                                            section.submenu && section.submenu.map((item, subIdx) => (
                                                                <a
                                                                    key={subIdx}
                                                                    href={item.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-roman text-white hover:text-[#FFF200] transition-colors text-base block py-1"
                                                                    onClick={() => setIsMenuOpen(false)}
                                                                >
                                                                    {item.nombre}
                                                                </a>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </div>
    )
}

export default MegaMenu