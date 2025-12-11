//src/componentes/promociones/PromoMainTest.jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../Context';
import { toPng } from 'html-to-image';
import FormularioPromoTest from "./componentes/FormularioPromoTest";
import TicketPromo from "./componentes/TicketPromo";
import FormularioPromoExt from './componentes/FormularioPromoExt';
import { cuponCrear } from '../../componentes/api/cuponesGet';
import { restaurantesBasicosGet } from '../../componentes/api/restaurantesBasicosGet.js';
import { Iconografia } from '../../componentes/utils/Iconografia.jsx'

const PromoMain = () => {
    const { usuario, token } = useAuth();
    const [formData, setFormData] = useState({
        restaurantName: "",
        promoName: "",
        promoSubtitle: "",
        descPromo: "",
        fechaValidez: "",
<<<<<<< HEAD
        fechaInicio: "",
        fechaFin: "",
        esPermanente: true, // NUEVO - Default a true por ahora
        zonaHoraria: "America/Monterrey" // Default
=======
        seo_alt_text: "",
        seo_title: "",
        seo_keyword: "",
        meta_description: ""
>>>>>>> 6c1021639701b10ce5bf1e2bcd982fe266529c52
    });

    const [selectedStickers, setSelectedStickers] = useState([]);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [restaurantes, setRestaurantes] = useState([]);
    const [selectedRestauranteId, setSelectedRestauranteId] = useState("");
    const [restauranteInfo, setRestauranteInfo] = useState(null);
    const ticketRef = useRef(null);

    useEffect(() => {
        restaurantesBasicosGet()
            .then(data => setRestaurantes(data))
            .catch(err => console.error("Error cargando restaurantes:", err));
    }, []);

    const handleRestauranteChange = (e) => {
        const id = e.target.value;
        setSelectedRestauranteId(id);
        const info = restaurantes.find(r => String(r.id) === String(id));
        setRestauranteInfo(info || null);
        setFormData(prev => ({
            ...prev,
            restaurantName: info ? info.nombre_restaurante : ""
        }));
    };

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleStickerSelect = (claves) => {
        setSelectedStickers(claves);
    };
    const getStickerUrls = () => {
        const allStickers = [
            ...Iconografia.categorias,
            ...Iconografia.ocasiones,
            ...Iconografia.zonas
        ];
        return selectedStickers.map(clave => {
            const found = allStickers.find(item => item.clave === clave);
            return found ? found.icono : null;
        }).filter(Boolean);
    };

    const handleDownload = async () => {
        if (ticketRef.current) {
            try {
                const dataUrl = await toPng(ticketRef.current, {
                    quality: 0.95,
                    background: 'transparent',
                    pixelRatio: 5
                });

                const link = document.createElement('a');
                link.download = `promo-${formData.restaurantName || 'ticket'}.png`;
                link.href = dataUrl;
                link.click();
            } catch (error) {
                console.error('Error al generar la imagen:', error);
                alert('Error al generar la imagen');
            }
        }
    };

    // 🟢 FUNCIÓN PARA OBTENER LOS ESTILOS DE LOS CAMPOS DEL TICKET
    const getTicketEstilosCampos = () => {
        if (!ticketRef.current) return {};
        const h1 = ticketRef.current.querySelector('h1');
        const h3s = ticketRef.current.querySelectorAll('h3');
        const p = ticketRef.current.querySelector('p');
        const h2 = ticketRef.current.querySelector('h2'); // Cambia span por h2

        return {
            nombre_restaurante: h1 ? {
                fontSize: window.getComputedStyle(h1).fontSize,
                color: window.getComputedStyle(h1).color
            } : {},
            titulo: h3s[0] ? {
                fontSize: window.getComputedStyle(h3s[0]).fontSize,
                color: window.getComputedStyle(h3s[0]).color
            } : {},
            subtitulo: h3s[1] ? { // El subtitulo es el segundo h3
                fontSize: window.getComputedStyle(h3s[1]).fontSize,
                color: window.getComputedStyle(h3s[1]).color
            } : {},
            descripcion: p ? {
                fontSize: window.getComputedStyle(p).fontSize,
                color: window.getComputedStyle(p).color
            } : {},
            fecha_validez: h2 ? { // La validez está en h2
                fontSize: window.getComputedStyle(h2).fontSize,
                color: window.getComputedStyle(h2).color
            } : {}
        };
    };

    const prepareApiData = () => {
        const restauranteSeleccionado = restaurantes.find(r => String(r.id) === String(selectedRestauranteId));
        const stickerClave = selectedStickers[0] || "";

        // Función auxiliar para convertir fecha local + zona horaria a ISO string con offset
        const formatWithTimezone = (dateString, timeZone) => {
            if (!dateString) return null;

            // Creamos una fecha "base" asumiendo que el input es UTC para extraer componentes
            // Esto es porque datetime-local da "YYYY-MM-DDTHH:mm" sin zona
            const date = new Date(dateString);

            // Obtenemos los componentes de la fecha seleccionada
            // Nota: Usamos métodos UTC porque queremos los valores literales que el usuario ingresó
            // Ejemplo: Usuario pone 10:00, dateString es "...T10:00", new Date() en local podría variar, 
            // pero si parseamos el string directamente es más seguro.
            // Mejor enfoque: Crear fecha usando el string y forzar la interpretación en la zona horaria deseada.

            // Enfoque robusto sin librerías externas:
            // 1. Crear una fecha que represente ese instante en la zona horaria destino
            // 2. Obtener el ISO string

            try {
                // Truco: Usamos toLocaleString con la zona horaria deseada para ver "qué hora es realmente"
                // Pero aquí queremos lo contrario: El usuario dice "Son las 10:00 en Monterrey".
                // Queremos el Timestamp que corresponde a eso.

                // Creamos una fecha arbitraria y buscamos el offset
                // Esto es complejo sin librerías. Vamos a simplificar asumiendo offsets fijos por ahora 
                // o usando un enfoque de "Fecha Local" -> "UTC"

                // Vamos a guardar la fecha tal cual con el offset calculado manualmente para las zonas comunes de MX
                // Monterrey/CDMX: UTC-6 (Todo el año ahora)
                // Tijuana: UTC-8 (Invierno) / UTC-7 (Verano)
                // Chihuahua: UTC-7 (Invierno) / UTC-6 (Verano) - A veces cambia
                // Cancun: UTC-5

                let offset = -6; // Default Monterrey
                if (timeZone === 'America/Tijuana') offset = -8; // Simplificación (debería detectar horario verano)
                if (timeZone === 'America/Chihuahua') offset = -7;
                if (timeZone === 'America/Cancun') offset = -5;

                // Ajuste fino para horario de verano si fuera necesario, pero por ley 2022 MX eliminó horario verano en mayoría
                // Tijuana y frontera norte SÍ tienen horario de verano (sincronizado con USA)
                // Vamos a usar una aproximación simple o dejar que el backend maneje si enviamos la zona.
                // Pero el backend espera un string de fecha.

                // Mejor opción: Construir el ISO string con el offset explícito
                // Input: "2023-10-27T10:30"
                // Output deseado: "2023-10-27T10:30:00-06:00"

                const offsetHours = Math.abs(Math.floor(offset));
                const offsetSign = offset < 0 ? '-' : '+';
                const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:00`;

                return `${dateString}:00${offsetString}`;
            } catch (e) {
                console.error("Error formateando fecha:", e);
                return null;
            }
        };

        const zonaHoraria = formData.zonaHoraria || "America/Monterrey";

        return {
            nombre_restaurante: formData.restaurantName,
            titulo: formData.promoName,
            subtitulo: formData.promoSubtitle,
            descripcion: formData.descPromo,
            icon: stickerClave,
            email: formData.emailPromo || "",
            tipo: 'promo',
            link: formData.urlPromo || "",
            fecha_validez: formData.fechaValidez,
            fecha_inicio: formData.esPermanente ? null : formatWithTimezone(formData.fechaInicio, zonaHoraria),
            fecha_fin: formData.esPermanente ? null : formatWithTimezone(formData.fechaFin, zonaHoraria),
            es_permanente: formData.esPermanente,
            zona_horaria: zonaHoraria, // Guardamos la zona horaria también por si acaso
            metadata: JSON.stringify({
                sticker_url: stickerClave,
                zona_horaria: zonaHoraria
            }),
            secciones_categorias: restauranteSeleccionado?.secciones_categorias || undefined,
<<<<<<< HEAD
            estilos_campos: getTicketEstilosCampos()
=======
            estilos_campos: getTicketEstilosCampos(), // 🟢 AGREGA LOS ESTILOS AQUÍ
            seo_alt_text: formData.seo_alt_text,
            seo_title: formData.seo_title,
            seo_keyword: formData.seo_keyword,
            meta_description: formData.meta_description
>>>>>>> 6c1021639701b10ce5bf1e2bcd982fe266529c52
        };
    };

    const handleGuardar = async () => {
        setSaveSuccess(false);
        setSaveError(null);
        setIsPosting(true);

        try {
            if (!ticketRef.current) throw new Error("No se encontró el ticket para generar la imagen");

            if (!formData.esPermanente) {
                if (!formData.fechaInicio || !formData.fechaFin) throw new Error("Debes seleccionar fecha de inicio y fin, o marcar como Permanente");
            }

            // 1. Generar la imagen
            const dataUrl = await toPng(ticketRef.current, {
                quality: 0.95,
                pixelRatio: 5,
                backgroundColor: 'transparent'
            });

            // 2. Convertir base64 limpio
            const base64Image = dataUrl.split(',')[1];

            // 3. Preparar datos del formulario
            const apiData = prepareApiData();
            apiData.imagen_base64 = base64Image; // agregar imagen al payload

            // 4. Llamar a tu endpoint con el TOKEN
            const response = await cuponCrear(apiData, token);
            console.log("✅ Promoción creada:", response);

            setSaveSuccess(true);
        } catch (error) {
            console.error("Error al guardar promoción:", error);
            setSaveError(error.message || 'Error al guardar la promoción');
        } finally {
            setIsPosting(false);
        }
    };

    // Mostrar mensaje cuando hay éxito o error
    useEffect(() => {
        if (saveSuccess || saveError) {
            setShowMessage(true);
            const hideTimer = setTimeout(() => setShowMessage(false), 2700); // inicia transición antes de quitar el mensaje
            const clearTimer = setTimeout(() => {
                setSaveSuccess(false);
                setSaveError(null);
            }, 3000);
            return () => {
                clearTimeout(hideTimer);
                clearTimeout(clearTimer);
            };
        }
    }, [saveSuccess, saveError]);

    return (
        <div>
            <div className="grid grid-cols-2 gap-5">
                <FormularioPromoTest
                    formData={formData}
                    onFieldChange={handleFieldChange}
                    restaurantes={restaurantes}
                    selectedRestauranteId={selectedRestauranteId}
                    onRestauranteChange={handleRestauranteChange}
                />
                <div className="bg-[#3B3B3C] w-auto h-auto px-14 pt-10 pb-10 shadow-lg relative flex flex-col">
                    {/* Mensajes de éxito/error flotantes con transición */}
                    {(saveSuccess || saveError) && (
                        <div
                            className={`absolute top-3 left-1/2 transform -translate-x-1/2 z-20 w-[90%] transition-opacity duration-300 ${showMessage ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            {saveSuccess && (
                                <div className="p-3 bg-green-100 text-green-700 rounded-md text-center shadow-lg">
                                    ¡Promoción guardada exitosamente!
                                </div>
                            )}
                            {saveError && (
                                <div className="p-3 bg-red-100 text-red-700 rounded-md text-center shadow-lg">
                                    Error: {saveError}
                                </div>
                            )}
                        </div>
                    )}

                    <TicketPromo
                        ref={ticketRef}
                        nombreRestaurante={formData.restaurantName}
                        nombrePromo={formData.promoName}
                        subPromo={formData.promoSubtitle}
                        descripcionPromo={formData.descPromo}
                        validezPromo={formData.fechaValidez}
                        stickerUrl={getStickerUrls()[0]}
                    />
                    <div className="flex flex-row w-full gap-2 pt-5 pr-11 mt-auto">
                        <button
                            onClick={handleDownload}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
                        >
                            Descargar (PNG)
                        </button>
                        <button
                            onClick={handleGuardar}
                            disabled={isPosting}
                            className={`flex-1 bg-white hover:bg-yellow-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer ${isPosting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isPosting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="pt-4">
                <FormularioPromoExt
                    stickerSeleccionado={selectedStickers}
                    onStickerSelect={handleStickerSelect}
                />
            </div>
        </div>
    )
}

export default PromoMain;
