import { useEffect, useState } from "react";
import { urlApi } from "../../../api/url.js";
import { useData } from "../../../DataContext";
import { notasResidenteGet } from "../../../api/notasPublicadasGet";
import { revistaGetUltima } from "../../../api/revistasGet";


const PortadaRevista = () => {
    const { revistaActual: revistaDelContexto } = useData();
    const [loading, setLoading] = useState(true);
    const [notas, setNotas] = useState([]);
    const [revistaActual, setRevistaActual] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Cargar datos de revista si no están en el contexto
                if (!revistaDelContexto) {
                    const revistaData = await revistaGetUltima();
                    setRevistaActual(revistaData);
                } else {
                    setRevistaActual(revistaDelContexto);
                }

                // Cargar notas residente
                const data = await notasResidenteGet();
                setNotas(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error cargando datos:', error);
                setNotas([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [revistaDelContexto]);

    if (loading) {
        return (
            <div className="flex flex-col items-end">
                <div className="w-48 h-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end">
            <div className="relative">
                {/* Línea amarilla con bordes inclinados */}
                <div className="absolute left-[-90px] top-1/2 transform -translate-y-1/2 w-20 h-[10px] bg-[#fff300] -skew-x-32"></div>

                {/* Logo */}
                <img
                    src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/EN%20PORTADA.webp`}
                    className="h-full w-46 object-contain"
                    alt="Logo Infografías"
                />
            </div>
            <div className="flex flex-row justify-start relative mt-3">
                {/* Contenedor de textos */}
                <div className="flex flex-col mr-4 justify-end">
                    <div className="flex justify-end items-end">
                        <h2 className="text-black text-[19px] leading-5 whitespace-pre-line text-right ml-10">
                            {revistaActual?.descripcion || "Revista Residente"}
                        </h2>
                    </div>
                </div>

                {revistaActual && revistaActual.imagen_portada ? (
                    revistaActual.pdf ? (
                        <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer">
                            <img
                                src={revistaActual.imagen_portada}
                                alt="Portada Revista"
                                className="max-h-[200px] max-w-[220px] object-contain cursor-pointer drop-shadow-[4px_3px_2px_rgba(0,0,0,0.3)] border border-dotted border-gray-800/60"
                                title="Descargar PDF"
                            />
                        </a>
                    ) : (
                        <img
                            src={revistaActual.imagen_portada}
                            alt="Portada Revista"
                            className="max-h-[200px] max-w-[220px] object-contain drop-shadow-[4px_3px_2px_rgba(0,0,0,0.3)]"
                        />
                    )
                ) : (
                    <div className="max-h-[200px] max-w-[220px] bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                        Sin portada disponible
                    </div>
                )}
            </div>
        </div>
    )
}

export default PortadaRevista
