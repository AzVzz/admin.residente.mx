import tonysTacos from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/tonystacos.jpeg';
import PortadaRevista from '../../../../imagenes/bannerRevista/PortadaRevista.jpg';
import ResidenteRestaurantMagazine from '../../../../imagenes/logos/ResidenteRestaurantMagazine.png'
import FotoBannerPrueba from '../../../../imagenes/FotoBannerPrueba.png';

const EnPortada = () => {
    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black">
            <div className="max-w-[1080px] mx-auto my-10">

                <div className="flex flex-row items-center gap-10">

                    {/* Columna Izquierda: Imagen centrada */}
                    <div className="flex-1 flex flex-col justify-star items-start">

                        <img src={ResidenteRestaurantMagazine} className="w-auto h-15 mb-5" />
                        <div className="flex flex-row">
                            <img src={PortadaRevista} alt="Portada Revista" className="w-60 h-full shadow-lg" />
                            <div className="flex flex-col ml-8">

                                <h3 className="text-3xl font-bold text-[#fff300]">En Portada</h3>
                                <h2 className="text-white text-3xl">Grupo Blend: Innovación
                                    y comunidad en la escena
                                    gastronómica de Monterrey.</h2>

                            </div>
                        </div>
                        <span className="text-[#fff300] text-2xl pt-3">Descarga la nueva edición {">"}</span>
                    </div>

                    {/* Columna Derecha: Imagen + texto en modo espejo */}
                    <div className="flex-1 flex flex-col items-end">
                        <div className="flex flex-col">
                            <img src={PortadaRevista} alt="Portada Revista" className="w-60 h-full shadow-lg" />
                            <div className="flex flex-col ml-8">

                                <h3 className="text-3xl font-bold text-[#fff300]">En Portada</h3>
                                <h2 className="text-white text-3xl">Grupo Blend: Innovación
                                    y comunidad en la escena
                                    gastronómica de Monterrey.</h2>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnPortada;