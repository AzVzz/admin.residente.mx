import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ListaRestaurantes from './componentes/ednl/ListaRestaurantes';
import RestaurantePage from './componentes/ednl/RestaurantePage';
import Header from './componentes/Header';
import FormularioMain from './componentes/formulario100estrellas/FormularioMain';
import FormularioMainPage from './componentes/formulario100estrellas/FormularioMainPage';
import MegaMenu from './componentes/MegaMenu';
import PromoMain from './componentes/promociones/PromoMain';
import CulturalAcessForm from './componentes/culturallAccess/CulturalAcessForm';
import FondoCulturallAccess from './imagenes/Culturall access Logos/BACKGROUND-CulturallAccess.png'
import ResidenteMain from './componentes/residente/ResidenteMain';
import FormMainResidente from './componentes/residente/componentes/compFormularioMain/FormMainResidente';
import ListaNotas from './componentes/residente/componentes/compFormularioMain/ListaNotas';
import FooterPrincipal from './componentes/FooterPrincipal';

function App() {

  const location = useLocation();
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  useEffect(() => {
    if (location.pathname === '/culturallaccess') {
      document.body.style.backgroundImage = `url(${FondoCulturallAccess})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundColor = '';
    } else {
      document.body.style.backgroundColor = '#FFF200'; // Amarillo
    }

    // Limpiar al desmontar el componente
    return () => {
      document.body.style.backgroundColor = '#FFF200';
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowMegaMenu(true);
      } else {
        setShowMegaMenu(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {!showMegaMenu && <Header />}
      {showMegaMenu && (
        <div className="sticky top-0 z-50 w-full">
          <MegaMenu />
        </div>
      )}
      <main className="flex-grow overflow-x-hidden px-0 w-full relative z-10">
        <Routes>
          <Route path="/residente" element={
            <div className="max-w-[1080px] mx-auto">
              <ResidenteMain />
            </div>
          } />
          <Route path="notas/nueva" element={
            <div className="max-w-[1080px] mx-auto">
              {/*<FormNotaMain/>*/}
              <FormMainResidente />
            </div>
          } />
          <Route path="notas/editar/:id" element={
            <div className="max-w-[1080px] mx-auto">
              <FormMainResidente />
            </div>
          } />
          <Route path="/notas" element={
            <div className="max-w-[1080px] mx-auto">
              <ListaNotas />
            </div>
          } />
          <Route path="/" element={
            <div className="max-w-[1080px] mx-auto py-10 px-10 sm:px-0">
              <ListaRestaurantes />
            </div>
          } />
          <Route path="/restaurante/:slug" element={
            <div className="max-w-[1080px] mx-auto py-10 px-10 sm:px-0">
              <RestaurantePage />
            </div>
          } />
          <Route path="/formulario" element={
            <div className="max-w-[1080px] mx-auto py-10 px-10 sm:px-0">
              <FormularioMain />
            </div>
          } />
          <Route path="/formulario/:slug" element={
            <div className="max-w-[1080px] mx-auto py-10 px-10 sm:px-0">
              <FormularioMainPage />
            </div>
          } />
          <Route path="/promo" element={
            <div className="max-w-[1080px] mx-auto py-10">
              <PromoMain />
            </div>
          } />
          <Route path="/culturallaccess" element={
            <div className="max-w-[1080px] mx-auto py-10">
              <CulturalAcessForm />
            </div>
          } />
        </Routes>
      </main>
      <footer>
        <FooterPrincipal/>
        {/* FooterPrincipal.jsx */}
      </footer>
    </div>
  )
}

export default App;