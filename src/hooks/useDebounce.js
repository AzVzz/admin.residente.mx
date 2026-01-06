import { useState, useEffect } from 'react';

/**
 * Hook para hacer debounce de un valor
 * @param {any} value - El valor a debounce
 * @param {number} delay - Milisegundos de delay (default: 300ms)
 * @returns {any} - El valor debounced
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cancelar el timeout si el valor cambia antes de que expire
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
