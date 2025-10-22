import { useEffect, useState } from "react";
import { notasPorTipoNota, notasDestacadasPorTipoGet, notasDestacadasTopGet } from "../../api/notasPublicadasGet";
import { urlApi } from "../../api/url.js";
import PostPrincipal from "../componentes/componentesColumna2/PostPrincipal";
import TresTarjetas from "../componentes/componentesColumna2/TresTarjetas";
import DirectorioVertical from "../componentes/componentesColumna2/DirectorioVertical";
import MainLateralPostTarjetas from "../componentes/componentesColumna2/MainLateralPostTarjetas";
import BotonesAnunciateSuscribirme from "../componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "../componentes/componentesColumna1/Infografia";
import PortadaRevista from "../componentes/componentesColumna2/PortadaRevista";
import { useNavigate } from "react-router-dom";
import GiveawayDescuentos from "../componentes/componentesColumna2/GiveawayDescuentos";
import { cuponesGet } from "../../api/cuponesGet";



const B2BMain = ({ notasResidenteGet }) => {
    const [posts, setPosts] = useState([]);
    const [notasDestacadas, setNotasDestacadas] = useState([]);
    const [notasTop, setNotasTop] = useState([]);
    const navigate = useNavigate();
    const [cupones, setCupones] = useState([]);

    const tipoConfig = {
        tipoLogo: "fotos/fotos-estaticas/residente-logos/negros/b2b.webp",
        marqueeTexto: "Informacion financiera y negocios de la industria gastronomica"
    };
    const tipoLogo = tipoConfig.tipoLogo ? `${urlApi}${tipoConfig.tipoLogo}` : null;
    const tipoLabel = "B2B";
    const marqueeTexto = tipoConfig.marqueeTexto || "";

    useEffect(() => {
        notasPorTipoNota("B2B")
            .then(data => {
                const ordenadas = Array.isArray(data)
                    ? [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                    : [];
                setPosts(ordenadas);
            })
            .catch(() => setPosts([]));
        notasDestacadasPorTipoGet("B2B")
            .then(data => setNotasDestacadas(Array.isArray(data) ? [...data] : []))
            .catch(() => setNotasDestacadas([]));
        notasDestacadasTopGet()
            .then(data => {
                const topB2B = Array.isArray(data) ? [...data].filter(nota => nota.tipo_nota === "B2B") : [];
                setNotasTop(topB2B);
            })
            .catch(() => setNotasTop([]));
        cuponesGet()
            .then(data => setCupones(Array.isArray(data) ? [...data] : []))
            .catch(() => setCupones([]));
    }, []);

    const handleCardClick = (post) => {
        if (post && post.id) {
            navigate(`/notas/${post.id}`);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-col pt-9" id="b2b">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9 mb-10">
                    {/* Columna Principal */}
                    <div>
                        {/* Logo y texto arriba, igual que ListadoBannerRevista */}
                        <div className="relative flex justify-center items-center mb-2">
                            <div className="absolute left-0 right-0 top-1/2 border-t-4 border-transparent opacity-100 z-0" aria-hidden="true" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-center">
                                    {tipoLogo ? (
                                        <img
                                            src={tipoLogo}
                                            alt={tipoLabel}
                                            className="h-auto w-35 object-contain"
                                        />
                                    ) : (
                                        <span
                                            className="block text-black font-extrabold uppercase text-center text-4xl leading-none tracking-tight"
                                        >
                                            {tipoLabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center text-[12px] mb-4 gap-6">
                            <p className="uppercase">{marqueeTexto}</p>
                        </div>
                        {/* PostPrincipal y tarjetas */}
                        {posts[0] && (
                            <PostPrincipal
                                post={posts[0]}
                                onClick={() => handleCardClick(posts[0])}
                            />
                        )}
                        <TresTarjetas
                            posts={posts.slice(1, 25)}
                            onCardClick={handleCardClick}
                        />
                    </div>
                    {/* Columna lateral */}
                    <div className="flex flex-col items-end justify-start gap-10">
                        <DirectorioVertical />
                        <PortadaRevista />
                        <MainLateralPostTarjetas
                            notasDestacadas={notasTop} 
                            onCardClick={handleCardClick}
                            sinCategoria
                            sinFecha
                            cantidadNotas={5}
                        />
                        <div className="pt-3">
                            <BotonesAnunciateSuscribirme />
                        </div>
                        <Infografia />
                    </div>
                </div>
                {/* GiveawayDescuentos debajo del grid, ocupa todo el ancho */}
                {/*<GiveawayDescuentos cupones={cupones} />*/}
            </div>
        </div>
    );
};

export default B2BMain;