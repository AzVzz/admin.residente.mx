import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';

const OcasionIdeal = () => {
    const { register, setValue, watch, formState: { errors } } = useFormContext();

    const ocasionIdeal = [
        "Familiar",
        "Negocios",
        "Rápido",
        "De oficina",
        "Amigos",
        "En pareja",
        "Solo",
        "Desayunos"
    ];

    // useEffect eliminado para evitar valores por defecto forzados

    const GrupoOcasion = ({ numero }) => (
        <div className="form-ocasion-ideal">
            <fieldset>
                <legend>Ocasión ideal {numero} (selecciona una opción) *</legend>
                <div className="radio-group">
                    {ocasionIdeal.map((valor) => (
                        <div key={`${valor}-${numero}`}>
                            <input
                                type="radio"
                                id={`ocasion-${numero}-${valor}`}
                                value={valor}
                                {...register(`ocasion_ideal_${numero}`, {
                                    required: "Debes seleccionar una opción"
                                })}
                                onClick={() => {
                                    const currentVal = watch(`ocasion_ideal_${numero}`);
                                    if (currentVal === valor) {
                                        setValue(`ocasion_ideal_${numero}`, "");
                                    }
                                }}
                            />
                            <label htmlFor={`ocasion-${numero}-${valor}`}>
                                {valor}
                            </label>
                        </div>
                    ))}
                </div>
                {errors[`ocasion_ideal_${numero}`] && (
                    <span className="error">
                        {errors[`ocasion_ideal_${numero}`].message}
                    </span>
                )}
            </fieldset>
        </div>
    );

    return (
        <>
            {[1, 2, 3].map((numero) => (
                <GrupoOcasion
                    key={`ocasion-group-${numero}`}
                    numero={numero}
                />
            ))}
        </>
    );
};

export default OcasionIdeal;