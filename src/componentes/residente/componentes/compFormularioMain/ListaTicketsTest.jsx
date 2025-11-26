import React, { useEffect, useState } from "react";
import { cuponesGetTodasTest, cuponBorrarTest, cuponEditarTest } from "../../../api/cuponesGetTest";
import { FaTrash } from "react-icons/fa";
import TicketPromo from "../../../promociones/componentes/TicketPromo";
import { useAuth } from "../../../Context";

const ListaTicketsTest = () => {
    const { usuario, token } = useAuth();
    const [cupones, setCupones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eliminando, setEliminando] = useState(null);
    const [toggling, setToggling] = useState(null);

    // Verificar permisos al inicio
    if (!usuario || (usuario.rol !== 'residente' && usuario.rol !== 'b2b' && usuario.permisos !== 'residente' && usuario.permisos !== 'b2b' && usuario.permisos !== 'todos')) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-center p-8 bg-gray-100 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
                    <p className="text-gray-600">
                        No tienes permisos para ver el dashboard de cupones.
                    </p>
                </div>
            </div>
        );
    }

    useEffect(() => {
        setLoading(true);
        cuponesGetTodasTest(token)
            .then(setCupones)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este cupón?")) return;
        setEliminando(id);
        try {
            await cuponBorrarTest(id, token);
            setCupones(cupones.filter((c) => c.id !== id));
        } catch (err) {
            alert("Error al borrar el cupón");
        } finally {
            setEliminando(null);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        setToggling(id);
        try {
            const nuevoStatus = !currentStatus;
            await cuponEditarTest(id, { activo_manual: nuevoStatus }, token);

            // Actualizar estado local
            setCupones(cupones.map(c =>
                c.id === id ? { ...c, activo_manual: nuevoStatus } : c
            ));
        } catch (err) {
            alert("Error al cambiar el estado: " + err.message);
        } finally {
            setToggling(null);
        }
    };

    const getEstado = (inicio, fin, activoManual) => {
        if (!activoManual) return { label: "Inactivo", color: "text-gray-600 bg-gray-200" };
        if (!inicio && !fin) return { label: "Permanente", color: "text-blue-600 bg-blue-100" };

        const now = new Date();
        const startDate = new Date(inicio);
        const endDate = new Date(fin);

        if (now < startDate) return { label: "Programado", color: "text-yellow-600 bg-yellow-100" };
        if (now > endDate) return { label: "Vencido", color: "text-red-600 bg-red-100" };
        return { label: "Activo", color: "text-green-600 bg-green-100" };
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Mis Cupones (Dashboard)
            </h2>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    <p className="mt-2 text-gray-600">Cargando cupones...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cupones.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            No tienes cupones registrados.
                        </div>
                    ) : (
                        cupones.map((cupon) => {
                            const estado = getEstado(cupon.fecha_inicio, cupon.fecha_fin, cupon.activo_manual);

                            return (
                                <div key={cupon.id} className="flex flex-col items-center bg-gray-50 p-4 rounded-xl shadow-md relative">

                                    {/* Badge de Estado */}
                                    <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${estado.color}`}>
                                        {estado.label}
                                    </div>

                                    {/* Visualización del Ticket (Small) */}
                                    <div className="scale-90 origin-top">
                                        <TicketPromo
                                            size="small"
                                            nombreRestaurante={cupon.nombre_restaurante}
                                            nombrePromo={cupon.titulo}
                                            subPromo={cupon.subtitulo || cupon.descripcion}
                                            descripcionPromo={cupon.descripcion}
                                            validezPromo={cupon.fecha_validez}
                                            stickerUrl={cupon.imagen_url}
                                        />
                                    </div>

                                    {/* Info de Fechas */}
                                    <div className="mt-[-20px] mb-4 text-center text-sm text-gray-600 bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full">
                                        {cupon.fecha_inicio && cupon.fecha_fin ? (
                                            <>
                                                <p><span className="font-semibold">Inicio:</span> {new Date(cupon.fecha_inicio).toLocaleDateString()}</p>
                                                <p><span className="font-semibold">Fin:</span> {new Date(cupon.fecha_fin).toLocaleDateString()}</p>
                                            </>
                                        ) : (
                                            <p className="font-bold text-blue-600">Cupón Permanente</p>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <button
                                        onClick={() => handleEliminar(cupon.id)}
                                        disabled={eliminando === cupon.id}
                                        className="mt-auto w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
                                    >
                                        <FaTrash />
                                        {eliminando === cupon.id ? "Eliminando..." : "Eliminar Cupón"}
                                    </button>

                                    {/* Toggle Activar/Desactivar */}
                                    <button
                                        onClick={() => handleToggleStatus(cupon.id, cupon.activo_manual)}
                                        disabled={toggling === cupon.id}
                                        className={`mt-2 w-full py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-sm ${cupon.activo_manual
                                            ? "bg-white border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                                            : "bg-green-500 border-green-500 text-white hover:bg-green-600"
                                            }`}
                                    >
                                        {toggling === cupon.id ? "Procesando..." : (cupon.activo_manual ? "Desactivar" : "Activar")}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default ListaTicketsTest;
