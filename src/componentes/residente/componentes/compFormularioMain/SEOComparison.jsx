import React, { useState } from 'react';
import { FaRobot, FaUser, FaCheck } from 'react-icons/fa';

const SEOComparison = ({ original, optimizado, onSelect, onClose, tipo = 'nota' }) => {
    // Estado para campos seleccionados (true = usar versión IA)
    const [camposSeleccionados, setCamposSeleccionados] = useState({
        titulo: false,
        subtitulo: false,
        descripcion: false,
        seo_title: false,
        seo_keyword: false,
        meta_description: false,
        seo_alt_text: false
    });

    const toggleCampo = (campo) => {
        setCamposSeleccionados(prev => ({
            ...prev,
            [campo]: !prev[campo]
        }));
    };

    const seleccionarTodos = () => {
        const todosTrue = {};
        Object.keys(camposSeleccionados).forEach(key => {
            todosTrue[key] = true;
        });
        setCamposSeleccionados(todosTrue);
    };

    const deseleccionarTodos = () => {
        const todosFalse = {};
        Object.keys(camposSeleccionados).forEach(key => {
            todosFalse[key] = false;
        });
        setCamposSeleccionados(todosFalse);
    };

    const aplicarSeleccion = () => {
        // Construir objeto con campos seleccionados
        const camposAAplicar = {};
        Object.keys(camposSeleccionados).forEach(campo => {
            if (camposSeleccionados[campo]) {
                camposAAplicar[campo] = optimizado[campo];
            }
        });
        onSelect(camposAAplicar);
    };

    const CheckboxField = ({ campo, label, children }) => (
        <div className="relative">
            <div className="absolute -left-2 top-3 z-10">
                <input
                    type="checkbox"
                    checked={camposSeleccionados[campo]}
                    onChange={() => toggleCampo(campo)}
                    className="w-5 h-5 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                />
            </div>
            <div className={`transition-all ${camposSeleccionados[campo] ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-6">
                    {label}
                </label>
                <div className="ml-6">
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Comparación: Original vs IA Optimizada</h2>
                            <p className="text-sm mt-1 text-blue-100">
                                ✅ Selecciona los campos que quieres aplicar
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 text-3xl leading-none"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Botones de selección rápida */}
                <div className="px-6 py-3 bg-gray-50 border-b flex gap-3 items-center">
                    <span className="text-sm font-semibold text-gray-700">Selección rápida:</span>
                    <button
                        onClick={seleccionarTodos}
                        className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                    >
                        Seleccionar todos
                    </button>
                    <button
                        onClick={deseleccionarTodos}
                        className="text-sm px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                        Deseleccionar todos
                    </button>
                    <div className="ml-auto text-sm text-gray-600">
                        {Object.values(camposSeleccionados).filter(Boolean).length} campo(s) seleccionado(s)
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-2 gap-6 p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {/* Versión Original */}
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-300">
                            <FaUser className="text-gray-600" />
                            <h3 className="text-lg font-bold text-gray-800">Versión Original</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                                <p className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-300">
                                    {original.titulo || <em className="text-gray-400">Sin título</em>}
                                </p>
                            </div>

                            {tipo === 'nota' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Subtítulo</label>
                                    <p className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-300">
                                        {original.subtitulo || <em className="text-gray-400">Sin subtítulo</em>}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <p className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-300 max-h-32 overflow-y-auto">
                                    {original.descripcion || <em className="text-gray-400">Sin descripción</em>}
                                </p>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Campos SEO</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">SEO Title</label>
                                        <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-300">
                                            {original.seo_title || <em className="text-gray-400">Sin SEO title</em>}
                                        </p>
                                        <span className="text-xs text-gray-500">{(original.seo_title || '').length} caracteres</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Keywords</label>
                                        <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-300">
                                            {original.seo_keyword || <em className="text-gray-400">Sin keywords</em>}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Meta Description</label>
                                        <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-300">
                                            {original.meta_description || <em className="text-gray-400">Sin meta description</em>}
                                        </p>
                                        <span className="text-xs text-gray-500">{(original.meta_description || '').length} caracteres</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Alt Text</label>
                                        <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-300">
                                            {original.seo_alt_text || <em className="text-gray-400">Sin alt text</em>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Versión Optimizada con IA - Con checkboxes */}
                    <div className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-300">
                            <FaRobot className="text-purple-600 text-xl" />
                            <h3 className="text-lg font-bold text-purple-800">Optimizado con IA</h3>
                        </div>

                        <div className="space-y-4">
                            <CheckboxField campo="titulo" label="Título">
                                <p className="text-sm text-gray-900 bg-white p-3 rounded border-2 border-purple-300 font-medium">
                                    {optimizado.titulo}
                                </p>
                            </CheckboxField>

                            {tipo === 'nota' && (
                                <CheckboxField campo="subtitulo" label="Subtítulo">
                                    <p className="text-sm text-gray-900 bg-white p-3 rounded border-2 border-purple-300 font-medium">
                                        {optimizado.subtitulo}
                                    </p>
                                </CheckboxField>
                            )}

                            <CheckboxField campo="descripcion" label="Descripción">
                                <p className="text-sm text-gray-900 bg-white p-3 rounded border-2 border-purple-300 font-medium max-h-32 overflow-y-auto">
                                    {optimizado.descripcion}
                                </p>
                            </CheckboxField>

                            <div className="border-t border-purple-300 pt-4 mt-4">
                                <h4 className="text-sm font-bold text-purple-800 mb-3">Campos SEO Optimizados</h4>
                                <div className="space-y-3">
                                    <CheckboxField campo="seo_title" label="SEO Title">
                                        <p className="text-xs text-gray-900 bg-white p-2 rounded border-2 border-purple-300">
                                            {optimizado.seo_title}
                                        </p>
                                        <span className="text-xs text-purple-600 font-semibold">
                                            {optimizado.seo_title.length} caracteres
                                        </span>
                                    </CheckboxField>

                                    <CheckboxField campo="seo_keyword" label="Keywords">
                                        <p className="text-xs text-gray-900 bg-white p-2 rounded border-2 border-purple-300">
                                            {optimizado.seo_keyword}
                                        </p>
                                    </CheckboxField>

                                    <CheckboxField campo="meta_description" label="Meta Description">
                                        <p className="text-xs text-gray-900 bg-white p-2 rounded border-2 border-purple-300">
                                            {optimizado.meta_description}
                                        </p>
                                        <span className="text-xs text-purple-600 font-semibold">
                                            {optimizado.meta_description.length} caracteres
                                        </span>
                                    </CheckboxField>

                                    <CheckboxField campo="seo_alt_text" label="Alt Text">
                                        <p className="text-xs text-gray-900 bg-white p-2 rounded border-2 border-purple-300">
                                            {optimizado.seo_alt_text}
                                        </p>
                                    </CheckboxField>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer con botón de aplicar */}
                <div className="px-6 py-4 bg-gray-50 border-t rounded-b-xl flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={aplicarSeleccion}
                        disabled={Object.values(camposSeleccionados).every(v => !v)}
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <FaCheck />
                        Aplicar Campos Seleccionados ({Object.values(camposSeleccionados).filter(Boolean).length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SEOComparison;
