import { useEffect, useState } from "react";
import { notasDestacadasPorTipoGet } from '../../../../../componentes/api/notasPublicadasGet.js';
import { urlApi } from '../../../../../componentes/api/url.js';

const TarjetaVerticalPost = ({ nota, onClick }) => (
    <div
        className="group relative bg-[#FFF200] transition-all duration-300 overflow-hidden cursor-pointer max-w-sm"
        onClick={() => onClick && onClick(nota)}
    >
        <div className="flex flex-col">
            <div className="text-xl font-bold text-gray-900 leading-[1.2] mb-2 group-hover:text-gray-700 transition-colors duration-200">
                Nota Restaurante
            </div>
            <div className="h-48 w-full overflow-hidden">
                <img
                    src={nota.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                    alt={nota.titulo}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="text-xl font-bold text-gray-900 leading-[1.2] mb-2 group-hover:text-gray-700 transition-colors duration-200 mt-2">
                {nota.titulo}
            </div>
        </div>
    </div>
);

const CincoNotasRRR = ({ tipoNota, onCardClick }) => {
    const [notas, setNotas] = useState([]);

    useEffect(() => {
        if (!tipoNota) return;
        notasDestacadasPorTipoGet(tipoNota)
            .then(data => setNotas(data))
            .catch(() => setNotas([]));
    }, [tipoNota]);

    return (
        <div className="grid grid-cols-4 gap-5">
            {notas.slice(0, 4).map((nota) => (
                <TarjetaVerticalPost key={nota.id} nota={nota} onClick={onCardClick} />
            ))}
        </div>
    );
};

export default CincoNotasRRR;