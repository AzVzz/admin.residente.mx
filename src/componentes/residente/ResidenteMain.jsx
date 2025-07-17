import BannerRevista from "./componentes/BannerRevista";
import SeccionesPrincipales from "./componentes/SeccionesPrincipales";

const ResidenteMain = () => {

    return (
        <div>
            <SeccionesPrincipales /> {/* Directorio */}
            <BannerRevista/>
            
            <div className="flex flex-col gap-5">
                
            </div>
        </div>
    )
}

export default ResidenteMain;