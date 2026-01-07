import { useEffect, useState, useMemo, lazy, Suspense } from "react";
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

import useDebounce from "../../../../hooks/useDebounce";

// Componente de fallback para lazy loading
const LazyFallback = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-500">Cargando...</span>
  </div>
);

const ListaNotas = () => {
  const { token, usuario, saveToken, saveUsuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  // Leer vistaActiva de la URL o usar "notas" por defecto
  const [vistaActiva, setVistaActivaInternal] = useState(
    searchParams.get("vista") || "notas"
  );

  // Función para cambiar vistaActiva y actualizar URL
  const setVistaActiva = (vista) => {
    setVistaActivaInternal(vista);
    setSearchParams({ vista });
  };
  const [estado, setEstado] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [autor, setAutor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [todasLasNotas, setTodasLasNotas] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [recetaKey, setRecetaKey] = useState(0);
  const [mostrarFormularioReceta, setMostrarFormularioReceta] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState(null);
  const [recargarListaRecetas, setRecargarListaRecetas] = useState(0);

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
          console.log("✅ Permisos de invitado cargados:", data);
        } else {
          console.warn("⚠️ No se pudieron obtener permisos de invitado");
          setPermisosInvitado({
            permiso_notas: false,
            permiso_recetas: false,
            cargando: false,
          });
        }
      } catch (error) {
        console.error("❌ Error al verificar permisos de invitado:", error);
        setPermisosInvitado({
          permiso_notas: false,
          permiso_recetas: false,
          cargando: false,
        });
      }
    };

    verificarPermisosInvitado();
  }, [usuario]);

  const fetchTodasLasNotas = async () => {
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

      // Cargar todas las notas sin paginación
      const data = await notasTodasGet(token, 1, "all");

      // Validar respuesta del servidor
      if (!data) {
        throw new Error("El servidor no devolvió datos");
      }

      if (!Array.isArray(data.notas)) {
        throw new Error("Formato de respuesta inválido del servidor");
      }

      // FILTRAR NOTAS POR USUARIO/CLIENTE
      let notasFiltradas = data.notas;

      // Si el usuario NO es admin (todos), filtrar por sus notas
      if (usuario?.permisos !== "todos") {
        const tipoNotaUsuario =
          usuario?.permisos &&
            usuario.permisos !== "usuario" &&
            usuario.permisos !== "todo"
            ? usuario.permisos
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())
            : "";

        if (tipoNotaUsuario) {
          const tipoNotaUsuarioLower = tipoNotaUsuario.toLowerCase();

          notasFiltradas = data.notas.filter((nota) => {
            const tipoNota = (nota.tipo_nota || "").toLowerCase();
            const tipoNota2 = (nota.tipo_nota2 || "").toLowerCase();

            // Buscar coincidencias más flexibles
            const coincide =
              tipoNota.includes(tipoNotaUsuarioLower) ||
              tipoNota2.includes(tipoNotaUsuarioLower) ||
              tipoNota.includes(tipoNotaUsuarioLower.replace(/\s/g, "")) ||
              tipoNota2.includes(tipoNotaUsuarioLower.replace(/\s/g, "")) ||
              tipoNota.includes(tipoNotaUsuarioLower.replace(/\s/g, "-")) ||
              tipoNota2.includes(tipoNotaUsuarioLower.replace(/\s/g, "-")) ||
              // Para "mama de rocco" específicamente
              (tipoNotaUsuarioLower.includes("mama") &&
                tipoNota.includes("mama")) ||
              (tipoNotaUsuarioLower.includes("mama") &&
                tipoNota2.includes("mama")) ||
              (tipoNotaUsuarioLower.includes("rocco") &&
                tipoNota.includes("rocco")) ||
              (tipoNotaUsuarioLower.includes("rocco") &&
                tipoNota2.includes("rocco"));

            // También mostrar notas creadas por el propio usuario (notas personales)
            const esAutor =
              (nota.autor || "").toLowerCase() ===
              (usuario.nombre_usuario || "").toLowerCase();

            return coincide || esAutor;
          });
        }
      }

      setTodasLasNotas(notasFiltradas);
      setNotas(notasFiltradas);
      setPaginaActual(1); // Resetear a página 1 al cargar
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
    "mama-de-rocco": "Mamá de Rocco",
    "barrio-antiguo": "Barrio Antiguo",
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

  // 🚀 OPTIMIZACIÓN: Debounce del término de búsqueda (300ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 🚀 OPTIMIZACIÓN: Memorizar el filtrado para evitar recálculos innecesarios
  const notasFiltradas = useMemo(() => {
    return todasLasNotas.filter((nota) => {
      const cumpleEstado =
        !estado ||
        (nota.estatus || "").toLowerCase().trim() === estado.toLowerCase().trim();
      const cumpleAutor =
        !autor ||
        (nota.autor || "").toLowerCase().trim() === autor.toLowerCase().trim();

      let cumpleTipoCliente = true;
      if (tipoCliente) {
        const tipoNotaEsperado = mapeoPermisosATipoNota[tipoCliente];
        if (tipoNotaEsperado) {
          cumpleTipoCliente = (nota.tipo_nota || "") === tipoNotaEsperado;
        } else {
          const tipoClienteFormateado = tipoCliente
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          cumpleTipoCliente =
            (nota.tipo_nota || "")
              .toLowerCase()
              .includes(tipoClienteFormateado.toLowerCase()) ||
            (nota.tipo_nota || "")
              .toLowerCase()
              .includes(tipoCliente.toLowerCase());
        }
      }

      // Filtro de búsqueda local (usando debouncedSearchTerm)
      let cumpleBusqueda = true;
      if (debouncedSearchTerm.trim()) {
        const queryNormalizado = normalizarTexto(debouncedSearchTerm);
        const tituloNormalizado = normalizarTexto(nota.titulo);
        const subtituloNormalizado = normalizarTexto(nota.subtitulo);
        const autorNormalizado = normalizarTexto(nota.autor);
        const tipoNotaNormalizado = normalizarTexto(nota.tipo_nota);

        // Búsqueda exacta
        if (
          tituloNormalizado.includes(queryNormalizado) ||
          subtituloNormalizado.includes(queryNormalizado) ||
          autorNormalizado.includes(queryNormalizado) ||
          tipoNotaNormalizado.includes(queryNormalizado)
        ) {
          cumpleBusqueda = true;
        } else {
          // Búsqueda por palabras individuales
          const palabrasQuery = queryNormalizado
            .split(/\s+/)
            .filter((p) => p.length > 2);
          if (palabrasQuery.length > 0) {
            let coincidencias = 0;
            for (const palabraQuery of palabrasQuery) {
              if (
                tituloNormalizado.includes(palabraQuery) ||
                subtituloNormalizado.includes(palabraQuery) ||
                autorNormalizado.includes(palabraQuery) ||
                tipoNotaNormalizado.includes(palabraQuery)
              ) {
                coincidencias++;
              }
            }
            cumpleBusqueda =
              coincidencias >= Math.ceil(palabrasQuery.length * 0.5);
          } else {
            cumpleBusqueda = false;
          }
        }
      }

      return cumpleEstado && cumpleTipoCliente && cumpleAutor && cumpleBusqueda;
    });
  }, [todasLasNotas, estado, tipoCliente, autor, debouncedSearchTerm, mapeoPermisosATipoNota, normalizarTexto]);

  // Calcular paginación local
  const totalNotasFiltradas = notasFiltradas.length;
  const totalPaginas = Math.ceil(totalNotasFiltradas / notasPorPagina);
  const inicioIndice = (paginaActual - 1) * notasPorPagina;
  const finIndice = Math.min(
    inicioIndice + notasPorPagina,
    totalNotasFiltradas
  );

  // Obtener notas para la página actual
  const notasPaginaActual = notasFiltradas.slice(inicioIndice, finIndice);

  // Resetear a página 1 cuando cambien los filtros o búsqueda (debounced)
  useEffect(() => {
    setPaginaActual(1);
  }, [estado, tipoCliente, autor, debouncedSearchTerm]);

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
      setVistaActiva("notas");
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
    : todasLasOpciones.filter(
      (option) =>
        usuario?.rol !== "b2b" && // Hide all menu options for B2B users if they are here
        (option.key === "notas" ||
          option.key === "recetas" ||
          (option.key === "cupones" &&
            !esInvitado &&
            usuario?.rol !== "colaborador") ||
          (esResidente && option.key === "restaurante_link") ||
          (usuario?.rol === "residente" && option.key === "ednl") || // EDNL only for residente role
          (usuario?.rol === "residente" && option.key === "codigos_admin")) // Only for residente role
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
              {/* Barra de búsqueda - solo para no colaboradores */}
              {usuario?.rol !== "colaborador" && (
                <div className="flex-1 max-w-md">
                  <SearchNotasLocal
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                </div>
              )}

              {/* Filtros - SIEMPRE VISIBLE */}
              <div className="flex gap-2 items-center">
                {usuario?.permisos === "todos" && (
                  <FiltroEstadoNota estado={estado} setEstado={setEstado} />
                )}
                {usuario?.permisos === "todos" && (
                  <FiltroTipoCliente
                    tipoCliente={tipoCliente}
                    setTipoCliente={setTipoCliente}
                  />
                )}
                {usuario?.permisos === "todos" && (
                  <FiltroAutor autor={autor} setAutor={setAutor} />
                )}
                {usuario?.rol === "colaborador" ? (
                  <Link
                    to="/colaboradores"
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
                    Nueva Colaboración o Consejo
                  </Link>
                ) : (
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
                )}
              </div>
            </div>

            {/* Contenido */}
            {usuario?.rol === "colaborador" ? (
              // Si es colaborador, mostrar sus blogs en lugar de notas
              <Suspense fallback={<LazyFallback />}>
                <ListaBlogsColaborador />
              </Suspense>
            ) : (
              // Si NO es colaborador, mostrar la lista de notas normal
              <>
                {!notas || notas.length === 0 ? (
                  <SinNotas />
                ) : notasFiltradas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">
                      {searchTerm
                        ? `No se encontraron notas que coincidan con "${searchTerm}"`
                        : "No hay notas que coincidan con los filtros seleccionados"}
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
      </div>
    </div>
  );
};

export default ListaNotas;