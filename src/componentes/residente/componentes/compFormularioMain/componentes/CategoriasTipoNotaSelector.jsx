import { Controller, useFormContext } from "react-hook-form";
import { useAuth } from "../../../../Context";

const opcionesOcasion = [
  { nombre: "Premium", aliases: ["TOP", "Fine Dining"] },
  { nombre: "Cadenas" },
  { nombre: "Casual" },
  { nombre: "Únicos" },
  { nombre: "Taquerías", aliases: ["Taquerías Icónicas"] },
  { nombre: "Cafés" },
  { nombre: "Mundo Dulce" },
  { nombre: "Antros y Bares" },
  { nombre: "Saludable" },
  { nombre: "Antojos" },
  { nombre: "Desayunos" },
  { nombre: "Hoteles" },
];

const zonasBase = [
  "Zona Tec", "Cumbres", "San Pedro", "Guadalupe",
  "Monterrey Centro", "Norte", "Carretera", "San Nicolás",
];
const zonasViajes = [
  "Nuevo León", "Austin", "San Antonio", "Valle",
  "SPI", "Laredo", "Rivera Maya", "Ciudad de México",
];

const CategoriasTipoNotaSelector = ({
  tipoDeNota,
  secciones,
  ocultarTipoNota,
}) => {
  const { control, watch, formState } = useFormContext();
  const { usuario } = useAuth();

  const etiquetas = [["Restaurantes", "Restaurantes"], ["Food & Drink", "Food & Drink"], ["Antojos", "Antojos"], ["B2B", "B2B"], ["Gastro Destinos", "Viajes"]];

  // Detectar tipo de nota seleccionada
  const tipoNotaSeleccionada = watch("tiposDeNotaSeleccionadas");
  const categoriasSeleccionadas = watch("categoriasSeleccionadas") || {};

  // Ocultar si el usuario es invitado
  const esInvitado = usuario?.rol === "invitado";

  // Si es invitado, no mostrar nada
  if (esInvitado) {
    return null;
  }

  // Secciones que NO queremos mostrar en el formulario
  const seccionesOcultas = [
    "Experiencia",
    "Food & Drink",
    "Cafetería", "Cafeteria", "Cafés", "Cafe", "Café", "Cafes",
    "Bar", "Bares",
    "Postrería", "Postreria", "Postres", "Postre",
    "Snack", "Snacks",
    "Bebidas", "Bebida"
  ];

  const zona = {
    seccion: "Zona",
    categorias: (["Viajes", "Gastro Destinos", "Gastro-Destinos"].includes(tipoNotaSeleccionada)
      ? [...zonasBase, ...zonasViajes]
      : zonasBase).map((nombre) => ({ nombre })),
  };
  const seccionesFiltradas = secciones.filter(
    ({ seccion }) => seccion.trim() !== "Zona" && !seccionesOcultas.includes(seccion.trim()),
  );
  seccionesFiltradas.splice(ocultarTipoNota ? 2 : 1, 0, zona);

  const esCategoriaAnterior = (seccion, categoria) => {
    const columna = seccionesFiltradas.find((item) => item.seccion === seccion);
    if (!columna || seccion === "Zona") return true;
    const opciones = seccion === "Nivel gastro" ? opcionesOcasion : columna.categorias;
    return !opciones.some((opcion) => opcion.nombre === categoria);
  };
  // Keep original options available so an unchecked legacy category can be restored.
  const categoriasAnteriores = Array.from(new Map(
    [formState.defaultValues?.categoriasSeleccionadas || {}, categoriasSeleccionadas]
      .flatMap((seleccionadas) => Object.entries(seleccionadas))
      .filter(([seccion, categoria]) => categoria && esCategoriaAnterior(seccion, categoria))
      .map(([seccion, categoria]) => [JSON.stringify([seccion, categoria]), { seccion, categoria }]),
  ).values());

  const categoriasParaMostrar = (() => {

    return Object.entries(categoriasSeleccionadas)
      .filter(([seccion, categoria]) =>
        Boolean(categoria) &&
        !["tipo de comida", "zona", "experiencia", "food & drink"].includes(
          seccion.trim().toLowerCase(),
        ),
      )
      .map(([seccion, categoria]) =>
        seccion === "Nivel gastro" && ["TOP", "Fine Dining"].includes(categoria)
          ? "Premium"
          : seccion === "Nivel gastro" && categoria === "Taquerías Icónicas" ? "Taquerías" : categoria,
      );
  })();

  return (
    <>
    <div className="grid grid-cols-5 gap-2 justify-center mb-3 pb-1">
      {/* Solo muestra el campo de tipo de nota si ocultarTipoNota es falso */}
      {!ocultarTipoNota && (
        <div className="p-1 border border-gray-200 rounded-md bg-white flex flex-col h-full">
          <p className="mb-2 text-lg font-bold bg-gray-100 p-1 text-center rounded text-gray-700">
            Etiqueta
          </p>
          <div className="flex-1 overflow-y-auto max-h-96 px-1">
            <Controller
              name="tiposDeNotaSeleccionadas"
              control={control}
              defaultValue=""
              render={({ field }) => {
                const renderOpcion = (opcion, etiqueta) => (
                  <label
                    key={opcion.nombre}
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
                    <span className="align-middle">{etiqueta}</span>
                  </label>
                );

                return (
                  <>
                    {etiquetas.map(([nombre, etiqueta]) => {
                      const opcion = etiqueta === "Viajes"
                        ? { nombre: "Viajes" }
                        : tipoDeNota.find((tipo) => tipo.nombre === nombre);
                      return opcion ? renderOpcion(opcion, etiqueta) : null;
                    })}

                    <div className="text-xs text-gray-400 mt-2 italic text-center">
                      Selecciona una.
                    </div>
                  </>
                );
              }}
            />
          </div>
        </div>
      )}

      {/* Mostrar las categorías filtradas según tipo de nota */}
      {seccionesFiltradas.map((seccion) => {
        const isZona = seccion.seccion === "Zona";
        const esOcasion = seccion.seccion === "Nivel gastro";
        const categorias = esOcasion ? opcionesOcasion : seccion.categorias;

        return (
          <div
            key={seccion.seccion}
            className="p-1 border border-gray-200 rounded-md bg-white flex flex-col h-full"
          >
            <h2 className="mb-2 text-lg font-bold bg-gray-100 p-1 text-center rounded text-gray-700">
              {esOcasion ? "Ocasión" : seccion.seccion}
            </h2>
            <div className="flex-1 overflow-y-auto max-h-96 px-1">
              {categorias.map((categoria) => (
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
                          checked={field.value === categoria.nombre || categoria.aliases?.includes(field.value) === true}
                          onClick={() => {
                            if (field.value === categoria.nombre || categoria.aliases?.includes(field.value)) {
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
                  <span className="align-middle">{categoria.etiqueta || categoria.nombre}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    <section
      className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800"
      aria-live="polite"
      aria-labelledby="destino-publicacion-titulo"
    >
      <h3 id="destino-publicacion-titulo" className="font-bold text-gray-900">
        ¿Dónde saldrá esta nota?
      </h3>
      <p className="mt-1 text-gray-700">
        Así quedaría clasificada con lo que elegiste arriba:
      </p>

      <p className="mt-3">
        <span className="font-semibold">
          Categoría:
        </span>{" "}
        {categoriasParaMostrar.length > 0
          ? categoriasParaMostrar.join(", ")
          : <span className="text-gray-600">Sin categoría seleccionada</span>}
      </p>
      {categoriasAnteriores.length > 0 && (
        <fieldset className="mt-4 border-t border-gray-200 pt-3">
          <legend className="font-semibold">Categorías anteriores</legend>
          <p className="mb-2 text-gray-600">
            Desmarca las que quieras quitar de esta nota y guarda los cambios.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {categoriasAnteriores.map(({ seccion, categoria }) => (
              <Controller
                key={JSON.stringify([seccion, categoria])}
                name={`categoriasSeleccionadas.${seccion}`}
                control={control}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value === categoria}
                      onChange={(event) => field.onChange(event.target.checked ? categoria : "")}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                    <span>{categoria} <span className="text-xs text-gray-500">({seccion})</span></span>
                  </label>
                )}
              />
            ))}
          </div>
        </fieldset>
      )}
    </section>
    </>
  );
};

export default CategoriasTipoNotaSelector;

