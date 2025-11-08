import React, { useEffect, useState } from "react";
import { cuponesGetTodas, cuponBorrar } from "../../../api/cuponesGet";
import { FaTrash } from "react-icons/fa";

const ListaTickets = ({ token }) => {
    const [cupones, setCupones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eliminando, setEliminando] = useState(null);

    useEffect(() => {
        setLoading(true);
        cuponesGetTodas(token)
            .then(setCupones)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este cupón?")) return;
        setEliminando(id);
        try {
            await cuponBorrar(id, token);
            setCupones(cupones.filter(c => c.id !== id));
        } catch (err) {
            alert("Error al borrar el cupón");
        } finally {
            setEliminando(null);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Cupones</h2>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            <div className="bg-white border rounded-lg shadow-md">
                {loading ? (
                    <div className="p-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                        <p className="mt-2 text-gray-600">Cargando cupones...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Restaurante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Título
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subtítulo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha de validez
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cupones.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            No hay cupones activos
                                        </td>
                                    </tr>
                                ) : (
                                    cupones.map((cupon) => (
                                        <tr key={cupon.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-semibold">{cupon.nombre_restaurante}</td>
                                            <td className="px-6 py-4">{cupon.titulo}</td>
                                            <td className="px-6 py-4">{cupon.subtitulo}</td>
                                            <td className="px-6 py-4">{cupon.fecha_validez || "Sin fecha"}</td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <button
                                                    onClick={() => handleEliminar(cupon.id)}
                                                    disabled={eliminando === cupon.id}
                                                    className="text-red-600 hover:text-red-900 flex items-center space-x-1 disabled:opacity-50 cursor-pointer"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash />
                                                    <span>
                                                        {eliminando === cupon.id ? "Eliminando..." : "Eliminar"}
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListaTickets;