import { useParams } from 'react-router-dom'
import RestaurantFetcher from '../api/RestaurantFetcher'
import TipoDeRestaurante from './componentes/TipoDeRestaurante'
import PlatilloEstrellaCarrusel from './componentes/PlatilloEstrellaCarrusel'
import ContenidoRestaurante from './componentes/ContenidoRestaurante'
import GridComponent from './componentes/GridComponent'
import Reconocimientos from './componentes/Reconocimientos'
import CincoRazones from './componentes/CincoRazones'
import ExpertosOpinan from './componentes/ExpertosOpinan'
import QuePedir from './componentes/QuePedir'
import Logros from './componentes/Logros'
import ElPublicoOpina from '../ElPublicoOpina'
import ResidentRestaurantVibes from './componentes/ResidentRestaurantVibes'
import Footer from './componentes/Footer'
import Historia from './componentes/Historia'
import Colaboraciones from './componentes/Colaboraciones'
import { urlApi, imgApi } from '../api/url'

const RestaurantePage = () => {
  const { slug } = useParams()

  return (
    <RestaurantFetcher slug={slug}>
      {({ loading, error, restaurante }) => {
        if (loading) return <p>Cargando</p>
        if (error) return <p>Error: {error}</p>
        if (!restaurante) return <div>Restaurante no encontrado</div>

        // Extraer valores del nuevo formato
        const {
          tipo_restaurante,
          platillo_mas_vendido,
          fecha_inauguracion,
          nombre_restaurante,
          comida: rawComida,
          ticket_promedio,
          numero_sucursales,
          telefono,
          ocasiones_ideales: rawOcasionesIdeales,
          codigo_vestir,
          tipo_area: rawTipoArea,
          reconocimientos: rawReconocimientos,
          logros: rawLogros,
          razones: rawRazones,
          platillos: rawPlatillos,
          testimonios: rawTestimonios,
          historia: rawHistoria,
          fotos_lugar: rawFotosLugar = [],
          links = {},
          sitio_web,
          rappi_link,
          didi_link,
          instagram,
          facebook,
          ubereats_link,
          link_horario,
          sucursales: rawSucursales,
          imagenes: rawImagenes
        } = restaurante

        // Convertir todos los posibles valores null a arrays vacíos
        const comida = Array.isArray(rawComida) ? rawComida : [];
        const ocasiones_ideales = Array.isArray(rawOcasionesIdeales) ? rawOcasionesIdeales : [];
        const tipo_area = Array.isArray(rawTipoArea) ? rawTipoArea : [];
        const reconocimientos = Array.isArray(rawReconocimientos) ? rawReconocimientos : [];
        const logros = Array.isArray(rawLogros) ? rawLogros : [];
        const razones = Array.isArray(rawRazones) ? rawRazones : [];
        const platillos = Array.isArray(rawPlatillos) ? rawPlatillos : [];
        const testimonios = Array.isArray(rawTestimonios) ? rawTestimonios : [];
        const sucursales = Array.isArray(rawSucursales) ? rawSucursales : [];
        const imagenes = Array.isArray(rawImagenes) ? rawImagenes : [];
        const fotos_lugar = Array.isArray(rawFotosLugar) ? rawFotosLugar : [];
        const historia = rawHistoria || "";


        // Preparar ocasiones ideales (máximo 3)
        const [
          ocasionIdeal1 = "",
          ocasionIdeal2 = "",
          ocasionIdeal3 = ""
        ] = ocasiones_ideales;

        // Preparar reconocimientos (máximo 5) - seguro ahora que es un array
        const reconocimientosData = reconocimientos.slice(0, 5).map((rec, i) => ({
          [`recTitulo${i + 1}`]: rec.titulo || "",
          [`recFecha${i + 1}`]: rec.fecha || ""
        })).reduce((acc, curr) => ({ ...acc, ...curr }), {});

        return (
          <div className="container-restaurante">
            <TipoDeRestaurante tipo={tipo_restaurante || ""} />

            {/* Carousel condicional - si no hay imágenes no se muestra */}
            {imagenes.length > 0 && (
              <PlatilloEstrellaCarrusel
                imagenes={imagenes.map(img => img.src)}
                estrella={`${urlApi}fotos/fotos-estaticas/componente-sin-carpetas/estrella.webp`}
                nombrePlatillo={platillo_mas_vendido || ""}
              />
            )}

            <ContenidoRestaurante
              fechaInauguracion={fecha_inauguracion || ""}
              nombreRestaurante={nombre_restaurante || ""}
              comida={comida.join(", ") || ""}
              reseñas={restaurante.reseñas || []}
            />

            <GridComponent
              man={`${urlApi}fotos/fotos-estaticas/componente-sin-carpetas/man.webp`}
              phone={`${urlApi}fotos/fotos-estaticas/componente-sin-carpetas/telefono.webp`}
              ticketPromedio={ticket_promedio || ""}
              numeroSucursales={numero_sucursales || ""}
              sucursales={sucursales}
              telefono={telefono || ""}
              ocasionIdeal1={ocasionIdeal1}
              ocasionIdeal2={ocasionIdeal2}
              ocasionIdeal3={ocasionIdeal3}
              tipoArea={tipo_area}
              codigoVestir={codigo_vestir || ""}

              linkHorario={restaurante.link_horario || ""}
              sitioWeb={restaurante.sitio_web || ""}
              instagram={restaurante.instagram || ""}
              facebook={restaurante.facebook || ""}
              rappi={restaurante.rappi_link || ""}
              ubereats={restaurante.ubereats_link || ""}
              didi={restaurante.didi_link || ""}
            />

            {(restaurante.colaboracion_coca_cola || restaurante.colaboracion_modelo) && (
              <Colaboraciones
                colaboracion_coca_cola={restaurante.colaboracion_coca_cola}
                colaboracion_modelo={restaurante.colaboracion_modelo}
              />
            )}

            {reconocimientos.length > 0 && (
              <Reconocimientos
                recTitulo1={reconocimientosData.recTitulo1 || ""}
                recTitulo2={reconocimientosData.recTitulo2 || ""}
                recTitulo3={reconocimientosData.recTitulo3 || ""}
                recTitulo4={reconocimientosData.recTitulo4 || ""}
                recTitulo5={reconocimientosData.recTitulo5 || ""}
                recFecha1={reconocimientosData.recFecha1 || ""}
                recFecha2={reconocimientosData.recFecha2 || ""}
                recFecha3={reconocimientosData.recFecha3 || ""}
                recFecha4={reconocimientosData.recFecha4 || ""}
                recFecha5={reconocimientosData.recFecha5 || ""}
              />
            )}

            {razones.length > 0 && (
              <CincoRazones
                nombreRestaurante={nombre_restaurante || ""}
                razones={{
                  razon_1: razones[0]?.titulo || "",
                  razon_2: razones[1]?.titulo || "",
                  razon_3: razones[2]?.titulo || "",
                  razon_4: razones[3]?.titulo || "",
                  razon_5: razones[4]?.titulo || "",
                  razonCuerpo_1: razones[0]?.descripcion || "",
                  razonCuerpo_2: razones[1]?.descripcion || "",
                  razonCuerpo_3: razones[2]?.descripcion || "",
                  razonCuerpo_4: razones[3]?.descripcion || "",
                  razonCuerpo_5: razones[4]?.descripcion || "",
                }}
              />
            )}

            <ExpertosOpinan
              expertos={restaurante.experiencia_opinion || []}
            />

            {platillos.length > 0 && (
              <QuePedir
                platillos={platillos.filter(Boolean)}
              />
            )}

            {logros.length > 0 && (
              <Logros
                logros={logros}
              />
            )}

            {testimonios.length > 0 && (
              <ElPublicoOpina
                testimonio1={testimonios[0]?.descripcion || ""}
                testimonio2={testimonios[1]?.descripcion || ""}
                testimonio3={testimonios[2]?.descripcion || ""}
                testimonioPersona1={testimonios[0]?.persona || ""}
                testimonioPersona2={testimonios[1]?.persona || ""}
                testimonioPersona3={testimonios[2]?.persona || ""}
              />
            )}

            <ResidentRestaurantVibes fotos={fotos_lugar} />

            <Historia historia={historia} />
            
            <Footer />
          </div>
        )
      }}
    </RestaurantFetcher>
  )
}

export default RestaurantePage