import labikiniBotanero from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/labikinabotanero.jpeg'
import lasRudasMx from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/lasrudasmx.jpeg'
import losDogos from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/losdogossannicolas.jpeg'
import nuevaEdicionResidente from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/nuevaedcionResidente.gif'
import tonysTacos from '../../../../imagenes/ResidenteColumna1/miniaturasVideos/tonystacos.jpeg'

const MiniaturasVideos = () => {
    return (
        <div className="flex flex-col gap-3">
            <img 
                src={labikiniBotanero}
                className="h-55 object-cover"
            />
            <img 
                src={lasRudasMx}
                className="h-55 object-cover"
            />
            <img 
                src={losDogos}
                className="h-55 object-cover"
            />
            <img 
                src={nuevaEdicionResidente}
                className="h-55 object-cover"
            />
            <img 
                src={tonysTacos}
                className="h-55 object-cover"
            />
        </div>
    )
}

export default MiniaturasVideos