//src/componentes/eventos/componentes/TicketEvento.jsx
// Imagen a casi todo el alto del boleto + texto superpuesto (degradado abajo) + franja amarilla
import { forwardRef } from "react";

const TicketEvento = forwardRef((props, ref) => {
    const {
        className = "",
        nombreRestaurante = "",
        nombrePromo = "",
        subPromo = "",
        descripcionPromo = "",
        fechaInicioDisplay = "",
        fechaFinDisplay = "",
        diasFijos = [],
        emailPromo = "",
        urlPromo = "",
        lugarEvento = "",
        flyerImagen = null,
        stickerUrl,
        tipografia = "default",
        tipografiaBold = true,
        colorFondo = "#FFFFFF",
        colorAmarillo = "#FFF300",
        espaciadoLetras = 0,
        espaciadoLineas = 1,
        colorTexto: _colorTexto = "#000000",
        /** Título sobre la imagen (px), configurable en el formulario */
        fontSizeTituloImagen = 22,
        /** Tamaño del texto del cuerpo en la franja amarilla (px) */
        fontSizeCuerpo = 13,
        colorTitulo = "#FFFFFF",
    } = props;

    const getFontFamily = () => {
        if (!tipografia || tipografia === "default") return undefined;
        return `"${tipografia}", sans-serif`;
    };

    const fontFamily = getFontFamily();
    const letterSpacing = `${espaciadoLetras}px`;
    const lineHeight = espaciadoLineas;

    const urlLimpia = (urlPromo || "").trim().replace(/^https?:\/\//i, "");
    const boletosTexto = urlLimpia
        ? urlLimpia.length > 56
            ? `${urlLimpia.slice(0, 53)}…`
            : urlLimpia
        : "";

    return (
        <div ref={ref} className={`relative w-90 ${className}`} style={{ background: "transparent" }}>
            <div
                className="flex w-90 min-h-[670px] flex-col overflow-hidden rounded-sm shadow-lg"
                style={{ backgroundColor: colorFondo }}
            >
                {/* Hero: imagen full-bleed + texto encima (overlay) */}
                <div className="relative w-full flex-1 overflow-hidden bg-gray-200 min-h-[320px]">
                    {flyerImagen ? (
                        <img
                            src={flyerImagen}
                            alt=""
                            className="absolute inset-0 block h-full w-full max-w-none object-cover object-center"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-300 text-gray-500">
                            <span className="text-5xl font-light opacity-40">✕</span>
                            <span className="mt-1 text-sm font-medium tracking-wide">Foto</span>
                        </div>
                    )}

                    {stickerUrl && (
                        <img
                            src={stickerUrl}
                            alt=""
                            className="absolute right-5 top-5 z-30 h-16 w-16 object-contain drop-shadow-md"
                        />
                    )}

                    {/* Título en el centro vertical de la imagen: al partir líneas, el bloque crece hacia arriba (borde inferior fijo en el centro) */}
                    <div className="pointer-events-none absolute inset-0 z-20">
                        <div
                            className="absolute left-0 right-0 px-4"
                            style={{ bottom: "4%" }}
                        >
                            <h2
                                className="mx-auto max-w-[95%] text-center font-bold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                                style={{
                                    fontFamily,
                                    fontWeight: tipografiaBold ? 800 : 600,
                                    letterSpacing,
                                    fontSize: `${fontSizeTituloImagen}px`,
                                    color: colorTitulo,
                                }}
                            >
                                {nombrePromo || "Título del evento"}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Franja amarilla (aquí van los datos) */}
                <div
                    className="shrink-0 px-5 pb-5 pt-3 h-[260px] overflow-hidden"
                    style={{ backgroundColor: colorAmarillo }}
                >
                    {nombreRestaurante?.trim() && (
                        <p className="text-center text-[11px] font-bold uppercase tracking-wide text-black">
                            {nombreRestaurante}
                        </p>
                    )}

                    <div className="mt-2 flex flex-col">
                        {subPromo?.trim() && (
                            <p
                                className="mt-1 text-center"
                                style={{ fontFamily, fontWeight: tipografiaBold ? 600 : 400, color: _colorTexto, letterSpacing, fontSize: `${fontSizeCuerpo}px` }}
                            >
                                {subPromo}
                            </p>
                        )}

                        {descripcionPromo?.trim() && (
                            <p
                                className="mt-2 line-clamp-3 text-center leading-snug"
                                style={{ fontFamily, letterSpacing, lineHeight, color: _colorTexto, fontSize: `${fontSizeCuerpo}px` }}
                            >
                                {descripcionPromo}
                            </p>
                        )}

                        <div className="mt-4 pt-2">
                            {diasFijos?.length > 0 ? (
                                <div className="text-center">
                                    <p className="text-xs font-bold uppercase tracking-wide opacity-75" style={{ color: _colorTexto }}>
                                         Los días
                                    </p>
                                    <p
                                        className="mt-1 text-base font-bold uppercase leading-tight"
                                        style={{ color: _colorTexto, fontFamily }}
                                    >
                                        {diasFijos.join(" · ")}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div className="text-center">
                                        <p className="text-xs font-bold uppercase tracking-wide opacity-75" style={{ color: _colorTexto }}>
                                            Inicio
                                        </p>
                                        <p
                                            className="mt-1 text-base font-bold uppercase leading-tight"
                                            style={{ color: _colorTexto, fontFamily }}
                                        >
                                            {fechaInicioDisplay || "—"}
                                        </p>
                                    </div>
                                    <div className="text-center pl-2">
                                        <p className="text-xs font-bold uppercase tracking-wide opacity-75" style={{ color: _colorTexto }}>
                                            Fin
                                        </p>
                                        <p
                                            className="mt-1 text-base font-bold uppercase leading-tight"
                                            style={{ color: _colorTexto, fontFamily }}
                                        >
                                            {fechaFinDisplay || "—"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {emailPromo?.trim() && (
                            <p
                                className="mt-2 break-all text-center text-sm"
                                style={{ letterSpacing, color: _colorTexto, fontFamily }}
                            >
                                {emailPromo.trim()}
                            </p>
                        )}

                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                            <div className="min-w-0 pr-1">
                                <p className="text-xs font-bold uppercase tracking-wide opacity-80" style={{ color: _colorTexto }}>
                                    Dónde
                                </p>
                                <p className="mt-1.5 font-semibold leading-snug" style={{ color: _colorTexto, fontFamily, fontSize: `${fontSizeCuerpo}px` }}>
                                    {lugarEvento?.trim() || "—"}
                                </p>
                            </div>
                            <div className="min-w-0 pl-2">
                                <p className="text-xs font-bold uppercase tracking-wide opacity-80" style={{ color: _colorTexto }}>
                                    Boletos
                                </p>
                                <p className="mt-1.5 break-words text-base font-semibold leading-snug" style={{ color: _colorTexto, fontFamily }}>
                                    {boletosTexto || "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
});

TicketEvento.displayName = "TicketEvento";

export default TicketEvento;
