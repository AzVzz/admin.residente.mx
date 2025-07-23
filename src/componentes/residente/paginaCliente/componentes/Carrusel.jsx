const Carrusel = () => {
    return (
        <div>
            <div>
                <div className="h-[400px] overflow-hidden relative border-[#FFF200]">
                    <img
                        src="https://residente.mx/wp-content/uploads/2025/07/mango-kimchi-1024x682.jpg"
                        className="w-full h-full object-cover object-center"
                        alt="Imagen carrusel"
                    />
                    <div className="absolute bottom-3 left-3 right-3 gap-2 flex flex-col">
                        {/* Etiquetas justo encima del título */}
                        <div className=" flex flex-row gap-2">
                            <div className="bg-black text-white text-xs font-bold px-3 py-1 font-sans">
                                Junio 12, 2025
                            </div>
                            <div className="bg-black text-white text-xs font-bold px-3 py-1 font-sans">
                                Barrio Antiguo
                            </div>
                        </div>
                        {/* Título en la parte inferior, separado de los bordes */}
                        <div className="">
                            <div className="bg-white/60 px-3 py-3 shadow-lg w-full">
                                <h2 className="text-2xl font-bold text-black leading-6">
                                    ¿Comida italiana en Monterrey? El Barrio Antiguo es tu lugar.
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