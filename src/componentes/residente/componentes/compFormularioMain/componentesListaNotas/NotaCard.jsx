import { Link } from "react-router-dom";

// Función para obtener el icono según el tipo de nota
const getTipoNotaIcon = (nota) => {
    const iconClass = "w-45 h-full rounded-bl-lg flex items-center justify-center text-white font-bold text-lg shadow-lg px-2 py-1";
    
    // Buscar el tipo de nota en diferentes campos
    let tipoNota = nota.tipoNota || nota.tipo_nota;
    
    // Si no hay tipo_nota directo, buscar en secciones_categorias
    if (!tipoNota && nota.secciones_categorias && nota.secciones_categorias.length > 0) {
        const primeraSeccion = nota.secciones_categorias[0];
        tipoNota = primeraSeccion.seccion?.toLowerCase();
    }
    
    // Mapear nombres comunes a los tipos esperados
    if (tipoNota) {
        tipoNota = tipoNota.toLowerCase();
        if (tipoNota.includes('restaurante')) tipoNota = 'restaurantes';
        if (tipoNota.includes('food') || tipoNota.includes('drink')) tipoNota = 'food-drink';
        if (tipoNota.includes('antoj')) tipoNota = 'antojos';
        if (tipoNota.includes('gastro') || tipoNota.includes('destino')) tipoNota = 'gastro-destinos';
        if (tipoNota.includes('barrio') || tipoNota.includes('antiguo')) tipoNota = 'barrio-antiguo';
        if (tipoNota.includes('mama') || tipoNota.includes('rocco')) tipoNota = 'mama-de-rocco';
        if (tipoNota.includes('brayanbby')) tipoNota = 'brayanbby';
    }
    
    // Función para generar colores automáticamente basados en el nombre
    const generateColorFromName = (name) => {
        const colors = [
            'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
            'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500',
            'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-sky-500'
        ];
        
        // Generar un hash simple del nombre para obtener un color consistente
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash + name.charCodeAt(i)) & 0xffffffff;
        }
        return colors[Math.abs(hash) % colors.length];
    };
    
    switch (tipoNota) {
        case 'restaurantes':
            return (
                <div className={`${iconClass} bg-red-500`} title="Restaurantes">
                    RESTAURANTES
                </div>
            );
        case 'food-drink':
            return (
                <div className={`${iconClass} bg-blue-500`} title="Food & Drink">
                    FOOD & DRINK
                </div>
            );
        case 'antojos':
            return (
                <div className={`${iconClass} bg-yellow-300`} title="Antojos">
                    ANTOJERIA
                </div>
            );
        case 'gastro-destinos':
            return (
                <div className={`${iconClass} bg-green-500`} title="Gastro-Destinos">
                    GASTRO-DESTINOS
                </div>
            );
        case 'barrio-antiguo':
            return (
                <div className={`${iconClass} bg-purple-500`} title="Barrio Antiguo">
                    BARRIO ANTIGUO
                </div>
            );
        case 'mama-de-rocco':
            return (
                <div className={`${iconClass} bg-pink-500`} title="Mama de Rocco">
                    MAMA DE ROCCO
                </div>
            );
        case 'residente':
            return (
                <div className={`${iconClass} bg-green-500`} title="Residente">
                    RESIDENTE
                </div>
            );
        case 'acervo':
            return (
                <div className={`${iconClass} bg-yellow-500`} title="Acervo">
                    ACERVO
                </div>
            );
        case 'b2b':
            return (
                <div className={`${iconClass} bg-red-500`} title="B2B">
                    B2B
                </div>
            );
        case 'brayanbby':
            return (
                <div className={`${iconClass} bg-indigo-500`} title="Brayanbby">
                    BRAYANBBY
                </div>
            );
        default:
            // Para clientes nuevos o desconocidos, usar el nombre con color automático
            const nombreCliente = tipoNota || 'General';
            const colorAuto = generateColorFromName(nombreCliente);
            
            return (
                <div className={`${iconClass} ${colorAuto}`} title={nombreCliente}>
                    {nombreCliente}
                </div>
            );
    }
};

