import { useEffect, useState } from 'react';
import { catalogoSeccionesGet } from '../../../componentes/api/CatalogoSeccionesGet.js';
import { urlApi } from '../../../componentes/api/url.js';


//                <p className="flex col-span-3 text-xl leading-5.5 text-white justify-center items-center">El directorio gastronómico diseñado para <br /> ayudarte a decidir dónde ir a comer hoy.</p>
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
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black py-8 ">
            <div className="grid grid-cols-6 max-w-[1080px] mb-5 w-full mx-auto py-0 gap-8">
                <img
                    src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/guia-logo-blanco.webp`}
                    className="col-span-1 w-auto h-15 object-contain"
                />

                <p className="flex col-span-3 text-xl leading-5.5 text-white justify-center items-center">Tu concierge gastronómico que te ayudará con recomendaciones de acuerdo a tus gustos.</p>

                <div className="col-span-2 flex items-center justify-center">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="h-10 w-full max-w-md px-4 py-2 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                </div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 max-w-[1080px] mx-auto py-0 gap-10">
                {data.map((seccion, i) => (
                    <div
                        key={i}
                        className={`${seccion.cols === 2 ? 'md:col-span-2' : 'md:col-span-1'}`}
                    >
                        <h3 className="font-bold mb-2 text-xl border-b-1 border-white border-dotted text-white">{seccion.seccion}</h3>
                        <ul className={`text-base text-gray-300 font-roman
                        ${seccion.cols === 2
                                ? 'grid grid-cols-2 gap-1'
                                : 'space-y-0.5'
                            }`
                        }>
                            {seccion.categorias.map((categoria, index) => (
                                <li key={index}>
                                    <span className="cursor-pointer hover:underline hover:text-white">
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