import { Iconografia } from "../../../componentes/utils/Iconografia.jsx";

const FormularioPromoExt = ({
  onStickerSelect,
  stickerSeleccionado,
  maxStickers = 1,
}) => {
  const isSelected = (clave) =>
    Array.isArray(stickerSeleccionado) && stickerSeleccionado.includes(clave);

  const handleStickerClick = (clave) => {
    let currentSelection = Array.isArray(stickerSeleccionado)
      ? [...stickerSeleccionado]
      : [];

    if (currentSelection.includes(clave)) {
      // Deselecciona si ya está seleccionado
      currentSelection = currentSelection.filter((c) => c !== clave);
    } else {
      if (currentSelection.length < maxStickers) {
        currentSelection.push(clave);
      } else {
        // Si ya tienes el máximo, reemplaza el primero por el nuevo
        currentSelection = [...currentSelection.slice(1), clave];
      }
    }
    onStickerSelect(currentSelection);
  };

  // Verificar si no hay ícono seleccionado
  const noIconSelected =
    !stickerSeleccionado || stickerSeleccionado.length === 0;

  return (
    <div>
      <div className="bg-white p-5 rounded-xl border border-gray-300">
        <div className="flex flex-col pb-5">
          <label className="block text-lg font-medium text-gray-700 mb-1 pb-4">
            Selecciona 2 stickers*
          </label>
          {/* Mensaje de error */}
          {noIconSelected && (
            <p className="text-red-500 text-lg mb-2">⚠️ Falta ícono a elegir</p>
          )}
          <h4 className="pb-2 text-md font-medium text-gray-600">
            Lo dice la crítica
          </h4>
          <div className="flex flex-wrap justify-center gap-6 w-full h-auto rounded-full items-center">
            {Iconografia.categorias.map((categoria) => (
              <div
                key={categoria.clave}
                className="flex flex-col justify-center items-center"
              >
                {" "}
                {/* Usa clave como key si es única */}
                <img
                  src={categoria.icono}
                  onClick={() => handleStickerClick(categoria.clave)} // Llama a la nueva función
                  className={`w-20 h-20 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)] ${
                    isSelected(categoria.clave)
                      ? "ring-4 ring-black rounded-full"
                      : ""
                  }`}
                  alt={categoria.nombre}
                />
                <p className="text-sm text-gray-500 mt-1">{categoria.nombre}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Sección de stickers para ocasiones y zonas */}
        <div className="flex flex-col pb-5">
          <h4 className="pb-2 text-md font-medium text-gray-600">Ocasión</h4>
          <div className="flex flex-wrap justify-center gap-6 w-full h-auto items-center">
            {Iconografia.ocasiones.map((ocasion) => (
              <div
                key={ocasion.clave}
                className="flex flex-col justify-center items-center"
              >
                <img
                  src={ocasion.icono}
                  onClick={() => handleStickerClick(ocasion.clave)}
                  className={`w-20 h-20 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)] ${
                    isSelected(ocasion.clave)
                      ? "ring-4 ring-black rounded-full"
                      : ""
                  }`}
                  alt={ocasion.nombre}
                />
                <p className="text-sm text-gray-500 mt-1">{ocasion.nombre}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <h4 className="pb-2 text-md font-medium text-gray-600">Por zona</h4>
          <div className="flex flex-wrap justify-center gap-6 w-full h-auto items-center">
            {Iconografia.zonas.map((zona) => (
              <div
                key={zona.clave}
                className="flex flex-col justify-center items-center"
              >
                <img
                  src={zona.icono}
                  onClick={() => handleStickerClick(zona.clave)}
                  className={`w-20 h-20 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)] ${
                    isSelected(zona.clave)
                      ? "ring-4 ring-black rounded-full"
                      : ""
                  }`}
                  alt={zona.nombre}
                />
                <p className="text-sm text-gray-500 mt-1">{zona.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioPromoExt;
