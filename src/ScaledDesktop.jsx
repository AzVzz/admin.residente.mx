// src/components/ScaledDesktop.jsx
import { useLayoutEffect, useRef } from "react";

export default function ScaledDesktop({ baseWidth = 1080, children, className = "" }) {
    const frameRef = useRef(null); // contenido a escalar
    const wrapRef = useRef(null); // contenedor que reserva altura

    useLayoutEffect(() => {
        const el = frameRef.current;
        const wrap = wrapRef.current;
        if (!el || !wrap) return;

        let raf = 0;

        const measure = () => {
            const vw = window.innerWidth;
            const scale = Math.min(1, vw / baseWidth); // nunca > 1 (no sobre-escalar)

            // Centrado real: left:50% + translateX(-50%)
            wrap.style.position = "relative";
            wrap.style.overflow = "hidden";

            el.style.position = "absolute";
            el.style.left = "50%";
            el.style.top = "0";
            el.style.width = `${baseWidth}px`;
            el.style.transformOrigin = "top left";
            el.style.transform = `translateX(-50%) scale(${scale})`;
            el.style.willChange = "transform";

            // Altura del wrapper = altura visible del frame ya escalado
            const rect = el.getBoundingClientRect(); // incluye la escala
            wrap.style.height = `${rect.height}px`;
        };

        const schedule = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(measure);
        };

        // Observa cambios internos (imágenes, fuentes, etc.)
        const ro = new ResizeObserver(schedule);
        ro.observe(el);

        // Eventos de ventana
        window.addEventListener("resize", schedule);
        window.addEventListener("orientationchange", schedule);
        document.fonts?.ready?.then(schedule).catch(() => { });

        // Primera medición
        schedule();

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", schedule);
            window.removeEventListener("orientationchange", schedule);
            cancelAnimationFrame(raf);
        };
    }, [baseWidth]);

    return (
        <div ref={wrapRef} className={`w-screen ${className}`}>
            <div ref={frameRef}>
                {children}
            </div>
        </div>
    );
}
