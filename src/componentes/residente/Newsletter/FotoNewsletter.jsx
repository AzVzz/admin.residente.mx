import TresTarjetas from "../componentes/componentesColumna2/TresTarjetas";
import PostPrincipal from "../componentes/componentesColumna2/PostPrincipal";
import DirectorioVertical from "../componentes/componentesColumna2/DirectorioVertical";
import PortadaRevista from "../componentes/componentesColumna2/PortadaRevista";
import MainLateralPostTarjetas from "../componentes/componentesColumna2/MainLateralPostTarjetas";
import BotonesAnunciateSuscribirme from "../componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "../componentes/componentesColumna1/Infografia";

const FotoNewsletter = ({ posts, filtrarPostsPorTipoNota, handleCardClick }) => {
    // Filtrar las notas por tipo
    const foodDrinkNotas = filtrarPostsPorTipoNota("Food & Drink");
    const antojeriaNotas = filtrarPostsPorTipoNota("Antojos");
    const gastroNotas = filtrarPostsPorTipoNota("Gastro-Destinos");

    // Selecciona la primera nota de cada tipo
    const primera = foodDrinkNotas.at(0);
    const segunda = antojeriaNotas.at(0);
    const tercera = gastroNotas.at(0);

    // IDs usadas para no repetir
    const usadasIds = [primera?.id, segunda?.id, tercera?.id].filter(Boolean);

    // Notas restantes para aleatorias
    const todasNotas = [
        ...foodDrinkNotas,
        ...antojeriaNotas,
        ...gastroNotas
    ].filter(nota => !usadasIds.includes(nota.id));

    // Selecciona 3 aleatorias
    const aleatorias = todasNotas
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    // Tarjetas finales (6 en total)
    const tarjetas = [primera, segunda, tercera, ...aleatorias].filter(Boolean);

    // Nota principal (puedes elegir la última de Food & Drink)
    const notaPrincipal = primera;

    return (
        <div className="flex flex-col pt-9">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9 mt-6 px-4 md:px-0">
                {/* Columna principal */}
                <div>
                    {notaPrincipal && (
                        <PostPrincipal post={notaPrincipal} onClick={() => handleCardClick(notaPrincipal)} />
                    )}
                    <TresTarjetas
                        posts={tarjetas}
                        onCardClick={handleCardClick}
                        mostrarBanner={false}
                    />
                </div>
                {/* Columna lateral */}
                <div className="flex flex-col items-end justify-start gap-10">
                    <DirectorioVertical />
                    <PortadaRevista />
                    <div className="pt-3">
                        <BotonesAnunciateSuscribirme />
                    </div>
                    <Infografia />
                </div>
            </div>
        </div>
    );
};

export default FotoNewsletter;