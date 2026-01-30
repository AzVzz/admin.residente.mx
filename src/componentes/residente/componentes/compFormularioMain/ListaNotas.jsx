import { useEffect, useState, useMemo, lazy, Suspense, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../../Context";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { notasTodasGet } from "../../../api/notasCompletasGet";
import { notaDelete } from "../../../api/notaDelete";
import { restaurantesBasicosGet } from "../../../api/restaurantesBasicosGet";
import { FaUser, FaStore, FaStar, FaMagnifyingGlass } from "react-icons/fa6";
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
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";

import FiltroEstadoNota from "./FiltroEstadoNota";
import FiltroTipoCliente from "./FiltroTipoCliente";
import FiltroAutor from "./FiltroAutor";
import SearchNotasLocal from "./SearchNotasLocal";

const PreguntasSemanales = lazy(() => import("./componentesPrincipales/PreguntasSemanales.jsx"));
const FormularioRevistaBannerNueva = lazy(() => import("./FormularioRevistaBanner.jsx"));
const VideosDashboard = lazy(() => import("./VideosDashboard.jsx"));
const FormNewsletter = lazy(() => import("./FormNewsletter.jsx"));
const InfografiaForm = lazy(() => import("../../infografia/InfografiaForm.jsx"));
const ListaNotasUanl = lazy(() => import("./ListaNotasUanl.jsx"));
const ListaNotasUsuarios = lazy(() => import("./ListaNotasUsuarios.jsx"));
const ListaTickets = lazy(() => import("./ListaTickets"));
const FormularioReceta = lazy(() => import("./FormularioReceta"));
const ListaRecetas = lazy(() => import("./ListaRecetas"));
const ListaBlogsColaborador = lazy(() => import("./ListaBlogsColaborador.jsx"));
const NoticiasAdmin = lazy(() => import("../NoticiasAdmin.jsx"));
const ClientesVetados = lazy(() => import("../ClientesVetados.jsx"));
const MenuColaboradoresDashboard = lazy(() => import("./MenuColaboradoresDashboard.jsx"));
const TodoB2b = lazy(() => import("./TodoB2b.jsx"));
const BuscadorDashboard = lazy(() => import("../../Admin/BuscadorDashboard.jsx"));

import useDebounce from "../../../../hooks/useDebounce";

// Componente de fallback para lazy loading
const LazyFallback = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-500">Cargando...</span>
  </div>
);

const mapeoPermisosATipoNota = {
  "mama-de-rocco": "Mamá de Rocco",
  "barrio-antiguo": "Barrio Antiguo",
};

// Helper para verificar si una nota está destacada
const esDestacada = (nota) => {
  const destacada = nota.destacada === true || nota.destacada === 1 || nota.destacada === "1";
  const destacadaInvitado = nota.destacada_invitado === true || nota.destacada_invitado === 1 || nota.destacada_invitado === "1";
  return destacada || destacadaInvitado;
};

