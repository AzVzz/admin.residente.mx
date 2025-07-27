import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { notasPorTipoNota } from "../../../componentes/api/notasPublicadasGet";

import OpcionesExtra from '../../../componentes/residente/componentes/componentesColumna3/OpcionesExtra';
import Carrusel from './componentes/Carrusel';
import TarjetaHorizontalPost from '../../../componentes/residente/componentes/componentesColumna2/TarjetaHorizontalPost.jsx'
import BarrioAntiguoGifs from "./componentes/BarrioAntiguoGifs.jsx";
import DirectorioVertical from "../componentes/componentesColumna2/DirectorioVertical.jsx";
import SeccionesPrincipales from "../componentes/SeccionesPrincipales.jsx";

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

    // Separa la primera nota y el resto
    const [primeraNota, ...restoNotas] = notas;

    return (
        <div className="my-0">
            <h1 className="text-3xl font-bold">Página de {nombreCliente}</h1>
            <div
                className="grid gap-5 mb-5"
                style={{ gridTemplateColumns: '0.9fr 2fr 1.1fr' }}
            >
                <div>
                    <BarrioAntiguoGifs />
                </div>
                <div className="flex flex-col gap-5">
                    {/* Pasa la primera nota al Carrusel */}
                    <Carrusel nota={primeraNota} />
                    {/* El resto de las notas */}
                    {restoNotas.map(nota => (
                        <TarjetaHorizontalPost key={nota.id} post={nota} />
                    ))}
                </div>
                <div className="flex flex-col gap-5">
                    <DirectorioVertical />
                    <OpcionesExtra />
                </div>
            </div>
            <SeccionesPrincipales />
        </div>
    );
};

export default PaginaCliente;