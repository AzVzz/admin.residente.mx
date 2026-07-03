import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useAuth } from "../../../../Context";

const Autor = () => {
  const { usuario } = useAuth();
  const { register, getValues, setValue, watch } = useFormContext();
  const yaPrellenado = useRef(false);
  const autorValue = watch("autor") || "";

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
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">Autor</label>
        <span className="text-xs text-gray-400">{autorValue.length}/60</span>
      </div>
      <input
        type="text"
        maxLength={60}
        placeholder="Nombre del autor"
        {...register("autor")}
        className="w-full px-3 py-2 border rounded-md bg-white border-gray-300"
      />
    </div>
  );
};

export default Autor;
