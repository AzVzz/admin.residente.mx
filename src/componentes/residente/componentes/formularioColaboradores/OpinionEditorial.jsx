import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';


const OpinionEditorial = () => {
  return (
    <div className="flex flex-col gap-4">
      <Box
        component="form"
        sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
      >
        <TextField id="outlined-basic" label="Tu nombre" variant="outlined" />
        <TextField id="outlined-basic" label="Correo electronico" variant="outlined" />
        <TextField id="outlined-basic" label="Año de nacimiento" variant="outlined" />
        <TextField id="outlined-basic" label="Lugar de nacimiento" variant="outlined" />
        <TextField
          id="outlined-multiline-static"
          label="Curriculum"
          multiline
          rows={6}
        />
        <TextField id="outlined-basic" label="Opinión editorial" variant="outlined" />
      </Box>

    </div>
  )
}

export default OpinionEditorial
