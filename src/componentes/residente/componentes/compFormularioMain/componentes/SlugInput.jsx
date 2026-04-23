import { useFormContext } from "react-hook-form";
import { useState } from "react";

const generarSlug = (texto) => {
  if (!texto) return "";
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const SlugInput = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const slugValue = watch("slug") || "";
  const titulo = watch("titulo") || "";
  const [editadoManual, setEditadoManual] = useState(false);

  const handleGenerarDesdeTitulo = () => {
    const slugGenerado = generarSlug(titulo);
    setValue("slug", slugGenerado);
    setEditadoManual(true);
  };

  const handleChange = (e) => {
    const valor = generarSlug(e.target.value);
    setValue("slug", valor);
    setEditadoManual(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">
          Slug (URL)
        </label>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs ${
              slugValue.length >= 180
                ? "text-red-500 font-bold"
                : "text-gray-400"
            }`}
          >
            {slugValue.length}/200
          </span>
          <button
            type="button"
            onClick={handleGenerarDesdeTitulo}
            disabled={!titulo}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Generar desde titulo
          </button>
        </div>
      </div>
      <div className="flex items-center gap-0">
        <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm text-gray-500 select-none">
          residente.mx/notas/
        </span>
        <input
          type="text"
          placeholder="mi-slug-personalizado"
          maxLength={200}
          value={slugValue}
          onChange={handleChange}
          {...register("slug", {
            required: "El slug es obligatorio",
            maxLength: {
              value: 200,
              message: "El slug solo puede tener 200 caracteres",
            },
          })}
          className={`w-full px-3 py-2 border rounded-r-md bg-white ${
            errors.slug ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>
      {errors.slug && (
        <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
      )}
      {slugValue && (
        <p className="text-xs text-gray-400 mt-1">
          URL final: residente.mx/notas/{slugValue}
        </p>
      )}
      {!slugValue && (
        <p className="text-xs text-red-400 mt-1">
          Obligatorio. Usa "Generar desde titulo" o escribe uno manualmente.
        </p>
      )}
    </div>
  );
};

export default SlugInput;
