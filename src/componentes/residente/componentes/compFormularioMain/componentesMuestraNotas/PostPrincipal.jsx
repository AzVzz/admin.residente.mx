const PostPrincipal = ({ titulo, subtitulo, autor, contenido, imagen, tipoNota, fecha, nombreRestaurante }) => {
    return (
        <div>
            <div className="flex flex-col overflow-hidden">
                <div className="h-[400px] overflow-hidden">
                    <div className="relative h-full">
                        <div className="absolute top-8 left-7 z-10 bg-gradient-to-r bg-[#FFF300] text-gray-900 text-[11px] font-semibold px-3 py-0.5 shadow-md font-serif uppercase">
                            {fecha || "Fecha"}
                        </div>
                        <img
                            src={imagen || `https://residente.mx/fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <div className="bg-black p-8 flex flex-col h-[325px] relative">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="font-serif inline-block bg-[#FFF200] text-gray-900 uppercase text-[10px] font-bold px-3 py-0.5 shadow-md">
                            {tipoNota || "Tipo de Nota"}
                        </span>
                    </div>
                    <h1 className="text-white text-[40px] leading-[1.1] font-black flex-1 overflow-hidden content-center">
                        {titulo || "Sin titulo"}
                    </h1>
                    {nombreRestaurante && (
                        <div className="text-lg font-bold text-yellow-700 mb-2">
                            {nombreRestaurante}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PostPrincipal;
