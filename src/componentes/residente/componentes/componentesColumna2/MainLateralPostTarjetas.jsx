import { urlApi } from "../../../api/url.js";
import BarraMarquee from "../seccionesCategorias/componentes/BarraMarquee.jsx";
import PortadaRevista from "./PortadaRevista";

const MainLateralPostTarjetas = ({
    notasDestacadas = [],
    onCardClick,
    cantidadNotas,
    sinFecha = false,
    sinCategoria = false,
    pasarObjeto = false
}) => {
    const safePosts = (notasDestacadas || []).filter(post => post).slice(0, cantidadNotas || 5);
    
    // Calcular la altura dinámica basada en la cantidad de posts
    const calcularAlturaContenedor = () => {
        const alturaBase = 0; // Altura base del encabezado y padding
        const alturaPorItem = 75; // Altura aproximada de cada tarjeta (83px + gap)
        return alturaBase + (safePosts.length * alturaPorItem);
    };

    return (
        <>
            <section 
                className="flex flex-col min-h-[100px] max-w-[375px]"
                //style={{ height: `${calcularAlturaContenedor()}px`, minHeight: '200px' }}
            >
                <div className="flex justify-end bg-[#fff200] mb-3 px-2 py-1">
                    <img 
                        className="h-full w-42 object-contain" 
                        src={`${urlApi}/fotos/fotos-estaticas/residente-logos/negros/lomasvistologo-03.webp`} 
                        alt="Lo más visto"
                    />
                </div>

                <div className="flex-grow">
                    <ul className="h-full flex flex-col gap-3.5">
                        {safePosts.map((post) => (
                            <li
                                key={post.id}
                                className="max-h-[83px] relative flex-grow"
                            >
                                <div
                                    className="flex items-center cursor-pointer h-full w-full transition-shadow text-right"
                                    onClick={() => pasarObjeto ? onCardClick(post) : onCardClick(post.id)}
                                >
                                    <div className="w-2/3 pr-4 h-full flex flex-col justify-center">
                                        <div className="flex flex-col items-end">
                                            {!sinFecha && (
                                                <div className="font-roman inline-block text-black text-[10px] py-0 max-w-max mb-0.5 font-black self-end">
                                                    {(() => {
                                                        const fecha = post?.fecha || 'Sin fecha';
                                                        const [primera, ...resto] = fecha.split(' '); 
                                                        return (
                                                            <>
                                                                <span className="capitalize">{primera}</span>
                                                                {resto.length > 0 && ' ' + resto.join(' ')}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="text-[13px] leading-3.5 line-clamp-2">{post.titulo}</h4>
                                    </div>

                                    <div className="w-1/3 h-full">
                                        <img
                                            src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                                            alt={post.titulo}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    )
}

export default MainLateralPostTarjetas;