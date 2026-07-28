import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const opciones = [
    { value: '', label: 'Todos los formatos' },
    { value: 'recomendacion', label: 'Recomendación' },
    { value: 'noticia', label: 'Noticia' },
    { value: 'reflexion', label: 'Reflexión' },
    { value: 'favoritos', label: 'Favoritos' },
];

export default function FiltroFormatoNota({ formatoNota, setFormatoNota }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (value) => {
        setAnchorEl(null);
        if (typeof value === 'string') setFormatoNota(value);
    };

    const labelActual = opciones.find(op => op.value === formatoNota)?.label || 'Todos los formatos';

    return (
        <div>
            <Button
                id="formato-nota-button"
                aria-controls={open ? 'formato-nota-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="outlined"
                sx={{
                    backgroundColor: formatoNota ? '#1976d2' : '#fff',
                    color: formatoNota ? '#fff' : '#222',
                    borderColor: formatoNota ? '#1976d2' : '#bdbdbd',
                    fontWeight: 'bold',
                    fontSize: '0.8750rem',
                    borderRadius: '0.75rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.3rem',
                    paddingBottom: '0.3rem',
                    minWidth: 160,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        backgroundColor: formatoNota ? '#1565c0' : '#fff',
                        color: formatoNota ? '#fff' : '#222',
                        borderColor: formatoNota ? '#1565c0' : '#bdbdbd',
                        filter: 'brightness(0.95)',
                    }
                }}
            >
                {labelActual}
                <ArrowDropDownIcon sx={{ ml: 1 }} />
            </Button>
            <Menu
                id="formato-nota-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => handleClose()}
                MenuListProps={{
                    'aria-labelledby': 'formato-nota-button',
                }}
            >
                {opciones.map(op => (
                    <MenuItem
                        key={op.value}
                        selected={formatoNota === op.value}
                        onClick={() => handleClose(op.value)}
                    >
                        {op.label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}
