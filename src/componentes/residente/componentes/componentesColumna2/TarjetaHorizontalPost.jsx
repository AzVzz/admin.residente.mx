import { urlApi } from "../../../api/url.js";

const TarjetaHorizontalPost = ({ post, onClick, sinFecha = false, destacada = false, mediana = false, pequena = false }) => {
  // Determinar el tamaño basado en los props
  const getSizeClasses = () => {
    if (destacada) {
      return {
        container: "flex flex-col", // Layout vertical para destacada
        image: "h-80 w-full object-cover", // Imagen aún más grande
        textContainer: "flex flex-col flex-1 justify-start", // Texto abajo
        title: "text-black text-[47px] leading-[1.05] font-black flex-1 overflow-hidden text-center p-2 my-0 tracking-tight" // Título mucho más grande
      };
    } else if (mediana) {
      return {
        container: "flex flex-col", // Layout vertical: imagen arriba, texto abajo
        image: "h-36 w-full object-cover", // Imagen mediana ancho completo
        textContainer: "flex flex-col mt-2 flex-1 justify-start", // Texto abajo con margen superior
        title: "text-black text-[20px] leading-[1.05] font-black flex-1 overflow-hidden text-center p-2 my-0 tracking-tight" // Texto negro normal
      };
    }     else if (pequena) {
      return {
        container: "flex flex-row gap-3", // Layout vertical: imagen arriba, texto abajo
        image: "h-30 w-36 object-cover felx-shirnk-0", // Imagen ancho completo
        textContainer: "flex flex-col mt-2 flex-1 justify-start", // Texto abajo con margen
        title: "text-black text-[20px] leading-[1.05] font-black flex-1 overflow-hidden text-center p-2 my-0 tracking-tight" // Texto más pequeño
      };
    } else {
      // Tamaño por defecto (original)
      return {
        container: "flex",
        image: "h-28 w-28 object-cover",
        textContainer: "flex flex-col ml-3.5 mr-2 flex-1 justify-center",
        title: "text-black text-[47px] leading-[1.05] font-black flex-1 overflow-hidden text-center p-2 my-0 tracking-tight"
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
          {/*!sinFecha && (
            <div className="w-full mt-2 z-10 bg-gradient-to-r bg-transparent text-black text-[14px] font-black px-6 py-0.5 font-roman uppercase flex justify-center">
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
          )*/}
          <h3 className={sizeClasses.title}>
            {post?.titulo || 'Sin título'}
          </h3>

          { /*{/* Descripción - Solo para notas destacadas */}
          {/*destacada && (
            <p className="text-gray-600 font-roman text-lg leading-relaxed mb-3">
              {post?.descripcion || post?.contenido?.substring(0, 250) + '...' || 'Sin descripción'}
            </p>
          )}*/}
        </div>
      </div>
    </div>
  )
}


export default TarjetaHorizontalPost;

