//src/componentes/promociones/componentes/TicketPromo.jsx
import { forwardRef, useEffect, useRef, useState } from 'react';
import ResidenteDiscyPromo from '../../../imagenes/logos/grises/DiscPromo_Logo_Gris.png';
import BarCode from '../../../imagenes/barcode.avif';
import perforatedTop from '../../../imagenes/orilla-ticket-top.png';
import perforatedBottom from '../../../imagenes/orilla-ticket-bottom.png'

const TicketPromo = forwardRef((props, ref) => {
    const {
        nombreRestaurante,
        nombrePromo,
        subPromo,
        descripcionPromo,
        validezPromo,
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

    // Función para ajustar el tamaño de fuente de un elemento
    const adjustFontSize = (ref, setSize, initialSize, minSize, step = 1) => {
        if (!ref.current || !containerRef.current) return;

        const container = containerRef.current;
        const text = ref.current;
        const containerWidth = container.offsetWidth - 40; // Considerar padding

        // Guardar estilos originales
        const originalDisplay = text.style.display;
        const originalVisibility = text.style.visibility;

        // Hacer el elemento invisible para el cálculo
        text.style.display = 'inline-block';
        text.style.visibility = 'hidden';

        let currentSize = initialSize;
        text.style.fontSize = `${currentSize}px`;

        // Reducir el tamaño hasta que quepa o se alcance el mínimo
        while (text.scrollWidth > containerWidth && currentSize > minSize) {
            currentSize -= step;
            text.style.fontSize = `${currentSize}px`;
        }

        setSize(currentSize);

        // Restaurar estilos
        text.style.display = originalDisplay;
        text.style.visibility = originalVisibility;
    };

    // Efecto para ajustar todos los textos
    useEffect(() => {
        const adjustAll = () => {
            adjustFontSize(restaurantNameRef, setRestaurantNameFontSize, 38, 10);
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
            className="relative pt-2 pb-2 pr-11"
            style={{
                background: 'transparent', // Fondo transparente
            }}
        >
            <div
                ref={containerRef}
                className="flex flex-col bg-white w-90 h-[670px] shadow-lg mx-auto relative"
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

                {/* Perforated top edge */}
                <div className="absolute left-0 right-0 z-20 -top-2">
                    <img
                        src={perforatedTop}
                        alt="Perforado superior"
                        className="w-full"
                    />
                </div>


                {/* Main content */}
                <div className="px-5 py-4 pt-6 flex-1 flex flex-col ">
                    <div className="mb-4 z-20">
                        <img
                            src={ResidenteDiscyPromo || "/placeholder.svg"}
                            alt="Residente Discy Promo Logo"
                            className="h-12"
                        />
                    </div>

                    <div className="flex-grow flex flex-col justify-end">
                        <h1
                            ref={restaurantNameRef}
                            className="w-full bg-black text-white font-black uppercase px-2 text-center leading-tight mb-0 whitespace-nowrap overflow-hidden"
                            style={{ fontSize: `${restaurantNameFontSize}px` }}
                        >
                            {restaurantNameText}
                        </h1>

                        <div className="text-center mb-0">
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
                                className="uppercase font-black text-center whitespace-nowrap overflow-hidden"
                                style={{
                                    fontSize: `${burgersFontSize}px`,
                                    lineHeight: '0.85',
                                    margin: 0,
                                    padding: 0,
                                    marginTop: '-0.1em',
                                    display: 'block'
                                }}
                            >
                                {burgersText}
                            </h3>
                        </div>

                        <p className="leading-[18px] text-[18px] text-gray-800 font-black font-roman mt-0">
                            {descripcionPromo}
                        </p>
                    </div>
                </div>
                {/* Bottom section */}
                <div className="bg-[#FFF200] px-5 py-3 pb-3 mt-auto relative">
                    <h2 className="text-xl mb-2 bg-black text-white text-center font-light font-roman">
                        {validezPromo}
                    </h2>
                    <img
                        src={BarCode || "/placeholder.svg"}
                        alt="Código de barras"
                        className="w-full h-20 object-fill z-30 relative"
                    />
                    {/* Borde inferior perforado - AHORA DENTRO del contenedor */}
                    <div className="absolute left-0 right-0 bottom-[-8px] z-20">
                        <img
                            src={perforatedBottom}
                            alt="Perforado inferior"
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Perforated bottom edge */}

            </div>
        </div>
    );
});

export default TicketPromo;