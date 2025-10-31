import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Skeleton from "@mui/material/Skeleton"
import { urlApi } from "../../api/url"

const LinkInBio = () => {
  const [notas, setNotas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const res = await fetch(`${urlApi}/api/notas`)
        const data = await res.json()
        setNotas(data || [])
      } catch (error) {
        console.error("Error cargando notas:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotas()
  }, [])

  const hayNotas = !loading && notas.length > 0
  const principal = hayNotas ? notas[0] : null

  return (
    <div className="flex flex-col w-full">
    {/* Header similar a CNN */}
      <header className="w-full bg-white border-b border-gray-200 px-4 h-[60px] flex items-center justify-between">
      {/* Logo y texto */}
      <div className="flex items-center gap-2">
        {/* Logo de Residente (R en círculo negro) */}
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center  ">
           <Link to="/">
             <img 
               src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/logo-r-residente-negro.webp"
               alt="Logo Residente" 
               className="w-8 h-8 object-contain"
             />
           </Link>
         </div>
        <span className=" text-gray-800 text-lg font-black">Residente</span>
      </div>
  
      {/* Botón Ver Residente */}
      <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 text-lg font-black hover:bg-gray-50 transition-colors">
        <Link to="/">
          Ver Residente
        </Link>
      </button>
    </header>
  


      {/* Contenido principal - Ancho limitado */}
      <div className="max-w-[1080px] mx-auto w-full">
        <div className="flex flex-col justify-center items-center py-8">
      {/* Banner destacado (clicable) */}
      <div className="w-[clamp(300px,100vw,960px)] h-[clamp(200px,50vw,480px)]">
        {loading ? (
          <Skeleton variant="rectangular" animation="wave" width={860} height={480} />
        ) : hayNotas ? (
          <Link to={`/`} aria-label={principal.titulo}>
            <img
              src="https://residente.mx/fotos/fotos-estaticas/residente-logos/amarillos/banner-pagina-insta-imagen.webp"
              alt="Banner InstaImagen"
              className="w-full h-full object-cover cursor-pointer bg-[#fff300]"
              loading="eager"
            />
          </Link>
        ) : (
          <span className="text-gray-500">No hay notas</span>
        )}
      </div>

      {/* Texto debajo del banner */}
      <div className="my-3">
        {loading ? (
          <Skeleton
            variant="text"
            animation="wave"
            sx={{ fontSize: "1rem", width: "26ch", lineHeight: 1.5 }}
          />
        ) : (
          <span className="text-gray-700">Clickea en la imagen para ver más</span>
        )}
      </div>

      {/* Grid de fotos + títulos (cada tarjeta clicable) */}
      <div className="grid grid-cols-3 gap-2 w-[clamp(300px,100vw,960px)]">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton
                variant="rectangular"
                animation="wave"
                sx={{
                  width: "clamp(47px, 20vw, 284px)",
                  height: "clamp(47px, 20vw, 284px)",
                }}
              />
              <Skeleton
                variant="text"
                sx={{
                  fontSize: "0.9rem",
                  width: "80%",
                }}
              />
            </div>
          ))
          : notas.filter(nota => nota.insta_imagen).map((nota) => (
            <Link
              key={nota.id}
              to={`/notas/${nota.id}`}
              className="flex flex-col items-center h-fit w-fit"
              aria-label={nota.titulo}
            >
              <img
                src={nota.insta_imagen}
                alt={nota.titulo}
                className="[clamp(47px,20vw,284px)] h-[clamp(47px,20vw,284px) object-cover cursor-pointer"
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}

export default LinkInBio
