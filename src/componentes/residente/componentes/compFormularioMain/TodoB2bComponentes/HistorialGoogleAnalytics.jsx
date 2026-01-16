import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '../../../../Context';
import { urlApi } from '../../../../api/url';
import { FaFilePdf, FaChartLine, FaCalendarAlt, FaTrash } from 'react-icons/fa';

const HistorialGoogleAnalytics = forwardRef((props, ref) => {
    const { token } = useAuth();
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistorial = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${urlApi}api/google-analytics`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setHistorial(data);
            } else {
                setError('Error al cargar el historial');
            }
        } catch (err) {
            setError('Error de conexión');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchHistorial();
        }
    }, [token]);

    // Exponer función refrescar al padre
    useImperativeHandle(ref, () => ({
        refrescar: fetchHistorial
    }));

    // Función para eliminar un registro
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;

        try {
            const response = await fetch(`${urlApi}api/google-analytics/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchHistorial(); // Refrescar la lista
            } else {
                alert('Error al eliminar el registro');
            }
        } catch (err) {
            console.error('Error al eliminar:', err);
            alert('Error de conexión');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-sm p-4">{error}</div>
        );
    }

    return (
        <div className="h-full">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <FaChartLine /> Historial Google Analytics
                </h3>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                {historial.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                        No hay registros de analytics aún
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">Mes/Año</th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">Club</th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">Res.mx</th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subido</th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {historial.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-sm">
                                            <FaCalendarAlt className="text-gray-400" />
                                            <span className="capitalize">{item.mes}</span> {item.anio}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.club_residente_trafico?.toLocaleString('es-MX') || '-'}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.residente_mx_trafico?.toLocaleString('es-MX') || '-'}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                                        {item.created_at ? new Date(item.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {item.pdf_url ? (
                                                <a
                                                    href={item.pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Ver PDF"
                                                >
                                                    <FaFilePdf size={18} />
                                                </a>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                            title="Eliminar registro"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
});

export default HistorialGoogleAnalytics;
