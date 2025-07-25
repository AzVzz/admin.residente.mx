//src/componentes/promociones/PromoMain.jsx
import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import FormularioPromo from "./componentes/FormularioPromo";
import TicketPromo from "./componentes/TicketPromo";
import FormularioPromoExt from './componentes/FormularioPromoExt';
import { ticketCrear } from '../../componentes/api/ticketCrearPost'; // Importa tu función

const PromoMain = () => {
    const [formData, setFormData] = useState({
        restaurantName: "",
        promoName: "",
        promoSubtitle: "",
        descPromo: "",
        fechaValidez: ""
    });

    const [selectedSticker, setSelectedSticker] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const ticketRef = useRef(null);

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleStickerSelect = (stickerUrl) => {
        setSelectedSticker(stickerUrl);
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
        return {
            nombre_restaurante: formData.restaurantName,
            titulo: formData.promoName,
            subtitulo: formData.promoSubtitle,
            descripcion: formData.descPromo,
            icon: selectedSticker ? selectedSticker.split('/').pop().split('.')[0] : '',
            email: 'promociones@estrellasdenuevoleon.com.mx',
            tipo: 'promo',
            link: '',
            metadata: JSON.stringify({
                fecha_validez: formData.fechaValidez,
                sticker_url: selectedSticker
            })
        };
    };

    const handleGuardar = async () => {
        setSaveSuccess(false);
        setSaveError(null);
        setIsPosting(true);
        try {
            const apiData = prepareApiData();
            console.log("Datos enviados a ticketCrear:", apiData); // <-- Agrega este log
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
            <div className="flex flex-row gap-5">
                <FormularioPromo
                    formData={formData}
                    onFieldChange={handleFieldChange}
                />
                <div className="bg-[#3B3B3C] w-auto h-auto px-14 pr-3 pt-10 pb-10 rounded-4xl shadow-lg relative">
                    {/* Mensajes de éxito/error flotantes con transición */}
                    {(saveSuccess || saveError) && (
                        <div
                            className={`absolute top-3 left-1/2 transform -translate-x-1/2 z-20 w-[90%] transition-opacity duration-300 ${
                                showMessage ? 'opacity-100' : 'opacity-0'
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
                        stickerUrl={selectedSticker}
                    />
                    <div className="flex flex-row w-full gap-2 pt-5 pr-11">
                        <button
                            onClick={handleDownload}
                            className="flex-1  bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
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
                    onStickerSelect={handleStickerSelect}
                />
            </div>
        </div>
    )
}

export default PromoMain;