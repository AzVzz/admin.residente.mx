import { Iconografia } from "../../../../utils/Iconografia.jsx";

// Selector de stickers EXCLUSIVO de la nota (Nueva Nota / Editar Nota).
// Es una copia independiente de FormularioPromoExt para poder rediseñarlo
// sin afectar cupones/descuentos, eventos ni 100 estrellas.
const StickersNotaSelector = ({
  onStickerSelect,
  stickerSeleccionado,
  maxStickers = 2,
}) => {
  const isSelected = (clave) =>
    Array.isArray(stickerSeleccionado) && stickerSeleccionado.includes(clave);

  const handleStickerClick = (clave) => {
    let currentSelection = Array.isArray(stickerSeleccionado)
      ? [...stickerSeleccionado]
      : [];

    if (currentSelection.includes(clave)) {
      currentSelection = currentSelection.filter((c) => c !== clave);
    } else {
      if (currentSelection.length < maxStickers) {
        currentSelection.push(clave);
      } else {
        currentSelection = [...currentSelection.slice(1), clave];
      }
    }
    onStickerSelect(currentSelection);
  };

  const seleccionados = Array.isArray(stickerSeleccionado)
    ? stickerSeleccionado.length
    : 0;
  const faltan = maxStickers - seleccionados;
  const noIconSelected = faltan > 0;

  return (
    <div>
      <div className="bg-white p-5 rounded-xl border border-gray-300">
        <div className="flex flex-col pb-5">
          <div className="flex items-center gap-3 mb-1 pb-4">
            <label className="text-lg font-medium text-gray-700">
              Selecciona {maxStickers}{" "}
              {maxStickers === 1 ? "sticker" : "stickers"}*
            </label>
            {noIconSelected && (
              <p className="text-red-500 text-lg">
                ⚠️ Falta{faltan === 1 ? "" : "n"} {faltan} ícono
                {faltan === 1 ? "" : "s"} por elegir
              </p>
            )}
          </div>
          <div className="flex items-start gap-4">
            <h4 className="w-18 shrink-0 text-md font-medium text-gray-600 break-words">
              Lo dice la crítica
            </h4>
            <div className="flex flex-1 flex-wrap gap-6 items-center">
            {Iconografia.categorias.map((categoria) => (
              <div
                key={categoria.clave}
                className="group relative flex flex-col justify-center items-center"
              >
                <img
                  src={categoria.icono}
                  onClick={() => handleStickerClick(categoria.clave)}
                  className={`w-12 h-12 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)] ${
                    isSelected(categoria.clave)
                      ? "ring-4 ring-black rounded-full"
                      : ""
                  }`}
                  alt={categoria.nombre}
                />
                <p className="pointer-events-none absolute top-full mt-1 whitespace-nowrap rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-10">
                  {categoria.nombre}
                </p>
              </div>
            ))}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4 pb-5">
          <h4 className="w-18 shrink-0 text-md font-medium text-gray-600 break-words">
            Ocasión
          </h4>
          <div className="flex flex-1 flex-wrap gap-6 items-center">
            {Iconografia.ocasiones.map((ocasion) => (
              <div
                key={ocasion.clave}
                className="group relative flex flex-col justify-center items-center"
              >
                <img
                  src={ocasion.icono}
                  onClick={() => handleStickerClick(ocasion.clave)}
                  className={`w-12 h-12 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)] ${
                    isSelected(ocasion.clave)
                      ? "ring-4 ring-black rounded-full"
                      : ""
                  }`}
                  alt={ocasion.nombre}
                />
                <p className="pointer-events-none absolute top-full mt-1 whitespace-nowrap rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-10">
                  {ocasion.nombre}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-4">
          <h4 className="w-18 shrink-0 text-md font-medium text-gray-600 break-words">
            Por zona
          </h4>
          <div className="flex flex-1 flex-wrap gap-6 items-center">
            {Iconografia.zonas.map((zona) => (
              <div
                key={zona.clave}
                className="group relative flex flex-col justify-center items-center"
              >
                <img
                  src={zona.icono}
                  onClick={() => handleStickerClick(zona.clave)}
                  className={`w-12 h-12 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)] ${
                    isSelected(zona.clave)
                      ? "ring-4 ring-black rounded-full"
                      : ""
                  }`}
                  alt={zona.nombre}
                />
                <p className="pointer-events-none absolute top-full mt-1 whitespace-nowrap rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-10">
                  {zona.nombre}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickersNotaSelector;
