import { useEffect, useRef, useState, useCallback } from 'react';

// Editor de recorte tipo "cover" para la foto principal de la nota.
// El usuario arrastra y hace zoom; lo que queda dentro del recuadro se recorta
// en el navegador (canvas) -> WebP. Lo que ves es lo que queda.
//
// La salida es el MÁSTER en alta calidad 1360x836 (recortado directo del
// original, nítido). El backend deriva de ahí media (680x418) y chica (308x191).

const OUT = { w: 1360, h: 836 }; // máster alta calidad (2x de 680x418)
const FRAME_W = 460; // ancho del recuadro en pantalla
const FRAME_H = (FRAME_W * OUT.h) / OUT.w; // alto proporcional (≈282.76px)
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;

// bytes -> "KB" / "MB" legible.
const fmtPeso = (b) => {
    if (b == null) return '…';
    if (b < 1024) return `${b} B`;
    const kb = b / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
};

const RecorteImagen = ({ file, onChange }) => {
    const [url, setUrl] = useState(null);
    const [nat, setNat] = useState(null); // { ow, oh } dimensiones originales
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 }); // top-left de la img vs recuadro (px pantalla)
    const [size, setSize] = useState(null); // peso del recorte (bytes)

    const imgElRef = useRef(null); // HTMLImageElement cargado (para el canvas)
    const dragRef = useRef(null); // estado del arrastre

    // Escala display/original al hacer "cover" del recuadro a zoom 1.
    const cover = nat ? Math.max(FRAME_W / nat.ow, FRAME_H / nat.oh) : 1;
    const scale = cover * zoom; // px de pantalla por px original
    const imgW = nat ? nat.ow * scale : 0;
    const imgH = nat ? nat.oh * scale : 0;

    // Mantiene el recuadro siempre cubierto (sin huecos).
    const clamp = useCallback((o, iw, ih) => ({
        x: Math.min(0, Math.max(FRAME_W - iw, o.x)),
        y: Math.min(0, Math.max(FRAME_H - ih, o.y)),
    }), []);

    // Cargar el archivo elegido y centrar a zoom 1.
    useEffect(() => {
        if (!file) return;
        const u = URL.createObjectURL(file);
        setUrl(u);
        setSize(null);
        const img = new Image();
        img.onload = () => {
            imgElRef.current = img;
            const ow = img.naturalWidth;
            const oh = img.naturalHeight;
            const cv = Math.max(FRAME_W / ow, FRAME_H / oh);
            const iw = ow * cv;
            const ih = oh * cv;
            setZoom(1);
            setOffset({ x: (FRAME_W - iw) / 2, y: (FRAME_H - ih) / 2 });
            setNat({ ow, oh });
        };
        img.src = u;
        return () => URL.revokeObjectURL(u);
    }, [file]);

    // Genera el recorte máster 1360x836 (debounce) cada vez que cambia mover/zoom.
    useEffect(() => {
        if (!nat || !imgElRef.current) return;
        const t = setTimeout(() => {
            const s = cover * zoom;
            const sx = -offset.x / s;
            const sy = -offset.y / s;
            const sW = FRAME_W / s;
            const sH = FRAME_H / s;

            const canvas = document.createElement('canvas');
            canvas.width = OUT.w;
            canvas.height = OUT.h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgElRef.current, sx, sy, sW, sH, 0, 0, OUT.w, OUT.h);
            canvas.toBlob(
                (blob) => {
                    if (!blob) return;
                    setSize(blob.size);
                    const recorte = new File([blob], 'recorte.webp', {
                        type: 'image/webp',
                    });
                    if (onChange) onChange({ blob: recorte, size: blob.size });
                },
                'image/webp',
                0.85,
            );
        }, 200);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset, zoom, nat]);

    const aplicarZoom = (z) => {
        if (!nat) return;
        const zNew = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
        setOffset((o) => {
            // Anclar el zoom al centro del recuadro.
            const nx = FRAME_W / 2 - (FRAME_W / 2 - o.x) * (zNew / zoom);
            const ny = FRAME_H / 2 - (FRAME_H / 2 - o.y) * (zNew / zoom);
            const iw = nat.ow * cover * zNew;
            const ih = nat.oh * cover * zNew;
            return clamp({ x: nx, y: ny }, iw, ih);
        });
        setZoom(zNew);
    };

    const onPointerDown = (e) => {
        if (!nat) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = {
            sx: e.clientX,
            sy: e.clientY,
            ox: offset.x,
            oy: offset.y,
        };
    };
    const onPointerMove = (e) => {
        if (!dragRef.current) return;
        const dx = e.clientX - dragRef.current.sx;
        const dy = e.clientY - dragRef.current.sy;
        setOffset(
            clamp(
                { x: dragRef.current.ox + dx, y: dragRef.current.oy + dy },
                imgW,
                imgH,
            ),
        );
    };
    const onPointerUp = (e) => {
        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        dragRef.current = null;
    };
    const onWheel = (e) => {
        e.preventDefault();
        aplicarZoom(zoom - e.deltaY * 0.0015 * zoom);
    };

    return (
        <div>
            <div
                style={{ width: FRAME_W, height: FRAME_H }}
                className="relative mx-auto overflow-hidden rounded-lg bg-gray-900 cursor-move touch-none select-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onWheel={onWheel}
            >
                {url && (
                    <img
                        src={url}
                        alt="recorte"
                        draggable={false}
                        style={{
                            position: 'absolute',
                            left: offset.x,
                            top: offset.y,
                            width: imgW,
                            height: imgH,
                            maxWidth: 'none',
                        }}
                    />
                )}
                {/* Marco guía */}
                <div className="pointer-events-none absolute inset-0 ring-1 ring-white/40" />
            </div>

            <div
                className="flex items-center gap-2 mt-2 mx-auto"
                style={{ maxWidth: FRAME_W }}
            >
                <span className="text-xs text-gray-500">Zoom</span>
                <input
                    type="range"
                    min={ZOOM_MIN}
                    max={ZOOM_MAX}
                    step="0.01"
                    value={zoom}
                    onChange={(e) => aplicarZoom(parseFloat(e.target.value))}
                    className="flex-1"
                />
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-1">
                Arrastra para mover · rueda o slider para zoom. Se recorta en alta calidad (1360 × 836 px).
            </p>
            <p className="text-xs text-gray-600 text-center">
                Peso aprox.:{' '}
                <span className="font-medium text-gray-800">{fmtPeso(size)}</span>
            </p>
        </div>
    );
};

export default RecorteImagen;
