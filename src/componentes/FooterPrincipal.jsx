// Puedes usar react-icons para los íconos sociales
import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { urlApi } from './api/url';

const FooterPrincipal = () => {
    return (
        <footer className="bg-[#3b3b3c] text-white py-8 mt-8">
            <div className="max-w-[1080px] mx-auto px-4">
                {/* Primera fila: FoodDrinkMedia + iconos sociales */}
                <div className="flex sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-2">
                    <div className="flex items-center gap-3">
                        <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/fooddrinkmedia-logo-blanco.webp`} alt="FoodDrinkMedia" className="w-full sm:h-10 object-contain" />
                    </div>
                    <div className="flex gap-2">
                        <a href="http://instagram.com/residentemty" target="_blank" rel="noopener noreferrer"><FaInstagram className="w-auto sm:h-7 h-4 text-white hover:text-gray-400" /></a>
                        <a href="http://facebook.com/residentemx" target="_blank" rel="noopener noreferrer"><FaFacebookF className="w-auto sm:h-7 h-4 text-white hover:text-gray-400" /></a>
                        <a href="http://youtube.com/@revistaresidente5460" target="_blank" rel="noopener noreferrer"><FaYoutube className="w-auto sm:h-7 h-4 text-white hover:text-gray-400" /></a>
                        <a href="tel:+528114186987" target="_blank" rel="noopener noreferrer"><FaWhatsapp className="w-auto sm:h-7 h-4 text-white hover:text-gray-400" /></a>
                        <a href="mailto:contacto@residente.mx?subject=%C2%A1Quiero%20mas%20informaci%C3%B3n%20de%20Residente!"><FaEnvelope className="w-auto sm:h-7 h-4 text-white hover:text-gray-400" /></a>
                    </div>
                </div>
                {/* Segunda fila: Grid de 7 columnas */}
                <div className="grid sm:grid-cols-7 grid-cols-4 gap-9 mb-8">
                    {/* Columna 1 */}
                    <div>
                        <h4 className="mb-3 text-[10px] sm:text-xl leading-3 sm:leading-4">Productos al consumidor</h4>
                        <div className="flex flex-col gap-5">
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/magazine-logo-blanco.webp`} alt="Magazine"
                                className="sm:w-25 w-13 h-auto object-contain"
                            />
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/guia-logo-blanco.webp`} alt="Guia"
                                className="sm:w-25 w-13 h-auto object-contain"
                            />
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/discpromo-logo-blanco.webp`} alt="DiscPromo"
                                className="sm:w-25 w-13 h-auto object-contain"
                            />
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/books-logo-blanco.webp`} alt="Books"
                                className="sm:w-25 w-13 h-auto object-contain"
                            />
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/residente-video-logo-blanco.webp`} alt="Video"
                                className="sm:w-25 w-13 h-auto object-contain"
                            />
                        </div>
                    </div>
                    {/* Columna 2 */}
                    <div>
                        <h4 className="mb-3 text-[10px] sm:text-xl leading-3 sm:leading-4">Soluciones para la industria</h4>
                        <div className="flex flex-col gap-5">
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/newsletter-logo-blanco.webp`} alt="Newsletter"
                                className="sm:w-25 w-13 h-auto object-contain"
                            />
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/researchdata-logo-blanco.webp`} alt="ResearchData"
                                className="sm:w-25 w-13 h-auto object-contain"
                            />
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/residente-restauranat-networking.webp`} alt="Networking"
                                className="sm:w-25 w-13 h-auto object-contain"
                            />
                        </div>
                    </div>
                    {/* Columna 3 */}
                    <div>
                        <h4 className="mb-3 text-[10px] sm:text-xl leading-3 sm:leading-4">Proyectos culturales</h4>
                        <div className="flex flex-col gap-5">
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/platillos-logo-blanco.webp`} alt="Platillos" className="sm:w-25 w-13 h-auto object-contain" />
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/logo-estrellas-de-nl.webp`} alt="Estrellas de NL" className="sm:w-25 w-13 h-auto object-contain" />
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/rostros-logo-blanco.webp`} alt="Rostros" className="sm:w-25 w-13 h-auto object-contain" />
                        </div>
                    </div>
                    {/* Columna 4 */}
                    <div>
                        <h4 className="mb-3 text-[10px] sm:text-xl leading-3 sm:leading-4">Convenios institucionales</h4>
                        <div className="flex flex-col gap-5">
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/afirme-logo.webp`} alt="Afirme" className="sm:w-25 w-13 h-auto object-contain" />
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/canirac-logo.webp`} alt="Canirac" className="sm:w-25 w-13 h-auto object-contain" />
                            <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/usda-blanco.webp`} alt="USDA" className="sm:w-25 w-13 h-auto object-contain" />
                        </div>
                    </div>
                    {/* Columna 5 */}
                    <div></div>
                    {/* Columna 6 */}
                    <div></div>
                    {/* Columna 7 */}
                    <div className="sm:flex flex-col gap-0 items-center hidden">
                        <a href="/" className="hover:underline text-right w-full">Inicio</a>
                        <a href="/historia" className="hover:underline text-right w-full">Historia</a>
                        <a href="/mision" className="hover:underline text-right w-full">Misión</a>
                        <a href="/trabajo" className="hover:underline text-right w-full">Trabajo</a>
                        <a href="/anunciate" className="hover:underline text-right w-full">Anúnciate</a>
                        <a href="/noticias" className="hover:underline text-right w-full">Noticias</a>
                        {/* Botón para ir arriba */}
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="mt-4 text-6xl font-thin text-right w-full text-white hover:text-gray-400 transition-colors cursor-pointer"
                            aria-label="Ir arriba"
                        >
                            ^
                        </button>
                    </div>
                </div>
                {/* Pie de página */}
                <div className="flex justify-center items-center gap-5 mb-4">
                    <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/relevant-logo-blanco.webp`} alt="RELEVANT" className="w-25 h-5" />
                    <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/endeavor-logo-blanco.webp`} alt="Endeavor" className="w-25 h-5 -mt-2" />
                </div>
                <div className="text-center text-[10px] text-gray-400">
                    Copyright (C) Residente Restaurant Media 2024. Todos los derechos reservados.
                    <br />
                    Ninguna parte de este sitio web puede ser reproducida, por ningún medio electrónico o mecánico, incluyendo sistemas de almacenamiento y recuperación de información, sin el permiso previo por escrito de Residente.
                    Se exceptúan los críticos o reseñistas, quienes podrán citar breves fragmentos del contenido escrito, pero no del material gráfico.
                </div>
            </div>
        </footer>
    );
};

export default FooterPrincipal;