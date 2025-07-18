import tonysTacos from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/tonystacos.jpeg'
import PortadaRevista from '../../../../imagenes/bannerRevista/PortadaRevista.jpg';

const EnPortada = () => {
    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black">
            <div className="max-w-[1080px] mx-auto my-10">
                <h3 className="text-white text-5xl font-bold mb-8">En Portada</h3>
                <div className="flex flex-row items-center gap-8">
                    {/* Columna Izquierda: Imagen centrada */}
                    <div className="flex-1 flex justify-star items-center">
                        <img src={PortadaRevista} alt="Portada Revista" className="w-80 h-auto rounded shadow-lg" />
                    </div>
                    {/* Columna Derecha: 2 columnas de texto */}
                    <div className="flex-1 grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-white text-lg font-semibold mb-2">Columna 1</h4>
                            <p className="text-gray-200">
                                Aquí va el texto de la primera columna. Puedes poner cualquier contenido relevante.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white text-lg font-semibold mb-2">Columna 2</h4>
                            <p className="text-gray-200">
                                Aquí va el texto de la segunda columna. Puedes poner cualquier contenido relevante.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnPortada;