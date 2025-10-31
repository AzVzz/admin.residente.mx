import { urlApi, imgApi } from '../../../api/url'

const MiniaturasVideos = () => {
    return (
        <div className="flex flex-col gap-3">
            <img 
                src={`${imgApi}fotos/fotos-estaticas/residente-columna1/miniatura-videos/labikinabotanero.webp`}
                className="h-55 object-cover"
            />
            <img 
                src={`${imgApi}fotos/fotos-estaticas/residente-columna1/miniatura-videos/lasrudasmx.webp`}
                className="h-55 object-cover"
            />
            <img 
                src={`${imgApi}fotos/fotos-estaticas/residente-columna1/miniatura-videos/los-dogos-san-nicolas.webp`}
                className="h-55 object-cover"
            />
            <img 
                src={`${imgApi}fotos/fotos-estaticas/residente-columna1/miniatura-videos/nueva-edicion-residente.webp`}
                className="h-55 object-cover"
            />
            <img 
                src={`${imgApi}fotos/fotos-estaticas/residente-columna1/miniatura-videos/tonys-tacos.webp`}
                className="h-55 object-cover"
            />
        </div>
    )
}

export default MiniaturasVideos