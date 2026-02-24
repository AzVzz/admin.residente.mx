import { useFormContext } from 'react-hook-form';

const UbicacionPrincipal = () => {

    const { register, watch, setValue, formState: { errors } } = useFormContext();

    const tipoAreaValue = watch("tipo_area") || [];

    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        const isChecked = e.target.checked;

        let newValue;
        if (isChecked) {
            newValue = [...tipoAreaValue, value];
        } else {
            newValue = tipoAreaValue.filter(item => item !== value);
        }

        // Actualizar el valor en el formulario
        setValue("tipo_area", newValue, { shouldValidate: true });
    };


    const ubicacionPrincipal = [
        { value: "Interior" },
        { value: "Terraza" },
        { value: "Pick up" }
    ];
    return (
        <div className="form-ubicacion-principal">
            <fieldset>
                <legend>Tipo de comedor *</legend>
                <div className="checkbox-group">
                    {ubicacionPrincipal.map((ubi) => (
                        <div key={ubi.value}>
                            <input
                                type="checkbox"
                                id={ubi.value}
                                value={ubi.value}
                                {...register("tipo_area")}
                                checked={tipoAreaValue.includes(ubi.value)}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor={ubi.value}>
                                {ubi.value}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.tipo_area && (
                    <span className="error">Debes seleccionar al menos una ubicación</span>
                )}
            </fieldset>
        </div>
    )
}

export default UbicacionPrincipal;