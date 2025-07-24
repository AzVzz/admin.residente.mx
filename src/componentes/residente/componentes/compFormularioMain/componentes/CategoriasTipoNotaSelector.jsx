import { Controller, useFormContext } from 'react-hook-form';

const CategoriasTipoNotaSelector = ({ tipoDeNota, secciones, ocultarTipoNota }) => {
    const { control } = useFormContext();

    return (
        <div className="grid grid-cols-5">
            {/* Solo muestra el campo de tipo de nota si ocultarTipoNota es falso */}
            {!ocultarTipoNota && (
                <div className="p-5 border-1">
                    <p className="mb-1 text-xl">Tipo de Nota</p>
                    {tipoDeNota.map((opcion, idx) => (
                        <label key={idx} className="block mb-2">
                            <Controller
                                name="tipoDeNotaSeleccionada"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="radio"
                                        value={opcion.nombre}
                                        checked={field.value === opcion.nombre}
                                        onChange={() => field.onChange(opcion.nombre)}
                                        className="mr-1"
                                    />
                                )}
                            />
                            {opcion.nombre}
                        </label>
                    ))}
                </div>
            )}

            {secciones.map((seccion) => (
                <div key={seccion.seccion} className="p-5 border-1">
                    <h2 className="font-bold mb-2 text-xl">{seccion.seccion}</h2>
                    {seccion.categorias.map((categoria) => (
                        <label
                            key={`${seccion.seccion}-${categoria.nombre}`}
                            className="block mb-1"
                        >
                            <Controller
                                name={`categoriasSeleccionadas.${seccion.seccion}`}
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="radio"
                                        value={categoria.nombre}
                                        checked={field.value === categoria.nombre}
                                        onChange={() => field.onChange(categoria.nombre)}
                                        className="mr-2"
                                    />
                                )}
                            />
                            {categoria.nombre}
                        </label>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default CategoriasTipoNotaSelector;