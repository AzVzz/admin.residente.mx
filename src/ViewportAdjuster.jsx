import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RUTAS_VIEWPORT_NORMAL = ['/registrob2b', '/registroinvitados', '/registrocolaboradores'];

const ViewportAdjuster = () => {
    const location = useLocation();

    useEffect(() => {
        const updateViewport = () => {
            const currentPath = window.location.pathname;
            let viewportMeta = document.querySelector('meta[name="viewport"]');

            const esRutaNormal = RUTAS_VIEWPORT_NORMAL.some(
                ruta => currentPath === ruta || currentPath.endsWith(ruta)
            );

            if (esRutaNormal) {
                if (viewportMeta) {
                    viewportMeta.content = 'width=device-width, initial-scale=1, user-scalable=yes';
                }
                return;
            }

            const viewportWidth = window.innerWidth;
            const userAgent = navigator.userAgent.toLowerCase();
            let viewportContent = 'width=device-width, initial-scale=1, user-scalable=yes';

            const isIPad = /ipad/.test(userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

            if (isIPad) {
                viewportContent = 'width=1280, user-scalable=yes';
            } else if (viewportWidth <= 768 || /android|webos|iphone|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
                viewportContent = 'width=device-width, initial-scale=1, user-scalable=yes';
            }

            if (viewportMeta) {
                viewportMeta.content = viewportContent;
            }
        };

        updateViewport();
        setTimeout(updateViewport, 100);

        window.addEventListener('resize', updateViewport);
        window.addEventListener('orientationchange', updateViewport);

        return () => {
            window.removeEventListener('resize', updateViewport);
            window.removeEventListener('orientationchange', updateViewport);
        };
    }, [location.pathname]);

    return null;
};

export default ViewportAdjuster;