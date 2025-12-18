// src/componentes/residente/componentes/compFormularioMain/componentes/Titulo.jsx
import { useFormContext } from "react-hook-form";

const Titulo = () => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();
  const tituloValue = watch("titulo") || "";

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length > 165) {
      setValue("titulo", value.slice(0, 165));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">
          Título *
        </label>
        <span
          className={`text-xs ${
            tituloValue.length >= 165
              ? "text-red-500 font-bold"
              : tituloValue.length >= 148
              ? "text-amber-500"
              : "text-gray-400"
          }`}
        >
          {tituloValue.length}/165
        </span>
      </div>
      <input
        type="text"
        placeholder="Agrega el título"
        maxLength={165}
        value={tituloValue}
        onChange={handleChange}
        {...register("titulo", {
          maxLength: {
            value: 165,
            message: "El título solo puede tener 165 caracteres",
          },
        })}
        className={`w-full px-3 py-2 border rounded-md bg-white ${
          errors.titulo ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.titulo && (
        <p className="text-sm text-red-600 mt-1">{errors.titulo.message}</p>
      )}
    </div>
  );
};

export default Titulo;
