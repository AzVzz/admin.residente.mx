import { useFormContext } from "react-hook-form";

const OpcionesPublicacion = () => {
  const { register, watch } = useFormContext();
  const opcionSeleccionada = watch("opcionPublicacion");
  const fechaProgramada = watch("fechaProgramada");

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <label className="block text-sm font-medium text-gray-700">
        Opciones de Publicación
      </label>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="publicar-ahora"
            value="publicada"
            {...register("opcionPublicacion")}
            checked={opcionSeleccionada === "publicada"}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="publicar-ahora" className="text-sm text-gray-700 cursor-pointer">
            Publicar ahora
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="programar"
            value="programar"
            {...register("opcionPublicacion")}
            checked={opcionSeleccionada === "programar"}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="programar" className="text-sm text-gray-700 cursor-pointer">
            Programar publicación
          </label>
        </div>

        <div className="ml-6 space-y-2">
          <label htmlFor="fecha-programada" className="block text-xs text-gray-600">
            Fecha y hora de publicación
          </label>
          <input
            id="fecha-programada"
            type="datetime-local"
            {...register("fechaProgramada")}
            value={fechaProgramada}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={opcionSeleccionada !== "programar"}
            required={opcionSeleccionada === "programar"}
          />
        </div>
      </div>
    </div>
  );
};

export default OpcionesPublicacion;