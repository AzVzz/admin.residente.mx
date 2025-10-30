import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { catalogoNotasGet } from "../../api/notasPublicadasGet";

import PostPrincipal from '../componentes/componentesColumna2/PostPrincipal';
import TresTarjetas from '../componentes/componentesColumna2/TresTarjetas';
import DirectorioVertical from "../componentes/componentesColumna2/DirectorioVertical.jsx";
import PortadaRevista from "../componentes/componentesColumna2/PortadaRevista.jsx";
import MainLateralPostTarjetas from "../componentes/componentesColumna2/MainLateralPostTarjetas.jsx";
import BotonesAnunciateSuscribirme from "../componentes/componentesColumna1/BotonesAnunciateSuscribirme.jsx";
import Infografia from "../componentes/componentesColumna1/Infografia.jsx";
import CincoNotasRRR from "../componentes/seccionesCategorias/componentes/CincoNotasRRR.jsx";
import { urlApi } from "../../api/url.js";

const PaginaCliente = () => {
    const { nombreCliente } = useParams();
    const navigate = useNavigate();
    const [notas, setNotas] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Función para manejar clicks en tarjetas
    const handleCardClick = (nota) => {
        console.log('Card clicked:', nota);

        // Verificar que la nota existe y tiene ID
        if (!nota) {
            console.error('No se recibió una nota válida');
            return;
        }

        if (!nota.id) {
            console.error('La nota no tiene ID:', nota);
            return;
        }

        console.log(`Navegando a /notas/${nota.id}`);
        navigate(`/notas/${nota.id}`);
    };

    // Obtener notas destacadas (top 5)
    const notasTop = notas.slice(0, 5);

    useEffect(() => {
        setCargando(true);

        // Obtener todas las notas y filtrar en frontend
        const cargarNotasFiltradas = async () => {
            try {
                // Obtener todas las notas (sin límite para poder filtrar correctamente)
                const todasLasNotas = await catalogoNotasGet(1, 1000);
                console.log('Todas las notas obtenidas:', todasLasNotas);
                console.log('Número total de notas:', todasLasNotas.length);

                // Mostrar todos los tipos de nota únicos para debugging
                const tiposNotaUnicos = [...new Set(todasLasNotas.map(nota => nota.tipo_nota).filter(Boolean))];
                const tiposNota2Unicos = [...new Set(todasLasNotas.map(nota => nota.tipo_nota2).filter(Boolean))];
                console.log('Tipos de nota únicos:', tiposNotaUnicos);
                console.log('Tipos de nota2 únicos:', tiposNota2Unicos);

                // Normalizar el nombre del cliente para comparación
                const clienteNormalizado = nombreCliente.toLowerCase().replace(/-/g, ' ');
                console.log('Cliente normalizado:', clienteNormalizado);

                // Filtrar notas que coincidan con este cliente
                const notasDelCliente = todasLasNotas.filter(nota => {
                    const tipoNota = (nota.tipo_nota || '').toLowerCase();
                    const tipoNota2 = (nota.tipo_nota2 || '').toLowerCase();

                    // Buscar coincidencias más flexibles
                    const coincideTipoNota = tipoNota.includes(clienteNormalizado) ||
                        tipoNota.includes(clienteNormalizado.replace(/\s/g, '')) ||
                        tipoNota.includes(clienteNormalizado.replace(/\s/g, '-')) ||
                        tipoNota.includes(clienteNormalizado.replace(/\s/g, '_')) ||
                        // Para "mama de rocco" específicamente
                        (clienteNormalizado.includes('mama') && tipoNota.includes('mama')) ||
                        (clienteNormalizado.includes('rocco') && tipoNota.includes('rocco'));

                    const coincideTipoNota2 = tipoNota2.includes(clienteNormalizado) ||
                        tipoNota2.includes(clienteNormalizado.replace(/\s/g, '')) ||
                        tipoNota2.includes(clienteNormalizado.replace(/\s/g, '-')) ||
                        tipoNota2.includes(clienteNormalizado.replace(/\s/g, '_')) ||
                        // Para "mama de rocco" específicamente
                        (clienteNormalizado.includes('mama') && tipoNota2.includes('mama')) ||
                        (clienteNormalizado.includes('rocco') && tipoNota2.includes('rocco'));

                    const coincide = coincideTipoNota || coincideTipoNota2;

                    // Log para debugging
                    if (coincide) {
                        console.log('Nota encontrada:', {
                            id: nota.id,
                            titulo: nota.titulo,
                            tipo_nota: nota.tipo_nota,
                            tipo_nota2: nota.tipo_nota2,
                            coincideTipoNota,
                            coincideTipoNota2
                        });
                    }

                    return coincide;
                });

                console.log('Notas filtradas para', nombreCliente, ':', notasDelCliente.length);
                console.log('Notas del cliente:', notasDelCliente);

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

    if (cargando) return <div>Cargando...</div>;

    // Separa la primera nota y el resto
    const [primeraNota, ...restoNotas] = notas;

    // Normalizar el nombre del cliente para mostrar
    const clienteDisplayName = nombreCliente.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="flex flex-col">
            <div className="flex flex-col pt-9">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-15 gap-y-9 mb-10">
                    {/* Columna Principal */}
                    <div>
                        <div className="relative flex justify-center items-center mb-0">
                            <div className="absolute left-0 right-0 top-1/2 border-t-4 border-transparent opacity-100 z-0" aria-hidden="true" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-center ">
                                    {console.log('nombreCliente:', nombreCliente, 'tipo:', typeof nombreCliente)}
                                    {nombreCliente === 'mama-de-rocco' ? (
                                        <img
                                            src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/mamá de roco 2.webp`}
                                            alt="Mama de Rocco"
                                            className="h-20 sm:h-24 md:h-24 lg:h-24 w-auto max-w-full object-contain"
                                        />
                                    ) : (nombreCliente === 'patolobo' || nombreCliente?.toLowerCase() === 'patolobo' || nombreCliente?.includes('patolobo')) ? (
                                        <img
                                            src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/PATOLOBO® LOGOTIPO NEGRO.webp`}
                                            alt="PatoLobo"
                                            className="h-20 sm:h-18 md:h-18 lg:h-18 w-auto max-w-full object-contain"
                                        />
                                    ) : (
                                        <span className="block text-black font-extrabold uppercase text-center text-4xl md:text-4xl leading-none tracking-tight">
                                            {clienteDisplayName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center items-center text-[15px] mb-4 gap-0 ">
                            <p className="uppercase"></p>
                        </div>

                        {primeraNota && (
                            <PostPrincipal
                                post={primeraNota}
                                onClick={() => handleCardClick(primeraNota)}
                            />
                        )}

                        {restoNotas.length > 0 && (
                            <TresTarjetas
                                posts={restoNotas}
                                onCardClick={(post) => handleCardClick(post)}
                                mostrarBanner={false}
                                mostrarBannerEnMedio={false}
                                revistaActual={null}
                            />
                        )}

                        {notas.length === 0 && !cargando && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No hay contenido disponible para {clienteDisplayName}</p>
                            </div>
                        )}
                    </div>

                    {/* Columna lateral */}
                    <div className="flex flex-col items-end justify-start gap-10">
                        <DirectorioVertical />
                        <PortadaRevista />
                        <MainLateralPostTarjetas
                            notasDestacadas={notasTop}
                            onCardClick={handleCardClick}
                            pasarObjeto={true}
                            sinCategoria
                            sinFecha
                            cantidadNotas={5}
                        />
                        <div className="pt-3">
                            <BotonesAnunciateSuscribirme />
                        </div>
                        {/* <Infografia /> */}
                    </div>
                </div>
            </div>
            {/* Barra amarilla deshabilitada */}
            <div className="relative flex justify-center items-center mb-6 pt-2 mt-8">
                <div className="absolute left-0 right-0 top-1/3 border-t-2 border-black opacity-100 z-0" />
                <div className="relative z-10 px-4 bg-[#DDDDDE]">
                    <div className="flex flex-row justify-center items-center gap-2">
                        <img className="h-full w-105" src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/nuestras-recomendaciones.webp`} />
                    </div>
                    <div className="text-center mt-0 leading-5">
                        <span className="text-[12px] font-semibold tracking-wide">
                            {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="pb-0">
                <CincoNotasRRR tipoNota="Restaurantes" onCardClick={handleCardClick} />
            </div>
        </div>
    );
};

export default PaginaCliente;