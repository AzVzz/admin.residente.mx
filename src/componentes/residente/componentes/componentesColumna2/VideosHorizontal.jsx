import { urlApi } from '../../../api/url'

const VideosHorizontal = () => {
    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black">
            <div className="max-w-[1080px] mx-auto my-10">

                <h3 className="text-white text-5xl pb-5 mb-5">Videos</h3>
                <div className="grid grid-cols-4 gap-5 overflow-x-auto">
                    {[`${urlApi}fotos/fotos-estaticas/residente-columna1/miniatura-videos/labikinabotanero.webp`,
                    `${urlApi}fotos/fotos-estaticas/residente-columna1/miniatura-videos/lasrudasmx.webp`,
                    `${urlApi}fotos/fotos-estaticas/residente-columna1/miniatura-videos/los-dogos-san-nicolas.webp`,
                    `${urlApi}fotos/fotos-estaticas/residente-columna1/miniatura-videos/tonys-tacos.webp`].map((img, i) => (
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