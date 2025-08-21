import { useEffect, useState } from "react";
import { revistaGetUltima } from "../../../api/revistasGet";
import { urlApi } from "../../../api/url.js";


const PortadaRevista = () => {
    const [revistaActual, setRevistaActual] = useState(null);

    useEffect(() => {
        const fetchRevista = async () => {
            try {
                const data = await revistaGetUltima();
                setRevistaActual(data);
            } catch (error) {
                setRevistaActual(null);
            }
        };
        fetchRevista();
    }, []);

    useEffect(() => {
        const fetchNota = async () => {
            try {
                const data = await notasResidenteGet();
                setNotas(Array.isArray(data) ? data : []);
            } catch (error) {
                setNotas([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNota();
    }, []);

    return (


        <div className="flex flex-row justify-start items-start relative">
            {revistaActual && revistaActual.pdf ? (
                <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                    <img
                        src={revistaActual.imagen_portada}
                        alt="Portada Revista"
                        className="w-50 h-full object-contain cursor-pointer pt-2 drop-shadow-[4px_3px_2px_rgba(0,0,0,0.3)]"
                        title="Descargar PDF"
                    />
                </a>
            ) : (
                <img
                    src={revistaActual}
                    alt="Portada Revista"
                    className="h-auto sm:w-32 w-22 object-cover"
                />
            )}

            {/* Contenedor de textos */}
            <div className="flex flex-col ml-4 justify-between">
                <h3 className="text-2xl font-bold text-[#fff300]">En Portada</h3>
                <h2 className="text-white text-[20px] leading-6.5">
                    Grupo Blend: Innovación<br />
                    y comunidad en la escena<br />
                    gastronómica de Monterrey.
                </h2>
            </div>

            {/* Ícono de descarga en posición absoluta */}
            <div className="absolute top-0 right-0">
                <a
                    href={revistaActual?.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                >
                    <img
                        src={`${urlApi}/fotos/fotos-estaticas/componente-iconos/descarga.png`}
                        className="w-16 h-16 object-contain cursor-pointer hover:opacity-80"
                        alt="Descargar PDF"
                    />
                </a>
            </div>
        </div>
    )
}

export default PortadaRevista
