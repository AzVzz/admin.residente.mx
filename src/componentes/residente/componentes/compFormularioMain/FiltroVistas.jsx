import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const opcionesFiltro = [
    { value: '', label: 'Todas las vistas' },
    { value: '0-100', label: '0 - 100' },
    { value: '100-500', label: '100 - 500' },
    { value: '500-1000', label: '500 - 1,000' },
    { value: '1000-5000', label: '1,000 - 5,000' },
    { value: '5000+', label: '5,000+' },
];

const opcionesOrden = [
    { value: '', label: 'Sin ordenar por vistas' },
    { value: 'vistas_desc', label: 'Más vistas primero' },
    { value: 'vistas_asc', label: 'Menos vistas primero' },
];

const getButtonStyles = (vistas, ordenVistas) => {
    if (vistas || ordenVistas) {
        return { backgroundColor: '#00897b', color: '#fff', borderColor: '#00897b' };
    }
    return { backgroundColor: '#fff', color: '#222', borderColor: '#bdbdbd' };
};

export default function FiltroVistas({ vistas, setVistas, ordenVistas, setOrdenVistas }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleFiltro = (value) => {
        setVistas(value);
        setAnchorEl(null);
    };
    const handleOrden = (value) => {
        setOrdenVistas(value);
        setAnchorEl(null);
    };

    // Build label
    const filtroLabel = opcionesFiltro.find(op => op.value === vistas)?.label;
    const ordenLabel = opcionesOrden.find(op => op.value === ordenVistas)?.label;
    let labelActual = 'Vistas';
    if (vistas && ordenVistas) {
        labelActual = `${filtroLabel} · ${ordenVistas === 'vistas_desc' ? '↓' : '↑'}`;
    } else if (vistas) {
        labelActual = filtroLabel;
    } else if (ordenVistas) {
        labelActual = ordenVistas === 'vistas_desc' ? 'Más vistas ↓' : 'Menos vistas ↑';
    }

    return (
        <div>
            <Button
                id="vistas-button"
                aria-controls={open ? 'vistas-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="outlined"
                sx={{
                    ...getButtonStyles(vistas, ordenVistas),
                    fontWeight: 'bold',
                    fontSize: '0.8750rem',
                    borderRadius: '0.75rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.3rem',
                    paddingBottom: '0.3rem',
                    minWidth: 140,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        ...getButtonStyles(vistas, ordenVistas),
                        filter: 'brightness(0.95)',
                    }
                }}
            >
                {labelActual}
                <ArrowDropDownIcon sx={{ ml: 1 }} />
            </Button>
            <Menu
                id="vistas-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'vistas-button',
                }}
            >
                {/* Filtro por rango */}
                <MenuItem disabled sx={{ opacity: 0.6, fontSize: '0.75rem', minHeight: 'auto', py: 0.5 }}>
                    Filtrar por rango
                </MenuItem>
                {opcionesFiltro.map(op => (
                    <MenuItem
                        key={op.value}
                        selected={vistas === op.value}
                        onClick={() => handleFiltro(op.value)}
                    >
                        {op.label}
                    </MenuItem>
                ))}
                <Divider />
                {/* Ordenar */}
                <MenuItem disabled sx={{ opacity: 0.6, fontSize: '0.75rem', minHeight: 'auto', py: 0.5 }}>
                    Ordenar por vistas
                </MenuItem>
                {opcionesOrden.map(op => (
                    <MenuItem
                        key={op.value}
                        selected={ordenVistas === op.value}
                        onClick={() => handleOrden(op.value)}
                    >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                            {op.value === 'vistas_desc' && <ArrowDownwardIcon fontSize="small" />}
                            {op.value === 'vistas_asc' && <ArrowUpwardIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>{op.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}
