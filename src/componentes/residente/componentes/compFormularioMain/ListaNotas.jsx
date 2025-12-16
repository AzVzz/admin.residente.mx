import { useEffect, useState } from "react";
import { useAuth } from "../../../Context";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notasTodasGet } from "../../../api/notasCompletasGet";
import { notaDelete } from "../../../api/notaDelete";
import { FaUser, FaStore, FaStar } from "react-icons/fa6";
import SinNotas from "./componentesListaNotas/SinNotas";
import ErrorNotas from "./componentesListaNotas/ErrorNotas";
import NotaCard from "./componentesListaNotas/NotaCard";
import { RiQuestionnaireFill } from "react-icons/ri";
import { IoMdPlay } from "react-icons/io";
import { FaBookOpen } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa";
import { FaUtensils } from "react-icons/fa";
import { GoNote } from "react-icons/go";
import { IoNewspaper } from "react-icons/io5";
import { FaTicketSimple } from "react-icons/fa6";
import { RiStickyNoteFill } from "react-icons/ri";
import { LuUnderline } from "react-icons/lu";
import { MdAdminPanelSettings } from "react-icons/md"; // Added icon for admin codes
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';

import FiltroEstadoNota from './FiltroEstadoNota';
import FiltroTipoCliente from './FiltroTipoCliente';
import FiltroAutor from './FiltroAutor';
import SearchNotasLocal from './SearchNotasLocal';
import PreguntasSemanales from "./componentesPrincipales/PreguntasSemanales.jsx";
import FormularioRevistaBannerNueva from "./FormularioRevistaBanner.jsx";
import VideosDashboard from "./VideosDashboard.jsx";
import FormNewsletter from "./FormNewsletter.jsx";
import InfografiaForm from "../../infografia/InfografiaForm.jsx";
import ListaNotasUanl from "./ListaNotasUanl.jsx";
import ListaNotasUsuarios from "./ListaNotasUsuarios.jsx";
import ListaTickets from "./ListaTickets";
import FormularioReceta from "./FormularioReceta";
import ListaRecetas from "./ListaRecetas";

