import { useEffect, useState } from 'react';
import { catalogoSeccionesGet } from '../../../componentes/api/CatalogoSeccionesGet.js';
import { urlApi } from '../../../componentes/api/url.js';

const SeccionesPrincipales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    catalogoSeccionesGet()
      .then((result) => {
        setData(result || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error al cargar secciones');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando opciones...</p>;
  if (error) return <p>Error: {error}</p>;

  // ====== Config editable: ancho por columna (md y arriba) y layout interno ======
  // Cambia colWidth a tu gusto (usa fr, px, %, minmax, etc.)
  const seccionesConfig = {
    "Nivel de gasto": {
      colWidth: "0.5fr",                         // <- ancho de esta columna
      listTemplate: "1fr",                       // <- layout interno de la lista
      gap: "gap-x-0 gap-y-1",
    },
    "Tipo de comida": {
      colWidth: "0.8fr",
      listTemplate: "0.8fr 1fr",
      gap: "gap-x-0 gap-y-1",
    },
    "Zona": {
      colWidth: "1.4fr",
      listTemplate: "1.2fr 1fr",
      gap: "gap-x-0 gap-y-1",
    },
    "Experiencia": {
      colWidth: "1.3fr",
      listTemplate: "0.8fr 0.7fr 1fr",           // p.ej. central más angosta
      gap: "gap-x-0 gap-y-1",
    },
    // Default para cualquier sección no listada arriba
    "default": {
      colWidth: "1fr",
      listTemplate: "1fr",
      gap: "gap-y-1",
    }
  };

  // Construye el template de columnas dinámico en el orden de `data`
  // (solo se aplica en md+ con la clase md:[grid-template-columns:var(--cols)])
  const colsTemplate = data
    .map(s => (seccionesConfig[s.seccion]?.colWidth) || seccionesConfig.default.colWidth)
    .join(' ');

  return (
    <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black py-8">
      <div className="grid grid-cols-6 max-w-[1080px] mb-5 w-full mx-auto py-0 gap-8">
        <img
          src={`${urlApi}fotos/fotos-estaticas/residente-logos/blancos/guia-logo-blanco.webp`}
          className="col-span-1 w-auto h-15 object-contain"
          alt="Guía logo"
        />

        <p className="flex col-span-3 text-xl leading-5.5 text-white justify-center items-center">
          Tu concierge gastronómico que te ayudará con recomendaciones de acuerdo a tus gustos.
        </p>

        <div className="col-span-2 flex items-center justify-center">
          <input
            type="text"
            placeholder="Buscar..."
            className="h-10 w-full max-w-md px-4 py-2 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
        </div>
      </div>
      <div
        className="grid grid-cols-1 md:[grid-template-columns:var(--cols)] max-w-[1080px] mx-auto py-0 gap-10"
        style={{ '--cols': colsTemplate }}
      >
        {data.map((seccion, i) => {
          const cfg = seccionesConfig[seccion.seccion] || seccionesConfig.default;
          const listTemplate = cfg.listTemplate || '1fr';
          const gapClasses = cfg.gap || 'gap-y-1';

          return (
            <div key={`${seccion.seccion}-${i}`}>
              <h3 className="font-bold mb-2 text-md border-b-1 border-white border-dotted text-white">
                {seccion.seccion}
              </h3>

              {/* Grid interno de cada sección controlado por listTemplate */}
              <ul
                className={`text-base text-gray-300 font-roman leading-tight grid ${gapClasses}`}
                style={{ gridTemplateColumns: listTemplate }}
              >
                {(seccion.categorias || []).map((categoria, index) => (
                  <li key={index}>
                    <span className="cursor-pointer hover:underline hover:text-white text-xs md:text-sm">
                      {categoria?.nombre ?? '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeccionesPrincipales;
