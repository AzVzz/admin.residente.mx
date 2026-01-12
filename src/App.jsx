import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Suspense, lazy } from "react";

import Header from "./componentes/Header";
import MegaMenu from "./componentes/MegaMenu";
import { DataProvider } from "./componentes/DataContext";

// import ListaRestaurantes from "./componentes/ednl/ListaRestaurantes"; // Converted to lazy
// import RestaurantePage from "./componentes/ednl/RestaurantePage"; // Converted to lazy
// import CulturalAcessForm from "./componentes/culturallAccess/CulturalAcessForm"; // Converted to lazy
// import ResidenteMain from "./componentes/residente/ResidenteMain"; // Converted to lazy
// import MainSeccionesCategorias from "./componentes/residente/componentes/seccionesCategorias/MainSeccionesCategorias"; // Converted to lazy
// import InfografiaMain from "./componentes/residente/infografia/InfografiaMain"; // Converted to lazy
import FooterPrincipal from "./componentes/FooterPrincipal";
// import PaginaCliente from "./componentes/residente/paginaCliente/PaginaCliente"; // Converted to lazy
import NoEncontrado from "./componentes/NoEncontrado";
// import DetallePost from "./componentes/residente/componentes/DetallePost"; // Converted to lazy
// import BannerRevista from "./componentes/residente/componentes/BannerRevista"; // Converted to lazy
import { urlApi, imgApi } from "./componentes/api/url.js";
// import OpinionEditorial from "./componentes/residente/componentes/formularioColaboradores/OpinionEditorial.jsx"; // Converted to lazy
// import RespuestasSemana from "./componentes/residente/componentes/formularioColaboradores/RespuestasSemana.jsx"; // Converted to lazy
// import VideoResidente from "./componentes/residente/componentes/extras/VideoResidente.jsx"; // Converted to lazy
// import LinkInBio from "./componentes/residente/instagram/LinkInBio.jsx"; // Converted to lazy
import BotonScroll from "./componentes/residente/componentes/compFormularioMain/BotonScroll.jsx";
import Proximamente from "./componentes/Proximamente.jsx";
import ViewportAdjuster from "./ViewportAdjuster.jsx";
// import InfografiaForm from "./componentes/residente/infografia/InfografiaForm.jsx"; // Converted to lazy
import { useClientesValidos } from "./hooks/useClientesValidos";
import usePageTracking from "./usePageTracking.js";
// import UanlPage from "./componentes/residente/Uanl/UanlPage.jsx"; // Converted to lazy
// import DetalleUanl from "./componentes/residente/Uanl/DetalleUanl.jsx"; // Converted to lazy
// import ListaNotasUanl from "./componentes/residente/componentes/compFormularioMain/ListaNotasUanl.jsx"; // Converted to lazy
// import DetalleColaborador from "./componentes/residente/Colaboradores/DetalleColaborador.jsx"; // Converted to lazy
// import NewsletterPage from "./componentes/residente/Newsletter/NewsletterPage.jsx"; // Converted to lazy
// import PlantillaNotas from "./componentes/residente/PlantillasRehusables/PlantillaNotas"; // Converted to lazy
// import ListaTickets from "./componentes/residente/componentes/compFormularioMain/ListaTickets"; // Converted to lazy
// import InstaHistoryPage from "./componentes/residente/InstaHistory/InstaHistoryPage.jsx"; // Converted to lazy
// import StripeCheckout from "./componentes/StripeCheckout.jsx"; // Converted to lazy
// import FormMain from "./componentes/residente/B2B/FormularioNuevoClienteB2b/FormMain.jsx"; // Converted to lazy
import B2BRoute from "./componentes/rutas/B2BRoute.jsx";
// import TerminosyCondiciones from "./componentes/residente/B2B/FormularioNuevoClienteB2b/TerminosyCondiciones.jsx"; // Converted to lazy
// import Registro from "./componentes/residente/Registro.jsx"; // Converted to lazy
// import FormularioAnuncioRevista from "./componentes/residente/B2B/FormularioAnuncioRevista.jsx"; // Converted to lazy
// import SuccessTienda from "./componentes/residente/B2B/SuccessTienda.jsx"; // Converted to lazy
// import InstaRecomendacionesPage from "./componentes/residente/InstaHistory/InstaHistoryRecomendaciones/InstaRecomendacionesPage.jsx"; // Converted to lazy

