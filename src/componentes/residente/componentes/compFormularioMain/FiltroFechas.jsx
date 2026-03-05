import { useState, useMemo } from 'react';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MESES_CORTOS = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const PRESETS = [
    { label: '7 días', days: 7 },
    { label: '14 días', days: 14 },
    { label: '30 días', days: 30 },
    { label: '90 días', days: 90 },
];

const formatToYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export default function FiltroFechas({ fechaRange, setFechaRange }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Estado local para selectores de mes
    const hoy = new Date();
    const [mesDesde, setMesDesde] = useState(0);
    const [anioDesde, setAnioDesde] = useState(hoy.getFullYear());
    const [mesHasta, setMesHasta] = useState(hoy.getMonth());
    const [anioHasta, setAnioHasta] = useState(hoy.getFullYear());

    // Estado local para fechas personalizadas
    const [customDesde, setCustomDesde] = useState('');
    const [customHasta, setCustomHasta] = useState('');

    const anioActual = hoy.getFullYear();
    const anios = [];
    for (let a = 2023; a <= anioActual; a++) anios.push(a);

    const hayFiltro = fechaRange.desde || fechaRange.hasta;

    const labelActual = useMemo(() => {
        if (!fechaRange.desde && !fechaRange.hasta) return 'Fechas';
        if (fechaRange.desde && fechaRange.hasta) {
            const desde = new Date(fechaRange.desde + 'T12:00:00');
            const hasta = new Date(fechaRange.hasta + 'T12:00:00');
            const diffDays = Math.round((hasta - desde) / (1000 * 60 * 60 * 24));
            const preset = PRESETS.find(p => p.days === diffDays);
            if (preset) return `Últimos ${preset.label}`;
            // Verificar si es rango de meses completos
            if (desde.getDate() === 1) {
                const ultimoDiaMes = new Date(hasta.getFullYear(), hasta.getMonth() + 1, 0).getDate();
                if (hasta.getDate() === ultimoDiaMes) {
                    const mDesde = MESES_CORTOS[desde.getMonth()];
                    const mHasta = MESES_CORTOS[hasta.getMonth()];
                    if (desde.getFullYear() === hasta.getFullYear()) {
                        return `${mDesde} - ${mHasta} ${hasta.getFullYear()}`;
                    }
                    return `${mDesde} ${desde.getFullYear()} - ${mHasta} ${hasta.getFullYear()}`;
                }
            }
            const fmtDesde = `${desde.getDate()}/${desde.getMonth() + 1}`;
            const fmtHasta = `${hasta.getDate()}/${hasta.getMonth() + 1}`;
            return `${fmtDesde} - ${fmtHasta}`;
        }
        if (fechaRange.desde) return `Desde ${fechaRange.desde}`;
        return `Hasta ${fechaRange.hasta}`;
    }, [fechaRange]);

    const handlePreset = (days) => {
        const hasta = new Date();
        const desde = new Date();
        desde.setDate(hasta.getDate() - days);
        setFechaRange({ desde: formatToYMD(desde), hasta: formatToYMD(hasta) });
        setAnchorEl(null);
    };

    const handleAplicarMeses = () => {
        const primerDia = `${anioDesde}-${String(mesDesde + 1).padStart(2, '0')}-01`;
        const ultimoDia = new Date(anioHasta, mesHasta + 1, 0);
        setFechaRange({ desde: primerDia, hasta: formatToYMD(ultimoDia) });
        setAnchorEl(null);
    };

    const handleAplicarCustom = () => {
        if (!customDesde && !customHasta) return;
        setFechaRange({ desde: customDesde || '', hasta: customHasta || '' });
        setAnchorEl(null);
    };

    const handleLimpiar = () => {
        setFechaRange({ desde: '', hasta: '' });
        setCustomDesde('');
        setCustomHasta('');
        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                onClick={(e) => setAnchorEl(e.currentTarget)}
                variant="outlined"
                sx={{
                    backgroundColor: hayFiltro ? '#7b1fa2' : '#fff',
                    color: hayFiltro ? '#fff' : '#222',
                    borderColor: hayFiltro ? '#7b1fa2' : '#bdbdbd',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    borderRadius: '0.75rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.3rem',
                    paddingBottom: '0.3rem',
                    minWidth: 140,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        backgroundColor: hayFiltro ? '#6a1b9a' : '#f5f5f5',
                        borderColor: hayFiltro ? '#6a1b9a' : '#9e9e9e',
                    }
                }}
            >
                <CalendarMonthIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
                {labelActual}
                <ArrowDropDownIcon sx={{ ml: 0.5 }} />
            </Button>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <div style={{ padding: '16px', width: '320px', fontFamily: 'inherit' }}>
                    {/* Presets rápidos */}
                    <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>
                            Rápido
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {PRESETS.map(p => (
                                <button
                                    key={p.days}
                                    onClick={() => handlePreset(p.days)}
                                    style={{
                                        padding: '4px 10px',
                                        fontSize: '13px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        background: '#f9f9f9',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />

                    {/* Por mes */}
                    <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>
                            Por mes
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', width: '45px' }}>Desde:</span>
                            <select
                                value={mesDesde}
                                onChange={(e) => setMesDesde(Number(e.target.value))}
                                style={{ flex: 1, padding: '4px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                            >
                                {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select
                                value={anioDesde}
                                onChange={(e) => setAnioDesde(Number(e.target.value))}
                                style={{ width: '75px', padding: '4px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                            >
                                {anios.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', width: '45px' }}>Hasta:</span>
                            <select
                                value={mesHasta}
                                onChange={(e) => setMesHasta(Number(e.target.value))}
                                style={{ flex: 1, padding: '4px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                            >
                                {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select
                                value={anioHasta}
                                onChange={(e) => setAnioHasta(Number(e.target.value))}
                                style={{ width: '75px', padding: '4px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                            >
                                {anios.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={handleAplicarMeses}
                            style={{
                                width: '100%',
                                padding: '5px',
                                fontSize: '13px',
                                background: '#1976d2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            Aplicar meses
                        </button>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />

                    {/* Rango personalizado */}
                    <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>
                            Personalizado
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', width: '45px' }}>Desde:</span>
                            <input
                                type="date"
                                value={customDesde}
                                onChange={(e) => setCustomDesde(e.target.value)}
                                style={{ flex: 1, padding: '4px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', width: '45px' }}>Hasta:</span>
                            <input
                                type="date"
                                value={customHasta}
                                onChange={(e) => setCustomHasta(e.target.value)}
                                style={{ flex: 1, padding: '4px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                            />
                        </div>
                        <button
                            onClick={handleAplicarCustom}
                            disabled={!customDesde && !customHasta}
                            style={{
                                width: '100%',
                                padding: '5px',
                                fontSize: '13px',
                                background: (!customDesde && !customHasta) ? '#ccc' : '#1976d2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: (!customDesde && !customHasta) ? 'default' : 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            Aplicar fechas
                        </button>
                    </div>

                    {/* Limpiar */}
                    {hayFiltro && (
                        <>
                            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
                            <button
                                onClick={handleLimpiar}
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    fontSize: '13px',
                                    background: '#fff',
                                    color: '#d32f2f',
                                    border: '1px solid #d32f2f',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                }}
                            >
                                Limpiar filtro de fechas
                            </button>
                        </>
                    )}
                </div>
            </Popover>
        </div>
    );
}
