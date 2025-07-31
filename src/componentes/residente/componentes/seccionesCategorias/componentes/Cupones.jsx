import { useEffect, useState } from "react";
import { cuponesGet } from "../../../../api/cuponesGet";
import TicketPromo from "../../../../promociones/componentes/TicketPromo";
import { Iconografia } from "../../../../utils/Iconografia.jsx";

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

    const getStickerUrl = (clave) => {
        const allStickers = [
            ...Iconografia.categorias,
            ...Iconografia.ocasiones,
            ...Iconografia.zonas,
        ];
        const found = allStickers.find(item => item.clave === clave);
        return found ? found.icono : null;
    };

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
                    validezPromo={cupon.fecha_validez || "Sin validez"}
                    stickerUrl={getStickerUrl(cupon.icon)} // <-- usa la función aquí
                    className="scale-40 w-50 h-1"
                />
            ))}
        </div>
    );
}

export default Cupones;