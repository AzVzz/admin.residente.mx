import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

const ZonasSelector = ({ zonas }) => {
    const { control } = useFormContext();

    if (!zonas || zonas.length === 0) return null;

    return (
        <div className="p-1 border-1 border-gray-300 rounded-md mb-4">
            <h2 className="mb-2 text-xl leading-5">Zona</h2>
            <Controller
                name="zonas"
                control={control}
                render={({ field }) => (
                    <>
                        {zonas.map((zona) => {
                            const isChecked = Array.isArray(field.value) && field.value.includes(zona.nombre);
                            return (
                                <label key={zona.nombre} className="block mb-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={zona.nombre}
                                        checked={isChecked}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const currentValues = Array.isArray(field.value) ? field.value : [];

                                            if (e.target.checked) {
                                                field.onChange([...currentValues, value]);
                                            } else {
                                                field.onChange(currentValues.filter((v) => v !== value));
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    {zona.nombre}
                                </label>
                            );
                        })}
                    </>
                )}
            />
        </div>
    );
};

export default ZonasSelector;
