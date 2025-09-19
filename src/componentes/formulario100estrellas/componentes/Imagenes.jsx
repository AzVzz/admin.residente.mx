import { useFormContext } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { urlApi } from '../../api/url'

const Imagenes = ({ slug, existingImages }) => {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const [previews, setPreviews] = useState([]);
    const [fileNames, setFileNames] = useState([]);
    const [limitReached, setLimitReached] = useState(false);
    const imagenes = watch('imagenes') || [];
    const fileInputRef = useRef(null);
    const [imagenesEliminadas, setImagenesEliminadas] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        register('imagenes', {
            required: 'Debes subir al menos una imagen',
            validate: value => value?.length > 0 || 'Mínimo una imagen requerida'
        });

        register('imagenesEliminadas');

        // Cargar previsualizaciones de imágenes existentes desde la API
        if (existingImages && existingImages.length > 0) {
            const existingPreviews = existingImages.map(img => ({
                id: img.id,
                url: `${urlApi}${img.src}`
            }));

            setPreviews(existingPreviews.map(img => img.url));
            setValue('imagenes', existingPreviews, { shouldValidate: true });

            // Verificar si ya se alcanzó el límite
            if (existingPreviews.length >= 3) {
                setLimitReached(true);
            }
        }
    }, [register, existingImages]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Si ya se alcanzó el límite, no procesar archivos
        if (previews.length >= 3) {
            return;
        }

        if (files.length) {
            // Guardar nombres de archivos
            setFileNames(files.map(f => f.name));

            // Generar previsualizaciones para nuevos archivos
            const newPreviews = files.map(file => URL.createObjectURL(file));

            // Calcular cuántos espacios disponibles quedan
            const availableSlots = 3 - previews.length;
            const filesToAdd = files.slice(0, availableSlots);
            const previewsToAdd = newPreviews.slice(0, availableSlots);

            // Combinar existentes + nuevas
            const combinedPreviews = [...previews, ...previewsToAdd];
            const combinedImagenes = [...imagenes, ...filesToAdd];

            setPreviews(combinedPreviews);
            setValue('imagenes', combinedImagenes, { shouldValidate: true });

            // Verificar si se alcanzó el límite
            if (combinedPreviews.length >= 3) {
                setLimitReached(true);
            }
        }
    };

    const removeImage = async (indexToRemove) => {
        const imageToRemove = previews[indexToRemove];
        const isExistingImage = typeof imageToRemove !== 'string' ||
            !imageToRemove.startsWith('blob:');

        // Si es una imagen existente (no nueva), agregar a lista de eliminadas
        if (isExistingImage && existingImages && existingImages[indexToRemove]?.id) {
            const imageId = existingImages[indexToRemove].id;

            try {
                setIsDeleting(true);
                // Llamar a la API para eliminar la imagen del servidor
                const response = await fetch(`${urlApi}api/restaurante/imagenes/${imageId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar la imagen del servidor');
                }

                // Si la eliminación fue exitosa, agregar a la lista de eliminadas
                setImagenesEliminadas(prev => {
                    const newList = [...prev, imageId];
                    setValue('imagenesEliminadas', newList); // Actualizar formulario
                    return newList;
                });
            } catch (error) {
                console.error('Error al eliminar la imagen:', error);
                // Mostrar mensaje de error al usuario si es necesario
                return; // No continuar con la eliminación si falla la API
            } finally {
                setIsDeleting(false);
            }
        }

        // Eliminar de las previsualizaciones
        const newPreviews = [...previews];
        newPreviews.splice(indexToRemove, 1);
        setPreviews(newPreviews);

        // Eliminar de los valores del formulario
        const currentImages = [...(watch('imagenes') || [])];
        currentImages.splice(indexToRemove, 1);
        setValue('imagenes', currentImages, { shouldValidate: true });

        // Si se eliminó una imagen, permitir agregar nuevas
        if (newPreviews.length < 3) {
            setLimitReached(false);
        }
    };

    // Limpiar URLs al desmontar
    useEffect(() => {
        return () => {
            previews.forEach(url => {
                if (url.startsWith('blob:')) URL.revokeObjectURL(url);
            });
        };
    }, [previews]);

    return (
        <div>
            <fieldset className="border-2 border-black rounded-2xl p-6 my-8">
                <legend className="text-black px-4 text-3xl uppercase font-bold">Imágenes del restaurante (Máximo de 3) *</legend>

                {/* Contenedor personalizado para el input de archivo */}
                <div className="mb-4">
                    {/* Input real (oculto) */}
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        disabled={limitReached}
                    />

                    {/* Campo oculto para imágenes eliminadas */}
                    <input
                        type="hidden"
                        {...register('imagenesEliminadas')}
                        value={JSON.stringify(imagenesEliminadas)}
                    />

                    {/* Botón personalizado para abrir el selector de archivos */}
                    <button
                        type="button"
                        onClick={() => {
                            if (!limitReached) {
                                fileInputRef.current.click();
                            }
                        }}
                        className={`
                            text-white font-bold py-2 px-4 rounded-lg
                            transition-colors duration-300 ease-in-out
                            ${limitReached
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 cursor-pointer'
                            }
                            ${errors.imagenes ? 'border-2 border-red-500' : ''}
                        `}
                        disabled={limitReached || isDeleting}
                    >
                        {limitReached ? 'Límite alcanzado' : 'Elegir archivos'}
                    </button>

                    {/* Alerta de límite */}
                    {limitReached && (
                        <div className="mt-3 flex items-center bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                            <FiAlertCircle className="text-yellow-500 text-xl mr-2" />
                            <p className="text-yellow-700 font-medium">
                                ¡Límite de fotos alcanzado! Elimina una imagen para agregar otra.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative w-36 h-36 border-2 border-gray-300 rounded overflow-hidden">
                            <img
                                src={preview}
                                alt={`Preview ${index}`}
                                onError={(e) => {
                                    // Manejar imágenes rotas
                                    e.target.style.display = 'none';
                                }}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                disabled={isDeleting}
                                className={`absolute top-1 right-1 text-white text-[10px] font-bold rounded-full w-[65px] h-[15px] flex items-center justify-center transition-colors duration-300 ease-in-out cursor-pointer shadow-md ${isDeleting ? 'bg-gray-500' : 'bg-orange-500 hover:bg-red-500'
                                    }`}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>

                            {/* Contador de imágenes */}
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
                                {index + 1}/3
                            </div>
                        </div>
                    ))}
                </div>

                {errors.imagenes && (
                    <p className="text-red-500 font-medium mt-2">{errors.imagenes.message}</p>
                )}
            </fieldset>
        </div>
    );
};

export default Imagenes;