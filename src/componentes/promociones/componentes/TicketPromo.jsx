//src/componentes/promociones/componentes/TicketPromo.jsx
import { forwardRef, useEffect, useRef, useState } from 'react';
import { urlApi, imgApi } from '../../api/url';

const sizeConfig = {
    large: {
        container: "w-90 min-h-[670px]",
        padding: "px-5 py-4 pt-6",
        logo: "h-10",
        fontSizes: {
            restaurant: { initial: 38, min: 10 },
            promo: { initial: 200, min: 20 },
            sub: { initial: 150, min: 15 }
        },
        description: "text-[18px] leading-[20px]",
        validity: "text-xl py-2",
        barcode: "h-20",
        sticker: "absolute top-15 left-75 w-26 h-26",
        perforatedTop: "w-90",
        perforatedBottom: "w-90"
    },
    small: {
        container: "w-45 min-h-84 max-h-84",
        padding: "px-2 pt-1 pb-1",
        logo: "h-4.5",
        fontSizes: {
            restaurant: { initial: 20, min: 10 }, // Valores ajustados para el nombre del restaurante
            promo: { initial: 102, min: 14 },
            sub: { initial: 62, min: 10 }
        },
        description: "leading-[12px] text-[10px]",
        validity: "text-[8px] py-0.4",
        barcode: "h-8",
        sticker: "absolute top-4 right-[-10px] w-11 h-11",
        perforatedTop: "w-45",
        perforatedBottom: "w-45",
        className: "cursor-pointer"
    }
};

