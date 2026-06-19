import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useAuth } from "../../../../Context";

const Autor = () => {
  const { usuario } = useAuth();
  const { register, watch, setValue } = useFormContext();
  const autorActual = watch("autor");

  // Prellenar con el usuario logueado solo si el campo está vacío (nota nueva).
  // Al editar, el valor ya viene del reset() y no se sobreescribe.
  useEffect(() => {
    if (!autorActual && usuario?.nombre_usuario) {
      setValue("autor", usuario.nombre_usuario);
    }
  }, [autorActual, usuario, setValue]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Autor</label>
      <input
        type="text"
        maxLength={60}
        placeholder="Nombre del autor"
        {...register("autor")}
        className="w-full px-3 py-2 border border-gray-300 rounded-md font-roman focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default Autor;
