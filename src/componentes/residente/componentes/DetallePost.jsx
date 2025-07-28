import PostComentarios from "./PostComentarios";
import ShowComentarios from "./ShowComentarios";
import SinFoto from '../../../imagenes/ResidenteColumna1/SinFoto.png';
import { Iconografia } from '../../utils/Iconografia.jsx';

// DetallePost.jsx
const DetallePost = ({ post, onVolver, sinFecha = false }) => {
    // Verificar si el post tiene stickers
    const iconosDisponibles = [
        ...Iconografia.categorias,
        ...Iconografia.ocasiones,
        ...Iconografia.zonas
    ];

    // Filtrar iconos que están en el post
    const stickers = Array.isArray(post.sticker)
        ? post.sticker
        : post.sticker
            ? [post.sticker]
            : [];

    return (
        <div className="flex flex-col shadow-md">
            {/** h-[725px]  mb-5 */}
            <div className="flex flex-col cursor-pointer overflow-hidden">
                {/* Imagen - idéntica a PostPrincipal */}
                <div className="h-[400px] overflow-hidden">
                    <div className="relative h-full">
                        {!sinFecha && (
                            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r bg-[#FFF200] text-gray-900 text-[10px] font-semibold px-1.5 py-0.5 shadow-md font-serif uppercase">
                                {post.fecha}
                            </div>
                        )}
                        <img
                            src={post.imagen || SinFoto}
                            className="w-full h-full object-cover"
                            alt={post.titulo}
                        />
                    </div>
                </div>

                {/* Sección negra - idéntica a PostPrincipal h-[325px]*/}
                <div className="bg-black p-10 flex flex-col ">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="font-serif inline-block bg-[#FFF200] text-gray-900 uppercase text-[10px] font-bold px-1.5 py-0.5 shadow-md">
                            {post.tipo_nota}
                        </span>
                        {/* Iconos seleccionados dinamicamente*/}
                        <div className="flex gap-4 z-10">
                            {stickers.map(clave => {
                                const icono = iconosDisponibles.find(i => i.clave === clave);
                                return icono ? (
                                    <img
                                        key={clave}
                                        src={icono.icono}
                                        alt={icono.nombre}
                                        className="h-12 w-12 rounded-full shadow"
                                    />
                                ) : null;
                            })}
                        </div>
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