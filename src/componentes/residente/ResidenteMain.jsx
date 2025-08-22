import { useEffect } from "react";
import BannerRevista from "./componentes/BannerRevista";
import SeccionesPrincipales from "./componentes/SeccionesPrincipales";

const scrollToHash = (intentos = 0) => {
  if (window.location.hash) {
    const id = window.location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80; // Ajusta según tu header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    } else if (intentos < 10) {
      // Intenta de nuevo después de 100ms (hasta 1 segundo)
      setTimeout(() => scrollToHash(intentos + 1), 100);
    }
  }
};

const ResidenteMain = () => {
  useEffect(() => {
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <div>
      {/*<SeccionesPrincipales />  Directorio */}
      <BannerRevista />

      <div className="flex flex-col gap-5"></div>
    </div>
  );
};

export default ResidenteMain;