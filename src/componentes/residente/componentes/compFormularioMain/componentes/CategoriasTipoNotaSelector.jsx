import { Controller, useFormContext } from 'react-hook-form';
import { useAuth } from '../../../../Context';


const CategoriasTipoNotaSelector = ({ tipoDeNota, secciones, ocultarTipoNota }) => {
    const { control, watch } = useFormContext();
    const { usuario } = useAuth();


    // Verificar si el usuario tiene permisos limitados
    const tienePermisosLimitados = usuario?.permisos && usuario.permisos !== 'todos';

    // Si el usuario tiene permisos limitados, no mostrar nada
    if (tienePermisosLimitados) {
        return null; // No renderizar nada
    }

    // Mueve la definición de seleccionados y bloquearOtros aquí
    const seleccionados = watch("tiposDeNotaSeleccionadas");
    const seleccionadosStr = typeof seleccionados === 'string' ? seleccionados : '';
    const bloquearOtros = seleccionadosStr.toLowerCase().replace(/[\s\-]/g, '') === "gastro-destinos".replace(/[\s\-]/g, '').toLowerCase();

    return (
        <div className="grid grid-cols-5 gap-4 justify-center">
            {/* Solo muestra el campo de tipo de nota si ocultarTipoNota es falso */}
            {!ocultarTipoNota && (
                <div className="p-1 border-1 border-gray-300 rounded-md">
                    <p className="mb-2 text-xl leading-5 font-bold">Tipo de Nota</p>
                    <Controller
                        name="tiposDeNotaSeleccionadas"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <>
                                {tipoDeNota.map((opcion, idx) => (
                                    <label key={idx} className="block mb-1 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="radio"
                                            value={opcion.nombre}
                                            checked={field.value === opcion.nombre}
                                            onClick={() => {
                                                // Si ya está seleccionado, deselecciona
                                                if (field.value === opcion.nombre) {
                                                    field.onChange('');
                                                }
                                            }}
                                            onChange={() => {
                                                if (field.value !== opcion.nombre) {
                                                    field.onChange(opcion.nombre);
                                                }
                                            }}
                                            className="mr-2"
                                        />
                                        {opcion.nombre}
                                    </label>
                                ))}
                                <div className="text-xs text-gray-500 mt-2">
                                    Selecciona solo un tipo de nota.
                                </div>
                            </>
                        )}
                    />
                </div>
            )}

            {/* Mostrar las categorías */}
            {secciones.map((seccion) => {
                const isZona = seccion.seccion === "Zona";

                return (
                    <div key={seccion.seccion} className="p-1 border-1 border-gray-300 rounded-md">
                        <h2 className="mb-2 text-xl leading-5 font-bold">{seccion.seccion}</h2>
                        {seccion.categorias.map((categoria) => (
                            <label
                                key={`${seccion.seccion}-${categoria.nombre}`}
                                className="block mb-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                                {isZona ? (
                                    // Lógica para Zonas (Checkbox / Multi-select)
                                    <Controller
                                        name="zonas"
                                        control={control}
                                        render={({ field }) => {
                                            const isChecked = Array.isArray(field.value) && field.value.includes(categoria.nombre);
                                            return (
                                                <input
                                                    type="checkbox"
                                                    value={categoria.nombre}
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
                                            );
                                        }}
                                    />
                                ) : (
                                    // Lógica para otras secciones (Radio / Single-select)
                                    <Controller
                                        name={`categoriasSeleccionadas.${seccion.seccion}`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="radio"
                                                value={categoria.nombre}
                                                checked={field.value === categoria.nombre}
                                                disabled={bloquearOtros}
                                                onClick={() => {
                                                    if (field.value === categoria.nombre) {
                                                        field.onChange("");
                                                    }
                                                }}
                                                onChange={() => {
                                                    if (field.value !== categoria.nombre) {
                                                        field.onChange(categoria.nombre);
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                        )}
                                    />
                                )}
                                {categoria.nombre}
                            </label>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default CategoriasTipoNotaSelector;