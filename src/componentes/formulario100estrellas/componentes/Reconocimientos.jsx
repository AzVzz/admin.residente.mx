import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';

const Reconocimientos = ({ numero }) => {
    const { register, watch, setValue, formState: { errors } } = useFormContext();

    // Obtener los valores iniciales para este reconocimiento
    const reconocimientoInicial = watch(`reconocimientos.${numero - 1}.titulo`) || "";
    const fechaInicial = watch(`reconocimientos.${numero - 1}.fecha`) || "";

    // Inicializar valores al cargar
    useEffect(() => {
        setValue(`reconocimiento_${numero}`, reconocimientoInicial);
        setValue(`fecha_reconocimiento_${numero}`, fechaInicial);
    }, [numero, reconocimientoInicial, fechaInicial, setValue]);

    // Validaciones condicionales
    const validations = {
        reconocimiento: {
            validate: (value) => {
                const fecha = watch(`fecha_reconocimiento_${numero}`);
                if (fecha && !value) return "Selecciona un reconocimiento si ingresaste el año";
                return true;
            }
        },
        fecha: {
            pattern: {
                value: /^(19|20)\d{2}$/,
                message: "Ingresa un año válido (ej. 2025)"
            },
            validate: (value) => {
                const reconocimiento = watch(`reconocimiento_${numero}`);
                if (reconocimiento && !value) return "Ingresa el año del reconocimiento";
                return true;
            }
        }
    };

    const reconocimientos = [
        { value: "Platillos Icónicos de Nuevo León" },
        { value: "Premio al mérito restaurantero" },
        { value: "Estrella Michelin" }
    ];

    return (
        <div>
            <fieldset className="border-2 border-black rounded-2xl p-6 my-8">
                <legend className="text-black px-4 text-3xl uppercase font-bold">
                    Reconocimiento {numero}
                </legend>

                <div className="radio-group grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3 mb-6">
                    {reconocimientos.map((rco) => (
                        <div key={rco.value}>
                            <input
                                id={`reconocimiento-${numero}-${rco.value}`}
                                type="radio"
                                value={rco.value}
                                {...register(`reconocimiento_${numero}`, validations.reconocimiento)}
                                className="opacity-0 absolute peer"
                            />

                            <label
                                className="text-xl flex items-center p-3 border-2 border-orange-100 h-full justify-start rounded-lg bg-orange-50 cursor-pointer relative transition-all duration-300 ease-in-out before:content-[''] before:absolute before:left-3 before:top-1/2 before:transform before:-translate-y-1/2 before:w-5 before:h-5 before:border-2 before:border-white before:rounded-full after:content-[''] after:absolute after:left-[17px] after:top-1/2 after:transform after:-translate-y-1/2 after:w-2.5 after:h-2.5 after:bg-orange-500 after:rounded-full after:opacity-0 peer-checked:after:opacity-100 peer-checked:border-orange-500 peer-checked:bg-white peer-checked:text-orange-500 hover:bg-white hover:-translate-y-[2px] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-amber-300 peer-focus-visible:outline-offset-2"
                                htmlFor={`reconocimiento-${numero}-${rco.value}`}
                            >
                                <span className="font-roman font-black pl-[40px] w-full">{rco.value}</span>
                            </label>
                        </div>
                    ))}
                </div>

                {errors[`reconocimiento_${numero}`] && (
                    <span className="error">
                        {errors[`reconocimiento_${numero}`].message}
                    </span>
                )}

                <div className="input-group">
                    <label
                        htmlFor={`fecha-${numero}`}
                        className="block text-black font-medium mb-2"
                    >
                        Año de reconocimiento:
                    </label>
                    <input
                        id={`fecha-${numero}`}
                        type="text"
                        placeholder="Ej. 2025"
                        {...register(`fecha_reconocimiento_${numero}`, validations.fecha)}
                        className={`${errors[`fecha_reconocimiento_${numero}`] ? "error-border" : ""} w-full p-3 border-2 border-orange-100 rounded-lg bg-orange-50 transition-all duration-300 ease-in-out mt-2 focus:border-orange-500 focus:outline-none focus:shadow-[0_0_0_3px_#fdba74]`}
                    />
                    {errors[`fecha_reconocimiento_${numero}`] && (
                        <span className="error">
                            {errors[`fecha_reconocimiento_${numero}`].message}
                        </span>
                    )}
                </div>
            </fieldset>
        </div>
    )
}

export default Reconocimientos;