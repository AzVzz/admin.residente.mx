import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const opciones = [
    { value: '', label: 'Todas' },
    { value: 'publicada', label: 'Publicada' },
    { value: 'borrador', label: 'Borrador' },
    { value: 'programada', label: 'Programada' },
];

// Función para obtener color de fondo y texto según el estado
const getButtonStyles = (estado) => {
    if (estado === 'publicada') {
        return { backgroundColor: '#43a047', color: '#fff', borderColor: '#43a047' }; // Verde
    }
    if (estado === 'borrador') {
        return { backgroundColor: '#fb8c00', color: '#fff', borderColor: '#fb8c00' }; // Naranja
    }
    if (estado === 'programada') {
        return { backgroundColor: '#1976d2', color: '#fff', borderColor: '#1976d2' }; // Azul
    }
    return { backgroundColor: '#fff', color: '#222', borderColor: '#bdbdbd' };
};

export default function FiltroEstadoNota({ estado, setEstado }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (value) => {
        setAnchorEl(null);
        if (typeof value === 'string') setEstado(value);
    };

    // Para mostrar el label del estado seleccionado
    const labelActual = opciones.find(op => op.value === estado)?.label || 'Estado';

    return (
        <div>
            <Button
                id="estado-button"
                aria-controls={open ? 'estado-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="outlined"
                sx={{
                    ...getButtonStyles(estado),
                    fontWeight: 'bold',
                    fontSize: '0.8750rem',         // text-sm
                    borderRadius: '0.75rem',      // rounded-xl
                    paddingLeft: '1rem',          // px-4
                    paddingRight: '1rem',
                    paddingTop: '0.3rem',         // py-2
                    paddingBottom: '0.3rem',
                    minWidth: 140,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        ...getButtonStyles(estado),
                        filter: 'brightness(0.95)',
                    }
                }}
            >
                {labelActual}
                <ArrowDropDownIcon sx={{ ml: 1 }} />
            </Button>
            <Menu
                id="estado-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => handleClose()}
                MenuListProps={{
                    'aria-labelledby': 'estado-button',
                }}
            >
                {opciones.map(op => (
                    <MenuItem
                        key={op.value}
                        selected={estado === op.value}
                        onClick={() => handleClose(op.value)}
                    >
                        {op.label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}