// --- LAZY LOADS (Public & Admin) ---
const ListaRestaurantes = lazy(() => import("./componentes/ednl/ListaRestaurantes"));
const CulturalAcessForm = lazy(() => import("./componentes/culturallAccess/CulturalAcessForm"));
const RestaurantePage = lazy(() => import("./componentes/ednl/RestaurantePage"));
const ResidenteMain = lazy(() => import("./componentes/residente/ResidenteMain"));
const MainSeccionesCategorias = lazy(() => import("./componentes/residente/componentes/seccionesCategorias/MainSeccionesCategorias"));
const InfografiaMain = lazy(() => import("./componentes/residente/infografia/InfografiaMain"));
const PaginaCliente = lazy(() => import("./componentes/residente/paginaCliente/PaginaCliente"));
const DetallePost = lazy(() => import("./componentes/residente/componentes/DetallePost"));
const BannerRevista = lazy(() => import("./componentes/residente/componentes/BannerRevista"));
const OpinionEditorial = lazy(() => import("./componentes/residente/componentes/formularioColaboradores/OpinionEditorial.jsx"));
const RespuestasSemana = lazy(() => import("./componentes/residente/componentes/formularioColaboradores/RespuestasSemana.jsx"));
const VideoResidente = lazy(() => import("./componentes/residente/componentes/extras/VideoResidente.jsx"));
const LinkInBio = lazy(() => import("./componentes/residente/instagram/LinkInBio.jsx"));
const InfografiaForm = lazy(() => import("./componentes/residente/infografia/InfografiaForm.jsx"));
const UanlPage = lazy(() => import("./componentes/residente/Uanl/UanlPage.jsx"));
const DetalleUanl = lazy(() => import("./componentes/residente/Uanl/DetalleUanl.jsx"));
const ListaNotasUanl = lazy(() => import("./componentes/residente/componentes/compFormularioMain/ListaNotasUanl.jsx"));
const DetalleColaborador = lazy(() => import("./componentes/residente/Colaboradores/DetalleColaborador.jsx"));
const EditarPerfilColaborador = lazy(() => import("./componentes/residente/Colaboradores/EditarPerfilColaborador.jsx"));
const NewsletterPage = lazy(() => import("./componentes/residente/Newsletter/NewsletterPage.jsx"));
const PlantillaNotas = lazy(() => import("./componentes/residente/PlantillasRehusables/PlantillaNotas"));
const ListaTickets = lazy(() => import("./componentes/residente/componentes/compFormularioMain/ListaTickets"));
const InstaHistoryPage = lazy(() => import("./componentes/residente/InstaHistory/InstaHistoryPage.jsx"));
const StripeCheckout = lazy(() => import("./componentes/StripeCheckout.jsx"));
const FormMain = lazy(() => import("./componentes/residente/B2B/FormularioNuevoClienteB2b/FormMain.jsx"));
const RegistroB2BConPlanes = lazy(() => import("./componentes/residente/B2B/FormularioNuevoClienteB2b/RegistroB2BConPlanes.jsx"));
const TerminosyCondiciones = lazy(() => import("./componentes/residente/B2B/FormularioNuevoClienteB2b/TerminosyCondiciones.jsx"));
const Registro = lazy(() => import("./componentes/residente/Registro.jsx"));
const FormularioAnuncioRevista = lazy(() => import("./componentes/residente/B2B/FormularioAnuncioRevista.jsx"));
const SuccessTienda = lazy(() => import("./componentes/residente/B2B/SuccessTienda.jsx"));
const InstaRecomendacionesPage = lazy(() => import("./componentes/residente/InstaHistory/InstaHistoryRecomendaciones/InstaRecomendacionesPage.jsx"));
// import FormularioBanner from "./componentes/residente/B2B/FormularioBanner.jsx";