const NotaCard = ({ nota, onEliminar, eliminando }) => (
    <Link to={`/notas/editar/${nota.id}`}>
        <div
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col group relative cursor-pointer"
            style={{
                minHeight: '300px',
                position: 'relative'
            }}
        >
            {/* Imagen de fondo con zoom al hover */}
            <div
                className="absolute inset-0 w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                style={{
                    backgroundImage: `url(${nota.imagen})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }}
            />
            {/* Contenido encima de la imagen */}
            <div className="flex flex-col justify-between items-end h-full relative z-10">
                {/* Icono de tipo de nota en esquina superior derecha */}
                <div className="absolute top-0 right-0 z-20">
                    {getTipoNotaIcon(nota)}
                </div>
                {/* Datos arriba */}
                <div className="w-full flex items-center flex-col p-2">
                    <div className="px-2 pt-2 w-full flex flex-col gap-0">
                        <span
                            className={`px-2 py-1 text-xs rounded-full w-fit ${nota.estatus === "publicada"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                                }`}
                        >
                            {nota.estatus === "publicada" ? "Publicada" : "Borrador"}
                        </span>
                        <span className="font-roman font-semibold px-2 py-1 text-xs rounded-full bg-black/30 backdrop-blur-md text-white drop-shadow w-fit">
                            {nota.fecha}
                        </span>
                        <span className="font-sans font-semibold px-2 py-1 text-xs rounded-full bg-black/30 backdrop-blur-md text-white drop-shadow w-fit">vistas: {nota.vistas}</span>
                        <span className="font-sans font-semibold px-2 py-1 text-xs rounded-full bg-black/30 backdrop-blur-md text-white drop-shadow w-fit">Ultimo autor: {nota.autor}</span>
                    </div>
                </div>
                {/* Título abajo en recuadro blanco borroso */}
                <div className="w-full">
                    {/* Aviso de Programada encima del título */}
                    {nota.programar_publicacion && esProgramadaFutura(nota.programar_publicacion) && (
                        <div className="flex justify-center mb-2">
                            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1 w-auto">
                                Programada&nbsp;
                                <span className="text-xs font-sans font-bold">
                                    {nota.programar_publicacion}
                                </span>
                            </span>
                        </div>
                    )}
                    <div className="bg-white p-2">
                        <h2 className="text-base font-bold text-gray-900 mb-1 leading-4.5">
                            {nota.titulo}
                        </h2>
                    </div>
                </div>
            </div>
            {/* Botones abajo, solo en hover 
            <div className="flex items-center justify-center gap-2 pb-4 transition-opacity duration-200 opacity-0 group-hover:opacity-100 absolute left-0 right-0 bottom-0 z-10 bg-gradient-to-b from-gray-50/20 via-gray-200/15 to-gray-700/30 backdrop-blur-md">
                <Link
                    to={`/notas/editar/${nota.id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                    <svg
                        className="h-5 w-5 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Editar
                </Link>
                <button
                    onClick={() => onEliminar(nota.id)}
                    disabled={eliminando === nota.id}
                    className="text-red-600 hover:text-red-800 flex items-center disabled:opacity-50"
                >
                    {eliminando === nota.id ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Eliminando...
                        </>
                    ) : (
                        <div className="flex cursor-pointer">
                            <svg
                                className="h-5 w-5 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Eliminar
                        </div>
                    )}
                </button>
            </div>*/}
        </div>
    </Link>
);

// Función para saber si la fecha programada es futura
const esProgramadaFutura = (fechaStr) => {
    if (!fechaStr) return false;
    // Intenta parsear la fecha (soporta formatos tipo "05/08/2025 03:00 p.m." o "2025-08-05T21:00:00.000Z")
    let fecha;
    if (fechaStr.includes('T')) {
        fecha = new Date(fechaStr);
    } else {
        // Si es formato local, intenta parsear manualmente
        // Ejemplo: "05/08/2025 03:00 p.m."
        const match = fechaStr.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}) (a\.m\.|p\.m\.)/i);
        if (match) {
            let [, dia, mes, anio, hora, minuto, ampm] = match;
            hora = parseInt(hora, 10);
            if (/p\.m\./i.test(ampm) && hora < 12) hora += 12;
            if (/a\.m\./i.test(ampm) && hora === 12) hora = 0;
            fecha = new Date(`${anio}-${mes}-${dia}T${hora.toString().padStart(2, '0')}:${minuto}`);
        } else {
            return false;
        }
    }
    return fecha > new Date();
};

export default NotaCard;