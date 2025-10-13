import PostPrincipal from "../componentes/componentesColumna2/PostPrincipal";
import { urlApi } from "../../api/url";

const formatFechaActual = () => {
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const hoy = new Date();
    const diaSemana = dias[hoy.getDay()];
    const dia = hoy.getDate().toString().padStart(2, "0");
    const mes = meses[hoy.getMonth()];
    const año = hoy.getFullYear();
    return `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} ${dia} de ${mes} del ${año}`;
};

const FotoNewsletter = ({ posts, filtrarPostsPorTipoNota, handleCardClick }) => {
    const restaurantesNota = filtrarPostsPorTipoNota("Restaurantes").at(0);
    const foodDrinkNota = filtrarPostsPorTipoNota("Food & Drink").at(0);
    const antojosNota = filtrarPostsPorTipoNota("Antojos").at(0);

    const notasPrincipales = [restaurantesNota, foodDrinkNota, antojosNota].filter(Boolean);

    return (
        <div>
            <div className="flex flex-col pt-9 items-center">
                <div className="w-full max-w-[650px] mx-auto flex flex-col gap-5">
                    <img
                        src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/newsletter1.webp`}
                        alt="Newsletter Logo"
                        className="w-100 h-auto mx-auto"
                    />
                    <div className="text-center text-[20px] font-semibold">
                        {formatFechaActual()}
                    </div>
                    {notasPrincipales.map(nota => (
                        <a
                            key={nota.id}
                            href={`https://residente.mx/notas/${nota.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <PostPrincipal
                                post={nota}
                                onClick={() => handleCardClick(nota)}
                                ocultarFecha={true}
                            />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FotoNewsletter;