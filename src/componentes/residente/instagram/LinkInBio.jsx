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
    <div className="flex flex-col justify-center items-center py-8">
      {/* Banner destacado (clicable) */}
      <div className="w-[860px] h-[480px]">
        {loading ? (
          <Skeleton variant="rectangular" animation="wave" width={860} height={480} />
        ) : hayNotas ? (
          <Link to={`/notas/${principal.id}`} aria-label={principal.titulo}>
            <img
              src="#"
              alt="Foto portada"
              className="w-[860px] h-[480px] object-cover cursor-pointer bg-[#fff300]"
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
      <div className="grid grid-cols-3 gap-2 max-w-[860px] bg-red-200">
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
          : notas.map((nota) => (
            <Link
              key={nota.id}
              to={`/notas/${nota.id}`}
              className="flex flex-col items-center"
              aria-label={nota.titulo}
            >
              <img
                src={nota.imagen}
                alt={nota.titulo}
                className="w-[clamp(47px,20vw,284px)] h-[clamp(47px,20vw,284px) object-cover cursor-pointer"
                loading="lazy"
              />
            </Link>
          ))}
      </div>
    </div>
  )
}

export default LinkInBio
