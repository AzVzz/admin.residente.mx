import { useFormContext } from 'react-hook-form';

const CodigoVestir = () => {

    const { register, formState: { errors }, watch, setValue } = useFormContext();

    const codigoVestir = [
        { value: "Informal" },
        { value: "Casual" },
        { value: "Smart casual" },
        { value: "Business casual" },
        { value: "Semi-formal" },
        { value: "Business formal" },
        { value: "Coctel" },
        { value: "Etiqueta" },
        { value: "Etiqueta rigurosa" },
    ];
    return (
        <div className="form-codigo-vestir">
            <fieldset>
                <legend>Código de vestir *</legend>
                <div className="radio-group">
                    {codigoVestir.map((cod) => (
                        <div key={cod.value}>
                            <input
                                type="radio"
                                id={cod.value}
                                value={cod.value}
                                {...register("codigo_vestir", { required: true })}
                                onClick={() => {
                                    const currentVal = watch("codigo_vestir");
                                    if (currentVal === cod.value) {
                                        setValue("codigo_vestir", "");
                                    }
                                }}
                            />

                            <label htmlFor={cod.value}>
                                {cod.value}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.codigo_vestir && (
                    <span className="error">Debes seleccionar al menos una sucursal</span>
                )}
            </fieldset>
        </div>
    )
}

export default CodigoVestir