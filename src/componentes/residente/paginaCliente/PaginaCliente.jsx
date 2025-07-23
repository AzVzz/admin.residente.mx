import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { notasPorTipoNota } from "../../../componentes/api/notasPublicadasGet";

import OpcionesExtra from '../../../componentes/residente/componentes/componentesColumna3/OpcionesExtra';
import Carrusel from './componentes/Carrusel';
import TarjetaHorizontalPost from '../../../componentes/residente/componentes/componentesColumna2/TarjetaHorizontalPost.jsx'
import BarrioAntiguoGifs from "./componentes/BarrioAntiguoGifs.jsx";

const CLIENTES_VALIDOS = ["mama-de-rocco", "barrio-antiguo", "otrocliente"];

const PaginaCliente = () => {
    const { nombreCliente } = useParams();
    const [notas, setNotas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        setCargando(true);
        notasPorTipoNota(nombreCliente)
            .then(setNotas)
            .finally(() => setCargando(false));
    }, [nombreCliente]);

    if (cargando) return <div>Cargando...</div>;
    if (!CLIENTES_VALIDOS.includes(nombreCliente)) {
        return <Navigate to="*" replace />;
    }

    return (
        <div className="mb-20">
            <h1 className="text-3xl font-bold">Página de {nombreCliente}</h1>
            <div className="grid grid-cols-12 gap-5">
                <div className="col-span-3">
                    <BarrioAntiguoGifs />
                </div>
                <div className="flex flex-col col-span-6 gap-5">
                    <Carrusel />
                    {/* Muestra cada nota con el diseño de TarjetaHorizontalPost */}
                    {notas.map(nota => (
                        <TarjetaHorizontalPost key={nota.id} post={nota} />
                    ))}
                </div>
                <div className="col-span-3">
                    <OpcionesExtra />
                </div>
            </div>
        </div>
    );
};

export default PaginaCliente;