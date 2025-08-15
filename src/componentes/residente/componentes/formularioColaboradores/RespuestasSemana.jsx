import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
// Elimina MenuItem, ya no se usa
import Autocomplete from '@mui/material/Autocomplete';
import { getPreguntaActual, getConsejerosNombres, postRespuestaSemana } from "../../../api/temaSemanaApi";

const RespuestasSemana = () => {
    const [pregunta, setPregunta] = useState("");
    const [consejeros, setConsejeros] = useState([]);
    const [idConsejero, setIdConsejero] = useState("");
    const [curriculum, setCurriculum] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);

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
        try {
            await postRespuestaSemana({
                id_consejero: idConsejero,
                pregunta,
                respuesta_colaboracion: curriculum
            });
            setMensaje("¡Respuesta enviada correctamente!");
            setCurriculum("");
            setIdConsejero("");
        } catch {
            setMensaje("Error al enviar la respuesta.");
        }
        setLoading(false);
    };

    return (
        <div className="py-8">
            <Box component="form" onSubmit={handleSubmit} sx={{
                p: 2,
                maxWidth: 500,
                mx: "auto",
                backgroundColor: "#fff",
                borderRadius: 2,
                boxShadow: 3
            }}>
                <h1 className="text-2xl font-bold mb-4 text-center">
                    Entrada de colaboraciones</h1>
                <p className="mb-4 text-left text-gray-700">
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
                            label="Colaborador"
                            required
                            margin="normal"
                            fullWidth
                        />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                />

                <TextField
                    label="Curriculum / Respuesta"
                    value={curriculum}
                    onChange={e => setCurriculum(e.target.value)}
                    required
                    multiline
                    rows={6}
                    fullWidth
                    margin="normal"
                />
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? "Enviando..." : "Enviar respuesta"}
                </Button>
                {mensaje && <Box mt={2} textAlign="center">{mensaje}</Box>}
            </Box>
        </div >
    );
};

export default RespuestasSemana;
