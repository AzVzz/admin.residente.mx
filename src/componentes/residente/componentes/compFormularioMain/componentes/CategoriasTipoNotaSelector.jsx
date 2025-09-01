import { Controller, useFormContext } from 'react-hook-form';
import { useAuth } from '../../../../Context';

const CategoriasTipoNotaSelector = ({ tipoDeNota, secciones, ocultarTipoNota }) => {
    const { control } = useFormContext();
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
                    {tipoDeNota.map((opcion, idx) => (
                        <label key={idx} className="block mb-1">
                            <Controller
                                name="tipoDeNotaSeleccionada"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="radio"
                                        value={opcion.nombre}
                                        checked={field.value === opcion.nombre}
                                        onClick={() => {
                                            // Si ya está seleccionado, deselecciona
                                            if (field.value === opcion.nombre) {
                                                field.onChange("");
                                            }
                                        }}
                                        onChange={() => {
                                            // Solo selecciona si no está seleccionado
                                            if (field.value !== opcion.nombre) {
                                                field.onChange(opcion.nombre);
                                            }
                                        }}
                                        className="mr-1"
                                    />
                                )}
                            />
                            {opcion.nombre}
                        </label>
                    ))}
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