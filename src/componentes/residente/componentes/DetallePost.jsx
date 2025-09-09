import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { notasPublicadasPorId } from "../../api/notasPublicadasGet"; // Ajusta el path si es necesario
import PostComentarios from "./PostComentarios";
import ShowComentarios from "./ShowComentarios";
import { Iconografia } from '../../utils/Iconografia.jsx';
import { urlApi } from "../../api/url.js";
import BarraMarquee from "./seccionesCategorias/componentes/BarraMarquee.jsx";
import CincoNotasRRR from "./seccionesCategorias/componentes/CincoNotasRRR.jsx";
import CuponesCarrusel from "./seccionesCategorias/componentes/CuponesCarrusel.jsx";
import { cuponesGet } from "../../api/cuponesGet.js";

// DetallePost.jsx
const DetallePost = ({ post: postProp, onVolver, sinFecha = false, barraMarquee, revistaActual }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(postProp);
    const [loading, setLoading] = useState(!postProp);
    const [error, setError] = useState(null);
    const [cupones, setCupones] = useState([]);
    const [loadingCupones, setLoadingCupones] = useState(true);

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

    // Obtener todos los cupones para mostrar en cada nota
    useEffect(() => {
        setLoadingCupones(true);
        cuponesGet()
            .then(data => setCupones(Array.isArray(data) ? data : []))
            .catch(() => setCupones([]))
            .finally(() => setLoadingCupones(false));
    }, []);

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
        <>
            <div className="flex flex-col">
                {/** h-[725px]  mb-5 */}
                <div className="flex flex-col max-h-[900px] overflow-hidden mb-4 ">

                    <div className="h-[400px] overflow-hidden">
                        <div className="relative h-full">
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

                    {/* Sección transparente - igual que en la principal */}
                    <div className="bg-transparent flex flex-col max-h-[400px] relative min-h-[120]">
                        <div className="flex justify-center items-center pt-4">
                            <div className="z-10 bg-gradient-to-r bg-transparent text-black text-[14px] font-black px-6 py-0.5 font-roman uppercase w-fit flex">
                                {post.fecha}
                            </div>
                        </div>
                        <h1
                            className="text-black text-[47px] leading-[1.05] font-black flex-1 overflow-hidden text-center p-2 my-0 tracking-tight"
                            style={{
                                whiteSpace: 'pre-line',
                                wordBreak: 'break-word',
                            }}
                        >
                            {post.titulo}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Banner de revista */}
            {revistaActual && revistaActual.pdf ? (
                <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                    <img
                        src={revistaActual.imagen_banner}
                        alt="Banner Revista"
                        className="w-full cursor-pointer"
                        title="Descargar Revista"
                    />
                </a>
            ) : (
                revistaActual?.imagen_banner && (
                    <img
                        src={revistaActual.imagen_banner}
                        alt="Banner Revista"
                        className="w-full"
                    />
                )
            )}

            {/* Contenido adicional específico del detalle */}
            <div className="flex flex-col gap-5 px-10 py-6">
                <h2 className="text-3xl font-roman">{post.subtitulo}</h2>
                <div
                    className="text-xl font-roman leading-relaxed"
                    style={{
                        lineHeight: '1.3',
                        marginBottom: '1.5rem'
                    }}
                    dangerouslySetInnerHTML={{ 
                        __html: `
                            <style>
                                .contenido-nota p { margin-bottom: 1.5rem; }
                                .contenido-nota strong { display: block; margin-bottom: 0.5rem; font-weight: bold; }
                                .contenido-nota br { margin-bottom: 0.5rem; }
                            </style>
                            <div class="contenido-nota">${post.descripcion?.replace(/\n/g, '<br><br>') || ''}</div>
                        `
                    }}
                />
                <span className="text-[10.5px] leading-4 font-roman">&copy; PROHIBIDA LA REPDOUCCIÓN PARCIAL O TOTAL DE LOS TEXTOS O IDEAS CONTENIDOS EN ESTE ARTÍCULO Y ESTA PÁGINA. PROTEGIDOS POR LA LEY DE COPYRIGHT MÉXICO Y COPYRIGHT INTERNACIONES. PARA PEDIR AUTORIZACIÓN DE REPORDUCCIÓN, <a href="mailto:autorizaciones@tudominio.com?subject=Solicitud%20de%20autorización%20de%20reproducción&body=Hola,%20quisiera%20solicitar%20autorización%20para%20reproducir%20el%20contenido..." className="underline cursor-pointer">HAZ CLICK AQUÍ</a></span>

                {/**
                 * 
                 * <PostComentarios />
                 * <ShowComentarios />
                 * 
                 * contacto@residente.mx
                 */}

                <button className="cursor-pointer" onClick={() => navigate(-1)}>
                    ← Volver al listado
                </button>
            </div>

            {/* Sección de cupones - todos los cupones disponibles */}
            {/** {!loadingCupones && cupones.length > 0 && (
                <div className="w-center relative left-2/7 right-2/7 -ml-[50vw] -mr-[50vw] bg-transparent py-8">
                    <div className="max-w-[1080px] mx-auto flex flex-col items-left">
                        <h3 className="text-black text-[22px] font-bold mb-6 text-center">
                            Cupones y promociones disponibles
                        </h3>
                        <div className="w-full">
                            <CuponesCarrusel cupones={cupones} />
                        </div>
                    </div>
                </div>
            )} */}

        </>
    );
};

export default DetallePost;