const ListaNotas = () => {
  const { token, usuario, saveToken, saveUsuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  // Leer vistaActiva de la URL o usar "notas" por defecto (o "mis_restaurantes" para vendedores/b2b)
  const getDefaultView = () => {
    const vistaParam = searchParams.get("vista");
    if (vistaParam) return vistaParam;
    if (usuario?.rol === "vendedor" || usuario?.rol === "b2b") return "mis_restaurantes";
    return "notas";
  };

  const [vistaActiva, setVistaActivaInternal] = useState(getDefaultView());

  // Actualizar vista si cambia el usuario (por si el login se completa después del mount)
  useEffect(() => {
    if (!searchParams.get("vista") && (usuario?.rol === "vendedor" || usuario?.rol === "b2b")) {
      setVistaActivaInternal("mis_restaurantes");
    }
  }, [usuario, searchParams]);

  // Función para cambiar vistaActiva y actualizar URL
  const setVistaActiva = (vista) => {
    setVistaActivaInternal(vista);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("vista", vista);
    setSearchParams(newParams);
  };
  const [estado, setEstado] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [autor, setAutor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [todasLasNotas, setTodasLasNotas] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [recetaKey, setRecetaKey] = useState(0);
  const [mostrarFormularioReceta, setMostrarFormularioReceta] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState(null);
  const [recargarListaRecetas, setRecargarListaRecetas] = useState(0);

  // Estado para los restaurantes del vendedor
  const [restaurantesVendedor, setRestaurantesVendedor] = useState([]);

  // Efecto para obtener los restaurantes del vendedor
  useEffect(() => {
    if (usuario?.rol?.toLowerCase() === "vendedor" && token) {
      restaurantesBasicosGet()
        .then(data => {
          if (data && Array.isArray(data)) {
            setRestaurantesVendedor(data);
          }
        })
        .catch(err => console.error("Error fetching vendor restaurants:", err));
    }
  }, [usuario, token]);

  // Estados para permisos de invitado
  const [permisosInvitado, setPermisosInvitado] = useState({
    permiso_notas: true,
    permiso_recetas: true,
    cargando: true,
  });

  // Estado para mostrar credenciales de nuevo usuario
  const [credencialesNuevas, setCredencialesNuevas] = useState(null);

  // Verificar si hay credenciales nuevas en sessionStorage
  useEffect(() => {
    const credencialesGuardadas = sessionStorage.getItem("credenciales_nuevas");
    if (credencialesGuardadas) {
      try {
        const datos = JSON.parse(credencialesGuardadas);
        setCredencialesNuevas(datos);
      } catch (e) {
        console.error("Error parseando credenciales:", e);
      }
    }
  }, []);

  // Función para cerrar el banner de credenciales
  const cerrarBannerCredenciales = () => {
    sessionStorage.removeItem("credenciales_nuevas");
    setCredencialesNuevas(null);
  };

  // Leer página inicial de URL
  const paginaInicial = parseInt(searchParams.get("pageNotas")) || 1;

  // Estados para paginación del servidor
  const [paginaActual, setPaginaActualInternal] = useState(paginaInicial);
  const [totalNotas, setTotalNotas] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const notasPorPagina = 15;

  // Función para cambiar página y actualizar URL
  const setPaginaActual = useCallback((pagina) => {
    const nuevaPagina = typeof pagina === 'function' ? pagina(paginaActual) : pagina;
    setPaginaActualInternal(nuevaPagina);

    // Actualizar URL manteniendo otros params
    const newParams = new URLSearchParams(searchParams);
    if (nuevaPagina === 1) {
      newParams.delete("pageNotas");
    } else {
      newParams.set("pageNotas", nuevaPagina.toString());
    }
    setSearchParams(newParams, { replace: true });
  }, [paginaActual, searchParams, setSearchParams]);

  // 🚀 CACHE: Almacena las páginas ya cargadas
  const cacheRef = useRef(new Map());
  const prefetchingRef = useRef(false);
  const isFirstRun = useRef(true);

  // Función para generar clave de caché
  const getCacheKey = useCallback((page, filtros) => {
    return `${page}-${JSON.stringify(filtros)}`;
  }, []);

  //
  useEffect(() => {
    // Si hay un error 403 o 401, verificar si es por permisos limitados
    if (error && (error.status === 403 || error.status === 401)) {
      const rolUsuario = usuario?.rol?.toLowerCase();
      // Si el usuario es "invitado" o tiene permisos limitados, NO limpiar la sesión
      // Esto permite que el usuario pueda ver el dashboard y crear notas/recetas
      if (
        rolUsuario === "invitado" ||
        (usuario?.permisos && usuario.permisos !== "todos")
      ) {
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
    if (usuario?.rol === "b2b") {
      navigate("/dashboardb2b", { replace: true });
      return;
    }

    if (!token || !usuario) {
      navigate(`/registro`, { replace: true });
    }
  }, [token, usuario, error, saveToken, saveUsuario, location, navigate]);

  // Verificar permisos de invitado usando la API
  useEffect(() => {
    const verificarPermisosInvitado = async () => {
      // Solo verificar si el rol es "invitado"
      if (usuario?.rol?.toLowerCase() !== "invitado") {
        setPermisosInvitado({
          permiso_notas: true,
          permiso_recetas: true,
          cargando: false,
        });
        return;
      }

      // Obtener el permiso del usuario (puede estar en localStorage o en usuario.permisos)
      const permisoUsuario =
        usuario?.permisos || localStorage.getItem("permisos");

      if (!permisoUsuario) {
        setPermisosInvitado({
          permiso_notas: false,
          permiso_recetas: false,
          cargando: false,
        });
        return;
      }

      try {
        const response = await fetch(
          `https://admin.residente.mx/api/invitados/permiso/${encodeURIComponent(
            permisoUsuario
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          setPermisosInvitado({
            permiso_notas: data.permiso_notas === 1,
            permiso_recetas: data.permiso_recetas === 1,
            cargando: false,
          });
        } else {
          setPermisosInvitado({
            permiso_notas: false,
            permiso_recetas: false,
            cargando: false,
          });
        }
      } catch (error) {
        setPermisosInvitado({

          permiso_notas: false,
          permiso_recetas: false,
          cargando: false,
        });
      }
    };

    verificarPermisosInvitado();
  }, [usuario]);

  // Construir filtros actuales
  const buildFiltros = useCallback(() => {
    const filtros = {};
    if (estado) filtros.estatus = estado;
    if (autor) filtros.autor = autor;
    if (tipoCliente) {
      const tipoNotaEsperado = mapeoPermisosATipoNota[tipoCliente] || tipoCliente;
      filtros.tipo_nota = tipoNotaEsperado;
    }
    if (debouncedSearchTerm?.trim()) {
      filtros.q = debouncedSearchTerm.trim();
    }
    return filtros;
  }, [estado, autor, tipoCliente, debouncedSearchTerm]);

  const fetchTodasLasNotas = async (usarCache = true) => {
    setCargando(true);
    setError(null);
    try {
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Verificar permisos ANTES de hacer la llamada a la API
      // El backend requiere rol "residente" para acceder a /api/notas/todas
      // Si el usuario es "invitado" o tiene permisos limitados, no intentar la llamada
      const rolUsuario = usuario?.rol?.toLowerCase();
      const permisosUsuario = usuario?.permisos;

      if (
        rolUsuario !== "invitado" &&
        rolUsuario !== "residente" &&
        permisosUsuario !== "todos" &&
        permisosUsuario !== "todo"
      ) {
        // Usuario sin permisos para ver todas las notas
        // Mostrar mensaje pero permitir que use el dashboard para crear notas/recetas
        setError({
          message:
            "No tienes permisos para ver todas las notas, pero puedes crear nuevas notas y recetas usando los botones del menú.",
          status: 403,
        });
        setTodasLasNotas([]);
        setNotas([]);
        setCargando(false);
        return; // Salir sin hacer la llamada a la API
      }

      // Construir filtros para la API
      const filtros = buildFiltros();
      const cacheKey = getCacheKey(paginaActual, filtros);

      // Si está en caché y podemos usarla, retornar inmediatamente
      if (usarCache && cacheRef.current.has(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey);
        setNotas(cached.notas);
        setTodasLasNotas(cached.notas);
        setTotalNotas(cached.total);
        setTotalPaginas(cached.totalPages);
        setCargando(false);
        return cached;
      }

      // Cargar notas con paginación del servidor
      const data = await notasTodasGet(token, paginaActual, notasPorPagina, "", filtros);

      // Validar respuesta del servidor
      if (!data) {
        throw new Error("El servidor no devolvió datos");
      }

      if (!Array.isArray(data.notas)) {
        throw new Error("Formato de respuesta inválido del servidor");
      }

      // FILTRAR NOTAS POR USUARIO/CLIENTE
      let notasFiltradas = data.notas;

      // Si el usuario NO es admin (todos), filtrar por tipo_nota
      if (usuario?.permisos !== "todos" && usuario?.permisos !== "todo") {
        // Normalizar el permiso del usuario para comparar con tipo_nota
        const permisoUsuario = usuario.permisos || "";
        const permisoNormalizado = permisoUsuario
          .replace(/-/g, " ")
          .toLowerCase();
        const permisoSinEspacios = permisoUsuario
          .replace(/-/g, "")
          .toLowerCase();

        notasFiltradas = data.notas.filter((nota) => {
          const tipoNota = (nota.tipo_nota || "").toLowerCase();
          const tipoNota2 = (nota.tipo_nota2 || "").toLowerCase();

          // Verificar si coincide con tipo_nota o tipo_nota2
          return (
            tipoNota.includes(permisoNormalizado) ||
            tipoNota2.includes(permisoNormalizado) ||
            tipoNota.includes(permisoSinEspacios) ||
            tipoNota2.includes(permisoSinEspacios) ||
            tipoNota.includes(permisoUsuario.toLowerCase()) ||
            tipoNota2.includes(permisoUsuario.toLowerCase())
          );
        });
      }


      // Guardar en caché
      const resultadoCache = {
        notas: notasFiltradas,
        total: data.total || notasFiltradas.length,
        totalPages: data.totalPages || Math.ceil((data.total || notasFiltradas.length) / notasPorPagina)
      };
      cacheRef.current.set(cacheKey, resultadoCache);

      setTodasLasNotas(notasFiltradas);
      setNotas(notasFiltradas);
      setTotalNotas(resultadoCache.total);
      setTotalPaginas(resultadoCache.totalPages);

      return resultadoCache;
    } catch (err) {
      console.error("Error detallado:", err);
      console.error("Mensaje del error:", err.message);
      console.error("Status del error:", err.status);
      console.error("Stack trace:", err.stack);

      // Manejo específico de errores 403
      if (err.status === 403) {
        console.error(
          "Error 403: Acceso denegado. Verificar permisos del usuario o token expirado"
        );

        // Si el usuario es "invitado" o tiene permisos limitados, mostrar mensaje pero mantener sesión
        // Esto permite que el usuario pueda ver el dashboard y crear notas/recetas aunque no pueda ver todas las notas
        const rolUsuario = usuario?.rol?.toLowerCase();
        if (
          rolUsuario === "invitado" ||
          (usuario?.permisos && usuario.permisos !== "todos")
        ) {
          setError({
            message:
              "No tienes permisos para ver todas las notas, pero puedes crear nuevas notas y recetas usando los botones del menú.",
            status: 403,
          });
          setTodasLasNotas([]);
          setNotas([]);
          return;
        }

        // Para otros casos de 403 (token expirado, etc.), limpiar sesión y redirigir
        saveToken(null);
        saveUsuario(null);
        navigate("/registro", { replace: true });
        return;
      }

      setError(err);
    } finally {
      setCargando(false);
    }
  };

  // La carga inicial se maneja en el useEffect que depende de paginaActual y filtros

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



  // Función para normalizar texto para búsqueda
  const normalizarTexto = (texto) => {
    if (!texto) return "";
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[¿?¡!.,]/g, "") // Quitar signos de puntuación
      .trim();
  };


  // Con paginación del servidor, las notas ya vienen paginadas
  // notasFiltradas contiene las notas de la página actual
  // Las notas ya vienen paginadas del servidor
  const totalNotasFiltradas = totalNotas;

  // Variables para el cálculo de índices de paginación
  const inicioIndice = (paginaActual - 1) * notasPorPagina;
  const finIndice = Math.min(inicioIndice + notasPorPagina, totalNotasFiltradas);

  // 🚀 PREFETCH: Cargar la siguiente página en segundo plano
  const prefetchNextPage = useCallback(async (currentPage, filtros, maxPages) => {
    if (prefetchingRef.current) return;
    if (currentPage >= maxPages) return;

    const nextPage = currentPage + 1;
    const cacheKey = getCacheKey(nextPage, filtros);

    // Si ya está en caché, no prefetch
    if (cacheRef.current.has(cacheKey)) return;

    prefetchingRef.current = true;
    try {
      const data = await notasTodasGet(token, nextPage, notasPorPagina, "", filtros);
      if (data && Array.isArray(data.notas)) {
        cacheRef.current.set(cacheKey, {
          notas: data.notas,
          total: data.total || data.notas.length,
          totalPages: data.totalPages || Math.ceil((data.total || data.notas.length) / notasPorPagina)
        });
      }
    } catch (err) {
      // Silently handle prefetch errors
    } finally {
      prefetchingRef.current = false;
    }
  }, [token, notasPorPagina, getCacheKey]);

  // Recargar notas cuando cambien los filtros, búsqueda o página
  useEffect(() => {
    if (!token) return;
    // Solo cargar notas, sin prefetch automático para mejorar rendimiento inicial
    fetchTodasLasNotas();
    // eslint-disable-next-line
  }, [paginaActual, estado, tipoCliente, autor, debouncedSearchTerm]);

  // Wrappers para setters que resetean la página y el caché al cambiar filtros
  const handleSetEstado = useCallback((val) => {
    setEstado(val);
    cacheRef.current.clear();
    setPaginaActual(1);
  }, []);

  const handleSetTipoCliente = useCallback((val) => {
    setTipoCliente(val);
    cacheRef.current.clear();
    setPaginaActual(1);
  }, []);

  const handleSetAutor = useCallback((val) => {
    setAutor(val);
    cacheRef.current.clear();
    setPaginaActual(1);
  }, []);

  const handleSetSearchTerm = useCallback((val) => {
    setSearchTerm(val);
    // Solo si hay cambio real y no está vacío (opcional)
    cacheRef.current.clear();
    setPaginaActual(1);
  }, []);

  // Ocultar el formulario de recetas cuando se cambia de vista
  useEffect(() => {
    if (vistaActiva !== "recetas") {
      setMostrarFormularioReceta(false);
    }
  }, [vistaActiva]);

  // Validar que los clientes solo puedan acceder a vistas permitidas
  useEffect(() => {
    const esAdmin =
      usuario?.permisos === "todos" || usuario?.permisos === "todo";
    const esInvitadoLocal = usuario?.rol?.toLowerCase() === "invitado";

    if (esAdmin) return; // Admin puede ver todo

    // Para invitados, verificar permisos específicos
    if (esInvitadoLocal && !permisosInvitado.cargando) {
      // Si no tiene permiso para notas y está en notas, redirigir a recetas (si tiene permiso)
      if (vistaActiva === "notas" && !permisosInvitado.permiso_notas) {
        if (permisosInvitado.permiso_recetas) {
          setVistaActiva("recetas");
        }
        return;
      }
      // Si no tiene permiso para recetas y está en recetas, redirigir a notas (si tiene permiso)
      if (vistaActiva === "recetas" && !permisosInvitado.permiso_recetas) {
        if (permisosInvitado.permiso_notas) {
          setVistaActiva("notas");
        }
        return;
      }
      // Si está en una vista que no es notas ni recetas, redirigir a la primera permitida
      if (vistaActiva !== "notas" && vistaActiva !== "recetas") {
        if (permisosInvitado.permiso_notas) {
          setVistaActiva("notas");
        } else if (permisosInvitado.permiso_recetas) {
          setVistaActiva("recetas");
        }
      }
      return;
    }

    // Para otros usuarios no admin
    if (!esAdmin && vistaActiva !== "notas" && vistaActiva !== "recetas") {
      // Si el cliente intenta acceder a una vista restringida, redirigir a "notas"
      if (usuario?.rol?.toLowerCase() === 'vendedor') {
        setVistaActiva("mis_restaurantes");
      } else {
        setVistaActiva("notas");
      }
    }
  }, [vistaActiva, usuario, permisosInvitado]);

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
    {
      key: "notas",
      label: "Notas",
      icon: <RiStickyNoteFill className="mr-2" />,
    },
    {
      key: "preguntas",
      label: "Preguntas",
      icon: <RiQuestionnaireFill className="mr-2" />,
    },
    {
      key: "revistas",
      label: "Revistas",
      icon: <FaBookOpen className="mr-2" />,
    },
    { key: "videos", label: "Videos", icon: <IoMdPlay className="mr-2" /> },
    {
      key: "newsletter",
      label: "Newsletter",
      icon: <IoNewspaper className="mr-2" />,
    },
    {
      key: "infografias",
      label: "Infografías",
      icon: <FaLightbulb className="mr-2" />,
    },
    { key: "uanl", label: "UANL", icon: <LuUnderline className="mr-2" /> },
    { key: "usuarios", label: "Usuarios", icon: <FaUser className="mr-2" /> },
    {
      key: "cupones",
      label: "Cupones",
      icon: <FaTicketSimple className="mr-2" />,
    },
    { key: "recetas", label: "Recetas", icon: <FaUtensils className="mr-2" /> },
    {
      key: "restaurante_link",
      label: "Restaurante",
      icon: <FaStore className="mr-2" />,
    },
    {
      key: "mis_restaurantes",
      label: "Mis Restaurantes",
      icon: <FaStore className="mr-2" />,
    },
    { key: "ednl", label: "Ednl", icon: <FaStar className="mr-2" /> },
    {
      key: "codigos_admin",
      label: "Códigos",
      icon: <MdAdminPanelSettings className="mr-2" />,
    },
    {
      key: "vetados",
      label: "Restringidos",
      icon: <IoNewspaper className="mr-2" />,
    },
    {
      key: "todob2b",
      label: "B2B",
      icon: <IoNewspaper className="mr-2" />,
    },
    {
      key: "buscador",
      label: "Buscador",
      icon: <FaMagnifyingGlass className="mr-2" />,
    }
  ];

  // Filtrar opciones del menú según permisos del usuario
  // Si el usuario NO es admin (todos/todo), solo mostrar Notas y Recetas
  const esAdmin = usuario?.permisos === "todos" || usuario?.permisos === "todo";
  const esResidente =
    usuario?.permisos === "residente" || usuario?.rol === "residente"; // Checked rol as well just in case
  const esB2B = usuario?.permisos === "b2b";
  const esInvitado = usuario?.rol === "invitado";

  // Filtrar opciones del menú para invitados según sus permisos específicos
  const menuOptions = esAdmin
    ? todasLasOpciones
    : todasLasOpciones.filter((option) => {
      if (usuario?.rol === "b2b") return false;

      // Lógica para Vendedor
      if (usuario?.rol === "vendedor") {
        return option.key === "mis_restaurantes" || option.key === "cupones";
      }

      // Lógica original para otros roles
      return (
        option.key === "notas" ||
        option.key === "recetas" ||
        (option.key === "cupones" &&
          !esInvitado &&
          usuario?.rol !== "colaborador") ||
        (esResidente && option.key === "restaurante_link") ||
        (usuario?.rol === "residente" && option.key === "ednl") ||
        (usuario?.rol === "residente" && option.key === "codigos_admin") ||
        (usuario?.rol === "residente" && option.key === "buscador")
      );
    });

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Verificar si el error es 403 por permisos limitados (no token expirado)
  const rolUsuario = usuario?.rol?.toLowerCase();
  const esError403SinPermisos =
    error &&
    error.status === 403 &&
    (rolUsuario === "invitado" ||
      (usuario?.permisos && usuario.permisos !== "todos"));

  if (error && !esError403SinPermisos) {
    // Para otros errores (no 403 por permisos), mostrar el componente de error normal
    return <ErrorNotas error={error} onRetry={fetchTodasLasNotas} />;
  }

  return (
    <div className="space-y-6 py-5">
      {/* Popup de credenciales para nuevos usuarios - usando Portal */}
      {credencialesNuevas && createPortal(
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60"
            style={{ zIndex: 9998 }}
            onClick={cerrarBannerCredenciales}
          />

          {/* Modal */}
          <div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="bg-[#fff200] px-6 py-4">
                <h2 className="text-xl font-bold text-black font-roman">
                  Credenciales de Acceso
                </h2>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-black font-roman mb-1">
                      Nombre de usuario
                    </label>
                    <p className="text-2xl font-bold text-black font-roman">
                      {credencialesNuevas.nombre_usuario}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black font-roman mb-1">
                      Contraseña
                    </label>
                    <p className="text-sm text-black font-roman">
                      Usa la misma contraseña que usaste para registrarte.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={cerrarBannerCredenciales}
                  className="w-full bg-black text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 transition font-roman cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Encabezado */}
      <div className="flex flex-col gap-5 justify-between">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black rounded-2xl py-1">
            Dashboard de Administración
          </h1>

          {/* Credenciales - solo para invitados y colaboradores */}
          {(credencialesNuevas || (usuario && (usuario.rol?.toLowerCase() === "invitado" || usuario.rol?.toLowerCase() === "colaborador"))) && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-black font-roman">
                <span className="font-bold">Usuario:</span> {credencialesNuevas?.nombre_usuario || usuario?.nombre_usuario}
              </p>
              <p className="text-sm text-black font-roman">
                <span className="font-bold">Contraseña:</span> La misma que usaste para el registro
              </p>
            </div>
          )}

          {usuario && (
            <div className="flex items-center gap-5">
              {/* Botón Editar Perfil - para colaboradores */}
              {usuario.rol?.toLowerCase() === "colaborador" && (
                <button
                  onClick={() => navigate("/editar-perfil-colaborador")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white shadow hover:bg-blue-700 transition text-sm font-bold cursor-pointer rounded-xl"
                  title="Editar mi perfil"
                >
                  <FaUser className="text-sm -mt-0.5 mr-2" />
                  Editar mi perfil
                </button>
              )}
              {/* Botón Editar Perfil - para invitados */}
              {usuario.rol?.toLowerCase() === "invitado" && (
                <button
                  onClick={() => navigate("/editar-perfil-invitado")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white shadow hover:bg-blue-700 transition text-sm font-bold cursor-pointer rounded-xl"
                  title="Editar mi perfil"
                >
                  <FaUser className="text-sm -mt-0.5 mr-2" />
                  Editar mi perfil
                </button>
              )}
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
                <span className="flex items-center">
                  {usuario?.nombre_usuario}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Menú de pestañas - Solo mostrar si hay más de 1 opción */}
        {usuario?.rol !== "colaborador" && menuOptions.length > 1 && (
          <div className="flex justify-start items-center gap-3 py-2 rounded-md">
            <Button
              aria-controls={open ? "fade-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleMenuClick}
              startIcon={<MenuIcon />}
              variant="contained"
              color="inherit"
              sx={{ backgroundColor: "#ffff", color: "#222" }}
            >
              {menuOptions.find((opt) => opt.key === vistaActiva)?.label ||
                "Menú"}
            </Button>
            <Menu
              id="fade-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              TransitionComponent={Fade}
            >
              {menuOptions.map((option) => (
                <MenuItem
                  key={option.key}
                  onClick={() => {
                    if (option.key === "restaurante_link") {
                      navigate("/formulario");
                    } else if (option.key === "mis_restaurantes") {
                      setVistaActiva("mis_restaurantes");
                    } else if (option.key === "cupones") {
                      navigate("/dashboardtickets");
                    } else if (option.key === "codigos_admin") {
                      navigate("/admin/codigos");
                    } else if (option.key === "ednl") {
                      navigate("/ednl");
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
        )}
      </div>
      {/* Contenido de las pestañas */}
      <div>
        {vistaActiva === "notas" && (
          <>
            {/* Barra de búsqueda y filtros para vista de notas */}
            <div className="flex justify-between mb-5 gap-4 items-center">
              {/* Barra de búsqueda - solo para no colaboradores y no vendedores/b2b */}
              {(usuario?.rol !== "colaborador" && usuario?.rol !== "vendedor" && usuario?.rol !== "b2b") && (
                <div className="flex-1 max-w-md">
                  <SearchNotasLocal
                    searchTerm={searchTerm}
                    setSearchTerm={handleSetSearchTerm}
                    estado={estado}
                    setEstado={handleSetEstado}
                    tipoCliente={tipoCliente}
                    setTipoCliente={handleSetTipoCliente}
                  />
                  <FiltroAutor autor={autor} setAutor={handleSetAutor} />
                </div>
              )}

              {/* Contenedor de acciones derecha */}
              <div className="flex gap-2 items-center">
                {usuario?.rol === "colaborador" ? (
                  <Suspense fallback={
                    <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Cargando...
                    </div>
                  }>
                    <MenuColaboradoresDashboard />
                  </Suspense>
                ) : (
                  // Ocultar botón "Nueva Nota" para Vendedor y B2B
                  (usuario?.rol !== "vendedor" && usuario?.rol !== "b2b") && (
                    <Link
                      to="/dashboard/nota/nueva"
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
                  )
                )}
              </div>
            </div>

            {usuario?.rol === "colaborador" ? (
              // Si es colaborador, mostrar sus blogs en lugar de notas
              <Suspense fallback={<LazyFallback />}>
                <ListaBlogsColaborador />
              </Suspense>
            ) : (
              // Si NO es colaborador, mostrar la lista de notas normal
              <>
                {!notas || notas.length === 0 ? (
                  (searchTerm || estado || autor || tipoCliente) ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 text-lg">
                        {searchTerm
                          ? `No se encontraron notas que coincidan con "${searchTerm}"`
                          : "No hay notas que coincidan con los filtros seleccionados"}
                      </div>
                    </div>
                  ) : (
                    <SinNotas />
                  )
                ) : (
                  <>
                    {/* ===== CARRUSEL DE NOTAS DESTACADAS ===== */}
                    {(() => {
                      const notasDestacadas = notas.filter(n => esDestacada(n));
                      const safeIndex = carouselIndex >= notasDestacadas.length ? 0 : carouselIndex;
                      const notaActual = notasDestacadas[safeIndex];

                      if (notasDestacadas.length === 0) return null;

                      return (
                        <div className="mb-8">
                          <div className="flex items-center gap-2 mb-4">
                            <FaStar className="text-amber-500 text-xl" />
                            <h3 className="font-bold text-gray-800 text-lg">Carrusel Principal</h3>
                            <span className="text-xs bg-amber-500 text-white px-3 py-1 rounded-full font-semibold">
                              {notasDestacadas.length} destacadas
                            </span>
                          </div>

                          <div className="space-y-3">
                            {/* Carrusel estilo Residente.mx */}
                            <div className="relative w-full aspect-[16/9] max-h-[400px] rounded-xl overflow-hidden shadow-xl group">
                              {/* Imagen de fondo */}
                              <Link to={`/dashboard/nota/editar/${notaActual?.id}`}>
                                <img
                                  src={notaActual?.imagen}
                                  alt={notaActual?.titulo}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Overlay degradado */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Logo Residente */}
                                <div className="absolute top-4 left-4 w-12 h-12 bg-[#FFE500] rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-black font-black text-2xl">R</span>
                                </div>

                                {/* Título */}
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                  <h3 className="text-white text-2xl md:text-3xl font-black leading-tight drop-shadow-lg">
                                    {notaActual?.titulo}
                                  </h3>
                                </div>

                                {/* Badge de posición */}
                                <div className="absolute top-4 right-4 bg-amber-500 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                  <FaStar className="text-xs" />
                                  <span>#{safeIndex + 1} de {notasDestacadas.length}</span>
                                </div>
                              </Link>

                              {/* Flechas de navegación */}
                              {notasDestacadas.length > 1 && (
                                <>
                                  <button
                                    onClick={() => setCarouselIndex(prev => prev === 0 ? notasDestacadas.length - 1 : prev - 1)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setCarouselIndex(prev => prev === notasDestacadas.length - 1 ? 0 : prev + 1)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Indicadores / Miniaturas */}
                            {notasDestacadas.length > 1 && (
                              <div className="flex gap-2 justify-center">
                                {notasDestacadas.map((nota, index) => (
                                  <button
                                    key={nota.id}
                                    onClick={() => setCarouselIndex(index)}
                                    className={`w-16 h-10 rounded-lg overflow-hidden transition-all ${index === safeIndex
                                      ? 'ring-2 ring-amber-500 scale-110'
                                      : 'opacity-60 hover:opacity-100'
                                      }`}
                                  >
                                    <img
                                      src={nota.imagen}
                                      alt={nota.titulo}
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* ===== GRID DE TODAS LAS NOTAS ===== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {notas.map((nota) => (
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
                        Mostrando {inicioIndice + 1} - {finIndice} de{" "}
                        {totalNotasFiltradas} notas
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
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                              }`}
                          >
                            ← Anterior
                          </button>

                          {/* Números de página */}
                          <div className="flex space-x-1">
                            {Array.from(
                              { length: totalPaginas },
                              (_, i) => i + 1
                            ).map((numero) => {
                              const mostrarPagina =
                                numero === 1 ||
                                numero === totalPaginas ||
                                (numero >= paginaActual - 2 &&
                                  numero <= paginaActual + 2);

                              if (!mostrarPagina) {
                                if (
                                  numero === paginaActual - 3 ||
                                  numero === paginaActual + 3
                                ) {
                                  return (
                                    <span
                                      key={numero}
                                      className="px-2 py-2 text-gray-400"
                                    >
                                      ...
                                    </span>
                                  );
                                }
                                return null;
                              }

                              return (
                                <button
                                  key={numero}
                                  onClick={() => irAPagina(numero)}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg ${numero === paginaActual
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
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
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
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
          </>
        )}

        {vistaActiva === "preguntas" && (
          <Suspense fallback={<LazyFallback />}>
            <div className="text-center text-lg">
              <PreguntasSemanales />
            </div>
          </Suspense>
        )}

        {vistaActiva === "revistas" && (
          <Suspense fallback={<LazyFallback />}>
            <div className="text-center text-lg">
              <FormularioRevistaBannerNueva />
            </div>
          </Suspense>
        )}

        {vistaActiva === "videos" && (
          <Suspense fallback={<LazyFallback />}>
            <div className="text-center text-lg">
              <VideosDashboard />
            </div>
          </Suspense>
        )}

        {vistaActiva === "newsletter" && (
          <Suspense fallback={<LazyFallback />}>
            <div className="text-center text-lg">
              <FormNewsletter />
            </div>
          </Suspense>
        )}
        {vistaActiva === "infografias" && (
          <Suspense fallback={<LazyFallback />}>
            <div className="text-center text-lg">
              <InfografiaForm />
            </div>
          </Suspense>
        )}
        {vistaActiva === "uanl" && (
          <Suspense fallback={<LazyFallback />}>
            <div className="text-center text-lg">
              <ListaNotasUanl />
            </div>
          </Suspense>
        )}
        {vistaActiva === "usuarios" && (
          <Suspense fallback={<LazyFallback />}>
            <div className="text-center text-lg">
              <ListaNotasUsuarios />
            </div>
          </Suspense>
        )}
        {vistaActiva === "cupones" && (
          <Suspense fallback={<LazyFallback />}>
            <div className="text-center text-lg">
              <ListaTickets />
            </div>
          </Suspense>
        )}
        {vistaActiva === "recetas" && (
          <Suspense fallback={<LazyFallback />}>
            <div>
              <div className="flex justify-end mb-5">
                <button
                  onClick={() => navigate("/dashboard/receta/nueva")}
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
              <ListaRecetas
                key={recargarListaRecetas}
                onEditar={(receta) => {
                  navigate(`/dashboard/receta/editar/${receta.id}`);
                }}
                onCopiar={(receta) => {
                  // Copiar datos de la receta
                  const recetaParaCopiar = {
                    ...receta,
                    id: undefined,
                  };
                  navigator.clipboard.writeText(
                    JSON.stringify(recetaParaCopiar, null, 2)
                  );
                  alert("Datos de la receta copiados al portapapeles");
                }}
                onRecetaEliminada={() => {
                  setRecargarListaRecetas((prev) => prev + 1);
                }}
              />
            </div>
          </Suspense>
        )}
        {vistaActiva === "vetados" && (
          <div className="w-full">
            <ClientesVetados />
          </div>
        )}
        {vistaActiva === "todob2b" && (
          <Suspense fallback={<LazyFallback />}>
            <div className="w-full">
              <TodoB2b />
            </div>
          </Suspense>
        )}
        {vistaActiva === "buscador" && (
          <Suspense fallback={<LazyFallback />}>
            <div className="w-full">
              <BuscadorDashboard />
            </div>
          </Suspense>
        )}

        {vistaActiva === "mis_restaurantes" && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Mis Restaurantes</h2>
              <button
                onClick={() => navigate("/formulario")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <FaStore className="mr-2" />
                Crear Nuevo Restaurante
              </button>
            </div>

            {restaurantesVendedor.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <FaStore className="mx-auto text-4xl text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Aún no tienes restaurantes</h3>
                <p className="text-gray-500 mb-6">Comienza creando tu primer restaurante para administrarlo.</p>
                <button
                  onClick={() => navigate("/formulario")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center transition-colors"
                >
                  Crear Restaurante
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurantesVendedor.map((restaurante) => (
                  <div key={restaurante.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="h-32 bg-gray-200 relative">
                      {restaurante.imagen_portada || restaurante.logo ? (
                        <img
                          src={restaurante.imagen_portada || restaurante.logo}
                          alt={restaurante.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-500">
                          <FaStore className="text-white text-3xl" />
                        </div>
                      )}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${restaurante.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {restaurante.status === 1 ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{restaurante.nombre}</h3>
                      <p className="text-sm text-gray-500 mb-4 truncate">{restaurante.direccion || 'Sin dirección registrada'}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/formulario/${restaurante.slug}`)}
                          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold py-2 px-3 rounded-lg transition-colors"
                        >
                          Administrar
                        </button>
                        {restaurante.slug && (
                          <a
                            href={`https://residente.mx/restaurantes/${restaurante.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center mb-1"
                            title="Ver en vivo"
                          >
                            <FaMagnifyingGlass />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ListaNotas;