import { useEffect, useState, useRef } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { getPreguntaActual, getConsejerosNombres, postRespuestaSemana } from "../../../api/temaSemanaApi";
import { FiUpload } from "react-icons/fi";
import DirectorioVertical from "../componentesColumna2/DirectorioVertical";
import PortadaRevista from "../componentesColumna2/PortadaRevista";
import BotonesAnunciateSuscribirme from "../componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "../componentesColumna1/Infografia";

const RespuestasSemana = () => {
    const [pregunta, setPregunta] = useState("");
    const [consejeros, setConsejeros] = useState([]);
    const [idConsejero, setIdConsejero] = useState("");
    const [consejeroInput, setConsejeroInput] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [curriculum, setCurriculum] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);
    const [titulo, setTitulo] = useState("");
    const [imagen, setImagen] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [respuestaConsejo, setRespuestaConsejo] = useState(false);
    const [textoConsejo, setTextoConsejo] = useState("");
    const inputRef = useRef(null);

    // Cargar pregunta y consejeros al montar
    useEffect(() => {
        getPreguntaActual()
            .then(data => setPregunta(data.pregunta || ""))
            .catch(() => setPregunta(""));
        getConsejerosNombres()
            .then(setConsejeros)
            .catch(() => setConsejeros([]));
    }, []);

    // Filtra los consejeros según lo que escribe el usuario
    const filteredConsejeros = consejeros.filter(c =>
        c.nombre.toLowerCase().includes(consejeroInput.toLowerCase())
    );

    // Cuando selecciona un consejero de la lista
    const handleSelectConsejero = (c) => {
        setIdConsejero(c.id);
        setConsejeroInput(c.nombre);
        setShowDropdown(false);
    };

    // Si el usuario borra el input, borra el id también
    useEffect(() => {
        if (!consejeroInput) setIdConsejero("");
    }, [consejeroInput]);

    // Cierra el dropdown si hace click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setImagen(file);
            setImagenPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setLoading(true);

        // Si es consejo, limpia los campos de colaboración normal
        let curriculumToSend = curriculum;
        let tituloToSend = titulo;
        let imagenToSend = imagen;
        if (respuestaConsejo) {
            curriculumToSend = "";
            tituloToSend = "";
            imagenToSend = null;
        }

        try {
            await postRespuestaSemana({
                id_consejero: idConsejero,
                pregunta,
                respuesta_colaboracion: curriculumToSend,
                titulo: tituloToSend,
                imagen: imagenToSend,
                respuesta_consejo: respuestaConsejo,
                texto_consejo: textoConsejo
            });
            setMensaje("¡Respuesta enviada correctamente!");
            setCurriculum("");
            setIdConsejero("");
            setConsejeroInput("");
            setTitulo("");
            setImagen(null);
            setImagenPreview(null);
            setRespuestaConsejo(false);
            setTextoConsejo("");
        } catch {
            setMensaje("Error al enviar la respuesta.");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-[1080px] mx-auto py-8">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9">
                {/* Columna principal: formulario */}
                <div>
                    <div className="mb-3 p-4 bg-[#fff200] text-start rounded">
                        <span className="font-bold">
                            IMPORTANTE:<br />
                            Si envías tu colaboración se publicará en tu perfil.<br />
                            Si envías tu consejo no se publicará en tu perfil.
                        </span>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <h1 className="text-2xl font-bold mb-4 text-center">
                            Entrada de colaboraciones
                        </h1>
                        <p className="mb-4 text-center text-gray-700 leading-[1.2] px-10">
                            Gracias por ser parte de la comunidad de consejeros editoriales y colaboradores especializados de Residente.
                            A continuación podrás enviarnos tu colaboración con el tema de tu elección o bien colaborar opinando
                            sobre el tema de la semana presentado a continuación:
                        </p>
                        <h2 className="text-xl font-bold mb-4 text-center">
                            {pregunta ? pregunta : "No hay preguntas por el momento"}
                        </h2>
                        {/* Autocomplete manual */}
                        <div ref={inputRef}>
                            <label className="space-y-2 font-roman font-bold">
                                Colaborador*
                            </label>
                            <input
                                type="text"
                                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                                value={consejeroInput}
                                onChange={e => {
                                    setConsejeroInput(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                autoComplete="off"
                                required
                                placeholder="Escribe tu nombre y selecciónalo"
                            />
                            {showDropdown && filteredConsejeros.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
                                    {filteredConsejeros.map(c => (
                                        <li
                                            key={c.id}
                                            className="px-4 py-2 hover:bg-yellow-100 cursor-pointer"
                                            onClick={() => handleSelectConsejero(c)}
                                        >
                                            {c.nombre}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {!respuestaConsejo && (
                            <div>
                                <label className="space-y-2 font-roman font-bold">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                    className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                                />
                            </div>
                        )}
                        <div className="p-4 bg-blue-50 border border-gray-200 rounded my-4">
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                <input
                                    type="checkbox"
                                    checked={respuestaConsejo}
                                    onChange={e => setRespuestaConsejo(e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-blue-500 mr-2"
                                />
                                Mandanos tu consejo editorial/No se publicará en tu perfil
                            </label>
                        </div>
                        {!respuestaConsejo ? (
                            <>
                                <div>
                                    <label className="space-y-2 font-roman font-bold">
                                        Colabora con nosotros*
                                    </label>
                                    <textarea
                                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                                        value={curriculum}
                                        onChange={e => setCurriculum(e.target.value)}
                                        required
                                        rows={6}
                                    />
                                </div>
                                <div>
                                    <label className="space-y-2 font-roman font-bold">
                                        Subir Imagen (Opcional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                                    />
                                </div>
                                {imagenPreview && (
                                    <div className="text-center mb-2 mt-4">
                                        <img
                                            src={imagenPreview}
                                            alt="Vista previa"
                                            className="w-full h-28 object-cover mx-auto"
                                            style={{ maxWidth: '160px', borderRadius: '8px' }}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div>
                                <label className="space-y-2 font-roman font-bold">
                                    Escribe tu consejo*
                                </label>
                                <textarea
                                    className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                                    value={textoConsejo}
                                    onChange={e => setTextoConsejo(e.target.value)}
                                    required
                                    rows={3}
                                />
                            </div>
                        )}
                        {mensaje && (
                            <div className="text-center font-bold mt-4 text-black">
                                {mensaje}
                            </div>
                        )}
                        <button
                            type="submit"
                            className={`font-bold py-2 px-4 rounded mt-4 w-full cursor-pointer ${loading
                                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                : "bg-[#fff200] hover:bg-[#e6d900] text-black"
                                }`}
                            disabled={loading}
                        >
                            {loading
                                ? "Enviando..."
                                : respuestaConsejo
                                    ? "Enviar consejo editorial"
                                    : "Enviar colaboración"}
                        </button>
                    </form>
                </div>
                {/* Columna lateral */}
                <div className="flex flex-col items-end justify-start gap-10">
                    <DirectorioVertical />
                    <PortadaRevista />
                    <div className="pt-3">
                        <BotonesAnunciateSuscribirme />
                    </div>
                    <Infografia />
                </div>
            </div>
        </div>
    );
};

export default RespuestasSemana;
