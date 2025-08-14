import CorreoElectronico from "./componentes/CorreoElectronico"
import Facebook from "./componentes/Facebook"
import FechaNacimiento from "./componentes/FechaNacimiento"
import Instagram from "./componentes/Instagram"
import Nombre from "./componentes/Nombre"
import OtrasRedesSociales from "./componentes/OtrasRedesSociales"

const OpinionEditorial = () => {
  return (
    <div className="flex flex-col gap-4">
        <Nombre />
        <CorreoElectronico />
        <FechaNacimiento />
        <Instagram />
        <Facebook />
        <OtrasRedesSociales />
    </div>
  )
}

export default OpinionEditorial
