//src/componentes/promociones/PromoMain.jsx
import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import FormularioPromo from "./componentes/FormularioPromo";
import TicketPromo from "./componentes/TicketPromo";
import FormularioPromoExt from './componentes/FormularioPromoExt';
import { ticketCrear } from '../../componentes/api/ticketCrearPost';
import { restaurantesBasicosGet } from '../../componentes/api/restaurantesBasicosGet.js';
import { Iconografia } from '../../componentes/utils/Iconografia.jsx'
const PromoMain = () => {
    const [formData, setFormData] = useState({
        restaurantName: "",
        promoName: "",
        promoSubtitle: "",
        descPromo: "",
        fechaValidez: ""
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

    const prepareApiData = () => {
        const restauranteSeleccionado = restaurantes.find(r => String(r.id) === String(selectedRestauranteId));
        const stickerClave = selectedStickers[0] || ""; // <-- usa el primer sticker seleccionado
        return {
            nombre_restaurante: formData.restaurantName,
            titulo: formData.promoName,
            subtitulo: formData.promoSubtitle,
            descripcion: formData.descPromo,
            icon: stickerClave, // <-- guarda la clave, no la url
            email: formData.emailPromo || "",
            tipo: 'promo',
            link: formData.urlPromo || "",
            metadata: JSON.stringify({
                fecha_validez: formData.fechaValidez,
                sticker_url: stickerClave // o puedes guardar la url si prefieres
            }),
            secciones_categorias: restauranteSeleccionado?.secciones_categorias || undefined
        };
    };

    const handleGuardar = async () => {
        setSaveSuccess(false);
        setSaveError(null);
        setIsPosting(true);
        try {
            const apiData = prepareApiData();
            console.log("Datos enviados a ticketCrear:", apiData);
            await ticketCrear(apiData);
            setSaveSuccess(true);
        } catch (error) {
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
                <FormularioPromo
                    formData={formData}
                    onFieldChange={handleFieldChange}
                    restaurantes={restaurantes}
                    selectedRestauranteId={selectedRestauranteId}
                    onRestauranteChange={handleRestauranteChange}
                />
                <div className="bg-[#3B3B3C] w-auto h-auto px-14 pr-3 pt-10 pb-10 shadow-lg relative flex flex-col">
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