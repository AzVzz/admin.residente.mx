import SinFoto from '../../../../imagenes/ResidenteColumna1/SinFoto.png'

const MainLateralPostTarjetas = ({ notasDestacadas = [], onCardClick }) => {
    const safePosts = (notasDestacadas || []).filter(post => post).slice(0, 4);
    return (
        <section className="mb-5 h-[450px] flex flex-col">
            <div>
                <h3 className="pb-5 text-5xl">Lo más visto</h3>
            </div>
            <div className="flex-grow">
                <ul className="h-full flex flex-col gap-5">
                    {safePosts.map((post, index) => (
                        <li
                            key={post.id}
                            className="h-[calc(10%-0.625rem)] min-h-[80px] relative"
                        >
                            <div
                                className="flex items-center cursor-pointer h-full w-full transition-shadow"
                                onClick={() => onCardClick(post)}
                            >
                                <div className="w-1/3 h-full">
                                    <img
                                        src={post.imagen || SinFoto}
                                        alt={post.titulo}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="w-2/3 pl-4 h-full flex flex-col justify-center">
                                    <p className="text-xs text-gray-600 mb-1">{post.fecha}</p>
                                    <h4 className="font-bold text-sm leading-3.5">{post.titulo}</h4>
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