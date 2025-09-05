import { urlApi } from "../../../api/url.js";
import BannerHorizontal from "../BannerHorizontal.jsx";

const TarjetaVerticalPost = ({ post, onClick }) => {
    return (
        <div
            className="group relative bg-transparent transition-all duration-300 overflow-hidden cursor-pointer max-w-sm"
            onClick={onClick}
        >
            <div className="flex flex-col">
                <div className="relative overflow-hidden">
                    <div className="relative">
                        <img
                            src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                            alt={post.titulo || "Nota"}
                            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                </div>

                <div className="flex flex-col py-2 justify-center items-center">
                    <div className="flex w-fit justify-center items-center py-1.5 pb-2 text-gray-900 text-[10px] font-semibold font-roman uppercase">
                        {post.fecha}
                    </div>
                    <h3 className="text-[18px] text-gray-900 leading-[1.1] mb-2 group-hover:text-gray-700 transition-colors duration-200 text-center">
                        {post.titulo}
                    </h3>
                </div>
            </div>
        </div>
    );
};

const TresTarjetas = ({ posts = [], onCardClick, mostrarBanner = false, revistaActual }) => {
    // Aseguramos 6 items y partimos 3 / 3
    const firstThree = posts.slice(0, 3);
    const lastThree = posts.slice(3, 6);

    return (
        <div className="w-full">
            {/* Fila 1 (3 tarjetas) */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                {firstThree.map((post) => (
                    <TarjetaVerticalPost
                        key={post.id}
                        post={post}
                        onClick={() => onCardClick(post)}
                    />
                ))}
            </div>

            {/* Banner al centro */}
            {/*mostrarBanner && revistaActual?.imagen_banner && (
                <div className="w-full my-4">
                    {revistaActual.pdf ? (
                        <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                            <img
                                src={revistaActual.imagen_banner}
                                alt="Banner Revista"
                                className="w-full cursor-pointer pb-4"
                                title="Descargar Revista"
                            />
                        </a>
                    ) : (
                        <img
                            src={revistaActual.imagen_banner}
                            alt="Banner Revista"
                            className="w-full"
                        />
                    )}
                </div>
            )*/}

            {/* Fila 2 (3 tarjetas) */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-5 mt-4 mb-2">
                {lastThree.map((post) => (
                    <TarjetaVerticalPost
                        key={post.id}
                        post={post}
                        onClick={() => onCardClick(post)}
                    />
                ))}
            </div>
            <BannerHorizontal size="small"/>
        </div>
    );
};

export default TresTarjetas;
