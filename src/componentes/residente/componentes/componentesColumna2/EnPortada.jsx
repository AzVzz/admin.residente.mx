import { useEffect, useState } from "react";
import { notasResidenteGet } from "../../../api/notasPublicadasGet";
import tonysTacos from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/tonystacos.jpeg';
import PortadaRevista from '../../../../imagenes/bannerRevista/PortadaRevista.jpg';
import ResidenteRestaurantMagazine from '../../../../imagenes/logos/ResidenteRestaurantMagazine.png'
import FotoBannerPrueba from '../../../../imagenes/FotoBannerPrueba.png';

const EnPortada = ({ notasResidenteGet }) => {
    const [nota, setNota] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNota = async () => {
            try {
                const data = await notasResidenteGet();
                setNota(Array.isArray(data) ? data[0] : null);
            } catch (error) {
                setNota(null);
            } finally {
                setLoading(false);
            }
        };
        fetchNota();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!nota) return null;

    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black">
            <div className="max-w-[1080px] mx-auto my-10">
                <img src={ResidenteRestaurantMagazine} className="w-60 h-full mb-4 object-contain" />
                <div className="grid grid-cols-[1fr_1fr_0.8fr]">

                    {/* Columna Izquierda: Imagen centrada */}
                    <div className="flex-1 flex flex-col justify-star items-start">


                        <div className="flex flex-row">
                            <img src={PortadaRevista} alt="Portada Revista" className="w-60 h-full shadow-lg" />
                            <div className="flex flex-col ml-8">

                                <h3 className="text-3xl font-bold text-[#fff300]">En Portada</h3>
                                <h2 className="text-white text-3xl">Grupo Blend: Innovación
                                    y comunidad en la escena
                                    gastronómica de Monterrey.</h2>
                            </div>
                        </div>
                        <span className="text-[#fff300] text-2xl pt-3 cursor-pointer hover:underline">Descarga la nueva edición {">"}</span>
                    </div>

                    <div></div>

                    {/* Columna Derecha: Imagen + texto en modo espejo */}
                    <div className="flex-1 flex flex-col items-end">
                        <div className="flex flex-col w-fit">
                            <div className="relative">
                                <img src={nota.imagen} alt="Portada Revista" className="w-full h-55 object-cover shadow-lg" />
                                <div className="absolute top-8 left-7 z-10 bg-gradient-to-r bg-[#FFF200] text-gray-900 text-[11px] font-semibold px-3 py-0.5 shadow-md font-serif uppercase">
                                    {nota.fecha}
                                </div>

                                <div className="flex flex-col mt-2">
                                    <h2 className="text-white text-2xl leading-7">{nota.titulo}</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnPortada;