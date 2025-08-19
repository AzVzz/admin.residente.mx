import { urlApi } from "../../../api/url.js";
import BarraMarquee from "../seccionesCategorias/componentes/BarraMarquee.jsx";

const MainLateralPostTarjetas = ({
    notasDestacadas = [],
    onCardClick,
    cantidadNotas,
    sinFecha = false,
    sinCategoria = false,
    pasarObjeto = false // <--- NUEVO
}) => {
    const safePosts = (notasDestacadas || []).filter(post => post).slice(0, cantidadNotas || 4);
    return (
        <section className={`mb-5  h-[450px] flex flex-col ${cantidadNotas === 5 ? 'h-[490px]' : 'h-[450px]'}`}>
            <div className="flex justify-end bg-[#fff200] mb-5 px-2 py-1">
                <img className="h-full w-55 object-contain" src={`${urlApi}/fotos/fotos-estaticas/residente-logos/negros/lomasvistologo-03.webp`} />
            </div>
            <div className="flex-grow">
                <ul className="h-full flex flex-col gap-3">
                    {safePosts.map((post, index) => (
                        <li
                            key={post.id}
                            className="h-[calc(10%-0.625rem)] min-h-[83px] relative"
                        >
                            <div
                                className="flex items-center cursor-pointer h-full w-full transition-shadow text-right"
                                onClick={() => pasarObjeto ? onCardClick(post) : onCardClick(post.id)}
                            >
                                <div className="w-2/3 pr-4 h-full flex flex-col justify-center">
                                    {!sinFecha && (
                                        <div
                                            className="font-serif inline-block text-black text-[5px] px-1.5 py-0 max-w-max mb-0.5 font-black self-end"
                                        >
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
                                    {!sinCategoria && (
                                        <div className="flex items-center">
                                            <span className="font-serif inline-block bg-black text-[#fff300] text-[7px] px-0.5 py-0 max-w-max mb-0.5">
                                                {post?.tipo_nota || 'Sin categoría'}
                                            </span>
                                        </div>
                                    )}
                                    <h4 className="font-roman text-[12px] leading-3.5">{post.titulo}</h4>
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
    )
}

export default MainLateralPostTarjetas;