//Admin
const FormMainResidente = lazy(() =>
  import(
    "./componentes/residente/componentes/compFormularioMain/FormMainResidente"
  )
);
const ListaNotas = lazy(() =>
  import("./componentes/residente/componentes/compFormularioMain/ListaNotas")
);
const PreguntasSemanales = lazy(() =>
  import(
    "./componentes/residente/componentes/compFormularioMain/componentesPrincipales/PreguntasSemanales"
  )
);
const FormNewsletter = lazy(() =>
  import(
    "./componentes/residente/componentes/compFormularioMain/FormNewsletter"
  )
);
const VideosDashboard = lazy(() =>
  import(
    "./componentes/residente/componentes/compFormularioMain/VideosDashboard"
  )
);
const Videos = lazy(() =>
  import("./componentes/residente/componentes/compFormularioMain/Videos")
);
const Login = lazy(() => import("./componentes/Login"));
const FormularioMain = lazy(() =>
  import("./componentes/formulario100estrellas/FormularioMain")
);
const FormularioMainPage = lazy(() =>
  import("./componentes/formulario100estrellas/FormularioMainPage")
);
const PromoMain = lazy(() => import("./componentes/promociones/PromoMain"));

const FormularioRevistaBannerNueva = lazy(() =>
  import(
    "./componentes/residente/componentes/compFormularioMain/FormularioRevistaBanner"
  )
);
const B2BDashboard = lazy(() =>
  import("./componentes/residente/B2B/B2BDashboard")
);

const ForgotPassword = lazy(() => import("./componentes/ForgotPassword"));
const ResetPassword = lazy(() => import("./componentes/ResetPassword"));
const RegistroInvitados = lazy(() =>
  import(
    "./componentes/residente/B2B/FormularioNuevoClienteB2b/RegistroInvitados"
  )
);
const GestionCodigos = lazy(() =>
  import("./componentes/residente/Admin/GestionCodigos")
);
const FormularioReceta = lazy(() =>
  import(
    "./componentes/residente/componentes/compFormularioMain/FormularioReceta"
  )
);
const ListaRecetas = lazy(() =>
  import("./componentes/residente/componentes/compFormularioMain/ListaRecetas")
);

const notasPrueba = [
  {
    id: 1,
    titulo: "Ejemplo Nota 1",
    imagen: "https://via.placeholder.com/300",
    fecha: "Octubre 2025",
    sticker: ["categoria1"],
  },
  {
    id: 2,
    titulo: "Ejemplo Nota 2",
    imagen: "https://via.placeholder.com/300",
    fecha: "Octubre 2025",
    sticker: ["categoria2"],
  },
  {
    id: 3,
    titulo: "Ejemplo Nota 3",
    imagen: "https://via.placeholder.com/300",
    fecha: "Octubre 2025",
    sticker: ["categoria3"],
  },
];

