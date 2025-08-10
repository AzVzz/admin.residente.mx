import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { notasPublicadasPorId } from "../../api/notasPublicadasGet"; // Ajusta el path si es necesario
import PostComentarios from "./PostComentarios";
import ShowComentarios from "./ShowComentarios";
import { Iconografia } from '../../utils/Iconografia.jsx';
import { urlApi } from "../../api/url.js";
import BarraMarquee from "./seccionesCategorias/componentes/BarraMarquee.jsx";

// DetallePost.jsx
const DetallePost = ({ post: postProp, onVolver, sinFecha = false, barraMarquee }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(postProp);
    const [loading, setLoading] = useState(!postProp);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (postProp) {
            setPost(postProp);
            setLoading(false);
            setError(null);
        } else if (id) {
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
            <div className="flex flex-col overflow-hidden">

                <div className="h-[400px] overflow-hidden">
                    <div className="relative h-full">
                        {!sinFecha && (
                            <div className="absolute top-8 left-7 z-10 bg-gradient-to-r bg-[#FFF300] text-gray-900 text-[11px] font-semibold px-3 py-0.5 shadow-md font-serif uppercase">
                                {post.fecha}
                            </div>
                        )}
                        <img
                            src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                            className="w-full h-full object-cover"
                            alt={post.titulo}
                        />
                        {/* Mostrar los stickers en la imagen, igual que en PostPrincipal */}
                        <div className="absolute top-7 right-9 flex gap-1 z-10">
                            {stickers.map(clave => {
                                const icono = iconosDisponibles.find(i => i.clave === clave);
                                return icono ? (
                                    <img
                                        key={clave}
                                        src={icono.icono}
                                        alt={icono.nombre}
                                        className="h-15 w-15 rounded-full shadow"
                                    />
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>

                {/* Sección negra - igual que en PostPrincipal */}
                <div className="bg-black p-8 flex flex-col h-[325px] relative">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="font-serif inline-block bg-[#FFF200] text-gray-900 uppercase text-[10px] font-bold px-3 py-0.5 shadow-md">
                            {post.tipo_nota}
                        </span>
                        {/* Los stickers ya están en la imagen, así que los quitamos de aquí */}
                    </div>
                    <h1 className="text-white text-[40px] leading-[1.1] font-black flex-1 overflow-hidden content-center">
                        {post.titulo}
                    </h1>
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