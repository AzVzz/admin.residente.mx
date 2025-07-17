const PostComentarios = () => {
    return (
        <div className="space-y-5"> {/* Contenedor principal con espacio vertical de 20px */}
            <h4 className="text-2xl">Publicar comentario</h4>
            
            <div className="grid grid-cols-2 gap-8"> {/* Contenedor de dos columnas con gap horizontal */}
                <div className="flex flex-col gap-1"> {/* Cada grupo con espacio interno vertical */}
                    <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                        Nombre
                    </label>
                    <input
                        id="nombre"
                        type="text"
                        placeholder="Ingresa tu nombre"
                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                </div>
                
                <div className="flex flex-col gap-1">
                    <label htmlFor="correo" className="text-sm font-medium text-gray-700">
                        Correo
                    </label>
                    <input
                        id="correo"
                        type="email"
                        placeholder="Ingresa tu correo"
                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                </div>
            </div>
            
            <div className="flex flex-col gap-1"> {/* Grupo de comentario con espacio interno */}
                <label htmlFor="comentario" className="text-sm font-medium text-gray-700">
                    Comentario
                </label>
                <textarea
                    id="comentario"
                    placeholder="Escribe tu comentario"
                    rows={4}
                    className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
            </div>
        </div>
    )
}

export default PostComentarios;