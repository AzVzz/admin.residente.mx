import PostPrincipal from "../componentes/componentesColumna2/PostPrincipal";
import { urlApi, imgApi } from "../../api/url";
import { Iconografia } from "../../utils/Iconografia";

const InstaHistory = ({ posts, filtrarPostsPorTipoNota, handleCardClick }) => {
    const categorias = ["Restaurantes", "Food & Drink", "Antojos"];
    const notasPrincipales = categorias
        .map(cat => ({
            nota: filtrarPostsPorTipoNota(cat).at(0),
            categoria: cat
        }))
        .filter(item => item.nota);

    // Unir todos los iconos disponibles de Iconografia
    const iconosDisponibles = [
        ...(Iconografia?.categorias || []),
        ...(Iconografia?.ocasiones || []),
        ...(Iconografia?.zonas || [])
    ];

    return (
        <div>
            <div className="flex flex-col pt-9 items-center">
                <div className="w-full max-w-[400px] mx-auto flex flex-col gap-8">
                    {notasPrincipales.map(({ nota, categoria }) => {
                        const stickers = Array.isArray(nota.sticker)
                            ? nota.sticker
                            : nota.sticker
                                ? [nota.sticker]
                                : [];
                                // Agrega el sticker fijo "residente" al final
                                const stickersConResidente = ["residente", ...stickers];
                        return (
                            <div
                                key={nota.id}
                                className="bg-[#3D3E3E] flex flex-col items-start nota-card mb-8 pt-10 pb-12 pl-6 pr-6 "
                                data-slug={nota.slug}
                                style={{ position: "relative" }}
                            >
                                {/* Línea negra superpuesta, inicia desde el borde del recuadro verde */}
                            <div
                                style={{
                                position: "absolute",
                                right: 0,
                                bottom: "110px", // Ajusta la distancia desde abajo
                                width: "55%",
                                height: "45px",
                                background: "#111",
                                borderTopLeftRadius: "50px",
                                borderBottomLeftRadius: "50px",
                               }}
                            ></div>
                                {/* Stickers arriba del recuadro negro, alineados a la derecha */}
                                <div style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "flex-start",
                                    marginBottom: "6px"
                                }}>
                                    {stickersConResidente.map((clave, idx) => {
                                        const icono = iconosDisponibles.find(i => i.clave === clave);
                                        return icono ? (
                                            <img
                                                key={clave}
                                                src={icono.icono}
                                                alt={icono.nombre}
                                                style={{
                                                    height: "28px",
                                                    width: "28px",
                                                    borderRadius: "50%",
                                                    background: "#fff",
                                                    marginLeft: idx > 0 ? "2px" : "0"
                                                }}
                                            />
                                        ) : null;
                                    })}
                                </div>
                                {/* Categoría en recuadro negro */}
                                <div
                                    style={{
                                        background: "#111",
                                        color: "#fff",
                                        borderRadius: "6px",
                                        padding: "2px 10px",
                                        fontSize: "0.9rem",
                                        marginBottom: "10px",
                                        display: "inline-block",
                                        textAlign: "left"
                                    }}
                                >
                                    {categoria}
                                </div>
                                {/* Título */}
                                <div
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: "19px",
                                        color: "#fff",
                                        textAlign: "left",
                                        marginBottom: "12px",
                                        width: "100%",
                                        lineHeight: "1.2"
                                    }}
                                >
                                    {nota.titulo}
                                </div>
                                {/* Imagen */}
                                <div style={{ width: "100%" }}>
                                    <img
                                        src={nota.imagen}
                                        alt={nota.titulo}
                                        className=""
                                        style={{
                                            width: "815px",
                                            height: "420px",
                                            objectFit: "cover"
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default InstaHistory;