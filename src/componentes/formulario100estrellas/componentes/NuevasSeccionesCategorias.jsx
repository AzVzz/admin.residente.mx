import { useFormContext } from 'react-hook-form';
import { useJsonData } from '../../../componentes/api/SeccionesDataFetcher.jsx';

const NuevasSeccionesCategorias = () => {
  const { data, loading, error } = useJsonData();
  const { register, formState: { errors }, watch, setValue } = useFormContext();

  // Detectar tipo de lugar para ajustar validaciones
  const tipoLugar = watch("tipo_lugar") || "";
  const esFoodDrink = tipoLugar === "Food & Drink";
  const esHotel = tipoLugar === "Hotel";

  // Secciones a ocultar SIEMPRE de la lista principal
  const seccionesOcultas = [
    "Food & Drink",
    "Cafetería", "Cafeteria", "Cafés", "Cafe", "Café", "Cafes",
    "Bar", "Bares",
    "Postrería", "Postreria", "Postres", "Postre",
    "Snack", "Snacks",
    "Bebidas", "Bebida"
  ];

  // Si es Food & Drink, ocultar también Nivel de gasto y Tipo de comida
  if (esFoodDrink) {
    seccionesOcultas.push("Nivel de gasto", "Tipo de comida");
  }

  if (loading) return <p>Cargando opciones...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="categorias">
      <fieldset>
        <legend>Secciones y Categorías {esHotel ? '' : '*'}</legend>

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
              <h3 className="font-bold text-lg mb-3">
                {seccionName}
                {esHotel && <span className="text-gray-400 text-sm font-normal ml-2">(opcional)</span>}
              </h3>

              <div className="flex flex-wrap gap-3">
                {seccion.categorias.map((categoria) => {
                  const fieldName = `secciones_categorias.${seccionName}`;

                  // ----- RADIOS: Nivel de gasto / Tipo de comida / Experiencia
                  if (!isZona) {
                    // Si es Hotel, todo es opcional
                    // Si no, solo "Nivel de gasto" es obligatorio
                    const esRequerida =
                      !esHotel && seccionName === 'Nivel de gasto';

                    const rules = esRequerida
                      ? {
                        required: `Debes seleccionar una categoría para ${seccionName}`,
                      }
                      : {}; // Hotel y Experiencia = opcional

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

                  // ----- ZONA: checkbox múltiple -----
                  // Si es Hotel, zona es opcional; si no, es obligatorio
                  const zonaRules = esHotel
                    ? {}
                    : {
                      validate: (value) => {
                        if (Array.isArray(value)) return value.length > 0 || 'Debes seleccionar al menos una zona';
                        if (typeof value === 'string') return value.length > 0 || 'Debes seleccionar al menos una zona';
                        if (value === true) return true;
                        return 'Debes seleccionar al menos una zona';
                      }
                    };

                  return (
                    <div key={categoria.nombre} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${seccionName}-${categoria.nombre}`}
                        value={categoria.nombre}
                        {...register(fieldName, zonaRules)}
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

              {/* No mostramos errores para Experiencia ni cuando es Hotel */}
              {!isExperiencia && !esHotel &&
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