import TresTarjetas from "../componentes/componentesColumna2/TresTarjetas";
import PostPrincipal from "../componentes/componentesColumna2/PostPrincipal";

const FotoNewsletter = ({ posts, filtrarPostsPorTipoNota, handleCardClick }) => {
    const restaurantesNotas = filtrarPostsPorTipoNota("Restaurantes");
    const notaPrincipal = restaurantesNotas.at(0); // La más nueva

    // ID de la nota principal para evitar repeticiones
    const usadaId = notaPrincipal?.id;

    // Filtra las notas de los otros tipos
    const foodDrinkNotas = filtrarPostsPorTipoNota("Food & Drink").filter(nota => nota.id !== usadaId);
    const antojeriaNotas = filtrarPostsPorTipoNota("Antojos").filter(nota => nota.id !== usadaId);
    const gastroNotas = filtrarPostsPorTipoNota("Gastro-Destinos").filter(nota => nota.id !== usadaId);

    // Selecciona la más nueva de cada tipo de nota
    const segunda = foodDrinkNotas.at(0);
    const tercera = antojeriaNotas.at(0);
    const cuarta = gastroNotas.at(0);

    // Notas restantes para aleatorias y evitar repeticiones
    const usadasIds = [usadaId, segunda?.id, tercera?.id, cuarta?.id].filter(Boolean);
    const todasNotas = posts.filter(nota => !usadasIds.includes(nota.id));

    // Selecciona 2 aleatorias para completar 6 tarjetas
    const aleatorias = todasNotas
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

    // Tarjetas base (pueden ser menos de 4 si faltan categorías)
    let tarjetasBase = [segunda, tercera, cuarta, ...aleatorias].filter(Boolean);

    // Si faltan tarjetas, agrega más aleatorias del resto de notas
    if (tarjetasBase.length < 6) {
        const faltan = 6 - tarjetasBase.length;
        const usadasIdsExtra = tarjetasBase.map(n => n.id);
        const notasExtra = todasNotas.filter(nota => !usadasIdsExtra.includes(nota.id)).slice(0, faltan);
        tarjetasBase = [...tarjetasBase, ...notasExtra];
    }

    // Solo las primeras 6
    const tarjetas = tarjetasBase.slice(0, 6);


    return (
        <div className="flex flex-col pt-9 items-center">
            <div className="w-full max-w-[900px] mx-auto">
                {notaPrincipal && (
                    <PostPrincipal post={notaPrincipal} onClick={() => handleCardClick(notaPrincipal)} />
                )}
                <TresTarjetas
                    posts={tarjetas}
                    onCardClick={handleCardClick}
                    mostrarBanner={false}
                />
            </div>
        </div>
    );
};

export default FotoNewsletter;