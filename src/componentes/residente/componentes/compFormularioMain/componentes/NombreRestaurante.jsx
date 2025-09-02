import { useFormContext, useWatch } from "react-hook-form";

const NombreRestaurante = () => {
    const { register, control } = useFormContext();
    const tipos = useWatch({ control, name: "tiposDeNotaSeleccionadas" }) || [];
    const destacada = useWatch({ control, name: "destacada" });

    // Solo mostrar si es Restaurantes o Food & Drink Y está marcada como destacada
    if (
        !(tipos.includes("Restaurantes") || tipos.includes("Food & Drink")) ||
        !destacada
    ) return null;

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del restaurante
            </label>
            <input
                type="text"
                {...register("nombre_restaurante")}
                placeholder="Ej. Taquería El Güero"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
                Se guardará solo si la nota está marcada como <b>destacada</b>.
            </p>
        </div>
    );
};

export default NombreRestaurante;