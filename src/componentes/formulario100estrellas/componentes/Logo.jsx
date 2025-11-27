import { useFormContext } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { urlApi, imgApi } from '../../api/url'

const Logo = ({ existingLogo }) => {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState(null);
    const logo = watch('logo');
    const fileInputRef = useRef(null);
    const [logoEliminado, setLogoEliminado] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        register('logo', {
            required: false // No es obligatorio
        });

        register('logoEliminado');

        // Cargar previsualización de logo existente
        if (existingLogo) {
            const url = (existingLogo.src && existingLogo.src.trim().startsWith('http'))
                ? existingLogo.src
                : `${imgApi}${existingLogo.src}`;

            setPreview(url);
            // Establecer valor inicial para que react-hook-form sepa que hay algo
            setValue('logo', [existingLogo], { shouldValidate: true });
        }
    }, [register, existingLogo, setValue]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFileName(file.name);
            const newPreview = URL.createObjectURL(file);
            setPreview(newPreview);
            setValue('logo', [file], { shouldValidate: true });
            setLogoEliminado(false);
            setValue('logoEliminado', false);
        }
    };

    const removeImage = async () => {
        // Si es una imagen existente, marcar para eliminar
        if (existingLogo && !logoEliminado) {
            // Nota: La eliminación real del servidor se suele hacer al guardar el formulario
            // o inmediatamente dependiendo de la lógica. Aquí seguiremos la lógica de marcar para eliminar.
            setLogoEliminado(true);
            setValue('logoEliminado', true);
        }

        setPreview(null);
        setFileName(null);
        setValue('logo', [], { shouldValidate: true });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Limpiar URL al desmontar
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    return (
        <div>
            <fieldset className="border-2 border-black rounded-2xl p-6 my-8">
                <legend className="text-black px-4 text-3xl uppercase font-bold">Logo del restaurante (Opcional)</legend>

                <div className="mb-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                    />

                    <input
                        type="hidden"
                        {...register('logoEliminado')}
                        value={logoEliminado}
                    />

                    {!preview && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out cursor-pointer"
                        >
                            Elegir Archivo
                        </button>
                    )}
                </div>

                {preview && (
                    <div className="relative w-36 h-36 border-2 border-gray-300 rounded overflow-hidden">
                        <img
                            src={preview}
                            alt="Logo Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-full w-[65px] h-[15px] flex items-center justify-center transition-colors duration-300 ease-in-out cursor-pointer shadow-md"
                        >
                            Eliminar
                        </button>
                    </div>
                )}

                {errors.logo && (
                    <p className="text-red-500 font-medium mt-2">{errors.logo.message}</p>
                )}
            </fieldset>
        </div>
    );
};

export default Logo;
