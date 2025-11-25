import { useFormContext } from 'react-hook-form';

const Logros = ({ numero }) => {
    const { register, getValues, watch, formState: { errors } } = useFormContext();

    const MAX_CARACTERES_CUERPO = 60;
    const MAX_DIGITOS_FECHA = 4;

    const logroValue = watch(`logro_descripcion_${numero}`) || '';
    const fechaValue = watch(`logro_fecha_${numero}`) || '';

    const validarFecha = (value) => {
        if (!value) return true;
        const soloNumeros = /^\d+$/.test(value);
        const longitudValida = value.length <= MAX_DIGITOS_FECHA;
        const añoValido = value >= 1900 && value <= new Date().getFullYear();

        if (!soloNumeros) return "Solo se permiten números";
        if (!longitudValida) return `Máximo ${MAX_DIGITOS_FECHA} dígitos`;
        if (!añoValido) return `Año debe estar entre 1900 y ${new Date().getFullYear()}`;
        return true;
    };

    const validarPar = (value, fieldName) => {
        const otroCampo = fieldName.includes('fecha')
            ? `logro_descripcion_${numero}`
            : `logro_fecha_${numero}`;

        const valorActual = value?.trim();
        const valorOtroCampo = getValues(otroCampo)?.trim();

        if (valorActual && !valorOtroCampo) {
            return fieldName.includes('fecha')
                ? "Debes completar la descripción del logro"
                : "Debes poner el año";
        }
        return true;
    };

    return (
        <div className="input-group">
            <div className="input-pair">
                <div className="year-container">
                    <label>Año logro #{numero}</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Ej. 2024"
                        // CAMBIO: logro_anio -> logro_fecha
                        {...register(`logro_fecha_${numero}`, {
                            validate: (value) => {
                                const validacionPar = validarPar(value, `logro_fecha_${numero}`);
                                if (validacionPar !== true) return validacionPar;
                                return validarFecha(value);
                            }
                        })}
                        maxLength={MAX_DIGITOS_FECHA}
                    />
                </div>

                <div className="description-container">
                    <label>Descripción del logro {numero}</label>
                    <input
                        type="text"
                        placeholder="Ej. Colaboración con Residente"
                        {...register(`logro_descripcion_${numero}`, {
                            validate: (value) => validarPar(value, `logro_descripcion_${numero}`)
                        })}
                        maxLength={MAX_CARACTERES_CUERPO}
                    />
                </div>
            </div>
            {(errors[`logro_fecha_${numero}`] || errors[`logro_descripcion_${numero}`]) && (
                <p className="error">
                    {errors[`logro_fecha_${numero}`]?.message || errors[`logro_descripcion_${numero}`]?.message}
                </p>
            )}
            <span className="contador-caracteres">
                {logroValue.length}/{MAX_CARACTERES_CUERPO}
            </span>
        </div>
    )
}

export default Logros;