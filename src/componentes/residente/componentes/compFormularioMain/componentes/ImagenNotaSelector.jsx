import { Controller, useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { notaImagenDelete } from '../../../../api/notaImagenDelete';
import RecorteImagen from './RecorteImagen';

// La foto principal de la nota se recorta a 680x418 con el editor (cover).
// El cropper entrega el recorte (File WebP) que se guarda en el form como
// 'imagen_recorte'; 'imagen' conserva el archivo ORIGINAL para guardarlo tal cual.

const ImagenNotaSelector = ({ imagenActual, notaId, onImagenEliminada }) => {
    const { control, setValue, watch } = useFormContext();
    const imagenSeleccionada = watch('imagen');
    const esArchivoNuevo =
        imagenSeleccionada && typeof imagenSeleccionada !== 'string';
    const [borrada, setBorrada] = useState(false);

    // Al cambiar de archivo se limpia el recorte previo (se regenera en el editor).
    useEffect(() => {
        if (!esArchivoNuevo) setValue('imagen_recorte', null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [esArchivoNuevo]);

    const handleEliminarImagen = async () => {
        if (!window.confirm('¿Seguro que deseas eliminar la imagen?')) return;

        try {
            if (imagenActual && notaId && !borrada) {
                await notaImagenDelete(notaId);
                onImagenEliminada();
                setBorrada(true);
            }
            setValue('imagen', null);
            setValue('imagen_recorte', null);
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            alert('Error al eliminar la imagen');
        }
    };

    // Imagen actual de la nota (cuando no se eligió una nueva).
    const mostrarActual = !esArchivoNuevo && imagenActual && !borrada;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen de la nota
            </label>
            <Controller
                name="imagen"
                control={control}
                render={({ field }) => (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            field.onChange(file);
                        }}
                        className="block w-full text-sm rounded-md py-2 px-3 border border-gray-300 text-gray-500 cursor-pointer bg-white"
                    />
                )}
            />

            {/* Editor de recorte para la foto recién elegida */}
            {esArchivoNuevo && (
                <div className="mt-3">
                    <RecorteImagen
                        file={imagenSeleccionada}
                        onChange={({ blob }) => setValue('imagen_recorte', blob)}
                    />
                    <div className="text-center mt-2">
                        <button
                            type="button"
                            onClick={handleEliminarImagen}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Quitar imagen
                        </button>
                    </div>
                </div>
            )}

            {/* Imagen actual guardada (modo edición, sin foto nueva) */}
            {mostrarActual && (
                <div className="mt-2">
                    <img
                        src={imagenActual}
                        alt="Imagen de la nota"
                        className="max-h-68 shadow border mb-2"
                    />
                    <button
                        type="button"
                        onClick={handleEliminarImagen}
                        className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Eliminar imagen
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImagenNotaSelector;
