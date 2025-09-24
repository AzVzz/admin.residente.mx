import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getColaboradores, getRespuestasPorColaborador } from "../../api/temaSemanaApi";
import DirectorioVertical from "../componentes/componentesColumna2/DirectorioVertical";
import PortadaRevista from "../componentes/componentesColumna2/PortadaRevista";
import BotonesAnunciateSuscribirme from "../componentes/componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "../componentes/componentesColumna1/Infografia";

const DetalleColaborador = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [colaborador, setColaborador] = useState(null);
    const [colaboradores, setColaboradores] = useState([]);
    const [publicaciones, setPublicaciones] = useState([]);

    useEffect(() => {
        getColaboradores()
            .then(data => {
                setColaboradores(data);
                const encontrado = data.find(c => String(c.id) === String(id));
                setColaborador(encontrado || null);
            })
            .catch(() => {
                setColaboradores([]);
                setColaborador(null);
            });

        // Cargar publicaciones del colaborador
        getRespuestasPorColaborador(id)
            .then(setPublicaciones)
            .catch(() => setPublicaciones([]));
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Función para formatear la fecha
    const formatFecha = fecha => {
        if (!fecha) return "";
        const d = new Date(fecha);
        // Formato: YYYY-MM-DD
        return d.toISOString().slice(0, 10);
    };

    if (!colaborador) {
        return <div className="text-gray-500 p-4">Colaborador no encontrado.</div>;
    }

    return (
        <div className="pt-8">
            <div className="max-w-[1080px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-10 gap-y-8">
                    {/* Columna principal */}
                    <div>
                        {/* Encabezado tipo blog */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                            {/* Foto circular */}
                            <div className="w-[220px] h-[220px] rounded-full overflow-hidden border-4 border-[#fff300] flex-shrink-0 shadow-lg bg-white">
                                <img
                                    src={colaborador.fotografia}
                                    alt={colaborador.nombre}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Nombre y curriculum */}
                            <div className="flex flex-col justify-center md:justify-start">
                                <h1 className="text-black text-[32px] font-black mb-2 text-left">
                                    {colaborador.nombre}
                                </h1>
                                <div className="text-xl font-roman leading-relaxed text-left"
                                    style={{ lineHeight: '1.3', marginBottom: '1.5rem' }}>
                                    {colaborador.curriculum || colaborador.descripcion || "Sin información de curriculum."}
                                </div>
                            </div>
                        </div>
                        {/* Colaboraciones */}
                        <div className="mt-10">
                            <h2 className="font-bold mb-6 text-center text-[25px]">Colaboraciones</h2>
                            <div className="flex flex-col gap-8 items-center">
                                {publicaciones.filter(pub => pub.respuesta_consejo == 0).length === 0 ? (
                                    <div className="text-gray-500 text-lg text-center py-10">
                                        Este colaborador aún no tiene colaboraciones registradas.
                                    </div>
                                ) : (
                                    publicaciones
                                        .filter(pub => pub.respuesta_consejo == 0)
                                        .map(pub => (
                                            <div key={pub.id} className="w-full max-w-[610px] flex flex-col items-center border-b pb-8">
                                                {/* Imagen de la publicación */}
                                                {pub.imagen && (
                                                    <div className="w-[610px] h-[450px] overflow-hidden mb-2">
                                                        <img
                                                            src={pub.imagen}
                                                            alt={pub.titulo}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                {/* Fecha y título */}
                                                <div className="flex justify-center items-center pt-2">
                                                    <div className="text-black text-[14px] font-black px-6 py-0.5 font-roman uppercase w-fit flex">
                                                        {formatFecha(pub.created_at)}
                                                    </div>
                                                </div>
                                                {pub.titulo && (
                                                    <h2 className="text-black text-[30px] leading-[1.05] font-black flex-1 overflow-hidden text-center p-2 my-0 tracking-tight"
                                                        style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                                                        {pub.titulo}
                                                    </h2>
                                                )}
                                                {/* Por nombre */}
                                                <h3 className="text-black text-[22px] font-bold text-center mb-2">{`Por ${pub.nombre}`}</h3>
                                                <div
                                                    className="text-xl font-roman leading-relajado px-10 py-6"
                                                    style={{
                                                        lineHeight: '1.3',
                                                        marginBottom: '1.5rem'
                                                    }}
                                                >
                                                    {pub.respuesta_colaboracion}
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                        {/* Botón para volver */}
                        <button className="cursor-pointer text-blue-600 mt-10" onClick={() => navigate(-1)}>
                            ← Volver al listado
                        </button>
                    </div>
                    {/* Columna lateral */}
                    <div className="flex flex-col items-end justify-start gap-10 sticky top-8">
                        <DirectorioVertical />
                        <PortadaRevista />
                        <div className="pt-3">
                            <BotonesAnunciateSuscribirme />
                        </div>
                        <Infografia />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleColaborador;