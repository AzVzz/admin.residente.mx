import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';

const TipoRestaurante = () => {

    const { register, watch, setValue, formState: { errors } } = useFormContext();

    const tipoActual = watch("tipo_restaurante") || "";
    const normalize = (str) => str.toLowerCase().trim();

    const tiposDeRestaurante = [
        { value: "Pizza" },
        { value: "Carnes" },
        { value: "Mariscos" },
        { value: "Desayunos" },
        { value: "Tacos" },
        { value: "Tacos mañaneros" },
        { value: "Tacos al vapor" },
        { value: "Hamburguesas" },
        { value: "Mexicano" },
        { value: "Postre" },
        { value: "Italiana" },
        { value: "Sushi" },
        { value: "Internacional" },
        { value: "Cafetería" },
        { value: "De Lujo" },
        { value: "De Experiencia" },
        { value: "Pollo" },
        { value: "De Prisa" },
        { value: "Para Llevar" },
        { value: "De Colonia" },
        { value: "Mediterránea" },
        { value: "Saludable" },
        { value: "Asiática" },
        { value: "Cabrito" },
        { value: "En Casa" },
        { value: "En Hotel" }
    ];

    // Normalizar el valor al cargar/actualizar
    useEffect(() => {
        if (tipoActual) {
            const tipoNormalizado = tiposDeRestaurante.find(
                tipo => normalize(tipo.value) === normalize(tipoActual)
            )?.value || tipoActual;

            if (tipoNormalizado !== tipoActual) {
                setValue("tipo_restaurante", tipoNormalizado);
            }
        }
    }, [tipoActual, setValue]);

    return (
        <div className="tipo-de-restaurante">
            <fieldset>
                <legend>Tipo de restaurante *</legend>
                <div className="radio-group">
                    {tiposDeRestaurante.map((tipo) => (
                        <div key={tipo.value}>
                            <input
                                type="radio"
                                id={tipo.value}
                                value={tipo.value}
                                checked={normalize(tipoActual) === normalize(tipo.value)}
                                {...register("tipo_restaurante", {
                                    required: "Debes seleccionar una categoria"
                                })}
                                onClick={() => {
                                    if (normalize(tipoActual) === normalize(tipo.value)) {
                                        setValue("tipo_restaurante", "");
                                    }
                                }}
                            />
                            <label htmlFor={tipo.value}>
                                {tipo.value}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.tipo_restaurante && (
                    <p className="error" style={{ marginTop: "0.5rem" }}>
                        {errors.tipo_restaurante.message}
                    </p>
                )}
            </fieldset>
        </div>
    )
}

export default TipoRestaurante