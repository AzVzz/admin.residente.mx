// GridComponent.jsx
import SocialMediaIcons from "../../../iconos/SocialMediaIcons";
import "./GridComponent.css";
import { FaClock } from "react-icons/fa6";
import { GiKnifeFork } from "react-icons/gi";

import CodigoVestimenta from "../../../iconos/svg/codigovestimenta.svg"

import CuchilloTenedor from "../../../iconos/svg/cuchillotenedor.svg"
import { imgApi } from "../../api/url";

// GridComponent.jsx
const GridComponent = ({
    man,
    phone,
    ticketPromedio,
    numeroSucursales,
    sucursales,
    linkHorario,
    telefono,
    ocasionIdeal1,
    ocasionIdeal2,
    ocasionIdeal3,
    tipoArea, // Ahora es un array
    codigoVestir,
    sitioWeb,
    instagram,
    facebook,
    rappi,
    ubereats,
    didi
}) => {

    // Función para formatear números con comas
    const formatNumber = (num) => {
        // Si no es un número válido, devolver "No disponible"
        if (isNaN(Number(num)) || num === null || num === undefined) {
            return "No disponible";
        }
        return Number(num).toLocaleString('en-US');
    };

    function formatTelefono(telefono) {
        const digits = telefono?.replace(/\D/g, '') || '';
        return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2 $3');
    }

    const formatSucursales = (sucursales) => {
        if (!sucursales || sucursales.length === 0) return "No disponible";

        if (Array.isArray(sucursales)) {
            return sucursales.join("\n");
        }

        try {
            const parsed = JSON.parse(sucursales);
            if (Array.isArray(parsed)) return parsed.join("\n");
        } catch (e) {
            return sucursales
                .replace(/\\n/g, '\n')
                .split(',')
                .join('\n');
        }

        return "No disponible";
    };

    const textoAreaTipo = Array.isArray(tipoArea)
        ? tipoArea.join(', ')
        : "No disponible";


    return (
        <div className="flex-container">
            <div className="costo"> {/* 1 */}
                <div className="costo-imagen">
                    <img src={`${imgApi}/fotos/fotos-estaticas/componente-sin-carpetas/man.webp`} />
                </div>
                <div className="costo-info">
                    <h3 className="leading-tight">Ticket promedio <br /> por persona</h3>
                    <h4>${formatNumber(ticketPromedio)}</h4>
                </div>
            </div>
            <div className="redes-sociales"> {/* 2 */}
                <SocialMediaIcons
                    web={sitioWeb}
                    insta={instagram}
                    face={facebook}
                    rappi={rappi}
                    uber={ubereats}
                    didi={didi}
                />
            </div>
            <div className="sucursales">{/* 3 */}
                <h4 className="numero-sucursales">{numeroSucursales}</h4>
                <h3>Sucursales</h3>
                <p>{formatSucursales(sucursales)}</p>
            </div>
            <div className="horario">{/* 4 */}
                <h3>Horario</h3>
                <a
                    href={linkHorario}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                >
                    <FaClock
                        href={linkHorario}
                        className="reloj"
                        style={{ color: 'black', cursor: 'pointer' }}
                    />
                </a>
            </div>
            <div className="div5y6">
                <div className="telefono"> {/* 5 */}
                    <img src={`${imgApi}/fotos/fotos-estaticas/componente-sin-carpetas/telefono.webp`} />
                    <h3>{formatTelefono(telefono) || "No disponible"}</h3>
                </div>
                <div className="ocasion"> {/* 6 */}
                    <h3>Ocasión ideal</h3>
                    <ul>
                        <li>{ocasionIdeal1 || ""}</li>
                        <li>{ocasionIdeal2 || ""}</li>
                        <li>{ocasionIdeal3 || ""}</li>
                    </ul>
                </div>
            </div>
            <div className="info-adicional">
                <div className="vestimenta">
                    <img src={CodigoVestimenta} alt="Código de vestimenta" />
                    <div>
                        <h3>Vestimenta</h3>
                        <p>{codigoVestir || "No disponible"}</p>
                    </div>
                </div>
                <div className="comedor">
                    <img src={CuchilloTenedor} alt="Área del restaurante" />
                    <div>
                        <h3>Comedor</h3>
                        <p>{textoAreaTipo}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GridComponent;