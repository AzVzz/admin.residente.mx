import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { urlApi } from '../../api/url';
import { useAuth } from '../../Context';

const BuscadorDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        query: '',
        is_recommended: false,
        recommendation_order: 0,
        is_manual: true,
        manual_count_boost: 0,
        is_hidden: false
    });

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [statsRes, configRes] = await Promise.all([
                axios.get(`${urlApi}api/buscar/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${urlApi}api/buscar/admin/config`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStats(statsRes.data);
            setConfigs(configRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${urlApi}api/buscar/admin/config`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setEditItem(null);
            setFormData({ query: '', is_recommended: false, recommendation_order: 0, is_manual: true, manual_count_boost: 0, is_hidden: false });
            fetchData();
        } catch (error) {
            alert('Error al guardar: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta configuración?')) return;
        try {
            await axios.delete(`${urlApi}api/buscar/admin/config/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando dashboard...</div>;

    return (
        <div className="p-6 bg-[#DDDDDE] min-h-screen">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Buscador Inteligente</h1>
                    <p className="text-gray-600">Analítica y gestión de recomendaciones</p>
                </div>
                <button
                    onClick={() => { setEditItem(null); setShowModal(true); }}
                    className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"
                >
                    <span>+</span> Nueva Recomendación
                </button>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-300 pb-2">
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`pb-2 px-4 font-bold uppercase text-sm tracking-widest transition-all ${activeTab === 'stats' ? 'border-b-4 border-black text-black' : 'text-gray-400'}`}
                >
                    Estadísticas
                </button>
                <button
                    onClick={() => setActiveTab('config')}
                    className={`pb-2 px-4 font-bold uppercase text-sm tracking-widest transition-all ${activeTab === 'config' ? 'border-b-4 border-black text-black' : 'text-gray-400'}`}
                >
                    Configuración
                </button>
                <button
                    onClick={() => setActiveTab('no-results')}
                    className={`pb-2 px-4 font-bold uppercase text-sm tracking-widest transition-all ${activeTab === 'no-results' ? 'border-b-4 border-black text-black' : 'text-gray-400'}`}
                >
                    Sin Resultados
                </button>
            </div>

            <div
                key={activeTab}
            >
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Top Queries Table */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-2xl">🔥</span> Top Búsquedas
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                                            <th className="pb-4 font-medium">Término</th>
                                            <th className="pb-4 font-medium text-center">Frecuencia</th>
                                            <th className="pb-4 font-medium text-center">Boost</th>
                                            <th className="pb-4 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {stats?.topQueries?.map((q, idx) => (
                                            <tr key={q.id} className="group hover:bg-gray-50 transition-colors">
                                                <td className="py-4 font-semibold text-gray-800">
                                                    {idx + 1}. {q.query}
                                                    {q.is_recommended && <span className="ml-2 bg-yellow-400 text-[10px] px-2 py-0.5 rounded-full">REC</span>}
                                                </td>
                                                <td className="py-4 text-center text-gray-600">{q.search_count}</td>
                                                <td className="py-4 text-center text-gray-400 italic">+{q.manual_count_boost}</td>
                                                <td className="py-4 text-right font-black">{q.search_count + q.manual_count_boost}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Engagement Stats */}
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="text-2xl">🖱️</span> Clicks por Entidad
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {stats?.clickStats?.map(stat => (
                                        <div key={stat.clicked_result_type} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-xs uppercase text-gray-400 font-bold mb-1">{stat.clicked_result_type}</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-black">{stat.click_count}</span>
                                                <span className="text-xs text-gray-500">clicks</span>
                                            </div>
                                            <p className="mt-2 text-[10px] text-gray-400">Prom: {Math.round(stat.avg_time_to_click)}s para click</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 italic">
                                    <span className="text-2xl text-yellow-400">💡</span> Tip Residente
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Si notas muchas búsquedas de un término que <span className="text-white font-bold">no arroja resultados</span>,
                                    considera crear una nota o receta sobre ello para capturar ese tráfico.
                                    O usa el boost para posicionar tus recomendaciones preferidas.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-2xl">⚙️</span> Gestionar Configuraciones
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {configs.map(item => (
                                <div key={item.id} className="p-5 border border-gray-200 rounded-2xl hover:border-black transition-all relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-black uppercase italic tracking-tighter">{item.query}</h4>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditItem(item);
                                                    setFormData({
                                                        query: item.query,
                                                        is_recommended: item.is_recommended,
                                                        recommendation_order: item.recommendation_order,
                                                        is_manual: item.is_manual,
                                                        manual_count_boost: item.manual_count_boost,
                                                        is_hidden: item.is_hidden
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="text-gray-400 hover:text-black"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase">
                                            <span className="text-gray-400">Recomendado:</span>
                                            <span className={item.is_recommended ? 'text-green-600' : 'text-gray-300'}>
                                                {item.is_recommended ? 'SÍ (Orden ' + item.recommendation_order + ')' : 'NO'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold uppercase">
                                            <span className="text-gray-400">Boost Popularidad:</span>
                                            <span className="text-black">+{item.manual_count_boost}</span>
                                        </div>
                                        {item.is_hidden && (
                                            <div className="flex justify-between text-xs font-bold uppercase p-2 bg-red-50 rounded-lg border border-red-100 mt-2">
                                                <span className="text-red-500">🚫 Oculto en resultados</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'no-results' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-600">
                            <span className="text-2xl">⚠️</span> Términos fallidos
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest">
                                        <th className="pb-4 font-medium">Término</th>
                                        <th className="pb-4 font-medium text-center">Búsquedas fallidas</th>
                                        <th className="pb-4 font-medium text-right">Última vez</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.noResultsQueries?.map(q => (
                                        <tr key={q.id}>
                                            <td className="py-4 font-semibold text-gray-800 uppercase italic tracking-tighter">{q.query}</td>
                                            <td className="py-4 text-center ">
                                                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                                                    {q.search_count} veces
                                                </span>
                                            </td>
                                            <td className="py-4 text-right text-sm text-gray-400">
                                                {new Date(q.last_searched_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <div
                        className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl"
                    >
                        <h2 className="text-2xl font-black uppercase italic tracking-tight mb-6">
                            {editItem ? 'Editar Configuración' : 'Nueva Recomendación'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Término de búsqueda</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
                                    value={formData.query}
                                    disabled={!!editItem}
                                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-sm font-bold uppercase tracking-wide">Marcar Recomendado</span>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-black"
                                    checked={formData.is_recommended}
                                    onChange={(e) => setFormData({ ...formData, is_recommended: e.target.checked })}
                                />
                            </div>
                            {formData.is_recommended && (
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Orden de recomendación (0-99)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
                                        value={formData.recommendation_order}
                                        onChange={(e) => setFormData({ ...formData, recommendation_order: parseInt(e.target.value) })}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Boost de Popularidad (Aumentar frecuencia artificialmente)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
                                    value={formData.manual_count_boost}
                                    onChange={(e) => setFormData({ ...formData, manual_count_boost: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                <span className="text-sm font-bold uppercase tracking-wide text-red-600">Ocultar de resultados</span>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-red-600"
                                    checked={formData.is_hidden}
                                    onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all uppercase"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-black text-white hover:bg-zinc-800 transition-all uppercase"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuscadorDashboard;
