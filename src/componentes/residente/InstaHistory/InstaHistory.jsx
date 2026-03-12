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
                        return (
                            <>
                                {/* Diseño CULTURA RESTAURANTERA */}
                                <div
                                    key={`${nota.id}-cultura`}
                                    className={`relative flex flex-col items-center justify-end nota-card mb-8 pt-10 pb-10 px-10 w-[400px] h-[658px] overflow-hidden ${colorTarjeta}`}
                                    data-slug={nota.slug}
                                >
                                    {/* Línea negra superpuesta */}
                                    <div className="absolute right-0 bottom-[90px] w-[55%] h-[45px] bg-[#111] rounded-tl-[50px] rounded-bl-[50px]" />
                                    {/* Stickers arriba del recuadro negro, alineados al centro */}
                                    <div className="w-full flex justify-start mb-1.5">
                                        {stickersConResidente.map((clave, idxIcono) => {
                                            const icono = idx === 1 
                                                ? iconosDisponibles.find(i => i.clave === clave)
                                                : iconosNegros.find(i => i.clave === clave);
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

                                {/* Diseño FOOD & DRINK (tipo story) */}
                                <div
                                    key={`${nota.id}-fooddrink`}
                                    data-slug={nota.slug}
                                    className="relative nota-card mb-8 w-[400px] h-[658px] overflow-hidden"
                                >
                                    <img
                                        src={nota.imagen}
                                        alt={nota.titulo}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
                                    <div className="relative z-10 w-full flex justify-center mt-6 mb-4">
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
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 pb-20 text-center">
                                        <div className="text-white font-semibold tracking-[0.08em] uppercase text-sm mb-3">
                                            {categoria}
                                        </div>
                                        <div className="text-white text-[20px] leading-7">
                                            {nota.titulo}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[55%] h-[40px] bg-black rounded-full" />
                                </div>

                                {/* Diseño ANTOJERÍA (tipo story, texto amarillo) */}
                                <div
                                    key={`${nota.id}-antojeria`}
                                    data-slug={nota.slug}
                                    className="relative nota-card mb-8 w-[400px] h-[658px] overflow-hidden"
                                >
                                    <img
                                        src={nota.imagen}
                                        alt={nota.titulo}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
                                    <div className="relative z-10 w-full flex justify-center mt-6 mb-4">
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
                                    <div className="relative z-10 flex flex-col items-center justify-end h-full px-6 pb-24 text-center">
                                        <div className="text-[#FFF200] font-semibold tracking-[0.08em] uppercase text-sm mb-3">
                                            {categoria}
                                        </div>
                                        <div className="text-[#FFF200] text-[20px] leading-7">
                                            {nota.titulo}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[55%] h-[40px] bg-black rounded-full" />
                                </div>
                            </>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default InstaHistory;