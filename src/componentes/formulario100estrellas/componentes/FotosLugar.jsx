import { useFormContext } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const FotosLugar = ({ existingFotos }) => {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const [previews, setPreviews] = useState([]);
    const [limitReached, setLimitReached] = useState(false);
    const fotos = watch('fotos_lugar') || [];
    const fileInputRef = useRef(null);
    const [fotosEliminadas, setFotosEliminadas] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        register('fotos_lugar');
        register('fotos_eliminadas');

        if (existingFotos?.length > 0) {
            const formattedFotos = existingFotos.map(foto => ({
                id: foto.id,
                url: `https://residente.mx${foto.url_imagen}`,
                isExisting: true
            }));
            setPreviews(formattedFotos);

            // Guardar solo IDs para existentes
            setValue('fotos_lugar', formattedFotos.map(foto => ({
                id: foto.id,
                isExisting: true
            })));
        }
    }, [register, existingFotos]);


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

            setPreviews(combinedPreviews);
            setValue('fotos_lugar', [...previews, ...newFiles], { shouldValidate: true });

            if (combinedPreviews.length >= 5) {
                setLimitReached(true);
            }
        }
    };


    const removeFoto = async (indexToRemove) => {
        const foto = previews[indexToRemove];

        // CORRECCIÓN: Usar foto.url para verificar si es una imagen existente
        const isExistingFoto = foto.url && !foto.url.startsWith('blob:');

        if (isExistingFoto && foto.id) {
            try {
                setIsDeleting(true);
                const response = await fetch(`https://residente.mx/api/restaurante/fotos-lugar/${foto.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar la foto del lugar');
                }

                setFotosEliminadas(prev => {
                    const newList = [...prev, foto.id];
                    setValue('fotos_eliminadas', newList);
                    return newList;
                });
            } catch (error) {
                console.error('Error al eliminar la foto:', error);
                return;
            } finally {
                setIsDeleting(false);
            }
        }

        // Eliminar de las previsualizaciones
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
                        disabled={limitReached || isDeleting}
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
                    {previews.map((foto, index) => (
                        <div key={index} className="relative w-36 h-36 border-2 border-gray-300 rounded overflow-hidden">
                            <img
                                src={foto.url || foto.preview} // Usar url para existentes, preview para nuevas
                                alt={`Preview ${index}`}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <button
                                type="button"
                                onClick={() => removeFoto(index)}
                                disabled={isDeleting}
                                className={`absolute top-1 right-1 text-white text-[10px] font-bold rounded-full w-[65px] h-[15px] flex items-center justify-center
                                    ${isDeleting ? 'bg-gray-500' : 'bg-orange-500 hover:bg-red-500'}`}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
                                {index + 1}/5
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>
        </div>
    );
};

export default FotosLugar;