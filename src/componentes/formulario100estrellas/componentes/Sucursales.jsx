import { useFormContext } from 'react-hook-form';

const Sucursales = () => {

    const { register, watch, setValue, formState: { errors } } = useFormContext();

    const sucursalesValue = watch("sucursales") || [];

    const sucursales = [
        { value: "Monterrey" },
        { value: "San Pedro" },
        { value: "Apodaca" },
        { value: "San Nicolás" },
        { value: "Guadalupe" },
        { value: "Santiago" },
        { value: "García" },
        { value: "Escobedo" },
        { value: "Santa Catarina" },
        { value: "Saltillo" },
    ];

    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        const isChecked = e.target.checked;

        let newValue;
        if (isChecked) {
            newValue = [...sucursalesValue, value];
        } else {
            newValue = sucursalesValue.filter(item => item !== value);
        }

        setValue("sucursales", newValue, { shouldValidate: true });
    }

    return (
        <div className="form-sucursales">
            <fieldset>
                <legend>Sucursales *</legend>
                <div className="checkbox-group">
                    {sucursales.map((scsls) => (
                        <div key={scsls.value}>
                            <input
                                type="checkbox"
                                id={`sucursal-${scsls.value}`}
                                value={scsls.value}
                                {...register("sucursales")}
                                checked={sucursalesValue.includes(scsls.value)}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor={`sucursal-${scsls.value}`}>
                                {scsls.value}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.sucursales && (
                    <span className="error">Debes seleccionar al menos una sucursal</span>
                )}
            </fieldset>
        </div>
    )
}

export default Sucursales;