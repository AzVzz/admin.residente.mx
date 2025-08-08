const PostVertical = ({ imagen }) => {
    return (
        <div className="flex flex-col justify-center">
            <div className="flex justify-start">
                <h3 className="pb-5 text-[30px] leading-8">Tres tarjetas verticales</h3>
            </div>
            <div className="flex justify-center">
                <div
                    className="group relative bg-[#FFF200] transition-all duration-300 overflow-hidden"
                    style={{ width: "225.781px", height: "336px", maxWidth: "225.781px" }}
                >
                    {/* Contenedor principal vertical */}
                    <div className="flex flex-col">
                        {/* Contenedor de imagen */}
                        <div className="relative overflow-hidden" style={{ width: "225.781px", height: "192px" }}>
                            {/* Etiqueta de fecha */}
                            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r bg-[#FFF200] text-gray-900 text-[10px] font-semibold px-1.5 py-0.5 shadow-md font-serif uppercase">
                                fecha
                            </div>
                            {/* Imagen con overlay sutil */}
                            <div className="relative">
                                <img
                                    src={imagen || `https://estrellasdenuevoleon.com.mx/fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                                    style={{ width: "225.781px", height: "192px" }}
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>
                        {/* Contenedor de texto */}
                        <div
                            className="flex flex-col py-2"
                            style={{ width: "225.781px", height: "144px" }}
                        >
                            {/* Título */}
                            <h3 className="text-xl font-bold text-gray-900 leading-[1.2] mb-2 group-hover:text-gray-700 transition-colors duration-200">
                                titulo
                            </h3>
                            {/* Botón de acción sutil */}
                            <div className="flex items-center text-gray-600 text-sm font-semibold group-hover:text-gray-900 transition-colors duration-200 mt-auto">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PostVertical
