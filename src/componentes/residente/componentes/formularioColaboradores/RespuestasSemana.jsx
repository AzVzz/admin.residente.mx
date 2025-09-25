import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// Elimina MenuItem, ya no se usa
import Autocomplete from '@mui/material/Autocomplete';
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
    const [curriculum, setCurriculum] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);
    const [titulo, setTitulo] = useState("");
    const [imagen, setImagen] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [respuestaConsejo, setRespuestaConsejo] = useState("");
    const [textoConsejo, setTextoConsejo] = useState("");

    // Cargar pregunta y consejeros al montar
    useEffect(() => {
        getPreguntaActual()
            .then(data => setPregunta(data.pregunta || ""))
            .catch(() => setPregunta(""));
        getConsejerosNombres()
            .then(setConsejeros)
            .catch(() => setConsejeros([]));
    }, []);

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
                    <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff202ff', textAlign: 'start' }}>
                        <span style={{ fontWeight: 'bold' }}>
                            IMPORTANTE:<br />
                            Si envías tu colaboración se publicará en tu perfil.<br />
                            Si envías tu consejo no se publicará en tu perfil.
                        </span>
                    </Box>
                    <Box component="form" onSubmit={handleSubmit} sx={{
                        p: 2,
                        maxWidth: 800, // igual que OpinionEditorial
                        mx: "auto",
                        backgroundColor: "transparent"
                    }}>
                        <h1 className="text-2xl font-bold mb-4 text-center">
                            Entrada de colaboraciones</h1>
                        <p className="mb-4 text-justify text-gray-700 leading-[1.2] px-10">
                            Gracias por ser parte de la comunidad de consejeros editoriales y colaboradores especializados de Residente.
                            A continuación podrás enviarnos tu colaboración con el tema de tu elección o bien colaborar opinando
                            sobre el tema de la semana presentado a continuación:
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-center">{pregunta}</h2>
                        <Autocomplete
                            options={consejeros}
                            getOptionLabel={(option) => option.nombre || ""}
                            value={consejeros.find(c => c.id === idConsejero) || null}
                            onChange={(_, newValue) => setIdConsejero(newValue ? newValue.id : "")}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Colaborador *"
                                    required
                                    margin="normal"
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#3b3b3c', // gris oscuro
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#3b3b3c', // gris oscuro
                                        }
                                    }}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />

                        {/* Solo muestra título si NO es consejo */}
                        {!respuestaConsejo && (
                            <TextField
                                label="Título"
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                fullWidth
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#3b3b3c',
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#3b3b3c',
                                    }
                                }}
                            />
                        )}

                        {/* Recuadro para activar el consejo */}
                        <Box className="mb-4 p-4 bg-blue-50 border border-gray-200 rounded">
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                <input
                                    type="checkbox"
                                    checked={respuestaConsejo}
                                    onChange={e => setRespuestaConsejo(e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-blue-500 mr-2"
                                />
                                Mandanos tu consejo editorial
                            </label>
                        </Box>

                        {/* Solo muestra uno u otro */}
                        {!respuestaConsejo ? (
                            <>
                                <TextField
                                    label="Colabora con nosotros *"
                                    value={curriculum}
                                    onChange={e => setCurriculum(e.target.value)}
                                    required
                                    multiline
                                    rows={6}
                                    fullWidth
                                    margin="normal"
                                    sx={{
                                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#3b3b3c',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#3b3b3c',
                                        }
                                    }}
                                />
                                {/* Botón subir imagen y vista previa */}
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<FiUpload />}
                                        sx={{
                                            borderColor: '#fff300',
                                            color: '#fff300',
                                            backgroundColor: 'white',
                                            '&:hover': {
                                                borderColor: '#d3ca1dff',
                                                backgroundColor: '#f5f5f5'
                                            },
                                            padding: '12px 24px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {imagen ? imagen.name : 'SUBIR IMAGEN'}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            hidden
                                            onChange={e => {
                                                const file = e.target.files && e.target.files[0];
                                                if (file) {
                                                    setImagen(file);
                                                    setImagenPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </Button>
                                </Box>
                                {imagenPreview && (
                                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                                        <img
                                            src={imagenPreview}
                                            alt="Vista previa"
                                            style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', margin: '0 auto' }}
                                        />
                                    </Box>
                                )}
                            </>
                        ) : (
                            <TextField
                                label="Escribe tu consejo"
                                value={textoConsejo}
                                onChange={e => setTextoConsejo(e.target.value)}
                                multiline
                                rows={3}
                                fullWidth
                                margin="normal"
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#3b3b3c',
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#3b3b3c',
                                    }
                                }}
                            />
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                backgroundColor: '#fff300',
                                padding: '16px 48px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                textTransform: 'uppercase',
                                width: '100%',
                                '&:hover': {
                                    backgroundColor: '#dbcf27ff'
                                },
                                '&:disabled': {
                                    backgroundColor: '#bdbdbd'
                                }
                            }}
                        >
                            {loading ? "Enviando..." : "Enviar respuesta"}
                        </Button>
                        {mensaje && <Box mt={2} textAlign="center">{mensaje}</Box>}
                    </Box>
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
