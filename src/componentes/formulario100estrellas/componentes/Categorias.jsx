import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react'

const Categorias = () => {

    const { register, watch, setValue, formState: { errors } } = useFormContext();

    // Obtener el valor actual del campo
    const categoriaActual = watch("categoria") || "";

    // Normalizar valores para comparación (a minúsculas sin acentos)
    const normalize = (str) => {
        return str
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .trim();
    };

    const categorias = [
        { value: "Top of the top" },
        { value: "Favoritos del público" },
        { value: "Los más frecuentados" },
        { value: "Favoritos de la crítica" },
        { value: "Valor por tu dinero" },
        { value: "La mejor experiencia" },
        { value: "Genuino" },
        { value: "Icónicos" },
        { value: "Innovadores" },
        { value: "Joyas ocultas" },
        { value: "Para ver y ser vistos" },
        { value: "Rey de colonia" },
        { value: "Desayunos" },
        { value: "En pareja" },
        //{ value: "Negocios" },
        //{ value: "Saludable" },
        { value: "Clásicos regiomontanos" },

        //{ value: "Mexicano" },
        //{ value: "Oriental" },
        //{ value: "Comfort food" },
        //{ value: "Mariscos" },
        //{ value: "Tacos" },
        //{ value: "Italiano & Pizza" },
    ];

    // Normalizar el valor al cargar/actualizar
    useEffect(() => {
        if (categoriaActual) {
            // Buscar coincidencia normalizada
            const categoriaNormalizada = categorias.find(
                cat => normalize(cat.value) === normalize(categoriaActual)
            )?.value || categoriaActual;

            // Actualizar si es necesario
            if (categoriaNormalizada !== categoriaActual) {
                setValue("categoria", categoriaNormalizada);
            }
        }
    }, [categoriaActual, setValue]);

    return (
        <div className="categorias">
            <fieldset>
                <legend>Categorias *</legend>

                <div className="radio-group">
                    {categorias.map((cat) => (
                        <div key={cat.value}>
                            <input
                                type="radio"
                                id={`cat-${cat.value}`}
                                value={cat.value}
                                {...register("categoria", { required: "Debes seleccionar una categoria" })}
                            />
                            <label htmlFor={`cat-${cat.value}`}>
                                {cat.value}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.categoria && (
                    <p className="error" >
                        {errors.categoria.message}
                    </p>
                )}
            </fieldset>
        </div>
    )
}

export default Categorias;