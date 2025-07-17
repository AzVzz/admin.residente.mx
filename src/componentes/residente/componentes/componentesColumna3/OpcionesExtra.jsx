import cuponeraDigital from '../../../../imagenes/ResidenteColumna3/Cuponera-Digital-Residente.jpg';
import etiqetaRestaurantera from '../../../../imagenes/ResidenteColumna3/Etiqueta-restaurantera.jpg'
import mapaRestaurantes from '../../../../imagenes/ResidenteColumna3/Mapa-de-los-restaurantes-de-NL.jpg'
const OpcionesExtra = () => {
    return (
        <div className="flex flex-col gap-5">
            <img 
                src={etiqetaRestaurantera}
            />
            <img 
                src={mapaRestaurantes}
            />
            <img 
                src={cuponeraDigital}
            />
        </div>
    )
}

export default OpcionesExtra