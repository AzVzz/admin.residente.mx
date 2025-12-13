import { useFormContext } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { urlApi, imgApi } from '../../api/url'

const FotosLugar = ({ existingFotos, restaurantId }) => {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const [previews, setPreviews] = useState([]);
    const [limitReached, setLimitReached] = useState(false);
    const fotos = watch('fotos_lugar') || [];
    const fileInputRef = useRef(null);
    const [fotosEliminadas, setFotosEliminadas] = useState([]);
    const existingFotosRef = useRef(null);

    useEffect(() => {
        register('fotos_lugar');
        register('fotos_eliminadas');
    }, [register]);

    // Efecto unificado para sincronizar existingFotos con previews
    useEffect(() => {
        // Si existingFotos es undefined o null, no hacer nada
        if (existingFotos === undefined || existingFotos === null) {
            existingFotosRef.current = null;
            return;
        }
        
        // Verificar que sea un array
        if (!Array.isArray(existingFotos)) {
            return;
        }
        
        // Si es un array vacío, limpiar previews existentes
        if (existingFotos.length === 0) {
            setPreviews(prevPreviews => {
                const nuevasPreviews = prevPreviews.filter(p => !p.isExisting);
                if (nuevasPreviews.length !== prevPreviews.length) {
                    setValue('fotos_lugar', nuevasPreviews, { shouldValidate: false });
                    setLimitReached(nuevasPreviews.length >= 5);
                }
                return nuevasPreviews;
            });
            existingFotosRef.current = [];
            return;
        }
        
        // Si hay fotos existentes, procesarlas (máximo 5)
        if (existingFotos.length > 0) {
            // Limitar a solo las primeras 5 fotos
            const fotosToProcess = existingFotos.slice(0, 5);
            
            const formattedFotos = fotosToProcess.map((foto, idx) => {
                // Intentar diferentes nombres de propiedades posibles (incluyendo 'src' que es lo que usa el backend)
                const urlImagen = foto.url_imagen || foto.url || foto.src || foto.imagen || foto.foto || foto.path || foto.ruta || foto.url_imagen_completa || foto.imagen_url;
                
                if (!urlImagen) {
                    // Intentar buscar cualquier propiedad que contenga 'url', 'imagen', 'src', etc.
                    const possibleUrlKey = Object.keys(foto).find(key => 
                        key.toLowerCase().includes('url') || 
                        key.toLowerCase().includes('imagen') || 
                        key.toLowerCase().includes('image') ||
                        key.toLowerCase() === 'src' ||
                        key.toLowerCase().includes('path') ||
                        key.toLowerCase().includes('ruta')
                    );
                    if (possibleUrlKey) {
                        const alternativeUrl = foto[possibleUrlKey];
                        if (alternativeUrl) {
                            // Usar la propiedad alternativa encontrada
                            let url = String(alternativeUrl).trim();
                            
                            // Si la URL es completa (empieza con http), extraer solo la ruta relativa
                            if (url.startsWith('http')) {
                                try {
                                    const urlObj = new URL(url);
                                    url = urlObj.pathname;
                                } catch (e) {
                                    // Error al parsear URL, continuar con la URL original
                                }
                            }
                            
                            // Asegurar que la URL relativa empiece con /
                            if (!url.startsWith('/')) {
                                url = '/' + url;
                            }
                            
                            // Construir la URL final usando imgApi
                            const urlFinal = `${imgApi}${url}`;
                            
                            return {
                                id: foto.id,
                                url: urlFinal,
                                isExisting: true
                            };
                        }
                    }
                    return null;
                }
                
                let url = urlImagen.trim();
                
                // Si la URL es completa (empieza con http), extraer solo la ruta relativa
                if (url.startsWith('http')) {
                    try {
                        const urlObj = new URL(url);
                        // Extraer la ruta relativa (ej: /fotos/lugar/...)
                        url = urlObj.pathname;
                    } catch (e) {
                        // Error al parsear URL, continuar con la URL original
                    }
                }
                
                // Asegurar que la URL relativa empiece con /
                if (!url.startsWith('/')) {
                    url = '/' + url;
                }
                
                // Construir la URL final usando imgApi
                const urlFinal = `${imgApi}${url}`;
                
                return {
                    id: foto.id,
                    url: urlFinal,
                    isExisting: true
                };
            }).filter(Boolean); // Filtrar nulos
            
            if (formattedFotos.length === 0) {
                return;
            }
            
            // Obtener IDs de las fotos formateadas
            const formattedIds = formattedFotos.map(f => f.id).sort().join(',');
            
            // Obtener las fotos nuevas actuales (no existentes) desde previews
            setPreviews(prevPreviews => {
                // Verificar si ya tenemos estas fotos cargadas
                const existingPreviewIds = prevPreviews
                    .filter(p => p.isExisting && p.id)
                    .map(p => p.id)
                    .sort()
                    .join(',');
                
                if (existingPreviewIds === formattedIds && formattedIds !== '') {
                    return prevPreviews;
                }
                
                const nuevasFotos = prevPreviews.filter(p => !p.isExisting);
                const todasLasFotos = [...formattedFotos, ...nuevasFotos];
                
                // Actualizar el valor del formulario
                const fotosParaFormulario = [
                    ...formattedFotos.map(foto => ({
                        id: foto.id,
                        isExisting: true
                    })),
                    ...nuevasFotos
                ];
                setValue('fotos_lugar', fotosParaFormulario, { shouldValidate: false });
                
                // Actualizar límite si hay 5 fotos
                setLimitReached(todasLasFotos.length >= 5);
                
                return todasLasFotos;
            });
            
            // Actualizar el ref DESPUÉS de procesar
            existingFotosRef.current = existingFotos;
        }
    }, [existingFotos, setValue]);


    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (previews.length >= 5) return;

        if (files.length) {
            const availableSlots = 5 - previews.length;

            const newFiles = files.slice(0, availableSlots).map(file => ({
                file, // Conservar objeto File
                preview: URL.createObjectURL(file),
                isExisting: false // Marcar como nueva
            }));

            // Combinar URLs existentes con nuevos Files
            const combinedPreviews = [...previews, ...newFiles];
            setPreviews(combinedPreviews);
            setValue('fotos_lugar', combinedPreviews, { shouldValidate: true });

            if (combinedPreviews.length >= 5) {
                setLimitReached(true);
            }
        }
        
        // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
        e.target.value = '';
    };


    const removeFoto = (indexToRemove) => {
        const foto = previews[indexToRemove];

        // Verificar si es una imagen existente (del servidor)
        const isExistingFoto = foto.url && !foto.url.startsWith('blob:');

        // Si es una foto existente, agregarla a la lista de fotos eliminadas
        // Las eliminaciones se procesarán cuando se envíe el formulario
        if (isExistingFoto && foto.id) {
            setFotosEliminadas(prev => {
                // Evitar duplicados
                if (prev.includes(foto.id)) {
                    return prev;
                }
                const newList = [...prev, foto.id];
                setValue('fotos_eliminadas', newList);
                return newList;
            });
        }

        // Eliminar de las previsualizaciones (vista local)
        const newPreviews = previews.filter((_, index) => index !== indexToRemove);
        setPreviews(newPreviews);
        setValue('fotos_lugar', newPreviews, { shouldValidate: true });

        // Si se eliminó una imagen, permitir agregar nuevas
        if (newPreviews.length < 5) {
            setLimitReached(false);
        }
    };

    useEffect(() => {
        return () => {
            previews.forEach(item => {
                if (item.preview && item.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(item.preview);
                }
            });
        };
    }, [previews]);


    return (
        <div>
            <fieldset className="border-2 border-black rounded-2xl p-6 my-8">
                <legend className="text-black px-4 text-3xl uppercase font-bold">
                    Fotos del Lugar (Máximo 5)
                </legend>

                <div className="mb-4">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        disabled={limitReached}
                    />

                    <input
                        type="hidden"
                        {...register('fotos_eliminadas')}
                        value={JSON.stringify(fotosEliminadas)}
                    />

                    <button
                        type="button"
                        onClick={() => !limitReached && fileInputRef.current.click()}
                        className={`text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300
                            ${limitReached ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 cursor-pointer'}`}
                        disabled={limitReached}
                    >
                        {limitReached ? 'Límite alcanzado' : 'Elegir archivos'}
                    </button>

                    {limitReached && (
                        <div className="mt-3 flex items-center bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                            <FiAlertCircle className="text-yellow-500 text-xl mr-2" />
                            <p className="text-yellow-700 font-medium">
                                ¡Límite de fotos alcanzado! Elimina una foto para agregar otra.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                    {previews.length === 0 && (
                        <p className="text-gray-500 text-sm">No hay fotos cargadas. Haz clic en "Elegir archivos" para agregar fotos.</p>
                    )}
                    {previews.map((foto, index) => {
                        const imageUrl = foto.url || foto.preview;
                        
                        if (!imageUrl) {
                            return null;
                        }
                        
                        return (
                        <div key={foto.id || foto.preview || `foto-${index}`} className="relative w-36 h-36 border-2 border-gray-300 rounded overflow-hidden bg-gray-100" style={{ minWidth: '144px', minHeight: '144px' }}>
                            <img
                                src={imageUrl}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                                style={{ display: 'block' }}
                                onError={(e) => {
                                    // Mostrar un placeholder en lugar de ocultar
                                    e.target.onerror = null; // Prevenir loop infinito
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="144" height="144"%3E%3Crect width="144" height="144" fill="%23ccc"/%3E%3Ctext x="72" y="72" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EError%3C/text%3E%3C/svg%3E';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => removeFoto(index)}
                                className="absolute top-1 right-1 text-white text-[10px] font-bold rounded-full w-[65px] h-[15px] flex items-center justify-center bg-orange-500 hover:bg-red-500"
                            >
                                Eliminar
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
                                {index + 1}/5
                            </div>
                        </div>
                        );
                    })}
                </div>
            </fieldset>
        </div>
    );
};

export default FotosLugar;