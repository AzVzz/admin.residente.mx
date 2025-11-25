import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { urlApi, imgApi } from '../../api/url';

const Imagen = () => {
    const { setValue, register, formState: { errors } } = useFormContext();
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const handleImagenChange = (e) => {
        const nuevosArchivos = Array.from(e.target.files);
        if (nuevosArchivos.length === 0) return;

        const archivosActualizados = [...files, ...nuevosArchivos].slice(0, 3);
        const nuevasPreviews = archivosActualizados.map(file =>
            URL.createObjectURL(file)
        );

        setFiles(archivosActualizados);
        setPreviews(nuevasPreviews);

        // Actualizar formulario con FileList válido
        const dataTransfer = new DataTransfer();
        archivosActualizados.forEach(file => dataTransfer.items.add(file));
        setValue('fotos', archivosActualizados); // 👈 Usar 'fotos' como nombre del campo
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);

        const nuevosArchivos = files.filter((_, i) => i !== index);
        const nuevasPreviews = nuevosArchivos.map(file =>
            URL.createObjectURL(file)
        );

        const dataTransfer = new DataTransfer();
        nuevosArchivos.forEach(file => dataTransfer.items.add(file));

        setFiles(nuevosArchivos);
        setPreviews(nuevasPreviews);
        setValue('fotos', archivosActualizados);
    };

    return (
        <div className="form-imagen">
            <fieldset>
                <legend>Sube tu imagen de portada!</legend>
                <label>
                    Subir imágenes (1-3) | Formatos: JPG, PNG, WEBP
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg, image/png, image/webp"
                        {...register('fotos', { // 👈 Cambiar nombre del campo
                            validate: {
                                minFiles: v => (v?.length ?? 0) >= 1 || 'Mínimo 1 imagen',
                                maxFiles: v => (v?.length ?? 0) <= 3 || 'Máximo 3 imágenes'
                            }
                        })}
                        onChange={handleImagenChange}
                    />
                </label>
                {errors.fotos && ( // 👈 Cambiar a errors.fotos
                    <p className="error">{errors.fotos.message}</p>
                )}

                {/* Validación manual */}
                {files.length < 1 && (
                    <p className="error">Debes subir al menos 1 imagen</p>
                )}
                {files.length > 3 && (
                    <p className="error">Máximo 3 imágenes permitidas</p>
                )}

                <div className="previews">
                    {previews.map((url, idx) => (
                        <div key={url} className="preview-item">
                            <img
                                src={url.trim().startsWith('http') || url.trim().startsWith('blob:') ? url : `${imgApi}${url}`}
                                alt={`Preview ${idx + 1}`}
                                onLoad={() => URL.revokeObjectURL(url)}
                                style={{
                                    width: '150px',
                                    height: 'auto',
                                    margin: '8px',
                                    border: '2px solid #3498db',
                                    borderRadius: '8px'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                            >
                                Eliminar
                            </button>
                        </div>
                    ))}
                </div>
            </fieldset>
        </div >
    );
};

export default Imagen;