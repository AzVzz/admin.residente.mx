import PostPrincipal from "../componentes/componentesColumna2/PostPrincipal";
import { urlApi } from "../../api/url";

// Configuración de logos por categoría
const logosCategorias = {
    "Restaurantes": "fotos/fotos-estaticas/residente-logos/negros/crlogo2-02.webp",
    "Food & Drink": "fotos/fotos-estaticas/residente-logos/negros/food%26drink-02.webp",
    "Antojos": "fotos/fotos-estaticas/residente-logos/negros/antojeria.webp"
};

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
    const categorias = ["Restaurantes", "Food & Drink", "Antojos"];
    const notasPrincipales = categorias
        .map(cat => ({
            nota: filtrarPostsPorTipoNota(cat).at(0),
            categoria: cat
        }))
        .filter(item => item.nota);

    return (
        <div>
            <div className="flex flex-col pt-9 items-center">
                <div className="w-full max-w-[650px] mx-auto flex flex-col gap-5">
                    <img
                        src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/newsletter1.webp"
                        alt="Newsletter Logo"
                        className="w-100 h-auto mx-auto"
                    />
                    {/* Puedes quitar la fecha aquí si ya la pones debajo de cada nota */}
                    {notasPrincipales.map(({ nota, categoria }) => (
                        <div key={nota.id} className="mb-8">
                            <div className="flex justify-center items-center mb-2">
                                <img
                                    src="https://residente.mx/fotos/fotos-estaticas/residente-logos/negros/crlogo2-02.webp"
                                    alt="Restaurantes"
                                    className="h-auto w-85 object-contain"
                                />
                            </div>
                            <a
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FotoNewsletter;