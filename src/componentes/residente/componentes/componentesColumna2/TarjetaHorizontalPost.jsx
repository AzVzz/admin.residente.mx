import { urlApi } from "../../../api/url.js";

const TarjetaHorizontalPost = ({ post, onClick, sinFecha = false, destacada = false, mediana = false, pequena = false }) => {
  // Determinar el tamaño basado en los props
  const getSizeClasses = () => {
    if (destacada) {
      return {
        container: "flex flex-col", // Layout vertical para destacada
        image: "h-80 w-full object-cover", // Imagen aún más grande
        textContainer: "flex flex-col mt-4 flex-1 justify-start", // Texto abajo
        title: "font-grotesk text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-gray-700 transition-colors duration-200" // Título mucho más grande
      };
    } else if (mediana) {
      return {
        container: "flex flex-col", // Layout vertical: imagen arriba, texto abajo
        image: "h-36 w-full object-cover", // Imagen mediana ancho completo
        textContainer: "flex flex-col mt-2 flex-1 justify-start", // Texto abajo con margen superior
        title: "font-grotesk text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-gray-700 transition-colors duration-200" // Texto negro normal
      };
    }     else if (pequena) {
      return {
        container: "flex flex-row gap-3", // Layout vertical: imagen arriba, texto abajo
        image: "h-30 w-36 object-cover felx-shirnk-0", // Imagen ancho completo
        textContainer: "flex flex-col mt-2 flex-1 justify-start", // Texto abajo con margen
        title: "font-grotesk text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-gray-700 transition-colors duration-200" // Texto más pequeño
      };
    } else {
      // Tamaño por defecto (original)
      return {
        container: "flex",
        image: "h-28 w-28 object-cover",
        textContainer: "flex flex-col ml-3.5 mr-2 flex-1 justify-center",
        title: "font-grotesk text-[19px] font-bold text-gray-900 leading-5.5 mb-1 group-hover:text-gray-700 transition-colors duration-200"
      };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div
      className="group relative bg-transparent transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Contenedor principal */}
      <div className={sizeClasses.container}>
        {/* Contenedor de imagen */}
        <div className={`relative overflow-hidden ${destacada ? 'w-full' : 'flex-shrink-0'}`}>
          {/* Etiqueta de fecha */}
          {!sinFecha && (
            <div className="absolute top-2 left-2 z-10 bg-[#fff200] backdrop-blur-sm text-gray-900 text-[10px] font-semibold px-1.5 py-0.5 font-sans">
              {(() => {
                const fecha = post?.fecha || 'Sin fecha';
                const [primera, ...resto] = fecha.split(' ');
                return (
                  <>
                    <span className="capitalize">{primera}</span>
                    {resto.length > 0 && ' ' + resto.join(' ')}
                  </>
                );
              })()}
            </div>
          )}

          {/* Imagen con overlay sutil */}
          <div className="relative">
            <img
              src={post?.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
              alt={post?.titulo || "Imagen del post"}
              className={`${sizeClasses.image} transition-transform duration-300 group-hover:scale-105`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Contenido de texto */}
        <div className={sizeClasses.textContainer}>
          {/* Título */}
          <h3 className={sizeClasses.title}>
            {post?.titulo || 'Sin título'}
          </h3>

          {/* Descripción - Solo para notas destacadas */}
          {destacada && (
            <p className="text-gray-600 font-roman text-lg leading-relaxed mb-3">
              {post?.descripcion || post?.contenido?.substring(0, 250) + '...' || 'Sin descripción'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}


export default TarjetaHorizontalPost;

