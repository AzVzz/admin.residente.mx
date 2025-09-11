import React, { useState, useEffect } from "react";
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
import CuponesCarrusel from './seccionesCategorias/componentes/CuponesCarrusel.jsx';
import { cuponesGet } from '../../../componentes/api/cuponesGet.js';
import PortadaRevista from "./componentesColumna2/PortadaRevista.jsx";
import NotasAcervo from "./componentesColumna2/NotasAcervo.jsx";
import Infografia from "./componentesColumna1/Infografia.jsx";
import BannerChevrolet from "./BannerChevrolet.jsx";


const ListadoBannerRevista = ({
    tiposNotas,
    filtrarPostsPorTipoNota,
    filtrarDestacadasPorTipoNota,
    handleCardClick,
    revistaActual,
    notasResidenteGet
}) => {

    const [cupones, setCupones] = useState([]);

    useEffect(() => {
        cuponesGet()
            .then(data => setCupones(Array.isArray(data) ? data : []))
            .catch(() => setCupones([]));
    }, []);

    return (
        <div className="flex flex-col">
            {["Restaurantes", "Food & Drink", "Antojos", "Gastro-Destinos"].map((tipo) => {
                const postsFiltrados = filtrarPostsPorTipoNota(tipo);
                const destacadasFiltradas = filtrarDestacadasPorTipoNota(tipo);

                if (postsFiltrados.length === 0) return null;

                const tipoConfig = tiposNotas.find(t => t.nombre === tipo) || { tipoLogo: "", marqueeTexto: "", label: "" };
                const tipoLogo = tipoConfig.tipoLogo ? `${urlApi}${tipoConfig.tipoLogo}` : null;
                const marqueeTexto = tipoConfig.marqueeTexto || "";
                const tipoLabel = (tipoConfig.label || tipo || "").toString();
                const mostrarBanner = ["Antojos", "Gastro-Destinos", "Food & Drink"].includes(tipo);
                const mostrarBannerEnMedio = tipo === "Restaurantes";

                return (
                    <div key={tipo} className="flex flex-col pt-9" id={tipo.replace(/[^a-zA-Z]/g, '').toLowerCase()}>
                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9">
                            {/* Columna Principal */}
                            <div>
                                <div className="relative flex justify-center items-center mb-2">
                                    <div className="absolute left-0 right-0 top-1/2 border-t-4 border-transparent opacity-100 z-0" aria-hidden="true" />
                                    <div className="relative z-10">
                                        <div className="flex">
                                            {mostrarBanner && (
                                                tipo === "Food & Drink" ? (
                                                    <div className="w-full mb-4">
                                                        {console.log("🍽️ Mostrando banner de Chevrolet para Food & Drink en ListadoBannerRevista")}
                                                        <BannerChevrolet size="big" />
                                                    </div>
                                                ) : revistaActual && revistaActual.pdf ? (
                                                    <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                                                        <img
                                                            src={revistaActual.imagen_banner}
                                                            alt="Banner Revista"
                                                            className="w-full mb-4 cursor-pointer pb-7"
                                                            title="Descargar Revista"
                                                        />
                                                    </a>
                                                ) : (
                                                    <img
                                                        src={revistaActual?.imagen_banner}
                                                        alt="Banner Revista"
                                                        className="w-full mb-4"
                                                    />
                                                )
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center">
                                            {tipoLogo ? (
                                                <img
                                                    src={tipoLogo}
                                                    alt={tipoLabel}
                                                    className={
                                                        tipo === "Antojos" ? "h-auto w-70 object-contain" :
                                                            tipo === "Gastro-Destinos" ? "h-auto w-95 object-contain" :
                                                                tipo === "Food & Drink" ? "h-auto w-80 object-contain" :
                                                                    tipo === "Restaurantes" ? "h-auto w-85 object-contain" :
                                                                        "h-auto w-60 object-contain"}
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
                                </div>

                                <div className="flex flex-col justify-center items-center text-[12px] mb-3 gap-6">
                                    <p className="uppercase">{marqueeTexto}</p>

                                    <BarraMarquee categoria="SEMANA MEXICANA. Del 9 al 15 de Septiembre encuentra toda la información sobre la gastronomía de las fiestas patrias." />
                                </div>


                                {postsFiltrados[0] && (
                                    <PostPrincipal
                                        post={postsFiltrados[0]}
                                        onClick={() => handleCardClick(postsFiltrados[0].id)}
                                    />
                                )}

                                <TresTarjetas
                                    posts={postsFiltrados.slice(1, 7)}
                                    onCardClick={(post) => handleCardClick(post.id)}
                                    mostrarBanner={mostrarBanner}
                                    mostrarBannerEnMedio={mostrarBannerEnMedio}
                                    revistaActual={revistaActual}
                                />
                                {/*revistaActual && revistaActual.pdf ? (
                                    <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                                        <img
                                            src={revistaActual.imagen_banner}
                                            alt="Banner Revista"
                                            className="w-full mb-4 cursor-pointer py-2"
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
                            </div>

                            {/* Columna lateral */}
                            <div className="flex flex-col items-end justify-start gap-10">
                                <DirectorioVertical />
                                <PortadaRevista />
                                <MainLateralPostTarjetas
                                    notasDestacadas={destacadasFiltradas}
                                    onCardClick={handleCardClick}
                                    sinCategoria
                                    sinFecha
                                    cantidadNotas={5}
                                />


                                <div className="pt-3">
                                    <BotonesAnunciateSuscribirme />
                                </div>

                                <Infografia />

                                {/*<div className="flex justify-end items-end mb-4">
                                    <img src="https://i.pinimg.com/originals/4d/ee/83/4dee83472ffd5a8ca24d26a050cf5454.gif"
                                        className="h-auto w-75" />
                                </div>*/}


                            </div>
                        </div>
                        {tipo === "Restaurantes" && (
                            <>
                                {/*<hr className="border-gray-800/80 border-dotted mt-0 pb-6" />*/}
                                <div className="relative flex justify-center items-center mb-8 pt-2 mt-8">
                                    <div className="absolute left-0 right-0 top-1/3 border-t-2 border-black opacity-100 z-0" />
                                    <div className="relative z-10 px-4 bg-[#DDDDDE]">
                                        <div className="flex flex-row justify-center items-center gap-2">
                                            {/*<img src={`http://localhost:3000/fotos/fotos-estaticas/listado-iconos-100estrellas/favoritsdelpublico.avif`} className="w-7.5 h-full object-contain rounded-full" />*/}
                                            <img className="h-full w-105" src={'http://residente.mx/fotos/fotos-estaticas/residente-logos/negros/nuestras-recomendaciones.webp'} />
                                            {/*<img src={`http://localhost:3000/fotos/fotos-estaticas/listado-iconos-100estrellas/favoritsdelpublico.avif`} className="w-7.5 h-full object-contain rounded-full" />*/}
                                        </div>
                                        <div className="text-center mt-1">
                                            <span className="text-[12px] font-semibold tracking-wide">
                                                {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pb-0">
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
                                <div className="relative flex justify-center items-center mb-8 mt-8">
                                    <div className="absolute left-0 right-0 top-1/2 border-t-2 border-black opacity-100 z-0" />
                                    <div className="relative z-10 px-4 bg-[#DDDDDE]">
                                        <div className="flex flex-row justify-center items-center gap-3">
                                            <img src={`http://localhost:3000/fotos/fotos-estaticas/residente-logos/negros/PLATILOS%20ICÓNICOS%20DE%20NL.webp`} className="w-full h-6 object-contain" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pb-5">
                                    <CincoNotasRRR tipoNota="Food & Drink" onCardClick={(nota) => handleCardClick(nota.id)} />
                                </div>
                                <div className="my-2">
                                    <SeccionesPrincipales />
                                </div>
                            </>
                        )}

                        {tipo === "Antojos" && (
                            <div className="my-2">
                                <NotasAcervo onCardClick={(nota) => handleCardClick(nota.id)} />
                            </div>
                        )}

                    </div>
                );
            })}
        </div>
    );
};

export default ListadoBannerRevista;