import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { catalogoTipoNotaGet } from '../../../api/CatalogoSeccionesGet';

// Opciones por defecto (fallback)
const opcionesDefault = [
    { value: '', label: 'Todas las tipos de notas' },
    { value: 'barrio-antiguo', label: 'Barrio Antiguo' },
    { value: 'mama-de-rocco', label: 'Mama de Rocco' },
    { value: 'Restaurantes', label: 'Restaurantes' },
    { value: 'Food & Drink', label: 'Food & Drink' },
    { value: 'Antojos', label: 'Antojos' },
    { value: 'Gastro-Destinos', label: 'Gastro-Destinos' },
    { value: 'Residente', label: 'Residente' },
    { value: 'Acervo', label: 'Acervo' }
];

// Función para obtener color de fondo y texto según el tipo de cliente
const getButtonStyles = (tipoCliente) => {
    if (tipoCliente === 'barrio-antiguo') {
        return { backgroundColor: '#8e24aa', color: '#fff', borderColor: '#8e24aa' }; // Morado
    }
    if (tipoCliente === 'mama-de-rocco') {
        return { backgroundColor: '#e91e63', color: '#fff', borderColor: '#e91e63' }; // Rosa
    }
    if (tipoCliente === 'otrocliente') {
        return { backgroundColor: '#ff9800', color: '#fff', borderColor: '#ff9800' }; // Naranja
    }
    return { backgroundColor: '#fff', color: '#222', borderColor: '#bdbdbd' }; // Default
};

export default function FiltroTipoCliente({ tipoCliente, setTipoCliente }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [opciones, setOpciones] = useState(opcionesDefault);
    const [cargando, setCargando] = useState(true);
    const open = Boolean(anchorEl);

    // Cargar tipos de cliente dinámicamente
    useEffect(() => {
        const cargarTiposCliente = async () => {
            try {
                setCargando(true);
                const data = await catalogoTipoNotaGet();

                if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    // Crear opciones dinámicas basadas en los datos de la API
                    const opcionesDinamicas = [
                        { value: '', label: 'Todos los Clientes' },
                        ...data.data.map(tipo => ({
                            value: tipo.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóúñ]/g, (match) => {
                                const acentos = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n' };
                                return acentos[match] || match;
                            }),
                            label: tipo.nombre
                        }))
                    ];
                    setOpciones(opcionesDinamicas);
                }
            } catch (error) {
                console.error('Error al cargar tipos de cliente:', error);
                // Mantener opciones por defecto en caso de error
                setOpciones(opcionesDefault);
            } finally {
                setCargando(false);
            }
        };

        cargarTiposCliente();
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (value) => {
        setAnchorEl(null);
        if (typeof value === 'string') setTipoCliente(value);
    };

    // Para mostrar el label del tipo de cliente seleccionado
    const labelActual = opciones.find(op => op.value === tipoCliente)?.label || 'Tipo de Cliente';

    return (
        <div>
            <Button
                id="tipo-cliente-button"
                aria-controls={open ? 'tipo-cliente-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="outlined"
                disabled={cargando}
                sx={{
                    ...getButtonStyles(tipoCliente),
                    fontWeight: 'bold',
                    fontSize: '0.8750rem',         // text-sm
                    borderRadius: '0.75rem',      // rounded-xl
                    paddingLeft: '1rem',          // px-4
                    paddingRight: '1rem',
                    paddingTop: '0.3rem',         // py-2
                    paddingBottom: '0.3rem',
                    minWidth: 160,
                    textTransform: 'none',
                    boxShadow: 'none',
                    opacity: cargando ? 0.7 : 1,
                    '&:hover': {
                        ...getButtonStyles(tipoCliente),
                        filter: 'brightness(0.95)',
                    }
                }}
            >
                {cargando ? 'Cargando...' : labelActual}
                <ArrowDropDownIcon sx={{ ml: 1 }} />
            </Button>
            <Menu
                id="tipo-cliente-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => handleClose()}
                MenuListProps={{
                    'aria-labelledby': 'tipo-cliente-button',
                }}
            >
                {opciones.map(op => (
                    <MenuItem
                        key={op.value}
                        selected={tipoCliente === op.value}
                        onClick={() => handleClose(op.value)}
                    >
                        {op.label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}
