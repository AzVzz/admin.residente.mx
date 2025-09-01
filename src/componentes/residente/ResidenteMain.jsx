import { useEffect } from "react";
import BannerRevista from "./componentes/BannerRevista";
import SeccionesPrincipales from "./componentes/SeccionesPrincipales";

function customSmoothScrollTo(targetY, duration = 1200) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let start;

  function step(timestamp) {
    if (!start) start = timestamp;
    const time = timestamp - start;
    const percent = Math.min(time / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutQuad(percent));
    if (time < duration) {
      requestAnimationFrame(step);
    }
  }

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  requestAnimationFrame(step);
}

const scrollToHash = (intentos = 0) => {
  if (window.location.hash) {
    const id = window.location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      // Espera a que las imágenes estén cargadas
      if (!areImagesLoaded(el) && intentos < 30) {
        setTimeout(() => scrollToHash(intentos + 1), 150);
        return;
      }
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      // Segundo intento después de 1 segundo, por si el layout cambió
      if (intentos === 0) {
        setTimeout(() => scrollToHash(99), 1000);
      }
    } else if (intentos < 30) {
      setTimeout(() => scrollToHash(intentos + 1), 150);
    }
  }
};

function areImagesLoaded(element) {
  const imgs = element.querySelectorAll('img');
  for (let img of imgs) {
    if (!img.complete) return false;
  }
  return true;
}

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