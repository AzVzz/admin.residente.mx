import { urlApi } from '../../../api/url';
import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { notasPorSeccionCategoriaGet } from '../../../api/notasPorSeccionCategoriaGet';
import { restaurantesPorSeccionCategoriaGet } from '../../../api/restaurantesPorSeccionCategoriaGet';

import CarruselPosts from '../../../../componentes/residente/componentes/componentesColumna2/CarruselPosts.jsx';
import TarjetaHorizontalPost from '../../../../componentes/residente/componentes/componentesColumna2/TarjetaHorizontalPost.jsx'
import DirectorioVertical from '../componentesColumna2/DirectorioVertical.jsx';
import OpcionesExtra from '../componentesColumna3/OpcionesExtra.jsx';


const MainSeccionesCategorias = () => {
    const location = useLocation();
    const params = useParams();
    const seccion = location.state?.seccion || params.seccion;
    const categoria = location.state?.categoria || params.categoria;
    const [notas, setNotas] = useState([]);
    const [restaurantes, setRestaurantes] = useState([]); // <-- Nuevo estado
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!seccion || !categoria) return;
        setLoading(true);
        Promise.all([
            notasPorSeccionCategoriaGet(seccion, categoria),
            restaurantesPorSeccionCategoriaGet(seccion, categoria)
        ])
            .then(([notasData, restaurantesData]) => {
                setNotas(notasData);
                setRestaurantes(restaurantesData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [seccion, categoria]);

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="mt-5 mb-5">
            <div className="grid grid-cols-6 gap-5">
                <div className="col-span-2">
                    <h1 className="text-[150px] font-bold mb-4 leading-30 tracking-tight">{categoria}</h1>
                    <p className="text-[21px] leading-[1.6rem]">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>
                <div className="col-span-4">
                    <CarruselPosts restaurantes={restaurantes.slice(0, 5)} />
                </div>
            </div>
            <div className="grid grid-cols-6 gap-5 mt-5 mb-5">
                {restaurantes.length > 0 ? (
                    restaurantes.map(rest => (
                        <div key={rest.id} className="relative items-center">
                            <div className="relative h-60">
                                {/* Etiqueta flotante con el nombre */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black text-white text-[10px] font-semibold font-sans px-2 py-1 shadow-md uppercase whitespace-nowrap">
                                    {rest.nombre_restaurante.charAt(0).toUpperCase() + rest.nombre_restaurante.slice(1).toLowerCase()}
                                </div>
                                <img
                                    src={rest.imagenes && rest.imagenes.length > 0
                                        ? urlApi.replace(/\/$/, '') + rest.imagenes[0].src
                                        : "https://via.placeholder.com/180x120?text=Sin+Imagen"}
                                    className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                                    alt={rest.nombre_restaurante}
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <span>No hay restaurantes</span>
                )}
            </div>

            <div className="mb-5 bg-black text-white px-3 py-2 overflow-hidden relative">
                <div className="flex animate-marquee">
                    <span className="whitespace-nowrap">
                        Noticias y más recomendaciones de {categoria}
                    </span>
                    <span className="whitespace-nowrap ml-[800px]">
                        Noticias y más recomendaciones de {categoria}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="col-span-1 flex flex-col gap-5">
                    {notas.map(nota => (
                        <TarjetaHorizontalPost key={nota.id} post={nota} />
                    ))}
                </div>
                <div className="col-span-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Más recomendaciones de <br />{categoria}</h2>
                            <ul>
                                {restaurantes.map(rest => (
                                    <li key={rest.id} className="mb-2 text-xl">
                                        {rest.nombre_restaurante.charAt(0).toUpperCase() + rest.nombre_restaurante.slice(1).toLowerCase()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <OpcionesExtra />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainSeccionesCategorias;