import { useEffect } from 'react';

const ViewportAdjuster = () => {
    useEffect(() => {
        const updateViewport = () => {
            const screenWidth = window.screen.width;
            let viewportContent = 'width=device-width, initial-scale=1, user-scalable=yes';

            if (screenWidth <= 768) { // Móviles
                viewportContent = 'initial-scale=0.3, user-scalable=yes';
            } else if (screenWidth > 768 && screenWidth <= 1024) { // Tablets
                viewportContent = 'initial-scale=0.6, user-scalable=yes';
            }

            // Actualizar o crear el meta viewport
            let viewportMeta = document.querySelector('meta[name="viewport"]');
            if (!viewportMeta) {
                viewportMeta = document.createElement('meta');
                viewportMeta.name = 'viewport';
                document.head.appendChild(viewportMeta);
            }
            viewportMeta.content = viewportContent;
        };

        // Ejecutar al cargar
        updateViewport();

        // Escuchar cambios de orientación y redimensionamiento
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