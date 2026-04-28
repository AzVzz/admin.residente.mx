import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp, FaEnvelope, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { imgApi } from "./api/url";

const FooterPrincipal = () => {
  return (
    <>
      {/* ─── FOOTER MÓVIL ─── */}
      <footer className="sm:hidden bg-[#3b3b3c] text-white py-4 px-4">
        <div className="flex flex-col items-center gap-3">
          <img
            src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/fooddrinkmedia-logo-blanco.webp`}
            alt="FoodDrinkMedia"
            className="h-6 w-auto object-contain"
          />
          <div className="flex gap-4 items-center">
            <a href="http://instagram.com/residentemty" target="_blank" rel="noopener noreferrer"><FaInstagram className="w-5 h-5 text-white hover:text-gray-400" /></a>
            <a href="http://facebook.com/residentemx" target="_blank" rel="noopener noreferrer"><FaFacebookF className="w-5 h-5 text-white hover:text-gray-400" /></a>
            <a href="http://youtube.com/@revistaresidente5460" target="_blank" rel="noopener noreferrer"><FaYoutube className="w-5 h-5 text-white hover:text-gray-400" /></a>
            <a href="https://x.com/Residente_mty" target="_blank" rel="noopener noreferrer"><FaXTwitter className="w-5 h-5 text-white hover:text-gray-400" /></a>
            <a href="tel:+528114186985" target="_blank" rel="noopener noreferrer"><FaWhatsapp className="w-5 h-5 text-white hover:text-gray-400" /></a>
          </div>
          <div className="text-center text-[10px] text-gray-400 leading-tight">
            © Residente Restaurante Media 2024
          </div>
        </div>
      </footer>

      {/* ─── FOOTER DESKTOP ─── */}
      <footer className="hidden sm:block bg-[#3b3b3c] text-white py-8">
        <div className="max-w-[1080px] mx-auto px-4">
          {/* Primera fila: logo + iconos sociales */}
          <div className="flex sm:flex-row justify-between items-center gap-2 mx-9">
            <div className="flex items-start">
              <img
                src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/fooddrinkmedia-logo-blanco.webp`}
                alt="FoodDrinkMedia"
                className="w-full sm:h-10 object-contain"
              />
              <span className="w-20 text-white font-roman text-[9px] font-bold leading-none uppercase tracking-tighter pt-3">EST. 2015</span>
            </div>
            <div className="flex gap-2 items-center">
              <a href="http://instagram.com/residentemty" target="_blank" rel="noopener noreferrer"><FaInstagram className="w-5 h-5 text-white hover:text-gray-400" /></a>
              <a href="http://facebook.com/residentemx" target="_blank" rel="noopener noreferrer"><FaFacebookF className="w-5 h-5 text-white hover:text-gray-400" /></a>
              <a href="http://youtube.com/@revistaresidente5460" target="_blank" rel="noopener noreferrer"><FaYoutube className="w-5 h-5 text-white hover:text-gray-400" /></a>
              <a href="https://x.com/Residente_mty" target="_blank" rel="noopener noreferrer"><FaXTwitter className="w-5 h-5 text-white hover:text-gray-400" /></a>
              <a href="https://www.linkedin.com/company/residente/" target="_blank" rel="noopener noreferrer"><FaLinkedin className="w-5 h-5 text-white hover:text-gray-400" /></a>
              <a href="tel:+528114186985" target="_blank" rel="noopener noreferrer"><FaWhatsapp className="w-5 h-5 text-white hover:text-gray-400" /></a>
              <a href="mailto:contacto@residente.mx?subject=%C2%A1Quiero%20mas%20informaci%C3%B3n%20de%20Residente!"><FaEnvelope className="w-5 h-5 text-white hover:text-gray-400" /></a>
            </div>
          </div>
          <div className="mb-8 sm:mb-12 -mt-1 leading-[0.9]">
            <span className="text-white font-roman text-[12px] ml-22 leading-[0.9]">Toda la riqueza gastronómica de Nuevo León ordenada y en un solo lugar</span>
          </div>

          {/* Grid de 8 columnas */}
          <div className="grid grid-cols-4 sm:grid-cols-[1.2fr_0.8fr_0.8fr_1fr_1.5fr_1.4fr_1fr_1.05fr] mb-18 mx-9">
            {/* Columna 1: Canales digitales */}
            <div className="mr-[26px]">
              <h3 className="uppercase mb-6 text-[10px] sm:text-[12px] text-center leading-3 sm:leading-[1]">
                Canales <br /> digitales
              </h3>
              <div className="flex flex-col gap-5 items-center">
                <a href="https://residente.mx" aria-label="residente.mx">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/logo%20residente.mx-99-100.png`} alt="residente.mx" className="sm:w-22 w-8 h-auto object-contain" />
                </a>
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/newsletter-logo-blanco.webp`} alt="Residente Restaurante Newsletter" className="sm:w-18 w-8 h-auto object-contain" />
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/residente-video-logo-blanco.webp`} alt="Residente Restaurante Video" className="sm:w-18 w-8 h-auto object-contain" />
              </div>
            </div>

            {/* Columna 2: Medios impresos */}
            <div className="mr-[34px]">
              <h3 className="uppercase mb-6 text-[10px] sm:text-[12px] text-center leading-3 sm:leading-[1]">
                Medios impresos
              </h3>
              <div className="flex flex-col gap-5 items-center">
                <a href="https://residente.mx/seccion/niveldegasto/categoria/finedining" aria-label="Guia NL Directorio">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/guia-logo-blanco.webp`} alt="Guia NL Directorio" className="sm:w-20 w-8 h-auto object-contain" />
                </a>
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/magazine-logo-blanco.webp`} alt="Residente Restaurante Magazine" className="sm:w-18 w-8 h-auto object-contain" />
                <a href="https://residente.mx/magazine-historia" aria-label="Residente Restaurante Books">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/books-logo-blanco.webp`} alt="Residente Restaurante Books" className="sm:w-18 w-8 h-auto object-contain" />
                </a>
              </div>
            </div>

            {/* Columna 3: Proyectos culturales */}
            <div className="mr-[34px]">
              <h3 className="uppercase mb-6 text-[10px] sm:text-[12px] text-center leading-3 sm:leading-[1]">
                Proyectos culturales
              </h3>
              <div className="flex flex-col gap-5 items-center">
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/logo-estrellas-de-nl.webp`} alt="Estrellas de Nuevo León" className="sm:w-19 w-8 h-auto object-contain" />
                <a href="https://residente.mx/platillos" aria-label="Platillos icónicos de Nuevo León">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/platillos-logo-blanco.webp`} alt="Platillos icónicos de Nuevo León" className="sm:w-15 w-8 h-auto object-contain" />
                </a>
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/rostros-logo-blanco.webp`} alt="Los Rostros detrás del sabor" className="sm:w-14 w-8 h-auto object-contain" />
              </div>
            </div>

            {/* Columna 4: Guias Zonales */}
            <div className="mr-[28px]">
              <h3 className="uppercase mb-6 text-[10px] sm:text-[12px] text-center leading-3 sm:leading-[1]">
                Guias <br /> Zonales
              </h3>
              <div className="flex flex-col items-center justify-center gap-3.5">
                <a href="https://residente.mx/seccion/zona/categoria/zonatec" aria-label="Zona Tec">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/ZONA%20TEC%20.png`} alt="Zona Tec" className="sm:w-14 w-8 h-auto object-contain" />
                </a>
                <a href="https://residente.mx/seccion/zona/categoria/cumbres" aria-label="Cumbres">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/CUMBRES.png`} alt="Cumbres" className="sm:w-14 w-8 h-auto object-contain" />
                </a>
                <a href="https://residente.mx/seccion/zona/categoria/sanpedro" aria-label="San Pedro">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/SAN%20PEDRO.png`} alt="San Pedro" className="sm:w-15 w-8 h-auto object-contain" />
                </a>
                <a href="https://residente.mx/seccion/zona/categoria/guadalupe" aria-label="Guadalupe">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/GUADALUPE.png`} alt="Guadalupe" className="sm:w-16 w-8 h-auto object-contain" />
                </a>
                <a href="https://residente.mx/seccion/zona/categoria/monterreycentro" aria-label="Monterrey Centro">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/MONTERREY.png`} alt="Monterrey Centro" className="sm:w-17 w-8 h-auto object-contain" />
                </a>
                <a href="https://residente.mx/seccion/zona/categoria/norte" aria-label="Norte">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/NORTE.png`} alt="Norte" className="sm:w-9 w-8 h-auto object-contain" />
                </a>
                <a href="https://residente.mx/seccion/zona/categoria/carretera" aria-label="Carretera">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/CARRETERA.png`} alt="Carretera" className="sm:w-16 w-8 h-auto object-contain" />
                </a>
                <a href="https://residente.mx/seccion/zona/categoria/sannicolas" aria-label="San Nicolas">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/SAN%20NICOLA%CC%81S.png`} alt="San Nicolas" className="sm:w-19 w-8 h-auto object-contain" />
                </a>
              </div>
            </div>

            {/* Columna 5: Rutas Gastronómicas */}
            <div className="mr-[28px]">
              <h3 className="uppercase mb-6 text-[10px] sm:text-[12px] text-center leading-3 sm:leading-[1]">
                Rutas Gastronomicas
              </h3>
              <div className="text-white font-bebas font-medium text-[11px] uppercase text-center block tracking-[-0.04em] leading-[1] space-y-3">
                <a href="https://residente.mx/taquerias-iconicas" className="block hover:text-gray-400">Taquerías icónicas de Nuevo León</a>
                <a href="https://residente.mx/cantinas" className="block hover:text-gray-400">Ruta de Cantinas de Nuevo León</a>
                <a href="https://residente.mx/cafes" className="block hover:text-gray-400">Cafés Independientes de Nuevo León</a>
                <a href="https://residente.mx/mercados" className="block hover:text-gray-400">Ruta de Mercados de Nuevo León</a>
                <a href="https://residente.mx/panaderias-colonia" className="block hover:text-gray-400">Panaderías de Colonia de Nuevo León</a>
                <a href="https://residente.mx/reposterias" className="block hover:text-gray-400">Reposterias icónicas de Nuevo León</a>
              </div>
            </div>

            {/* Columna 6: Soluciones para la industria */}
            <div className="mr-[20px]">
              <h3 className="uppercase mb-6 text-[10px] sm:text-[12px] text-center leading-3 sm:leading-[1]">
                Soluciones para la industria
              </h3>
              <div className="flex flex-col gap-4 items-center">
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/Club%20residente%20blanco.png`} alt="Club Residente Facil" className="sm:w-40 w-30 h-auto object-contain" />
                <a href="https://residente.mx/admin/banners" aria-label="Banner Facil">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/BANNER%20FA%CC%81CIL%20POR%20RESIDENTE-94.png`} alt="Banner Facil" className="sm:w-18 w-8 h-auto object-contain pb-1" />
                </a>
                <a href="https://residente.mx/residente-restaurant-research" aria-label="Residente Restaurante Research&Data">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/researchdata-logo-blanco.webp`} alt="Residente Restaurante Research&Data" className="sm:w-20 w-8 h-auto object-contain pb-1" />
                </a>
                <a href="https://residente.mx/soluciones-para-la-industria" aria-label="Residente Restaurante Networking">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/residente-restauranat-networking.webp`} alt="Residente Restaurante Networking" className="sm:w-19 w-8 h-auto object-contain" />
                </a>
                <a href="https://residente.mx/admin/B2C" aria-label="Etiqueta Restaurantera">
                  <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/Logo%20de%20etiqueta%20restaurantera%20blanco.png`} alt="Etiqueta Restaurantera" className="sm:w-19 w-8 h-auto object-contain" />
                </a>
              </div>
            </div>

            {/* Columna 7: Aliados institucionales */}
            <div className="mr-[20px]">
              <h3 className="uppercase mb-6 text-[10px] sm:text-[12px] text-center leading-3 sm:leading-[1]">
                Aliados institucionales
              </h3>
              <div className="flex flex-col gap-5 items-center">
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/canirac-logo.webp`} alt="Canirac" className="sm:w-18 w-8 h-auto object-contain" />
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/usda-blanco.webp`} alt="USDA" className="sm:w-13 w-8 h-auto object-contain" />
              </div>
            </div>

            {/* Columna 8: Infraestructura tecnológica */}
            <div>
              <h3 className="uppercase mb-6 text-[10px] sm:text-[12px] text-center leading-3 sm:leading-[1]">
                Infraestructura tecnologica
              </h3>
              <div className="flex flex-col items-center">
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/google-analytics%20logo%20blanco.png`} alt="Google Analytics" className="sm:w-12 w-13 h-auto object-contain mb-5" />
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/META%20BUSINESS%20SUITE%20BLANCO%20%281%29.png`} alt="Meta Business" className="sm:w-20 w-10 h-auto object-contain mb-4" />
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/mailchimp%20logo%20blanco.png`} alt="Mailchimp" className="sm:w-15 w-13 h-auto object-contain mb-3" />
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/GOOGLE%20TAG%20MANAGER%20BLANCO%20%281%29.png`} alt="Google Tag Manager" className="sm:w-22 w-13 h-auto object-contain mb-3" />
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/Stripe%20Logo%20blanco.png`} alt="Stripe" className="sm:w-10 w-13 h-auto object-contain mb-5" />
                <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/LOGO_IONOS_White_RGB.png`} alt="IONOS" className="sm:w-10 w-10 h-auto object-contain" />
              </div>
            </div>
          </div>

          {/* Pie de página */}
          <div className="flex justify-center items-center gap-5 mb-4">
            <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/relevant-logo-blanco.webp`} alt="RELEVANT Media Company Builder" className="sm:w-25 w-10 h-auto object-contain" />
            <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/blancos/endeavor-logo-blanco.webp`} alt="Endeavor" className="sm:w-25 w-10 h-auto object-contain" />
          </div>
          <div className="text-center text-[14px] text-gray-300 mb-4 font-medium">
            Residente: Periodismo Gastronómico y la mejor guía de Restaurantes en Monterrey.
          </div>
          <div className="text-center text-[12px] text-gray-400">
            Copyright (C) Residente Restaurante Media 2024. Todos los derechos reservados.
            <br />
            Ninguna parte de este sitio web puede ser reproducida, por ningún medio electrónico o mecánico, incluyendo sistemas de almacenamiento y recuperación de información, sin el permiso previo por escrito de Residente. Se exceptúan los críticos o reseñistas, quienes podrán citar breves fragmentos del contenido escrito, pero no del material gráfico.
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterPrincipal;
