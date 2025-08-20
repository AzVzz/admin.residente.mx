import BarraMarquee from '../../../componentes/residente/componentes/seccionesCategorias/componentes/BarraMarquee.jsx';
import PostPrincipal from './componentesColumna2/PostPrincipal';
import TresTarjetas from './componentesColumna2/TresTarjetas';
import DirectorioVertical from './componentesColumna2/DirectorioVertical';
import MainLateralPostTarjetas from './componentesColumna2/MainLateralPostTarjetas';
import BotonesAnunciateSuscribirme from './componentesColumna1/BotonesAnunciateSuscribirme';
import CincoNotasRRR from './seccionesCategorias/componentes/CincoNotasRRR.jsx';
import EnPortada from './componentesColumna2/EnPortada';
import VideosHorizontal from './componentesColumna2/VideosHorizontal';
import SeccionesPrincipales from './SeccionesPrincipales';
import { urlApi } from '../../../componentes/api/url.js';
import PortadaRevista from './componentesColumna2/PortadaRevista.jsx';

const ListadoBannerRevista = ({
    tiposNotas,
    filtrarPostsPorTipoNota,
    filtrarDestacadasPorTipoNota,
    handleCardClick,
    revistaActual,
    notasResidenteGet
}) => (
    <div className="flex flex-col">
        {["Restaurantes", "Food & Drink", "Antojos", "Gastro-Destinos"].map((tipo) => {
            const postsFiltrados = filtrarPostsPorTipoNota(tipo);
            const destacadasFiltradas = filtrarDestacadasPorTipoNota(tipo);

            if (postsFiltrados.length === 0) return null;

            const tipoConfig = tiposNotas.find(t => t.nombre === tipo) || { tipoLogo: "", marqueeTexto: "", label: "" };
            const tipoLogo = tipoConfig.tipoLogo ? `${urlApi}${tipoConfig.tipoLogo}` : null;
            const marqueeTexto = tipoConfig.marqueeTexto || "";
            const tipoLabel = (tipoConfig.label || tipo || "").toString();

            return (
                <div key={tipo} className="flex flex-col pt-9">
                    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9 mb-2">
                        {/* Columna Principal */}
                        <div>
                            <div className="relative flex justify-center items-center mb-2">
                                <div className="absolute left-0 right-0 top-1/2 border-t-4 border-transparent opacity-100 z-0" aria-hidden="true" />
                                <div className="relative z-10 px-4 bg-[#CCCCCC]">
                                    {tipoLogo ? (
                                        <img
                                            src={tipoLogo}
                                            alt={tipoLabel}
                                            className={tipo === "Antojos" ? "h-auto w-60 object-contain" : "h-auto w-60 object-contain"}
                                        />
                                    ) : (
                                        <span
                                            className={[
                                                "block text-black font-extrabold uppercase text-center",
                                                // tamaños parecidos a tus logos
                                                tipo === "Antojos" ? "text-2xl md:text-2xl" : "text-4xl md:text-4xl",
                                                "leading-none tracking-tight"
                                            ].join(" ")}
                                        >
                                            {tipoLabel}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-7">
                                <BarraMarquee categoria={marqueeTexto} />
                            </div>


                            {postsFiltrados[0] && (
                                <PostPrincipal
                                    post={postsFiltrados[0]}
                                    onClick={() => handleCardClick(postsFiltrados[0].id)}
                                />
                            )}
                            {/*revistaActual && revistaActual.pdf ? (
                                <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                                    <img
                                        src={revistaActual.imagen_banner}
                                        alt="Banner Revista"
                                        className="w-full mb-4 cursor-pointer"
                                        title="Descargar Revista"
                                    />
                                </a>
                            ) : (
                                <img
                                    src={revistaActual?.imagen_banner}
                                    alt="Banner Revista"
                                    className="w-full mb-4"
                                />
                            )*/}

                            <TresTarjetas
                                posts={postsFiltrados.slice(1, 7)}
                                onCardClick={(post) => handleCardClick(post.id)}
                            />
                        </div>

                        {/* Columna lateral */}
                        <div>
                            <div className="flex flex-col items-end justify-start gap-10">
                                <DirectorioVertical />
                                <PortadaRevista />
                                <MainLateralPostTarjetas
                                    notasDestacadas={destacadasFiltradas}
                                    onCardClick={handleCardClick}
                                    sinCategoria
                                    cantidadNotas={5}
                                />
                            </div>
                            <BotonesAnunciateSuscribirme />
                        </div>
                    </div>
                    {tipo === "Restaurantes" && (
                        <>
                            <div className="relative flex justify-center items-center mb-4">
                                <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                                <div className="relative z-10 px-4 bg-[#CCCCCC]">
                                    <div className="flex flex-row justify-center items-center gap-2">
                                        <img src={`https://estrellasdenuevoleon.com.mx/fotos/fotos-estaticas/listado-iconos-100estrellas/favoritsdelpublico.avif`} className="w-7.5 h-full object-contain rounded-full" />
                                        <img className="h-full w-95" src={'https://estrellasdenuevoleon.com.mx/fotos/fotos-estaticas/residente-logos/negros/nuestras-recomendaciones.webp'} />
                                        <img src={`https://estrellasdenuevoleon.com.mx/fotos/fotos-estaticas/listado-iconos-100estrellas/favoritsdelpublico.avif`} className="w-7.5 h-full object-contain rounded-full" />
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
                        </>
                    )}
                    {tipo === "Antojos" && (
                        <>
                            <VideosHorizontal />
                        </>
                    )}
                    {tipo === "Food & Drink" && (
                        <>
                            <div className="relative flex justify-center items-center mb-4">
                                <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                                <div className="relative z-10 px-4 bg-[#CCCCCC]">
                                    <div className="flex flex-row justify-center items-center gap-3">
                                        <img src={`https://estrellasdenuevoleon.com.mx/fotos/fotos-estaticas/residente-logos/grises/platillos-iconicos.webp`} className="w-full h-8 object-contain" />
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
                            <VideosHorizontal />
                        </>
                    )}

                </div>
            );
        })}
    </div>
);

export default ListadoBannerRevista;