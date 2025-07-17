import { useFormContext } from 'react-hook-form';

const ZonasHabilitadas = () => {

    const { register, formState: { errors } } = useFormContext();

    const zonasHabilitadas = [
        { value: "Comedor" },
        { value: "Terraza" }
    ];

    return (
        <div className="form-zonas-habilitadas">
            <fieldset>
                <legend>Zonas habilitadas *</legend>
                <div className="checkbox-group">
                    {zonasHabilitadas.map((zns) => (
                        <div key={zns.value}>
                            <input
                                id={zns.value}
                                type="checkbox"
                                value={zns.value}
                                {...register("tipo_area_restaurante", {
                                    required: false, setValueAs: (value) => {
                                        const values = value || [];
                                        return Array.isArray(values) ? values : [values];
                                    }
                                })}
                            />
                            <label htmlFor={zns.value}>
                                {zns.value}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.tipo_area_restaurante && (
                    <span className="error">Debes seleccionar al menos una zona</span>
                )}
            </fieldset>
        </div>
    )
}

export default ZonasHabilitadas;