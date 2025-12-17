import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Suspense, lazy } from "react";

import Header from "./componentes/Header";
import MegaMenu from "./componentes/MegaMenu";
import { DataProvider } from "./componentes/DataContext";

import ListaRestaurantes from "./componentes/ednl/ListaRestaurantes";
import RestaurantePage from "./componentes/ednl/RestaurantePage";
import CulturalAcessForm from "./componentes/culturallAccess/CulturalAcessForm";
import ResidenteMain from "./componentes/residente/ResidenteMain";
import MainSeccionesCategorias from "./componentes/residente/componentes/seccionesCategorias/MainSeccionesCategorias";
import InfografiaMain from "./componentes/residente/infografia/InfografiaMain";
import FooterPrincipal from "./componentes/FooterPrincipal";
import PaginaCliente from "./componentes/residente/paginaCliente/PaginaCliente";
import NoEncontrado from "./componentes/NoEncontrado";
import DetallePost from "./componentes/residente/componentes/DetallePost";
import BannerRevista from "./componentes/residente/componentes/BannerRevista";
import { urlApi, imgApi } from "./componentes/api/url.js";
import OpinionEditorial from "./componentes/residente/componentes/formularioColaboradores/OpinionEditorial.jsx";
import RespuestasSemana from "./componentes/residente/componentes/formularioColaboradores/RespuestasSemana.jsx";
import VideoResidente from "./componentes/residente/componentes/extras/VideoResidente.jsx";
import LinkInBio from "./componentes/residente/instagram/LinkInBio.jsx";
import BotonScroll from "./componentes/residente/componentes/compFormularioMain/BotonScroll.jsx";
import Proximamente from "./componentes/Proximamente.jsx";
import ViewportAdjuster from "./ViewportAdjuster.jsx";
import InfografiaForm from "./componentes/residente/infografia/InfografiaForm.jsx";
import { useClientesValidos } from "./hooks/useClientesValidos";
import usePageTracking from "./usePageTracking.js";
import UanlPage from "./componentes/residente/Uanl/UanlPage.jsx";
import DetalleUanl from "./componentes/residente/Uanl/DetalleUanl.jsx";
import ListaNotasUanl from "./componentes/residente/componentes/compFormularioMain/ListaNotasUanl.jsx";
import DetalleColaborador from "./componentes/residente/Colaboradores/DetalleColaborador.jsx";
import NewsletterPage from "./componentes/residente/Newsletter/NewsletterPage.jsx";
import PlantillaNotas from "./componentes/residente/PlantillasRehusables/PlantillaNotas";
import ListaTickets from "./componentes/residente/componentes/compFormularioMain/ListaTickets";
import InstaHistoryPage from "./componentes/residente/InstaHistory/InstaHistoryPage.jsx";
import StripeCheckout from "./componentes/StripeCheckout.jsx";
import FormMain from "./componentes/residente/B2B/FormularioNuevoClienteB2b/FormMain.jsx";
import B2BRoute from "./componentes/rutas/B2BRoute.jsx";
import TerminosyCondiciones from "./componentes/residente/B2B/FormularioNuevoClienteB2b/TerminosyCondiciones.jsx";
import Registro from "./componentes/residente/Registro.jsx";
import FormularioAnuncioRevista from "./componentes/residente/B2B/FormularioAnuncioRevista.jsx";
import SuccessTienda from "./componentes/residente/B2B/SuccessTienda.jsx";
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
  import("./componentes/residente/B2B/FormularioNuevoClienteB2b/RegistroInvitados")
);
const GestionCodigos = lazy(() =>
  import("./componentes/residente/Admin/GestionCodigos")
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
          <Suspense fallback={<div>Cargando...</div>}>
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
                path="/registrob2b"
                element={
                  <div className="max-w-[650px] mx-auto">
                    <FormMain />
                  </div>
                }
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

              {/* Admin */}
              <Route
                path="notas/nueva"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <FormMainResidente />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="notas/editar/:id"
                element={
                  <div className="max-w-[1080px] mx-auto">
                    <FormMainResidente />
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/notas"
                element={
                  <div className="max-w-[1366px] mx-auto">
                    <ListaNotas />
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
              <Route
                path="/"
                element={<Navigate to="/registro" replace />}
              />

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
              <Route path="/terminos-y-condiciones" element={
                <div className="max-w-[1080px] mx-auto">
                  <TerminosyCondiciones />
                </div>
              } />

            </Routes>
          </Suspense>
        </main>
        {/* Botón flotante para ir arriba */}
        <BotonScroll />
        {location.pathname !== "/culturallaccess" &&
          location.pathname !== "/linkinbio" && (
            <footer>
              <FooterPrincipal />
            </footer>
          )}
      </div>
    </DataProvider>
  );
}

export default App;
