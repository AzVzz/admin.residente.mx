import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { notasPublicadasPorId } from "../../api/notasPublicadasGet"; // Ajusta el path si es necesario
import { urlApi } from "../../api/url.js";
import { cuponesGet } from "../../api/cuponesGet.js";
import { Iconografia } from '../../utils/Iconografia.jsx';
import { FaWhatsapp, FaInstagram, FaLink } from 'react-icons/fa';

const DetallePost = ({ post: postProp, onVolver, sinFecha = false, barraMarquee, revistaActual }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(postProp);
    const [loading, setLoading] = useState(!postProp);
    const [error, setError] = useState(null);
    const [cupones, setCupones] = useState([]);
    const [loadingCupones, setLoadingCupones] = useState(true);
		const [copied, setCopied] = useState(false);

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

		const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
		const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${post.titulo} - ${shareUrl}`)}`;

		const handleCopyUrl = async () => {
			try {
				await navigator.clipboard.writeText(shareUrl);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (_) {
				// Fallback
				const temp = document.createElement('input');
				temp.value = shareUrl;
				document.body.appendChild(temp);
				temp.select();
				document.execCommand('copy');
				document.body.removeChild(temp);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}
		};

		const tryOpenInstagramApp = () => {
			// Best-effort attempt to open the native app; falls back to web after a short delay
			const appLink = 'instagram://camera';
			const a = document.createElement('a');
			a.href = appLink;
			a.style.display = 'none';
			document.body.appendChild(a);
			let fallbackOpened = false;
			const timer = setTimeout(() => {
				fallbackOpened = true;
				window.open('https://www.instagram.com/', '_blank');
				document.body.removeChild(a);
			}, 700);
			try {
				a.click();
			} finally {
				// If app opens, browser will lose focus and timeout likely won't run; otherwise fallback triggers
				setTimeout(() => {
					if (!fallbackOpened && document.body.contains(a)) {
						document.body.removeChild(a);
					}
					clearTimeout(timer);
				}, 1200);
			}
		};

		const handleShareWhatsApp = async () => {
			const shareData = {
				title: post?.titulo || 'Residente',
				text: post?.titulo ? `${post.titulo}` : '',
				url: shareUrl
			};
			if (typeof navigator !== 'undefined' && navigator.share) {
				try {
					await navigator.share(shareData);
					return;
				} catch (_) {
					// user cancelled or share failed -> fallback to WhatsApp web
				}
			}
			window.open(whatsappHref, '_blank');
		};

		const handleShareInstagram = async () => {
			const shareData = {
				title: post?.titulo || 'Residente',
				text: post?.titulo ? `${post.titulo}` : '',
				url: shareUrl
			};
			if (typeof navigator !== 'undefined' && navigator.share) {
				try {
					await navigator.share(shareData);
					return;
				} catch (_) {
					// user cancelled or share failed -> fallback
				}
			}
			// Fallback: abrir Instagram Direct para componer mensaje (web) y, si no, intentar app
			const directUrl = `https://www.instagram.com/direct/new/?text=${encodeURIComponent(`${post.titulo} ${shareUrl}`)}`;
			const opened = window.open(directUrl, '_blank');
			if (!opened) {
				tryOpenInstagramApp();
			}
		};

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
						{/* Share actions under title */}
						<div className="self-center flex items-center justify-center gap-4 mt-5 mb-0">
							<button
								type="button"
								onClick={handleShareWhatsApp}
								className="text-sm font-roman underline cursor-pointer flex items-center justify-center gap-1"
								aria-label="Compartir en WhatsApp"
								title="Compartir en WhatsApp"
							>
								<FaWhatsapp size={35} />
							</button>
							<button
								type="button"
								onClick={handleShareInstagram}
								className="text-sm font-roman underline cursor-pointer flex items-center justify-center gap-1"
								aria-label="Abrir Instagram"
								title="Abrir Instagram"
							>
								<FaInstagram size={35} />
							</button>
							<button
								type="button"
								onClick={handleCopyUrl}
								className="text-sm font-roman underline cursor-pointer flex items-center justify-center gap-1"
								aria-label="Copiar URL"
								title="Copiar URL"
							>
								<FaLink size={30} />
								{copied && <span className="ml-1 text-lg">URL copiada</span>}
							</button>
						</div>
                    </div>
                </div>
            </div>
            {/* Contenido adicional */}
            <div className="flex flex-col gap-5 px-10 pt-0 pb-6">
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