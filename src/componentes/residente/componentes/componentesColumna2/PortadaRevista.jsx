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


        <div className="flex flex-row justify-start items-start">
            {revistaActual && revistaActual.pdf ? (
                <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                    <img
                        src={revistaActual.imagen_portada}
                        alt="Portada Revista"
                        className="w-50 h-full object-contain cursor-pointer pt-2"
                        title="Descargar PDF"
                    />
                    <a
                        href={revistaActual?.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                    >
                        <span className="text-[#fff300] text-[18px] pt-3 cursor-pointer hover:underline mt-2">
                            Descarga aqui {">"}
                        </span>
                    </a>
                </a>
            ) : (
                <img
                    src={revistaActual}
                    alt="Portada Revista"
                    className="h-auto sm:w-32 w-22 object-cover"
                />
            )}
            <div className="flex flex-col ml-4 justify-between">
                <h3 className="text-2xl font-bold text-[#fff300] ">En Portada</h3>
                <h2 className="text-white text-[20px] leading-6.5">
                    Grupo Blend: Innovación<br />
                    y comunidad en la escena<br />
                    gastronómica de Monterrey.
                </h2>

            </div>
        </div>
    )
}

export default PortadaRevista
