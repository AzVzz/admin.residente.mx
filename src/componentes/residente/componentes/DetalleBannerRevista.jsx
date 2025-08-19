import DetallePost from './DetallePost';
import MainLateralPostTarjetas from './componentesColumna2/MainLateralPostTarjetas';
import BotonesAnunciateSuscribirme from './componentesColumna1/BotonesAnunciateSuscribirme';
import DirectorioVertical from './componentesColumna2/DirectorioVertical';
import { urlApi } from '../../api/url.js'; // Ajusta la ruta si es necesario
import BarraMarquee from './seccionesCategorias/componentes/BarraMarquee.jsx';

const DetalleBannerRevista = ({
    detalleCargando,
    errorDetalle,
    handleVolver,
    selectedPost,
    tiposNotas,
    notasDestacadas,
    handleCardClick
}) => (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] py-5 gap-6">
        {/* Columna Principal - Detalle */}
        <div>
            {/* Logo del tipo de nota */}
            {selectedPost?.tipo_nota && (
                (() => {
                    const tipoConfig = tiposNotas.find(t => t.nombre === selectedPost.tipo_nota) || {};
                    const tipoLogo = tipoConfig.tipoLogo
                        ? tipoConfig.tipoLogo.startsWith('http')
                            ? tipoConfig.tipoLogo
                            : `${urlApi}${tipoConfig.tipoLogo}`
                        : null;
                    const tipo = selectedPost.tipo_nota;
                    return tipoLogo ? (
                        <div className="relative flex justify-center items-center mb-4">
                            <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                            <div className="relative z-10 px-4 bg-[#CCCCCC]">
                                <img
                                    src={tipoLogo}
                                    alt={tipo}
                                    className={
                                        tipo === "Antojos"
                                            ? "h-auto w-60 object-contain"
                                            : "h-auto w-80 object-contain"
                                    }
                                />
                            </div>

                        </div>
                    ) : null;
                })()
            )}
            {/*
            <div className="w-177 pb-4">
                <BarraMarquee categoria={`Noticias y más recomendaciones de`} />
            </div>
            */}
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
                        selectedPost?.tipo_nota && (
                            tiposNotas.find(t => t.nombre === selectedPost.tipo_nota)?.marqueeTexto ||
                            "Residente - Lo mejor de la gastronomía de Nuevo León"
                        )
                    }
                />
            )}
        </div>
        {/* Columna lateral */}
        <div className="flex flex-col items-end justify-start gap-10">
            <DirectorioVertical />
            <MainLateralPostTarjetas
                notasDestacadas={notasDestacadas}
                onCardClick={handleCardClick}
                pasarObjeto={false} // <--- ENVÍA SOLO EL ID
            />
            <div className="mt-4">
                <BotonesAnunciateSuscribirme />
            </div>
        </div>
    </div>
);

export default DetalleBannerRevista;