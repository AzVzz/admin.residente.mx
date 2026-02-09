import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { getPreguntaActual, getColaboradores, postRespuestaSemana, putRespuestaSemana, getRespuestaPorId } from "../../../api/temaSemanaApi";
import DirectorioVertical from "../componentesColumna2/DirectorioVertical";
import PortadaRevista from "../componentesColumna2/PortadaRevista";
import BotonesAnunciateSuscribirme from "../componentesColumna1/BotonesAnunciateSuscribirme";
import Infografia from "../componentesColumna1/Infografia";
import MenuColaboradores from "./MenuColaboradores";
import Titulo from "../compFormularioMain/componentes/Titulo";
import Subtitulo from "../compFormularioMain/componentes/Subtitulo";
import Contenido from "../compFormularioMain/componentes/Contenido";
import Autor from "../compFormularioMain/componentes/Autor";
import ImagenNotaSelector from "../compFormularioMain/componentes/ImagenNotaSelector";

const RespuestasSemana = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editarId = searchParams.get("editar");
    const tipoParam = searchParams.get("tipo"); // Leer el parámetro tipo de la URL

    const [pregunta, setPregunta] = useState("");
    const [consejeros, setConsejeros] = useState([]);
    const [idConsejero, setIdConsejero] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);
    const [respuestaConsejo, setRespuestaConsejo] = useState(false);
    const [textoConsejo, setTextoConsejo] = useState("");
    const [enviandoConsejo, setEnviandoConsejo] = useState(false);
    const [mensajeConsejo, setMensajeConsejo] = useState("");
    const [isLogged, setIsLogged] = useState(false);
    const [isColaborador, setIsColaborador] = useState(false);
    const [nombreColaborador, setNombreColaborador] = useState("");
    const [imagenActual, setImagenActual] = useState(null);
    const [cargandoDatos, setCargandoDatos] = useState(editarId ? true : false);
    const [usuario, setUsuario] = useState(null);
    // Inicializar vistaActiva desde el parámetro de URL o usar "colaboracion" por defecto
    const [vistaActiva, setVistaActiva] = useState(tipoParam === "consejo" ? "consejo" : "colaboracion");

    // Configuración de React Hook Form
    // Nota: subtitulo y autor no se guardan en la BD, solo se usan para mostrar
    const methods = useForm({
        defaultValues: {
            titulo: "",
            subtitulo: "", // No se guarda en BD, solo para UI
            autor: "", // No se guarda en BD, solo para UI (el nombre viene del colaborador)
            contenido: "", // Se mapea a respuesta_colaboracion en BD
            imagen: null,
        },
    });

    const { handleSubmit, reset, watch, setValue } = methods;

    // Sincronizar vistaActiva con el parámetro de URL cuando cambie
    useEffect(() => {
        if (tipoParam === "consejo") {
            setVistaActiva("consejo");
        } else {
            setVistaActiva("colaboracion");
        }
    }, [tipoParam]);

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
        const nombre = usuarioData?.nombre_usuario || "";
        setNombreColaborador(nombre);
        
        // Establecer el autor en el formulario
        if (nombre && !editarId) {
            setValue("autor", nombre);
        }
    }, [setValue, editarId]);

    // Cargar pregunta y consejeros al montar
    useEffect(() => {
        getPreguntaActual()
            .then(data => setPregunta(data.pregunta || ""))
            .catch(() => setPregunta(""));
        getColaboradores()
            .then(data => {
                console.log("Consejeros cargados:", data);
                setConsejeros(data);
            })
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
    }, [usuario, isColaborador, consejeros]);

    // Cargar colaboración si viene en modo edición
    useEffect(() => {
        if (editarId && isLogged) {
            const loadColaboracion = async () => {
                try {
                    const data = await getRespuestaPorId(editarId);
                    setTextoConsejo(data.texto_consejo || "");
                    setRespuestaConsejo(data.respuesta_consejo === 1 || data.respuesta_consejo === true);

                    if (data.imagen) {
                        setImagenActual(data.imagen);
                    }

                    // Resetear formulario con los datos de la colaboración
                    // Mapear respuesta_colaboracion a contenido para el formulario
                    reset({
                        titulo: data.titulo || "",
                        subtitulo: data.subtitulo || "", // Ahora se guarda en BD
                        autor: nombreColaborador || "", // No se guarda, solo muestra
                        contenido: data.respuesta_colaboracion || "", // Mapea a respuesta_colaboracion
                        imagen: null, // Se maneja por separado con imagenActual
                    });
                } catch (error) {
                    console.error("Error cargando colaboración:", error);
                    setMensaje("Error al cargar los datos de la colaboración");
                } finally {
                    setCargandoDatos(false);
                }
            };

            loadColaboracion();
        } else {
            setCargandoDatos(false);
        }
    }, [editarId, isLogged, nombreColaborador, reset]);

    const onSubmit = async (data) => {
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

        try {
            // Mapear campos del formulario a la estructura de la BD:
            // - titulo -> titulo (varchar 255)
            // - subtitulo -> subtitulo (varchar 255)
            // - contenido -> respuesta_colaboracion (text)
            // - imagen -> imagen (varchar 255)
            // - autor NO se guarda en BD (el nombre viene del colaborador)
            
            if (editarId) {
                await putRespuestaSemana(editarId, {
                    pregunta: pregunta || "",
                    respuesta_colaboracion: data.contenido || "", // Mapeo: contenido -> respuesta_colaboracion
                    titulo: data.titulo || "",
                    subtitulo: data.subtitulo || "",
                    imagen: data.imagen,
                    respuesta_consejo: false,
                    texto_consejo: ""
                });
                setMensaje("¡Colaboración actualizada correctamente!");
                setTimeout(() => navigate("/dashboard"), 2000);
            } else {
                await postRespuestaSemana({
                    id_consejero: idConsejero,
                    pregunta: pregunta || "",
                    respuesta_colaboracion: data.contenido || "", // Mapeo: contenido -> respuesta_colaboracion
                    titulo: data.titulo || "",
                    subtitulo: data.subtitulo || "",
                    imagen: data.imagen,
                    respuesta_consejo: false,
                    texto_consejo: ""
                });
                setMensaje("¡Colaboración enviada correctamente!");
                reset({
                    titulo: "",
                    subtitulo: "", // No se guarda
                    autor: nombreColaborador || "", // No se guarda
                    contenido: "",
                    imagen: null,
                });
                setImagenActual(null);
                setTimeout(() => navigate("/dashboard"), 2000);
            }
        } catch (error) {
            console.error("Error:", error);
            setMensaje(editarId ? "Error al actualizar la colaboración." : "Error al enviar la colaboración.");
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
                    {/* Validar acceso sin mostrar mensaje de carga */}
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
                            {/* Botón para regresar al dashboard */}
                            <div className="mb-4">
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                        />
                                    </svg>
                                    Regresar al Dashboard
                                </button>
                            </div>
                            
                            {/* Menú hamburguesa */}
                            <MenuColaboradores vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />
                            
                            {/* Formulario de Colaboración */}
                            {vistaActiva === "colaboracion" && (
                                <FormProvider {...methods}>
                                    <div className="mb-3 p-4 bg-[#fff200] text-start rounded">
                                        <span className="font-bold">
                                            IMPORTANTE:<br />
                                            Tu colaboración se publicará solamente en tu perfil.
                                        </span>
                                    </div>
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="mb-4 text-center">
                                            <h1 className="text-2xl font-bold">
                                                {editarId ? "Editar colaboración" : "Nueva colaboración"}
                                            </h1>
                                            <p className="text-gray-600 mt-2">
                                                {editarId
                                                    ? "Edita tu colaboración existente"
                                                    : "Crea una nueva colaboración completando los siguientes campos"}
                                            </p>
                                        </div>

                                        {mensaje && (
                                            <div className={`text-center font-bold p-3 rounded-lg mb-4 ${
                                                mensaje.includes("Error") 
                                                    ? "text-red-600 bg-red-50 border border-red-200" 
                                                    : "text-green-600 bg-green-50 border border-green-200"
                                            }`}>
                                                {mensaje}
                                            </div>
                                        )}

                                        <div className="pb-4">
                                            <ImagenNotaSelector
                                                imagenActual={imagenActual}
                                                notaId={editarId}
                                                onImagenEliminada={() => setImagenActual(null)}
                                            />
                                        </div>

                                        <div className="pb-4">
                                            <Titulo />
                                        </div>

                                        <div className="pb-4">
                                            <Subtitulo />
                                        </div>

                                        <div className="pb-4">
                                            <Autor />
                                        </div>

                                        <div className="pb-4">
                                            <Contenido />
                                        </div>

                                        <div className="flex flex-col items-center gap-4 mt-6">
                                            <button
                                                type="submit"
                                                className={`inline-flex items-center justify-center font-bold py-2 px-4 rounded w-full font-roman cursor-pointer max-w-[250px] h-[40px] text-sm uppercase ${loading || !isLogged || !isColaborador
                                                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                                    : "bg-[#fff200] text-black hover:bg-[#e6d900]"
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
                                </FormProvider>
                            )}

                            {/* Formulario de Consejo */}
                            {vistaActiva === "consejo" && (
                                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
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
                            )}
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
