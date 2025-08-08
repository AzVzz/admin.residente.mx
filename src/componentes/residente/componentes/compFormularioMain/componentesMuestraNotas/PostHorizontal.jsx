const PostHorizontal = ({ titulo, imagen, tipoNota }) => {
    return (
        <div
            className="group relative bg-transparent transition-all duration-300 overflow-hidden"
            style={{ width: "770px", height: "112px", maxWidth: "770px" }}
        >
            {/* Contenedor principal */}
            <div className="flex" style={{ width: "770px", height: "112px" }}>
                {/* Contenedor de imagen */}
                <div className="relative flex-shrink-0 overflow-hidden" style={{ width: "140px", height: "112px" }}>
                    <div className="relative">
                        <img
                            src={imagen || `https://estrellasdenuevoleon.com.mx/fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                            style={{ width: "140px", height: "112px" }}
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </div>

                {/* Contenido de texto */}
                <div
                    className="flex flex-col ml-2 mr-2 flex-1 justify-center"
                    style={{ width: "614px", height: "112px" }}
                >
                    {/* Categoría */}
                    <div className="mb-1">
                        <span className="font-serif inline-block bg-black text-[#fff300] text-[11px] px-1.5 py-0.5 shadow-md">
                            {tipoNota || "tiponota"}
                        </span>
                    </div>

                    {/* Título */}
                    <h3 className="font-grotesk text-[22px] font-bold text-gray-900 leading-5.5 mb-1 group-hover:text-gray-700 transition-colors duration-200">
                        {titulo || "Sin titulo"}
                    </h3>
                </div>
            </div>
        </div>
    )
}

export default PostHorizontal
