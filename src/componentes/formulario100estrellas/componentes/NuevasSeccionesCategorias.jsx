import { useFormContext } from 'react-hook-form';
import { useJsonData } from '../../../componentes/api/SeccionesDataFetcher.jsx';

const NuevasSeccionesCategorias = () => {
  const { data, loading, error } = useJsonData();
  const { register, formState: { errors }, watch, setValue } = useFormContext();

  if (loading) return <p>Cargando opciones...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="categorias">
      <fieldset>
        <legend>Secciones y Categorías *</legend>

        {data?.map((seccion) => {
          const isZona = seccion.seccion === "Zona";

          return (
            <div key={seccion.seccion} className="mb-6">
              <h3 className="font-bold text-lg mb-3">{seccion.seccion}</h3>

              <div className="flex flex-wrap gap-3">
                {seccion.categorias.map((categoria) => {
                  const fieldName = `secciones_categorias.${seccion.seccion}`;

                  // Para radios (Nivel de gasto, Tipo de comida, Experiencia)
                  if (!isZona) {
                    return (
                      <div key={categoria.nombre} className="flex items-center">
                        <input
                          type="radio"
                          id={`${seccion.seccion}-${categoria.nombre}`}
                          value={categoria.nombre}
                          {...register(fieldName, {
                            required: `Debes seleccionar una categoría para ${seccion.seccion}`,
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          onClick={() => {
                            const currentVal = watch(fieldName);
                            // Permitir deseleccionar si vuelves a hacer click
                            if (currentVal === categoria.nombre) {
                              setValue(fieldName, "");
                            }
                          }}
                        />
                        <label
                          htmlFor={`${seccion.seccion}-${categoria.nombre}`}
                          className="ml-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          {categoria.nombre}
                        </label>
                      </div>
                    );
                  }

                  // Para ZONA → múltiples opciones (checkbox)
                  return (
                    <div key={categoria.nombre} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${seccion.seccion}-${categoria.nombre}`}
                        value={categoria.nombre}
                        {...register(fieldName, {
                          validate: (value) =>
                            Array.isArray(value) && value.length > 0
                              ? true
                              : "Debes seleccionar al menos una zona",
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`${seccion.seccion}-${categoria.nombre}`}
                        className="ml-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                      >
                        {categoria.nombre}
                      </label>
                    </div>
                  );
                })}
              </div>

              {errors.secciones_categorias?.[seccion.seccion] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.secciones_categorias[seccion.seccion].message}
                </p>
              )}
            </div>
          );
        })}
      </fieldset>
    </div>
  );
};

export default NuevasSeccionesCategorias;
