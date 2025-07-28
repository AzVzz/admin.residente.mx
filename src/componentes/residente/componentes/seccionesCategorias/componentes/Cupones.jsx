import { useEffect, useState } from "react";
import { cuponesGet } from "../../../../api/cuponesGet";
import TicketPromo from "../../../../promociones/componentes/TicketPromo";

const Cupones = () => {
    const [cupones, setCupones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cuponesGet()
            .then(data => setCupones(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className=" h-71 overflow-hidden flex flex-row">
            {loading && <div className="text-gray-500">Cargando cupones...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}

            {cupones.map(cupon => (
                <TicketPromo
                    key={cupon.id}
                    nombreRestaurante={cupon.nombre_restaurante}
                    nombrePromo={cupon.titulo}
                    subPromo={cupon.subtitulo}
                    descripcionPromo={cupon.descripcion}
                    validezPromo={cupon.metadata?.fecha_validez || ""}
                    stickerUrl={cupon.icon}
                    className="scale-40 w-43 h-1"
                />
            ))}
        </div>
    );
}

export default Cupones;