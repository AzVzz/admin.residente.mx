import imagenTarjeta from "../../../../imagenes/cola-de-caballo.jpg"
import SinFoto from '../../../../imagenes/ResidenteColumna1/SinFoto.png'
const TarjetaPost = ({ post, onClick }) => {
  return (
    <div
      className="group relative bg-[#FFF200] shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Contenedor principal */}
      <div className="flex">
        {/* Contenedor de imagen */}
        <div className="relative flex-shrink-0 overflow-hidden ">
          {/* Etiqueta de fecha */}
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r bg-[#FFF200] text-gray-900 text-[10px] font-semibold px-1.5 py-.5 shadow-md font-serif uppercase">
            {post?.fecha || 'Sin fecha'}
          </div>

          {/* Imagen con overlay sutil */}
          <div className="relative">
            <img
              src={post?.imagen || SinFoto}
              alt={post?.titulo || "Imagen del post"}
              className="h-34 w-44 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Contenido de texto */}
        <div className="flex flex-col ml-2 flex-1 justify-center">
          {/* Categoría */}
          <div className="mb-1">
            <span className="font-serif inline-block bg-black text-white text-[11px] px-1.5 py-.5 shadow-md">
              {post?.tipo_nota || 'Sin categoría'}
            </span>
          </div>

          {/* Título */}
          <h3 className="font-grotesk text-xl font-bold text-gray-900 leading-5 mb-1 group-hover:text-gray-700 transition-colors duration-200">
            {post?.titulo || 'Sin título'}
          </h3>

          {/* Descripción 
          <p className="text-gray-600 font-roman text-sm leading-tight mb-1">
            {post?.descripcion || post?.contenido?.substring(0, 150) + '...' || 'Sin descripción'}
          </p>*/}

          {/* Botón de acción sutil */}
          <div className="flex items-center text-gray-600 text-sm font-semibold group-hover:text-gray-900 transition-colors duration-200">
            <span>Leer más</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TarjetaPost
