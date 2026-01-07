import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPreguntaActual, getColaboradores, postRespuestaSemana, putRespuestaSemana, getRespuestaPorId } from "../../../api/temaSemanaApi";
import DirectorioVertical from "../componentesColumna2/DirectorioVertical";
import PortadaRevista from "../componentesColumna2/PortadaRevista";
import BotonesAnunciateSuscribirme from "../componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "../componentesColumna1/Infografia";

const RespuestasSemana = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editarId = searchParams.get("editar");

    const [pregunta, setPregunta] = useState("");
    const [consejeros, setConsejeros] = useState([]);
    const [idConsejero, setIdConsejero] = useState("");
    const [curriculum, setCurriculum] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);
    const [titulo, setTitulo] = useState("");
    const [imagen, setImagen] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [respuestaConsejo, setRespuestaConsejo] = useState(false);
    const [textoConsejo, setTextoConsejo] = useState("");
    const [enviandoConsejo, setEnviandoConsejo] = useState(false);
    const [mensajeConsejo, setMensajeConsejo] = useState("");
    const [imagenConsejo, setImagenConsejo] = useState(null);
    const [imagenConsejoPreview, setImagenConsejoPreview] = useState(null);
    const [isLogged, setIsLogged] = useState(false);
    const [isColaborador, setIsColaborador] = useState(false);
    const [nombreColaborador, setNombreColaborador] = useState("");
    const [imagenActual, setImagenActual] = useState(null);
    const [cargandoDatos, setCargandoDatos] = useState(editarId ? true : false);
    const [usuario, setUsuario] = useState(null); // ← NUEVO: Guardamos el usuario completo

    // Obtener usuario del localStorage
    useEffect(() => {
        const usuarioStr = localStorage.getItem("admin_usuario") || localStorage.getItem("usuario");
        let usuarioData = null;
        try {
            usuarioData = usuarioStr ? JSON.parse(usuarioStr) : null;
        } catch {
            usuarioData = null;
        }

        console.log("Usuario encontrado:", usuarioData);

        setUsuario(usuarioData);
        setIsLogged(!!usuarioData);
        setIsColaborador(usuarioData?.rol === "colaborador");
        setNombreColaborador(usuarioData?.nombre_usuario || "");
    }, []);

    // Cargar pregunta y consejeros al montar
    useEffect(() => {
        getPreguntaActual()
            .then(data => setPregunta(data.pregunta || ""))
            .catch(() => setPregunta(""));

        getColaboradores()
            .then(setConsejeros)
            .catch(() => setConsejeros([]));
    }, []);

    // Asignar idConsejero cuando AMBOS consejeros y usuario estén disponibles
    useEffect(() => {
        if (usuario && isColaborador && consejeros.length > 0 && usuario.id) {
            console.log("Buscando consejero para usuario ID:", usuario.id);
            console.log("Lista de consejeros:", consejeros);

            const consejero = consejeros.find(c => c.usuario_id === parseInt(usuario.id));
            if (consejero) {
                setIdConsejero(consejero.id);
                console.log("✅ Consejero encontrado:", consejero);
            } else {
                setIdConsejero("");
                console.log("❌ No se encontró consejero para usuario ID:", usuario.id);
                console.log("IDs disponibles:", consejeros.map(c => c.usuario_id));
            }
        }
    }, [consejeros]);

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setImagen(file);
            setImagenPreview(URL.createObjectURL(file));
        }
    };

    // Limpiar la imagen
    const eliminarImagenPreview = () => {
        setImagen(null);
        setImagenActual(null);
        setImagenPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setLoading(true);

        if (!isLogged) {
            setMensaje("Debes iniciar sesión para publicar.");
            setLoading(false);
            return;
        }
        if (!isColaborador) {
            setMensaje("Solo los colaboradores pueden publicar.");
            setLoading(false);
            return;
        }
        if (!idConsejero) {
            setMensaje("No se encontró tu usuario en la lista de colaboradores. Contacta a soporte.");
            setLoading(false);
            return;
        }

        let curriculumToSend = curriculum;
        let tituloToSend = titulo;
        let imagenToSend = imagen;
        if (respuestaConsejo) {
            curriculumToSend = "";
            tituloToSend = "";
            imagenToSend = null;
        }

        try {
            if (editarId) {
                await putRespuestaSemana(editarId, {
                    pregunta,
                    respuesta_colaboracion: curriculumToSend,
                    titulo: tituloToSend,
                    imagen: imagenToSend,
                    respuesta_consejo: respuestaConsejo,
                    texto_consejo: textoConsejo
                });
                setMensaje("¡Colaboración actualizada correctamente!");
            } else {
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
                setTitulo("");
                setImagen(null);
                setImagenPreview(null);
                setRespuestaConsejo(false);
                setTextoConsejo("");
            }
        } catch (error) {
            console.error("Error:", error);
            setMensaje(editarId ? "Error al actualizar la colaboración." : "Error al enviar la respuesta.");
        }
        setLoading(false);
    };

    if (cargandoDatos) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1080px] mx-auto py-8">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9">
                <div>
                    {/* Si NO es colaborador, solo muestra el mensaje */}
                    {(!isLogged || !isColaborador) ? (
                        <div className="p-6 bg-white border border-red-400 rounded text-center">
                            <div className="text-2xl font-bold text-red-600 mb-2">
                                Acceso restringido
                            </div>
                            <div className="text-lg text-red-500">
                                Este acceso solo está disponible para colaboradores registrados.<br />
                                Si eres colaborador y tienes problemas, contacta a soporte.
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-3 p-4 bg-[#fff200] text-start rounded">
                                <span className="font-bold">
                                    IMPORTANTE:<br />
                                    Tu colaboración se publicará solamente en tu perfil.
                                </span>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <h1 className="text-2xl font-bold mb-4 text-center">
                                    {editarId ? "Editar colaboración" : "Entrada de colaboraciones"}
                                </h1>
                                <div className="mb-4">
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
                                <div className="mb-4">
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
                                <div className="mb-4">
                                    <label className="space-y-2 font-roman font-bold">
                                        Subir Imagen*
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                                        required={!editarId && !imagenPreview}
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
                                        {editarId && (
                                            <button
                                                type="button"
                                                onClick={eliminarImagenPreview}
                                                className="mt-2 text-sm text-red-600 hover:text-red-800 font-bold"
                                            >
                                                Eliminar imagen
                                            </button>
                                        )}
                                    </div>
                                )}

                                {mensaje && (
                                    <div className="text-center font-bold mt-4 text-black">
                                        {mensaje}
                                    </div>
                                )}
                                <div className="flex flex-col items-center gap-4 mt-6">
                                    <button
                                        type="submit"
                                        className={`inline-flex items-center justify-center font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[250px] h-[40px] text-sm uppercase ${loading || !isLogged || !isColaborador
                                            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                            : "bg-[#fff200] text-black"
                                            }`}
                                        disabled={loading || !isLogged || !isColaborador}
                                    >
                                        {loading ? "Enviando..." : editarId ? "Actualizar colaboración" : "Enviar colaboración"}
                                    </button>
                                </div>
                                {!isLogged && (
                                    <div className="text-center font-bold mt-4 text-red-600">
                                        Debes iniciar sesión para publicar.
                                    </div>
                                )}
                                {isLogged && !isColaborador && (
                                    <div className="text-center font-bold mt-4 text-red-600">
                                        Solo los colaboradores pueden publicar.
                                    </div>
                                )}
                            </form>

                            {/* Formulario separado para Consejos Editoriales */}
                            <div className="mt-10 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                <h2 className="text-xl font-bold mb-4 text-center">
                                    Envíanos tu consejo editorial
                                </h2>
                                <h3 className="text-lg font-bold mb-4 text-center text-gray-700">
                                    {pregunta ? pregunta : "No hay preguntas por el momento"}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 text-center">
                                    Tu consejo será enviado directamente a nuestro equipo y no se publicará en tu perfil.
                                </p>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!textoConsejo.trim()) {
                                        setMensajeConsejo("Por favor escribe tu consejo.");
                                        return;
                                    }
                                    setEnviandoConsejo(true);
                                    setMensajeConsejo("");
                                    try {
                                        await postRespuestaSemana({
                                            id_consejero: idConsejero,
                                            pregunta,
                                            respuesta_colaboracion: "",
                                            titulo: "",
                                            imagen: null,
                                            respuesta_consejo: true,
                                            texto_consejo: textoConsejo
                                        });
                                        setMensajeConsejo("¡Consejo enviado correctamente!");
                                        setTextoConsejo("");
                                    } catch (error) {
                                        console.error("Error enviando consejo:", error);
                                        setMensajeConsejo("Error al enviar el consejo.");
                                    }
                                    setEnviandoConsejo(false);
                                }}>
                                    <div className="mb-4">
                                        <label className="space-y-2 font-roman font-bold">
                                            Tu consejo*
                                        </label>
                                        <textarea
                                            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-family-roman font-bold text-sm"
                                            value={textoConsejo}
                                            onChange={e => setTextoConsejo(e.target.value)}
                                            required
                                            rows={3}
                                            placeholder="Escribe aquí tu consejo editorial..."
                                        />
                                    </div>
                                    {mensajeConsejo && (
                                        <div className={`text-center font-bold mb-4 ${mensajeConsejo.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                                            {mensajeConsejo}
                                        </div>
                                    )}
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            disabled={enviandoConsejo}
                                            className={`inline-flex items-center justify-center font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[250px] h-[40px] text-sm uppercase ${enviandoConsejo
                                                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                                : "bg-[#fff200] text-black hover:bg-yellow-400"
                                                }`}
                                        >
                                            {enviandoConsejo ? "Enviando..." : "Enviar consejo"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
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
