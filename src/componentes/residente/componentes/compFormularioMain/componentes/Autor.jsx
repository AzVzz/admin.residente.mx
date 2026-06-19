import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useAuth } from "../../../../Context";

const Autor = () => {
  const { usuario } = useAuth();
  const { register, getValues, setValue } = useFormContext();
  const yaPrellenado = useRef(false);

  // Prellenar con el usuario logueado SOLO una vez al montar y solo si el campo
  // está vacío (nota nueva). Después no se vuelve a tocar, así puedes borrar todo
  // y escribir el autor que quieras sin que se reescriba.
  useEffect(() => {
    if (yaPrellenado.current) return;
    if (!usuario?.nombre_usuario) return; // esperar a que cargue el usuario
    if (!getValues("autor")) {
      setValue("autor", usuario.nombre_usuario);
    }
    yaPrellenado.current = true;
  }, [usuario, getValues, setValue]);

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
