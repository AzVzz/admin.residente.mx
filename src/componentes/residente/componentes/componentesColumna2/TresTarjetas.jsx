import { urlApi } from "../../../api/url.js";

const TarjetaVerticalPost = ({ post, onClick }) => {
    return (
        <div
            className="group relative bg-transparent transition-all duration-300 overflow-hidden cursor-pointer max-w-sm"
            onClick={onClick}
        >
            {/* Contenedor principal vertical */}
            <div className="flex flex-col">
                {/* Contenedor de imagen */}
                <div className="relative overflow-hidden">
                    {/* Etiqueta de fecha 
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r bg-[#FFF200] text-gray-900 text-[10px] font-semibold px-1.5 py-0.5 shadow-md font-serif uppercase">
                        {post.fecha}
                    </div>*/}

                    {/* Imagen con overlay sutil */}
                    <div className="relative">
                        <img
                            src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                            alt="Cola de Caballo"
                            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </div>

                {/* Contenido de texto */}
                <div className="flex flex-col py-2 justify-center items-center">
                    {/* Categoría 
          <div className="mb-2">
            <span className="font-serif inline-block bg-[#FFF200] text-gray-900 uppercase text-[10px] font-bold px-1.5 py-0.5 shadow-md">
              {post.categoria}
            </span>
          </div>*/}

                    
                    {/* Título */}
                    
                    <div className="flex w-fit justify-center items-center bg-gradient-to-r py-1.5 pb-2 text-gray-900 text-[10px] font-semibold font-roman uppercase">
                        {post.fecha}
                    </div>
                    <h3 className="text-[18px] text-gray-900 leading-[1.1] mb-2 group-hover:text-gray-700 transition-colors duration-200 text-center">
                        {post.titulo}
                    </h3>

                    {/* Botón de acción sutil */}
                    <div className="flex items-center text-gray-600 text-sm font-semibold group-hover:text-gray-900 transition-colors duration-200 mt-auto">
                    </div>
                </div>
            </div>
        </div>
    )
}

const TresTarjetas = ({ posts, onCardClick }) => {
    return (
        <div>
            <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                {posts.map((post) => (
                    <TarjetaVerticalPost
                        key={post.id}
                        post={post}
                        onClick={() => onCardClick(post)}
                    />
                ))}
            </div>
        </div>
    );
};

export default TresTarjetas;