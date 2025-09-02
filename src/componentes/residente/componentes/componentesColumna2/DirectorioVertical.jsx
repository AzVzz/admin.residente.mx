import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- importa esto
import { catalogoSeccionesGet } from '../../../../componentes/api/CatalogoSeccionesGet.js';
import { urlApi } from '../../../../componentes/api/url.js';

const iconos = [
    `${urlApi}/fotos/fotos-estaticas/componente-iconos/costo.png`,
    `${urlApi}/fotos/fotos-estaticas/componente-iconos/yum.webp`,
    `${urlApi}/fotos/fotos-estaticas/componente-iconos/zona.webp`,
    `${urlApi}/fotos/fotos-estaticas/componente-iconos/corazon.webp`
];

const DirectorioVertical = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openIndex, setOpenIndex] = useState(null);
    const buttonRefs = useRef([]);
    const navigate = useNavigate(); // <-- inicializa el hook
    const menuRef = useRef(null);

    useEffect(() => {
        if (openIndex === null) return
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenIndex(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openIndex]);

    useEffect(() => {
        catalogoSeccionesGet()
            .then((result) => {
                setData(result);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Cargando opciones...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div ref={menuRef} className="bg-transparent text-white flex flex-col gap-2 relative min-w-full max-w-[348px] items-center">{/**items-center */}
            <div className="flex justify-center">
                <div className="absolute left-0 right-0 top-4 border-t-4 border-transparent opacity-100 z-0" aria-hidden="true" />
                <img src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/logo-guia-nl.webp`} className="w-42 h-auto relative z-10 px-4" />
            </div>

            <p className="text-[25px] leading-4.5 text-black">Tu concierge restaurantero</p>
            <ol className="flex flex-row mt-1 gap-1.5">
                {data.map((seccion, i) => (
                    <li key={seccion.seccion} className="flex justify-left items-center">
                        <button
                            ref={el => (buttonRefs.current[i] = el)}
                            className="w-full flex flex-col items-center justify-between font-bold rounded-full hover:bg-transparent transition cursor-pointer"
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        >
                            {/* BOLITA uniforme */}
                            <div className="size-17 shrink-0 rounded-full overflow-hidden flex items-center justify-center">
                                <img
                                    src={iconos[i]}
                                    alt={seccion.seccion}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <span className="flex-1 text-sm text-black first-letter:uppercase">
                                {{
                                    "nivel de gasto": "gasto",
                                    "tipo de comida": "sabor",
                                }[seccion.seccion.toLowerCase()] ?? seccion.seccion.toLowerCase()}
                            </span>

                            <span>
                                <svg
                                    className={`w-5 h-5 transition-transform duration-200 ${openIndex === i ? 'rotate-0' : 'rotate-90 text-black'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={4}
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 5l7 7-7 7" />
                                </svg>
                            </span>
                        </button>

                        {openIndex === i && (
                            <ul
                                className="absolute left-0 top-full z-10 bg-gray-900/75 border border-gray-700 rounded shadow-lg min-w-[180px] flex flex-col gap-1 w-full backdrop-blur-xs"
                                style={{ minWidth: buttonRefs.current[i]?.offsetWidth || 180 }}
                            >
                                {seccion.categorias.map((categoria) => (
                                    <li
                                        key={categoria.nombre}
                                        className="pl-4 py-2 hover:bg-gray-800/70 text-sm cursor-pointer"
                                        onClick={() => navigate(
                                            `/seccion/${seccion.seccion.replace(/\s+/g, '').toLowerCase()}/categoria/${categoria.nombre.replace(/\s+/g, '').toLowerCase()}`,
                                            { state: { seccion: seccion.seccion, categoria: categoria.nombre } }
                                        )}
                                    >
                                        {categoria.nombre}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    )
}

export default DirectorioVertical;