import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { notasPublicadasPorId } from "../../api/notasPublicadasGet"; // Ajusta el path si es necesario
import PostComentarios from "./PostComentarios";
import ShowComentarios from "./ShowComentarios";
import { Iconografia } from '../../utils/Iconografia.jsx';
import { urlApi } from "../../api/url.js";

// DetallePost.jsx
const DetallePost = ({ post: postProp, onVolver, sinFecha = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(postProp);
    const [loading, setLoading] = useState(!postProp);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!postProp && id) {
            setLoading(true);
            notasPublicadasPorId(id)
                .then(data => setPost(data))
                .catch(err => setError(err))
                .finally(() => setLoading(false));
        }
    }, [id, postProp]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 p-4">Error al cargar la nota: {error.message}</div>
        );
    }

    if (!post) {
        return (
            <div className="text-gray-500 p-4">Nota no encontrada.</div>
        );
    }

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
                            src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
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
                <div
                    className="text-xl font-roman"
                    dangerouslySetInnerHTML={{ __html: post.descripcion }}
                />
                <span>&copy; 2025 Residente. Todos los derechos reservados.</span>

                <PostComentarios />

                <ShowComentarios />

                <button onClick={() => navigate(-1)}>← Volver al listado</button>
            </div>
        </div>
    );
};

export default DetallePost;