function App() {
  usePageTracking();

  const location = useLocation();
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const { clientesValidos, loading: clientesLoading } = useClientesValidos();

  // Fallback para clientes válidos
  const clientesPredefinidos = [
    "mama-de-rocco",
    "barrio-antiguo",
    "otrocliente",
    "heybanco",
    "patolobo",
  ];
  const listaClientes =
    clientesValidos.length > 0 ? clientesValidos : clientesPredefinidos;

  useEffect(() => {
    const pathCliente = location.pathname.split("/")[1];

    if (location.pathname === "/culturallaccess") {
      document.body.style.backgroundImage = `url("https://residente.mx/fotos/fotos-estaticas/componente-cultural/background-cultural-access.webp")`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundColor = "";
    } else if (
      listaClientes.includes(pathCliente) ||
      location.pathname.startsWith("/seccion/")
    ) {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "#DDDDDE"; // Fondo Gris 15% #D9D9D9
    } else if (location.pathname === "/foto-news") {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "#fff"; // Fondo blanco para newsletter
    } else {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "#DDDDDE"; // Amarillo
    }

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "#DDDDDE";
    };
  }, [location.pathname]);

  const isSeccionRoute = location.pathname.startsWith("/seccion/");
  const isCulturalAccess = location.pathname === "/culturallaccess";
  const isLinkInBio = location.pathname === "/linkinbio";

  return (
    <DataProvider>
      <ViewportAdjuster />
      <div className="min-h-screen flex flex-col">
        {!isCulturalAccess && !isSeccionRoute && !isLinkInBio && (
          <div
            className={`transition-all duration-300 relative z-20 ${showMegaMenu
              ? "-translate-y-full opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100"
              }`}
          >
            <div />
            <Header />
          </div>
        )}
        {/* MegaMenu con transición de entrada */}
        {location.pathname !== "/culturallaccess" &&
          location.pathname !== "/linkinbio" && (
            <div
              className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${showMegaMenu
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0 pointer-events-none"
                }`}
            >
              <div />
              <MegaMenu />
            </div>
          )}
        <main
          className={`flex-grow overflow-x-hidden w-full relative z-10 ${isLinkInBio ? "" : "px-10 sm:px-0"
            }`}
        >
          <Suspense
            fallback={
              <div className="max-w-[1080px] mx-auto py-8">Cargando...</div>
            }
          >
            <Routes>
              <Route
                path="/antiguo-main"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <ResidenteMain />
                  </div>
                }
              />

              <Route
                path="/infografia"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <InfografiaMain />
                  </div>
                }
              />

              <Route
                path="/notas/*"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <BannerRevista />
                  </div>
                }
              />

              <Route
                path="/notas/:id"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <BannerRevista />
                  </div>
                }
              />

              {/* Ver una nota en especifico */}
              <Route
                path="/notas/:id"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <DetallePost />
                  </div>
                }
              />

              <Route
                path="/seccion/:seccion/categoria/:categoria/*"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <MainSeccionesCategorias />
                  </div>
                }
              />

              <Route
                path="/seccion/:seccion/categoria/:categoria/nota/:id"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <MainSeccionesCategorias />
                  </div>
                }
              />

              {/* Estrellas de Nuevo León */}
              <Route
                path="/ednl"
                element={
                  <div className="max-w-[1080px] mx-auto py-10 sm:px-0">
                    <ListaRestaurantes />
                  </div>
                }
              />

              {/* HeyBanco - ahora manejado por la ruta general de clientes */}

              <Route
                path="/restaurante/:slug"
                element={
                  <div className="max-w-[680px] mx-auto py-10 sm:px-0">
                    <RestaurantePage />
                  </div>
                }
              />

              <Route
                path="/culturallaccess"
                element={
                  <div className="max-w-[1080px] mx-auto py-10">
                    <CulturalAcessForm />
                  </div>
                }
              />

              <Route
                path="/registrocolaboradores"
                element={
                  <div className="max-w-[1080px] mx-auto py-10">
                    <OpinionEditorial />
                  </div>
                }
              />

              {/* Mama de Rocco / Barrio Antiguo etc. - DEBE ir al final antes de * */}
              <Route
                path="/:nombreCliente"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <PaginaCliente />
                  </div>
                }
              />

              <Route path="*" element={<NoEncontrado />} />

              {/* Borrar todo despues */}
              <Route
                path="/video"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <VideoResidente />
                  </div>
                }
              />

              {/* Página instagram */}
              <Route path="/linkinbio" element={<LinkInBio />} />

              {/* Usuario */}
              <Route path="/colaboradores" element={<RespuestasSemana />} />

              {/* UANL */}
              <Route
                path="/uanl"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <UanlPage />
                  </div>
                }
              />
              <Route
                path="/uanl/:id"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <DetalleUanl />
                  </div>
                }
              />

              <Route
                path="/colaborador/:id"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <DetalleColaborador />
                  </div>
                }
              />

              {/* Editar perfil de colaborador */}
              <Route
                path="/editar-perfil-colaborador"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <EditarPerfilColaborador />
                  </div>
                }
              />

              <Route
                path="/stripe-checkout"
                element={
                  <div className="max-w-[1080px] mx-auto py-10">
                    <StripeCheckout />
                  </div>
                }
              />

              <Route
                path="/foto-news"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <NewsletterPage />
                  </div>
                }
              />

              <Route
                path="/plantilla"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <PlantillaNotas
                      posts={[...notasPrueba]}
                      notasDestacadas={[...notasPrueba]}
                      handleCardClick={() => { }}
                    />
                  </div>
                }
              />

              {/* <Route
                path="/b2b"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <B2BMain />
                  </div>
                }
              /> */}

              <Route
                path="/instahistory"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <InstaHistoryPage />
                  </div>
                }
              />

              <Route
                path="/instarecomendaciones"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <InstaRecomendacionesPage />
                  </div>
                }
              />

              <Route
                path="/registrob2b"
                element={<RegistroB2BConPlanes />}
              />

              <Route
                path="/registro"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <Registro />
                  </div>
                }
              />

              <Route
                path="/registroinvitados"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <RegistroInvitados />
                  </div>
                }
              />

              {/*================================*/}

              {/* Dashboard - Panel Principal */}
              <Route
                path="/dashboard"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <ListaNotas />
                  </div>
                }
              />

              {/* Dashboard - Nota Nueva */}
              <Route
                path="dashboard/nota/nueva"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <FormMainResidente />
                  </div>
                }
              />

              {/* Dashboard - Nota Editar */}
              <Route
                path="dashboard/nota/editar/:id"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <FormMainResidente />
                  </div>
                }
              />

              {/* Dashboard - Receta Nueva */}
              <Route
                path="dashboard/receta/nueva"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <FormularioReceta />
                  </div>
                }
              />

              {/* Dashboard - Receta Editar */}
              <Route
                path="dashboard/receta/editar/:id"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <FormularioReceta />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/preguntassemanales"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <PreguntasSemanales />
                  </div>
                }
              />

              {/* Admin */}
              <Route path="/formnewsletter" element={<FormNewsletter />} />

              {/* Admin */}
              <Route
                path="/videosDashboard"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <VideosDashboard />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/videosFormulario"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <Videos />
                  </div>
                }
              />

              {/* Admin */}
              <Route path="/" element={<Navigate to="/registro" replace />} />

              {/* Admin */}
              <Route
                path="/login"
                element={
                  <div className="max-w-[1080px] mx-auto py-10">
                    <Login />
                  </div>
                }
              />

              <Route
                path="/recuperar-password"
                element={
                  <div className="max-w-[1080px] mx-auto py-10">
                    <ForgotPassword />
                  </div>
                }
              />

              <Route
                path="/restablecer-password/:token"
                element={
                  <div className="max-w-[1080px] mx-auto py-10">
                    <ResetPassword />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/formulario"
                element={
                  <div className="max-w-[1080px] mx-auto py-10 sm:px-0">
                    <FormularioMain />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/formulario/:slug"
                element={
                  <div className="max-w-[1080px] mx-auto py-10 sm:px-0">
                    <FormularioMainPage />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/promo"
                element={
                  <div className="max-w-[1080px] mx-auto py-10">
                    <PromoMain />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/revistas/nueva"
                element={<FormularioRevistaBannerNueva />}
              />

              {/* Admin */}
              <Route path="/infografias" element={<InfografiaForm />} />

              <Route
                path="/admin/uanl"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <ListaNotasUanl />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/dashboardtickets"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <ListaTickets />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/dashboardb2b"
                element={
                  <B2BRoute>
                    <div className="max-w-[1080px] mx-auto">
                      <B2BDashboard />
                    </div>
                  </B2BRoute>
                }
              />

              {/* Ruta de éxito después de pago en tienda B2B */}
              <Route
                path="/success-tienda"
                element={<SuccessTienda />}
              />

              <Route
                path="/admin/codigos"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <GestionCodigos />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/terminos-y-condiciones"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <TerminosyCondiciones />
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>
        {/* Botón flotante para ir arriba */}
        <BotonScroll />
        {location.pathname !== "/culturallaccess" &&
          location.pathname !== "/linkinbio" && (
            <footer className={
              location.pathname === "/registrob2b" || location.pathname === "/registroinvitados" || location.pathname === "/registrocolaboradores"
                ? "hidden sm:block"
                : ""
            }>
              <FooterPrincipal />
            </footer>
          )}
      </div>
    </DataProvider>
  );
}

export default App;
