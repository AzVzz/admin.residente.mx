import { useEffect, useState } from "react";
import { notasResidenteGet } from "../../../api/notasPublicadasGet";
import { revistaGetUltima } from "../../../api/revistasGet";
import { urlApi } from "../../../api/url.js";

const apodaca = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/apo.webp`;
const escobedo = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/esc.webp`;
const guadalupe = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/gpe.webp`;
const monterrey = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/mty.webp`;
const sannicolas = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/snn.webp`;
const sanpedro = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/spg.webp`;
const santacatarina = `${urlApi}fotos/fotos-estaticas/componente-iconos/iconos-negros/sta.webp`;

const iconosZonales = [
    { src: apodaca, alt: "Apodaca" },
    { src: escobedo, alt: "Escobedo" },
    { src: guadalupe, alt: "Guadalupe" },
    { src: monterrey, alt: "Monterrey" },
    { src: sannicolas, alt: "San Nicolás" },
    { src: sanpedro, alt: "San Pedro" },
    { src: santacatarina, alt: "Santa Catarina" },
];

const EnPortada = ({ notasResidenteGet, onCardClick }) => {
    const [notas, setNotas] = useState([]); // Cambia a array
    const [loading, setLoading] = useState(true);
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

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!notas.length) return null;

    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#fff300]">
            <div className="max-w-[1080px] mx-auto my-7">
                <div className="flex justify-between">
                    <img src={`${urlApi}/fotos/fotos-estaticas/residente-logos/negros/residente-restaurant-magazine-negro.webp`} className="w-85 h-full mb-8 object-contain" />
                    <div className="flex">
                        {iconosZonales.map((icon, idx) => (
                            <img key={idx} src={icon.src} alt={icon.alt} className="h-9 w-9 shadow-md rounded-full" />
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-[1.2fr_1.8fr] gap-10">
                    {/* Columna Izquierda */}
                    <div className="flex flex-col justify-start items-start">

                        <div className="flex flex-row">
                            {revistaActual && revistaActual.pdf ? (
                                <a href={revistaActual.pdf} target="_blank" rel="noopener noreferrer" download>
                                    <img
                                        src={revistaActual.imagen_portada}
                                        alt="Portada Revista"
                                        className="w-65 h-full object-cover cursor-pointer"
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
                            <div className="flex flex-col ml-6 justify-between">
                                <h3 className="text-2xl font-bold text-black ">En Portada</h3>
                                <h2 className="text-black text-[22px] leading-6.5">
                                    Grupo Blend: Innovación<br />
                                    y comunidad en la escena<br />
                                    gastronómica de Monterrey.
                                </h2>
                                <a
                                    href={revistaActual?.pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                >
                                    <span className="text-black text-[18px] pt-3 cursor-pointer hover:underline mt-2">
                                        Descarga aqui {">"}
                                    </span>
                                </a>
                            </div>
                        </div>

                    </div>
                    {/* Columna Derecha */}
                    <div className="flex flex-row justify-end gap-6">
                        {notas.slice(0, 3).map((nota) => (
                            <div
                                key={nota.id}
                                className="relative w-40 cursor-pointer"
                                onClick={() => onCardClick && onCardClick(nota)}
                            >
                                <img src={nota.imagen} alt="Portada Revista" className="w-full h-28 object-cover shadow-lg" />
                                <div className="flex flex-col mt-4 text-right">
                                    <h2 className="text-black text-[14px] leading-4.5 text-wrap">{nota.titulo}</h2>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnPortada;