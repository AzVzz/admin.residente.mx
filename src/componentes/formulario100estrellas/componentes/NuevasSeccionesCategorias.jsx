import { useFormContext } from 'react-hook-form';
import { useJsonData } from '../../../componentes/api/SeccionesDataFetcher.jsx';

const NuevasSeccionesCategorias = () => {
  const { data, loading, error } = useJsonData();
  const { register, formState: { errors }, watch, setValue } = useFormContext();

  // Detectar si es Food & Drink para ocultar ciertas secciones
  const tipoLugar = watch("tipo_lugar") || "";
  const esFoodDrink = tipoLugar === "Food & Drink";

  // Secciones a ocultar siempre (la sección Food & Drink se maneja en TipoLugar)
  const seccionesOcultas = ["Food & Drink"];
  // Si es Food & Drink, ocultar también Nivel de gasto y Tipo de comida
  if (esFoodDrink) {
    seccionesOcultas.push("Nivel de gasto", "Tipo de comida");
  }

  if (loading) return <p>Cargando opciones...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="categorias">
      <fieldset>
        <legend>Secciones y Categorías *</legend>

        {data?.filter((seccion) => {
          const seccionName = (seccion.seccion || '').trim();
          // Filtrar secciones ocultas
          return !seccionesOcultas.includes(seccionName);
        }).map((seccion) => {
          const seccionName = (seccion.seccion || '').trim();
          const isZona = seccionName === 'Zona';
          const isExperiencia = seccionName === 'Experiencia';

          return (
            <div key={seccionName} className="mb-6">
              <h3 className="font-bold text-lg mb-3">{seccionName}</h3>

              <div className="flex flex-wrap gap-3">
                {seccion.categorias.map((categoria) => {
                  const fieldName = `secciones_categorias.${seccionName}`;

                  // ----- RADIOS: Nivel de gasto / Tipo de comida / Experiencia
                  if (!isZona) {
                    // Solo estas dos secciones son obligatorias
                    const esRequerida =
                      seccionName === 'Nivel de gasto';

                    const rules = esRequerida
                      ? {
                        required: `Debes seleccionar una categoría para ${seccionName}`,
                      }
                      : {}; // Experiencia = opcional

                    return (
                      <div key={categoria.nombre} className="flex items-center">
                        <input
                          type="radio"
                          id={`${seccionName}-${categoria.nombre}`}
                          value={categoria.nombre}
                          {...register(fieldName, rules)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          onClick={() => {
                            const currentVal = watch(fieldName);
                            // toggle: si haces click de nuevo, limpia
                            if (currentVal === categoria.nombre) {
                              setValue(fieldName, '');
                            }
                          }}
                        />
                        <label
                          htmlFor={`${seccionName}-${categoria.nombre}`}
                          className="ml-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                        >
                          {categoria.nombre}
                        </label>
                      </div>
                    );
                  }

                  // ----- ZONA: checkbox múltiple obligatorio -----
                  return (
                    <div key={categoria.nombre} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${seccionName}-${categoria.nombre}`}
                        value={categoria.nombre}
                        {...register(fieldName, {
                          validate: (value) =>
                            Array.isArray(value) && value.length > 0
                              ? true
                              : 'Debes seleccionar al menos una zona',
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`${seccionName}-${categoria.nombre}`}
                        className="ml-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                      >
                        {categoria.nombre}
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* No mostramos errores para Experiencia */}
              {!isExperiencia &&
                errors.secciones_categorias?.[seccionName] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.secciones_categorias[seccionName].message}
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