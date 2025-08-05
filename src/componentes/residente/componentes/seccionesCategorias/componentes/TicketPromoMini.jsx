//src/componentes/promociones/componentes/TicketPromo.jsx
import { forwardRef, useEffect, useRef, useState } from 'react';
import { urlApi } from '../../../../api/url';

const TicketPromoMini = forwardRef((props, ref) => {
    const { className = "", ...rest } = props;
    const {
        nombreRestaurante = "McDonals",
        nombrePromo = "2x122",
        subPromo = "Pizza",
        descripcionPromo = "Antojo $69 INCLUYE: 2 GORDITAS DE LA CATEGORÍA CLÁSICAS + 1 AGUA FRESCA REFILL. PRODUCTO EXCLUSIVO PARA COMEDOR, NO APLICA PARA LLEVAR NI OTRO CANAL DE VENTAS. NO SE PUEDEN HACER CAMBIOS EN LA ORDEN. SUJETO A DISPONIBILIDAD DE TIENDA.",
        validezPromo = "Vigencia hasta el 5 de octubre del 2025",
        stickerUrl
    } = props;
    // Referencias para los elementos del DOM
    const promoTextRef = useRef(null);
    const restaurantNameRef = useRef(null);
    const burgersRef = useRef(null); // Asegúrate de tener esta línea
    const containerRef = useRef(null);

    // Estados para los tamaños de fuente
    const [promoFontSize, setPromoFontSize] = useState(120);
    const [restaurantNameFontSize, setRestaurantNameFontSize] = useState(38);
    const [burgersFontSize, setBurgersFontSize] = useState(24);

    // Estados para los textos (para sincronizar con props)
    const [promoText, setPromoText] = useState(nombrePromo);
    const [burgersText, setBurgersText] = useState(subPromo);
    const [restaurantNameText, setRestaurantNameText] = useState(nombreRestaurante);



    // Sincronizar los estados internos con los props
    useEffect(() => {
        setPromoText(nombrePromo);
    }, [nombrePromo]);

    useEffect(() => {
        setBurgersText(subPromo);
    }, [subPromo]);

    useEffect(() => {
        setRestaurantNameText(nombreRestaurante);
    }, [nombreRestaurante]);

    // Función para ajustar el tamaño de fuente de un elemento (crecimiento bidireccional)
    const adjustFontSize = (ref, setSize, initialSize, minSize, step = 1) => {
        if (!ref.current || !containerRef.current) return;

        const container = containerRef.current;
        const text = ref.current;
        const containerWidth = container.offsetWidth - 20; // Considerar padding en la tarjeta normal 40

        // Guardar estilos originales
        const originalDisplay = text.style.display;
        const originalVisibility = text.style.visibility;

        // Hacer el elemento invisible para el cálculo
        text.style.display = 'inline-block';
        text.style.visibility = 'hidden';

        // Primero intentamos con el tamaño inicial
        let currentSize = initialSize;
        text.style.fontSize = `${currentSize}px`;
        
        // Si el texto es demasiado grande, lo reducimos
        while (text.scrollWidth > containerWidth && currentSize > minSize) {
            currentSize -= step;
            text.style.fontSize = `${currentSize}px`;
        }
        
        // Si hay espacio extra, intentamos aumentar el tamaño
        const maxSize = initialSize * 1.5; // Permitimos hasta 50% más grande que el inicial
        while (text.scrollWidth < containerWidth * 0.9 && currentSize < maxSize) {
            currentSize += step;
            text.style.fontSize = `${currentSize}px`;
            
            // Si se vuelve demasiado grande, retrocedemos un paso
            if (text.scrollWidth > containerWidth) {
                currentSize -= step;
                text.style.fontSize = `${currentSize}px`;
                break;
            }
        }

        setSize(currentSize);

        // Restaurar estilos
        text.style.display = originalDisplay;
        text.style.visibility = originalVisibility;
    };

    // Efecto para ajustar todos los textos
    useEffect(() => {
        const adjustAll = () => {
            adjustFontSize(restaurantNameRef, setRestaurantNameFontSize, 58, 10);
            adjustFontSize(promoTextRef, setPromoFontSize, 200, 20, 2);
            adjustFontSize(burgersRef, setBurgersFontSize, 150, 15);
        };

        adjustAll();
        window.addEventListener('resize', adjustAll);

        return () => {
            window.removeEventListener('resize', adjustAll);
        };
    }, [promoText, burgersText, restaurantNameText]); // Dependencias: los textos que pueden cambiar

    return (
        <div
            ref={ref}
            className={`relative pt-2 ${className}`} //pb-2 pr-11
            style={{
                background: 'transparent', // Fondo transparente
            }}
        >

            {/* Perforated top edge */}
            <img
                src={`${urlApi}fotos/fotos-estaticas/componente-sin-carpetas/orilla-ticket-top.webp`}
                alt="Perforado superior"
                className="w-45 h-auto"
            />

            <div
                ref={containerRef}
                className="flex flex-col bg-white w-45 "
                style={{
                    boxShadow: '-2px 3px 3px rgba(0,0,0,0.25)'
                }}
            >
                {
                    stickerUrl && (
                        <img
                            src={stickerUrl}
                            alt="Sticker"
                            className="absolute top-15 left-75 w-26 h-26 bg-[#FFF200] rounded-full flex items-center justify-center shadow-[-2px_3px_3px_rgba(0,0,0,0.25)]"
                        />
                    )
                }


                {/* Main content */}
                <div className="flex-1 flex flex-col">
                    <div className="mb-2 z-20 px-2 pt-2">
                        <img
                            src={`${urlApi}fotos/fotos-estaticas/residente-logos/grises/discpromo-logo-gris.webp` || "/placeholder.svg"}
                            alt="Residente Discy Promo Logo"
                            className="w-14"
                        />
                    </div>

                    <div className="flex-grow flex flex-col justify-end px-2">
                        <h1
                            ref={restaurantNameRef}
                            className="w-full bg-black text-white font-black uppercase px-2 text-center leading-tight whitespace-nowrap overflow-hidden"
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
                                    margin: 0,
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
                                    margin: 0,
                                    padding: 0,
                                    display: 'block'
                                }}
                            >
                                {burgersText}
                            </h3>
                        </div>

                        <p className="leading-[10px] text-[10px] text-gray-800 font-black font-roman">
                            {descripcionPromo}
                        </p>
                    </div>
                </div>
                {/* Bottom section */}
                <div className="bg-[#FFF200] px-2 py-1.5 mt-auto relative">
                    <h2 className="text-[8px] mb-1 bg-black text-white text-center font-light font-roman leading-tight py-0.5">
                        {validezPromo}
                    </h2>
                    <img
                        src={`${urlApi}fotos/fotos-estaticas/componente-sin-carpetas/barcode.avif` || "/placeholder.svg"}
                        alt="Código de barras"
                        className="w-full h-8.5 object-fill z-30 relative"
                    />

                </div>

            </div>
            {/* Perforated bottom edge */}
            <img src={`${urlApi}fotos/fotos-estaticas/componente-sin-carpetas/orilla-ticket-bottom.webp`} alt="Perforado inferior" className="w-45 h-auto" />
        </div>
    );
});

export default TicketPromoMini;