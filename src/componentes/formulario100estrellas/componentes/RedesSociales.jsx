import { useFormContext } from 'react-hook-form';

const RedesSociales = () => {
    const { register, formState: { errors } } = useFormContext();

    const redesSociales = [
        {
            value: "sitio_web",
            label: "Sitio web",
            placeholder: "Ej. www.residente.mx"
        },
        {
            value: "rappi_link",
            label: "Rappi Link",
            placeholder: "Ej. https://www.rappi.com.mx/restaurantes"
        },
        {
            value: "didi_link",
            label: "Didi Food Link",
            placeholder: "Ej. https://www.didi-food.com"
        },
        {
            value: "instagram",
            label: "Instagram Link",
            placeholder: "Ej. residentemty"
        },
        {
            value: "facebook",
            label: "Facebook Link",
            placeholder: "Ej. Residente Monterrey"
        },
        {
            value: "ubereats_link",
            label: "Uber Eats Link",
            placeholder: "Ej. https://www.ubereats.com/mx/store"
        },
        {
            value: "link_horario",
            label: "Google Maps Link",
            placeholder: "Ej. https://maps.app.goo.gl/duWLfZydWwqrU21U6"
        }
    ];

    return (
        <div className="form-redes-sociales">
            <fieldset>
                <legend>Redes sociales</legend>
                {redesSociales.map((rds) => (
                    <div key={rds.value} className="input-group">
                        <label htmlFor={rds.value}>
                            {rds.label}
                        </label>
                        <input
                            id={rds.value}
                            type="text"
                            placeholder={rds.placeholder}
                            {...register(rds.value, {
                                pattern: {
                                    // Expresión regular simplificada
                                    value: /^https?:\/\/[^\s$.?#].[^\s]*$/,
                                    message: "Ingresa una URL válida (debe comenzar con http:// o https://)"
                                }
                            })}
                            className={errors[rds.value] ? "error-border" : ""}
                        />
                        {errors[rds.value] && (
                            <p className="error-message">{errors[rds.value].message}</p>
                        )}
                    </div>
                ))}
            </fieldset>
        </div>
    )
}

export default RedesSociales;