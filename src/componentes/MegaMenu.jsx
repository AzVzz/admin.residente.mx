"use client"
import './MegaMenu.css';

import { Link } from "react-router-dom"
import residenteAmarillo from "../imagenes/FoodDrinkMedia_Logo_Amarillo.png"
import ednllogo from "../imagenes/logos/blancos/Logo estrellas de NL_Mesa de trabajo 1 copia 3.png"
import b2blogo from "../imagenes/logos/blancos/B2BSoluciones_Logo_Blanco.png"
import { useState, useRef, useEffect } from "react"

import { FaInstagram } from "react-icons/fa"
import { FaFacebook } from "react-icons/fa6"
import { FaYoutube } from "react-icons/fa"
import { FaWhatsapp } from "react-icons/fa"
import { MdEmail } from "react-icons/md"

const MegaMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const [isMenuSectionsOpen, setIsMenuSectionsOpen] = useState(false);
    const [isGuiasOpen, setIsGuiasOpen] = useState(false);
    const [isFranquiciasOpen, setIsFranquiciasOpen] = useState(false);

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
            title: "Cultura gastronómica",
            items: [
                { name: "Estrellas de Nuevo León", url: "https://estrellasdenuevoleon.com.mx" },
                { name: "Mapa Restaurantero de Nuevo León", url: "#" },
                { name: "Platillos icónicos de Nuevo León", url: "https://www.estrellasdenuevoleon.com/platillos" },
                { name: "Los rostros detrás del sabor", url: "https://www.estrellasdenuevoleon.com/rostros" },
                { name: "Cuponera Residente", url: "#" },
                { name: "Etiqueta Restaurantera", url: "https://residente.mx/2022/01/13/del-restaurant-al-comensal/" },
                { name: "Recetario Residente", url: "#" },
            ],
        },
    }

    const menuSectionsGuias = {
        guias: {
            title: "Guías zonales",
            items: [
                { name: "Santiago", url: "#" },
                { name: "Centrito valle", url: "#" },
                { name: "Barrio Antiguo", url: "https://residente.mx/category/barrio-antiguo/" },
                { name: "Valle Poniente", url: "#" },
            ],
        }
    }

    const menuSectionsFranquicias = {
        franquicias: {
            title: "Franquicias Internacionales",
            items: [
                { name: "Residente Rivera Maya", url: "#" },
                { name: "Residente Saltillo", url: "#" },
                { name: "Residente Ciudad de México", url: "#" },
            ],
        }
    }

    return (
        <div className="relative" ref={menuRef}>
            {/* Header Principal */}
            <header className="bg-[#3B3B3C] text-white">
                {/* Contenedor 1 */}
                <div className="max-w-[1080px] mx-auto w-full contenedor-header-1">
                    {/* Contenedor 2 */}
                    <div className="flex items-center justify-between px-0 py-3 contenedor-header-2">
                        {/* Logo Principal */}
                        {/* Contenedor 3 */}
                        <div className="flex items-center contenedor-header-3">
                            <a
                                href="https://residente.mx/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0"
                            >
                                <img
                                    src={residenteAmarillo || "/placeholder.svg"} alt="Residente Food & Drink Media"
                                    className="object-contain h-8 w-auto max-w-[380px]  [@media(max-width:800px)]:h-12" />
                            </a>
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
                        {/* Contenedor 4 */}
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
                            <a
                                href="https://www.estrellasdenuevoleon.com/b2b" target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0"
                            >
                                <img
                                    src={b2blogo || "/placeholder.svg"}
                                    alt="B2B Soluciones"
                                    className="object-contain h-8 w-auto b2b"
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

                                {/* Icono de Búsqueda 
                                <button className="text-white hover:text-yellow-400 transition-colors ml-2">

                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg> 
                                </button>
                                */}
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

                                {/* Sección menuSections (todas las demás) (COMPUTADORA)*/}
                                {Object.entries(menuSections).map(([key, section]) => (
                                    <div key={key} className="space-y-4 secciones-container-computadora">
                                        <h3 className="text-[#FFF200] font-bold text-lg mb-1">{section.title}</h3>
                                        <ul className="">
                                            {section.items.map((item, index) => (
                                                <li key={index}>
                                                    <a
                                                        href={item.url}
                                                        target="_blank" // Abre en nueva pestaña
                                                        rel="noopener noreferrer" // Seguridad
                                                        className="text-white hover:text-[#FFF200] transition-colors text-base block py-[2px] font-roman"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        {item.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}

                                {/* Sección menuSections (todas las demás) (CELULAR)*/}
                                <div className="secciones-container-celular">
                                    {Object.entries(menuSections).map(([key, section]) => (
                                        <div
                                            className="mb-4"
                                            key={key}
                                        >
                                            <button
                                                className="flex items-center w-full justify-between"
                                                onClick={() => setIsMenuSectionsOpen(prev => prev === key ? null : key)}
                                            >
                                                <h3 className="text-[#FFF200] text-lg mb-1 text-left">{section.title}</h3>
                                                <svg
                                                    className={`w-5 h-5 text-[#FFF200] transition-transform duration-200 ${isMenuSectionsOpen === key ? "rotate-180" : ""
                                                        }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            <div>
                                                {isMenuSectionsOpen === key && (
                                                    <div className="pl-2">
                                                        {section.items.map((item, index) => (
                                                            <a
                                                                key={index}
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-roman text-white hover:text-[#FFF200] transition-colors text-base block py-1"
                                                                onClick={() => setIsMenuOpen(false)}
                                                            >
                                                                {item.name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    ))}
                                </div>

                                <div>
                                    {/* Sección Guías zonales con dropdown (CELULAR)*/}
                                    <div className="mb-4 secciones-container-celular">
                                        <button
                                            className="flex items-center w-full justify-between"
                                            onClick={() => setIsGuiasOpen(!isGuiasOpen)}
                                        >
                                            <h3 className="text-[#FFF200] text-lg mb-1 text-left">
                                                {menuSectionsGuias.guias.title}
                                            </h3>
                                            <svg
                                                className={`w-5 h-5 text-[#FFF200] transition-transform duration-200 ${isGuiasOpen ? "rotate-180" : ""
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <div>
                                            {isGuiasOpen && (
                                                <div className="pl-2">
                                                    {menuSectionsGuias.guias.items.map((item, index) => (
                                                        <a
                                                            key={index}
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-roman text-white hover:text-[#FFF200] transition-colors text-base block py-1"
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            {item.name}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sección Guías zonales (COMPUTADORA*/}
                                    {Object.entries(menuSectionsGuias).map(([key, section]) => (
                                        <div
                                            className="secciones-container-computadora"
                                            key={key}>
                                            <h3 className="text-[#FFF200] text-lg mb-1">{section.title}</h3>
                                            {section.items.map((item, index) => (
                                                <a
                                                    key={index}
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-roman text-white hover:text-[#FFF200] transition-colors text-base block py-1 cursor-pointer"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {item.name}
                                                </a>
                                            ))}
                                        </div>
                                    ))}

                                    {/* Sección Franquicias con dropdown (CELULAR)*/}
                                    <div className="mb-4 secciones-container-celular">
                                        <button
                                            className="flex items-center w-full justify-between"
                                            onClick={() => setIsFranquiciasOpen(!isFranquiciasOpen)}
                                        >
                                            <h3 className="text-[#FFF200] text-lg mb-1 text-left">
                                                {menuSectionsFranquicias.franquicias.title}
                                            </h3>
                                            <svg
                                                className={`w-5 h-5 text-[#FFF200] transition-transform duration-200 ${isFranquiciasOpen ? "rotate-180" : ""
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <div>
                                            {isFranquiciasOpen && (
                                                <div className="pl-2">
                                                    {menuSectionsFranquicias.franquicias.items.map((item, index) => (
                                                        <a
                                                            key={index}
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-white hover:text-[#FFF200] transition-colors text-base block py-1 font-roman"
                                                        >
                                                            {item.name}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sección Franquicias (COMPUTADORA*/}
                                    {Object.entries(menuSectionsFranquicias).map(([key, section]) => (
                                        <div
                                            className="secciones-container-computadora"
                                            key={key}
                                        >
                                            <h3 className="text-[#FFF200] text-lg mb-1">{section.title}</h3>
                                            {section.items.map((item, index) => (
                                                <a
                                                    key={index}
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-roman text-white hover:text-[#FFF200] transition-colors text-base block py-1 cursor-pointer"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {item.name}
                                                </a>
                                            ))}
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
