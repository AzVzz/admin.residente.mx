import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { catalogoTipoLugarGet } from '../../api/catalogoTipoLugarGet';

const TipoLugar = () => {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const [tiposLugar, setTiposLugar] = useState([]);
    const [loading, setLoading] = useState(true);

    const tipoActual = watch("tipo_lugar") || "";
    const normalize = (str) => str.toLowerCase().trim();

    useEffect(() => {
        const cargarTipos = async () => {
            try {
                const tipos = await catalogoTipoLugarGet();
                setTiposLugar(tipos);
            } catch (error) {
                console.error("Error cargando tipos de lugar:", error);
                // Fallback en caso de error
                setTiposLugar([
                    { value: "Restaurante", label: "Restaurante" },
                    { value: "Cafetería", label: "Cafetería" },
                    { value: "Bar", label: "Bar" },
                    { value: "Postería", label: "Postería" },
                    { value: "Snack", label: "Snack" },
                ]);
            } finally {
                setLoading(false);
            }
        };
        cargarTipos();
    }, []);

    if (loading) return <p>Cargando opciones...</p>;

    return (
        <div className="categorias">
            <fieldset>
                <legend>Secciones y Categorías *</legend>

                <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Tipo de lugar</h3>

                    <div className="flex flex-wrap gap-3">
                        {tiposLugar.map((tipo) => (
                            <div key={tipo.value} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`tipo_lugar-${tipo.value}`}
                                    value={tipo.value}
                                    checked={normalize(tipoActual) === normalize(tipo.value)}
                                    {...register("tipo_lugar", {
                                        required: "Debes seleccionar un tipo de lugar"
                                    })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    onClick={() => {
                                        if (normalize(tipoActual) === normalize(tipo.value)) {
                                            setValue("tipo_lugar", "");
                                        }
                                    }}
                                />
                                <label
                                    htmlFor={`tipo_lugar-${tipo.value}`}
                                    className="ml-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                                >
                                    {tipo.label}
                                </label>
                            </div>
                        ))}
                    </div>

                    {errors.tipo_lugar && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.tipo_lugar.message}
                        </p>
                    )}
                </div>
            </fieldset>
        </div>
    );
};

export default TipoLugar;
