import { Iconografia } from "../../utils/Iconografia";
import { imgApi } from "../../api/url";

const rutaNegra = `${imgApi}/fotos/fotos-estaticas/componente-iconos/iconos-negros/`;

// Obtener el logo de color negro
function obtenerIconoNegro(icono) {
  const nombreArchivo = String(icono || "").split("/").pop() || "";
  // match: baseName, optional -negro, extension
  const m = nombreArchivo.match(/^(.*?)(-negro)?(\.[^.]+)$/);
  if (!m) {
    // Si no se reconoce, devolver con el mismo nombre (fallback)
    return `${rutaNegra}${nombreArchivo}`;
  }
  const base = m[1];
  const ext = m[3] || ".webp";
  return `${rutaNegra}${base}-negro${ext}`;
}

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

    // Solo iconos con versión negra
    const iconosNegros = iconosDisponibles.map(i => ({
      ...i,
      icono: obtenerIconoNegro(i.icono)
    }));

    const colores = [
        "bg-[#FFF]", 
        "bg-[#3D3E3E]", 
        "bg-[#FFF200]"
    ];
    const coloresTexto = [
        "text-[#000]", 
        "text-[#FFF]", 
        "text-[#000]"
    ];

    return (
        <div>
            <div className="flex flex-col pt-9 items-center">
                <div className="w-full max-w-[400px] mx-auto flex flex-col gap-8">
                    {notasPrincipales.map(({ nota, categoria }, idx) => {
                        const stickers = Array.isArray(nota.sticker)
                            ? nota.sticker
                            : nota.sticker
                                ? [nota.sticker]
                                : [];
                        const stickersConResidente = ["residente", ...stickers];
                        const colorTarjeta = colores[idx % colores.length];
                        const colorTexto = coloresTexto[idx % coloresTexto.length];

                        // idx 0 → Cultura Restaurantera, idx 1 → Food & Drink, idx 2 → Antojería
                        if (idx === 0) return (
                            /* Diseño CULTURA RESTAURANTERA */
                            <div
                                key={nota.id}
                                className={`relative flex flex-col items-center justify-end nota-card mb-8 pt-10 pb-10 px-10 w-[400px] h-[658px] overflow-hidden ${colorTarjeta}`}
                                data-slug={nota.slug}
                            >
                                {/* Línea negra superpuesta */}
                                <div className="absolute right-0 bottom-[90px] w-[55%] h-[45px] bg-[#111] rounded-tl-[50px] rounded-bl-[50px]" />
                                {/* Stickers */}
                                <div className="w-full flex justify-start mb-1.5">
                                    {stickersConResidente.map((clave, idxIcono) => {
                                        const icono = iconosNegros.find(i => i.clave === clave);
                                        return icono ? (
                                            <img
                                                key={clave}
                                                src={icono.icono}
                                                alt={icono.nombre}
                                                className={`h-7 w-7 rounded-full bg-white ${idxIcono > 0 ? "ml-0.5" : ""}`}
                                            />
                                        ) : null;
                                    })}
                                </div>
                                {/* Categoría en recuadro negro */}
                                <div className="bg-[#111] text-white rounded-md px-2.5 py-0.5 text-[0.9rem] mb-2 inline-block text-center self-start">
                                    {categoria}
                                </div>
                                {/* Título */}
                                <div className={`text-[23px] ${colorTexto} text-left mb-3 w-full leading-6`}>
                                    {nota.titulo}
                                </div>
                                {/* Imagen */}
                                <div className="w-full h-[320px] flex justify-center items-center">
                                    <img
                                        src={nota.imagen}
                                        alt={nota.titulo}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        );

                        if (idx === 1) return (
                            /* Diseño FOOD & DRINK (tipo story) */
                            <div
                                key={nota.id}
                                data-slug={nota.slug}
                                className="relative nota-card mb-8 w-[400px] h-[658px] overflow-hidden"
                            >
                                <img
                                    src={nota.imagen}
                                    alt={nota.titulo}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent" />
                                {/* Contenido superior */}
                                <div className="relative z-10 flex flex-col items-center pt-10 px-6 text-center">
                                    {/* Iconos */}
                                    <div className="flex justify-center mb-3">
                                        {stickersConResidente.map((clave, idxIcono) => {
                                            const icono = iconosNegros.find(i => i.clave === clave);
                                            return icono ? (
                                                <img
                                                    key={clave}
                                                    src={icono.icono}
                                                    alt={icono.nombre}
                                                    className={`h-8 w-8 rounded-full bg-white ${idxIcono > 0 ? "ml-1" : ""}`}
                                                />
                                            ) : null;
                                        })}
                                    </div>
                                    {/* Categoría grande */}
                                    <div className="text-white font-bold text-[28px] leading-tight mb-3">
                                        Food&amp;Drink®
                                    </div>
                                    {/* Título */}
                                    <div className="text-white text-[18px] leading-6 font-normal">
                                        {nota.titulo}
                                    </div>
                                </div>
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[55%] h-[40px] bg-black rounded-full" />
                            </div>
                        );

                        // idx === 2
                        return (
                            /* Diseño ANTOJERÍA (tipo story, texto amarillo) */
                            <div
                                key={nota.id}
                                data-slug={nota.slug}
                                className="relative nota-card mb-8 w-[400px] h-[658px] overflow-hidden"
                            >
                                <img
                                    src={nota.imagen}
                                    alt={nota.titulo}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40" />
                                {/* "ANTOJERÍA®" en arco arriba */}
                                <div className="relative z-10 pt-8">
                                    <svg viewBox="0 0 400 100" className="w-full">
                                        <defs>
                                            <path
                                                id={`arco-categoria-${nota.id}`}
                                                d="M 30,90 Q 200,10 370,90"
                                            />
                                        </defs>
                                        <text
                                            fill="#FFF200"
                                            fontSize="42"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            fontFamily="inherit"
                                        >
                                            <textPath href={`#arco-categoria-${nota.id}`} startOffset="50%">
                                                ANTOJERÍA®
                                            </textPath>
                                        </text>
                                    </svg>
                                    {/* Iconos debajo del arco */}
                                    <div className="flex justify-center mt-1">
                                        {stickersConResidente.map((clave, idxIcono) => {
                                            const icono = iconosNegros.find(i => i.clave === clave);
                                            return icono ? (
                                                <img
                                                    key={clave}
                                                    src={icono.icono}
                                                    alt={icono.nombre}
                                                    className={`h-8 w-8 rounded-full bg-[#FFF200] ${idxIcono > 0 ? "ml-1" : ""}`}
                                                />
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                                {/* Título abajo normal */}
                                <div className="absolute bottom-20 left-0 right-0 z-10 px-6 text-center">
                                    <div className="text-[#FFF200] font-bold text-[22px] leading-7">
                                        {nota.titulo}
                                    </div>
                                </div>
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[55%] h-[40px] bg-black rounded-full" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default InstaHistory;