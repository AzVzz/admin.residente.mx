import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const opciones = [
    { value: '', label: 'Todos los autores' },
    { value: 'Jerry Maister', label: 'Jerry Maister' },
    { value: 'Paula', label: 'Paula' },
    { value: 'Nataly', label: 'Nataly' },
    { value: 'Eduardo', label: 'Eduardo' },
];

// Función para obtener color de fondo y texto según el autor
const getButtonStyles = (autor) => {
    if (autor === 'Daniel') {
        return { backgroundColor: '#2196f3', color: '#fff', borderColor: '#2196f3' }; // Azul
    }
    if (autor === 'Nataly') {
        return { backgroundColor: '#e91e63', color: '#fff', borderColor: '#e91e63' }; // Rosa
    }
    if (autor === 'Eduardo') {
        return { backgroundColor: '#4caf50', color: '#fff', borderColor: '#4caf50' }; // Verde
    }
    return { backgroundColor: '#fff', color: '#222', borderColor: '#bdbdbd' };
};

export default function FiltroAutor({ autor, setAutor }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (value) => {
        setAnchorEl(null);
        if (typeof value === 'string') setAutor(value);
    };

    // Para mostrar el label del autor seleccionado
    const labelActual = opciones.find(op => op.value === autor)?.label || 'Autor';

    return (
        <div>
            <Button
                id="autor-button"
                aria-controls={open ? 'autor-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="outlined"
                sx={{
                    ...getButtonStyles(autor),
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
                        ...getButtonStyles(autor),
                        filter: 'brightness(0.95)',
                    }
                }}
            >
                {labelActual}
                <ArrowDropDownIcon sx={{ ml: 1 }} />
            </Button>
            <Menu
                id="autor-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => handleClose()}
                MenuListProps={{
                    'aria-labelledby': 'autor-button',
                }}
            >
                {opciones.map(op => (
                    <MenuItem
                        key={op.value}
                        selected={autor === op.value}
                        onClick={() => handleClose(op.value)}
                    >
                        {op.label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}
