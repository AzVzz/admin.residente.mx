import { Controller, useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { notaInstafotoDelete } from '../../../../api/notaCrearPostPut';

const InstafotoSelector = ({ instafotoActual, notaId, onInstafotoEliminada }) => {
    const { control, setValue, watch } = useFormContext();
    const instafotoSeleccionada = watch('instafoto');
    const [previewUrl, setPreviewUrl] = useState(null);

    // Actualiza la previsualización cuando el usuario selecciona una imagen
    useEffect(() => {
        if (instafotoSeleccionada && typeof instafotoSeleccionada !== 'string') {
            const file = instafotoSeleccionada;
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [instafotoSeleccionada]);

    // Si hay preview, mostrarla; si no, mostrar la instafoto actual de la nota
    const mostrarImagen = previewUrl || instafotoActual;

    const handleEliminarInstafoto = async () => {
        if (!notaId) return;
        if (!window.confirm('¿Seguro que deseas eliminar la instafoto?')) return;
        try {
            await notaInstafotoDelete(notaId);
            onInstafotoEliminada();
            setValue('instafoto', null); // Limpia el input de archivo
            setPreviewUrl(null);
        } catch (error) {
            alert('Error al eliminar la instafoto');
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Instafoto
            </label>
            {mostrarImagen && (
                <div className="mb-2">
                    <img
                        src={mostrarImagen}
                        alt="Instafoto"
                        className="max-h-68 shadow border mb-2"
                    />
                    {instafotoActual && !previewUrl && (
                        <button
                            type="button"
                            onClick={handleEliminarInstafoto}
                            className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Eliminar instafoto
                        </button>
                    )}
                </div>
            )}
            <Controller
                name="instafoto"
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

export default InstafotoSelector;
