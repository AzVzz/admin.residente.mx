import { urlApi } from "../../../api/url.js";
import BarraMarquee from "../seccionesCategorias/componentes/BarraMarquee.jsx";
import PortadaRevista from "./PortadaRevista";

const MainLateralPostTarjetas = ({
    notasDestacadas = [],
    onCardClick,
    cantidadNotas,
    sinFecha = false,
    sinCategoria = false,
    pasarObjeto = false,
}) => {
    const safePosts = (notasDestacadas || []).filter(post => post).slice(0, cantidadNotas || 5);

    return (
        <>
            <section className="flex flex-col min-h-[100px] max-w-[375px]">
                <div className="flex justify-end mb-3 py-1">
                    <img
                        className="h-full w-42 object-contain"
                        src={`${urlApi}/fotos/fotos-estaticas/residente-logos/negros/lomasvistologo-03.webp`}
                        alt="Lo más visto"
                    />
                </div>

                <div className="flex-grow">
                    <ul className="h-full flex flex-col gap-3.5">
                        {safePosts.map((post, index) => (
                            <li
                                key={post.id}
                                className="max-h-[83px] relative flex-grow"
                            >
                                <span className="absolute -right-1 top-0 bg-[#fff300] text-black text-[18px] font-grotesk rounded-full h-6.5 w-6.5 flex items-center justify-center">
                                    {index + 1}
                                </span>
                                <div
                                    className="flex items-center cursor-pointer h-full w-full transition-shadow text-right"
                                    onClick={() => pasarObjeto ? onCardClick(post) : onCardClick(post.id)}
                                >
                                    <div className="flex-1 pr-4 pl-12 h-full flex flex-col justify-center">
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
                                        <h4 className="text-[13px] leading-3.5 line-clamp-4">{post.titulo}</h4>
                                    </div>

                                    <div className="w-20 h-20">
                                        <img
                                            src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                                            alt={post.titulo}
                                            className="w-full h-full object-cover rounded-full"
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