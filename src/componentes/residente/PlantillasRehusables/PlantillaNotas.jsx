import PlantillaPostPrincipal from "./PlantillaPostPrincipal";
import PlantillaTresTarjetas from "./PlantillaTresTarjetas";
import DirectorioVertical from "../componentes/componentesColumna2/DirectorioVertical";
import PortadaRevista from "../componentes/componentesColumna2/PortadaRevista";
import MainLateralPostTarjetas from "../componentes/componentesColumna2/MainLateralPostTarjetas";
import BotonesAnunciateSuscribirme from "../componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "../componentes/componentesColumna1/Infografia";
import PlantillaLateralPostTarjetas from "./PlantillaLateralPostTarjetas";

const PlantillaNotas = ({
    posts = [],
    notasDestacadas = [],
    handleCardClick,
    mostrarBanner = false,
    mostrarBannerEnMedio = false,
    revistaActual
}) => {
    return (
        <div className="flex flex-col pt-9">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9">
                {/* Columna principal */}
                <div>
                    {/* Nota principal */}
                    {posts[0] && (
                        <PlantillaPostPrincipal post={posts[0]} onClick={() => handleCardClick(posts[0])} />
                    )}
                    {/* Tarjetas */}
                    <PlantillaTresTarjetas
                        posts={posts.slice(1, 25)}
                        onCardClick={handleCardClick}
                        mostrarBanner={mostrarBanner}
                        mostrarBannerEnMedio={mostrarBannerEnMedio}
                        revistaActual={revistaActual}
                    />
                </div>
                {/* Columna lateral */}
                <div className="flex flex-col items-end justify-start gap-10">
                    <DirectorioVertical />
                    <PortadaRevista />
                    <PlantillaLateralPostTarjetas
                        notasDestacadas={notasDestacadas}
                        onCardClick={handleCardClick}
                        cantidadNotas={5}
                    />
                    <div className="pt-3">
                        <BotonesAnunciateSuscribirme />
                    </div>
                    <Infografia />
                </div>
            </div>
        </div>
    );
};

export default PlantillaNotas;