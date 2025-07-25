import PostComentarios from "./PostComentarios";
import ShowComentarios from "./ShowComentarios";
import SinFoto from '../../../imagenes/ResidenteColumna1/SinFoto.png';

// DetallePost.jsx
const DetallePost = ({ post, onVolver }) => {
    return (
        <div className="flex flex-col shadow-md">
            {/** h-[725px]  mb-5 */}
            <div className="flex flex-col cursor-pointer overflow-hidden">
                {/* Imagen - idéntica a PostPrincipal */}
                <div className="h-[400px] overflow-hidden">
                    <div className="relative h-full">
                        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r bg-[#FFF200] text-gray-900 text-[10px] font-semibold px-1.5 py-0.5 shadow-md font-serif uppercase">
                            {post.fecha}
                        </div>
                        <img
                            src={post.imagen || SinFoto}
                            className="w-full h-full object-cover"
                            alt={post.titulo}
                        />
                    </div>
                </div>

                {/* Sección negra - idéntica a PostPrincipal h-[325px]*/}
                <div className="bg-black p-10 flex flex-col ">
                    <div className="mb-2">
                        <span className="font-serif inline-block bg-[#FFF200] text-gray-900 uppercase text-[10px] font-bold px-1.5 py-0.5 shadow-md">
                            {post.tipo_nota}
                        </span>
                    </div>
                    <h1 className="text-white text-[40px] leading-[1.1] font-black flex-1 overflow-hidden content-center">
                        {post.titulo}
                    </h1>
                    <p className="text-white mt-3 font-light">{`de ${post.autor}`}</p>
                </div>
            </div>

            {/* Contenido adicional específico del detalle */}
            <div className="flex flex-col gap-5 px-10 py-6">
                <h2 className="text-3xl font-roman">{post.subtitulo}</h2>
                <p className="text-xl font-roman">{post.descripcion}</p>
                <span>&copy; 2025 Residente. Todos los derechos reservados.</span>

                <PostComentarios />

                <ShowComentarios />

                <button
                    onClick={onVolver}
                    className="mt-4 mb-4 text-blue-600 font-medium flex items-center cursor-pointer"
                >
                    ← Volver al listado
                </button>
            </div>
        </div>
    );
};

export default DetallePost;