import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- importa esto
import { catalogoSeccionesGet } from '../../../../componentes/api/CatalogoSeccionesGet.js';
import GuiaNl from '../../../../imagenes/logos/blancos/Guia_Logo_Blanco.png';
import CalidadPrecio from '../../../../imagenes/Iconografia/calidad-precio.png';
import Yum from '../../../../imagenes/Iconografia/yum.png';
import Mty from '../../../../imagenes/Iconografia/mty.png';
import Memorable from '../../../../imagenes/Iconografia/estrellas.png';

const iconos = [CalidadPrecio, Yum, Mty, Memorable];

const DirectorioVertical = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openIndex, setOpenIndex] = useState(null);
    const buttonRefs = useRef([]);
    const navigate = useNavigate(); // <-- inicializa el hook

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
        <div className="bg-black text-white flex flex-col p-5 gap-5 relative">
            <img src={GuiaNl} className="w-48 h-auto" />
            <p className="text-xl leading-5.5">El directorio gastronómico diseñado para ayudarte a <br />decidir dónde ir a comer hoy.</p>
            <ol className="flex flex-col gap-3">
                {data.map((seccion, i) => (
                    <li key={seccion.seccion} className="relative">
                        <button
                            ref={el => buttonRefs.current[i] = el}
                            className="w-full flex items-center justify-between text-left font-bold py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 transition"
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        >
                            <img
                                src={iconos[i]}
                                alt={seccion.seccion}
                                className="w-6 h-6 mr-3 flex-shrink-0"
                            />
                            <span className="flex-1">Busca por {seccion.seccion.toLowerCase()}</span>
                            <span className="ml-2">
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${openIndex === i ? 'rotate-90' : 'rotate-0'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </button>
                        {openIndex === i && (
                            <ul
                                className="absolute left-0 top-full z-10 mt-1 bg-gray-900 border border-gray-700 rounded shadow-lg min-w-[180px] flex flex-col gap-1"
                                style={{ minWidth: buttonRefs.current[i]?.offsetWidth || 180 }}
                            >
                                {seccion.categorias.map((categoria) => (
                                    <li
                                        key={categoria.nombre}
                                        className="pl-4 py-2 hover:bg-gray-700 text-sm cursor-pointer"
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