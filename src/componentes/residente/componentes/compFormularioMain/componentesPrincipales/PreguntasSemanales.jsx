import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import { useState, useEffect } from "react"
import { crearPreguntaTemaSemana, obtenerPreguntasTemaSemana } from "../../../../api/preguntasApi"

const PreguntasSemanales = () => {
  const [pregunta, setPregunta] = useState("")
  const [publicarEn, setPublicarEn] = useState("")
  const [expirarEn, setExpirarEn] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [preguntas, setPreguntas] = useState([])
  // Obtener el token del usuario autenticado
  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        const data = await obtenerPreguntasTemaSemana(token)
        setPreguntas(data)
      } catch (error) {
        setMensaje(error.message)
      }
    }
    fetchPreguntas()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje("")
    try {
      await crearPreguntaTemaSemana(
        {
          pregunta,
          publicar_en: publicarEn,
          expirar_en: expirarEn,
        },
        token
      )
      setMensaje("Pregunta publicada correctamente")
      setPregunta("")
      setPublicarEn("")
      setExpirarEn("")
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <Box className="my-8 w-full bg-white p-5">
      <form onSubmit={handleSubmit}>
        <TextField
          id="pregunta"
          label="Pregunta"
          placeholder="Escribe la nueva pregunta de la semana"
          variant="outlined"
          fullWidth
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          margin="normal"
        />
        <TextField
          id="publicar-en"
          label="Fecha de publicación"
          type="date"
          fullWidth
          value={publicarEn}
          onChange={(e) => setPublicarEn(e.target.value)}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          id="expirar-en"
          label="Fecha de expiración"
          type="date"
          fullWidth
          value={expirarEn}
          onChange={(e) => setExpirarEn(e.target.value)}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Publicar Pregunta
        </Button>
        {mensaje && (
          <Box mt={2} color={mensaje.includes("correctamente") ? "green" : "red"}>
            {mensaje}
          </Box>
        )}
      </form>
      <Box mt={4}>
        <h3>Preguntas existentes</h3>
        {preguntas.length === 0 ? (
          <p>No hay preguntas registradas.</p>
        ) : (
          preguntas.map((p) => (
            <Box key={p.id} mb={2} p={2} border={1} borderRadius={2}>
              <strong>{p.pregunta}</strong>
              <div>Publicar: {p.publicar_en}</div>
              <div>Expira: {p.expirar_en}</div>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}

export default PreguntasSemanales
