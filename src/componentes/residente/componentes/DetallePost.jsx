import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { notasPublicadasPorId } from "../../api/notasPublicadasGet"; // Ajusta el path si es necesario
import { urlApi } from "../../api/url.js";
import { cuponesGet } from "../../api/cuponesGet.js";
import { Iconografia } from '../../utils/Iconografia.jsx';

const DetallePost = ({ post: postProp, onVolver, sinFecha = false, barraMarquee, revistaActual }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(postProp);
    const [loading, setLoading] = useState(!postProp);
    const [error, setError] = useState(null);
    const [cupones, setCupones] = useState([]);
    const [loadingCupones, setLoadingCupones] = useState(true);

    // Desplazar el scroll al inicio al cargar el componente
    useEffect(() => {
        window.scrollTo(0, 0); // Desplaza el scroll al inicio de la página
    }, []);

    // Formatea una cadena de fecha para ocultar la hora en la vista de detalle
    const formatearFechaSinHora = (fechaStr) => {
        if (!fechaStr) return '';
        // Si viene en ISO, usamos toLocaleDateString
        if (typeof fechaStr === 'string' && fechaStr.includes('T')) {
            const d = new Date(fechaStr);
            if (isNaN(d)) return fechaStr;
            const texto = d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
            return texto.toUpperCase();
        }
        // Si viene como "OCTUBRE 15, 2025 06:00" o similar, quitamos la parte de hora
        // Busca un patrón de hora HH:MM opcional con a.m./p.m.
        const sinHora = fechaStr
            .replace(/\s+\d{1,2}:\d{2}(?:\s*(?:a\.m\.|p\.m\.|AM|PM))?$/i, '') // quita hora al final
            .replace(/\s+-\s*\d{1,2}:\d{2}$/i, ''); // casos "... - 06:00"
        return sinHora;
    };

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

    const iconosDisponibles = [
        ...Iconografia.categorias,
        ...Iconografia.ocasiones,
        ...Iconografia.zonas
    ];

    const stickers = Array.isArray(post.sticker)
        ? post.sticker
        : post.sticker
            ? [post.sticker]
            : [];

    return (
        <>
            <div className="flex flex-col">
                <div className="flex flex-col max-h-[900px] overflow-hidden mb-4">
                    <div className="h-[450px] overflow-hidden">
                        <div className="relative h-full">
                            <img
                                src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                                className="w-full h-full object-cover"
                                alt={post.titulo}
                            />
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
                    <div className="bg-transparent flex flex-col max-h-[400px] relative min-h-[120]">
                        {!sinFecha && (
                            <div className="flex justify-center items-center pt-4">
                                <div className="z-10 bg-gradient-to-r bg-transparent text-black text-[14px] font-black px-6 py-0.5 font-roman uppercase w-fit flex">
                                    {formatearFechaSinHora(post.fecha)}
                                </div>
                            </div>
                        )}
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
            {/* Contenido adicional */}
            <div className="flex flex-col gap-5 px-10 py-6">
                <h2 className="text-3xl font-roman">{post.subtitulo}</h2>
                <div
                    className="text-xl font-roman leading-relaxed"
                    style={{
                        lineHeight: '1.3',
                        marginBottom: '1.5rem'
                    }}
                    dangerouslySetInnerHTML={{
                        __html: post.descripcion?.replace(/\n/g, '<br><br>') || ''
                    }}
                />
                <button className="cursor-pointer" onClick={() => navigate(-1)}>
                    ← Volver al listado
                </button>
            </div>
        </>
    );
};

export default DetallePost;