import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../Context';
import { urlApi } from '../../../../api/url';
import { FaDownload, FaSave, FaSpinner, FaChartLine, FaFilePdf } from 'react-icons/fa';

const FormGoogleAnalytics = ({ onSave }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentData, setCurrentData] = useState(null);

    const [formData, setFormData] = useState({
        club_residente_trafico: '',
        residente_mx_trafico: '',
        mes: '',
        anio: new Date().getFullYear()
    });
    const [pdfFile, setPdfFile] = useState(null);
    const fileInputRef = useRef(null);

    // Meses en español
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    // Obtener mes anterior por defecto
    useEffect(() => {
        const now = new Date();
        let mesAnteriorIndex = now.getMonth() - 1;
        let anio = now.getFullYear();

        if (mesAnteriorIndex < 0) {
            mesAnteriorIndex = 11; // Diciembre
            anio = anio - 1;
        }

        setFormData(prev => ({
            ...prev,
            mes: meses[mesAnteriorIndex],
            anio: anio
        }));

        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${urlApi}api/google-analytics/ultimo`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.id) {
                    setCurrentData(data);
                    setFormData({
                        club_residente_trafico: data.club_residente_trafico || '',
                        residente_mx_trafico: data.residente_mx_trafico || '',
                        mes: data.mes || '',
                        anio: data.anio || new Date().getFullYear()
                    });
                }
            }
        } catch (err) {
            console.error('Error al cargar datos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-cerrar error después de 7 segundos
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 7000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Verificar si ya existe un registro con los mismos datos
            const checkResponse = await fetch(`${urlApi}api/google-analytics`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (checkResponse.ok) {
                const historial = await checkResponse.json();
                const duplicado = historial.find(item =>
                    item.mes === formData.mes &&
                    item.anio === parseInt(formData.anio) &&
                    item.club_residente_trafico === parseInt(formData.club_residente_trafico) &&
                    item.residente_mx_trafico === parseInt(formData.residente_mx_trafico)
                );

                if (duplicado) {
                    setError(`⚠️ Ya existe un registro para ${formData.mes} ${formData.anio} con esos mismos números`);
                    setSaving(false);
                    return;
                }
            }

            const formDataToSend = new FormData();
            formDataToSend.append('club_residente_trafico', formData.club_residente_trafico);
            formDataToSend.append('residente_mx_trafico', formData.residente_mx_trafico);
            formDataToSend.append('mes', formData.mes);
            formDataToSend.append('anio', formData.anio);

            if (pdfFile) {
                formDataToSend.append('pdf', pdfFile);
            }

            // Siempre crear nuevo registro (POST) para mantener historial
            const url = `${urlApi}api/google-analytics`;
            const method = 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar');
            }

            const result = await response.json();
            setSuccess('✅ Datos guardados correctamente');

            // Resetear formulario
            const now = new Date();
            let mesAnteriorIndex = now.getMonth() - 1;
            let anio = now.getFullYear();
            if (mesAnteriorIndex < 0) {
                mesAnteriorIndex = 11;
                anio = anio - 1;
            }
            setFormData({
                club_residente_trafico: '',
                residente_mx_trafico: '',
                mes: meses[mesAnteriorIndex],
                anio: anio
            });
            setPdfFile(null);
            setCurrentData(null);

            // Limpiar input de archivo
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Notificar al padre para actualizar historial
            if (onSave) {
                onSave();
            }

            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else if (file) {
            setError('Solo se permiten archivos PDF');
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <FaSpinner className="animate-spin text-indigo-500 text-2xl" />
            </div>
        );
    }

    return (
        <div className="bg-white h-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <FaChartLine />
                    Google Analytics
                </h3>
                {/* Info de actualización */}
                <p className="text-sm text-white font-roman">
                    Se debe actualizar manualmente cada día 1 del mes
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[350px] overflow-y-auto">
                {error && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 text-sm px-4 py-3 rounded shadow-lg flex items-center gap-3 max-w-md animate-pulse">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError('')}
                            className="text-red-700 hover:text-red-900 font-bold text-lg leading-none cursor-pointer"
                        >
                            ×
                        </button>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-600 text-sm p-2 rounded">
                        {success}
                    </div>
                )}

                {/* Mes y Año */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Mes</label>
                        <select
                            name="mes"
                            value={formData.mes}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {meses.map(m => (
                                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Año</label>
                        <input
                            type="number"
                            name="anio"
                            value={formData.anio}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            min="2020"
                            max="2030"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {/* Club Residente */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">
                            Tráfico Club Residente
                        </label>
                        <input
                            type="number"
                            name="club_residente_trafico"
                            value={formData.club_residente_trafico}
                            onChange={handleInputChange}
                            placeholder="Ej: 15000"
                            className="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Residente.mx */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">
                            Tráfico Residente.mx (Event Count)
                        </label>
                        <input
                            type="number"
                            name="residente_mx_trafico"
                            value={formData.residente_mx_trafico}
                            onChange={handleInputChange}
                            placeholder="Ej: 50000"
                            className="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>


                {/* PDF Upload */}
                <div>
                    <label className="block text-xs text-gray-600 mb-1">
                        PDF de Analytics
                    </label>
                    <input
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {pdfFile && (
                        <p className="text-xs text-green-600 mt-1">
                            📄 {pdfFile.name}
                        </p>
                    )}
                </div>

                {/* Botón Guardar */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                    {saving ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <FaSave />
                            Guardar
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default FormGoogleAnalytics;
