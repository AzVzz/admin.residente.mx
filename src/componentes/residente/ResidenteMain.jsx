import { useEffect } from "react";
import BannerRevista from "./componentes/BannerRevista";
import SeccionesPrincipales from "./componentes/SeccionesPrincipales";

const ResidenteMain = () => {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          const yOffset = -80; // Ajusta este valor según la altura de tu header
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }, 200); // Un poco más de delay para asegurar el render
      }
    }
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