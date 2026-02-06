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

    // Lista de fuentes disponibles
    const fontOptions = [
        { value: 'default', label: 'Predeterminada', fontFamily: 'inherit' },
        { value: 'Arial', label: 'Arial', fontFamily: 'Arial, sans-serif' },
        { value: 'Calibri', label: 'Calibri', fontFamily: 'Calibri, sans-serif' },
        { value: 'Roboto', label: 'Roboto', fontFamily: '"Roboto", sans-serif' },
        { value: 'Outfit', label: 'Outfit', fontFamily: '"Outfit", sans-serif' },
        { value: 'Montserrat', label: 'Montserrat', fontFamily: '"Montserrat", sans-serif' },
        { value: 'Bebas Neue', label: 'Bebas Neue', fontFamily: '"Bebas Neue", sans-serif' },
        { value: 'Playfair Display', label: 'Playfair Display', fontFamily: '"Playfair Display", serif' }
    ];

    const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
    const fontDropdownRef = useRef(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target)) {
                setFontDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedFont = fontOptions.find(f => f.value === (formData.tipografia || 'default')) || fontOptions[0];

    return (
        <div className="flex flex-col justify-around">
            {/* Tipografía */}
            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">Tipografía del ticket</label>
                <div className="flex gap-3 items-center">
                    {/* Dropdown de fuentes */}
                    <div className="relative flex-1" ref={fontDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                            className="w-full text-lg rounded px-3 py-2 bg-white border-0 text-left flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        >
                            <span style={{ fontFamily: selectedFont.fontFamily }}>
                                {selectedFont.label} <span className="text-gray-400">Aa</span>
                            </span>
                            <svg className={`w-5 h-5 transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {fontDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                                {fontOptions.map((font) => (
                                    <button
                                        key={font.value}
                                        type="button"
                                        onClick={() => {
                                            onFieldChange("tipografia", font.value);
                                            setFontDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-lg hover:bg-yellow-100 transition-colors ${formData.tipografia === font.value ? 'bg-yellow-50' : ''
                                            }`}
                                        style={{ fontFamily: font.fontFamily }}
                                    >
                                        {font.label} <span className="text-gray-400">Aa</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Solo mostrar negritas si no es la fuente predeterminada */}
                    {formData.tipografia && formData.tipografia !== 'default' && (
                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg">
                            <input
                                type="checkbox"
                                checked={formData.tipografia_bold !== false}
                                onChange={(e) => onFieldChange("tipografia_bold", e.target.checked)}
                                className="w-5 h-5 text-yellow-500 bg-white border-gray-300 rounded focus:ring-yellow-500 cursor-pointer"
                            />
                            <span className="text-lg font-medium text-gray-950">Negritas</span>
                        </label>
                    )}
                </div>
            </div>
            {/* Color de fondo */}
            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">Color de fondo del ticket</label>
                <div className="flex gap-3 items-center">
                    <input
                        type="color"
                        value={formData.colorFondo || "#FFFFFF"}
                        onChange={(e) => onFieldChange("colorFondo", e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                        type="text"
                        value={formData.colorFondo || "#FFFFFF"}
                        onChange={(e) => onFieldChange("colorFondo", e.target.value)}
                        placeholder="#FFFFFF"
                        className="text-lg rounded px-3 py-2 bg-white border-0 w-32 uppercase"
                        maxLength={7}
                    />
                    <button
                        type="button"
                        onClick={() => onFieldChange("colorFondo", "#FFFFFF")}
                        className="text-lg px-3 py-2 bg-white rounded hover:bg-gray-100 transition-colors"
                    >
                        Blanco
                    </button>
                </div>
            </div>

            {/* Logo personalizado */}
            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">Logo personalizado</label>
                <div className="flex gap-3 items-center">
                    <label className="flex-1 bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors text-lg text-center">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        onFieldChange("logoPersonalizado", reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        {formData.logoPersonalizado ? '📷 Cambiar logo' : '📤 Subir logo'}
                    </label>
                    {formData.logoPersonalizado && (
                        <>
                            <img
                                src={formData.logoPersonalizado}
                                alt="Logo preview"
                                className="h-10 w-auto object-contain bg-white rounded"
                            />
                            <button
                                type="button"
                                onClick={() => onFieldChange("logoPersonalizado", null)}
                                className="text-sm px-2 py-1 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                ✕ Quitar
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tamaño del logo */}
            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">
                    Tamaño del logo: <span className="font-bold">{formData.logoEscala || 100}%</span>
                </label>
                <div className="flex gap-3 items-center">
                    <input
                        type="range"
                        min="50"
                        max="200"
                        step="10"
                        value={formData.logoEscala || 100}
                        onChange={(e) => onFieldChange("logoEscala", parseInt(e.target.value))}
                        className="flex-1 h-2 bg-white rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <button
                        type="button"
                        onClick={() => onFieldChange("logoEscala", 100)}
                        className="text-sm px-2 py-1 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        Reiniciar
                    </button>
                </div>
            </div>

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

            {/* Color del texto */}
            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">Color del texto de la promo</label>
                <div className="flex gap-3 items-center">
                    <input
                        type="color"
                        value={formData.colorTexto || "#000000"}
                        onChange={(e) => onFieldChange("colorTexto", e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                        type="text"
                        value={formData.colorTexto || "#000000"}
                        onChange={(e) => onFieldChange("colorTexto", e.target.value)}
                        placeholder="#000000"
                        className="text-lg rounded px-3 py-2 bg-white border-0 w-32 uppercase"
                        maxLength={7}
                    />
                    <button
                        type="button"
                        onClick={() => onFieldChange("colorTexto", "#000000")}
                        className="text-lg px-3 py-2 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        Negro
                    </button>
                </div>
            </div>

            {/* Espaciado de letras */}
            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">
                    Espaciado entre letras: <span className="font-bold">{formData.espaciadoLetras || 0}px</span>
                </label>
                <div className="flex gap-3 items-center">
                    <input
                        type="range"
                        min="-5"
                        max="15"
                        step="1"
                        value={formData.espaciadoLetras || 0}
                        onChange={(e) => onFieldChange("espaciadoLetras", parseInt(e.target.value))}
                        className="flex-1 h-2 bg-white rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <button
                        type="button"
                        onClick={() => onFieldChange("espaciadoLetras", 0)}
                        className="text-sm px-2 py-1 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        Reiniciar
                    </button>
                </div>
            </div>
            {/* Espaciado de líneas */}
            <div className="flex flex-col pb-0">
                <label className="block text-xl font-medium text-gray-950 mb-1">
                    Espaciado entre líneas: <span className="font-bold">{formData.espaciadoLineas || 1}</span>
                </label>
                <div className="flex gap-3 items-center">
                    <input
                        type="range"
                        min="0.6"
                        max="2"
                        step="0.1"
                        value={formData.espaciadoLineas || 1}
                        onChange={(e) => onFieldChange("espaciadoLineas", parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-white rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <button
                        type="button"
                        onClick={() => onFieldChange("espaciadoLineas", 1)}
                        className="text-sm px-2 py-1 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        Reiniciar
                    </button>
                </div>
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