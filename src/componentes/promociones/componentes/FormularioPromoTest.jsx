import { useState, useRef, useEffect } from 'react';

const FormularioPromoTest = ({
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
                <label className="block text-xl font-medium text-gray-950 mb-1">Texto de Validez (Visible en el cupón) *</label>
                <input
                    type="text"
                    value={formData.fechaValidez}
                    onChange={(e) => onFieldChange("fechaValidez", e.target.value)}
                    placeholder="Ej. Hasta el 5 de Octubre / Solo en auto servicio"
                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                />
            </div>

            {/* NUEVOS CAMPOS DE FECHA DE INICIO Y FIN */}
            <div className="flex flex-col gap-2">
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.esPermanente || false}
                        onChange={(e) => onFieldChange("esPermanente", e.target.checked)}
                        className="form-checkbox h-5 w-5 text-yellow-500"
                    />
                    <span className="ml-2 text-gray-900 font-bold">Cupón Permanente (Sin fecha de caducidad)</span>
                </label>

                {!formData.esPermanente && (
                    <div className="flex flex-col gap-4 mt-2">
                        {/* Selector de Zona Horaria */}
                        <div className="flex flex-col pb-0">
                            <label className="block text-xl font-medium text-gray-950 mb-1">Zona Horaria *</label>
                            <select
                                value={formData.zonaHoraria || "America/Monterrey"}
                                onChange={(e) => onFieldChange("zonaHoraria", e.target.value)}
                                className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                            >
                                <option value="America/Monterrey">Monterrey / CDMX (Hora Central)</option>
                                <option value="America/Tijuana">Tijuana / Pacífico</option>
                                <option value="America/Chihuahua">Chihuahua / Montaña</option>
                                <option value="America/Cancun">Cancún / Sureste</option>
                            </select>
                            <p className="text-sm text-gray-500 mt-1">
                                Las fechas seleccionadas se guardarán en esta zona horaria.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col pb-0">
                                <label className="block text-xl font-medium text-gray-950 mb-1">Fecha de Inicio *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.fechaInicio || ""}
                                    onChange={(e) => onFieldChange("fechaInicio", e.target.value)}
                                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                                />
                            </div>
                            <div className="flex flex-col pb-0">
                                <label className="block text-xl font-medium text-gray-950 mb-1">Fecha de Fin *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.fechaFin || ""}
                                    onChange={(e) => onFieldChange("fechaFin", e.target.value)}
                                    className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                                />
                            </div>
                        </div>
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
        </div>
    )
}

export default FormularioPromoTest
