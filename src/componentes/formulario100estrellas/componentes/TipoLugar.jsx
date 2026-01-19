import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';

const subOpcionesFoodDrink = [
    { value: "Postres", label: "Postres" },
    { value: "Cafés", label: "Cafés" },
    { value: "Bares", label: "Bares" },
    { value: "Snacks", label: "Snacks" },
];

const TipoLugar = () => {
    const { register, watch, setValue, formState: { errors } } = useFormContext();

    const tipoLugar = watch("tipo_lugar") || "";
    const subTipoLugar = watch("sub_tipo_lugar") || "";

    const esFoodDrink = tipoLugar === "Food & Drink";

    // Cuando cambia de Restaurante a Food & Drink o viceversa, limpiar sub_tipo
    useEffect(() => {
        if (tipoLugar === "Restaurante") {
            setValue("sub_tipo_lugar", "");
        }
    }, [tipoLugar, setValue]);

    return (
        <div className="categorias">
            <fieldset>
                <legend>Secciones y Categorías *</legend>

                {/* Tipo de lugar principal */}
                <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Tipo de lugar</h3>

                    <div className="flex flex-wrap gap-3">
                        {/* Opción Restaurante */}
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="tipo_lugar-Restaurante"
                                value="Restaurante"
                                {...register("tipo_lugar", {
                                    required: "Debes seleccionar un tipo de lugar"
                                })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                onClick={() => {
                                    if (tipoLugar === "Restaurante") {
                                        setValue("tipo_lugar", "");
                                    }
                                }}
                            />
                            <label
                                htmlFor="tipo_lugar-Restaurante"
                                className="ml-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                            >
                                Restaurante
                            </label>
                        </div>

                        {/* Opción Food & Drink */}
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="tipo_lugar-FoodDrink"
                                value="Food & Drink"
                                {...register("tipo_lugar", {
                                    required: "Debes seleccionar un tipo de lugar"
                                })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                onClick={() => {
                                    if (tipoLugar === "Food & Drink") {
                                        setValue("tipo_lugar", "");
                                        setValue("sub_tipo_lugar", "");
                                    }
                                }}
                            />
                            <label
                                htmlFor="tipo_lugar-FoodDrink"
                                className="ml-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                            >
                                Food & Drink
                            </label>
                        </div>
                    </div>

                    {errors.tipo_lugar && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.tipo_lugar.message}
                        </p>
                    )}
                </div>

                {/* Sub-opciones para Food & Drink */}
                {esFoodDrink && (
                    <div className="mb-6 ml-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-md mb-3 text-blue-800">
                            ¿Qué tipo de Food & Drink?
                        </h4>

                        <div className="flex flex-wrap gap-3">
                            {subOpcionesFoodDrink.map((tipo) => (
                                <div key={tipo.value} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`sub_tipo_lugar-${tipo.value}`}
                                        value={tipo.value}
                                        {...register("sub_tipo_lugar", {
                                            required: esFoodDrink ? "Debes seleccionar un subtipo" : false
                                        })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        onClick={() => {
                                            if (subTipoLugar === tipo.value) {
                                                setValue("sub_tipo_lugar", "");
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`sub_tipo_lugar-${tipo.value}`}
                                        className="ml-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                                    >
                                        {tipo.label}
                                    </label>
                                </div>
                            ))}
                        </div>

                        {errors.sub_tipo_lugar && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.sub_tipo_lugar.message}
                            </p>
                        )}
                    </div>
                )}
            </fieldset>
        </div>
    );
};

export default TipoLugar;
