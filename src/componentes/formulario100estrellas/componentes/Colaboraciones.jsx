import { useFormContext } from 'react-hook-form';

const Colaboraciones = () => {
    const { register, watch } = useFormContext();
    
    // Opciones de colaboración
    const opcionesColaboracion = [
        { id: 'coca_cola', label: 'Colaboración con Coca Cola' },
        { id: 'modelo', label: 'Colaboración con Modelo' },
        { id: 'heineken', label: 'Colaboración con Heineken' },
        { id: 'descuentosx6', label: 'Colaboración con Descuentos x6' }
    ];

    return (
        <div>
            <fieldset className="border-2 border-black rounded-2xl p-6 my-8">
                <legend className="text-black px-4 text-3xl uppercase font-bold">
                    Colaboraciones
                </legend>

                <div className="radio-group grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-3 mb-6">
                    {opcionesColaboracion.map((opcion) => {
                        const fieldName = `colaboracion_${opcion.id}`;
                        
                        return (
                            <div key={opcion.id}>
                                <input
                                    id={opcion.id}
                                    type="checkbox"
                                    {...register(fieldName)} // Registrar cada campo individualmente
                                    className="opacity-0 absolute peer"
                                />

                                <label
                                    className={`text-xl flex items-center p-3 border-2 h-full justify-start rounded-lg cursor-pointer relative transition-all duration-300 ease-in-out 
                                        before:content-[''] before:absolute before:left-3 before:top-1/2 before:transform before:-translate-y-1/2 before:w-5 before:h-5 before:border-2 before:border-white before:rounded-sm
                                        after:content-[''] after:absolute after:left-[18px] after:top-[9px] after:w-[9px] after:h-[14px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 after:opacity-0
                                        peer-checked:after:opacity-100 peer-checked:border-orange-500 peer-checked:bg-white peer-checked:text-orange-500
                                        hover:bg-white hover:-translate-y-[2px] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-amber-300 peer-focus-visible:outline-offset-2
                                        ${watch(fieldName) ? 'border-orange-500 bg-white text-orange-500' : 'border-orange-100 bg-orange-50'}`}
                                    htmlFor={opcion.id}
                                >
                                    <span className="font-roman font-black pl-[40px] w-full">{opcion.label}</span>
                                </label>
                            </div>
                        )
                    })}
                </div>
            </fieldset>
        </div>
    )
}

export default Colaboraciones;