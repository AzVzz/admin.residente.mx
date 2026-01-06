import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Rutas que NO deben tener el viewport ajustado (usan viewport móvil normal)
const RUTAS_VIEWPORT_NORMAL = ['/registrob2b', '/registroinvitados', '/registrocolaboradores'];

const ViewportAdjuster = () => {
    const location = useLocation();

    useEffect(() => {
        const updateViewport = () => {
            const currentPath = window.location.pathname;
            let viewportMeta = document.querySelector('meta[name="viewport"]');
            
            // Si estamos en una ruta que necesita viewport normal, no ajustar
            if (RUTAS_VIEWPORT_NORMAL.includes(currentPath)) {
                if (viewportMeta) {
                    viewportMeta.content = 'width=device-width, initial-scale=1, user-scalable=yes';
                }
                return;
            }

            const viewportWidth = window.innerWidth;
            const userAgent = navigator.userAgent.toLowerCase();
            let viewportContent = 'width=device-width, initial-scale=1, user-scalable=yes';

            // Detectar iPad específicamente
            const isIPad = /ipad/.test(userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

            if (isIPad) {
                viewportContent = 'initial-scale=0.6, user-scalable=yes';
            }
            // Detectar dispositivos móviles
            else if (viewportWidth <= 768 || /android|webos|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
                viewportContent = 'initial-scale=0.3, user-scalable=yes';
            }

            // Actualizar el meta viewport
            if (viewportMeta) {
                viewportMeta.content = viewportContent;
            }
        };

        // Ejecutar al cargar y cuando cambia la ruta
        updateViewport();
        setTimeout(updateViewport, 100); // Pequeño retraso para asegurar que el DOM esté listo

        // Escuchar cambios
        window.addEventListener('resize', updateViewport);
        window.addEventListener('orientationchange', updateViewport);

        return () => {
            window.removeEventListener('resize', updateViewport);
            window.removeEventListener('orientationchange', updateViewport);
        };
    }, [location.pathname]); // Re-ejecutar cuando cambia la ruta

    return null;
};

export default ViewportAdjuster;