import NewsLetter from '../../../../imagenes/bannerRevista/Newsletter.webp';
import LogoNewsLetter from '../../../../imagenes/logos/grises/LogoNewsLetter.png';
import ResidenteNewsLetter from '../../../../imagenes/logos/grises/ResidenteRestaurantNewsLetter.png'
//            <p className="text-[20px]">Suscríbete a nuestro newsletter</p>
//            <label className="block text-sm font-medium text-gray-900 mb-1">
//                Correo electrónico *
//            </label>
//https://estrellasdenuevoleon.com.mx/fotos/fotos-estaticas/componente-news-letter/Newsletter.webp
import { urlApi } from '../../../../componentes/api/url.js'
const BotonesAnunciateSuscribirme = () => {
    return (
        <div className="flex flex-col mb-5 gap-3  mx-10">
            <div className="flex justify-between gap-3">
                <img src={`${urlApi}/fotos/fotos-estaticas/componente-news-letter/Newsletter.webp`} className="h-60 object-contain " />
                <div className="flex flex-col justify-between items-end">
                    <img src={ResidenteNewsLetter} className="" />
                    <p className="leading-4.5 text-[16px]">Todos los jueves sé el primero en recibir lo más relevante y las promociones restauranteras de Nuevo León.</p>
                </div>
            </div>
            {/* Solo este div tiene padding */}
            <div className="flex flex-row items-center justify-end">
                <div className="flex items-center rounded  max-w-[320px] w-full gap-3">
                    <input
                        type="text"
                        placeholder="Ingresa tu correo electrónico"
                        className="bg-white p-2 h-10 rounded-l border border-gray-300 w-45.5 text-xs"
                    />
                    <button className="flex justify-center items-center bg-black h-10 text-white uppercase cursor-pointer px-2.5 rounded-r text-sm">
                        Signup
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BotonesAnunciateSuscribirme;