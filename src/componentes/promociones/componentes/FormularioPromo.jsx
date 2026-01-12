//src/componentes/promociones/componentes/FormularioPromo.jsx
import { useState, useRef, useEffect } from 'react';


const FormularioPromo = ({
    formData,
    onFieldChange,
    restaurantes = [],
    selectedRestauranteId = "",
    onRestauranteChange
}) => {

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
        <div className="flex flex-col justify-around">
            {/* Dropdown de restaurantes */}
            <div className="">
                <label className="block text-gray-950 text-xl font-bold mb-1">
                    Selecciona un restaurante:
                </label>
                <select
                    className="text-xl rounded px-3 py-2 w-full bg-white border-0"
                    value={selectedRestauranteId}
                    onChange={onRestauranteChange}
                >
                    <option value="">-- Elige uno --</option>
                    {restaurantes.map(r => (
                        <option key={r.id} value={r.id}>
                            {r.nombre_restaurante}
                        </option>
                    ))}
                </select>
            </div>

            {/* Campo nombre del restaurante */}
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
                <textarea
                    value={formData.promoName}
                    onChange={(e) => onFieldChange("promoName", e.target.value)}
                    placeholder="Ej. 2x1&#10;Hamburguesas"
                    rows={2}
                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg resize-none"
                    style={{ minHeight: 48, maxHeight: 120 }}
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
                    <span className={`text-sm ${formData.descPromo?.length >= 300 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formData.descPromo?.length || 0}/300
                    </span>
                </div>
                <textarea
                    ref={textareaRef}
                    value={formData.descPromo}
                    onChange={(e) => {
                        if (e.target.value.length <= 300) {
                            onFieldChange("descPromo", e.target.value)
                        }
                    }}
                    placeholder="Ej. Llévate una Whopper Jr. sin queso, una hamburguesa con queso y una Rodeo Burger por $99 pesos"
                    maxLength={300}
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

            {/* Sección de Caducidad Automática */}
            <div className="flex flex-col pb-0 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <input
                        type="checkbox"
                        id="tiene_caducidad"
                        checked={formData.tiene_caducidad || false}
                        onChange={(e) => onFieldChange("tiene_caducidad", e.target.checked)}
                        className="w-5 h-5 text-yellow-500 bg-white border-gray-300 rounded focus:ring-yellow-500 cursor-pointer"
                    />
                    <label htmlFor="tiene_caducidad" className="text-lg font-medium text-gray-950 cursor-pointer">
                        Activar caducidad automática
                    </label>
                </div>

                {formData.tiene_caducidad && (
                    <div className="flex flex-col">
                        <label className="block text-base font-medium text-gray-700 mb-1">
                            Fecha de expiración del cupón
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.fecha_caducidad || ""}
                            onChange={(e) => onFieldChange("fecha_caducidad", e.target.value)}
                            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            El cupón se desactivará automáticamente cuando llegue esta fecha.
                        </p>
                    </div>
                )}
            </div>
            {/* Campo URL de promoción */}
            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">Url de promoción (si aplica)</label>
                <input
                    type="url"
                    value={formData.urlPromo || ""}
                    onChange={(e) => onFieldChange("urlPromo", e.target.value)}
                    placeholder="Ej. https://promocion.com"
                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                />
            </div>

            {/* Campo correo electrónico */}
            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">Correo electrónico</label>
                <input
                    type="email"
                    value={formData.emailPromo || ""}
                    onChange={(e) => onFieldChange("emailPromo", e.target.value)}
                    placeholder="Ej. contacto@promocion.com"
                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                />
            </div>

            {/* Sección SEO Metadata (OCULTA AUTOMÁTICAMENTE) */}
            <div className="flex flex-col pb-0 mt-4 border-t pt-4" style={{ display: 'none' }}>
                <h3 className="text-xl font-bold text-gray-950 mb-3">SEO Metadata (Opcional)</h3>

                <div className="flex flex-col pb-3">
                    <label className="block text-lg font-medium text-gray-950 mb-1">Texto Alt de Imagen</label>
                    <input
                        type="text"
                        value={formData.seo_alt_text || ""}
                        onChange={(e) => onFieldChange("seo_alt_text", e.target.value)}
                        placeholder="Descripción de la imagen"
                        className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                    />
                </div>

                <div className="flex flex-col pb-3">
                    <label className="block text-lg font-medium text-gray-950 mb-1">Título SEO</label>
                    <input
                        type="text"
                        value={formData.seo_title || ""}
                        onChange={(e) => onFieldChange("seo_title", e.target.value)}
                        placeholder="Título para buscadores"
                        className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                    />
                </div>

                <div className="flex flex-col pb-3">
                    <label className="block text-lg font-medium text-gray-950 mb-1">Palabra Clave</label>
                    <input
                        type="text"
                        value={formData.seo_keyword || ""}
                        onChange={(e) => onFieldChange("seo_keyword", e.target.value)}
                        placeholder="Palabra clave principal"
                        className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                    />
                </div>

                <div className="flex flex-col pb-0">
                    <label className="block text-lg font-medium text-gray-950 mb-1">Meta Descripción</label>
                    <textarea
                        value={formData.meta_description || ""}
                        onChange={(e) => onFieldChange("meta_description", e.target.value)}
                        placeholder="Resumen para Google"
                        rows={3}
                        className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg resize-none"
                    />
                </div>
            </div>
        </div>
    )
}

export default FormularioPromo