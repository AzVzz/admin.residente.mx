import { useEffect } from 'react';

const ViewportAdjuster = () => {
    useEffect(() => {
        const updateViewport = () => {
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
            let viewportMeta = document.querySelector('meta[name="viewport"]');
            if (viewportMeta) {
                viewportMeta.content = viewportContent;
            }
        };

        // Ejecutar al cargar
        setTimeout(updateViewport, 100); // Pequeño retraso para asegurar que el DOM esté listo

        // Escuchar cambios
        window.addEventListener('resize', updateViewport);
        window.addEventListener('orientationchange', updateViewport);

        return () => {
            window.removeEventListener('resize', updateViewport);
            window.removeEventListener('orientationchange', updateViewport);
        };
    }, []);

    return null;
};

export default ViewportAdjuster;