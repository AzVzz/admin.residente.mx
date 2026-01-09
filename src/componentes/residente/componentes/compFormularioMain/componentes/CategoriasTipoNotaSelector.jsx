import { Controller, useFormContext } from "react-hook-form";
import { useAuth } from "../../../../Context";

// Opciones especiales para Food & Drink (Tipo de comida)
const opcionesFoodDrinkTipoComida = [
  { nombre: "Postres" },
  { nombre: "Cafés" },
  { nombre: "Bares" },
  { nombre: "Snacks" },
];

const CategoriasTipoNotaSelector = ({
  tipoDeNota,
  secciones,
  ocultarTipoNota,
}) => {
  const { control, watch } = useFormContext();
  const { usuario } = useAuth();

  // Detectar tipo de nota seleccionada
  const tipoNotaSeleccionada = watch("tiposDeNotaSeleccionadas");
  const esFoodDrink = tipoNotaSeleccionada === "Food & Drink";

  // Mueve la definición de seleccionados y bloquearOtros aquí
  const seleccionados = watch("tiposDeNotaSeleccionadas");
  const seleccionadosStr =
    typeof seleccionados === "string" ? seleccionados : "";
  const bloquearOtros =
    seleccionadosStr.toLowerCase().replace(/[\s\-]/g, "") ===
    "gastro-destinos".replace(/[\s\-]/g, "").toLowerCase();

  // Ocultar si el usuario es invitado
  const esInvitado = usuario?.rol === "invitado";

  // Si es invitado, no mostrar nada
  if (esInvitado) {
    return null;
  }

  // Filtrar secciones según tipo de nota
  // Si es Food & Drink: solo mostrar Zona y Tipo de comida
  // Si es otro tipo: mostrar todas las secciones
  const seccionesFiltradas = esFoodDrink
    ? secciones.filter(
      (s) => s.seccion === "Zona" || s.seccion === "Tipo de comida"
    )
    : secciones;

  return (
    <div className="grid grid-cols-5 gap-2 justify-center mb-6 pb-4">
      {/* Solo muestra el campo de tipo de nota si ocultarTipoNota es falso */}
      {!ocultarTipoNota && (
        <div className="p-1 border border-gray-200 rounded-md bg-white flex flex-col h-full">
          <p className="mb-2 text-lg font-bold bg-gray-100 p-1 text-center rounded text-gray-700">
            Tipo de Nota
          </p>
          <div className="flex-1 overflow-y-auto max-h-96 px-1">
            <Controller
              name="tiposDeNotaSeleccionadas"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <>
                  {tipoDeNota.map((opcion, idx) => (
                    <label
                      key={idx}
                      className="block mb-1 cursor-pointer hover:bg-gray-50 p-1 rounded text-sm"
                    >
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
                          if (field.value !== opcion.nombre) {
                            field.onChange(opcion.nombre);
                          }
                        }}
                        className="mr-1.5 align-middle"
                      />
                      <span className="align-middle">{opcion.nombre}</span>
                    </label>
                  ))}
                  <div className="text-xs text-gray-400 mt-2 italic text-center">
                    Selecciona una.
                  </div>
                </>
              )}
            />
          </div>
        </div>
      )}

      {/* Mostrar las categorías filtradas según tipo de nota */}
      {seccionesFiltradas.map((seccion) => {
        const isZona = seccion.seccion === "Zona";

        // Si es Food & Drink y es "Tipo de comida", usar opciones especiales
        const categoriasAMostrar =
          esFoodDrink && seccion.seccion === "Tipo de comida"
            ? opcionesFoodDrinkTipoComida
            : seccion.categorias;

        return (
          <div
            key={seccion.seccion}
            className="p-1 border border-gray-200 rounded-md bg-white flex flex-col h-full"
          >
            <h2 className="mb-2 text-lg font-bold bg-gray-100 p-1 text-center rounded text-gray-700">
              {seccion.seccion}
              {esFoodDrink && seccion.seccion === "Tipo de comida" && (
                <span className="text-xs font-normal text-blue-500 block">
                  (Food & Drink)
                </span>
              )}
            </h2>
            <div className="flex-1 overflow-y-auto max-h-96 px-1">
              {categoriasAMostrar.map((categoria) => (
                <label
                  key={`${seccion.seccion}-${categoria.nombre}`}
                  className="block mb-1 cursor-pointer hover:bg-gray-50 p-1 rounded text-sm"
                >
                  {isZona ? (
                    // Lógica para Zonas (Checkbox / Multi-select)
                    <Controller
                      name="zonas"
                      control={control}
                      render={({ field }) => {
                        const isChecked =
                          Array.isArray(field.value) &&
                          field.value.includes(categoria.nombre);
                        return (
                          <input
                            type="checkbox"
                            value={categoria.nombre}
                            checked={isChecked}
                            onChange={(e) => {
                              const value = e.target.value;
                              const currentValues = Array.isArray(field.value)
                                ? field.value
                                : [];
                              if (e.target.checked) {
                                field.onChange([...currentValues, value]);
                              } else {
                                field.onChange(
                                  currentValues.filter((v) => v !== value)
                                );
                              }
                            }}
                            className="mr-1.5 align-middle"
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
                          className="mr-1.5 align-middle"
                        />
                      )}
                    />
                  )}
                  <span className="align-middle">{categoria.nombre}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoriasTipoNotaSelector;