const ListaNotas = () => {
  const { token, usuario, saveToken, saveUsuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("notas");
  const [estado, setEstado] = useState('');
  const [tipoCliente, setTipoCliente] = useState('');
  const [autor, setAutor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [todasLasNotas, setTodasLasNotas] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [recetaKey, setRecetaKey] = useState(0);
  const [mostrarFormularioReceta, setMostrarFormularioReceta] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState(null);
  const [recargarListaRecetas, setRecargarListaRecetas] = useState(0);

  // Estados para paginación local
  const [paginaActual, setPaginaActual] = useState(1);
  const notasPorPagina = 15;

  // 
  useEffect(() => {
    // Si hay un error 403 o 401, verificar si es por permisos limitados
    if (error && (error.status === 403 || error.status === 401)) {
      const rolUsuario = usuario?.rol?.toLowerCase();
      // Si el usuario es "invitado" o tiene permisos limitados, NO limpiar la sesión
      // Esto permite que el usuario pueda ver el dashboard y crear notas/recetas
      if (rolUsuario === 'invitado' || (usuario?.permisos && usuario.permisos !== 'todos')) {
        // Mantener la sesión activa, solo mostrar el error
        return;
      }
      // Para otros casos (token expirado, etc.), limpiar sesión y redirigir
      saveToken(null);
      saveUsuario(null);
      navigate(`/registro`, { replace: true });
      return;
    }

    // Redirect B2B users to their dashboard
    if (usuario?.rol === 'b2b') {
      navigate('/dashboardb2b', { replace: true });
      return;
    }

    if (!token || !usuario) {
      navigate(`/registro`, { replace: true });
    }
  }, [token, usuario, error, saveToken, saveUsuario, location, navigate]);

  const fetchTodasLasNotas = async () => {
    setCargando(true);
    setError(null);
    try {
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Verificar permisos ANTES de hacer la llamada a la API
      // El backend requiere rol "residente" para acceder a /api/notas/todas
      // Si el usuario es "invitado" o tiene permisos limitados, no intentar la llamada
      const rolUsuario = usuario?.rol?.toLowerCase();
      const permisosUsuario = usuario?.permisos;

      if (rolUsuario !== 'invitado' && rolUsuario !== 'residente' && permisosUsuario !== 'todos' && permisosUsuario !== 'todo') {
        // Usuario sin permisos para ver todas las notas
        // Mostrar mensaje pero permitir que use el dashboard para crear notas/recetas
        setError({
          message: 'No tienes permisos para ver todas las notas, pero puedes crear nuevas notas y recetas usando los botones del menú.',
          status: 403
        });
        setTodasLasNotas([]);
        setNotas([]);
        setCargando(false);
        return; // Salir sin hacer la llamada a la API
      }

      // Cargar todas las notas sin paginación
      const data = await notasTodasGet(token, 1, 'all');

      // Validar respuesta del servidor
      if (!data) {
        throw new Error('El servidor no devolvió datos');
      }

      if (!Array.isArray(data.notas)) {
        throw new Error('Formato de respuesta inválido del servidor');
      }

      // FILTRAR NOTAS POR USUARIO/CLIENTE
      let notasFiltradas = data.notas;

      // Si el usuario NO es admin (todos), filtrar por sus notas
      if (usuario?.permisos !== 'todos') {
        const tipoNotaUsuario = usuario?.permisos && usuario.permisos !== 'usuario' && usuario.permisos !== 'todo'
          ? usuario.permisos.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          : '';

        if (tipoNotaUsuario) {
          const tipoNotaUsuarioLower = tipoNotaUsuario.toLowerCase();

          notasFiltradas = data.notas.filter(nota => {
            const tipoNota = (nota.tipo_nota || '').toLowerCase();
            const tipoNota2 = (nota.tipo_nota2 || '').toLowerCase();

            // Buscar coincidencias más flexibles
            const coincide = tipoNota.includes(tipoNotaUsuarioLower) ||
              tipoNota2.includes(tipoNotaUsuarioLower) ||
              tipoNota.includes(tipoNotaUsuarioLower.replace(/\s/g, '')) ||
              tipoNota2.includes(tipoNotaUsuarioLower.replace(/\s/g, '')) ||
              tipoNota.includes(tipoNotaUsuarioLower.replace(/\s/g, '-')) ||
              tipoNota2.includes(tipoNotaUsuarioLower.replace(/\s/g, '-')) ||
              // Para "mama de rocco" específicamente
              (tipoNotaUsuarioLower.includes('mama') && tipoNota.includes('mama')) ||
              (tipoNotaUsuarioLower.includes('mama') && tipoNota2.includes('mama')) ||
              (tipoNotaUsuarioLower.includes('rocco') && tipoNota.includes('rocco')) ||
              (tipoNotaUsuarioLower.includes('rocco') && tipoNota2.includes('rocco'));

            // También mostrar notas creadas por el propio usuario (notas personales)
            const esAutor = (nota.autor || '').toLowerCase() === (usuario.nombre_usuario || '').toLowerCase();

            return coincide || esAutor;
          });
        }
      }

      setTodasLasNotas(notasFiltradas);
      setNotas(notasFiltradas);
      setPaginaActual(1); // Resetear a página 1 al cargar
    } catch (err) {
      console.error('Error detallado:', err);
      console.error('Mensaje del error:', err.message);
      console.error('Status del error:', err.status);
      console.error('Stack trace:', err.stack);

      // Manejo específico de errores 403
      if (err.status === 403) {
        console.error('Error 403: Acceso denegado. Verificar permisos del usuario o token expirado');

        // Si el usuario es "invitado" o tiene permisos limitados, mostrar mensaje pero mantener sesión
        // Esto permite que el usuario pueda ver el dashboard y crear notas/recetas aunque no pueda ver todas las notas
        const rolUsuario = usuario?.rol?.toLowerCase();
        if (rolUsuario === 'invitado' || (usuario?.permisos && usuario.permisos !== 'todos')) {
          setError({
            message: 'No tienes permisos para ver todas las notas, pero puedes crear nuevas notas y recetas usando los botones del menú.',
            status: 403
          });
          setTodasLasNotas([]);
          setNotas([]);
          return;
        }

        // Para otros casos de 403 (token expirado, etc.), limpiar sesión y redirigir
        saveToken(null);
        saveUsuario(null);
        navigate('/registro', { replace: true });
        return;
      }

      setError(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchTodasLasNotas();
    // eslint-disable-next-line
  }, [token, usuario]);


  const eliminarNota = async (id) => {
    setEliminando(id);
    try {
      await notaDelete(id);
      await fetchTodasLasNotas();
    } catch (error) {
      alert("Error al eliminar la nota");
    } finally {
      setEliminando(null);
    }
  };

  const mapeoPermisosATipoNota = {
    'mama-de-rocco': 'Mamá de Rocco',
    'barrio-antiguo': 'Barrio Antiguo',
  };

  // Función para normalizar texto para búsqueda
  const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[¿?¡!.,]/g, '') // Quitar signos de puntuación
      .trim();
  };

  const notasFiltradas = todasLasNotas.filter(nota => {
    const cumpleEstado = !estado || (nota.estatus || '').toLowerCase().trim() === estado.toLowerCase().trim();
    const cumpleAutor = !autor || (nota.autor || '').toLowerCase().trim() === autor.toLowerCase().trim();

    let cumpleTipoCliente = true;
    if (tipoCliente) {
      const tipoNotaEsperado = mapeoPermisosATipoNota[tipoCliente];
      if (tipoNotaEsperado) {
        cumpleTipoCliente = (nota.tipo_nota || '') === tipoNotaEsperado;
      } else {
        const tipoClienteFormateado = tipoCliente
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        cumpleTipoCliente = (nota.tipo_nota || '').toLowerCase().includes(tipoClienteFormateado.toLowerCase()) ||
          (nota.tipo_nota || '').toLowerCase().includes(tipoCliente.toLowerCase());
      }
    }

    // Filtro de búsqueda local
    let cumpleBusqueda = true;
    if (searchTerm.trim()) {
      const queryNormalizado = normalizarTexto(searchTerm);
      const tituloNormalizado = normalizarTexto(nota.titulo);
      const subtituloNormalizado = normalizarTexto(nota.subtitulo);
      const autorNormalizado = normalizarTexto(nota.autor);
      const tipoNotaNormalizado = normalizarTexto(nota.tipo_nota);

      // Búsqueda exacta
      if (tituloNormalizado.includes(queryNormalizado) ||
        subtituloNormalizado.includes(queryNormalizado) ||
        autorNormalizado.includes(queryNormalizado) ||
        tipoNotaNormalizado.includes(queryNormalizado)) {
        cumpleBusqueda = true;
      } else {
        // Búsqueda por palabras individuales
        const palabrasQuery = queryNormalizado.split(/\s+/).filter(p => p.length > 2);
        if (palabrasQuery.length > 0) {
          let coincidencias = 0;
          for (const palabraQuery of palabrasQuery) {
            if (tituloNormalizado.includes(palabraQuery) ||
              subtituloNormalizado.includes(palabraQuery) ||
              autorNormalizado.includes(palabraQuery) ||
              tipoNotaNormalizado.includes(palabraQuery)) {
              coincidencias++;
            }
          }
          cumpleBusqueda = coincidencias >= Math.ceil(palabrasQuery.length * 0.5); // Al menos 50% de coincidencia
        } else {
          cumpleBusqueda = false;
        }
      }
    }

    return cumpleEstado && cumpleTipoCliente && cumpleAutor && cumpleBusqueda;
  });

  // Calcular paginación local
  const totalNotasFiltradas = notasFiltradas.length;
  const totalPaginas = Math.ceil(totalNotasFiltradas / notasPorPagina);
  const inicioIndice = (paginaActual - 1) * notasPorPagina;
  const finIndice = Math.min(inicioIndice + notasPorPagina, totalNotasFiltradas);

  // Obtener notas para la página actual
  const notasPaginaActual = notasFiltradas.slice(inicioIndice, finIndice);


  // Resetear a página 1 cuando cambien los filtros o búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [estado, tipoCliente, autor, searchTerm]);

  // Ocultar el formulario de recetas cuando se cambia de vista
  useEffect(() => {
    if (vistaActiva !== "recetas") {
      setMostrarFormularioReceta(false);
    }
  }, [vistaActiva]);

  // Validar que los clientes solo puedan acceder a vistas permitidas
  useEffect(() => {
    const esAdmin = usuario?.permisos === 'todos' || usuario?.permisos === 'todo';
    if (!esAdmin && vistaActiva !== "notas" && vistaActiva !== "recetas") {
      // Si el cliente intenta acceder a una vista restringida, redirigir a "notas"
      setVistaActiva("notas");
    }
  }, [vistaActiva, usuario]);

  // Funciones de navegación local
  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Opciones del menú
  const todasLasOpciones = [
    { key: "notas", label: "Notas", icon: <RiStickyNoteFill className="mr-2" /> },
    { key: "preguntas", label: "Preguntas", icon: <RiQuestionnaireFill className="mr-2" /> },
    { key: "revistas", label: "Revistas", icon: <FaBookOpen className="mr-2" /> },
    { key: "videos", label: "Videos", icon: <IoMdPlay className="mr-2" /> },
    { key: "newsletter", label: "Newsletter", icon: <IoNewspaper className="mr-2" /> },
    { key: "infografias", label: "Infografías", icon: <FaLightbulb className="mr-2" /> },
    { key: "uanl", label: "UANL", icon: <LuUnderline className="mr-2" /> },
    { key: "usuarios", label: "Usuarios", icon: <FaUser className="mr-2" /> },
    { key: "cupones", label: "Cupones", icon: <FaTicketSimple className="mr-2" /> },
    { key: "recetas", label: "Recetas", icon: <FaUtensils className="mr-2" /> },
    { key: "restaurante_link", label: "Restaurante", icon: <FaStore className="mr-2" /> },
    { key: "ednl", label: "Ednl", icon: <FaStar className="mr-2" /> },
    { key: "codigos_admin", label: "Códigos", icon: <MdAdminPanelSettings className="mr-2" /> },
  ];

  // Filtrar opciones del menú según permisos del usuario
  // Si el usuario NO es admin (todos/todo), solo mostrar Notas y Recetas
  const esAdmin = usuario?.permisos === 'todos' || usuario?.permisos === 'todo';
  const esResidente = usuario?.permisos === 'residente' || usuario?.rol === 'residente'; // Checked rol as well just in case
  const esB2B = usuario?.permisos === 'b2b';
  const esInvitado = usuario?.rol === 'invitado';

  const menuOptions = esAdmin
    ? todasLasOpciones
    : todasLasOpciones.filter(option =>
      (usuario?.rol !== 'b2b') && ( // Hide all menu options for B2B users if they are here
        option.key === "notas" ||
        option.key === "recetas" ||
        (option.key === "cupones" && !esInvitado && usuario?.rol !== 'colaborador') ||
        (esResidente && option.key === "restaurante_link") ||
        (usuario?.rol === 'residente' && option.key === "ednl") || // EDNL only for residente role
        (usuario?.rol === 'residente' && option.key === "codigos_admin") // Only for residente role
      )
    );

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Verificar si el error es 403 por permisos limitados (no token expirado)
  const rolUsuario = usuario?.rol?.toLowerCase();
  const esError403SinPermisos = error && error.status === 403 &&
    (rolUsuario === 'invitado' || (usuario?.permisos && usuario.permisos !== 'todos'));

  if (error && !esError403SinPermisos) {
    // Para otros errores (no 403 por permisos), mostrar el componente de error normal
    return <ErrorNotas error={error} onRetry={fetchTodasLasNotas} />;
  }

  return (
    <div className="space-y-6 py-5">
      {/* Encabezado */}
      <div className="flex flex-col gap-5 justify-between">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black rounded-2xl py-1">Panel de Administración</h1>
          {usuario && (
            <div className="flex items-center gap-5">
              <button
                onClick={() => {
                  saveToken(null);
                  saveUsuario(null);
                  navigate("/registro");
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white shadow hover:bg-red-700 transition text-sm font-bold cursor-pointer rounded-xl"
                title="Cerrar sesión"
              >
                Cerrar sesión
              </button>
              <span className="inline-flex items-center px-4 py-2 shadow-sm text-sm font-bold text-white bg-black rounded-xl">
                <FaUser className="text-sm -mt-0.5 mr-2" />
                <span className="flex items-center">{usuario?.nombre_usuario}</span>
              </span>
            </div>
          )}
        </div>

        {/* Menú de pestañas */}
        <div className="flex justify-start  py-2 rounded-md">
          <Button
            aria-controls={open ? 'fade-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleMenuClick}
            startIcon={<MenuIcon />}
            variant="contained"
            color="inherit"
            sx={{ backgroundColor: "#ffff", color: "#222" }}
          >
            Menú
          </Button>
          <Menu
            id="fade-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            TransitionComponent={Fade}
          >
            {menuOptions.map(option => (
              <MenuItem
                key={option.key}
                onClick={() => {
                  if (option.key === "restaurante_link") {
                    navigate('/formulario');
                  } else if (option.key === "cupones") {
                    navigate('/dashboardtickets');
                  } else if (option.key === "codigos_admin") {
                    navigate('/admin/codigos');
                  } else if (option.key === "ednl") {
                    navigate('/ednl');
                  } else {
                    setVistaActiva(option.key);
                  }
                  handleMenuClose();
                }}
                selected={vistaActiva === option.key}
              >
                {option.icon}
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div>
        {vistaActiva === "notas" && (
          <>
            {/* Barra de búsqueda y filtros para vista de notas */}
            <div className="flex justify-between mb-5 gap-4 items-center">
              {/* Barra de búsqueda */}
              <div className="flex-1 max-w-md">
                <SearchNotasLocal searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </div>

              {/* Filtros */}
              <div className="flex gap-2 items-center">
                {usuario?.permisos === 'todos' && (
                  <FiltroEstadoNota estado={estado} setEstado={setEstado} />
                )}
                {usuario?.permisos === 'todos' && (
                  <FiltroTipoCliente tipoCliente={tipoCliente} setTipoCliente={setTipoCliente} />
                )}
                {usuario?.permisos === 'todos' && (
                  <FiltroAutor autor={autor} setAutor={setAutor} />
                )}
                <Link
                  to="/notas/nueva"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Nueva Nota
                </Link>
              </div>
            </div>

            {!notas || notas.length === 0 ? (
              <SinNotas />
            ) : notasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  {searchTerm ? `No se encontraron notas que coincidan con "${searchTerm}"` : 'No hay notas que coincidan con los filtros seleccionados'}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notasPaginaActual.map((nota) => (
                    <NotaCard
                      key={nota.id}
                      nota={nota}
                      onEliminar={eliminarNota}
                      eliminando={eliminando}
                    />
                  ))}
                </div>

                {/* Información de resultados y paginación */}
                <div className="flex flex-col items-center mt-8 space-y-4">
                  {/* Información de paginación */}
                  <div className="text-sm text-gray-600">
                    Mostrando {inicioIndice + 1} - {finIndice} de {totalNotasFiltradas} notas
                    {searchTerm && ` (filtradas por "${searchTerm}")`}
                  </div>

                  {/* Navegación de páginas */}
                  {totalPaginas > 1 && (
                    <div className="flex items-center space-x-2">
                      {/* Botón anterior */}
                      <button
                        onClick={irAPaginaAnterior}
                        disabled={paginaActual === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                      >
                        ← Anterior
                      </button>

                      {/* Números de página */}
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                          // Mostrar solo un rango de páginas alrededor de la actual
                          const mostrarPagina =
                            numero === 1 ||
                            numero === totalPaginas ||
                            (numero >= paginaActual - 2 && numero <= paginaActual + 2);

                          if (!mostrarPagina) {
                            // Mostrar puntos suspensivos
                            if (numero === paginaActual - 3 || numero === paginaActual + 3) {
                              return <span key={numero} className="px-2 py-2 text-gray-400">...</span>;
                            }
                            return null;
                          }

                          return (
                            <button
                              key={numero}
                              onClick={() => irAPagina(numero)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${numero === paginaActual
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                              {numero}
                            </button>
                          );
                        })}
                      </div>

                      {/* Botón siguiente */}
                      <button
                        onClick={irAPaginaSiguiente}
                        disabled={paginaActual === totalPaginas}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${paginaActual === totalPaginas
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {vistaActiva === "preguntas" && (
          <div className="text-center text-lg"><PreguntasSemanales /></div>
        )}

        {vistaActiva === "revistas" && (
          <div className="text-center text-lg"><FormularioRevistaBannerNueva /></div>
        )}

        {vistaActiva === "videos" && (
          <div className="text-center text-lg"><VideosDashboard /></div>
        )}

        {vistaActiva === "newsletter" && (
          <div className="text-center text-lg"><FormNewsletter /></div>
        )}
        {vistaActiva === "infografias" && (
          <div className="text-center text-lg"><InfografiaForm /></div>
        )}
        {vistaActiva === "uanl" && (
          <div className="text-center text-lg"><ListaNotasUanl /></div>
        )}
        {vistaActiva === "usuarios" && (
          <div className="text-center text-lg"><ListaNotasUsuarios /></div>
        )}
        {vistaActiva === "cupones" && (
          <div className="text-center text-lg"><ListaTickets /></div>
        )}
        {vistaActiva === "recetas" && (
          <div>
            <div className="flex justify-end mb-5">
              <button
                onClick={() => {
                  // Mostrar el formulario y resetearlo
                  setRecetaEditando(null);
                  setMostrarFormularioReceta(true);
                  setRecetaKey(prev => prev + 1);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Nueva Receta
              </button>
            </div>
            {mostrarFormularioReceta ? (
              <div className="text-center text-lg">
                <FormularioReceta
                  key={recetaKey}
                  receta={recetaEditando}
                  onCancelar={() => {
                    setMostrarFormularioReceta(false);
                    setRecetaEditando(null);
                  }}
                  onEnviado={() => {
                    setMostrarFormularioReceta(false);
                    setRecetaEditando(null);
                    setRecargarListaRecetas(prev => prev + 1);
                  }}
                />
              </div>
            ) : (
              <ListaRecetas
                key={recargarListaRecetas}
                onEditar={(receta) => {
                  setRecetaEditando(receta);
                  setMostrarFormularioReceta(true);
                  setRecetaKey(prev => prev + 1);
                }}
                onCopiar={(receta) => {
                  // Copiar datos de la receta
                  const recetaParaCopiar = {
                    ...receta,
                    id: undefined
                  };
                  navigator.clipboard.writeText(JSON.stringify(recetaParaCopiar, null, 2));
                  alert("Datos de la receta copiados al portapapeles");
                }}
                onRecetaEliminada={() => {
                  setRecargarListaRecetas(prev => prev + 1);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaNotas;