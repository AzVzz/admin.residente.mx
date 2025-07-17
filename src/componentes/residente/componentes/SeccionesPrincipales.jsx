import { useEffect, useState } from 'react';
import { catalogoSeccionesGet } from '../../../componentes/api/CatalogoSeccionesGet.js';

const SeccionesPrincipales = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black mb-3 py-15 ">
            <div className="relative max-w-[1080px] mb-5 w-full mx-auto py-0">
                <h2 className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-5xl font-bold">
                    Directorio
                </h2>
                <input
                    type="text"
                    placeholder="Buscar..."
                    className="block mx-auto w-full max-w-md px-4 py-2 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 max-w-[1080px] mx-auto py-0 gap-4">
                {data.map((seccion, i) => (
                    <div
                        key={i}
                        className={`${seccion.cols === 2 ? 'md:col-span-2' : 'md:col-span-1'}`}
                    >
                        <h3 className="font-bold mb-2 text-xl border-b-2 text-white">{seccion.seccion}</h3>
                        <ul className={`
                            text-base text-gray-300 
                            ${seccion.cols === 2
                                ? 'grid grid-cols-2 gap-2'
                                : 'space-y-1'
                            }`
                        }>
                            {seccion.categorias.map((categoria, index) => (
                                <li key={index} className="py-0">
                                    <span className="cursor-pointer hover:underline inline-block hover:text-white">
                                        {categoria.nombre}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeccionesPrincipales;