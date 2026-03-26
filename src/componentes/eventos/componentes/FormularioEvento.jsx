//src/componentes/eventos/componentes/FormularioEvento.jsx
import { useState, useRef, useEffect } from 'react';

const FormularioEvento = ({
    formData,
    onFieldChange,
    restaurantes = [],
    selectedRestauranteId = "",
    onRestauranteChange
}) => {

    const textareaRef = useRef(null);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 330)}px`;
        }
    };

    useEffect(() => { adjustTextareaHeight(); }, [formData.descEvento]);

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
    const [restSearchTerm, setRestSearchTerm] = useState('');
    const [restDropdownOpen, setRestDropdownOpen] = useState(false);
    const restDropdownRef = useRef(null);

    const restaurantesOrdenados = [...restaurantes]
        .sort((a, b) => (a.nombre_restaurante || '').localeCompare(b.nombre_restaurante || '', 'es'))
        .filter(r => {
            if (!restSearchTerm) return true;
            return (r.nombre_restaurante || '').toLowerCase().includes(restSearchTerm.toLowerCase());
        });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target)) setFontDropdownOpen(false);
            if (restDropdownRef.current && !restDropdownRef.current.contains(event.target)) setRestDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedFont = fontOptions.find(f => f.value === (formData.tipografia || 'default')) || fontOptions[0];

    return (
        <div className="flex flex-col gap-5">
            {/* Lo esencial */}
            <div className="">
                <div className="grid grid-cols-1 gap-3">
                    {/* Nombre del evento */}
                    <div className="flex flex-col">
                        <label className="block text-xl font-medium text-gray-950 mb-1">Nombre del evento *</label>
                        <textarea value={formData.promoName} onChange={(e) => onFieldChange("promoName", e.target.value)} placeholder="Ej. Cata de Vinos&#10;Especial" rows={2} className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg resize-none" style={{ minHeight: 48, maxHeight: 120 }} />
                    </div>

                    {/* Subtítulo */}
                    <div className="flex flex-col">
                        <label className="block text-xl font-medium text-gray-950 mb-1">Información del evento</label>
                        <input type="text" value={formData.promoSubtitle} onChange={(e) => onFieldChange("promoSubtitle", e.target.value)} placeholder="Ej. Degustación de 5 vinos" className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg" />
                    </div>

                    {/* Restaurante */}
                    <div className="flex flex-col" ref={restDropdownRef}>
                        <label className="block text-gray-950 text-xl font-bold mb-1">Selecciona un restaurante</label>
                        <div className="relative">
                            <div className="w-full text-xl rounded px-3 py-2 bg-white border-0 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => setRestDropdownOpen(!restDropdownOpen)}>
                                <span className={selectedRestauranteId ? 'text-gray-950' : 'text-gray-400'}>
                                    {selectedRestauranteId ? restaurantes.find(r => String(r.id) === String(selectedRestauranteId))?.nombre_restaurante || '-- Elige uno --' : '-- Elige uno --'}
                                </span>
                                <svg className={`w-5 h-5 transition-transform ${restDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {restDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                                    <div className="p-2 border-b border-gray-100">
                                        <input type="text" value={restSearchTerm} onChange={(e) => setRestSearchTerm(e.target.value)} placeholder="Buscar restaurante..." className="w-full px-3 py-2 text-lg bg-gray-50 rounded-md border-0 outline-none focus:bg-gray-100 transition-colors" autoFocus />
                                    </div>
                                    <div className="max-h-110 overflow-y-auto">
                                        {restaurantesOrdenados.length > 0 ? restaurantesOrdenados.map(r => (
                                            <button key={r.id} type="button"
                                                onClick={() => { onRestauranteChange({ target: { value: String(r.id) } }); setRestDropdownOpen(false); setRestSearchTerm(''); }}
                                                className={`w-full text-left px-3 py-2 text-lg hover:bg-yellow-100 transition-colors ${String(selectedRestauranteId) === String(r.id) ? 'bg-yellow-50 font-medium' : ''}`}
                                            >
                                                {r.nombre_restaurante}
                                            </button>
                                        )) : (
                                            <div className="px-3 py-4 text-gray-400 text-center text-lg">No se encontraron restaurantes</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cuándo */}
            <div className="    pb-5">

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label className="block text-base font-medium text-gray-700 mb-1">Fecha de inicio *</label>
                        <input type="date" value={formData.fechaInicioEvento || ""} onChange={(e) => onFieldChange("fechaInicioEvento", e.target.value)} className="bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors text-lg" />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-base font-medium text-gray-700 mb-1">Fecha de fin *</label>
                        <input type="date" value={formData.fechaFinEvento || ""} onChange={(e) => onFieldChange("fechaFinEvento", e.target.value)} className="bg-white w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors text-lg" />
                    </div>
                </div>
                <div className="mt-3 flex flex-col">
                    <label className="block text-xl font-medium text-gray-950 mb-1">Texto de fecha en el ticket</label>
                    <input type="text" value={formData.fechaValidez} readOnly placeholder="Se llena automáticamente con inicio y fin" className="bg-gray-100 w-full px-3 py-2 border border-gray-200 rounded-lg text-lg text-gray-700" />
                    <span className="text-xs text-gray-600 mt-1">Este texto se genera automáticamente al seleccionar las fechas del evento.</span>
                </div>
            </div>

            {/* Días fijos */}
            <div className="pb-5">
                <label className="block text-xl font-medium text-gray-950 mb-2">Días fijos del evento</label>
                <span className="text-xs text-gray-600 mb-3 block">Si el evento ocurre siempre los mismos días (ej. todos los martes), selecciónalos aquí.</span>
                <div className="flex flex-wrap gap-2">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => {
                        const seleccionado = (formData.diasFijos || []).includes(dia);
                        return (
                            <button
                                key={dia}
                                type="button"
                                onClick={() => {
                                    const actuales = formData.diasFijos || [];
                                    const nuevos = seleccionado
                                        ? actuales.filter(d => d !== dia)
                                        : [...actuales, dia];
                                    onFieldChange('diasFijos', nuevos);
                                }}
                                className={`px-4 py-2 rounded-lg text-base font-medium transition-colors cursor-pointer ${seleccionado ? 'bg-yellow-400 text-black' : 'bg-white text-gray-700 hover:bg-yellow-100'}`}
                            >
                                {dia}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Descripción */}
            <div className=" pb-5">
                <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                        <label className="block text-xl font-medium text-gray-950 mb-1">Descripción del evento *</label>
                        <span className={`text-sm ${formData.descEvento?.length >= 150 ? 'text-red-500' : 'text-gray-500'}`}>{formData.descEvento?.length || 0}/150</span>
                    </div>
                    <textarea ref={textareaRef} value={formData.descEvento} onChange={(e) => { if (e.target.value.length <= 150) onFieldChange("descEvento", e.target.value); }} placeholder="Ej. Una noche especial con los mejores vinos de la región..." maxLength={150} className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg min-h-[150px] max-h-[330px] overflow-hidden resize-none" />
                </div>
            </div>

            {/* Dónde / contacto */}
            <div className=" pb-5">
                <div className="flex flex-col mb-3">
                    <label className="block text-xl font-medium text-gray-950 mb-1">Dónde (lugar o dirección corta)</label>
                    <input
                        type="text"
                        value={formData.lugarEvento || ""}
                        onChange={(e) => onFieldChange("lugarEvento", e.target.value)}
                        placeholder="Ej. Foro Alicia, San Pedro · MTY"
                        className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg"
                    />
                    <span className="text-xs text-gray-600 mt-1">Se muestra en el ticket en la sección “Dónde”.</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label className="block text-xl font-medium text-gray-950 mb-1">URL del evento (si aplica)</label>
                        <input type="url" value={formData.urlPromo || ""} onChange={(e) => onFieldChange("urlPromo", e.target.value)} placeholder="Ej. https://boletos.com/evento" className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg" />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-xl font-medium text-gray-950 mb-1">Correo electrónico</label>
                        <input type="email" value={formData.emailPromo || ""} onChange={(e) => onFieldChange("emailPromo", e.target.value)} placeholder="Ej. eventos@restaurante.com" className="bg-white w-full px-3 py-2 border border-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-colors text-lg" />
                    </div>
                </div>
            </div>

            {/* Diseño del ticket */}
            <div>
                <p className="text-sm font-semibold tracking-[0.15em] uppercase text-gray-800 mb-3">Diseño del ticket</p>

                {/* Imagen superior (flyer / foto del evento) */}
                <div className="flex flex-col pb-4">
                    <label className="block text-xl font-medium text-gray-950 mb-1">Foto o flyer del evento</label>
                    <div className="flex gap-3 items-center flex-wrap">
                        <label className="flex-1 min-w-[200px] bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors text-lg text-center">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => onFieldChange("flyerPromo", reader.result);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {formData.flyerPromo ? "📷 Cambiar imagen" : "📤 Subir foto / flyer"}
                        </label>
                        {formData.flyerPromo && (
                            <>
                                <img src={formData.flyerPromo} alt="" className="h-16 w-auto max-w-[120px] object-cover rounded border border-gray-200" />
                                <button
                                    type="button"
                                    onClick={() => onFieldChange("flyerPromo", null)}
                                    className="text-sm px-2 py-1 bg-white rounded hover:bg-gray-100 cursor-pointer"
                                >
                                    Quitar
                                </button>
                            </>
                        )}
                    </div>
                    <span className="text-xs text-gray-600 mt-1">Aparece arriba del ticket como en tu boceto. Si no subes imagen, se ve el placeholder “Foto”.</span>
                </div>

                {/* Tipografía */}
                <div className="flex flex-col pb-3">
                    <label className="block text-xl font-medium text-gray-950 mb-1">Tipografía del evento</label>
                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1" ref={fontDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                                className="w-full text-lg rounded px-3 py-2 bg-white border-0 text-left flex justify-between items-center cursor-pointer hover:bg-gray-50"
                            >
                                <span style={{ fontFamily: selectedFont.fontFamily }}>{selectedFont.label} <span className="text-gray-400">Aa</span></span>
                                <svg className={`w-5 h-5 transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {fontDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                                    {fontOptions.map((font) => (
                                        <button key={font.value} type="button"
                                            onClick={() => { onFieldChange("tipografia", font.value); setFontDropdownOpen(false); }}
                                            className={`w-full text-left px-3 py-2 text-lg hover:bg-yellow-100 transition-colors ${formData.tipografia === font.value ? 'bg-yellow-50' : ''}`}
                                            style={{ fontFamily: font.fontFamily }}
                                        >
                                            {font.label} <span className="text-gray-400">Aa</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {formData.tipografia && formData.tipografia !== 'default' && (
                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg">
                                <input type="checkbox" checked={formData.tipografia_bold !== false}
                                    onChange={(e) => onFieldChange("tipografia_bold", e.target.checked)}
                                    className="w-5 h-5 text-yellow-500 bg-white border-gray-300 rounded focus:ring-yellow-500 cursor-pointer"
                                />
                                <span className="text-lg font-medium text-gray-950">Negritas</span>
                            </label>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Color del título sobre la imagen */}
                <div className="flex flex-col pb-4">
                    <label className="block text-xl font-medium text-gray-950 mb-1">Color del título (sobre la imagen)</label>
                    <div className="flex gap-3 items-center flex-wrap">
                        <input type="color" value={formData.colorTitulo || "#FFFFFF"} onChange={(e) => onFieldChange("colorTitulo", e.target.value)} className="w-12 h-10 rounded cursor-pointer border-0" />
                        <input type="text" value={formData.colorTitulo || "#FFFFFF"} onChange={(e) => onFieldChange("colorTitulo", e.target.value)} placeholder="#FFFFFF" className="text-lg rounded px-3 py-2 bg-white border-0 w-32 uppercase" maxLength={7} />
                        <button type="button" onClick={() => onFieldChange("colorTitulo", "#FFFFFF")} className="text-lg px-3 py-2 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer">Blanco</button>
                        <button type="button" onClick={() => onFieldChange("colorTitulo", "#000000")} className="text-lg px-3 py-2 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer">Negro</button>
                    </div>
                </div>

                    {/* Color del texto */}
                    <div className="flex flex-col">
                        <label className="block text-xl font-medium text-gray-950 mb-1">Color del texto</label>
                        <div className="flex gap-3 items-center">
                            <input type="color" value={formData.colorTexto || "#000000"} onChange={(e) => onFieldChange("colorTexto", e.target.value)} className="w-12 h-10 rounded cursor-pointer border-0" />
                            <input type="text" value={formData.colorTexto || "#000000"} onChange={(e) => onFieldChange("colorTexto", e.target.value)} placeholder="#000000" className="text-lg rounded px-3 py-2 bg-white border-0 w-32 uppercase" maxLength={7} />
                            <button type="button" onClick={() => onFieldChange("colorTexto", "#000000")} className="text-lg px-3 py-2 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer">Negro</button>
                        </div>
                    </div>

                    {/* Color amarillo */}
                    <div className="flex flex-col">
                        <label className="block text-xl font-medium text-gray-950 mb-1">Color amarillo del ticket</label>
                        <div className="flex gap-3 items-center">
                            <input type="color" value={formData.colorAmarillo || "#FFF300"} onChange={(e) => onFieldChange("colorAmarillo", e.target.value)} className="w-12 h-10 rounded cursor-pointer border-0" />
                            <input type="text" value={formData.colorAmarillo || "#FFF300"} onChange={(e) => onFieldChange("colorAmarillo", e.target.value)} placeholder="#FFF300" className="text-lg rounded px-3 py-2 bg-white border-0 w-32 uppercase" maxLength={7} />
                            <button type="button" onClick={() => onFieldChange("colorAmarillo", "#FFF300")} className="text-lg px-3 py-2 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer">Default</button>
                        </div>
                    </div>
                </div>

                {/* Ajustes de tipografía */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                    <div className="flex flex-col">
                        <label className="block text-xl font-medium text-gray-950 mb-1">Espaciado entre líneas: <span className="font-bold">{formData.espaciadoLineas || 1}</span></label>
                        <div className="flex gap-3 items-center">
                            <input type="range" min="0.6" max="2" step="0.1" value={formData.espaciadoLineas || 1} onChange={(e) => onFieldChange("espaciadoLineas", parseFloat(e.target.value))} className="flex-1 h-2 bg-white rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                            <button type="button" onClick={() => onFieldChange("espaciadoLineas", 1)} className="text-sm px-2 py-1 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer">Reiniciar</button>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="block text-xl font-medium text-gray-950 mb-1">Espaciado entre letras: <span className="font-bold">{formData.espaciadoLetras || 0}px</span></label>
                        <div className="flex gap-3 items-center">
                            <input type="range" min="-5" max="15" step="1" value={formData.espaciadoLetras || 0} onChange={(e) => onFieldChange("espaciadoLetras", parseInt(e.target.value))} className="flex-1 h-2 bg-white rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                            <button type="button" onClick={() => onFieldChange("espaciadoLetras", 0)} className="text-sm px-2 py-1 bg-white rounded hover:bg-gray-100 transition-colors cursor-pointer">Reiniciar</button>
                        </div>
                    </div>
                </div>

                {/* Tamaño del título (sobre la imagen) */}
                <div className="flex flex-col pt-3">
                    <label className="block text-xl font-medium text-gray-950 mb-1">
                        Tamaño del título (sobre la imagen): <span className="font-bold">{formData.fontSizeTituloImagen ?? 36}px</span>
                    </label>
                    <div className="flex gap-3 items-center flex-wrap">
                        <input
                            type="range"
                            min="36"
                            max="90"
                            step="1"
                            value={formData.fontSizeTituloImagen ?? 36}
                            onChange={(e) => onFieldChange("fontSizeTituloImagen", parseInt(e.target.value, 10))}
                            className="min-w-[180px] flex-1 h-2 bg-white rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                        <button
                            type="button"
                            onClick={() => onFieldChange("fontSizeTituloImagen", 36)}
                            className="text-sm px-3 py-1.5 bg-white rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                        >
                            Predeterminado (36px)
                        </button>
                    </div>
                </div>

                {/* Tamaño del texto del cuerpo (franja amarilla) */}
                <div className="flex flex-col pt-3">
                    <label className="block text-xl font-medium text-gray-950 mb-1">
                        Tamaño de texto (info, descripción y dónde): <span className="font-bold">{formData.fontSizeCuerpo ?? 13}px</span>
                    </label>
                    <div className="flex gap-3 items-center flex-wrap">
                        <input
                            type="range"
                            min="13"
                            max="40"
                            step="1"
                            value={formData.fontSizeCuerpo ?? 13}
                            onChange={(e) => onFieldChange("fontSizeCuerpo", parseInt(e.target.value, 10))}
                            className="min-w-[180px] flex-1 h-2 bg-white rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                        <button
                            type="button"
                            onClick={() => onFieldChange("fontSizeCuerpo", 13)}
                            className="text-sm px-3 py-1.5 bg-white rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                        >
                            Predeterminado (13px)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormularioEvento;
