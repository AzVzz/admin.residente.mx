import DetallePost from './DetallePost';
import MainLateralPostTarjetas from './componentesColumna2/MainLateralPostTarjetas';
import BotonesAnunciateSuscribirme from './componentesColumna1/BotonesAnunciateSuscribirme';
import DirectorioVertical from './componentesColumna2/DirectorioVertical';
import { urlApi } from '../../api/url.js';
import BarraMarquee from './seccionesCategorias/componentes/BarraMarquee.jsx';
import CincoNotasRRR from './seccionesCategorias/componentes/CincoNotasRRR.jsx';
import EnPortada from './componentesColumna2/EnPortada';
import VideosHorizontal from './componentesColumna2/VideosHorizontal';
import SeccionesPrincipales from './SeccionesPrincipales';
import CuponesCarrusel from './seccionesCategorias/componentes/CuponesCarrusel.jsx';
import PortadaRevista from './componentesColumna2/PortadaRevista.jsx';
import Infografia from './componentesColumna1/Infografia.jsx';


const DetalleBannerRevista = ({
    detalleCargando,
    errorDetalle,
    handleVolver,
    selectedPost,
    tiposNotas,
    notasDestacadas,
    revistaActual,
    handleCardClick,
    notasResidenteGet,
    cupones = []
}) => {
    // Obtener el tipo de nota del post seleccionado
    const tipo = selectedPost?.tipo_nota;

    const showCupones =
        ["Antojos", "Gastro-Destinos", "Food & Drink", "Restaurantes"].includes(tipo) &&
        Array.isArray(cupones) &&
        cupones.length > 0;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9 mb-2 pt-9">
                {/* Columna Principal - Detalle */}
                <div>
                    {/* Logo del tipo de nota */}
                    {tipo && (
                        (() => {
                            const tipoConfig = tiposNotas.find(t => t.nombre === tipo) || {};
                            const tipoLogo = tipoConfig.tipoLogo
                                ? tipoConfig.tipoLogo.startsWith('http')
                                    ? tipoConfig.tipoLogo
                                    : `${urlApi}${tipoConfig.tipoLogo}`
                                : null;
                            return tipoLogo ? (
                                <div className="relative flex justify-center items-center mb-6">
                                    <div className="absolute left-0 right-0 top-1/2 border-t-4 border-transparent opacity-100 z-0" aria-hidden="true" />
                                    <div className="relative z-10 px-4">
                                        <img
                                            src={tipoLogo}
                                            alt={tipo}
                                            className={tipo === "Antojos" ? "h-auto w-60 object-contain" : "h-auto w-60 object-contain"}
                                        />
                                    </div>
                                </div>
                            ) : null;
                        })()
                    )}

                    {detalleCargando ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : errorDetalle ? (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        Error al cargar el detalle: {errorDetalle?.message}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleVolver}
                                className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Volver
                            </button>
                        </div>
                    ) : (
                        <DetallePost
                            post={selectedPost}
                            onVolver={handleVolver}
                            barraMarquee={
                                tipo && (
                                    tiposNotas.find(t => t.nombre === tipo)?.marqueeTexto ||
                                    "Residente - Lo mejor de la gastronomía de Nuevo León"
                                )
                            }
                            revistaActual={revistaActual}
                        />
                    )}
                </div>

                {/* Columna lateral */}
                <div className="flex flex-col items-end justify-start gap-10">
                    <DirectorioVertical />
                    <PortadaRevista />
                    <MainLateralPostTarjetas
                        notasDestacadas={
                            selectedPost
                                ? notasDestacadas.filter(
                                    nota => nota.tipo_nota === tipo || nota.tipo_nota2 === tipo
                                )
                                : []
                        }
                        onCardClick={handleCardClick}
                        pasarObjeto={false}
                        cantidadNotas={5}
                    />
                    <div className="mt-4">
                        <BotonesAnunciateSuscribirme />
                    </div>

                    <Infografia />
                </div>
            </div>

            {/* Secciones adicionales según el tipo de nota */}
            {tipo === "Restaurantes" && (
                <>
                    <div className="relative flex justify-center items-center mb-4">
                        <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                        <div className="relative z-10 px-4 bg-[#DDDDDE]">
                            <div className="flex flex-row justify-center items-center gap-2">
                                <img src={`http://localhost:3000/fotos/fotos-estaticas/listado-iconos-100estrellas/favoritsdelpublico.avif`} className="w-7.5 h-full object-contain rounded-full" />
                                <img className="h-full w-95" src={'https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/nuestras-recomendaciones.webp'} />
                                <img src={`http://localhost:3000/fotos/fotos-estaticas/listado-iconos-100estrellas/favoritsdelpublico.avif`} className="w-7.5 h-full object-contain rounded-full" />
                            </div>
                            <div className="text-center mt-1">
                                <span className="text-[12px] font-semibold tracking-wide">
                                    {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="pb-5">
                        <CincoNotasRRR tipoNota="Restaurantes" onCardClick={(nota) => handleCardClick(nota.id)} />
                    </div>
                    <EnPortada
                        notasResidenteGet={notasResidenteGet}
                        onCardClick={(nota) => handleCardClick(nota.id)}
                    />
                    <div className="relative flex justify-center items-center mb-4">
                    </div>
                   
                    <SeccionesPrincipales />
                </>
            )}

            {tipo === "Antojos" && (
                <>
                    <VideosHorizontal />
                    <SeccionesPrincipales />
                </>
            )}

            {tipo === "Food & Drink" && (
                <>
                    <div className="relative flex justify-center items-center mb-4">
                        <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                        <div className="relative z-10 px-4 bg-[#DDDDDE]">
                            <div className="flex flex-row justify-center items-center gap-3">
                                <img src={`http://localhost:3000/fotos/fotos-estaticas/residente-logos/grises/platillos-iconicos.webp`} className="w-full h-8 object-contain" />
                            </div>
                        </div>
                    </div>
                    <div className="pb-5">
                        <CincoNotasRRR tipoNota="Food & Drink" onCardClick={(nota) => handleCardClick(nota.id)} />
                    </div>
                    <SeccionesPrincipales />
                </>
            )}

            {tipo === "Gastro-Destinos" && (
                <>
                    <SeccionesPrincipales />
                </>
            )}
        </>
    );
};

export default DetalleBannerRevista;