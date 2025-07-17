//src/componentes/promociones/componentes/FormularioPromo.jsx
import { useState, useRef, useEffect } from 'react';

const FormularioPromo = ({ formData, onFieldChange }) => {

    const textareaRef = useRef(null);

    // Función para ajustar la altura del textarea automáticamente
    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                330 // altura máxima en píxeles
            )}px`;
        }
    };

    // Ajustar altura cuando cambia el contenido
    useEffect(() => {
        adjustTextareaHeight();
    }, [formData.descPromo]);

    return (
        <div className="flex flex-col w-auto h-205 justify-between">
            <div className="flex flex-col">
                <h2 className="text-5xl">Noticiero de Descuentos</h2>
                <p className="text-xl leading-tight font-roman font-medium">Llene usted el formato que a continuación aparece, tenga en cuenta  que este texto se adaptará al diseño en formato de historias de Instagram y Facebook, mostrado a la derecha de la pantalla. Recuerde que todas las promociones deben de ser mensuales.</p>
            </div>
            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">Nombre del restaurante *</label>
                <input
                    type="text"
                    value={formData.restaurantName}
                    onChange={(e) => onFieldChange("restaurantName", e.target.value)}
                    placeholder="Ej. Residente Restaurant"
                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                />
            </div>

            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">Nombre de la promoción *</label>
                <input
                    type="text"
                    value={formData.promoName}
                    onChange={(e) => onFieldChange("promoName", e.target.value)}
                    placeholder="Ej. 2x1, 2x$99, etc."
                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                />
            </div>

            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">Subtitulo de la promocion *</label>
                <input
                    type="text"
                    value={formData.promoSubtitle}
                    onChange={(e) => onFieldChange("promoSubtitle", e.target.value)}
                    placeholder="Ej. Pizza, Hamburgesas"
                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                />
            </div>

            <div className="flex flex-col pb-0">
                <div className="flex justify-between items-center">
                    <label className="block text-xl font-medium text-gray-950 mb-1">
                        Descripción de la promoción *
                    </label>
                    <span className={`text-sm ${formData.descPromo?.length >= 350 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formData.descPromo?.length || 0}/350
                    </span>
                </div>
                <textarea
                    ref={textareaRef}
                    value={formData.descPromo}
                    onChange={(e) => {
                        if (e.target.value.length <= 350) {
                            onFieldChange("descPromo", e.target.value)
                        }
                    }}
                    placeholder="Ej. Llévate una Whopper Jr. sin queso, una hamburguesa con queso y una Rodeo Burger por $99 pesos"
                    maxLength={350}
                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg min-h-[150px] max-h-[330px] overflow-hidden resize-none"
                />
            </div>

            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">Valiez de la promocion *</label>
                <input
                    type="text"
                    value={formData.fechaValidez}
                    onChange={(e) => onFieldChange("fechaValidez", e.target.value)}
                    placeholder="Ej. Hasta el 5 de Octubre / Solo en auto servicio"
                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                />
            </div>
        </div>
    )
}

export default FormularioPromo