import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { catalogoTipoNotaGet } from '../../../api/CatalogoSeccionesGet';
import { useClientesValidos } from '../../../../hooks/useClientesValidos';

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
    { value: 'Acervo', label: 'Acervo' },
    { value: 'Giveaway', label: 'Giveaway' },
    { value: 'B2B', label: 'B2B' }
];

// Función para obtener color de fondo y texto según el tipo de cliente
const getButtonStyles = (tipoCliente) => {
    if (tipoCliente === 'barrio-antiguo') {
        return { backgroundColor: '#8e24aa', color: '#fff', borderColor: '#8e24aa' }; // Morado
    }
    if (tipoCliente === 'mama-de-rocco') {
        return { backgroundColor: '#e91e63', color: '#fff', borderColor: '#e91e63' }; // Rosa
    }
    return { backgroundColor: '#fff', color: '#222', borderColor: '#bdbdbd' }; // Default
};

export default function FiltroTipoCliente({ tipoCliente, setTipoCliente }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [opciones, setOpciones] = useState(opcionesDefault);
    const [cargando, setCargando] = useState(true);
    const open = Boolean(anchorEl);
    const { clientesValidos } = useClientesValidos(); // Obtener clientes dinámicos

    // Cargar tipos de cliente dinámicamente
    useEffect(() => {
        const cargarTiposCliente = async () => {
            try {
                setCargando(true);
                const data = await catalogoTipoNotaGet();

                // Crear opciones base con las opciones por defecto
                let opcionesDinamicas = [...opcionesDefault];

                // Agregar tipos estáticos de la API (si no están ya incluidos)
                if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    const tiposEstaticos = data.data.map(tipo => ({
                        value: tipo.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[áéíóúñ]/g, (match) => {
                            const acentos = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n' };
                            return acentos[match] || match;
                        }),
                        label: tipo.nombre
                    }));
                    
                    // Solo agregar tipos que no estén ya en las opciones por defecto
                    const tiposNuevos = tiposEstaticos.filter(tipo => 
                        !opcionesDinamicas.some(op => op.value === tipo.value)
                    );
                    opcionesDinamicas = [...opcionesDinamicas, ...tiposNuevos];
                }

                // Agregar clientes dinámicos (solo los que no estén ya en las opciones por defecto)
                if (clientesValidos && clientesValidos.length > 0) {
                    const clientesComoTipos = clientesValidos
                        .filter(cliente => cliente !== 'usuario' && cliente !== 'todo' && cliente !== 'todos')
                        .map(cliente => ({
                            value: cliente,
                            label: cliente.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        }))
                        .filter(cliente => 
                            !opcionesDinamicas.some(op => op.value === cliente.value)
                        );
                    opcionesDinamicas = [...opcionesDinamicas, ...clientesComoTipos];
                }
                setOpciones(opcionesDinamicas);
            } catch (error) {
                console.error('Error al cargar tipos de cliente:', error);
                // Mantener opciones por defecto en caso de error
                setOpciones(opcionesDefault);
            } finally {
                setCargando(false);
            }
        };

        cargarTiposCliente();
    }, [clientesValidos]); // Dependencia de clientesValidos

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
