import { useState, useEffect, useRef } from 'react';

// Debounce simple
function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export default function useAutoFitText(text, options = {}) {
  const {
    minFontSize = 12,
    maxFontSize = 32,
    comfortZone = 0.85, // margen de seguridad
    debounceDelay = 100,
    charWidthFactor = 1.6, // factor de promedio del ancho por carácter
  } = options;

  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  const calculateFontSize = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const textLength = text.length || 1;

    // Calculamos basado en caracteres promedio de ancho
    let estimatedFontSize = (containerWidth / (textLength * charWidthFactor)) * comfortZone;

    estimatedFontSize = Math.min(Math.max(estimatedFontSize, minFontSize), maxFontSize);
    setFontSize(estimatedFontSize);
  };

  useEffect(() => {
    const handleResize = debounce(calculateFontSize, debounceDelay);
    calculateFontSize(); // Inicial

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [text, minFontSize, maxFontSize, comfortZone, debounceDelay, charWidthFactor]);

  return { fontSize, containerRef };
}
