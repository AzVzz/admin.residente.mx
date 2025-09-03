import { useEffect, useState } from "react";
import { urlApi } from "../../../api/url.js";
import { useData } from "../../../DataContext";
import { notasResidenteGet } from "../../../api/notasPublicadasGet";


const PortadaRevista = () => {
    const { revistaActual } = useData();
    const [loading, setLoading] = useState(true);
    const [notas, setNotas] = useState([]);

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


        <div className="flex flex-row justify-start relative">

            {/* Contenedor de textos */}
            <div className="flex flex-col mr-4 justify-between">

                <h3 className="text-[28px] font-bold text-[#fff300] text-right">En Portada</h3>

                <div className="flex">
                    <h2 className="text-black text-[19px] leading-5 whitespace-pre-line text-right">
                        {revistaActual?.descripcion || ""}
                    </h2>
                </div>
            </div>

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


            {/* Ícono de descarga en posición absoluta */}

        </div>
    )
}

export default PortadaRevista
