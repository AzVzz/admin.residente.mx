import labikiniBotanero from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/labikinabotanero.jpeg'
import lasRudasMx from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/lasrudasmx.jpeg'
import losDogos from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/losdogossannicolas.jpeg'
import nuevaEdicionResidente from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/nuevaedcionResidente.gif'
import tonysTacos from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/tonystacos.jpeg'

const VideosHorizontal = () => {
    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black">
            <div className="max-w-[1080px] mx-auto my-10">

                <h3 className="text-white text-5xl pb-5 mb-5">Videos</h3>
                <div className="grid grid-cols-4 gap-5 overflow-x-auto">
                    {[labikiniBotanero, lasRudasMx, losDogos, tonysTacos].map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            className="w-auto h-auto object-cover flex-shrink-0"
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}

export default VideosHorizontal