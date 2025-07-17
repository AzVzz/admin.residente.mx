//src/componentes/promociones/PromoMain.jsx
import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import FormularioPromo from "./componentes/FormularioPromo"
import TicketPromo from "./componentes/TicketPromo"
import FormularioPromoExt from './componentes/FormularioPromoExt';
import PromoPoster from '../../componentes/api/PromoPoster.jsx'

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
    const ticketRef = useRef(null);

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Función para actualizar el sticker
    const handleStickerSelect = (stickerUrl) => {
        setSelectedSticker(stickerUrl);
    };

    const handleDownload = async () => {
        if (ticketRef.current) {
            try {
                const dataUrl = await toPng(ticketRef.current, {
                    quality: 0.95,
                    background: 'transparent',
                    pixelRatio: 5 // Mayor resolución
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

    // Función para preparar los datos para la API
    const prepareApiData = () => {
        return {
            nombre_restaurante: formData.restaurantName,
            titulo: formData.promoName,
            subtitulo: formData.promoSubtitle,
            descripcion: formData.descPromo,
            // Extraer solo el nombre del archivo del sticker (sin la ruta)
            icon: selectedSticker ? selectedSticker.split('/').pop().split('.')[0] : '',
            email: 'promociones@estrellasdenuevoleon.com.mx', // Email por defecto
            tipo: 'promo', // Tipo por defecto
            link: '', // Link por defecto
            // Agregamos la fecha de validez como un campo adicional
            metadata: JSON.stringify({
                fecha_validez: formData.fechaValidez,
                sticker_url: selectedSticker
            })
        };
    };

    return (
        <div>
            <div className="flex flex-row gap-5">
                <FormularioPromo
                    formData={formData}
                    onFieldChange={handleFieldChange}
                />
                <div className="bg-[#3B3B3C] w-auto h-auto px-14 pr-3 pt-10 pb-10 rounded-4xl shadow-lg">
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
                        <PromoPoster>
                            {({ postPromo, isPosting }) => (
                                <button
                                    onClick={async () => {
                                        setSaveSuccess(false);
                                        setSaveError(null);
                                        try {
                                            const apiData = prepareApiData();
                                            await postPromo(apiData);
                                            setSaveSuccess(true);
                                        } catch (error) {
                                            setSaveError(error.message || 'Error al guardar la promoción');
                                        }
                                    }}
                                    disabled={isPosting}
                                    className={`flex-1 bg-white hover:bg-yellow-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer ${isPosting ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isPosting ? 'Guardando...' : 'Guardar'}
                                </button>
                            )}
                        </PromoPoster>
                    </div>
                    {/* Mensajes de éxito/error */}
                    {saveSuccess && (
                        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                            ¡Promoción guardada exitosamente!
                        </div>
                    )}
                    {saveError && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                            Error: {saveError}
                        </div>
                    )}
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

export default PromoMain