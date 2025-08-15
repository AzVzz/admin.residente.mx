import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"

const PreguntasSemanales = () => {
  return (
    <Box className="my-8 w-full bg-white p-5">
        <TextField
            id="outlined-basic" 
            label="Pregunta" 
            placeholder="Escribe la nueva pregunta de la semana" 
            variant="outlined" 
            fullWidth/>
    </Box>
  )
}

export default PreguntasSemanales
