import { Controller, useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { notaImagenDelete } from '../../../../api/notaImagenDelete';

const ImagenNotaSelector = ({ imagenActual, notaId, onImagenEliminada }) => {
    const { control, setValue, watch } = useFormContext();
    const imagenSeleccionada = watch('imagen');
    const [previewUrl, setPreviewUrl] = useState(null);

    // Actualiza la previsualización cuando el usuario selecciona una imagen
    useEffect(() => {
        if (imagenSeleccionada && typeof imagenSeleccionada !== 'string') {
            const file = imagenSeleccionada;
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [imagenSeleccionada]);

    // Si hay preview, mostrarla; si no, mostrar la imagen actual de la nota
    const mostrarImagen = previewUrl || imagenActual;

    const handleEliminarImagen = async () => {
        if (!window.confirm('¿Seguro que deseas eliminar la imagen?')) return;
        
        try {
            // Si hay una imagen actual en la base de datos, eliminarla
            if (imagenActual && notaId) {
                await notaImagenDelete(notaId);
                onImagenEliminada();
            }
            
            // Limpiar el input de archivo y la previsualización
            setValue('imagen', null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            alert('Error al eliminar la imagen');
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen de la nota
            </label>
            {mostrarImagen && (
                <div className="mb-2">
                    <img
                        src={mostrarImagen}
                        alt="Imagen de la nota"
                        className="max-h-68 shadow border mb-2"
                    />
                    {(imagenActual || previewUrl) && (
                        <button
                            type="button"
                            onClick={handleEliminarImagen}
                            className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Eliminar imagen
                        </button>
                    )}
                </div>
            )}
            <Controller
                name="imagen"
                control={control}
                render={({ field }) => (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                            const file = e.target.files[0];
                            field.onChange(file);
                        }}
                        className="block w-full text-sm rounded-md py-2 px-3 border border-gray-300 text-gray-500 cursor-pointer"
                    />
                )}
            />
        </div>
    );
};

export default ImagenNotaSelector;