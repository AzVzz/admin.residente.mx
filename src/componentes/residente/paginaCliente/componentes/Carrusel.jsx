const Carrusel = ({ nota }) => {
    if (!nota) return null;
    return (
        <div>
            <div>
                <div className="h-[400px] overflow-hidden relative border-[#FFF200]">
                    <img
                        src={nota.imagen || "https://via.placeholder.com/800x400?text=Sin+Imagen"}
                        className="w-full h-full object-cover object-center"
                        alt={nota.titulo || "Imagen carrusel"}
                    />
                    <div className="absolute bottom-3 left-3 right-3 gap-2 flex flex-col">
                        {/* Etiquetas justo encima del título */}
                        <div className=" flex flex-row gap-2">
                            <div className="bg-black text-white text-xs font-bold px-3 py-1 font-sans">
                                {nota.fecha}
                            </div>
                            <div className="bg-black text-white text-xs font-bold px-3 py-1 font-sans">
                                {nota.tipo_nota}
                            </div>
                        </div>
                        {/* Título en la parte inferior, separado de los bordes */}
                        <div className="">
                            <div className="bg-white/60 px-3 py-3 shadow-lg w-full">
                                <h2 className="text-2xl font-bold text-black leading-6">
                                    {nota.titulo}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Carrusel