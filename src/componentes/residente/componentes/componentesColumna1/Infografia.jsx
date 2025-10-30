import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { getUltimaInfografia } from "../../../api/infografiaApi";
import { urlApi } from '../../../../componentes/api/url.js'
const Infografia = () => {
    const navigate = useNavigate();
    const [ultima, setUltima] = useState(null);

    useEffect(() => {
        getUltimaInfografia().then(setUltima);
    }, []);

    const handleInfografiaClick = () => {
        navigate('/infografia');
    };

    return (
        <div className="flex flex-col items-end">

            {/* Contenedor relativo para el logo y la línea */}
            <div className="relative">
                {/* Línea amarilla con bordes inclinados */}
                <div className="absolute left-[-90px] top-1/2 transform -translate-y-1/2 w-20 h-[10px] bg-[#fff300] -skew-x-32"></div>

                {/* Logo */}
                <img
                    src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/LOGO%20INFOGRAFÍAS.webp"
                    className="h-full w-46 object-contain cursor-pointer"
                    alt="Logo Infografías"
                    onClick={handleInfografiaClick}
                />
            </div>

            {/* Contenedor principal */}
            <div className="flex flex-row justify-start relative mt-3">
                {/* Contenedor del texto sentado abajo */}
                <div className="flex flex-col mr-4 justify-end">
                    <h2 className="text-black text-[19px] leading-5 whitespace-pre-line text-right pl-4">
                        Toda la información gastronomica ordenada para que la puedas descargar, compartir e impresionar a tus amigos
                    </h2>
                </div>

                {/* Imagen de la última infografía o imagen por defecto */}
                {ultima && ultima.info_imagen ? (
                    <img
                        src={ultima.info_imagen}
                        alt="Infografía"
                        className="max-h-[200px] max-w-[220px] object-contain cursor-pointer drop-shadow-[4px_3px_2px_rgba(0,0,0,0.3)] border border-dotted border-gray-800/60"
                        onClick={handleInfografiaClick}
                    />
                ) : (
                    <img
                        src={`${urlApi}fotos/fotos-estaticas/componente-news-letter/tacos-827x1024.jpg`}
                        alt="Infografía"
                        className="h-50 w-auto object-contain cursor-pointer drop-shadow-[4px_3px_2px_rgba(0,0,0,0.3)] border-1 border-dotted border-gray-800/60"
                        onClick={handleInfografiaClick}
                    />
                )}
            </div>
        </div>
    )
}

export default Infografia;