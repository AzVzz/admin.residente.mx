import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { notasPorTipoNota, catalogoNotasGet } from "../../../componentes/api/notasPublicadasGet";
import { useClientesValidos } from "../../../hooks/useClientesValidos";

import Carrusel from './componentes/Carrusel';
import TarjetaHorizontalPost from '../../../componentes/residente/componentes/componentesColumna2/TarjetaHorizontalPost.jsx'
import BarrioAntiguoGifs from "./componentes/BarrioAntiguoGifs.jsx";
import DirectorioVertical from "../componentes/componentesColumna2/DirectorioVertical.jsx";
import SeccionesPrincipales from "../componentes/SeccionesPrincipales.jsx";

const PaginaCliente = () => {
    const { nombreCliente } = useParams();
    const { clientesValidos, loading: clientesLoading } = useClientesValidos();
    const [notas, setNotas] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Fallback para clientes válidos
    const clientesPredefinidos = ["mama-de-rocco", "barrio-antiguo", "otrocliente"];
    const listaClientes = clientesValidos.length > 0 ? clientesValidos : clientesPredefinidos;

    useEffect(() => {
        setCargando(true);
        
        // Obtener todas las notas y filtrar en frontend
        const cargarNotasFiltradas = async () => {
            try {
                // Obtener todas las notas
                const todasLasNotas = await catalogoNotasGet();
                
                // Normalizar el nombre del cliente para comparación
                const clienteNormalizado = nombreCliente.toLowerCase().replace(/-/g, ' ');
                
                // Filtrar notas que coincidan con este cliente
                const notasDelCliente = todasLasNotas.filter(nota => {
                    const tipoNota = (nota.tipo_nota || '').toLowerCase();
                    const tipoNota2 = (nota.tipo_nota2 || '').toLowerCase();
                    
                    // Buscar coincidencias en tipo_nota o tipo_nota2
                    const coincideTipoNota = tipoNota.includes(clienteNormalizado) || 
                                           tipoNota === clienteNormalizado.replace(/\s/g, '');
                    const coincideTipoNota2 = tipoNota2.includes(clienteNormalizado) || 
                                            tipoNota2 === clienteNormalizado.replace(/\s/g, '');
                    
                    return coincideTipoNota || coincideTipoNota2;
                });
                
                setNotas(notasDelCliente);
            } catch (error) {
                console.error('Error al cargar notas:', error);
                setNotas([]);
            } finally {
                setCargando(false);
            }
        };
        
        cargarNotasFiltradas();
    }, [nombreCliente]);

    if (cargando || clientesLoading) return <div>Cargando...</div>;
    
    // Verificar si es un cliente válido
    if (!listaClientes.includes(nombreCliente)) {
        return <Navigate to="*" replace />;
    }

    // Separa la primera nota y el resto
    const [primeraNota, ...restoNotas] = notas;

    return (
        <div className="my-0">
            <h1 className="text-3xl font-bold">Página de {nombreCliente}</h1>
            <div
                className="grid gap-5 mb-5"
                style={{ gridTemplateColumns: '0.9fr 2fr 1.1fr' }}
            >
                <div>
                    <BarrioAntiguoGifs />
                </div>
                <div className="flex flex-col gap-5">
                    {/* Pasa la primera nota al Carrusel */}
                    <Carrusel nota={primeraNota} />
                    {/* El resto de las notas */}
                    {restoNotas.map(nota => (
                        <TarjetaHorizontalPost key={nota.id} post={nota} />
                    ))}
                </div>
                <div className="flex flex-col gap-5">
                    <DirectorioVertical />
                </div>
            </div>
            <SeccionesPrincipales />
        </div>
    );
};

export default PaginaCliente;