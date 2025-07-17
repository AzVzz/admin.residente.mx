import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';

const OcasionIdeal = () => {
    const { register, setValue, formState: { errors } } = useFormContext();

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

    // Función para inicializar valores al cargar/editar
    useEffect(() => {
        // Obtener valores actuales
        const ocasion1 = ocasionIdeal.find(oc => oc === "Familiar") || "";
        const ocasion2 = ocasionIdeal.find(oc => oc === "Negocios") || "";
        const ocasion3 = ocasionIdeal.find(oc => oc === "Amigos") || "";
        
        // Establecer valores predeterminados
        setValue("ocasion_ideal_1", ocasion1);
        setValue("ocasion_ideal_2", ocasion2);
        setValue("ocasion_ideal_3", ocasion3);
    }, [setValue]);

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