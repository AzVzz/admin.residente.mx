import { useFormContext, useWatch } from "react-hook-form";
import { useAuth } from "../../../../Context";

const NombreRestaurante = () => {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();
  const { usuario } = useAuth();
  const tipos = useWatch({ control, name: "tiposDeNotaSeleccionadas" }) || "";
  const destacada = useWatch({ control, name: "destacada" });
  const nombreRestaurante = watch("nombre_restaurante") || "";

  // Ocultar si el usuario es invitado
  if (usuario?.rol === "invitado") {
    return null;
  }

  // Solo mostrar si es Restaurantes o Food & Drink Y está marcada como destacada
  {
    /*if (
        !(tipos === "Restaurantes" || tipos === "Food & Drink") ||
        !destacada
    ) return null;*/
  }

  // Limitar el campo y mostrar contador
  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length > 22) {
      setValue("nombre_restaurante", value.slice(0, 22));
    }
  };

  return (
    <div className="mb-4 pb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Nombre del restaurante
      </label>
      <input
        type="text"
        maxLength={22}
        value={nombreRestaurante}
        onChange={handleChange}
        {...register("nombre_restaurante", {
          maxLength: {
            value: 22,
            message: "El nombre solo puede tener 22 caracteres",
          },
        })}
        placeholder="Ej. Taquería El Güero"
        className={`mt-1 block w-full rounded-lg border px-3 py-2 focus:border-indigo-500 bg-white ${
          errors.nombre_restaurante ? "border-red-500" : "border-gray-300"
        }`}
      />
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-gray-500">
          {nombreRestaurante.length}/22
        </span>
        {errors.nombre_restaurante && (
          <p className="text-sm text-red-600">
            {errors.nombre_restaurante.message}
          </p>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        El nombre del restaurante se guardará siempre que lo llenes.
      </p>
    </div>
  );
};

export default NombreRestaurante;
