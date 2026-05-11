import React, { useEffect, useRef, useState } from "react";
import MetricasRestaurante from "./MetricasRestaurante";

// Carrusel horizontal de métricas por restaurante.
// - Slide 0 = TOTAL agregado (siempre presente, incluso si solo hay 1 restaurante).
// - Slides 1..N = un restaurante cada uno.
//
// El padre (B2BDashboard) controla `activeIndex` para que TODO el dashboard
// (header, ROI, botones, métricas) cambie sincronizado al navegar.
// El swipe/arrastre dentro del carrusel se siguen soportando como atajo.
const CarruselRestaurantes = ({
  restaurantes = [],
  cupones = [],
  activeIndex = 0,
  onSlideChange,
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(null);
  const trackRef = useRef(null);

  // Con 2+ restaurantes el slide 0 es TOTAL agregado. Con 1 solo (o ninguno)
  // no tiene sentido la vista TOTAL: los slides son únicamente individuales.
  const tieneTotal = restaurantes.length >= 2;
  const slides = tieneTotal
    ? [
        { esTotal: true },
        ...restaurantes.map((r) => ({ esTotal: false, restaurante: r })),
      ]
    : restaurantes.map((r) => ({ esTotal: false, restaurante: r }));

  const totalSlides = slides.length;

  const irA = (i) => {
    if (!onSlideChange) return;
    onSlideChange(Math.max(0, Math.min(totalSlides - 1, i)));
  };

  const handleStart = (clientX) => {
    setIsDragging(true);
    startXRef.current = clientX;
    setDragOffset(0);
  };

  const handleMove = (clientX) => {
    if (!isDragging || startXRef.current == null) return;
    setDragOffset(clientX - startXRef.current);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    const ancho = trackRef.current?.offsetWidth || 1;
    const umbral = ancho * 0.18; // umbral de cambio de slide (~18% del ancho)
    if (dragOffset > umbral) irA(activeIndex - 1);
    else if (dragOffset < -umbral) irA(activeIndex + 1);
    setIsDragging(false);
    startXRef.current = null;
    setDragOffset(0);
  };

  // Filtra cupones por restaurante actual (si no es TOTAL).
  const cuponesPorRestaurante = (rId) =>
    cupones.filter((c) => Number(c?.restaurante_id) === Number(rId));

  const offsetPercent =
    -(activeIndex * 100) +
    (trackRef.current ? (dragOffset / trackRef.current.offsetWidth) * 100 : 0);

  return (
    <div className="relative w-full select-none">
      {/* Track + slides. Los controles (flechas/dots) viven en el header del dashboard. */}
      <div
        className="relative overflow-hidden"
        ref={trackRef}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        <div
          className={`flex ${
            isDragging ? "" : "transition-transform duration-300 ease-out"
          }`}
          style={{ transform: `translateX(${offsetPercent}%)` }}
        >
          {slides.map((s, i) => (
            <div key={i} className="w-full flex-shrink-0 px-1">
              <MetricasRestaurante
                esTotal={s.esTotal}
                restaurante={s.restaurante || null}
                notasStats={s.restaurante?.notasStats || null}
                cupones={
                  s.esTotal
                    ? []
                    : cuponesPorRestaurante(s.restaurante?.id)
                }
                todosLosRestaurantes={restaurantes}
                todosLosCupones={cupones}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarruselRestaurantes;