// Helper para usar proxy en desarrollo y evitar CORS con html-to-image
const getProxiedUrl = (url) => {
    if (!url) return url;
    // Si estamos en localhost, usar el proxy del backend
    if (window.location.hostname === 'localhost') {
        return `http://localhost:3000/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
};

const TicketPromo = forwardRef((props, ref) => {
    const {
        className = "",
        size = "large", // "large" o "small"
        ...rest
    } = props;
    const {
        nombreRestaurante,
        nombrePromo,
        subPromo,
        descripcionPromo,
        validezPromo,
        stickerUrl
    } = props;

    const config = sizeConfig[size];

    // Referencias para los elementos del DOM
    const promoTextRef = useRef(null);
    const restaurantNameRef = useRef(null);
    const burgersRef = useRef(null);
    const containerRef = useRef(null);

    // Estados para los tamaños de fuente
    const [promoFontSize, setPromoFontSize] = useState(config.fontSizes.promo.initial);
    const [restaurantNameFontSize, setRestaurantNameFontSize] = useState(config.fontSizes.restaurant.initial);
    const [burgersFontSize, setBurgersFontSize] = useState(config.fontSizes.sub.initial);

    // Estados para los textos
    const [promoText, setPromoText] = useState(nombrePromo);
    const [burgersText, setBurgersText] = useState(subPromo);
    const [restaurantNameText, setRestaurantNameText] = useState(nombreRestaurante);

    // Sincronizar los estados internos con los props
    useEffect(() => { setPromoText(nombrePromo); }, [nombrePromo]);
    useEffect(() => { setBurgersText(subPromo); }, [subPromo]);
    useEffect(() => { setRestaurantNameText(nombreRestaurante); }, [nombreRestaurante]);

    // Función para ajustar el tamaño de fuente
    const adjustFontSize = (ref, setSize, initialSize, minSize, step = 1) => {
        if (!ref.current || !containerRef.current) return;
        const container = containerRef.current;
        const text = ref.current;

        // Ajusta el padding según si es el título del restaurante o no
        const isPaddingSensitive = ref === restaurantNameRef;
        const containerWidth = container.offsetWidth - (isPaddingSensitive ? (size === 'small' ? 16 : 40) : (size === 'small' ? 24 : 40));

        // Guardar estilos originales
        const originalDisplay = text.style.display;
        const originalVisibility = text.style.visibility;

        // Hacer el elemento invisible para el cálculo
        text.style.display = 'inline-block';
        text.style.visibility = 'hidden';

        // Usar un tamaño de paso más pequeño para el título del restaurante en modo small
        const actualStep = (size === 'small' && isPaddingSensitive) ? 0.5 : step;

        let currentSize = initialSize;
        text.style.fontSize = `${currentSize}px`;

        // Reducir el tamaño hasta que quepa o se alcance el mínimo
        while (text.scrollWidth > containerWidth && currentSize > minSize) {
            currentSize -= actualStep;
            text.style.fontSize = `${currentSize}px`;
        }

        // Si el texto es el título del restaurante y estamos en modo small,
        // asegurarnos de que no sea demasiado pequeño
        if (isPaddingSensitive && size === 'small' && currentSize < 14) {
            currentSize = 14; // Establecer un mínimo absoluto para garantizar legibilidad
        }

        setSize(currentSize);

        // Restaurar estilos
        text.style.display = originalDisplay;
        text.style.visibility = originalVisibility;
    };

    // Efecto para ajustar todos los textos
    useEffect(() => {
        const adjustAll = () => {
            adjustFontSize(restaurantNameRef, setRestaurantNameFontSize, config.fontSizes.restaurant.initial, config.fontSizes.restaurant.min);
            adjustFontSize(promoTextRef, setPromoFontSize, config.fontSizes.promo.initial, config.fontSizes.promo.min, 2);
            adjustFontSize(burgersRef, setBurgersFontSize, config.fontSizes.sub.initial, config.fontSizes.sub.min);
        };

        adjustAll();
        window.addEventListener('resize', adjustAll);

        return () => {
            window.removeEventListener('resize', adjustAll);
        };
    }, [promoText, burgersText, restaurantNameText, size]);

    useEffect(() => {
        setRestaurantNameFontSize(config.fontSizes.restaurant.initial);
        setPromoFontSize(config.fontSizes.promo.initial);
        setBurgersFontSize(config.fontSizes.sub.initial);
    }, [
        size,
        config.fontSizes.restaurant.initial,
        config.fontSizes.restaurant.min,
        config.fontSizes.promo.initial,
        config.fontSizes.promo.min,
        config.fontSizes.sub.initial,
        config.fontSizes.sub.min
    ]);

    // Añade esta función para limitar el texto
    const limitText = (text, limit) => {
        if (!text) return '';
        if (text.length <= limit) return text;
        return text.substring(0, limit) + '...';
    };

    return (
        <div
            ref={ref}
            className={`relative ${className}`}
            style={{ background: 'transparent' }}
        >
            {/* Perforated top edge */}
            <div className={config.perforatedTop || "w-full"}>
                <img
                    src={`${imgApi}fotos/fotos-estaticas/componente-sin-carpetas/orilla-ticket-top.webp`}
                    alt="Perforado superior"
                    className="w-full"
                />
            </div>

            <div
                ref={containerRef}
                className={`flex flex-col bg-white ${config.container} relative`}
            >
                {stickerUrl && (
                    <img
                        src={stickerUrl}
                        alt="Sticker"
                        className={`${config.sticker}  flex items-center justify-center z-10`}
                        style={{ filter: 'drop-shadow(-1px 1.5px 0.8px rgba(0,0,0,0.25))' }}
                    />
                )}

                {/* Main content */}
                <div className={`${config.padding} flex-1 flex flex-col`}>
                    <div className="mb-1 z-20">
                        <img
                            src={getProxiedUrl(`${imgApi}fotos/fotos-estaticas/residente-logos/grises/discpromo-logo-gris.webp`)}
                            alt="Residente Discy Promo Logo"
                            className={config.logo}
                        />
                    </div>
                    <div className="flex-grow flex flex-col justify-end">
                        <h1
                            ref={restaurantNameRef}
                            className="w-full bg-black text-white font-black uppercase px-2 text-center leading-tight whitespace-nowrap overflow-hidden mb-2"
                            style={{ fontSize: `${restaurantNameFontSize}px` }}
                        >
                            {restaurantNameText}
                        </h1>
                        <div className="text-center">
                            <h3
                                ref={promoTextRef}
                                className="whitespace-nowrap overflow-hidden font-black text-center"
                                style={{
                                    fontSize: `${promoFontSize}px`,
                                    lineHeight: '0.85',
                                    letterSpacing: '-2px',
                                    margin: 0,
                                    marginBottom: 0,
                                    padding: 0,
                                    display: 'block'
                                }}
                            >
                                {promoText}
                            </h3>
                            <h3
                                ref={burgersRef}
                                className="font-black text-center whitespace-nowrap overflow-hidden"
                                style={{
                                    fontSize: `${burgersFontSize}px`,
                                    lineHeight: '0.85',
                                    letterSpacing: '-2px',
                                    margin: 0,
                                    marginBottom: 0,
                                    marginTop: 0,
                                    padding: 0,
                                    display: 'block'
                                }}
                            >
                                {burgersText}
                            </h3>
                        </div>
                        <p className={`font-black font-roman mt-1 text-gray-800 ${config.description}`}>
                            {size === 'small' ? limitText(descripcionPromo, 160) : descripcionPromo}
                        </p>
                    </div>
                </div>

                {/* Footer section */}
                <div className="mt-auto">
                    <div className={`border-t-2 border-dashed border-gray-300 ${config.validity} text-center font-bold text-gray-600`}>
                        VÁLIDO: {validezPromo}
                    </div>
                    <div className="flex justify-center py-2">
                        <img
                            src={`${imgApi}fotos/fotos-estaticas/componente-sin-carpetas/barcode.webp`}
                            alt="Código de barras"
                            className={config.barcode}
                        />
                    </div>
                </div>
            </div>

            {/* Perforated bottom edge */}
            <div className={config.perforatedBottom || "w-full"}>
                <img
                    src={`${imgApi}fotos/fotos-estaticas/componente-sin-carpetas/orilla-ticket-bottom.webp`}
                    alt="Perforado inferior"
                    className="w-full"
                />
            </div>
        </div>
    );
});

TicketPromo.displayName = 'TicketPromo';

export default TicketPromo;