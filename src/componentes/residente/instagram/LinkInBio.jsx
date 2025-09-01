import Skeleton from "@mui/material/Skeleton"

const LinkInBio = () => {
  const cargando = 1

  const imagenes = [
    "https://residente.mx/wp-content/uploads/2025/07/para-ir-con-toda-la-familia.jpg",
    "https://residente.mx/wp-content/uploads/2025/07/para-ir-con-toda-la-familia.jpg",
    "https://residente.mx/wp-content/uploads/2025/07/para-ir-con-toda-la-familia.jpg",
    "https://residente.mx/wp-content/uploads/2025/07/para-ir-con-toda-la-familia.jpg",
    "https://residente.mx/wp-content/uploads/2025/07/para-ir-con-toda-la-familia.jpg",
    "https://residente.mx/wp-content/uploads/2025/07/para-ir-con-toda-la-familia.jpg",
    "https://residente.mx/wp-content/uploads/2025/07/para-ir-con-toda-la-familia.jpg",
    "https://residente.mx/wp-content/uploads/2025/07/para-ir-con-toda-la-familia.jpg",
    "https://residente.mx/wp-content/uploads/2025/07/para-ir-con-toda-la-familia.jpg",
  ]

  return (
    <div className="flex flex-col justify-center items-center py-8">
      <div className="w-[860px] h-[480px]">
        {cargando == 0 ? (
            <Skeleton variant="rectangular" animation="wave" width={860} height={480} />
        ) : (
            <img src="https://residente.mx/wp-content/uploads/2025/07/para-ir-con-toda-la-familia.jpg" className="w-[860px] h-[480px] object-cover"/>
        ) }
      </div>

      <div className="my-3">
        {cargando === 0 ? (
          <Skeleton
            variant="text"
            animation="wave"
            sx={{
              fontSize: "1rem",
              width: "26ch",
              lineHeight: 1.5,
            }}
          />
        ) : (
          <span className="text-gray-700">Clickea en la imagen para ver más</span>
        )}
      </div>

      <div className="">
        {cargando === 0 ? (
          <div className="grid grid-cols-3 gap-2 w-[860px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                animation="wave"
                width={284}
                height={284}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 w-[860px]">
            {imagenes.map((src, i) => (
              <div key={i}>
                <img
                  src={src}
                  className="w-[284px] h-[284px] object-cover cursor-pointer"
                  alt={`imagen-${i}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LinkInBio
