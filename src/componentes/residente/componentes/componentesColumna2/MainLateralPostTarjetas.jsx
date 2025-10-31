import { urlApi, imgApi } from "../../../api/url.js";
import BarraMarquee from "../seccionesCategorias/componentes/BarraMarquee.jsx";
import PortadaRevista from "./PortadaRevista";

const MainLateralPostTarjetas = ({
  notasDestacadas = [],
  onCardClick,
  cantidadNotas,
  sinFecha = true,
  sinCategoria = false,
  pasarObjeto = false,
}) => {
  const safePosts = (notasDestacadas || [])
    .filter((post) => post)
    .slice(0, cantidadNotas || 5);

  return (
    <>
      <section className="flex flex-col mt-3">
        {/* === igual que Infografia: columna alineada a la derecha === */}
        <div className="flex flex-col items-end">
          {/* Header relativo con línea + logo (idéntico patrón) */}
          <div className="relative">
            {/* Línea amarilla con bordes inclinados */}
            <div className="absolute left-[-90px] top-1/2 transform -translate-y-1/2 w-20 h-[10px] bg-[#fff300] -skew-x-32"></div>

            {/* Logo */}
            <img
              src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/lomasvistologo-03.webp"
              className="h-full w-46 object-contain"
              alt="Logo Lo más visto"
            />
          </div>

          {/* Contenedor principal (igual que en Infografia: mt-3 y alineado a la derecha) */}
          <div className="relative mt-3 w-full">
            {/* Lista de notas */}
            <ul className="flex flex-col gap-2.5">
              {safePosts.map((post, index) => (
                <li key={post.id} className="relative flex-grow">
                  {/* número a la derecha (círculo amarillo) */}
                  <span className="absolute -right-1 top-0 bg-[#fff300] text-black text-[24px] font-grotesk rounded-full h-7 w-7 flex items-center justify-center">
                    {index + 1}
                  </span>

                  <div
                    className="flex items-center cursor-pointer h-full w-full transition-shadow text-right"
                    onClick={() =>
                      pasarObjeto ? onCardClick(post) : onCardClick(post.id)
                    }
                  >
                    {/* Texto a la derecha como en tu layout (alineado y “sentado”) */}
                    <div className="flex-1 pr-4 pl-12 h-full flex flex-col justify-center items-end">
                      {!sinFecha && (
                        <div className="font-roman inline-block text-black text-[10px] py-0 max-w-max mb-0.5 font-black self-end">
                          {(() => {
                            const fecha = post?.fecha || "Sin fecha";
                            const [primera, ...resto] = fecha.split(" ");
                            return (
                              <>
                                <span className="capitalize">{primera}</span>
                                {resto.length > 0 && " " + resto.join(" ")}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <h4 className="text-[13px] leading-3.5 line-clamp-4">
                        {post.titulo}
                      </h4>
                    </div>

                    {/* avatar redondo a la derecha (como la imagen del bloque) */}
                    <div className="w-20 h-20">
                      <img
                        src={
                          post.imagen ||
                          "https://residente.mx/fotos/fotos-estaticas/residente-columna1/SinFoto.webp"
                        }
                        alt={post.titulo}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default MainLateralPostTarjetas;
