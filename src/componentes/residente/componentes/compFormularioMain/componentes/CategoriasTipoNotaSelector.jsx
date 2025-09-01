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

    return (
        <div className="grid grid-cols-5">  
            {/* Solo muestra el campo de tipo de nota si ocultarTipoNota es falso */}
            {!ocultarTipoNota && (
                <div className="p-1 border-1 border-gray-300 rounded-md">
                    <p className="mb-2 text-xl leading-5">Tipo de Nota</p>
                    <Controller
                        name="tiposDeNotaSeleccionadas"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                            <>
                                {tipoDeNota.map((opcion, idx) => {
                                    const checked = field.value?.includes(opcion.nombre);
                                    return (
                                        <label key={idx} className="block mb-1">
                                            <input
                                                type="checkbox"
                                                value={opcion.nombre}
                                                checked={checked}
                                                onChange={e => {
                                                    let nuevos = Array.isArray(field.value) ? [...field.value] : [];
                                                    if (e.target.checked) {
                                                        if (nuevos.length < 2) {
                                                            nuevos.push(opcion.nombre);
                                                        }
                                                    } else {
                                                        nuevos = nuevos.filter(n => n !== opcion.nombre);
                                                    }
                                                    field.onChange(nuevos);
                                                }}
                                                className="mr-1"
                                            />
                                            {opcion.nombre}
                                        </label>
                                    );
                                })}
                                <div className="text-xs text-gray-500 mt-2">
                                    Selecciona máximo 2 tipos.
                                </div>
                            </>
                        )}
                    />
                </div>
            )}

            {/* Mostrar las categorías */}
            {secciones.map((seccion) => (
                <div key={seccion.seccion} className="p-1 border-1 border-gray-300 rounded-md">
                    <h2 className="mb-2 text-xl leading-5">{seccion.seccion}</h2>
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
                            {categoria.nombre}
                        </label>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default CategoriasTipoNotaSelector;