import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import { useState, useEffect } from "react"
import { crearPreguntaTemaSemana, obtenerPreguntasTemaSemana, editarPreguntaTemaSemana, borrarPreguntaTemaSemana } from "../../../../api/preguntasApi"

const colorEstado = {
  vigente: "green",
  expirada: "red",
  programada: "blue"
}

const PreguntasSemanales = () => {
  const [pregunta, setPregunta] = useState("")
  const [publicarEn, setPublicarEn] = useState("")
  const [expirarEn, setExpirarEn] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [preguntas, setPreguntas] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState("")
  const [editingPublicarEn, setEditingPublicarEn] = useState("")
  const [editingExpirarEn, setEditingExpirarEn] = useState("")
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

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(""), 3000); // 3 segundos
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje("")

    // Validación de fechas en el frontend
    if (publicarEn && expirarEn && expirarEn <= publicarEn) {
      setMensaje("La fecha de expiración debe ser posterior a la de publicación.")
      return
    }

    const publicarEnConHora = publicarEn ? publicarEn + "T12:00:00" : "";
    const expirarEnConHora = expirarEn ? expirarEn + "T23:59:59" : ""; // Expira al final del día elegido

    // Verificar si ya existe una pregunta vigente para la fecha seleccionada
    const existePreguntaVigente = preguntas.some(p =>
      new Date(publicarEn) <= new Date(p.expirar_en)
    );

    if (existePreguntaVigente) {
      setMensaje("Ya existe una pregunta vigente para esa fecha. Elige una fecha posterior.")
      return
    }

    try {
      await crearPreguntaTemaSemana(
        {
          pregunta,
          publicar_en: publicarEnConHora,
          expirar_en: expirarEnConHora,
        },
        token
      )
      setMensaje("Pregunta publicada correctamente")
      setPregunta("")
      setPublicarEn("")
      setExpirarEn("")
      const data = await obtenerPreguntasTemaSemana(token)
      setPreguntas(data)
    } catch (error) {
      setMensaje(error.message)
    }
  }

  const handleEditar = (id, textoActual, publicarActual, expirarActual) => {
    setEditingId(id)
    setEditingText(textoActual)
    setEditingPublicarEn(publicarActual)
    setEditingExpirarEn(expirarActual)
    setMensaje("")
  }

  const handleEditarGuardar = async (id) => {
    if (editingPublicarEn && editingExpirarEn && editingExpirarEn <= editingPublicarEn) {
      setMensaje("La fecha de expiración debe ser posterior a la de publicación.")
      return
    }

    const editarPublicarEnConHora = editingPublicarEn ? editingPublicarEn + "T12:00:00" : "";
    const editarExpirarEnConHora = editingExpirarEn ? editingExpirarEn + "T23:59:59" : "";

    try {
      await editarPreguntaTemaSemana(id, {
        pregunta: editingText,
        publicar_en: editarPublicarEnConHora,
        expirar_en: editarExpirarEnConHora
      }, token)
      setMensaje("Pregunta editada correctamente")
      setEditingId(null)
      setEditingText("")
      setEditingPublicarEn("")
      setEditingExpirarEn("")
      const data = await obtenerPreguntasTemaSemana(token)
      setPreguntas(data)
    } catch (error) {
      setMensaje(error.message)
    }
  }

  const handleEditarCancelar = () => {
    setEditingId(null)
    setEditingText("")
    setEditingPublicarEn("")
    setEditingExpirarEn("")
  }

  const handleBorrar = async (id) => {
    try {
      await borrarPreguntaTemaSemana(id, token)
      setMensaje("Pregunta borrada correctamente")
      const data = await obtenerPreguntasTemaSemana(token)
      setPreguntas(data)
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
            <Box
              key={p.id}
              mb={2}
              p={2}
              border={1}
              borderRadius={2}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              {/* Botones a la izquierda */}
              <Box>
                {editingId === p.id ? (
                  <>
                    <Button
                      size="small"
                      color="success"
                      onClick={() => handleEditarGuardar(p.id)}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={handleEditarCancelar}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => handleEditar(p.id, p.pregunta, p.publicar_en, p.expirar_en)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleBorrar(p.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </Box>
              {/* Pregunta, fechas y estado a la derecha */}
              <Box textAlign="right" flex={1}>
                {editingId === p.id ? (
                  <>
                    <TextField
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      size="small"
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Publicar"
                      type="date"
                      value={editingPublicarEn}
                      onChange={e => setEditingPublicarEn(e.target.value)}
                      size="small"
                      fullWidth
                      sx={{ mb: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Expira"
                      type="date"
                      value={editingExpirarEn}
                      onChange={e => setEditingExpirarEn(e.target.value)}
                      size="small"
                      fullWidth
                      sx={{ mb: 1 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </>
                ) : (
                  <>
                    <strong>{p.pregunta}</strong>
                    <div>Publicar: {p.publicar_en}</div>
                    <div>Expira: {p.expirar_en}</div>
                    <div style={{ color: colorEstado[p.estado] || "gray", fontWeight: "bold" }}>
                      {p.estado}
                    </div>
                  </>
                )}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}

export default PreguntasSemanales
